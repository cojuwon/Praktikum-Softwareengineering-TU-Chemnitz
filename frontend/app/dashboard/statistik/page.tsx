"use client";

import { useStatistik } from "./StatistikContext";
import { useUser } from "@/lib/userContext";
import { FieldDefinition } from "@/components/dashboard/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import StatistikHeader from "@/components/dashboard/statistik/StatistikHeader";
import StatistikFilterSection from "@/components/dashboard/statistik/StatistikFilterSection";
import StatistikReportLinks from "@/components/dashboard/statistik/StatistikReportLinks";
import StatistikExportSection from "@/components/dashboard/statistik/StatistikExportSection";

export default function StatistikPage() {
  const { user, loading } = useUser();
  const { data, setData } = useStatistik();
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [structure, setStructure] = useState<any | null>(null);

  // State for visible sections (Modular Selection)
  const [visibleSections, setVisibleSections] = useState<{ [key: string]: boolean }>({
    auslastung: true,
    wohnsitz: true,
    staatsangehoerigkeit: true,
    altersstruktur: true,
    behinderung: true,
    taeterOpferBeziehung: true,
    gewaltart: true,
    gewaltfolgen: true,
    tatnachverfolgung: true,
    netzwerk: true,
    finanzierung: true,
  });

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  useEffect(() => {
    if (!user) return;

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
  }, [user]);

  if (loading) return <div className="p-8 text-center text-gray-500">Laden...</div>;
  if (!user?.permissions?.includes('api.can_view_statistics')) {
    return (
      <div className="p-8 text-center text-red-500">
        Sie haben keine Berechtigung, Statistiken einzusehen.
      </div>
    );
  }

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (section: string, isVisible: boolean) => {
    setVisibleSections((prev) => ({ ...prev, [section]: isVisible }));
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = presets.find((p: any) => p.id.toString() === presetId);
    if (preset) {
      // 1. Filter setzen
      if (preset.filters) {
        setFilters(preset.filters);
      }
      // 2. Bereiche setzen (falls im Preset gespeichert)
      if (preset.preset_daten && preset.preset_daten.visible_sections) {
        // Wenn "all", dann alle auf true
        if (Array.isArray(preset.preset_daten.visible_sections) && preset.preset_daten.visible_sections.includes('all')) {
          setVisibleSections(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(k => next[k] = true);
            return next;
          });
        } else if (typeof preset.preset_daten.visible_sections === 'object' && !Array.isArray(preset.preset_daten.visible_sections)) {
          // Wenn es ein Objekt ist (alte/andere Struktur), übernehmen
          setVisibleSections(prev => ({ ...prev, ...preset.preset_daten.visible_sections }));
        }
      }
    } else {
      setFilters({}); // Reset
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...filters,
        _visible_sections: visibleSections
      };

      const response = await apiFetch("/api/statistik/query/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Fehler beim Laden:", response.statusText);
        return;
      }

      const result = await response.json();
      setData(result);
      setStructure(result.structure);
    } catch (error) {
      console.error("Fehler beim Laden der Statistik:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full pt-6">
      <StatistikHeader />

      <StatistikFilterSection
        presets={presets}
        filterDefinition={filterDefinition}
        filters={filters}
        visibleSections={visibleSections}
        onSelectPreset={handleSelectPreset}
        onFilterChange={handleFilterChange}
        onSectionChange={handleSectionChange}
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