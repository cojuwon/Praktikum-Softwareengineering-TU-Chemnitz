"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AnfrageSearchForm } from "@/components/form/AnfrageSearchForm";
import { apiFetch } from "@/lib/api";
import Image from "next/image";

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
    <div
      className="flex flex-col justify-between h-full bg-[#F3EEEE] overflow-auto"
    >
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
          width: "100%",
          padding: "24px 24px 0 24px"
        }}
      >
        <Image
          src="/bellis-favicon.png"
          alt="Bellis Logo"
          width={100}
          height={100}
          priority
          style={{
            width: "60px",
            height: "auto",
            objectFit: "contain",
            display: "block",
            margin: "20px auto",
            backgroundColor: "transparent",
          }}
        />

        <div
          style={{
            backgroundColor: "white",
            padding: "40px 40px",
            margin: "0 20px 0px 20px",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: "#42446F",
              marginBottom: "6px",
              textAlign: "center",
            }}
          >
            Anfrage suchen
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              textAlign: "center",
              margin: 0,
            }}
          >
            Suchen Sie nach bestehenden Anfragen
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px 40px 30px 40px",
            margin: "0 20px",
            borderRadius: "0 0 12px 12px",
          }}
        >
          <AnfrageSearchForm onSubmit={handleSearch} />

          <hr style={{ margin: "30px 0", border: "none", borderTop: "1px solid #e5e7eb" }} />

          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#42446F",
              marginBottom: "15px",
            }}
          >
            Ergebnisse
          </h2>

          {results.length === 0 && (
            <p style={{ textAlign: "center", color: "#6b7280" }}>
              Keine Fälle gefunden.
            </p>
          )}

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {results.map((anfrage: any) => {
              return (
                <li
                  key={anfrage.anfrage_id}
                  onClick={() => router.push(`/dashboard/anfrage/edit/${anfrage.anfrage_id}`)}
                  style={{
                    cursor: "pointer",
                    padding: "12px 16px",
                    marginBottom: "10px",
                    backgroundColor: "#f9fafb",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                    e.currentTarget.style.borderColor = "#A0A8CD";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  <strong style={{ color: "#42446F" }}>Anfrage #{anfrage.anfrage_id}</strong>
                  <span style={{ color: "#6b7280" }}> – {anfrage.anfrage_art_display} in {anfrage.anfrage_ort_display} ({anfrage.anfrage_datum})</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <Image
        src="/drei-welle-zusammenblau.png"
        alt=""
        width={1400}
        height={100}
        className="w-full h-auto object-cover block"
      />
    </div>
  );
}