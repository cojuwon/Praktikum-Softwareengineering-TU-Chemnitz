"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";

export default function NewPresetPage() {
    
    const [filters, setFilters] = useState<{ [key: string]: any }>({});
    const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);
    const [label, setLabel] = useState<string>("");
    const [presetType, setPresetType] = useState<"shared" | "private" | "">("");

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

    /** WENN USER FILTER ÄNDERT */
    const handleFilterChange = (name: string, value: any) => {
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    /** WENN USER DAS FORMULAR ABSCHICKT */
    const handleSubmit = async () => {
        if (!label || !presetType) {
            alert("Bitte Name und Art des Presets auswählen!");
            return;
        }

        try {
            const response = await fetch("/api/statistik/presets/new", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    name: label,
                    preset_type: presetType,
                    filters: filters
                }),
            });

            if (!response.ok) {
                throw new Error("Preset konnte nicht gespeichert werden");
            }

            const result = await response.json();
            alert("Preset erfolgreich gespeichert!");
            console.log("Neues Preset:", result);

            // Formular zurücksetzen
            setFilters({});
            setLabel("");
            setPresetType("");

        } catch (error) {
            console.error(error);
            alert("Fehler beim Speichern des Presets.");
        }
    };

    return (
        <div>
            <h1>Neues Preset anlegen</h1>
            <label>
            Name des Presets:
            <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="border rounded p-1 ml-2"
            />
            </label>

            <h2>Art des Presets:</h2>
            <select
                value={presetType}
                onChange={(e) => setPresetType(e.target.value as "shared" | "private")}
            >
                <option value="">Bitte wählen…</option>
                <option value="shared">Geteiltes Preset</option>
                <option value="private">Privates Preset</option>
            </select>

            <h2>Filter setzen:</h2>
            {filterDefinition && (
                <DynamicFilterForm
                    definition={filterDefinition}
                    values={filters}
                    onChange={handleFilterChange}
                    onSubmit={handleSubmit} // Submit wird hier vom inneren Form ausgelöst
                />
            )}
        </div>
    );
}
