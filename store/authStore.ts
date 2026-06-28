'use client'

import { create } from 'zustand'

export interface User {
  id: string
  email: string
  displayName: string
  role: 'user' | 'creator' | 'admin'
  verified?: boolean
  avatar?: string
  createdAt?: string
}

export interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  updateUser: (updates: Partial<User>) => void
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user: User, token: string) => {
    console.log('[AuthStore] setAuth called', {
      userId: user?.id,
      tokenLength: token?.length || 0,
      timestamp: new Date().toISOString()
    })
    
    set({ user, token, isAuthenticated: true })
    
    if (typeof window !== 'undefined') {
      // Store in localStorage for client-side access
      localStorage.setItem('auth_token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      console.log('[AuthStore] ✓ Saved to localStorage', {
        tokenStored: !!localStorage.getItem('auth_token'),
        userStored: !!localStorage.getItem('user')
      })
      
      // Store in cookies for server-side middleware access
      // Set tokens with a 7-day expiration
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 7)
      const expires = expirationDate.toUTCString()
      
      document.cookie = `auth_token=${token}; expires=${expires}; path=/; SameSite=Lax`
      document.cookie = `user_role=${user.role}; expires=${expires}; path=/; SameSite=Lax`
      document.cookie = `user_id=${user.id}; expires=${expires}; path=/; SameSite=Lax`
      
      console.log('[AuthStore] ✓ Saved to cookies')
    } else {
      console.warn('[AuthStore] Not in browser - localStorage not available')
    }
  },

  clearAuth: () => {
    set({ user: null, token: null, isAuthenticated: false })
    if (typeof window !== 'undefined') {
      // Clear from localStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      
      // Clear cookies by setting expiration to the past
      const pastDate = new Date(0).toUTCString()
      document.cookie = `auth_token=; expires=${pastDate}; path=/; SameSite=Lax`
      document.cookie = `user_role=; expires=${pastDate}; path=/; SameSite=Lax`
      document.cookie = `user_id=; expires=${pastDate}; path=/; SameSite=Lax`
    }
  },

  updateUser: (updates: Partial<User>) => {
    const current = get().user
    if (current) {
      const updated = { ...current, ...updates }
      set({ user: updated })
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updated))
      }
    }
  },

  hasRole: (role: string) => {
    const current = get().user
    return current?.role === role
  },

  hasPermission: (permission: string) => {
    const current = get().user
    if (!current) return false

    const permissionMap: Record<string, string[]> = {
      admin: ['all'],
      creator: ['create_campaign', 'view_analytics', 'manage_campaigns'],
      supporter: ['donate', 'share'],
      guest: ['browse'],
    }

    const userPermissions = permissionMap[current.role] || []
    // Admin has all permissions
    if (userPermissions.includes('all')) return true
    // Otherwise check if permission is in list
    return userPermissions.includes(permission)
  },
}))

// ============================================================================
// SELECTOR HELPERS - Use these to prevent infinite re-renders
// ============================================================================
// SELECTOR HELPERS - Use these to prevent infinite re-renders
// ============================================================================

// Define selectors outside of hooks to ensure they're stable references
const selectUser = (state: AuthStore) => state.user
const selectUserId = (state: AuthStore) => state.user?.id
const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated
const selectToken = (state: AuthStore) => state.token

/**
 * Get current user
 * Use this instead of: useAuthStore((state) => state.user)
 */
export const useAuthUser = () => useAuthStore(selectUser)

/**
 * Get only user ID to prevent infinite loops
 * Primitive values are safe without shallow
 */
export const useAuthUserId = () => useAuthStore(selectUserId)

/**
 * Get authentication status
 * Primitive value - safe without shallow
 */
export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated)

/**
 * Get token
 * Primitive value - safe without shallow
 */
export const useAuthToken = () => useAuthStore(selectToken)
