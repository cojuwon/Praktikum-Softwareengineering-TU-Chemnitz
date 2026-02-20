import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { apiFetch } from "@/lib/api";

export default function SystemSettingsTab() {
    const [retentionDays, setRetentionDays] = useState<number | string>(30);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = () => {
        setLoading(true);
        apiFetch("/api/system-settings/")
            .then(res => {
                if (res.ok) return res.json();
                throw new Error("Fehler beim Laden");
            })
            .then(data => {
                if (data && data.length > 0) {
                    setRetentionDays(data[0].trash_retention_days);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleSave = () => {
        setSaving(true);
        setMessage(null);
        apiFetch("/api/system-settings/update_settings/", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ trash_retention_days: Number(retentionDays) })
        })
            .then(res => {
                if (res.ok) {
                    setMessage({ type: 'success', text: 'Einstellungen gespeichert' });
                    return res.json();
                }
                throw new Error("Fehler beim Speichern");
            })
            .then(data => {
                setRetentionDays(data.trash_retention_days);
            })
            .catch(err => {
                setMessage({ type: 'error', text: 'Fehler beim Speichern' });
            })
            .finally(() => setSaving(false));
    };

    return (
        <div className="p-6">
            <div className="max-w-3xl">
                <div className="space-y-8">

                    {/* Trash Retention Setting */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Papierkorb & Datenhaltung</h3>

                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold text-gray-900 mb-1">
                                        Aufbewahrungsfrist
                                    </label>
                                    <p className="text-sm text-gray-500">
                                        Tage, bis gelöschte Objekte endgültig entfernt werden.
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={retentionDays}
                                            onChange={(e) => setRetentionDays(e.target.value)}
                                            className="block w-24 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 pl-3 pr-8"
                                            placeholder="30"
                                            min="1"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                                            Tage
                                        </span>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        disabled={saving || loading}
                                        className="px-4 py-2 bg-[#42446F] text-white rounded-lg text-sm font-medium hover:bg-[#36384d] disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
                                    >
                                        <Save size={16} />
                                        <span>{saving ? '...' : 'Speichern'}</span>
                                    </button>
                                </div>
                            </div>

                            {message && (
                                <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-green-500" /> : <div className="w-2 h-2 rounded-full bg-red-500" />}
                                    {message.text}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Future sections can be added here with the same pattern */}

                </div>
            </div>
        </div>
    );
}
