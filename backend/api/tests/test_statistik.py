from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from api.models import Konto, Statistik

class StatistikTests(APITestCase):
    def setUp(self):
        # Create Permissions if they don't exist (test DB might be empty)
        content_type = ContentType.objects.get_for_model(Statistik)
        
        # Standard permissions
        view_perm, _ = Permission.objects.get_or_create(codename='view_statistik', content_type=content_type)
        add_perm, _ = Permission.objects.get_or_create(codename='add_statistik', content_type=content_type)
        change_perm, _ = Permission.objects.get_or_create(codename='change_statistik', content_type=content_type)
        
        # Custom permissions
        export_perm, _ = Permission.objects.get_or_create(codename='can_export_statistik', content_type=content_type)

        # Basis User (can create, view own, but NOT export)
        self.user_basis = Konto.objects.create_user(
            mail_mb='basis@example.com',
            password='password123',
            vorname_mb='Basis',
            nachname_mb='User',
            rolle_mb='B'
        )
        # Assign standard permissions
        self.user_basis.user_permissions.add(view_perm, add_perm, change_perm)

        # Extension User (can export)
        self.user_ext = Konto.objects.create_user(
            mail_mb='ext@example.com',
            password='password123',
            vorname_mb='Ext',
            nachname_mb='User',
            rolle_mb='E'
        )
        # Assign standard + export permissions
        self.user_ext.user_permissions.add(view_perm, add_perm, change_perm, export_perm)

        self.list_url = reverse('statistik-list')

    def test_create_statistik(self):
        """Test creation triggers calculation and file generation."""
        self.client.force_authenticate(user=self.user_basis)
        data = {
            "statistik_titel": "My Stats",
            "zeitraum_start": "2023-01-01",
            "zeitraum_ende": "2023-12-31",
            "statistik_notizen": "Some notes"
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Check DB
        stat = Statistik.objects.get(statistik_titel="My Stats")
        self.assertEqual(stat.creator, self.user_basis)
        self.assertTrue(stat.ergebnis) # File should exist
        
        # Check file content (dummy)
        content = stat.ergebnis.read().decode('utf-8')
        self.assertIn("Statistik Report", content)
        self.assertIn("Ergebnisse:", content)

    def test_export_permission(self):
        """Test export permission logic."""
        # Create stat for basis user
        stat = Statistik.objects.create(
            statistik_titel="Basis Stat",
            zeitraum_start="2023-01-01",
            zeitraum_ende="2023-12-31",
            creator=self.user_basis,
            ergebnis="dummy.txt" # Mock file path
        )
        # Create a real dummy file for it
        from django.core.files.base import ContentFile
        stat.ergebnis.save("test.txt", ContentFile(b"content"))
        
        export_url = reverse('statistik-export', args=[stat.pk])

        # 1. Basis user tries to export -> Forbidden
        self.client.force_authenticate(user=self.user_basis)
        response = self.client.get(export_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Extension user tries to export -> Allowed (if they can access the object)
        # Wait, Extension user can only access their OWN objects unless they are Admin.
        # So let's create a stat for the Extension user.
        stat_ext = Statistik.objects.create(
            statistik_titel="Ext Stat",
            zeitraum_start="2023-01-01",
            zeitraum_ende="2023-12-31",
            creator=self.user_ext
        )
        stat_ext.ergebnis.save("test_ext.txt", ContentFile(b"content"))
        export_url_ext = reverse('statistik-export', args=[stat_ext.pk])

        self.client.force_authenticate(user=self.user_ext)
        response = self.client.get(export_url_ext)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.getvalue(), b"content")

    def test_update_actions(self):
        """Test update_title and update_notes actions."""
        stat = Statistik.objects.create(
            statistik_titel="Original Title",
            statistik_notizen="Original Notes",
            zeitraum_start="2023-01-01",
            zeitraum_ende="2023-12-31",
            creator=self.user_basis
        )
        
        self.client.force_authenticate(user=self.user_basis)
        
        # Update Title
        url_title = reverse('statistik-update-title', args=[stat.pk])
        response = self.client.patch(url_title, {'statistik_titel': 'New Title'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        stat.refresh_from_db()
        self.assertEqual(stat.statistik_titel, 'New Title')
        
        # Update Notes
        url_notes = reverse('statistik-update-notes', args=[stat.pk])
        response = self.client.patch(url_notes, {'statistik_notizen': 'New Notes'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        stat.refresh_from_db()
        self.assertEqual(stat.statistik_notizen, 'New Notes')

    def test_visibility(self):
        """Test users only see their own stats."""
        Statistik.objects.create(
            statistik_titel="Basis Stat",
            zeitraum_start="2023-01-01",
            zeitraum_ende="2023-12-31",
            creator=self.user_basis
        )
        Statistik.objects.create(
            statistik_titel="Ext Stat",
            zeitraum_start="2023-01-01",
            zeitraum_ende="2023-12-31",
            creator=self.user_ext
        )
        
        # Basis user sees 1
        self.client.force_authenticate(user=self.user_basis)
        response = self.client.get(self.list_url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['statistik_titel'], "Basis Stat")
