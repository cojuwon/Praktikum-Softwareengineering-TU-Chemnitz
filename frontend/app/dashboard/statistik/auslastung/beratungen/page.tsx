"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/statistik/DynamicKPIs";

export default function BeratungenPage() {
  const { data } = useStatistik();

  if (!data) {
    return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
  }

  // Struktur aus dem Backend
  const structure = data.structure.auslastung.unterkategorien.beratungen;

  // Werte aus dem Backend
  const values = data.data.auslastung.beratungen;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{structure.label}</h1>

      {/* ABSCHNITTE RENDERN */}
      {structure.abschnitte.map((abschnitt: any) => (
        <div key={abschnitt.label} className="mb-10">
          <h2 className="text-lg font-semibold mb-3">
            {abschnitt.label}
          </h2>

          <DynamicKPIs kpis={abschnitt.kpis} data={values} />
        </div>
      ))}
    </div>
  );
}
