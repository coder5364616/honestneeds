'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { donationService, type CreateDonationRequest } from '@/api/services/donationService'
import { useToast } from '@/hooks/useToast'

/**
 * Donation Hooks
 * React Query hooks for donation operations
 */

const donationKeys = {
  all: ['donations'] as const,
  lists: () => [...donationKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...donationKeys.lists(), { page, limit }] as const,
  details: () => [...donationKeys.all, 'detail'] as const,
  detail: (id: string) => [...donationKeys.details(), id] as const,
  stats: () => [...donationKeys.all, 'stats'] as const,
  campaignMetrics: (campaignId: string) => [...donationKeys.all, 'campaignMetrics', campaignId] as const,
  pending: (campaignId: string, page: number, limit: number) =>
    [...donationKeys.all, 'pending', campaignId, { page, limit }] as const,
}

/**
 * Get current user's donations
 */
export function useDonations(page = 1, limit = 25) {
  return useQuery({
    queryKey: donationKeys.list(page, limit),
    queryFn: () => donationService.getMyDonations(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  })
}

/**
 * Get a specific donation
 */
export function useDonation(donationId: string) {
  return useQuery({
    queryKey: donationKeys.detail(donationId),
    queryFn: () => donationService.getDonation(donationId),
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    enabled: !!donationId,
  })
}

/**
 * Get campaign donation metrics
 */
export function useCampaignDonationMetrics(campaignId: string) {
  return useQuery({
    queryKey: donationKeys.campaignMetrics(campaignId),
    queryFn: () => donationService.getCampaignDonationMetrics(campaignId),
    staleTime: 5 * 60 * 1000,
    enabled: !!campaignId,
    refetchInterval: 5 * 60 * 1000, // Live updates every 5 minutes
  })
}

/**
 * Get user's donation statistics
 */
export function useDonationStats() {
  return useQuery({
    queryKey: donationKeys.stats(),
    queryFn: () => donationService.getDonationStats(),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

/**
 * Create a new donation
 */
export function useCreateDonation() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: CreateDonationRequest) => donationService.createDonation(data),
    onSuccess: (donation) => {
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: donationKeys.stats() })
      queryClient.invalidateQueries({
        queryKey: donationKeys.campaignMetrics(donation.campaignId),
      })

      showToast({
        message:
          'Donation recorded! It will count once the creator confirms they received your payment.',
        type: 'success',
      })
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Failed to create donation. Please try again.'
      showToast({
        message,
        type: 'error',
      })
    },
  })
}

/**
 * Verify a donation (admin)
 */
export function useVerifyDonation() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (donationId: string) => donationService.verifyDonation(donationId),
    onSuccess: (donation) => {
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(donation.id) })
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() })
      showToast({
        message: 'Donation verified successfully.',
        type: 'success',
      })
    },
    onError: (error: any) => {
      showToast({
        message: error?.response?.data?.message || 'Failed to verify donation.',
        type: 'error',
      })
    },
  })
}

/**
 * Reject a donation (admin)
 */
export function useRejectDonation() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ donationId, reason }: { donationId: string; reason: string }) =>
      donationService.rejectDonation(donationId, reason),
    onSuccess: (donation) => {
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(donation.id) })
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() })
      showToast({
        message: 'Donation rejected.',
        type: 'success',
      })
    },
    onError: (error: any) => {
      showToast({
        message: error?.response?.data?.message || 'Failed to reject donation.',
        type: 'error',
      })
    },
  })
}

// ── CE-2 donor dashboard ────────────────────────────────────────────────────

export function useDonorDashboard() {
  return useQuery({
    queryKey: [...donationKeys.all, 'dashboard'],
    queryFn: () => donationService.getDonorDashboard(),
    staleTime: 60 * 1000,
  })
}

// ── CE-7 refund-request flow ────────────────────────────────────────────────

/** Donor requests a refund on their own donation. */
export function useRequestRefund() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ donationId, reason }: { donationId: string; reason: string }) =>
      donationService.requestRefund(donationId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.all })
      showToast({ message: 'Refund request submitted. The creator will review it.', type: 'success' })
    },
    onError: (error: any) => {
      showToast({ message: error?.response?.data?.message || 'Failed to request refund.', type: 'error' })
    },
  })
}

/** Creator/admin: refund requests for a campaign. */
export function useCampaignRefundRequests(
  campaignId: string,
  status: 'requested' | 'approved' | 'declined' = 'requested'
) {
  return useQuery({
    queryKey: [...donationKeys.all, 'refund-requests', campaignId, status],
    queryFn: () => donationService.getCampaignRefundRequests(campaignId, status),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

/** Creator/admin approves or declines a refund request. */
export function useDecideRefundRequest(campaignId: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  return useMutation({
    mutationFn: ({ donationId, decision, note }: { donationId: string; decision: 'approve' | 'decline'; note?: string }) =>
      donationService.decideRefundRequest(donationId, decision, note),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [...donationKeys.all, 'refund-requests', campaignId] })
      queryClient.invalidateQueries({ queryKey: donationKeys.campaignMetrics(campaignId) })
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'analytics', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'detail', campaignId] })
      showToast({
        message: vars.decision === 'approve' ? 'Refund approved — donation reversed.' : 'Refund request declined.',
        type: 'success',
      })
    },
    onError: (error: any) => {
      showToast({ message: error?.response?.data?.message || 'Failed to process refund decision.', type: 'error' })
    },
  })
}

// ── CE-1 campaign edit history ──────────────────────────────────────────────

export function useCampaignEditHistory(campaignId: string) {
  return useQuery({
    queryKey: ['campaigns', 'edit-history', campaignId],
    queryFn: () => donationService.getCampaignEditHistory(campaignId),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
  })
}

// ── Manual-donation confirmation queue (CF-1 / F-1) ─────────────────────────

/**
 * Creator/admin confirmation queue for a campaign — donations awaiting
 * "I received this" confirmation.
 */
export function useCampaignPendingDonations(campaignId: string, page = 1, limit = 25) {
  return useQuery({
    queryKey: donationKeys.pending(campaignId, page, limit),
    queryFn: () => donationService.getCampaignPendingDonations(campaignId, page, limit),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

/**
 * Invalidate everything that a confirm/reject changes: the pending queue,
 * the campaign's public metrics, and the analytics view.
 */
function invalidateAfterReceiptDecision(queryClient: ReturnType<typeof useQueryClient>, campaignId: string) {
  queryClient.invalidateQueries({ queryKey: [...donationKeys.all, 'pending', campaignId] })
  queryClient.invalidateQueries({ queryKey: donationKeys.campaignMetrics(campaignId) })
  queryClient.invalidateQueries({ queryKey: ['campaigns', 'analytics', campaignId] })
  queryClient.invalidateQueries({ queryKey: ['campaigns', 'detail', campaignId] })
}

/**
 * Creator/admin confirms they received the manual payment.
 */
export function useConfirmDonationReceipt(campaignId: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (transactionId: string) =>
      donationService.confirmDonationReceipt(campaignId, transactionId),
    onSuccess: () => {
      invalidateAfterReceiptDecision(queryClient, campaignId)
      showToast({
        message: 'Donation confirmed — it now counts toward your total.',
        type: 'success',
      })
    },
    onError: (error: any) => {
      showToast({
        message: error?.response?.data?.message || 'Failed to confirm donation.',
        type: 'error',
      })
    },
  })
}

/**
 * Creator/admin rejects a donation (not received / fraudulent).
 */
export function useRejectDonationReceipt(campaignId: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ transactionId, reason }: { transactionId: string; reason: string }) =>
      donationService.rejectDonationReceipt(campaignId, transactionId, reason),
    onSuccess: () => {
      invalidateAfterReceiptDecision(queryClient, campaignId)
      showToast({
        message: 'Donation rejected. Any prior totals were reversed.',
        type: 'success',
      })
    },
    onError: (error: any) => {
      showToast({
        message: error?.response?.data?.message || 'Failed to reject donation.',
        type: 'error',
      })
    },
  })
}
