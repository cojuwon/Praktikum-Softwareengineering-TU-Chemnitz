import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
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
            <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <Settings size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Systemkonfiguration</h2>
                        <p className="text-sm text-gray-500">Allgemeine Einstellungen für die Anwendung</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-6">

                        {/* Trash Retention Setting */}
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-2">Papierkorb & Datenhaltung</h3>
                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Aufbewahrungsfrist Papierkorb (Tage)
                                </label>
                                <div className="flex gap-2 max-w-xs">
                                    <input
                                        type="number"
                                        value={retentionDays}
                                        onChange={(e) => setRetentionDays(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="30"
                                        min="1"
                                    />
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || loading}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        <Save size={16} />
                                        <span>{saving ? '...' : 'Speichern'}</span>
                                    </button>
                                </div>
                                {message && (
                                    <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {message.text}
                                    </p>
                                )}
                                <p className="mt-2 text-xs text-gray-500">
                                    Objekte im Papierkorb (Fälle, Anfragen) werden nach Ablauf dieser Frist automatisch endgültig gelöscht.
                                    Setzen Sie den Wert mit Bedacht.
                                </p>
                            </div>
                        </div>

                        {/* Placeholder for future settings */}
                        {/* 
            <div className="pt-6 border-t border-gray-100">
               ...
            </div> 
            */}

                    </div>
                </div>
            </div>
        </div>
    );
}
