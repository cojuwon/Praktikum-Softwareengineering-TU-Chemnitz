"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import { formatQuestionLabel } from "@/lib/statistik/labels";
import { buildSectionComparison } from "@/lib/statistik/buildSectionComparison";

export default function GewaltfolgenPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  // Struktur aus dem Backend
  const structure =
    data.structure.berichtsdaten.unterkategorien.gewaltfolgen;

  // Werte aus dem Backend
  const values = data.data.berichtsdaten.gewaltfolgen;

  // ✅ Gemeinsame Vergleichsdaten erzeugen
  const { tableColumns, chartData } = buildSectionComparison(
    structure,
    values
  );

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{structure.label}</h1>

      {/* Einzelne Abschnitte: nur KPIs */}
      {structure.abschnitte.map((abschnitt: any) => (
        <div key={abschnitt.label} className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            {formatQuestionLabel(abschnitt.label)}
          </h2>

          <DynamicKPIs kpis={abschnitt.kpis} data={values} />
        </div>
      ))}

      {/* 🔹 Gemeinsame Übersicht am Ende */}
      {tableColumns.length > 0 && (
        <div className="mt-12 pt-6 border-t">
          <h2 className="text-lg font-semibold mb-6">
            Übersicht Folgen der Gewalttat
          </h2>

          <DynamicTable columns={tableColumns} rows={[values]} />

          <br />

          <DynamicChart
            config={{ type: "bar", xField: "name", yField: "value" }}
            data={chartData}
          />
        </div>
      )}
    </div>
  );
}

