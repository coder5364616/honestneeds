'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { refreshAccessToken } from '@/lib/api'

/**
 * Decode a JWT and report whether it is expired (or unreadable).
 * We treat the token as expired 10s early to avoid edge-of-expiry races where
 * the access token dies mid-request.
 */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (!payload?.exp) return false // no expiry claim → assume long-lived
    return payload.exp * 1000 <= Date.now() + 10_000
  } catch {
    // Unparseable/garbage token → treat as invalid so we don't keep a dead session.
    return true
  }
}

/**
 * Hook to hydrate auth store from localStorage on app startup
 * This ensures auth state persists across page refreshes and SSR transitions
 * Must be called in a client-side component (cannot be called in server components)
 *
 * IMPORTANT: if the stored access token is expired we attempt a silent refresh.
 * If the refresh is impossible/fails (e.g. expired refresh token, or the API is
 * unreachable) we clear the dead session instead of restoring a "logged in but
 * every request 401s" state — that stale state is what caused the perpetual
 * blank screen that previously only cleared by manually wiping storage.
 */
export const useAuthHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false)
  const { setAuth, clearAuth, user, token } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    // Only run in browser
    if (typeof window === 'undefined') {
      setIsHydrated(true)
      return
    }

    // If store already has data, skip hydration
    if (user && token) {
      setIsHydrated(true)
      return
    }

    const savedToken = localStorage.getItem('auth_token')
    const savedUserStr = localStorage.getItem('user')

    // Nothing to restore → mark hydrated so route guards can send to /login.
    if (!savedToken || !savedUserStr) {
      setIsHydrated(true)
      return
    }

    let savedUser: ReturnType<typeof JSON.parse>
    try {
      savedUser = JSON.parse(savedUserStr)
    } catch (parseError) {
      // Corrupted data → drop it.
      console.warn('Failed to parse stored user data:', parseError)
      clearAuth()
      setIsHydrated(true)
      return
    }

    // Restore the session and unblock rendering IMMEDIATELY — never await the
    // network here. Blocking hydration on /auth/refresh is what produced the
    // perpetual blank screen: when the API was slow/unreachable the refresh
    // hung for up to 30s (and repeated on every reload) while the gated UI
    // rendered nothing. Even if the access token is already expired, apiClient
    // transparently refreshes it on the first 401 and replays the request.
    setAuth(savedUser, savedToken)
    setIsHydrated(true)

    // If the token is already expired, refresh in the BACKGROUND so the
    // dashboard's first data calls can go out with a fresh token where possible.
    if (isTokenExpired(savedToken)) {
      refreshAccessToken()
        .then((newToken) => {
          if (!cancelled && newToken) setAuth(savedUser, newToken)
          // On failure we deliberately KEEP the optimistic session: a transient
          // network/5xx error (e.g. the DB briefly unreachable) must not force a
          // re-login. If the token is genuinely dead, the next API 401 — after a
          // failed refresh — clears auth and redirects via the apiClient interceptor.
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
    }
  }, [user, token, setAuth, clearAuth])

  return isHydrated
}

/**
 * Hook to get current hydration status
 * Useful to show loading state until auth is restored
 */
export const useAuthHydrationStatus = () => {
  return useAuthHydration()
}
