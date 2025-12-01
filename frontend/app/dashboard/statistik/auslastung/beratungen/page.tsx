
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
      <h1 className="text-xl font-bold mb-4">
        {structure.label}
      </h1>

      <DynamicKPIs kpis={structure.kpis} data={values} />
    </div>
  );
}


/*"use client";
import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

export default function Page() {

    const { data } = useStatistik();
    const stats = data.auslastung.beratungen;

    if (!data) return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
    
  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
        
        <h1>Anzahl Beratungen in der Erwachsenenberatung </h1> <br />
        
          <h2> Beratene Klient:innen</h2>

          <p> gesamt: {stats.beratungen.gesamt}</p>
          <p> gesamt: {stats.beratungen.weiblich}</p>
          <p> gesamt: {stats.beratungen.divers}</p>
          <p> gesamt: {stats.beratungen.männlich}</p>
      
          
          <h2> Beratungen</h2>
          
         
          
          <h2> davon </h2>
          
         

        </div>
      </div>
    </main>
  );
}*/