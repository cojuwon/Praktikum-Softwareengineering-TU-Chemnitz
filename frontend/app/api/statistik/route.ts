/*export async function POST(req: Request) {
  const filters = await req.json();
  console.log("Fake Filter:", filters);

  // -------------------------------
  // FAKE-DATEN ZU ANFRAGEN
  // -------------------------------

  const fakeAnfragen = [
    {
      typ: "anfrage",
      wie: "Telefon",
      datum_anfrage: "2025-01-12",
      anfrage_aus: "Leipzig Stadt",
      wer_hat_angefragt: "Betroffene:r",
      art_der_anfrage: "Beratungsbedarf",
      termin_vergeben: "ja",
      termin_datum: "2025-01-20",
      termin_ort: "Leipzig Stadt"
    },
    {
      typ: "anfrage",
      wie: "E-Mail",
      datum_anfrage: "2025-01-15",
      anfrage_aus: "Nordsachsen",
      wer_hat_angefragt: "Fachkraft",
      art_der_anfrage: "Vertrauliche Spurensicherung",
      termin_vergeben: "nein"
    },
    {
      typ: "anfrage",
      wie: "Telefon",
      datum_anfrage: "2025-01-18",
      anfrage_aus: "Sachsen",
      wer_hat_angefragt: "Angehörige:r",
      art_der_anfrage: "medizinische Soforthilfe",
      termin_vergeben: "ja",
      termin_datum: "2025-01-19",
      termin_ort: "Nordsachsen"
    }
  ];

  // -------------------------------
  // FAKE-DATEN ZU FÄLLEN
  // -------------------------------
  const fakeFaelle = [
    {
      typ: "fall",
      alias: "FALL-001",
      rolle: "Betroffene:r",
      alter: 27,
      geschlechtsidentitaet: "cis weiblich",
      sexualitaet: "heterosexuell",
      wohnort: "Leipzig Stadt",
      staatsangehoerigkeit: "deutsch",
      berufliche_situation: "berufstätig",
      schwerbehinderung: {
        liegt_vor: "nein"
      },

      beratungsstelle: "Fachberatungsstelle Stadt Leipzig",
      anzahl_beratungen: 2,
      beratungstermine: [
        {
          datum: "2025-01-21",
          art: "persönlich",
          ort: "Leipzig Stadt"
        },
        {
          datum: "2025-02-02",
          art: "video",
          ort: "Leipzig Stadt"
        }
      ],

      gewalt: [
        {
          alter_bei_tat: 25,
          zeitraum: "2023",
          anzahl_vorfaelle: "mehrere",
          anzahl_taeter: 1,
          taeter: [
            {
              geschlecht: "männlich",
              verhaeltnis: "Partner:in ehemalig",
              art_der_gewalt: [
                "sexuelle Belästigung im Privaten",
                "digitale sexuelle Gewalt"
              ],
              tatort: "Leipzig",
              anzeige: "nein",
              medizinische_versorgung: "nein",
              vss: "nein",
              mitbetroffene_kinder: 0
            }
          ]
        }
      ],

      folgen: {
        psychisch: ["Depression", "Schlafstörungen"],
        koerperlich: ["Schmerzen"],
        finanziell: false,
        arbeitseinschraenkung: false,
        soziale_isolation: false,
        suizidalitaet: false
      },

      begleitungen: {
        anzahl_begleitungen: 1,
        gerichte: 0,
        polizei: 1,
        aerzte: 0,
        sonstiges: 0
      },

      verweise: {
        anzahl_verweise: 2,
        aerzte: 1,
        rechtsmedizin: 1
      },

      wie_erfahren: "Internet",
      dolmetschungen_stunden: 0
    },

    // ---------------------------
    // FALL 2
    // ---------------------------
    {
      typ: "fall",
      alias: "FALL-002",
      rolle: "Angehörige:r",
      alter: "keine Angabe",
      geschlechtsidentitaet: "keine Angabe",
      sexualitaet: "keine Angabe",
      wohnort: "Deutschland",
      wohnort_detail: "Bayern",
      staatsangehoerigkeit: "nicht deutsch",
      staatsangehoerigkeit_detail: "Spanien",
      berufliche_situation: "studierend",
      schwerbehinderung: { liegt_vor: "ja", form: "körperlich", grad: 40 },

      beratungsstelle: "Fachberatung Landkreis Nordsachsen",
      anzahl_beratungen: 1,
      beratungstermine: [
        {
          datum: "2025-01-28",
          art: "persönlich",
          ort: "Nordsachsen"
        }
      ],

      gewalt: [
        {
          alter_bei_tat: 17,
          zeitraum: "Mehrere Monate",
          anzahl_vorfaelle: "mehrere",
          anzahl_taeter: 2,
          taeter: [
            {
              geschlecht: "männlich",
              verhaeltnis: "Bekannte:r",
              art_der_gewalt: ["sexueller Missbrauch in der Kindheit"],
              tatort: "Sachsen",
              anzeige: "ja",
              medizinische_versorgung: "ja",
              vss: "ja",
              mitbetroffene_kinder: 0
            }
          ]
        }
      ],

      folgen: {
        psychisch: ["PTBS"],
        koerperlich: [],
        soziale_isolation: true
      },

      begleitungen: {
        anzahl_begleitungen: 0
      },

      verweise: {
        anzahl_verweise: 1,
        psychotherapie: 1
      },

      wie_erfahren: "Ärzte"
    },

    // ---------------------------
    // FALL 3
    // ---------------------------
    {
      typ: "fall",
      alias: "FALL-003",
      rolle: "Fachkraft",
      alter: 45,
      geschlechtsidentitaet: "cis männlich",
      sexualitaet: "bisexuell",
      wohnort: "andere",
      wohnort_detail: "Österreich",
      staatsangehoerigkeit: "deutsch",
      berufliche_situation: "berufstätig",
      schwerbehinderung: { liegt_vor: "nein" },

      beratungsstelle: "Fachberatung Landkreis Leipzig",
      anzahl_beratungen: 3,
      beratungstermine: [
        {
          datum: "2025-02-01",
          art: "telefon",
          ort: "Leipzig Land"
        },
        {
          datum: "2025-02-05",
          art: "persönlich",
          ort: "Leipzig Land"
        },
        {
          datum: "2025-02-10",
          art: "video",
          ort: "Leipzig Land"
        }
      ],

      gewalt: [], // Keine Angaben
      folgen: {},
      begleitungen: {},
      verweise: {},

      wie_erfahren: "Private Kontakte"
    }
  ];

  return new Response(
    JSON.stringify({
      anfragen: fakeAnfragen,
      faelle: fakeFaelle
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }
  );
}
*/



export async function POST(req: Request) {
  const filters = await req.json();
  console.log("Fake Filter:", filters);

  // Fake-Daten zurückgeben
  const fakeData = [
    { wohnort: "Leipzig", nationalitaet: "deutsch", anzahl_beratungen: 3 },
    { wohnort: "Nordsachsen", nationalitaet: "polnisch", anzahl_beratungen: 1 }
  ];

  return new Response(JSON.stringify(fakeData), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
