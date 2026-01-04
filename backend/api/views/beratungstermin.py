"""ViewSet für Beratungstermin-Management."""

from rest_framework import viewsets, permissions

from api.models import Beratungstermin
from api.serializers import BeratungsterminSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class BeratungsterminViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Beratungstermine.
    
    Berechtigungen:
    - GET -> api.view_beratungstermin
    - POST -> api.add_beratungstermin
    - PUT/PATCH -> api.change_beratungstermin
    - DELETE -> api.delete_beratungstermin
    """
    queryset = Beratungstermin.objects.all()
    serializer_class = BeratungsterminSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """Filtert Beratungstermine basierend auf User-Berechtigungen."""
        user = self.request.user
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Beratungstermin.objects.all()
        return Beratungstermin.objects.filter(berater=user)

    def perform_create(self, serializer):
        """Setzt automatisch den aktuellen User als Berater:in."""
        serializer.save(berater=self.request.user)
