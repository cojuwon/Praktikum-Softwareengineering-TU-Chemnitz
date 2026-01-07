'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Edit2 as EditIcon,
    UserPlus as AddUserIcon,
    ShieldAlert,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api-client';
import { User } from '@/types/auth';
import MitarbeiterFormDialog from '@/components/admin/MitarbeiterFormDialog';

export default function AdminPage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // Access Control
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/dashboard');
                return;
            }
            const hasPermission = user.rolle_mb === 'AD' || user.permissions?.includes('api.can_manage_users');

            if (!hasPermission) {
                router.push('/dashboard');
            }
        }
    }, [user, authLoading, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/konten/');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && (user.rolle_mb === 'AD' || user?.permissions?.includes('api.can_manage_users'))) {
            fetchUsers();
        }
    }, [user]);

    const handleCreate = () => {
        setSelectedUser(null);
        setDialogOpen(true);
    };

    const handleEdit = (userToEdit: User) => {
        setSelectedUser(userToEdit);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        fetchUsers();
    };

    const getRoleLabel = (roleKey: string) => {
        switch (roleKey) {
            case 'AD': return 'Admin';
            case 'E': return 'Erweiterung';
            case 'B': return 'Basis';
            default: return roleKey;
        }
    };

    const getRoleBadgeClass = (roleKey: string) => {
        switch (roleKey) {
            case 'AD': return 'bg-red-100 text-red-700 border-red-200';
            case 'E': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'B': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (authLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!user || !(user.rolle_mb === 'AD' || user.permissions?.includes('api.can_manage_users'))) {
        return null;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Mitarbeiter Verwaltung
                </h1>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
                >
                    <AddUserIcon size={20} />
                    Mitarbeiter hinzufügen
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">E-Mail</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600">Rolle</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-600 w-24">Aktionen</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        Keine Mitarbeiter gefunden.
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-slate-900">
                                                {u.vorname_mb} {u.nachname_mb}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-slate-600">{u.mail_mb}</td>
                                        <td className="px-6 py-3">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(u.rolle_mb)}`}>
                                                {getRoleLabel(u.rolle_mb)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3">
                                            <button
                                                onClick={() => handleEdit(u)}
                                                className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
                                                title="Bearbeiten"
                                            >
                                                <EditIcon size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <MitarbeiterFormDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSuccess={handleSuccess}
                userToEdit={selectedUser}
            />
        </div>
    );
}
