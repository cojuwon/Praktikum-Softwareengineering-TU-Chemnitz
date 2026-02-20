"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { FieldDefinition } from "@/components/form/DynamicForm";
import AnfrageHeader from "@/components/dashboard/anfrage/list/AnfrageHeader";
import AnfrageFilterSection from "@/components/dashboard/anfrage/list/AnfrageFilterSection";
import AnfrageList from "@/components/dashboard/anfrage/list/AnfrageList";
import Pagination from "@/components/ui/pagination";
import { Archive, Trash2, FolderOpen } from "lucide-react";

type Tab = 'active' | 'archived' | 'trash';

export default function AnfrageListPage() {
  const router = useRouter();
  const [anfragen, setAnfragen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('active');

  // Pagination State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;
  // Note: Backend default is 10, should match or be dynamic. 
  // We'll rely on backend's count and page size.

  // Current filters
  const [currentFilters, setCurrentFilters] = useState<any>({});

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Initial Fetch based on Tab
  useEffect(() => {
    fetchFormDefinition();
    fetchAnfragen({}, 1, activeTab);
  }, [activeTab]);

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

  const fetchAnfragen = (filters: any, pageNum: number = 1, tab: Tab = activeTab, sorting = sortConfig) => {
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
    if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','));

    // Sorting
    if (sorting) {
      const prefix = sorting.direction === 'desc' ? '-' : '';
      params.append('ordering', `${prefix}${sorting.key}`);
    }

    // Handle Tabs
    let url = "/api/anfragen/";
    if (tab === 'trash') {
      url = "/api/anfragen/trashbin/";
    } else {
      if (tab === 'archived') {
        params.append('archived', 'true');
      } else {
        params.append('archived', 'false');
      }
    }

    const queryString = params.toString();
    const finalUrl = `${url}?${queryString}`;

    apiFetch(finalUrl)
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
    fetchAnfragen(currentFilters, newPage, activeTab);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const newSort = { key, direction };
    setSortConfig(newSort);
    fetchAnfragen(currentFilters, page, activeTab, newSort);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto w-full px-6">
      <AnfrageHeader />

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('active'); setPage(1); }}
          className={`pb-2 px-1 flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'active'
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <FolderOpen size={16} />
          Aktive Anfragen
        </button>
        <button
          onClick={() => { setActiveTab('archived'); setPage(1); }}
          className={`pb-2 px-1 flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'archived'
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Archive size={16} />
          Archiv
        </button>
        <button
          onClick={() => { setActiveTab('trash'); setPage(1); }}
          className={`pb-2 px-1 flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === 'trash'
            ? 'border-b-2 border-red-600 text-red-600'
            : 'text-gray-500 hover:text-gray-700'
            }`}
        >
          <Trash2 size={16} />
          Papierkorb
        </button>
      </div>

      <div className="bg-white rounded-b-xl overflow-visible shadow-sm">
        {(activeTab === 'active' || activeTab === 'archived') && (
          <AnfrageFilterSection
            formDefinition={formDefinition}
            onSearch={(f) => fetchAnfragen(f, 1, activeTab)}
          />
        )}

        <div className="px-10 py-8 bg-gray-50 rounded-b-xl">
          <AnfrageList
            anfragen={anfragen}
            loading={loading}
            onRowClick={(id) => router.push(`/dashboard/anfrage/edit/${id}`)}
            activeTab={activeTab}
            onActionComplete={() => fetchAnfragen(currentFilters, page, activeTab)}
            sortConfig={sortConfig}
            onSort={handleSort}
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