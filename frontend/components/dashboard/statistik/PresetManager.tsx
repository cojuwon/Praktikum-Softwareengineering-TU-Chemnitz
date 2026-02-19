"use client";

import { useState, useMemo } from "react";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/lib/userContext";
import Modal from "@/components/ui/Modal";
import { MagnifyingGlassIcon, FunnelIcon, TrashIcon, PencilIcon, EyeIcon, CheckIcon, ShareIcon, GlobeAltIcon, UserIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

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
    const [filterOrigin, setFilterOrigin] = useState<'all' | 'mine' | 'other' | 'global'>('all');
    const [filterContent, setFilterContent] = useState<'all' | 'filters' | 'layout'>('all');

    // Edit/Rename State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    // Preview State
    const [previewId, setPreviewId] = useState<number | null>(null);

    // Feedback & Confirmation
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const isAdmin = user?.permissions?.includes("can_manage_users") || user?.rolle_mb === 'AD';
    const currentUserId = user?.id;

    // Derived filtered list
    const filteredPresets = useMemo(() => {
        return presets.filter(p => {
            // 1. Search
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.ersteller_name && p.ersteller_name.toLowerCase().includes(searchTerm.toLowerCase()));

            // 2. Origin Filter
            let matchesOrigin = true;
            if (filterOrigin === 'mine') matchesOrigin = (p.ersteller === currentUserId);
            if (filterOrigin === 'other') matchesOrigin = (p.ersteller !== currentUserId && !p.is_global); // Shared
            if (filterOrigin === 'global') matchesOrigin = (p.is_global === true);

            // 3. Content Filter
            let matchesContent = true;
            const hasFilters = p.filters && Object.keys(p.filters).length > 0;
            const hasLayout = p.preset_daten?.visible_sections;

            if (filterContent === 'filters') matchesContent = hasFilters;
            if (filterContent === 'layout') matchesContent = !hasFilters && hasLayout;

            return matchesSearch && matchesOrigin && matchesContent;
        });
    }, [presets, searchTerm, filterOrigin, filterContent, currentUserId]);

    // Actions
    const handleApply = (id: string) => {
        onApplyPreset(id);
        setIsOpen(false);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await apiFetch(`/api/presets/${deleteId}/`, { method: "DELETE" });
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
        } finally {
            setDeleteId(null);
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
                body: JSON.stringify({ preset_beschreibung: editName })
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
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
                <FunnelIcon className="w-4 h-4" />
                Vorlagen
            </button>

            {/* Main Manager Modal */}
            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Statistik-Vorlagen verwalten"
                maxWidth="max-w-6xl"
                footer={
                    <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-gray-100 rounded text-gray-700 hover:bg-gray-200">
                        Schließen
                    </button>
                }
            >
                <div className="flex flex-col h-[70vh] w-full">
                    {/* Toolbar */}
                    <div className="flex flex-col gap-4 mb-4 border-b pb-4">
                        {/* Top Row: Search */}
                        <div className="relative w-full">
                            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Suchen nach Name oder Ersteller..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Filter Row */}
                        <div className="flex flex-wrap gap-4 items-center text-sm">
                            {/* Origin Group */}
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
                                <span className="px-2 text-xs font-semibold text-gray-500 uppercase">Herkunft</span>
                                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                <button onClick={() => setFilterOrigin('all')} className={`px-2 py-1 rounded ${filterOrigin === 'all' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>Alle</button>
                                <button onClick={() => setFilterOrigin('mine')} className={`px-2 py-1 rounded ${filterOrigin === 'mine' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>Eigene</button>
                                <button onClick={() => setFilterOrigin('other')} className={`px-2 py-1 rounded ${filterOrigin === 'other' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>Fremde</button>
                                <button onClick={() => setFilterOrigin('global')} className={`px-2 py-1 rounded ${filterOrigin === 'global' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>Global</button>
                            </div>

                            {/* Content Group */}
                            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border">
                                <span className="px-2 text-xs font-semibold text-gray-500 uppercase">Inhalt</span>
                                <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                <button onClick={() => setFilterContent('all')} className={`px-2 py-1 rounded ${filterContent === 'all' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>Alle</button>
                                <button onClick={() => setFilterContent('filters')} className={`px-2 py-1 rounded ${filterContent === 'filters' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>Mit Filter</button>
                                <button onClick={() => setFilterContent('layout')} className={`px-2 py-1 rounded ${filterContent === 'layout' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-200'}`}>Nur Layout</button>
                            </div>
                        </div>
                    </div>

                    {/* Feedback Inline */}
                    {feedback && (
                        <div className={`mb-4 p-2 rounded text-sm ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.message}
                        </div>
                    )}

                    {/* Grid Header - Matching FallList style */}
                    <div className="grid grid-cols-[2fr_1.5fr_1fr_120px] gap-4 px-4 mb-2 font-semibold text-gray-500 text-xs uppercase tracking-wider">
                        <span>Name</span>
                        <span>Details</span>
                        <span>Ersteller</span>
                        <span className="text-right">Aktionen</span>
                    </div>

                    {/* Grid List */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {filteredPresets.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                Keine Vorlagen gefunden.
                            </div>
                        ) : (
                            filteredPresets.map(preset => {
                                const isSystem = preset.is_global && preset.ersteller !== currentUserId;
                                const creatorName = isSystem ? "System" : (preset.ersteller_name || "Unbekannt");

                                return (
                                    <div
                                        key={preset.id}
                                        className="grid grid-cols-[2fr_1.5fr_1fr_120px] gap-4 items-center bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-blue-300 hover:shadow-sm transition-all text-sm group"
                                    >
                                        {/* Name */}
                                        <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                                            {editingId === preset.id ? (
                                                <div className="flex gap-1 items-center w-full">
                                                    <input
                                                        value={editName}
                                                        onChange={e => setEditName(e.target.value)}
                                                        className="border px-2 py-1 rounded text-sm w-full"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => saveEdit(preset.id)} className="text-green-600 hover:bg-green-100 p-1 rounded"><CheckIcon className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-500 hover:bg-gray-100 p-1 rounded">X</button>
                                                </div>
                                            ) : (
                                                <>
                                                    {preset.is_global ? <GlobeAltIcon className="w-4 h-4 text-blue-500 flex-shrink-0" title="Global" /> :
                                                        preset.preset_type === 'shared' ? <ShareIcon className="w-4 h-4 text-purple-500 flex-shrink-0" title="Geteilt" /> :
                                                            <UserIcon className="w-4 h-4 text-gray-400 flex-shrink-0" title="Persönlich" />}
                                                    <span className="truncate" title={preset.name}>{preset.name}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="text-xs text-gray-500 flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1">
                                                <span className="font-medium">{Object.keys(preset.filters || {}).length}</span> Filter
                                            </div>
                                            <div className="text-gray-400">
                                                {preset.preset_daten?.visible_sections ? 'Layout gespeichert' : 'Standard Layout'}
                                            </div>
                                        </div>

                                        {/* Creator */}
                                        <div className="text-xs text-gray-600 truncate">
                                            <span className={`px-2 py-0.5 rounded-full ${isSystem ? 'bg-gray-100 text-gray-700 font-medium' : 'bg-blue-50 text-blue-700'}`}>
                                                {creatorName}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex justify-end items-center gap-1">
                                            <button
                                                onClick={() => setPreviewId(previewId === preset.id ? null : preset.id)}
                                                className={`p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 ${previewId === preset.id ? 'text-blue-600 bg-blue-50' : ''}`}
                                                title="Vorschau"
                                            >
                                                <EyeIcon className="w-4 h-4" />
                                            </button>

                                            {(isAdmin || preset.preset_type === 'user' || preset.ersteller === currentUserId) && (
                                                <>
                                                    <button onClick={() => startEdit(preset)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-amber-600" title="Umbenennen">
                                                        <PencilIcon className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setDeleteId(preset.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600" title="Löschen">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleApply(preset.id)}
                                                className="ml-1 px-3 py-1 bg-[#42446F] text-white text-xs font-medium rounded hover:bg-[#2c2e4f] shadow-sm transition-transform active:scale-95"
                                            >
                                                Wählen
                                            </button>
                                        </div>

                                        {/* Preview Expanded Row (Full Width) */}
                                        {previewId === preset.id && (
                                            <div className="col-span-4 mt-2 bg-gray-50 p-3 rounded border border-gray-100 text-xs text-gray-600 grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                                                <div>
                                                    <strong className="block mb-1 text-gray-800">Aktive Filter:</strong>
                                                    <div className="space-y-1 pl-2 border-l-2 border-blue-200">
                                                        {Object.entries(preset.filters || {}).map(([key, val]) => (
                                                            <div key={key}><span className="font-medium text-gray-700">{key}:</span> {JSON.stringify(val)}</div>
                                                        ))}
                                                        {Object.keys(preset.filters || {}).length === 0 && <i className="text-gray-400">Keine Filterkriterien</i>}
                                                    </div>
                                                </div>
                                                <div>
                                                    <strong className="block mb-1 text-gray-800">Beschreibung:</strong>
                                                    <p className="mb-2 italic text-gray-500">{preset.preset_beschreibung || "Keine Beschreibung"}</p>
                                                    <strong className="block mb-1 text-gray-800">Sichtbare Bereiche:</strong>
                                                    <span className="text-xs font-mono bg-white px-1 rounded border">{JSON.stringify(preset.preset_daten?.visible_sections || "Standard")}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <Modal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    title="Preset löschen?"
                    footer={
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">
                                Abbrechen
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm flex items-center gap-2"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Löschen
                            </button>
                        </div>
                    }
                >
                    <div className="flex flex-col items-center text-center p-4">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sind Sie sicher?</h3>
                        <p className="text-gray-500">
                            Möchten Sie das Preset wirklich unwiderruflich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                    </div>
                </Modal>
            )}
        </>
    );
}
