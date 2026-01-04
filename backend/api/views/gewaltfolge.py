"""ViewSet für Gewaltfolge-Management."""

from rest_framework import viewsets, permissions

from api.models import Gewaltfolge
from api.serializers import GewaltfolgeSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class GewaltfolgeViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Gewaltfolgen.
    
    Berechtigungen:
    - GET -> api.view_gewaltfolge
    - POST -> api.add_gewaltfolge
    - PUT/PATCH -> api.change_gewaltfolge
    - DELETE -> api.delete_gewaltfolge
    """
    queryset = Gewaltfolge.objects.all()
    serializer_class = GewaltfolgeSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]
