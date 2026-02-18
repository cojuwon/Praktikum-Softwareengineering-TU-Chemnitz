import { useState, useEffect } from 'react';
import { Eingabefeld, EingabefeldTyp, EingabefeldContext } from '@/lib/definitions';
import { apiFetch } from '@/lib/api';
import { Plus, Search, Filter, Edit, Trash, Settings } from 'lucide-react';
import InputFieldModal from './InputFieldModal';

export default function InputFieldList() {
    const [fields, setFields] = useState<Eingabefeld[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [contextFilter, setContextFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<Eingabefeld | undefined>(undefined);

    const fetchFields = async () => {
        setLoading(true);
        try {
            let url = '/api/eingabefelder/?';
            const params = new URLSearchParams();

            if (searchTerm) params.append('search', searchTerm);
            if (contextFilter) params.append('context', contextFilter);
            if (typeFilter) params.append('typ', typeFilter);

            const response = await apiFetch(url + params.toString());
            if (!response.ok) throw new Error('Fehler beim Laden der Felder');

            const data = await response.json();
            setFields(Array.isArray(data) ? data : data.results || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceOrImmediate = setTimeout(() => {
            fetchFields();
        }, 300);

        return () => clearTimeout(delayDebounceOrImmediate);
    }, [searchTerm, contextFilter, typeFilter]);

    const handleCreate = () => {
        setEditingField(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (field: Eingabefeld) => {
        setEditingField(field);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Möchten Sie dieses Feld wirklich löschen?')) return;

        try {
            const response = await apiFetch(`/api/eingabefelder/${id}/`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Fehler beim Löschen');

            fetchFields();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleSave = async (fieldData: Partial<Eingabefeld>) => {
        const isEdit = !!editingField;
        const url = isEdit ? `/api/eingabefelder/${editingField.feldID}/` : '/api/eingabefelder/';
        const method = isEdit ? 'PATCH' : 'POST';

        const response = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fieldData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Fehler beim Speichern');
        }

        fetchFields();
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings size={24} className="text-gray-500" />
                        Eingabefelder verwalten
                    </h2>
                    <p className="text-sm text-gray-500">Konfigurieren Sie dynamische Felder für Anfragen, Fälle und Klienten.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={18} />
                    Neues Feld
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={contextFilter}
                        onChange={(e) => setContextFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                        <option value="">Alle Kontexte</option>
                        {Object.values(EingabefeldContext).map(ctx => (
                            <option key={ctx} value={ctx}>{ctx}</option>
                        ))}
                    </select>
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                        <option value="">Alle Typen</option>
                        {Object.values(EingabefeldTyp).map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Lade Felder...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">Fehler: {error}</div>
                ) : fields.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <p className="mb-2">Keine Felder gefunden.</p>
                        <button onClick={handleCreate} className="text-blue-600 hover:text-blue-800 text-sm">
                            Erstes Feld erstellen
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label / Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontext</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sortierung</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pflichtfeld</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fields.map((field) => (
                                    <tr key={field.feldID} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{field.label}</div>
                                            <div className="text-xs text-gray-500 font-mono">{field.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {field.context}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {field.typ}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {field.sort_order}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {field.required ? (
                                                <span className="text-green-600">Ja</span>
                                            ) : (
                                                <span className="text-gray-400">Nein</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(field)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="Bearbeiten"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(field.feldID)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Löschen"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <InputFieldModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                field={editingField}
            />
        </div>
    );
}
