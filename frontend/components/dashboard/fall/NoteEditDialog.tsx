import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { getLabel, CONSULTATION_TYPE_CHOICES } from "@/lib/constants";

interface NoteEditDialogProps {
    fallId: string;
    note: any;
    appointments: any[];
    onClose: () => void;
    onSuccess: () => void;
}

export default function NoteEditDialog({ fallId, note, appointments, onClose, onSuccess }: NoteEditDialogProps) {
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState(note.content || {});
    const [datum, setDatum] = useState(note.datum ? new Date(note.datum).toISOString().slice(0, 16) : "");
    const [linkedAppointmentId, setLinkedAppointmentId] = useState<string>(note.beratungstermin || "");

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/fall-notizen/${note.notiz_id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fall: fallId, // Usually required by serializer even if not changing
                    content: content,
                    datum: datum,
                    beratungstermin: linkedAppointmentId || null
                })
            });

            if (!res.ok) throw new Error("Update failed");

            onSuccess();
            onClose();
        } catch (e: any) {
            console.error(e);
            alert("Fehler beim Speichern: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Möchten Sie diese Notiz wirklich löschen?")) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/api/fall-notizen/${note.notiz_id}/`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Delete failed");

            onSuccess();
            onClose();
        } catch (e: any) {
            console.error(e);
            alert("Fehler beim Löschen: " + e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
                    <h3 className="font-semibold text-slate-800">Notiz bearbeiten</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 space-y-4 overflow-y-auto">

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Datum</label>
                            <input
                                type="datetime-local"
                                className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={datum}
                                onChange={(e) => setDatum(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Verknüpfter Termin</label>
                            <select
                                className="w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={linkedAppointmentId}
                                onChange={(e) => setLinkedAppointmentId(e.target.value)}
                            >
                                <option value="">-- Kein Termin --</option>
                                {appointments.map((apt: any) => (
                                    <option key={apt.beratungs_id} value={apt.beratungs_id}>
                                        {new Date(apt.termin_beratung).toLocaleString()} ({apt.beratungsart_display || getLabel(CONSULTATION_TYPE_CHOICES, apt.beratungsart)})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Inhalt</label>
                        <RichTextEditor
                            content={content}
                            onChange={setContent}
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                    <button
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                        <TrashIcon className="w-4 h-4" /> Löschen
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                            Abbrechen
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-sm transition-colors disabled:opacity-50"
                        >
                            {loading ? "Speichern..." : "Speichern"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
