'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import {
  FileText,
  Briefcase,
  BarChart,
  Settings,
  LogOut,
  User as UserIcon,
  LayoutDashboard
} from 'lucide-react';
import { useUser } from '@/lib/userContext';
import { logout } from '@/lib/auth';
import Image from 'next/image';

const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Anfrage', href: '/dashboard/anfrage', icon: FileText },
  { name: 'Fall', href: '/dashboard/fall', icon: Briefcase },
  { name: 'Statistik', href: '/dashboard/statistik', icon: BarChart },
  { name: 'Einstellungen', href: '/dashboard/settings', icon: Settings },
];

export default function SideNav() {
  const pathname = usePathname();
  const { user, setUser } = useUser();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
      setUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
      setUser(null);
      router.push('/login');
    }
  }

  // Helper to determine active state (exact match for dashboard root, startsWith for others)
  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname !== '/dashboard') return false;
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-100 shadow-sm">

      {/* Logo Section */}
      <div className="flex h-20 shrink-0 items-center px-6 border-b border-gray-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/bellis-favicon.png"
            alt="Bellis Logo"
            width={32}
            height={32}
            className="object-contain"
          />
          <span className="text-xl font-bold text-slate-800 tracking-tight">Bellis e.V.</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex grow flex-col gap-1 px-3 py-6">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                {
                  'bg-blue-50 text-blue-700 shadow-sm': active,
                  'text-gray-600 hover:bg-gray-50 hover:text-gray-900': !active,
                },
              )}
            >
              <LinkIcon className={clsx("w-5 h-5", { "text-blue-600": active })} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info & Logout */}
      {user && (
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold text-gray-900">
                {user.vorname_mb ? `${user.vorname_mb} ${user.nachname_mb}` : 'Benutzer'}
              </span>
              <span className="truncate text-xs text-gray-500">{user.mail_mb}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Abmelden</span>
          </button>
        </div>
      )}
    </div>
  );
}
