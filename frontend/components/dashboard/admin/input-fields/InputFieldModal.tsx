import { useState, useEffect } from 'react';
import { Eingabefeld, EingabefeldTyp, EingabefeldContext, EingabefeldOption } from '@/lib/definitions';
import { X, Plus, Trash } from 'lucide-react';

interface InputFieldModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (field: Partial<Eingabefeld>) => Promise<void>;
    field?: Eingabefeld;
}

export default function InputFieldModal({ isOpen, onClose, onSave, field }: InputFieldModalProps) {
    const [formData, setFormData] = useState<Partial<Eingabefeld>>({
        context: EingabefeldContext.Anfrage,
        name: '',
        label: '',
        typ: EingabefeldTyp.Text,
        required: false,
        options: [],
        sort_order: 0,
        default_value: '',
    });

    const [options, setOptions] = useState<EingabefeldOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (field) {
            setFormData(field);
            setOptions(field.options || []);
        } else {
            setFormData({
                context: EingabefeldContext.Anfrage,
                name: '',
                label: '',
                typ: EingabefeldTyp.Text,
                required: false,
                options: [],
                sort_order: 0,
                default_value: '',
            });
            setOptions([]);
        }
        setError(null);
    }, [field, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            // Special handling for number inputs
            if (name === 'sort_order') {
                setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleOptionChange = (index: number, key: 'value' | 'label', value: string) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [key]: value };
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, { value: '', label: '' }]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const dataToSave = { ...formData, options };

            // Basic validation
            if (!dataToSave.name || !dataToSave.label) {
                throw new Error('Name und Label sind Pflichtfelder.');
            }

            if ((dataToSave.typ === EingabefeldTyp.Select || dataToSave.typ === EingabefeldTyp.Multiselect) && options.length === 0) {
                throw new Error('Für Auswahlfelder müssen Optionen definiert werden.');
            }

            await onSave(dataToSave);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Ein Fehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold">{field ? 'Eingabefeld bearbeiten' : 'Neues Eingabefeld erstellen'}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form id="input-field-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kontext</label>
                                <select
                                    name="context"
                                    value={formData.context}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Object.values(EingabefeldContext).map(ctx => (
                                        <option key={ctx} value={ctx}>{ctx}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                                <select
                                    name="typ"
                                    value={formData.typ}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Object.values(EingabefeldTyp).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name (Technisch)</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="z.B. familienstand"
                                />
                                <p className="text-xs text-gray-500 mt-1">Eindeutiger Bezeichner, keine Leerzeichen.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Label (Anzeige)</label>
                                <input
                                    type="text"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="z.B. Familienstand"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sortierung</label>
                                <input
                                    type="number"
                                    name="sort_order"
                                    value={formData.sort_order}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Standardwert</label>
                                <input
                                    type="text"
                                    name="default_value"
                                    value={formData.default_value || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="required"
                                id="required"
                                checked={formData.required}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="required" className="text-sm font-medium text-gray-700">Pflichtfeld</label>
                        </div>

                        {(formData.typ === EingabefeldTyp.Select || formData.typ === EingabefeldTyp.Multiselect) && (
                            <div className="mt-4 border-t pt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">Optionen</label>
                                    <button
                                        type="button"
                                        onClick={addOption}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Option hinzufügen
                                    </button>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Wert (Value)"
                                                value={opt.value}
                                                onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Label (Anzeige)"
                                                value={opt.label}
                                                onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                                                className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeOption(idx)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {options.length === 0 && (
                                        <p className="text-sm text-gray-400 italic text-center py-2">Keine Optionen definiert.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Abbrechen
                    </button>
                    <button
                        type="submit"
                        form="input-field-form"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                    >
                        {loading ? 'Speichern...' : 'Speichern'}
                    </button>
                </div>
            </div>
        </div>
    );
}
