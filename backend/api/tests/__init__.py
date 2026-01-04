"""
=============================================================================
API Test Suite
=============================================================================

Dieses Paket enthält alle Tests für die API-Anwendung.

AUSFÜHRUNG
----------
Alle Tests ausführen:
    docker compose exec api python manage.py test api.tests -v 2

Einzelnes Test-Modul ausführen:
    docker compose exec api python manage.py test api.tests.test_anfrage -v 2

Einzelne Test-Klasse ausführen:
    docker compose exec api python manage.py test api.tests.test_anfrage.AnfrageViewSetTestCase -v 2

Einzelnen Test ausführen:
    docker compose exec api python manage.py test api.tests.test_anfrage.AnfrageViewSetTestCase.test_basis_user_can_create_anfrage -v 2

Mit Coverage-Report:
    docker compose exec api coverage run --source='api' manage.py test api.tests
    docker compose exec api coverage report


STRUKTUR
--------
tests/
├── __init__.py              # Diese Datei (Re-Exports + Dokumentation)
├── base.py                  # Basis-Klassen und Fixtures für alle Tests
├── test_anfrage.py          # Tests für Anfrage ViewSet
├── test_auth.py             # Tests für Authentifizierung & Permissions
├── test_begleitung.py       # Tests für Begleitung ViewSet
├── test_beratungstermin.py  # Tests für Beratungstermin ViewSet
├── test_fall.py             # Tests für Fall ViewSet
├── test_gewaltfolge.py      # Tests für Gewaltfolge ViewSet
├── test_gewalttat.py        # Tests für Gewalttat ViewSet
├── test_klient.py           # Tests für KlientIn ViewSet
├── test_preset.py           # Tests für Preset ViewSet
└── test_statistik.py        # Tests für Statistik ViewSet


NEUE TESTS HINZUFÜGEN
---------------------
1. Erstelle eine neue Datei: api/tests/test_<feature>.py

2. Importiere die Basis-Klasse:
   
       from api.tests.base import APITestCase
   
3. Erstelle deine Test-Klasse:

       class MeinFeatureTestCase(APITestCase):
           '''Tests für mein Feature.'''
           
           def test_mein_erster_test(self):
               '''Beschreibung was getestet wird.'''
               self.client.force_authenticate(user=self.basis_user)
               response = self.client.get('/api/mein-endpoint/')
               self.assertEqual(response.status_code, 200)

4. Füge den Import in dieser __init__.py hinzu:

       from .test_mein_feature import *

5. Führe die Tests aus:

       docker compose exec api python manage.py test api.tests.test_mein_feature -v 2


VERFÜGBARE FIXTURES (via APITestCase)
-------------------------------------
- self.basis_user     : User mit Gruppe "Basis" (view, add, change)
- self.erweiterung_user: User mit Gruppe "Erweiterung" (+ delete, export)  
- self.admin_user     : User mit Gruppe "Admin" (alle Rechte)
- self.no_perm_user   : User ohne Gruppe (keine Permissions)
- self.client         : APIClient für HTTP-Requests


NÜTZLICHE ASSERTIONS
--------------------
- self.assertEqual(response.status_code, 200)
- self.assertIn('field_name', response.data)
- self.assertContains(response, 'text')
- self.assertIsNotNone(obj.field)


BEST PRACTICES
--------------
1. Ein Test pro Verhalten (nicht mehrere Assertions für verschiedene Dinge)
2. Aussagekräftige Namen: test_<was>_<unter_welchen_umständen>_<erwartetes_ergebnis>
3. Docstrings für jeden Test (werden bei -v 2 angezeigt)
4. setUp() für gemeinsame Testdaten, nicht in jedem Test
5. Keine Abhängigkeiten zwischen Tests (Reihenfolge egal)
"""

# Re-Export aller Test-Module für einfache Discovery
from .test_anfrage import *
from .test_auth import *

# Zukünftige Tests hier importieren:
# from .test_fall import *
# from .test_beratungstermin import *
# from .test_klient import *
# from .test_begleitung import *
# from .test_gewalttat import *
# from .test_gewaltfolge import *
# from .test_preset import *
# from .test_statistik import *
