"""ViewSet für Gewalttat-Management."""

from rest_framework import viewsets, permissions

from api.models import Gewalttat
from api.serializers import GewalttatSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class GewalttatViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Gewalttaten.
    
    Berechtigungen:
    - GET -> api.view_gewalttat
    - POST -> api.add_gewalttat
    - PUT/PATCH -> api.change_gewalttat
    - DELETE -> api.delete_gewalttat
    """
    queryset = Gewalttat.objects.all()
    serializer_class = GewalttatSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]
