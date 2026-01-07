from django.urls import reverse
from rest_framework import status
from api.models import KlientIn, Begleitung, Fall
from api.tests.base import APITestCase

class KlientInTests(APITestCase):
    def setUp(self):
        super().setUp()
        
        # Klienten erstellen
        self.klient_a = KlientIn.objects.create(
            klient_rolle='OP',
            klient_geschlechtsidentitaet='W',
            klient_sexualitaet='HE',
            klient_wohnort='C',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Test A',
            klient_schwerbehinderung='NEI',
            klient_kontaktpunkt='Test'
        )
        
        self.klient_b = KlientIn.objects.create(
            klient_rolle='OP',
            klient_geschlechtsidentitaet='M',
            klient_sexualitaet='HE',
            klient_wohnort='C',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Test B',
            klient_schwerbehinderung='NEI',
            klient_kontaktpunkt='Test'
        )

        # Begleitung für Klient A erstellen
        self.begleitung_a = Begleitung.objects.create(
            klient=self.klient_a,
            art_begleitung='PO',
            anzahl_begleitungen=1
        )

    def test_assign_begleitung_success_move(self):
        """Testet das Verschieben einer Begleitung von Klient A zu Klient B."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('klient-assign-begleitung', kwargs={'pk': self.klient_b.pk})
        data = {'begleitung_id': self.begleitung_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.begleitung_a.refresh_from_db()
        self.assertEqual(self.begleitung_a.klient, self.klient_b)

    def test_assign_begleitung_cleanup_fall(self):
        """Testet, ob die Fall-Zuordnung gelöscht wird, wenn der Klient wechselt."""
        self.client.force_authenticate(user=self.basis_user)
        
        # Fall für Klient A erstellen und Begleitung zuweisen
        fall_a = Fall.objects.create(
            klient=self.klient_a,
            mitarbeiterin=self.basis_user
        )
        self.begleitung_a.fall = fall_a
        self.begleitung_a.save()
        
        # Begleitung zu Klient B verschieben
        url = reverse('klient-assign-begleitung', kwargs={'pk': self.klient_b.pk})
        data = {'begleitung_id': self.begleitung_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.begleitung_a.refresh_from_db()
        self.assertEqual(self.begleitung_a.klient, self.klient_b)
        self.assertIsNone(self.begleitung_a.fall)

    def test_assign_begleitung_forbidden(self):
        """Testet Zugriffsschutz (User ohne Rechte)."""
        self.client.force_authenticate(user=self.no_perm_user)
        
        url = reverse('klient-assign-begleitung', kwargs={'pk': self.klient_b.pk})
        data = {'begleitung_id': self.begleitung_a.pk}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_assign_begleitung_invalid_id(self):
        """Testet Validierung bei nicht existierender Begleitung."""
        self.client.force_authenticate(user=self.basis_user)
        
        url = reverse('klient-assign-begleitung', kwargs={'pk': self.klient_b.pk})
        data = {'begleitung_id': 99999}
        
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
