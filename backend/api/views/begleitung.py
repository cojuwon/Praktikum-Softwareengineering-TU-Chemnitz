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
