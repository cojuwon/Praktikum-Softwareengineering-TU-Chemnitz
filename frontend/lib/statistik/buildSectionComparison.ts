import { formatQuestionLabel } from "@/lib/statistik/labels";

export function buildSectionComparison(structure: any, values: any) {
  const tableColumns: any[] = [];
  const chartData: any[] = [];

  structure.abschnitte.forEach((abschnitt: any) => {
    // ersten numerischen KPI des Abschnitts finden
    const numericKpi = abschnitt.kpis.find(
      (kpi: any) => typeof values[kpi.field] === "number"
    );

    if (!numericKpi) return;

    const value = values[numericKpi.field] ?? 0;
    const label = formatQuestionLabel(abschnitt.label);

    tableColumns.push({
      field: numericKpi.field,
      label: label,
    });

    chartData.push({
      name: label,
      value: value,
    });
  });

  return {
    tableColumns,
    chartData,
  };
}
