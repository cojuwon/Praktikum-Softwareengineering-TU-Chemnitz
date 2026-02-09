"""
Management Command: init_eingabefelder

Initialisiert die Eingabefelder (Formular-Konfiguration) für Anfrage und Fall
basierend auf anforderungen/statistik_bogen.md.

Verwendung:
    python manage.py init_eingabefelder
"""
from django.core.management.base import BaseCommand
from api.models import Eingabefeld, Fall, ANFRAGE_PERSON_CHOICES, ANFRAGE_ART_CHOICES, STANDORT_CHOICES

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
