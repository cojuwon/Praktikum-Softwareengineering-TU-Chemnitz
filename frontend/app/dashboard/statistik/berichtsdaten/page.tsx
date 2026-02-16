"use client";

import { useStatistik } from "../StatistikContext";
import CenteredCard from '@/components/layout/CenteredCard';
import PageHeader from '@/components/layout/PageHeader';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function BerichtsdatenPage() {
    const { data } = useStatistik();

    if (!data) {
        return (
            <CenteredCard header={<PageHeader title={"Berichtsdaten der Klient:innen"} showImage={false} />}>
                <p style={{ textAlign: "center", color: "#6b7280", margin: 0 }}>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>
            </CenteredCard>
        );
    }

    return (
        <CenteredCard header={<PageHeader title={"Berichtsdaten der Klient:innen"} showImage={false} />}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "stretch" }}>
                <PrimaryButton href="/dashboard/statistik/berichtsdaten/wohnsitz">Wohnsitz der Klient:innen</PrimaryButton>

                <PrimaryButton href="/dashboard/statistik/berichtsdaten/staatsangehoerigkeit">Staatsangehörigkeit</PrimaryButton>

                <PrimaryButton href="/dashboard/statistik/berichtsdaten/altersstruktur">Altersstruktur der Klient:innen</PrimaryButton>

                <PrimaryButton href="/dashboard/statistik/berichtsdaten/behinderung">Anzahl der Klient:innen mit vorliegender Schwerbehinderung</PrimaryButton>

                <PrimaryButton href="/dashboard/statistik/berichtsdaten/taeterOpferBeziehung">Täter-Opfer-Beziehung</PrimaryButton>

                <PrimaryButton href="/dashboard/statistik/berichtsdaten/gewaltart">Art der Gewaltanwendung</PrimaryButton>

                <PrimaryButton href="/dashboard/statistik/berichtsdaten/gewaltfolgen">Folgen der Gewalttat</PrimaryButton>

                <PrimaryButton href="/dashboard/statistik/berichtsdaten/tatnachverfolgung">Tatnachverfolgung</PrimaryButton>
            </div>
        </CenteredCard>
    );
}