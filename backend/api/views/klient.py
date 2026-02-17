"""
ViewSet für Klient:innen-Management.

Verwendet DjangoModelPermissions für automatische Permission-Prüfung.
"""

from rest_framework.decorators import action
from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from drf_spectacular.utils import extend_schema

from api.models import KlientIn, Begleitung, Eingabefeld
from api.serializers import KlientInSerializer, BegleitungSerializer
from api.permissions import DjangoModelPermissionsWithView


from django_filters.rest_framework import DjangoFilterBackend

class KlientInViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Klient:innen.
    
    Berechtigungen:
    - GET -> api.view_klientin
    - POST -> api.add_klientin
    - PUT/PATCH -> api.change_klientin
    - DELETE -> api.delete_klientin
    """
    queryset = KlientIn.objects.all()
    serializer_class = KlientInSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        'klient_rolle': ['exact'],
        'klient_geschlechtsidentitaet': ['exact'],
        'klient_alter': ['exact', 'gte', 'lte'],
        'klient_beruf': ['icontains'],
        'klient_staatsangehoerigkeit': ['icontains'],
        'klient_wohnort': ['exact'],
        'klient_schwerbehinderung': ['exact'],
    }
    search_fields = ['klient_code', 'klient_vorname', 'klient_nachname', 'klient_id', 'klient_pseudonym'] # Optional text search
    ordering_fields = ['klient_id', 'erstellt_am', 'klient_nachname', 'klient_pseudonym']
    ordering = ['-klient_id'] # Default: Newest first

    @action(detail=False, methods=['get'], url_path='form-fields')
    def form_fields(self, request):
        """
        Liefert die Konfiguration der Eingabefelder für Klient:innen zurück.
        Kombiniert hardcodierte Felder (die im Frontend erwartet werden) mit dynamischen Feldern aus `Eingabefeld`.
        """
        # 1. Statische / Hardcodierte Felder (Definition analog zu Eingabefeld-Modell)
        # Diese Felder existieren fest im KlientIn-Model und im React-Formular
        static_fields = [
            {
                "name": "klient_pseudonym",
                "label": "Pseudonym / Code",
                "typ": "text",
                "required": False,
                "sort_order": 10
            },
            {
                "name": "klient_rolle",
                "label": "Rolle",
                "typ": "select",
                "required": True,
                "options": [
                    {"value": "B", "label": "Betroffene:r"},
                    {"value": "A", "label": "Angehörige:r"},
                    {"value": "F", "label": "Fachkraft"}
                ],
                "sort_order": 20
            },
            {
                "name": "klient_wohnort",
                "label": "Wohnort",
                "typ": "select",
                "required": False, # Default LS set in frontend
                "options": [
                    {"value": "LS", "label": "Leipzig Stadt"},
                    {"value": "LL", "label": "Leipzig Land"},
                    {"value": "NS", "label": "Nordsachsen"},
                    {"value": "S", "label": "Sachsen (Andere)"},
                    {"value": "D", "label": "Deutschland (Andere)"},
                    {"value": "A", "label": "Ausland"},
                    {"value": "K", "label": "keine Angabe"}
                ],
                "sort_order": 30
            },
            {
                "name": "klient_alter",
                "label": "Alter (Jahre)",
                "typ": "number",
                "required": False,
                "sort_order": 40
            },
            {
                "name": "klient_geschlechtsidentitaet",
                "label": "Geschlechtsidentität",
                "typ": "select",
                "required": False,
                "options": [
                    {"value": "CW", "label": "cis weiblich"},
                    {"value": "CM", "label": "cis männlich"},
                    {"value": "TW", "label": "trans weiblich"},
                    {"value": "TM", "label": "trans männlich"},
                    {"value": "TN", "label": "trans nicht-binär"},
                    {"value": "I", "label": "inter"},
                    {"value": "A", "label": "agender"},
                    {"value": "D", "label": "divers"},
                    {"value": "K", "label": "keine Angabe"}
                ],
                "sort_order": 50
            },
            {
                "name": "klient_sexualitaet",
                "label": "Sexualität",
                "typ": "select",
                "required": False,
                "options": [
                    {"value": "L", "label": "lesbisch"},
                    {"value": "S", "label": "schwul"},
                    {"value": "B", "label": "bisexuell"},
                    {"value": "AX", "label": "asexuell"},
                    {"value": "H", "label": "heterosexuell"},
                    {"value": "K", "label": "keine Angabe"}
                ],
                "sort_order": 60
            },
             {
                "name": "klient_staatsangehoerigkeit",
                "label": "Staatsangehörigkeit",
                "typ": "text",
                "required": True,
                "sort_order": 70
            },
            {
                "name": "klient_beruf",
                "label": "Beruf",
                "typ": "text",
                "required": True,
                "sort_order": 80
            },
             {
                "name": "klient_kontaktpunkt",
                "label": "Kontaktpunkt (Quelle)",
                "typ": "text",
                "required": True,
                "sort_order": 90
            },
            {
                "name": "klient_schwerbehinderung",
                "label": "Schwerbehinderung",
                "typ": "select",
                "required": False,
                 "options": [
                    {"value": "JA", "label": "Ja"},
                    {"value": "NEIN", "label": "Nein"},
                    {"value": "KA", "label": "keine Angabe"}
                ],
                "sort_order": 100
            },
             {
                "name": "klient_migrationshintergrund",
                "label": "Migrationshintergrund",
                "typ": "select",
                "required": False,
                 "options": [
                    {"value": "JA", "label": "Ja"},
                    {"value": "NEIN", "label": "Nein"},
                    {"value": "KA", "label": "keine Angabe"}
                ],
                "sort_order": 110
            }
        ]

        # 2. Dynamische Felder aus der Datenbank
        dynamic_fields_qs = Eingabefeld.objects.filter(context='klient').order_by('sort_order', 'label')
        dynamic_fields = []
        
        # Sortierungs-Offset, damit dynamische Felder nach den statischen kommen (falls sort_order nicht explizit gesetzt)
        offset = 200 

        for field in dynamic_fields_qs:
            field_def = {
                "name": field.name,
                "label": field.label,
                "typ": field.typ,
                "required": field.required,
                "options": field.options, # JSONField, ist bereits Liste/Dict
                "default_value": field.default_value,
                "sort_order": field.sort_order if field.sort_order > 0 else offset + field.feldID
            }
            dynamic_fields.append(field_def)

        # Merge und Sortieren
        all_fields = static_fields + dynamic_fields
        all_fields.sort(key=lambda x: x['sort_order'])

        return Response({"fields": all_fields})

    def get_queryset(self):
        """
        TEMPORARY: Returns ALL clients for everyone to unblock UI issues.
        """
        return KlientIn.objects.all()

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'begleitung_id': {'type': 'integer'}}}},
        responses={200: BegleitungSerializer},
        description="Weist eine existierende Begleitung diesem Klienten zu (Besitzerwechsel)."
    )
    @action(detail=True, methods=['post'], url_path='assign-begleitung')
    def assign_begleitung(self, request, pk=None):
        """
        Weist eine existierende Begleitung diesem Klienten zu.
        Falls die Begleitung einem Fall zugeordnet war, wird diese Zuordnung gelöscht,
        um Inkonsistenzen zu vermeiden.
        """
        ziel_klient = self.get_object()
        begleitung_id = request.data.get('begleitung_id')

        if not begleitung_id:
            raise ValidationError({'begleitung_id': 'Dieses Feld ist erforderlich.'})

        try:
            begleitung = Begleitung.objects.get(pk=begleitung_id)
        except Begleitung.DoesNotExist:
            raise ValidationError({'begleitung_id': 'Begleitung nicht gefunden.'})

        # Berechtigungsprüfung für Begleitung (change_begleitung)
        if not request.user.has_perm('api.change_begleitung'):
             return Response(
                {'detail': 'Sie haben keine Berechtigung, Begleitungen zu ändern.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Logik: Besitzerwechsel
        old_klient = begleitung.klient
        if old_klient != ziel_klient:
            begleitung.klient = ziel_klient
            
            # Side-Effect: Fall-Zuordnung prüfen und ggf. löschen
            if begleitung.fall:
                # Wenn der Fall nicht zum neuen Klienten gehört (was er nicht kann, wenn er zum alten gehörte),
                # muss die Verbindung gelöst werden.
                if begleitung.fall.klient != ziel_klient:
                    begleitung.fall = None
            
            begleitung.save()

        serializer = BegleitungSerializer(begleitung)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='add-note')
    def add_note(self, request, pk=None):
        """
        Fügt eine Notiz zum Klienten hinzu.
        UML: klientNotizAnlegen()
        """
        from django.utils import timezone
        
        klient = self.get_object()
        new_note = request.data.get('text')
        
        if not new_note:
            return Response(
                {'detail': 'Text ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        timestamp = timezone.now().strftime('%Y-%m-%d %H:%M')
        
        if klient.klient_notizen:
            klient.klient_notizen += f"\n\n[{timestamp}] {new_note}"
        else:
            klient.klient_notizen = f"[{timestamp}] {new_note}"
            
        klient.save()
        return Response(KlientInSerializer(klient).data)

    @action(detail=True, methods=['post', 'patch'], url_path='update-note')
    def update_note(self, request, pk=None):
        """
        Überschreibt die Notizen des Klienten.
        UML: klientNotizBearbeiten()
        """
        klient = self.get_object()
        new_note = request.data.get('klient_notizen')
        
        if new_note is None:
            return Response(
                {'detail': 'klient_notizen ist erforderlich.'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        klient.klient_notizen = new_note
        klient.save()
        return Response(KlientInSerializer(klient).data)

    @action(detail=True, methods=['post', 'delete'], url_path='delete-note')
    def delete_note(self, request, pk=None):
        """
        Löscht die Notizen des Klienten.
        UML: klientNotizLoeschen()
        """
        klient = self.get_object()
        klient.klient_notizen = ""
        klient.save()
        return Response(KlientInSerializer(klient).data)

    @extend_schema(
        request={'application/json': {'type': 'object', 'properties': {'fall_id': {'type': 'integer'}}}},
        description="Weist einen existierenden Fall diesem Klienten zu."
    )
    @action(detail=True, methods=['post'], url_path='assign-fall')
    def assign_fall(self, request, pk=None):
        """
        Weist einen existierenden Fall diesem Klienten zu.
        """
        from api.models import Fall
        from api.serializers import FallSerializer

        klient = self.get_object()
        fall_id = request.data.get('fall_id')

        if not fall_id:
            raise ValidationError({'fall_id': 'Dieses Feld ist erforderlich.'})

        try:
            fall = Fall.objects.get(pk=fall_id)
        except Fall.DoesNotExist:
            raise ValidationError({'fall_id': 'Fall nicht gefunden.'})

        # Berechtigungsprüfung für Fall (change_fall)
        if not request.user.has_perm('api.change_fall'):
             return Response(
                {'detail': 'Sie haben keine Berechtigung, Fälle zu ändern.'},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Check ownership if not admin/can_view_all_data
        user = request.user
        if user.rolle_mb != 'AD' and not user.has_perm('api.can_view_all_data'):
             if fall.mitarbeiterin != user:
                 return Response(
                    {'detail': 'Sie haben keine Berechtigung, diesen Fall zu bearbeiten.'},
                    status=status.HTTP_403_FORBIDDEN
                )

        fall.klient = klient
        fall.save()

        serializer = FallSerializer(fall)
        return Response(serializer.data, status=status.HTTP_200_OK)
