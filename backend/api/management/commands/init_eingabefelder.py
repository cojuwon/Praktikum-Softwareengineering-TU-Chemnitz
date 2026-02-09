"""
Management Command: init_eingabefelder

Initialisiert die Eingabefelder (Formular-Konfiguration) für Anfrage und Fall
basierend auf anforderungen/statistik_bogen.md.

Verwendung:
    python manage.py init_eingabefelder
"""
from django.core.management.base import BaseCommand
from api.models import (
    Eingabefeld, Fall, Gewalttat, Gewaltfolge,
    ANFRAGE_PERSON_CHOICES, ANFRAGE_ART_CHOICES, STANDORT_CHOICES,
    JA_NEIN_KA_CHOICES, ANZAHL_VORFAELLE_CHOICES, ANZAHL_TAETER_CHOICES,
    TATORT_CHOICES, ANZEIGE_CHOICES, PSYCH_FOLGEN_CHOICES, KOERPER_FOLGEN_CHOICES
)

class Command(BaseCommand):
    help = 'Initialisiert Eingabefelder für Anfrage und Fall aus den Anforderungsdokumenten'

    def handle(self, *args, **options):
        self.init_anfrage_fields()
        self.init_fall_fields()
        
        self.stdout.write(self.style.SUCCESS("Alle Eingabefelder wurden erfolgreich initialisiert."))

    def _transform_choices(self, choices):
        """Wandelt Django Choices (Tuples) in das Format für Eingabefeld.options um."""
        return [{'value': key, 'label': label} for key, label in choices]

    def init_anfrage_fields(self):
        fields = [
            {
                'name': 'anfrage_weg',
                'label': 'Eingangsweg',
                'typ': 'text',
                'required': False, # "soweit bekannt"
                'sort_order': 10
            },
            {
                'name': 'anfrage_datum',
                'label': 'Datum der Anfrage',
                'typ': 'date',
                'required': True, # sollte gesetzt sein, default ist heute
                'sort_order': 20
            },
            {
                'name': 'anfrage_ort',
                'label': 'Anfrage aus',
                'typ': 'select',
                'options': self._transform_choices(STANDORT_CHOICES),
                'required': False,
                'sort_order': 30
            },
            {
                'name': 'anfrage_person',
                'label': 'Wer hat angefragt',
                'typ': 'select',
                'options': self._transform_choices(ANFRAGE_PERSON_CHOICES),
                'required': False,
                'sort_order': 40
            },
            {
                'name': 'anfrage_art',
                'label': 'Art der Anfrage',
                'typ': 'select',
                'options': self._transform_choices(ANFRAGE_ART_CHOICES),
                'required': False,
                'sort_order': 50
            }
        ]

        self._create_fields('anfrage', fields)

    def init_fall_fields(self):
        # Fall Status Choices aus dem Model holen
        status_field = Fall._meta.get_field('status')
        status_choices = self._transform_choices(status_field.choices)

        fields = [
            {
                'name': 'status',
                'label': 'Status',
                'typ': 'select',
                'options': status_choices,
                'required': True,
                'sort_order': 10
            },
            {
                'name': 'startdatum',
                'label': 'Startdatum',
                'typ': 'date',
                'required': True,
                'sort_order': 20
            },
            {
                'name': 'notizen',
                'label': 'Notizen',
                'typ': 'textarea',
                'required': False,
                'sort_order': 99
            }
        ]
        
        # --- GEWALTTAT ---
        fields.extend([
            {
                'name': 'tat_alter',
                'label': 'Alter zum Tatzeitpunkt (JA/NEIN/KA)',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 30
            },
            {
                'name': 'tat_zeitraum',
                'label': 'Tatzeitraum (JA/NEIN/KA)',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 31
            },
            {
                'name': 'tat_anzahl_vorfaelle',
                'label': 'Anzahl Vorfälle',
                'typ': 'select',
                'options': self._transform_choices(ANZAHL_VORFAELLE_CHOICES),
                'required': False,
                'sort_order': 32
            },
            {
                'name': 'tat_anzahl_taeter_innen',
                'label': 'Anzahl Täter:innen',
                'typ': 'select',
                'options': self._transform_choices(ANZAHL_TAETER_CHOICES),
                'required': False,
                'sort_order': 33
            },
            {
                'name': 'tatort',
                'label': 'Tatort',
                'typ': 'select',
                'options': self._transform_choices(TATORT_CHOICES),
                'required': False,
                'sort_order': 34
            },
            {
                'name': 'tat_anzeige',
                'label': 'Anzeige erstattet?',
                'typ': 'select',
                'options': self._transform_choices(ANZEIGE_CHOICES),
                'required': False,
                'sort_order': 35
            },
            {
                'name': 'tat_medizinische_versorgung',
                'label': 'Medizinische Versorgung erfolgt?',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 36
            },
            {
                'name': 'tat_spurensicherung',
                'label': 'Vertrauliche Spurensicherung?',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 37
            },
            {
                'name': 'tat_art',
                'label': 'Art der Gewalt (Freitext/Mehrfach)',
                'typ': 'text', # oder multiselect wenn wir optionen hätten
                'required': False,
                'sort_order': 38
            },
             {
                'name': 'tat_mitbetroffene_kinder',
                'label': 'Mitbetroffene Kinder (Anzahl)',
                'typ': 'number',
                'required': False,
                'sort_order': 39
            },
            {
                'name': 'tat_direktbetroffene_kinder',
                'label': 'Direkt betroffene Kinder (Anzahl)',
                'typ': 'number',
                'required': False,
                'sort_order': 40
            },
        ])

        # --- GEWALTFOLGE (Besondere Problemlagen) ---
        fields.extend([
            {
                'name': 'psychische_folgen',
                'label': 'Psychische Folgen',
                'typ': 'select',
                'options': self._transform_choices(PSYCH_FOLGEN_CHOICES),
                'required': False,
                'sort_order': 50
            },
            {
                'name': 'koerperliche_folgen',
                'label': 'Körperliche Folgen',
                'typ': 'select',
                'options': self._transform_choices(KOERPER_FOLGEN_CHOICES),
                'required': False,
                'sort_order': 51
            },
            {
                'name': 'finanzielle_folgen',
                'label': 'Finanzielle Folgen?',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 52
            },
            {
                'name': 'arbeitseinschraenkung',
                'label': 'Arbeitseinschränkung?',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 53
            },
            {
                'name': 'verlust_arbeitsstelle',
                'label': 'Verlust Arbeitsstelle?',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 54
            },
            {
                'name': 'soziale_isolation',
                'label': 'Soziale Isolation?',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 55
            },
            {
                'name': 'suizidalitaet',
                'label': 'Suizidalität?',
                'typ': 'select',
                'options': self._transform_choices(JA_NEIN_KA_CHOICES),
                'required': False,
                'sort_order': 56
            },
            {
                'name': 'beeintraechtigungen',
                'label': 'Dauerhafte körperliche Beeinträchtigungen',
                'typ': 'textarea',
                'required': False,
                'sort_order': 57
            },
            {
                'name': 'weiteres',
                'label': 'Weiteres (Besondere Problemlagen)',
                'typ': 'textarea',
                'required': False,
                'sort_order': 58
            }
        ])
        
        # Hinweis: Weitere Felder wie "Besondere Problemlagen" gehören eigentlich zu 
        # KlientIn oder Gewaltfolge, nicht direkt zum Fall-Model. 
        # Hier werden nur direkte Fall-Felder initialisiert.

        self._create_fields('fall', fields)

    def _create_fields(self, context, fields_data):
        created_count = 0
        updated_count = 0

        for data in fields_data:
            name = data.pop('name')
            field, created = Eingabefeld.objects.update_or_create(
                context=context,
                name=name,
                defaults=data
            )
            
            if created:
                created_count += 1
                self.stdout.write(f"  + Erstellt: [{context}] {name} ({data['label']})")
            else:
                updated_count += 1
                self.stdout.write(f"  ~ Aktualisiert: [{context}] {name}")

        self.stdout.write(f"--> {context.capitalize()}: {created_count} erstellt, {updated_count} aktualisiert.\n")
