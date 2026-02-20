import { useState } from "react";
import { MoreVertical, Archive, Trash2, RotateCcw, FolderOpen } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Tab = 'active' | 'archived' | 'trash';

interface Fall {
  fall_id: number;
  startdatum: string;
  status: string;
  klient_detail?: { klient_id: number; klient_pseudonym?: string };
  klient: number;
  mitarbeiterin_detail?: { vorname_mb: string; nachname_mb: string };
  deleted_at?: string;
  is_archived?: boolean;
}

interface FallListProps {
  faelle: Fall[];
  loading: boolean;
  onRowClick: (id: number) => void;
  getStatusLabel: (code: string) => string;
  getStatusColor: (code: string) => { bg: string; text: string };
  activeTab: Tab;
  onActionComplete: () => void;
}

export default function FallList({
  faelle,
  loading,
  onRowClick,
  getStatusLabel,
  getStatusColor,
  activeTab,
  onActionComplete,
}: FallListProps) {
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
      case 'archive': url = `/api/faelle/${id}/archive/`; break;
      case 'unarchive': url = `/api/faelle/${id}/unarchive/`; break;
      case 'delete': url = `/api/faelle/${id}/soft-delete/`; break;
      case 'restore': url = `/api/faelle/${id}/restore/`; break;
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
    return <p className="text-center text-gray-500">Lade Fälle...</p>;
  }

  if (faelle.length === 0) {
    return <p className="text-center text-gray-500">Keine Fälle gefunden.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5 pb-20">
      {/* Header Row */}
      <div className="grid grid-cols-[80px_100px_100px_1fr_1fr_40px] gap-4 px-4 mb-1 font-semibold text-gray-500 text-xs">
        <span>ID</span>
        <span>Startdatum</span>
        <span>Status</span>
        <span>Klient:in</span>
        <span>Mitarbeiter:in</span>
        <span></span>
      </div>

      {/* Data Rows */}
      {faelle.map((f) => {
        const statusStyle = getStatusColor(f.status);
        return (
          <div
            key={f.fall_id}
            onClick={() => onRowClick(f.fall_id)}
            className="relative grid grid-cols-[80px_100px_100px_1fr_1fr_40px] gap-4 items-center bg-white border-2 border-gray-200 rounded-lg px-4 py-4 cursor-pointer transition-all hover:border-[#A0A8CD] hover:bg-[#fefeff]"
          >
            {/* ID */}
            <span className="font-semibold text-[#42446F]">
              #{f.fall_id}
            </span>

            {/* Date */}
            <span className="text-gray-700 text-sm">
              {f.startdatum ? new Date(f.startdatum).toLocaleDateString("de-DE") : "-"}
            </span>

            {/* Status */}
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium w-fit"
              style={{
                backgroundColor: statusStyle.bg,
                color: statusStyle.text,
              }}
            >
              {getStatusLabel(f.status)}
            </span>

            {/* Klient */}
            <span className="text-gray-600 text-sm">
              {f.klient_detail
                ? (f.klient_detail.klient_pseudonym
                  ? `${f.klient_detail.klient_pseudonym} (#${f.klient_detail.klient_id})`
                  : `Klient:in #${f.klient_detail.klient_id}`)
                : `Klient:in #${f.klient}`}
            </span>

            {/* Mitarbeiter */}
            <span className="text-gray-600 text-sm">
              {f.mitarbeiterin_detail ? `${f.mitarbeiterin_detail.vorname_mb} ${f.mitarbeiterin_detail.nachname_mb}` : "-"}
            </span>

            {/* Actions Menu Trigger */}
            <div className="relative">
              <button
                onClick={(e) => handleMenuClick(e, f.fall_id)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <MoreVertical size={18} />
              </button>

              {/* Dropdown Menu */}
              {openMenuId === f.fall_id && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-sm">
                  {activeTab === 'active' && (
                    <>
                      <button
                        onClick={(e) => executeAction(e, 'archive', f.fall_id)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <Archive size={14} /> Archivieren
                      </button>
                      <button
                        onClick={(e) => executeAction(e, 'delete', f.fall_id)}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={14} /> Löschen
                      </button>
                    </>
                  )}
                  {activeTab === 'archived' && (
                    <>
                      <button
                        onClick={(e) => executeAction(e, 'unarchive', f.fall_id)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                      >
                        <FolderOpen size={14} /> Reaktivieren
                      </button>
                      <button
                        onClick={(e) => executeAction(e, 'delete', f.fall_id)}
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={14} /> Löschen
                      </button>
                    </>
                  )}
                  {activeTab === 'trash' && (
                    <button
                      onClick={(e) => executeAction(e, 'restore', f.fall_id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-center gap-2 text-green-600"
                    >
                      <RotateCcw size={14} /> Wiederherstellen
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
