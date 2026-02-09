from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from api.models import Konto, Fall, KlientIn

class StatistikAPITests(APITestCase):
    def setUp(self):
        # Create user
        self.user = Konto.objects.create_superuser(
            mail_mb='test@example.com',
            password='testpassword',
            vorname_mb='Test',
            nachname_mb='User'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_filters(self):
        """
        Ensure we can retrieve filters.
        """
        url = '/api/statistik/filters/' # Using the singular alias
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('filters', response.data)
        print("\nFILTERS RESPONSE:", response.data)

    def test_get_presets(self):
        """
        Ensure we can retrieve empty presets.
        """
        url = '/api/statistik/presets/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('presets', response.data)
        print("\nPRESETS RESPONSE:", response.data)

    def test_post_query(self):
        """
        Ensure query returns structure and data.
        """
        url = '/api/statistik/query/'
        data = {
            "zeitraum_start": "2024-01-01",
            "zeitraum_ende": "2024-12-31"
        }
        response = self.client.post(url, data, format='json')
        if response.status_code != 200:
            print("\nQUERY FAILED. Status:", response.status_code)
            print("Detail:", response.data)
        else:
            print("\nQUERY SUCCESS. Keys:", response.data.keys())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('structure', response.data)
        self.assertIn('data', response.data)
        
        # Check structure correctness deeply
        structure = response.data['structure']
        self.assertIn('auslastung', structure)
        self.assertIn('berichtsdaten', structure)
        
        print("\nQUERY RESPONSE KEYS:", response.data.keys())
        # print("\nQUERY DATA SAMPLE:", response.data['data']['auslastung']['beratungen'])
