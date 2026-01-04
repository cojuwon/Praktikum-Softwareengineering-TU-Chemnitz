from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Konto, KlientIn, Fall
from django.contrib.auth.models import Group, Permission

class KlientActionsTests(APITestCase):
    def setUp(self):
        # Setup User and Permissions
        self.user = Konto.objects.create_user(
            mail_mb="test@example.com",
            vorname_mb="Test",
            nachname_mb="User",
            password="password123",
            rolle_mb='E' # Erweiterung
        )
        
        # Add necessary permissions
        permissions = [
            'view_klientin', 'add_klientin', 'change_klientin', 'delete_klientin',
            'view_fall', 'add_fall', 'change_fall', 'delete_fall'
        ]
        for perm_code in permissions:
            permission = Permission.objects.get(codename=perm_code)
            self.user.user_permissions.add(permission)
            
        self.client.force_authenticate(user=self.user)
        
        # Create Klient
        self.klient = KlientIn.objects.create(
            klient_rolle='B',
            klient_geschlechtsidentitaet='CW',
            klient_sexualitaet='H',
            klient_wohnort='LS',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Test',
            klient_schwerbehinderung='N',
            klient_kontaktpunkt='Test',
            klient_notizen="Initial Note"
        )
        
        self.klient_url = reverse('klient-detail', args=[self.klient.pk])

    def test_add_note(self):
        url = f"{self.klient_url}add-note/"
        data = {'text': 'New Note'}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.klient.refresh_from_db()
        self.assertIn('New Note', self.klient.klient_notizen)
        self.assertIn('Initial Note', self.klient.klient_notizen)

    def test_update_note(self):
        url = f"{self.klient_url}update-note/"
        data = {'klient_notizen': 'Overwritten Note'}
        response = self.client.post(url, data) # Using POST as defined in methods=['post', 'patch']
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.klient.refresh_from_db()
        self.assertEqual(self.klient.klient_notizen, 'Overwritten Note')

    def test_delete_note(self):
        url = f"{self.klient_url}delete-note/"
        response = self.client.post(url) # Using POST as defined in methods=['post', 'delete']
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.klient.refresh_from_db()
        self.assertEqual(self.klient.klient_notizen, "")

    def test_assign_fall(self):
        # Create another Klient and a Fall assigned to the user
        other_klient = KlientIn.objects.create(
            klient_rolle='A',
            klient_geschlechtsidentitaet='CM',
            klient_sexualitaet='H',
            klient_wohnort='LS',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Other',
            klient_schwerbehinderung='N',
            klient_kontaktpunkt='Other'
        )
        fall = Fall.objects.create(
            klient=other_klient,
            mitarbeiterin=self.user
        )
        
        url = f"{self.klient_url}assign-fall/"
        data = {'fall_id': fall.pk}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        fall.refresh_from_db()
        self.assertEqual(fall.klient, self.klient)

    def test_assign_fall_permission_denied(self):
        # Create a Fall assigned to another user
        other_user = Konto.objects.create_user(
            mail_mb="other@example.com",
            vorname_mb="Other",
            nachname_mb="User",
            password="password123"
        )
        other_klient = KlientIn.objects.create(
            klient_rolle='A',
            klient_geschlechtsidentitaet='CM',
            klient_sexualitaet='H',
            klient_wohnort='LS',
            klient_staatsangehoerigkeit='Deutsch',
            klient_beruf='Other',
            klient_schwerbehinderung='N',
            klient_kontaktpunkt='Other'
        )
        fall = Fall.objects.create(
            klient=other_klient,
            mitarbeiterin=other_user
        )
        
        url = f"{self.klient_url}assign-fall/"
        data = {'fall_id': fall.pk}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
