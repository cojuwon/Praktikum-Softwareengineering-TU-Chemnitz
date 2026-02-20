"""
ViewSet für Anfrage-Management.

Implementiert die UML-Methoden:
- anfrageAnlegen() -> create (POST)
- anfrageBearbeiten() -> update/partial_update (PUT/PATCH)
- anfrageSuchen() -> list/retrieve (GET)
- anfrageLoeschen() -> destroy (DELETE)
- mitarbeiterinZuweisen() -> custom action (via Admin)

Suche, Filter und Sortierung:
- GET /api/anfragen/?search=text -> Fuzzy-Textsuche über alle Felder
- GET /api/anfragen/?mitarbeiterin=1 -> Nach Mitarbeiter:in filtern
- GET /api/anfragen/?anfrage_art=B -> Nach Art filtern
- GET /api/anfragen/?anfrage_ort=LS -> Nach Ort filtern
- GET /api/anfragen/?anfrage_person=F -> Nach Person filtern
- GET /api/anfragen/?status=AN,TV -> Nach Status filtern (AN=Anfrage, TV=Termin vereinbart, A=Abgeschlossen)
- GET /api/anfragen/?datum_von=2024-01-01&datum_bis=2024-12-31 -> Nach Zeitraum filtern
- GET /api/anfragen/?ordering=-anfrage_datum -> Sortierung
"""

from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q

from api.models import Anfrage, Konto, STANDORT_CHOICES, ANFRAGE_PERSON_CHOICES, ANFRAGE_ART_CHOICES, ANFRAGE_STATUS_CHOICES, Eingabefeld
from api.serializers import AnfrageSerializer
from api.permissions import CanManageOwnData, DjangoModelPermissionsWithView


from django.utils import timezone

class AnfrageViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Anfragen.
    
    UML-Mapping:
    - anfrageAnlegen() -> POST /api/anfragen/ (create)
    - anfrageBearbeiten() -> PUT/PATCH /api/anfragen/{id}/ (update/partial_update)
    - anfrageSuchen() -> GET /api/anfragen/ oder /api/anfragen/{id}/ (list/retrieve)
    - anfrageLoeschen() -> DELETE /api/anfragen/{id}/ (destroy - Soft Delete)
    - mitarbeiterinZuweisen() -> POST /api/anfragen/{id}/assign/ (custom action)
    
    Berechtigungen für Anfragen-Sichtbarkeit:
    - api.can_view_all_anfragen -> Alle Anfragen sehen (Admins)
    - api.can_view_own_anfragen -> Nur eigene Anfragen sehen (Standard-User)
    - Keine der beiden Permissions -> Leere Liste
    
    Object-Level Berechtigungen (via CanManageOwnData):
    - Standard-User: Nur eigene Anfragen (mitarbeiterin == request.user)
    - Admins / can_view_all_anfragen: Alle Anfragen
    
    Suche & Filter:
    - search: Freitextsuche über anfrage_weg, mitarbeiterin_name, anfrage_art/ort/person Labels
    - mitarbeiterin: Filter nach Mitarbeiter:in ID
    - anfrage_art: Filter nach Art-Code (MS, VS, B, R, S)
    - anfrage_ort: Filter nach Ort-Code (LS, LL, NS, S, D, A, K)
    - anfrage_person: Filter nach Person-Code
    - datum_von / datum_bis: Filter nach Datumsbereich
    - ordering: Sortierung (anfrage_datum, anfrage_art, anfrage_ort, mitarbeiterin__nachname_mb)
    - archived: 'true' -> Zeige Archiv, 'false' -> Zeige Aktive (Default)
    
    Spezielle Actions:
    - trashbin: Zeige Papierkorb
    - restore: Wiederherstellen
    """
    queryset = Anfrage.objects.all()
    serializer_class = AnfrageSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, CanManageOwnData]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'anfrage_datum', 'anfrage_art', 'anfrage_ort', 'anfrage_person', 'anfrage_id']
    ordering = ['-created_at']  # Default: neueste zuerst

    def get_queryset(self):
        """
        Filtert Anfragen basierend auf User-Berechtigungen und Query-Parametern.
        """
        user = self.request.user
        base_qs = Anfrage.objects.select_related('beratungstermin', 'mitarbeiterin', 'fall')
        
        # --- 1. Soft-Delete & Archiv Logik ---
        # --- 1. Soft-Delete & Archiv Logik ---
        # --- 1. Soft-Delete & Archiv Logik ---
        if self.action in ['trashbin', 'restore']:
            # Im Papierkorb oder Wiederherstellen: Nur gelöschte Elemente
            qs = base_qs.filter(deleted_at__isnull=False)
        else:
            # Standard: Nur aktive (nicht gelöschte) Elemente
            qs = base_qs.filter(deleted_at__isnull=True)

            # Archiv-Logik:
            # Filtern nach 'is_archived' nur in Listen-Ansichten (detail=False).
            if not self.detail:
                archived_param = self.request.query_params.get('archived')
                if archived_param == 'true':
                    qs = qs.filter(is_archived=True)
                else:
                    qs = qs.filter(is_archived=False)

        # --- 2. Permission-basierte Filterung ---
        if user.rolle_mb == 'AD' or user.has_perm('api.can_view_all_anfragen'):
            pass # Behalte qs wie sie ist
        elif user.has_perm('api.can_view_own_anfragen'):
            qs = qs.filter(mitarbeiterin=user)
        else:
            return base_qs.none()
        
        # === Zusätzliche Filter aus Query-Parametern ===
        params = self.request.query_params
        
        # Fuzzy-Textsuche über mehrere Felder
        search = params.get('search', '').strip()
        if search:
            qs = qs.filter(
                Q(anfrage_weg__icontains=search) |
                Q(anfrage_art__icontains=search) |
                Q(anfrage_ort__icontains=search) |
                Q(anfrage_person__icontains=search) |
                Q(mitarbeiterin__vorname_mb__icontains=search) |
                Q(mitarbeiterin__nachname_mb__icontains=search) |
                Q(mitarbeiterin__mail_mb__icontains=search)
            )
        
        # Filter nach Mitarbeiter:in
        mitarbeiterin_id = params.get('mitarbeiterin')
        if mitarbeiterin_id:
            qs = qs.filter(mitarbeiterin_id=mitarbeiterin_id)
        
        # Filter nach Anfrage-Art
        anfrage_art = params.get('anfrage_art')
        if anfrage_art:
            arts = [x.strip() for x in anfrage_art.split(',') if x.strip()]
            if arts:
                qs = qs.filter(anfrage_art__in=arts)
        
        # Filter nach Anfrage-Ort
        anfrage_ort = params.get('anfrage_ort')
        if anfrage_ort:
            orte = [x.strip() for x in anfrage_ort.split(',') if x.strip()]
            if orte:
                qs = qs.filter(anfrage_ort__in=orte)
        
        # Filter nach Anfrage-Person
        anfrage_person = params.get('anfrage_person')
        if anfrage_person:
            personen = [x.strip() for x in anfrage_person.split(',') if x.strip()]
            if personen:
                qs = qs.filter(anfrage_person__in=personen)
        
        # Filter nach Status
        status_param = params.get('status')
        if status_param:
            statuses = [x.strip() for x in status_param.split(',') if x.strip()]
            if statuses:
                qs = qs.filter(status__in=statuses)
        
        # Filter nach Datumsbereich
        datum_von = params.get('datum_von')
        if datum_von:
            qs = qs.filter(anfrage_datum__gte=datum_von)
        
        datum_bis = params.get('datum_bis')
        if datum_bis:
            qs = qs.filter(anfrage_datum__lte=datum_bis)
        
        return qs

    @action(detail=False, methods=['get'], url_path='form-fields')
    def form_fields(self, request):
        """
        Liefert die Definition der Eingabefelder für eine neue Anfrage.
        Die Felder werden dynamisch aus der Tabelle 'Eingabefeld' geladen.
        """
        fields_qs = Eingabefeld.objects.filter(context='anfrage').order_by('sort_order')
        
        fields = []
        for f in fields_qs:
            field_def = {
                "name": f.name,
                "label": f.label,
                "type": f.typ,
                "required": f.required,
            }
            if f.options:
                field_def["options"] = f.options
            
            fields.append(field_def)

        return Response({"fields": fields})

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

    # --- DELETE / ARCHIVE / TRASHBIN ACTIONS ---

    def perform_destroy(self, instance):
        """
        Überschreibt das Standard-DELETE.
        Führt Soft-Delete durch, statt DB-Eintrag zu löschen.
        """
        instance.deleted_at = timezone.now()
        instance.deleted_by = self.request.user
        instance.save()

    @action(detail=True, methods=['post'], url_path='soft-delete')
    def soft_delete(self, request, pk=None):
        """
        Expliziter Endpunkt für Soft-Delete (alternativ zu DELETE).
        """
        anfrage = self.get_object()
        self.perform_destroy(anfrage)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        """
        Stellt eine gelöschte Anfrage aus dem Papierkorb wieder her.
        """
        anfrage = self.get_object()
        anfrage.deleted_at = None
        anfrage.deleted_by = None
        anfrage.save()
        return Response({'status': 'Anfrage wiederhergestellt'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='trashbin')
    def trashbin(self, request):
        """
        Listet alle gelöschten Anfragen auf (Papierkorb).
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='archive')
    def archive(self, request, pk=None):
        """
        Verschiebt eine Anfrage ins Archiv.
        """
        anfrage = self.get_object()
        anfrage.is_archived = True
        anfrage.save()
        return Response({'status': 'Anfrage archiviert'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unarchive')
    def unarchive(self, request, pk=None):
        """
        Holt eine Anfrage aus dem Archiv zurück (aktiv).
        """
        anfrage = self.get_object()
        anfrage.is_archived = False
        anfrage.save()
        return Response({'status': 'Anfrage reaktiviert'}, status=status.HTTP_200_OK)
