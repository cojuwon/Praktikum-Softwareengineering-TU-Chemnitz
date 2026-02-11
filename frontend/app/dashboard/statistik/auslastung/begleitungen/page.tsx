"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import ExportButtons from "@/components/dashboard/statistik/ExportButtons";

export default function BegleitungenPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  // Struktur aus dem Backend
  const structure = data.structure.auslastung.unterkategorien.begleitungen;

  // Werte aus dem Backend
  const values = data.data.auslastung.begleitungen;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{structure.label}</h1>


      {structure.abschnitte.map((abschnitt: any) => {
        // 👉 Chart-Daten aus den KPIs dieses Abschnitts erzeugen
        const chartData = abschnitt.kpis.map((kpi: any) => ({
          name: kpi.label,
          value: values[kpi.field] ?? 0,
        }));

        return (
          <div key={abschnitt.label} className="mb-10">
            <h2 className="text-lg font-semibold mb-3">
              {abschnitt.label}
            </h2>

         
            <DynamicKPIs kpis={abschnitt.kpis} data={values} />

            <br />

          
            <DynamicTable columns={abschnitt.kpis} rows={[values]} />

            <br />

        
            <DynamicChart
              config={{ type: "bar", xField: "name", yField: "value" }}
              data={chartData}        // 👉 korrektes Datenformat
            />

            <br />

            {data && <ExportButtons />}
          </div>
        );
      })}
    </div>
  );
}
