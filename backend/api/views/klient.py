"""
ViewSet für Klient:innen-Management.

Verwendet DjangoModelPermissions für automatische Permission-Prüfung.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema

from api.models import KlientIn, Begleitung
from api.serializers import KlientInSerializer, BegleitungSerializer
from api.permissions import DjangoModelPermissionsWithView


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
