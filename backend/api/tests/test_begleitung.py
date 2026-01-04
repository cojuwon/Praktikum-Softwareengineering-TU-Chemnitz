from django.urls import reverse
from rest_framework import status
from api.models import Begleitung, KlientIn, Fall
from api.tests.base import APITestCase

class BegleitungTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="Deutsch",
            klient_beruf="Test",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Test"
        )
        self.fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.basis_user
        )
        self.begleitung = Begleitung.objects.create(
            anzahl_begleitungen=1,
            art_begleitung="G",
            klient=self.klient,
            fall=self.fall
        )
        self.detail_url = reverse('begleitung-detail', args=[self.begleitung.pk])

    def test_update_referral(self):
        """Test updating referral data."""
        self.authenticate_as_basis()
        url = reverse('begleitung-update-referral', args=[self.begleitung.pk])
        
        data = {
            'anzahl_verweisungen': 2,
            'art_verweisungen': 'G'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.begleitung.refresh_from_db()
        self.assertEqual(self.begleitung.anzahl_verweisungen, 2)
        self.assertEqual(self.begleitung.art_verweisungen, 'G')

    def test_delete_referral(self):
        """Test deleting referral data."""
        self.begleitung.anzahl_verweisungen = 5
        self.begleitung.art_verweisungen = "G"
        self.begleitung.save()
        
        self.authenticate_as_basis()
        url = reverse('begleitung-delete-referral', args=[self.begleitung.pk])
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.begleitung.refresh_from_db()
        self.assertEqual(self.begleitung.anzahl_verweisungen, 0)
        self.assertEqual(self.begleitung.art_verweisungen, "")
