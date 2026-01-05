'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import { apiClient } from '@/lib/api-client';
import { 
  AnfrageCreatePayload,
  STANDORT_CHOICES,
  ANFRAGE_ART_CHOICES,
  ANFRAGE_PERSON_CHOICES,
  StandortCode,
  AnfrageArtCode,
  AnfragePersonCode
} from '@/types/anfrage';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AnfrageFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Dialog-Formular zum Erstellen einer neuen Anfrage
 * 
 * Felder:
 * - anfrage_weg: Freitext (Pflicht)
 * - anfrage_datum: Datum (optional, default: heute)
 * - anfrage_ort: Select (Pflicht)
 * - anfrage_person: Select (Pflicht)
 * - anfrage_art: Select (Pflicht)
 * 
 * Backend: POST /api/anfragen/
 */
export function AnfrageFormDialog({ isOpen, onClose, onSuccess }: AnfrageFormDialogProps) {
  // Form State
  const [formData, setFormData] = useState<AnfrageCreatePayload>({
    anfrage_weg: '',
    anfrage_datum: new Date().toISOString().split('T')[0], // Heute als Default
    anfrage_ort: 'K' as StandortCode, // Default: keine Angabe
    anfrage_person: 'B' as AnfragePersonCode, // Default: Betroffene:r
    anfrage_art: 'B' as AnfrageArtCode, // Default: Beratungsbedarf
  });
  
  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset Form
  const resetForm = () => {
    setFormData({
      anfrage_weg: '',
      anfrage_datum: new Date().toISOString().split('T')[0],
      anfrage_ort: 'K' as StandortCode,
      anfrage_person: 'B' as AnfragePersonCode,
      anfrage_art: 'B' as AnfrageArtCode,
    });
    setError(null);
    setSuccess(false);
  };

  // Handle Close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error on change
  };

  // Handle Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.anfrage_weg.trim()) {
      setError('Bitte geben Sie den Anfrageweg an.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiClient.post('/anfragen/', formData);
      setSuccess(true);
      
      // Nach kurzer Verzögerung schließen und Callback aufrufen
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      console.error('Fehler beim Erstellen der Anfrage:', err);
      
      // Error-Handling
      const axiosError = err as { response?: { data?: Record<string, unknown> | string } };
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        if (typeof data === 'object') {
          // Field-specific errors
          const messages = Object.entries(data)
            .map(([field, msgs]) => {
              const fieldLabel = getFieldLabel(field);
              const msgStr = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
              return `${fieldLabel}: ${msgStr}`;
            })
            .join('\n');
          setError(messages || 'Ein Fehler ist aufgetreten.');
        } else {
          setError(String(data));
        }
      } else {
        setError('Die Anfrage konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper: Get readable field label
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      anfrage_weg: 'Anfrageweg',
      anfrage_datum: 'Datum',
      anfrage_ort: 'Ort',
      anfrage_person: 'Person',
      anfrage_art: 'Art',
    };
    return labels[field] || field;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Neue Anfrage erstellen"
      description="Erfassen Sie die Details der neuen Anfrage."
      size="lg"
    >
      {success ? (
        // Success Message
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Anfrage erfolgreich erstellt!
          </h3>
          <p className="text-gray-500 text-center">
            Die Anfrage wurde gespeichert und Ihnen zugewiesen.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Anfrageweg */}
            <div className="md:col-span-2">
              <label htmlFor="anfrage_weg" className="block text-sm font-medium text-gray-700 mb-1">
                Anfrageweg <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="anfrage_weg"
                name="anfrage_weg"
                value={formData.anfrage_weg}
                onChange={handleChange}
                placeholder="z.B. Telefon, E-Mail, persönlich..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Wie wurde die Anfrage gestellt?
              </p>
            </div>

            {/* Datum */}
            <div>
              <label htmlFor="anfrage_datum" className="block text-sm font-medium text-gray-700 mb-1">
                Datum
              </label>
              <input
                type="date"
                id="anfrage_datum"
                name="anfrage_datum"
                value={formData.anfrage_datum}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Ort */}
            <div>
              <label htmlFor="anfrage_ort" className="block text-sm font-medium text-gray-700 mb-1">
                Ort <span className="text-red-500">*</span>
              </label>
              <select
                id="anfrage_ort"
                name="anfrage_ort"
                value={formData.anfrage_ort}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {Object.entries(STANDORT_CHOICES).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            {/* Person */}
            <div>
              <label htmlFor="anfrage_person" className="block text-sm font-medium text-gray-700 mb-1">
                Person <span className="text-red-500">*</span>
              </label>
              <select
                id="anfrage_person"
                name="anfrage_person"
                value={formData.anfrage_person}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {Object.entries(ANFRAGE_PERSON_CHOICES).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Wer stellt die Anfrage?
              </p>
            </div>

            {/* Art */}
            <div>
              <label htmlFor="anfrage_art" className="block text-sm font-medium text-gray-700 mb-1">
                Art <span className="text-red-500">*</span>
              </label>
              <select
                id="anfrage_art"
                name="anfrage_art"
                value={formData.anfrage_art}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {Object.entries(ANFRAGE_ART_CHOICES).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Art der Anfrage
              </p>
            </div>
          </div>

          {/* Footer mit Buttons */}
          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                'Anfrage erstellen'
              )}
            </button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}

export default AnfrageFormDialog;
