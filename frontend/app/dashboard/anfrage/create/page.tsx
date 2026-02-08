"use client";

import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function AnfrageCreatePage() {
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

      if (!response.ok) throw new Error(`Fehler: ${response.status}`);

      const result = await response.json();
      console.log("Anfrage gespeichert:", result);
      alert("Anfrage erfolgreich gespeichert!");
      // Optionally redirect back
      // window.location.href = "/dashboard/anfrage";
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Fehler beim Speichern der Anfrage.");
    }
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        width: "100%",
        padding: "24px"
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
          margin: "0 auto 20px auto",
        }}
      />

      {/* BIG BOX */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "30px 40px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard/anfrage" className="text-gray-400 hover:text-gray-600">
              <ArrowLeftIcon className="h-6 w-6" />
            </Link>
            <div>
              <h1
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "#42446F",
                  margin: 0,
                }}
              >
                Anfrage anlegen
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "4px 0 0 0",
                }}
              >
                Erfassen Sie eine neue Anfrage im System
              </p>
            </div>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div
          style={{
            padding: "40px",
            backgroundColor: "#fff"
          }}
        >
          {loading && <p className="text-center text-gray-500">Lade Formular...</p>}

          {!loading && formDefinition && (
            <div className="max-w-2xl mx-auto">
              <DynamicForm
                definition={formDefinition}
                values={form}
                onChange={handleChange}
                // We render our own button for better placement/styling control, or pass it to DynamicForm.
                // Since I updated DynamicForm to have a nice button if onSubmit is passed, let's use that.
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {!loading && formDefinition?.length === 0 && (
            <p className="text-center text-gray-500">Keine Felder definiert.</p>
          )}
        </div>
      </div>
    </div>
  );
}