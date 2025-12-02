import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Erhaltene Filter:", body);

  const fakeResult = {
    structure: {
      auslastung: {
        label: "Auslastung",
        unterkategorien: {

          // -------------------------
          // 03-1 Beratungen gesamt
          // -------------------------
          beratungen: {
            label: "Beratungen",
            abschnitte: [

              // -------------------------
              // 03-1-1 Geschlecht
              // -------------------------
              {
                label: "03-1-1 Geschlecht der beratenen Personen",
                kpis: [
                  { field: "03_1_1_a_gesamt", label: "03-1-1-a gesamt" },
                  { field: "03_1_1_b_weiblich", label: "03-1-1-b weiblich" },
                  { field: "03_1_1_c_maennlich", label: "03-1-1-c männlich" },
                  { field: "03_1_1_d_divers", label: "03-1-1-d divers" }
                ]
              },

              // -------------------------
              // 03-1-2 Alter
              // -------------------------
              {
                label: "03-1-2 Alter",
                kpis: [
                  { field: "03_1_2_a_gesamt", label: "03-1-2-a gesamt" },
                  { field: "03_1_2_b_weiblich", label: "03-1-2-b weiblich" },
                  { field: "03_1_2_c_maennlich", label: "03-1-2-c männlich" },
                  { field: "03_1_2_d_divers", label: "03-1-2-d divers" }
                ]
              },

              // -------------------------
              // 03-1-3 Beratungsform
              // -------------------------
              {
                label: "03-1-3 Beratungsform",
                kpis: [
                  { field: "03_1_3_a_persoenlich", label: "03-1-3-a persönlich" },
                  { field: "03_1_3_b_aufsuchend", label: "03-1-3-b davon aufsuchend" },
                  { field: "03_1_3_c_telefonisch", label: "03-1-3-c telefonisch" },
                  { field: "03_1_3_d_online", label: "03-1-2-4 online" },
                  { field: "03_1_3_e_schriftlich", label: "03-1-2-3 schriftlich (auch E-Mail)" }
                ]
              }
            ]
          },

          // -------------------------
          // 03-2 Weiterverweisungen
          // -------------------------
          weiterverweisungen: {
            label: "Weiterverweisungen",
            abschnitte: [

              {
                label: "03-2-1 gesamt",
                kpis: [
                  { field: "03_2_1_gesamt", label: "03-2-1 gesamt" }
                ]
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
      }
    },

    // ------------------------------------------------
    // DATEN (Testwerte)
    // ------------------------------------------------
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

        weiterverweisungen: {
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
      }
    }
  };

  return NextResponse.json(fakeResult);
}





/*
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Erhaltene Filter:", body);

  // Vollständig gültiges Fake-Datenmodell
  const fakeResult = {
    structure: {
      auslastung: {
        label: "Auslastung",
        unterkategorien: {
          beratungen: {
            label: "Beratungen",
            kpis: [
              { field: "beratene_gesamt", label: "Beratene insgesamt" },
              { field: "beratungen_gesamt", label: "Beratungen insgesamt" }
            ],
            charts: [
              { type: "bar", field: "beratung_nach_geschlecht" }
            ]
          }
          
          begleitungen: {
            label: "Begleitungen",
            kpis: [
              { field: "beratene_gesamt", label: "Beratene insgesamt" },
              { field: "beratungen_gesamt", label: "Beratungen insgesamt" }
            ],
            charts: [
              { type: "bar", field: "beratung_nach_geschlecht" }
            ]
          }

        }
      }
    },

    data: {
      auslastung: {
        beratungen: {
          beratene_gesamt: 500,
          beratene_nach_geschlecht: {
            weiblich: 300,
            männlich: 100,
            divers: 100
          }

          beratung_gesamt: 800,
          beratung_nach_geschlecht: {
            weiblich: 300,
            männlich: 200,
            divers: 50
          }
        }
        begleitungen: {
          begleitungen_gesamt: 500,
          bebegleitungen_gesamt: 800,
          beratung_nach_geschlecht: {
            weiblich: 300,
            männlich: 200,
            divers: 50
          }
        }
      }
    }
  };

  return NextResponse.json(fakeResult);
}*/


/* auslastung: {
      beratungen: {
        total: 42,
        anfragen: 30,
        fall: 12,

        berateneKlientinnen: {
          gesamt: 500,
          weiblich: 200,
          männlich: 200,
          divers: 100,
        },

        beratungen: {
          gesamt: 800,
          weiblich: 500,
          männlich: 100,
          divers: 200,
        },

        nachArt: {
          persönlich: 400,
          aufsuchend: 200,
          telefonisch: 100,
          schriftlich: 50,
          online: 50,
        },

        message: "Fake Statistik erfolgreich geladen."
      },

      begleitungen: {
        // optional: später Daten einfügen
      }
    },

    berichtsdaten: {
      // später
    },

    finanzen: {
      // später
    },

    netzwerk: {
      // später
    }*/

