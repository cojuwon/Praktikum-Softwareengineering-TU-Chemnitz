"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import Image from "next/image";

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
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: "auto",
                minHeight: "100vh",
                padding: "10px 24px 0 24px",
                backgroundColor: "#F3EEEE",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
            }}
        >
            <div
                style={{
                    maxWidth: "700px",
                    margin: "0 auto",
                    width: "100%",
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
                        Neues Preset anlegen
                    </h1>
                    <p
                        style={{
                            fontSize: "14px",
                            color: "#6b7280",
                            textAlign: "center",
                            margin: 0,
                        }}
                    >
                        Erstellen Sie ein neues Preset
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
                    <div style={{ marginBottom: "20px" }}>
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

                    <div style={{ marginBottom: "20px" }}>
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
                </div>
            </div>

            <Image
                src="/drei-welle-zusammenblau.png"
                alt=""
                width={1400}
                height={100}
                style={{
                    width: "150%",
                    height: "auto",
                    objectFit: "cover",
                    transform: "scaleY(1) scaleX(1.21)",
                    display: "block",
                    marginLeft: "-10%",
                }}
            />
        </div>
    );
}