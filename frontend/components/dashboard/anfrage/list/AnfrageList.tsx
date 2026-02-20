import { useState } from "react";
import { MoreVertical, Archive, Trash2, RotateCcw, FolderOpen, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Tab = 'active' | 'archived' | 'trash';

interface AnfrageRow {
  anfrage_id: number;
  anfrage_datum: string;
  anfrage_art_display?: string;
  anfrage_art: string;
  anfrage_ort_display?: string;
  anfrage_ort: string;
  anfrage_person: string;
  status: string;
  status_display?: string;
  deleted_at?: string;
  is_archived?: boolean;
}

interface AnfrageListProps {
  anfragen: AnfrageRow[];
  loading: boolean;
  onRowClick: (id: number) => void;
  activeTab: Tab;
  onActionComplete: () => void;
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null;
  onSort?: (key: string) => void;
}

const getStatusLabel = (code: string) => {
  switch (code) {
    case 'AN': return 'Anfrage';
    case 'TV': return 'Termin vereinbart';
    case 'A': return 'Abgeschlossen';
    default: return code;
  }
};

const getStatusColor = (code: string) => {
  switch (code) {
    case 'AN': return 'bg-indigo-100 text-indigo-700';
    case 'TV': return 'bg-green-100 text-green-700';
    case 'A': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-600';
  }
};

export default function AnfrageList({ anfragen, loading, onRowClick, activeTab, onActionComplete, sortConfig, onSort }: AnfrageListProps) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleMenuClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const executeAction = async (e: React.MouseEvent, action: string, id: number) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setActionLoading(true);

    let url = "";
    let method = "POST";

    switch (action) {
      case 'archive': url = `/api/anfragen/${id}/archive/`; break;
      case 'unarchive': url = `/api/anfragen/${id}/unarchive/`; break;
      case 'delete': url = `/api/anfragen/${id}/soft-delete/`; break;
      case 'restore': url = `/api/anfragen/${id}/restore/`; break;
    }

    try {
      const res = await apiFetch(url, { method });
      if (res.ok) {
        onActionComplete();
      } else {
        console.error("Action failed", res.statusText);
      }
    } catch (err) {
      console.error("Action error", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || actionLoading) {
    return <p className="text-center text-gray-500">Lade Anfragen...</p>;
  }

  if (anfragen.length === 0) {
    return <p className="text-center text-gray-500">Keine Anfragen gefunden.</p>;
  }

  const renderSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-300" />;
    }
    return sortConfig.direction === 'asc'
      ? <ArrowUp size={14} className="ml-1 text-indigo-500" />
      : <ArrowDown size={14} className="ml-1 text-indigo-500" />;
  };

  const SortableHeader = ({ label, sortKey }: { label: string, sortKey: string }) => (
    <span
      className="flex items-center cursor-pointer hover:text-indigo-600 transition-colors py-1"
      onClick={() => onSort && onSort(sortKey)}
    >
      {label}
      {renderSortIcon(sortKey)}
    </span>
  );

  return (
    <div className="flex flex-col gap-2.5 pb-20">
      {/* Header Row */}
      <div className="grid grid-cols-[80px_120px_1fr_1fr_1fr_1fr_40px] gap-4 px-4 mb-1 font-semibold text-gray-500 text-xs select-none">
        <SortableHeader label="ID" sortKey="anfrage_id" />
        <SortableHeader label="Datum" sortKey="anfrage_datum" />
        <SortableHeader label="Status" sortKey="status" />
        <SortableHeader label="Art" sortKey="anfrage_art" />
        <SortableHeader label="Ort" sortKey="anfrage_ort" />
        <SortableHeader label="Person" sortKey="anfrage_person" />
        <span></span>
      </div>

      {/* Data Rows */}
      {anfragen.map((a) => (
        <div
          key={a.anfrage_id}
          onClick={() => onRowClick(a.anfrage_id)}
          className="relative grid grid-cols-[80px_120px_1fr_1fr_1fr_1fr_40px] gap-4 items-center bg-white border-2 border-gray-200 rounded-lg px-4 py-4 cursor-pointer transition-all hover:border-[#A0A8CD] hover:bg-[#fefeff]"
        >
          {/* ID */}
          <span className="font-semibold text-[#42446F]">
            #{a.anfrage_id}
          </span>

          {/* Date */}
          <span className="text-gray-700 text-sm">
            {new Date(a.anfrage_datum).toLocaleDateString("de-DE")}
          </span>

          {/* Status */}
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusColor(a.status)}`}>
            {a.status_display || getStatusLabel(a.status)}
          </span>

          {/* Art */}
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium w-fit">
            {a.anfrage_art_display || a.anfrage_art}
          </span>

          {/* Ort */}
          <span className="text-gray-600 text-sm">
            {a.anfrage_ort_display || a.anfrage_ort}
          </span>

          {/* Person */}
          <span className="text-gray-600 text-sm">
            {a.anfrage_person}
          </span>

          {/* Actions Menu Trigger */}
          <div className="relative">
            <button
              onClick={(e) => handleMenuClick(e, a.anfrage_id)}
              className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
            >
              <MoreVertical size={18} />
            </button>

            {/* Dropdown Menu */}
            {openMenuId === a.anfrage_id && (
              <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-sm">
                {activeTab === 'active' && (
                  <>
                    <button
                      onClick={(e) => executeAction(e, 'archive', a.anfrage_id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <Archive size={14} /> Archivieren
                    </button>
                    <button
                      onClick={(e) => executeAction(e, 'delete', a.anfrage_id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 size={14} /> Löschen
                    </button>
                  </>
                )}
                {activeTab === 'archived' && (
                  <>
                    <button
                      onClick={(e) => executeAction(e, 'unarchive', a.anfrage_id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                    >
                      <FolderOpen size={14} /> Reaktivieren
                    </button>
                    <button
                      onClick={(e) => executeAction(e, 'delete', a.anfrage_id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 size={14} /> Löschen
                    </button>
                  </>
                )}
                {activeTab === 'trash' && (
                  <button
                    onClick={(e) => executeAction(e, 'restore', a.anfrage_id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-center gap-2 text-green-600"
                  >
                    <RotateCcw size={14} /> Wiederherstellen
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
