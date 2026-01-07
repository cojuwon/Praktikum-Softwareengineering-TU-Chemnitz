from django.urls import reverse
from rest_framework import status
from api.models import Fall, Begleitung, KlientIn, Beratungstermin, Gewalttat
from api.tests.base import APITestCase

class FallTests(APITestCase):
    def setUp(self):
        super().setUp()
        
        # Klienten erstellen
        self.klient_a = KlientIn.objects.create(
            klient_rolle='OP',
            klient_geschlechtsidentitaet='W',
            klient_sexualitaet='HE',
            klient_wohnort='C',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Test',
            klient_schwerbehinderung='NEI',
            klient_kontaktpunkt='Test'
        )
        
        self.klient_b = KlientIn.objects.create(
            klient_rolle='OP',
            klient_geschlechtsidentitaet='M',
            klient_sexualitaet='HE',
            klient_wohnort='C',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Test',
            klient_schwerbehinderung='NEI',
            klient_kontaktpunkt='Test'
        )

        # Fall für Klient A erstellen (zugewiesen an Basis User)
        self.fall_a = Fall.objects.create(
            klient=self.klient_a,
            mitarbeiterin=self.basis_user
        )

        # Begleitung für Klient A erstellen (noch kein Fall)
        self.begleitung_a = Begleitung.objects.create(
            klient=self.klient_a,
            art_begleitung='PO',
            anzahl_begleitungen=1
        )

        # Begleitung für Klient B erstellen
        self.begleitung_b = Begleitung.objects.create(
            klient=self.klient_b,
            art_begleitung='PO',
            anzahl_begleitungen=1
        )

        # Beratungstermin für Klient A (noch kein Fall)
        self.termin_a = Beratungstermin.objects.create(
            beratungsstelle='BE',
            termin_beratung='2023-01-01',
            beratungsart='TE'
        )
        # Wir müssen den Termin irgendwie mit Klient A assoziieren, aber das Modell hat keinen direkten FK.
        # Für den Test assign_beratung prüfen wir die Logik, die wir implementiert haben.
        # Da Beratungstermin keinen Klienten-FK hat, können wir nur prüfen, ob er zugewiesen wird.
        # Wenn er schon einem Fall zugeordnet wäre, könnten wir den Klienten-Check testen.
        
        # Fall für Klient B erstellen für Mismatch-Tests
        self.fall_b = Fall.objects.create(
            klient=self.klient_b,
            mitarbeiterin=self.basis_user
        )
        
        # Gewalttat für Klient A
        self.tat_a = Gewalttat.objects.create(
            klient=self.klient_a,
            tat_alter='JA',
            tat_zeitraum='JA',
            tat_anzahl_vorfaelle='1',
            tat_anzahl_taeter_innen='1',
            tat_art='Test',
            tatort='WO',
            tat_anzeige='JA',
            tat_medizinische_versorgung='JA',
            tat_spurensicherung='JA'
        )
        
        # Gewalttat für Klient B
        self.tat_b = Gewalttat.objects.create(
            klient=self.klient_b,
            tat_alter='JA',
            tat_zeitraum='JA',
            tat_anzahl_vorfaelle='1',
            tat_anzahl_taeter_innen='1',
            tat_art='Test',
            tatort='WO',
            tat_anzeige='JA',
            tat_medizinische_versorgung='JA',
            tat_spurensicherung='JA'
        )

    def test_assign_begleitung_success(self):
        """Testet erfolgreiche Zuweisung einer Begleitung zum Fall (gleicher Klient)."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-assign-begleitung', kwargs={'pk': self.fall_a.pk})
        data = {'begleitung_id': self.begleitung_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.begleitung_a.refresh_from_db()
        self.assertEqual(self.begleitung_a.fall, self.fall_a)

    def test_assign_begleitung_mismatch(self):
        """Testet Fehler bei Zuweisung einer Begleitung eines anderen Klienten."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-assign-begleitung', kwargs={'pk': self.fall_a.pk})
        data = {'begleitung_id': self.begleitung_b.pk} # Begleitung von Klient B an Fall von Klient A
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        self.begleitung_b.refresh_from_db()
        self.assertIsNone(self.begleitung_b.fall)

    def test_assign_begleitung_forbidden(self):
        """Testet Zugriffsschutz (User ohne Rechte)."""
        self.client.force_authenticate(user=self.no_perm_user)
        
        url = reverse('fall-assign-begleitung', kwargs={'pk': self.fall_a.pk})
        data = {'begleitung_id': self.begleitung_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_fall_auto_assign(self):
        """Testet automatische Zuweisung des aktuellen Users beim Erstellen."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-list')
        data = {'klient': self.klient_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        fall_id = response.data['fall_id']
        fall = Fall.objects.get(pk=fall_id)
        self.assertEqual(fall.mitarbeiterin, self.basis_user)

    def test_create_fall_explicit_assign(self):
        """Testet explizite Zuweisung eines anderen Users (durch Admin)."""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('fall-list')
        data = {
            'klient': self.klient_a.pk,
            'mitarbeiterin': self.basis_user.pk
        }
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        fall_id = response.data['fall_id']
        fall = Fall.objects.get(pk=fall_id)
        self.assertEqual(fall.mitarbeiterin, self.basis_user)

    def test_create_fall_validation_error(self):
        """Testet Validierung: Klient fehlt."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-list')
        data = {} # Klient fehlt
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_fall_forbidden(self):
        """Testet Zugriffsschutz: User ohne add_fall Permission."""
        self.client.force_authenticate(user=self.no_perm_user)
        
        url = reverse('fall-list')
        data = {'klient': self.klient_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_fall_success_owner(self):
        """Testet Bearbeiten eines eigenen Falls."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-detail', kwargs={'pk': self.fall_a.pk})
        # Wir ändern den Klienten (nur als Beispiel für ein Update)
        data = {
            'klient': self.klient_b.pk,
            'mitarbeiterin': self.basis_user.pk # Muss mitgesendet werden oder partial_update nutzen
        }
        
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.fall_a.refresh_from_db()
        self.assertEqual(self.fall_a.klient, self.klient_b)

    def test_partial_update_fall_success_owner(self):
        """Testet teilweises Bearbeiten eines eigenen Falls (PATCH)."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-detail', kwargs={'pk': self.fall_a.pk})
        data = {'klient': self.klient_b.pk}
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.fall_a.refresh_from_db()
        self.assertEqual(self.fall_a.klient, self.klient_b)

    def test_update_fall_success_admin(self):
        """Testet Bearbeiten eines fremden Falls durch Admin."""
        self.client.force_authenticate(user=self.admin_user)
        
        # Fall gehört basis_user
        url = reverse('fall-detail', kwargs={'pk': self.fall_a.pk})
        data = {'klient': self.klient_b.pk}
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.fall_a.refresh_from_db()
        self.assertEqual(self.fall_a.klient, self.klient_b)

    def test_update_fall_forbidden_other_user(self):
        """Testet Bearbeiten eines fremden Falls durch normalen User (404, da nicht sichtbar)."""
        # Wir erstellen einen Fall für den Erweiterungs-User
        fall_other = Fall.objects.create(
            klient=self.klient_a,
            mitarbeiterin=self.erweiterung_user
        )
        
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-detail', kwargs={'pk': fall_other.pk})
        data = {'klient': self.klient_b.pk}
        
        response = self.client.patch(url, data)
        # Da get_queryset filtert, wird der Fall gar nicht gefunden -> 404
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_fall_validation_error(self):
        """Testet Validierung beim Update."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-detail', kwargs={'pk': self.fall_a.pk})
        data = {'klient': 99999} # Nicht existierender Klient
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_fall_loeschen_success(self):
        """Testet Löschen eines eigenen Falls."""
        self.client.force_authenticate(user=self.erweiterung_user) # Basis User hat kein delete Recht
        
        # Fall erstellen für Erweiterung User
        fall = Fall.objects.create(klient=self.klient_a, mitarbeiterin=self.erweiterung_user)
        
        url = reverse('fall-detail', kwargs={'pk': fall.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Fall.objects.filter(pk=fall.pk).exists())

    def test_fall_loeschen_forbidden(self):
        """Testet Löschen ohne Berechtigung (Basis User)."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-detail', kwargs={'pk': self.fall_a.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assign_beratung_success(self):
        """Testet Zuweisung eines Beratungstermins."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-assign-beratung', kwargs={'pk': self.fall_a.pk})
        data = {'beratungs_id': self.termin_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.termin_a.refresh_from_db()
        self.assertEqual(self.termin_a.fall, self.fall_a)

    def test_assign_beratung_mismatch(self):
        """Testet Zuweisung eines Beratungstermins, der schon zu einem anderen Klienten gehört."""
        self.client.force_authenticate(user=self.basis_user)
        
        # Termin dem Fall B (Klient B) zuweisen
        self.termin_a.fall = self.fall_b
        self.termin_a.save()
        
        # Versuch, Termin dem Fall A (Klient A) zuzuweisen
        url = reverse('fall-assign-beratung', kwargs={'pk': self.fall_a.pk})
        data = {'beratungs_id': self.termin_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assign_tat_success(self):
        """Testet Zuweisung einer Gewalttat."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-assign-tat', kwargs={'pk': self.fall_a.pk})
        data = {'tat_id': self.tat_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.tat_a.refresh_from_db()
        self.assertEqual(self.tat_a.fall, self.fall_a)

    def test_assign_tat_mismatch(self):
        """Testet Zuweisung einer Gewalttat eines anderen Klienten."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-assign-tat', kwargs={'pk': self.fall_a.pk})
        data = {'tat_id': self.tat_b.pk} # Tat von Klient B
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assign_klient_success(self):
        """Testet Zuweisung eines neuen Klienten an den Fall."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('fall-assign-klient', kwargs={'pk': self.fall_a.pk})
        data = {'klient_id': self.klient_b.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.fall_a.refresh_from_db()
        self.assertEqual(self.fall_a.klient, self.klient_b)
