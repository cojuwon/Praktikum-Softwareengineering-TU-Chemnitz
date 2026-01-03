"""
Basis-Klassen und gemeinsame Fixtures für alle API-Tests.

Verwendung:
    from api.tests.base import APITestCase
    
    class MeinTestCase(APITestCase):
        def test_etwas(self):
            self.client.force_authenticate(user=self.basis_user)
            ...
"""

from django.test import TestCase
from django.contrib.auth.models import Group
from rest_framework.test import APIClient

from api.models import Konto


class APITestCase(TestCase):
    """
    Basis-Klasse für API-Tests mit vorkonfigurierten Usern und Client.
    
    Verfügbare Fixtures:
    - self.basis_user      : User mit Gruppe "Basis"
    - self.erweiterung_user: User mit Gruppe "Erweiterung"
    - self.admin_user      : User mit Gruppe "Admin"
    - self.no_perm_user    : User ohne Gruppe (keine Permissions)
    - self.client          : DRF APIClient
    """
    
    @classmethod
    def setUpTestData(cls):
        """
        Wird einmal pro TestCase-Klasse ausgeführt (nicht pro Test).
        Erstellt Gruppen und User für alle Tests.
        """
        # Gruppen erstellen via Management Command
        from django.core.management import call_command
        call_command('setup_groups', verbosity=0)
    
    def setUp(self):
        """
        Wird vor jedem einzelnen Test ausgeführt.
        Erstellt frische User-Instanzen und APIClient.
        """
        # Basis-User (view, add, change - KEIN delete)
        self.basis_user = Konto.objects.create_user(
            mail_mb='basis@test.de',
            password='test1234',
            vorname_mb='Basis',
            nachname_mb='User',
            rolle_mb='B'
        )
        self.basis_user.groups.add(Group.objects.get(name='Basis'))
        
        # Erweiterung-User (+ delete, export, share)
        self.erweiterung_user = Konto.objects.create_user(
            mail_mb='erweiterung@test.de',
            password='test1234',
            vorname_mb='Erweiterung',
            nachname_mb='User',
            rolle_mb='E'
        )
        self.erweiterung_user.groups.add(Group.objects.get(name='Erweiterung'))
        
        # Admin-User (alle Rechte)
        self.admin_user = Konto.objects.create_user(
            mail_mb='admin@test.de',
            password='test1234',
            vorname_mb='Admin',
            nachname_mb='User',
            rolle_mb='AD',
            is_staff=True
        )
        self.admin_user.groups.add(Group.objects.get(name='Admin'))
        
        # User ohne Permissions (keine Gruppe)
        self.no_perm_user = Konto.objects.create_user(
            mail_mb='noperm@test.de',
            password='test1234',
            vorname_mb='NoPerm',
            nachname_mb='User',
            rolle_mb='B'
        )
        # Bewusst keine Gruppe zugewiesen
        
        # API Client
        self.client = APIClient()
    
    def tearDown(self):
        """Wird nach jedem Test ausgeführt. Cleanup falls nötig."""
        self.client.logout()
    
    # --- Hilfsmethoden ---
    
    def authenticate_as_basis(self):
        """Authentifiziert den Client als Basis-User."""
        self.client.force_authenticate(user=self.basis_user)
    
    def authenticate_as_erweiterung(self):
        """Authentifiziert den Client als Erweiterung-User."""
        self.client.force_authenticate(user=self.erweiterung_user)
    
    def authenticate_as_admin(self):
        """Authentifiziert den Client als Admin-User."""
        self.client.force_authenticate(user=self.admin_user)
    
    def authenticate_as_no_perm(self):
        """Authentifiziert den Client als User ohne Permissions."""
        self.client.force_authenticate(user=self.no_perm_user)
    
    def logout(self):
        """Meldet den Client ab (für unauthenticated Tests)."""
        self.client.force_authenticate(user=None)
    
    # --- Assertion Helpers ---
    
    def assertHasPermission(self, user, permission_codename):
        """Prüft, ob ein User eine bestimmte Permission hat."""
        full_perm = f'api.{permission_codename}' if '.' not in permission_codename else permission_codename
        self.assertTrue(
            user.has_perm(full_perm),
            f"User {user.mail_mb} sollte Permission '{full_perm}' haben"
        )
    
    def assertNotHasPermission(self, user, permission_codename):
        """Prüft, ob ein User eine bestimmte Permission NICHT hat."""
        full_perm = f'api.{permission_codename}' if '.' not in permission_codename else permission_codename
        self.assertFalse(
            user.has_perm(full_perm),
            f"User {user.mail_mb} sollte Permission '{full_perm}' NICHT haben"
        )
