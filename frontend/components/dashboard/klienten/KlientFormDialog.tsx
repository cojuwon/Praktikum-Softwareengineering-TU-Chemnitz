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

    useEffect(() => {
        if (open) {
            if (klientToEdit) {
                setFormData(klientToEdit);
            } else {
                setFormData({
                    klient_rolle: 'B',
                    klient_pseudonym: '',
                    klient_wohnort: 'LS', // Default Leipzig Stadt
                    klient_geschlechtsidentitaet: 'K',
                    klient_sexualitaet: 'K',
                    klient_schwerbehinderung: 'KA',
                    klient_migrationshintergrund: 'KA'
                });
            }
            setError(null);
        }
    }, [open, klientToEdit]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = klientToEdit
                ? `/api/klienten/${klientToEdit.klient_id}/`
                : '/api/klienten/';

            const method = klientToEdit ? 'PATCH' : 'POST';

            const res = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                try {
                    const data = await res.json();
                    // Handle Django validation errors
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

    // Explicitly define footer content for the Modal
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
                onClick={handleSubmit} // Trigger submit from footer button
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

                {/* IMPORTANT WARNING */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                    <div className="text-sm text-amber-800">
                        <p className="font-semibold mb-1">Anonymität wahren!</p>
                        <p>Bitte geben Sie <strong>keine Klarnamen</strong> ein. Verwenden Sie stattdessen Pseudonyme oder Codes, die keine Rückschlüsse auf die reale Person zulassen.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pseudonym / Code</label>
                        <input
                            name="klient_pseudonym"
                            value={formData.klient_pseudonym || ''}
                            onChange={handleChange}
                            placeholder="z.B. Klient_XY_2024"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional. Falls leer, wird nur die ID verwendet.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rolle *</label>
                        <select
                            name="klient_rolle"
                            value={formData.klient_rolle || 'B'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            required
                        >
                            <option value="B">Betroffene:r</option>
                            <option value="A">Angehörige:r</option>
                            <option value="F">Fachkraft</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Wohnort</label>
                        <select
                            name="klient_wohnort"
                            value={formData.klient_wohnort || 'LS'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="LS">Leipzig Stadt</option>
                            <option value="LL">Leipzig Land</option>
                            <option value="NS">Nordsachsen</option>
                            <option value="S">Sachsen (Andere)</option>
                            <option value="D">Deutschland (Andere)</option>
                            <option value="A">Ausland</option>
                            <option value="K">keine Angabe</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alter (Jahre)</label>
                        <input
                            type="number"
                            name="klient_alter"
                            value={formData.klient_alter || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Geschlechtsidentität</label>
                        <select
                            name="klient_geschlechtsidentitaet"
                            value={formData.klient_geschlechtsidentitaet || 'K'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="CW">cis weiblich</option>
                            <option value="CM">cis männlich</option>
                            <option value="TW">trans weiblich</option>
                            <option value="TM">trans männlich</option>
                            <option value="TN">trans nicht-binär</option>
                            <option value="I">inter</option>
                            <option value="A">agender</option>
                            <option value="D">divers</option>
                            <option value="K">keine Angabe</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sexualität</label>
                        <select
                            name="klient_sexualitaet"
                            value={formData.klient_sexualitaet || 'K'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        >
                            <option value="L">lesbisch</option>
                            <option value="S">schwul</option>
                            <option value="B">bisexuell</option>
                            <option value="AX">asexuell</option>
                            <option value="H">heterosexuell</option>
                            <option value="K">keine Angabe</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Staatsangehörigkeit</label>
                        <input
                            type="text"
                            name="klient_staatsangehoerigkeit"
                            value={formData.klient_staatsangehoerigkeit || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}
