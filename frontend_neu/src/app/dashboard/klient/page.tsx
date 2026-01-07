'use client';

import { useState, useMemo, useEffect } from 'react';
import { KlientFormDialog, KLIENT_GESCHLECHT_CHOICES, KLIENT_ROLLE_CHOICES, KLIENT_WOHNORT_CHOICES } from '@/components/klient/KlientFormDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Search, Plus, MoreHorizontal, Filter } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import apiClient from '@/lib/api-client';
import { Switch } from '@/components/ui/Switch';



/**
 * Klientenverwaltung - Übersichtsseite
 *
 * Zeigt eine Liste aller Klienten mit Suchfunktion
 * und Möglichkeit, neue Klienten zu erstellen.
 */
import { ClientFilterToolbar, ClientFilters, ClientColumnVisibility } from '@/components/klient/ClientFilterToolbar';

// ... (imports)

export default function KlientenPage() {
  const { can, Permissions } = usePermissions();
  // Removed old searchTerm state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [klienten, setKlienten] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKlient, setSelectedKlient] = useState<any>(null);

  // Filter & Visibility State
  const [clientFilters, setClientFilters] = useState<ClientFilters>({});
  const [columnVisibility, setColumnVisibility] = useState<ClientColumnVisibility>({
    role: true,
    age: true,
    gender: true,
    job: true,
    nationality: true,
    residence: true,
    created: false
  });

  // Permission Checks
  const canViewAll = can(Permissions.VIEW_ALL_KLIENTIN);

  const fetchKlienten = async () => {
    setIsLoading(true);
    try {
      const params: any = {};

      // Permission specific view param
      if (canViewAll && showAll) {
        params.view = 'all';
      }

      // Add advanced filters
      if (clientFilters.search) params.search = clientFilters.search;
      if (clientFilters.klient_rolle) params.klient_rolle = clientFilters.klient_rolle;
      if (clientFilters.klient_geschlechtsidentitaet) params.klient_geschlechtsidentitaet = clientFilters.klient_geschlechtsidentitaet;
      if (clientFilters.klient_alter_gte) params.klient_alter__gte = clientFilters.klient_alter_gte;
      if (clientFilters.klient_alter_lte) params.klient_alter__lte = clientFilters.klient_alter_lte;
      if (clientFilters.klient_beruf) params.klient_beruf__icontains = clientFilters.klient_beruf;
      if (clientFilters.klient_staatsangehoerigkeit) params.klient_staatsangehoerigkeit__icontains = clientFilters.klient_staatsangehoerigkeit;
      if (clientFilters.klient_wohnort) params.klient_wohnort = clientFilters.klient_wohnort;

      const response = await apiClient.get('/klienten/', { params });
      setKlienten(Array.isArray(response.data) ? response.data : (response.data as any).results || []);
    } catch (error) {
      console.error('Fehler beim Laden der Klienten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce fetch if filters change (especially text search within toolbar)
    // The toolbar updates state immediately, so we debounce here
    const timer = setTimeout(() => {
      fetchKlienten();
    }, 300);
    return () => clearTimeout(timer);
  }, [showAll, canViewAll, clientFilters]); // Reload on any filter change

  const handleDialogSuccess = () => {
    fetchKlienten();
    setIsDialogOpen(false);
    setSelectedKlient(null);
  };

  const handleCreate = () => {
    setSelectedKlient(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (klient: any) => {
    setSelectedKlient(klient);
    setIsDialogOpen(true);
  };

  // Note: Client-side filtering 'filteredKlienten' is removed in favor of backend filtering
  // We use 'klienten' directly now.

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Klientenverwaltung</h1>
          <p className="text-gray-500 mt-1">
            Verwalten Sie alle Klienten und deren Informationen
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* New Filter Toolbar */}
        <ClientFilterToolbar
          onFilterChange={setClientFilters}
          onVisibilityChange={setColumnVisibility}
          initialVisibility={columnVisibility}
        />

        {/* Action Bar (Show All + New Button) */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            {canViewAll && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm">
                <Switch
                  checked={showAll}
                  onCheckedChange={setShowAll}
                  id="show-all-toggle"
                />
                <label htmlFor="show-all-toggle" className="font-medium text-gray-700 cursor-pointer select-none">
                  Alle anzeigen
                </label>
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Neuer Klient
          </button>
        </div>

        {/* Tabelle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {klienten.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-[80px]">ID</TableHead>
                  {columnVisibility.role && <TableHead>Rolle</TableHead>}
                  {columnVisibility.age && <TableHead>Alter</TableHead>}
                  {columnVisibility.gender && <TableHead>Geschlecht</TableHead>}
                  {columnVisibility.residence && <TableHead>Wohnort</TableHead>}
                  {columnVisibility.job && <TableHead>Beruf</TableHead>}
                  {columnVisibility.nationality && <TableHead>Nationalität</TableHead>}
                  {columnVisibility.created && <TableHead>Erstellt am</TableHead>}
                  <TableHead>Kontaktpunkt</TableHead>
                  <TableHead className="text-center">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {klienten.map((klient) => (
                  <TableRow key={klient.klient_id}>
                    <TableCell className="font-medium text-gray-900">
                      #{klient.klient_id}
                    </TableCell>
                    {columnVisibility.role && <TableCell>{KLIENT_ROLLE_CHOICES.find(c => c.value === klient.klient_rolle)?.label || klient.klient_rolle}</TableCell>}
                    {columnVisibility.age && <TableCell>{klient.klient_alter ? `${klient.klient_alter} Jahre` : '–'}</TableCell>}
                    {columnVisibility.gender && <TableCell>{KLIENT_GESCHLECHT_CHOICES.find(c => c.value === klient.klient_geschlechtsidentitaet)?.label || klient.klient_geschlechtsidentitaet}</TableCell>}
                    {columnVisibility.residence && <TableCell>{KLIENT_WOHNORT_CHOICES.find(c => c.value === klient.klient_wohnort)?.label || klient.klient_wohnort}</TableCell>}
                    {columnVisibility.job && <TableCell>{klient.klient_beruf || '–'}</TableCell>}
                    {columnVisibility.nationality && <TableCell>{klient.klient_staatsangehoerigkeit || '–'}</TableCell>}
                    {columnVisibility.created && <TableCell>{klient.erstellt_am ? new Date(klient.erstellt_am).toLocaleDateString('de-DE') : '–'}</TableCell>}

                    <TableCell className="text-gray-600">
                      {klient.klient_kontaktpunkt}
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => handleEdit(klient)}
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Bearbeiten"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                Keine Klienten gefunden.
              </p>
            </div>
          )}
        </div>

        {/* Statistiken Footer */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <p>
            Zeige <span className="font-medium text-gray-900">{klienten.length}</span> Klienten
          </p>
        </div>
      </div>

      {/* Dialog */}
      <KlientFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={handleDialogSuccess}
        initialData={selectedKlient}
      />
    </div>
  );
}
