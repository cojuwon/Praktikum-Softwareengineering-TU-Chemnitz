"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { FallFilter } from "@/components/form/FallFilter";
import { FieldDefinition } from "@/components/form/DynamicForm";

export default function FallListPage() {
  const router = useRouter();
  const [faelle, setFaelle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;

  // Current filters
  const [currentFilters, setCurrentFilters] = useState<any>({});

  // Initial Fetch
  useEffect(() => {
    fetchFormDefinition();
    fetchFaelle({}, 1);
  }, []);

  const fetchFormDefinition = () => {
    apiFetch("/api/faelle/form-fields")
      .then((res) => res.json())
      .then((json) => {
        setFormDefinition(json.fields);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Filter-Optionen:", err);
      });
  };

  const fetchFaelle = (filters: any, pageNum: number = 1) => {
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
    if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','));
    if (filters.mitarbeiterin && filters.mitarbeiterin.length > 0) params.append('mitarbeiterin', filters.mitarbeiterin.join(','));

    const queryString = params.toString();
    const url = `/api/faelle/?${queryString}`;

    apiFetch(url)
      .then((res) => {
        if (res.status === 401) throw new Error("Nicht autorisiert");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFaelle(data);
          setCount(data.length);
        } else {
          setFaelle(data.results || []);
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
    fetchFaelle(currentFilters, newPage);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const getStatusLabel = (code: string) => {
    switch (code) {
      case 'O': return 'Offen';
      case 'L': return 'Laufend';
      case 'A': return 'Abgeschlossen';
      case 'G': return 'Gelöscht';
      default: return code;
    }
  };

  const getStatusColor = (code: string) => {
    switch (code) {
      case 'O': return { bg: '#e0e7ff', text: '#3730a3' }; // Indigo
      case 'L': return { bg: '#dcfce7', text: '#166534' }; // Green
      case 'A': return { bg: '#f3f4f6', text: '#374151' }; // Gray
      case 'G': return { bg: '#fee2e2', text: '#991b1b' }; // Red
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

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
              Fälle
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                margin: "5px 0 0 0",
              }}
            >
              Verwalten Sie alle Fälle und Beratungen
            </p>
          </div>

          <Link
            href="/dashboard/fall/create"
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
            + Fall erstellen
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
            <FallFilter definition={formDefinition} onSearch={(f) => fetchFaelle(f, 1)} />
          ) : (
            <p className="text-sm text-gray-500">Lade Filter...</p>
          )}
        </div>

        {/* LIST SECTION */}
        <div
          style={{
            padding: "30px 40px",
            backgroundColor: "#f9fafb",
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px"
          }}
        >
          {loading && <p style={{ textAlign: "center", color: "#6b7280" }}>Lade Fälle...</p>}
          {!loading && faelle.length === 0 && (
            <p style={{ textAlign: "center", color: "#6b7280" }}>Keine Fälle gefunden.</p>
          )}

          {!loading && faelle.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* Header Row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 100px 100px 1fr 1fr",
                  padding: "0 16px",
                  marginBottom: "5px",
                  fontWeight: "600",
                  color: "#6b7280",
                  fontSize: "13px",
                  gap: "15px"
                }}
              >
                <span>ID</span>
                <span>Startdatum</span>
                <span>Status</span>
                <span>Klient:in</span>
                <span>Mitarbeiter:in</span>
              </div>

              {faelle.map((f) => {
                const statusStyle = getStatusColor(f.status);
                return (
                  <div
                    key={f.fall_id}
                    onClick={() => router.push(`/dashboard/fall/edit/${f.fall_id}`)} // Assuming edit page exists or will exist
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 100px 100px 1fr 1fr",
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
                      #{f.fall_id}
                    </span>

                    {/* Date */}
                    <span style={{ color: "#374151", fontSize: "14px" }}>
                      {f.startdatum ? new Date(f.startdatum).toLocaleDateString("de-DE") : "-"}
                    </span>

                    {/* Status */}
                    <span style={{
                      display: "inline-block",
                      padding: "2px 10px",
                      borderRadius: "12px",
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      fontSize: "12px",
                      fontWeight: "500",
                      width: "fit-content"
                    }}>
                      {getStatusLabel(f.status)}
                    </span>

                    {/* Klient */}
                    <span style={{ color: "#4b5563", fontSize: "14px" }}>
                      {/* We expect populated klient info if available, or just ID */}
                      {f.klient_detail ? `Klient:in #${f.klient_detail.klient_id}` : `Klient:in #${f.klient}`}
                    </span>

                    {/* Mitarbeiter */}
                    <span style={{ color: "#4b5563", fontSize: "14px" }}>
                      {f.mitarbeiterin_detail ? `${f.mitarbeiterin_detail.vorname_mb} ${f.mitarbeiterin_detail.nachname_mb}` : "-"}
                    </span>
                  </div>
                );
              })}
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