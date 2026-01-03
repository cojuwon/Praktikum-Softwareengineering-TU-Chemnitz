"""
ViewSet für Fall-Management.

Verwendet DjangoModelPermissions für automatische Permission-Prüfung:
- GET (list/retrieve) -> api.view_fall
- POST (create) -> api.add_fall
- PUT/PATCH (update) -> api.change_fall
- DELETE (destroy) -> api.delete_fall
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import Fall
from api.serializers import FallSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class FallViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Fälle.
    
    Berechtigungen werden automatisch über DjangoModelPermissions geprüft.
    Zusätzlich wird bei Objekt-Operationen geprüft, ob der User Zugriff auf den Fall hat.
    """
    queryset = Fall.objects.all()
    serializer_class = FallSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """
        Filtert Fälle basierend auf User-Berechtigungen.
        Admins und User mit can_view_all_data sehen alle Fälle.
        Andere User sehen nur ihre eigenen Fälle.
        """
        user = self.request.user
        
        # Admins und User mit spezieller Berechtigung sehen alles
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Fall.objects.all()
        
        # Andere User sehen nur ihre zugewiesenen Fälle
        return Fall.objects.filter(mitarbeiterin=user)

    def perform_create(self, serializer):
        """
        Setzt automatisch den aktuellen User als Mitarbeiter:in beim Erstellen.
        """
        serializer.save(mitarbeiterin=self.request.user)

    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """
        Weist einen Fall einem anderen Mitarbeiter zu.
        Erfordert can_manage_users Permission.
        """
        if not request.user.has_perm('api.can_manage_users'):
            return Response(
                {'detail': 'Sie haben keine Berechtigung, Fälle zuzuweisen.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        fall = self.get_object()
        mitarbeiter_id = request.data.get('mitarbeiterin_id')
        
        if not mitarbeiter_id:
            return Response(
                {'detail': 'mitarbeiterin_id ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from api.models import Konto
        try:
            mitarbeiter = Konto.objects.get(pk=mitarbeiter_id)
            fall.mitarbeiterin = mitarbeiter
            fall.save()
            return Response({'status': 'Fall wurde zugewiesen.'})
        except Konto.DoesNotExist:
            return Response(
                {'detail': 'Mitarbeiter:in nicht gefunden.'},
                status=status.HTTP_404_NOT_FOUND
            )
