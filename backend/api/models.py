from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


# --- ENUM/CHOICES DEFINITIONEN ---

# 1. KONTO (Mitarbeiter:in)
BERECHTIGUNG_CHOICES = [
    ('B', 'Basis'),
    ('E', 'Erweiterung'),
    ('AD', 'Admin'),
]

# 2. KLIENT_IN
KLIENT_ROLLE_CHOICES = [
    ('B', 'Betroffene:r'),
    ('A', 'Angehörige:r'),
    ('F', 'Fachkraft'),
]

KLIENT_GESCHLECHT_CHOICES = [
    ('CW', 'cis weiblich'), ('CM', 'cis männlich'), ('TW', 'trans weiblich'), 
    ('TM', 'trans männlich'), ('TN', 'trans nicht-binär'), ('I', 'inter'), 
    ('A', 'agender'), ('D', 'divers'), ('K', 'keine Angabe'),
]

KLIENT_SEXUALITAET_CHOICES = [
    ('L', 'lesbisch'), ('S', 'schwul'), ('B', 'bisexuell'), 
    ('AX', 'asexuell'), ('H', 'heterosexuell'), ('K', 'keine Angabe'),
]

STANDORT_CHOICES = [
    ('LS', 'Leipzig Stadt'), ('LL', 'Leipzig Land'), ('NS', 'Nordsachsen'), 
    ('S', 'Sachsen (Andere)'), ('D', 'Deutschland (Andere)'), ('A', 'Ausland'), 
    ('K', 'keine Angabe'),
]

JA_NEIN_KA_CHOICES = [
    ('J', 'Ja'), ('N', 'Nein'), ('KA', 'keine Angabe'),
]

# 5. BERATUNGSTERMIN
BERATUNGSSTELLE_CHOICES = [
    ('LS', 'Fachberatung Leipzig Stadt'), ('NS', 'Nordsachsen'), ('LL', 'Landkreis Leipzig'),
]

BERATUNGSART_CHOICES = [
    ('P', 'persönlich'), ('V', 'Video'), ('T', 'Telefon'), ('A', 'aufsuchend'), ('S', 'schriftlich'),
]

# 7. GEWALTTAT
ANZAHL_VORFAELLE_CHOICES = [('E', 'einmalig'), ('M', 'mehrere'), ('G', 'genaue Zahl'), ('K', 'keine Angabe')]
ANZAHL_TAETER_CHOICES = [('1', '1'), ('M', 'mehrere'), ('G', 'genaue Zahl'), ('K', 'keine Angabe')]
TATORT_CHOICES = [
    ('L', 'Leipzig'), ('LL', 'Leipzig Land'), ('NS', 'Nordsachsen'), 
    ('S', 'Sachsen'), ('D', 'Deutschland'), ('A', 'Ausland'), 
    ('F', 'auf der Flucht'), ('H', 'im Herkunftsland'), ('K', 'keine Angabe'),
]
ANZEIGE_CHOICES = [('J', 'Ja'), ('N', 'Nein'), ('E', 'noch nicht entschieden'), ('K', 'keine Angabe')]

# 8. GEWALTFOLGE
PSYCH_FOLGEN_CHOICES = [
    ('D', 'Depression'), ('A', 'Angststörung'), ('PT', 'PTBS'), 
    ('B', 'Burn-out'), ('S', 'Schlafstörungen'), ('SU', 'Sucht'),
    ('K', 'Kommunikationsschwierigkeiten'), ('V', 'Vernachlässigung alltäglicher Dinge'),
    ('N', 'keine'), ('AN', 'andere'),
]

KOERPER_FOLGEN_CHOICES = [
    ('S', 'Schmerzen'), ('L', 'Lähmungen'), ('KR', 'Krankheit'),
    ('N', 'keine'), ('A', 'andere'),
]

# 9. ANFRAGE
ANFRAGE_PERSON_CHOICES = [
    ('F', 'Fachkraft'), ('A', 'Angehörige:r'), ('B', 'Betroffene:r'), ('AN', 'anonym'),
    ('qB', 'queer Betroffene:r'), ('qF', 'queer Fachkraft'), ('qA', 'queer Angehörige:r'),
    ('qAN', 'queer anonym'), ('FfB', 'Fachkraft für Betroffene'), ('AfB', 'Angehörige:r für Betroffene'),
    ('FFqB', 'Fachkraft für queere Betroffene'), ('AfqB', 'Angehörige:r für queere Betroffene'),
]

ANFRAGE_ART_CHOICES = [
    ('MS', 'medizinische Soforthilfe'), ('VS', 'vertrauliche Spurensicherung'),
    ('B', 'Beratungsbedarf'), ('R', 'rechtliche Fragen'), ('S', 'Sonstiges'),
]

# 6. BEGLEITUNG
BEGLEITUNG_ART_CHOICES = [
    ('G', 'Gerichte'), ('P', 'Polizei'), ('R', 'Rechtsanwält:innen'), 
    ('Ä', 'Ärzt:innen'), ('RM', 'Rechtsmedizin'), ('J', 'Jugendamt'), 
    ('SA', 'Sozialamt'), ('JC', 'Jobcenter'), ('BS', 'Beratungsstellen'), 
    ('FK', 'Frauen- und Kinderschutzeinrichtungen'), ('SS', 'spezialisierte Schutzeinrichtungen'), 
    ('I', 'Interventionsstellen'), ('S', 'sonstige'),
]
VERWEISUNG_ART_CHOICES = BEGLEITUNG_ART_CHOICES


# --- MODELLE ---
class KontoManager(BaseUserManager): 
    def create_user(self, mail_mb, password=None, **extra_fields):
        # Bevorzugt den expliziten Parameter, fällt ansonsten auf extra_fields zurück
        explicit_email = mail_mb
        override_email = extra_fields.pop('mail_mb', None)

        final_email = explicit_email or override_email
        if not final_email:
            raise ValueError('Die E-Mail ist erforderlich')

        normalized_email = self.normalize_email(final_email)
        
        user = self.model(mail_mb=normalized_email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, mail_mb, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rolle_mb', 'AD') # Admin-Rolle setzen
        return self.create_user(mail_mb, password, **extra_fields)

# --- Model ---
class Konto(AbstractBaseUser, PermissionsMixin):
    vorname_mb = models.CharField(max_length=100, verbose_name="Vorname")
    nachname_mb = models.CharField(max_length=100, verbose_name="Nachname")
    
    mail_mb = models.EmailField(max_length=255, unique=True, verbose_name="E-Mail")
    
    rolle_mb = models.CharField(max_length=2, choices=BERECHTIGUNG_CHOICES, default='B', verbose_name="Rolle")
    
    is_active = models.BooleanField(default=True) #TODO neu, noch ergänzen im Klassendiagramm
    is_staff = models.BooleanField(default=False) #TODO neu, noch ergänzen im Klassendiagramm
    date_joined = models.DateTimeField(default=timezone.now) #TODO neu, noch ergänzen im Klassendiagramm

    objects = KontoManager()
    USERNAME_FIELD = 'mail_mb'
    REQUIRED_FIELDS = ['vorname_mb', 'nachname_mb']

    class Meta:
        verbose_name = "Benutzerkonto"
        verbose_name_plural = "Benutzerkonten"
        # Custom Permissions für Kontoverwaltung (Admin-Funktionen)
        permissions = [
            ("can_manage_users", "Kann Benutzerkonten verwalten"),
            ("can_assign_roles", "Kann Rollen zuweisen"),
            ("can_view_all_data", "Kann alle Daten einsehen"),
            ("can_change_inactivity_settings", "Kann Inaktivitäts-Einstellungen ändern"),
        ]
        
    def __str__(self):
        return f"{self.vorname_mb} {self.nachname_mb} ({self.rolle_mb})"


class KlientIn(models.Model):
    klient_id = models.BigAutoField(primary_key=True)
    klient_rolle = models.CharField(max_length=2, choices=KLIENT_ROLLE_CHOICES, verbose_name="Rolle")
    klient_alter = models.IntegerField(
        null=True, 
        blank=True, 
        verbose_name="Alter (Jahre)", 
        validators=[MinValueValidator(0), MaxValueValidator(200)]
    )
    klient_geschlechtsidentitaet = models.CharField(max_length=2, choices=KLIENT_GESCHLECHT_CHOICES, verbose_name="Geschlechtsidentität")
    klient_sexualitaet = models.CharField(max_length=2, choices=KLIENT_SEXUALITAET_CHOICES, verbose_name="Sexualität")
    klient_wohnort = models.CharField(max_length=2, choices=STANDORT_CHOICES, verbose_name="Wohnort") # max_length auf 2 korrigiert
    klient_staatsangehoerigkeit = models.CharField(max_length=100, verbose_name="Staatsangehörigkeit")
    klient_beruf = models.CharField(max_length=255, verbose_name="Beruf")
    
    klient_schwerbehinderung = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Schwerbehinderung")
    klient_schwerbehinderung_detail = models.TextField(
        blank=True, 
        verbose_name="Form/Grad der Behinderung", 
        help_text="Nur ausfüllen, wenn Schwerbehinderung: Ja"
    )

    klient_kontaktpunkt = models.CharField(max_length=255, verbose_name="Kontaktpunkt (Quelle)")
    klient_dolmetschungsstunden = models.IntegerField(default=0, verbose_name="Dolmetschungsstunden", validators=[MinValueValidator(0)])
    klient_dolmetschungssprachen = models.CharField(max_length=255, blank=True, verbose_name="Dolmetschungssprachen")
    klient_notizen = models.TextField(blank=True, verbose_name="Notizen")

    class Meta:
        verbose_name = "Klient:in"
        verbose_name_plural = "Klient:innen"

    def __str__(self):
        return f"Klient:in {self.klient_id}"


class Preset(models.Model):
    preset_id = models.BigAutoField(primary_key=True)
    preset_daten = models.JSONField(verbose_name="Ausgewählte Datenfelder")
    preset_beschreibung = models.TextField(verbose_name="Beschreibung")
    filterKriterien = models.JSONField(verbose_name="Filterkriterien")
    
    # Beziehungen:
    ersteller = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Ersteller:in")
    berechtigte = models.ManyToManyField(Konto, related_name='teilbare_presets', verbose_name="Berechtigte Konten")
    
    class Meta:
        verbose_name = "Preset"
        verbose_name_plural = "Presets"
        # Custom Permissions für Preset-Verwaltung
        permissions = [
            ("can_share_preset", "Kann Presets mit anderen teilen"),
        ]
        
    def __str__(self):
        return self.preset_beschreibung


class Fall(models.Model):
    fall_id = models.BigAutoField(primary_key=True)
    klient = models.ForeignKey(KlientIn, on_delete=models.PROTECT, verbose_name="Zugeordnete Klient:in")
    mitarbeiterin = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Zuständige Mitarbeiter:in")
    
    class Meta:
        verbose_name = "Fall"
        verbose_name_plural = "Fälle"

    def __str__(self):
        return f"Fall {self.fall_id} (Klient: {self.klient.klient_id})"


class Beratungstermin(models.Model):
    beratungs_id = models.BigAutoField(primary_key=True)
    beratungsstelle = models.CharField(max_length=2, choices=BERATUNGSSTELLE_CHOICES, verbose_name="Beratungsstelle")
    anzahl_beratungen = models.IntegerField(default=1, verbose_name="Anzahl Beratungen", validators=[MinValueValidator(0)])
    termin_beratung = models.DateField(verbose_name="Datum des Beratungstermins")
    beratungsart = models.CharField(max_length=2, choices=BERATUNGSART_CHOICES, verbose_name="Durchführungsart")
    notizen_beratung = models.TextField(blank=True, verbose_name="Notizen")
    
    # Beziehungen:
    berater = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Berater:in")
    fall = models.ForeignKey(Fall, on_delete=models.CASCADE, null=True, related_name='beratungstermine', verbose_name="Zugeordneter Fall")
    
    class Meta:
        verbose_name = "Beratungstermin"
        verbose_name_plural = "Beratungstermine"
        
    def __str__(self):
        return f"Beratungstermin {self.beratungs_id} am {self.termin_beratung}"


class Begleitung(models.Model):
    begleitungs_id = models.BigAutoField(primary_key=True)
    anzahl_begleitungen = models.IntegerField(default=1, verbose_name="Anzahl Begleitungen", validators=[MinValueValidator(0)])
    art_begleitung = models.CharField(max_length=2, choices=BEGLEITUNG_ART_CHOICES, verbose_name="Art der Begleitung")
    anzahl_verweisungen = models.IntegerField(default=0, verbose_name="Anzahl Verweisungen", validators=[MinValueValidator(0)])
    art_verweisungen = models.CharField(max_length=2, choices=VERWEISUNG_ART_CHOICES, blank=True, verbose_name="Art der Verweisungen")
    
    # Beziehungen:
    klient = models.ForeignKey(KlientIn, on_delete=models.CASCADE, verbose_name="Klient:in")
    fall = models.ForeignKey(Fall, on_delete=models.CASCADE, null=True, related_name='begleitungen', verbose_name="Zugeordneter Fall")
    
    class Meta:
        verbose_name = "Begleitung/Verweisung"
        verbose_name_plural = "Begleitungen/Verweisungen"
        
    def __str__(self):
        return f"Begleitung {self.begleitungs_id} für Klient {self.klient.klient_id}"


class Gewalttat(models.Model):
    tat_id = models.BigAutoField(primary_key=True)
    tat_alter = models.CharField(max_length=2, choices=JA_NEIN_KA_CHOICES, verbose_name="Alter zum Tatzeitpunkt (JA/NEIN/KA)") 
    tat_zeitraum = models.CharField(max_length=2, choices=JA_NEIN_KA_CHOICES, verbose_name="Tatzeitraum (JA/NEIN/KA)") 
    tat_anzahl_vorfaelle = models.CharField(max_length=2, choices=ANZAHL_VORFAELLE_CHOICES, verbose_name="Anzahl Vorfälle")
    tat_anzahl_taeter_innen = models.CharField(max_length=2, choices=ANZAHL_TAETER_CHOICES, verbose_name="Anzahl Täter:innen")
    
    
    tat_art = models.CharField(max_length=1024, verbose_name="Art der Gewalt (Mehrfachauswahl/Text)")
    
    tatort = models.CharField(max_length=2, choices=TATORT_CHOICES, verbose_name="Tatort")
    tat_anzeige = models.CharField(max_length=2, choices=ANZEIGE_CHOICES, verbose_name="Anzeige")
    tat_medizinische_versorgung = models.CharField(max_length=2, choices=JA_NEIN_KA_CHOICES, verbose_name="Medizinische Versorgung")
    tat_spurensicherung = models.CharField(max_length=2, choices=JA_NEIN_KA_CHOICES, verbose_name="Vertrauliche Spurensicherung")
    tat_mitbetroffene_kinder = models.IntegerField(default=0, verbose_name="Mitbetroffene Kinder", validators=[MinValueValidator(0)])
    tat_direktbetroffene_kinder = models.IntegerField(default=0, verbose_name="Direkt betroffene Kinder", validators=[MinValueValidator(0)])
    tat_notizen = models.TextField(blank=True, verbose_name="Notizen")

    # Beziehungen:
    klient = models.ForeignKey(KlientIn, on_delete=models.CASCADE, verbose_name="Klient:in")
    fall = models.ForeignKey(Fall, on_delete=models.CASCADE, null=True, related_name='gewalttaten', verbose_name="Zugeordneter Fall") 
    
    class Meta:
        verbose_name = "Gewalttat"
        verbose_name_plural = "Gewalttaten"
        
    def __str__(self):
        return f"Gewalttat {self.tat_id} von Klient {self.klient.klient_id}"


class Gewaltfolge(models.Model):
    gewalttat = models.OneToOneField(Gewalttat, on_delete=models.CASCADE, primary_key=True, verbose_name="Zugeordnete Gewalttat")

    psychische_folgen = models.CharField(max_length=4, choices=PSYCH_FOLGEN_CHOICES, verbose_name="Psychische Folgen")
    koerperliche_folgen = models.CharField(max_length=2, choices=KOERPER_FOLGEN_CHOICES, verbose_name="Körperliche Folgen")
    
    finanzielle_folgen = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Finanzielle Folgen")
    arbeitseinschraenkung = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Arbeitseinschränkung")
    verlust_arbeitsstelle = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Verlust Arbeitsstelle")
    soziale_isolation = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Soziale Isolation")
    suizidalitaet = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Suizidalität")
    keine_angabe = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Falls zuvor kein Feld ausgefüllt")
    
    beeintraechtigungen = models.TextField(blank=True, verbose_name="Dauerhafte körperliche Beeinträchtigungen")
    weiteres = models.TextField(blank=True, verbose_name="Weiteres")
    folgen_notizen = models.TextField(blank=True, verbose_name="Notizen")

    class Meta:
        verbose_name = "Gewaltfolge"
        verbose_name_plural = "Gewaltfolgen"
        
    def __str__(self):
        return f"Folgen für Gewalttat {self.gewalttat.tat_id}"


class Anfrage(models.Model):
    anfrage_id = models.BigAutoField(primary_key=True)
    anfrage_weg = models.CharField(max_length=100, verbose_name="Anfrageweg (Freitext)")
    anfrage_datum = models.DateField(default=timezone.localdate, verbose_name="Datum der Anfrage")
    anfrage_ort = models.CharField(max_length=2, choices=STANDORT_CHOICES, verbose_name="Anfrage Ort")
    anfrage_person = models.CharField(max_length=4, choices=ANFRAGE_PERSON_CHOICES, verbose_name="Anfrage Person (wer)")
    anfrage_art = models.CharField(max_length=2, choices=ANFRAGE_ART_CHOICES, verbose_name="Anfrage Art")
    
    # Beziehungen:
    beratungstermin = models.OneToOneField(Beratungstermin, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Zugeordneter Beratungstermin")
    mitarbeiterin = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Zuständige Mitarbeiter:in")
    fall = models.OneToOneField(Fall, on_delete=models.SET_NULL, null=True, blank=True, related_name='ursprung_anfrage', verbose_name="Zugeordneter Fall")
    
    class Meta:
        verbose_name = "Anfrage"
        verbose_name_plural = "Anfragen"
        # Custom Permissions für Anfragen-Sichtbarkeit
        permissions = [
            ("can_view_own_anfragen", "Kann eigene Anfragen einsehen"),
            ("can_view_all_anfragen", "Kann alle Anfragen einsehen"),
        ]
        
    def __str__(self):
        return f"Anfrage {self.anfrage_id} ({self.anfrage_art})"


class Statistik(models.Model):
    statistik_id = models.BigAutoField(primary_key=True)
    statistik_titel = models.CharField(max_length=255, verbose_name="Titel")
    statistik_notizen = models.TextField(blank=True, verbose_name="Notizen")
    zeitraum_start = models.DateField(verbose_name="Zeitraum Start")
    zeitraum_ende = models.DateField(verbose_name="Zeitraum Ende")
    ergebnis = models.FileField(upload_to='statistik_ergebnisse/', verbose_name="Ergebnisdatei")
    creator = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Ersteller:in")
    preset = models.ForeignKey(Preset, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Preset")
    creation_date = models.DateField(default=timezone.now, verbose_name="Erstelldatum")
    
    class Meta:
        verbose_name = "Statistik"
        verbose_name_plural = "Statistiken"
        # Custom Permissions für Statistik-Export (nur für erweiterte Benutzer)
        permissions = [
            ("can_export_statistik", "Kann Statistiken exportieren"),
            ("can_share_statistik", "Kann Statistiken teilen"),
        ]
        
    def __str__(self):
        return self.statistik_titel


class Eingabefeld(models.Model):
    TYP_CHOICES = [
        ('Text', 'Text'),
        ('Zahl', 'Zahl'),
        ('Datum', 'Datum'),
    ]

    feldID = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, verbose_name="Name des Feldes")
    typ = models.CharField(max_length=10, choices=TYP_CHOICES, verbose_name="Datentyp")
    wert = models.TextField(blank=True, null=True, verbose_name="Wert")

    class Meta:
        verbose_name = "Eingabefeld"
        verbose_name_plural = "Eingabefelder"

    def __str__(self):
        return f"{self.name} ({self.typ})"
