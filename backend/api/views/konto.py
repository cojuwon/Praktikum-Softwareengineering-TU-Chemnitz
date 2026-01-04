"""
ViewSet für Konto/User-Management.

Enthält spezielle Berechtigungsprüfungen für User-Verwaltung.
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import Group

from api.models import Konto
from api.serializers import KontoSerializer, KontoMeSerializer
from api.permissions import DjangoModelPermissionsWithView, IsAdminRole


class KontoViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Benutzerkonten.
    
    Berechtigungen:
    - Nur Admins können User verwalten (can_manage_users)
    - User können ihre eigenen Daten lesen
    """
    queryset = Konto.objects.all()
    serializer_class = KontoSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView]

    def get_queryset(self):
        """
        Admins sehen alle User, andere nur sich selbst.
        """
        user = self.request.user
        if user.rolle_mb == 'AD' or user.has_perm('api.can_manage_users'):
            return Konto.objects.all()
        return Konto.objects.filter(pk=user.pk)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Gibt die Daten des eingeloggten Users zurück inkl. Berechtigungen.
        Endpoint: /api/konten/me/
        """
        serializer = KontoMeSerializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def assign_role(self, request, pk=None):
        """
        Weist einem User eine Rolle zu.
        Erfordert Admin-Rechte.
        
        POST /api/konten/{id}/assign_role/
        Body: {"rolle": "B|E|AD"}
        """
        user = self.get_object()
        neue_rolle = request.data.get('rolle')
        
        if neue_rolle not in ['B', 'E', 'AD']:
            return Response(
                {'detail': 'Ungültige Rolle. Erlaubt: B, E, AD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.rolle_mb = neue_rolle
        user.save()
        
        return Response({
            'status': 'Rolle wurde aktualisiert.',
            'user': KontoSerializer(user).data
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def assign_group(self, request, pk=None):
        """
        Fügt einen User zu einer Django-Gruppe hinzu.
        Erfordert Admin-Rechte.
        
        POST /api/konten/{id}/assign_group/
        Body: {"group_name": "Gruppenname"}
        """
        user = self.get_object()
        group_name = request.data.get('group_name')
        
        # Validate that group_name is present and non-empty
        if not group_name or not isinstance(group_name, str) or not group_name.strip():
            return Response(
                {'detail': 'Das Feld "group_name" ist erforderlich und darf nicht leer sein.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            group = Group.objects.get(name=group_name)
            user.groups.add(group)
            return Response({
                'status': f'User wurde zur Gruppe "{group_name}" hinzugefügt.',
                'groups': list(user.groups.values_list('name', flat=True))
            })
        except Group.DoesNotExist:
            return Response(
                {'detail': f'Gruppe "{group_name}" nicht gefunden.'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def remove_group(self, request, pk=None):
        """
        Entfernt einen User aus einer Django-Gruppe.
        Erfordert Admin-Rechte.
        
        POST /api/konten/{id}/remove_group/
        Body: {"group_name": "Gruppenname"}
        """
        user = self.get_object()
        group_name = request.data.get('group_name')
        
        # Validate that group_name is present and non-empty
        if not group_name or not isinstance(group_name, str) or not group_name.strip():
            return Response(
                {'detail': 'Das Feld "group_name" ist erforderlich und darf nicht leer sein.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            group = Group.objects.get(name=group_name)
            user.groups.remove(group)
            return Response({
                'status': f'User wurde aus Gruppe "{group_name}" entfernt.',
                'groups': list(user.groups.values_list('name', flat=True))
            })
        except Group.DoesNotExist:
            return Response(
                {'detail': f'Gruppe "{group_name}" nicht gefunden.'},
                status=status.HTTP_404_NOT_FOUND
            )
