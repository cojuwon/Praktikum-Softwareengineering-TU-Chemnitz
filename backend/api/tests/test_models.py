from django.db import DataError, IntegrityError
from django.test import TestCase, TransactionTestCase
from django.utils import timezone
from django.db.models import ProtectedError
from django.core.exceptions import ValidationError

from api.models import (
    Konto, KlientIn, Preset, Fall, Beratungstermin,
    Begleitung, Gewalttat, Gewaltfolge, Anfrage, Statistik
)

#Einträge aus den Enums sind aktuell noch hardcoded, sollte für das Softwarepraktikum aber kein Problem sein, da die sich nicht ändern

class BaseModelTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        # 1. The Counselor
        cls.konto = Konto.objects.create_user(
            mail_mb="test@example.com",
            password="securepassword",
            vorname_mb="Max",
            nachname_mb="Mustermann",
        )

        # 2. The Client
        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=30,
            klient_geschlechtsidentitaet="CW",
            klient_staatsangehoerigkeit="DE",
            klient_kontaktpunkt="Internet",
        )

        # 3. The Case (The "Protector")
        cls.fall = Fall.objects.create(
            klient=cls.klient,
            mitarbeiterin=cls.konto
        )

"""
Tests for the Konto model.

Covered aspects:
- Successful creation of regular users
- Successful creation of superusers
- Required fields and validation errors
- Email uniqueness constraint
- Email normalization
- Default field values (rolle_mb, is_active, is_staff, date_joined)
- Password hashing and authentication
- String representation (__str__)
- Manager behavior (create_user, create_superuser)
"""

class KontoModelTest(TestCase):

    def test_create_konto_success(self):
        konto = Konto.objects.create_user(
            mail_mb="user@example.com",
            password="securepassword",
            vorname_mb="Max",
            nachname_mb="Mustermann",
        )

        self.assertEqual(konto.mail_mb, "user@example.com")
        self.assertTrue(konto.check_password("securepassword"))
        self.assertEqual(konto.rolle_mb, "B")  # default role
        self.assertTrue(konto.is_active)
        self.assertFalse(konto.is_staff)
        self.assertIsNotNone(konto.date_joined)

    def test_create_konto_string_representation(self):
        konto = Konto.objects.create_user(
            mail_mb="user2@example.com",
            password="password123",
            vorname_mb="Erika",
            nachname_mb="Mustermann",
            rolle_mb="E",
        )

        self.assertEqual(str(konto), "Erika Mustermann (E)")

    def test_password_is_hashed(self):
        konto = Konto.objects.create_user(
            mail_mb="hash@test.com",
            password="plainpassword",
            vorname_mb="Hash",
            nachname_mb="Test",
        )

        self.assertNotEqual(konto.password, "plainpassword")
        self.assertTrue(konto.check_password("plainpassword"))

    def test_email_is_required(self):
        with self.assertRaises(ValueError):
            Konto.objects.create_user(
                mail_mb=None,
                password="password123",
                vorname_mb="No",
                nachname_mb="Mail",
            )

    def test_empty_names_not_allowed(self):
        konto = Konto(
            mail_mb="invalid@example.com",
            vorname_mb="",
            nachname_mb="",
        )
        konto.set_password("password123")

        with self.assertRaises(ValidationError):
            konto.full_clean()
            konto.save()

    def test_name_too_long_raises_error(self):
        long_name = "A" * 300

        konto = Konto(
            mail_mb="toolong@example.com",
            vorname_mb=long_name,
            nachname_mb="Test",
        )
        konto.set_password("password123")

        with self.assertRaises(ValidationError):
            konto.full_clean()
            konto.save()

    def test_email_normalization(self):
        konto = Konto.objects.create_user(
            mail_mb="USER@EXAMPLE.COM",
            password="password123",
            vorname_mb="Norm",
            nachname_mb="Mail",
        )

        self.assertEqual(konto.mail_mb, "USER@example.com")


class KontoDuplicateEmailTest(TransactionTestCase):
    """
    Uses TransactionTestCase to reliably test DB-level uniqueness constraints.
    """

    def test_duplicate_email_not_allowed(self):
        Konto.objects.create_user(
            mail_mb="duplicate@example.com",
            password="password123",
            vorname_mb="User",
            nachname_mb="One",
        )

        with self.assertRaises(IntegrityError):
            Konto.objects.create_user(
                mail_mb="duplicate@example.com",
                password="password456",
                vorname_mb="User",
                nachname_mb="Two",
            )


class KontoSuperuserTest(TestCase):

    def test_create_superuser(self):
        admin = Konto.objects.create_superuser(
            mail_mb="admin@example.com",
            password="adminpassword",
            vorname_mb="Admin",
            nachname_mb="User",
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertEqual(admin.rolle_mb, "AD")
        self.assertTrue(admin.check_password("adminpassword"))

    def test_superuser_has_required_flags(self):
        admin = Konto.objects.create_superuser(
            mail_mb="flags@example.com",
            password="password",
            vorname_mb="Flag",
            nachname_mb="Test",
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)


class KontoMetaConfigurationTest(TestCase):

    def test_username_field(self):
        self.assertEqual(Konto.USERNAME_FIELD, "mail_mb")

    def test_required_fields(self):
        self.assertIn("vorname_mb", Konto.REQUIRED_FIELDS)
        self.assertIn("nachname_mb", Konto.REQUIRED_FIELDS)

"""
Tests for the KlientIn model.

Covered aspects:
- Successful creation with valid data
- Required fields and validation
- Enum/choice field validation
- Min/Max validators (age, dolmetschungsstunden)
- Default field values
- Optional vs required fields
- String representation (__str__)
"""

class KlientInModelTest(TestCase):

    def setUp(self):
        self.valid_data = {
            "klient_rolle": "B",
            "klient_alter": 30,
            "klient_geschlechtsidentitaet": "CW",
            "klient_sexualitaet": "H",
            "klient_wohnort": "LS",
            "klient_staatsangehoerigkeit": "DE",
            "klient_beruf": "Angestellte:r",
            "klient_schwerbehinderung": "N",
            "klient_kontaktpunkt": "Internet",
            "klient_dolmetschungsstunden": 0,
        }

    def test_create_klientin_success(self):
        klient = KlientIn.objects.create(**self.valid_data)

        self.assertEqual(klient.klient_rolle, "B")
        self.assertEqual(klient.klient_alter, 30)
        self.assertEqual(klient.klient_dolmetschungsstunden, 0)

    def test_string_representation(self):
        klient = KlientIn.objects.create(**self.valid_data)
        self.assertIn("Klient:in", str(klient))

    def test_required_fields_missing(self):
        klient = KlientIn(
            klient_rolle="B",
            klient_alter=25,
        )

        with self.assertRaises(ValidationError):
            klient.full_clean()

    def test_invalid_enum_values_raise_validation_error(self):
        invalid_data = self.valid_data.copy()
        invalid_data["klient_rolle"] = "X"
        invalid_data["klient_geschlechtsidentitaet"] = "ZZ"

        klient = KlientIn(**invalid_data)

        with self.assertRaises(ValidationError):
            klient.full_clean()

    def test_age_cannot_be_negative(self):
        invalid_data = self.valid_data.copy()
        invalid_data["klient_alter"] = -1

        klient = KlientIn(**invalid_data)

        with self.assertRaises(ValidationError):
            klient.full_clean()

    def test_age_cannot_exceed_max_value(self):
        invalid_data = self.valid_data.copy()
        invalid_data["klient_alter"] = 300

        klient = KlientIn(**invalid_data)

        with self.assertRaises(ValidationError):
            klient.full_clean()

    def test_age_can_be_null(self):
        valid_data = self.valid_data.copy()
        valid_data["klient_alter"] = None

        klient = KlientIn.objects.create(**valid_data)

        self.assertIsNone(klient.klient_alter)

    def test_dolmetschungsstunden_cannot_be_negative(self):
        invalid_data = self.valid_data.copy()
        invalid_data["klient_dolmetschungsstunden"] = -5

        klient = KlientIn(**invalid_data)

        with self.assertRaises(ValidationError):
            klient.full_clean()

    def test_optional_text_fields_can_be_blank(self):
        valid_data = self.valid_data.copy()
        valid_data["klient_dolmetschungssprachen"] = ""
        valid_data["klient_notizen"] = ""

        klient = KlientIn.objects.create(**valid_data)

        self.assertEqual(klient.klient_dolmetschungssprachen, "")
        self.assertEqual(klient.klient_notizen, "")

    def test_schwerbehinderung_detail_optional(self):
        valid_data = self.valid_data.copy()
        valid_data["klient_schwerbehinderung_detail"] = ""

        klient = KlientIn.objects.create(**valid_data)

        self.assertEqual(klient.klient_schwerbehinderung_detail, "")

    def test_long_strings_raise_validation_error(self):
        invalid_data = self.valid_data.copy()
        invalid_data["klient_staatsangehoerigkeit"] = "A" * 300 # Max is likely 100 or 2

        klient = KlientIn(**invalid_data)

        with self.assertRaises(ValidationError):
            klient.full_clean()

"""
Tests for the Fall model.

Covered aspects:
- Successful creation of a Fall
- Required foreign key relations (KlientIn, Konto)
- String representation (__str__)
- ForeignKey behavior on deletion (PROTECT, SET_NULL)
- Reverse relations from related models
"""


class FallModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="berater@example.com",
            password="password123",
            vorname_mb="Berater",
            nachname_mb="Test",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=35,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Angestellte:r",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Internet",
            klient_dolmetschungsstunden=0,
        )

    def test_create_fall_success(self):
        fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.konto,
        )

        self.assertEqual(fall.klient, self.klient)
        self.assertEqual(fall.mitarbeiterin, self.konto)

    def test_string_representation(self):
        fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.konto,
        )

        self.assertIn("Fall", str(fall))
        self.assertIn(str(self.klient.klient_id), str(fall))

    def test_fall_requires_klient(self):
        fall = Fall(
            mitarbeiterin=self.konto,
        )

        with self.assertRaises(ValidationError):
            fall.full_clean()

    def test_mitarbeiterin_can_be_null(self):
        fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=None,
        )

        self.assertIsNone(fall.mitarbeiterin)

    def test_klient_protected_on_delete(self):
        fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.konto,
        )

        with self.assertRaises(ProtectedError):
            self.klient.delete()

        self.assertTrue(Fall.objects.filter(fall_id=fall.fall_id).exists())

    def test_mitarbeiterin_set_null_on_delete(self):
        fall = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.konto,
        )

        self.konto.delete()
        fall.refresh_from_db()

        self.assertIsNone(fall.mitarbeiterin)


class FallReverseRelationTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="berater2@example.com",
            password="password123",
            vorname_mb="Berater",
            nachname_mb="Zwei",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="A",
            klient_alter=28,
            klient_geschlechtsidentitaet="CM",
            klient_sexualitaet="H",
            klient_wohnort="LL",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Student:in",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Mail",
            klient_dolmetschungsstunden=0,
        )

    def test_multiple_faelle_for_one_klient(self):
        fall1 = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.konto,
        )
        fall2 = Fall.objects.create(
            klient=self.klient,
            mitarbeiterin=self.konto,
        )

        self.assertEqual(Fall.objects.filter(klient=self.klient).count(), 2)
        self.assertIn(fall1, Fall.objects.all())
        self.assertIn(fall2, Fall.objects.all())

"""
Tests for the Beratungstermin model.

Covered aspects:
- Successful creation with valid data
- Required fields and choice validation
- MinValueValidator on anzahl_beratungen
- Default values
- ForeignKey relations (Konto, Fall)
- Reverse relation from Fall (beratungstermine)
- Cascade delete behavior when Fall is deleted
- String representation (__str__)
"""

class BeratungsterminModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="berater@example.com",
            password="password123",
            vorname_mb="Berater",
            nachname_mb="Test",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=40,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Angestellte:r",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Telefon",
            klient_dolmetschungsstunden=0,
        )

        cls.fall = Fall.objects.create(
            klient=cls.klient,
            mitarbeiterin=cls.konto,
        )

    def test_create_beratungstermin_success(self):
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            anzahl_beratungen=1,
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            berater=self.konto,
            fall=self.fall,
        )

        self.assertEqual(termin.berater, self.konto)
        self.assertEqual(termin.fall, self.fall)
        self.assertEqual(self.fall.beratungstermine.count(), 1)

    def test_string_representation(self):
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            anzahl_beratungen=1,
            termin_beratung=timezone.now().date(),
            beratungsart="T",
            fall=self.fall,
        )

        self.assertIn("Beratungstermin", str(termin))

    def test_required_fields_missing(self):
        termin = Beratungstermin(
            anzahl_beratungen=1,
            fall=self.fall,
        )

        with self.assertRaises(ValidationError):
            termin.full_clean()

    def test_invalid_choice_fields(self):
        termin = Beratungstermin(
            beratungsstelle="XX",
            anzahl_beratungen=1,
            termin_beratung=timezone.now().date(),
            beratungsart="Z",
            fall=self.fall,
        )

        with self.assertRaises(ValidationError):
            termin.full_clean()

    def test_anzahl_beratungen_cannot_be_negative(self):
        termin = Beratungstermin(
            beratungsstelle="LS",
            anzahl_beratungen=-1,
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            fall=self.fall,
        )

        with self.assertRaises(ValidationError):
            termin.full_clean()

    def test_anzahl_beratungen_default_value(self):
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            fall=self.fall,
        )

        self.assertEqual(termin.anzahl_beratungen, 1)

    def test_berater_can_be_null(self):
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            anzahl_beratungen=1,
            termin_beratung=timezone.now().date(),
            beratungsart="V",
            fall=self.fall,
            berater=None,
        )

        self.assertIsNone(termin.berater)

    def test_reverse_relation_from_fall(self):
        Beratungstermin.objects.create(
            beratungsstelle="LS",
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            fall=self.fall,
        )

        Beratungstermin.objects.create(
            beratungsstelle="NS",
            termin_beratung=timezone.now().date(),
            beratungsart="T",
            fall=self.fall,
        )

        self.assertEqual(self.fall.beratungstermine.count(), 2)

    def test_cascade_delete_on_fall(self):
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            fall=self.fall,
        )

        self.fall.delete()

        self.assertFalse(
            Beratungstermin.objects.filter(beratungs_id=termin.beratungs_id).exists()
        )

"""
Tests for the Begleitung model.

Covered aspects:
- Successful creation with valid data
- Required fields and choice validation
- MinValueValidator on numeric fields
- Default values
- ForeignKey relations (KlientIn, Fall)
- Reverse relation from Fall (begleitungen)
- Cascade delete behavior on related objects
- String representation (__str__)
"""

class BegleitungModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="berater@example.com",
            password="password123",
            vorname_mb="Berater",
            nachname_mb="Test",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=33,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Angestellte:r",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Mail",
            klient_dolmetschungsstunden=0,
        )

        cls.fall = Fall.objects.create(
            klient=cls.klient,
            mitarbeiterin=cls.konto,
        )

    def test_create_begleitung_success(self):
        begleitung = Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
            anzahl_begleitungen=1,
            anzahl_verweisungen=0,
        )

        self.assertEqual(begleitung.klient, self.klient)
        self.assertEqual(begleitung.fall, self.fall)

    def test_string_representation(self):
        begleitung = Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="G",
            anzahl_begleitungen=1,
        )

        self.assertIn("Begleitung", str(begleitung))
        self.assertIn(str(self.klient.klient_id), str(begleitung))

    def test_required_fields_missing(self):
        begleitung = Begleitung(
            klient=self.klient,
            fall=self.fall,
        )

        with self.assertRaises(ValidationError):
            begleitung.full_clean()

    def test_invalid_choice_fields(self):
        begleitung = Begleitung(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="XX",
            anzahl_begleitungen=1,
        )

        with self.assertRaises(ValidationError):
            begleitung.full_clean()

    def test_anzahl_begleitungen_cannot_be_negative(self):
        begleitung = Begleitung(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
            anzahl_begleitungen=-1,
        )

        with self.assertRaises(ValidationError):
            begleitung.full_clean()

    def test_anzahl_verweisungen_cannot_be_negative(self):
        begleitung = Begleitung(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
            anzahl_verweisungen=-2,
        )

        with self.assertRaises(ValidationError):
            begleitung.full_clean()

    def test_default_values(self):
        begleitung = Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
        )

        self.assertEqual(begleitung.anzahl_begleitungen, 1)
        self.assertEqual(begleitung.anzahl_verweisungen, 0)

    def test_reverse_relation_from_fall(self):
        Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
        )

        Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="G",
        )

        self.assertEqual(self.fall.begleitungen.count(), 2)

    def test_cascade_delete_on_fall(self):
        begleitung = Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
        )

        self.fall.delete()

        self.assertFalse(
            Begleitung.objects.filter(begleitungs_id=begleitung.begleitungs_id).exists()
        )

    def test_cascade_delete_on_klient(self):
        begleitung = Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P"
        )

        self.fall.delete()
        self.klient.delete()

        self.assertFalse(Begleitung.objects.filter(pk=begleitung.pk).exists())

"""
Tests for the Gewalttat model.

Covered aspects:
- Successful creation with valid data
- Required fields and validation
- Choice/enum field validation
- MinValueValidator on numeric fields
- Default values
- ForeignKey relations (KlientIn, Fall)
- Reverse relation from Fall (gewalttaten)
- Cascade delete behavior on related objects
- String representation (__str__)
"""



class GewalttatModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="berater@example.com",
            password="password123",
            vorname_mb="Berater",
            nachname_mb="Test",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=29,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Angestellte:r",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Mail",
            klient_dolmetschungsstunden=0,
        )

        cls.fall = Fall.objects.create(
            klient=cls.klient,
            mitarbeiterin=cls.konto,
        )

    def test_create_gewalttat_success(self):
        tat = Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Körperliche Gewalt",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
        )

        self.assertEqual(tat.klient, self.klient)
        self.assertEqual(tat.fall, self.fall)
        self.assertEqual(self.fall.gewalttaten.count(), 1)

    def test_string_representation(self):
        tat = Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="J",
            tat_anzahl_vorfaelle="M",
            tat_anzahl_taeter_innen="M",
            tat_art="Psychische Gewalt",
            tatort="L",
            tat_anzeige="E",
            tat_medizinische_versorgung="N",
            tat_spurensicherung="N",
        )

        self.assertIn("Gewalttat", str(tat))
        self.assertIn(str(self.klient.klient_id), str(tat))

    def test_required_fields_missing(self):
        tat = Gewalttat(
            klient=self.klient,
            fall=self.fall,
        )

        with self.assertRaises(ValidationError):
            tat.full_clean()

    def test_invalid_choice_fields(self):
        tat = Gewalttat(
            klient=self.klient,
            fall=self.fall,
            tat_alter="X",
            tat_zeitraum="Y",
            tat_anzahl_vorfaelle="Z",
            tat_anzahl_taeter_innen="9",
            tat_art="Test",
            tatort="XX",
            tat_anzeige="?",
            tat_medizinische_versorgung="!",
            tat_spurensicherung="!",
        )

        with self.assertRaises(ValidationError):
            tat.full_clean()

    def test_default_numeric_values(self):
        tat = Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Test",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
        )

        self.assertEqual(tat.tat_mitbetroffene_kinder, 0)
        self.assertEqual(tat.tat_direktbetroffene_kinder, 0)

    def test_numeric_fields_cannot_be_negative(self):
        tat = Gewalttat(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Test",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
            tat_mitbetroffene_kinder=-1,
        )

        with self.assertRaises(ValidationError):
            tat.full_clean()

    def test_reverse_relation_from_fall(self):
        Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Test 1",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
        )

        Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="N",
            tat_zeitraum="J",
            tat_anzahl_vorfaelle="M",
            tat_anzahl_taeter_innen="M",
            tat_art="Test 2",
            tatort="LL",
            tat_anzeige="J",
            tat_medizinische_versorgung="N",
            tat_spurensicherung="J",
        )

        self.assertEqual(self.fall.gewalttaten.count(), 2)

    def test_cascade_delete_on_fall(self):
        tat = Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Test",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
        )

        self.fall.delete()

        self.assertFalse(
            Gewalttat.objects.filter(tat_id=tat.tat_id).exists()
        )

    def test_cascade_delete_on_klient(self):
        tat = Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Test",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
        )

        self.fall.delete()
        self.klient.delete()

        self.assertFalse(
            Gewalttat.objects.filter(tat_id=tat.tat_id).exists()
        )

"""
Tests for the Gewaltfolge model.

Covered aspects:
- Successful creation with valid data
- Enforcement of OneToOne relationship with Gewalttat
- Required fields and validation
- Choice/enum field validation
- Cascade delete behavior from Gewalttat
- String representation (__str__)
"""

class GewaltfolgeModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="berater@example.com",
            password="password123",
            vorname_mb="Berater",
            nachname_mb="Test",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=27,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Angestellte:r",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Mail",
            klient_dolmetschungsstunden=0,
        )

        cls.fall = Fall.objects.create(
            klient=cls.klient,
            mitarbeiterin=cls.konto,
        )

        cls.tat = Gewalttat.objects.create(
            klient=cls.klient,
            fall=cls.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Körperliche Gewalt",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
        )

    def test_create_gewaltfolge_success(self):
        folge = Gewaltfolge.objects.create(
            gewalttat=self.tat,
            psychische_folgen="A",
            koerperliche_folgen="N",
            finanzielle_folgen="N",
            arbeitseinschraenkung="N",
            verlust_arbeitsstelle="N",
            soziale_isolation="N",
            suizidalitaet="N",
            keine_angabe="N",
        )

        self.assertEqual(folge.gewalttat, self.tat)

    def test_string_representation(self):
        folge = Gewaltfolge.objects.create(
            gewalttat=self.tat,
            psychische_folgen="D",
            koerperliche_folgen="S",
            finanzielle_folgen="J",
            arbeitseinschraenkung="J",
            verlust_arbeitsstelle="N",
            soziale_isolation="J",
            suizidalitaet="N",
            keine_angabe="N",
        )

        self.assertIn("Folgen für Gewalttat", str(folge))
        self.assertIn(str(self.tat.tat_id), str(folge))

    def test_one_to_one_enforced(self):
        Gewaltfolge.objects.create(
            gewalttat=self.tat,
            psychische_folgen="A",
            koerperliche_folgen="N",
            finanzielle_folgen="N",
            arbeitseinschraenkung="N",
            verlust_arbeitsstelle="N",
            soziale_isolation="N",
            suizidalitaet="N",
            keine_angabe="N",
        )

        with self.assertRaises(Exception):
            Gewaltfolge.objects.create(
                gewalttat=self.tat,
                psychische_folgen="A",
                koerperliche_folgen="N",
                finanzielle_folgen="N",
                arbeitseinschraenkung="N",
                verlust_arbeitsstelle="N",
                soziale_isolation="N",
                suizidalitaet="N",
                keine_angabe="N",
            )

    def test_required_fields_missing(self):
        folge = Gewaltfolge(
            gewalttat=self.tat,
        )

        with self.assertRaises(ValidationError):
            folge.full_clean()

    def test_invalid_choice_fields(self):
        folge = Gewaltfolge(
            gewalttat=self.tat,
            psychische_folgen="XXX",
            koerperliche_folgen="YY",
            finanzielle_folgen="?",
            arbeitseinschraenkung="?",
            verlust_arbeitsstelle="?",
            soziale_isolation="?",
            suizidalitaet="?",
            keine_angabe="?",
        )

        with self.assertRaises(ValidationError):
            folge.full_clean()

    def test_optional_text_fields_can_be_blank(self):
        folge = Gewaltfolge.objects.create(
            gewalttat=self.tat,
            psychische_folgen="A",
            koerperliche_folgen="N",
            finanzielle_folgen="N",
            arbeitseinschraenkung="N",
            verlust_arbeitsstelle="N",
            soziale_isolation="N",
            suizidalitaet="N",
            keine_angabe="N",
            beeintraechtigungen="",
            weiteres="",
            folgen_notizen="",
        )

        self.assertEqual(folge.beeintraechtigungen, "")
        self.assertEqual(folge.weiteres, "")
        self.assertEqual(folge.folgen_notizen, "")

    def test_cascade_delete_on_gewalttat(self):
        folge = Gewaltfolge.objects.create(
            gewalttat=self.tat,
            psychische_folgen="A",
            koerperliche_folgen="N",
            finanzielle_folgen="N",
            arbeitseinschraenkung="N",
            verlust_arbeitsstelle="N",
            soziale_isolation="N",
            suizidalitaet="N",
            keine_angabe="N",
        )

        tat_id = self.tat.pk
        self.tat.delete()

        self.assertFalse(
            Gewaltfolge.objects.filter(gewalttat_id=tat_id).exists()
        )

"""
Tests for the Anfrage model.

Covered aspects:
- Successful creation with valid data
- Required fields and validation
- Choice/enum field validation
- Default values
- ForeignKey relation to Konto (mitarbeiterin)
- OneToOne relations to Fall and Beratungstermin
- Enforcement of OneToOne constraints
- Deletion behavior (SET_NULL)
- String representation (__str__)
"""


class AnfrageModelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="berater@example.com",
            password="password123",
            vorname_mb="Berater",
            nachname_mb="Test",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=31,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Angestellte:r",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Telefon",
            klient_dolmetschungsstunden=0,
        )

        cls.fall = Fall.objects.create(
            klient=cls.klient,
            mitarbeiterin=cls.konto,
        )

        cls.termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            fall=cls.fall,
        )

    def test_create_anfrage_success(self):
        anfrage = Anfrage.objects.create(
            anfrage_weg="Telefon",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            mitarbeiterin=self.konto,
            fall=self.fall,
            beratungstermin=self.termin,
        )

        self.assertEqual(anfrage.mitarbeiterin, self.konto)
        self.assertEqual(anfrage.fall, self.fall)
        self.assertEqual(anfrage.beratungstermin, self.termin)

    def test_string_representation(self):
        anfrage = Anfrage.objects.create(
            anfrage_weg="Mail",
            anfrage_ort="LS",
            anfrage_person="A",
            anfrage_art="R",
            mitarbeiterin=self.konto,
        )

        self.assertIn("Anfrage", str(anfrage))
        self.assertIn("R", str(anfrage))

    def test_required_fields_missing(self):
        anfrage = Anfrage()

        with self.assertRaises(ValidationError):
            anfrage.full_clean()

    def test_invalid_choice_fields(self):
        anfrage = Anfrage(
            anfrage_weg="Mail",
            anfrage_ort="XX",
            anfrage_person="YYY",
            anfrage_art="?",
        )

        with self.assertRaises(ValidationError):
            anfrage.full_clean()

    def test_default_date_is_set(self):
        anfrage = Anfrage.objects.create(
            anfrage_weg="Mail",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
        )

        self.assertIsNotNone(anfrage.anfrage_datum)

    def test_fall_one_to_one_enforced(self):
        Anfrage.objects.create(
            anfrage_weg="Mail",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            fall=self.fall,
        )

        with self.assertRaises(Exception):
            Anfrage.objects.create(
                anfrage_weg="Telefon",
                anfrage_ort="LS",
                anfrage_person="B",
                anfrage_art="B",
                fall=self.fall,
            )

    def test_beratungstermin_one_to_one_enforced(self):
        Anfrage.objects.create(
            anfrage_weg="Mail",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            beratungstermin=self.termin,
        )

        with self.assertRaises(Exception):
            Anfrage.objects.create(
                anfrage_weg="Telefon",
                anfrage_ort="LS",
                anfrage_person="B",
                anfrage_art="B",
                beratungstermin=self.termin,
            )

    def test_delete_fall_sets_null(self):
        anfrage = Anfrage.objects.create(
            anfrage_weg="Mail",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            fall=self.fall,
        )

        self.fall.delete()
        anfrage.refresh_from_db()

        self.assertIsNone(anfrage.fall)

    def test_delete_beratungstermin_sets_null(self):
        anfrage = Anfrage.objects.create(
            anfrage_weg="Mail",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            beratungstermin=self.termin,
        )

        self.termin.delete()
        anfrage.refresh_from_db()

        self.assertIsNone(anfrage.beratungstermin)

    def test_delete_mitarbeiterin_sets_null(self):
        anfrage = Anfrage.objects.create(
            anfrage_weg="Mail",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            mitarbeiterin=self.konto,
        )

        self.konto.delete()
        anfrage.refresh_from_db()

        self.assertIsNone(anfrage.mitarbeiterin)

#Erstmal nur ein Platzhalter Test für Preset Model, sollte später erweitert werden, sobald wir logik dafür implementiert haben

class PresetModelTest(BaseModelTestCase):

    def test_preset_m2m_relation(self):
        preset = Preset.objects.create(
            preset_daten={"feld": "wert"},
            preset_beschreibung="Test Preset",
            filterKriterien={"aktiv": True},
            ersteller=self.konto,
        )

        preset.berechtigte.add(self.konto)

        self.assertEqual(preset.berechtigte.count(), 1)
        self.assertIn(self.konto, preset.berechtigte.all())

    def test_preset_creator_relation(self):
        preset = Preset.objects.create(
            preset_daten={"a": 1},
            preset_beschreibung="Relation Test Preset",
            filterKriterien={"active": True},
            ersteller=self.konto,
        )

        self.assertEqual(preset.ersteller, self.konto)

    def test_preset_berechtigte_m2m(self):
        preset = Preset.objects.create(
            preset_daten={"a": 1},
            preset_beschreibung="M2M Test Preset",
            filterKriterien={},
            ersteller=self.konto,
        )

        preset.berechtigte.add(self.konto)

        self.assertIn(self.konto, preset.berechtigte.all())
        self.assertIn(preset, self.konto.teilbare_presets.all())

class DefaultValuesTest(BaseModelTestCase):

    def test_default_values_are_set(self):
        begleitung = Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
        )

        self.assertEqual(begleitung.anzahl_begleitungen, 1)
        self.assertEqual(begleitung.anzahl_verweisungen, 0)

class StatistikRelationsTest(BaseModelTestCase):

    def test_statistik_creator_and_preset(self):
        preset = Preset.objects.create(
            preset_daten={"x": 1},
            preset_beschreibung="Statistik Preset",
            filterKriterien={},
            ersteller=self.konto,
        )

        statistik = Statistik.objects.create(
            statistik_titel="Test Statistik",
            zeitraum_start=timezone.now().date(),
            zeitraum_ende=timezone.now().date(),
            ergebnis="dummy.pdf",
            creator=self.konto,
            preset=preset,
        )

        self.assertEqual(statistik.creator, self.konto)
        self.assertEqual(statistik.preset, preset)
