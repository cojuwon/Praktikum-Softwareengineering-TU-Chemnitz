"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { FieldDefinition } from "@/components/form/DynamicForm";
import FallHeader from "@/components/dashboard/fall/list/FallHeader";
import FallFilterSection from "@/components/dashboard/fall/list/FallFilterSection";
import FallList from "@/components/dashboard/fall/list/FallList";
import FallPagination from "@/components/dashboard/fall/list/FallPagination";
import { Archive, Trash2, FolderOpen } from "lucide-react";

type Tab = 'active' | 'archived' | 'trash';

export default function FallListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [faelle, setFaelle] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formDefinition, setFormDefinition] = useState<FieldDefinition[] | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<Tab>('active');

  // Pagination State
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const PAGE_SIZE = 10;

  // Current filters
  const [currentFilters, setCurrentFilters] = useState<any>({});

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Initial Fetch based on Tab
  useEffect(() => {
    fetchFormDefinition();

    // Check for initial filters from URL
    const initialFilters: any = {};
    const klientId = searchParams.get('klient_id');
    if (klientId) {
      initialFilters.klient = klientId;
    }

    fetchFaelle(initialFilters, 1, activeTab);
  }, [searchParams, activeTab]); // Re-fetch when tab or params change

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

  const fetchFaelle = (filters: any, pageNum: number = 1, tab: Tab = activeTab, sorting = sortConfig) => {
    setLoading(true);
    setCurrentFilters(filters);
    setPage(pageNum);

    const params = new URLSearchParams();
    // Pagination
    params.append('page', pageNum.toString());

    if (filters.search) params.append('search', filters.search);
    if (filters.datumVon) params.append('datum_von', filters.datumVon);
    if (filters.datumBis) params.append('datum_bis', filters.datumBis);
    if (filters.klient) params.append('klient', filters.klient);

    // Multi-select arrays -> comma separated string
    if (filters.status && filters.status.length > 0) params.append('status', filters.status.join(','));
    if (filters.mitarbeiterin && filters.mitarbeiterin.length > 0) params.append('mitarbeiterin', filters.mitarbeiterin.join(','));

    // Sorting
    if (sorting) {
      const prefix = sorting.direction === 'desc' ? '-' : '';
      params.append('ordering', `${prefix}${sorting.key}`);
    }

    // Handle Tabs
    let url = "/api/faelle/";
    if (tab === 'trash') {
      url = "/api/faelle/trashbin/";
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
    fetchFaelle(currentFilters, newPage, activeTab);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    const newSort = { key, direction };
    setSortConfig(newSort);
    fetchFaelle(currentFilters, page, activeTab, newSort);
  };

  const handleAction = (action: string, id: number) => {
    // Refresh list after action
    fetchFaelle(currentFilters, page, activeTab);
  };

  const totalPages = Math.ceil(count / PAGE_SIZE);

  const getStatusLabel = (code: string) => {
    switch (code) {
      case 'O': return 'Offen';
      case 'L': return 'Laufend';
      case 'A': return 'Abgeschlossen';
      default: return code;
    }
  };

  const getStatusColor = (code: string) => {
    switch (code) {
      case 'O': return { bg: '#e0e7ff', text: '#3730a3' }; // Indigo
      case 'L': return { bg: '#dcfce7', text: '#166534' }; // Green
      case 'A': return { bg: '#f3f4f6', text: '#374151' }; // Gray
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-6">
      <FallHeader />

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
          Aktive Fälle
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
          <FallFilterSection
            formDefinition={formDefinition}
            onSearch={(f) => fetchFaelle(f, 1, activeTab)}
          />
        )}

        <div className="px-10 py-8 bg-gray-50 rounded-b-xl">
          <FallList
            faelle={faelle}
            loading={loading}
            onRowClick={(id) => router.push(`/dashboard/fall/edit/${id}`)}
            getStatusLabel={getStatusLabel}
            getStatusColor={getStatusColor}
            activeTab={activeTab} // Pass activeTab to render correct actions
            onActionComplete={() => fetchFaelle(currentFilters, page, activeTab)}
            sortConfig={sortConfig}
            onSort={handleSort}
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