from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from api.models import Konto, KlientIn, Fall, Anfrage

class BaseApiTestCase(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = Konto.objects.create_user(
            mail_mb="advisor@test.com",
            password="securepassword",
            vorname_mb="Sarah",
            nachname_mb="Schmidt",
            rolle_mb="B"
        )
        
        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=25,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Studentin",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Webseite"
        )

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

class AuthenticationRequiredTest(APITestCase):

    def test_unauthenticated_access_denied(self):
        url = reverse('klientin-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class KlientValidationTest(BaseApiTestCase):

    def test_missing_required_field(self):
        url = reverse('klientin-list')
        data = {
            "klient_alter": 20  # missing required fields
        }

        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("klient_rolle", response.data)

class FallDeleteTest(BaseApiTestCase):

    def test_delete_fall(self):
        fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.user
        )

        url = reverse('fall-detail', args=[fall.fall_id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Fall.objects.filter(fall_id=fall.fall_id).exists())

class KlientFilterTest(BaseApiTestCase):

    def test_filter_by_wohnort(self):
        url = reverse('klientin-list') + "?klient_wohnort=LS"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)


class KlientViewSetTest(BaseApiTestCase):
    
    def test_get_klient_list(self):
        url = reverse('klientin-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_post_new_klient(self):
        """Test creating a client using APIClient's automatic JSON formatting."""
        url = reverse('klientin-list')
        data = {
            "klient_rolle": "B",
            "klient_alter": 22,
            "klient_geschlechtsidentitaet": "TN",
            "klient_sexualitaet": "B",
            "klient_wohnort": "NS",
            "klient_staatsangehoerigkeit": "DE",
            "klient_beruf": "Azubi",
            "klient_schwerbehinderung": "N",
            "klient_kontaktpunkt": "Empfehlung"
        }
        
        # Note: No json.dumps() needed, just format='json'
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(KlientIn.objects.count(), 2)

class AnfrageViewSetTest(BaseApiTestCase):

    def test_create_anfrage_with_relation(self):
        fall = Fall.objects.create(klient=self.klient, mitarbeiterin=self.user)
        url = reverse('anfrage-list')
        
        data = {
            "anfrage_weg": "Telefon",
            "anfrage_ort": "LS",
            "anfrage_person": "B",
            "anfrage_art": "B",
            "fall": fall.fall_id,
            "mitarbeiterin": self.user.id,
            "anfrage_datum": timezone.now().date() 
        }
        
        response = self.client.post(url, data, format='json')
        
        if response.status_code != 201:
            print(f"Error Details: {response.data}") # Debug helper
            
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_anfrage_one_to_one_constraint(self):
        """Test that DRF correctly handles the OneToOne constraint error."""
        fall = Fall.objects.create(klient=self.klient, mitarbeiterin=self.user)
        
        # Create first inquiry
        Anfrage.objects.create(
            anfrage_weg="Mail", anfrage_ort="LS", 
            anfrage_person="B", anfrage_art="B", fall=fall
        )
        
        # Try to link a second inquiry to the SAME fall via API
        url = reverse('anfrage-list')
        data = {
            "anfrage_weg": "Vor Ort",
            "anfrage_ort": "LS",
            "anfrage_person": "B",
            "anfrage_art": "B",
            "fall": fall.fall_id
        }
        
        response = self.client.post(url, data, format='json')
        
        # DRF ViewSets usually return 400 Bad Request for integrity errors caught in serialization
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class BeratungsterminViewSetTest(BaseApiTestCase):
    
    def test_update_notizen(self):
        """Test PATCH update on a specific appointment."""
        from api.models import Beratungstermin
        import datetime
        
        fall = Fall.objects.create(klient=self.klient, mitarbeiterin=self.user)
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            anzahl_beratungen=1,
            termin_beratung=datetime.date.today(),
            beratungsart="P",
            fall=fall
        )
        
        url = reverse('beratungstermin-detail', args=[termin.pk])
        data = {"notizen_beratung": "Klientin wirkte sehr gefasst."}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['notizen_beratung'], data['notizen_beratung'])

