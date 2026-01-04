'use client';

import Link from 'next/link';
import { useAuth } from '@/src/hooks/useAuth';
import { FolderOpen, PhoneIncoming, PieChart, ArrowRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  // Mock-Statistiken (später durch echte API-Daten ersetzen)
  const stats = {
    activeCases: 3,
    newInquiries: 2,
    totalCases: 12,
  };

  // Mock Recent Cases (später durch echte API-Daten ersetzen)
  const recentCases = [
    { id: 'B-2401', initials: 'A.S.', category: 'Psychosoziale Beratung', lastUpdate: '2 Std.' },
    { id: 'B-2402', initials: 'K.M.', category: 'Krisenintervention', lastUpdate: '1 Tag' },
  ];

  const isErweiterung = user?.rolle_mb === 'E' || user?.rolle_mb === 'AD';

  return (
    <div className="space-y-6">
      {/* Begrüßung */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Willkommen zurück{user?.vorname_mb ? `, ${user.vorname_mb}` : ''}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Hier ist Ihre Übersicht für heute.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Aktive Fälle */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aktive Fälle</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-1">{stats.activeCases}</h3>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FolderOpen size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            Insgesamt {stats.totalCases} Fälle in 2025
          </div>
        </div>

        {/* Offene Anfragen */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Offene Anfragen</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-1">{stats.newInquiries}</h3>
            </div>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <PhoneIncoming size={20} />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">
            {stats.newInquiries} heute eingegangen
          </div>
        </div>

        {/* Statistik Export */}
        {isErweiterung && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Nächster Export</p>
                <h3 className="text-lg font-semibold text-slate-900 mt-1">30. Juni</h3>
              </div>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <PieChart size={20} />
              </div>
            </div>
            <Link
              href="/dashboard/statistik"
              className="mt-4 text-xs text-emerald-600 font-medium hover:underline flex items-center"
            >
              Zum Export <ArrowRight size={12} className="ml-1" />
            </Link>
          </div>
        )}
      </div>

      {/* Schnellzugriff: Zuletzt bearbeitet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-medium text-sm text-slate-900">Schnellzugriff: Zuletzt bearbeitet</h3>
          <Link href="/dashboard/fall" className="text-xs text-blue-600 hover:underline">
            Alle anzeigen
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentCases.length > 0 ? (
            recentCases.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/fall/${c.id}`}
                className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors block"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {c.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900">Fall {c.id}</div>
                    <div className="text-xs text-slate-500">{c.category}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">Vor {c.lastUpdate}</div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">
              Keine kürzlich bearbeiteten Fälle vorhanden.
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/anfrage"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100">
              <PhoneIncoming size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Neue Anfrage erfassen</div>
              <div className="text-xs text-slate-500">Telefonische oder E-Mail Anfrage dokumentieren</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
        </Link>

        <Link
          href="/dashboard/fall"
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 hover:bg-blue-50/30 transition-all group flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100">
              <FolderOpen size={20} />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900">Neuen Fall anlegen</div>
              <div className="text-xs text-slate-500">Beratungsfall erstellen und dokumentieren</div>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500" />
        </Link>
      </div>
    </div>
  );
}