"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  FolderOpen,
  User,
  ShieldAlert,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    label: "Fälle",
    href: "/dashboard/fall",
    icon: <FolderOpen className="w-5 h-5" />,
  },
  {
    label: "Anfragen",
    href: "/dashboard/anfrage",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "Klient:innen",
    href: "/dashboard/klient",
    icon: <Users className="w-5 h-5" />,
  },
  {
    label: "Statistik",
    href: "/dashboard/statistik",
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: "Einstellungen",
    href: "/dashboard/einstellungen",
    icon: <Settings className="w-5 h-5" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo & Titel Bereich */}
      <div className="sidebar-header">
        <div className="logo-container">
          <Image
            src="/bellis-favicon.png"
            alt="Bellis e.V. Logo"
            width={72}
            height={72}
            className="logo-image"
            priority
          />
        </div>
        <h1 className="sidebar-title">Bellis e.V. Leipzig</h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-item ${isActive(item.href) ? "nav-item-active" : ""}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer mit User Info und Logout */}
      <div className="sidebar-footer">
        {/* Admin Link - nur für Admins sichtbar */}
        {user && (user.rolle_mb === 'AD' || user.permissions?.includes('api.can_manage_users')) && (
          <Link
            href="/dashboard/admin"
            className={`nav-item ${isActive("/dashboard/admin") ? "nav-item-active" : ""}`}
            style={{ marginBottom: '0.5rem' }}
          >
            <span className="nav-icon"><ShieldAlert className="w-5 h-5" /></span>
            <span className="nav-label">Admin</span>
          </Link>
        )}

        {user && (
          <div className="user-info">
            <div className="user-avatar">
              <User className="w-5 h-5" />
            </div>
            <div className="user-details">
              <span className="user-name">
                {user.vorname_mb} {user.nachname_mb}
              </span>
              <span className="user-email">{user.mail_mb}</span>
            </div>
          </div>
        )}

        <button className="logout-button" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          <span>Abmelden</span>
        </button>
      </div>
    </aside>
  );
}
