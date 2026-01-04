"""ViewSet für Preset-Management."""

from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import Preset, Konto
from api.serializers import PresetSerializer
from api.permissions import DjangoModelPermissionsWithView, IsOwnerOrAdmin


class PresetViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Presets.
    
    Berechtigungen:
    - GET -> api.view_preset
    - POST -> api.add_preset
    - PUT/PATCH -> api.change_preset (nur eigene oder als Admin)
    - DELETE -> api.delete_preset (nur eigene oder als Admin)
    """
    queryset = Preset.objects.all()
    serializer_class = PresetSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, IsOwnerOrAdmin]

    def get_queryset(self):
        """
        User sehen ihre eigenen Presets und Presets, die mit ihnen geteilt wurden.
        Admins sehen alle Presets.
        """
        user = self.request.user
        if user.rolle_mb == 'AD':
            return Preset.objects.all()
        # Eigene Presets + geteilte Presets
        return Preset.objects.filter(
            models.Q(ersteller=user) | models.Q(berechtigte=user)
        ).distinct()

    def perform_create(self, serializer):
        """Setzt automatisch den aktuellen User als Ersteller."""
        serializer.save(ersteller=self.request.user)

    @action(detail=True, methods=['post'])
    def share(self, request, pk=None):
        """
        Teilt ein Preset mit anderen Usern.
        Erfordert can_share_preset Permission.
        
        POST /api/presets/{id}/share/
        Body: {"user_ids": [1, 2, 3]}
        """
        if not request.user.has_perm('api.can_share_preset'):
            return Response(
                {'detail': 'Sie haben keine Berechtigung, Presets zu teilen.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        preset = self.get_object()
        user_ids = request.data.get('user_ids')
        
        # Validate that user_ids is provided and is a list
        if user_ids is None:
            return Response(
                {'detail': 'Das Feld "user_ids" ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not isinstance(user_ids, list):
            return Response(
                {'detail': '"user_ids" muss eine Liste sein.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle empty list explicitly
        if len(user_ids) == 0:
            return Response(
                {'detail': 'Die Liste "user_ids" darf nicht leer sein.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and coerce each element to int
        coerced_ids = []
        for idx, user_id in enumerate(user_ids):
            try:
                coerced_ids.append(int(user_id))
            except (ValueError, TypeError):
                return Response(
                    {'detail': f'Element an Index {idx} ist keine gültige Ganzzahl: {user_id}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        users = Konto.objects.filter(pk__in=coerced_ids)
        preset.berechtigte.add(*users)
        
        return Response({
            'status': 'Preset wurde geteilt.',
            'shared_with': list(preset.berechtigte.values_list('mail_mb', flat=True))
        })
