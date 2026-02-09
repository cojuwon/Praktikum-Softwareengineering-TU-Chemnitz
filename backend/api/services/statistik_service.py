"""
StatistikService - Vollständige Daten-Aggregation für Statistikseite.
Ersetzt die Fake-API mit echten Datenbank-Abfragen.
"""
from django.db.models import Count, Q, Sum
from datetime import datetime
from decimal import Decimal

from api.models import (
    Fall, Beratungstermin, Begleitung, KlientIn, Gewalttat, Gewaltfolge, Anfrage,
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
        
        Args:
            filters: Dict mit Filterkriterien (zeitraum_start, zeitraum_ende, etc.)
            
        Returns:
            Dict mit 'structure' (Metadaten für UI) und 'data' (aggregierte Werte)
        """
        start_date = filters.get('zeitraum_start')
        end_date = filters.get('zeitraum_ende')
        
        # === QUERYSETS MIT ZEITFILTER ===
        cases = Fall.objects.all()
        if start_date:
            cases = cases.filter(startdatum__gte=start_date)
        if end_date:
            cases = cases.filter(startdatum__lte=end_date)

        consultations = Beratungstermin.objects.filter(status='s')  # nur stattgefundene
        if start_date:
            consultations = consultations.filter(termin_beratung__date__gte=start_date)
        if end_date:
            consultations = consultations.filter(termin_beratung__date__lte=end_date)
            
        accompaniments = Begleitung.objects.all()
        if start_date:
            accompaniments = accompaniments.filter(datum__gte=start_date)
        if end_date:
            accompaniments = accompaniments.filter(datum__lte=end_date)
            
        violence = Gewalttat.objects.filter(fall__in=cases)
        violence_consequences = Gewaltfolge.objects.filter(gewalttat__in=violence)
        
        # Aktive Klienten im Zeitraum (Klienten mit Fällen im Zeitraum)
        active_clients = KlientIn.objects.filter(fall__in=cases).distinct()
        
        # Anfragen im Zeitraum
        anfragen = Anfrage.objects.all()
        if start_date:
            anfragen = anfragen.filter(anfrage_datum__gte=start_date)
        if end_date:
            anfragen = anfragen.filter(anfrage_datum__lte=end_date)

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

        total_acc = accompaniments.count()
        auslastung_begleitungen = {
            "03_2_1_gesamt": total_acc,
            "03_2_2_gerichte": count_acc("Gericht"),
            "03_2_4_rechtsanwaelte": count_acc("Rechtsanw"),
            "03_2_6_rechtsmedizin": count_acc("Rechtsmedizin"),
            "03_2_3_polizei": count_acc("Polizei"),
            "03_2_5_aerzte": count_acc("Arzt") + count_acc("Ärzt"),
            "03_2_7_jugendamt": count_acc("Jugendamt"),
            "03_2_8_sozialamt": count_acc("Sozialamt"),
            "03_2_9_jobcenter": count_acc("Jobcenter") + count_acc("Agentur"),
            "03_2_10_gewaltberatung": count_acc("Gewalt"),
            "03_2_12_schutzeinrichtungen": count_acc("Schutz"),
            "03_2_11_frauen_kinderschutz": count_acc("Frauenhaus") + count_acc("Kinderschutz"),
            "03_2_13_interventionsstellen": count_acc("Intervention"),
            "03_2_14_sonstige": 0,
            "03_2_14_a_ggf_welche": "-"
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
            "04_1_2_a_Anzahl_Klientinnen": 0,  # Dresden - nicht in STANDORT_CHOICES
            "04_1_2_b_Beratungen": 0,
            "04_1_3_a_Anzahl_Klientinnen": count_clients_loc('LS'),
            "04_1_3_b_Beratungen": count_cons_loc('LS'),
            "04_1_4_a_Anzahl_Klientinnen": 0,  # Chemnitz
            "04_1_4_b_Beratungen": 0,
            "04_1_5_a_Anzahl_Klientinnen": 0,  # Erzgebirgskreis
            "04_1_5_b_Beratungen": 0,
            "04_1_6_a_Anzahl_Klientinnen": 0,  # Mittelsachsen
            "04_1_6_b_Beratungen": 0,
            "04_1_7_a_Anzahl_Klientinnen": 0,  # Vogtlandkreis
            "04_1_7_b_Beratungen": 0,
            "04_1_8_a_Anzahl_Klientinnen": 0,  # Zwickau
            "04_1_8_b_Beratungen": 0,
            "04_1_9_a_Anzahl_Klientinnen": 0,  # Bautzen
            "04_1_9_b_Beratungen": 0,
            "04_1_10_a_Anzahl_Klientinnen": 0,  # Görlitz
            "04_1_10_b_Beratungen": 0,
            "04_1_11_a_Anzahl_Klientinnen": 0,  # Meißen
            "04_1_11_b_Beratungen": 0,
            "04_1_12_a_Anzahl_Klientinnen": 0,  # Sächsische Schweiz
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
        non_german = active_clients.exclude(klient_staatsangehoerigkeit__icontains='deutsch')
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
            """Count violence entries with exact tat_art match to avoid overlapping counts."""
            return violence.filter(tat_art=keyword).count()

        berichtsdaten_gewaltart = {
            "04_6_1_Anzahl": count_violence_type("Vergewaltigung"),
            "04_6_2_Anzahl": count_violence_type("versuchte Vergewaltigung"),
            "04_6_3_Anzahl": count_violence_type("sexuelle Nötigung"),
            "04_6_4_Anzahl": count_violence_type("sexuelle Belästigung"),
            "04_6_5_Anzahl": count_violence_type("sexuelle Ausbeutung"),
            "04_6_6_Anzahl": count_violence_type("Upskirting"),
            "04_6_7_Anzahl": count_violence_type("Catcalling"),
            "04_6_8_Anzahl": count_violence_type("digital"),
            "04_6_9_Anzahl": max(0, violence.count() - sum([
                count_violence_type("Vergewaltigung"),
                count_violence_type("versuchte Vergewaltigung"),
                count_violence_type("sexuelle Nötigung"),
                count_violence_type("sexuelle Belästigung"),
                count_violence_type("sexuelle Ausbeutung"),
                count_violence_type("Upskirting"),
                count_violence_type("Catcalling"),
                count_violence_type("digital"),
            ])),
            "04_6_9_a_Welche": "-"
        }

        # === BERICHTSDATEN - GEWALTFOLGEN ===
        berichtsdaten_gewaltfolgen = {
            "04_7_1_Anzahl": violence_consequences.exclude(koerperliche_folgen='N').count(),
            "04_7_2_Anzahl": violence_consequences.exclude(psychische_folgen='N').count(),
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
        return {
            "structure": StatistikService.get_structure(),
            "data": {
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
        }

    @staticmethod
    def get_filters() -> list:
        """Liefert alle verfügbaren Filter mit echten Enum-Optionen."""
        def choices_to_options(choices):
            return [{"value": c[0], "label": c[1]} for c in choices]

        return [
            {"name": "zeitraum_start", "label": "Von", "type": "date"},
            {"name": "zeitraum_ende", "label": "Bis", "type": "date"},
            {"name": "anfrage_ort", "label": "Anfrage-Ort", "type": "select", 
             "options": choices_to_options(STANDORT_CHOICES)},
            {"name": "anfrage_person", "label": "Anfragende Person", "type": "select",
             "options": choices_to_options(ANFRAGE_PERSON_CHOICES)},
            {"name": "anfrage_art", "label": "Art der Anfrage", "type": "select",
             "options": choices_to_options(ANFRAGE_ART_CHOICES)},
            {"name": "beratungsstelle", "label": "Beratungsstelle", "type": "select",
             "options": choices_to_options(BERATUNGSSTELLE_CHOICES)},
            {"name": "beratungsart", "label": "Beratungsart", "type": "select",
             "options": choices_to_options(BERATUNGSART_CHOICES)},
            {"name": "tatort", "label": "Tatort", "type": "select",
             "options": choices_to_options(TATORT_CHOICES)},
            {"name": "psychische_folgen", "label": "Psychische Folgen", "type": "select",
             "options": choices_to_options(PSYCH_FOLGEN_CHOICES)},
            {"name": "koerperliche_folgen", "label": "Körperliche Folgen", "type": "select",
             "options": choices_to_options(KOERPER_FOLGEN_CHOICES)},
            {"name": "anzeige", "label": "Anzeige", "type": "select",
             "options": choices_to_options(ANZEIGE_CHOICES)},
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
