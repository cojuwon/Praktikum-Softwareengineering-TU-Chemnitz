import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface AppointmentDialogProps {
    fallId: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AppointmentDialog({ fallId, onClose, onSuccess }: AppointmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        termin_beratung: "", // datetime-local string
        beratungsstelle: "LS", // default
        beratungsart: "P",     // default
        dauer: 60,
        status: "g",           // geplant
        notizen_beratung: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await apiFetch("/api/beratungstermine/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    fall: fallId,
                    // Ensure proper datetime format if needed, but standard input value often works
                })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(JSON.stringify(err));
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            alert("Fehler beim Erstellen: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
                    <h3 className="font-semibold text-slate-800">Neuen Termin planen</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">

                    {/* Datum & Zeit */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Datum & Uhrzeit</label>
                        <input
                            type="datetime-local"
                            required
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={formData.termin_beratung}
                            onChange={e => setFormData({ ...formData, termin_beratung: e.target.value })}
                        />
                    </div>

                    {/* Art & Stelle */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Art</label>
                            <select
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.beratungsart}
                                onChange={e => setFormData({ ...formData, beratungsart: e.target.value })}
                            >
                                <option value="P">Persönlich</option>
                                <option value="V">Video</option>
                                <option value="T">Telefon</option>
                                <option value="A">Aufsuchend</option>
                                <option value="S">Schriftlich</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Stelle</label>
                            <select
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.beratungsstelle}
                                onChange={e => setFormData({ ...formData, beratungsstelle: e.target.value })}
                            >
                                <option value="LS">Leipzig Stadt</option>
                                <option value="LL">Leipzig Land</option>
                                <option value="NS">Nordsachsen</option>
                            </select>
                        </div>
                    </div>

                    {/* Dauer */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Dauer (Minuten)</label>
                        <input
                            type="number"
                            min="0"
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            value={formData.dauer}
                            onChange={e => setFormData({ ...formData, dauer: parseInt(e.target.value) })}
                        />
                    </div>

                    {/* Notizen */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Notizen (Optional)</label>
                        <textarea
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                            rows={3}
                            value={formData.notizen_beratung}
                            onChange={e => setFormData({ ...formData, notizen_beratung: e.target.value })}
                        />
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? "Speichern..." : "Termin erstellen"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
