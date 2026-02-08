"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { AnfrageFilter } from "@/components/form/AnfrageFilter";
import { FieldDefinition } from "@/components/form/DynamicForm";

export default function AnfrageListPage() {
  const router = useRouter();
  const [anfragen, setAnfragen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;
  // Note: Backend default is 10, should match or be dynamic. 
  // We'll rely on backend's count and page size.

  // Current filters
  const [currentFilters, setCurrentFilters] = useState<any>({});

  // Initial Fetch
  useEffect(() => {
    fetchFormDefinition();
    fetchAnfragen({}, 1);
  }, []);

  const fetchFormDefinition = () => {
    apiFetch("/api/anfragen/form-fields")
      .then((res) => res.json())
      .then((json) => {
        setFormDefinition(json.fields);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Filter-Optionen:", err);
      });
  };

  const fetchAnfragen = (filters: any, pageNum: number = 1) => {
    setLoading(true);
    setCurrentFilters(filters);
    setPage(pageNum);

    const params = new URLSearchParams();
    // Pagination
    params.append('page', pageNum.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.datumVon) params.append('datum_von', filters.datumVon);
    if (filters.datumBis) params.append('datum_bis', filters.datumBis);

    // Multi-select arrays -> comma separated string
    if (filters.art && filters.art.length > 0) params.append('anfrage_art', filters.art.join(','));
    if (filters.ort && filters.ort.length > 0) params.append('anfrage_ort', filters.ort.join(','));
    if (filters.person && filters.person.length > 0) params.append('anfrage_person', filters.person.join(','));

    const queryString = params.toString();
    const url = `/api/anfragen/?${queryString}`;

    apiFetch(url)
      .then((res) => {
        if (res.status === 401) throw new Error("Nicht autorisiert");
        return res.json();
      })
      .then((data) => {
        // With pagination, data is { count: number, results: [...] }
        // Without pagination (fallback), it's [...]
        if (Array.isArray(data)) {
          setAnfragen(data);
          setCount(data.length);
        } else {
          setAnfragen(data.results || []);
          setCount(data.count || 0);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Liste:", err);
        setLoading(false);
      });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const totalPages = Math.ceil(count / PAGE_SIZE);
    if (newPage > totalPages && totalPages > 0) return;
    fetchAnfragen(currentFilters, newPage);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        width: "100%",
        padding: "24px",
      }}
    >
      <Image
        src="/bellis-favicon.png"
        alt="Bellis Logo"
        width={100}
        height={100}
        style={{
          width: "60px",
          height: "auto",
          objectFit: "contain",
          display: "block",
          margin: "0 auto 20px auto",
        }}
      />

      {/* BIG BOX AROUND EVERYTHING */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          overflow: "visible",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
        }}
      >
        {/* HEADER SECTION */}
        <div
          style={{
            padding: "30px 40px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: "600",
                color: "#42446F",
                margin: 0,
              }}
            >
              Anfragen
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "5px 0 0 0",
              }}
            >
              Verwalten Sie alle eingehenden Anfragen
            </p>
          </div>

          <Link
            href="/dashboard/anfrage/create"
            style={{
              backgroundColor: "#42446F",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              textDecoration: "none",
              display: "inline-block"
            }}
          >
            + Anfrage erstellen
          </Link>
        </div>

        {/* SEARCH & FILTER SECTION */}
        <div
          style={{
            padding: "20px 40px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {formDefinition ? (
            <AnfrageFilter definition={formDefinition} onSearch={(f) => fetchAnfragen(f, 1)} />
          ) : (
            <p className="text-sm text-gray-500">Lade Filter...</p>
          )}
        </div>

        {/* LIST SECTION */}
        <div
          style={{
            padding: "30px 40px",
            backgroundColor: "#f9fafb",
            // Styling Fix: Ensure bottom rounded corners
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px"
          }}
        >
          {loading && <p style={{ textAlign: "center", color: "#6b7280" }}>Lade Anfragen...</p>}
          {!loading && anfragen.length === 0 && (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Keine Anfragen gefunden.</p>
          )}

          {!loading && anfragen.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Header Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 120px 1fr 1fr 1fr 120px",
                  padding: "0 16px",
                  marginBottom: "5px",
                  fontWeight: "600",
                  color: "#6b7280",
                  fontSize: "13px",
                  gap: "15px"
                }}
              >
                <span>ID</span>
                <span>Datum</span>
                <span>Art</span>
                <span>Ort</span>
                <span>Person</span>
                <span style={{ textAlign: "right" }}>Aktion</span>
              </div>

              {anfragen.map((a) => (
                <div
                  key={a.anfrage_id}
                  onClick={() => router.push(`/dashboard/anfrage/edit/${a.anfrage_id}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 120px 1fr 1fr 1fr 120px",
                    alignItems: "center",
                    gap: "15px",
                    backgroundColor: "white",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#A0A8CD";
                    e.currentTarget.style.backgroundColor = "#fefeff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "white";
                  }}
                >
                  {/* ID */}
                  <span style={{ fontWeight: "600", color: "#42446F" }}>
                    #{a.anfrage_id}
                  </span>

                  {/* Date */}
                  <span style={{ color: "#374151", fontSize: "14px" }}>
                    {new Date(a.anfrage_datum).toLocaleDateString("de-DE")}
                  </span>

                  {/* Art */}
                  <span style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "12px",
                    backgroundColor: "#e0e7ff",
                    color: "#3730a3",
                    fontSize: "12px",
                    fontWeight: "500",
                    width: "fit-content"
                  }}>
                    {a.anfrage_art_display || a.anfrage_art}
                  </span>

                  {/* Ort */}
                  <span style={{ color: "#4b5563", fontSize: "14px" }}>
                    {a.anfrage_ort_display || a.anfrage_ort}
                  </span>

                  {/* Person */}
                  <span style={{ color: "#4b5563", fontSize: "14px" }}>
                    {a.anfrage_person}
                  </span>

                  {/* Action Button */}
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/dashboard/anfrage/edit/${a.anfrage_id}`);
                      }}
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #A0A8CD",
                        color: "#42446F",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e0e7ff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Bearbeiten
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && count > 0 && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb",
              color: "#6b7280",
              fontSize: "14px"
            }}>
              <div>
                Seite <span style={{ fontWeight: "600", color: "#374151" }}>{page}</span> von <span style={{ fontWeight: "600", color: "#374151" }}>{Math.ceil(count / PAGE_SIZE)}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: page === 1 ? "#f3f4f6" : "white",
                    color: page === 1 ? "#9ca3af" : "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: page === 1 ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  Vorherige
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: page >= totalPages ? "#f3f4f6" : "white",
                    color: page >= totalPages ? "#9ca3af" : "#374151",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    cursor: page >= totalPages ? "not-allowed" : "pointer",
                    fontSize: "14px"
                  }}
                >
                  Nächste
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}