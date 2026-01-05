/**
 * TypeScript Typen für das Benutzer- und Berechtigungssystem.
 */

/**
 * Benutzerrollen entsprechend dem Django Backend
 */
export type UserRole = 'B' | 'E' | 'AD';

export const UserRoleLabels: Record<UserRole, string> = {
  'B': 'Basis',
  'E': 'Erweiterung',
  'AD': 'Admin',
};

/**
 * Benutzer-Objekt wie es vom Backend /auth/user/ Endpoint zurückgegeben wird.
 * Enthält Berechtigungen und Gruppen für das Permission-Handling.
 */
export interface User {
  id: number;
  vorname_mb: string;
  nachname_mb: string;
  mail_mb: string;
  rolle_mb: UserRole;
  groups: string[];
  permissions: string[];
}

/**
 * Auth Context Zustand
 */
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

/**
 * Standard-Permissions für Django Models (automatisch generiert)
 */
export const StandardPermissions = {
  // Konto
  VIEW_KONTO: 'api.view_konto',
  ADD_KONTO: 'api.add_konto',
  CHANGE_KONTO: 'api.change_konto',
  DELETE_KONTO: 'api.delete_konto',
  
  // Fall
  VIEW_FALL: 'api.view_fall',
  ADD_FALL: 'api.add_fall',
  CHANGE_FALL: 'api.change_fall',
  DELETE_FALL: 'api.delete_fall',
  
  // Anfrage
  VIEW_ANFRAGE: 'api.view_anfrage',
  ADD_ANFRAGE: 'api.add_anfrage',
  CHANGE_ANFRAGE: 'api.change_anfrage',
  DELETE_ANFRAGE: 'api.delete_anfrage',
  VIEW_OWN_ANFRAGEN: 'api.can_view_own_anfragen',
  VIEW_ALL_ANFRAGEN: 'api.can_view_all_anfragen',
  
  // Klientin
  VIEW_KLIENTIN: 'api.view_klientin',
  ADD_KLIENTIN: 'api.add_klientin',
  CHANGE_KLIENTIN: 'api.change_klientin',
  DELETE_KLIENTIN: 'api.delete_klientin',
  
  // Statistik
  VIEW_STATISTIK: 'api.view_statistik',
  EXPORT_STATISTIK: 'api.can_export_statistik',
};

/**
 * Alias für StandardPermissions (für kürzeren Import)
 */
export const Permissions = StandardPermissions;

/**
 * Type für eine einzelne Permission (Union aller Werte)
 */
export type Permission = typeof StandardPermissions[keyof typeof StandardPermissions];
