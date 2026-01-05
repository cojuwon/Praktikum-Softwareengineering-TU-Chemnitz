'use client';

import { useState, FormEvent } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import { apiClient } from '@/lib/api-client';
import {
  AnfrageCreatePayload,
  ANFRAGE_HERKUNFT_CHOICES,
  ANFRAGE_ART_CHOICES,
  ANFRAGE_WEG_CHOICES,
  BERATUNGSSTELLE_CHOICES,
  StandortCode,
  AnfrageArtCode,
  AnfragePersonCode,
  AnfrageWegCode,
  AnfrageHerkunftCode,
  BeratungsstelleCode,
} from '@/types/anfrage';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  Building2,
  Users,
  HelpCircle,
  CalendarCheck
} from 'lucide-react';

interface AnfrageFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Form-State Interface für bessere Typisierung
interface FormState {
  anfrage_weg: AnfrageWegCode | '';
  anfrage_datum: string;
  anfrage_ort: AnfrageHerkunftCode;
  anfrage_person: AnfragePersonCode;
  anfrage_art: AnfrageArtCode;
  termin_vergeben: boolean;
  termin_datum: string;
  termin_ort: BeratungsstelleCode;
}

/**
 * Dialog-Formular zum Erstellen einer neuen Anfrage
 * 
 * Felder gemäß Anforderung:
 * - Wie (Anfrageweg): Telefon, E-Mail, etc.
 * - Datum der Anfrage
 * - Anfrage aus: Leipzig Stadt / Leipzig Land / Nordsachsen / Sachsen / andere
 * - Wer hat angefragt: Fachkraft / Angehörige:r / Betroffene:r / etc.
 * - Art der Anfrage: medizinische Soforthilfe / Vertrauliche Spurensicherung / etc.
 * - Termin vergeben: ja/nein
 *   - Wenn ja: Datum des Termins, Ort des Termins
 * 
 * Backend: POST /api/anfragen/
 */
export function AnfrageFormDialog({ isOpen, onClose, onSuccess }: AnfrageFormDialogProps) {
  // Form State
  const [formData, setFormData] = useState<FormState>({
    anfrage_weg: '',
    anfrage_datum: new Date().toISOString().split('T')[0],
    anfrage_ort: 'LS' as AnfrageHerkunftCode,
    anfrage_person: 'B' as AnfragePersonCode,
    anfrage_art: 'B' as AnfrageArtCode,
    termin_vergeben: false,
    termin_datum: '',
    termin_ort: 'LS' as BeratungsstelleCode,
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
      anfrage_ort: 'LS' as AnfrageHerkunftCode,
      anfrage_person: 'B' as AnfragePersonCode,
      anfrage_art: 'B' as AnfrageArtCode,
      termin_vergeben: false,
      termin_datum: '',
      termin_ort: 'LS' as BeratungsstelleCode,
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(null);
  };

  // Handle Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.anfrage_weg) {
      setError('Bitte wählen Sie den Anfrageweg aus.');
      return;
    }

    if (formData.termin_vergeben && !formData.termin_datum) {
      setError('Bitte geben Sie das Datum des Termins an.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Payload vorbereiten
      const payload: AnfrageCreatePayload = {
        anfrage_weg: formData.anfrage_weg,
        anfrage_datum: formData.anfrage_datum,
        anfrage_ort: formData.anfrage_ort as StandortCode,
        anfrage_person: formData.anfrage_person,
        anfrage_art: formData.anfrage_art,
      };

      // Wenn Termin vergeben, Beratungstermin-Daten hinzufügen
      if (formData.termin_vergeben && formData.termin_datum) {
        payload.beratungstermin_data = {
          termin_beratung: formData.termin_datum,
          beratungsstelle: formData.termin_ort,
        };
      }

      await apiClient.post('/anfragen/', payload);
      setSuccess(true);

      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);
    } catch (err: unknown) {
      console.error('Fehler beim Erstellen der Anfrage:', err);

      const axiosError = err as { response?: { data?: Record<string, unknown> | string } };
      if (axiosError.response?.data) {
        const data = axiosError.response.data;
        if (typeof data === 'object') {
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
      anfrage_datum: 'Datum der Anfrage',
      anfrage_ort: 'Anfrage aus',
      anfrage_person: 'Wer hat angefragt',
      anfrage_art: 'Art der Anfrage',
      termin_datum: 'Datum des Termins',
      termin_ort: 'Ort des Termins',
    };
    return labels[field] || field;
  };

  // Icon für Anfrageweg
  const getWegIcon = (weg: string) => {
    switch (weg) {
      case 'T': return <Phone className="w-5 h-5" />;
      case 'E': return <Mail className="w-5 h-5" />;
      case 'P': return <User className="w-5 h-5" />;
      default: return <MessageSquare className="w-5 h-5" />;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Neue Anfrage erfassen"
      description="Dokumentieren Sie die eingehende Anfrage."
      size="2xl"
    >
      {success ? (
        // Success Message
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-300">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-8 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
            Anfrage erfolgreich erstellt!
          </h3>
          <p className="text-gray-500 text-center max-w-md text-lg">
            Die Anfrage wurde gespeichert und Ihnen zugewiesen.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-16">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-700 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm font-medium whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Section: Anfrage-Informationen */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-10">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Anfrage-Informationen</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Wie (Anfrageweg) */}
              <div className="md:col-span-2 space-y-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Wie wurde angefragt? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(ANFRAGE_WEG_CHOICES).map(([code, label]) => (
                    <label
                      key={code}
                      className={`
                        relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                        ${formData.anfrage_weg === code
                          ? 'border-blue-500 bg-blue-50/50 shadow-md scale-[1.02]'
                          : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:scale-[1.01]'}
                      `}
                    >
                      <input
                        type="radio"
                        name="anfrage_weg"
                        value={code}
                        checked={formData.anfrage_weg === code}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`
                        p-3 rounded-full transition-colors
                        ${formData.anfrage_weg === code ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 group-hover:text-gray-600'}
                      `}>
                        {getWegIcon(code)}
                      </div>
                      <span className={`text-sm font-medium text-center ${formData.anfrage_weg === code ? 'text-blue-700' : 'text-gray-600'}`}>
                        {label}
                      </span>
                      {formData.anfrage_weg === code && (
                        <div className="absolute top-2 right-2 text-blue-500">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Datum der Anfrage */}
              <div className="space-y-2">
                <label htmlFor="anfrage_datum" className="text-sm font-medium text-gray-700 block">
                  Datum der Anfrage
                </label>
                <div className="relative flex items-center gap-3 px-4 h-14 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    type="date"
                    id="anfrage_datum"
                    name="anfrage_datum"
                    value={formData.anfrage_datum}
                    onChange={handleChange}
                    className="w-full h-full bg-transparent border-none p-0 focus:ring-0 font-medium text-gray-900"
                  />
                </div>
              </div>

              {/* Anfrage aus (Ort) */}
              <div className="space-y-2">
                <label htmlFor="anfrage_ort" className="text-sm font-medium text-gray-700 block">
                  Anfrage aus <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center gap-3 px-4 h-14 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <select
                    id="anfrage_ort"
                    name="anfrage_ort"
                    value={formData.anfrage_ort}
                    onChange={handleChange}
                    className="w-full h-full bg-transparent border-none p-0 focus:ring-0 font-medium text-gray-900 appearance-none cursor-pointer"
                    required
                  >
                    {Object.entries(ANFRAGE_HERKUNFT_CHOICES).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 pointer-events-none border-l pl-3 border-gray-200">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Anfragende Person */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-10">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Wer hat angefragt?</h3>
            </div>

            <div className="space-y-2">
              <label htmlFor="anfrage_person" className="text-sm font-medium text-gray-700 block">
                Anfragende Person <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center gap-3 px-4 h-14 border border-gray-200 rounded-xl bg-gray-50/50 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all">
                <User className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  id="anfrage_person"
                  name="anfrage_person"
                  value={formData.anfrage_person}
                  onChange={handleChange}
                  className="w-full h-full bg-transparent border-none p-0 focus:ring-0 font-medium text-gray-900 appearance-none cursor-pointer"
                  required
                >
                  <optgroup label="Standard">
                    <option value="B">Betroffene:r</option>
                    <option value="A">Angehörige:r</option>
                    <option value="F">Fachkraft</option>
                    <option value="AN">anonym</option>
                  </optgroup>
                  <optgroup label="Queere Anfragen">
                    <option value="qB">queer Betroffene:r</option>
                    <option value="qA">queer Angehörige:r</option>
                    <option value="qF">queer Fachkraft</option>
                    <option value="qAN">queer anonym</option>
                  </optgroup>
                  <optgroup label="Für Betroffene">
                    <option value="FfB">Fachkraft für Betroffene</option>
                    <option value="AfB">Angehörige:r für Betroffene</option>
                    <option value="FFqB">Fachkraft für queere Betroffene</option>
                    <option value="AfqB">Angehörige:r für queere Betroffene</option>
                  </optgroup>
                </select>
                <div className="absolute right-4 pointer-events-none border-l pl-3 border-gray-200">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 pt-2">
                <HelpCircle className="w-4 h-4" />
                <span>Wählen Sie die Rolle der anfragenden Person aus.</span>
              </p>
            </div>
          </section>

          {/* Section: Art der Anfrage */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-10">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Art der Anfrage</h3>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-medium text-gray-700 block">
                Worum geht es bei der Anfrage? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(ANFRAGE_ART_CHOICES).map(([code, label]) => (
                  <label
                    key={code}
                    className={`
                      relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${formData.anfrage_art === code
                        ? 'border-amber-400 bg-amber-50 shadow-sm'
                        : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'}
                    `}
                  >
                    <div className="flex-shrink-0">
                      <input
                        type="radio"
                        name="anfrage_art"
                        value={code}
                        checked={formData.anfrage_art === code}
                        onChange={handleChange}
                        className="w-5 h-5 text-amber-600 border-gray-300 focus:ring-amber-500"
                      />
                    </div>
                    <span className={`font-medium ${formData.anfrage_art === code ? 'text-amber-800' : 'text-gray-700'}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* Section: Termin */}
          <section className={`
            rounded-2xl p-6 border transition-all duration-300
            ${formData.termin_vergeben
              ? 'bg-gradient-to-br from-green-50 to-white border-green-200 shadow-md ring-1 ring-green-100'
              : 'bg-gray-50 border-gray-200 border-dashed'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl transition-colors ${formData.termin_vergeben ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${formData.termin_vergeben ? 'text-gray-900' : 'text-gray-500'}`}>
                    Terminvergabe
                  </h3>
                  <p className="text-sm text-gray-500">
                    Wurde direkt ein Beratungstermin vereinbart?
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="termin_vergeben"
                  checked={formData.termin_vergeben}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-inner hover:bg-gray-300 transition-colors"></div>
              </label>
            </div>

            {/* Conditional Termin-Felder */}
            {formData.termin_vergeben && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6 pt-6 border-t border-green-100 animate-in slide-in-from-top-4 fade-in">
                {/* Datum des Termins */}
                <div className="space-y-2">
                  <label htmlFor="termin_datum" className="text-sm font-medium text-gray-700 block">
                    Datum des Termins <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="termin_datum"
                      name="termin_datum"
                      value={formData.termin_datum}
                      onChange={handleChange}
                      min={formData.anfrage_datum}
                      className="w-full pl-14 pr-4 h-12 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white transition-all font-medium"
                      required={formData.termin_vergeben}
                    />
                    <Clock className="w-5 h-5 text-green-600 absolute left-3.5 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Ort des Termins */}
                <div className="space-y-2">
                  <label htmlFor="termin_ort" className="text-sm font-medium text-gray-700 block">
                    Ort des Termins <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="termin_ort"
                      name="termin_ort"
                      value={formData.termin_ort}
                      onChange={handleChange}
                      className="w-full pl-14 pr-10 h-12 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white appearance-none cursor-pointer transition-all font-medium"
                      required={formData.termin_vergeben}
                    >
                      {Object.entries(BERATUNGSSTELLE_CHOICES).map(([code, label]) => (
                        <option key={code} value={code}>{label}</option>
                      ))}
                    </select>
                    <Building2 className="w-5 h-5 text-green-600 absolute left-3.5 top-3.5 pointer-events-none" />
                    <div className="absolute right-3.5 top-4 pointer-events-none border-l pl-3 border-green-100">
                      <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </div>
                  </div>
                </div>

                {/* Info-Box für Statistik */}
                <div className="md:col-span-2 p-4 bg-green-50 rounded-xl border border-green-100 flex gap-3">
                  <HelpCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 leading-relaxed">
                    <strong>Statistik-Hinweis:</strong> Die Wartezeit zwischen Anfrage und Termin wird automatisch
                    berechnet und in der Statistik erfasst.
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Footer mit Buttons */}
          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 text-base font-bold text-white bg-gray-900 rounded-xl hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-3 transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichere...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Anfrage speichern
                </>
              )}
            </button>
          </DialogFooter>
        </form>
      )}
    </Dialog>
  );
}

export default AnfrageFormDialog;
