"""ViewSet für Statistik-Management."""

from django.core.files.base import ContentFile
from django.http import FileResponse
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter

from api.models import Statistik
from api.serializers import StatistikSerializer
from api.permissions import DjangoModelPermissionsWithView, IsOwnerOrAdmin
from api.services.statistik_service import StatistikService


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
        Erstellt eine Statistik, führt die Berechnung durch und speichert das Ergebnis.
        """
        # 1. Daten extrahieren
        start = serializer.validated_data.get('zeitraum_start')
        ende = serializer.validated_data.get('zeitraum_ende')
        preset = serializer.validated_data.get('preset')
        
        # 2. Filter anwenden
        filter_info = "Keine Filter (Ad-hoc)"
        if preset:
            filter_info = f"Filter aus Preset '{preset.preset_beschreibung}'"
        
        # 3. Statistik berechnen mit StatistikService
        stats = StatistikService.calculate_stats(
            zeitraum_start=start,
            zeitraum_ende=ende,
            preset=preset
        )
        
        # 4. Ergebnisdatei erstellen
        content = self._format_stats_report(
            titel=serializer.validated_data.get('statistik_titel'),
            start=start,
            ende=ende,
            filter_info=filter_info,
            stats=stats
        )
        
        file_name = f"statistik_{timezone.now().strftime('%Y%m%d_%H%M%S')}.txt"
        file_obj = ContentFile(content.encode('utf-8'), name=file_name)
        
        # 5. Speichern mit Creator und Ergebnisdatei
        serializer.save(creator=self.request.user, ergebnis=file_obj, creation_date=timezone.localdate())
    
    def _format_stats_report(self, titel, start, ende, filter_info, stats):
        """
        Erzeugt einen formatierten Statistikbericht als Textdateiinhalt.

        Parameters
        ----------
        titel : str
            Titel der Statistik, der im Kopf des Berichts ausgegeben wird.
        start : date or datetime
            Startdatum bzw. -zeitpunkt des ausgewerteten Zeitraums.
        ende : date or datetime
            Enddatum bzw. -zeitpunkt des ausgewerteten Zeitraums.
        filter_info : str
            Beschreibung der verwendeten Filterbasis (z.B. Preset-Beschreibung oder Hinweis auf Ad-hoc-Auswertung).
        stats : dict
            Von ``StatistikService.calculate_stats`` berechnete Kennzahlen, aus denen die einzelnen
            Berichtsektionen (z.B. Fallzahlen, Beratungen nach Geschlecht/Art usw.) befüllt werden.

        Returns
        -------
        str
            Vollständig formatierter Berichtstext, der als Inhalt der erzeugten ``.txt``-Datei verwendet wird.
        """
        report = (
            f"Statistik Report\n"
            f"================\n"
            f"Titel: {titel}\n"
            f"Zeitraum: {start} bis {ende}\n"
            f"Basis: {filter_info}\n"
            f"Erstellt am: {timezone.now()}\n"
            f"Erstellt von: {self.request.user}\n\n"
            f"ZUSAMMENFASSUNG\n"
            f"===============\n"
            f"Anzahl Fälle: {stats['total_cases']}\n"
            f"Anzahl Klient:innen: {stats['total_clients']}\n"
            f"Anzahl Beratungen: {stats['total_consultations']}\n"
            f"Anzahl Begleitungen: {stats['total_accompaniments']}\n"
            f"Anzahl Anfragen: {stats['total_inquiries']}\n"
            f"Durchschnittliche Beratungsdauer: {stats['avg_consultation_duration']} Minuten\n"
            f"Dolmetscherstunden gesamt: {stats['total_interpreter_hours']}\n\n"
            f"BERATUNGEN NACH GESCHLECHT\n"
            f"==========================\n"
            f"Gesamt: {stats['consultations_by_gender']['gesamt']}\n"
            f"Weiblich: {stats['consultations_by_gender']['weiblich']}\n"
            f"Männlich: {stats['consultations_by_gender']['maennlich']}\n"
            f"Divers: {stats['consultations_by_gender']['divers']}\n\n"
            f"BERATUNGEN NACH ART\n"
            f"===================\n"
            f"Persönlich: {stats['consultations_by_type']['persoenlich']}\n"
            f"Aufsuchend: {stats['consultations_by_type']['aufsuchend']}\n"
            f"Telefonisch: {stats['consultations_by_type']['telefonisch']}\n"
            f"Online: {stats['consultations_by_type']['online']}\n"
            f"Schriftlich: {stats['consultations_by_type']['schriftlich']}\n\n"
            f"BEGLEITUNGEN NACH INSTITUTION\n"
            f"=============================\n"
            f"Gesamt: {stats['accompaniments_by_institution']['gesamt']}\n"
            f"Gerichte: {stats['accompaniments_by_institution']['gerichte']}\n"
            f"Polizei: {stats['accompaniments_by_institution']['polizei']}\n"
            f"Rechtsanwält:innen: {stats['accompaniments_by_institution']['rechtsanwaelte']}\n"
            f"Ärzt:innen: {stats['accompaniments_by_institution']['aerzte']}\n"
            f"Rechtsmedizin: {stats['accompaniments_by_institution']['rechtsmedizin']}\n"
            f"Jugendamt: {stats['accompaniments_by_institution']['jugendamt']}\n"
            f"Sozialamt: {stats['accompaniments_by_institution']['sozialamt']}\n"
            f"Jobcenter: {stats['accompaniments_by_institution']['jobcenter']}\n"
            f"Sonstige: {stats['accompaniments_by_institution']['sonstige']}\n\n"
            f"KLIENT:INNEN NACH ALTERSGRUPPE\n"
            f"==============================\n"
            f"18-21 Jahre: {stats['clients_by_age_group']['18_21']}\n"
            f"21-27 Jahre: {stats['clients_by_age_group']['21_27']}\n"
            f"27-60 Jahre: {stats['clients_by_age_group']['27_60']}\n"
            f"60+ Jahre: {stats['clients_by_age_group']['60_plus']}\n"
            f"Keine Angabe: {stats['clients_by_age_group']['keine_angabe']}\n\n"
            f"GEWALT STATISTIKEN\n"
            f"==================\n"
            f"Anzeige erstattet: {stats['violence_with_report']['anzeige_ja']}\n"
            f"Keine Anzeige: {stats['violence_with_report']['anzeige_nein']}\n"
            f"Spurensicherung: {stats['violence_with_report']['spurensicherung_ja']}\n"
            f"Mitbetroffene Kinder: {stats['affected_children']['mitbetroffene']}\n"
            f"Direkt betroffene Kinder: {stats['affected_children']['direktbetroffene']}\n\n"
        )
        
        return report

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
