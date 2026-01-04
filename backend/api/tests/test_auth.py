"""
Tests für Authentifizierung und Permission-System.

Testet:
- /api/auth/user/ Endpoint (Permissions in Response)
- Gruppen-basierte Permissions
- Permission-Hierarchie (Basis < Erweiterung < Admin)
"""

from rest_framework import status

from api.tests.base import APITestCase


class UserEndpointTestCase(APITestCase):
    """Tests für den /api/auth/user/ Endpoint."""
    
    def test_user_endpoint_returns_permissions(self):
        """Der /api/auth/user/ Endpoint liefert Permissions-Array."""
        self.authenticate_as_basis()
        
        response = self.client.get('/api/auth/user/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('permissions', response.data)
        self.assertIsInstance(response.data['permissions'], list)
    
    def test_user_endpoint_returns_groups(self):
        """Der /api/auth/user/ Endpoint liefert Gruppen-Array."""
        self.authenticate_as_basis()
        
        response = self.client.get('/api/auth/user/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('groups', response.data)
        self.assertIn('Basis', response.data['groups'])
    
    def test_basis_user_has_view_add_change_permissions(self):
        """Basis-User hat view, add, change Permissions für Anfrage."""
        self.authenticate_as_basis()
        
        response = self.client.get('/api/auth/user/')
        
        permissions = response.data['permissions']
        self.assertIn('api.view_anfrage', permissions)
        self.assertIn('api.add_anfrage', permissions)
        self.assertIn('api.change_anfrage', permissions)
    
    def test_basis_user_has_no_delete_permission(self):
        """Basis-User hat KEINE delete Permission."""
        self.authenticate_as_basis()
        
        response = self.client.get('/api/auth/user/')
        
        permissions = response.data['permissions']
        self.assertNotIn('api.delete_anfrage', permissions)
        self.assertNotIn('api.delete_fall', permissions)
    
    def test_erweiterung_user_has_delete_permission(self):
        """Erweiterung-User hat delete Permission."""
        self.authenticate_as_erweiterung()
        
        response = self.client.get('/api/auth/user/')
        
        permissions = response.data['permissions']
        self.assertIn('api.delete_anfrage', permissions)
        self.assertIn('api.delete_fall', permissions)
    
    def test_admin_has_custom_permissions(self):
        """Admin-User hat Custom Permissions (can_manage_users, can_view_all_data)."""
        self.authenticate_as_admin()
        
        response = self.client.get('/api/auth/user/')
        
        permissions = response.data['permissions']
        self.assertIn('api.can_manage_users', permissions)
        self.assertIn('api.can_view_all_data', permissions)
    
    def test_unauthenticated_user_gets_401(self):
        """Nicht eingeloggte User erhalten 401 bei /api/auth/user/."""
        self.logout()
        
        response = self.client.get('/api/auth/user/')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class PermissionHierarchyTestCase(APITestCase):
    """Tests für die Permission-Hierarchie zwischen Gruppen."""
    
    def test_basis_permissions_subset_of_erweiterung(self):
        """Alle Basis-Permissions sind auch in Erweiterung enthalten."""
        self.authenticate_as_basis()
        basis_response = self.client.get('/api/auth/user/')
        basis_perms = set(basis_response.data['permissions'])
        
        self.authenticate_as_erweiterung()
        erw_response = self.client.get('/api/auth/user/')
        erw_perms = set(erw_response.data['permissions'])
        
        # Basis ist Teilmenge von Erweiterung
        self.assertTrue(
            basis_perms.issubset(erw_perms),
            f"Basis-Permissions sollten Teilmenge von Erweiterung sein. "
            f"Fehlend: {basis_perms - erw_perms}"
        )
    
    def test_erweiterung_permissions_subset_of_admin(self):
        """Alle Erweiterung-Permissions sind auch in Admin enthalten."""
        self.authenticate_as_erweiterung()
        erw_response = self.client.get('/api/auth/user/')
        erw_perms = set(erw_response.data['permissions'])
        
        self.authenticate_as_admin()
        admin_response = self.client.get('/api/auth/user/')
        admin_perms = set(admin_response.data['permissions'])
        
        # Erweiterung ist Teilmenge von Admin
        self.assertTrue(
            erw_perms.issubset(admin_perms),
            f"Erweiterung-Permissions sollten Teilmenge von Admin sein. "
            f"Fehlend: {erw_perms - admin_perms}"
        )
    
    def test_no_perm_user_has_no_api_permissions(self):
        """User ohne Gruppe hat keine API-Permissions."""
        self.authenticate_as_no_perm()
        
        response = self.client.get('/api/auth/user/')
        
        permissions = response.data['permissions']
        api_permissions = [p for p in permissions if p.startswith('api.')]
        
        self.assertEqual(
            len(api_permissions), 0,
            f"User ohne Gruppe sollte keine API-Permissions haben, hat aber: {api_permissions}"
        )
