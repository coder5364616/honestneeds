import { apiClient } from '@/lib/api'
import type {
  ApiEnvelope,
  Pagination,
  BusinessProfile,
  OwnBusinessProfile,
  BusinessProfileCreatePayload,
  BusinessProfileUpdatePayload,
  DirectoryParams,
  DirectoryResponse,
  AssetRef,
  BusinessAnalytics,
  CsrReport,
  BusinessVerificationPayload,
  BusinessVerificationSubmission,
  AdminBusinessVerification,
  ReviewDecision,
  VolunteerOpportunity,
  OpportunityCreatePayload,
  OpportunityListResponse,
  VolunteerApplication,
  ApplicationPayload,
  ApplicationListResponse,
  BusinessGiveaway,
  GiveawayCreatePayload,
  GiveawayListResponse,
  GiveawayClaim,
  ClaimFulfilmentPayload,
  DrawResult,
} from '@/types/business'

/**
 * Business Service — wraps the backend Business Features routes:
 *   /api/business        (businessRoutes.js)    BU-01/02/03/04/05
 *   /api/opportunities   (opportunityRoutes.js) BU-06
 *   /api/giveaways       (giveawayRoutes.js)    BU-07
 *
 * apiClient.baseURL already includes `/api`, so paths here omit it.
 */
export const businessService = {
  // ── BU-01: Profile ───────────────────────────────────────────────
  async createProfile(payload: BusinessProfileCreatePayload): Promise<BusinessProfile> {
    const res = await apiClient.post<ApiEnvelope<BusinessProfile>>('/business/profile', payload)
    return res.data.data
  },

  async getOwnProfile(): Promise<OwnBusinessProfile> {
    // A 404 here just means "no profile yet" — an expected state the dashboard
    // handles by showing onboarding. Mark it silent so the interceptor doesn't
    // log an error or pop a "Business profile not found" toast.
    const res = await apiClient.get<ApiEnvelope<OwnBusinessProfile>>('/business/profile/me', {
      silentStatuses: [404],
    })
    return res.data.data
  },

  async updateProfile(payload: BusinessProfileUpdatePayload): Promise<BusinessProfile> {
    const res = await apiClient.patch<ApiEnvelope<BusinessProfile>>('/business/profile/me', payload)
    return res.data.data
  },

  async getPublicProfile(idOrSlug: string): Promise<BusinessProfile> {
    const res = await apiClient.get<ApiEnvelope<BusinessProfile>>(`/business/${idOrSlug}`)
    return res.data.data
  },

  /** Upload a logo/banner/verification asset; returns { url, public_id }. */
  async uploadAsset(file: File): Promise<AssetRef> {
    const form = new FormData()
    form.append('image', file)
    const res = await apiClient.post<ApiEnvelope<AssetRef>>('/business/upload', form)
    return res.data.data
  },

  // ── BU-02: Directory ─────────────────────────────────────────────
  async listDirectory(params: DirectoryParams = {}): Promise<DirectoryResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & DirectoryResponse>('/business/directory', { params })
    return { businesses: res.data.businesses, pagination: res.data.pagination }
  },

  // ── BU-03: Analytics ─────────────────────────────────────────────
  async getAnalytics(): Promise<BusinessAnalytics> {
    const res = await apiClient.get<ApiEnvelope<BusinessAnalytics>>('/business/analytics')
    return res.data.data
  },

  // ── BU-04: CSR report ────────────────────────────────────────────
  async getCsrReport(opts: { from?: string; to?: string } = {}): Promise<CsrReport> {
    const res = await apiClient.get<ApiEnvelope<CsrReport>>('/business/csr-report', { params: opts })
    return res.data.data
  },

  /** Download the CSR report as CSV (returns a Blob for client-side save). */
  async downloadCsrCsv(opts: { from?: string; to?: string } = {}): Promise<Blob> {
    const res = await apiClient.get('/business/csr-report', {
      params: { ...opts, format: 'csv' },
      responseType: 'blob',
    })
    return res.data as Blob
  },

  // ── BU-05: Verification ──────────────────────────────────────────
  async submitVerification(payload: BusinessVerificationPayload): Promise<BusinessVerificationSubmission> {
    const res = await apiClient.post<ApiEnvelope<BusinessVerificationSubmission>>('/business/verification', payload)
    return res.data.data
  },

  // Admin
  async listVerificationQueue(page = 1, limit = 20, status = 'pending') {
    const res = await apiClient.get<
      ApiEnvelope<never> & { submissions: AdminBusinessVerification[]; pagination: Pagination }
    >('/business/admin/verification/queue', { params: { page, limit, status } })
    return { submissions: res.data.submissions, pagination: res.data.pagination }
  },

  async reviewVerification(
    submissionId: string,
    decision: ReviewDecision,
    opts: { notes?: string; rejection_reason?: string } = {}
  ): Promise<BusinessVerificationSubmission> {
    const res = await apiClient.post<ApiEnvelope<BusinessVerificationSubmission>>(
      `/business/admin/verification/${submissionId}/review`,
      { decision, ...opts }
    )
    return res.data.data
  },

  async setSuspension(businessId: string, suspend: boolean, reason?: string): Promise<BusinessProfile> {
    const res = await apiClient.post<ApiEnvelope<BusinessProfile>>(`/business/admin/${businessId}/suspension`, {
      suspend,
      reason,
    })
    return res.data.data
  },

  // ── BU-06: Volunteer Opportunities ───────────────────────────────
  async browseOpportunities(
    params: { q?: string; category?: string; is_remote?: boolean; city?: string; page?: number; limit?: number } = {}
  ): Promise<OpportunityListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & OpportunityListResponse>('/opportunities', { params })
    return { opportunities: res.data.opportunities, pagination: res.data.pagination }
  },

  /** Owner-scoped: all opportunities for the caller's business (any status). */
  async listMyOpportunities(
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<OpportunityListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & OpportunityListResponse>('/opportunities/mine', { params })
    return { opportunities: res.data.opportunities, pagination: res.data.pagination }
  },

  async getOpportunity(opportunityId: string): Promise<VolunteerOpportunity> {
    const res = await apiClient.get<ApiEnvelope<VolunteerOpportunity>>(`/opportunities/${opportunityId}`)
    return res.data.data
  },

  async createOpportunity(payload: OpportunityCreatePayload): Promise<VolunteerOpportunity> {
    const res = await apiClient.post<ApiEnvelope<VolunteerOpportunity>>('/opportunities', payload)
    return res.data.data
  },

  async updateOpportunity(
    opportunityId: string,
    payload: Partial<OpportunityCreatePayload>
  ): Promise<VolunteerOpportunity> {
    const res = await apiClient.patch<ApiEnvelope<VolunteerOpportunity>>(`/opportunities/${opportunityId}`, payload)
    return res.data.data
  },

  async closeOpportunity(opportunityId: string): Promise<VolunteerOpportunity> {
    const res = await apiClient.post<ApiEnvelope<VolunteerOpportunity>>(`/opportunities/${opportunityId}/close`, {})
    return res.data.data
  },

  async listOpportunityApplications(
    opportunityId: string,
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<ApplicationListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & ApplicationListResponse>(
      `/opportunities/${opportunityId}/applications`,
      { params }
    )
    return { applications: res.data.applications, pagination: res.data.pagination }
  },

  /** Owner-scoped: a single application (with volunteer + opportunity populated). */
  async getApplication(applicationId: string): Promise<VolunteerApplication> {
    const res = await apiClient.get<ApiEnvelope<VolunteerApplication>>(
      `/opportunities/applications/${applicationId}`
    )
    return res.data.data
  },

  async reviewApplication(
    applicationId: string,
    decision: 'accept' | 'reject',
    note?: string
  ): Promise<VolunteerApplication> {
    const res = await apiClient.post<ApiEnvelope<VolunteerApplication>>(
      `/opportunities/applications/${applicationId}/review`,
      { decision, note }
    )
    return res.data.data
  },

  async completeApplication(applicationId: string, hours: number): Promise<VolunteerApplication> {
    const res = await apiClient.post<ApiEnvelope<VolunteerApplication>>(
      `/opportunities/applications/${applicationId}/complete`,
      { hours }
    )
    return res.data.data
  },

  // Volunteer side
  async applyToOpportunity(opportunityId: string, payload: ApplicationPayload): Promise<VolunteerApplication> {
    const res = await apiClient.post<ApiEnvelope<VolunteerApplication>>(
      `/opportunities/${opportunityId}/apply`,
      payload
    )
    return res.data.data
  },

  async withdrawApplication(applicationId: string): Promise<VolunteerApplication> {
    const res = await apiClient.post<ApiEnvelope<VolunteerApplication>>(
      `/opportunities/applications/${applicationId}/withdraw`,
      {}
    )
    return res.data.data
  },

  async listMyApplications(
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<ApplicationListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & ApplicationListResponse>('/opportunities/applications/mine', {
      params,
    })
    return { applications: res.data.applications, pagination: res.data.pagination }
  },

  // ── BU-07: Giveaways ─────────────────────────────────────────────
  async browseGiveaways(
    params: { type?: string; page?: number; limit?: number } = {}
  ): Promise<GiveawayListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & GiveawayListResponse>('/giveaways', { params })
    return { giveaways: res.data.giveaways, pagination: res.data.pagination }
  },

  /** Owner-scoped: all giveaways for the caller's business (any status). */
  async listMyGiveaways(
    params: { page?: number; limit?: number; status?: string } = {}
  ): Promise<GiveawayListResponse> {
    const res = await apiClient.get<ApiEnvelope<never> & GiveawayListResponse>('/giveaways/mine', { params })
    return { giveaways: res.data.giveaways, pagination: res.data.pagination }
  },

  async getGiveaway(giveawayId: string): Promise<BusinessGiveaway> {
    const res = await apiClient.get<ApiEnvelope<BusinessGiveaway>>(`/giveaways/${giveawayId}`)
    return res.data.data
  },

  async createGiveaway(payload: GiveawayCreatePayload): Promise<BusinessGiveaway> {
    const res = await apiClient.post<ApiEnvelope<BusinessGiveaway>>('/giveaways', payload)
    return res.data.data
  },

  async updateGiveaway(giveawayId: string, payload: Partial<GiveawayCreatePayload>): Promise<BusinessGiveaway> {
    const res = await apiClient.patch<ApiEnvelope<BusinessGiveaway>>(`/giveaways/${giveawayId}`, payload)
    return res.data.data
  },

  async publishGiveaway(giveawayId: string): Promise<BusinessGiveaway> {
    const res = await apiClient.post<ApiEnvelope<BusinessGiveaway>>(`/giveaways/${giveawayId}/publish`, {})
    return res.data.data
  },

  async cancelGiveaway(giveawayId: string): Promise<BusinessGiveaway> {
    const res = await apiClient.post<ApiEnvelope<BusinessGiveaway>>(`/giveaways/${giveawayId}/cancel`, {})
    return res.data.data
  },

  async drawWinners(giveawayId: string): Promise<DrawResult> {
    const res = await apiClient.post<ApiEnvelope<DrawResult>>(`/giveaways/${giveawayId}/draw`, {})
    return res.data.data
  },

  async listGiveawayClaims(giveawayId: string): Promise<{ claims: GiveawayClaim[] }> {
    const res = await apiClient.get<ApiEnvelope<never> & { claims: GiveawayClaim[] }>(
      `/giveaways/${giveawayId}/claims`
    )
    return { claims: res.data.claims }
  },

  async fulfilClaim(
    claimId: string,
    opts: { tracking_reference?: string; mark?: 'shipped' | 'redeemed' | 'fulfilled' } = {}
  ): Promise<GiveawayClaim> {
    const res = await apiClient.post<ApiEnvelope<GiveawayClaim>>(`/giveaways/claims/${claimId}/fulfil`, opts)
    return res.data.data
  },

  // User side
  async enterGiveaway(giveawayId: string): Promise<{ entered: boolean; giveaway_id: string }> {
    const res = await apiClient.post<ApiEnvelope<{ entered: boolean; giveaway_id: string }>>(
      `/giveaways/${giveawayId}/enter`,
      {}
    )
    return res.data.data
  },

  async claimPrize(claimId: string, payload: ClaimFulfilmentPayload): Promise<GiveawayClaim> {
    const res = await apiClient.post<ApiEnvelope<GiveawayClaim>>(`/giveaways/claims/${claimId}/claim`, payload)
    return res.data.data
  },

  async listMyClaims(status?: string): Promise<{ claims: GiveawayClaim[] }> {
    const res = await apiClient.get<ApiEnvelope<never> & { claims: GiveawayClaim[] }>('/giveaways/claims/mine', {
      params: { status },
    })
    return { claims: res.data.claims }
  },
}
