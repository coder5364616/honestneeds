/**
 * Share Leaderboard Hook
 * Fetches the Share-to-Earn leaderboard (top sharers by earnings),
 * either global or scoped to a single campaign.
 */

import { useQuery } from '@tanstack/react-query'
import { sharingService, ShareLeaderboard } from '@/api/services/sharingService'

export interface UseShareLeaderboardParams {
  campaignId?: string
  limit?: number
  page?: number
}

/**
 * Get the Share-to-Earn leaderboard.
 * Endpoint: GET /share/leaderboard (public)
 */
export const useShareLeaderboard = (params: UseShareLeaderboardParams = {}) => {
  const { campaignId, limit = 20, page = 1 } = params

  return useQuery<ShareLeaderboard>({
    queryKey: ['share', 'leaderboard', { campaignId: campaignId || 'global', limit, page }],
    queryFn: () => sharingService.getShareLeaderboard({ campaignId, limit, page }),
    staleTime: 60 * 1000, // 1 minute — near-real-time per RG-01 NFR
    refetchInterval: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}
