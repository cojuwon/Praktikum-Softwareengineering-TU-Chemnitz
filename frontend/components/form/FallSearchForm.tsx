import { useState } from "react";

type Props = {
  onSubmit: (filters: any) => void;
};

export function FallSearchForm({ onSubmit }: Props) {
  const [filters, setFilters] = useState({
    datumVon: "",
    datumBis: "",
    name: "",
    fallId: "",
  });

  const update = (field: string, value: string) =>
    setFilters(prev => ({ ...prev, [field]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(filters);
      }}
    >
      <div>
        <label>Datum von:</label>
        <input type="date" value={filters.datumVon} onChange={(e) => update("datumVon", e.target.value)} />
      </div>

      <div>
        <label>Datum bis:</label>
        <input type="date" value={filters.datumBis} onChange={(e) => update("datumBis", e.target.value)} />
      </div>

      <div>
        <label>Name:</label>
        <input type="text" value={filters.name} onChange={(e) => update("name", e.target.value)} />
      </div>

      <div>
        <label>Fall-ID:</label>
        <input type="text" value={filters.fallId} onChange={(e) => update("fallId", e.target.value)} />
      </div>

      <button type="submit">Suchen</button>
    </form>
  );
}
