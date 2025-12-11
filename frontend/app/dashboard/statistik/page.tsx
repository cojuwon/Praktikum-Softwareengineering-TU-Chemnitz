
"use client";

import { useStatistik } from "./StatistikContext";
import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import ExportCSVButton from "@/components/statistik/ExportCSVButton";
import ExportXLSXButton from "@/components/statistik/ExportXLSXButton";
import ExportPDFButton from "@/components/statistik/ExportPDFButton";
import ExportButtons from "@/components/statistik/ExportButtons";
import PresetSelector from "@/components/statistik/PresetSelector";
import Link from 'next/link';


export default function StatistikPage() {
  const { data, setData } = useStatistik();
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [structure, setStructure] = useState<any | null>(null);


  /** FILTERDEFINITIONEN LADEN */
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

  /** PRESETS LADEN */
  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await fetch("/api/statistik/presets");
        const json = await res.json();
        setPresets(json.presets);
      } catch (e) {
        console.error("Presets konnten nicht geladen werden:", e);
      }
    }
    loadPresets();
  }, []);

  /** WENN USER EIN PRESET WÄHLT */
  const handleSelectPreset = (presetId: string) => {
    if (!presetId) return;

    const preset = presets.find(p => String(p.id) === String(presetId));
    if (!preset) return;

    setFilters(preset.filters);
  };

  /** WENN USER FILTER ABSCHICKT */
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
      setStructure(result.structure); // Struktur für Labels

    } catch (error) {
      console.error("Fehler beim Laden der Statistik:", error);
    }
  };

  console.log(data);


  return (
    <div>
      <h1>Statistik Dashboard</h1>
    
      <PresetSelector
        presets={presets}
        onSelect={handleSelectPreset}
      /> 
      <Link 
      href="/dashboard/statistik/presets" 
      className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base" >
        <span> Presets verwalten </span> 
      </Link>

      <br/>

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

      <br />

      {data && (
        <div>
          <Link href="/dashboard/statistik/auslastung" className="btn">Auslastung</Link><br />
          <Link href="/dashboard/statistik/berichtsdaten" className="btn">Berichtsdaten</Link><br />
          <Link href="/dashboard/statistik/finanzierung" className="btn">Finanzierung</Link><br />
          <Link href="/dashboard/statistik/netzwerk" className="btn">Netzwerk</Link> <br/> <br/>

          <div className="flex gap-3 mb-4">
            <ExportCSVButton structure={structure} />
            <ExportXLSXButton structure={structure} />
            <ExportPDFButton structure={structure} />
         
          </div>

        </div>
      )}
    </div>
  );
}