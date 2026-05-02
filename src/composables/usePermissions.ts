import { useAuthStore } from '@/features/auth/stores/auth.store'

export function usePermission() {
  const auth = useAuthStore()

  function can(permission: string): boolean {
    return auth.permissions?.includes(permission) ?? false
  }

  function canAny(permissions: string[]): boolean {
    return permissions.some((permission) => can(permission))
  }

  function canAll(permissions: string[]): boolean {
    return permissions.every((permission) => can(permission))
  }

  function hasRole(role: string): boolean {
    return auth.roles?.includes(role) ?? false
  }

  function hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => hasRole(role))
  }

  return {
    can,
    canAny,
    canAll,
    hasRole,
    hasAnyRole,
  }
}