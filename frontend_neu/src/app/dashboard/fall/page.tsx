'use client';

import { useState, useMemo, useEffect } from 'react';
import { FallFormDialog } from '@/components/fall/FallFormDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { usePermissions } from '@/hooks/usePermissions';
import { Switch } from '@/components/ui/Switch';

/**
 * Fallübersicht - Hauptseite
 */
export default function FallPage() {
  const { can, Permissions } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [falle, setFalle] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Permission Checks
  const canViewAll = can(Permissions.VIEW_ALL_FALL);

  // Load Fälle from API
  const fetchFaelle = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (canViewAll && showAll) {
        params.view = 'all';
      }
      const response = await apiClient.get('/faelle/', { params });
      setFalle(Array.isArray(response.data) ? response.data : (response.data as any).results || []);
    } catch (error) {
      console.error('Fehler beim Laden der Fälle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFaelle();
  }, [showAll, canViewAll]);

  // Gefilterte Fälle basierend auf Suchbegriff und Status
  // Note: Status logic is approximated as Backend doesn't have status field yet
  const filteredFalle = useMemo(() => {
    let result = falle;

    // Nach Status filtern (Client-Side Logic derived from assignments)
    if (statusFilter) {
      result = result.filter((f) => {
        const status = f.mitarbeiterin ? 'L' : 'O';
        return status === statusFilter;
      });
    }

    // Nach Suchbegriff filtern
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.fall_id.toString().includes(term) ||
          (f.klient_detail?.klient_rolle || '').toLowerCase().includes(term) ||
          (f.klient_detail?.klient_beruf || '').toLowerCase().includes(term)
      );
    }

    return result;
  }, [searchTerm, statusFilter, falle]);

  const handleDialogSuccess = () => {
    fetchFaelle();
  };

  // Mock-Liste für Dialog (dieser sollte idealerweise auch API-Daten nutzen)
  const klientenListe = useMemo(() => [], []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Fallübersicht</h1>
          <p className="text-gray-500 mt-1">
            Verwalten Sie Fälle und deren Status
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Suchfeld */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Suche nach Fall-ID, Klient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status-Filter Dropdown */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              <Filter className="w-5 h-5" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
            >
              <option value="">Alle Statusse</option>
              <option value="O">Offen (Keine Mitarbeiterin)</option>
              <option value="L">Laufend (Zugewiesen)</option>
            </select>
          </div>

          {/* Toggle "Alle anzeigen" (Nur für User mit Berechtigung) */}
          {canViewAll && (
            <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">
              <Switch
                id="show-all-switch"
                checked={showAll}
                onCheckedChange={setShowAll}
              />
              <label htmlFor="show-all-switch" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                Alle Fälle
              </label>
            </div>
          )}

          {/* Button "Neuer Fall" */}
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Neuer Fall
          </button>
        </div>

        {/* Tabelle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredFalle.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Titel</TableHead>
                  <TableHead>Klient:in</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Info</TableHead>
                  <TableHead className="text-center">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFalle.map((fall) => {
                  const status = fall.mitarbeiterin ? 'L' : 'O';
                  const statusLabel = status === 'L' ? 'Laufend' : 'Offen';
                  const variant = status === 'L' ? 'info' : 'warning';

                  return (
                    <TableRow key={fall.fall_id}>
                      <TableCell className="font-medium text-gray-900">
                        #{fall.fall_id}
                      </TableCell>
                      <TableCell className="font-medium">
                        Fall #{fall.fall_id}
                      </TableCell>
                      <TableCell>
                        {fall.klient_detail ?
                          `Klient #${fall.klient} (${fall.klient_detail.klient_rolle})` :
                          `Klient #${fall.klient}`
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant={variant}>
                          {statusLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {fall.mitarbeiterin ? `Betreut von User #${fall.mitarbeiterin}` : 'Unzugewiesen'}
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          className="inline-flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Weitere Optionen"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">
                {searchTerm
                  ? 'Keine Fälle gefunden.'
                  : 'Keine Fälle vorhanden.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <FallFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        klientenListe={klientenListe}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
