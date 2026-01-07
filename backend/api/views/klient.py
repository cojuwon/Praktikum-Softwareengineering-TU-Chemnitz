"""
ViewSet für Klient:innen-Management.

Verwendet DjangoModelPermissions für automatische Permission-Prüfung.
"""

from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema

from api.models import KlientIn, Begleitung
from api.serializers import KlientInSerializer, BegleitungSerializer
from api.permissions import DjangoModelPermissionsWithView


from django_filters.rest_framework import DjangoFilterBackend

class KlientInViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Klient:innen.
    
    Berechtigungen:
    - GET -> api.view_klientin
    - POST -> api.add_klientin
    - PUT/PATCH -> api.change_klientin
    - DELETE -> api.delete_klientin
    """
    queryset = KlientIn.objects.all()
    serializer_class = KlientInSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        'klient_rolle': ['exact'],
        'klient_geschlechtsidentitaet': ['exact'],
        'klient_alter': ['exact', 'gte', 'lte'],
        'klient_beruf': ['icontains'],
        'klient_staatsangehoerigkeit': ['icontains'],
        'klient_wohnort': ['exact'],
        'klient_schwerbehinderung': ['exact'],
    }
    search_fields = ['klient_code', 'klient_vorname', 'klient_nachname', 'klient_id'] # Optional text search
    ordering_fields = ['klient_id', 'erstellt_am', 'klient_nachname']
    ordering = ['-klient_id'] # Default: Newest first

    def get_queryset(self):
        """
        TEMPORARY: Returns ALL clients for everyone to unblock UI issues.
        """
        return KlientIn.objects.all()

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'begleitung_id': {'type': 'integer'}}}},
        responses={200: BegleitungSerializer},
        description="Weist eine existierende Begleitung diesem Klienten zu (Besitzerwechsel)."
    )
    @action(detail=True, methods=['post'], url_path='assign-begleitung')
    def assign_begleitung(self, request, pk=None):
        """
        Weist eine existierende Begleitung diesem Klienten zu.
        Falls die Begleitung einem Fall zugeordnet war, wird diese Zuordnung gelöscht,
        um Inkonsistenzen zu vermeiden.
        """
        ziel_klient = self.get_object()
        begleitung_id = request.data.get('begleitung_id')

        if not begleitung_id:
            raise ValidationError({'begleitung_id': 'Dieses Feld ist erforderlich.'})

        try:
            begleitung = Begleitung.objects.get(pk=begleitung_id)
        except Begleitung.DoesNotExist:
            raise ValidationError({'begleitung_id': 'Begleitung nicht gefunden.'})

        # Berechtigungsprüfung für Begleitung (change_begleitung)
        if not request.user.has_perm('api.change_begleitung'):
             return Response(
                {'detail': 'Sie haben keine Berechtigung, Begleitungen zu ändern.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Logik: Besitzerwechsel
        old_klient = begleitung.klient
        if old_klient != ziel_klient:
            begleitung.klient = ziel_klient
            
            # Side-Effect: Fall-Zuordnung prüfen und ggf. löschen
            if begleitung.fall:
                # Wenn der Fall nicht zum neuen Klienten gehört (was er nicht kann, wenn er zum alten gehörte),
                # muss die Verbindung gelöst werden.
                if begleitung.fall.klient != ziel_klient:
                    begleitung.fall = None
            
            begleitung.save()

        serializer = BegleitungSerializer(begleitung)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        """
        Fügt eine Notiz zum Klienten hinzu.
        UML: klientNotizAnlegen()
        """
        from django.utils import timezone
        
        klient = self.get_object()
        new_note = request.data.get('text')
        
        if not new_note:
            return Response(
                {'detail': 'Text ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
        
        if klient.klient_notizen:
            klient.klient_notizen += f"\n\n[{timestamp}] {new_note}"
        else:
            klient.klient_notizen = f"[{timestamp}] {new_note}"
            
        klient.save()
        return Response(KlientInSerializer(klient).data)

    @action(detail=True, methods=['post', 'patch'], url_path='update-note')
    def update_note(self, request, pk=None):
        """
        Überschreibt die Notizen des Klienten.
        UML: klientNotizBearbeiten()
        """
        klient = self.get_object()
        new_note = request.data.get('klient_notizen')
        
        if new_note is None:
            return Response(
                {'detail': 'klient_notizen ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        klient.klient_notizen = new_note
        klient.save()
        return Response(KlientInSerializer(klient).data)

    @action(detail=True, methods=['post', 'delete'], url_path='delete-note')
    def delete_note(self, request, pk=None):
        """
        Löscht die Notizen des Klienten.
        UML: klientNotizLoeschen()
        """
        klient = self.get_object()
        klient.klient_notizen = ""
        klient.save()
        return Response(KlientInSerializer(klient).data)

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'fall_id': {'type': 'integer'}}}},
        description="Weist einen existierenden Fall diesem Klienten zu."
    )
    @action(detail=True, methods=['post'], url_path='assign-fall')
    def assign_fall(self, request, pk=None):
        """
        Weist einen existierenden Fall diesem Klienten zu.
        """
        from api.models import Fall
        from api.serializers import FallSerializer

        klient = self.get_object()
        fall_id = request.data.get('fall_id')

        if not fall_id:
            raise ValidationError({'fall_id': 'Dieses Feld ist erforderlich.'})

        try:
            fall = Fall.objects.get(pk=fall_id)
        except Fall.DoesNotExist:
            raise ValidationError({'fall_id': 'Fall nicht gefunden.'})

        # Berechtigungsprüfung für Fall (change_fall)
        if not request.user.has_perm('api.change_fall'):
             return Response(
                {'detail': 'Sie haben keine Berechtigung, Fälle zu ändern.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Check ownership if not admin/can_view_all_data
        user = request.user
        if user.rolle_mb != 'AD' and not user.has_perm('api.can_view_all_data'):
             if fall.mitarbeiterin != user:
                 return Response(
                    {'detail': 'Sie haben keine Berechtigung, diesen Fall zu bearbeiten.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        fall.klient = klient
        fall.save()

        serializer = FallSerializer(fall)
        return Response(serializer.data, status=status.HTTP_200_OK)
