"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

type Fall = {
  id: string;
  name: string;
  datum: string;
  beschreibung: string;
  status: string;
};

export default function FallEditPage() {
    const params = useParams();
    const id = params.id;
    const router = useRouter();

  const [fall, setFall] = useState<Fall | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  /** FALL LADEN */
  useEffect(() => {
    fetch(`/api/fall/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setFall(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden des Falls:", err);
        setLoading(false);
      });
  }, [id]);

  /** FELD AKTUALISIEREN */
  const update = (field: string, value: string) => {
    setFall((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  /** Pflichtfelder prüfen */
  const validate = () => {
    const missing = [];

    if (!fall?.name) missing.push("Name");
    if (!fall?.datum) missing.push("Datum");

    setErrors(missing);
    return missing.length === 0;
  };

  /** SPEICHERN */
  const save = async (ignoreErrors = false) => {
    if (!ignoreErrors && !validate()) {
      const confirm = window.confirm(
        "Einige Pflichtfelder fehlen:\n\n" +
          errors.join(", ") +
          "\n\nTrotzdem speichern?"
      );

      if (!confirm) return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/fall/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fall),
      });

      if (!res.ok) throw new Error("Speichern fehlgeschlagen");

      alert("Fall wurde gespeichert.");
      router.push("/dashboard/fall/edit");

    } catch (e) {
      console.error(e);
      alert("Fehler beim Speichern.");
    }

    setSaving(false);
  };

  if (loading) return <p>Fall wird geladen…</p>;
  if (!fall) return <p>Fall nicht gefunden.</p>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h1>Fall bearbeiten #{fall.id}</h1>

      <div>
        <label>Name:</label>
        <input
          type="text"
          value={fall.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div>
        <label>Datum:</label>
        <input
          type="date"
          value={fall.datum}
          onChange={(e) => update("datum", e.target.value)}
        />
      </div>

      <div>
        <label>Beschreibung:</label>
        <textarea
          value={fall.beschreibung}
          onChange={(e) => update("beschreibung", e.target.value)}
        />
      </div>

      <div>
        <label>Status:</label>
        <select
          value={fall.status}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="offen">Offen</option>
          <option value="in_bearbeitung">In Bearbeitung</option>
          <option value="abgeschlossen">Abgeschlossen</option>
        </select>
      </div>

      {errors.length > 0 && (
        <p style={{ color: "red" }}>
          Folgende Pflichtfelder fehlen: {errors.join(", ")}
        </p>
      )}

      <button onClick={() => save()} disabled={saving}>
        {saving ? "Speichere…" : "Speichern"}
      </button>
    </div>
  );
}
