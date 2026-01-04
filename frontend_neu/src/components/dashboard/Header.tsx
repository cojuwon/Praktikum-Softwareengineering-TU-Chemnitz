'use client';

import { usePathname } from 'next/navigation';
import { Search, Plus } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  // Einfache Logik für den Seitentitel
  const getPageTitle = () => {
    if (pathname.includes('/anfrage')) return 'Anfragenverwaltung';
    if (pathname.includes('/fall')) return 'Fallakten';
    if (pathname.includes('/statistik')) return 'Statistik & Export';
    if (pathname.includes('/einstellungen')) return 'Systemeinstellungen';
    return 'Dashboard Übersicht';
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
      
      {/* Linke Seite: Titel (Mobile padding beachten wegen Menu Button) */}
      <div className="flex items-center pl-10 lg:pl-0">
        <h1 className="text-sm font-semibold text-slate-900 lg:text-base">
          {getPageTitle()}
        </h1>
      </div>

      {/* Rechte Seite: Aktionen */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex relative group">
          <Search 
            size={14} 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" 
          />
          <input 
            type="text" 
            placeholder="Suchen..." 
            className="pl-9 pr-4 py-1.5 w-64 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-50 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1.5 bg-white">⌘K</span>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden md:block" />

        <button className="hidden md:inline-flex items-center justify-center h-8 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-sm transition-all active:scale-95">
          <Plus size={14} className="mr-1.5" />
          Neuer Eintrag
        </button>
        
        {/* Mobile "+" Button */}
        <button className="md:hidden flex items-center justify-center h-8 w-8 bg-slate-900 text-white rounded-md">
          <Plus size={16} />
        </button>
      </div>
    </header>
  );
}