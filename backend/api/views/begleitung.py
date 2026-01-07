"""ViewSet für Begleitung-Management."""

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from api.models import Begleitung
from api.serializers import BegleitungSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class BegleitungViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Begleitungen.
    
    Berechtigungen:
    - GET -> api.view_begleitung
    - POST -> api.add_begleitung
    - PUT/PATCH -> api.change_begleitung
    - DELETE -> api.delete_begleitung
    """
    queryset = Begleitung.objects.all()
    serializer_class = BegleitungSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """Filtert Begleitungen basierend auf User-Berechtigungen."""
        user = self.request.user
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return Begleitung.objects.all()
        return Begleitung.objects.filter(fall__mitarbeiterin=user)

    @action(detail=True, methods=['post', 'patch'], url_path='update-referral')
    def update_referral(self, request, pk=None):
        """
        Aktualisiert Verweisungsdaten.
        UML: verweisungAnlegen() / verweisungBearbeiten()
        """
        begleitung = self.get_object()
        anzahl = request.data.get('anzahl_verweisungen')
        art = request.data.get('art_verweisungen')
        
        if anzahl is not None:
            begleitung.anzahl_verweisungen = anzahl
        if art is not None:
            begleitung.art_verweisungen = art
            
        begleitung.save()
        return Response(BegleitungSerializer(begleitung).data)

    @action(detail=True, methods=['post', 'delete'], url_path='delete-referral')
    def delete_referral(self, request, pk=None):
        """
        Löscht Verweisungsdaten.
        UML: verweisungLoeschen()
        """
        begleitung = self.get_object()
        begleitung.anzahl_verweisungen = 0
        begleitung.art_verweisungen = ""
        begleitung.save()
        return Response(BegleitungSerializer(begleitung).data)
