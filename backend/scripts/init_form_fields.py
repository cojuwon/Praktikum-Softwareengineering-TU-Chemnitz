import os
import django
import sys

# Setup Django environment
sys.path.append('/app')  # Adjust path if needed for Docker
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Eingabefeld, STANDORT_CHOICES, ANFRAGE_PERSON_CHOICES, ANFRAGE_ART_CHOICES

def init_fields():
    print("Initializing Eingabefeld entries (idempotent)...")
    
    fields = [
        {
            "name": "anfrage_weg",
            "label": "Anfrageweg",
            "typ": "textarea",
            "required": True,
            "sort_order": 1,
        },
        {
            "name": "anfrage_datum",
            "label": "Datum der Anfrage",
            "typ": "date",
            "required": True,
            "sort_order": 2,
        },
        {
            "name": "anfrage_ort",
            "label": "Anfrage Ort",
            "typ": "select",
            "required": True,
            "sort_order": 3,
            "options": [{"value": c[0], "label": c[1]} for c in STANDORT_CHOICES],
        },
        {
            "name": "anfrage_person",
            "label": "Anfragende Person",
            "typ": "select",
            "required": True,
            "sort_order": 4,
            "options": [{"value": c[0], "label": c[1]} for c in ANFRAGE_PERSON_CHOICES],
        },
        {
            "name": "anfrage_art",
            "label": "Anfrage Art",
            "typ": "select",
            "required": True,
            "sort_order": 5,
            "options": [{"value": c[0], "label": c[1]} for c in ANFRAGE_ART_CHOICES],
        },
    ]

    for f in fields:
        options = f.pop('options', list())
        obj, created = Eingabefeld.objects.update_or_create(
            name=f['name'],
            context="anfrage",
            defaults={
                'label': f['label'],
                'typ': f['typ'],
                'required': f['required'],
                'sort_order': f['sort_order'],
                'options': options,
            }
        )
        action = "Created" if created else "Updated"
        print(f"{action} field: {f['label']}")

    print("Done.")

if __name__ == '__main__':
    init_fields()

