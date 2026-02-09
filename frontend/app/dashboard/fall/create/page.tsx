"use client";

import { DynamicForm, FieldDefinition } from "@/components/form/DynamicForm";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Modal from "@/components/ui/Modal";

export default function FallCreatePage() {
  const [form, setForm] = useState<Record<string, any>>({});
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; missingFields: string[]; onConfirm: () => void } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string; onClose?: () => void } | null>(null);

  /** FELDER LADEN */
  useEffect(() => {
    apiFetch("/api/faelle/form-fields/")
      .then(res => {
        if (res.status === 401) throw new Error('Session abgelaufen');
        if (!res.ok) throw new Error(`Fehler beim Laden (${res.status})`);
        return res.json();
      })
      .then(json => {
        if (!json.fields) throw new Error("Keine Felder in Antwort gefunden");
        setFormDefinition(json.fields);

        // Initialize form state for required fields to avoid "undefined" issues
        const initialForm: Record<string, any> = {};
        json.fields.forEach((field: FieldDefinition) => {
          initialForm[field.name] = (field.type === 'multiselect') ? [] : "";
          if ((field as any).default) {
            initialForm[field.name] = (field as any).default;
          }
        });
        setForm(initialForm);

        setLoading(false);
      })
      .catch(err => {
        console.error("Formular konnte nicht geladen werden:", err);
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          message: "Fehler beim Laden der Formular-Felder: " + err.message
        });
        setLoading(false);
      });
  }, []);

  /** FELDÄNDERUNG */
  const handleChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  /** FORM SUBMISSION LOGIC */
  const executeSubmit = async () => {
    try {
      const response = await apiFetch("/api/faelle/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(`Fehler: ${response.status}`);

      const result = await response.json();
      console.log("Fall gespeichert:", result);

      setFeedbackModal({
        isOpen: true,
        type: 'success',
        message: "Fall erfolgreich gespeichert!",
        onClose: () => {
          // Redirect to list
          window.location.href = "/dashboard/fall";
        }
      });
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        message: "Fehler beim Speichern des Falls."
      });
    }
  };

  /** VALIDIERUNG UND INITIIERUNG */
  const handleSubmit = async () => {
    if (!formDefinition) return;

    const missingFields = formDefinition
      .filter(f => f.required)
      .filter(f => {
        const v = form[f.name];
        return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      })
      .map(f => f.label);

    if (missingFields.length > 0) {
      setConfirmModal({
        isOpen: true,
        missingFields,
        onConfirm: () => {
          setConfirmModal(null);
          executeSubmit();
        }
      });
      return;
    }

    // No missing fields, proceed directly
    await executeSubmit();
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
            <Link href="/dashboard/fall" className="text-gray-400 hover:text-gray-600">
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
                Fall anlegen
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  margin: "4px 0 0 0",
                }}
              >
                Erfassen Sie einen neuen Fall im System
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
                onSubmit={handleSubmit}
              />
            </div>
          )}

          {!loading && formDefinition?.length === 0 && (
            <p className="text-center text-gray-500">Keine Felder definiert.</p>
          )}
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          title="Unvollständiger Fall"
          footer={
            <>
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Abbrechen
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Trotzdem speichern
              </button>
            </>
          }
        >
          <p className="mb-4 text-gray-600">
            Es fehlen folgende Pflichtfelder:
          </p>
          <ul className="list-disc list-inside mb-4 text-red-600">
            {confirmModal.missingFields.map((field, idx) => (
              <li key={idx}>{field}</li>
            ))}
          </ul>
          <p className="text-gray-600">
            Möchten Sie den Fall trotzdem speichern?
          </p>
        </Modal>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackModal && (
        <Modal
          isOpen={feedbackModal.isOpen}
          onClose={() => {
            setFeedbackModal(null);
            feedbackModal.onClose?.();
          }}
          title={feedbackModal.type === 'success' ? 'Erfolg' : 'Fehler'}
          footer={
            <button
              onClick={() => {
                setFeedbackModal(null);
                feedbackModal.onClose?.();
              }}
              className={`px-4 py-2 rounded-md text-white font-medium ${feedbackModal.type === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              OK
            </button>
          }
        >
          <div className="flex items-center gap-3">
            {feedbackModal.type === 'success' ? (
              <div className="h-10 w-10 text-green-500 bg-green-100 rounded-full flex items-center justify-center">
                ✓
              </div>
            ) : (
              <div className="h-10 w-10 text-red-500 bg-red-100 rounded-full flex items-center justify-center">
                !
              </div>
            )}
            <p className="text-gray-700 text-lg">
              {feedbackModal.message}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}