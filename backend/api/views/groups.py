from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import Group, Permission
from api.serializers import GroupSerializer, PermissionSerializer
from api.permissions import IsAdminRole, DjangoModelPermissionsWithView

class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Groups and their Permissions.
    Only accessible by Admins.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.name == 'Admin':
            return Response(
                {"detail": "Die Admin-Gruppe kann nicht bearbeitet werden."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.name == 'Admin':
            return Response(
                {"detail": "Die Admin-Gruppe kann nicht bearbeitet werden."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.name == 'Admin':
            return Response(
                {"detail": "Die Admin-Gruppe kann nicht gelöscht werden."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet to list available Permissions.
    Only accessible by Admins.
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'codename', 'content_type__app_label']
