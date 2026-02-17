"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { FieldDefinition } from "@/components/form/DynamicForm";
import AnfrageHeader from "@/components/dashboard/anfrage/list/AnfrageHeader";
import AnfrageFilterSection from "@/components/dashboard/anfrage/list/AnfrageFilterSection";
import AnfrageList from "@/components/dashboard/anfrage/list/AnfrageList";
import Pagination from "@/components/ui/pagination";

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
    <div className="max-w-5xl mx-auto w-full px-6">
      <AnfrageHeader />

      <div className="bg-white rounded-b-xl overflow-visible shadow-sm">
        <AnfrageFilterSection
          formDefinition={formDefinition}
          onSearch={(f) => fetchAnfragen(f, 1)}
        />

        <div className="px-10 py-8 bg-gray-50 rounded-b-xl">
          <AnfrageList
            anfragen={anfragen}
            loading={loading}
            onRowClick={(id) => router.push(`/dashboard/anfrage/edit/${id}`)}
          />

          {!loading && count > 0 && (
            <Pagination
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