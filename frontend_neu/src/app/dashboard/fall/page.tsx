'use client';

import { useState, useMemo } from 'react';
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

/**
 * Mock-Daten für Fälle
 */
interface MockFall {
  id: number;
  titel: string;
  klient_id: number;
  klient_name: string;
  status: 'O' | 'L' | 'A' | 'G';
  startdatum: string;
  notizen?: string;
}

const MOCK_FALLE: MockFall[] = [
  {
    id: 101,
    titel: 'Fall - Gewalt in Beziehung',
    klient_id: 1,
    klient_name: 'Sarah M.',
    status: 'L',
    startdatum: '2025-11-15',
    notizen: 'Wird regelmäßig betreut',
  },
  {
    id: 102,
    titel: 'Fall - Häusliche Gewalt',
    klient_id: 2,
    klient_name: 'Thomas K.',
    status: 'O',
    startdatum: '2025-12-10',
    notizen: 'Eben eingegangen',
  },
  {
    id: 103,
    titel: 'Fall - Körperverletzung',
    klient_id: 3,
    klient_name: 'Lisa B.',
    status: 'L',
    startdatum: '2025-10-01',
  },
  {
    id: 104,
    titel: 'Fall - Begleitung zur Polizei',
    klient_id: 4,
    klient_name: 'Anna Schmidt',
    status: 'A',
    startdatum: '2025-09-20',
  },
];

const STATUS_MAP = {
  O: { label: 'Offen', variant: 'warning' as const },
  L: { label: 'Laufend', variant: 'info' as const },
  A: { label: 'Abgeschlossen', variant: 'success' as const },
  G: { label: 'Gelöscht', variant: 'danger' as const },
};

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'Alle Statusse' },
  { value: 'O', label: 'Offen' },
  { value: 'L', label: 'Laufend' },
  { value: 'A', label: 'Abgeschlossen' },
  { value: 'G', label: 'Gelöscht' },
];

/**
 * Fallübersicht - Hauptseite
 *
 * Zeigt eine Übersicht aller Fälle mit Filterung nach Status
 * und Suchfunktion. Ermöglicht das Erstellen neuer Fälle.
 */
export default function FallPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [falle, setFalle] = useState<MockFall[]>(MOCK_FALLE);

  // Gefilterte Fälle basierend auf Suchbegriff und Status
  const filteredFalle = useMemo(() => {
    let result = falle;

    // Nach Status filtern
    if (statusFilter) {
      result = result.filter((f) => f.status === statusFilter);
    }

    // Nach Suchbegriff filtern
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (f) =>
          f.titel.toLowerCase().includes(term) ||
          f.klient_name.toLowerCase().includes(term) ||
          f.notizen?.toLowerCase().includes(term)
      );
    }

    return result;
  }, [searchTerm, statusFilter, falle]);

  // Liste der Klienten für den Dialog
  const klientenListe = useMemo(() => {
    // Extrahiere unique Klienten aus den Fällen und Mock-Klienten
    return [
      { id: 1, label: 'Sarah M.' },
      { id: 2, label: 'Thomas K.' },
      { id: 3, label: 'Lisa B.' },
      { id: 4, label: 'Anna Schmidt' },
      { id: 5, label: 'Michael J.' },
    ];
  }, []);

  const handleDialogSuccess = () => {
    // Hier würde man die Liste neu laden
    console.log('Fall erfolgreich erstellt. Liste wird aktualisiert...');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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
              placeholder="Suche nach Titel, Klient, Notizen..."
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
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

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
                  <TableHead>Startdatum</TableHead>
                  <TableHead>Notizen</TableHead>
                  <TableHead className="text-center">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFalle.map((fall) => {
                  const statusInfo = STATUS_MAP[fall.status];
                  return (
                    <TableRow key={fall.id}>
                      <TableCell className="font-medium text-gray-900">
                        #{fall.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {fall.titel}
                      </TableCell>
                      <TableCell>{fall.klient_name}</TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(fall.startdatum)}</TableCell>
                      <TableCell className="text-gray-600 text-sm max-w-xs truncate">
                        {fall.notizen || '–'}
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
                {searchTerm || statusFilter
                  ? 'Keine Fälle gefunden, die Ihren Filterkriterien entsprechen.'
                  : 'Keine Fälle vorhanden.'}
              </p>
              {(searchTerm || statusFilter) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium mt-2"
                >
                  Filter zurücksetzen
                </button>
              )}
            </div>
          )}
        </div>

        {/* Statistiken Footer */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600 gap-4">
          <p>
            Zeige{' '}
            <span className="font-medium text-gray-900">
              {filteredFalle.length}
            </span>{' '}
            von{' '}
            <span className="font-medium text-gray-900">{falle.length}</span>{' '}
            Fällen
          </p>

          {/* Status-Übersicht */}
          <div className="flex flex-wrap gap-4">
            {Object.entries(STATUS_MAP).map(([key, value]) => {
              const count = falle.filter((f) => f.status === key).length;
              return (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant={value.variant}>{count}</Badge>
                  <span className="text-gray-600">{value.label}</span>
                </div>
              );
            })}
          </div>
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
