from django.urls import reverse
from rest_framework import status
from api.models import Eingabefeld
from api.tests.base import APITestCase

class EingabefeldTests(APITestCase):
    def setUp(self):
        super().setUp()
        
        # Eingabefelder erstellen
        self.feld_text = Eingabefeld.objects.create(
            name='Test Text',
            typ='Text',
            wert=''
        )
        self.feld_zahl = Eingabefeld.objects.create(
            name='Test Zahl',
            typ='Zahl',
            wert=''
        )
        self.feld_datum = Eingabefeld.objects.create(
            name='Test Datum',
            typ='Datum',
            wert=''
        )

    def test_set_value_text_success(self):
        """Testet das Setzen eines Text-Wertes."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('eingabefeld-set-value', kwargs={'pk': self.feld_text.pk})
        data = {'wert': 'Hallo Welt'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.feld_text.refresh_from_db()
        self.assertEqual(self.feld_text.wert, 'Hallo Welt')

    def test_set_value_zahl_success(self):
        """Testet das Setzen eines numerischen Wertes."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('eingabefeld-set-value', kwargs={'pk': self.feld_zahl.pk})
        data = {'wert': '42.5'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.feld_zahl.refresh_from_db()
        self.assertEqual(self.feld_zahl.wert, '42.5')

    def test_set_value_datum_success(self):
        """Testet das Setzen eines Datums."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('eingabefeld-set-value', kwargs={'pk': self.feld_datum.pk})
        data = {'wert': '2023-12-31'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.feld_datum.refresh_from_db()
        self.assertEqual(self.feld_datum.wert, '2023-12-31')

    def test_set_value_invalid_type_zahl(self):
        """Testet Validierung: Text in Zahl-Feld."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('eingabefeld-set-value', kwargs={'pk': self.feld_zahl.pk})
        data = {'wert': 'Keine Zahl'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_value_invalid_type_datum(self):
        """Testet Validierung: Ungültiges Datum."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('eingabefeld-set-value', kwargs={'pk': self.feld_datum.pk})
        data = {'wert': '31.02.2023'} # 31. Februar gibt es nicht
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_set_value_forbidden(self):
        """Testet Zugriffsschutz."""
        self.client.force_authenticate(user=self.no_perm_user)
        
        url = reverse('eingabefeld-set-value', kwargs={'pk': self.feld_text.pk})
        data = {'wert': 'Hacker'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_value_text(self):
        """Testet das Lesen eines Text-Wertes."""
        self.client.force_authenticate(user=self.basis_user)
        self.feld_text.wert = "Test Inhalt"
        self.feld_text.save()
        
        url = reverse('eingabefeld-get-value', kwargs={'pk': self.feld_text.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wert'], "Test Inhalt")
        self.assertEqual(response.data['typ'], "Text")

    def test_get_value_zahl_int(self):
        """Testet das Lesen eines Integer-Wertes."""
        self.client.force_authenticate(user=self.basis_user)
        self.feld_zahl.wert = "42"
        self.feld_zahl.save()
        
        url = reverse('eingabefeld-get-value', kwargs={'pk': self.feld_zahl.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wert'], 42)
        self.assertIsInstance(response.data['wert'], int)

    def test_get_value_zahl_float(self):
        """Testet das Lesen eines Float-Wertes."""
        self.client.force_authenticate(user=self.basis_user)
        self.feld_zahl.wert = "42.5"
        self.feld_zahl.save()
        
        url = reverse('eingabefeld-get-value', kwargs={'pk': self.feld_zahl.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wert'], 42.5)
        self.assertIsInstance(response.data['wert'], float)

    def test_get_value_datum(self):
        """Testet das Lesen eines Datums."""
        self.client.force_authenticate(user=self.basis_user)
        self.feld_datum.wert = "2023-12-31"
        self.feld_datum.save()
        
        url = reverse('eingabefeld-get-value', kwargs={'pk': self.feld_datum.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['wert'], "2023-12-31")

    def test_get_value_empty(self):
        """Testet das Lesen eines leeren Wertes."""
        self.client.force_authenticate(user=self.basis_user)
        self.feld_text.wert = ""
        self.feld_text.save()
        
        url = reverse('eingabefeld-get-value', kwargs={'pk': self.feld_text.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['wert'])
