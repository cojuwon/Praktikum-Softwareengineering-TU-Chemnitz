'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { getLabel, LOCATION_CHOICES } from '@/lib/constants';
import { Pencil, Trash2, Plus, Search, Filter, User, Briefcase } from 'lucide-react';
import Pagination from '@/components/ui/pagination';
import KlientFormDialog from './KlientFormDialog';

interface Klient {
    klient_id: number;
    klient_pseudonym?: string;
    klient_code?: string; // If exists
    klient_rolle: string;
    klient_wohnort: string;
    erstellt_am: string;
    // Add other fields as needed for display
}

interface KlientListProps {
    embedded?: boolean;
}

export default function KlientList({ embedded = false }: KlientListProps) {
    const [klienten, setKlienten] = useState<Klient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const PAGE_SIZE = 10;

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Dialog State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingKlient, setEditingKlient] = useState<Klient | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKlienten(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, roleFilter]);

    const fetchKlienten = async (pageNum: number = 1) => {
        try {
            setLoading(true);
            setPage(pageNum);

            const params = new URLSearchParams();
            params.append('page', pageNum.toString());
            // params.append('page_size', PAGE_SIZE.toString());

            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter) params.append('klient_rolle', roleFilter);

            const res = await apiFetch(`/api/klienten/?${params.toString()}`);
            if (!res.ok) throw new Error('Fehler beim Laden der Klient:innen');

            const data = await res.json();
            if (Array.isArray(data)) {
                setKlienten(data);
                setCount(data.length);
            } else if (data.results && Array.isArray(data.results)) {
                setKlienten(data.results);
                setCount(data.count || 0);
            } else {
                setKlienten([]);
                setCount(0);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        fetchKlienten(newPage);
    };

    const handleCreateSuccess = () => {
        fetchKlienten(1); // Refresh list
        setIsCreateOpen(false); // Close dialog after success
    };

    const handleEdit = (klient: Klient) => {
        setEditingKlient(klient);
        setIsCreateOpen(true);
    }

    const handleCreate = () => {
        setEditingKlient(null);
        setIsCreateOpen(true);
    }

    const handleDelete = async (id: number) => {
        if (!confirm("Möchten Sie diesen Klienten wirklich löschen?")) return;
        try {
            const res = await apiFetch(`/api/klienten/${id}/`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Löschen fehlgeschlagen');
            fetchKlienten(page);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Fehler beim Löschen');
        }
    }

    const totalPages = Math.ceil(count / PAGE_SIZE);

    return (
        <div className={embedded ? "" : "p-6 bg-white rounded-lg shadow-sm"}>
            {!embedded && (
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-slate-800">Personenverwaltung</h2>
                    <button
                        onClick={handleCreate}
                        className="bg-[#42446F] text-white border-none rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer hover:bg-[#36384d] transition-colors flex items-center gap-2"
                    >
                        <Plus size={18} /> Neue Person
                    </button>
                </div>
            )}

            <KlientFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={handleCreateSuccess}
                klientToEdit={editingKlient}
            />

            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Suchen (Pseudonym, Code)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="py-2 pl-3 pr-8 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                        <option value="">Alle Rollen</option>
                        <option value="B">Betroffene:r</option>
                        <option value="A">Angehörige:r</option>
                        <option value="F">Fachkraft</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-100">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50 text-sm text-gray-600">
                            <th className="py-3 px-6 h-12">Pseudonym</th>
                            <th className="py-3 px-6 h-12">Rolle</th>
                            <th className="py-3 px-6 h-12">Wohnort</th>
                            <th className="py-3 px-6 h-12">Erstellt am</th>
                            <th className="py-3 px-6 h-12 text-right">Aktionen</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">Laden...</td></tr>
                        )}
                        {!loading && klienten.length === 0 && (
                            <tr><td colSpan={5} className="py-8 text-center text-gray-500">Keine Personen gefunden.</td></tr>
                        )}
                        {klienten.map(k => (
                            <tr key={k.klient_id} className="border-b border-gray-100 hover:bg-gray-50 text-sm transition-colors">
                                <td className="py-3 px-6 font-medium text-gray-900 group">
                                    <Link href={`/dashboard/klienten/${k.klient_id}`} className="flex items-center gap-2 group-hover:text-blue-600">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <User size={14} />
                                        </div>
                                        {k.klient_pseudonym ? `${k.klient_pseudonym} (#${k.klient_id})` : `Klient:in #${k.klient_id}`}
                                    </Link>
                                </td>
                                <td className="py-3 px-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                        ${k.klient_rolle === 'B' ? 'bg-purple-100 text-purple-800' :
                                            k.klient_rolle === 'A' ? 'bg-amber-100 text-amber-800' :
                                                'bg-blue-100 text-blue-800'
                                        }`}>
                                        {k.klient_rolle === 'B' ? 'Betroffene:r' : k.klient_rolle === 'A' ? 'Angehörige:r' : 'Fachkraft'}
                                    </span>
                                </td>
                                <td className="py-3 px-6 text-gray-600">
                                    {getLabel(LOCATION_CHOICES, k.klient_wohnort)}
                                </td>
                                <td className="py-3 px-6 text-gray-600">
                                    {new Date(k.erstellt_am).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-6 text-right flex justify-end gap-2">
                                    <Link href={`/dashboard/fall?klient_id=${k.klient_id}`}>
                                        <button className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="Fälle anzeigen">
                                            <Briefcase size={16} />
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleEdit(k)}
                                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                                        title="Bearbeiten"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(k.klient_id)}
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
        </div>
    );
}
