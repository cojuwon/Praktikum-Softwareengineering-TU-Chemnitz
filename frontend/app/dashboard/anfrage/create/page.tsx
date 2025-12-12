"use client";

import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import { useState, useEffect } from "react";

export default function AnfragePage() {
  const [form, setForm] = useState<Record<string, any>>({});
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);

  /** FELDER LADEN */
  useEffect(() => {
    fetch("/api/anfrage")
      .then(res => res.json())
      .then(json => {
        const defs: FieldDefinition[] = json.fields.map((f: any) => ({
          name: f.name,
          label: f.label,
          type: f.type,
          options: f.options ?? [],
          required: f.required ?? false,
        }));
        setFormDefinition(defs);
        setLoading(false);
      })
      .catch(err => {
        console.error("Formular konnte nicht geladen werden:", err);
        setLoading(false);
      });
  }, []);

  /** FELDÄNDERUNG */
  const handleChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /** SPEICHERN MIT PFLICHTFELD-PRÜFUNG */
  const handleSubmit = async () => {
    if (!formDefinition) return;

    // ------------------------------------------------------
    // 1. Fehlende Pflichtfelder sammeln
    // ------------------------------------------------------
    const missingFields = formDefinition
      .filter(f => f.required)
      .filter(f => {
        const v = form[f.name];
        return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      });

    // ------------------------------------------------------
    // 2. Wenn Pflichtfelder fehlen → Meldung
    // ------------------------------------------------------
    if (missingFields.length > 0) {
      const message =
        "Es fehlen folgende Pflichtfelder:\n\n" +
        missingFields.map(f => `• ${f.label}`).join("\n") +
        "\n\nMöchten Sie trotzdem speichern?";

      const proceed = window.confirm(message);

      if (!proceed) {
        // User möchte nachtragen → Abbruch
        return;
      }
    }

    // ------------------------------------------------------
    // 3. Speichern
    // ------------------------------------------------------
    try {
      const response = await fetch("/api/anfrage", {
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
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Anfrage anlegen</h1>

      {loading && <p>Formular wird geladen…</p>}

      {!loading && formDefinition && (
        <DynamicForm
          definition={formDefinition}
          values={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      )}

      {!loading && formDefinition?.length === 0 && (
        <p>Keine Felder definiert.</p>
      )}
    </div>
  );
}
