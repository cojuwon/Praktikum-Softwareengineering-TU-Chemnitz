"use client";

import { useStatistik } from "../StatistikContext";
import CenteredCard from '@/components/layout/CenteredCard';
import PageHeader from '@/components/layout/PageHeader';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function AuslastungPage() {
  const { data } = useStatistik();

  if (!data) {
    return (
      <CenteredCard header={<PageHeader title={"Auslastung und Leistungen in der Erwachsenenberatung"} showImage={false} />}>
        <p style={{ textAlign: "center", color: "#6b7280", margin: 0 }}>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>
      </CenteredCard>
    );
  }

  return (
    <CenteredCard header={<PageHeader title={"Auslastung und Leistungen in der Erwachsenenberatung"} showImage={false} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "stretch" }}>
        <PrimaryButton href="/dashboard/statistik/auslastung/begleitungen">Begleitungen</PrimaryButton>

        <PrimaryButton href="/dashboard/statistik/auslastung/beratungen">Beratungen</PrimaryButton>
      </div>
    </CenteredCard>
  );
}