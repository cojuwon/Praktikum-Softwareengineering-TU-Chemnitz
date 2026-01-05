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
      case 'T': return <Phone className="w-4 h-4" />;
      case 'E': return <Mail className="w-4 h-4" />;
      case 'P': return <User className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Neue Anfrage erfassen"
      description="Dokumentieren Sie die eingehende Anfrage mit allen relevanten Details."
      size="xl"
    >
      {success ? (
        // Success Message
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-green-200">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Anfrage erfolgreich erstellt!
          </h3>
          <p className="text-gray-500 text-center max-w-md">
            Die Anfrage wurde gespeichert und Ihnen zugewiesen.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 whitespace-pre-line">{error}</div>
            </div>
          )}

          {/* Section: Anfrage-Informationen */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-5 border border-primary-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Anfrage-Informationen</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Wie (Anfrageweg) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    Wie wurde angefragt? <span className="text-red-500">*</span>
                  </span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(ANFRAGE_WEG_CHOICES).map(([code, label]) => (
                    <label 
                      key={code}
                      className={`
                        relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                        ${formData.anfrage_weg === code 
                          ? 'border-primary-500 bg-primary-50 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
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
                        p-2 rounded-lg transition-colors
                        ${formData.anfrage_weg === code ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}
                      `}>
                        {getWegIcon(code)}
                      </div>
                      <span className={`font-medium ${formData.anfrage_weg === code ? 'text-primary-700' : 'text-gray-700'}`}>
                        {label}
                      </span>
                      {formData.anfrage_weg === code && (
                        <CheckCircle2 className="w-4 h-4 text-primary-600 absolute top-2 right-2" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Datum der Anfrage */}
              <div>
                <label htmlFor="anfrage_datum" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Datum der Anfrage
                  </span>
                </label>
                <input
                  type="date"
                  id="anfrage_datum"
                  name="anfrage_datum"
                  value={formData.anfrage_datum}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-shadow hover:shadow"
                />
              </div>

              {/* Anfrage aus (Ort) */}
              <div>
                <label htmlFor="anfrage_ort" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Anfrage aus <span className="text-red-500">*</span>
                  </span>
                </label>
                <select
                  id="anfrage_ort"
                  name="anfrage_ort"
                  value={formData.anfrage_ort}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-shadow hover:shadow appearance-none cursor-pointer"
                  required
                >
                  {Object.entries(ANFRAGE_HERKUNFT_CHOICES).map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Anfragende Person */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Wer hat angefragt?</h3>
            </div>

            <div>
              <label htmlFor="anfrage_person" className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Anfragende Person <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                id="anfrage_person"
                name="anfrage_person"
                value={formData.anfrage_person}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white shadow-sm transition-shadow hover:shadow appearance-none cursor-pointer"
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
              <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Wählen Sie die Rolle der anfragenden Person aus.
              </p>
            </div>
          </div>

          {/* Section: Art der Anfrage */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <HelpCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Art der Anfrage</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Worum geht es bei der Anfrage? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(ANFRAGE_ART_CHOICES).map(([code, label]) => (
                  <label 
                    key={code}
                    className={`
                      relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                      ${formData.anfrage_art === code 
                        ? 'border-amber-500 bg-amber-50 shadow-sm' 
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <input
                      type="radio"
                      name="anfrage_art"
                      value={code}
                      checked={formData.anfrage_art === code}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className={`font-medium text-sm ${formData.anfrage_art === code ? 'text-amber-700' : 'text-gray-700'}`}>
                      {label}
                    </span>
                    {formData.anfrage_art === code && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600 absolute top-2 right-2" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Termin */}
          <div className={`rounded-xl p-5 border transition-all ${
            formData.termin_vergeben 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg shadow-sm ${formData.termin_vergeben ? 'bg-green-100' : 'bg-white'}`}>
                  <CalendarCheck className={`w-5 h-5 ${formData.termin_vergeben ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <h3 className="font-semibold text-gray-900">Terminvergabe</h3>
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
                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                <span className="ms-3 text-sm font-medium text-gray-700">
                  {formData.termin_vergeben ? 'Ja' : 'Nein'}
                </span>
              </label>
            </div>

            {/* Conditional Termin-Felder */}
            {formData.termin_vergeben && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 pt-4 border-t border-green-200 animate-fadeIn">
                {/* Datum des Termins */}
                <div>
                  <label htmlFor="termin_datum" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      Datum des Termins <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    id="termin_datum"
                    name="termin_datum"
                    value={formData.termin_datum}
                    onChange={handleChange}
                    min={formData.anfrage_datum}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-shadow hover:shadow"
                    required={formData.termin_vergeben}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Wann findet der Beratungstermin statt?
                  </p>
                </div>

                {/* Ort des Termins */}
                <div>
                  <label htmlFor="termin_ort" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-green-500" />
                      Ort des Termins <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <select
                    id="termin_ort"
                    name="termin_ort"
                    value={formData.termin_ort}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm transition-shadow hover:shadow appearance-none cursor-pointer"
                    required={formData.termin_vergeben}
                  >
                    {Object.entries(BERATUNGSSTELLE_CHOICES).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Wo findet der Beratungstermin statt?
                  </p>
                </div>

                {/* Info-Box für Statistik */}
                <div className="md:col-span-2 p-3 bg-green-100/50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Statistik-Hinweis:</strong> Die Wartezeit zwischen Anfrage und Termin wird automatisch 
                      für die statistische Auswertung berechnet.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer mit Buttons */}
          <DialogFooter>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Anfrage erstellen
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
