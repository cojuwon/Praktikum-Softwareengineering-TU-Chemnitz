"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnfrageSearchForm } from "@/components/form/AnfrageSearchForm";

export default function AnfrageSuchePage() {
  const router = useRouter();
  const [results, setResults] = useState([]);

  const handleSearch = async (filters: any) => {
    const res = await fetch("/api/anfrage/query", {
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
      <h1>Anfrage suchen</h1>

      <AnfrageSearchForm onSubmit={handleSearch} />

      <hr style={{ margin: "2rem 0" }} />

      <h2>Ergebnisse</h2>

      {results.length === 0 && <p>Keine Fälle gefunden.</p>}

      <ul>
        {results.map((anfrage: any) => (
          <li
            key={anfrage.id}
            style={{ cursor: "pointer", padding: "8px 0" }}
            onClick={() => router.push(`/dashboard/anfrage/edit/${anfrage.id}`)}
          >
            <strong>Anfrage #{anfrage.id}</strong> – {anfrage.name} ({anfrage.datum})
          </li>
        ))}
      </ul>
    </div>
  );
}
