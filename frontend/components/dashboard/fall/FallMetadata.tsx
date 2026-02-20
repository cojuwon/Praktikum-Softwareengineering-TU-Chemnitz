import { PencilSquareIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";

interface FallMetadataProps {
    data: any; // Type should be more specific in real app
    definition: any[];
    onEdit: () => void;
}

export default function FallMetadata({ data, definition, onEdit }: FallMetadataProps) {
    // Helper to find label
    const getLabel = (name: string) => {
        const field = definition?.find((f) => f.name === name);
        return field?.label || name;
    };

    // Helper to format values
    const getDisplayValue = (name: string, value: any) => {
        const field = definition?.find((f) => f.name === name);
        if (!field) return value;

        if (field.type === "select" || field.type === "multiselect") {
            if (!field.options) return value;
            const valStr = String(value);
            const option = field.options.find((o: any) =>
                (typeof o === "string" ? o : o.value) === valStr
            );
            return option ? (typeof option === "string" ? option : option.label) : value;
        }

        if (field.type === "date" && value) {
            try {
                return format(new Date(value), "dd.MM.yyyy", { locale: de });
            } catch (e) {
                return value;
            }
        }

        return value;
    };

    // Filter out fields we might not want to show in sidebar if they are too large
    // For now, show all except 'notizen' which we handle in timeline
    const visibleFields = definition?.filter(f => f.name !== 'notizen') || [];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-slate-800">Stammdaten</h3>
                <button
                    onClick={onEdit}
                    className="text-slate-400 hover:text-blue-600 transition-colors bg-white hover:bg-blue-50 p-1.5 rounded-md border border-transparent hover:border-blue-100"
                    title="Bearbeiten"
                >
                    <PencilSquareIcon className="w-4 h-4" />
                </button>
            </div>
            <div className="p-5 space-y-4">
                {/* Klient Info explicit */}
                <div className="pb-4 border-b border-slate-100">
                    <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        Klient:in
                    </span>
                    <div className="font-medium text-slate-900 text-lg flex items-center gap-2 group">
                        {data.klient_detail?.klient_pseudonym || `Klient:in #${data.klient}`}
                        <Link href={`/dashboard/klienten/${data.klient}`} className="text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100">
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                {visibleFields.map((field) => (
                    <div key={field.name} className="group">
                        <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1 group-hover:text-slate-500 transition-colors">
                            {field.label}
                        </span>
                        <span className="block text-slate-700 font-medium">
                            {getDisplayValue(field.name, data[field.name]) || <span className="text-slate-300 italic">—</span>}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
