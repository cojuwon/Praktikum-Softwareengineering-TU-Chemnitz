"""
Tests für die überarbeiteten Status-Felder.

Testet:
- Fall: 'Gelöscht' (G) ist kein gültiger Status mehr
- Fall: Nur 'O', 'L', 'A' sind gültige Status-Werte
- Anfrage: Neues Status-Feld mit Choices AN, TV, A
- Anfrage: Status-Filterung über API
"""

from rest_framework import status

from api.models import Fall, Anfrage, KlientIn
from api.tests.base import APITestCase


class FallStatusTests(APITestCase):
    """Tests für die überarbeiteten Fall-Status-Choices."""

    def setUp(self):
        super().setUp()
        self.klient = KlientIn.objects.create(
            klient_rolle='B',
            klient_geschlechtsidentitaet='K',
            klient_sexualitaet='K',
            klient_wohnort='LS',
        )

    def test_fall_valid_statuses(self):
        """Prüft, dass O, L, A gültige Status-Werte sind."""
        self.authenticate_as_basis()
        for code in ['O', 'L', 'A']:
            fall = Fall.objects.create(
                klient=self.klient,
                mitarbeiterin=self.basis_user,
                status=code
            )
            self.assertEqual(fall.status, code)

    def test_fall_default_status_is_offen(self):
        """Prüft, dass der Default-Status 'O' (Offen) ist."""
        fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.basis_user
        )
        self.assertEqual(fall.status, 'O')

    def test_fall_geloescht_not_in_choices(self):
        """Prüft, dass 'G' (Gelöscht) nicht mehr in den Status-Choices ist."""
        choices = dict(Fall._meta.get_field('status').choices)
        self.assertNotIn('G', choices)
        self.assertIn('O', choices)
        self.assertIn('L', choices)
        self.assertIn('A', choices)

    def test_create_fall_with_valid_status_via_api(self):
        """Prüft Erstellung eines Falls mit gültigem Status über die API."""
        self.authenticate_as_basis()
        url = '/api/faelle/'
        data = {'klient': self.klient.pk, 'status': 'L', 'startdatum': '2025-01-01'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'L')

    def test_create_fall_with_geloescht_status_rejected(self):
        """Prüft, dass Erstellung eines Falls mit Status 'G' abgelehnt wird."""
        self.authenticate_as_basis()
        url = '/api/faelle/'
        data = {'klient': self.klient.pk, 'status': 'G', 'startdatum': '2025-01-01'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AnfrageStatusTests(APITestCase):
    """Tests für das neue Anfrage-Status-Feld."""

    def setUp(self):
        super().setUp()
        self.valid_data = {
            'anfrage_weg': 'Telefon',
            'anfrage_ort': 'LS',
            'anfrage_person': 'B',
            'anfrage_art': 'B',
        }

    def test_anfrage_default_status_is_anfrage(self):
        """Prüft, dass der Default-Status 'AN' (Anfrage) ist."""
        self.authenticate_as_basis()
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        anfrage = Anfrage.objects.get(anfrage_id=response.data['anfrage_id'])
        self.assertEqual(anfrage.status, 'AN')

    def test_anfrage_status_display_in_response(self):
        """Prüft, dass status_display im API-Response enthalten ist."""
        self.authenticate_as_basis()
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('status', response.data)
        self.assertIn('status_display', response.data)
        self.assertEqual(response.data['status'], 'AN')
        self.assertEqual(response.data['status_display'], 'Anfrage')

    def test_anfrage_create_with_explicit_status(self):
        """Prüft Erstellung einer Anfrage mit explizitem Status."""
        self.authenticate_as_basis()
        data = {**self.valid_data, 'status': 'TV'}
        response = self.client.post('/api/anfragen/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'TV')
        self.assertEqual(response.data['status_display'], 'Termin vereinbart')

    def test_anfrage_update_status(self):
        """Prüft, dass der Status einer Anfrage aktualisiert werden kann."""
        self.authenticate_as_basis()
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        anfrage_id = response.data['anfrage_id']

        update_data = {'status': 'TV'}
        response = self.client.patch(f'/api/anfragen/{anfrage_id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'TV')

    def test_anfrage_invalid_status_rejected(self):
        """Prüft, dass ungültige Status-Werte abgelehnt werden."""
        self.authenticate_as_basis()
        data = {**self.valid_data, 'status': 'INVALID'}
        response = self.client.post('/api/anfragen/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_anfrage_valid_status_choices(self):
        """Prüft, dass die Status-Choices korrekt sind."""
        choices = dict(Anfrage._meta.get_field('status').choices)
        self.assertIn('AN', choices)
        self.assertIn('TV', choices)
        self.assertIn('A', choices)
        self.assertEqual(choices['AN'], 'Anfrage')
        self.assertEqual(choices['TV'], 'Termin vereinbart')
        self.assertEqual(choices['A'], 'Abgeschlossen')

    def test_anfrage_filter_by_status(self):
        """Prüft, dass Anfragen nach Status gefiltert werden können."""
        self.authenticate_as_basis()

        # Erstelle Anfragen mit verschiedenen Status
        self.client.post('/api/anfragen/', {**self.valid_data, 'status': 'AN'}, format='json')
        self.client.post('/api/anfragen/', {**self.valid_data, 'status': 'TV'}, format='json')
        self.client.post('/api/anfragen/', {**self.valid_data, 'status': 'A'}, format='json')

        # Filter nach AN
        response = self.client.get('/api/anfragen/?status=AN')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        for item in data:
            self.assertEqual(item['status'], 'AN')

    def test_anfrage_filter_by_multiple_statuses(self):
        """Prüft, dass Anfragen nach mehreren Status gefiltert werden können."""
        self.authenticate_as_basis()

        self.client.post('/api/anfragen/', {**self.valid_data, 'status': 'AN'}, format='json')
        self.client.post('/api/anfragen/', {**self.valid_data, 'status': 'TV'}, format='json')
        self.client.post('/api/anfragen/', {**self.valid_data, 'status': 'A'}, format='json')

        # Filter nach AN,TV
        response = self.client.get('/api/anfragen/?status=AN,TV')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data if isinstance(response.data, list) else response.data.get('results', [])
        for item in data:
            self.assertIn(item['status'], ['AN', 'TV'])
