'use client'

import { useQuery } from '@tanstack/react-query'
import { profileService } from '@/api/services/profileService'
import { profileKeys, useLeaderboard } from './useProfile'

/**
 * Gamification reads. Level/XP/badges come from the dedicated
 * `/users/me/gamification` endpoint; the leaderboard is re-exported from
 * useProfile for a single import surface in gamification UI.
 */
export function useGamification() {
  return useQuery({
    queryKey: profileKeys.gamification(),
    queryFn: () => profileService.getGamification(),
    staleTime: 60 * 1000,
  })
}

export { useLeaderboard }
