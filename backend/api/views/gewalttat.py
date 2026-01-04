"""ViewSet für Gewalttat-Management."""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

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

    def get_queryset(self):
        """Filtert Gewalttaten basierend auf User-Berechtigungen."""
        user = self.request.user
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Gewalttat.objects.all()
        return Gewalttat.objects.filter(klient__fall__mitarbeiterin=user)

    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        """
        Fügt eine Notiz zur Gewalttat hinzu.
        UML: tatNotizenAnlegen()
        """
        from django.utils import timezone
        
        gewalttat = self.get_object()
        new_note = request.data.get('text')
        
        if not new_note:
            return Response(
                {'detail': 'Text ist erforderlich.'},
                status=400
            )
            
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
        if gewalttat.tat_notizen:
            gewalttat.tat_notizen += f"\n\n[{timestamp}] {new_note}"
        else:
            gewalttat.tat_notizen = f"[{timestamp}] {new_note}"
            
        gewalttat.save()
        return Response(GewalttatSerializer(gewalttat).data)

    @action(detail=True, methods=['post', 'patch'], url_path='update-note')
    def update_note(self, request, pk=None):
        """
        Überschreibt die Notizen der Gewalttat.
        UML: tatNotizenBearbeiten()
        """
        gewalttat = self.get_object()
        new_note = request.data.get('tat_notizen')
        
        if new_note is None:
            return Response(
                {'detail': 'tat_notizen ist erforderlich.'},
                status=400
            )
            
        gewalttat.tat_notizen = new_note
        gewalttat.save()
        return Response(GewalttatSerializer(gewalttat).data)

    @action(detail=True, methods=['post', 'delete'], url_path='delete-note')
    def delete_note(self, request, pk=None):
        """
        Löscht die Notizen der Gewalttat.
        UML: tatNotizenLoeschen()
        """
        gewalttat = self.get_object()
        gewalttat.tat_notizen = ""
        gewalttat.save()
        return Response(GewalttatSerializer(gewalttat).data)
