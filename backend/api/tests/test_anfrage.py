"""
Tests für den Anfrage ViewSet (POST/GET /api/anfragen/).

Testet:
- CRUD-Operationen
- Permission-Enforcement
- Nested Beratungstermin-Erstellung
- Queryset-Filterung (eigene vs. alle Daten)
- Update-Logik (anfrageBearbeiten)
"""

from rest_framework import status

from api.models import Anfrage
from api.tests.base import APITestCase


class AnfrageCustomActionsTestCase(APITestCase):
    """Tests für Custom Actions (assign_employee, create_consultation)."""
    
    def setUp(self):
        super().setUp()
        self.anfrage = Anfrage.objects.create(
            anfrage_weg="Telefon",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            mitarbeiterin=self.basis_user
        )
        self.detail_url = f'/api/anfragen/{self.anfrage.pk}/'
        self.valid_data = {
            "anfrage_weg": "E-Mail",
            "anfrage_ort": "LS",
            "anfrage_person": "B",
            "anfrage_art": "B",
            "mitarbeiterin": self.basis_user.pk
        }

    def test_assign_employee(self):
        """Test assigning an employee to an inquiry."""
        self.authenticate_as_basis()
        url = f'{self.detail_url}assign-employee/'
        
        response = self.client.post(url, {'user_id': self.erweiterung_user.pk}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.anfrage.refresh_from_db()
        self.assertEqual(self.anfrage.mitarbeiterin, self.erweiterung_user)

    def test_create_consultation(self):
        """Test creating a consultation from an inquiry."""
        self.authenticate_as_basis()
        url = f'{self.detail_url}create-consultation/'
        
        data = {
            "beratungsstelle": "LS",
            "termin_beratung": "2023-12-01",
            "beratungsart": "P",
            "anzahl_beratungen": 1
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.anfrage.refresh_from_db()
        self.assertIsNotNone(self.anfrage.beratungstermin)
        self.assertEqual(str(self.anfrage.beratungstermin.termin_beratung), "2023-12-01")
    
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


class AnfrageUpdateTestCase(APITestCase):
    """
    Tests für das Bearbeiten von Anfragen (PUT/PATCH /api/anfragen/{id}/).
    
    Implementiert Tests für die UML-Methode anfrageBearbeiten().
    """
    
    def setUp(self):
        super().setUp()
        self.valid_data = {
            'anfrage_weg': 'Telefon',
            'anfrage_ort': 'LS',
            'anfrage_person': 'B',
            'anfrage_art': 'B',
        }
        
        # Erstelle eine Anfrage für Basis-User
        self.authenticate_as_basis()
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        self.basis_anfrage_id = response.data['anfrage_id']
        
        # Erstelle eine Anfrage für Admin-User
        self.authenticate_as_admin()
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        self.admin_anfrage_id = response.data['anfrage_id']
    
    def test_basis_user_can_update_own_anfrage(self):
        """Basis-User kann seine eigene Anfrage bearbeiten (change_anfrage Permission)."""
        self.authenticate_as_basis()
        
        update_data = {'anfrage_weg': 'E-Mail', 'anfrage_art': 'R'}  # Änderung auf rechtliche Fragen
        
        response = self.client.patch(
            f'/api/anfragen/{self.basis_anfrage_id}/',
            update_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Prüfe, dass die Änderungen übernommen wurden
        anfrage = Anfrage.objects.get(anfrage_id=self.basis_anfrage_id)
        self.assertEqual(anfrage.anfrage_weg, 'E-Mail')
        self.assertEqual(anfrage.anfrage_art, 'R')
    
    def test_basis_user_cannot_update_other_users_anfrage(self):
        """Basis-User darf die Anfrage eines anderen Users NICHT bearbeiten (403)."""
        self.authenticate_as_basis()
        
        update_data = {'anfrage_weg': 'Manipulation'}
        
        response = self.client.patch(
            f'/api/anfragen/{self.admin_anfrage_id}/',
            update_data,
            format='json'
        )
        
        # Sollte 404 sein, da die Anfrage nicht im gefilterten Queryset ist
        # (get_queryset filtert nach mitarbeiterin=user für Nicht-Admins)
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
        
        # Prüfe, dass die Anfrage NICHT geändert wurde
        anfrage = Anfrage.objects.get(anfrage_id=self.admin_anfrage_id)
        self.assertNotEqual(anfrage.anfrage_weg, 'Manipulation')
    
    def test_admin_can_update_any_anfrage(self):
        """Admin kann jede Anfrage bearbeiten, auch die von anderen Usern."""
        self.authenticate_as_admin()
        
        update_data = {'anfrage_weg': 'Admin-Update'}
        
        response = self.client.patch(
            f'/api/anfragen/{self.basis_anfrage_id}/',
            update_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        anfrage = Anfrage.objects.get(anfrage_id=self.basis_anfrage_id)
        self.assertEqual(anfrage.anfrage_weg, 'Admin-Update')
    
    def test_basis_user_cannot_change_mitarbeiterin(self):
        """Basis-User kann das mitarbeiterin-Feld nicht ändern (Schutz gegen Ticket-Stealing)."""
        self.authenticate_as_basis()
        
        update_data = {'mitarbeiterin': self.admin_user.id}
        
        response = self.client.patch(
            f'/api/anfragen/{self.basis_anfrage_id}/',
            update_data,
            format='json'
        )
        
        # Request sollte erfolgreich sein (da mitarbeiterin read_only ist, wird es ignoriert)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # mitarbeiterin sollte NICHT geändert worden sein
        anfrage = Anfrage.objects.get(anfrage_id=self.basis_anfrage_id)
        self.assertEqual(anfrage.mitarbeiterin, self.basis_user)
        self.assertNotEqual(anfrage.mitarbeiterin, self.admin_user)
    
    def test_full_update_with_put(self):
        """PUT aktualisiert alle Felder einer Anfrage."""
        self.authenticate_as_basis()
        
        full_update_data = {
            'anfrage_weg': 'Persönlich',
            'anfrage_ort': 'NS',        # Nordsachsen
            'anfrage_person': 'F',       # Fachkraft
            'anfrage_art': 'MS',         # medizinische Soforthilfe
        }
        
        response = self.client.put(
            f'/api/anfragen/{self.basis_anfrage_id}/',
            full_update_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        anfrage = Anfrage.objects.get(anfrage_id=self.basis_anfrage_id)
        self.assertEqual(anfrage.anfrage_weg, 'Persönlich')
        self.assertEqual(anfrage.anfrage_ort, 'NS')
        self.assertEqual(anfrage.anfrage_person, 'F')
        self.assertEqual(anfrage.anfrage_art, 'MS')
    
    def test_invalid_enum_on_update_returns_400(self):
        """Ungültige Enum-Werte bei Update führen zu 400 Bad Request."""
        self.authenticate_as_basis()
        
        invalid_data = {'anfrage_art': 'INVALID'}
        
        response = self.client.patch(
            f'/api/anfragen/{self.basis_anfrage_id}/',
            invalid_data,
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AnfrageMitarbeiterinZuweisenTestCase(APITestCase):
    """
    Tests für das Zuweisen von Anfragen an andere Mitarbeiter:innen.
    
    Implementiert Tests für die UML-Methode mitarbeiterinZuweisen().
    """
    
    def setUp(self):
        super().setUp()
        self.valid_data = {
            'anfrage_weg': 'Telefon',
            'anfrage_ort': 'LS',
            'anfrage_person': 'B',
            'anfrage_art': 'B',
        }
        
        # Erstelle eine Anfrage für Basis-User
        self.authenticate_as_basis()
        response = self.client.post('/api/anfragen/', self.valid_data, format='json')
        self.anfrage_id = response.data['anfrage_id']
    
    def test_admin_can_assign_anfrage_to_other_user(self):
        """Admin kann eine Anfrage einem anderen User zuweisen."""
        self.authenticate_as_admin()
        
        response = self.client.post(
            f'/api/anfragen/{self.anfrage_id}/assign/',
            {'mitarbeiterin_id': self.erweiterung_user.id},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        anfrage = Anfrage.objects.get(anfrage_id=self.anfrage_id)
        self.assertEqual(anfrage.mitarbeiterin, self.erweiterung_user)
    
    def test_basis_user_cannot_assign_anfrage(self):
        """Basis-User darf keine Anfragen zuweisen (403 Forbidden)."""
        self.authenticate_as_basis()
        
        response = self.client.post(
            f'/api/anfragen/{self.anfrage_id}/assign/',
            {'mitarbeiterin_id': self.erweiterung_user.id},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # mitarbeiterin sollte nicht geändert worden sein
        anfrage = Anfrage.objects.get(anfrage_id=self.anfrage_id)
        self.assertEqual(anfrage.mitarbeiterin, self.basis_user)
    
    def test_assign_with_invalid_user_returns_404(self):
        """Zuweisung an nicht existierenden User gibt 404."""
        self.authenticate_as_admin()
        
        response = self.client.post(
            f'/api/anfragen/{self.anfrage_id}/assign/',
            {'mitarbeiterin_id': 99999},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_assign_without_mitarbeiterin_id_returns_400(self):
        """Zuweisung ohne mitarbeiterin_id gibt 400."""
        self.authenticate_as_admin()
        
        response = self.client.post(
            f'/api/anfragen/{self.anfrage_id}/assign/',
            {},
            format='json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


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
