'use client';

import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '@/lib/api';

interface Permission {
    id: number;
    name: string;
    codename: string;
    content_type: number;
}

interface Group {
    id: number;
    name: string;
    permissions: Permission[];
}

interface GroupFormProps {
    group?: Group;
    onSuccess: () => void;
    onCancel: () => void;
}

// Translations map for common permissions
const PERMISSION_TRANSLATIONS: Record<string, string> = {
    // Users / Accounts
    'add_user': 'Benutzer erstellen',
    'change_user': 'Benutzer bearbeiten',
    'delete_user': 'Benutzer löschen',
    'view_user': 'Benutzer ansehen',

    // Groups
    'add_group': 'Gruppen erstellen',
    'change_group': 'Gruppen bearbeiten',
    'delete_group': 'Gruppen löschen',
    'view_group': 'Gruppen ansehen',

    // Content Types
    'add_contenttype': 'Inhaltstypen erstellen',
    'change_contenttype': 'Inhaltstypen bearbeiten',
    'delete_contenttype': 'Inhaltstypen löschen',
    'view_contenttype': 'Inhaltstypen ansehen',

    // Sessions
    'add_session': 'Sitzungen erstellen',
    'change_session': 'Sitzungen bearbeiten',
    'delete_session': 'Sitzungen löschen',
    'view_session': 'Sitzungen ansehen',

    // Log Entries
    'add_logentry': 'Log-Einträge erstellen',
    'change_logentry': 'Log-Einträge bearbeiten',
    'delete_logentry': 'Log-Einträge löschen',
    'view_logentry': 'Log-Einträge ansehen',

    // Permissions
    'add_permission': 'Berechtigungen erstellen',
    'change_permission': 'Berechtigungen bearbeiten',
    'delete_permission': 'Berechtigungen löschen',
    'view_permission': 'Berechtigungen ansehen',

    // Email Address (allauth)
    'add_emailaddress': 'E-Mail-Adresse hinzufügen',
    'change_emailaddress': 'E-Mail-Adresse ändern',
    'delete_emailaddress': 'E-Mail-Adresse löschen',
    'view_emailaddress': 'E-Mail-Adresse ansehen',

    // Email Confirmation (allauth)
    'add_emailconfirmation': 'E-Mail-Bestätigung erstellen',
    'change_emailconfirmation': 'E-Mail-Bestätigung ändern',
    'delete_emailconfirmation': 'E-Mail-Bestätigung löschen',
    'view_emailconfirmation': 'E-Mail-Bestätigung ansehen',

    // Custom Apps (Konto, etc.) - Add specific ones as they appear
    'add_konto': 'Konto erstellen',
    'change_konto': 'Konto bearbeiten',
    'delete_konto': 'Konto löschen',
    'view_konto': 'Konto ansehen',
};

export default function GroupForm({ group, onSuccess, onCancel }: GroupFormProps) {
    const [name, setName] = useState(group?.name || '');

    // Initialize selected ID list from group prop
    const [selectedIds, setSelectedIds] = useState<number[]>(
        group?.permissions.map(p => p.id) || []
    );

    // Keep track of "known" permissions
    const [knownPermissions, setKnownPermissions] = useState<Record<number, Permission>>(() => {
        const initialauth: Record<number, Permission> = {};
        if (group?.permissions) {
            group.permissions.forEach(p => {
                initialauth[p.id] = p;
            });
        }
        return initialauth;
    });

    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const res = await apiFetch('/api/permissions/?limit=2000');
                if (!res.ok) throw new Error('Failed to fetch permissions');
                const data = await res.json();
                const results = data.results || data;

                setAllPermissions(results);

                setKnownPermissions(prev => {
                    const next = { ...prev };
                    results.forEach((p: Permission) => {
                        next[p.id] = p;
                    });
                    return next;
                });
            } catch (err) {
                console.error(err);
                setError('Konnte Berechtigungen nicht laden.');
            } finally {
                setPermissionsLoading(false);
            }
        };
        fetchPermissions();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                name,
                permission_ids: selectedIds
            };

            const url = group ? `/api/groups/${group.id}/` : '/api/groups/';
            const method = group ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(JSON.stringify(errData) || 'Speichern fehlgeschlagen');
            }

            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Fehler beim Speichern');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const visibleIds = availableList.map(p => p.id);
        setSelectedIds(prev => {
            const newSet = new Set([...prev, ...visibleIds]);
            return Array.from(newSet);
        });
    };

    const handleRemoveAll = () => {
        setSelectedIds([]);
    };

    // Helper to format permission name to German
    const formatPermissionName = (perm: Permission) => {
        if (PERMISSION_TRANSLATIONS[perm.codename]) {
            return PERMISSION_TRANSLATIONS[perm.codename];
        }

        // Fallback: try to guess standard Django pattern
        // "can add user" -> "Benutzer hinzufügen" logic check
        // "can_add_user" (codename)

        const parts = perm.codename.split('_');
        const action = parts[0]; // add, change, delete, view
        const model = parts.slice(1).join(' '); // rest is model name

        // Simple fallback translation
        const actionMap: Record<string, string> = {
            'add': 'Erstellen:',
            'change': 'Bearbeiten:',
            'delete': 'Löschen:',
            'view': 'Ansehen:',
        };

        if (actionMap[action]) {
            // Capitalize model name
            const modelName = model.charAt(0).toUpperCase() + model.slice(1);
            return `${actionMap[action]} ${modelName}`;
        }

        // Ultimate fallback: Just English name but clean
        let displayName = perm.name;
        if (displayName.toLowerCase().startsWith('can ')) {
            displayName = displayName.substring(4);
        }
        return displayName.charAt(0).toUpperCase() + displayName.slice(1);
    };

    // Filter Logic
    const availableList = useMemo(() => {
        return allPermissions
            .filter(p => !selectedIds.includes(p.id))
            .filter(p => {
                const term = searchTerm.toLowerCase();
                const germanName = formatPermissionName(p).toLowerCase();
                const originalName = p.name.toLowerCase();
                const codename = p.codename.toLowerCase();

                return germanName.includes(term) || originalName.includes(term) || codename.includes(term);
            });
    }, [allPermissions, selectedIds, searchTerm]);

    const selectedList = useMemo(() => {
        return selectedIds
            .map(id => knownPermissions[id])
            .filter(p => !!p)
            .sort((a, b) => {
                const nameA = formatPermissionName(a);
                const nameB = formatPermissionName(b);
                return nameA.localeCompare(nameB);
            });
    }, [selectedIds, knownPermissions]);


    return (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="font-medium mb-4 text-lg">{group ? 'Gruppe bearbeiten' : 'Neue Gruppe anlegen'}</h3>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded mb-4 border border-red-100 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gruppenname</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2 border rounded-md"
                        required
                        placeholder="z.B. Content Manager"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Berechtigungen verwalten</label>

                    {/* Dual Listbox Container */}
                    <div className="flex flex-col md:flex-row gap-4 h-[500px]">

                        {/* Available Column */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white border border-gray-200 rounded-md shadow-sm">
                            <div className="p-2 border-b border-gray-100 bg-gray-50 rounded-t-md">
                                <h4 className="text-xs font-semibold uppercase text-gray-500 mb-1">Verfügbare Berechtigungen</h4>
                                <input
                                    type="text"
                                    placeholder="Suchen (z.B. 'Benutzer')..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full p-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="flex-1 overflow-y-auto p-1 min-h-0">
                                {permissionsLoading ? (
                                    <div className="text-center py-8 text-gray-400 text-xs">Laden...</div>
                                ) : availableList.length > 0 ? (
                                    availableList.map(perm => (
                                        <div
                                            key={perm.id}
                                            onClick={() => togglePermission(perm.id)}
                                            className="p-2 hover:bg-blue-50 hover:text-blue-700 cursor-pointer text-sm rounded border-l-2 border-transparent hover:border-blue-500 group"
                                        >
                                            <div className="font-medium text-gray-800 group-hover:text-blue-700 truncate" title={formatPermissionName(perm)}>
                                                {formatPermissionName(perm)}
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono truncate opacity-60 group-hover:opacity-100" title={perm.codename}>
                                                {perm.codename}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-xs italic p-4">
                                        Keine passenden Berechtigungen gefunden.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Controls Column */}
                        <div className="flex md:flex-col gap-2 justify-center items-center shrink-0">
                            <button
                                type="button"
                                onClick={handleSelectAll}
                                className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 shadow-sm"
                                title="Alle angezeigten hinzufügen"
                            >
                                <span className="hidden md:inline">»</span>
                                <span className="md:hidden">⬇</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleRemoveAll}
                                className="p-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-600 shadow-sm"
                                title="Alle entfernen"
                            >
                                <span className="hidden md:inline">«</span>
                                <span className="md:hidden">⬆</span>
                            </button>
                        </div>

                        {/* Selected Column */}
                        <div className="flex-1 flex flex-col min-w-0 bg-white border border-gray-200 rounded-md shadow-sm">
                            <div className="p-2 border-b border-gray-100 bg-gray-50 rounded-t-md">
                                <h4 className="text-xs font-semibold uppercase text-gray-500 py-1.5">Ausgewählte Berechtigungen ({selectedIds.length})</h4>
                            </div>
                            <div className="flex-1 overflow-y-auto p-1 min-h-0">
                                {selectedList.length > 0 ? (
                                    selectedList.map(perm => (
                                        <div
                                            key={perm.id}
                                            onClick={() => togglePermission(perm.id)}
                                            className="p-2 hover:bg-red-50 hover:text-red-700 cursor-pointer text-sm rounded border-l-2 border-transparent hover:border-red-500 group"
                                        >
                                            <div className="font-medium text-gray-800 group-hover:text-red-700 truncate" title={formatPermissionName(perm)}>
                                                {formatPermissionName(perm)}
                                            </div>
                                            <div className="text-xs text-gray-400 font-mono truncate opacity-60 group-hover:opacity-100" title={perm.codename}>
                                                {perm.codename}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm italic p-4 text-center">
                                        Keine Berechtigungen ausgewählt
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Klicken Sie auf ein Element, um es zu verschieben.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 border rounded-md hover:bg-gray-100 text-sm font-medium bg-white"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                        {loading ? 'Speichere...' : 'Speichern'}
                    </button>
                </div>
            </form>
        </div>
    );
}
