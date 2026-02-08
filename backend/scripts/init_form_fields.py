import os
import django
import sys

# Setup Django environment
sys.path.append('/app')  # Adjust path if needed for Docker
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Eingabefeld, STANDORT_CHOICES, ANFRAGE_PERSON_CHOICES, ANFRAGE_ART_CHOICES

def init_fields():
    print("Initializing Eingabefeld entries...")
    
    # Clear existing entries? Or just update/create?
    # Let's clear to ensure clean state as per plan
    Eingabefeld.objects.all().delete()
    
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
        Eingabefeld.objects.create(options=options, context="anfrage", **f)
        print(f"Created field: {f['label']}")

    print("Done.")

if __name__ == '__main__':
    init_fields()
