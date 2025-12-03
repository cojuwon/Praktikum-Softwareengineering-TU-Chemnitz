"use client";

import { useStatistik } from "../StatistikContext";
import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

export default function BerichtsdatenPage() {
  const { data } = useStatistik();

  if (!data) return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;

  return (
    <div>
      <h1>Berichtsdaten der Klient:innen</h1>
        <Link
            href="/dashboard/statistik/berichtsdaten/wohnsitz"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Wohnsitz der Klient:innen </span> 
        </Link>
        <br></br>
        <Link
            href="/dashboard/statistik/berichtsdaten/staatsangehörigkeit"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Staatsangehörigkeit </span> 
        </Link> <br/>
        <Link
            href="/dashboard/statistik/berichtsdaten/altersstruktur"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Altersstruktur der Klient:innen </span> 
        </Link> <br/>
        <Link
            href="/dashboard/statistik/berichtsdaten/behinderung"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Anzahl der Klient:innen mit vorliegender Schwerbehinderung</span> 
        </Link> <br/>
        <Link
            href="/dashboard/statistik/berichtsdaten/tater-opfer-beziehung"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Täter-Opfer-Beziehung</span> 
        </Link> <br/>
        <Link
            href="/dashboard/statistik/berichtsdaten/gewaltart"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Art der Gewaltanwendung </span> 
        </Link> <br/>
        <Link
            href="/dashboard/statistik/berichtsdaten/gewaltfolgen"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Folgen der Gewalttat </span> 
        </Link> <br/>
        <Link
            href="/dashboard/statistik/berichtsdaten/tatnachverfolgung"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Tatnachverfolgung </span> 
        </Link>

    </div>
  );
}