"""
Management Command: init_statistics

Initialisiert Standard-Statistik-Presets basierend auf den Anforderungsdokumenten.
Idempotent - kann mehrfach ausgeführt werden ohne Duplikate zu erstellen.

Verwendung:
    python manage.py init_statistics
"""
from django.core.management.base import BaseCommand
from api.models import Preset


class Command(BaseCommand):
    help = 'Initialisiert Standard-Statistik-Presets aus den Anforderungsdokumenten'

    # Standard-Presets basierend auf:
    # - statistik_bogen.md
    # - statistische_angaben_zu_fachberatungsstellen.md
    STANDARD_PRESETS = [
        # === ANFRAGEN ===
        {
            'preset_beschreibung': 'Anfragen nach Herkunft',
            'preset_daten': {
                'base_model': 'Anfrage',
                'filters': {},
                'group_by': 'anfrage_ort',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Anfragen nach Person',
            'preset_daten': {
                'base_model': 'Anfrage',
                'filters': {},
                'group_by': 'anfrage_person',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Anfragen nach Art',
            'preset_daten': {
                'base_model': 'Anfrage',
                'filters': {},
                'group_by': 'anfrage_art',
                'metric': 'count'
            }
        },
        
        # === KLIENT:INNEN ===
        {
            'preset_beschreibung': 'Altersstruktur Klient:innen',
            'preset_daten': {
                'base_model': 'KlientIn',
                'filters': {},
                'group_by': 'klient_alter',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Geschlechtsidentität Klient:innen',
            'preset_daten': {
                'base_model': 'KlientIn',
                'filters': {},
                'group_by': 'klient_geschlechtsidentitaet',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Wohnort Klient:innen',
            'preset_daten': {
                'base_model': 'KlientIn',
                'filters': {},
                'group_by': 'klient_wohnort',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Migrationshintergrund',
            'preset_daten': {
                'base_model': 'KlientIn',
                'filters': {},
                'group_by': 'klient_migrationshintergrund',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Schwerbehinderung',
            'preset_daten': {
                'base_model': 'KlientIn',
                'filters': {},
                'group_by': 'klient_schwerbehinderung',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Rolle der Klient:innen',
            'preset_daten': {
                'base_model': 'KlientIn',
                'filters': {},
                'group_by': 'klient_rolle',
                'metric': 'count'
            }
        },
        
        # === BERATUNGSTERMINE ===
        {
            'preset_beschreibung': 'Beratungen nach Art',
            'preset_daten': {
                'base_model': 'Beratungstermin',
                'filters': {},
                'group_by': 'beratungsart',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Beratungen nach Beratungsstelle',
            'preset_daten': {
                'base_model': 'Beratungstermin',
                'filters': {},
                'group_by': 'beratungsstelle',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Beratungen nach Status',
            'preset_daten': {
                'base_model': 'Beratungstermin',
                'filters': {},
                'group_by': 'status',
                'metric': 'count'
            }
        },
        
        # === BEGLEITUNGEN ===
        {
            'preset_beschreibung': 'Begleitungen nach Einrichtungsart',
            'preset_daten': {
                'base_model': 'Begleitung',
                'filters': {},
                'group_by': 'begleitungsart',
                'metric': 'count'
            }
        },
        
        # === GEWALTTATEN ===
        {
            'preset_beschreibung': 'Gewalttaten nach Tatort',
            'preset_daten': {
                'base_model': 'Gewalttat',
                'filters': {},
                'group_by': 'tat_ort',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Anzeige erstattet',
            'preset_daten': {
                'base_model': 'Gewalttat',
                'filters': {},
                'group_by': 'tat_anzeige',
                'metric': 'count'
            }
        },
        {
            'preset_beschreibung': 'Anzahl Täter',
            'preset_daten': {
                'base_model': 'Gewalttat',
                'filters': {},
                'group_by': 'tat_anzahl_taeter',
                'metric': 'count'
            }
        },
    ]

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0
        
        for preset_data in self.STANDARD_PRESETS:
            preset, created = Preset.objects.update_or_create(
                preset_beschreibung=preset_data['preset_beschreibung'],
                defaults={
                    'preset_daten': preset_data['preset_daten'],
                    'filterKriterien': {}  # Leeres Dict für Kompatibilität
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"✓ Erstellt: {preset_data['preset_beschreibung']}")
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f"↻ Aktualisiert: {preset_data['preset_beschreibung']}")
                )
        
        self.stdout.write('')
        self.stdout.write(
            self.style.SUCCESS(
                f"Fertig! {created_count} Presets erstellt, {updated_count} aktualisiert."
            )
        )
