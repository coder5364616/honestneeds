import { apiClient } from '@/lib/api'
import type { ApiEnvelope } from '@/types/profile'
import type {
  AnalyticsPeriod,
  PlatformAnalytics,
  DonorAnalytics,
  BusinessImpactAnalytics,
  SponsorROIAnalytics,
  PublicImpactDashboard,
  RegionImpactReport,
  RegionGroupBy,
  ViralScorePrediction,
} from '@/types/analytics'

/**
 * Advanced analytics service (PRD §3.10 — AN-02, AN-04..AN-09) over
 * `/api/analytics`. apiClient.baseURL already includes `/api`, so paths here
 * omit it. Endpoints return the `{ success, data }` envelope; helpers unwrap
 * `.data.data`.
 */
export const advancedAnalyticsService = {
  // AN-02 — Platform Analytics (admin)
  async getPlatformAnalytics(period: AnalyticsPeriod = 'month'): Promise<PlatformAnalytics> {
    const res = await apiClient.get<ApiEnvelope<PlatformAnalytics>>('/analytics/platform', {
      params: { period },
    })
    return res.data.data
  },

  // AN-04 — Donor Analytics (self; admin may pass userId)
  async getDonorAnalytics(
    period: AnalyticsPeriod = 'all',
    userId?: string
  ): Promise<DonorAnalytics> {
    const res = await apiClient.get<ApiEnvelope<DonorAnalytics>>('/analytics/donor', {
      params: { period, ...(userId ? { userId } : {}) },
    })
    return res.data.data
  },

  // AN-05 — Business Impact Analytics
  async getBusinessImpact(businessId: string): Promise<BusinessImpactAnalytics> {
    const res = await apiClient.get<ApiEnvelope<BusinessImpactAnalytics>>(
      `/analytics/business/${businessId}/impact`
    )
    return res.data.data
  },

  // AN-06 — Sponsor ROI Analytics (self; admin may pass userId)
  async getSponsorROI(userId?: string): Promise<SponsorROIAnalytics> {
    const res = await apiClient.get<ApiEnvelope<SponsorROIAnalytics>>('/analytics/sponsor/roi', {
      params: userId ? { userId } : {},
    })
    return res.data.data
  },

  // AN-07 — Public Impact Dashboard
  async getPublicImpact(): Promise<PublicImpactDashboard> {
    const res = await apiClient.get<ApiEnvelope<PublicImpactDashboard>>('/analytics/impact')
    return res.data.data
  },

  // AN-08 — City/Region Impact Reports
  async getRegionReport(params: {
    groupBy?: RegionGroupBy
    country?: string
    state?: string
    limit?: number
  } = {}): Promise<RegionImpactReport> {
    const res = await apiClient.get<ApiEnvelope<RegionImpactReport>>('/analytics/regions', {
      params,
    })
    return res.data.data
  },

  // AN-09 — AI Viral Score Predictor
  async getViralScore(campaignId: string): Promise<ViralScorePrediction> {
    const res = await apiClient.get<ApiEnvelope<ViralScorePrediction>>(
      `/analytics/campaigns/${campaignId}/viral-score`
    )
    return res.data.data
  },
}

export default advancedAnalyticsService
