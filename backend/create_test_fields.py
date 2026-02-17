import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Eingabefeld

# Create a test dynamic field for KlientIn
field, created = Eingabefeld.objects.get_or_create(
    name='klient_verein',
    context='klient',
    defaults={
        'label': 'Verein / Organisation',
        'typ': 'text',
        'required': False,
        'sort_order': 120
    }
)

if created:
    print(f"Created dynamic field: {field.label}")
else:
    print(f"Field already exists: {field.label}")

# Create another one
field2, created2 = Eingabefeld.objects.get_or_create(
    name='klient_zusatzinfo',
    context='klient',
    defaults={
        'label': 'Zusatzinfo',
        'typ': 'textarea',
        'required': False,
        'sort_order': 130
    }
)

if created2:
    print(f"Created dynamic field: {field2.label}")
else:
    print(f"Field already exists: {field2.label}")
