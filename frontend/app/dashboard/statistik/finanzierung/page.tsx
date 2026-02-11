"use client";

import { useStatistik } from "../StatistikContext";
import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";


export default function FinanzierungPage() {
  const { data } = useStatistik();

  if (!data) return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;


  // Struktur aus dem Backend
  const structure = data.structure.finanzierung.unterkategorien.finanzierung;

  // Werte aus dem Backend
  const values = data.data.finanzierung;

  return (

    <div className="p-6">
      
      <h1 className="text-xl font-bold mb-6"> {structure.label} </h1>

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


