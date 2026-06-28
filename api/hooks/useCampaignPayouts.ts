/**
 * Campaign Payout Management Hooks
 * Creator side: View and manage sharer withdrawal requests
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

// ============================================================================
// TYPES
// ============================================================================

export interface SharerPayoutRequest {
  id: string
  amount: number
  fee: number
  net_payout: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  requested_at: string
  sharer: {
    id: string
    name: string
    email: string
    username: string
    profile_picture?: string
  }
  payment_method: {
    type: string
    last4?: string
    account_holder?: string
    account_type?: string
    display_name?: string
    // Bank transfer details
    bank_account_holder?: string
    bank_name?: string
    bank_account_type?: string
    bank_account_last_four?: string
    bank_routing_number_last_four?: string
    // Mobile money details
    mobile_number?: string
    mobile_country_code?: string
    mobile_money_provider?: string
    // Card details
    card_last_four?: string
    card_brand?: string
    // Stripe details
    stripe_payment_method_id?: string
  }
}

export interface PayoutStatusBucket {
  pending: { count: number; amount: number; fees: number }
  processing: { count: number; amount: number; fees: number }
  completed: { count: number; amount: number; fees: number }
  failed: { count: number; amount: number; fees: number }
  cancelled: { count: number; amount: number; fees: number }
}

/** Funded-budget reconciliation — keeps "amount owed" truthful vs what the creator funded. */
export interface PayoutLedger {
  declared_budget: number
  funded_budget: number
  funded_remaining: number
  rewards_paid_lifetime: number
  owed_now: number
  paid_via_payouts: number
  can_cover_owed: boolean
  shortfall: number
}

export interface PayoutSummary {
  campaign?: { id: string; title: string }
  summary: PayoutStatusBucket
  ledger: PayoutLedger
  totals: {
    total_requested: number
    total_fees: number
    total_payouts: number
    pending_payouts: number
    owed_now: number
  }
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Get all withdrawal requests from sharers for a specific campaign
 */
export const useCampaignPayoutRequests = (
  campaignId: string | null,
  // 'actionable' = pending + processing (the creator's default queue). H-6: a
  // multi-campaign withdrawal turns 'processing' once another creator pays, so
  // 'pending' alone hid this creator's still-unpaid slices.
  status:
    | 'actionable'
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'cancelled'
    | 'all' = 'actionable',
  page: number = 1,
  limit: number = 20
) => {
  return useQuery({
    queryKey: ['campaign', campaignId, 'payout-requests', status, page, limit],
    queryFn: async () => {
      if (!campaignId) return null

      console.log(`[useCampaignPayoutRequests] 🔍 Fetching ${status} payouts for campaign: ${campaignId}`)
      const { data } = await apiClient.get(`/campaigns/${campaignId}/payout-requests`, {
        params: { status, page, limit }
      })

      console.log(`[useCampaignPayoutRequests] ✅ Found ${data.data.withdrawals.length} requests`)
      return data.data
    },
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1
  })
}

/**
 * Get summary of all payouts for a campaign
 */
export const useCampaignPayoutSummary = (campaignId: string | null) => {
  return useQuery({
    queryKey: ['campaign', campaignId, 'payout-summary'],
    queryFn: async () => {
      if (!campaignId) return null

      console.log(`[useCampaignPayoutSummary] 📊 Fetching payout summary for campaign: ${campaignId}`)
      const { data } = await apiClient.get(`/campaigns/${campaignId}/payout-summary`)

      console.log(`[useCampaignPayoutSummary] ✅ Summary loaded`)
      return data.data as PayoutSummary
    },
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1
  })
}

/**
 * Mark a withdrawal as paid
 */
export const useMarkPayoutAsPaid = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      campaignId,
      withdrawalId,
      transaction_id,
      notes,
      proof
    }: {
      campaignId: string
      withdrawalId: string
      transaction_id?: string
      notes?: string
      proof?: File | null
    }) => {
      console.log(`[useMarkPayoutAsPaid] 💸 Marking ${withdrawalId} as paid`)
      // F-2: send multipart so an optional proof screenshot (`image`) rides along.
      const form = new FormData()
      if (transaction_id) form.append('transaction_id', transaction_id)
      if (notes) form.append('notes', notes)
      if (proof) form.append('image', proof, proof.name)
      const { data } = await apiClient.patch(
        `/campaigns/${campaignId}/payouts/${withdrawalId}/mark-paid`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      console.log(`[useMarkPayoutAsPaid] ✅ Success - status: ${data.data.status}`)
      return data.data
    },
    onSuccess: (_, { campaignId }) => {
      console.log(`[useMarkPayoutAsPaid] 🔄 Invalidating cache for campaign: ${campaignId}`)
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId, 'payout-requests'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId, 'payout-summary'] })
      queryClient.invalidateQueries({ queryKey: ['creator', 'owed-payouts'] })
    },
    onError: (error: any) => {
      console.error(`[useMarkPayoutAsPaid] ❌ Failed:`, error.response?.data?.error || error.message)
    }
  })
}

/**
 * F-1: Cross-campaign "amount owed" — all this creator's pending sharer payouts.
 */
export interface OwedPayoutItem {
  withdrawal_id: string
  campaign_id: string
  campaign_title: string
  amount: number
  requested_at: string
  age_days: number
  reminder_count: number
  sharer: { id: string; name?: string; username?: string; email?: string; profile_picture?: string }
  payment_method: Record<string, any>
}

export const useCreatorOwedPayouts = () => {
  return useQuery({
    queryKey: ['creator', 'owed-payouts'],
    queryFn: async (): Promise<{ total_owed: number; count: number; items: OwedPayoutItem[] }> => {
      const { data } = await apiClient.get('/campaigns/creator/owed')
      return data.data
    },
    staleTime: 2 * 60 * 1000,
    retry: 1
  })
}

/**
 * Trust-based proof view: a sharer's shares/clicks/conversions and the reward
 * owed/paid for this campaign — what the creator inspects before paying.
 */
export interface SharerTracking {
  campaign: { id: string; title: string }
  sharer: {
    id: string
    name?: string
    username?: string
    email?: string
    profile_picture?: string
    joined_at?: string
  }
  shares: Array<{
    share_id: string
    channel: string
    referral_code: string
    clicks: number
    conversions: number
    created_at: string
  }>
  share_summary: { total_shares: number; total_clicks: number; total_conversions: number }
  conversions: Array<{
    reward_id: string
    reward_status: 'owed' | 'paid' | 'pending_hold' | 'approved'
    reward_amount_cents: number
    channel: string | null
    referral_code: string | null
    earned_at: string
    donation: { id: string | null; amount_cents: number | null; donated_at: string | null; status: string | null }
  }>
  totals: {
    conversion_count: number
    owed_cents: number
    owed_dollars: string
    paid_cents: number
    paid_dollars: string
  }
}

export const useSharerTracking = (campaignId: string | null, sharerId: string | null) => {
  return useQuery({
    queryKey: ['campaign', campaignId, 'sharer-tracking', sharerId],
    queryFn: async (): Promise<SharerTracking | null> => {
      if (!campaignId || !sharerId) return null
      const { data } = await apiClient.get(`/campaigns/${campaignId}/sharers/${sharerId}/tracking`)
      return data.data as SharerTracking
    },
    enabled: !!campaignId && !!sharerId,
    staleTime: 2 * 60 * 1000,
    retry: 1
  })
}

/**
 * Creator disputes a payout slice they believe is fraudulent/incorrect.
 */
export const useDisputePayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      campaignId,
      withdrawalId,
      reason
    }: {
      campaignId: string
      withdrawalId: string
      reason: string
    }) => {
      const { data } = await apiClient.post(
        `/campaigns/${campaignId}/payouts/${withdrawalId}/dispute`,
        { reason }
      )
      return data.data
    },
    onSuccess: (_, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId, 'payout-requests'] })
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId, 'payout-summary'] })
      queryClient.invalidateQueries({ queryKey: ['creator', 'owed-payouts'] })
    },
    onError: (error: any) => {
      console.error('[useDisputePayout] ❌ Failed:', error.response?.data?.error || error.message)
    }
  })
}

export default {
  useCreatorOwedPayouts,
  useCampaignPayoutRequests,
  useCampaignPayoutSummary,
  useMarkPayoutAsPaid,
  useSharerTracking,
  useDisputePayout
}
