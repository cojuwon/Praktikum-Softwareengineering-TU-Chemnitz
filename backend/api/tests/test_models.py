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
    """
    Base class that creates commonly used objects.
    Other test classes inherit from this to avoid duplication.
    """

    @classmethod
    def setUpTestData(cls):
        cls.konto = Konto.objects.create_user(
            mail_mb="test@example.com",
            password="securepassword",
            vorname_mb="Max",
            nachname_mb="Mustermann",
            rolle_mb="B",
        )

        cls.klient = KlientIn.objects.create(
            klient_rolle="B",
            klient_alter=30,
            klient_geschlechtsidentitaet="CW",
            klient_sexualitaet="H",
            klient_wohnort="LS",
            klient_staatsangehoerigkeit="DE",
            klient_beruf="Angestellte:r",
            klient_schwerbehinderung="N",
            klient_kontaktpunkt="Internet",
            klient_dolmetschungsstunden=0,
        )

        cls.fall = Fall.objects.create(
            klient=cls.klient,
            mitarbeiterin=cls.konto
        )


class KontoModelTest(TestCase):

    def test_create_konto(self):
        konto = Konto.objects.create_user(
            mail_mb="user2@example.com",
            password="password123",
            vorname_mb="Erika",
            nachname_mb="Mustermann",
        )

        self.assertEqual(konto.mail_mb, "user2@example.com")
        self.assertTrue(konto.check_password("password123"))
        self.assertEqual(str(konto), "Erika Mustermann (B)")

    def test_create_konto_wrong_name_too_long(self):

        with self.assertRaises(DataError):

            konto = Konto.objects.create_user(
                mail_mb="user2@example.com",
                password="password123",
                vorname_mb="ErikaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaErikaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                nachname_mb="",
            )
            konto.set_password("password123")

            konto.full_clean() 
            konto.save()

    def test_create_konto_wrong_empty_name(self):

        with self.assertRaises(ValidationError):
            konto = Konto(
                mail_mb="user2@example.com",
                vorname_mb="",
                nachname_mb=""
            )
            konto.set_password("password123")
        
            konto.full_clean() 
            konto.save()


class KontoModelTestDuplicate(TransactionTestCase): # Testen für duplikate ist manchmal komisch mit TestCase, daher TransactionTestCase
    
    def test_create_konto_wrong_duplicate(self):
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

class KlientInModelTest(BaseModelTestCase):

    def test_klient_creation(self):
        self.assertEqual(self.klient.klient_alter, 30)
        self.assertEqual(self.klient.klient_rolle, "B")

    def test_klient_string(self):
        self.assertIn("Klient:in", str(self.klient))

    def test_klient_creation_wrong_enum_parameters(self):
        with self.assertRaises(ValidationError):
            KlientIn_falsche_rolle = KlientIn.objects.create(
                klient_rolle="H",
                klient_alter=30,
                klient_geschlechtsidentitaet="TO",
                klient_sexualitaet="H",
                klient_wohnort="LS",
                klient_staatsangehoerigkeit="DE",
                klient_beruf="Angestellte:r",
                klient_schwerbehinderung="N",
                klient_kontaktpunkt="Internet",
                klient_dolmetschungsstunden=0,
            )
            KlientIn_falsche_rolle.full_clean()
        
    def test_klient_creation_wrong_high_age(self):
        with self.assertRaises(ValidationError):
            alteKlientIn = KlientIn.objects.create(
                klient_rolle="A",
                klient_alter=300,
                klient_geschlechtsidentitaet="CW",
                klient_sexualitaet="H",
                klient_wohnort="LS",
                klient_staatsangehoerigkeit="DE",
                klient_beruf="Angestellte:r",
                klient_schwerbehinderung="N",
                klient_kontaktpunkt="Internet",
                klient_dolmetschungsstunden=0,
            )
            alteKlientIn.full_clean()

class FallModelTest(BaseModelTestCase):

    def test_fall_relations(self):
        self.assertEqual(self.fall.klient, self.klient)
        self.assertEqual(self.fall.mitarbeiterin, self.konto)

    def test_fall_string(self):
        self.assertIn("Fall", str(self.fall))


class BeratungsterminModelTest(BaseModelTestCase):

    def test_create_beratungstermin(self):
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            anzahl_beratungen=1,
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            berater=self.konto,
            fall=self.fall,
        )

        self.assertEqual(termin.fall, self.fall)
        self.assertEqual(termin.berater, self.konto)
        self.assertEqual(self.fall.beratungstermine.count(), 1)


class BegleitungModelTest(BaseModelTestCase):

    def test_create_begleitung(self):
        begleitung = Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            anzahl_begleitungen=1,
            art_begleitung="P",
        )

        self.assertEqual(begleitung.klient, self.klient)
        self.assertEqual(self.fall.begleitungen.count(), 1)


class GewalttatModelTest(BaseModelTestCase):

    def test_create_gewalttat(self):
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

        self.assertEqual(tat.fall, self.fall)
        self.assertEqual(self.fall.gewalttaten.count(), 1)


class GewaltfolgeModelTest(BaseModelTestCase):

    def test_one_to_one_gewaltfolge(self):
        tat = Gewalttat.objects.create(
            klient=self.klient,
            fall=self.fall,
            tat_alter="J",
            tat_zeitraum="N",
            tat_anzahl_vorfaelle="E",
            tat_anzahl_taeter_innen="1",
            tat_art="Psychische Gewalt",
            tatort="L",
            tat_anzeige="N",
            tat_medizinische_versorgung="J",
            tat_spurensicherung="N",
        )

        folge = Gewaltfolge.objects.create(
            gewalttat=tat,
            psychische_folgen="A",
            koerperliche_folgen="N",
            finanzielle_folgen="N",
            arbeitseinschraenkung="N",
            verlust_arbeitsstelle="N",
            soziale_isolation="N",
            suizidalitaet="N",
            keine_angabe="N",
        )

        self.assertEqual(folge.gewalttat, tat)


class AnfrageModelTest(BaseModelTestCase):

    def test_create_anfrage(self):
        anfrage = Anfrage.objects.create(
            anfrage_weg="Telefon",
            anfrage_ort="LS",
            anfrage_person="B",
            anfrage_art="B",
            mitarbeiterin=self.konto,
            fall=self.fall,
        )

        self.assertEqual(anfrage.fall, self.fall)
        self.assertEqual(anfrage.mitarbeiterin, self.konto)

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

class PresetRelationsTest(BaseModelTestCase):

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

class FallProtectTest(BaseModelTestCase):

    def test_klient_protects_fall_deletion(self):
        with self.assertRaises(ProtectedError):
            self.klient.delete()

        self.assertTrue(Fall.objects.filter(fall_id=self.fall.fall_id).exists())


class BeratungsterminCascadeTest(BaseModelTestCase):

    def test_fall_deletion_cascades_beratungstermine(self):
        termin = Beratungstermin.objects.create(
            beratungsstelle="LS",
            anzahl_beratungen=1,
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            fall=self.fall,
        )

        self.fall.delete()

        self.assertFalse(
            Beratungstermin.objects.filter(beratungs_id=termin.beratungs_id).exists()
        )

class BegleitungReverseRelationTest(BaseModelTestCase):

    def test_fall_begleitungen_reverse_access(self):
        Begleitung.objects.create(
            klient=self.klient,
            fall=self.fall,
            art_begleitung="P",
            anzahl_begleitungen=1,
        )

        self.assertEqual(self.fall.begleitungen.count(), 1)

class GewaltfolgeRelationTest(BaseModelTestCase):

    def test_one_to_one_enforced(self):
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

        Gewaltfolge.objects.create(
            gewalttat=tat,
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
                gewalttat=tat,
                psychische_folgen="A",
                koerperliche_folgen="N",
                finanzielle_folgen="N",
                arbeitseinschraenkung="N",
                verlust_arbeitsstelle="N",
                soziale_isolation="N",
                suizidalitaet="N",
                keine_angabe="N",
            )

class AnfrageFallRelationTest(BaseModelTestCase):

    def test_anfrage_one_to_one_fall(self):
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

class BeratungsterminValidationTest(BaseModelTestCase):
    def test_cannot_have_negative_sessions(self):
        termin = Beratungstermin(
            beratungsstelle="LS",
            anzahl_beratungen=-1,  # Invalid value
            termin_beratung=timezone.now().date(),
            beratungsart="P",
            berater=self.konto,
            fall=self.fall,
        )
        with self.assertRaises(ValidationError):
            termin.full_clean() # Triggers Django validation
            termin.save()