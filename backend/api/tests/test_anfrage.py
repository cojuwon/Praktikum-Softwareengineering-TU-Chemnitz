"""
Tests für den Anfrage ViewSet (POST/GET /api/anfragen/).

Testet:
- CRUD-Operationen
- Permission-Enforcement
- Nested Beratungstermin-Erstellung
- Queryset-Filterung (eigene vs. alle Daten)
"""

from rest_framework import status

from api.models import Anfrage
from api.tests.base import APITestCase


class AnfrageCreateTestCase(APITestCase):
    """Tests für das Erstellen von Anfragen (POST /api/anfragen/)."""
    
    def setUp(self):
        super().setUp()
        # Standard-Payload für gültige Anfrage
        self.valid_data = {
            'anfrage_weg': 'Telefon',
            'anfrage_ort': 'LS',       # Leipzig Stadt
            'anfrage_person': 'B',      # Betroffene:r
            'anfrage_art': 'B',         # Beratungsbedarf
        }
    
    def test_basis_user_can_create_anfrage(self):
        """Basis-User mit add_anfrage Permission kann Anfrage erstellen."""
        self.authenticate_as_basis()
        
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('anfrage_id', response.data)
        
        # Prüfe, dass mitarbeiterin automatisch gesetzt wurde
        anfrage = Anfrage.objects.get(anfrage_id=response.data['anfrage_id'])
        self.assertEqual(anfrage.mitarbeiterin, self.basis_user)
    
    def test_mitarbeiterin_cannot_be_manipulated(self):
        """Client kann mitarbeiterin nicht manipulieren - wird auf request.user gesetzt."""
        self.authenticate_as_basis()
        
        # Versuche, eine andere mitarbeiterin zu setzen
        manipulated_data = self.valid_data.copy()
        manipulated_data['mitarbeiterin'] = self.admin_user.id
        
        response = self.client.post('/api/anfragen/', manipulated_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # mitarbeiterin sollte trotzdem der eingeloggte User sein
        anfrage = Anfrage.objects.get(anfrage_id=response.data['anfrage_id'])
        self.assertEqual(anfrage.mitarbeiterin, self.basis_user)
        self.assertNotEqual(anfrage.mitarbeiterin, self.admin_user)
    
    def test_create_anfrage_with_beratungstermin(self):
        """Anfrage kann zusammen mit einem Beratungstermin erstellt werden (nested)."""
        self.authenticate_as_basis()
        
        data_with_termin = self.valid_data.copy()
        data_with_termin['beratungstermin_data'] = {
            'beratungsstelle': 'LS',
            'anzahl_beratungen': 1,
            'termin_beratung': '2026-01-15',
            'beratungsart': 'P',
        }
        
        response = self.client.post('/api/anfragen/', data_with_termin, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Prüfe, dass Beratungstermin erstellt und verknüpft wurde
        anfrage = Anfrage.objects.get(anfrage_id=response.data['anfrage_id'])
        self.assertIsNotNone(anfrage.beratungstermin)
        self.assertEqual(anfrage.beratungstermin.beratungsstelle, 'LS')
        self.assertEqual(anfrage.beratungstermin.beratungsart, 'P')


class AnfragePermissionTestCase(APITestCase):
    """Tests für Permission-Enforcement bei Anfragen."""
    
    def setUp(self):
        super().setUp()
        self.valid_data = {
            'anfrage_weg': 'Telefon',
            'anfrage_ort': 'LS',
            'anfrage_person': 'B',
            'anfrage_art': 'B',
        }
    
    def test_unauthenticated_user_gets_401(self):
        """Nicht eingeloggte User erhalten 401 Unauthorized."""
        self.logout()
        
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_user_without_permission_gets_403(self):
        """User ohne add_anfrage Permission erhält 403 Forbidden."""
        self.authenticate_as_no_perm()
        
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_admin_can_view_all_anfragen(self):
        """Admin-User kann alle Anfragen sehen, nicht nur eigene."""
        # Basis-User erstellt Anfrage
        self.authenticate_as_basis()
        self.client.post('/api/anfragen/', self.valid_data, format='json')
        
        # Admin sollte sie sehen können
        self.authenticate_as_admin()
        response = self.client.get('/api/anfragen/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_basis_user_sees_only_own_anfragen(self):
        """Basis-User sieht nur seine eigenen Anfragen."""
        # Basis-User erstellt Anfrage
        self.authenticate_as_basis()
        self.client.post('/api/anfragen/', self.valid_data, format='json')
        
        # Admin erstellt auch eine Anfrage
        self.authenticate_as_admin()
        self.client.post('/api/anfragen/', self.valid_data, format='json')
        
        # Basis-User sollte nur seine eigene sehen
        self.authenticate_as_basis()
        response = self.client.get('/api/anfragen/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['mitarbeiterin'], self.basis_user.id)


class AnfrageValidationTestCase(APITestCase):
    """Tests für Eingabe-Validierung bei Anfragen."""
    
    def setUp(self):
        super().setUp()
        self.valid_data = {
            'anfrage_weg': 'Telefon',
            'anfrage_ort': 'LS',
            'anfrage_person': 'B',
            'anfrage_art': 'B',
        }
    
    def test_invalid_enum_returns_400(self):
        """Ungültige Enum-Werte führen zu 400 Bad Request."""
        self.authenticate_as_basis()
        
        invalid_data = self.valid_data.copy()
        invalid_data['anfrage_ort'] = 'INVALID'
        
        response = self.client.post('/api/anfragen/', invalid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_missing_required_field_returns_400(self):
        """Fehlende Pflichtfelder führen zu 400 Bad Request."""
        self.authenticate_as_basis()
        
        incomplete_data = {'anfrage_weg': 'Telefon'}
        
        response = self.client.post('/api/anfragen/', incomplete_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
