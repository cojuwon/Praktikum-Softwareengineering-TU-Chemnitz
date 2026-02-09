"""Tests für Preset-Erstellung und Validierung."""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Konto, Preset

class PresetCreationTests(APITestCase):
    def setUp(self):
        self.user = Konto.objects.create_user(
            mail_mb='user@example.com',
            password='testpassword',
            vorname_mb='Test',
            nachname_mb='User',
            rolle_mb='B'
        )
        self.client.force_authenticate(user=self.user)
        
        # Berechtigungen hinzufügen
        from django.contrib.auth.models import Permission
        permission = Permission.objects.get(codename='add_preset')
        self.user.user_permissions.add(permission)

    def test_create_valid_preset(self):
        """Test: Gültiges Preset kann erstellt werden."""
        data = {
            'preset_beschreibung': 'Test Preset',
            'preset_daten': {
                'base_model': 'Anfrage',
                'group_by': 'anfrage_art',
                'metric': 'count'
            }
        }
        response = self.client.post('/api/presets/', data, format='json')
        if response.status_code != status.HTTP_201_CREATED:
            print(f"\nDEBUG: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['ersteller'], self.user.id)

    def test_create_invalid_preset_data(self):
        """Test: Ungültige Statistik-Daten werden abgelehnt."""
        data = {
            'preset_beschreibung': 'Invalid Preset',
            'preset_daten': {
                'base_model': 'InvalidModel',  # Ungültig
                'group_by': 'invalid_field',
                'metric': 'count'
            }
        }
        response = self.client.post('/api/presets/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Die Fehlermeldung sollte 'preset_daten' enthalten
        self.assertIn('preset_daten', response.data)
