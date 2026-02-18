import { NextResponse } from "next/server";
import {
  AnfrageOrt,
  AnfragePerson,
  AnfrageArt,
  TerminOrt,
  Beratungsstelle,
  Beratungsart,
  Beratungsort,
  Tatort,
  Tatart,
  PsychischeFolgen,
  KörperlicheFolgen,
  FinanzielleFolgen,
  Arbeitseinschränkung,
  VerlustArbeitsstelle,
  SozialeIsolation,
  Suizidalität,
  KeineAngabe,
} from "@/lib/definitions"; // Pfad bei dir anpassen!

// 🧠 Hilfsfunktion: Enum → Array<string>
function enumToOptions(e: any) {
  return Object.values(e);
}

export async function GET() {
  const filters = [
    // ───────────────────────────────────────────────
    // 🟦 BASIS-FILTER
    // ───────────────────────────────────────────────
    {
      name: "zeitraum_start",
      label: "Von",
      type: "date",
    },
    {
      name: "zeitraum_ende",
      label: "Bis",
      type: "date",
    },

    // ───────────────────────────────────────────────
    // 🟩 ANFRAGE-FILTER
    // ───────────────────────────────────────────────
    {
      name: "anfrage_ort",
      label: "Anfrage-Ort",
      type: "select",
      options: enumToOptions(AnfrageOrt),
    },
    {
      name: "anfrage_person",
      label: "Anfragende Person",
      type: "select",
      options: enumToOptions(AnfragePerson),
    },
    {
      name: "anfrage_art",
      label: "Art der Anfrage",
      type: "select",
      options: enumToOptions(AnfrageArt),
    },
    {
      name: "termin_ort",
      label: "Termin-Ort",
      type: "select",
      options: enumToOptions(TerminOrt),
    },

    // ───────────────────────────────────────────────
    // 🟥 BERATUNG-FILTER
    // ───────────────────────────────────────────────
    {
      name: "beratungsstelle",
      label: "Beratungsstelle",
      type: "select",
      options: enumToOptions(Beratungsstelle),
    },
    {
      name: "beratungsart",
      label: "Beratungsart",
      type: "select",
      options: enumToOptions(Beratungsart),
    },
    {
      name: "beratungsort",
      label: "Beratungsort",
      type: "select",
      options: enumToOptions(Beratungsort),
    },

    // ───────────────────────────────────────────────
    // 🟧 TAT-FILTER
    // ───────────────────────────────────────────────
    {
      name: "tatort",
      label: "Tatort",
      type: "select",
      options: enumToOptions(Tatort),
    },
    {
      name: "tatart",
      label: "Tatart",
      type: "multiselect", // Mehrere wählbar
      options: enumToOptions(Tatart),
    },

    // ───────────────────────────────────────────────
    // 🟪 FOLGEN-FILTER
    // ───────────────────────────────────────────────
    {
      name: "psychische_folgen",
      label: "Psychische Folgen",
      type: "select",
      options: enumToOptions(PsychischeFolgen),
    },
    {
      name: "körperliche_folgen",
      label: "Körperliche Folgen",
      type: "select",
      options: enumToOptions(KörperlicheFolgen),
    },
    {
      name: "finanzielle_folgen",
      label: "Finanzielle Folgen",
      type: "select",
      options: enumToOptions(FinanzielleFolgen),
    },
    {
      name: "arbeitseinschränkung",
      label: "Arbeitseinschränkung",
      type: "select",
      options: enumToOptions(Arbeitseinschränkung),
    },
    {
      name: "verlust_arbeitsstelle",
      label: "Verlust der Arbeitsstelle",
      type: "select",
      options: enumToOptions(VerlustArbeitsstelle),
    },
    {
      name: "soziale_isolation",
      label: "Soziale Isolation",
      type: "select",
      options: enumToOptions(SozialeIsolation),
    },
    {
      name: "suizidalität",
      label: "Suizidalität",
      type: "select",
      options: enumToOptions(Suizidalität),
    },
    {
      name: "keine_angabe",
      label: "Keine Angabe",
      type: "select",
      options: enumToOptions(KeineAngabe),
    },
  ];

  return NextResponse.json({
    filters,
    debug: "Fake API liefert Filter basierend auf Enums",
  });
}
