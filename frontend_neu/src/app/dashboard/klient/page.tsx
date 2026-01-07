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
export default function KlientenPage() {
  const { can, Permissions } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [klienten, setKlienten] = useState<any[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKlient, setSelectedKlient] = useState<any>(null);

  // Permission Checks
  const canViewAll = can(Permissions.VIEW_ALL_KLIENTIN);

  const fetchKlienten = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      // Nur wenn User berechtigt ist und explizit "Alle" sehen will
      if (canViewAll && showAll) {
        params.view = 'all';
      }
      const response = await apiClient.get('/klienten/', { params });
      setKlienten(Array.isArray(response.data) ? response.data : (response.data as any).results || []);
    } catch (error) {
      console.error('Fehler beim Laden der Klienten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reload when filter toggles or initially
    fetchKlienten();
  }, [showAll, canViewAll]);

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

  // Gefilterte Klienten basierend auf Suchbegriff
  const filteredKlienten = useMemo(() => {
    if (!searchTerm) return klienten;

    const term = searchTerm.toLowerCase();
    return klienten.filter((k) =>
      (k.klient_rolle || '').toLowerCase().includes(term) ||
      (k.klient_beruf || '').toLowerCase().includes(term) ||
      (k.klient_wohnort || '').toLowerCase().includes(term) ||
      (k.klient_staatsangehoerigkeit || '').toLowerCase().includes(term) ||
      (k.klient_kontaktpunkt || '').toLowerCase().includes(term)
    );
  }, [searchTerm, klienten]);

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
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Suchfeld */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Suche nach Rolle, Beruf, Wohnort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Show All Toggle (Admin/Erweitert) */}
          {canViewAll && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg">
              <Switch
                checked={showAll}
                onCheckedChange={setShowAll}
                id="show-all-toggle"
              />
              <label htmlFor="show-all-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                Alle anzeigen
              </label>
            </div>
          )}

          {/* Button "Neuer Klient" */}
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            Neuer Klient
          </button>
        </div>

        {/* Tabelle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredKlienten.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Alter</TableHead>
                  <TableHead>Geschlechtsidentität</TableHead>
                  <TableHead>Wohnort</TableHead>
                  <TableHead>Beruf</TableHead>
                  <TableHead>Kontaktpunkt</TableHead>
                  <TableHead className="text-center">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKlienten.map((klient) => (
                  <TableRow key={klient.klient_id}>
                    <TableCell className="font-medium text-gray-900">
                      #{klient.klient_id}
                    </TableCell>
                    <TableCell>
                      {KLIENT_ROLLE_CHOICES.find(c => c.value === klient.klient_rolle)?.label || klient.klient_rolle}
                    </TableCell>
                    <TableCell>
                      {klient.klient_alter ? `${klient.klient_alter} Jahre` : '–'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {KLIENT_GESCHLECHT_CHOICES.find(c => c.value === klient.klient_geschlechtsidentitaet)?.label || klient.klient_geschlechtsidentitaet}
                    </TableCell>
                    <TableCell>
                      {KLIENT_WOHNORT_CHOICES.find(c => c.value === klient.klient_wohnort)?.label || klient.klient_wohnort}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {klient.klient_beruf}
                    </TableCell>
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
                {searchTerm
                  ? 'Keine Klienten gefunden, die Ihren Suchkriterien entsprechen.'
                  : 'Keine Klienten vorhanden.'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  Suche löschen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Statistiken Footer */}
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <p>
            Zeige{' '}
            <span className="font-medium text-gray-900">
              {filteredKlienten.length}
            </span>{' '}
            von{' '}
            <span className="font-medium text-gray-900">{klienten.length}</span>{' '}
            Klienten
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
