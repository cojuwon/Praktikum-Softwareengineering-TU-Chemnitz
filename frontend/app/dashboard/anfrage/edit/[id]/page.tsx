"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import { BeratungsterminForm, Termin } from "@/components/form/BeratungsterminForm";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

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
    apiFetch(`/api/fall/${id}`)
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
      const res = await apiFetch(`/api/fall/${id}`, {
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
            Anfrage bearbeiten #{id}
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
            }}
          >
            Bearbeiten Sie die Falldaten
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
          {loading && <p style={{ textAlign: "center" }}>Fall wird geladen…</p>}

          {!loading && !definition && (
            <p style={{ textAlign: "center" }}>Keine Felder definiert.</p>
          )}

          {!loading && definition && (
            <>
              {/* Dynamische Fall-Felder */}
              <DynamicForm
                definition={definition}
                values={values}
                onChange={handleChange}
              />

              <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

              <button
                onClick={handleSubmit}
                style={{
                  width: "100%",
                  backgroundColor: "transparent",
                  color: "#131313",
                  border: "3px solid #A0A8CD",
                  borderRadius: "8px",
                  padding: "10px 16px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: "pointer",
                  marginTop: "20px",
                }}
              >
                Speichern
              </button>
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