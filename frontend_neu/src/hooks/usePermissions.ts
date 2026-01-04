'use client';

import { useAuth } from './useAuth';
import { Permission, Permissions } from '@/types/auth';

/**
 * Hook für Permission-Handling im Frontend.
 * 
 * Das Frontend ist "dumm" und reagiert nur auf die Berechtigungs-Liste,
 * die der User beim Login erhält. Es blendet UI-Elemente aus, um die UX zu verbessern.
 * Die echte Sicherheit wird im Backend durchgesetzt (403 Forbidden bei unautorisierten Anfragen).
 * 
 * @example
 * ```tsx
 * const { can, isMemberOf, isAdmin, hasRole } = usePermissions();
 * 
 * // Prüfe auf konkretes Recht
 * if (can(Permissions.DELETE_FALL)) {
 *   // Zeige Löschen-Button
 * }
 * 
 * // Oder mit String
 * if (can('api.can_export_statistik')) {
 *   // Zeige Export-Button
 * }
 * 
 * // Prüfe auf Gruppenzugehörigkeit
 * if (isMemberOf('Admin')) {
 *   // Zeige Admin-Menü
 * }
 * ```
 */
export function usePermissions() {
  const { user } = useAuth();

  /**
   * Prüft ob der User eine bestimmte Berechtigung hat.
   * 
   * @param permission - Die zu prüfende Berechtigung (z.B. 'api.delete_fall' oder Permissions.DELETE_FALL)
   * @returns true wenn der User die Berechtigung hat
   * 
   * @example
   * ```tsx
   * // Mit Konstante (empfohlen)
   * can(Permissions.DELETE_FALL)
   * 
   * // Mit String
   * can('api.can_export_statistik')
   * ```
   */
  const can = (permission: Permission | string): boolean => {
    return user?.permissions.includes(permission) ?? false;
  };

  /**
   * Prüft ob der User eine von mehreren Berechtigungen hat (OR-Verknüpfung).
   * 
   * @param permissions - Array von Berechtigungen
   * @returns true wenn der User mindestens eine der Berechtigungen hat
   * 
   * @example
   * ```tsx
   * canAny([Permissions.CHANGE_FALL, Permissions.DELETE_FALL])
   * ```
   */
  const canAny = (permissions: (Permission | string)[]): boolean => {
    return permissions.some(permission => can(permission));
  };

  /**
   * Prüft ob der User alle angegebenen Berechtigungen hat (AND-Verknüpfung).
   * 
   * @param permissions - Array von Berechtigungen
   * @returns true wenn der User alle Berechtigungen hat
   * 
   * @example
   * ```tsx
   * canAll([Permissions.VIEW_STATISTIK, Permissions.CAN_EXPORT_STATISTIK])
   * ```
   */
  const canAll = (permissions: (Permission | string)[]): boolean => {
    return permissions.every(permission => can(permission));
  };

  /**
   * Prüft ob der User Mitglied einer bestimmten Gruppe ist.
   * Nützlich für grobe UI-Steuerung basierend auf Gruppenzugehörigkeit.
   * 
   * @param group - Name der Gruppe
   * @returns true wenn der User Mitglied der Gruppe ist
   * 
   * @example
   * ```tsx
   * isMemberOf('Admin')
   * isMemberOf('Erweiterung')
   * ```
   */
  const isMemberOf = (group: string): boolean => {
    return user?.groups.includes(group) ?? false;
  };

  /**
   * Prüft ob der User Mitglied einer von mehreren Gruppen ist.
   * 
   * @param groups - Array von Gruppennamen
   * @returns true wenn der User Mitglied mindestens einer Gruppe ist
   */
  const isMemberOfAny = (groups: string[]): boolean => {
    return groups.some(group => isMemberOf(group));
  };

  /**
   * Prüft ob der User die Admin-Rolle hat.
   * Shortcut für hasRole('AD')
   */
  const isAdmin = (): boolean => {
    return user?.rolle_mb === 'AD';
  };

  /**
   * Prüft ob der User mindestens die Erweiterung-Rolle hat.
   * Shortcut für hasRole('E') || hasRole('AD')
   */
  const isErweiterungOrHigher = (): boolean => {
    return user?.rolle_mb === 'E' || user?.rolle_mb === 'AD';
  };

  /**
   * Prüft ob der User eine bestimmte Rolle hat.
   * 
   * @param role - Die zu prüfende Rolle ('B', 'E', 'AD')
   * @returns true wenn der User diese Rolle hat
   */
  const hasRole = (role: 'B' | 'E' | 'AD'): boolean => {
    return user?.rolle_mb === role;
  };

  return {
    can,
    canAny,
    canAll,
    isMemberOf,
    isMemberOfAny,
    isAdmin,
    isErweiterungOrHigher,
    hasRole,
    // Exportiere auch die Permissions-Konstanten für einfachen Zugriff
    Permissions,
  };
}

export default usePermissions;
