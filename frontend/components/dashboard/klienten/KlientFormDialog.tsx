'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import Modal from '@/components/ui/Modal';

interface KlientFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    klientToEdit?: any; // Replace with proper type if available
}

export default function KlientFormDialog({ open, onOpenChange, onSuccess, klientToEdit }: KlientFormDialogProps) {
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldDefinitions, setFieldDefinitions] = useState<any[]>([]);

    useEffect(() => {
        // Fetch field definitions
        apiFetch('/api/klienten/form-fields/')
            .then(res => res.json())
            .then(data => {
                if (data.fields) {
                    setFieldDefinitions(data.fields);
                }
            })
            .catch(err => console.error("Failed to load form fields", err));
    }, []);

    useEffect(() => {
        if (open) {
            if (klientToEdit) {
                // Merge extra_fields into formData for flat access
                const flattenedData = { ...klientToEdit, ...klientToEdit.extra_fields };
                setFormData(flattenedData);
            } else {
                // Initialize default values based on definitions
                const initialData: any = {};
                fieldDefinitions.forEach(field => {
                    initialData[field.name] = field.default_value || '';
                    // Specific defaults for hardcoded fields if needed, 
                    // but the backend form-fields endpoint should provide defaults if we want them.
                    // Overriding specific ones:
                    if (field.name === 'klient_rolle') initialData[field.name] = 'B';
                    if (field.name === 'klient_wohnort') initialData[field.name] = 'LS';
                    if (field.name === 'klient_geschlechtsidentitaet') initialData[field.name] = 'K';
                    if (field.name === 'klient_sexualitaet') initialData[field.name] = 'K';
                    if (field.name === 'klient_schwerbehinderung') initialData[field.name] = 'KA';
                    if (field.name === 'klient_migrationshintergrund') initialData[field.name] = 'KA';
                });
                setFormData(initialData);
            }
            setError(null);
        }
    }, [open, klientToEdit, fieldDefinitions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Seperate static fields from extra_fields
            const payload: any = { ...formData };
            const staticFieldNames = [
                'klient_pseudonym', 'klient_rolle', 'klient_wohnort', 'klient_alter',
                'klient_geschlechtsidentitaet', 'klient_sexualitaet', 'klient_staatsangehoerigkeit',
                'klient_beruf', 'klient_kontaktpunkt', 'klient_schwerbehinderung', 'klient_migrationshintergrund',
                'klient_schwerbehinderung_detail', 'klient_dolmetschungssprachen',
                'klient_notizen', 'klient_id', 'erstellt_am' // Add other model fields if they exist as inputs
            ];

            const extraFields: any = {};
            Object.keys(formData).forEach(key => {
                // key might be 'extra_fields' itself from the initial spread (klientToEdit),
                // we must NOT include it in the new extra_fields object.
                if (!staticFieldNames.includes(key) && key !== 'extra_fields') {
                    extraFields[key] = formData[key];
                    delete payload[key];
                }
            });
            // Also ensure payload doesn't contain 'extra_fields' as a top-level key acting like a field
            // (It will be assigned below as the JSON object)
            delete payload.extra_fields;

            payload.extra_fields = extraFields;

            const url = klientToEdit
                ? `/api/klienten/${klientToEdit.klient_id}/`
                : '/api/klienten/';

            const method = klientToEdit ? 'PATCH' : 'POST';

            const res = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                try {
                    const data = await res.json();
                    if (typeof data === 'object') {
                        setError(Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(', '));
                    } else {
                        throw new Error('Speichern fehlgeschlagen');
                    }
                } catch {
                    throw new Error('Ein unbekannter Fehler ist aufgetreten');
                }
                return;
            }

            onSuccess();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const footerContent = (
        <>
            <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
                Abbrechen
            </button>
            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-[#42446F] text-white rounded-lg hover:bg-[#36384d] transition-colors disabled:opacity-50"
            >
                {loading ? 'Speichern...' : 'Speichern'}
            </button>
        </>
    );

    return (
        <Modal
            isOpen={open}
            onClose={() => onOpenChange(false)}
            title={klientToEdit ? 'Person bearbeiten' : 'Neue Person anlegen'}
            footer={footerContent}
        >
            <form className="space-y-4" onSubmit={handleSubmit} id="klient-form">
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 break-words">
                        {error}
                    </div>
                )}

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Anonymität wahren!</p>
                        <p>Bitte geben Sie <strong>keine Klarnamen</strong> ein. Verwenden Sie stattdessen Pseudonyme oder Codes.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldDefinitions.map((field) => (
                        <div key={field.name} className={field.name === 'klient_pseudonym' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label} {field.required && '*'}
                            </label>

                            {field.typ === 'select' ? (
                                <select
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    required={field.required}
                                >
                                    {field.options?.map((opt: any) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            ) : field.typ === 'textarea' ? (
                                <textarea
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    rows={3}
                                />
                            ) : (
                                <input
                                    type={field.typ === 'number' ? 'number' : 'text'}
                                    name={field.name}
                                    value={formData[field.name] || ''}
                                    onChange={handleChange}
                                    required={field.required}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder={field.name === 'klient_pseudonym' ? 'z.B. Klient_XY_2024' : ''}
                                />
                            )}

                            {field.name === 'klient_pseudonym' && (
                                <p className="text-xs text-gray-500 mt-1">Optional. Falls leer, wird nur die ID verwendet.</p>
                            )}
                        </div>
                    ))}
                </div>
            </form>
        </Modal>
    );
}
