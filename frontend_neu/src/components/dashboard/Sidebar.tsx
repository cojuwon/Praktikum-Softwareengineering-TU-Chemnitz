'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Bell,
  MessageSquare,
  FolderOpen,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

// Mock useAuth hook - replace with actual auth context later
const useAuth = () => ({
  user: {
    vorname_mb: 'Jane',
    nachname_mb: 'Doe',
    email: 'jane.doe@bellis.de',
    beratungsstelle: 'Fachberatung Leipzig',
  },
});

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'Übersicht',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Benachrichtigungen', href: '/benachrichtigungen', icon: Bell, badge: 2 },
    ],
  },
  {
    title: 'Datenerfassung',
    items: [
      { name: 'Anfragen', href: '/anfragen', icon: MessageSquare, badge: 2 },
      { name: 'Beratungsfälle', href: '/faelle', icon: FolderOpen, badge: 2 },
    ],
  },
  {
    title: 'Analyse',
    items: [
      { name: 'Statistik Export', href: '/statistik', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Einstellungen', href: '/einstellungen', icon: Settings },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (vorname: string, nachname: string) => {
    return `${vorname.charAt(0)}${nachname.charAt(0)}`.toUpperCase();
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200">
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
          <span className="text-sm font-bold text-white">B</span>
        </div>
        <span className="text-base font-semibold text-slate-900">Bellis Statistik</span>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {navigation.map((group) => (
          <div key={group.title}>
            <h3 className="px-3 mb-2 text-xs font-medium tracking-wider uppercase text-slate-400">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm 
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-xs font-medium rounded-full
                          ${isActive 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-600'
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
            {getInitials(user.vorname_mb, user.nachname_mb)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-slate-900">
              {user.vorname_mb} {user.nachname_mb}
            </p>
            <p className="text-xs truncate text-slate-500">
              {user.beratungsstelle}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed z-50 p-2 bg-white border rounded-lg shadow-sm lg:hidden top-4 left-4 border-slate-200"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 
          flex flex-col flex-shrink-0 transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close Button */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute p-1 rounded-lg top-4 right-4 hover:bg-slate-100"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
        <NavContent />
      </aside>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-white border-r border-slate-200">
        <NavContent />
      </aside>
    </>
  );
}
