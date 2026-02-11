"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { FieldDefinition } from "@/components/form/DynamicForm";
import FallHeader from "@/components/dashboard/fall/list/FallHeader";
import FallFilterSection from "@/components/dashboard/fall/list/FallFilterSection";
import FallList from "@/components/dashboard/fall/list/FallList";
import FallPagination from "@/components/dashboard/fall/list/FallPagination";

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
    <div className="max-w-5xl mx-auto w-full px-6">
      <FallHeader />

      <div className="bg-white rounded-b-xl overflow-visible shadow-sm">
        <FallFilterSection
          formDefinition={formDefinition}
          onSearch={(f) => fetchFaelle(f, 1)}
        />

        <div className="px-10 py-8 bg-gray-50 rounded-b-xl">
          <FallList
            faelle={faelle}
            loading={loading}
            onRowClick={(id) => router.push(`/dashboard/fall/edit/${id}`)}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
          />

          {!loading && count > 0 && (
            <FallPagination
              page={page}
              totalPages={totalPages}
              count={count}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}