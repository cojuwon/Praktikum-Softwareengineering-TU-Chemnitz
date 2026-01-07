"""
ViewSet für Fall-Management.

Verwendet DjangoModelPermissions für automatische Permission-Prüfung:
- GET (list/retrieve) -> api.view_fall
- POST (create) -> api.add_fall
- PUT/PATCH (update) -> api.change_fall
- DELETE (destroy) -> api.delete_fall
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiTypes

from api.models import Fall, Begleitung, Beratungstermin, Gewalttat, KlientIn
from api.serializers import FallSerializer, BegleitungSerializer, BeratungsterminSerializer, GewalttatSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


@extend_schema_view(
    create=extend_schema(
        description="Legt einen neuen Fall an. Wenn 'mitarbeiterin' nicht gesetzt ist, wird der aktuelle User zugewiesen.",
        summary="Fall anlegen"
    ),
    update=extend_schema(
        description="Bearbeitet einen bestehenden Fall vollständig.",
        summary="Fall bearbeiten"
    ),
    partial_update=extend_schema(
        description="Bearbeitet Teile eines bestehenden Falls.",
        summary="Fall teilweise bearbeiten"
    ),
    destroy=extend_schema(
        description="Löscht einen Fall. ACHTUNG: Durch Kaskadierung werden alle zugehörigen Beratungstermine, Gewalttaten und Begleitungen ebenfalls gelöscht!",
        summary="Fall löschen"
    )
)
class FallViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Fälle.
    
    Berechtigungen werden automatisch über DjangoModelPermissions geprüft.
    Zusätzlich wird bei Objekt-Operationen geprüft, ob der User Zugriff auf den Fall hat.
    """
    queryset = Fall.objects.all()
    serializer_class = FallSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """
        Filtert Fälle basierend auf User-Berechtigungen.
        - Admin/Erweiterung (view_all_fall) + ?view=all -> Alle
        - Sonst -> Nur zugewiesene Fälle
        """
        user = self.request.user
        queryset = Fall.objects.all()
        
        # Check permission to view all
        can_view_all = user.rolle_mb == 'AD' or user.has_perm('api.view_all_fall') or user.has_perm('api.can_view_all_data')
        
        # Explicit request for all data
        if can_view_all and self.request.query_params.get('view') == 'all':
            return queryset
            
        # Default / Fallback: Filter by own cases
        if user.has_perm('api.view_own_fall') or can_view_all:
             return queryset.filter(mitarbeiterin=user)
        
        # No permission
        return queryset.none()

    def perform_create(self, serializer):
        """
        Erstellt einen neuen Fall.
        Wenn keine Mitarbeiterin angegeben ist, wird der aktuelle User gesetzt.
        """
        mitarbeiterin = serializer.validated_data.get('mitarbeiterin')
        if not mitarbeiterin:
            serializer.save(mitarbeiterin=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """
        Weist einen Fall einem anderen Mitarbeiter zu.
        Erfordert can_manage_users Permission.
        """
        if not request.user.has_perm('api.can_manage_users'):
            return Response(
                {'detail': 'Sie haben keine Berechtigung, Fälle zuzuweisen.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        fall = self.get_object()
        mitarbeiter_id = request.data.get('mitarbeiterin_id')
        
        if not mitarbeiter_id:
            return Response(
                {'detail': 'mitarbeiterin_id ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from api.models import Konto
        try:
            mitarbeiter = Konto.objects.get(pk=mitarbeiter_id)
            fall.mitarbeiterin = mitarbeiter
            fall.save()
            return Response({'status': 'Fall wurde zugewiesen.'})
        except Konto.DoesNotExist:
            return Response(
                {'detail': 'Mitarbeiter:in nicht gefunden.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'begleitung_id': {'type': 'integer'}}}},
        responses={200: BegleitungSerializer},
        description="Weist eine existierende Begleitung diesem Fall zu."
    )
    @action(detail=True, methods=['post'], url_path='assign-begleitung')
    def assign_begleitung(self, request, pk=None):
        """
        Weist eine existierende Begleitung diesem Fall zu.
        Prüft, ob Begleitung und Fall zum selben Klienten gehören.
        """
        fall = self.get_object()
        begleitung_id = request.data.get('begleitung_id')

        if not begleitung_id:
            raise ValidationError({'begleitung_id': 'Dieses Feld ist erforderlich.'})

        try:
            begleitung = Begleitung.objects.get(pk=begleitung_id)
        except Begleitung.DoesNotExist:
            raise ValidationError({'begleitung_id': 'Begleitung nicht gefunden.'})

        # Integritätsprüfung: Gleicher Klient?
        if begleitung.klient != fall.klient:
            raise ValidationError(
                {'detail': 'Die Begleitung gehört zu einem anderen Klienten als der Fall.'}
            )

        # Zuweisung durchführen
        begleitung.fall = fall
        begleitung.save()

        serializer = BegleitungSerializer(begleitung)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'beratungs_id': {'type': 'integer'}}}},
        responses={200: BeratungsterminSerializer},
        description="Weist einen existierenden Beratungstermin diesem Fall zu."
    )
    @action(detail=True, methods=['post'], url_path='assign-beratung')
    def assign_beratung(self, request, pk=None):
        """
        Weist einen existierenden Beratungstermin diesem Fall zu.
        Prüft, ob Termin und Fall zum selben Klienten gehören (implizit über Fall-Zuordnung oder Logik).
        Da Beratungstermine oft direkt am Fall hängen, ist dies eher ein 'Move' oder 'Reassign'.
        Hier prüfen wir, ob der Termin überhaupt zum Kontext passt (z.B. gleicher Klient, falls Termin Klienten-FK hätte,
        aber Termin hängt am Fall. Wir nehmen an, der Termin existiert und soll HIERHER verschoben werden).
        ACHTUNG: Beratungstermin hat keinen direkten Klienten-FK, sondern hängt am Fall.
        Wenn er noch keinen Fall hat oder verschoben wird, müssen wir sicherstellen, dass das logisch passt.
        Da wir vom Fall ausgehen, setzen wir einfach die Relation.
        """
        fall = self.get_object()
        beratungs_id = request.data.get('beratungs_id')

        if not beratungs_id:
            raise ValidationError({'beratungs_id': 'Dieses Feld ist erforderlich.'})

        try:
            termin = Beratungstermin.objects.get(pk=beratungs_id)
        except Beratungstermin.DoesNotExist:
            raise ValidationError({'beratungs_id': 'Beratungstermin nicht gefunden.'})

        # Sicherheitscheck: Wenn der Termin schon einem Fall zugeordnet ist, prüfen wir, ob dieser Fall
        # zum selben Klienten gehört.
        if termin.fall and termin.fall.klient != fall.klient:
             raise ValidationError(
                {'detail': 'Der Beratungstermin gehört zu einem Fall eines anderen Klienten.'}
            )

        termin.fall = fall
        termin.save()

        serializer = BeratungsterminSerializer(termin)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'tat_id': {'type': 'integer'}}}},
        responses={200: GewalttatSerializer},
        description="Weist eine existierende Gewalttat diesem Fall zu."
    )
    @action(detail=True, methods=['post'], url_path='assign-tat')
    def assign_tat(self, request, pk=None):
        """
        Weist eine existierende Gewalttat diesem Fall zu.
        Prüft, ob Tat und Fall zum selben Klienten gehören.
        """
        fall = self.get_object()
        tat_id = request.data.get('tat_id')

        if not tat_id:
            raise ValidationError({'tat_id': 'Dieses Feld ist erforderlich.'})

        try:
            tat = Gewalttat.objects.get(pk=tat_id)
        except Gewalttat.DoesNotExist:
            raise ValidationError({'tat_id': 'Gewalttat nicht gefunden.'})

        # Integritätsprüfung: Gleicher Klient?
        if tat.klient != fall.klient:
            raise ValidationError(
                {'detail': 'Die Gewalttat gehört zu einem anderen Klienten als der Fall.'}
            )

        tat.fall = fall
        tat.save()

        serializer = GewalttatSerializer(tat)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'klient_id': {'type': 'integer'}}}},
        responses={200: FallSerializer},
        description="Weist den Fall einem anderen Klienten zu."
    )
    @action(detail=True, methods=['post'], url_path='assign-klient')
    def assign_klient(self, request, pk=None):
        """
        Weist den Fall einem anderen Klienten zu.
        """
        fall = self.get_object()
        klient_id = request.data.get('klient_id')

        if not klient_id:
            raise ValidationError({'klient_id': 'Dieses Feld ist erforderlich.'})

        try:
            klient = KlientIn.objects.get(pk=klient_id)
        except KlientIn.DoesNotExist:
            raise ValidationError({'klient_id': 'Klient nicht gefunden.'})

        fall.klient = klient
        fall.save()

        serializer = self.get_serializer(fall)
        return Response(serializer.data, status=status.HTTP_200_OK)
