"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function NewPresetPage() {
    const router = useRouter();

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
                    Neues Preset
                </h1>
                <p
                    style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        textAlign: "center",
                        margin: 0,
                    }}
                >
                    Erstellen Sie eine neue Filter-Voreinstellung
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
                {!filterDefinition && <p style={{ textAlign: "center" }}>Lade Filter-Definitionen…</p>}

                {filterDefinition && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}>
                                Preset Name
                            </label>
                            <input
                                type="text"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                }}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", fontWeight: "500", marginBottom: "5px" }}>
                                Sichtbarkeit
                            </label>
                            <select
                                value={presetType}
                                onChange={(e) => setPresetType(e.target.value as any)}
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                }}
                                required
                            >
                                <option value="">Bitte wählen...</option>
                                <option value="private">Nur für mich (Privat)</option>
                                <option value="shared">Für alle sichtbar (Geteilt)</option>
                            </select>
                        </div>

                        <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#42446F" }}>Filterwerte</h3>
                        <DynamicFilterForm
                            definition={filterDefinition}
                            values={filters}
                            onChange={handleFilterChange}
                            onSubmit={() => { }} // prevent default enter submit
                        />

                        <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "center" }}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "1px solid #ccc",
                                    backgroundColor: "white",
                                    cursor: "pointer",
                                }}
                            >
                                Abbrechen
                            </button>
                            <button
                                type="submit"
                                style={{
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    border: "none",
                                    backgroundColor: "#22c55e",
                                    color: "white",
                                    cursor: "pointer",
                                    fontWeight: "500",
                                }}
                            >
                                Speichern
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}