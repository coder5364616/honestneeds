/**
 * Wallet & Withdrawal Hooks
 * Manages wallet balance, withdrawal requests, and payout tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface WalletBalance {
  balance_cents: number
  available_cents: number
  pending_cents: number
  reserved_cents: number
  total_earned_cents: number
  total_withdrawn_cents: number
  currency: string
}

export interface WalletOverview extends WalletBalance {
  transactions_count: number
  conversion_rate: number
  pending_withdrawal_amount: number
  withdrawal_count: number
  account_health: 'good' | 'fair' | 'low'
}

export interface Transaction {
  id: string
  type: 'reward' | 'commission' | 'deposit' | 'withdrawal'
  amount: number
  description: string
  status: 'completed' | 'pending' | 'failed'
  reference: string
  created_at: string
}

export interface Withdrawal {
  id: string
  amount: number
  net_payout: number
  fee: number
  status: 'requested' | 'processing' | 'completed' | 'failed' | 'pending_retry' | 'cancelled'
  payment_method: {
    type: string
    display_name: string
    last_four?: string
  }
  created_at: string
  completed_at?: string
  error?: string
  retry_count?: number
}

export interface WithdrawalRequest {
  amount_cents: number
  payment_method_id: string
  campaign_id: string  // Single campaign this withdrawal is from
  notes?: string
}

export interface EarningsSummary {
  total_earned: number
  by_source: {
    [key: string]: {
      amount: number
      transactions: number
    }
  }
  period: string
}

export interface PayoutStatus {
  pending_amount: number
  next_payout_date: string | null
  last_payout_date: string | null
  payout_schedule: 'weekly' | 'bi-weekly' | 'monthly' | 'manual'
  currency: string
}

export interface WithdrawalStats {
  total_withdrawals: number
  completed_count: number
  failed_count: number
  completion_rate: string | number
  average_processing_time_hours: number
}

// ============================================================================
// WALLET HOOKS
// ============================================================================

/**
 * Get wallet balance
 */
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/balance')
      return data.balance as WalletBalance
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchIntervalInBackground: true
  })
}

/**
 * Get wallet overview with stats
 */
export const useWalletOverview = () => {
  return useQuery({
    queryKey: ['wallet', 'overview'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/overview')
      return data.overview as WalletOverview
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Get transaction history
 */
export const useTransactionHistory = (page = 1, limit = 20, type = 'all') => {
  return useQuery({
    queryKey: ['wallet', 'transactions', page, limit, type],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/transactions', {
        params: { page, limit, type }
      })
      return {
        transactions: data.transactions as Transaction[],
        pagination: data.pagination
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Get earnings summary
 */
export const useEarningsSummary = (period: 'week' | 'month' | 'year' | 'all' = 'all') => {
  return useQuery({
    queryKey: ['wallet', 'earnings-summary', period],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/earnings-summary', {
        params: { period }
      })
      return data.earnings_summary as EarningsSummary
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  })
}

/**
 * Get earnings by campaign
 */
export const useEarnedByCampaign = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['wallet', 'earned-by-campaign', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/earned-by-campaign', {
        params: { page, limit }
      })
      return data
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  })
}

// ============================================================================
// WITHDRAWAL HOOKS
// ============================================================================

/**
 * Get withdrawal history
 */
export const useWithdrawalHistory = (
  page = 1,
  limit = 20,
  status: 'all' | 'requested' | 'processing' | 'completed' | 'failed' = 'all'
) => {
  return useQuery({
    queryKey: ['wallet', 'withdrawals', page, limit, status],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/withdrawals', {
        params: { page, limit, status }
      })
      return {
        withdrawals: data.withdrawals as Withdrawal[],
        pagination: data.pagination,
        stats: data.stats
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Get withdrawal details
 */
export const useWithdrawalDetails = (withdrawalId: string | null) => {
  return useQuery({
    queryKey: ['wallet', 'withdrawal', withdrawalId],
    queryFn: async () => {
      if (!withdrawalId) return null
      const { data } = await apiClient.get(`/wallet/withdrawals/${withdrawalId}`)
      return data.withdrawal as Withdrawal
    },
    enabled: !!withdrawalId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  })
}

/**
 * Get campaigns that sharer has earned from
 * Used to link withdrawals to campaigns
 */
export const useEarningCampaigns = () => {
  return useQuery({
    queryKey: ['wallet', 'earning-campaigns'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/wallet/earning-campaigns')
        console.log('[useEarningCampaigns] ✅ Fetched earning campaigns:', data.campaigns)
        return data.campaigns || []
      } catch (error) {
        console.warn('[useEarningCampaigns] ⚠️ Could not fetch earning campaigns:', error)
        return []
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
    retry: 1
  })
}

/**
 * Request a new withdrawal
 */
export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (withdrawalData: WithdrawalRequest) => {
      console.log('[useRequestWithdrawal] 📤 SENDING withdrawal request:', withdrawalData)
      const startTime = Date.now()
      
      const { data } = await apiClient.post('/wallet/withdrawals', withdrawalData)
      
      const duration = Date.now() - startTime
      console.log(`[useRequestWithdrawal] ✅ SUCCESS (${duration}ms) | withdrawal_id: ${data.withdrawal.id}`)
      
      return data.withdrawal
    },
    onSuccess: (withdrawal) => {
      console.log('[useRequestWithdrawal] 🔄 CACHE INVALIDATION STARTING')
      const startInvalidate = Date.now()
      
      // Invalidate related queries
      console.log('[useRequestWithdrawal]   - Invalidating wallet balance')
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] })
      
      console.log('[useRequestWithdrawal]   - Invalidating wallet overview')
      queryClient.invalidateQueries({ queryKey: ['wallet', 'overview'] })
      
      console.log('[useRequestWithdrawal]   - Invalidating wallet withdrawals')
      queryClient.invalidateQueries({ queryKey: ['wallet', 'withdrawals'] })

      console.log('[useRequestWithdrawal]   - Invalidating earning campaigns')
      queryClient.invalidateQueries({ queryKey: ['wallet', 'earning-campaigns'] })
      
      // Invalidate sharer earnings (used on shares/earnings page)
      console.log('[useRequestWithdrawal]   - Invalidating sharer earnings (IMPORTANT)')
      const earningsInvalidated = queryClient.invalidateQueries({ queryKey: ['sharer', 'earnings'] })
      
      const invalidateDuration = Date.now() - startInvalidate
      console.log(`[useRequestWithdrawal] ✅ CACHE INVALIDATION COMPLETE (${invalidateDuration}ms)`)
      console.log(`[useRequestWithdrawal]   - Earnings invalidated: ${earningsInvalidated}`)
    },
    onError: (error) => {
      console.error('[useRequestWithdrawal] ❌ WITHDRAWAL FAILED:', error)
    }
  })
}

/**
 * Confirm withdrawal request
 */
export const useConfirmWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ withdrawalId, verificationCode }: { withdrawalId: string; verificationCode?: string }) => {
      const { data } = await apiClient.post(
        `/wallet/withdrawals/${withdrawalId}/confirm`,
        { verification_code: verificationCode }
      )
      return data.withdrawal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    }
  })
}

/**
 * Cancel withdrawal
 */
export const useCancelWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { data } = await apiClient.post(`/wallet/withdrawals/${withdrawalId}/cancel`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    }
  })
}

/**
 * Retry failed withdrawal
 */
export const useRetryWithdrawal = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { data } = await apiClient.post(`/wallet/withdrawals/${withdrawalId}/retry`)
      return data.withdrawal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    }
  })
}

/**
 * Check withdrawal limits
 */
export const useWithdrawalLimits = () => {
  return useQuery({
    queryKey: ['wallet', 'withdrawal-limits'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/withdrawals/check-limits')
      return data.limits
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 2 * 60 * 60 * 1000 // 2 hours
  })
}

/**
 * Get withdrawal statistics
 */
export const useWithdrawalStats = () => {
  return useQuery({
    queryKey: ['wallet', 'withdrawal-stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/withdrawals/stats')
      return data.stats as WithdrawalStats
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  })
}

// ============================================================================
// PAYOUT HOOKS
// ============================================================================

/**
 * Get payout status
 */
export const usePayoutStatus = () => {
  return useQuery({
    queryKey: ['wallet', 'payout-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/payouts/status')
      return data.payout_status as PayoutStatus
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  })
}

/**
 * Get payout schedule
 */
export const usePayoutSchedule = () => {
  return useQuery({
    queryKey: ['wallet', 'payout-schedule'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/payouts/schedule')
      return data.payout_schedule
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000
  })
}

/**
 * Get payout history
 */
export const usePayoutHistory = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['wallet', 'payout-history', page, limit],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/payouts/history', {
        params: { page, limit }
      })
      return data
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000
  })
}

/**
 * Change payout schedule
 */
export const useChangePayoutSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (scheduleType: 'weekly' | 'bi-weekly' | 'monthly' | 'manual') => {
      const { data } = await apiClient.post('/wallet/payouts/change-schedule', {
        schedule_type: scheduleType
      })
      return data.update
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'payout-schedule'] })
      queryClient.invalidateQueries({ queryKey: ['wallet', 'payout-status'] })
    }
  })
}

/**
 * Request manual payout
 */
export const useRequestManualPayout = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ amountCents, forceMinimum }: { amountCents?: number; forceMinimum?: boolean }) => {
      const { data } = await apiClient.post('/wallet/payouts/manual-request', {
        amount_cents: amountCents,
        force_minimum: forceMinimum
      })
      return data.payout_request
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] })
    }
  })
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

/**
 * Get wallet trends
 */
export const useWalletTrends = (period: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['wallet', 'trends', period],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/analytics/wallet-trends', {
        params: { period }
      })
      return data.trends
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000
  })
}

/**
 * Get earnings breakdown
 */
export const useEarningsBreakdown = () => {
  return useQuery({
    queryKey: ['wallet', 'earnings-breakdown'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/analytics/earnings-breakdown')
      return data.breakdown
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })
}

/**
 * Get conversion metrics
 */
export const useConversionMetrics = () => {
  return useQuery({
    queryKey: ['wallet', 'conversion-metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/analytics/conversion-metrics')
      return data.metrics
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000
  })
}

// ============================================================================
// NOTIFICATION PREFERENCES
// ============================================================================

export interface NotificationPreferences {
  email_on_payout: boolean
  email_on_reward: boolean
  email_on_withdrawal: boolean
  sms_notifications: boolean
}

/**
 * Get notification preferences
 */
export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['wallet', 'notification-preferences'],
    queryFn: async () => {
      const { data } = await apiClient.get('/wallet/notification-preferences')
      return data.preferences as NotificationPreferences
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000
  })
}

/**
 * Update notification preferences
 */
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: NotificationPreferences) => {
      const { data } = await apiClient.put('/wallet/notification-preferences', preferences)
      return data.preferences
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', 'notification-preferences'] })
    }
  })
}

export default {
  useWalletBalance,
  useWalletOverview,
  useTransactionHistory,
  useEarningsSummary,
  useEarnedByCampaign,
  useEarningCampaigns,
  useWithdrawalHistory,
  useWithdrawalDetails,
  useRequestWithdrawal,
  useConfirmWithdrawal,
  useCancelWithdrawal,
  useRetryWithdrawal,
  useWithdrawalLimits,
  useWithdrawalStats,
  usePayoutStatus,
  usePayoutSchedule,
  usePayoutHistory,
  useChangePayoutSchedule,
  useRequestManualPayout,
  useWalletTrends,
  useEarningsBreakdown,
  useConversionMetrics,
  useNotificationPreferences,
  useUpdateNotificationPreferences
}
