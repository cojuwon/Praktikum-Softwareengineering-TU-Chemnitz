import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Erhaltene Filter:", body);

  const fakeResult = {
    structure: {
      auslastung: {
        label: "Auslastung",
        unterkategorien: {
          beratungen: {
            label: "Beratungen",
            abschnitte: [
              {
                label: "03-1-1 Geschlecht der beratenen Personen",
                kpis: [
                  { field: "03_1_1_a_gesamt", label: "03-1-1-a gesamt" },
                  { field: "03_1_1_b_weiblich", label: "03-1-1-b weiblich" },
                  { field: "03_1_1_c_maennlich", label: "03-1-1-c männlich" },
                  { field: "03_1_1_d_divers", label: "03-1-1-d divers" }
                ]
              },
              {
                label: "03-1-2 Alter",
                kpis: [
                  { field: "03_1_2_a_gesamt", label: "03-1-2-a gesamt" },
                  { field: "03_1_2_b_weiblich", label: "03-1-2-b weiblich" },
                  { field: "03_1_2_c_maennlich", label: "03-1-2-c männlich" },
                  { field: "03_1_2_d_divers", label: "03-1-2-d divers" }
                ]
              },
              {
                label: "03-1-3 Beratungsform",
                kpis: [
                  { field: "03_1_3_a_persoenlich", label: "03-1-3-a persönlich" },
                  { field: "03_1_3_b_aufsuchend", label: "03-1-3-b davon aufsuchend" },
                  { field: "03_1_3_c_telefonisch", label: "03-1-3-c telefonisch" },
                  { field: "03_1_3_d_online", label: "03-1-3-d online" },
                  { field: "03_1_3_e_schriftlich", label: "03-1-3-e schriftlich (auch E-Mail)" }
                ]
              }
            ]
          },

          begleitungen: {
            label: "Begleitungen",
            abschnitte: [
              {
                label: "03-2-1 gesamt",
                kpis: [{ field: "03_2_1_gesamt", label: "03-2-1 gesamt" }]
              },
              {
                label: "03-2-2 bis 03-2-7 Institutionen",
                kpis: [
                  { field: "03_2_2_gerichte", label: "03-2-2 Gerichte" },
                  { field: "03_2_4_rechtsanwaelte", label: "03-2-4 Rechtsanwälte/ Rechtsanwältinnen" },
                  { field: "03_2_6_rechtsmedizin", label: "03-2-6 Rechtsmedizin" },
                  { field: "03_2_3_polizei", label: "03-2-3 Polizei" },
                  { field: "03_2_5_aerzte", label: "03-2-5 Ärzte/ Ärztinnen" },
                  { field: "03_2_7_jugendamt", label: "03-2-7 Jugendamt" }
                ]
              },
              {
                label: "03-2-8 bis 03-2-14 weitere Einrichtungen",
                kpis: [
                  { field: "03_2_8_sozialamt", label: "03-2-8 Sozialamt" },
                  { field: "03_2_9_jobcenter", label: "03-2-9 Jobcenter/Arbeitsagentur" },
                  { field: "03_2_10_gewaltberatung", label: "03-2-10 Beratungsstellen für Gewaltausübende" },
                  { field: "03_2_12_schutzeinrichtungen", label: "03-2-12 spezialisierte Schutzeinrichtungen" },
                  { field: "03_2_11_frauen_kinderschutz", label: "03-2-11 Frauen- und Kinderschutzeinrichtungen" },
                  { field: "03_2_13_interventionsstellen", label: "03-2-13 Interventions- und Koordinierungsstellen" },
                  { field: "03_2_14_sonstige", label: "03-2-14 sonstige Einrichtungen/Institutionen" },
                  { field: "03_2_14_a_ggf_welche", label: "03-2-14-a ggf. welche" }
                ]
              }
            ]
          }
        }
      },

      // ------------------------------------------------
      // BERICHTSDATEN
      // ------------------------------------------------

      berichtsdaten: {
        label: "Berichtsdaten",
        unterkategorien: {
          wohnsitz: {
            label: "Wohnsitz",
            abschnitte: [
              {
                label: "04-1-0 gesamt",
                kpis: [
                  { field: "04_1_0_a_Anzahl_Klientinnen", label: "04_1_0_a_Anzahl_Klientinnen" },
                  { field: "04_1_0_b_Beratungen", label: "04_1_0_b_Beratungen" }
                ]
              },

              {
                label: "04-1-1 eigener Landkreis",
                kpis: [
                  { field: "04_1_1_a_Anzahl_Klientinnen", label: "04_1_1_a_Anzahl_Klientinnen" },
                  { field: "04_1_1_b_Beratungen", label: "04_1_1_b_Beratungen" }
                ]
              },

              {
                label: "04-1-2 Stadt Dresden",
                kpis: [
                  { field: "04_1_2_a_Anzahl_Klientinnen", label: "04_1_2_a_Anzahl_Klientinnen" },
                  { field: "04_1_2_b_Beratungen", label: "04_1_2_b_Beratungen" }
                ]
              },

              {
                label: "04-1-3 Stadt Leipzig",
                kpis: [
                  { field: "04_1_3_a_Anzahl_Klientinnen", label: "04_1_3_a_Anzahl_Klientinnen" },
                  { field: "04_1_3_b_Beratungen", label: "04_1_3_b_Beratungen" }
                ]
              },

              {
                label: "04-1-4 Stadt Chemnitz",
                kpis: [
                  { field: "04_1_4_a_Anzahl_Klientinnen", label: "04_1_4_a_Anzahl_Klientinnen" },
                  { field: "04_1_4_b_Beratungen", label: "04_1_4_b_Beratungen" }
                ]
              },

              {
                label: "04-1-5 Erzgebirgskreis",
                kpis: [
                  { field: "04_1_5_a_Anzahl_Klientinnen", label: "04_1_5_a_Anzahl_Klientinnen" },
                  { field: "04_1_5_b_Beratungen", label: "04_1_5_b_Beratungen" }
                ]
              },

              {
                label: "04-1-6 Landkreis Mittelsachsen",
                kpis: [
                  { field: "04_1_6_a_Anzahl_Klientinnen", label: "04_1_6_a_Anzahl_Klientinnen" },
                  { field: "04_1_6_b_Beratungen", label: "04_1_6_b_Beratungen" }
                ]
              },

              {
                label: "04-1-7 Vogtlandkreis",
                kpis: [
                  { field: "04_1_7_a_Anzahl_Klientinnen", label: "04_1_7_a_Anzahl_Klientinnen" },
                  { field: "04_1_7_b_Beratungen", label: "04_1_7_b_Beratungen" }
                ]
              },

              {
                label: "04-1-8 Landkreis Zwickau",
                kpis: [
                  { field: "04_1_8_a_Anzahl_Klientinnen", label: "04_1_8_a_Anzahl_Klientinnen" },
                  { field: "04_1_8_b_Beratungen", label: "04_1_8_b_Beratungen" }
                ]
              },

              {
                label: "04-1-9 Landkreis Bautzen",
                kpis: [
                  { field: "04_1_9_a_Anzahl_Klientinnen", label: "04_1_9_a_Anzahl_Klientinnen" },
                  { field: "04_1_9_b_Beratungen", label: "04_1_9_b_Beratungen" }
                ]
              },

              {
                label: "04-1-10 Landkreis Görlitz",
                kpis: [
                  { field: "04_1_10_a_Anzahl_Klientinnen", label: "04_1_10_a_Anzahl_Klientinnen" },
                  { field: "04_1_10_b_Beratungen", label: "04_1_10_b_Beratungen" }
                ]
              },

              {
                label: "04-1-11 Landkreis Meißen",
                kpis: [
                  { field: "04_1_11_a_Anzahl_Klientinnen", label: "04_1_11_a_Anzahl_Klientinnen" },
                  { field: "04_1_11_b_Beratungen", label: "04_1_11_b_Beratungen" }
                ]
              },

              {
                label: "04-1-12 Landkreis Sächsische Schweiz-Osterzgebirge",
                kpis: [
                  { field: "04_1_12_a_Anzahl_Klientinnen", label: "04_1_12_a_Anzahl_Klientinnen" },
                  { field: "04_1_12_b_Beratungen", label: "04_1_12_b_Beratungen" }
                ]
              },

              {
                label: "04-1-13 Landkreis Leipzig",
                kpis: [
                  { field: "04_1_13_a_Anzahl_Klientinnen", label: "04_1_13_a_Anzahl_Klientinnen" },
                  { field: "04_1_13_b_Beratungen", label: "04_1_13_b_Beratungen" }
                ]
              },

              {
                label: "04-1-14 Landkreis Nordsachsen",
                kpis: [
                  { field: "04_1_14_a_Anzahl_Klientinnen", label: "04_1_14_a_Anzahl_Klientinnen" },
                  { field: "04_1_14_b_Beratungen", label: "04_1_14_b_Beratungen" }
                ]
              },

              {
                label: "04-1-15 andere Bundesländer",
                kpis: [
                  { field: "04_1_15_a_Anzahl_Klientinnen", label: "04_1_15_a_Anzahl_Klientinnen" },
                  { field: "04_1_15_b_Beratungen", label: "04_1_15_b_Beratungen" }
                ]
              },

              {
                label: "04-1-16 Ausland",
                kpis: [
                  { field: "04_1_13_a_Anzahl_Klientinnen", label: "04_1_13_a_Anzahl_Klientinnen" },
                  { field: "04_1_13_b_Beratungen", label: "04_1_13_b_Beratungen" },
                  { field: "04_1_13_c_Welche_Lander", label: "04_1_13_c_Welche_Lander" }
                ]
              },

              {
                label: "04-1-17 Wohnsitz unbekannt",
                kpis: [
                  { field: "04_1_17_a_Anzahl_Klientinnen", label: "04_1_17_a_Anzahl_Klientinnen" },
                  { field: "04_1_17_b_Beratungen", label: "04_1_17_b_Beratungen" }
                ]
              }
            ]
          },        
          staatsangehoerigkeit: {
            label: "Staatsangehörigkeit (keine Statusdeutschen i. S. v. Artikel 116 Abs. 1 GG)",
            abschnitte: [
              {
                label: "04-2-1 Anzahl Klient:innen ohne deutsche Staatsangehörigkeit",
                kpis: [
                  { field: "04_2_1_a_Anzahl_Klientinnen", label: "04-2-1-a Anzahl Klientinnen" }
                ]
              },
              {
                label: "04-2-2 Anzahl Beratungen",
                kpis: [
                  { field: "04_2_2_a_Beratungen", label: "04-2-2-a Anzahl Beratungen" }
                ]
                },
              {
                label: "04-2-3 Welche Länder?",
                kpis: [
                 { field: "04_2_3_a_Welche_Lander", label: "04-2-3-a Welche Länder" }
                ]
              }
            ]
          }, 
          altersstruktur: {
            label: "Altersstruktur",
            abschnitte: [
              {
                label: "04-3-1 Anzahl 18 bis unter 21 Jahren",
                kpis: [
                  { field: "04_3_1_a_Anzahl_Klientinnen", label: "04-3-1-a Anzahl Klientinnen" }
                ]
              },
              {
                label: "04-3-2 Anzahl 21 bis unter 27 Jahren",
                kpis: [
                  { field: "04_3_2_a_Anzahl_Klientinnen", label: "04-3-2-a Anzahl Klientinnen" }
                ]
              },
              {
                label: "04-3-3 Anzahl 27 bis unter 60 Jahren",
                kpis: [
                  { field: "04_3_3_a_Anzahl_Klientinnen", label: "04-3-3-a Anzahl Klientinnen" }
                ]
              },
              {
                label: "04-3-4 Anzahl ab 60 Jahren",
                kpis: [
                  { field: "04_3_4_a_Anzahl_Klientinnen", label: "04-3-4-a Anzahl Klientinnen" }
                ]
              },
              {
                label: "04-3-5 unbekannt / keine Angabe",
                kpis: [
                  { field: "04_3_5_a_Anzahl_Klientinnen", label: "04-3-5-a Anzahl Klientinnen" }
                ]
              }
            ]
          },
          behinderung: {
            label: "Klienten/ Klientinnen mit Schwerbehinderung / Behinderung",
            abschnitte: [
              {
                label: "04-4-0 Werden aktuell Daten für Klienten/ Klientinnen mit Schwerbehinderung erfasst?",
                kpis: [
                  { field: "04_4_0_erfasst", label: "04-4-0 Ja/Nein" }
                ]
              },
              {
                label: "04-4-1 Anzahl Klienten/ Klientinnen mit Schwerbehinderung",
                kpis: [
                  { field: "04_4_1_a_Anzahl_Klientinnen", label: "04-4-1-a Anzahl Klientinnen" }
                ]
              },
              {
                label: "04-4-2 Anzahl Klienten/ Klientinnen mit Behinderung",
                kpis: [
                  { field: "04_4_2_a_Anzahl_Klientinnen", label: "04-4-2-a Anzahl Klientinnen" }
                ]
              },
              {
                label: "04-4-3 Anzahl Klienten/ Klientinnen unbekannt / keine Angabe",
                kpis: [
                  { field: "04_4_3_a_Anzahl_Klientinnen", label: "04-4-3-a Anzahl Klientinnen" }
                ]
              }
            ]
          },
          taeterOpferBeziehung: {
            label: "Täter-Opfer-Beziehung",
            abschnitte: [
              {
                label: "04-5-1",
                kpis: [
                  { field: "04_5_1_a_Anzahl_weiblich", label: "04-5-1-a Anzahl weiblich" },
                  { field: "04_5_1_b_Anzahl_maennlich", label: "04-5-1-b Anzahl männlich" },
                  { field: "04_5_1_c_Anzahl_divers", label: "04-5-1-c Anzahl divers" }
                ]
              },
              {
                label: "04-5-2",
                kpis: [
                  { field: "04_5_2_a_Anzahl_weiblich", label: "04-5-2-a Anzahl weiblich" },
                  { field: "04_5_2_b_Anzahl_maennlich", label: "04-5-2-b Anzahl männlich" },
                  { field: "04_5_2_c_Anzahl_divers", label: "04-5-2-c Anzahl divers" }
                ]
              },
              {
                label: "04-5-3",
                kpis: [
                  { field: "04_5_3_a_Anzahl_weiblich", label: "04-5-3-a Anzahl weiblich" },
                  { field: "04_5_3_b_Anzahl_maennlich", label: "04-5-3-b Anzahl männlich" },
                  { field: "04_5_3_c_Anzahl_divers", label: "04-5-3-c Anzahl divers" }
                ]
              },
              {
                label: "04-5-4",
                kpis: [
                  { field: "04_5_4_a_Anzahl_weiblich", label: "04-5-4-a Anzahl weiblich" },
                  { field: "04_5_4_b_Anzahl_maennlich", label: "04-5-4-b Anzahl männlich" },
                  { field: "04_5_4_c_Anzahl_divers", label: "04-5-4-c Anzahl divers" },
                  { field: "04_5_4_d_unbekannt", label: "04-5-4-d unbekannt / keine Angabe" }
                ]
              },
              {
                label: "04-5-5",
                kpis: [
                  { field: "04_5_5_a_Anzahl_weiblich", label: "04-5-5-a Anzahl weiblich" },
                  { field: "04_5_5_b_Anzahl_maennlich", label: "04-5-5-b Anzahl männlich" },
                  { field: "04_5_5_c_Anzahl_divers", label: "04-5-5-c Anzahl divers" },
                  { field: "04_5_5_d_unbekannt", label: "04-5-5-d unbekannt / keine Angabe" }
                ]
              },
              {
                label: "04-5-6",
                kpis: [
                  { field: "04_5_6_a_Anzahl_weiblich", label: "04-5-6-a Anzahl weiblich" },
                  { field: "04_5_6_b_Anzahl_maennlich", label: "04-5-6-b Anzahl männlich" },
                  { field: "04_5_6_c_Anzahl_divers", label: "04-5-6-c Anzahl divers" },
                  { field: "04_5_6_d_unbekannt", label: "04-5-6-d unbekannt / keine Angabe" }
                ]
              },
              {
                label: "04-5-7",
                kpis: [
                  { field: "04_5_7_a_Anzahl_weiblich", label: "04-5-7-a Anzahl weiblich" },
                  { field: "04_5_7_b_Anzahl_maennlich", label: "04-5-7-b Anzahl männlich" },
                  { field: "04_5_7_c_Anzahl_divers", label: "04-5-7-c Anzahl divers" },
                  { field: "04_5_7_d_unbekannt", label: "04-5-7-d unbekannt / keine Angabe" }
                ]
              },
              {
                label: "04-5-8",
                kpis: [
                  { field: "04_5_8_a_Anzahl_weiblich", label: "04-5-8-a Anzahl weiblich" },
                  { field: "04_5_8_b_Anzahl_maennlich", label: "04-5-8-b Anzahl männlich" },
                  { field: "04_5_8_c_Anzahl_divers", label: "04-5-8-c Anzahl divers" },
                  { field: "04_5_8_d_unbekannt", label: "04-5-8-d unbekannt / keine Angabe" }
                ]
              },
              {
                label: "04-5-9",
                kpis: [
                  { field: "04_5_9_a_Anzahl_mitbetroffene_Kinder", label: "04-5-9-a Anzahl mitbetroffene Kinder gesamt" },
                  { field: "04_5_9_b_davon_direkt_betroffen", label: "04-5-9-b davon direkt betroffen" }
                ]
              }
            ]
          },
          gewaltart: {
            label: "Art der Gewaltanwendung (Mehrfachnennungen möglich)",
            abschnitte: [
              { label: "04-6-1 Vergewaltigung", kpis: [{ field: "04_6_1_Anzahl", label: "04-6-1 Anzahl" }] },
              { label: "04-6-2 versuchte Vergewaltigung", kpis: [{ field: "04_6_2_Anzahl", label: "04-6-2 Anzahl" }] },
              { label: "04-6-3 sexuelle Nötigung", kpis: [{ field: "04_6_3_Anzahl", label: "04-6-3 Anzahl" }] },
              { label: "04-6-4 sexuelle Belästigung", kpis: [{ field: "04_6_4_Anzahl", label: "04-6-4 Anzahl" }] },
              { label: "04-6-5 sexuelle Ausbeutung", kpis: [{ field: "04_6_5_Anzahl", label: "04-6-5 Anzahl" }] },
              { label: "04-6-6 Upskirting", kpis: [{ field: "04_6_6_Anzahl", label: "04-6-6 Anzahl" }] },
              { label: "04-6-7 Catcalling", kpis: [{ field: "04_6_7_Anzahl", label: "04-6-7 Anzahl" }] },
              { label: "04-6-8 digitale sexualisierte Gewalt", kpis: [{ field: "04_6_8_Anzahl", label: "04-6-8 Anzahl" }] },
              { label: "04-6-9 weitere Gewaltformen", kpis: [
                  { field: "04_6_9_Anzahl", label: "04-6-9 Anzahl" },
                  { field: "04_6_9_a_Welche", label: "04-6-9-a ggf. welche" }
                ]
              }
            ]
          },
          gewaltfolgen: {
            label: "Folgen der Gewalt (Mehrfachnennungen möglich)",
            abschnitte: [
              { label: "04-7-1 Körperliche Folgen", kpis: [{ field: "04_7_1_Anzahl", label: "04-7-1 Anzahl" }] },
              { label: "04-7-2 Psychische Folgen", kpis: [{ field: "04_7_2_Anzahl", label: "04-7-2 Anzahl" }] },
              { label: "04-7-3 Arbeitseinschränkung / Arbeitsunfähigkeit", kpis: [{ field: "04_7_3_Anzahl", label: "04-7-3 Anzahl" }] },
              { label: "04-7-4 Finanzielle Folgen", kpis: [{ field: "04_7_4_Anzahl", label: "04-7-4 Anzahl" }] },
              { label: "04-7-5 Verlust Arbeitsstelle", kpis: [{ field: "04_7_5_Anzahl", label: "04-7-5 Anzahl" }] },
              { label: "04-7-6 Keine Angaben", kpis: [{ field: "04_7_6_Anzahl", label: "04-7-6 Anzahl" }] },
              { label: "04-7-7 Weiteres", kpis: [
                  { field: "04_7_7_Anzahl", label: "04-7-7 Anzahl" },
                  { field: "04_7_7A_Beschreibung", label: "04-7-7A Bitte benennen" }
                ]
              }
            ]
          },
          tatnachverfolgung: {
            label: "Maßnahmen der Tatnachverfolgung",
            abschnitte: [
              {
                label: "04-8-1 Anzeige",
                kpis: [
                  { field: "04_8_1_Anzahl", label: "04-8-1 Anzahl" },
                  { field: "04_8_1A_Anzeige", label: "04-8-1A Täter*in wurde angezeigt" },
                  { field: "04_8_1B_KeineAnzeige", label: "04-8-1B Täter*in wurde nicht angezeigt" },
                  { field: "04_8_1C_KeineAngabe", label: "04-8-1C Keine Angabe über Anzeige" }
                ]
              },
              {
                label: "04-8-2 Vertrauliche Spurensicherung",
                kpis: [
                  { field: "04_8_2A_VSS_vorgenommen", label: "04-8-2A Vertrauliche Spurensicherung wurde vorgenommen" },
                  { field: "04_8_2B_VSS_nicht_vorgenommen", label: "04-8-2B Vertrauliche Spurensicherung wurde nicht vorgenommen" }
                ]
              },
              {
                label: "04-8-7 Weiteres",
                kpis: [
                  { field: "04_8_7_Anzahl", label: "04-8-7 Anzahl" },
                  { field: "04_8_7A_Beschreibung", label: "04-8-7A Bitte benennen" }
                ]
              }
            ]
          }
        }
      },

      netzwerk: {
        label: "Netzwerk",
        unterkategorien: {
          netzwerk: {
            label: "Netzwerk",
            abschnitte: [
              {
                label: "05-1 Woher haben die Klient:innen von der Interventions- und Koordinierungsstelle erfahren?",
                kpis: [
                  { field: "05_1_1_selbstmeldung_polizei", label: "05_1_1_selbstmeldung_polizei" },
                  { field: "05_1_2_private_kontakte", label: "05_1_2_private_kontakte" },
                  { field: "05_1_3_beratungsstellen", label: "05_1_3_beratungsstellen" },
                  { field: "05_1_4_internet", label: "05_1_4_internet" },
                  { field: "05_1_5_aemter", label: "05_1_5_aemter" },
                  { field: "05_1_6_gesundheitswesen", label: "05_1_6_gesundheitswesen" },
                  { field: "05_1_7_rechtsanwaeltinnen", label: "05_1_7_rechtsanwaeltinnen" },
                  { field: "05_1_8_unbekannt", label: "05_1_8_unbekannt" },
                  { field: "05_1_9_andere_quelle", label: "05_1_9_andere_quelle" },
                  { field: "05_1_9_a_welche_andere_quelle", label: "05_1_9_a_welche_andere_quelle" }
                ]
              }
            ]
          }
        }
      },

      finanzierung: {
        label: "Finanzierung",
        unterkategorien: {
          finanzierung: {
            label: "Finanzierung",
            abschnitte: [
              {
                label: "06-1 Anzahl Dolmetschungen",
                kpis: [
                  { field: "06_1_1_anzahl_stunden", label: "06_1_1_anzahl_stunden" },
                  { field: "06_1_2_keine_angabe", label: "06_1_2_keine_angabe" }
                ]
              }
            ]
          }
        }
      }
    },

    data: {
      auslastung: {
        beratungen: {
          "03_1_1_a_gesamt": 100,
          "03_1_1_b_weiblich": 60,
          "03_1_1_c_maennlich": 30,
          "03_1_1_d_divers": 10,

          "03_1_2_a_gesamt": 100,
          "03_1_2_b_weiblich": 60,
          "03_1_2_c_maennlich": 30,
          "03_1_2_d_divers": 10,

          "03_1_3_a_persoenlich": 70,
          "03_1_3_b_aufsuchend": 15,
          "03_1_3_c_telefonisch": 40,
          "03_1_3_d_online": 25,
          "03_1_3_e_schriftlich": 10
        },

        begleitungen: {
          "03_2_1_gesamt": 55,

          "03_2_2_gerichte": 10,
          "03_2_4_rechtsanwaelte": 5,
          "03_2_6_rechtsmedizin": 2,
          "03_2_3_polizei": 12,
          "03_2_5_aerzte": 6,
          "03_2_7_jugendamt": 8,

          "03_2_8_sozialamt": 4,
          "03_2_9_jobcenter": 7,
          "03_2_10_gewaltberatung": 3,
          "03_2_12_schutzeinrichtungen": 2,
          "03_2_11_frauen_kinderschutz": 3,
          "03_2_13_interventionsstellen": 2,
          "03_2_14_sonstige": 3,
          "03_2_14_a_ggf_welche": "Beispiel-Einrichtung XY"
        }
      },
      berichtsdaten: {
        wohnsitz: {
          "04_1_0_a_Anzahl_Klientinnen": 200,
          "04_1_0_b_Beratungen": 180,

          "04_1_1_a_Anzahl_Klientinnen": 30,
          "04_1_1_b_Beratungen": 25,

          "04_1_2_a_Anzahl_Klientinnen": 50,
          "04_1_2_b_Beratungen": 45,

          "04_1_3_a_Anzahl_Klientinnen": 40,
          "04_1_3_b_Beratungen": 35,

          "04_1_4_a_Anzahl_Klientinnen": 20,
          "04_1_4_b_Beratungen": 18,

          "04_1_5_a_Anzahl_Klientinnen": 15,
          "04_1_5_b_Beratungen": 14,

          "04_1_6_a_Anzahl_Klientinnen": 25,
          "04_1_6_b_Beratungen": 22,

          "04_1_7_a_Anzahl_Klientinnen": 10,
          "04_1_7_b_Beratungen": 9,

          "04_1_8_a_Anzahl_Klientinnen": 12,
          "04_1_8_b_Beratungen": 11,

          "04_1_9_a_Anzahl_Klientinnen": 8,
          "04_1_9_b_Beratungen": 7,

          "04_1_10_a_Anzahl_Klientinnen": 5,
          "04_1_10_b_Beratungen": 5,

          "04_1_11_a_Anzahl_Klientinnen": 6,
          "04_1_11_b_Beratungen": 5,

          "04_1_12_a_Anzahl_Klientinnen": 7,
          "04_1_12_b_Beratungen": 6,

          "04_1_13_a_Anzahl_Klientinnen": 9,
          "04_1_13_b_Beratungen": 8,

          "04_1_14_a_Anzahl_Klientinnen": 4,
          "04_1_14_b_Beratungen": 4,

          "04_1_15_a_Anzahl_Klientinnen": 3,
          "04_1_15_b_Beratungen": 3,

          "04_1_16_a_Anzahl_Klientinnen": 2,
          "04_1_16_b_Beratungen": 2,
          "04_1_16_c_Welche_Lander": "Frankreich, Italien",

          "04_1_17_a_Anzahl_Klientinnen": 1,
          "04_1_17_b_Beratungen": 1
        },
        staatsangehoerigkeit: {
          "04_2_1_a_Anzahl_Klientinnen": 45,
          "04_2_2_a_Beratungen": 40,
          "04_2_3_a_Welche_Lander": "Polen, Syrien, Italien, Türkei"
        },
        altersstruktur: {
          "04_3_1_a_Anzahl_Klientinnen": 10,
          "04_3_2_a_Anzahl_Klientinnen": 20,
          "04_3_3_a_Anzahl_Klientinnen": 50,
          "04_3_4_a_Anzahl_Klientinnen": 5,
          "04_3_5_a_Anzahl_Klientinnen": 2
        },
        behinderung: {
          "04_4_0_erfasst": "Ja",
          "04_4_1_a_Anzahl_Klientinnen": 12,
          "04_4_2_a_Anzahl_Klientinnen": 35,
          "04_4_3_a_Anzahl_Klientinnen": 3
        },
        taeterOpferBeziehung: {
          "04_5_1_a_Anzahl_weiblich": 30,
          "04_5_1_b_Anzahl_maennlich": 25,
          "04_5_1_c_Anzahl_divers": 5,

          "04_5_2_a_Anzahl_weiblich": 28,
          "04_5_2_b_Anzahl_maennlich": 22,
          "04_5_2_c_Anzahl_divers": 4,

          "04_5_3_a_Anzahl_weiblich": 35,
          "04_5_3_b_Anzahl_maennlich": 30,
          "04_5_3_c_Anzahl_divers": 6,

          "04_5_4_a_Anzahl_weiblich": 40,
          "04_5_4_b_Anzahl_maennlich": 38,
          "04_5_4_c_Anzahl_divers": 7,
          "04_5_4_d_unbekannt": 2,

          "04_5_5_a_Anzahl_weiblich": 20,
          "04_5_5_b_Anzahl_maennlich": 18,
          "04_5_5_c_Anzahl_divers": 3,
          "04_5_5_d_unbekannt": 1,

          "04_5_6_a_Anzahl_weiblich": 25,
          "04_5_6_b_Anzahl_maennlich": 22,
          "04_5_6_c_Anzahl_divers": 4,
          "04_5_6_d_unbekannt": 1,

          "04_5_7_a_Anzahl_weiblich": 15,
          "04_5_7_b_Anzahl_maennlich": 12,
          "04_5_7_c_Anzahl_divers": 2,
          "04_5_7_d_unbekannt": 0,

          "04_5_8_a_Anzahl_weiblich": 10,
          "04_5_8_b_Anzahl_maennlich": 8,
          "04_5_8_c_Anzahl_divers": 1,
          "04_5_8_d_unbekannt": 0,

          "04_5_9_a_Anzahl_mitbetroffene_Kinder": 50,
          "04_5_9_b_davon_direkt_betroffen": 20
        },
        gewaltart: {
          "04_6_1_Anzahl": 5,
          "04_6_2_Anzahl": 3,
          "04_6_3_Anzahl": 7,
          "04_6_4_Anzahl": 15,
          "04_6_5_Anzahl": 2,
          "04_6_6_Anzahl": 1,
          "04_6_7_Anzahl": 4,
          "04_6_8_Anzahl": 6,
          "04_6_9_Anzahl": 2,
          "04_6_9_a_Welche": "Stalking, körperliche Gewalt"
        },
        gewaltfolgen: {
          "04_7_1_Anzahl": 10,
          "04_7_2_Anzahl": 15,
          "04_7_3_Anzahl": 5,
          "04_7_4_Anzahl": 3,
          "04_7_5_Anzahl": 2,
          "04_7_6_Anzahl": 1,
          "04_7_7_Anzahl": 4,
          "04_7_7A_Beschreibung": "Angststörungen, Schlafprobleme"
        },
        tatnachverfolgung: {
          "04_8_1_Anzahl": 20,
          "04_8_1A_Anzeige": 12,
          "04_8_1B_KeineAnzeige": 5,
          "04_8_1C_KeineAngabe": 3,

          "04_8_2A_VSS_vorgenommen": 8,
          "04_8_2B_VSS_nicht_vorgenommen": 12,

          "04_8_7_Anzahl": 4,
          "04_8_7A_Beschreibung": "Weitere rechtliche Maßnahmen, Meldungen an Institutionen"
        }
      },
      netzwerk: {
        "05_1_1_selbstmeldung_polizei": 50,
        "05_1_2_private_kontakte": 30,
        "05_1_3_beratungsstellen": 20,
        "05_1_4_internet": 15,
        "05_1_5_aemter": 20,
        "05_1_6_gesundheitswesen": 5,
        "05_1_7_rechtsanwaeltinnen": 8,
        "05_1_8_unbekannt": 14,
        "05_1_9_andere_quelle": 3,
        "05_1_9_a_welche_andere_quelle": "Bildungseinrichtungen"
      },
      finanzierung: {
        "06_1_1_anzahl_stunden": 40,
        "06_1_2_keine_angabe": 5
      }
    }
  }
  return NextResponse.json(fakeResult);
}




