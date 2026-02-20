"use client";

import { useStatistik } from "@/app/dashboard/statistik/StatistikContext";
import { DynamicKPIs } from "@/components/dashboard/statistik/DynamicKPIs";
import { formatQuestionLabel } from "@/lib/statistik/labels";

export default function FinanzierungPage() {
    const { data } = useStatistik();

    if (!data) {
        return <p>Noch keine Daten geladen. Bitte zuerst Filter anwenden.</p>;
    }

    // Struktur aus dem Backend
    const structure = data.structure.finanzierung.unterkategorien.finanzierung;

    // Werte aus dem Backend
    const values = data.data.finanzierung;

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-6">{structure.label}</h1>

            {structure.abschnitte.map((abschnitt: any) => {
                return (
                    <div key={abschnitt.label} className="mb-10">
                        <h2 className="text-lg font-semibold mb-3">
                            {formatQuestionLabel(abschnitt.label)}
                        </h2>

                        <DynamicKPIs kpis={abschnitt.kpis} data={values} />
                    </div>
                );
            })}
        </div>
    );
}
