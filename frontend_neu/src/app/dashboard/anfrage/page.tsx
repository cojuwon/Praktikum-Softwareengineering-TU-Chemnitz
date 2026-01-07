'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { apiClient } from '@/lib/api-client';
import { Permissions } from '@/types/auth';
import {
  Anfrage,
  AnfrageListResponse,
  formatDatum,
  getStandortLabel,
  getAnfragePersonLabel,
  getAnfrageArtLabel,
  STANDORT_CHOICES,
  ANFRAGE_ART_CHOICES,
  ANFRAGE_PERSON_CHOICES
} from '@/types/anfrage';
import { AnfrageFormDialog } from '@/components/anfrage';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  ShieldAlert,
  Filter,
  X,
  Eye,
  User,
  Trash2,
  Edit2
} from 'lucide-react';

// Types für Filter und Sortierung
interface AnfrageFilters {
  search: string;
  mitarbeiterin: string;
  anfrage_art: string;
  anfrage_ort: string;
  anfrage_person: string;
  datum_von: string;
  datum_bis: string;
}

interface Mitarbeiterin {
  id: number;
  vorname_mb: string;
  nachname_mb: string;
}

// Pagination Konstante
const ITEMS_PER_PAGE = 10;

const initialFilters: AnfrageFilters = {
  search: '',
  mitarbeiterin: '',
  anfrage_art: '',
  anfrage_ort: '',
  anfrage_person: '',
  datum_von: '',
  datum_bis: '',
};

/**
 * Anfragen-Liste Seite
 * 
 * Zeigt eine tabellarische Übersicht der Anfragen mit:
 * - Fuzzy-Textsuche
 * - Filter nach Mitarbeiter:in, Art, Ort, Person, Datum
 * - Sortierung nach verschiedenen Feldern
 * 
 * Die Seite ist immer zugänglich, der Inhalt hängt von den Permissions ab:
 * - api.can_view_all_anfragen: Zeigt alle Anfragen (Admins)
 * - api.can_view_own_anfragen: Zeigt nur eigene Anfragen (Standard-User)
 * - Keine Permission: Zeigt Hinweis, dass keine Berechtigung vorhanden
 * 
 * Backend Endpoint: GET /api/anfragen/
 * - Filtert automatisch basierend auf User-Permissions
 */
export default function AnfragePage() {
  const { can } = usePermissions();

  // Data State
  const [anfragen, setAnfragen] = useState<Anfrage[]>([]);
  const [mitarbeiterList, setMitarbeiterList] = useState<Mitarbeiterin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState<AnfrageFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog State
  const [isAnfrageDialogOpen, setIsAnfrageDialogOpen] = useState(false);

  // Permission Checks
  const hasViewAllPermission = can(Permissions.VIEW_ALL_ANFRAGEN);
  const hasViewOwnPermission = can(Permissions.VIEW_OWN_ANFRAGEN);
  const hasAnyViewPermission = hasViewAllPermission || hasViewOwnPermission;
  const hasAddPermission = can(Permissions.ADD_ANFRAGE);
  const hasDeletePermission = can(Permissions.DELETE_ANFRAGE);
  const hasChangePermission = can(Permissions.CHANGE_ANFRAGE);

  // State for Edit/Delete
  const [selectedAnfrage, setSelectedAnfrage] = useState<Anfrage | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  // Build query string from filters
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set('search', filters.search);
    if (filters.mitarbeiterin) params.set('mitarbeiterin', filters.mitarbeiterin);
    if (filters.anfrage_art) params.set('anfrage_art', filters.anfrage_art);
    if (filters.anfrage_ort) params.set('anfrage_ort', filters.anfrage_ort);
    if (filters.anfrage_person) params.set('anfrage_person', filters.anfrage_person);
    if (filters.datum_von) params.set('datum_von', filters.datum_von);
    if (filters.datum_bis) params.set('datum_bis', filters.datum_bis);

    // Standardsortierung nach Datum absteigend
    params.set('ordering', '-anfrage_datum');

    return params.toString();
  }, [filters]);

  // Fetch Anfragen from Backend
  const fetchAnfragen = useCallback(async () => {
    if (!hasAnyViewPermission) {
      setIsLoading(false);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const queryString = buildQueryString();
      const url = `/anfragen/${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<Anfrage[] | AnfrageListResponse>(url);

      const data = response.data;
      if (Array.isArray(data)) {
        setAnfragen(data);
      } else if ('results' in data && Array.isArray(data.results)) {
        setAnfragen(data.results);
      } else {
        setAnfragen([]);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Anfragen:', err);
      setError('Die Anfragen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [hasAnyViewPermission, buildQueryString]);

  // Fetch Mitarbeiter:innen für Filter-Dropdown (nur für Admins)
  const fetchMitarbeiter = useCallback(async () => {
    if (!hasViewAllPermission) return;

    try {
      const response = await apiClient.get<Mitarbeiterin[]>('/konten/');
      if (Array.isArray(response.data)) {
        setMitarbeiterList(response.data);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Mitarbeiter:innen:', err);
    }
  }, [hasViewAllPermission]);

  // Initial Load
  useEffect(() => {
    fetchAnfragen();
    fetchMitarbeiter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search - refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!isLoading) {
        fetchAnfragen();
        setCurrentPage(1); // Reset zur ersten Seite bei Filteränderung
      }
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Filter handlers
  const handleFilterChange = (key: keyof AnfrageFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  // Actions
  const handleEdit = (anfrage: Anfrage) => {
    setSelectedAnfrage(anfrage);
    setIsAnfrageDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diese Anfrage wirklich löschen?')) return;

    setIsDeleting(id);
    try {
      await apiClient.delete(`/anfragen/${id}/`);
      // Update list locally
      setAnfragen(prev => prev.filter(a => a.anfrage_id !== id));
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
      setError('Fehler beim Löschen der Anfrage');
    } finally {
      setIsDeleting(null);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== '');
  }, [filters]);

  // Pagination berechnen
  const totalPages = Math.ceil(anfragen.length / ITEMS_PER_PAGE);
  const paginatedAnfragen = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return anfragen.slice(start, start + ITEMS_PER_PAGE);
  }, [anfragen, currentPage]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== '').length;
  }, [filters]);

  // Berechne Anzeigetext basierend auf Permissions
  const getSubtitleText = () => {
    if (hasViewAllPermission) {
      return 'Übersicht aller eingegangenen Anfragen';
    }
    if (hasViewOwnPermission) {
      return 'Ihre Anfragen verwalten';
    }
    return 'Keine Berechtigung zur Anzeige von Anfragen';
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="page-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Anfragen</h1>
            <p className="page-subtitle">Übersicht der Anfragen</p>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
          <p className="text-gray-500">Anfragen werden geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="page-container">
        <header className="page-header">
          <div>
            <h1 className="page-title">Anfragen</h1>
            <p className="page-subtitle">Übersicht der Anfragen</p>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-amber-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Anfrage Dialog */}
      <AnfrageFormDialog
        isOpen={isAnfrageDialogOpen}
        onClose={() => {
          setIsAnfrageDialogOpen(false);
          setSelectedAnfrage(null);
        }}
        onSuccess={() => {
          fetchAnfragen();
          setSelectedAnfrage(null);
        }}
        editData={selectedAnfrage}
      />

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Anfragen</h1>
        <p className="text-gray-500">{getSubtitleText()}</p>
        {hasAddPermission && (
          <button
            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 mt-1"
            onClick={() => setIsAnfrageDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Neue Anfrage</span>
          </button>
        )}
      </header>

      {/* Keine Permission - Hinweis anzeigen */}
      {!hasAnyViewPermission && (
        <div className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-lg font-medium text-gray-700 mb-2">Keine Berechtigung</h2>
          <p className="text-gray-500 text-center max-w-md">
            Sie haben keine Berechtigung, Anfragen einzusehen.
            Bitte wenden Sie sich an Ihre:n Administrator:in, wenn Sie Zugriff benötigen.
          </p>
        </div>
      )}

      {/* Hauptbereich - nur wenn Permission vorhanden */}
      {hasAnyViewPermission && (
        <div className="relative">
          {/* Toolbar: Suche, Filter, Ansicht, Anzahl */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
            {/* Textsuche */}
            <div className="flex-1 w-full sm:max-w-sm relative">
              <input
                type="text"
                placeholder="Suche nach Datum, Art, Person, Ort..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-1.5 border-b border-gray-300 text-sm focus:outline-none focus:border-primary-500 bg-transparent"
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm transition-colors ${showFilters || hasActiveFilters
                ? 'text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFiltersCount > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-primary-600 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Ansicht Button */}
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Eye className="w-4 h-4" />
              Ansicht
            </button>

            {/* Spacer */}
            <div className="flex-1 hidden sm:block" />

            {/* Anzahl */}
            <div className="text-sm text-gray-500">
              <span className="text-primary-600 font-medium">{anfragen.length}</span>
              <span className="ml-0.5">{anfragen.length === 1 ? 'Anfrage' : 'Anfragen'}</span>
            </div>
          </div>

          {/* Erweiterte Filter */}
          {showFilters && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mitarbeiter:in Filter (nur für Admins) */}
                {hasViewAllPermission && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mitarbeiter:in
                    </label>
                    <select
                      value={filters.mitarbeiterin}
                      onChange={(e) => handleFilterChange('mitarbeiterin', e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Alle</option>
                      {mitarbeiterList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.vorname_mb} {m.nachname_mb}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Art Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Art
                  </label>
                  <select
                    value={filters.anfrage_art}
                    onChange={(e) => handleFilterChange('anfrage_art', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Alle</option>
                    {Object.entries(ANFRAGE_ART_CHOICES).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Ort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ort
                  </label>
                  <select
                    value={filters.anfrage_ort}
                    onChange={(e) => handleFilterChange('anfrage_ort', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Alle</option>
                    {Object.entries(STANDORT_CHOICES).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Person Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Person
                  </label>
                  <select
                    value={filters.anfrage_person}
                    onChange={(e) => handleFilterChange('anfrage_person', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Alle</option>
                    {Object.entries(ANFRAGE_PERSON_CHOICES).map(([code, label]) => (
                      <option key={code} value={code}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Datum von */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum von
                  </label>
                  <input
                    type="date"
                    value={filters.datum_von}
                    onChange={(e) => handleFilterChange('datum_von', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Datum bis */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum bis
                  </label>
                  <input
                    type="date"
                    value={filters.datum_bis}
                    onChange={(e) => handleFilterChange('datum_bis', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Filter löschen Button */}
              {hasActiveFilters && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3.5 h-3.5" />
                    Filter löschen
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Lade-Indikator beim Suchen */}
          {isSearching && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            </div>
          )}

          {/* Tabelle */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Datum
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Art
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Ort
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Person
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Weg
                  </th>
                  {hasViewAllPermission && (
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                      Mitarbeiter:in
                    </th>
                  )}
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedAnfragen.length === 0 ? (
                  <tr>
                    <td colSpan={hasViewAllPermission ? 8 : 7} className="px-4 py-12 text-center text-gray-500">
                      <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">
                        {hasActiveFilters
                          ? 'Keine Anfragen gefunden'
                          : hasViewOwnPermission && !hasViewAllPermission
                            ? 'Sie haben noch keine eigenen Anfragen'
                            : 'Keine Anfragen vorhanden'}
                      </p>
                      {hasActiveFilters && (
                        <p className="text-sm mt-1">Versuchen Sie andere Filterkriterien</p>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedAnfragen.map((anfrage) => (
                    <tr
                      key={anfrage.anfrage_id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatDatum(anfrage.anfrage_datum)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getAnfrageArtLabel(anfrage.anfrage_art)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getStandortLabel(anfrage.anfrage_ort)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {getAnfragePersonLabel(anfrage.anfrage_person)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {anfrage.anfrage_weg || '–'}
                      </td>
                      {hasViewAllPermission && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {anfrage.mitarbeiterin_display ? (
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              {anfrage.mitarbeiterin_display}
                            </span>
                          ) : (
                            <span className="text-gray-400">–</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm">
                        {anfrage.fall ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Fall
                          </span>
                        ) : anfrage.beratungstermin ? (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <Clock className="w-3.5 h-3.5" />
                            Termin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500">
                            <Clock className="w-3.5 h-3.5" />
                            Offen
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                            onClick={() => {
                              console.log('Details:', anfrage.anfrage_id);
                            }}
                            title="Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {hasChangePermission && (
                            <button
                              className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                              onClick={() => handleEdit(anfrage)}
                              title="Bearbeiten"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {hasDeletePermission && (
                            <button
                              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                              onClick={() => handleDelete(anfrage.anfrage_id)}
                              disabled={isDeleting === anfrage.anfrage_id}
                              title="Löschen"
                            >
                              {isDeleting === anfrage.anfrage_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-end gap-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                ← Vorherige
              </button>

              <span className="text-sm text-gray-500">
                Seite {currentPage}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                Nächste →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
