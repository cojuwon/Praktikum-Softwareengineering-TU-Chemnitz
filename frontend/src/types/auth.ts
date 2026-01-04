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
 * Format: app_label.permission_model
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
  
  // KlientIn
  VIEW_KLIENTIN: 'api.view_klientin',
  ADD_KLIENTIN: 'api.add_klientin',
  CHANGE_KLIENTIN: 'api.change_klientin',
  DELETE_KLIENTIN: 'api.delete_klientin',
  
  // Anfrage
  VIEW_ANFRAGE: 'api.view_anfrage',
  ADD_ANFRAGE: 'api.add_anfrage',
  CHANGE_ANFRAGE: 'api.change_anfrage',
  DELETE_ANFRAGE: 'api.delete_anfrage',
  
  // Beratungstermin
  VIEW_BERATUNGSTERMIN: 'api.view_beratungstermin',
  ADD_BERATUNGSTERMIN: 'api.add_beratungstermin',
  CHANGE_BERATUNGSTERMIN: 'api.change_beratungstermin',
  DELETE_BERATUNGSTERMIN: 'api.delete_beratungstermin',
  
  // Begleitung
  VIEW_BEGLEITUNG: 'api.view_begleitung',
  ADD_BEGLEITUNG: 'api.add_begleitung',
  CHANGE_BEGLEITUNG: 'api.change_begleitung',
  DELETE_BEGLEITUNG: 'api.delete_begleitung',
  
  // Gewalttat
  VIEW_GEWALTTAT: 'api.view_gewalttat',
  ADD_GEWALTTAT: 'api.add_gewalttat',
  CHANGE_GEWALTTAT: 'api.change_gewalttat',
  DELETE_GEWALTTAT: 'api.delete_gewalttat',
  
  // Gewaltfolge
  VIEW_GEWALTFOLGE: 'api.view_gewaltfolge',
  ADD_GEWALTFOLGE: 'api.add_gewaltfolge',
  CHANGE_GEWALTFOLGE: 'api.change_gewaltfolge',
  DELETE_GEWALTFOLGE: 'api.delete_gewaltfolge',
  
  // Preset
  VIEW_PRESET: 'api.view_preset',
  ADD_PRESET: 'api.add_preset',
  CHANGE_PRESET: 'api.change_preset',
  DELETE_PRESET: 'api.delete_preset',
  
  // Statistik
  VIEW_STATISTIK: 'api.view_statistik',
  ADD_STATISTIK: 'api.add_statistik',
  CHANGE_STATISTIK: 'api.change_statistik',
  DELETE_STATISTIK: 'api.delete_statistik',
} as const;

/**
 * Custom Permissions (in models.py Meta.permissions definiert)
 */
export const CustomPermissions = {
  // Konto/User Management
  CAN_MANAGE_USERS: 'api.can_manage_users',
  CAN_ASSIGN_ROLES: 'api.can_assign_roles',
  CAN_VIEW_ALL_DATA: 'api.can_view_all_data',
  
  // Preset
  CAN_SHARE_PRESET: 'api.can_share_preset',
  
  // Statistik
  CAN_EXPORT_STATISTIK: 'api.can_export_statistik',
  CAN_SHARE_STATISTIK: 'api.can_share_statistik',
} as const;

/**
 * Alle verfügbaren Permissions kombiniert
 */
export const Permissions = {
  ...StandardPermissions,
  ...CustomPermissions,
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];
