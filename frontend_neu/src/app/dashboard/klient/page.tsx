'use client';

import { useState, useMemo } from 'react';
import { KlientFormDialog } from '@/components/klient/KlientFormDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Search, Plus, MoreHorizontal } from 'lucide-react';

/**
 * Mock-Daten für Klienten
 */
interface MockKlient {
  id: number;
  rolle: string;
  alter?: number;
  geschlecht: string;
  sexualitaet: string;
  wohnort: string;
  staatsangehoerigkeit: string;
  beruf: string;
  kontaktpunkt: string;
}

const MOCK_KLIENTEN: MockKlient[] = [
  {
    id: 1,
    rolle: 'Betroffene:r',
    alter: 28,
    geschlecht: 'cis weiblich',
    sexualitaet: 'heterosexuell',
    wohnort: 'Leipzig Stadt',
    staatsangehoerigkeit: 'Deutsch',
    beruf: 'Grafiker:in',
    kontaktpunkt: 'Polizei',
  },
  {
    id: 2,
    rolle: 'Angehörige:r',
    alter: 45,
    geschlecht: 'cis männlich',
    sexualitaet: 'heterosexuell',
    wohnort: 'Leipzig Land',
    staatsangehoerigkeit: 'Deutsch',
    beruf: 'Handwerker:in',
    kontaktpunkt: 'Freund:in',
  },
  {
    id: 3,
    rolle: 'Betroffene:r',
    alter: 32,
    geschlecht: 'trans weiblich',
    sexualitaet: 'lesbisch',
    wohnort: 'Nordsachsen',
    staatsangehoerigkeit: 'Deutsch',
    beruf: 'Sozialarbeiter:in',
    kontaktpunkt: 'Online-Recherche',
  },
  {
    id: 4,
    rolle: 'Fachkraft',
    alter: 52,
    geschlecht: 'cis weiblich',
    sexualitaet: 'heterosexuell',
    wohnort: 'Leipzig Stadt',
    staatsangehoerigkeit: 'Deutsch',
    beruf: 'Psycholog:in',
    kontaktpunkt: 'Beratungsstelle',
  },
];

/**
 * Klientenverwaltung - Übersichtsseite
 *
 * Zeigt eine Liste aller Klienten mit Suchfunktion
 * und Möglichkeit, neue Klienten zu erstellen.
 */
export default function KlientenPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [klienten, setKlienten] = useState<MockKlient[]>(MOCK_KLIENTEN);

  // Gefilterte Klienten basierend auf Suchbegriff
  const filteredKlienten = useMemo(() => {
    if (!searchTerm) return klienten;

    const term = searchTerm.toLowerCase();
    return klienten.filter((k) =>
      k.rolle.toLowerCase().includes(term) ||
      k.beruf.toLowerCase().includes(term) ||
      k.wohnort.toLowerCase().includes(term) ||
      k.staatsangehoerigkeit.toLowerCase().includes(term) ||
      k.kontaktpunkt.toLowerCase().includes(term)
    );
  }, [searchTerm, klienten]);

  const handleDialogSuccess = () => {
    // Hier würde man die Liste neu laden
    // z.B. durch einen API-Call oder setzen neuer Mock-Daten
    console.log('Klient:in erfolgreich erstellt. Liste wird aktualisiert...');
  };

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

          {/* Button "Neuer Klient" */}
          <button
            onClick={() => setIsDialogOpen(true)}
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
                  <TableRow key={klient.id}>
                    <TableCell className="font-medium text-gray-900">
                      #{klient.id}
                    </TableCell>
                    <TableCell>{klient.rolle}</TableCell>
                    <TableCell>
                      {klient.alter ? `${klient.alter} Jahre` : '–'}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {klient.geschlecht}
                    </TableCell>
                    <TableCell>{klient.wohnort}</TableCell>
                    <TableCell className="text-gray-600">
                      {klient.beruf}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {klient.kontaktpunkt}
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
      />
    </div>
  );
}
