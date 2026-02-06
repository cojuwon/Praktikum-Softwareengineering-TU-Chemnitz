
/*
import { NextResponse } from "next/server";

// ----------------------------------
// Fake Felddefinitionen (global)
let fieldDefinitions = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "datum", label: "Datum", type: "date", required: true },
  { name: "beschreibung", label: "Beschreibung", type: "text" },
  { name: "status", label: "Status", type: "select", options: ["offen", "in_bearbeitung", "abgeschlossen"] },
];

// ----------------------------------
// Fake Anfrage
let fakeAnfrage: Record<string, any> = {
  "1": {
    values: {
      name: "Müller",
      datum: "2024-02-01",
      beschreibung: "Beratung zu Wohnungsfragen",
      status: "offen",
    },
    beratungstermine: [
      { datum: "2024-02-01", form: "Telefonisch" }
    ],
  },
  "2": {
    values: {
      name: "Schmidt",
      datum: "2024-03-05",
      beschreibung: "Formularhilfe",
      status: "in_bearbeitung",
    },
    beratungstermine: [],
  },
};

// ----------------------------------
// GET → Anfrage + Felddefinitionen laden
export async function GET(_req: Request, context: { params: any }) {
  const { id } = await context.params; // ✅ unwrap params
  const anfrage = fakeAnfrage[id];

  if (!anfrage) {
    return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json({
    fields: fieldDefinitions,
    values: anfrage.values,
    beratungstermine: anfrage.beratungstermine,
  });
}

// ----------------------------------
// PUT → Anfrage speichern
export async function PUT(req: Request, context: { params: any }) {
  const { id } = await context.params; // ✅ unwrap params
  const updatedValues = await req.json();

  if (!fakeAnfrage[id]) {
    return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
  }

  fakeAnfrage[id] = {
    ...fakeAnfrage[id],
    values: {
      ...fakeAnfrage[id].values,
      ...updatedValues.values,
    },
    beratungstermine: updatedValues.beratungstermine ?? fakeAnfrage[id].beratungstermine,
  };

  console.log("Anfrage gespeichert:", id, fakeAnfrage[id]);

  return NextResponse.json({
    success: true,
    values: fakeAnfrage[id].values,
    beratungstermine: fakeAnfrage[id].beratungstermine,
  });
}
*/