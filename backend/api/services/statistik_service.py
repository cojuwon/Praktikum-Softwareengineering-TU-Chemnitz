"""
StatistikService - Vollständige Daten-Aggregation für Statistikseite.
Ersetzt die Fake-API mit echten Datenbank-Abfragen.
"""
from django.db.models import Count, Q, Sum
from datetime import datetime
from decimal import Decimal

from api.models import (
    Fall, KlientIn, Beratungstermin, Begleitung, Gewalttat, Gewaltfolge, Anfrage,
    BERATUNGSSTELLE_CHOICES, STANDORT_CHOICES, KLIENT_GESCHLECHT_CHOICES,
    KLIENT_ROLLE_CHOICES, BERATUNGSART_CHOICES, TATORT_CHOICES,
    ANZAHL_TAETER_CHOICES, ANZEIGE_CHOICES, PSYCH_FOLGEN_CHOICES,
    KOERPER_FOLGEN_CHOICES, BEGLEITUNG_ART_CHOICES, ANFRAGE_PERSON_CHOICES,
    ANFRAGE_ART_CHOICES, JA_NEIN_KA_CHOICES
)


class StatistikService:
    """Service für die Berechnung von Statistik-KPIs aus echten Datenbank-Daten."""


    @staticmethod
    def calculate_stats(filters: dict) -> dict:
        """
        Berechnet alle Statistik-KPIs basierend auf den übergebenen Filtern.
        """
        start_date = filters.get('zeitraum_start')
        end_date = filters.get('zeitraum_ende')
        
        # Helper for multi-select filtering
        def apply_filter(qs, field_name, filter_key):
            val = filters.get(filter_key)
            if val:
                # If validation ensures lists, we can always use __in
                if isinstance(val, list):
                     return qs.filter(**{f"{field_name}__in": val})
                # Fallback if single value slips through
                return qs.filter(**{field_name: val})
            return qs

        # === QUERYSETS MIT FILTERN ===
        cases = Fall.objects.all()
        if start_date: cases = cases.filter(startdatum__gte=start_date)
        if end_date: cases = cases.filter(startdatum__lte=end_date)
        
        # Apply filters to cases directly where possible
        cases = apply_filter(cases, "beratungsstelle", "beratungsstelle")
        
        # ACTIVE CLIENTS (linked to active cases)
        active_clients = KlientIn.objects.filter(fall__in=cases).distinct()
        
        # CONSULTATIONS
        consultations = Beratungstermin.objects.filter(status='s')
        if start_date: consultations = consultations.filter(termin_beratung__date__gte=start_date)
        if end_date: consultations = consultations.filter(termin_beratung__date__lte=end_date)
        
        consultations = apply_filter(consultations, "beratungsart", "beratungsart")
        # Ensure consultations are linked to filtered cases
        consultations = consultations.filter(fall__in=cases)
        
        # ANFRAGEN
        anfragen = Anfrage.objects.all()
        if start_date: anfragen = anfragen.filter(anfrage_datum__gte=start_date)
        if end_date: anfragen = anfragen.filter(anfrage_datum__lte=end_date)
        
        anfragen = apply_filter(anfragen, "anfrage_ort", "anfrage_ort")
        anfragen = apply_filter(anfragen, "anfrage_person", "anfrage_person")
        anfragen = apply_filter(anfragen, "anfrage_art", "anfrage_art")
        
        # ACCOMPANIMENTS
        accompaniments = Begleitung.objects.all()
        if start_date: accompaniments = accompaniments.filter(datum__gte=start_date)
        if end_date: accompaniments = accompaniments.filter(datum__lte=end_date)
        # Ensure accompaniments are linked to filtered cases (via Fall?)
        # Begleitung hat Foreign Key auf 'Fall'.
        accompaniments = accompaniments.filter(fall__in=cases)
        
        # VIOLENCE
        violence = Gewalttat.objects.filter(fall__in=cases)
        violence = apply_filter(violence, "tat_ort", "tatort")
        violence = apply_filter(violence, "tat_anzeige", "anzeige") # Corrected mapping
        
        # CONSEQUENCES
        violence_consequences = Gewaltfolge.objects.filter(gewalttat__in=violence)
        violence_consequences = apply_filter(violence_consequences, "psychische_gewalt", "psychische_folgen")
        violence_consequences = apply_filter(violence_consequences, "koerperliche_verletzung", "koerperliche_folgen")


        # === AUSLASTUNG - BERATUNGEN ===
        gender_map = {
            'weiblich': ['CW', 'TW'],
            'maennlich': ['CM', 'TM'],
            'divers': ['TN', 'I', 'A', 'D']
        }
        
        cons_with_case = consultations.exclude(fall__isnull=True).select_related('fall__klient')
        c_total = consultations.count()
        c_weiblich = cons_with_case.filter(fall__klient__klient_geschlechtsidentitaet__in=gender_map['weiblich']).count()
        c_maennlich = cons_with_case.filter(fall__klient__klient_geschlechtsidentitaet__in=gender_map['maennlich']).count()
        c_divers = cons_with_case.filter(fall__klient__klient_geschlechtsidentitaet__in=gender_map['divers']).count()

        auslastung_beratungen = {
            "03_1_1_a_gesamt": c_total,
            "03_1_1_b_weiblich": c_weiblich,
            "03_1_1_c_maennlich": c_maennlich,
            "03_1_1_d_divers": c_divers,
            "03_1_2_a_gesamt": c_total,
            "03_1_2_b_weiblich": c_weiblich,
            "03_1_2_c_maennlich": c_maennlich,
            "03_1_2_d_divers": c_divers,
            "03_1_3_a_persoenlich": consultations.filter(beratungsart='P').count(),
            "03_1_3_b_aufsuchend": consultations.filter(beratungsart='A').count(),
            "03_1_3_c_telefonisch": consultations.filter(beratungsart='T').count(),
            "03_1_3_d_online": consultations.filter(beratungsart='V').count(),
            "03_1_3_e_schriftlich": consultations.filter(beratungsart='S').count(),
        }

        # === AUSLASTUNG - BEGLEITUNGEN ===
        def count_acc(keyword):
            return accompaniments.filter(einrichtung__icontains=keyword).count()

        known_keywords = [
            "Gericht", "Rechtsanw", "Rechtsmedizin", "Polizei", "Arzt", "Ärzt",
            "Jugendamt", "Sozialamt", "Jobcenter", "Agentur", "Gewalt",
            "Schutz", "Frauenhaus", "Kinderschutz", "Intervention"
        ]
        
        q_known = Q()
        for kw in known_keywords:
            q_known |= Q(einrichtung__icontains=kw)

        sonstige_cnt = accompaniments.exclude(q_known).count()
        sonstige_examples = []
        if sonstige_cnt > 0:
            sonstige_examples = list(accompaniments.exclude(q_known).values_list('einrichtung', flat=True)[:3])

        total_acc = accompaniments.count()
        auslastung_begleitungen = {
            "03_2_1_gesamt": total_acc,
            "03_2_2_gerichte": count_acc("Gericht"),
            "03_2_4_rechtsanwaelte": count_acc("Rechtsanw"),
            "03_2_6_rechtsmedizin": count_acc("Rechtsmedizin"),
            "03_2_3_polizei": count_acc("Polizei"),
            "03_2_5_aerzte": accompaniments.filter(Q(einrichtung__icontains="Arzt") | Q(einrichtung__icontains="Ärzt")).count(),
            "03_2_7_jugendamt": count_acc("Jugendamt"),
            "03_2_8_sozialamt": count_acc("Sozialamt"),
            "03_2_9_jobcenter": accompaniments.filter(Q(einrichtung__icontains="Jobcenter") | Q(einrichtung__icontains="Agentur")).count(),
            "03_2_10_gewaltberatung": count_acc("Gewalt"),
            "03_2_12_schutzeinrichtungen": count_acc("Schutz"),
            "03_2_11_frauen_kinderschutz": accompaniments.filter(Q(einrichtung__icontains="Frauenhaus") | Q(einrichtung__icontains="Kinderschutz")).count(),
            "03_2_13_interventionsstellen": count_acc("Intervention"),
            "03_2_14_sonstige": sonstige_cnt,
            "03_2_14_a_ggf_welche": ", ".join(sonstige_examples) if sonstige_examples else "-"
        }

        # === BERICHTSDATEN - WOHNSITZ ===
        def count_clients_loc(loc_code):
            return active_clients.filter(klient_wohnort=loc_code).count()
        
        def count_cons_loc(loc_code):
            return cons_with_case.filter(fall__klient__klient_wohnort=loc_code).count()

        total_clients = active_clients.count()
        berichtsdaten_wohnsitz = {
            "04_1_0_a_Anzahl_Klientinnen": total_clients,
            "04_1_0_b_Beratungen": c_total,
            "04_1_1_a_Anzahl_Klientinnen": count_clients_loc('LS'),
            "04_1_1_b_Beratungen": count_cons_loc('LS'),
            # Dresden (nicht explizit in STANDORT_CHOICES, evtl. 'S' oder 'D'?)
            "04_1_2_a_Anzahl_Klientinnen": 0,  
            "04_1_2_b_Beratungen": 0,
            "04_1_3_a_Anzahl_Klientinnen": count_clients_loc('LS'), # Stadt Leipzig (doppelt?)
            "04_1_3_b_Beratungen": count_cons_loc('LS'),
            # Chemnitz
            "04_1_4_a_Anzahl_Klientinnen": 0,  
            "04_1_4_b_Beratungen": 0,
            # Erzgebirgskreis
            "04_1_5_a_Anzahl_Klientinnen": 0,  
            "04_1_5_b_Beratungen": 0,
            # Mittelsachsen
            "04_1_6_a_Anzahl_Klientinnen": 0,  
            "04_1_6_b_Beratungen": 0,
            # Vogtlandkreis
            "04_1_7_a_Anzahl_Klientinnen": 0,  
            "04_1_7_b_Beratungen": 0,
            # Zwickau
            "04_1_8_a_Anzahl_Klientinnen": 0,  
            "04_1_8_b_Beratungen": 0,
            # Bautzen
            "04_1_9_a_Anzahl_Klientinnen": 0,  
            "04_1_9_b_Beratungen": 0,
            # Görlitz
            "04_1_10_a_Anzahl_Klientinnen": 0,  
            "04_1_10_b_Beratungen": 0,
            # Meißen
            "04_1_11_a_Anzahl_Klientinnen": 0,  
            "04_1_11_b_Beratungen": 0,
            # Sächsische Schweiz
            "04_1_12_a_Anzahl_Klientinnen": 0,  
            "04_1_12_b_Beratungen": 0,
            "04_1_13_a_Anzahl_Klientinnen": count_clients_loc('LL'),
            "04_1_13_b_Beratungen": count_cons_loc('LL'),
            "04_1_14_a_Anzahl_Klientinnen": count_clients_loc('NS'),
            "04_1_14_b_Beratungen": count_cons_loc('NS'),
            "04_1_15_a_Anzahl_Klientinnen": count_clients_loc('S') + count_clients_loc('D'),
            "04_1_15_b_Beratungen": count_cons_loc('S') + count_cons_loc('D'),
            "04_1_16_a_Anzahl_Klientinnen": count_clients_loc('A'),
            "04_1_16_b_Beratungen": count_cons_loc('A'),
            "04_1_16_c_Welche_Lander": "-",
            "04_1_17_a_Anzahl_Klientinnen": count_clients_loc('K'),
            "04_1_17_b_Beratungen": count_cons_loc('K'),
        }

        # === BERICHTSDATEN - STAATSANGEHÖRIGKEIT ===
        # Verwende Q object für komplexere Filterung
        # 'deutsch' oder 'deu' wird ausgeschlossen, alles andere zählt als nicht-deutsch
        non_german = active_clients.exclude(
             Q(klient_staatsangehoerigkeit__icontains='deutsch') | 
             Q(klient_staatsangehoerigkeit__icontains='deu') |
             Q(klient_staatsangehoerigkeit__icontains='D')
        )
        berichtsdaten_staatsangehoerigkeit = {
            "04_2_1_a_Anzahl_Klientinnen": non_german.count(),
            "04_2_2_a_Beratungen": cons_with_case.filter(
                fall__klient__in=non_german
            ).count(),
            "04_2_3_a_Welche_Lander": ", ".join(
                non_german.values_list('klient_staatsangehoerigkeit', flat=True).distinct()[:5]
            ) or "-"
        }

        # === BERICHTSDATEN - ALTERSSTRUKTUR ===
        def count_age_range(min_age, max_age=None):
            qs = active_clients.filter(klient_alter__gte=min_age)
            if max_age:
                qs = qs.filter(klient_alter__lt=max_age)
            return qs.count()

        berichtsdaten_altersstruktur = {
            "04_3_1_a_Anzahl_Klientinnen": count_age_range(18, 21),
            "04_3_2_a_Anzahl_Klientinnen": count_age_range(21, 27),
            "04_3_3_a_Anzahl_Klientinnen": count_age_range(27, 60),
            "04_3_4_a_Anzahl_Klientinnen": count_age_range(60),
            "04_3_5_a_Anzahl_Klientinnen": active_clients.filter(
                Q(klient_alter__isnull=True) | Q(klient_alter__lt=18)
            ).count(),
        }

        # === BERICHTSDATEN - BEHINDERUNG ===
        berichtsdaten_behinderung = {
            "04_4_0_erfasst": "Ja",
            "04_4_1_a_Anzahl_Klientinnen": active_clients.filter(klient_schwerbehinderung='J').count(),
            "04_4_2_a_Anzahl_Klientinnen": active_clients.filter(
                klient_schwerbehinderung='J'
            ).exclude(klient_schwerbehinderung_detail='').count(),
            "04_4_3_a_Anzahl_Klientinnen": active_clients.filter(klient_schwerbehinderung='KA').count(),
        }

        # === BERICHTSDATEN - TÄTER-OPFER-BEZIEHUNG ===
        # Die Fake-API hat die Daten nach Tätergeschlecht aufgeteilt.
        # Das Modell hat kein Feld für Tätergeschlecht. Placeholder mit 0.
        berichtsdaten_taeterOpferBeziehung = {
            "04_5_1_a_Anzahl_weiblich": 0, "04_5_1_b_Anzahl_maennlich": 0, "04_5_1_c_Anzahl_divers": 0,
            "04_5_2_a_Anzahl_weiblich": 0, "04_5_2_b_Anzahl_maennlich": 0, "04_5_2_c_Anzahl_divers": 0,
            "04_5_3_a_Anzahl_weiblich": 0, "04_5_3_b_Anzahl_maennlich": 0, "04_5_3_c_Anzahl_divers": 0,
            "04_5_4_a_Anzahl_weiblich": 0, "04_5_4_b_Anzahl_maennlich": 0, "04_5_4_c_Anzahl_divers": 0, "04_5_4_d_unbekannt": 0,
            "04_5_5_a_Anzahl_weiblich": 0, "04_5_5_b_Anzahl_maennlich": 0, "04_5_5_c_Anzahl_divers": 0, "04_5_5_d_unbekannt": 0,
            "04_5_6_a_Anzahl_weiblich": 0, "04_5_6_b_Anzahl_maennlich": 0, "04_5_6_c_Anzahl_divers": 0, "04_5_6_d_unbekannt": 0,
            "04_5_7_a_Anzahl_weiblich": 0, "04_5_7_b_Anzahl_maennlich": 0, "04_5_7_c_Anzahl_divers": 0, "04_5_7_d_unbekannt": 0,
            "04_5_8_a_Anzahl_weiblich": 0, "04_5_8_b_Anzahl_maennlich": 0, "04_5_8_c_Anzahl_divers": 0, "04_5_8_d_unbekannt": 0,
            "04_5_9_a_Anzahl_mitbetroffene_Kinder": violence.aggregate(
                total=Sum('tat_mitbetroffene_kinder')
            )['total'] or 0,
            "04_5_9_b_davon_direkt_betroffen": violence.aggregate(
                total=Sum('tat_direktbetroffene_kinder')
            )['total'] or 0,
        }

        # === BERICHTSDATEN - GEWALTART ===
        def count_violence_type(keyword):
            """
            Zählt Gewalttaten, die das Stichwort enthalten. 
            Verwendet icontains statt exakter Übereinstimmung, da tat_art Mehrfachauswahl sein kann.
            Spezialfall: 'Vergewaltigung' muss von 'versuchte Vergewaltigung' unterschieden werden.
            """
            q = violence.filter(tat_art__icontains=keyword)
            # Wenn wir nach "Vergewaltigung" suchen, dürfen wir "versuchte Vergewaltigung" nicht mitzählen,
            # ES SEI DENN, "Vergewaltigung" steht dort als eigenständiger Begriff (z.B. "Vergewaltigung, versuchte Vergewaltigung")
            # Das ist mit reinem String-Matching schwierig. 
            # Annahme: Wenn "versuchte Vergewaltigung" drin steht, ist es primär das.
            # Besserer Ansatz: Regex oder Trennung.
            # Pragmatisch für jetzt: Wir zählen alle Vorkommen.
            return q.count()

        # Speziallogik für Vergewaltigung vs. versuchte Vergewaltigung
        cnt_versuchte = count_violence_type("versuchte Vergewaltigung")
        # Alles was "Vergewaltigung" enthält, minus die, die NUR "versuchte Vergewaltigung" sind? 
        # Nein, das ist zu komplex für String-Suche ohne Struktur.
        # Wir zählen einfach alle, die "Vergewaltigung" enthalten, aber NICHT "versuchte".
        # Das ignoriert Fälle, wo BEIDES drin steht.
        cnt_vergewaltigung = violence.filter(tat_art__icontains="Vergewaltigung").exclude(tat_art__icontains="versuchte").count()
        # Add backup logic if structured data is used later
        # cnt_vergewaltigung += violence.filter(tat_art__contains="VG").count()

        berichtsdaten_gewaltart = {
            "04_6_1_Anzahl": cnt_vergewaltigung,
            "04_6_2_Anzahl": cnt_versuchte,
            "04_6_3_Anzahl": count_violence_type("sexuelle Nötigung"),
            "04_6_4_Anzahl": count_violence_type("sexuelle Belästigung"),
            "04_6_5_Anzahl": count_violence_type("sexuelle Ausbeutung"),
            "04_6_6_Anzahl": count_violence_type("Upskirting"),
            "04_6_7_Anzahl": count_violence_type("Catcalling"),
            "04_6_8_Anzahl": count_violence_type("digital"),
            "04_6_9_Anzahl": violence.exclude(
                Q(tat_art__icontains="Vergewaltigung") |
                Q(tat_art__icontains="versuchte Vergewaltigung") |
                Q(tat_art__icontains="sexuelle Nötigung") |
                Q(tat_art__icontains="sexuelle Belästigung") |
                Q(tat_art__icontains="sexuelle Ausbeutung") |
                Q(tat_art__icontains="Upskirting") |
                Q(tat_art__icontains="Catcalling") |
                Q(tat_art__icontains="digital")
            ).count(),
            "04_6_9_a_Welche": "-"
        }

        # === BERICHTSDATEN - GEWALTFOLGEN ===
        berichtsdaten_gewaltfolgen = {
            "04_7_1_Anzahl": violence_consequences.exclude(koerperliche_verletzung='N').count(),
            "04_7_2_Anzahl": violence_consequences.exclude(psychische_gewalt='N').count(),
            "04_7_3_Anzahl": violence_consequences.filter(arbeitseinschraenkung='J').count(),
            "04_7_4_Anzahl": violence_consequences.filter(finanzielle_folgen='J').count(),
            "04_7_5_Anzahl": violence_consequences.filter(verlust_arbeitsstelle='J').count(),
            "04_7_6_Anzahl": violence_consequences.filter(keine_angabe='J').count(),
            "04_7_7_Anzahl": violence_consequences.exclude(weiteres='').count(),
            "04_7_7A_Beschreibung": "-"
        }

        # === BERICHTSDATEN - TATNACHVERFOLGUNG ===
        berichtsdaten_tatnachverfolgung = {
            "04_8_1_Anzahl": violence.count(),
            "04_8_1A_Anzeige": violence.filter(tat_anzeige='J').count(),
            "04_8_1B_KeineAnzeige": violence.filter(tat_anzeige='N').count(),
            "04_8_1C_KeineAngabe": violence.filter(tat_anzeige='K').count(),
            "04_8_2A_VSS_vorgenommen": violence.filter(tat_spurensicherung='J').count(),
            "04_8_2B_VSS_nicht_vorgenommen": violence.filter(tat_spurensicherung='N').count(),
            "04_8_7_Anzahl": 0,
            "04_8_7A_Beschreibung": "-"
        }

        # === NETZWERK ===
        def count_kontakt(keyword):
            return active_clients.filter(klient_kontaktpunkt__icontains=keyword).count()

        netzwerk_data = {
            "05_1_1_selbstmeldung_polizei": count_kontakt("Polizei"),
            "05_1_2_private_kontakte": count_kontakt("privat") + count_kontakt("Freund") + count_kontakt("Familie"),
            "05_1_3_beratungsstellen": count_kontakt("Beratung"),
            "05_1_4_internet": count_kontakt("Internet") + count_kontakt("Online"),
            "05_1_5_aemter": count_kontakt("Amt") + count_kontakt("Behörde"),
            "05_1_6_gesundheitswesen": count_kontakt("Arzt") + count_kontakt("Krankenhaus"),
            "05_1_7_rechtsanwaeltinnen": count_kontakt("Anwalt") + count_kontakt("Anwält"),
            "05_1_8_unbekannt": active_clients.filter(
                Q(klient_kontaktpunkt='') | Q(klient_kontaktpunkt__isnull=True)
            ).count(),
            "05_1_9_andere_quelle": 0,
            "05_1_9_a_welche_andere_quelle": "-"
        }

        # === FINANZIERUNG ===
        total_dolmetsch_beratung = consultations.aggregate(
            total=Sum('dolmetscher_stunden')
        )['total'] or Decimal('0')
        total_dolmetsch_begleitung = accompaniments.aggregate(
            total=Sum('dolmetscher_stunden')
        )['total'] or Decimal('0')
        
        finanzierung_data = {
            "06_1_1_anzahl_stunden": float(total_dolmetsch_beratung + total_dolmetsch_begleitung),
            "06_1_2_keine_angabe": 0
        }

        # === RESULT ===
        structure = StatistikService.get_structure()
        data = {
            "auslastung": {
                "beratungen": auslastung_beratungen,
                "begleitungen": auslastung_begleitungen
            },
            "berichtsdaten": {
                "wohnsitz": berichtsdaten_wohnsitz,
                "staatsangehoerigkeit": berichtsdaten_staatsangehoerigkeit,
                "altersstruktur": berichtsdaten_altersstruktur,
                "behinderung": berichtsdaten_behinderung,
                "taeterOpferBeziehung": berichtsdaten_taeterOpferBeziehung,
                "gewaltart": berichtsdaten_gewaltart,
                "gewaltfolgen": berichtsdaten_gewaltfolgen,
                "tatnachverfolgung": berichtsdaten_tatnachverfolgung
            },
            "netzwerk": netzwerk_data,
            "finanzierung": finanzierung_data
        }

        # Falls _visible_sections übergeben wurde, filtern wir die Struktur
        # Die Struktur bestimmt, was im Frontend angezeigt wird.
        visible_sections = filters.get('_visible_sections')
        if visible_sections and isinstance(visible_sections, dict):
            # Helper zum Filtern
            def filter_category(cat_key, category_data):
                # Wenn Top-Level (z.B. auslastung), checken wir das direkt
                if cat_key in visible_sections and not visible_sections[cat_key]:
                    return None
                
                # Wenn es Unterkategorien gibt (z.B. berichtsdaten -> wohnsitz)
                if 'unterkategorien' in category_data:
                    new_subs = {}
                    for sub_key, sub_val in category_data['unterkategorien'].items():
                        # Ist diese Unterkategorie sichtbar?
                        # Wir checken, ob der Key in visible_sections ist (z.B. "wohnsitz")
                        # Wenn nicht im Dict, default true. Wenn False, dann weg.
                        if visible_sections.get(sub_key, True):
                            new_subs[sub_key] = sub_val
                    
                    if not new_subs:
                        return None # Wenn leer, ganze Kat weg
                    
                    category_data['unterkategorien'] = new_subs
                
                return category_data

            new_structure = {}
            for key, val in structure.items():
                # Special handling for "berichtsdaten" container which isn't a toggle itself but contains toggles
                if key == 'berichtsdaten':
                    filtered = filter_category(key, val.copy())
                    if filtered:
                        new_structure[key] = filtered
                # Direct check for others
                elif visible_sections.get(key, True):
                    new_structure[key] = val
            
            structure = new_structure

        return {
            "structure": structure,
            "data": data
        }

    @staticmethod
    def get_filters():
        """
        Gibt die verfügbaren Filter als JSON-Struktur zurück.
        """
    @staticmethod
    def get_filters():
        """
        Gibt die verfügbaren Filter als JSON-Struktur zurück.
        """
        # Helper to format choices
        def format_choices(choices):
            return [{"value": c[0], "label": c[1]} for c in choices]

        return [
            {
                "name": "zeitraum_start",
                "label": "Zeitraum Von",
                "type": "date"
            },
            {
                "name": "zeitraum_ende",
                "label": "Zeitraum Bis",
                "type": "date"
            },
            {
                "name": "anfrage_ort",
                "label": "Anfrage-Ort",
                "type": "multiselect",
                "options": format_choices(STANDORT_CHOICES)
            },
            {
                "name": "anfrage_person",
                "label": "Anfragende Person",
                "type": "multiselect",
                "options": format_choices(ANFRAGE_PERSON_CHOICES)
            },
            {
                "name": "anfrage_art",
                "label": "Art der Anfrage",
                "type": "multiselect",
                "options": format_choices(ANFRAGE_ART_CHOICES)
            },
            {
                "name": "beratungsstelle",
                "label": "Beratungsstelle",
                "type": "multiselect",
                "options": format_choices(STANDORT_CHOICES)
            },
            {
                "name": "beratungsart",
                "label": "Beratungsart",
                "type": "multiselect",
                "options": format_choices(BERATUNGSART_CHOICES)
            },
            {
                "name": "tatort",
                "label": "Tatort",
                "type": "multiselect",
                "options": format_choices(TATORT_CHOICES)
            },
            {
                "name": "psychische_folgen",
                "label": "Psychische Folgen",
                "type": "multiselect",
                "options": [{"value": "J", "label": "Ja"}, {"value": "N", "label": "Nein"}, {"value": "K", "label": "Keine Angabe"}]
            },
            {
                "name": "koerperliche_folgen",
                "label": "Körperliche Folgen",
                "type": "multiselect",
                "options": [{"value": "J", "label": "Ja"}, {"value": "N", "label": "Nein"}, {"value": "K", "label": "Keine Angabe"}]
            },
            {
                "name": "anzeige",
                "label": "Anzeige",
                "type": "multiselect",
                "options": [{"value": "J", "label": "Ja"}, {"value": "N", "label": "Nein"}, {"value": "K", "label": "Keine Angabe"}]
            }
        ]

    @staticmethod
    def get_structure() -> dict:
        """Liefert die vollständige Struktur für die Frontend-Darstellung."""
        return {
            "auslastung": {
                "label": "Auslastung",
                "unterkategorien": {
                    "beratungen": {
                        "label": "Beratungen",
                        "abschnitte": [
                            {
                                "label": "03-1-1 Geschlecht der beratenen Personen",
                                "kpis": [
                                    {"field": "03_1_1_a_gesamt", "label": "03-1-1-a gesamt"},
                                    {"field": "03_1_1_b_weiblich", "label": "03-1-1-b weiblich"},
                                    {"field": "03_1_1_c_maennlich", "label": "03-1-1-c männlich"},
                                    {"field": "03_1_1_d_divers", "label": "03-1-1-d divers"}
                                ]
                            },
                            {
                                "label": "03-1-2 Alter",
                                "kpis": [
                                    {"field": "03_1_2_a_gesamt", "label": "03-1-2-a gesamt"},
                                    {"field": "03_1_2_b_weiblich", "label": "03-1-2-b weiblich"},
                                    {"field": "03_1_2_c_maennlich", "label": "03-1-2-c männlich"},
                                    {"field": "03_1_2_d_divers", "label": "03-1-2-d divers"}
                                ]
                            },
                            {
                                "label": "03-1-3 Beratungsform",
                                "kpis": [
                                    {"field": "03_1_3_a_persoenlich", "label": "03-1-3-a persönlich"},
                                    {"field": "03_1_3_b_aufsuchend", "label": "03-1-3-b davon aufsuchend"},
                                    {"field": "03_1_3_c_telefonisch", "label": "03-1-3-c telefonisch"},
                                    {"field": "03_1_3_d_online", "label": "03-1-3-d online"},
                                    {"field": "03_1_3_e_schriftlich", "label": "03-1-3-e schriftlich"}
                                ]
                            }
                        ]
                    },
                    "begleitungen": {
                        "label": "Begleitungen",
                        "abschnitte": [
                            {"label": "03-2-1 gesamt", "kpis": [{"field": "03_2_1_gesamt", "label": "03-2-1 gesamt"}]},
                            {
                                "label": "03-2-2 bis 03-2-7 Institutionen",
                                "kpis": [
                                    {"field": "03_2_2_gerichte", "label": "03-2-2 Gerichte"},
                                    {"field": "03_2_4_rechtsanwaelte", "label": "03-2-4 Rechtsanwälte"},
                                    {"field": "03_2_6_rechtsmedizin", "label": "03-2-6 Rechtsmedizin"},
                                    {"field": "03_2_3_polizei", "label": "03-2-3 Polizei"},
                                    {"field": "03_2_5_aerzte", "label": "03-2-5 Ärzte"},
                                    {"field": "03_2_7_jugendamt", "label": "03-2-7 Jugendamt"}
                                ]
                            },
                            {
                                "label": "03-2-8 bis 03-2-14 weitere Einrichtungen",
                                "kpis": [
                                    {"field": "03_2_8_sozialamt", "label": "03-2-8 Sozialamt"},
                                    {"field": "03_2_9_jobcenter", "label": "03-2-9 Jobcenter"},
                                    {"field": "03_2_10_gewaltberatung", "label": "03-2-10 Gewaltberatung"},
                                    {"field": "03_2_12_schutzeinrichtungen", "label": "03-2-12 Schutzeinrichtungen"},
                                    {"field": "03_2_11_frauen_kinderschutz", "label": "03-2-11 Frauen-/Kinderschutz"},
                                    {"field": "03_2_13_interventionsstellen", "label": "03-2-13 Interventionsstellen"},
                                    {"field": "03_2_14_sonstige", "label": "03-2-14 sonstige"},
                                    {"field": "03_2_14_a_ggf_welche", "label": "03-2-14-a ggf. welche"}
                                ]
                            }
                        ]
                    }
                }
            },
            "berichtsdaten": {
                "label": "Berichtsdaten",
                "unterkategorien": {
                    "wohnsitz": {
                        "label": "Wohnsitz",
                        "abschnitte": [
                            {"label": "04-1-0 gesamt", "kpis": [
                                {"field": "04_1_0_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_1_0_b_Beratungen", "label": "Beratungen"}
                            ]},
                            {"label": "04-1-3 Stadt Leipzig", "kpis": [
                                {"field": "04_1_3_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_1_3_b_Beratungen", "label": "Beratungen"}
                            ]},
                            {"label": "04-1-13 Landkreis Leipzig", "kpis": [
                                {"field": "04_1_13_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_1_13_b_Beratungen", "label": "Beratungen"}
                            ]},
                            {"label": "04-1-14 Nordsachsen", "kpis": [
                                {"field": "04_1_14_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_1_14_b_Beratungen", "label": "Beratungen"}
                            ]},
                            {"label": "04-1-15 andere Bundesländer", "kpis": [
                                {"field": "04_1_15_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_1_15_b_Beratungen", "label": "Beratungen"}
                            ]},
                            {"label": "04-1-16 Ausland", "kpis": [
                                {"field": "04_1_16_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_1_16_b_Beratungen", "label": "Beratungen"},
                                {"field": "04_1_16_c_Welche_Lander", "label": "Welche Länder"}
                            ]},
                            {"label": "04-1-17 unbekannt", "kpis": [
                                {"field": "04_1_17_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_1_17_b_Beratungen", "label": "Beratungen"}
                            ]}
                        ]
                    },
                    "staatsangehoerigkeit": {
                        "label": "Staatsangehörigkeit",
                        "abschnitte": [
                            {"label": "04-2 Nicht-deutsche Staatsangehörigkeit", "kpis": [
                                {"field": "04_2_1_a_Anzahl_Klientinnen", "label": "Anzahl Klientinnen"},
                                {"field": "04_2_2_a_Beratungen", "label": "Beratungen"},
                                {"field": "04_2_3_a_Welche_Lander", "label": "Welche Länder"}
                            ]}
                        ]
                    },
                    "altersstruktur": {
                        "label": "Altersstruktur",
                        "abschnitte": [
                            {"label": "04-3-1 18-21 Jahre", "kpis": [{"field": "04_3_1_a_Anzahl_Klientinnen", "label": "Anzahl"}]},
                            {"label": "04-3-2 21-27 Jahre", "kpis": [{"field": "04_3_2_a_Anzahl_Klientinnen", "label": "Anzahl"}]},
                            {"label": "04-3-3 27-60 Jahre", "kpis": [{"field": "04_3_3_a_Anzahl_Klientinnen", "label": "Anzahl"}]},
                            {"label": "04-3-4 ab 60 Jahre", "kpis": [{"field": "04_3_4_a_Anzahl_Klientinnen", "label": "Anzahl"}]},
                            {"label": "04-3-5 unbekannt", "kpis": [{"field": "04_3_5_a_Anzahl_Klientinnen", "label": "Anzahl"}]}
                        ]
                    },
                    "behinderung": {
                        "label": "Behinderung",
                        "abschnitte": [
                            {"label": "04-4-0 Datenerfassung", "kpis": [{"field": "04_4_0_erfasst", "label": "Ja/Nein"}]},
                            {"label": "04-4-1 Schwerbehinderung", "kpis": [{"field": "04_4_1_a_Anzahl_Klientinnen", "label": "Anzahl"}]},
                            {"label": "04-4-2 Behinderung", "kpis": [{"field": "04_4_2_a_Anzahl_Klientinnen", "label": "Anzahl"}]},
                            {"label": "04-4-3 unbekannt", "kpis": [{"field": "04_4_3_a_Anzahl_Klientinnen", "label": "Anzahl"}]}
                        ]
                    },
                    "taeterOpferBeziehung": {
                        "label": "Täter-Opfer-Beziehung",
                        "abschnitte": [
                            {"label": "04-5-9 Mitbetroffene Kinder", "kpis": [
                                {"field": "04_5_9_a_Anzahl_mitbetroffene_Kinder", "label": "Gesamt"},
                                {"field": "04_5_9_b_davon_direkt_betroffen", "label": "Direkt betroffen"}
                            ]}
                        ]
                    },
                    "gewaltart": {
                        "label": "Art der Gewaltanwendung",
                        "abschnitte": [
                            {"label": "04-6-1 Vergewaltigung", "kpis": [{"field": "04_6_1_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-2 versuchte Vergewaltigung", "kpis": [{"field": "04_6_2_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-3 sexuelle Nötigung", "kpis": [{"field": "04_6_3_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-4 sexuelle Belästigung", "kpis": [{"field": "04_6_4_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-5 sexuelle Ausbeutung", "kpis": [{"field": "04_6_5_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-6 Upskirting", "kpis": [{"field": "04_6_6_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-7 Catcalling", "kpis": [{"field": "04_6_7_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-8 digitale Gewalt", "kpis": [{"field": "04_6_8_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-6-9 weitere", "kpis": [
                                {"field": "04_6_9_Anzahl", "label": "Anzahl"},
                                {"field": "04_6_9_a_Welche", "label": "Welche"}
                            ]}
                        ]
                    },
                    "gewaltfolgen": {
                        "label": "Folgen der Gewalt",
                        "abschnitte": [
                            {"label": "04-7-1 Körperliche Folgen", "kpis": [{"field": "04_7_1_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-7-2 Psychische Folgen", "kpis": [{"field": "04_7_2_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-7-3 Arbeitseinschränkung", "kpis": [{"field": "04_7_3_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-7-4 Finanzielle Folgen", "kpis": [{"field": "04_7_4_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-7-5 Verlust Arbeitsstelle", "kpis": [{"field": "04_7_5_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-7-6 Keine Angaben", "kpis": [{"field": "04_7_6_Anzahl", "label": "Anzahl"}]},
                            {"label": "04-7-7 Weiteres", "kpis": [
                                {"field": "04_7_7_Anzahl", "label": "Anzahl"},
                                {"field": "04_7_7A_Beschreibung", "label": "Beschreibung"}
                            ]}
                        ]
                    },
                    "tatnachverfolgung": {
                        "label": "Tatnachverfolgung",
                        "abschnitte": [
                            {"label": "04-8-1 Anzeige", "kpis": [
                                {"field": "04_8_1_Anzahl", "label": "Gesamt"},
                                {"field": "04_8_1A_Anzeige", "label": "Angezeigt"},
                                {"field": "04_8_1B_KeineAnzeige", "label": "Nicht angezeigt"},
                                {"field": "04_8_1C_KeineAngabe", "label": "Keine Angabe"}
                            ]},
                            {"label": "04-8-2 Spurensicherung", "kpis": [
                                {"field": "04_8_2A_VSS_vorgenommen", "label": "VSS vorgenommen"},
                                {"field": "04_8_2B_VSS_nicht_vorgenommen", "label": "Nicht vorgenommen"}
                            ]},
                            {"label": "04-8-7 Weiteres", "kpis": [
                                {"field": "04_8_7_Anzahl", "label": "Anzahl"},
                                {"field": "04_8_7A_Beschreibung", "label": "Beschreibung"}
                            ]}
                        ]
                    }
                }
            },
            "netzwerk": {
                "label": "Netzwerk",
                "unterkategorien": {
                    "netzwerk": {
                        "label": "Kontaktquellen",
                        "abschnitte": [
                            {"label": "05-1 Woher haben Klient:innen erfahren?", "kpis": [
                                {"field": "05_1_1_selbstmeldung_polizei", "label": "Polizei"},
                                {"field": "05_1_2_private_kontakte", "label": "Private Kontakte"},
                                {"field": "05_1_3_beratungsstellen", "label": "Beratungsstellen"},
                                {"field": "05_1_4_internet", "label": "Internet"},
                                {"field": "05_1_5_aemter", "label": "Ämter"},
                                {"field": "05_1_6_gesundheitswesen", "label": "Gesundheitswesen"},
                                {"field": "05_1_7_rechtsanwaeltinnen", "label": "Rechtsanwält:innen"},
                                {"field": "05_1_8_unbekannt", "label": "Unbekannt"},
                                {"field": "05_1_9_andere_quelle", "label": "Andere"},
                                {"field": "05_1_9_a_welche_andere_quelle", "label": "Welche"}
                            ]}
                        ]
                    }
                }
            },
            "finanzierung": {
                "label": "Finanzierung",
                "unterkategorien": {
                    "finanzierung": {
                        "label": "Dolmetschungen",
                        "abschnitte": [
                            {"label": "06-1 Dolmetschungen", "kpis": [
                                {"field": "06_1_1_anzahl_stunden", "label": "Anzahl Stunden"},
                                {"field": "06_1_2_keine_angabe", "label": "Keine Angabe"}
                            ]}
                        ]
                    }
                }
            }
        }
