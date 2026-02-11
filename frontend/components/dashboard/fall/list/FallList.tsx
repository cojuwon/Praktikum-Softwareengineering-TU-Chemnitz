interface Fall {
  fall_id: number;
  startdatum: string;
  status: string;
  klient_detail?: { klient_id: number };
  klient: number;
  mitarbeiterin_detail?: { vorname_mb: string; nachname_mb: string };
}

interface FallListProps {
  faelle: Fall[];
  loading: boolean;
  onRowClick: (id: number) => void;
  getStatusLabel: (code: string) => string;
  getStatusColor: (code: string) => { bg: string; text: string };
}

export default function FallList({
  faelle,
  loading,
  onRowClick,
  getStatusLabel,
  getStatusColor,
}: FallListProps) {
  if (loading) {
    return <p className="text-center text-gray-500">Lade Fälle...</p>;
  }

  if (faelle.length === 0) {
    return <p className="text-center text-gray-500">Keine Fälle gefunden.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header Row */}
      <div className="grid grid-cols-[80px_100px_100px_1fr_1fr] gap-4 px-4 mb-1 font-semibold text-gray-500 text-xs">
        <span>ID</span>
        <span>Startdatum</span>
        <span>Status</span>
        <span>Klient:in</span>
        <span>Mitarbeiter:in</span>
      </div>

      {/* Data Rows */}
      {faelle.map((f) => {
        const statusStyle = getStatusColor(f.status);
        return (
          <div
            key={f.fall_id}
            onClick={() => onRowClick(f.fall_id)}
            className="grid grid-cols-[80px_100px_100px_1fr_1fr] gap-4 items-center bg-white border-2 border-gray-200 rounded-lg px-4 py-4 cursor-pointer transition-all hover:border-[#A0A8CD] hover:bg-[#fefeff]"
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
              {f.klient_detail ? `Klient:in #${f.klient_detail.klient_id}` : `Klient:in #${f.klient}`}
            </span>

            {/* Mitarbeiter */}
            <span className="text-gray-600 text-sm">
              {f.mitarbeiterin_detail ? `${f.mitarbeiterin_detail.vorname_mb} ${f.mitarbeiterin_detail.nachname_mb}` : "-"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
