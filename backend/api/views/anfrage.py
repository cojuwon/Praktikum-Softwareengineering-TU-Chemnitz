"""
ViewSet für Anfrage-Management.

Implementiert die UML-Methoden:
- anfrageAnlegen() -> create (POST)
- anfrageBearbeiten() -> update/partial_update (PUT/PATCH)
- anfrageSuchen() -> list/retrieve (GET)
- anfrageLoeschen() -> destroy (DELETE)
- mitarbeiterinZuweisen() -> custom action (via Admin)
"""

from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import Anfrage, Konto
from api.serializers import AnfrageSerializer
from api.permissions import DjangoModelPermissionsWithView, CanManageOwnData


class AnfrageViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Anfragen.
    
    UML-Mapping:
    - anfrageAnlegen() -> POST /api/anfragen/ (create)
    - anfrageBearbeiten() -> PUT/PATCH /api/anfragen/{id}/ (update/partial_update)
    - anfrageSuchen() -> GET /api/anfragen/ oder /api/anfragen/{id}/ (list/retrieve)
    - anfrageLoeschen() -> DELETE /api/anfragen/{id}/ (destroy)
    - mitarbeiterinZuweisen() -> POST /api/anfragen/{id}/assign/ (custom action)
    
    Berechtigungen (via DjangoModelPermissionsWithView):
    - GET -> api.view_anfrage
    - POST -> api.add_anfrage
    - PUT/PATCH -> api.change_anfrage
    - DELETE -> api.delete_anfrage
    
    Object-Level Berechtigungen (via CanManageOwnData):
    - Standard-User: Nur eigene Anfragen (mitarbeiterin == request.user)
    - Admins / can_view_all_data: Alle Anfragen
    """
    queryset = Anfrage.objects.all()
    serializer_class = AnfrageSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]

    def get_queryset(self):
        """
        Filtert Anfragen basierend auf User-Berechtigungen.
        
        - Admins (rolle_mb='AD') sehen alle Anfragen
        - User mit can_view_all_data Permission sehen alle Anfragen
        - Andere User sehen nur ihre eigenen Anfragen (mitarbeiterin=user)
        """
        user = self.request.user
        base_qs = Anfrage.objects.select_related('beratungstermin', 'mitarbeiterin', 'fall')
        
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_data'):
            return base_qs
        return base_qs.filter(mitarbeiterin=user)

    @action(detail=True, methods=['post'], url_path='assign-employee')
    def assign_employee(self, request, pk=None):
        """
        Weist eine Anfrage einer Mitarbeiterin zu.
        UML: mitarbeiterinZuweisen()
        """
        anfrage = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'detail': 'user_id ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = Konto.objects.get(pk=user_id)
        except Konto.DoesNotExist:
            return Response(
                {'detail': 'Benutzer nicht gefunden.'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        anfrage.mitarbeiterin = user
        anfrage.save()
        
        return Response(AnfrageSerializer(anfrage).data)

    @action(detail=True, methods=['post'], url_path='create-consultation')
    def create_consultation(self, request, pk=None):
        """
        Erstellt einen Beratungstermin aus einer Anfrage heraus.
        UML: beratungterminZuweisen()
        """
        from api.models import Beratungstermin
        from api.serializers import BeratungsterminSerializer
        
        anfrage = self.get_object()
        
        if anfrage.beratungstermin:
            return Response(
                {'detail': 'Anfrage hat bereits einen Beratungstermin.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Daten für den neuen Termin validieren
        serializer = BeratungsterminSerializer(data=request.data)
        if serializer.is_valid():
            termin = serializer.save()
            
            # Verknüpfung herstellen
            anfrage.beratungstermin = termin
            anfrage.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_context(self):
        """Erweitert den Serializer-Kontext um den aktuellen Request."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        """
        anfrageAnlegen(): Erstellt neue Anfrage.
        Setzt automatisch den aktuellen User als Mitarbeiter:in.
        """
        serializer.save(mitarbeiterin=self.request.user)

    def perform_update(self, serializer):
        """
        anfrageBearbeiten(): Aktualisiert bestehende Anfrage.
        
        Schutzlogik für das mitarbeiterin-Feld:
        - Standard-User können die mitarbeiterin NICHT ändern (wird ignoriert)
        - Nur User mit can_manage_users Permission können Anfragen neu zuweisen
        - Admins können immer die mitarbeiterin ändern
        """
        user = self.request.user
        instance = self.get_object()
        
        # Prüfe, ob User berechtigt ist, mitarbeiterin zu ändern
        can_reassign = (
            user.rolle_mb == 'AD' or 
            user.has_perm('api.can_manage_users')
        )
        
        if not can_reassign:
            # Entferne mitarbeiterin aus validated_data, falls vorhanden
            # So kann das Feld nicht manipuliert werden
            serializer.validated_data.pop('mitarbeiterin', None)
        
        serializer.save()

    @action(detail=True, methods=['post'], url_path='assign')
    def assign_mitarbeiterin(self, request, pk=None):
        """
        mitarbeiterinZuweisen(): Custom Action zum Zuweisen einer Anfrage an eine:n Mitarbeiter:in.
        
        Nur für Admins oder User mit can_manage_users Permission.
        
        Request Body:
        {
            "mitarbeiterin_id": <int>
        }
        """
        # Permission-Check
        if not (request.user.rolle_mb == 'AD' or request.user.has_perm('api.can_manage_users')):
            return Response(
                {'detail': 'Nur Administratoren können Anfragen neu zuweisen.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        anfrage = self.get_object()
        mitarbeiterin_id = request.data.get('mitarbeiterin_id')
        
        if not mitarbeiterin_id:
            return Response(
                {'detail': 'mitarbeiterin_id ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            neue_mitarbeiterin = Konto.objects.get(pk=mitarbeiterin_id)
        except Konto.DoesNotExist:
            return Response(
                {'detail': 'Mitarbeiter:in nicht gefunden.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        anfrage.mitarbeiterin = neue_mitarbeiterin
        anfrage.save(update_fields=['mitarbeiterin'])
        
        serializer = self.get_serializer(anfrage)
        return Response(serializer.data)
