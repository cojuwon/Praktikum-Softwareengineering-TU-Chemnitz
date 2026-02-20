from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from api.models import SystemSettings
from api.serializers import SystemSettingsSerializer

class SystemSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet für Systemeinstellungen.
    Erlaubt nur das Abrufen und Bearbeiten der globalen Einstellungen.
    
    Permissions:
    - manage_system_settings (für Änderungen)
    - Authenticated Users (Read-only? Oder auch beschränkt? Aktuell beschränkt auf Permissions)
    """
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    # Standard: Nur Authentifizierte.
    # Für Details: Wir prüfen Permissions per Method oder global.
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Es gibt nur ein Objekt.
        return SystemSettings.objects.all()

    def list(self, request, *args, **kwargs):
        """
        Gibt immer die Singleton-Instanz zurück.
        """
        instance = SystemSettings.load()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Gibt immer die Singleton-Instanz zurück, egal welche ID.
        """
        instance = SystemSettings.load()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Verhindert das Erstellen neuer Instanzen (Singleton).
        """
        return Response({'detail': 'Erstellen nicht erlaubt.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    
    def update(self, request, *args, **kwargs):
        """
        Updates settings. Requires 'api.manage_system_settings' permission.
        """
        if not request.user.has_perm('api.manage_system_settings'):
             return Response({'detail': 'Keine Berechtigung.'}, status=status.HTTP_403_FORBIDDEN)
        
        instance = SystemSettings.load()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        return Response({'detail': 'Löschen nicht erlaubt.'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)
