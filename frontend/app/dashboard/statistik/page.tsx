"use client";

import { useStatistik } from "./StatistikContext";
import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import ExportCSVButton from "@/components/statistik/ExportCSVButton";
import ExportXLSXButton from "@/components/statistik/ExportXLSXButton";
import ExportPDFButton from "@/components/statistik/ExportPDFButton";
import PresetSelector from "@/components/statistik/PresetSelector";
import Link from 'next/link';
import Image from 'next/image';

export default function StatistikPage() {
  const { data, setData } = useStatistik();
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [filterDefinition, setFilterDefinition] = useState<FieldDefinition[] | null>(null);
  const [presets, setPresets] = useState<any[]>([]);
  const [structure, setStructure] = useState<any | null>(null);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");

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
      setStructure(result.structure);

    } catch (error) {
      console.error("Fehler beim Laden der Statistik:", error);
    }
  };

  const handleSavePreset = async () => {
    if (!presetName.trim()) {
      alert("Bitte geben Sie einen Namen für das Preset ein!");
      return;
    }

    try {
      const response = await fetch("/api/statistik/presets/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: presetName,
          preset_type: "user",
          filters: filters
        }),
      });

      if (!response.ok) {
        throw new Error("Preset konnte nicht gespeichert werden");
      }

      alert("Preset erfolgreich gespeichert!");
      setShowSavePresetModal(false);
      setPresetName("");
      
      // Reload presets
      const presetsResponse = await fetch("/api/statistik/presets", {
        credentials: "include",
      });
      const presetsData = await presetsResponse.json();
      setPresets(presetsData.presets);
    } catch (error) {
      console.error(error);
      alert("Fehler beim Speichern des Presets.");
    }
  };

  console.log(data);

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
            Statistik Dashboard
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
            }}
          >
            Filter setzen und Daten exportieren
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
          <PresetSelector
            presets={presets}
            onSelect={handleSelectPreset}
          />

          <Link
            href="/dashboard/statistik/presets"
            style={{
              width: "100%",
              maxWidth: "350px",
              backgroundColor: "transparent",
              color: "#131313",
              border: "3px solid #A0A8CD",
              borderRadius: "8px",
              padding: "10px 16px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              textAlign: "center",
              textDecoration: "none",
              display: "block",
              margin: "15px auto",
            }}
          >
            Presets verwalten
          </Link>

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

          {!filterDefinition && <p style={{ textAlign: "center" }}>Filter werden geladen…</p>}

          {filterDefinition && (
            <>
              <DynamicFilterForm
                definition={filterDefinition}
                values={filters}
                onChange={handleFilterChange}
              />
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: "1",
                    minWidth: "200px",
                    backgroundColor: "#052a61ff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Auswertung aktualisieren
                </button>
                
                <button
                  onClick={() => setShowSavePresetModal(true)}
                  style={{
                    flex: "1",
                    minWidth: "200px",
                    backgroundColor: "transparent",
                    color: "#052a61ff",
                    border: "2px solid #052a61ff",
                    borderRadius: "8px",
                    padding: "12px 20px",
                    fontSize: "16px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Aktuelle Auswahl als Preset speichern
                </button>
              </div>
            </>
          )}

          {showSavePresetModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
              }}
              onClick={() => {
                if (
                  !presetName ||
                  window.confirm(
                    "Sie haben bereits einen Namen eingegeben. Möchten Sie das Fenster wirklich schließen? Ihre Eingabe geht dabei verloren."
                  )
                ) {
                  setShowSavePresetModal(false);
                }
              }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  padding: "30px",
                  maxWidth: "500px",
                  width: "90%",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#42446F",
                    marginBottom: "20px",
                  }}
                >
                  Preset speichern
                </h3>
                
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", color: "#374151" }}>
                  Name des Presets:
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="z.B. Mein Monatsreport"
                  style={{
                    width: "100%",
                    border: "2px solid #052a61ff",
                    borderRadius: "6px",
                    padding: "10px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                    marginBottom: "20px",
                  }}
                />
                
                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => {
                      setShowSavePresetModal(false);
                      setPresetName("");
                    }}
                    style={{
                      backgroundColor: "transparent",
                      color: "#6b7280",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontSize: "16px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Abbrechen
                  </button>
                  
                  <button
                    onClick={handleSavePreset}
                    style={{
                      backgroundColor: "#052a61ff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "10px 20px",
                      fontSize: "16px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          )}

          {data && (
            <>
              <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#42446F",
                  marginBottom: "15px",
                }}
              >
                Auswertungen:
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                <Link
                  href="/dashboard/statistik/auslastung"
                  style={{
                    backgroundColor: "#f9fafb",
                    color: "#42446F",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  Auslastung
                </Link>

                <Link
                  href="/dashboard/statistik/berichtsdaten"
                  style={{
                    backgroundColor: "#f9fafb",
                    color: "#42446F",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  Berichtsdaten
                </Link>

                <Link
                  href="/dashboard/statistik/finanzierung"
                  style={{
                    backgroundColor: "#f9fafb",
                    color: "#42446F",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  Finanzierung
                </Link>

                <Link
                  href="/dashboard/statistik/netzwerk"
                  style={{
                    backgroundColor: "#f9fafb",
                    color: "#42446F",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    textDecoration: "none",
                    textAlign: "center",
                    transition: "all 0.2s",
                  }}
                >
                  Netzwerk
                </Link>
              </div>

              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  color: "#42446F",
                  marginBottom: "15px",
                }}
              >
                Export:
              </h2>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <ExportCSVButton structure={structure} />
                <ExportXLSXButton structure={structure} />
                <ExportPDFButton structure={structure} />
              </div>
            </>
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