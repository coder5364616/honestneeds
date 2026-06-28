import { apiClient } from '@/lib/api'

/**
 * Share-Limit Service
 *
 * Backs the client's daily share rule (2026-06): a sharer earns a tip from only
 * ONE reward-eligible share per campaign per day, and can ask the creator (with
 * a reason) to share again for a tip. Free sharing is always allowed.
 */

export interface ShareEligibility {
  reward_eligible_used: number
  quota_today: number
  base_quota: number
  granted_slots: number
  remaining_reward_shares: number
  next_share_reward_eligible: boolean
  can_request_more: boolean
  has_pending_request: boolean
}

export type ShareGrantStatus = 'pending' | 'approved' | 'denied' | 'consumed' | 'expired'

export interface ShareGrantRequest {
  request_id: string
  campaign: { id: string; title?: string; image_url?: string }
  requester: { id: string; name?: string; email?: string; avatar_url?: string }
  creator_id: string
  reason: string
  requested_channel: string | null
  status: ShareGrantStatus
  for_date: string
  review_note: string | null
  reviewed_at: string | null
  consumed_at: string | null
  created_at: string
}

export interface PagedRequests {
  items: ShareGrantRequest[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

class ShareLimitService {
  /** GET /campaigns/:id/share/eligibility — my daily tip-eligibility for a campaign. */
  async getEligibility(campaignId: string): Promise<ShareEligibility> {
    const res = await apiClient.get<{ success: boolean; data: ShareEligibility }>(
      `/campaigns/${campaignId}/share/eligibility`
    )
    return res.data.data
  }

  /** POST /campaigns/:id/share/extra-request — ask the creator to share again for a tip. */
  async requestExtraShare(
    campaignId: string,
    reason: string,
    channel?: string
  ): Promise<ShareGrantRequest> {
    const res = await apiClient.post<{ success: boolean; data: ShareGrantRequest }>(
      `/campaigns/${campaignId}/share/extra-request`,
      { reason, channel }
    )
    return res.data.data
  }

  /** GET /campaigns/:id/share/extra-requests — creator inbox for a campaign. */
  async listCampaignRequests(
    campaignId: string,
    status: ShareGrantStatus | 'all' = 'pending',
    page = 1,
    limit = 20
  ): Promise<PagedRequests> {
    const res = await apiClient.get<{ success: boolean } & PagedRequests>(
      `/campaigns/${campaignId}/share/extra-requests`,
      { params: { status, page, limit } }
    )
    return { items: res.data.items, pagination: res.data.pagination }
  }

  /** GET /sharer/extra-requests — my own extra-share requests. */
  async getMyRequests(
    status: ShareGrantStatus | 'all' = 'all',
    page = 1,
    limit = 20
  ): Promise<PagedRequests> {
    const res = await apiClient.get<{ success: boolean } & PagedRequests>(`/sharer/extra-requests`, {
      params: { status, page, limit },
    })
    return { items: res.data.items, pagination: res.data.pagination }
  }

  /** POST /share/extra-requests/:requestId/review — creator approves/denies. */
  async reviewRequest(
    requestId: string,
    approved: boolean,
    note?: string
  ): Promise<ShareGrantRequest> {
    const res = await apiClient.post<{ success: boolean; data: ShareGrantRequest }>(
      `/share/extra-requests/${requestId}/review`,
      { approved, note }
    )
    return res.data.data
  }
}

export const shareLimitService = new ShareLimitService()
