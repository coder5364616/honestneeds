'use client'

import { useEffect } from 'react'
import { isChunkLoadError, reloadOnceForChunkError } from '@/lib/chunkReload'

/**
 * Global error boundary.
 *
 * `app/error.tsx` only catches errors thrown *inside* a route segment. Errors
 * thrown by the root layout subtree (header, providers, persistent widgets)
 * are only caught here. Without this file such errors render a blank page.
 *
 * global-error replaces the root layout entirely, so it must render its own
 * <html>/<body> and cannot use the app's styled-components registry — hence
 * the inline styles.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (isChunkLoadError(error)) {
      reloadOnceForChunkError()
      return
    }
    console.error('Global application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          background: 'linear-gradient(to bottom right, #f8fafc, #f1f5f9)',
          color: '#0f172a',
        }}
      >
        <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            We hit an unexpected error. Reloading usually fixes it.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => reset()}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'white',
                background: 'linear-gradient(90deg, #2563eb 0%, #9333ea 100%)',
              }}
            >
              Try again
            </button>
            <button
              onClick={() => {
                window.location.href = '/'
              }}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '0.5rem',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                fontWeight: 600,
                color: '#0f172a',
                background: 'white',
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
