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
        }
      }
    },

    data: {
      auslastung: {
        beratungen: {
          beratene_gesamt: 500,
          beratungen_gesamt: 800,
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
}


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

