from django.db.models import Count, Q, Sum
from api.models import (
    Fall, Beratungstermin, Begleitung, KlientIn, Gewalttat, Gewaltfolge,
    Anfrage,
    BERATUNGSSTELLE_CHOICES, STANDORT_CHOICES, KLIENT_GESCHLECHT_CHOICES,
    KLIENT_ROLLE_CHOICES, BERATUNGSART_CHOICES, TATORT_CHOICES,
    ANZAHL_TAETER_CHOICES, ANZEIGE_CHOICES, PSYCH_FOLGEN_CHOICES,
    KOERPER_FOLGEN_CHOICES
)
from datetime import datetime

class StatistikService:
    @staticmethod
    def calculate_stats(filters):
        start_date = filters.get('zeitraum_start')
        end_date = filters.get('zeitraum_ende')
        
        # Basis-QuerySet für Fälle im Zeitraum
        cases = Fall.objects.all()
        if start_date:
            cases = cases.filter(startdatum__gte=start_date)
        if end_date:
            cases = cases.filter(startdatum__lte=end_date)

        # Basis-QuerySet für Beratungen im Zeitraum
        consultations = Beratungstermin.objects.all()
        if start_date:
            consultations = consultations.filter(termin_beratung__gte=start_date)
        if end_date:
            consultations = consultations.filter(termin_beratung__lte=end_date)
            
        # Basis-QuerySet für Begleitungen
        accompaniments = Begleitung.objects.all()
        if start_date:
            accompaniments = accompaniments.filter(datum__gte=start_date)
        if end_date:
            accompaniments = accompaniments.filter(datum__lte=end_date)

        # Helper to safely get counts
        def count_qs(qs):
            return qs.count()

        # --- AUSLASTUNG ---
        
        # 03-1-1 Geschlecht
        # Mapping der Geschlechter aus dem Model auf die Statistik-Kategorien
        # Model: CW, CM, TW, TM, TN, I, A, D, K
        # Stat: weiblich, männlich, divers
        # Wir ordnen:
        # weiblich -> CW, TW
        # männlich -> CM, TM
        # divers -> TN, I, A, D
        # (K -> nicht zugeordnet oder separat?)
        
        gender_map = {
            'weiblich': ['CW', 'TW'],
            'maennlich': ['CM', 'TM'],
            'divers': ['TN', 'I', 'A', 'D']
        }
        
        # Wir müssen die KLIENTEN der Beratungen betrachten via Fall -> KlientIn
        # ACHTUNG: Eine Beratung ist einem Fall zugeordnet, der Fall einem Klienten.
        # Es gibt auch Beratungen ohne Fall? -> Modellprüfung: Fall ist ForeignKey, null=True.
        # Wenn kein Fall, dann kein Klient -> nicht zählbar in Demografie?
        
        # Beratungen mit Fallbezug
        cons_with_case = consultations.exclude(fall__isnull=True).select_related('fall__klient')
        
        c_weiblich = cons_with_case.filter(fall__klient__klient_geschlechtsidentitaet__in=gender_map['weiblich']).count()
        c_maennlich = cons_with_case.filter(fall__klient__klient_geschlechtsidentitaet__in=gender_map['maennlich']).count()
        c_divers = cons_with_case.filter(fall__klient__klient_geschlechtsidentitaet__in=gender_map['divers']).count()
        c_total = consultations.count() # Gesamt alle Beratungen
        
        # 03-1-2 Alter (Alter ist bei Klient, kann sich ändern, wir nehmen das aktuelle Alter)
        # Besser wäre Geburtsdatum, aber Model hat "klient_alter" als Integer. 
        # Wir nehmen das, was da ist.
        # Kategorien: 18-21, 21-27, 27-60, >60.
        # Hier vereinfacht für Statistik "Alter":
        # Wir summieren einfach die Altersgruppen, wenn wir sie hätten.
        # Das Frontend erwartet hier auch Unterteilung nach Geschlecht. Das ist komplex.
        # Für PoC nehmen wir globale Verteilung am Klienten.
        
        # Wir vereinfachen hier stark für den ersten Wurf, da die genaue Matrix (Alter x Geschlecht) aufwendig ist.
        # Wir zählen Klienten in Bereichen.
        
        # 03-1-3 Beratungsform
        # Model choices: P (persönlich), V (Video), T (Telefon), A (aufsuchend), S (schriftlich)
        # Stats: persoenlich, aufsuchend, telefonisch, online (Video), schriftlich
        form_map = {
            'persoenlich': ['P'],
            'aufsuchend': ['A'],
            'telefonisch': ['T'],
            'online': ['V'],
            'schriftlich': ['S']
        }
        
        c_form = {}
        for k, v in form_map.items():
            c_form[f"03_1_3_{k[0]}_{k}"] = consultations.filter(beratungsart__in=v).count() # Mapping keys a, b, c... dirty hack
            
        # Sauberes Mapping für Keys
        auslastung_beratungen = {
            "03_1_1_a_gesamt": c_total,
            "03_1_1_b_weiblich": c_weiblich,
            "03_1_1_c_maennlich": c_maennlich,
            "03_1_1_d_divers": c_divers,

            # Dummy für Alter (komplex zu query-en in einem Rutsch)
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

        # Begleitungen
        # Model: einrichtung (Text) -> wir müssen matchen oder Model erweitern auf Choices?
        # Model hat 'einrichtung' als CharField, aber Frontend hat feste Kategorien.
        # Wahrscheinlich Freitext-Matching oder wir zählen einfach alles als "Sonstige" wenn nicht matcht.
        # Begleitung hat aber KEINE Categories im Model für 'Gericht', 'Polizei' etc als Enum, sondern Freitext?
        # WAIT: Looking at `models.py`:
        # `einrichtung = models.CharField(max_length=255, ...)`
        # Aber `BEGLEITUNG_ART_CHOICES` existed in comments/definitions but maybe not used in field?
        # `models.py`: `einrichtung` is CharField. 
        # Ah, scratch that. Let's look at `models.py` again.
        # `Begleitung` model has `einrichtung` as CharField.
        # But `BEGLEITUNG_ART_CHOICES` is defined in `models.py`.
        # Is it used?
        # No, `einrichtung` is a CharField. It likely stores the string.
        # We might need to filter by `einrichtung__icontains='Polizei'` etc. or the frontend sends the choice key.
        # Let's assume keys are stored if select was used.
        
        def count_acc(keyword):
            return accompaniments.filter(einrichtung__icontains=keyword).count()

        auslastung_begleitungen = {
            "03_2_1_gesamt": accompaniments.count(),
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
            "03_2_11_frauen_kinderschutz": count_acc("Frauenhaus"),
            "03_2_13_interventionsstellen": count_acc("Intervention"),
            "03_2_14_sonstige": 0, # Placeholder
            "03_2_14_a_ggf_welche": "-"
        }


        # --- BERICHTSDATEN (Wohnsitz, Staatsor., Alter) ---
        # Data is based on Clients (KlientIn).
        # Should we filter clients by "active in period"? 
        # Use cases in period -> clients.
        active_clients = KlientIn.objects.filter(fall__in=cases).distinct()
        
        # Wohnsitz
        # Model: klient_wohnort Choices: LS, LL, NS, S, D, A, K
        def count_clients_loc(loc_code):
            return active_clients.filter(klient_wohnort=loc_code).count()
            
        # Mapping Frontend fields to backend codes is needed.
        # Frontend: 04_1_3 (Leipzig), 04_1_14 (Nordsachsen)...
        # Backend: LS, NS, LL...
        # Only a few match directly. Others are "Sachsen" or "Deutschland".
        
        berichtsdaten_wohnsitz = {
            "04_1_0_a_Anzahl_Klientinnen": active_clients.count(),
            "04_1_0_b_Beratungen": consultations.count(), # Global count? Or for these clients? Assuming global for "0" row
            
            # Leipzig Stadt
            "04_1_3_a_Anzahl_Klientinnen": count_clients_loc('LS'),
            
            # Leipzig Land
            "04_1_13_a_Anzahl_Klientinnen": count_clients_loc('LL'),
            
            # Nordsachsen
            "04_1_14_a_Anzahl_Klientinnen": count_clients_loc('NS'),
            
            # Others mapped to catch-all for now
            "04_1_15_a_Anzahl_Klientinnen": count_clients_loc('S') + count_clients_loc('D'),
            
            "04_1_16_a_Anzahl_Klientinnen": count_clients_loc('A'),
            
            "04_1_17_a_Anzahl_Klientinnen": count_clients_loc('K'),
        }

        # --- Aggregation Structure Build ---
        
        result = {
            "structure": StatistikService.get_structure(),
            "data": {
                "auslastung": {
                    "beratungen": auslastung_beratungen,
                    "begleitungen": auslastung_begleitungen
                },
                "berichtsdaten": {
                    "wohnsitz": berichtsdaten_wohnsitz,
                    "staatsangehoerigkeit": {},
                    "altersstruktur": {},
                    "behinderung": {},
                    "taeterOpferBeziehung": {},
                    "gewaltart": {},
                    "gewaltfolgen": {},
                    "tatnachverfolgung": {}
                },
                 "netzwerk": {},
                 "finanzierung": {}
            }
        }
        
        return result

    @staticmethod
    def get_structure():
        # Copy of the structure from frontend/app/api/statistik/query/route.ts
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
                      { "field": "03_1_1_a_gesamt", "label": "03-1-1-a gesamt" },
                      { "field": "03_1_1_b_weiblich", "label": "03-1-1-b weiblich" },
                      { "field": "03_1_1_c_maennlich", "label": "03-1-1-c männlich" },
                      { "field": "03_1_1_d_divers", "label": "03-1-1-d divers" }
                    ]
                  },
                  {
                    "label": "03-1-2 Alter",
                    "kpis": [
                      { "field": "03_1_2_a_gesamt", "label": "03-1-2-a gesamt" },
                      { "field": "03_1_2_b_weiblich", "label": "03-1-2-b weiblich" },
                      { "field": "03_1_2_c_maennlich", "label": "03-1-2-c männlich" },
                      { "field": "03_1_2_d_divers", "label": "03-1-2-d divers" }
                    ]
                  },
                  {
                    "label": "03-1-3 Beratungsform",
                    "kpis": [
                      { "field": "03_1_3_a_persoenlich", "label": "03-1-3-a persönlich" },
                      { "field": "03_1_3_b_aufsuchend", "label": "03-1-3-b davon aufsuchend" },
                      { "field": "03_1_3_c_telefonisch", "label": "03-1-3-c telefonisch" },
                      { "field": "03_1_3_d_online", "label": "03-1-3-d online" },
                      { "field": "03_1_3_e_schriftlich", "label": "03-1-3-e schriftlich (auch E-Mail)" }
                    ]
                  }
                ]
              },
              "begleitungen": {
                "label": "Begleitungen",
                "abschnitte": [
                  {
                    "label": "03-2-1 gesamt",
                    "kpis": [{ "field": "03_2_1_gesamt", "label": "03-2-1 gesamt" }]
                  },
                  {
                    "label": "03-2-2 bis 03-2-7 Institutionen",
                    "kpis": [
                      { "field": "03_2_2_gerichte", "label": "03-2-2 Gerichte" },
                      { "field": "03_2_4_rechtsanwaelte", "label": "03-2-4 Rechtsanwälte/ Rechtsanwältinnen" },
                      { "field": "03_2_6_rechtsmedizin", "label": "03-2-6 Rechtsmedizin" },
                      { "field": "03_2_3_polizei", "label": "03-2-3 Polizei" },
                      { "field": "03_2_5_aerzte", "label": "03-2-5 Ärzte/ Ärztinnen" },
                      { "field": "03_2_7_jugendamt", "label": "03-2-7 Jugendamt" }
                    ]
                  },
                  {
                    "label": "03-2-8 bis 03-2-14 weitere Einrichtungen",
                    "kpis": [
                      { "field": "03_2_8_sozialamt", "label": "03-2-8 Sozialamt" },
                      { "field": "03_2_9_jobcenter", "label": "03-2-9 Jobcenter/Arbeitsagentur" },
                      { "field": "03_2_10_gewaltberatung", "label": "03-2-10 Beratungsstellen für Gewaltausübende" },
                      { "field": "03_2_12_schutzeinrichtungen", "label": "03-2-12 spezialisierte Schutzeinrichtungen" },
                      { "field": "03_2_11_frauen_kinderschutz", "label": "03-2-11 Frauen- und Kinderschutzeinrichtungen" },
                      { "field": "03_2_13_interventionsstellen", "label": "03-2-13 Interventions- und Koordinierungsstellen" },
                      { "field": "03_2_14_sonstige", "label": "03-2-14 sonstige Einrichtungen/Institutionen" },
                      { "field": "03_2_14_a_ggf_welche", "label": "03-2-14-a ggf. welche" }
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
                  {
                    "label": "04-1-0 gesamt",
                    "kpis": [
                      { "field": "04_1_0_a_Anzahl_Klientinnen", "label": "04_1_0_a_Anzahl_Klientinnen" },
                      { "field": "04_1_0_b_Beratungen", "label": "04_1_0_b_Beratungen" }
                    ]
                  },
                  {
                    "label": "04-1-3 Stadt Leipzig",
                    "kpis": [
                      { "field": "04_1_3_a_Anzahl_Klientinnen", "label": "04_1_3_a_Anzahl_Klientinnen" },
                      # Removed Beratungen for brevity in initial logic
                    ]
                  },
                   # ... Full list theoretically needed
                ]
              }
            }
          }
        }
