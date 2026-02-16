
"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import { formatQuestionLabel } from "@/lib/statistik/labels";

export default function WohnsitzPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  // Struktur aus dem Backend
  const structure = data.structure.berichtsdaten.unterkategorien.wohnsitz;
  
  // Werte aus dem Backend
  const values = data.data.berichtsdaten.wohnsitz;

  // Chart-Daten für alle Wohnorte - basierend auf Abschnitten
  const chartData = structure.abschnitte.map((abschnitt: any) => {
    // Summiere alle KPI-Werte dieses Abschnitts oder nimm den ersten
    const value = abschnitt.kpis[0]?.field 
      ? values[abschnitt.kpis[0].field] ?? 0 
      : 0;
    return {
      name: formatQuestionLabel(abschnitt.label),
      value: value,
    };
  });

  // Tabellen-Struktur: Eine Spalte pro Abschnitt
  const tableColumns = structure.abschnitte.map((abschnitt: any) => ({
    field: abschnitt.kpis[0]?.field,
    label: formatQuestionLabel(abschnitt.label),
  }));

  const tableRows = [values];

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{structure.label}</h1>

      {structure.abschnitte.map((abschnitt: any) => {
        return (
          <div key={abschnitt.label} className="mb-10">
            <h2 className="text-lg font-semibold mb-3">
              {formatQuestionLabel(abschnitt.label)}
            </h2>

            <DynamicKPIs kpis={abschnitt.kpis} data={values} />
          </div>
        );
      })}

      {/* Gesammelte Übersicht am Ende */}
      <div className="mt-12 pt-6 border-t">
        <h2 className="text-lg font-semibold mb-6">Übersicht Wohnorte der Klient:innen</h2>
        
        <DynamicTable columns={tableColumns} rows={tableRows} />

        <br />

        <DynamicChart
          config={{ type: "bar", xField: "name", yField: "value" }}
          data={chartData}
        />
      </div>
    </div>
  );
}