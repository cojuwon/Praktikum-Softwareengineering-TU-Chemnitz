"use client";

type KPI = {
  field: string;
  label: string;
};

type Props = {
  kpis: KPI[];            // Definition aus structure
  data: Record<string, any>;   // Daten aus backend.data
};

export function DynamicKPIs({ kpis, data }: Props) {
  if (!kpis?.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.field}
          className="rounded-lg border bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-gray-500">{kpi.label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {data[kpi.field] ?? "–"}
          </p>
        </div>
      ))}
    </div>
  );
}