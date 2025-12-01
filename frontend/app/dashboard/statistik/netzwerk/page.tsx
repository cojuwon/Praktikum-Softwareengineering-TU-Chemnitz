"use client";

import { useStatistik } from "../StatistikContext";
import Link from 'next/link';
import { lusitana } from '@/components/ui/fonts';

export default function AuslastunPage() {
  const { data } = useStatistik();

  if (!data) return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;

  return (
    <div>
      <h1>Netzwerk</h1>

      {/* Hier Diagramme, Tabellen usw */}
    </div>
  );
}
