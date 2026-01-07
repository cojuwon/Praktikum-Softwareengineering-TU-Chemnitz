"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import { BeratungsterminForm, Termin } from "@/components/form/BeratungsterminForm";

export default function FallEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [definition, setDefinition] = useState<FieldDefinition[] | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [termin, setTermin] = useState<Termin>({ datum: "", art: "telefon", notiz: "" });

  // ---------------------------------------
  // 1. FALL + FELDDEFINITION LADEN
  // ---------------------------------------
  useEffect(() => {
    fetch(`/api/fall/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setDefinition(json.fields);
        setValues(json.values);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden:", err);
        setLoading(false);
      });
  }, [id]);

  // ---------------------------------------
  // 2. FELDÄNDERUNG
  // ---------------------------------------
  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // ---------------------------------------
  // 3. SPEICHERN (Dynamische Felder + Termin)
  // ---------------------------------------
  const handleSubmit = async () => {
    if (!definition) return;

    // Pflichtfelder prüfen
    const missing = definition.filter(
      (f) =>
        f.required &&
        (values[f.name] === undefined ||
          values[f.name] === "" ||
          (Array.isArray(values[f.name]) && values[f.name].length === 0))
    );

    if (missing.length > 0) {
      const ok = window.confirm(
        "Es fehlen folgende Pflichtfelder:\n\n" +
          missing.map((f) => `• ${f.label}`).join("\n") +
          "\n\nTrotzdem speichern?"
      );

      if (!ok) return;
    }

    // Backend-Aufruf
    try {
      const res = await fetch(`/api/fall/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          neueBeratung: termin,
        }),
      });

      if (!res.ok) throw new Error();

      alert("Fall gespeichert");
      router.push("/dashboard/fall/edit");

    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern");
    }
  };

  if (loading) return <p>Fall wird geladen…</p>;
  if (!definition) return <p>Keine Felder definiert.</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Fall bearbeiten #{id}</h1>

      {/* Dynamische Fall-Felder */}
      <DynamicForm
        definition={definition}
        values={values}
        onChange={handleChange}
      />

      <hr className="my-6" />

      {/* Statische Komponente für neuen Beratungstermin */}
      <BeratungsterminForm
        initial={termin}
        onChange={(updatedTermin) => setTermin(updatedTermin)}
      />

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleSubmit}
      >
        Speichern
      </button>
    </div>
  );
}