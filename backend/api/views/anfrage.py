"""ViewSet für Anfrage-Management."""

from rest_framework import viewsets, permissions

from api.models import Anfrage
from api.serializers import AnfrageSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class AnfrageViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Anfragen.
    
    Berechtigungen:
    - GET -> api.view_anfrage
    - POST -> api.add_anfrage
    - PUT/PATCH -> api.change_anfrage
    - DELETE -> api.delete_anfrage
    """
    queryset = Anfrage.objects.all()
    serializer_class = AnfrageSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """Filtert Anfragen basierend auf User-Berechtigungen."""
        user = self.request.user
        base_qs = Anfrage.objects.select_related('beratungstermin')
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return base_qs
        return base_qs.filter(mitarbeiterin=user)

    def perform_create(self, serializer):
        """Setzt automatisch den aktuellen User als Mitarbeiter:in."""
        serializer.save(mitarbeiterin=self.request.user)
