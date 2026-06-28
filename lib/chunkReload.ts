/**
 * Chunk-load error recovery.
 *
 * Next.js code-splits every route; navigating lazy-loads that route's JS/CSS
 * chunk. After a new deployment the previously-served chunk filenames (hashed)
 * no longer exist, so a user with an old tab open hits a 404 when they click a
 * link — the dynamic import throws a `ChunkLoadError` and the page goes blank
 * or hangs. The fix is to reload the page once so the browser fetches the new
 * build manifest and the correct chunk names.
 */

const RELOAD_FLAG = 'hn_chunk_reloaded_at'
// Don't reload more than once per window — guards against an infinite reload
// loop if the chunk is genuinely, permanently missing.
const RELOAD_COOLDOWN_MS = 15_000

/**
 * Returns true when an error looks like a failed chunk/dynamic-import load.
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false
  const err = error as { name?: string; message?: string }
  const name = err.name || ''
  const message = err.message || ''

  return (
    name === 'ChunkLoadError' ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Loading CSS chunk/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  )
}

/**
 * Reload the page once to recover from a stale-chunk error.
 * Returns true if a reload was triggered, false if suppressed by the cooldown.
 */
export function reloadOnceForChunkError(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0)
    if (Date.now() - last < RELOAD_COOLDOWN_MS) {
      // Already reloaded very recently — avoid a loop, let the error surface.
      return false
    }
    sessionStorage.setItem(RELOAD_FLAG, String(Date.now()))
  } catch {
    // sessionStorage unavailable (private mode etc.) — reload anyway, once.
  }

  window.location.reload()
  return true
}
