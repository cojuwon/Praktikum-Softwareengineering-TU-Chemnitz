"use client";

import { useStatistik } from "../StatistikContext";
import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

export default function AuslastungPage() {
  const { data } = useStatistik();

  if (!data) return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;

  return (
    <div>
      <h1>Auslastung und Leistungen in der Erwachsenenberatung</h1>
        <Link
            href="/dashboard/statistik/auslastung/begleitungen"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Begleitungen </span> 
        </Link>
        <br></br>
        <Link
            href="/dashboard/statistik/auslastung/beratungen"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Beratungen </span> 
        </Link>

    </div>
  );
}