"""ViewSet für Begleitung-Management."""

from rest_framework import viewsets, permissions

from api.models import Begleitung
from api.serializers import BegleitungSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class BegleitungViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Begleitungen.
    
    Berechtigungen:
    - GET -> api.view_begleitung
    - POST -> api.add_begleitung
    - PUT/PATCH -> api.change_begleitung
    - DELETE -> api.delete_begleitung
    """
    queryset = Begleitung.objects.all()
    serializer_class = BegleitungSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """Filtert Begleitungen basierend auf User-Berechtigungen."""
        user = self.request.user
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Begleitung.objects.all()
        return Begleitung.objects.filter(fall__mitarbeiterin=user)
