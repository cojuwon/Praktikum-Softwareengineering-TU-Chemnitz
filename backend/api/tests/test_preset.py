from django.urls import reverse
from rest_framework import status
from django.contrib.auth.models import Group
from api.models import Preset, Konto
from api.tests.base import APITestCase

class PresetTests(APITestCase):
    def setUp(self):
        super().setUp()
        # We can use self.basis_user, self.erweiterung_user, etc. from base
        # But for specific scenarios (owner vs shared), we might need more users.
        
        # Create additional users and assign to Basis group
        self.user_owner = Konto.objects.create_user(
            mail_mb='owner@example.com',
            password='password123',
            vorname_mb='Owner',
            nachname_mb='User',
            rolle_mb='B'
        )
        self.user_owner.groups.add(Group.objects.get(name='Basis'))

        self.user_shared = Konto.objects.create_user(
            mail_mb='shared@example.com',
            password='password123',
            vorname_mb='Shared',
            nachname_mb='User',
            rolle_mb='B'
        )
        self.user_shared.groups.add(Group.objects.get(name='Basis'))

        self.user_other = Konto.objects.create_user(
            mail_mb='other@example.com',
            password='password123',
            vorname_mb='Other',
            nachname_mb='User',
            rolle_mb='B'
        )
        self.user_other.groups.add(Group.objects.get(name='Basis'))

        # Admin is already available as self.admin_user, but let's create one if needed or use existing
        # self.admin_user is created in super().setUp()
        
        # Preset
        self.preset = Preset.objects.create(
            preset_daten={"field": "value"},
            preset_beschreibung="Original Description",
            filterKriterien={"filter": "criteria"},
            ersteller=self.user_owner
        )
        self.preset.berechtigte.add(self.user_shared)

        self.list_url = reverse('preset-list')
        self.detail_url = reverse('preset-detail', args=[self.preset.pk])

    def test_create_preset(self):
        """Test creating a preset sets the owner correctly."""
        self.client.force_authenticate(user=self.user_owner)
        data = {
            "preset_daten": {"new": "data"},
            "preset_beschreibung": "New Preset",
            "filterKriterien": {"new": "filter"}
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Preset.objects.count(), 2)
        new_preset = Preset.objects.get(preset_beschreibung="New Preset")
        self.assertEqual(new_preset.ersteller, self.user_owner)

    def test_access_control(self):
        """Test visibility of presets."""
        # Owner sees it
        self.client.force_authenticate(user=self.user_owner)
        response = self.client.get(self.list_url)
        self.assertEqual(len(response.data), 1)

        # Shared user sees it
        self.client.force_authenticate(user=self.user_shared)
        response = self.client.get(self.list_url)
        self.assertEqual(len(response.data), 1)

        # Other user sees nothing
        self.client.force_authenticate(user=self.user_other)
        response = self.client.get(self.list_url)
        self.assertEqual(len(response.data), 0)

        # Admin sees it
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(self.list_url)
        # Admin sees all (1 preset so far)
        self.assertEqual(len(response.data), 1)

    def test_shared_edit(self):
        """Test shared user can edit."""
        self.client.force_authenticate(user=self.user_shared)
        data = {
            "preset_daten": {"updated": "data"},
            "preset_beschreibung": "Updated Description",
            "filterKriterien": {"updated": "filter"}
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.preset.refresh_from_db()
        self.assertEqual(self.preset.preset_beschreibung, "Updated Description")

    def test_description_actions(self):
        """Test update_description and delete_description actions."""
        self.client.force_authenticate(user=self.user_owner)
        
        # Update Description
        update_url = reverse('preset-update-description', args=[self.preset.pk])
        response = self.client.patch(update_url, {'preset_beschreibung': 'Patched Desc'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.preset.refresh_from_db()
        self.assertEqual(self.preset.preset_beschreibung, 'Patched Desc')

        # Delete Description
        delete_desc_url = reverse('preset-delete-description', args=[self.preset.pk])
        response = self.client.delete(delete_desc_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.preset.refresh_from_db()
        self.assertEqual(self.preset.preset_beschreibung, "")

    def test_delete_preset(self):
        """Test deleting a preset."""
        # Shared user deletes
        self.client.force_authenticate(user=self.user_shared)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Preset.objects.count(), 0)
