"use client";

import { useStatistik } from "../StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import { formatQuestionLabel } from "@/lib/statistik/labels";

export default function NetzwerkPage() {
  const { data } = useStatistik();

  if (!data) return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;


  // Struktur aus dem Backend
  const structure = data.structure.netzwerk.unterkategorien.netzwerk;

  // Werte aus dem Backend
  const values = data.data.netzwerk;

  // Sammle nur KPIs mit numerischen Werten
  const numericKpis: any[] = [];
  structure.abschnitte.forEach((abschnitt: any) => {
    abschnitt.kpis.forEach((kpi: any) => {
      const value = values[kpi.field];
      // Nur numerische Werte hinzufügen
      if (typeof value === 'number') {
        numericKpis.push(kpi);
      }
    });
  });

  // Chart-Daten für numerische KPIs
  const chartData = numericKpis.map((kpi: any) => ({
    name: formatQuestionLabel(kpi.label),
    value: values[kpi.field] ?? 0,
  }));

  return (

    <div className="p-6">

      <h1 className="text-xl font-bold mb-6"> {structure.label} </h1>

      {/* ABSCHNITTE RENDERN */}
      {structure.abschnitte.map((abschnitt: any) => (
        <div key={abschnitt.label} className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            {formatQuestionLabel(abschnitt.label)}
          </h2>

          <DynamicKPIs kpis={abschnitt.kpis} data={values} />
        </div>
      ))}

      {/* Gesammelte Übersicht am Ende (nur numerische KPIs) */}
      {numericKpis.length > 0 && (
        <div className="mt-12 pt-6 border-t">
          <h2 className="text-lg font-semibold mb-6">Übersicht Netzwerk</h2>

          <DynamicTable columns={numericKpis} rows={[values]} />

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


