from django.urls import reverse
from rest_framework import status
from api.models import Gewalttat, KlientIn, Fall
from api.tests.base import APITestCase

class GewalttatTests(APITestCase):
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
        self.gewalttat = Gewalttat.objects.create(
            tat_alter="JA",
            tat_zeitraum="JA",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Test",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="N",
            tat_spurensicherung="N",
            klient=self.klient,
            fall=self.fall
        )
        self.detail_url = reverse('gewalttat-detail', args=[self.gewalttat.pk])

    def test_add_note(self):
        """Test adding a note."""
        self.authenticate_as_basis()
        url = reverse('gewalttat-add-note', args=[self.gewalttat.pk])
        
        response = self.client.post(url, {'text': 'New Note'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.gewalttat.refresh_from_db()
        self.assertIn('New Note', self.gewalttat.tat_notizen)

    def test_update_note(self):
        """Test updating notes."""
        self.authenticate_as_basis()
        url = reverse('gewalttat-update-note', args=[self.gewalttat.pk])
        
        response = self.client.post(url, {'tat_notizen': 'Updated Note'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.gewalttat.refresh_from_db()
        self.assertEqual(self.gewalttat.tat_notizen, 'Updated Note')

    def test_delete_note(self):
        """Test deleting notes."""
        self.authenticate_as_basis()
        url = reverse('gewalttat-delete-note', args=[self.gewalttat.pk])
        
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.gewalttat.refresh_from_db()
        self.assertEqual(self.gewalttat.tat_notizen, "")
