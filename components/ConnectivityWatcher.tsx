'use client'

import { useEffect } from 'react'
import { useConnectivityStore } from '@/store/connectivityStore'

/**
 * App-wide connectivity sensor. Mounted once in the root layout (returns no UI).
 * Browser online/offline events are the most reliable, instant signal that the
 * device itself has no network — apiClient (lib/api.ts) reports the rest
 * (server unreachable, timeouts, 5xx) as requests fail.
 */
export default function ConnectivityWatcher() {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      useConnectivityStore.getState().reportIssue('browser-offline')
    }

    const handleOffline = () => useConnectivityStore.getState().reportIssue('browser-offline')
    const handleOnline = () => useConnectivityStore.getState().reportSuccess()

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return null
}
