'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Pencil, Trash2, Plus, Users } from 'lucide-react';
import GroupForm from './GroupForm';
import Modal from '@/components/ui/Modal';

interface Group {
    id: number;
    name: string;
    permissions: any[];
}

export default function GroupList() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [adminWarningOpen, setAdminWarningOpen] = useState(false);

    const fetchGroups = async () => {
        try {
            const res = await apiFetch('/api/groups/');
            if (res.ok) {
                const data = await res.json();
                setGroups(data.results || data);
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Sind Sie sicher, dass Sie diese Gruppe löschen möchten?')) return;

        try {
            const res = await apiFetch(`/api/groups/${id}/`, { method: 'DELETE' });
            if (res.ok) {
                fetchGroups();
            } else {
                alert('Fehler beim Löschen der Gruppe');
            }
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    const handleEditClick = (group: Group) => {
        if (group.name === 'Admin') {
            setAdminWarningOpen(true);
            return;
        }
        setEditingGroup(group);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Laden...</div>;

    if (isCreating || editingGroup) {
        return (
            <GroupForm
                group={editingGroup || undefined}
                onSuccess={() => {
                    setIsCreating(false);
                    setEditingGroup(null);
                    fetchGroups();
                }}
                onCancel={() => {
                    setIsCreating(false);
                    setEditingGroup(null);
                }}
            />
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="text-gray-500" size={24} />
                    Gruppen & Berechtigungen
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-[#42446F] text-white border-none rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer hover:bg-[#36384d] transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Neue Gruppe
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="py-3 px-6 border-b border-gray-100">Name</th>
                            <th className="py-3 px-6 border-b border-gray-100 text-center">Berechtigungen</th>
                            <th className="py-3 px-6 border-b border-gray-100 text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {groups.map((group) => (
                            <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3 px-6 font-medium text-gray-900">
                                    {group.name}
                                    {group.name === 'Admin' && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                            System
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 px-6 text-center text-gray-500">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {group.permissions.length}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEditClick(group)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                        title="Bearbeiten"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(group.id)}
                                        className={`p-1.5 rounded-md transition-colors ${group.name === 'Admin' ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
                                        title="Löschen"
                                        disabled={group.name === 'Admin'}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {groups.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-gray-400 italic">
                                    Keine Gruppen gefunden.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Security Warning Modal for Admin Group */}
            <Modal
                isOpen={adminWarningOpen}
                onClose={() => setAdminWarningOpen(false)}
                title="Sicherheitswarnung: Admin-Gruppe"
                footer={
                    <button
                        onClick={() => setAdminWarningOpen(false)}
                        className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium"
                    >
                        Verstanden
                    </button>
                }
            >
                <div className="space-y-4 text-gray-600">
                    <p className="font-medium text-red-600">
                        Diese Gruppe kann aus Sicherheitsgründen hier nicht bearbeitet werden.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm">
                        <li>
                            <strong>Risiko des Aussperrens:</strong> Fehlerhafte Änderungen könnten dazu führen, dass Sie sich selbst und anderen Administratoren den Zugriff verwehren.
                        </li>
                        <li>
                            <strong>Experten-Funktion:</strong> Änderungen an der Admin-Rolle sollten nur von erfahrenen Entwicklern vorgenommen werden, die genau wissen, was sie tun.
                        </li>
                        <li>
                            <strong>Backend-Restriktion:</strong> Um Systemstabilität zu gewährleisten, sind Modifikationen am Admin-Status nur direkt über das Django-Backend zulässig.
                        </li>
                        <li>
                            <strong>Nicht notwendig:</strong> Administratoren besitzen standardmäßig bereits alle Rechte ("Supersuser"-Status), sodass keine manuellen Anpassungen erforderlich sind.
                        </li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
}
