"""ViewSet für Beratungstermin-Management."""

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiTypes

from api.models import Beratungstermin
from api.serializers import BeratungsterminSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class BeratungsterminViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Beratungstermine.
    
    Berechtigungen:
    - GET -> api.view_beratungstermin
    - POST -> api.add_beratungstermin
    - PUT/PATCH -> api.change_beratungstermin
    - DELETE -> api.delete_beratungstermin
    """
    queryset = Beratungstermin.objects.all()
    serializer_class = BeratungsterminSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """
        Filtert Beratungstermine basierend auf User-Berechtigungen.
        """
        user = self.request.user
        queryset = Beratungstermin.objects.all()

        # Check permission to view all
        can_view_all = (
            user.rolle_mb == 'AD' 
            or user.has_perm('api.view_all_beratungstermin') 
            or user.has_perm('api.can_view_all_data')
        )

        # Explicit request for all data
        if can_view_all and self.request.query_params.get('view') == 'all':
            return queryset
            
        # Filter by own appointments
        if user.has_perm('api.view_own_beratungstermin') or can_view_all:
             return queryset.filter(berater=user)
        
        # No permission
        return queryset.none()

    def perform_create(self, serializer):
        """
        Erstellt einen neuen Beratungstermin.
        - Setzt automatisch den aktuellen User als Berater:in, falls nicht angegeben.
        - Prüft die Berechtigung für den zugeordneten Fall.
        """
        from rest_framework.exceptions import PermissionDenied
        
        fall = serializer.validated_data.get('fall')
        user = self.request.user

        # Fall-Berechtigungsprüfung
        if fall:
            # Admin und User mit 'view_all_data' dürfen für alle Fälle Termine anlegen
            is_admin = user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data')
            
            # Wenn kein Admin, muss der Fall dem User gehören
            if not is_admin and fall.mitarbeiterin != user:
                raise PermissionDenied("Sie können keine Termine für Fälle anderer Mitarbeiter anlegen.")

        # Berater setzen, falls nicht im Request enthalten
        save_kwargs = {}
        if 'berater' not in serializer.validated_data:
            save_kwargs['berater'] = user
            
        serializer.save(**save_kwargs)

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: BeratungsterminSerializer},
        description="Fügt eine Notiz zum Beratungstermin hinzu."
    )
    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        """
        Fügt eine Textnotiz zum Feld 'notizen_beratung' hinzu.
        Erwartet {'notiz': 'Text'} im Body.
        """
        beratungstermin = self.get_object()
        
        # Explizite Berechtigungsprüfung für 'change' (da POST normalerweise 'add' prüft)
        if not request.user.has_perm('api.change_beratungstermin'):
             return Response(
                {"detail": "Sie haben keine Berechtigung, diesen Beratungstermin zu bearbeiten."},
                status=status.HTTP_403_FORBIDDEN
            )

        notiz = request.data.get('notiz')
        if not notiz or not str(notiz).strip():
            return Response(
                {"detail": "Das Feld 'notiz' darf nicht leer sein."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        timestamp = timezone.now().strftime("%d.%m.%Y %H:%M")
        author = f"{request.user.vorname_mb} {request.user.nachname_mb}"
        
        # Formatierung der neuen Notiz
        new_entry = f"\n\n--- Notiz von {author} am {timestamp} ---\n{notiz}"
        
        if beratungstermin.notizen_beratung:
            beratungstermin.notizen_beratung += new_entry
        else:
            # Bei leerem Feld keine führenden Newlines
            beratungstermin.notizen_beratung = new_entry.strip()
            
        beratungstermin.save()
        
        serializer = self.get_serializer(beratungstermin)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: BeratungsterminSerializer},
        description="Überschreibt die Notizen des Beratungstermins komplett."
    )
    @action(detail=True, methods=['post', 'patch'], url_path='edit-note')
    def edit_note(self, request, pk=None):
        """
        Überschreibt das Feld 'notizen_beratung' komplett mit dem neuen Wert.
        Erwartet {'notiz': 'Neuer Text'} im Body.
        """
        beratungstermin = self.get_object()
        
        # Explizite Berechtigungsprüfung
        if not request.user.has_perm('api.change_beratungstermin'):
             return Response(
                {"detail": "Sie haben keine Berechtigung, diesen Beratungstermin zu bearbeiten."},
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
        
        beratungstermin.notizen_beratung = str(notiz)
        beratungstermin.save()
        
        serializer = self.get_serializer(beratungstermin)
        return Response(serializer.data, status=status.HTTP_200_OK)
