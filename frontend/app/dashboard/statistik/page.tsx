"use client";

import { useStatistik } from "./StatistikContext";
import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import Link from 'next/link';

export default function StatistikPage() {
  const { data, setData } = useStatistik();

  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);

  useEffect(() => {
    fetch("/api/statistik/filters")
      .then(res => res.json())
      .then(json => {
        const defs: FieldDefinition[] = json.filters.map((f: any) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          options: f.options ?? []
        }));
        setFilterDefinition(defs);
      })
      .catch(err => console.error("Filter konnten nicht geladen werden:", err));
  }, []);

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/statistik/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const result = await response.json();
      setData(result);

    } catch (error) {
      console.error("Fehler beim Laden der Statistik:", error);
    }
  };

  return (
    <div>
      <h1>Statistik Dashboard</h1>

      {!filterDefinition && <p>Filter werden geladen…</p>}

      {filterDefinition && (
        <DynamicFilterForm
          definition={filterDefinition}
          values={filters}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
        />
      )}

      {data && (
        <div>
          <Link href="/dashboard/statistik/auslastung" className="btn">
            Auslastung
          </Link><br />

          <Link href="/dashboard/statistik/berichtsdaten" className="btn">
            Berichtsdaten
          </Link>
        </div>
      )}
    </div>
  );
}


/*"use client";

import { useStatistik } from "./StatistikContext";
import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import { StatistikKPIs } from "@/components/statistik/StatistikKPIs";
import Link from 'next/link';

export default function StatistikPage() {
  
    const { data, setData } = useStatistik(); 

    const [filters, setFilters] = useState<{ [key: string]: any }>({});
    const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);

    // 1. Lade Filterdefinitionen dynamisch aus dem Backend
    useEffect(() => {
        fetch("/api/statistik/filters")
            .then(res => res.json())
            .then(json => {
                // Backend sollte ein Array von Filtern zurückgeben
                const defs: FieldDefinition[] = json.filters.map((f: any) => ({
                    name: f.name,
                    label: f.label,
                    type: f.type,
                    options: f.options ?? []
                }));

                setFilterDefinition(defs);
            })
            .catch(err => console.error("Filter konnten nicht geladen werden:", err));
    }, []);

    // 2. Werte aktualisieren
    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // 3. Filter an Backend senden
    const handleSubmit = async () => {
        try {
            const response = await fetch("/api/statistik/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(filters),
            });

            const result = await response.json();
            setData(result);
        } catch (error) {
            console.error("Fehler beim Laden der Statistik:", error);
        }
    };

    return (
        <div>
            <h1>Statistik Dashboard</h1>

            
            {!filterDefinition && <p>Filter werden geladen…</p>}

            {filterDefinition && (
                <DynamicFilterForm
                    definition={filterDefinition}
                    values={filters}
                    onChange={handleFilterChange}
                    onSubmit={handleSubmit}
                /> 
            )}

             
          <Link
            href="/dashboard/statistik/auslastung"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Auslastung </span> 
          </Link>
          <br></br>

          <Link
            href="/dashboard/statistik/berichtsdaten"
            className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
            <span> Berichtsdaten der Klient:innen </span> 
          </Link>

          
            {data && <StatistikKPIs data={data} />}
        </div>

    );
}*/
