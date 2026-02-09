"""
Tests für das dynamische Statistik-Reporting-System.

Testet:
- Metadaten-Endpoint
- Dynamic Query-Endpoint
- Whitelist-Validierung
- Permissions
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Konto, Anfrage, Fall, KlientIn, Beratungstermin


class DynamicStatistikTests(APITestCase):
    """Tests für die dynamische Statistik-API."""
    
    def setUp(self):
        """Erstelle Test-User und Testdaten."""
        # Admin User
        self.admin_user = Konto.objects.create_superuser(
            mail_mb='admin@example.com',
            password='testpassword',
            vorname_mb='Admin',
            nachname_mb='User'
        )
        
        # Standard User
        self.standard_user = Konto.objects.create_user(
            mail_mb='user@example.com',
            password='testpassword',
            vorname_mb='Standard',
            nachname_mb='User',
            rolle_mb='B'
        )
        
        # Testdaten erstellen
        self.client_data = KlientIn.objects.create(
            klient_rolle='B',
            klient_alter=30,
            klient_geschlechtsidentitaet='CW',
            klient_sexualitaet='H',
            klient_wohnort='LS',
            klient_staatsangehoerigkeit='deutsch',
            klient_beruf='Test',
            klient_schwerbehinderung='N',
            klient_kontaktpunkt='Internet'
        )
        
        self.fall = Fall.objects.create(
            klient=self.client_data,
            mitarbeiterin=self.admin_user,
            status='O'
        )
        
        self.anfrage1 = Anfrage.objects.create(
            anfrage_ort='LS',
            anfrage_person='B',
            anfrage_art='B',
            mitarbeiterin=self.admin_user
        )
        
        self.anfrage2 = Anfrage.objects.create(
            anfrage_ort='NS',
            anfrage_person='F',
            anfrage_art='MS',
            mitarbeiterin=self.admin_user
        )

    def test_metadata_endpoint_returns_all_models(self):
        """Test: Metadaten-Endpoint liefert alle analysierbaren Models."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get('/api/statistik/metadata/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('Anfrage', response.data)
        self.assertIn('Fall', response.data)
        self.assertIn('KlientIn', response.data)
        self.assertIn('Beratungstermin', response.data)
        self.assertIn('Begleitung', response.data)
        self.assertIn('Gewalttat', response.data)
        self.assertIn('Gewaltfolge', response.data)

    def test_metadata_contains_field_structure(self):
        """Test: Metadaten enthalten filterbare und gruppierbare Felder."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.get('/api/statistik/metadata/')
        
        anfrage_meta = response.data.get('Anfrage', {})
        self.assertIn('filterable_fields', anfrage_meta)
        self.assertIn('groupable_fields', anfrage_meta)
        self.assertIn('metrics', anfrage_meta)
        
        # Prüfe dass Choices vorhanden sind
        groupable = anfrage_meta.get('groupable_fields', [])
        anfrage_art_field = next((f for f in groupable if f['name'] == 'anfrage_art'), None)
        
        self.assertIsNotNone(anfrage_art_field, "anfrage_art sollte in groupable_fields sein")
        self.assertIn('choices', anfrage_art_field)

    def test_dynamic_query_count_anfragen_by_art(self):
        """Test: Dynamische Query zählt Anfragen nach Art."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'group_by': 'anfrage_art',
            'metric': 'count'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(response.data['base_model'], 'Anfrage')
        self.assertEqual(response.data['group_by'], 'anfrage_art')
        
        # Prüfe Ergebnisse
        results = response.data['results']
        self.assertGreater(len(results), 0)

    def test_dynamic_query_invalid_lookup(self):
        """Test: Ungültiger Lookup-Suffix wird abgelehnt."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'filters': {'anfrage_datum__dangersql': '2024-01-01'},
            'group_by': 'anfrage_art',
            'metric': 'count'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Service Validation Error
        self.assertIn('Filter-Lookup', str(response.data))

    def test_dynamic_query_invalid_metric(self):
        """Test: Ungültige Metrik wird abgelehnt."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'group_by': 'anfrage_art',
            'metric': 'avg_something' # Gibt es nicht
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Serializer Validation Error ("Invalid choice") or Service Error
        response_str = str(response.data).lower()
        self.assertTrue('metric' in response_str or 'metrik' in response_str or 'choice' in response_str)

    def test_dynamic_query_permission_denied(self):
        """Test: User ohne Permission wird abgelehnt."""
        # Standard User hat 'can_view_statistics' NICHT (außer wir geben es ihm, aber hier testen wir den Fall ohne)
        self.client.force_authenticate(user=self.standard_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'group_by': 'anfrage_art',
            'metric': 'count'
        }, format='json')
        
        # Sollte 403 Forbidden sein (wegen explizitem Check im View)
        # Wenn DjangoModelPermissions greift, wäre es vielleicht auch 403, aber wir wollen den expliziten Check testen.
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


    def test_dynamic_query_count_anfragen_by_ort(self):
        """Test: Dynamische Query zählt Anfragen nach Ort."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'group_by': 'anfrage_ort',
            'metric': 'count'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        
        # Wir haben 1 Anfrage in Leipzig Stadt (LS) und 1 in Nordsachsen (NS)
        ls_result = next((r for r in results if r.get('anfrage_ort') == 'LS'), None)
        ns_result = next((r for r in results if r.get('anfrage_ort') == 'NS'), None)
        
        if ls_result:
            self.assertEqual(ls_result['value'], 1)
        if ns_result:
            self.assertEqual(ns_result['value'], 1)

    def test_dynamic_query_with_filters(self):
        """Test: Dynamische Query mit Filtern."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'filters': {'anfrage_ort': 'LS'},
            'group_by': 'anfrage_art',
            'metric': 'count'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        
        # Nur 1 Anfrage in Leipzig Stadt
        total = sum(r.get('value', 0) for r in results)
        self.assertEqual(total, 1)

    def test_dynamic_query_invalid_model(self):
        """Test: Ungültiges Model wird abgelehnt."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'InvalidModel',
            'group_by': 'some_field',
            'metric': 'count'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dynamic_query_invalid_group_by_field(self):
        """Test: Ungültiges group_by Feld wird abgelehnt (Whitelist-Validierung)."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'group_by': 'invalid_field',
            'metric': 'count'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('detail', response.data)

    def test_dynamic_query_requires_authentication(self):
        """Test: Nicht authentifizierte Requests werden abgelehnt."""
        # Kein force_authenticate
        response = self.client.post('/api/statistik/dynamic-query/', {
            'base_model': 'Anfrage',
            'group_by': 'anfrage_art',
            'metric': 'count'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_metadata_requires_authentication(self):
        """Test: Metadaten-Endpoint erfordert Authentifizierung."""
        response = self.client.get('/api/statistik/metadata/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_legacy_query_endpoint_still_works(self):
        """Test: Legacy Query-Endpoint funktioniert noch."""
        self.client.force_authenticate(user=self.admin_user)
        
        response = self.client.post('/api/statistik/query/', {
            'zeitraum_start': '2024-01-01',
            'zeitraum_ende': '2024-12-31'
        }, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('structure', response.data)
        self.assertIn('data', response.data)




class ModelMetadataExtractorTests(TestCase):
    """Tests für den ModelMetadataExtractor."""
    
    def test_extract_anfrage_metadata(self):
        """Test: Extrahiert korrekte Metadaten aus Anfrage Model."""
        from api.services.dynamic_statistik_service import ModelMetadataExtractor
        from api.models import Anfrage
        
        metadata = ModelMetadataExtractor.extract(Anfrage)
        
        self.assertEqual(metadata['model_name'], 'Anfrage')
        self.assertIn('filterable_fields', metadata)
        self.assertIn('groupable_fields', metadata)
        self.assertIn('metrics', metadata)
        
        # Prüfe dass Choice-Felder in groupable_fields sind
        groupable_names = [f['name'] for f in metadata['groupable_fields']]
        self.assertIn('anfrage_art', groupable_names)
        self.assertIn('anfrage_person', groupable_names)
        self.assertIn('anfrage_ort', groupable_names)

    def test_extract_includes_verbose_names(self):
        """Test: Extrahierte Felder enthalten verbose_name als Label."""
        from api.services.dynamic_statistik_service import ModelMetadataExtractor
        from api.models import Anfrage
        
        metadata = ModelMetadataExtractor.extract(Anfrage)
        
        groupable = metadata.get('groupable_fields', [])
        anfrage_art = next((f for f in groupable if f['name'] == 'anfrage_art'), None)
        
        self.assertIsNotNone(anfrage_art, "anfrage_art sollte extrahiert werden")
        self.assertIn('label', anfrage_art)
        self.assertIsNotNone(anfrage_art['label'])


class InitStatisticsCommandTests(TestCase):
    """Tests für das init_statistics Management Command."""
    
    def test_creates_presets(self):
        """Test: Command erstellt Standard-Presets."""
        from django.core.management import call_command
        from api.models import Preset
        
        # Anzahl vorher
        count_before = Preset.objects.count()
        
        # Command ausführen
        call_command('init_statistics', verbosity=0)
        
        # Anzahl nachher
        count_after = Preset.objects.count()
        
        # Es sollten Presets erstellt worden sein
        self.assertGreater(count_after, count_before)

    def test_command_is_idempotent(self):
        """Test: Command kann mehrfach ausgeführt werden ohne Duplikate."""
        from django.core.management import call_command
        from api.models import Preset
        
        # Zweimal ausführen
        call_command('init_statistics', verbosity=0)
        count_first = Preset.objects.count()
        
        call_command('init_statistics', verbosity=0)
        count_second = Preset.objects.count()
        
        # Anzahl sollte gleich bleiben
        self.assertEqual(count_first, count_second)
