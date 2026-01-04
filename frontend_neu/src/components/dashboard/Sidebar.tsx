'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
// Stelle sicher, dass du den 'hooks' Ordner in 'frontend_neu/src/' kopiert hast
import { useAuth } from '@/hooks/useAuth'; 
import {
  LayoutDashboard,
  Bell,
  PhoneIncoming,
  FolderOpen,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, count, active }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group mb-0.5 ${
        active
          ? 'bg-white text-blue-700 font-medium shadow-sm border border-slate-200/60'
          : 'text-slate-500 hover:bg-slate-100/50 hover:text-slate-900 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={18}
          className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
        />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full min-w-[20px] text-center border ${
            active 
              ? 'bg-blue-50 text-blue-700 border-blue-100' 
              : 'bg-slate-100 text-slate-500 border-slate-200'
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {title}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  // Falls useAuth noch nicht existiert, entferne den Hook temporär und nutze Mock-Daten
  const { user, logout } = useAuth(); 
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    if (logout) await logout();
    window.location.href = '/login';
  };

  const userInitials = user?.vorname_mb && user?.nachname_mb
    ? `${user.vorname_mb[0]}${user.nachname_mb[0]}`.toUpperCase()
    : 'JD';

  const userName = user?.vorname_mb && user?.nachname_mb 
    ? `${user.vorname_mb} ${user.nachname_mb}`
    : 'Jane Doe';

  const isAdmin = user?.rolle_mb === 'AD';
  const isErweiterung = user?.rolle_mb === 'E' || isAdmin;

  // Beispiel-Zähler (könnten später aus einer API kommen)
  const notificationCount = 2;
  const anfrageCount = 3;

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-500"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-50/50 border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out flex flex-col
          h-dvh flex-shrink-0 backdrop-blur-xl
          lg:static lg:translate-x-0 lg:bg-slate-50/50
          ${isMobileOpen ? 'translate-x-0 shadow-xl bg-white' : '-translate-x-full'}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight">Bellis</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-slate-200">
          <NavSection title="Übersicht">
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              active={pathname === '/dashboard'}
            />
            <NavItem
              href="/dashboard/benachrichtigungen"
              icon={Bell}
              label="Mitteilungen"
              count={notificationCount}
              active={pathname === '/dashboard/benachrichtigungen'}
            />
          </NavSection>

          <NavSection title="Fallmanagement">
            <NavItem
              href="/dashboard/anfrage"
              icon={PhoneIncoming}
              label="Anfragen"
              count={anfrageCount}
              active={pathname.startsWith('/dashboard/anfrage')}
            />
            <NavItem
              href="/dashboard/fall"
              icon={FolderOpen}
              label="Akten"
              active={pathname.startsWith('/dashboard/fall')}
            />
          </NavSection>

          {isErweiterung && (
            <NavSection title="Analyse">
              <NavItem
                href="/dashboard/statistik"
                icon={PieChart}
                label="Statistiken"
                active={pathname.startsWith('/dashboard/statistik')}
              />
            </NavSection>
          )}

          <NavSection title="System">
            <NavItem
              href="/dashboard/einstellungen"
              icon={Settings}
              label="Einstellungen"
              active={pathname === '/dashboard/einstellungen'}
            />
          </NavSection>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm group">
            <div className="h-9 w-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs shadow-sm">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">
                {userName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">Fachberatung</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}