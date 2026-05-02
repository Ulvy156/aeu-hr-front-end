import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCookie, setCookie, deleteCookie } from '@/utils/cookie'
import { fetchMe, logout as apiLogout } from '@/features/auth/services/auth.api'
import type { AuthUser } from '@/features/auth/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<string | null>(getCookie('access_token'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const roles = computed(() => user.value?.roles ?? [])
  const permissions = computed(() => user.value?.permissions ?? [])

  function setToken(value: string): void {
    token.value = value
    setCookie('access_token', value)
  }

  function setUser(value: AuthUser): void {
    user.value = value
  }

  function hasRole(role: string): boolean {
    return roles.value.includes(role)
  }

  function hasAnyRole(list: string[]): boolean {
    return list.some((r) => roles.value.includes(r))
  }

  async function loadUser(): Promise<void> {
    if (!token.value) return
    try {
      user.value = await fetchMe()
    } catch {
      clear()
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiLogout()
    } finally {
      clear()
    }
  }

  function clear(): void {
    user.value = null
    token.value = null
    deleteCookie('access_token')
  }

  return {
    user,
    permissions,
    token,
    isAuthenticated,
    roles,
    setToken,
    setUser,
    hasRole,
    hasAnyRole,
    loadUser,
    logout,
    clear,
  }
})
