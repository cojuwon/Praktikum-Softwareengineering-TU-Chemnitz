'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/src/hooks/usePermissions';
import { Permission } from '@/src/types/auth';

interface PermissionGateProps {
  /**
   * Einzelne Berechtigung oder Array von Berechtigungen.
   * Bei einem Array wird standardmäßig "any" Logik verwendet (OR).
   */
  permission?: Permission | string | (Permission | string)[];
  
  /**
   * Bei mehreren Berechtigungen: "any" (mindestens eine) oder "all" (alle erforderlich)
   * @default "any"
   */
  mode?: 'any' | 'all';
  
  /**
   * Gruppenzugehörigkeit prüfen (alternative zu permission)
   */
  group?: string | string[];
  
  /**
   * Rolle prüfen (alternative zu permission)
   */
  role?: 'B' | 'E' | 'AD';
  
  /**
   * Nur für Admins anzeigen
   */
  adminOnly?: boolean;
  
  /**
   * Inhalt der angezeigt wird wenn berechtigt
   */
  children: ReactNode;
  
  /**
   * Optionaler Fallback-Inhalt wenn nicht berechtigt
   */
  fallback?: ReactNode;
}

/**
 * Komponente die Inhalte basierend auf Berechtigungen ein- oder ausblendet.
 * 
 * WICHTIG: Dies ist nur für UX-Verbesserung! Die echte Sicherheit wird im Backend durchgesetzt.
 * 
 * @example
 * ```tsx
 * // Einzelne Berechtigung
 * <PermissionGate permission={Permissions.DELETE_FALL}>
 *   <button>Löschen</button>
 * </PermissionGate>
 * 
 * // Mehrere Berechtigungen (OR)
 * <PermissionGate permission={[Permissions.CHANGE_FALL, Permissions.DELETE_FALL]}>
 *   <button>Bearbeiten</button>
 * </PermissionGate>
 * 
 * // Mehrere Berechtigungen (AND)
 * <PermissionGate 
 *   permission={[Permissions.VIEW_STATISTIK, Permissions.CAN_EXPORT_STATISTIK]} 
 *   mode="all"
 * >
 *   <button>Exportieren</button>
 * </PermissionGate>
 * 
 * // Mit Fallback
 * <PermissionGate 
 *   permission={Permissions.DELETE_FALL}
 *   fallback={<span className="text-gray-400">Keine Berechtigung</span>}
 * >
 *   <button>Löschen</button>
 * </PermissionGate>
 * 
 * // Admin-Only
 * <PermissionGate adminOnly>
 *   <AdminPanel />
 * </PermissionGate>
 * 
 * // Gruppenbasis
 * <PermissionGate group="Erweiterung">
 *   <ErweiterteFunktionen />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  mode = 'any',
  group,
  role,
  adminOnly,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, canAny, canAll, isMemberOf, isMemberOfAny, hasRole, isAdmin } = usePermissions();

  let hasAccess = false;

  // Admin-Only Check
  if (adminOnly) {
    hasAccess = isAdmin();
  }
  // Rollen-Check
  else if (role) {
    hasAccess = hasRole(role);
  }
  // Gruppen-Check
  else if (group) {
    if (Array.isArray(group)) {
      hasAccess = isMemberOfAny(group);
    } else {
      hasAccess = isMemberOf(group);
    }
  }
  // Permission-Check
  else if (permission) {
    if (Array.isArray(permission)) {
      hasAccess = mode === 'all' ? canAll(permission) : canAny(permission);
    } else {
      hasAccess = can(permission);
    }
  }
  // Kein Check definiert = immer anzeigen
  else {
    hasAccess = true;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export default PermissionGate;
