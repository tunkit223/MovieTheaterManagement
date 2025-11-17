import { useMemo } from 'react';
import { useAuthStore, selectPermissions } from '@/stores/useAuthStore';
import type { PermissionType } from '@/constants/permissions';

/**
 * Hook to check if user has specific permission(s)
 */
export const usePermissions = () => {
  const permissions = useAuthStore(selectPermissions);

  const permissionNames = useMemo(
    () => permissions.map(p => p.name),
    [permissions]
  );

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: PermissionType): boolean => {
    return permissionNames.includes(permission);
  };

  /**
   * Check if user has ANY of the specified permissions (OR logic)
   */
  const hasAnyPermission = (requiredPermissions: PermissionType[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }
    return requiredPermissions.some(permission => permissionNames.includes(permission));
  };

  /**
   * Check if user has ALL of the specified permissions (AND logic)
   */
  const hasAllPermissions = (requiredPermissions: PermissionType[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }
    return requiredPermissions.every(permission => permissionNames.includes(permission));
  };

  /**
   * Check if user has permission to access a specific route
   */
  const canAccessRoute = (requiredPermissions?: PermissionType[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required for this route
    }
    return hasAnyPermission(requiredPermissions);
  };

  return {
    permissions,
    permissionNames,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
  };
};

/**
 * Helper function to check permissions outside of React components
 */
export const checkPermission = (permission: PermissionType): boolean => {
  const permissions = useAuthStore.getState().permissions;
  return permissions.some(p => p.name === permission);
};

/**
 * Helper function to check multiple permissions outside of React components
 */
export const checkAnyPermission = (requiredPermissions: PermissionType[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  const permissions = useAuthStore.getState().permissions;
  const permissionNames = permissions.map(p => p.name);
  return requiredPermissions.some(permission => permissionNames.includes(permission));
};

/**
 * Helper function to check all permissions outside of React components
 */
export const checkAllPermissions = (requiredPermissions: PermissionType[]): boolean => {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }
  const permissions = useAuthStore.getState().permissions;
  const permissionNames = permissions.map(p => p.name);
  return requiredPermissions.every(permission => permissionNames.includes(permission));
};
