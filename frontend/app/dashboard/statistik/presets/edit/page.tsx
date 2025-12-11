"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import PresetSelector from "@/components/statistik/PresetSelector";

export default function EditPresetPage() {
    
    const [filters, setFilters] = useState<{ [key: string]: any }>({});
    const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);
    const [label, setLabel] = useState<string>("");
    const [presetType, setPresetType] = useState<"shared" | "private" | "">("");
    const [presets, setPresets] = useState<any[]>([]);
    const [currentPresetId, setCurrentPresetId] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

      setCurrentPresetId(String(preset.id));
      setFilters(preset.filters);
      setLabel(preset.name);
      setPresetType(preset.preset_type);
      setStatusMessage(null); // Status zurücksetzen
    };

    /** WENN USER FILTER ÄNDERT */
    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    /** WENN USER DAS FORMULAR ABSCHICKT */
    const handleSubmit = async () => {
        if (!currentPresetId || !label || !presetType) {
            alert("Bitte Preset auswählen und Name + Art setzen!");
            return;
        }

        try {
            const response = await fetch(`/api/statistik/presets/edit/${currentPresetId}`, {
                method: "PUT", // PATCH ginge auch
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    id: Number(currentPresetId),
                    name: label,
                    preset_type: presetType,
                    filters: filters
                }),
            });

            if (!response.ok) {
                throw new Error("Preset konnte nicht gespeichert werden");
            }

            const result = await response.json();
            setStatusMessage("Preset erfolgreich gespeichert!");
            console.log("Geändertes Preset:", result);

        } catch (error) {
            console.error(error);
            setStatusMessage("Fehler beim Speichern des Presets.");
        }
    };

    return (
        <div>
            <h1>Preset bearbeiten</h1>

            <h2>Preset auswählen:</h2>
            <PresetSelector
                presets={presets}
                onSelect={handleSelectPreset}
            /> 

            {currentPresetId && (
                <>
                    <label className="block mt-2">
                        Name des Presets: 
                        <input
                            type="text"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            className="border rounded p-1 ml-2"
                        />
                    </label>

                    <h2 className="mt-2">Art des Presets:</h2>
                    <select
                        value={presetType}
                        onChange={(e) => setPresetType(e.target.value as "shared" | "private")}
                        className="border rounded p-1"
                    >
                        <option value="">Bitte wählen…</option>
                        <option value="shared">Geteiltes Preset</option>
                        <option value="private">Privates Preset</option>
                    </select>

                    <h2 className="mt-4">Filter setzen:</h2>
                    {filterDefinition && (
                        <DynamicFilterForm
                            definition={filterDefinition}
                            values={filters}
                            onChange={handleFilterChange}
                            onSubmit={handleSubmit}
                        />
                    )}

                    {statusMessage && (
                        <p className="mt-2 font-semibold text-green-600">{statusMessage}</p>
                    )}
                </>
            )}
        </div>
    );
}
