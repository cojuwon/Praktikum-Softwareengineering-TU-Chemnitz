"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import PresetSelector from "@/components/statistik/PresetSelector";
import Image from "next/image";

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
        setStatusMessage(null);
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
                method: "PUT",
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
        <div
            className="flex flex-col justify-between h-full bg-[#F3EEEE] overflow-auto"
        >
            <div
                style={{
                    maxWidth: "700px",
                    margin: "0 auto",
                    width: "100%",
                    padding: "24px 24px 0 24px"
                }}
            >
                <Image
                    src="/bellis-favicon.png"
                    alt="Bellis Logo"
                    width={100}
                    height={100}
                    style={{
                        width: "60px",
                        height: "auto",
                        objectFit: "contain",
                        display: "block",
                        margin: "20px auto",
                    }}
                />

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "40px 40px",
                        margin: "0 20px 0px 20px",
                        borderRadius: "12px 12px 0 0",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "28px",
                            fontWeight: "600",
                            color: "#42446F",
                            marginBottom: "6px",
                            textAlign: "center",
                        }}
                    >
                        Preset bearbeiten
                    </h1>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            textAlign: "center",
                            margin: 0,
                        }}
                    >
                        Wählen Sie ein Preset zum Bearbeiten
                    </p>
                </div>

                <div
                    style={{
                        backgroundColor: "white",
                        padding: "20px 40px 30px 40px",
                        margin: "0 20px",
                        borderRadius: "0 0 12px 12px",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "20px",
                            fontWeight: "600",
                            color: "#42446F",
                            marginBottom: "15px",
                        }}
                    >
                        Preset auswählen:
                    </h2>
                    <PresetSelector
                        presets={presets}
                        onSelect={handleSelectPreset}
                    />

                    {currentPresetId && (
                        <>
                            <div style={{ marginTop: "20px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                                    Name des Presets:
                                </label>
                                <input
                                    type="text"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    style={{
                                        width: "100%",
                                        border: "2px solid #052a61ff",
                                        borderRadius: "6px",
                                        padding: "10px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>

                            <div style={{ marginTop: "20px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                                    Art des Presets:
                                </label>
                                <select
                                    value={presetType}
                                    onChange={(e) => setPresetType(e.target.value as "shared" | "private")}
                                    style={{
                                        width: "100%",
                                        border: "2px solid #052a61ff",
                                        borderRadius: "6px",
                                        padding: "10px",
                                        fontSize: "16px",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <option value="">Bitte wählen…</option>
                                    <option value="shared">Geteiltes Preset</option>
                                    <option value="private">Privates Preset</option>
                                </select>
                            </div>

                            <h2
                                style={{
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    color: "#42446F",
                                    marginTop: "30px",
                                    marginBottom: "15px",
                                }}
                            >
                                Filter setzen:
                            </h2>
                            {filterDefinition && (
                                <DynamicFilterForm
                                    definition={filterDefinition}
                                    values={filters}
                                    onChange={handleFilterChange}
                                    onSubmit={handleSubmit}
                                />
                            )}

                            {statusMessage && (
                                <p style={{ marginTop: "15px", fontWeight: "600", color: statusMessage.includes("Fehler") ? "#ef4444" : "#10b981", textAlign: "center" }}>
                                    {statusMessage}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Image
                src="/drei-welle-zusammenblau.png"
                alt=""
                width={1400}
                height={100}
                className="w-full h-auto object-cover block"
            />
        </div>
    );
}