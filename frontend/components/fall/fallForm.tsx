"use client";

import { useState } from "react";
import { createFall, updateFall } from "@/lib/api";
import type { Fall } from "@/lib/definitions";

export default function FallForm({
  existingFall,
}: {
  existingFall?: Fall;
}) {
  const [formData, setFormData] = useState<Fall>(
    existingFall || {
      fall_id: 0,
      klient_id: 0,
      beratungs_id: 0,
      tat_id: 0,
      begleitungs_id: 0,
      user_id: 0,
    }
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    
    // Konvertiere zu Number, aber erlaube auch leere/0 Werte
    const numValue = value === "" ? 0 : Number(value);
    
    // Validiere, dass es eine gültige Zahl ist
    if (isNaN(numValue)) {
      console.warn(`Ungültiger Wert für ${name}: ${value}`);
      return;
    }

    setFormData({
      ...formData,
      [name]: numValue,
    });

    // Clear error wenn User tippt
    if (error) setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validierung: Klient:in ist Pflichtfeld
    if (!formData.klient_id || formData.klient_id === 0) {
      setError("Bitte gib eine Klient:in ID ein");
      return;
    }

    // Validierung: Mitarbeiter:in ist Pflichtfeld
    if (!formData.user_id || formData.user_id === 0) {
      setError("Bitte gib eine Mitarbeiter:in ID ein");
      return;
    }

    setSubmitting(true);

    try {
      if (existingFall) {
        await updateFall(formData);
        alert("Fall erfolgreich aktualisiert!");
      } else {
        await createFall(formData);
        alert("Fall erfolgreich angelegt!");
      }

      window.location.href = "/fall";
    } catch (err) {
      console.error("Fehler beim Speichern des Falls:", err);
      
      // Bessere Fehlermeldung basierend auf dem Error
      if (err instanceof Error) {
        setError(`Fehler: ${err.message}`);
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded shadow"
    >
      <div>
        <label className="block font-medium">Klient:in ID</label>
        <input
          type="number"
          name="klient_id"
          value={formData.klient_id}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block font-medium">Beratung ID</label>
        <input
          type="number"
          name="beratungs_id"
          value={formData.beratungs_id}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block font-medium">Tat ID</label>
        <input
          type="number"
          name="tat_id"
          value={formData.tat_id}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block font-medium">Begleitung ID</label>
        <input
          type="number"
          name="begleitungs_id"
          value={formData.begleitungs_id}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <div>
        <label className="block font-medium">Mitarbeiter:in (user_id)</label>
        <input
          type="number"
          name="user_id"
          value={formData.user_id}
          onChange={handleChange}
          className="border p-2 w-full"
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {existingFall ? "Fall aktualisieren" : "Fall anlegen"}
      </button>
    </form>
  );
}
