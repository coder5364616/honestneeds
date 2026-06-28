'use client'

import { useEffect } from 'react'
import { isChunkLoadError, reloadOnceForChunkError } from '@/lib/chunkReload'

/**
 * Listens for chunk-load failures that escape React error boundaries.
 *
 * When Next.js fails to fetch a route chunk during client navigation (common
 * after a redeploy), the failure often arrives as a global `error` or
 * `unhandledrejection` event rather than a render error — so `error.tsx`
 * never runs and the user is left on a blank/stuck page. This catches those
 * and reloads once so the new build is fetched.
 */
export default function ChunkErrorReloader() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.error) || isChunkLoadError({ message: event.message })) {
        reloadOnceForChunkError()
      }
    }

    const onRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event.reason)) {
        reloadOnceForChunkError()
      }
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}
