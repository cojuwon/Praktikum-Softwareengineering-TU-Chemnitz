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
      <br></br>
      <h2>Filter setzen:</h2>


      {!filterDefinition && <p>Filter werden geladen…</p>}

      {filterDefinition && (
        <DynamicFilterForm
          definition={filterDefinition}
          values={filters}
          onChange={handleFilterChange}
          onSubmit={handleSubmit}
        />
      )}

      <br></br>

      {data && (
        <div>
          <Link href="/dashboard/statistik/auslastung" className="btn">
            Auslastung
          </Link><br />

          <Link href="/dashboard/statistik/berichtsdaten" className="btn">
            Berichtsdaten
          </Link> <br/>

          <Link href="/dashboard/statistik/finanzierung" className="btn">
            Finanzierung
          </Link><br/>

          <Link href="/dashboard/statistik/netzwerk" className="btn">
            Netzwerk
          </Link>
        </div>
      )}
    </div>
  );
}
