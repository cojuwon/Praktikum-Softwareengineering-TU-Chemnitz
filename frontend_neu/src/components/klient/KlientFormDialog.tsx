'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
} from 'lucide-react';
import { z } from 'zod';

/**
 * Zod Schema für Klient:in-Formular
 * Basierend auf dem KlientIn-Model aus backend/api/models.py
 */
const klientFormSchema = z.object({
  klient_rolle: z.enum(['B', 'A', 'F'], {
    errorMap: () => ({ message: 'Bitte wählen Sie eine Rolle aus' }),
  }),
  klient_alter: z.number().min(0).max(200).nullable().optional(),
  klient_geschlechtsidentitaet: z.enum(
    ['CW', 'CM', 'TW', 'TM', 'TN', 'I', 'A', 'D', 'K'],
    { errorMap: () => ({ message: 'Bitte wählen Sie eine Geschlechtsidentität aus' }) }
  ),
  klient_sexualitaet: z.enum(['L', 'S', 'B', 'AX', 'H', 'K'], {
    errorMap: () => ({ message: 'Bitte wählen Sie eine Sexualität aus' }),
  }),
  klient_wohnort: z.enum(['LS', 'LL', 'NS', 'S', 'D', 'A', 'K'], {
    errorMap: () => ({ message: 'Bitte wählen Sie einen Wohnort aus' }),
  }),
  klient_staatsangehoerigkeit: z.string().max(100),
  klient_beruf: z.string().max(255),
  klient_schwerbehinderung: z.enum(['J', 'N', 'KA'], {
    errorMap: () => ({ message: 'Bitte wählen Sie aus' }),
  }),
  klient_schwerbehinderung_detail: z.string().max(500).optional().default(''),
  klient_kontaktpunkt: z.string().max(255),
  klient_dolmetschungsstunden: z.number().min(0).int().default(0),
  klient_dolmetschungssprachen: z.string().max(255).optional().default(''),
  klient_notizen: z.string().max(5000).optional().default(''),
});

type KlientFormData = z.infer<typeof klientFormSchema>;

interface KlientFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const KLIENT_ROLLE_CHOICES = [
  { value: 'B', label: 'Betroffene:r' },
  { value: 'A', label: 'Angehörige:r' },
  { value: 'F', label: 'Fachkraft' },
];

const KLIENT_GESCHLECHT_CHOICES = [
  { value: 'CW', label: 'cis weiblich' },
  { value: 'CM', label: 'cis männlich' },
  { value: 'TW', label: 'trans weiblich' },
  { value: 'TM', label: 'trans männlich' },
  { value: 'TN', label: 'trans nicht-binär' },
  { value: 'I', label: 'inter' },
  { value: 'A', label: 'agender' },
  { value: 'D', label: 'divers' },
  { value: 'K', label: 'keine Angabe' },
];

const KLIENT_SEXUALITAET_CHOICES = [
  { value: 'L', label: 'lesbisch' },
  { value: 'S', label: 'schwul' },
  { value: 'B', label: 'bisexuell' },
  { value: 'AX', label: 'asexuell' },
  { value: 'H', label: 'heterosexuell' },
  { value: 'K', label: 'keine Angabe' },
];

const KLIENT_WOHNORT_CHOICES = [
  { value: 'LS', label: 'Leipzig Stadt' },
  { value: 'LL', label: 'Leipzig Land' },
  { value: 'NS', label: 'Nordsachsen' },
  { value: 'S', label: 'Sachsen (Andere)' },
  { value: 'D', label: 'Deutschland (Andere)' },
  { value: 'A', label: 'Ausland' },
  { value: 'K', label: 'keine Angabe' },
];

const JA_NEIN_KA_CHOICES = [
  { value: 'J', label: 'Ja' },
  { value: 'N', label: 'Nein' },
  { value: 'KA', label: 'keine Angabe' },
];

/**
 * Dialog-Formular zum Erstellen einer neuen Klient:in
 * 
 * Felder:
 * - Rolle (Pflichtfeld)
 * - Alter (optional)
 * - Geschlechtsidentität (Pflichtfeld)
 * - Sexualität (Pflichtfeld)
 * - Wohnort (Pflichtfeld)
 * - Staatsangehörigkeit (Pflichtfeld)
 * - Beruf (Pflichtfeld)
 * - Schwerbehinderung (Pflichtfeld)
 * - Detail Schwerbehinderung (optional, abhängig von Schwerbehinderung)
 * - Kontaktpunkt (Pflichtfeld)
 * - Dolmetschungsstunden (optional)
 * - Dolmetschungssprachen (optional)
 * - Notizen (optional)
 */
export function KlientFormDialog({ isOpen, onClose, onSuccess }: KlientFormDialogProps) {
  const [formData, setFormData] = useState<Partial<KlientFormData>>({
    klient_rolle: 'B',
    klient_alter: undefined,
    klient_geschlechtsidentitaet: 'CW',
    klient_sexualitaet: 'H',
    klient_wohnort: 'LS',
    klient_staatsangehoerigkeit: '',
    klient_beruf: '',
    klient_schwerbehinderung: 'N',
    klient_schwerbehinderung_detail: '',
    klient_kontaktpunkt: '',
    klient_dolmetschungsstunden: 0,
    klient_dolmetschungssprachen: '',
    klient_notizen: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClose = () => {
    setFormData({
      klient_rolle: 'B',
      klient_alter: undefined,
      klient_geschlechtsidentitaet: 'CW',
      klient_sexualitaet: 'H',
      klient_wohnort: 'LS',
      klient_staatsangehoerigkeit: '',
      klient_beruf: '',
      klient_schwerbehinderung: 'N',
      klient_schwerbehinderung_detail: '',
      klient_kontaktpunkt: '',
      klient_dolmetschungsstunden: 0,
      klient_dolmetschungssprachen: '',
      klient_notizen: '',
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
    const { name, value, type } = e.target;
    let parsedValue: any = value;

    // Parse number fields
    if (type === 'number') {
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
      const validated = klientFormSchema.parse(formData);

      // Vorerst nur in Konsole ausgeben
      console.log('✅ Klient:in-Formular erfolgreich validiert:', validated);

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
        console.error('Fehler beim Erstellen der Klient:in:', err);
        setError(
          'Die Klient:in konnte nicht erstellt werden. Bitte versuchen Sie es erneut.'
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
      title="Neue Klient:in erfassen"
      description="Erfassen Sie die Grundinformationen der neuen Klient:in."
      size="2xl"
    >
      <div className="p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-300">
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
              Klient:in erfolgreich erstellt!
            </h3>
            <p className="text-gray-500 text-center max-w-md text-lg">
              Die neuen Daten wurden gespeichert.
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

            {/* Section: Persönliche Informationen */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Persönliche Informationen
              </h3>

              {/* Rolle */}
              <div>
                <label
                  htmlFor="klient_rolle"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rolle *
                </label>
                <select
                  id="klient_rolle"
                  name="klient_rolle"
                  value={formData.klient_rolle || 'B'}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.klient_rolle
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  {KLIENT_ROLLE_CHOICES.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
                {errors.klient_rolle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.klient_rolle}
                  </p>
                )}
              </div>

              {/* Alter */}
              <div>
                <label
                  htmlFor="klient_alter"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alter (Jahre)
                </label>
                <input
                  id="klient_alter"
                  type="number"
                  name="klient_alter"
                  value={formData.klient_alter || ''}
                  onChange={handleChange}
                  min="0"
                  max="200"
                  placeholder="z.B. 35"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.klient_alter && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.klient_alter}
                  </p>
                )}
              </div>

              {/* Geschlechtsidentität und Sexualität nebeneinander */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="klient_geschlechtsidentitaet"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Geschlechtsidentität *
                  </label>
                  <select
                    id="klient_geschlechtsidentitaet"
                    name="klient_geschlechtsidentitaet"
                    value={formData.klient_geschlechtsidentitaet || 'CW'}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.klient_geschlechtsidentitaet
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {KLIENT_GESCHLECHT_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  {errors.klient_geschlechtsidentitaet && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.klient_geschlechtsidentitaet}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="klient_sexualitaet"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Sexualität *
                  </label>
                  <select
                    id="klient_sexualitaet"
                    name="klient_sexualitaet"
                    value={formData.klient_sexualitaet || 'H'}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.klient_sexualitaet
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {KLIENT_SEXUALITAET_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  {errors.klient_sexualitaet && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.klient_sexualitaet}
                    </p>
                  )}
                </div>
              </div>

              {/* Wohnort und Staatsangehörigkeit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="klient_wohnort"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Wohnort *
                  </label>
                  <select
                    id="klient_wohnort"
                    name="klient_wohnort"
                    value={formData.klient_wohnort || 'LS'}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.klient_wohnort
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {KLIENT_WOHNORT_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                  {errors.klient_wohnort && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.klient_wohnort}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="klient_staatsangehoerigkeit"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Staatsangehörigkeit *
                  </label>
                  <input
                    id="klient_staatsangehoerigkeit"
                    type="text"
                    name="klient_staatsangehoerigkeit"
                    value={formData.klient_staatsangehoerigkeit || ''}
                    onChange={handleChange}
                    placeholder="z.B. Deutsch"
                    maxLength={100}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                      errors.klient_staatsangehoerigkeit
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.klient_staatsangehoerigkeit && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.klient_staatsangehoerigkeit}
                    </p>
                  )}
                </div>
              </div>

              {/* Beruf */}
              <div>
                <label
                  htmlFor="klient_beruf"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Beruf *
                </label>
                <input
                  id="klient_beruf"
                  type="text"
                  name="klient_beruf"
                  value={formData.klient_beruf || ''}
                  onChange={handleChange}
                  placeholder="z.B. Softwaren-Entwickler:in"
                  maxLength={255}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.klient_beruf
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.klient_beruf && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.klient_beruf}
                  </p>
                )}
              </div>
            </section>

            {/* Section: Behinderung & Zugang */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Behinderung & Zugang
              </h3>

              {/* Schwerbehinderung */}
              <div>
                <label
                  htmlFor="klient_schwerbehinderung"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Schwerbehinderung *
                </label>
                <select
                  id="klient_schwerbehinderung"
                  name="klient_schwerbehinderung"
                  value={formData.klient_schwerbehinderung || 'N'}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.klient_schwerbehinderung
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  {JA_NEIN_KA_CHOICES.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
                {errors.klient_schwerbehinderung && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.klient_schwerbehinderung}
                  </p>
                )}
              </div>

              {/* Detail Schwerbehinderung (conditional) */}
              {formData.klient_schwerbehinderung === 'J' && (
                <div>
                  <label
                    htmlFor="klient_schwerbehinderung_detail"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Form/Grad der Behinderung
                  </label>
                  <textarea
                    id="klient_schwerbehinderung_detail"
                    name="klient_schwerbehinderung_detail"
                    value={formData.klient_schwerbehinderung_detail || ''}
                    onChange={handleChange}
                    placeholder="z.B. Mobilitätsbehinderung, Grad 50"
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              {/* Kontaktpunkt */}
              <div>
                <label
                  htmlFor="klient_kontaktpunkt"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Kontaktpunkt (Quelle) *
                </label>
                <input
                  id="klient_kontaktpunkt"
                  type="text"
                  name="klient_kontaktpunkt"
                  value={formData.klient_kontaktpunkt || ''}
                  onChange={handleChange}
                  placeholder="z.B. Polizei, Freund:in, Online-Recherche"
                  maxLength={255}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${
                    errors.klient_kontaktpunkt
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                />
                {errors.klient_kontaktpunkt && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.klient_kontaktpunkt}
                  </p>
                )}
              </div>

              {/* Dolmetschungsstunden und Sprachen nebeneinander */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="klient_dolmetschungsstunden"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Dolmetschungsstunden
                  </label>
                  <input
                    id="klient_dolmetschungsstunden"
                    type="number"
                    name="klient_dolmetschungsstunden"
                    value={formData.klient_dolmetschungsstunden || 0}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="klient_dolmetschungssprachen"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Dolmetschungssprachen
                  </label>
                  <input
                    id="klient_dolmetschungssprachen"
                    type="text"
                    name="klient_dolmetschungssprachen"
                    value={formData.klient_dolmetschungssprachen || ''}
                    onChange={handleChange}
                    placeholder="z.B. Arabisch, Russisch"
                    maxLength={255}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Section: Notizen */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Zusätzliche Informationen
              </h3>

              <div>
                <label
                  htmlFor="klient_notizen"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Notizen
                </label>
                <textarea
                  id="klient_notizen"
                  name="klient_notizen"
                  value={formData.klient_notizen || ''}
                  onChange={handleChange}
                  placeholder="Zusätzliche Notizen..."
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
                    'Klient:in erstellen'
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
