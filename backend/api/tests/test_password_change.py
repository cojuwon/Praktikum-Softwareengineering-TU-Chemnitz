from rest_framework import status
from api.tests.base import APITestCase

class PasswordChangeTestCase(APITestCase):
    """
    Testet den Password-Change Endpoint (/api/auth/password/change/).
    Stellt sicher, dass das alte Passwort korrekt validiert wird (Kein Placebo).
    """

    def test_password_change_requires_old_password(self):
        """
        Der Password-Change Endpoint MUSS das alte Passwort verlangen.
        """
        self.client.force_authenticate(user=self.basis_user) # Authenticate setup in base.py

        # Versuche Passwort zu ändern OHNE old_password
        data = {
            'new_password1': 'newPassword123!',
            'new_password2': 'newPassword123!'
        }
        
        response = self.client.post('/api/auth/password/change/', data)
        
        # Sollte fehlschlagen (400 Bad Request) weil old_password fehlt
        # Falls dies fehlschlägt (200 OK), ist der Fehler reproduziert.
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST, 
                         "Passwortänderung ohne altes Passwort muss abgelehnt werden!")
        self.assertIn('old_password', response.data, "Fehlermeldung sollte 'old_password' enthalten.")

    def test_password_change_validates_old_password(self):
        """
        Der Password-Change Endpoint MUSS das alte Passwort validieren.
        """
        self.client.force_authenticate(user=self.basis_user)

        # Versuche Passwort zu ändern mit FALSCHEM old_password
        data = {
            'old_password': 'wrongPassword',
            'new_password1': 'newPassword123!',
            'new_password2': 'newPassword123!'
        }
        
        response = self.client.post('/api/auth/password/change/', data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST,
                         "Passwortänderung mit falschem alten Passwort muss abgelehnt werden!")
        
    def test_password_change_success_with_correct_old_password(self):
        """
        Passwortänderung sollte klappen wenn altes Passwort korrekt ist.
        """
        self.client.force_authenticate(user=self.basis_user)
        
        # Korrektes altes Passwort (siehe api/tests/base.py) ist 'test1234'
        data = {
            'old_password': 'test1234',
            'new_password1': 'newPassword123!',
            'new_password2': 'newPassword123!'
        }
        
        response = self.client.post('/api/auth/password/change/', data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK, 
                         "Passwortänderung mit korrektem alten Passwort sollte erfolgreich sein.")
