"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useUser } from "@/lib/userContext";

interface PresetMenuProps {
    onPresetsChanged: () => void;
    currentFilters: any;
    currentVisibleSections: any;
    presets: any[];
}

export default function PresetMenu({ onPresetsChanged, currentFilters, currentVisibleSections, presets }: PresetMenuProps) {
    const { user } = useUser();
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showManageDialog, setShowManageDialog] = useState(false);

    const [presetName, setPresetName] = useState("");
    const [presetDesc, setPresetDesc] = useState("");
    const [isGlobal, setIsGlobal] = useState(false);

    const isAdmin = user?.permissions?.includes("can_manage_users") || user?.rolle_mb === 'AD';

    const handleSave = async () => {
        try {
            const payload = {
                name: presetName,
                preset_beschreibung: presetDesc || presetName,
                filters: currentFilters,
                preset_daten: { visible_sections: currentVisibleSections },
                is_global: isGlobal
            };

            const res = await apiFetch("/api/presets/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setShowSaveDialog(false);
                setPresetName("");
                setPresetDesc("");
                setIsGlobal(false);
                onPresetsChanged();
                alert("Preset gespeichert!");
            } else {
                const err = await res.json();
                alert("Fehler beim Speichern: " + JSON.stringify(err));
            }
        } catch (e) {
            console.error(e);
            alert("Fehler beim Speichern.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Preset wirklich löschen?")) return;
        try {
            const res = await apiFetch(`/api/presets/${id}/`, { method: "DELETE" });
            if (res.ok) {
                onPresetsChanged();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={() => setShowSaveDialog(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Aktuelle Auswahl als Preset speichern
                </button>
                <span className="text-gray-300">|</span>
                <button
                    onClick={() => setShowManageDialog(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                    Presets verwalten
                </button>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-4">Preset speichern</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                className="w-full border p-2 rounded"
                                value={presetName}
                                onChange={e => setPresetName(e.target.value)}
                                placeholder="z.B. Monatliche Auswertung Leipzig"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Beschreibung (optional)</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                value={presetDesc}
                                onChange={e => setPresetDesc(e.target.value)}
                            />
                        </div>

                        {isAdmin && (
                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    id="isGlobal"
                                    className="mr-2"
                                    checked={isGlobal}
                                    onChange={e => setIsGlobal(e.target.checked)}
                                />
                                <label htmlFor="isGlobal" className="text-sm">Als globales Preset speichern (für alle sichtbar)</label>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowSaveDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!presetName}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Dialog */}
            {showManageDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-2xl w-full shadow-xl h-[80vh] flex flex-col">
                        <h3 className="text-lg font-bold mb-4">Presets verwalten</h3>

                        <div className="flex-1 overflow-y-auto">
                            <table className="w-full text-left font-sm">
                                <thead className="border-b bg-gray-50">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Typ</th>
                                        <th className="p-2">Ersteller</th>
                                        <th className="p-2">Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {presets.map(p => (
                                        <tr key={p.id} className="border-b hover:bg-gray-50">
                                            <td className="p-2 font-medium">{p.name}</td>
                                            <td className="p-2">
                                                {p.is_global ?
                                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Global</span> :
                                                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Persönlich</span>
                                                }
                                            </td>
                                            <td className="p-2 text-gray-500 text-xs text-xs">{p.ersteller || "System"}</td>
                                            <td className="p-2">
                                                {(p.is_global && !isAdmin) ? (
                                                    <span className="text-gray-400 text-xs">Nicht löschbar</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(p.id)}
                                                        className="text-red-600 hover:underline text-xs"
                                                    >
                                                        Löschen
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {presets.length === 0 && <p className="text-center p-4 text-gray-500">Keine Presets gefunden.</p>}
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                            <button
                                onClick={() => setShowManageDialog(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            >
                                Schließen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}