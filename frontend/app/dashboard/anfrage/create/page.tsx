"use client";

import { FieldDefinition } from "@/components/form/DynamicForm";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import AnfrageCreateHeader from "@/components/dashboard/anfrage/create/AnfrageCreateHeader";
import AnfrageCreateForm from "@/components/dashboard/anfrage/create/AnfrageCreateForm";

export default function AnfrageCreatePage() {
  const [form, setForm] = useState<Record<string, any>>({});
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; missingFields: string[]; onConfirm: () => void } | null>(null);
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; type: 'success' | 'error'; message: string; onClose?: () => void } | null>(null);

  /** FELDER LADEN */
  useEffect(() => {
    apiFetch("/api/anfragen/form-fields")
      .then(res => {
        if (res.status === 401) throw new Error('Session abgelaufen');
        return res.json();
      })
      .then(json => {
        setFormDefinition(json.fields);

        // Initialize form state for required fields to avoid "undefined" issues
        const initialForm: Record<string, any> = {};
        json.fields.forEach((field: FieldDefinition) => {
          // For text/textarea/select, init with empty string
          // For multiselect/checkbox (if added later), init with []
          // This ensures controlled inputs don't start as uncontrolled (undefined)
          initialForm[field.name] = (field.type === 'multiselect') ? [] : "";
        });
        setForm(initialForm);

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

  /** FORM SUBMISSION LOGIC */
  const executeSubmit = async () => {
    try {
      const response = await apiFetch("/api/anfragen/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error(`Fehler: ${response.status}`);

      const result = await response.json();
      console.log("Anfrage gespeichert:", result);

      setFeedbackModal({
        isOpen: true,
        type: 'success',
        message: "Anfrage erfolgreich gespeichert!",
        onClose: () => {
          // Optional: redirect logic here
          // window.location.href = "/dashboard/anfrage";
        }
      });
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      setFeedbackModal({
        isOpen: true,
        type: 'error',
        message: "Fehler beim Speichern der Anfrage."
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
    <div className="max-w-5xl mx-auto w-full px-6">
      <AnfrageCreateHeader />

      <div className="bg-white rounded-b-xl overflow-hidden shadow-sm">
        <AnfrageCreateForm
          loading={loading}
          formDefinition={formDefinition}
          values={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>

      {/* CONFIRM MODAL */}
      {confirmModal && (
        <Modal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal(null)}
          title="Unvollständige Anfrage"
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
            Möchten Sie die Anfrage trotzdem speichern? Sie wird als unvollständig markiert.
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