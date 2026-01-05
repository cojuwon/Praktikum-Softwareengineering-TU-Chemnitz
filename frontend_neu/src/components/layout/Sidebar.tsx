"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  FolderOpen,
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
    href: "/dashboard/faelle",
    icon: <FolderOpen className="w-5 h-5" />,
  },
  {
    label: "Anfragen",
    href: "/dashboard/anfragen",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    label: "Klient:innen",
    href: "/dashboard/klientinnen",
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

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
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

      {/* Footer mit Logout */}
      <div className="sidebar-footer">
        <button className="logout-button">
          <LogOut className="w-5 h-5" />
          <span>Abmelden</span>
        </button>
      </div>
    </aside>
  );
}
