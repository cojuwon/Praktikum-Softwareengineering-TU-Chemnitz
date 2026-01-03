"""ViewSet für Statistik-Management."""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import Statistik
from api.serializers import StatistikSerializer
from api.permissions import DjangoModelPermissionsWithView, IsOwnerOrAdmin, IsErweiterungOrAdmin


class StatistikViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Statistiken.
    
    Berechtigungen:
    - GET -> api.view_statistik
    - POST -> api.add_statistik
    - PUT/PATCH -> api.change_statistik (nur eigene oder als Admin)
    - DELETE -> api.delete_statistik (nur eigene oder als Admin)
    """
    queryset = Statistik.objects.all()
    serializer_class = StatistikSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, IsOwnerOrAdmin]

    def get_queryset(self):
        """User sehen ihre eigenen Statistiken, Admins sehen alle."""
        user = self.request.user
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Statistik.objects.all()
        return Statistik.objects.filter(creator=user)

    def perform_create(self, serializer):
        """Setzt automatisch den aktuellen User als Creator."""
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """
        Exportiert eine Statistik.
        Erfordert can_export_statistik Permission.
        
        GET /api/statistiken/{id}/export/
        """
        if not request.user.has_perm('api.can_export_statistik'):
            return Response(
                {'detail': 'Sie haben keine Berechtigung, Statistiken zu exportieren.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        statistik = self.get_object()
        # Hier würde die Export-Logik implementiert werden
        return Response({
            'status': 'Export gestartet.',
            'statistik_id': statistik.statistik_id,
            'titel': statistik.statistik_titel
        })

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Teilt eine Statistik (z.B. per E-Mail).
        Erfordert can_share_statistik Permission.
        
        POST /api/statistiken/{id}/share/
        Body: {"email": "empfaenger@example.com"}
        """
        if not request.user.has_perm('api.can_share_statistik'):
            return Response(
                {'detail': 'Sie haben keine Berechtigung, Statistiken zu teilen.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        statistik = self.get_object()
        email = request.data.get('email')
        
        # Hier würde die Teilen-Logik implementiert werden
        return Response({
            'status': f'Statistik wurde an {email} gesendet.',
            'statistik_id': statistik.statistik_id
        })
