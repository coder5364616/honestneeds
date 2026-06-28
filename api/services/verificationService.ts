import { apiClient } from '@/lib/api'
import type {
  ApiEnvelope,
  VerificationStatus,
  PhoneSendResult,
  IdentityAssetRef,
  IdentitySubmitPayload,
  IdentitySubmission,
  ReviewDecision,
} from '@/types/profile'

/**
 * Verification Service — wraps `/api/verification` (backend verificationRoutes.js).
 *
 * User:  GET  /status
 *        POST /phone/send        { phone? }
 *        POST /phone/verify      { code }
 *        POST /email/confirm     { verified? }
 *        POST /identity/upload   (multipart "image") -> { url, public_id }
 *        POST /identity          { tier?, document_type, front, back?, selfie }
 * Admin: GET  /admin/queue
 *        POST /admin/:submissionId/review   { decision, notes?, rejection_reason? }
 *        POST /admin/:userId/org-badge      { badge, value }
 */
export const verificationService = {
  async getStatus(): Promise<VerificationStatus> {
    const res = await apiClient.get<ApiEnvelope<VerificationStatus>>('/verification/status')
    return res.data.data
  },

  async sendPhoneCode(phone?: string): Promise<PhoneSendResult> {
    const res = await apiClient.post<ApiEnvelope<PhoneSendResult>>('/verification/phone/send', { phone })
    return res.data.data
  },

  async verifyPhone(code: string): Promise<{ phone_verified: boolean; trust_score: number }> {
    const res = await apiClient.post<ApiEnvelope<{ phone_verified: boolean; trust_score: number }>>(
      '/verification/phone/verify',
      { code }
    )
    return res.data.data
  },

  async confirmEmail(verified = true): Promise<{ email_verified: boolean; trust_score: number }> {
    const res = await apiClient.post<ApiEnvelope<{ email_verified: boolean; trust_score: number }>>(
      '/verification/email/confirm',
      { verified }
    )
    return res.data.data
  },

  /** Upload a single identity asset (document/selfie); returns a ref to submit. */
  async uploadIdentityAsset(file: File): Promise<IdentityAssetRef> {
    const form = new FormData()
    form.append('image', file)
    const res = await apiClient.post<ApiEnvelope<IdentityAssetRef>>('/verification/identity/upload', form)
    return res.data.data
  },

  async submitIdentity(payload: IdentitySubmitPayload): Promise<IdentitySubmission> {
    const res = await apiClient.post<ApiEnvelope<IdentitySubmission>>('/verification/identity', payload)
    return res.data.data
  },

  // ── Admin / reviewer ──────────────────────────────────────────────
  async listQueue(page = 1, limit = 20) {
    const res = await apiClient.get<
      ApiEnvelope<never> & {
        submissions: IdentitySubmission[]
        pagination: { page: number; limit: number; total: number; totalPages: number }
      }
    >('/verification/admin/queue', { params: { page, limit } })
    return { submissions: res.data.submissions, pagination: res.data.pagination }
  },

  async review(
    submissionId: string,
    decision: ReviewDecision,
    opts: { notes?: string; rejection_reason?: string } = {}
  ): Promise<IdentitySubmission> {
    const res = await apiClient.post<ApiEnvelope<IdentitySubmission>>(
      `/verification/admin/${submissionId}/review`,
      { decision, ...opts }
    )
    return res.data.data
  },

  async setOrgBadge(
    userId: string,
    badge: 'community_verified' | 'nonprofit_verified',
    value: boolean
  ) {
    const res = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
      `/verification/admin/${userId}/org-badge`,
      { badge, value }
    )
    return res.data.data
  },
}
