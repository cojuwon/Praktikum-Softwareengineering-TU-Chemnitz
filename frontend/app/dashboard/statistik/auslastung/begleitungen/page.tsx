"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { DynamicTable } from "@/components/dashboard/statistik/DynamicTable";
import { DynamicChart } from "@/components/dashboard/statistik/DynamicChart";
import ExportButtons from "@/components/dashboard/statistik/ExportButtons";
import { formatQuestionLabel } from "@/lib/statistik/labels";

export default function BegleitungenPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  const structure = data.structure.auslastung.unterkategorien.begleitungen;
  const values = data.data.auslastung.begleitungen;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{structure.label}</h1>

      {structure.abschnitte.map((abschnitt: any) => {
        const hasMultipleKPIs = abschnitt.kpis.length > 1;

        const chartData = abschnitt.kpis.map((kpi: any) => ({
          name: formatQuestionLabel(kpi.label),
          value: values[kpi.field] ?? 0,
        }));

        return (
          <div key={abschnitt.label} className="mb-10">
            <h2 className="text-lg font-semibold mb-3">
              {formatQuestionLabel(abschnitt.label)}
            </h2>

            {/* ✅ KPI immer anzeigen */}
            <DynamicKPIs kpis={abschnitt.kpis} data={values} />

            {/* ❗ Tabelle & Chart nur bei Vergleichsdaten */}
            {hasMultipleKPIs && (
              <>
                <br />

                <DynamicTable
                  columns={abschnitt.kpis}
                  rows={[values]}
                />

                <br />

                <DynamicChart
                  config={{ type: "bar", xField: "name", yField: "value" }}
                  data={chartData}
                />

                <br />

                <ExportButtons />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
