interface Anfrage {
  anfrage_id: number;
  anfrage_art_display: string;
  anfrage_ort_display: string;
  anfrage_datum: string;
}

interface AnfrageSearchResultsProps {
  results: Anfrage[];
  onRowClick: (id: number) => void;
}

export default function AnfrageSearchResults({
  results,
  onRowClick,
}: AnfrageSearchResultsProps) {
  if (results.length === 0) {
    return (
      <p className="text-center text-gray-500">
        Keine Fälle gefunden.
      </p>
    );
  }

  return (
    <ul className="list-none p-0 m-0">
      {results.map((anfrage) => (
        <li
          key={anfrage.anfrage_id}
          onClick={() => onRowClick(anfrage.anfrage_id)}
          className="cursor-pointer px-4 py-3 mb-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg transition-all hover:bg-gray-100 hover:border-[#A0A8CD]"
        >
          <strong className="text-[#42446F]">Anfrage #{anfrage.anfrage_id}</strong>
          <span className="text-gray-500"> – {anfrage.anfrage_art_display} in {anfrage.anfrage_ort_display} ({anfrage.anfrage_datum})</span>
        </li>
      ))}
    </ul>
  );
}
