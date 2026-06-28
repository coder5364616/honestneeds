import { apiClient } from '@/lib/api'
import { AxiosError } from 'axios'

/**
 * Campaign Engagement Service
 * Backend endpoints for several campaign features that share the campaign resource:
 *  - CA-12 Multi-Meter System          GET    /campaigns/:id/meters
 *  - CA-13 Crowdfunded Virality        GET    /campaigns/:id/virality
 *  - CA-17 Campaign Video Upload/Embed PUT/DELETE /campaigns/:id/video
 *  - CA-18 Social Proof / Donor Feed   GET    /campaigns/:id/donor-feed
 *  - CA-08 Share Budget System         PUT    /campaigns/:id/share-budget
 */

// ─── CA-12 Meters ───────────────────────────────────────────────────────────────
export interface CampaignMeter {
  type: 'funding' | 'sharing' | 'resource' | 'share_budget' | 'prayer' | 'donors'
  label: string
  unit: 'currency' | 'count'
  current: number
  target: number | null
  current_cents?: number
  target_cents?: number
  percentage: number | null
}

export interface CampaignMetersResult {
  campaign_id: string
  campaign_type: string
  meters: CampaignMeter[]
}

// ─── CA-13 Virality ─────────────────────────────────────────────────────────────
export interface CampaignVirality {
  campaign_id: string
  total_shares: number
  unique_sharers: number
  referral_clicks: number
  referral_conversions: number
  referral_conversion_rate: number
  viral_coefficient: number
  is_viral: boolean
  last_calculated_at: string
}

// ─── CA-17 Video ────────────────────────────────────────────────────────────────
export interface CampaignVideo {
  url: string
  provider: 'youtube' | 'vimeo' | 'cloudinary' | 'other'
  embed_url: string
  thumbnail_url?: string
  public_id?: string
  duration_seconds?: number
  added_at?: string
}

export interface SetVideoPayload {
  url: string
  thumbnail_url?: string
  public_id?: string
  duration_seconds?: number
}

// ─── CA-18 Donor Feed ───────────────────────────────────────────────────────────
export interface DonorFeedItem {
  type: 'donation' | 'share'
  actor_name: string
  amount_cents?: number
  amount?: number
  message?: string
  channel?: string
  date: string
}

export interface DonorFeedResult {
  campaign_id: string
  total_donors: number
  total_raised_cents: number
  feed: DonorFeedItem[]
}

// ─── CA-08 Share Budget ─────────────────────────────────────────────────────────
export interface ShareBudgetConfig {
  total_budget: number
  // Trust-based liability counter (declared pool − rewards accrued).
  committed_budget_remaining?: number
  committed_total?: number
  current_budget_remaining: number
  amount_per_share: number
  is_paid_sharing_active: boolean
  share_channels: string[]
  creator_payout_consent_at?: string | null
  last_config_update?: string
}

export interface UpdateShareBudgetPayload {
  total_budget_dollars?: number
  amount_per_share_dollars?: number
  is_paid_sharing_active?: boolean
  share_channels?: string[]
  // Trust-based: creator's agreement to pay sharers directly. Required to
  // activate Share-to-Earn on a campaign that hasn't consented yet.
  payout_consent?: boolean
}

export const campaignEngagementService = {
  // CA-12
  async getMeters(campaignId: string): Promise<CampaignMetersResult | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CampaignMetersResult }>(
        `/campaigns/${campaignId}/meters`
      )
      return response.data?.data || null
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) return null
      console.error('Failed to fetch campaign meters:', error)
      return null
    }
  },

  // CA-13
  async getVirality(campaignId: string): Promise<CampaignVirality | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CampaignVirality }>(
        `/campaigns/${campaignId}/virality`
      )
      return response.data?.data || null
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) return null
      console.error('Failed to fetch campaign virality:', error)
      return null
    }
  },

  // CA-18
  async getDonorFeed(campaignId: string, limit = 20): Promise<DonorFeedResult | null> {
    try {
      const response = await apiClient.get<{ success: boolean; data: DonorFeedResult }>(
        `/campaigns/${campaignId}/donor-feed`,
        { params: { limit } }
      )
      return response.data?.data || null
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) return null
      console.error('Failed to fetch donor feed:', error)
      return null
    }
  },

  // CA-17
  async setVideo(campaignId: string, payload: SetVideoPayload): Promise<CampaignVideo> {
    const response = await apiClient.put<{ success: boolean; data: CampaignVideo }>(
      `/campaigns/${campaignId}/video`,
      payload
    )
    return response.data.data
  },

  async removeVideo(campaignId: string): Promise<void> {
    await apiClient.delete(`/campaigns/${campaignId}/video`)
  },

  // CA-08
  async updateShareBudget(
    campaignId: string,
    payload: UpdateShareBudgetPayload
  ): Promise<ShareBudgetConfig> {
    const response = await apiClient.put<{ success: boolean; data: ShareBudgetConfig }>(
      `/campaigns/${campaignId}/share-budget`,
      payload
    )
    return response.data.data
  },

  // CA-20 / G-7: Transformation Journey
  async updateJourney(campaignId: string, entries: JourneyEntry[]): Promise<void> {
    await apiClient.put(`/campaigns/${campaignId}/journey`, { entries })
  },

  async uploadJourneyImage(campaignId: string, file: File): Promise<string> {
    const formData = new FormData()
    formData.append('image', file, file.name)
    const response = await apiClient.post<{ success: boolean; data: { image_url: string } }>(
      `/campaigns/${campaignId}/journey/image`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data.data.image_url
  },
}

export interface JourneyEntry {
  type: 'before' | 'after' | 'milestone'
  image_url?: string | null
  caption?: string | null
  occurred_at?: string | null
}
