import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { XMarkIcon } from "@heroicons/react/24/outline";
import RichTextEditor from "@/components/editor/RichTextEditor";

interface AppointmentDialogProps {
    fallId: string;
    appointment?: any;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AppointmentDialog({ fallId, appointment, onClose, onSuccess }: AppointmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [counselors, setCounselors] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        termin_beratung: appointment?.termin_beratung || "",
        beratungsstelle: appointment?.beratungsstelle || "LS",
        beratungsart: appointment?.beratungsart || "P",
        dauer: appointment?.dauer ?? 60,
        status: appointment?.status || "g",
        dolmetscher_stunden: appointment?.dolmetscher_stunden || 0,
        notizen_beratung: appointment?.notizen_beratung || "",
        berater: appointment?.berater || ""
    });

    useEffect(() => {
        const fetchCounselors = async () => {
            try {
                // Fetch active users
                const res = await apiFetch("/api/konten/?status_mb=A");
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setCounselors(data);
                    else if (data.results) setCounselors(data.results);
                }
            } catch (e) {
                console.error("Failed to fetch counselors", e);
            }
        };
        fetchCounselors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = appointment
                ? `/api/beratungstermine/${appointment.beratungs_id}/`
                : "/api/beratungstermine/";

            const method = appointment ? "PUT" : "POST";

            const res = await apiFetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    fall: fallId,
                    berater: formData.berater || null
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
            alert("Fehler beim Speichern: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <h3 className="font-semibold text-slate-800">
                        {appointment ? "Termin bearbeiten" : "Neuen Termin planen"}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    <form id="appointment-form" onSubmit={handleSubmit} className="space-y-4">

                        <div className="flex gap-4">
                            {/* Datum & Zeit */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Datum & Uhrzeit</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 [color-scheme:light]"
                                    value={formData.termin_beratung}
                                    onChange={e => setFormData({ ...formData, termin_beratung: e.target.value })}
                                />
                            </div>
                            {/* Berater */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Berater:in</label>
                                <select
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.berater}
                                    onChange={e => setFormData({ ...formData, berater: e.target.value })}
                                >
                                    <option value="">-- Keine Auswahl --</option>
                                    {counselors.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.vorname_mb} {c.nachname_mb}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Art & Stelle & Dauer & Dolmetscher */}
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
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dauer (Min)</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.dauer}
                                    onChange={e => setFormData({ ...formData, dauer: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dolmetscher (Stunden)</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.25"
                                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.dolmetscher_stunden}
                                    onChange={e => setFormData({ ...formData, dolmetscher_stunden: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="g">Geplant</option>
                                <option value="s">Durchgeführt</option>
                                <option value="a">Abgesagt</option>
                            </select>
                        </div>

                        {/* Notizen */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Notizen (Optional)</label>
                            <RichTextEditor
                                content={formData.notizen_beratung}
                                onChange={(content) => setFormData({ ...formData, notizen_beratung: content })}
                            />
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="submit"
                        form="appointment-form"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-sm transition-colors disabled:opacity-50"
                    >
                        {loading ? "Speichern..." : (appointment ? "Speichern" : "Termin erstellen")}
                    </button>
                </div>

            </div >
        </div >
    );
}
