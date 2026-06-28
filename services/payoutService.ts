import { apiClient } from '@/lib/api'

/**
 * Payout Service - Frontend
 * Handles HTTP requests for payout management
 * Phase 4: Creator payout requests
 */

interface PayoutRequest {
  amount_cents: number
  payment_method: string
}

interface PayoutResponse {
  id: string
  amount_cents: number
  status: 'requested' | 'approved' | 'completed' | 'failed'
  payment_method: string
  requested_at: string
}

interface PayoutHistoryResponse {
  data: PayoutResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  summary: {
    total_requested_cents: number
    total_approved_cents: number
    total_completed_cents: number
    total_failed_cents: number
    total_all_cents: number
  }
}

interface AvailablePayoutResponse {
  data: {
    available_cents: number
    count: number
    earliest_verified: string | null
    latest_verified: string | null
  }
}

export const payoutService = {
  /**
   * Get available amount for payout
   */
  async getAvailableForPayout(): Promise<AvailablePayoutResponse> {
    const { data } = await apiClient.get('/payouts/available')
    return data
  },

  /**
   * Request a new payout
   */
  async requestPayout(
    request: PayoutRequest
  ): Promise<{ success: boolean; data: PayoutResponse }> {
    const { data } = await apiClient.post('/payouts', request)
    return data
  },

  /**
   * Get creator's payout history
   */
  async getPayoutHistory(
    page = 1,
    limit = 20
  ): Promise<PayoutHistoryResponse> {
    const { data } = await apiClient.get('/payouts/my-payouts', {
      params: { page, limit },
    })
    return data
  },

  /**
   * Get single payout details
   */
  async getPayoutDetails(payoutId: string): Promise<{
    success: boolean
    data: PayoutResponse
  }> {
    const { data } = await apiClient.get(`/payouts/${payoutId}`)
    return data
  },

  /**
   * ADMIN: Get all pending payouts
   */
  async getPendingPayouts(
    page = 1,
    limit = 20
  ): Promise<PayoutHistoryResponse> {
    const { data } = await apiClient.get('/payouts/admin/pending', {
      params: { page, limit },
    })
    return data
  },

  /**
   * ADMIN: Approve payout
   */
  async approvePayout(payoutId: string): Promise<{
    success: boolean
    data: {
      id: string
      status: string
      approved_at: string
    }
  }> {
    const { data } = await apiClient.post(`/payouts/admin/${payoutId}/approve`)
    return data
  },

  /**
   * ADMIN: Reject payout
   */
  async rejectPayout(
    payoutId: string,
    reason: string
  ): Promise<{
    success: boolean
    data: {
      id: string
      status: string
      failed_reason: string
    }
  }> {
    const { data } = await apiClient.post(
      `/api/payouts/admin/${payoutId}/reject`,
      { reason }
    )
    return data
  },

  /**
   * ADMIN: Process/complete payout
   */
  async processPayout(
    payoutId: string,
    transaction_reference: string
  ): Promise<{
    success: boolean
    data: {
      id: string
      status: string
      completed_at: string
      transaction_reference: string
    }
  }> {
    const { data } = await apiClient.post(
      `/api/payouts/admin/${payoutId}/process`,
      { transaction_reference }
    )
    return data
  },

  /**
   * ADMIN: Get payout statistics
   */
  async getPayoutStats(): Promise<{
    success: boolean
    data: {
      pending: {
        total_cents: number
        count: number
        requested_count: number
        approved_count: number
      }
      completed: {
        total_cents: number
        count: number
      }
      failed: {
        total_cents: number
        count: number
      }
      all_time: {
        total_cents: number
        total_payouts: number
      }
    }
  }> {
    const { data } = await apiClient.get('/payouts/admin/stats')
    return data
  },
}

export type { PayoutRequest, PayoutResponse, PayoutHistoryResponse }
