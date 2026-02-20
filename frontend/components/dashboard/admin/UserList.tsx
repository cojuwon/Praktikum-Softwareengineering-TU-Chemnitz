'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Pencil, Trash2, Plus, Check, Search, Filter } from 'lucide-react';
import { useUser } from '@/lib/userContext';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/ui/pagination';
import { MultiSelect } from '@/components/ui/MultiSelect';

interface User {
    id: number;
    vorname_mb: string;
    nachname_mb: string;
    mail_mb: string;
    rolle_mb: string;
    is_active: boolean;
    status_mb: 'A' | 'I' | 'P';
    groups?: string[];
}

export default function UserList({ embedded = false }: { embedded?: boolean }) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const PAGE_SIZE = 10;

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState('');

    // Edit State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<User>>({});
    const [password, setPassword] = useState('');

    // Verification State
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState('');

    const { user: currentUser } = useUser();
    const router = useRouter();

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            fetchUsers(1); // Reset to page 1 on filter change
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, roleFilter, statusFilter]);

    // Initial load handled by the effect above (on mount, deps are initial values)

    const fetchUsers = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            setPage(pageNum);

            const params = new URLSearchParams();
            params.append('page', pageNum.toString());
            // params.append('page_size', PAGE_SIZE.toString()); // If backend supports variable page size

            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter.length > 0) {
                // Join roles with comma for 'in' lookup
                params.append('rolle_mb__in', roleFilter.join(','));
            }
            if (statusFilter) params.append('status_mb', statusFilter);

            const res = await apiFetch(`/api/konten/?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch users');

            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
                setCount(data.length);
            } else if (data.results && Array.isArray(data.results)) {
                setUsers(data.results);
                setCount(data.count || 0);
            } else {
                setUsers([]);
                setCount(0);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        fetchUsers(newPage);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData(user);
        setIsCreating(false);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setFormData({ rolle_mb: 'B', is_active: true, status_mb: 'A' }); // Defaults
        setPassword('');
        setIsCreating(true);
    };

    const handleCancel = () => {
        setEditingUser(null);
        setIsCreating(false);
        setFormData({});
        setPassword('');
        setError(null);
        setShowVerificationModal(false);
        setAdminPassword('');
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Sind Sie sicher, dass Sie diesen Benutzer löschen möchten?')) return;

        try {
            const res = await apiFetch(`/api/konten/${userId}/`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Löschen fehlgeschlagen');
            setUsers(users.filter(u => u.id !== userId));
            // Ideally refetch to update count
            setCount(prev => prev - 1);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Fehler beim Löschen');
        }
    };

    const executeSave = async () => {
        setError(null);
        try {
            if (isCreating) {
                const payload = {
                    ...formData,
                    password: password
                };

                const res = await apiFetch('/api/konten/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    throw new Error(JSON.stringify(errData));
                }

                await fetchUsers(1); // Refresh list
                setIsCreating(false);
                setPassword('');

            } else if (editingUser) {
                const payload: any = {
                    vorname_mb: formData.vorname_mb,
                    nachname_mb: formData.nachname_mb,
                    mail_mb: formData.mail_mb,
                    rolle_mb: formData.rolle_mb,
                    status_mb: formData.status_mb, // Include status_mb
                    is_active: formData.is_active
                };

                // We no longer send password in the PATCH request
                // The password is changed via a separate endpoint in handleVerifyAndSave
                // if (password) {
                //     payload.password = password;
                // }

                const res = await apiFetch(`/api/konten/${editingUser.id}/`, {
                    method: 'PATCH', // or PUT
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error('Update fehlgeschlagen');

                await fetchUsers(page); // Stay on current page
                setEditingUser(null);
                setPassword('');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Operation failed');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Passwörter erfordern beim Ändern eine Bestätigung
        if (editingUser && password) {
            setShowVerificationModal(true);
        } else {
            await executeSave();
        }
    };

    const handleVerifyAndSave = async () => {
        if (!editingUser) return;

        try {
            // Use direct fetch (NOT apiFetch) to avoid the automatic 401-interception
            // which would trigger token refresh/rotation and destroy the admin session
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;

            const res = await fetch(`${backendUrl}/api/konten/${editingUser.id}/reset_user_password/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include',
                body: JSON.stringify({
                    admin_password: adminPassword,
                    new_password: password
                }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || 'Falsches Admin-Passwort oder Fehler beim Zurücksetzen.');
            }

            // Password verified and reset successfully
            setShowVerificationModal(false);
            setAdminPassword('');

            // Now save the rest of the user data (name, email, role, status)
            await executeSave();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Fehler bei der Verifizierung/Passwortänderung');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const toggleActive = () => {
        setFormData(prev => {
            const newActive = !prev.is_active;
            return {
                ...prev,
                is_active: newActive,
                status_mb: newActive ? 'A' : 'I' // Sync status
            };
        });
    };

    const totalPages = Math.ceil(count / PAGE_SIZE);

    if (loading && !users.length) return <div className="p-10 text-center text-gray-500">Laden...</div>;

    const roleOptions = [
        { label: 'Basis', value: 'B' },
        { label: 'Erweiterung', value: 'E' },
        { label: 'Admin', value: 'AD' }
    ];

    const isFilterActive = searchTerm || roleFilter.length > 0 || statusFilter;

    return (
        <div className={embedded ? "" : "p-6 bg-white rounded-lg shadow-sm"}>
            {!embedded && (
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Benutzerverwaltung</h2>
                    <button
                        onClick={handleCreate}
                        className="bg-[#42446F] text-white border-none rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer hover:bg-[#36384d] transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} /> Neuer Benutzer
                    </button>
                </div>
            )}

            {/* Filter Toolbar */}
            <div className={`flex flex-wrap items-center gap-4 mb-6 ${embedded ? 'px-6 pt-4' : ''}`}>
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>

                <div className="flex items-center gap-2 relative">
                    <div className="relative">
                        <Filter size={18} className={`text-gray-400 ${isFilterActive ? 'text-blue-500' : ''}`} />
                        {isFilterActive && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
                    </div>

                    <div className="w-48">
                        <MultiSelect
                            label="Rollen"
                            options={roleOptions}
                            selected={roleFilter}
                            onChange={setRoleFilter}
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="">Status</option>
                        <option value="A">Aktiv</option>
                        <option value="P">Ausstehend</option>
                        <option value="I">Inaktiv</option>
                    </select>
                </div>

                {embedded && (
                    <button
                        onClick={handleCreate}
                        className="ml-auto bg-[#42446F] text-white border-none rounded-lg px-4 py-2 text-sm font-medium cursor-pointer hover:bg-[#36384d] transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> Benutzer anlegen
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-none mb-4 mx-6 border border-red-100 rounded-lg">
                    {error}
                </div>
            )}

            {(isCreating || editingUser) && (
                <div className="mx-6 mb-6 p-6 border border-gray-200 rounded-xl bg-gray-50">
                    <h3 className="font-medium mb-4 text-lg">{isCreating ? 'Neuen Benutzer anlegen' : 'Benutzer bearbeiten'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                            <input
                                name="vorname_mb"
                                value={formData.vorname_mb || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                            <input
                                name="nachname_mb"
                                value={formData.nachname_mb || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                            <input
                                name="mail_mb"
                                type="email"
                                value={formData.mail_mb || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
                            <select
                                name="rolle_mb"
                                value={formData.rolle_mb || 'B'}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="B">Basis</option>
                                <option value="E">Erweiterung</option>
                                <option value="AD">Admin</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Passwort {editingUser && <span className="text-gray-400 font-normal">(nur ausfüllen, um das Passwort zu ändern)</span>}
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required={isCreating}
                            />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            {formData.status_mb === 'P' ? (
                                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2 text-yellow-800">
                                        <span className="font-medium">Benutzer wartet auf Freigabe.</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (confirm('Benutzer unwiderruflich ablehnen (löschen)?')) {
                                                    if (editingUser) handleDelete(editingUser.id);
                                                    handleCancel();
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50"
                                        >
                                            Ablehnen
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, status_mb: 'A', is_active: true }))}
                                            className="px-3 py-1.5 bg-[#294D9D] text-white rounded-md text-sm font-medium hover:bg-blue-800"
                                        >
                                            Freigeben
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={toggleActive}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.is_active ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        role="switch"
                                        aria-checked={formData.is_active}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}`}
                                        />
                                    </button>
                                    <label onClick={toggleActive} className="text-sm font-medium text-gray-700 cursor-pointer">
                                        {formData.is_active ? 'Benutzer ist Aktiv' : 'Benutzer ist Inaktiv'}
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 flex gap-2 justify-end mt-4">
                            <button type="button" onClick={handleCancel} className="px-4 py-2 border rounded-md hover:bg-gray-100">Abbrechen</button>
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Speichern</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                            <th className="py-3 px-6 h-12">Name</th>
                            <th className="py-3 px-6 h-12">E-Mail</th>
                            <th className="py-3 px-6 h-12">Rolle</th>
                            <th className="py-3 px-6 h-12">Status</th>
                            <th className="py-3 px-6 h-12 text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">Laden...</td></tr>
                        )}
                        {!loading && users.length === 0 && (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">Keine Benutzer gefunden.</td></tr>
                        )}
                        {users.map(u => (
                            <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 text-sm">
                                <td className="py-3 px-6 font-medium text-gray-900">{u.vorname_mb} {u.nachname_mb}</td>
                                <td className="py-3 px-6 text-gray-600">{u.mail_mb}</td>
                                <td className="py-3 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${u.rolle_mb === 'AD' ? 'bg-purple-100 text-purple-800' :
                                            u.rolle_mb === 'E' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {u.rolle_mb === 'AD' ? 'Admin' : u.rolle_mb === 'E' ? 'Erweiterung' : 'Basis'}
                                    </span>
                                </td>
                                <td className="py-3 px-6">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${u.status_mb === 'A' ? 'bg-green-100 text-green-800' :
                                            u.status_mb === 'P' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'}`}>
                                        {u.status_mb === 'A' ? 'Aktiv' :
                                            u.status_mb === 'P' ? 'Ausstehend' :
                                                'Inaktiv'}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(u)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                        title="Bearbeiten"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.id)}
                                        className="p-1.5 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                        title="Löschen"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                page={page}
                count={count}
                pageSize={PAGE_SIZE}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />

            {showVerificationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
                        <h3 className="text-lg font-semibold mb-4 text-[#294D9D]">Sicherheitsüberprüfung</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Bitte bestätige mit deinem eigenen Admin-Passwort, dass du das Passwort des Nutzers überschreiben möchtest.
                        </p>
                        <input
                            type="password"
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            placeholder="Dein Admin-Passwort"
                            className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowVerificationModal(false); setAdminPassword(''); }}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 font-medium text-sm"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleVerifyAndSave}
                                className="px-4 py-2 bg-[#294D9D] text-white rounded-md hover:bg-blue-800 disabled:opacity-50 font-medium text-sm"
                                disabled={!adminPassword}
                            >
                                Bestätigen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
