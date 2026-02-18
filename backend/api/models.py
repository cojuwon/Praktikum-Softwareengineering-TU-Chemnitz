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
    
    STATUS_CHOICES = [
        ('A', 'Aktiv'),
        ('I', 'Inaktiv'),
        ('P', 'Ausstehend'),
    ]

    rolle_mb = models.CharField(max_length=2, choices=BERECHTIGUNG_CHOICES, default='B', verbose_name="Rolle")
    status_mb = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P', verbose_name="Status")
    
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
    klient_pseudonym = models.CharField(
        max_length=255, 
        blank=True, 
        null=True, 
        verbose_name="Pseudonym",
        help_text="ACHTUNG: Hier keine Klarnamen verwenden! Nur Pseudonyme."
    )
    klient_alter = models.IntegerField(
        null=True, 
        blank=True, 
        verbose_name="Alter (Jahre)", 
        validators=[MinValueValidator(0), MaxValueValidator(200)]
    )
    klient_geschlechtsidentitaet = models.CharField(max_length=2, choices=KLIENT_GESCHLECHT_CHOICES, verbose_name="Geschlechtsidentität")
    klient_sexualitaet = models.CharField(max_length=2, choices=KLIENT_SEXUALITAET_CHOICES, verbose_name="Sexualität")
    klient_wohnort = models.CharField(max_length=2, choices=STANDORT_CHOICES, verbose_name="Wohnort")
    klient_staatsangehoerigkeit = models.CharField(max_length=100, verbose_name="Staatsangehörigkeit")
    klient_beruf = models.CharField(max_length=255, verbose_name="Beruf")
    
    klient_schwerbehinderung = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Schwerbehinderung")
    klient_migrationshintergrund = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, verbose_name="Migrationshintergrund", default='KA')
    klient_schwerbehinderung_detail = models.TextField(
        blank=True, 
        verbose_name="Form/Grad der Behinderung", 
        help_text="Nur ausfüllen, wenn Schwerbehinderung: Ja"
    )

    klient_kontaktpunkt = models.CharField(max_length=255, verbose_name="Kontaktpunkt (Quelle)")
    # klient_dolmetschungsstunden entfernt (jetzt in Beratungstermin/Begleitung)
    klient_dolmetschungssprachen = models.CharField(max_length=255, blank=True, verbose_name="Dolmetschungssprachen")
    klient_notizen = models.TextField(blank=True, verbose_name="Notizen")
    
    # Dynamische Felder
    extra_fields = models.JSONField(default=dict, blank=True, verbose_name="Zusätzliche Felder")
    
    erstellt_am = models.DateTimeField(auto_now_add=True, verbose_name="Erstellt am")

    class Meta:
        verbose_name = "Klient:in"
        verbose_name_plural = "Klient:innen"
        permissions = [
            ("view_own_klientin", "Kann eigene Klienten einsehen"),
            ("view_all_klientin", "Kann alle Klienten einsehen"),
        ]

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
            ("can_manage_presets", "Kann Presets verwalten"),
        ]
        
    def __str__(self):
        return self.preset_beschreibung


class Fall(models.Model):
    fall_id = models.BigAutoField(primary_key=True)
    klient = models.ForeignKey(KlientIn, on_delete=models.PROTECT, verbose_name="Zugeordnete Klient:in")
    mitarbeiterin = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Zuständige Mitarbeiter:in")
    
    # Neue Felder:
    status = models.CharField(max_length=2, choices=[('O', 'Offen'), ('L', 'Laufend'), ('A', 'Abgeschlossen'), ('G', 'Gelöscht')], default='O', verbose_name="Status")
    startdatum = models.DateField(default=timezone.now, verbose_name="Startdatum")
    notizen = models.TextField(blank=True, verbose_name="Notizen")

    class Meta:
        verbose_name = "Fall"
        verbose_name_plural = "Fälle"
        permissions = [
            ("view_own_fall", "Kann eigene Fälle einsehen"),
            ("view_all_fall", "Kann alle Fälle einsehen"),
        ]

    def __str__(self):
        return f"Fall {self.fall_id} (Klient: {self.klient.klient_id})"

class Beratungstermin(models.Model):
    STATUS_CHOICES = [
        ('g', 'geplant'),
        ('s', 'stattgefunden'),
        ('a', 'ausgefallen'),
    ]

    beratungs_id = models.BigAutoField(primary_key=True)
    beratungsstelle = models.CharField(max_length=2, choices=BERATUNGSSTELLE_CHOICES, verbose_name="Beratungsstelle")
    # termin_beratung ist jetzt DateTime explizit
    termin_beratung = models.DateTimeField(verbose_name="Zeitpunkt des Beratungstermins")
    dauer = models.IntegerField(default=60, verbose_name="Dauer (Minuten)", validators=[MinValueValidator(0)])
    
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='g', verbose_name="Status")
    dolmetscher_stunden = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="Dolmetscher-Stunden")
    anzahl_beratungen = models.IntegerField(default=1, verbose_name="Anzahl Beratungen (Statistik)", validators=[MinValueValidator(0)])
    
    beratungsart = models.CharField(max_length=2, choices=BERATUNGSART_CHOICES, verbose_name="Durchführungsart")
    notizen_beratung = models.TextField(blank=True, verbose_name="Notizen")
    
    # Beziehungen:
    berater = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Berater:in")
    fall = models.ForeignKey('Fall', on_delete=models.CASCADE, null=True, related_name='beratungstermine', verbose_name="Zugeordneter Fall")
    
    class Meta:
        verbose_name = "Beratungstermin"
        verbose_name_plural = "Beratungstermine"
        permissions = [
            ("view_own_beratungstermin", "Kann eigene Beratungstermine einsehen"),
            ("view_all_beratungstermin", "Kann alle Beratungstermine einsehen"),
        ]
        
    def __str__(self):
        return f"Beratungstermin {self.beratungs_id} am {self.termin_beratung}"


class Begleitung(models.Model):
    begleitungs_id = models.BigAutoField(primary_key=True)
    datum = models.DateField(default=timezone.now, verbose_name="Datum")
    einrichtung = models.CharField(max_length=255, verbose_name="Einrichtung (z.B. Polizei, Gericht)")
    dolmetscher_stunden = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, verbose_name="Dolmetscher-Stunden")
    notizen = models.TextField(blank=True, verbose_name="Notizen")
    
    # Beziehungen:
    klient = models.ForeignKey(KlientIn, on_delete=models.CASCADE, verbose_name="Klient:in")
    fall = models.ForeignKey('Fall', on_delete=models.CASCADE, null=True, related_name='begleitungen', verbose_name="Zugeordneter Fall")
    
    class Meta:
        verbose_name = "Begleitung"
        verbose_name_plural = "Begleitungen"
        permissions = [
            ("view_own_begleitung", "Kann eigene Begleitungen einsehen"),
            ("view_all_begleitung", "Kann alle Begleitungen einsehen"),
        ]
        
    def __str__(self):
        return f"Begleitung {self.begleitungs_id} am {self.datum}"


class Gewalttat(models.Model):
    tat_id = models.BigAutoField(primary_key=True)
    tat_datum = models.DateField(default=timezone.now, verbose_name="Tatzeitpunkt") # Default heute
    tat_ort = models.CharField(max_length=2, choices=STANDORT_CHOICES, null=True, verbose_name="Tatort (Region)")
    plz_tatort = models.CharField(max_length=5, blank=True, verbose_name="PLZ Tatort")
    
    # Beziehungen:
    klient = models.ForeignKey(KlientIn, on_delete=models.CASCADE, verbose_name="Betroffene:r")
    fall = models.ForeignKey('Fall', on_delete=models.CASCADE, null=True, related_name='gewalttaten', verbose_name="Zugeordneter Fall")
    
    class Meta:
        verbose_name = "Gewalttat"
        verbose_name_plural = "Gewalttaten"
        
    def __str__(self):
        return f"Gewalttat {self.tat_id} ({self.tat_datum})"


class Gewaltfolge(models.Model):
    folge_id = models.BigAutoField(primary_key=True)
    gewalttat = models.OneToOneField(Gewalttat, on_delete=models.CASCADE, related_name='gewaltfolge', verbose_name="Zugehörige Gewalttat")
    
    # Folgen Felder (Ja/Nein/KA oder Text)
    koerperliche_verletzung = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Körperliche Verletzung")
    gesundheitsschaedigung = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Gesundheitsschädigung")
    psychische_gewalt = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Psychische Gewalt")
    sexualisierte_gewalt = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Sexualisierte Gewalt")
    oekonomische_gewalt = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Ökonomische Gewalt")
    soziale_gewalt = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Soziale Gewalt/Isolation")
    digitale_gewalt = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Digitale Gewalt")
    verfolgung_stalking = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Verfolgung/Stalking")
    
    suizidalitaet = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Suizidalität")
    keine_angabe = models.CharField(max_length=3, choices=JA_NEIN_KA_CHOICES, null=True, verbose_name="Falls zuvor kein Feld ausgefüllt")
    
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
    anfrage_weg = models.TextField(blank=True, null=True, verbose_name="Anfrageweg (Freitext)")
    anfrage_datum = models.DateField(default=timezone.localdate, verbose_name="Datum der Anfrage")
    anfrage_ort = models.CharField(max_length=2, choices=STANDORT_CHOICES, blank=True, null=True, verbose_name="Anfrage Ort")
    anfrage_person = models.CharField(max_length=4, choices=ANFRAGE_PERSON_CHOICES, blank=True, null=True, verbose_name="Anfrage Person (wer)")
    anfrage_art = models.CharField(max_length=2, choices=ANFRAGE_ART_CHOICES, blank=True, null=True, verbose_name="Anfrage Art")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Erstellt am")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Zuletzt geändert")
    
    # Beziehungen:
    beratungstermin = models.OneToOneField(Beratungstermin, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Zugeordneter Beratungstermin")
    mitarbeiterin = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Zuständige Mitarbeiter:in")
    fall = models.OneToOneField('Fall', on_delete=models.SET_NULL, null=True, blank=True, related_name='ursprung_anfrage', verbose_name="Zugeordneter Fall")
    
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
        # Custom Permissions für Statistik-Export und Zugriff
        permissions = [
            ("can_export_statistik", "Kann Statistiken exportieren"),
            ("can_share_statistik", "Kann Statistiken teilen"),
            ("can_view_statistics", "Kann Statistiken einsehen"),
        ]
        
    def __str__(self):
        return self.statistik_titel


class Eingabefeld(models.Model):
    TYP_CHOICES = [
        ('text', 'Text (kurz)'),
        ('textarea', 'Text (lang)'),
        ('number', 'Zahl'),
        ('date', 'Datum'),
        ('select', 'Auswahl'),
        ('multiselect', 'Mehrfachauswahl'),
    ]

    CONTEXT_CHOICES = [
        ('anfrage', 'Anfrage'),
        ('fall', 'Fall'),
        ('klient', 'Klient:in'),
    ]

    feldID = models.BigAutoField(primary_key=True)
    context = models.CharField(max_length=20, choices=CONTEXT_CHOICES, default='anfrage', verbose_name="Kontext")
    name = models.CharField(max_length=255, verbose_name="Name des Feldes (Technisch)", help_text="Muss mit dem Modell-Feld übereinstimmen")
    label = models.CharField(max_length=255, verbose_name="Beschriftung (Label)", default="")
    typ = models.CharField(max_length=20, choices=TYP_CHOICES, verbose_name="Datentyp")
    required = models.BooleanField(default=False, verbose_name="Pflichtfeld")
    options = models.JSONField(default=list, blank=True, verbose_name="Optionen (für Select)", help_text="Liste von Objekten: [{'value': 'X', 'label': 'Y'}]")
    sort_order = models.IntegerField(default=0, verbose_name="Reihenfolge")
    default_value = models.TextField(blank=True, null=True, verbose_name="Standardwert")

    class Meta:
        verbose_name = "Eingabefeld (Formular-Konfiguration)"
        verbose_name_plural = "Eingabefelder (Konfiguration)"
        ordering = ['sort_order', 'label']


class FallNotiz(models.Model):
    notiz_id = models.BigAutoField(primary_key=True)
    fall = models.ForeignKey(Fall, on_delete=models.CASCADE, related_name='timeline_notizen', verbose_name="Fall")
    beratungstermin = models.ForeignKey(Beratungstermin, on_delete=models.SET_NULL, null=True, blank=True, related_name='linked_notizen', verbose_name="Zugeordneter Termin")
    autor = models.ForeignKey(Konto, on_delete=models.SET_NULL, null=True, verbose_name="Autor:in")
    
    # Inhalt als JSON für Tiptap/RichText
    content = models.JSONField(verbose_name="Inhalt (JSON)", default=dict)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Erstellt am")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Zuletzt geändert")

    class Meta:
        verbose_name = "Fall-Notiz"
        verbose_name_plural = "Fall-Notizen"
        ordering = ['-created_at']
        permissions = [
            ("manage_fall_notizen", "Kann Fall-Notizen verwalten"),
        ]

    def __str__(self):
        return f"Notiz {self.notiz_id} zu Fall {self.fall_id}"
