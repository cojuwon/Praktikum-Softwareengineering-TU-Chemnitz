'use client';

import { usePathname } from 'next/navigation';
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onNewEntry?: () => void;
}

export default function Header({ onNewEntry }: HeaderProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamischer Titel basierend auf Route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Übersicht';
    if (pathname.startsWith('/dashboard/anfrage')) return 'Anfragenverwaltung';
    if (pathname.startsWith('/dashboard/fall')) return 'Beratungsfälle';
    if (pathname.startsWith('/dashboard/statistik')) return 'Statistiken & Export';
    if (pathname.startsWith('/dashboard/admin')) return 'Administration';
    if (pathname.startsWith('/dashboard/benachrichtigungen')) return 'Benachrichtigungen';
    if (pathname.startsWith('/dashboard/einstellungen')) return 'Einstellungen';
    return 'Dashboard';
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div className="flex items-center">
        {/* Placeholder für mobile Menu - wird vom Sidebar gehandhabt */}
        <div className="lg:hidden w-12" />
        
        <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Suche */}
        <div className="hidden md:flex relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Neu Button */}
        <button
          onClick={onNewEntry}
          className="inline-flex items-center justify-center h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm transition-all"
        >
          <Plus size={16} className="mr-1.5" />
          Neu
        </button>
      </div>
    </header>
  );
}
