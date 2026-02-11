"use client";

import { useStatistik } from "./StatistikContext";
import { FieldDefinition } from "@/components/dashboard/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import StatistikHeader from "@/components/dashboard/statistik/StatistikHeader";
import StatistikFilterSection from "@/components/dashboard/statistik/StatistikFilterSection";
import StatistikReportLinks from "@/components/dashboard/statistik/StatistikReportLinks";
import StatistikExportSection from "@/components/dashboard/statistik/StatistikExportSection";

export default function StatistikPage() {
  const { data, setData } = useStatistik();
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [structure, setStructure] = useState<any | null>(null);

  useEffect(() => {
    apiFetch("/api/statistik/filters/")
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

  useEffect(() => {
    async function loadPresets() {
      try {
        const res = await apiFetch("/api/statistik/presets/");
        const json = await res.json();
        setPresets(json.presets);
      } catch (e) {
        console.error("Presets konnten nicht geladen werden:", e);
      }
    }
    loadPresets();
  }, []);

  const handleSelectPreset = (presetId: string) => {
    if (!presetId) return;
    const preset = presets.find(p => String(p.id) === String(presetId));
    if (!preset) return;
    setFilters(preset.filters);
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await apiFetch("/api/statistik/query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      const result = await response.json();
      setData(result);
      setStructure(result.structure);
    } catch (error) {
      console.error("Fehler beim Laden der Statistik:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full pt-6">
      <StatistikHeader />

      <StatistikFilterSection
        presets={presets}
        filterDefinition={filterDefinition}
        filters={filters}
        onSelectPreset={handleSelectPreset}
        onFilterChange={handleFilterChange}
        onSubmit={handleSubmit}
      />

      {data && (
        <>
          <hr className="my-8 border-none border-t border-gray-200" />

          <section className="bg-white px-10 mx-5">
            <h2 className="text-xl font-semibold text-[#42446F] mb-4">
              Auswertungen:
            </h2>
            <StatistikReportLinks />
          </section>

          <StatistikExportSection structure={structure} />
        </>
      )}
    </div>
  );
}