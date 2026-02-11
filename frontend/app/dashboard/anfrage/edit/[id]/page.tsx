"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FieldDefinition } from "@/components/form/DynamicForm";
import { apiFetch } from "@/lib/api";
import AnfrageDetailHeader from "@/components/dashboard/anfrage/detail/AnfrageDetailHeader";
import AnfrageDetailView from "@/components/dashboard/anfrage/detail/AnfrageDetailView";
import AnfrageDetailEdit from "@/components/dashboard/anfrage/detail/AnfrageDetailEdit";

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
    <div className="max-w-5xl mx-auto w-full px-6">
      <AnfrageDetailHeader
        anfrageId={data.anfrage_id}
        isEditing={isEditing}
        onEdit={() => {
          if (data) {
            setOriginalData({ ...data });
          }
          setIsEditing(true);
        }}
      />

      <div className="bg-white rounded-b-xl overflow-hidden shadow-sm">
        <div className="px-10 py-10">
          {!isEditing && (
            <AnfrageDetailView
              data={data}
              definition={definition}
              getDisplayValue={getDisplayValue}
            />
          )}

          {isEditing && (
            <AnfrageDetailEdit
              definition={definition}
              values={data}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={() => {
                if (originalData) {
                  setData({ ...originalData });
                }
                setIsEditing(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}