import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api"; // Adjust import path as needed
import {
    TAETER_BEZIEHUNG_CHOICES,
    TAETER_GESCHLECHT_CHOICES,
    ANZEIGE_CHOICES,
    LOCATION_CHOICES,
    YES_NO_KA_CHOICES
} from "@/lib/constants";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CrimeDialogProps {
    fallId: string;
    crime?: any; // If set, we are editing
    onClose: () => void;
    onSuccess: () => void;
}

// Simple mapped helper for select options
const renderOptions = (choices: Record<string, string>) => {
    return Object.entries(choices).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
    ));
};

export default function CrimeDialog({ fallId, crime, onClose, onSuccess }: CrimeDialogProps) {
    const isEditing = !!crime;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        tat_datum: new Date().toISOString().slice(0, 10), // Date only usually
        tat_ort: "LS", // Default Leipzig Stadt?
        plz_tatort: "",
        tat_art: "",
        tat_taeter_beziehung: "K",
        tat_taeter_geschlecht: "K",
        tat_anzeige: "K",
        tat_spurensicherung: "KA",
        tat_mitbetroffene_kinder: 0,
        tat_direktbetroffene_kinder: 0,
        tat_notizen: "",
    });

    useEffect(() => {
        if (crime) {
            setFormData({
                tat_datum: crime.tat_datum || "",
                tat_ort: crime.tat_ort || "LS",
                plz_tatort: crime.plz_tatort || "",
                tat_art: crime.tat_art || "",
                tat_taeter_beziehung: crime.tat_taeter_beziehung || "K",
                tat_taeter_geschlecht: crime.tat_taeter_geschlecht || "K",
                tat_anzeige: crime.tat_anzeige || "K",
                tat_spurensicherung: crime.tat_spurensicherung || "KA",
                tat_mitbetroffene_kinder: crime.tat_mitbetroffene_kinder || 0,
                tat_direktbetroffene_kinder: crime.tat_direktbetroffene_kinder || 0,
                tat_notizen: crime.tat_notizen || "", // Assuming this field exists on serializer
            });
        }
    }, [crime]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = isEditing
                ? `/api/gewalttaten/${crime.tat_id}/`
                : `/api/gewalttaten/`;

            const method = isEditing ? "PUT" : "POST";

            // If creating, we might need to link it to the Fall/Klient differently.
            // Since there is no "create assigned" endpoint directly in standard nested routers usually,
            // we will create it and then assign it, or send `fall` ID if the serializer supports it.
            // Let's assume serializer supports writing `fall`.
            // However, usually we need `klient` too.
            // We need to fetch the Fall to know the client OR just pass 'fall' and let backend handle it?
            // The Gewalttat model has `klient` required usually.
            // Let's check if we can pass `fall` and backend sets `klient` in perform_create? 
            // Or we check `Fall` object prop passed down? `fallId` is passed.
            // We'll try passing `fall: fallId`. The backend uses `tat.klient != fall.klient` checks,
            // so we likely need to provide correct data.
            // 
            // Better approach: Use the `assign_tat` logic? That takes an EXISTING ID.
            // So we Create, then Assign? 
            // Or just create using `fall` field if backend allows.

            // NOTE: Gewalttat needs a Klient. We assume the backend serializer for POST 
            // might require `klient`. 
            // Let's first try sending `fall` and see if `GewalttatViewSet` or serializer handles it.
            // If the standard `GewalttatSerializer` requires `klient`, we need to load the fall first to get client ID
            // OR the parent component passes client ID.
            // For now, let's try to fetch the fall details briefly or assume parent passes data?
            // To be safe, we might need to fetch the Fall in this component if we don't have client ID.
            // But let's assume valid fields for now.
            //
            // Hack: We will try to send `fall: parseInt(fallId)` and hope backend infers client or we need to add client.
            // It's safer to POST to `/api/gewalttaten/` with `fall: fallId`.
            // But wait, `Gewalttat` usually requires `klient`.
            // Let's try to just send what we have.

            // To make this robust, we should probably modify `GewalttatViewSet` perform_create to set 
            // klient from fall if fall is provided? Or frontend must provide Klient.
            // We will TRY sending `fall` and see. If it fails, we know why.

            // WAIT: We can use the existing `assign_tat` on FallViewSet?
            // 1. Create Gewalttat (needs Klient).
            // 2. Assign to Fall.

            // Let's try to fetch the Fall to get the Klient ID, or pass it in Props.
            // Since we don't have it in props, let's fetch it quickly or assume we modify the backend 
            // to allow creating via Fall context.
            //
            // Let's try sending payload with `fall: fallId`.

            const payload: any = { ...formData };
            if (!isEditing) {
                payload.fall = parseInt(fallId);
                // We MUST provide `klient` if the model says so.
                // We'll rely on the `FallEditPage` passing it? It doesn't right now.
                // We'll do a quick fetch of the Fall if we are creating and need Klient ID?
                // OR we update `FallEditPage` to pass `klientId`.
            }

            // We need to fetch the fall to get the client ID for creation
            if (!isEditing) {
                const fallRes = await apiFetch(`/api/faelle/${fallId}/`);
                if (fallRes.ok) {
                    const fallData = await fallRes.json();
                    payload.klient = fallData.klient; // ID
                }
            }

            const res = await apiFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || JSON.stringify(errData) || "Speichern fehlgeschlagen");
            }

            onSuccess();
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white">
                    <h2 className="text-xl font-semibold">
                        {isEditing ? "Gewalttat bearbeiten" : "Neue Gewalttat erfassen"}
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
                        <XMarkIcon className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Datum */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Datum</label>
                            <input
                                type="date"
                                className="w-full rounded-md border-slate-300"
                                value={formData.tat_datum}
                                onChange={e => setFormData({ ...formData, tat_datum: e.target.value })}
                                required
                            />
                        </div>

                        {/* Ort */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Tatort (Region)</label>
                            <select
                                className="w-full rounded-md border-slate-300"
                                value={formData.tat_ort}
                                onChange={e => setFormData({ ...formData, tat_ort: e.target.value })}
                            >
                                {renderOptions(LOCATION_CHOICES)}
                            </select>
                        </div>

                        {/* PLZ */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">PLZ Tatort</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-slate-300"
                                value={formData.plz_tatort}
                                onChange={e => setFormData({ ...formData, plz_tatort: e.target.value })}
                                maxLength={5}
                            />
                        </div>

                        {/* Kind of dummy spacer or second col for Tatart below */}
                    </div>

                    {/* Tatart */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Art der Gewalt (Mehrfachauswahl möglich - Freitext/Kommagetrennt)
                        </label>
                        <textarea
                            className="w-full rounded-md border-slate-300"
                            rows={2}
                            value={formData.tat_art}
                            onChange={e => setFormData({ ...formData, tat_art: e.target.value })}
                            placeholder="z.B. Körperverletzung, psychische Gewalt..."
                        />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                        <h4 className="font-medium text-slate-900 border-b pb-2">Täter:in & Beziehung</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Beziehung zum Opfer</label>
                                <select
                                    className="w-full rounded-md border-slate-300"
                                    value={formData.tat_taeter_beziehung}
                                    onChange={e => setFormData({ ...formData, tat_taeter_beziehung: e.target.value })}
                                >
                                    {renderOptions(TAETER_BEZIEHUNG_CHOICES)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Täter-Geschlecht</label>
                                <select
                                    className="w-full rounded-md border-slate-300"
                                    value={formData.tat_taeter_geschlecht}
                                    onChange={e => setFormData({ ...formData, tat_taeter_geschlecht: e.target.value })}
                                >
                                    {renderOptions(TAETER_GESCHLECHT_CHOICES)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Kinder */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mitbetroffene Kinder (Gesamt)</label>
                            <input
                                type="number"
                                className="w-full rounded-md border-slate-300"
                                value={formData.tat_mitbetroffene_kinder}
                                onChange={e => setFormData({ ...formData, tat_mitbetroffene_kinder: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Davon direkt betroffen</label>
                            <input
                                type="number"
                                className="w-full rounded-md border-slate-300"
                                value={formData.tat_direktbetroffene_kinder}
                                onChange={e => setFormData({ ...formData, tat_direktbetroffene_kinder: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Anzeige */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Anzeige erstattet?</label>
                            <select
                                className="w-full rounded-md border-slate-300"
                                value={formData.tat_anzeige}
                                onChange={e => setFormData({ ...formData, tat_anzeige: e.target.value })}
                            >
                                {renderOptions(ANZEIGE_CHOICES)}
                            </select>
                        </div>
                        {/* Spurensicherung */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">VSS?</label>
                            <select
                                className="w-full rounded-md border-slate-300"
                                value={formData.tat_spurensicherung}
                                onChange={e => setFormData({ ...formData, tat_spurensicherung: e.target.value })}
                            >
                                {renderOptions(YES_NO_KA_CHOICES)}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                        >
                            Abbrechen
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Speichern..." : "Speichern"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
