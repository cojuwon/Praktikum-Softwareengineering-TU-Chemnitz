import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    presets: [
      {
        id: 1,
        name: "Stadt Leipzig",
        preset_type: "system",
        filters: {
            anfrage_ort: "Leipzig Stadt",
            termin_ort: "Leipzig Stadt",
            beratungsstelle: "Fachberatungsstelle für queere Betroffene von sexualisierter Gewalt in der Stadt Leipzig",
            beratungsort: "Leipzig Stadt",
        }
      },
      {
        id: 2,
        name: "Q1 Beratung Jugendliche",
        preset_type: "user",
        filters: {
            zeitraum_start: "2024-01-01",
            zeitraum_ende: "2024-03-31",
          anfrage_person: "queer Betroffene:r (qB)"
        }
      },
      {
        id: 3,
        name: "Team-Report 2024 Stadt Leipzig",
        preset_type: "shared",
        filters: {
            zeitraum_start: "2024-01-01",
            zeitraum_ende: "2024-12-31",
            beratungsstelle: "Fachberatungsstelle für queere Betroffene von sexualisierter Gewalt in der Stadt Leipzig",
        }
      }
    ]
  });
}
