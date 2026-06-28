import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { shareLimitService, ShareGrantStatus } from '@/api/services/shareLimitService'

/**
 * Hooks for the daily share-limit + extra-share-request flow (2026-06).
 */

export const shareLimitKeys = {
  all: ['shareLimit'] as const,
  eligibility: (campaignId: string) => [...shareLimitKeys.all, 'eligibility', campaignId] as const,
  campaignRequests: (campaignId: string, status: string) =>
    [...shareLimitKeys.all, 'campaignRequests', campaignId, status] as const,
  myRequests: (status: string) => [...shareLimitKeys.all, 'myRequests', status] as const,
}

/** My current daily tip-eligibility for a campaign. */
export function useShareEligibility(campaignId: string | null, enabled = true) {
  return useQuery({
    queryKey: shareLimitKeys.eligibility(campaignId || ''),
    queryFn: () => shareLimitService.getEligibility(campaignId as string),
    enabled: !!campaignId && enabled,
    staleTime: 30 * 1000,
  })
}

/** Sharer: request another tip-eligible share from the creator. */
export function useRequestExtraShare(campaignId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ reason, channel }: { reason: string; channel?: string }) =>
      shareLimitService.requestExtraShare(campaignId, reason, channel),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shareLimitKeys.eligibility(campaignId) })
      qc.invalidateQueries({ queryKey: shareLimitKeys.myRequests('all') })
    },
  })
}

/** Creator inbox: extra-share requests for a campaign. */
export function useCampaignShareRequests(
  campaignId: string | null,
  status: ShareGrantStatus | 'all' = 'pending'
) {
  return useQuery({
    queryKey: shareLimitKeys.campaignRequests(campaignId || '', status),
    queryFn: () => shareLimitService.listCampaignRequests(campaignId as string, status),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
  })
}

/** Sharer's own extra-share requests. */
export function useMyShareRequests(status: ShareGrantStatus | 'all' = 'all') {
  return useQuery({
    queryKey: shareLimitKeys.myRequests(status),
    queryFn: () => shareLimitService.getMyRequests(status),
    staleTime: 30 * 1000,
  })
}

/** Creator: approve/deny an extra-share request. */
export function useReviewShareRequest(campaignId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      requestId,
      approved,
      note,
    }: {
      requestId: string
      approved: boolean
      note?: string
    }) => shareLimitService.reviewRequest(requestId, approved, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shareLimitKeys.all })
    },
  })
}
