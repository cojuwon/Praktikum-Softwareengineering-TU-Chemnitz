from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from api.models import Gewaltfolge, Gewalttat, Fall, KlientIn
from api.tests.base import APITestCase

class GewaltfolgeTests(APITestCase):
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
        
        # Gewalttat erstellen
        self.gewalttat = Gewalttat.objects.create(
            tat_alter='KA',
            tat_zeitraum='KA',
            tat_anzahl_vorfaelle='E',
            tat_anzahl_taeter_innen='1',
            tat_art='Test',
            tatort='L',
            tat_anzeige='N',
            tat_medizinische_versorgung='N',
            tat_spurensicherung='N',
            klient=self.klient,
            fall=self.fall
        )
        
        # Gewaltfolge erstellen
        self.gewaltfolge = Gewaltfolge.objects.create(
            gewalttat=self.gewalttat,
            psychische_folgen='N',
            koerperliche_folgen='N',
            finanzielle_folgen='N',
            arbeitseinschraenkung='N',
            verlust_arbeitsstelle='N',
            soziale_isolation='N',
            suizidalitaet='N',
            keine_angabe='N',
            folgen_notizen="Initiale Notiz"
        )
        
        self.url = reverse('gewaltfolge-add-note', kwargs={'pk': self.gewaltfolge.pk})

    def test_add_note_success(self):
        """Testet das erfolgreiche Hinzufügen einer Notiz durch einen berechtigten User."""
        self.client.force_authenticate(user=self.basis_user)
        
        data = {'notiz': 'Neue Folgeerscheinung'}
        response = self.client.post(self.url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Objekt neu laden
        self.gewaltfolge.refresh_from_db()
        
        # Prüfen ob Notiz angehängt wurde
        self.assertIn("Initiale Notiz", self.gewaltfolge.folgen_notizen)
        self.assertIn("Neue Folgeerscheinung", self.gewaltfolge.folgen_notizen)
        # Prüfen auf Zeitstempel-Format
        timestamp = timezone.now().strftime("%d.%m.%Y")
        self.assertIn(f"[{timestamp}]", self.gewaltfolge.folgen_notizen)

    def test_add_note_forbidden_wrong_user(self):
        """Testet Zugriff durch User, der nicht zuständig ist (Object Permission)."""
        # Ein anderer User (Erweiterung) versucht auf die Gewaltfolge des Basis-Users zuzugreifen
        self.client.force_authenticate(user=self.erweiterung_user)
        
        data = {'notiz': 'Hacker Notiz'}
        response = self.client.post(self.url, data)
        
        # Sollte 404 Not Found sein, da get_queryset die Gewaltfolge ausfiltert
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

    def test_update_note_overwrite(self):
        """Testet das vollständige Überschreiben einer Notiz."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('gewaltfolge-update-note', kwargs={'pk': self.gewaltfolge.pk})
        data = {'notiz': 'Komplett neuer Text'}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.gewaltfolge.refresh_from_db()
        self.assertEqual(self.gewaltfolge.folgen_notizen, 'Komplett neuer Text')

    def test_update_note_clear(self):
        """Testet das Leeren der Notizen durch Senden eines leeren Strings."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('gewaltfolge-update-note', kwargs={'pk': self.gewaltfolge.pk})
        data = {'notiz': ''}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.gewaltfolge.refresh_from_db()
        self.assertEqual(self.gewaltfolge.folgen_notizen, '')

    def test_update_note_forbidden(self):
        """Testet Zugriff durch nicht zuständigen User auf update_note."""
        self.client.force_authenticate(user=self.erweiterung_user)
        
        url = reverse('gewaltfolge-update-note', kwargs={'pk': self.gewaltfolge.pk})
        data = {'notiz': 'Hacker Update'}
        
        response = self.client.post(url, data)
        self.assertIn(response.status_code, [status.HTTP_404_NOT_FOUND, status.HTTP_403_FORBIDDEN])
