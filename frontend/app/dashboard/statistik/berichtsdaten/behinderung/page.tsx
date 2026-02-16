
"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import { formatQuestionLabel } from "@/lib/statistik/labels";

export default function BehinderungPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  const structure = data.structure.berichtsdaten.unterkategorien.behinderung;
  const values = data.data.berichtsdaten.behinderung;

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
            Übersicht Behinderungen
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





/*
"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import { formatQuestionLabel } from "@/lib/statistik/labels";

export default function BehinderungPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  // Struktur aus dem Backend
  const structure = data.structure.berichtsdaten.unterkategorien.behinderung;
  

  // Werte aus dem Backend
  const values = data.data.berichtsdaten.behinderung;

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
              {formatQuestionLabel(abschnitt.label)}
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
          </div>
        );
      })}
    </div>
  );
}*/