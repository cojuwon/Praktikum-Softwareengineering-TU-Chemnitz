'use client';

import { usePathname } from 'next/navigation';
import { Search, Plus } from 'lucide-react';

// Route to title mapping
const routeTitles: Record<string, string> = {
  '/': 'Übersicht',
  '/benachrichtigungen': 'Benachrichtigungen',
  '/anfragen': 'Anfragen',
  '/faelle': 'Beratungsfälle',
  '/statistik': 'Statistik Export',
  '/einstellungen': 'Einstellungen',
};

export default function Header() {
  const pathname = usePathname();
  const title = routeTitles[pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200">
      {/* Page Title - with left padding on mobile for menu button */}
      <h1 className="text-lg font-semibold text-slate-900 pl-12 lg:pl-0">
        {title}
      </h1>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Suchen..."
            className="w-64 py-2 pl-10 pr-4 text-sm transition-colors border rounded-lg bg-slate-50 border-slate-200 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Mobile Search Button */}
        <button className="p-2 transition-colors rounded-lg sm:hidden hover:bg-slate-50">
          <Search className="w-5 h-5 text-slate-500" />
        </button>

        {/* New Button */}
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Neu</span>
        </button>
      </div>
    </header>
  );
}
