'use client';

import { useState, FormEvent, useEffect, useCallback } from 'react';
import { Dialog, DialogFooter } from '@/components/ui/Dialog';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Briefcase,
  UserPlus
} from 'lucide-react';
import { z } from 'zod';
import apiClient from '@/lib/api-client';
import {
  klientFormSchema,
  KlientFormData,
  KLIENT_ROLLE_CHOICES,
  KLIENT_GESCHLECHT_CHOICES,
  KLIENT_WOHNORT_CHOICES
} from '@/components/klient/KlientFormDialog';
import { ClientFilterToolbar, ClientFilters, ClientColumnVisibility } from '@/components/klient/ClientFilterToolbar';

// --- SCHEMA & TYPES ---

const fallFormSchema = z.object({
  klient_id: z.number().int().min(1, 'Bitte wählen Sie eine Klient:in aus'),
  status: z.enum(['O', 'L', 'A', 'G']).optional().default('O'),
  startdatum: z.string().date('Bitte geben Sie ein gültiges Datum ein'),
  notizen: z.string().max(5000).optional().default(''),
});

type FallFormData = z.infer<typeof fallFormSchema>;

interface KlientOption {
  id: number;
  label: string;
  raw?: any; // To access full details
}

interface FallFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // We keep this prop but we might fetch internally for search
  klientenListe?: KlientOption[];
  onSuccess?: () => void;
}

const STATUS_CHOICES = [
  { value: 'O', label: 'Offen' },
  { value: 'L', label: 'Laufend' },
  { value: 'A', label: 'Abgeschlossen' },
  { value: 'G', label: 'Gelöscht' },
];

export function FallFormDialog({
  isOpen,
  onClose,
  onSuccess,
}: FallFormDialogProps) {
  const today = new Date().toISOString().split('T')[0];

  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');

  // Fall State
  const [fallData, setFallData] = useState<Partial<FallFormData>>({
    status: 'O',
    startdatum: today,
    notizen: '',
  });

  // Client Search State
  const [foundClients, setFoundClients] = useState<KlientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<KlientOption | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Filter State
  const [clientFilters, setClientFilters] = useState<ClientFilters>({});
  const [columnVisibility, setColumnVisibility] = useState<ClientColumnVisibility>({
    role: true,
    age: true,
    gender: true,
    job: true,
    nationality: false, // hidden by default to save space
    residence: false,
    created: true
  });

  // New Client Form State
  const [newClientData, setNewClientData] = useState<Partial<KlientFormData>>({
    klient_rolle: 'B',
    klient_geschlechtsidentitaet: 'CW',
    klient_sexualitaet: 'H',
    klient_wohnort: 'LS',
    klient_schwerbehinderung: 'N',
    klient_dolmetschungsstunden: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- METHODS ---

  const resetForm = () => {
    setFallData({ status: 'O', startdatum: today, notizen: '' });
    setNewClientData({
      klient_rolle: 'B',
      klient_geschlechtsidentitaet: 'CW',
      klient_sexualitaet: 'H',
      klient_wohnort: 'LS',
      klient_schwerbehinderung: 'N',
      klient_dolmetschungsstunden: 0,
    });
    setClientFilters({});
    setSelectedClient(null);
    setErrors({});
    setError(null);
    setSuccess(false);
    setActiveTab('existing');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Search logic
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchClients = useCallback(async (filters: ClientFilters = {}) => {
    setIsSearching(true);
    try {
      // Build query params
      const params: Record<string, any> = {};

      if (filters.search) params.search = filters.search;
      if (filters.klient_rolle) params.klient_rolle = filters.klient_rolle;
      if (filters.klient_geschlechtsidentitaet) params.klient_geschlechtsidentitaet = filters.klient_geschlechtsidentitaet;
      if (filters.klient_alter_gte) params.klient_alter__gte = filters.klient_alter_gte;
      if (filters.klient_alter_lte) params.klient_alter__lte = filters.klient_alter_lte;
      if (filters.klient_beruf) params.klient_beruf__icontains = filters.klient_beruf; // fuzzy
      if (filters.klient_staatsangehoerigkeit) params.klient_staatsangehoerigkeit__icontains = filters.klient_staatsangehoerigkeit;
      if (filters.klient_wohnort) params.klient_wohnort = filters.klient_wohnort;

      const response = await apiClient.get('/klienten/', { params });
      const data = response.data.results || response.data; // Handle pagination

      const mapped = data.map((k: any) => ({
        id: k.klient_id,
        label: `${k.klient_code || 'Klient #' + k.klient_id} - ${k.klient_vorname || ''} ${k.klient_nachname || ''}`.trim() || `Klient #${k.klient_id}`, // Fallback
        // Store raw data for display
        raw: k
      }));
      setFoundClients(mapped.slice(0, 50)); // Limit results
    } catch (err) {
      console.error("Search failed", err);
      // Fallback or empty list
      setFoundClients([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Effect to load initial list or debounce search
  useEffect(() => {
    if (isOpen && activeTab === 'existing') {
      // Initial load or filter update
      // Debounce only text search if needed, but for now we debounce everything slightly
      const timer = setTimeout(() => {
        searchClients(clientFilters);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, clientFilters, searchClients]);


  const handleFallChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFallData({ ...fallData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? (value ? parseInt(value) : undefined) : value;
    setNewClientData({ ...newClientData, [name]: val });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setErrors({});

    try {
      let clientId = selectedClient?.id;

      // Step 1: Create Client if in 'new' tab
      if (activeTab === 'new') {
        const clientValidated = klientFormSchema.parse(newClientData);
        const res = await apiClient.post('/klienten/', clientValidated);
        clientId = res.data.klient_id;
      }

      // Validate that we have a client ID
      if (!clientId) {
        setErrors({ klient_id: 'Bitte wählen Sie eine Klient:in aus.' });
        throw new Error('Kein Klient ausgewählt');
      }

      // Step 2: Create Fall
      const fallPayload = {
        ...fallData,
        klient_id: clientId
      };
      const fallValidated = fallFormSchema.parse(fallPayload);

      await apiClient.post('/faelle/', fallValidated);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        onSuccess?.();
      }, 1500);

    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((error) => {
          const path = error.path.join('.');
          fieldErrors[path] = error.message;
        });
        setErrors(fieldErrors);
        setError('Bitte überprüfen Sie die Eingaben.');
      } else {
        console.error(err);
        setError('Ein Fehler ist aufgetreten.');
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
      description="Wählen Sie eine bestehende Klient:in oder legen Sie eine neue an."
      size="2xl"
    >
      <div className="p-6">
        {success ? (
          <div className="flex flex-col items-center justify-center py-16">
            <CheckCircle2 className="w-16 h-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold">Fall erfolgreich erstellt!</h3>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tabs Toggle */}
            <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'existing' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Vorhandene:r Klient:in
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'new' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Neue:r Klient:in
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-md flex gap-2 items-center text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'existing' ? (
                <div className="space-y-4">

                  {/* NEW FILTER TOOLBAR */}
                  <ClientFilterToolbar
                    onFilterChange={setClientFilters}
                    onVisibilityChange={setColumnVisibility}
                    initialVisibility={columnVisibility}
                  />

                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                    ) : foundClients.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Keine Klient:innen gefunden.</div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {foundClients.map(client => {
                          const k = client.raw || {};
                          // Helper to get label from choices
                          const getLabel = (choices: any[], val: string) => choices.find(c => c.value === val)?.label || val;

                          const rolle = getLabel(KLIENT_ROLLE_CHOICES, k.klient_rolle);
                          const geschlecht = getLabel(KLIENT_GESCHLECHT_CHOICES, k.klient_geschlechtsidentitaet);
                          const alter = k.klient_alter ? `${k.klient_alter} Jahre` : 'k.A.';
                          const beruf = k.klient_beruf || '-';
                          const erstellt = k.erstellt_am ? new Date(k.erstellt_am).toLocaleDateString('de-DE') : '-';
                          const wohnort = getLabel(KLIENT_WOHNORT_CHOICES, k.klient_wohnort);
                          const nationalitaet = k.klient_staatsangehoerigkeit || '-';

                          return (
                            <li
                              key={client.id}
                              className={`p-3 cursor-pointer hover:bg-blue-50 flex justify-between items-start ${selectedClient?.id === client.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                              onClick={() => {
                                setSelectedClient(client);
                                setErrors({ ...errors, klient_id: '' });
                              }}
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  {client.label}
                                  <span className="text-xs font-normal px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                    ID: {k.klient_id}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-500 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                                  {columnVisibility.role && <span><span className="font-medium">Rolle:</span> {rolle}</span>}
                                  {columnVisibility.age && <span><span className="font-medium">Alter:</span> {alter}</span>}
                                  {columnVisibility.gender && <span><span className="font-medium">Geschlecht:</span> {geschlecht}</span>}
                                  {columnVisibility.job && <span><span className="font-medium">Beruf:</span> {beruf}</span>}
                                  {columnVisibility.residence && <span><span className="font-medium">Wohnort:</span> {wohnort}</span>}
                                  {columnVisibility.nationality && <span><span className="font-medium">Nationalität:</span> {nationalitaet}</span>}

                                  {columnVisibility.created && (
                                    <span className="col-span-2 text-xs text-gray-400 mt-1">
                                      Erstellt am: {erstellt}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {selectedClient?.id === client.id && <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                  {errors.klient_id && <p className="text-red-500 text-sm">{errors.klient_id}</p>}
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
                    <h4 className="font-semibold flex items-center gap-2 mb-1">
                      <UserPlus className="w-4 h-4" /> Neue Klient:in wird angelegt
                    </h4>
                    <p>Der Fall wird automatisch mit der neu erstellten Klient:in verknüpft.</p>
                  </div>

                  {/* Short version of Klient Form - focusing on required fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Rolle *</label>
                      <select name="klient_rolle" value={newClientData.klient_rolle} onChange={handleClientChange} className="w-full p-2 border rounded-lg">
                        {KLIENT_ROLLE_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Geschlechtsidentität *</label>
                      <select name="klient_geschlechtsidentitaet" value={newClientData.klient_geschlechtsidentitaet} onChange={handleClientChange} className="w-full p-2 border rounded-lg">
                        {KLIENT_GESCHLECHT_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Wohnort *</label>
                      <select name="klient_wohnort" value={newClientData.klient_wohnort} onChange={handleClientChange} className="w-full p-2 border rounded-lg">
                        {KLIENT_WOHNORT_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Alter</label>
                      <input type="number" name="klient_alter" value={newClientData.klient_alter || ''} onChange={handleClientChange} className="w-full p-2 border rounded-lg" placeholder="z.B. 35" />
                      {errors.klient_alter && <p className="text-red-500 text-xs">{errors.klient_alter}</p>}
                    </div>
                  </div>

                  {/* Additional Required Fields for Klient */}
                  {/* We add just a few critical ones to keep Wizard manageable, or all required ones */}
                  {/* Staatsangehörigkeit */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Staatsangehörigkeit *</label>
                    <input type="text" name="klient_staatsangehoerigkeit" value={newClientData.klient_staatsangehoerigkeit || ''} onChange={handleClientChange} className="w-full p-2 border rounded-lg" />
                    {errors.klient_staatsangehoerigkeit && <p className="text-red-500 text-xs">{errors.klient_staatsangehoerigkeit}</p>}
                  </div>

                  {/* Beruf */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Beruf *</label>
                    <input type="text" name="klient_beruf" value={newClientData.klient_beruf || ''} onChange={handleClientChange} className="w-full p-2 border rounded-lg" />
                    {errors.klient_beruf && <p className="text-red-500 text-xs">{errors.klient_beruf}</p>}
                  </div>

                  {/* Kontaktpunkt */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Kontaktpunkt (Quelle) *</label>
                    <input type="text" name="klient_kontaktpunkt" value={newClientData.klient_kontaktpunkt || ''} onChange={handleClientChange} className="w-full p-2 border rounded-lg" />
                    {errors.klient_kontaktpunkt && <p className="text-red-500 text-xs">{errors.klient_kontaktpunkt}</p>}
                  </div>
                </div>
              )}
            </div>

            <hr className="border-gray-100 my-6" />

            {/* Common Fall Fields */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Briefcase className="w-4 h-4" /> Fall-Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select name="status" value={fallData.status} onChange={handleFallChange} className="w-full p-2 border rounded-lg">
                    {STATUS_CHOICES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Startdatum</label>
                  <input type="date" name="startdatum" value={fallData.startdatum} onChange={handleFallChange} className="w-full p-2 border rounded-lg" />
                  {errors.startdatum && <p className="text-red-500 text-xs">{errors.startdatum}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notizen (Optional)</label>
                <textarea name="notizen" value={fallData.notizen} onChange={handleFallChange} className="w-full p-2 border rounded-lg" rows={2} />
              </div>
            </div>

            <DialogFooter>
              <div className="flex gap-2 justify-end pt-4">
                <button type="button" onClick={handleClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Abbrechen</button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {activeTab === 'new' ? 'Klient:in & Fall erstellen' : 'Fall erstellen'}
                </button>
              </div>
            </DialogFooter>
          </form>
        )}
      </div>
    </Dialog>
  );
}
