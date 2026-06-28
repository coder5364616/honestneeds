import { apiClient } from '@/lib/api'

/**
 * Donation Service
 * Handles all donation-related API calls
 */

// Canonical donation fee rate (F-9) — mirrors backend feeEngine.DONATION_FEE_RATE.
export const DONATION_FEE_RATE = 0.05
export const DONATION_FEE_PERCENT = Math.round(DONATION_FEE_RATE * 100)

export interface DonationAmount {
  gross: number // user's input (cents)
  platformFee: number // DONATION_FEE_RATE of gross (cents)
  net: number // gross - fee (cents)
}

export interface PaymentMethodDetails {
  type: 'venmo' | 'paypal' | 'cashapp' | 'bank' | 'crypto' | 'other'
  [key: string]: string
}

export interface CreateDonationRequest {
  campaignId: string
  amount: number // cents
  paymentMethod: string // just the type: 'venmo' | 'paypal' | etc
  screenshotProof?: File | string // File object or undefined
  referralCode?: string // ✅ ADDED: Optional referral code for share conversions
}

export interface RefundRequest {
  status: 'requested' | 'approved' | 'declined'
  reason?: string
  requestedAt?: string
  decidedAt?: string
  decisionNote?: string
}

export interface Donation {
  transactionId: string
  id: string
  campaignId: string
  campaignTitle: string
  donorId: string
  donorEmail: string
  donorName: string
  amount: number // cents (gross)
  platformFee: number // cents
  netAmount: number // cents
  paymentMethod: PaymentMethodDetails
  status: 'pending' | 'verified' | 'rejected' | 'refunded'
  statusReason?: string
  // CE-2 / CE-7: refund-request state
  refundRequest?: RefundRequest | null
  refundRequestStatus?: string | null
  canRequestRefund?: boolean
  createdAt: string
  verifiedAt?: string
  // ✅ ADDED: Share reward info if donation came from share referral
  share_reward?: {
    transaction_id: string
    amount_cents: number
    amount_dollars: string
    status: string
    hold_until_date: string
    hold_days_remaining: number
    message: string
  }
}

export interface DonationStats {
  totalDonations: number
  totalAmount: number // cents
  averageDonation: number // cents
  recentDonations: Donation[]
}

/**
 * A donation awaiting the creator's "I received this" confirmation.
 * Returned by the manual-donation confirmation queue (CF-1).
 */
export interface PendingDonation {
  transaction_id: string
  _id: string
  donor_name: string
  donor_email: string | null
  amount_dollars: string
  amount_cents: number
  net_amount_cents: number
  payment_method: string
  proof_url: string | null
  payment_marked_sent: boolean
  payment_sent_at: string | null
  has_referral: boolean
  created_at: string
}

export interface PendingDonationsResult {
  donations: PendingDonation[]
  summary: { pending_count: number; pending_amount_dollars: string }
  pagination: { page: number; limit: number; total: number; pages: number }
}

export interface CampaignDonationMetrics {
  campaignId: string
  totalDonations: number
  totalRaised: number // cents
  avgDonation: number // cents
  topDonor?: {
    name: string
    amount: number
  }
  donationsByDate: Array<{
    date: string
    count: number
    amount: number
  }>
}

class DonationService {
  /**
   * Calculate donation amounts with platform fee
   * @param gross User's input amount in cents
   * @returns Object with gross, fee, and net amounts
   */
  calculateFee(gross: number): DonationAmount {
    const platformFee = Math.round(gross * DONATION_FEE_RATE)
    const net = gross - platformFee

    return {
      gross,
      platformFee,
      net,
    }
  }

  /**
   * Create a new donation
   */
  async createDonation(data: CreateDonationRequest): Promise<Donation> {
    // Send as JSON (backend has express.json() middleware)
    // Backend expects: amount in DOLLARS, paymentMethod as string
    const payload: any = {
      amount: data.amount, // Already in dollars from frontend
      paymentMethod: data.paymentMethod,
    }

    // ✅ Include referral code if provided (for share conversion attribution)
    if (data.referralCode) {
      payload.referralCode = data.referralCode
    }

    try {
      const response = await apiClient.post<Donation>(
        `/campaigns/${data.campaignId}/donations`,
        payload
      )
      return response.data
    } catch (error) {
      throw error
    }
  }

  /**
   * Get my donations
   */
  async getMyDonations(page = 1, limit = 25): Promise<{
    donations: Donation[]
    total: number
    pages: number
  }> {
    const response = await apiClient.get<{
      success: boolean
      data: {
        donations: Donation[]
        pagination: { page: number; limit: number; total: number; pages: number }
      }
    }>(`/donations`, {
      params: { page, limit },
    })
    const { donations, pagination } = response.data.data
    return {
      donations,
      total: pagination.total,
      pages: pagination.pages,
    }
  }

  /**
   * Get my donation by ID
   */
  async getDonation(donationId: string): Promise<Donation> {
    const response = await apiClient.get<{
      success: boolean
      data: Donation
    }>(`/donations/${donationId}`)
    return response.data.data
  }

  /**
   * Get campaign donation metrics
   */
  async getCampaignDonationMetrics(campaignId: string): Promise<CampaignDonationMetrics> {
    const response = await apiClient.get<CampaignDonationMetrics>(
      `/campaigns/${campaignId}/donations/metrics`
    )
    return response.data
  }

  /**
   * Get all donations for a campaign (admin)
   */
  async getCampaignDonations(
    campaignId: string,
    page = 1,
    limit = 25,
    status?: 'pending' | 'verified' | 'rejected'
  ): Promise<{
    donations: Donation[]
    total: number
    pages: number
  }> {
    const response = await apiClient.get<{
      donations: Donation[]
      total: number
      pages: number
    }>(`/admin/campaigns/${campaignId}/donations`, {
      params: { page, limit, status },
    })
    return response.data
  }

  /**
   * Verify a donation (admin)
   */
  async verifyDonation(donationId: string): Promise<Donation> {
    const response = await apiClient.post<Donation>(
      `/admin/donations/${donationId}/verify`
    )
    return response.data
  }

  /**
   * Reject a donation (admin)
   */
  async rejectDonation(
    donationId: string,
    reason: string
  ): Promise<Donation> {
    const response = await apiClient.post<Donation>(
      `/admin/donations/${donationId}/reject`,
      { reason }
    )
    return response.data
  }

  /**
   * Get donation statistics for dashboard
   */
  async getDonationStats(): Promise<DonationStats> {
    const response = await apiClient.get<DonationStats>(`/donations/stats`)
    return response.data
  }

  // ── Manual-donation confirmation queue (CF-1 / F-1) ───────────────────────

  /**
   * Get the creator/admin confirmation queue for a campaign — donations that
   * are recorded but awaiting "I received this" confirmation.
   */
  async getCampaignPendingDonations(
    campaignId: string,
    page = 1,
    limit = 25
  ): Promise<PendingDonationsResult> {
    const response = await apiClient.get<{
      success: boolean
      data: PendingDonation[]
      summary: { pending_count: number; pending_amount_dollars: string }
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`/campaigns/${campaignId}/donations/pending`, {
      params: { page, limit },
    })
    return {
      donations: response.data.data,
      summary: response.data.summary,
      pagination: response.data.pagination,
    }
  }

  /**
   * Confirm receipt of a manual donation (creator or admin).
   * Transitions the donation pending → verified so it counts toward the total.
   */
  async confirmDonationReceipt(
    campaignId: string,
    transactionId: string
  ): Promise<{ transaction_id: string; status: string; amount_dollars: string }> {
    const response = await apiClient.post<{
      success: boolean
      message: string
      data: { transaction_id: string; status: string; amount_dollars: string }
    }>(`/campaigns/${campaignId}/donations/${transactionId}/confirm`)
    return response.data.data
  }

  /**
   * Reject a manual donation (not received / fraudulent). Reverses any
   * accounting that had already been applied.
   */
  async rejectDonationReceipt(
    campaignId: string,
    transactionId: string,
    reason: string
  ): Promise<{ transaction_id: string; status: string }> {
    const response = await apiClient.post<{
      success: boolean
      message: string
      data: { transaction_id: string; status: string }
    }>(`/campaigns/${campaignId}/donations/${transactionId}/reject`, { reason })
    return response.data.data
  }

  /**
   * Donor marks their off-platform payment as sent, optionally attaching a
   * proof-of-payment URL (screenshot/reference).
   */
  async markDonationSent(
    campaignId: string,
    transactionId: string,
    proofUrl?: string
  ): Promise<{ transaction_id: string; status: string }> {
    const response = await apiClient.post<{
      success: boolean
      data: { transaction_id: string; status: string }
    }>(`/campaigns/${campaignId}/donations/${transactionId}/mark-sent`, {
      proofUrl,
    })
    return response.data.data
  }

  /**
   * CF-2: Donor uploads a proof-of-payment image. The file is sent as multipart
   * (field name `image`) and stored in Cloudinary server-side; this also marks
   * the payment as sent. Returns the stored proof URL.
   */
  async uploadDonationProof(
    campaignId: string,
    transactionId: string,
    file: File
  ): Promise<{ transaction_id: string; status: string; proof_url: string }> {
    const formData = new FormData()
    // Field name must be `image` to match the backend upload middleware.
    formData.append('image', file, file.name)

    const response = await apiClient.post<{
      success: boolean
      data: { transaction_id: string; status: string; proof_url: string }
    }>(`/campaigns/${campaignId}/donations/${transactionId}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  }

  // ── CE-2 donor dashboard ──────────────────────────────────────────────────

  async getDonorDashboard(): Promise<DonorDashboard> {
    const response = await apiClient.get<{ success: boolean; data: DonorDashboard }>(
      `/donations/dashboard`
    )
    return response.data.data
  }

  // ── CE-7 refund-request flow ──────────────────────────────────────────────

  /** Donor requests a refund on their own donation. */
  async requestRefund(donationId: string, reason: string): Promise<{ transaction_id: string; refund_request: any }> {
    const response = await apiClient.post<{
      success: boolean
      message: string
      data: { transaction_id: string; refund_request: any }
    }>(`/donations/${donationId}/refund-request`, { reason })
    return response.data.data
  }

  /** Creator/admin lists refund requests for a campaign. */
  async getCampaignRefundRequests(
    campaignId: string,
    status: 'requested' | 'approved' | 'declined' = 'requested',
    page = 1,
    limit = 25
  ): Promise<CampaignRefundRequestsResult> {
    const response = await apiClient.get<{
      success: boolean
      requests: CampaignRefundRequest[]
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`/campaigns/${campaignId}/refund-requests`, { params: { status, page, limit } })
    return { requests: response.data.requests, pagination: response.data.pagination }
  }

  /** Creator/admin approves or declines a refund request. */
  async decideRefundRequest(
    donationId: string,
    decision: 'approve' | 'decline',
    note?: string
  ): Promise<{ transaction_id: string; status: string; refund_request: any }> {
    const response = await apiClient.post<{
      success: boolean
      message: string
      data: { transaction_id: string; status: string; refund_request: any }
    }>(`/donations/${donationId}/refund-request/decide`, { decision, note })
    return response.data.data
  }

  // ── CE-1 campaign edit history ────────────────────────────────────────────

  async getCampaignEditHistory(campaignId: string): Promise<EditHistoryEntry[]> {
    const response = await apiClient.get<{ success: boolean; data: EditHistoryEntry[] }>(
      `/campaigns/${campaignId}/edit-history`
    )
    return response.data.data
  }
}

export interface DonorDashboard {
  total_donations: number
  total_confirmed_dollars: string
  by_status: Record<string, { count: number; amount_dollars: string }>
  pending_confirmation: number
  open_refund_requests: number
}

export interface CampaignRefundRequest {
  transaction_id: string
  _id: string
  donor_name: string
  donor_email: string | null
  amount_dollars: string
  amount_cents: number
  donation_status: string
  refund_request: {
    status: string
    reason?: string
    requested_at?: string
    decided_at?: string
    decision_note?: string
  }
  created_at: string
}

export interface CampaignRefundRequestsResult {
  requests: CampaignRefundRequest[]
  pagination: { page: number; limit: number; total: number; pages: number }
}

export interface EditHistoryEntry {
  id: string
  action: string
  description?: string
  changes?: { before: Record<string, any>; after: Record<string, any> } | null
  editedBy?: { id: string; name: string } | null
  at: string
}

export const donationService = new DonationService()
