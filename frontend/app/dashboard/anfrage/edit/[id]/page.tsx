"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import Image from "next/image";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ArrowLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export default function AnfrageEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [definition, setDefinition] = useState<FieldDefinition[] | null>(null);
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [originalData, setOriginalData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // ---------------------------------------
  // 1. ANFRAGE + FELDDEFINITION LADEN
  // ---------------------------------------
  useEffect(() => {
    Promise.all([
      apiFetch(`/api/anfragen/${id}`).then((res) => {
        if (!res.ok) throw new Error("Anfrage fetch failed");
        return res.json();
      }),
      apiFetch("/api/anfragen/form-fields").then((res) => {
        if (!res.ok) throw new Error("Fields fetch failed");
        return res.json();
      }),
    ])
      .then(([anfrageData, fieldsData]) => {
        setData(anfrageData);
        setOriginalData({ ...anfrageData });
        setDefinition(fieldsData.fields);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden:", err);
        setLoading(false);
      });
  }, [id]);

  // ---------------------------------------
  // 2. FELDÄNDERUNG (Edit Mode)
  // ---------------------------------------
  const handleChange = (name: string, value: any) => {
    setData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  // ---------------------------------------
  // 3. SPEICHERN
  // ---------------------------------------
  const handleSubmit = async () => {
    if (!definition || !data) return;

    // Pflichtfelder prüfen
    const missing = definition.filter(
      (f) =>
        f.required &&
        (data[f.name] === undefined ||
          data[f.name] === "" ||
          (Array.isArray(data[f.name]) && data[f.name].length === 0))
    );

    if (missing.length > 0) {
      const ok = window.confirm(
        "Es fehlen folgende Pflichtfelder:\n\n" +
        missing.map((f) => `• ${f.label}`).join("\n") +
        "\n\nTrotzdem speichern?"
      );
      if (!ok) return;
    }

    try {
      // Filter to only include editable fields from definition
      const editableData: Record<string, any> = {};
      if (definition) {
        for (const field of definition) {
          if (data[field.name] !== undefined) {
            editableData[field.name] = data[field.name];
          }
        }
      }

      const res = await apiFetch(`/api/anfragen/${id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editableData),
      });

      if (!res.ok) throw new Error("Update failed");

      // Refetch to ensure clean state or just switch back
      setIsEditing(false);
      alert("Änderungen gespeichert!");
    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern");
    }
  };

  // ---------------------------------------
  // HELPER: Label für Value finden
  // ---------------------------------------
  const getDisplayValue = (fieldName: string, value: any) => {
    if (!definition) return value;
    const field = definition.find((f) => f.name === fieldName);
    if (!field) return value;

    if (field.type === "select" || field.type === "multiselect") {
      // Options can be strings or objects {value, label}
      if (!field.options) return value;
      const option = field.options.find(o =>
        (typeof o === 'string' ? o : o.value) === value
      );
      if (option) {
        return typeof option === 'string' ? option : option.label;
      }
    }

    // Date formatting
    if (field.type === "date" && value) {
      return new Date(value).toLocaleDateString("de-DE");
    }

    return value;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Lade Anfrage...
      </div>
    );
  }

  if (!data || !definition) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Anfrage nicht gefunden.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        width: "100%",
        padding: "24px",
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

      {/* BIG BOX AROUND EVERYTHING */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "hidden", // Ensure header/footer radius respects container
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        }}
      >
        {/* HEADER SECTION */}
        <div
          style={{
            padding: "30px 40px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/anfrage"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                Anfrage #{data.anfrage_id}
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "4px 0 0 0",
                }}
              >
                {isEditing ? "Daten bearbeiten" : "Details der Anfrage anzeigen"}
              </p>
            </div>
          </div>

          {/* EDIT BUTTON (Only in View Mode) */}
          {!isEditing && (
            <button
              onClick={() => {
                // Snapshot current data before editing so Cancel can restore
                if (data) {
                  setOriginalData({ ...data });
                }
                setIsEditing(true);
              }}
              style={{
                backgroundColor: "white",
                border: "1px solid #d1d5db",
                color: "#374151",
                borderRadius: "6px",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
                e.currentTarget.style.borderColor = "#c6cdd5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              <PencilSquareIcon className="h-4 w-4" />
              Bearbeiten
            </button>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div style={{ padding: "40px", backgroundColor: "#fff" }}>

          {/* VIEW MODE */}
          {!isEditing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {definition.map((field) => (
                <div key={field.name} className="flex flex-col border-b border-gray-100 pb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {field.label}
                  </span>
                  <span className="text-gray-900 font-medium text-lg">
                    {getDisplayValue(field.name, data[field.name]) || "—"}
                  </span>
                </div>
              ))}

              {/* Additional Info not in form fields but in API */}
              <div className="flex flex-col border-b border-gray-100 pb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Bearbeitet von
                </span>
                <span className="text-gray-900 font-medium text-lg">
                  {data.mitarbeiterin_display || "—"}
                </span>
              </div>
            </div>
          )}

          {/* EDIT MODE */}
          {isEditing && (
            <div className="max-w-2xl mx-auto">
              <DynamicForm
                definition={definition}
                values={data}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />

              {/* Cancel Button */}
              <button
                onClick={() => {
                  // Restore original data to discard unsaved changes
                  if (originalData) {
                    setData({ ...originalData });
                  }
                  setIsEditing(false);
                }}
                className="w-full mt-3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Abbrechen
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}