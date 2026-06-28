/**
 * Axios Configuration (compatibility shim)
 *
 * Historically this module exported its own axios instance with a separate
 * request/response interceptor. That caused inconsistent auth handling vs.
 * `lib/api.ts` (different token sources, different 401 behavior, no token
 * refresh). It now re-exports the single shared `apiClient` so every caller
 * gets the same auth-token injection and silent refresh-and-retry on 401.
 */

import { apiClient } from '../lib/api'

export default apiClient
