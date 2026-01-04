from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from api.models import Beratungstermin, Fall, KlientIn
from api.tests.base import APITestCase

class BeratungsterminTests(APITestCase):
    def setUp(self):
        super().setUp()
        
        # Klient erstellen
        self.klient = KlientIn.objects.create(
            klient_rolle='B',
            klient_geschlechtsidentitaet='CW',
            klient_sexualitaet='H',
            klient_wohnort='LS',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Test',
            klient_schwerbehinderung='N',
            klient_kontaktpunkt='Test'
        )
        
        # Fall erstellen (zugewiesen an basis_user)
        self.fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.basis_user
        )
        
        # Beratungstermin erstellen (zugewiesen an basis_user)
        self.beratungstermin = Beratungstermin.objects.create(
            beratungsstelle='LS',
            termin_beratung=timezone.now().date(),
            beratungsart='P',
            berater=self.basis_user,
            fall=self.fall,
            notizen_beratung="Initiale Notiz"
        )
        
        self.url = reverse('beratungstermin-add-note', kwargs={'pk': self.beratungstermin.pk})

    def test_add_note_success(self):
        """Testet das erfolgreiche Hinzufügen einer Notiz durch einen berechtigten User."""
        self.client.force_authenticate(user=self.basis_user)
        
        data = {'notiz': 'Neue wichtige Information'}
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Objekt neu laden
        self.beratungstermin.refresh_from_db()
        
        # Prüfen ob Notiz angehängt wurde
        self.assertIn("Initiale Notiz", self.beratungstermin.notizen_beratung)
        self.assertIn("Neue wichtige Information", self.beratungstermin.notizen_beratung)
        self.assertIn(f"Notiz von {self.basis_user.vorname_mb} {self.basis_user.nachname_mb}", self.beratungstermin.notizen_beratung)

    def test_add_note_forbidden_wrong_user(self):
        """Testet Zugriff durch User, der nicht zuständig ist (Object Permission)."""
        # Ein anderer User (Erweiterung) versucht auf den Termin des Basis-Users zuzugreifen
        # Erweiterung User hat zwar generell Rechte, aber ist nicht zugewiesen
        self.client.force_authenticate(user=self.erweiterung_user)
        
        data = {'notiz': 'Hacker Notiz'}
        response = self.client.post(self.url, data)
        
        # Sollte 404 Not Found sein, da get_queryset den Termin ausfiltert
        # Oder 403 Forbidden, je nach Implementierung von CanManageOwnData und get_object
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

    def test_add_note_forbidden_no_permission(self):
        """Testet Zugriff durch User ohne generelle Berechtigung."""
        self.client.force_authenticate(user=self.no_perm_user)
        
        data = {'notiz': 'Illegal'}
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_add_note_validation_empty(self):
        """Testet Validierung bei leerer Notiz."""
        self.client.force_authenticate(user=self.basis_user)
        
        data = {'notiz': ''}
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        data = {'notiz': '   '}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_edit_note_success(self):
        """Testet das erfolgreiche Bearbeiten (Überschreiben) einer Notiz."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('beratungstermin-edit-note', kwargs={'pk': self.beratungstermin.pk})
        data = {'notiz': 'Korrektur: Alles anders'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.beratungstermin.refresh_from_db()
        self.assertEqual(self.beratungstermin.notizen_beratung, 'Korrektur: Alles anders')

    def test_edit_note_forbidden(self):
        """Testet Zugriff durch nicht zuständigen User auf edit_note."""
        self.client.force_authenticate(user=self.erweiterung_user)
        
        url = reverse('beratungstermin-edit-note', kwargs={'pk': self.beratungstermin.pk})
        data = {'notiz': 'Hacker Update'}
        
        response = self.client.post(url, data)
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])

    def test_edit_note_empty_string(self):
        """Testet das Leeren der Notizen durch Senden eines leeren Strings."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('beratungstermin-edit-note', kwargs={'pk': self.beratungstermin.pk})
        data = {'notiz': ''}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.beratungstermin.refresh_from_db()
        self.assertEqual(self.beratungstermin.notizen_beratung, '')

    def test_termin_anlegen_success(self):
        """Testet das erfolgreiche Anlegen eines Termins für den eigenen Fall."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('beratungstermin-list')
        data = {
            'beratungsstelle': 'LS',
            'termin_beratung': timezone.now().date(),
            'beratungsart': 'P',
            'fall': self.fall.pk,
            'notizen_beratung': 'Startnotiz'
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Prüfen ob Berater automatisch gesetzt wurde
        termin_id = response.data['beratungs_id']
        termin = Beratungstermin.objects.get(pk=termin_id)
        self.assertEqual(termin.berater, self.basis_user)
        self.assertEqual(termin.notizen_beratung, 'Startnotiz')

    def test_termin_anlegen_forbidden_fremder_fall(self):
        """Testet, dass man keinen Termin für den Fall eines anderen Users anlegen kann."""
        # Fall erstellen, der dem Erweiterungs-User gehört
        fremder_fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.erweiterung_user
        )
        
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('beratungstermin-list')
        data = {
            'beratungsstelle': 'LS',
            'termin_beratung': timezone.now().date(),
            'beratungsart': 'P',
            'fall': fremder_fall.pk
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_termin_anlegen_validation_missing_fields(self):
        """Testet Validierung bei fehlenden Pflichtfeldern."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('beratungstermin-list')
        data = {
            'beratungsstelle': 'LS'
            # termin_beratung, beratungsart, fall fehlen
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
