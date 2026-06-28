import { apiClient } from '@/lib/api'

/**
 * Sharing Service
 * Handles all sharing and referral functionality
 */

export interface ShareRecord {
  id: string
  campaignId: string
  userId: string
  channel: 'facebook' | 'twitter' | 'linkedin' | 'email' | 'whatsapp' | 'link'
  shareLink: string
  referralId: string
  createdAt: string
}

export interface ReferralStats {
  totalShares: number
  sharesByChannel: Record<string, number>
  referrals: number
  conversions: number
  rewardEarned?: number // cents
}

export interface QRCodeData {
  url: string
  dataUrl: string // base64 encoded PNG
}

export interface CampaignShareMetrics {
  campaignId: string
  totalShares: number
  sharesByChannel: Record<string, number>
  uniqueShareholders: number
  referralLinkClicks: number
  shareLink: string
  referralId: string
}

export interface ShareLeaderboardEntry {
  rank: number
  user_id: string
  user_name: string
  user_picture?: string | null
  total_earnings: number // cents
  total_shares: number
  total_conversions: number
  conversion_rate: number // percentage
}

export interface ShareLeaderboard {
  filter: { type: 'global' } | { type: 'campaign'; campaign_id: string }
  total_participants: number
  page: number
  limit: number
  entries: ShareLeaderboardEntry[]
}

class SharingService {
  /**
   * Generate a referral link for a campaign
   */
  async generateReferralLink(campaignId: string): Promise<{
    shareLink: string
    referralId: string
    qrCode: string
  }> {
    const response = await apiClient.post<{
      shareLink: string
      referralId: string
      qrCode: string
    }>(`/campaigns/${campaignId}/share/generate`)
    return response.data
  }

  /**
   * Record a share action
   */
  async recordShare(
    campaignId: string,
    channel: string
  ): Promise<ShareRecord> {
    const response = await apiClient.post<ShareRecord>(
      `/campaigns/${campaignId}/share`,
      { channel }
    )
    return response.data
  }

  /**
   * Get share metrics for a campaign
   */
  async getCampaignShareMetrics(campaignId: string): Promise<CampaignShareMetrics> {
    const response = await apiClient.get<CampaignShareMetrics>(
      `/campaigns/${campaignId}/share/metrics`
    )
    return response.data
  }

  /**
   * Get current user's shares
   */
  async getMyShares(page = 1, limit = 25): Promise<{
    shares: ShareRecord[]
    stats: ReferralStats
    total: number
    pages: number
  }> {
    const response = await apiClient.get<{
      shares: ShareRecord[]
      stats: ReferralStats
      total: number
      pages: number
    }>(`/shares`, {
      params: { page, limit },
    })
    return response.data
  }

  /**
   * Get share statistics for user
   */
  async getShareStats(): Promise<ReferralStats> {
    const response = await apiClient.get<ReferralStats>(`/shares/stats`)
    return response.data
  }

  /**
   * Get QR code for a share link
   */
  async getQRCode(shareLink: string): Promise<QRCodeData> {
    const response = await apiClient.post<QRCodeData>(
      `/share/qrcode`,
      { shareLink }
    )
    return response.data
  }

  /**
   * Track referral click
   */
  async trackReferralClick(referralId: string): Promise<{ success: boolean }> {
    const response = await apiClient.post<{ success: boolean }>(
      `/referrals/${referralId}/click`
    )
    return response.data
  }

  /**
   * Get the Share-to-Earn leaderboard (top sharers by earnings).
   * Public endpoint — pass campaignId to scope to a single campaign.
   * GET /share/leaderboard
   */
  async getShareLeaderboard(params: {
    campaignId?: string
    limit?: number
    page?: number
  } = {}): Promise<ShareLeaderboard> {
    const { campaignId, limit = 20, page = 1 } = params
    const response = await apiClient.get<{ success: boolean; leaderboard: ShareLeaderboard }>(
      `/share/leaderboard`,
      {
        params: {
          ...(campaignId ? { campaign_id: campaignId } : {}),
          limit,
          page,
        },
      }
    )
    return response.data.leaderboard
  }

  /**
   * Get referral history for a user
   */
  async getReferralHistory(page = 1, limit = 25): Promise<{
    referrals: Array<{
      id: string
      email: string
      status: 'pending' | 'registered' | 'converted'
      bounty?: number
      createdAt: string
    }>
    total: number
    pages: number
  }> {
    const response = await apiClient.get(
      `/referrals/history`,
      {
        params: { page, limit },
      }
    )
    return response.data
  }
}

export const sharingService = new SharingService()
