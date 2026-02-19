"use client";

import { useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/lib/userContext";
import Modal from "@/components/ui/Modal";
import { MagnifyingGlassIcon, FunnelIcon, TrashIcon, PencilIcon, EyeIcon, CheckIcon } from "@heroicons/react/24/outline";

interface PresetManagerProps {
    onPresetsChanged: () => void;
    // Callback to apply a preset to the parent
    onApplyPreset: (presetId: string) => void;
    presets: any[];
}

export default function PresetManager({ onPresetsChanged, onApplyPreset, presets }: PresetManagerProps) {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    // Filter/Search States
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<'all' | 'mine' | 'shared' | 'global'>('all');

    // Edit/Rename State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    // Preview State
    const [previewId, setPreviewId] = useState<number | null>(null);

    // Feedback
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const isAdmin = user?.permissions?.includes("can_manage_users") || user?.rolle_mb === 'AD';
    const currentUserId = user?.id;

    // Derived filtered list
    const filteredPresets = useMemo(() => {
        return presets.filter(p => {
            // Search
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.ersteller_name && p.ersteller_name.toLowerCase().includes(searchTerm.toLowerCase()));

            // Filter
            let matchesType = true;
            if (filterType === 'mine') matchesType = (p.preset_type === 'user'); // Assuming 'user' means created by me based on previous logic, or check creator ID if available
            if (filterType === 'shared') matchesType = (p.preset_type === 'shared');
            if (filterType === 'global') matchesType = (p.is_global === true);

            return matchesSearch && matchesType;
        });
    }, [presets, searchTerm, filterType]);

    // Actions
    const handleApply = (id: string) => {
        onApplyPreset(id);
        setIsOpen(false);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Möchten Sie dieses Preset wirklich löschen?")) return;
        try {
            const res = await apiFetch(`/api/presets/${id}/`, { method: "DELETE" });
            if (res.ok) {
                onPresetsChanged();
                setFeedback({ type: 'success', message: 'Preset gelöscht.' });
                setTimeout(() => setFeedback(null), 3000);
            } else {
                setFeedback({ type: 'error', message: 'Fehler beim Löschen.' });
            }
        } catch (e) {
            console.error(e);
            setFeedback({ type: 'error', message: 'Serverfehler beim Löschen.' });
        }
    };

    const startEdit = (p: any) => {
        setEditingId(p.id);
        setEditName(p.name);
    };

    const saveEdit = async (id: number) => {
        try {
            const res = await apiFetch(`/api/presets/${id}/update-description/`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ preset_beschreibung: editName }) // Assuming map from name to description based on prior file
            });
            if (res.ok) {
                onPresetsChanged();
                setEditingId(null);
                setFeedback({ type: 'success', message: 'Name aktualisiert.' });
                setTimeout(() => setFeedback(null), 3000);
            } else {
                setFeedback({ type: 'error', message: 'Fehler beim Umbenennen.' });
            }
        } catch (e) {
            setFeedback({ type: 'error', message: 'Serverfehler.' });
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline flex items-center gap-1"
            >
                <FunnelIcon className="w-4 h-4" />
                Vorlagen verwalten & auswählen
            </button>

            {/* Main Manager Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Statistik-Vorlagen"
                footer={
                    <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-100 rounded text-gray-700 hover:bg-gray-200">
                        Schließen
                    </button>
                }
            >
                <div className="flex flex-col h-[60vh]">
                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-4 mb-4 items-center justify-between">
                        <div className="relative flex-1 min-w-[200px]">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Suchen..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 text-sm bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setFilterType('all')}
                                className={`px-3 py-1 rounded-md transition-colors ${filterType === 'all' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                            >Alle</button>
                            <button
                                onClick={() => setFilterType('mine')}
                                className={`px-3 py-1 rounded-md transition-colors ${filterType === 'mine' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                            >Meine</button>
                            <button
                                onClick={() => setFilterType('global')}
                                className={`px-3 py-1 rounded-md transition-colors ${filterType === 'global' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}
                            >Global</button>
                        </div>
                    </div>

                    {/* Feedback Inline */}
                    {feedback && (
                        <div className={`mb-4 p-2 rounded text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                        </div>
                    )}

                    {/* List */}
                    <div className="flex-1 overflow-y-auto border rounded-xl divide-y">
                        {filteredPresets.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Keine Vorlagen gefunden.
                            </div>
                        ) : (
                            filteredPresets.map(preset => (
                                <div key={preset.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {editingId === preset.id ? (
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="border px-2 py-1 rounded text-sm"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => saveEdit(preset.id)} className="text-green-600 hover:bg-green-100 p-1 rounded"><CheckIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-100 p-1 rounded">Abbrechen</button>
                                                </div>
                                            ) : (
                                                <h4 className="font-semibold text-gray-800">{preset.name}</h4>
                                            )}

                                            {/* Badges */}
                                            {preset.is_global && <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">GLOBAL</span>}
                                            {preset.preset_type === 'shared' && <span className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">GETEILT</span>}
                                        </div>

                                        <div className="text-xs text-gray-500 flex gap-4">
                                            <span>Erstellt von: <span className="font-medium text-gray-700">{preset.ersteller_name || "Unbekannt"}</span></span>
                                            <span>{Object.keys(preset.filters || {}).length} aktive Filter</span>
                                        </div>

                                        {/* Preview Section */}
                                        {previewId === preset.id && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg text-xs text-gray-600 border">
                                                <strong>Aktive Filter:</strong>
                                                <ul className="list-disc list-inside mt-1 ml-1 space-y-0.5">
                                                    {Object.entries(preset.filters || {}).map(([key, val]) => (
                                                        <li key={key}><span className="font-medium">{key}:</span> {JSON.stringify(val)}</li>
                                                    ))}
                                                    {Object.keys(preset.filters || {}).length === 0 && <li><i>Keine Filterkriterien</i></li>}
                                                </ul>
                                                <div className="mt-2">
                                                    <strong>Sichtbare Bereiche:</strong> {preset.preset_daten?.visible_sections ? 'Gespeichert' : 'Standard'}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setPreviewId(previewId === preset.id ? null : preset.id)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                            title="Vorschau"
                                        >
                                            <EyeIcon className="w-5 h-5" />
                                        </button>

                                        {(isAdmin || preset.preset_type === 'user') && (
                                            <>
                                                <button
                                                    onClick={() => startEdit(preset)}
                                                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                                                    title="Umbenennen"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(preset.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title="Löschen"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}

                                        <button
                                            onClick={() => handleApply(preset.id)}
                                            className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-sm transition-transform active:scale-95"
                                        >
                                            Anwenden
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
}
