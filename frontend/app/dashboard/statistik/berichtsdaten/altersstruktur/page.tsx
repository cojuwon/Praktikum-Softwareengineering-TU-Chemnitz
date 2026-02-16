"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import { formatQuestionLabel } from "@/lib/statistik/labels";

export default function AltersstrukturPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  const structure = data.structure.berichtsdaten.unterkategorien.altersstruktur;
  const values = data.data.berichtsdaten.altersstruktur;

  // 🔹 Spalten = Altersklassen (Abschnitte)
  const tableColumns = structure.abschnitte.map((abschnitt: any) => ({
    field: abschnitt.kpis[0].field,
    label: formatQuestionLabel(abschnitt.label),
  }));

  // 🔹 Balken = Altersklassen
  const chartData = structure.abschnitte.map((abschnitt: any) => ({
    name: formatQuestionLabel(abschnitt.label),
    value: values[abschnitt.kpis[0].field] ?? 0,
  }));

  const showComparison = structure.abschnitte.length > 1;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{structure.label}</h1>

      {/* 🔝 Einzelwerte pro Altersklasse */}
      {structure.abschnitte.map((abschnitt: any) => (
        <div key={abschnitt.label} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            {formatQuestionLabel(abschnitt.label)}
          </h2>

          <DynamicKPIs kpis={abschnitt.kpis} data={values} />
        </div>
      ))}

      {/* 🔻 Vergleich nur wenn sinnvoll */}
      {showComparison && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold mb-3">
            Übersicht Altersklassen
          </h2>

          <DynamicTable columns={tableColumns} rows={[values]} />

          <br />

          <DynamicChart
            config={{
              type: "bar",
              xField: "name",
              yField: "value",
              //yLabel: "Anzahl",
            }}
            data={chartData}
          />
        </div>
      )}
    </div>
  );
}
