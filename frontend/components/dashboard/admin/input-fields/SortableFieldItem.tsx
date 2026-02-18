import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eingabefeld } from '@/lib/definitions';
import { GripVertical, Edit, Trash } from 'lucide-react';

interface SortableFieldItemProps {
    field: Eingabefeld;
    onEdit: (field: Eingabefeld) => void;
    onDelete: (id: number) => void;
}

export default function SortableFieldItem({ field, onEdit, onDelete }: SortableFieldItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.feldID });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border rounded-lg p-4 mb-3 flex items-center gap-4 shadow-sm ${isDragging ? 'ring-2 ring-blue-500 z-10' : 'hover:border-blue-300'}`}
        >
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
                <GripVertical size={20} />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{field.label}</h3>
                    {field.required && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Pflichtfeld</span>}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{field.name}</span>
                    <span>•</span>
                    <span className="capitalize">{field.typ}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(field)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Bearbeiten"
                >
                    <Edit size={18} />
                </button>
                <button
                    onClick={() => onDelete(field.feldID)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Löschen"
                >
                    <Trash size={18} />
                </button>
            </div>
        </div>
    );
}
