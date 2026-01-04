'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/hooks/useAuth';
import {
  LayoutDashboard,
  Bell,
  PhoneIncoming,
  FolderOpen,
  PieChart,
  Settings,
  Users,
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
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
        active
          ? 'bg-blue-50 text-blue-700 font-medium'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon
          size={20}
          className={active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
        />
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span
          className={`text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center ${
            active ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
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
    <div className="mb-8">
      <h3 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
        {title}
      </h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  // Benutzerinitialen aus Vor- und Nachname
  const userInitials = user
    ? `${user.vorname_mb?.[0] || ''}${user.nachname_mb?.[0] || ''}`.toUpperCase() || 'JD'
    : 'JD';

  const userName = user?.vorname_mb && user?.nachname_mb 
    ? `${user.vorname_mb} ${user.nachname_mb}`
    : 'Jane Doe';

  const isAdmin = user?.rolle_mb === 'AD';
  const isErweiterung = user?.rolle_mb === 'E' || isAdmin;

  // Mock counts - später durch echte API-Daten ersetzen
  const notificationCount = 2;
  const anfrageCount = 2;
  const fallCount = 2;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-5 left-4 z-40 p-2 bg-white border border-slate-200 rounded-lg shadow-sm"
      >
        <Menu size={20} className="text-slate-600" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
          transform transition-transform duration-300 ease-in-out flex flex-col
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center mr-3 shadow-sm">
              <span className="text-white font-bold text-base">B</span>
            </div>
            <span className="font-semibold text-slate-900 tracking-tight text-[15px]">Bellis Statistik</span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4">
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
              label="Benachrichtigungen"
              count={notificationCount}
              active={pathname === '/dashboard/benachrichtigungen'}
            />
          </NavSection>

          <NavSection title="Datenerfassung">
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
              label="Beratungsfälle"
              count={fallCount}
              active={pathname.startsWith('/dashboard/fall')}
            />
          </NavSection>

          {isErweiterung && (
            <NavSection title="Analyse">
              <NavItem
                href="/dashboard/statistik"
                icon={PieChart}
                label="Statistik Export"
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

        {/* User Profile */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm flex-shrink-0">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900 truncate">
                {userName}
              </p>
              <p className="text-xs text-slate-500 truncate">
                Fachberatung Leipzig
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Abmelden"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
