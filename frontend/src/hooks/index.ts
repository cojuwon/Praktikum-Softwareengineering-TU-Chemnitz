// Hooks
export { useAuth, AuthProvider } from './useAuth';
export { usePermissions } from './usePermissions';

// Re-export types for convenience
export type { User, AuthState, UserRole, Permission } from '@/src/types/auth';
export { Permissions, StandardPermissions, CustomPermissions, UserRoleLabels } from '@/src/types/auth';
