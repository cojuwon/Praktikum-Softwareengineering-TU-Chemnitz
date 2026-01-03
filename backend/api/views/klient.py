"""
ViewSet für Klient:innen-Management.

Verwendet DjangoModelPermissions für automatische Permission-Prüfung.
"""

from rest_framework import viewsets, permissions

from api.models import KlientIn
from api.serializers import KlientInSerializer
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
