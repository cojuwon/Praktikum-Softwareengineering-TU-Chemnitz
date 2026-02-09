"""ViewSet für Statistik-Management."""

from django.core.files.base import ContentFile
from django.db.models import Q
from django.http import FileResponse
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from api.models import Statistik, Preset, STANDORT_CHOICES
from api.serializers import StatistikSerializer, PresetSerializer
from api.permissions import DjangoModelPermissionsWithView, IsOwnerOrAdmin


class StatistikViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Statistiken.
    
    Berechtigungen:
    - Zugriff nur für authentifizierte User.
    - User sehen nur eigene Statistiken (außer Admins).
    - Export erfordert 'api.can_export_statistik'.
    """
    queryset = Statistik.objects.all()
    serializer_class = StatistikSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView, IsOwnerOrAdmin]

    def get_queryset(self):
        """
        User sehen ihre eigenen Statistiken.
        Admins sehen alle Statistiken.
        """
        user = self.request.user
        if user.rolle_mb == 'AD':
            return Statistik.objects.all()
        return Statistik.objects.filter(creator=user)

    def perform_create(self, serializer):
        """
        Erstellt eine Statistik, führt die (Dummy-)Berechnung durch und speichert das Ergebnis.
        """
        # 1. Daten extrahieren
        start = serializer.validated_data.get('zeitraum_start')
        ende = serializer.validated_data.get('zeitraum_ende')
        preset = serializer.validated_data.get('preset')
        
        # 2. Filter anwenden (Simulation)
        filter_info = "Keine Filter (Ad-hoc)"
        if preset:
            filter_info = f"Filter aus Preset '{preset.preset_beschreibung}'"
        
        # 3. Berechnung simulieren & Datei erstellen
        # In einer echten Anwendung würde hier die komplexe Aggregationslogik laufen.
        content = (
            f"Statistik Report\n"
            f"================\n"
            f"Titel: {serializer.validated_data.get('statistik_titel')}\n"
            f"Zeitraum: {start} bis {ende}\n"
            f"Basis: {filter_info}\n"
            f"Erstellt am: {timezone.now()}\n"
            f"Erstellt von: {self.request.user}\n\n"
            f"Ergebnisse:\n"
            f"- Anzahl Fälle: 42\n"
            f"- Anzahl Beratungen: 128\n"
            f"- Durchschnittsalter: 35.5\n"
        )
        
        file_name = f"statistik_{timezone.now().strftime('%Y%m%d_%H%M%S')}.txt"
        file_obj = ContentFile(content.encode('utf-8'), name=file_name)
        
        # 4. Speichern mit Creator und Ergebnisdatei
        serializer.save(creator=self.request.user, ergebnis=file_obj, creation_date=timezone.localdate())

    @action(detail=False, methods=['get'])
    def filters(self, request):
        """
        Liefert die Definition der verfügbaren Filter mit echten Enum-Optionen.
        """
        from api.services.statistik_service import StatistikService
        filters = StatistikService.get_filters()
        return Response({"filters": filters})

    @action(detail=False, methods=['get'])
    def presets(self, request):
        """
        Liefert gespeicherte Presets.
        """
        presets = Preset.objects.filter(
            Q(ersteller=request.user) | Q(berechtigte=request.user)
        ).distinct()
        serializer = PresetSerializer(presets, many=True)
        return Response({"presets": serializer.data})

    @action(detail=False, methods=['post'])
    def query(self, request):
        """
        Führt die Statistik-Berechnung basierend auf den Filtern durch.
        """
        filters = request.data
        try:
            from api.services.statistik_service import StatistikService
            result = StatistikService.calculate_stats(filters)
            return Response(result)
        except Exception as e:
            return Response(
                {'detail': f'Fehler bei der Berechnung: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @extend_schema(
        parameters=[OpenApiParameter(name='format', description='Dateiformat (pdf, xlsx, csv)', required=False, type=str)],
        responses={200: None}
    )
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """
        Exportiert die Statistik-Ergebnisdatei.
        Erfordert die Permission 'api.can_export_statistik'.
        """
        if not request.user.has_perm('api.can_export_statistik'):
             return Response(
                 {'detail': 'Sie haben keine Berechtigung, Statistiken zu exportieren.'}, 
                 status=status.HTTP_403_FORBIDDEN
             )
        
        statistik = self.get_object()
        if not statistik.ergebnis:
             return Response(
                 {'detail': 'Keine Ergebnisdatei vorhanden.'}, 
                 status=status.HTTP_404_NOT_FOUND
             )
             
        # Hier könnte man Konvertierungslogik einbauen (z.B. txt -> pdf).
        # Für diesen Prototyp geben wir die generierte Textdatei zurück.
        
        return FileResponse(
            statistik.ergebnis.open(), 
            as_attachment=True, 
            filename=statistik.ergebnis.name
        )

    @action(detail=True, methods=['patch'], url_path='update-title')
    def update_title(self, request, pk=None):
        """
        Aktualisiert nur den Titel der Statistik.
        """
        statistik = self.get_object()
        titel = request.data.get('statistik_titel')
        
        if not titel:
            return Response(
                {'detail': 'Das Feld "statistik_titel" ist erforderlich.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        statistik.statistik_titel = titel
        statistik.save()
        return Response(StatistikSerializer(statistik).data)

    @action(detail=True, methods=['patch'], url_path='update-notes')
    def update_notes(self, request, pk=None):
        """
        Aktualisiert nur die Notizen der Statistik.
        """
        statistik = self.get_object()
        notizen = request.data.get('statistik_notizen')
        
        if notizen is None:
             return Response(
                 {'detail': 'Das Feld "statistik_notizen" ist erforderlich.'}, 
                 status=status.HTTP_400_BAD_REQUEST
             )
             
        statistik.statistik_notizen = notizen
        statistik.save()
        return Response(StatistikSerializer(statistik).data)
