"use client";

import { DynamicFilterForm, FieldDefinition } from "@/components/statistik/DynamicFilterForm";
import { useState, useEffect } from "react";
import PresetSelector from "@/components/statistik/PresetSelector";
import Link from 'next/link';
import Image from 'next/image';

export default function PresetPage() {
  const [presets, setPresets] = useState([]); // Placeholder for presets state

  // Placeholder for fetching presets, if needed
  useEffect(() => {
    // Example: Fetch presets from an API
    // const fetchPresets = async () => {
    //   const response = await fetch('/api/presets');
    //   const data = await response.json();
    //   setPresets(data);
    // };
    // fetchPresets();

    // Mock data for demonstration
    setPresets([
      { id: '1', name: 'Mein erstes Preset' },
      { id: '2', name: 'Wichtige Filter' },
      { id: '3', name: 'Standard Ansicht' },
    ]);
  }, []);

  const handleDelete = (id) => {
    // Placeholder for delete logic
    console.log(`Deleting preset with id: ${id}`);
    setPresets(presets.filter(preset => preset.id !== id));
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
          Statistik Presets
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            textAlign: "center",
            margin: 0,
          }}
        >
          Verwalten Sie Ihre Filter-Voreinstellungen
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
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <Link
            href="/dashboard/statistik/presets/new"
            style={{
              backgroundColor: "#22c55e",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            + Neues Preset erstellen
          </Link>
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {presets.map((preset) => (
            <li
              key={preset.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                marginBottom: "10px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontWeight: "500", color: "#42446F" }}>{preset.name}</span>
              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  href={`/dashboard/statistik/presets/edit?id=${preset.id}`}
                  style={{
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  Bearbeiten
                </Link>
                <button
                  onClick={() => handleDelete(preset.id)}
                  style={{
                    color: "#ef4444",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Löschen
                </button>
              </div>
            </li>
          ))}
        </ul>

        {presets.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280", marginTop: "20px" }}>
            Keine Presets vorhanden.
          </p>
        )}
      </div>
    </div>
  );
}