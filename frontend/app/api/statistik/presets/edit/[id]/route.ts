import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, preset_type, filters } = body;
    
    const cookies = req.headers.get("cookie");
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Map frontend format to backend Preset model fields
    const backendPayload = {
      preset_beschreibung: name,
      filterKriterien: filters || {},
      preset_daten: {}
    };

    const response = await fetch(`${backendUrl}/api/presets/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookies || "",
      },
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to update preset:', response.status, errorData);
      return NextResponse.json({ error: "Failed to update preset", details: errorData }, { status: response.status });
    }

    const updatedPreset = await response.json();
    
    // Map backend response back to frontend format
    return NextResponse.json({
      id: updatedPreset.preset_id,
      name: updatedPreset.preset_beschreibung,
      preset_type: preset_type,
      filters: updatedPreset.filterKriterien
    });
  } catch (error) {
    console.error('Preset update proxy error:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


/*import { NextResponse } from "next/server";

let fakePresets = [
  {
    id: 1,
    name: "Stadt Leipzig",
    preset_type: "system",
    filters: {
      anfrage_ort: "Leipzig Stadt",
      termin_ort: "Leipzig Stadt",
      beratungsstelle:
        "Fachberatungsstelle für queere Betroffene von sexualisierter Gewalt in der Stadt Leipzig",
      beratungsort: "Leipzig Stadt",
    },
  },
  {
    id: 2,
    name: "Q1 Beratung Jugendliche",
    preset_type: "user",
    filters: {
      zeitraum_start: "2024-01-01",
      zeitraum_ende: "2024-03-31",
      anfrage_person: "queer Betroffene:r (qB)",
    },
  },
  {
    id: 3,
    name: "Team-Report 2024 Stadt Leipzig",
    preset_type: "shared",
    filters: {
      zeitraum_start: "2024-01-01",
      zeitraum_ende: "2024-12-31",
      beratungsstelle:
        "Fachberatungsstelle für queere Betroffene von sexualisierter Gewalt in der Stadt Leipzig",
    },
  },
];

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  console.log("Params:", params); // sollte { id: "3" } sein

  const presetId = Number(params.id);
  const body = await req.json();
  const { name, preset_type, filters } = body;

  const presetIndex = fakePresets.findIndex((p) => p.id === presetId);
  if (presetIndex === -1) {
    return NextResponse.json(
      { error: "Preset nicht gefunden" },
      { status: 404 }
    );
  }

  fakePresets[presetIndex] = {
    id: presetId,
    name,
    preset_type,
    filters,
  };

  console.log("Preset aktualisiert:", fakePresets[presetIndex]);

  return NextResponse.json(fakePresets[presetIndex]);
}*/
/*
import { NextResponse } from "next/server";

export async function GET(req: Request, ctx: { params: { id: string } }) {
  return NextResponse.json({
    route: "edit/[id] funktioniert",
    receivedId: ctx.params.id
  });
}*/


/*
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  console.log("ID aus der URL:", id);

  return NextResponse.json({
    message: "PUT Route funktioniert!",
    receivedId: id
  });
}*/


/*import { NextResponse } from "next/server";

let fakePresets = [
  { id: 1, name: "Stadt Leipzig", preset_type: "system", filters: { anfrage_ort: "Leipzig Stadt" } },
  { id: 2, name: "Q1 Beratung Jugendliche", preset_type: "user", filters: { zeitraum_start: "2024-01-01" } },
  { id: 3, name: "Team-Report 2024 Stadt Leipzig", preset_type: "shared", filters: { zeitraum_start: "2024-01-01" } }
];

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const presetId = Number(params.id); // ID aus URL
    const body = await req.json();
    const { name, preset_type, filters } = body;

    const index = fakePresets.findIndex(p => p.id === presetId);
    if (index === -1) {
      return NextResponse.json({ error: "Preset nicht gefunden" }, { status: 404 });
    }

    fakePresets[index] = { id: presetId, name, preset_type, filters };
    console.log("Preset aktualisiert:", fakePresets[index]);

    return NextResponse.json(fakePresets[index]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Fehler beim Bearbeiten des Presets" }, { status: 500 });
  }
}
*/