'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Briefcase,
} from 'lucide-react';
import { z } from 'zod';

/**
 * Zod Schema für Fall-Formular
 * Basierend auf dem Fall-Model aus backend/api/models.py
 */
const fallFormSchema = z.object({
  klient_id: z.number().int().min(1, 'Bitte wählen Sie eine Klient:in aus'),
  status: z.enum(['O', 'L', 'A', 'G'], {
    errorMap: () => ({ message: 'Bitte wählen Sie einen Status aus' }),
  }).optional().default('O'),
  startdatum: z.string().date('Bitte geben Sie ein gültiges Datum ein'),
  notizen: z.string().max(5000).optional().default(''),
});

type FallFormData = z.infer<typeof fallFormSchema>;

interface KlientOption {
  id: number;
  label: string;
}

interface FallFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  klientenListe: KlientOption[];
  onSuccess?: () => void;
}

const STATUS_CHOICES = [
  { value: 'O', label: 'Offen' },
  { value: 'L', label: 'Laufend' },
  { value: 'A', label: 'Abgeschlossen' },
  { value: 'G', label: 'Gelöscht' },
];

/**
 * Dialog-Formular zum Erstellen eines neuen Falls
 * 
 * Felder:
 * - Klient:in (Dropdown, Pflichtfeld)
 * - Status (Optional, Standard: "Offen")
 * - Startdatum (Pflichtfeld, Standard: Heute)
 * - Notizen (Optional)
 */
export function FallFormDialog({
  isOpen,
  onClose,
  klientenListe,
  onSuccess,
}: FallFormDialogProps) {
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<FallFormData>>({
    klient_id: undefined,
    status: 'O',
    startdatum: today,
    notizen: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setFormData({
      klient_id: undefined,
      status: 'O',
      startdatum: today,
      notizen: '',
    });
    setErrors({});
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let parsedValue: any = value;

    // Parse klient_id as number
    if (name === 'klient_id') {
      parsedValue = value ? parseInt(value, 10) : undefined;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors({});

    try {
      // Zod Validierung
      const validated = fallFormSchema.parse(formData);

      // Vorerst nur in Konsole ausgeben
      console.log('✅ Fall-Formular erfolgreich validiert:', validated);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          const path = error.path.join('.');
          fieldErrors[path] = error.message;
        });
        setErrors(fieldErrors);
        setError('Bitte füllen Sie alle erforderlichen Felder korrekt aus.');
      } else {
        console.error('Fehler beim Erstellen des Falls:', err);
        setError(
          'Der Fall konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Neuen Fall erfassen"
      description="Erstellen Sie einen neuen Fall für eine Klient:in."
      size="xl"
    >
      <div className="p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
              Fall erfolgreich erstellt!
            </h3>
            <p className="text-gray-500 text-center max-w-md text-lg">
              Der neue Fall wurde gespeichert.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{error}</div>
              </div>
            )}

            {/* Section: Fall-Informationen */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Fall-Informationen
              </h3>

              {/* Klient:in (Dropdown) */}
              <div>
                <label
                  htmlFor="klient_id"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Klient:in *
                </label>
                <select
                  id="klient_id"
                  name="klient_id"
                  value={formData.klient_id || ''}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.klient_id
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Bitte wählen --</option>
                  {klientenListe.map((klient) => (
                    <option key={klient.id} value={klient.id}>
                      {klient.label}
                    </option>
                  ))}
                </select>
                {errors.klient_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.klient_id}
                  </p>
                )}
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status || 'O'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {STATUS_CHOICES.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Startdatum */}
              <div>
                <label
                  htmlFor="startdatum"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Startdatum *
                </label>
                <input
                  id="startdatum"
                  type="date"
                  name="startdatum"
                  value={formData.startdatum || today}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.startdatum
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.startdatum && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startdatum}
                  </p>
                )}
              </div>
            </section>

            {/* Section: Notizen */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Zusätzliche Informationen
              </h3>

              <div>
                <label
                  htmlFor="notizen"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notizen
                </label>
                <textarea
                  id="notizen"
                  name="notizen"
                  value={formData.notizen || ''}
                  onChange={handleChange}
                  placeholder="Ergänzende Informationen zum Fall..."
                  maxLength={5000}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </section>

            {/* Submit Button */}
            <DialogFooter>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Wird gespeichert...
                    </>
                  ) : (
                    'Fall erstellen'
                  )}
                </button>
              </div>
            </DialogFooter>
          </form>
        )}
      </div>
    </Dialog>
  );
}
