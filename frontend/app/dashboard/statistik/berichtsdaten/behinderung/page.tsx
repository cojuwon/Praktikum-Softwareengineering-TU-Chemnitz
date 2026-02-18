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

  /**
   * 🔹 Abschnitt "Datenerfassung" finden
   */
  const datenerfassungAbschnitt = structure.abschnitte.find(
    (abschnitt: any) =>
      abschnitt.label.toLowerCase().includes("datenerfassung")
  );

  const datenerfassungKpi = datenerfassungAbschnitt?.kpis?.[0];
  const datenerfassungValue = datenerfassungKpi
    ? values[datenerfassungKpi.field]
    : null;

  const hasData =
    datenerfassungValue === true ||
    datenerfassungValue === "Ja" ||
    datenerfassungValue === "ja";

  /**
   * ❌ Keine Daten vorhanden
   */
  if (!hasData) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-6">{structure.label}</h1>
        <p className="text-gray-600">
          Es wurden keine Daten zu Behinderungen erfasst.
        </p>
      </div>
    );
  }

  /**
   * ✅ Relevante Abschnitte (ohne Datenerfassung)
   */
  const dataAbschnitte = structure.abschnitte.filter(
    (abschnitt: any) => abschnitt !== datenerfassungAbschnitt
  );

  /**
   * 🔹 Tabelle & Chart: ein Wert pro Abschnitt
   */
  const tableColumns = dataAbschnitte.map((abschnitt: any) => ({
    field: abschnitt.kpis[0].field,
    label: formatQuestionLabel(abschnitt.label),
  }));

  const chartData = dataAbschnitte.map((abschnitt: any) => ({
    name: formatQuestionLabel(abschnitt.label),
    value: values[abschnitt.kpis[0].field] ?? 0,
  }));

  const showComparison = dataAbschnitte.length > 1;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{structure.label}</h1>

      {/* 🔝 Einzelwerte */}
      {dataAbschnitte.map((abschnitt: any) => (
        <div key={abschnitt.label} className="mb-8">
          <h2 className="text-lg font-semibold mb-3">
            {formatQuestionLabel(abschnitt.label)}
          </h2>

          <DynamicKPIs kpis={abschnitt.kpis} data={values} />
        </div>
      ))}

      {/* 🔻 Vergleich */}
      {showComparison && (
        <div className="mt-10 pt-6 border-t">
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
            }}
            data={chartData}
          />
        </div>
      )}
    </div>
  );
}
