"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import AnfrageSearchHeader from "@/components/dashboard/anfrage/search/AnfrageSearchHeader";
import AnfrageSearchSection from "@/components/dashboard/anfrage/search/AnfrageSearchSection";
import AnfrageSearchResults from "@/components/dashboard/anfrage/search/AnfrageSearchResults";

export default function AnfrageSuchePage() {
  const router = useRouter();
  const [results, setResults] = useState([]);

  // Initial fetch on mount
  useEffect(() => {
    handleSearch({});
  }, []);

  const handleSearch = async (filters: any) => {
    try {
      const params = new URLSearchParams();
      if (filters.datumVon) params.append('datum_von', filters.datumVon);
      if (filters.datumBis) params.append('datum_bis', filters.datumBis);

      const queryString = params.toString();
      const url = `/api/anfragen/?${queryString}`;

      const res = await apiFetch(url, {
        method: "GET",
      });

      if (res.status === 401) {
        console.warn("AnfrageSearch: 401 Unauthorized");
        alert("Nicht autorisiert. Bitte neu einloggen.");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error(`AnfrageSearch Error: ${res.status} ${res.statusText}`, text);
        throw new Error(`Fehler beim Laden: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);
      // For list view, API returns array in `results` (paginated) or direct list depending on implementation
      // Based on previous checks, if paginated it returns { count, results, ... }, if simplified list just []
      // Let's handle both robustly
      const list = Array.isArray(data) ? data : (data.results ?? []);
      setResults(list);
    } catch (e) {
      console.error(e);
      // alert("Fehler beim Laden der Anfragen."); // Initial errors might be just empty state, suppress if needed or make less intrusive
      setResults([]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full pt-6">
      <AnfrageSearchHeader />

      <div className="bg-white rounded-b-xl overflow-visible shadow-sm">
        <AnfrageSearchSection onSubmit={handleSearch} />

        <hr className="my-8 border-none border-t border-gray-200 mx-5" />

        <section className="px-10 mx-5 pb-8">
          <h2 className="text-xl font-semibold text-[#42446F] mb-4">
            Ergebnisse
          </h2>

          <AnfrageSearchResults
            results={results}
            onRowClick={(id) => router.push(`/dashboard/anfrage/edit/${id}`)}
          />
        </section>
      </div>
    </div>
  );
}