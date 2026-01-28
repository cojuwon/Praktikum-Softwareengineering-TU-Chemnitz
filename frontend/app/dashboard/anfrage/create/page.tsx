"use client";

import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

export default function AnfragePage() {
  const [form, setForm] = useState<Record<string, any>>({});
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);

  /** FELDER LADEN */
  useEffect(() => {
    apiFetch("/api/anfragen/form-fields")
      .then(res => {
        if (res.status === 401) throw new Error('Session abgelaufen');
        return res.json();
      })
      .then(json => {
        setFormDefinition(json.fields);
        setLoading(false);
      })
      .catch(err => {
        console.error("Formular konnte nicht geladen werden:", err);
        setLoading(false);
        if (err.message === 'Session abgelaufen') {
          // Optional: window.location.href = '/login';
        }
      });
  }, []);

  /** FELDÄNDERUNG */
  const handleChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /** SPEICHERN MIT PFLICHTFELD-PRÜFUNG */
  const handleSubmit = async () => {
    if (!formDefinition) return;

    const missingFields = formDefinition
      .filter(f => f.required)
      .filter(f => {
        const v = form[f.name];
        return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      });

    if (missingFields.length > 0) {
      const message =
        "Es fehlen folgende Pflichtfelder:\n\n" +
        missingFields.map(f => `• ${f.label}`).join("\n") +
        "\n\nMöchten Sie trotzdem speichern?";

      const proceed = window.confirm(message);
      if (!proceed) return;
    }

    try {
      const response = await apiFetch("/api/anfragen/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();
      console.log("Anfrage gespeichert:", result);
      alert("Anfrage erfolgreich gespeichert!");
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern der Anfrage.");
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
          Anfrage anlegen
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            textAlign: "center",
            margin: 0,
          }}
        >
          Füllen Sie das Formular aus
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
        {loading && <p style={{ textAlign: "center" }}>Formular wird geladen…</p>}

        {!loading && formDefinition && (
          <DynamicForm
            definition={formDefinition}
            values={form}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        )}

        {!loading && formDefinition?.length === 0 && (
          <p style={{ textAlign: "center" }}>Keine Felder definiert.</p>
        )}
      </div>
    </div>
  );
}