"""ViewSet für Gewaltfolge-Management."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiTypes

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

    def get_queryset(self):
        """Filtert Gewaltfolgen basierend auf User-Berechtigungen."""
        user = self.request.user
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Gewaltfolge.objects.all()
        
        # Gewaltfolgen hängen an Gewalttaten, die an Fällen hängen
        # Wir filtern nach Fällen, für die der User zuständig ist
        return Gewaltfolge.objects.filter(gewalttat__fall__mitarbeiterin=user)

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: GewaltfolgeSerializer},
        description="Fügt eine Notiz zur Gewaltfolge hinzu."
    )
    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        """
        Fügt eine Textnotiz zum Feld 'folgen_notizen' hinzu.
        Erwartet {'notiz': 'Text'} im Body.
        """
        gewaltfolge = self.get_object()
        
        # Explizite Berechtigungsprüfung für 'change'
        if not request.user.has_perm('api.change_gewaltfolge'):
             return Response(
                {"detail": "Sie haben keine Berechtigung, diese Gewaltfolge zu bearbeiten."},
                status=status.HTTP_403_FORBIDDEN
            )

        notiz = request.data.get('notiz')
        if not notiz or not str(notiz).strip():
            return Response(
                {"detail": "Das Feld 'notiz' darf nicht leer sein."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        timestamp = timezone.now().strftime("%d.%m.%Y")
        # Formatierung: [DD.MM.YYYY]: Text
        new_entry = f"\n[{timestamp}]: {notiz}"
        
        if gewaltfolge.folgen_notizen:
            gewaltfolge.folgen_notizen += new_entry
        else:
            gewaltfolge.folgen_notizen = f"[{timestamp}]: {notiz}"
            
        gewaltfolge.save()
        
        serializer = self.get_serializer(gewaltfolge)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: GewaltfolgeSerializer},
        description="Ersetzt die Notizen der Gewaltfolge vollständig."
    )
    @action(detail=True, methods=['post', 'patch'], url_path='update-note')
    def update_note(self, request, pk=None):
        """
        Überschreibt das Feld 'folgen_notizen' komplett mit dem neuen Wert.
        Erwartet {'notiz': 'Neuer Text'} im Body.
        """
        gewaltfolge = self.get_object()
        
        # Explizite Berechtigungsprüfung
        if not request.user.has_perm('api.change_gewaltfolge'):
             return Response(
                {"detail": "Sie haben keine Berechtigung, diese Gewaltfolge zu bearbeiten."},
                status=status.HTTP_403_FORBIDDEN
            )

        if 'notiz' not in request.data:
            return Response(
                {"detail": "Das Feld 'notiz' ist erforderlich."},
                status=status.HTTP_400_BAD_REQUEST
            )

        notiz = request.data.get('notiz')
        
        # None-Werte in leeren String umwandeln, ansonsten String erzwingen
        if notiz is None:
            notiz = ""
        
        gewaltfolge.folgen_notizen = str(notiz)
        gewaltfolge.save()
        
        serializer = self.get_serializer(gewaltfolge)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: GewaltfolgeSerializer},
        description="Löscht die Notizen der Gewaltfolge."
    )
    @action(detail=True, methods=['post', 'delete'], url_path='delete-note')
    def delete_note(self, request, pk=None):
        """
        Löscht den Inhalt des Feldes 'folgen_notizen'.
        """
        gewaltfolge = self.get_object()
        
        # Permission Check
        if not request.user.has_perm('api.change_gewaltfolge'):
             return Response(
                {"detail": "Sie haben keine Berechtigung, diese Gewaltfolge zu bearbeiten."},
                status=status.HTTP_403_FORBIDDEN
            )

        gewaltfolge.folgen_notizen = ""
        gewaltfolge.save()
        
        serializer = self.get_serializer(gewaltfolge)
        return Response(serializer.data, status=status.HTTP_200_OK)
