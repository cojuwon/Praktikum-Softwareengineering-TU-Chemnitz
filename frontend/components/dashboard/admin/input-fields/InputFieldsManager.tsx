import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Eingabefeld, EingabefeldTyp, EingabefeldContext } from '@/lib/definitions';
import { apiFetch } from '@/lib/api';
import { Plus, Settings, Check } from 'lucide-react';
import InputFieldModal from './InputFieldModal';
import SortableFieldItem from './SortableFieldItem';

export default function InputFieldsManager() {
    const [activeContext, setActiveContext] = useState<EingabefeldContext>(EingabefeldContext.Anfrage);
    const [fields, setFields] = useState<Eingabefeld[]>([]);
    const [allFields, setAllFields] = useState<Eingabefeld[]>([]); // Store all fields to filter locally
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingField, setEditingField] = useState<Eingabefeld | undefined>(undefined);

    // Save status for reordering
    const [savingOrder, setSavingOrder] = useState(false);

    // Track where to insert new field
    const [insertIndex, setInsertIndex] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchFields = async () => {
        setLoading(true);
        try {
            // Disable pagination by default in backend or handle it here
            const response = await apiFetch('/api/eingabefelder/');
            if (!response.ok) throw new Error('Fehler beim Laden der Felder');

            const data = await response.json();
            const loadedFields = Array.isArray(data) ? data : data.results || [];

            setAllFields(loadedFields);
            // We don't filter immediately here because we might need to rely on activeContext in the effect
            // But triggering the effect by updating allFields is enough

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const filterFieldsByContext = (fieldList: Eingabefeld[], context: EingabefeldContext) => {
        const filtered = fieldList
            .filter(f => f.context === context)
            .sort((a, b) => a.sort_order - b.sort_order);
        setFields(filtered);
    };

    useEffect(() => {
        fetchFields();
    }, []);

    useEffect(() => {
        filterFieldsByContext(allFields, activeContext);
    }, [activeContext, allFields]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((item) => item.feldID === active.id);
                const newIndex = items.findIndex((item) => item.feldID === over?.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Trigger save order
                saveOrder(newOrder);

                return newOrder;
            });
        }
    };

    const saveOrder = async (orderedFields: Eingabefeld[]) => {
        setSavingOrder(true);
        try {
            // We need to re-index based on current filtered view BUT also ensure we don't mess up global IDs.
            // The backend endpoint updates sort_order for given IDs.
            // It's safe to just send the IDs we see here with their new index 0..N
            const payload = orderedFields.map((field, index) => ({
                id: field.feldID,
                sort_order: index
            }));

            await apiFetch('/api/eingabefelder/reorder/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Update local state to reflect new sort orders for future filtering
            setAllFields(prev => prev.map(f => {
                const update = payload.find(p => p.id === f.feldID);
                return update ? { ...f, sort_order: update.sort_order } : f;
            }));

        } catch (err) {
            console.error('Failed to save order', err);
            // Optionally revert changes or show toast
        } finally {
            setSavingOrder(false);
        }
    };

    const handleSaveField = async (fieldData: Partial<Eingabefeld>) => {
        const isEdit = !!editingField;
        const url = isEdit ? `/api/eingabefelder/${editingField.feldID}/` : '/api/eingabefelder/';
        const method = isEdit ? 'PATCH' : 'POST';

        // If we are creating a field at specific index, we need to handle sort_order
        // But since backend assigns default, we will reorder AFTER creation.

        const response = await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fieldData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Fehler beim Speichern');
        }

        const savedField = await response.json();

        // If inserting between items
        if (!isEdit && insertIndex !== null) {
            // Construct new list
            const newFieldList = [...fields];
            newFieldList.splice(insertIndex, 0, savedField);

            // Update local UI immediately
            setFields(newFieldList);

            // Save new order to backend
            await saveOrder(newFieldList);
        }

        setInsertIndex(null); // Reset
        fetchFields();
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

    const openCreateModal = (index?: number) => {
        setEditingField(undefined);
        setInsertIndex(typeof index === 'number' ? index : null);
        setIsModalOpen(true);
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings size={24} className="text-gray-500" />
                        Eingabefelder verwalten
                    </h2>
                    <p className="text-sm text-gray-500">Konfigurieren Sie dynamische Felder per Drag & Drop.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {Object.values(EingabefeldContext).map((ctx) => (
                    <button
                        key={ctx}
                        onClick={() => setActiveContext(ctx)}
                        className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap capitalize ${activeContext === ctx
                            ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {ctx}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="max-w-3xl mx-auto">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Lade Felder...</div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={fields.map(f => f.feldID)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {/* Initial specific "Add" button at top if list is empty? No, usually list is populated */}

                                {fields.map((field, index) => (
                                    <div key={field.feldID} className="group/item relative">
                                        {/* Insert Button BEFORE item */}
                                        <div className="h-4 -my-2 flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity z-20 relative">
                                            <button
                                                onClick={() => openCreateModal(index)}
                                                className="bg-blue-600 text-white rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
                                                title="Hier Feld einfügen"
                                            >
                                                <Plus size={14} />
                                            </button>
                                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-600 -z-10"></div>
                                        </div>

                                        <SortableFieldItem
                                            field={field}
                                            onEdit={(f) => { setEditingField(f); setIsModalOpen(true); }}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                ))}

                                {/* Empty State */}
                                {fields.length === 0 && (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-gray-400">
                                        <p>Keine Felder für diesen Kontext gefunden.</p>
                                    </div>
                                )}

                                {/* Add Button at Bottom */}
                                <button
                                    onClick={() => openCreateModal(fields.length)}
                                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group mt-4"
                                >
                                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                    <span>Neues Feld hinzufügen zu <strong>{activeContext}</strong></span>
                                </button>
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            <InputFieldModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveField}
                field={editingField}
            />

            {/* Saving Indicator */}
            {savingOrder && (
                <div className="fixed bottom-6 right-6 bg-white shadow-lg border border-gray-100 px-4 py-2 rounded-full flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-bottom-4">
                    <Check size={16} /> Speichere Reihenfolge...
                </div>
            )}
        </div>
    );
}
