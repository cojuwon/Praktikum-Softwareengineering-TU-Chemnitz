"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState } from "react";
import { StatistikKPIs } from "@/components/statistik/StatistikKPIs";

// Konfigurationsobjekt (muss später erweitert werden, wenn weitere Kategorien hinzukommen)

const filterDefinition: FieldDefinition[] = [
  {
    name: "projektbereich",
    label: "Projektbereich",
    type: "select",
    options: ["Leipzig Stadt", "Nordsachsen", "LK Leipzig"]
  },
  {
    name: "start_date",
    label: "Von",
    type: "date"
  },
  {
    name: "end_date",
    label: "Bis",
    type: "date"
  },
  {
    name: "fall_typ",
    label: "Art des Falls",
    type: "select",
    options: ["Anfrage", "Fall"]
  },
  
];

export default function StatistikPage() {
    
    const [filters, setFilters] = useState<{ [key: string]: any }>({});       // State Hook, der die aktuell gesetzten Filter speichert

    const [data, setData] = useState<any[] | null>(null);

    const handleFilterChange = (name: string, value: any) => {                // wird aufgerufen, wenn user ein Filterfeld ändert --> aktualisiert den State ohne die anderen Filter zu überschreiben
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("/api/statistik", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters)
            });
            
            const result = await response.json();
            setData(result);  

            console.log("Gefilterte Daten:", result);
        } catch (error) {
            console.error("Fehler beim Laden der Statistik:", error);
        }
    };
    
    return (
    <div>
        <h1>Statistik Dashboard</h1>
        
        <DynamicFilterForm
        definition={filterDefinition}
        values={filters}
        onChange={handleFilterChange}
        onSubmit={handleSubmit}
        />

        {data && <StatistikKPIs data={data} />}
        {/* Hier später Tabelle oder Charts einfügen */}
    </div>
  );
}