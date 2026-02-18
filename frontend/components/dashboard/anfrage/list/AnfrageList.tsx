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
}

interface AnfrageListProps {
  anfragen: AnfrageRow[];
  loading: boolean;
  onRowClick: (id: number) => void;
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

export default function AnfrageList({ anfragen, loading, onRowClick }: AnfrageListProps) {
  if (loading) {
    return <p className="text-center text-gray-500">Lade Anfragen...</p>;
  }

  if (anfragen.length === 0) {
    return <p className="text-center text-gray-500">Keine Anfragen gefunden.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header Row */}
      <div className="grid grid-cols-[80px_120px_1fr_1fr_1fr_1fr] gap-4 px-4 mb-1 font-semibold text-gray-500 text-xs">
        <span>ID</span>
        <span>Datum</span>
        <span>Status</span>
        <span>Art</span>
        <span>Ort</span>
        <span>Person</span>
      </div>

      {/* Data Rows */}
      {anfragen.map((a) => (
        <div
          key={a.anfrage_id}
          onClick={() => onRowClick(a.anfrage_id)}
          className="grid grid-cols-[80px_120px_1fr_1fr_1fr_1fr] gap-4 items-center bg-white border-2 border-gray-200 rounded-lg px-4 py-4 cursor-pointer transition-all hover:border-[#A0A8CD] hover:bg-[#fefeff]"
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
        </div>
      ))}
    </div>
  );
}
