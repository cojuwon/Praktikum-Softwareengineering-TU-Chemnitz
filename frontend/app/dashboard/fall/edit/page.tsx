"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FallSearchForm } from "@/components/form/FallSearchForm";

export default function FallSuchePage() {
  const router = useRouter();
  const [results, setResults] = useState([]);

  const handleSearch = async (filters: any) => {
    const res = await fetch("/api/fall/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    });

    const data = await res.json();
    console.log(data); // damit siehst du, was zurückkommt
    setResults(data.data ?? []); // nur die Liste der Fälle speichern
  }; // <-- HIER die fehlende Klammer schließen

  return (
    <div>
      <h1>Fälle suchen</h1>

      <FallSearchForm onSubmit={handleSearch} />

      <hr style={{ margin: "2rem 0" }} />

      <h2>Ergebnisse</h2>

      {results.length === 0 && <p>Keine Fälle gefunden.</p>}

      <ul>
        {results.map((fall: any) => (
          <li
            key={fall.id}
            style={{ cursor: "pointer", padding: "8px 0" }}
            onClick={() => router.push(`/dashboard/fall/edit/${fall.id}`)}
          >
            <strong>Fall #{fall.id}</strong> – {fall.name} ({fall.datum})
          </li>
        ))}
      </ul>
    </div>
  );
}
