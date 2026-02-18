import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
    ChatBubbleLeftEllipsisIcon,
    CalendarIcon,
    UserIcon
} from "@heroicons/react/24/outline";
import Viewer from "@/components/editor/Viewer";
import clsx from "clsx";

interface TimelineItemProps {
    item: any;
    onEdit: (item: any) => void;
}

export default function TimelineItem({ item, onEdit }: TimelineItemProps) {
    const isNote = item.type === 'note';
    const date = new Date(item.sort_date || item.created_at || item.termin_beratung);

    return (
        <div className="relative pl-8 pb-8 last:pb-0">
            {/* Line */}
            <div className="absolute top-0 left-3.5 h-full w-px bg-slate-200" />

            {/* Icon */}
            <div className={clsx(
                "absolute top-0 left-0 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 bg-white",
                isNote ? "border-blue-200 text-blue-500" : "border-emerald-200 text-emerald-500"
            )}>
                {isNote ? <ChatBubbleLeftEllipsisIcon className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                {/* Header */}
                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">
                            {isNote ? "Notiz" : "Beratungstermin"}
                        </span>
                        <span className="text-xs text-slate-500">
                            {format(date, "PPP 'um' p", { locale: de })}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Author / Counselor */}
                        {(item.autor || item.berater) && (
                            <div className="flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                <UserIcon className="w-3 h-3" />
                                <span>
                                    {isNote
                                        ? `${item.autor?.vorname_mb} ${item.autor?.nachname_mb}`
                                        : item.berater_name || "Berater:in"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4" onClick={() => onEdit(item)}>
                    {isNote ? (
                        <div className="cursor-pointer">
                            <Viewer content={item.content} />
                        </div>
                    ) : (
                        <div className="cursor-pointer space-y-2">
                            <div className="flex gap-2 text-sm">
                                <span className="font-medium text-slate-600">Art:</span>
                                <span>{item.beratungsart_display || item.beratungsart}</span>
                            </div>
                            <div className="flex gap-2 text-sm">
                                <span className="font-medium text-slate-600">Dauer:</span>
                                <span>{item.dauer} Min.</span>
                            </div>
                            <div className="flex gap-2 text-sm">
                                <span className="font-medium text-slate-600">Status:</span>
                                <span className={clsx(
                                    "px-1.5 py-0.5 rounded text-xs font-medium",
                                    item.status === 'g' ? "bg-yellow-100 text-yellow-800" :
                                        item.status === 's' ? "bg-green-100 text-green-800" :
                                            "bg-red-100 text-red-800"
                                )}>
                                    {item.status_display || item.status}
                                </span>
                            </div>
                            {item.notizen_beratung && (
                                <div className="mt-2 text-sm text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">
                                    "{item.notizen_beratung}"
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
