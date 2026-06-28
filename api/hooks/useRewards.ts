'use client'

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { gamificationService } from '@/api/services/gamificationService'
import type {
  LeaderboardCategory,
  LeaderboardPeriod,
  CreateTeamPayload,
} from '@/types/gamification'

/**
 * Rewards & Gamification hooks (RG-02..RG-21) over `/api/gamification`.
 * A single key factory keeps cache invalidation coherent across the hub.
 */
export const rewardsKeys = {
  all: ['gamification'] as const,
  progress: () => [...rewardsKeys.all, 'progress'] as const,
  userProgress: (id: string) => [...rewardsKeys.all, 'progress', id] as const,
  viral: () => [...rewardsKeys.all, 'viral'] as const,
  goldenTickets: () => [...rewardsKeys.all, 'golden-tickets'] as const,
  hopeMeter: () => [...rewardsKeys.all, 'hope-meter'] as const,
  campaignHope: (id: string) => [...rewardsKeys.all, 'hope-meter', 'campaign', id] as const,
  prayerMeter: (id: string) => [...rewardsKeys.all, 'prayer-meter', id] as const,
  journey: (limit: number) => [...rewardsKeys.all, 'journey', limit] as const,
  celebrations: (limit: number) => [...rewardsKeys.all, 'celebrations', limit] as const,
  swipe: (params: Record<string, unknown>) => [...rewardsKeys.all, 'swipe', params] as const,
  missions: () => [...rewardsKeys.all, 'missions'] as const,
  leaderboard: (c: string, p: string, l: number) => [...rewardsKeys.all, 'leaderboard', c, p, l] as const,
  myRank: (c: string) => [...rewardsKeys.all, 'rank', c] as const,
  teams: (params: Record<string, unknown>) => [...rewardsKeys.all, 'teams', params] as const,
  team: (id: string) => [...rewardsKeys.all, 'team', id] as const,
  challenges: (params: Record<string, unknown>) => [...rewardsKeys.all, 'challenges', params] as const,
  challenge: (id: string) => [...rewardsKeys.all, 'challenge', id] as const,
  hunts: (params: Record<string, unknown>) => [...rewardsKeys.all, 'hunts', params] as const,
  hunt: (id: string) => [...rewardsKeys.all, 'hunt', id] as const,
  miracle: (limit: number) => [...rewardsKeys.all, 'miracle', limit] as const,
}

// ── RG-02/03 Progress ──────────────────────────────────────────────────────
export function useMyGamification(enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.progress(),
    queryFn: () => gamificationService.getMyProgress(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useUserGamification(userId: string | undefined) {
  return useQuery({
    queryKey: rewardsKeys.userProgress(userId ?? ''),
    queryFn: () => gamificationService.getUserProgress(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000,
  })
}

// ── RG-04 Streak ────────────────────────────────────────────────────────────
export function useStreakCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => gamificationService.checkInStreak(),
    onSuccess: (snap) => {
      qc.invalidateQueries({ queryKey: rewardsKeys.progress() })
      if (snap?.xp_awarded) toast.success(`🔥 ${snap.current}-day streak! +${snap.xp_awarded} XP`)
    },
    onError: (e: Error) => toast.error(e.message || 'Could not check in.'),
  })
}

// ── RG-05 Leaderboards ───────────────────────────────────────────────────────
export function useLeaderboardBoard(
  category: LeaderboardCategory = 'xp',
  period: LeaderboardPeriod = 'all_time',
  limit = 20
) {
  return useQuery({
    queryKey: rewardsKeys.leaderboard(category, period, limit),
    queryFn: () => gamificationService.getLeaderboard(category, { period, limit }),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useMyRank(category: LeaderboardCategory = 'xp', enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.myRank(category),
    queryFn: () => gamificationService.getMyRank(category),
    enabled,
    staleTime: 30 * 1000,
  })
}

// ── RG-09 Viral ───────────────────────────────────────────────────────────────
export function useMyViralStatus(enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.viral(),
    queryFn: () => gamificationService.getMyViralStatus(),
    enabled,
    staleTime: 60 * 1000,
  })
}

// ── RG-10 Golden Tickets ──────────────────────────────────────────────────────
export function useMyGoldenTickets(enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.goldenTickets(),
    queryFn: () => gamificationService.getMyGoldenTickets(),
    enabled,
    staleTime: 60 * 1000,
  })
}

// ── RG-14 / RG-06 Meters ──────────────────────────────────────────────────────
export function useMyHopeMeter(enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.hopeMeter(),
    queryFn: () => gamificationService.getMyHopeMeter(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useCampaignHopeMeter(campaignId: string | undefined) {
  return useQuery({
    queryKey: rewardsKeys.campaignHope(campaignId ?? ''),
    queryFn: () => gamificationService.getCampaignHopeMeter(campaignId as string),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
  })
}

export function usePrayerPowerMeter(campaignId: string | undefined) {
  return useQuery({
    queryKey: rewardsKeys.prayerMeter(campaignId ?? ''),
    queryFn: () => gamificationService.getPrayerPowerMeter(campaignId as string),
    enabled: !!campaignId,
    staleTime: 20 * 1000,
  })
}

// ── RG-15 Journey / RG-12 Celebrations ────────────────────────────────────────
export function useMyJourney(limit = 50, enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.journey(limit),
    queryFn: () => gamificationService.getMyJourney(limit),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useMyCelebrations(limit = 20, enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.celebrations(limit),
    queryFn: () => gamificationService.getMyCelebrations(limit),
    enabled,
    staleTime: 30 * 1000,
  })
}

// ── RG-17 Swipe feed ──────────────────────────────────────────────────────────
export function useSwipeFeed(params: { limit?: number; city?: string } = {}) {
  return useQuery({
    queryKey: rewardsKeys.swipe(params),
    queryFn: () => gamificationService.getSwipeFeed(params),
    staleTime: 30 * 1000,
  })
}

// ── RG-18 Missions ────────────────────────────────────────────────────────────
export function useMyMissions(enabled = true) {
  return useQuery({
    queryKey: rewardsKeys.missions(),
    queryFn: () => gamificationService.getMyMissions(),
    enabled,
    staleTime: 30 * 1000,
  })
}

// ── RG-07 Teams ───────────────────────────────────────────────────────────────
export function useTeams(params: { challenge_id?: string; campaign_id?: string; city?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: rewardsKeys.teams(params),
    queryFn: () => gamificationService.listTeams(params),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })
}

export function useTeam(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: rewardsKeys.team(idOrSlug ?? ''),
    queryFn: () => gamificationService.getTeam(idOrSlug as string),
    enabled: !!idOrSlug,
    staleTime: 20 * 1000,
  })
}

export function useCreateTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => gamificationService.createTeam(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardsKeys.all })
      toast.success('Team created!')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not create team.'),
  })
}

export function useJoinTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gamificationService.joinTeam(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardsKeys.all })
      toast.success('You joined the team! 🎉')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not join team.'),
  })
}

export function useLeaveTeam() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => gamificationService.leaveTeam(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardsKeys.all })
      toast.info('You left the team.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not leave team.'),
  })
}

// ── RG-08/20/21 Challenges ──────────────────────────────────────────────────
export function useChallenges(params: { status?: string; type?: string } = {}) {
  return useQuery({
    queryKey: rewardsKeys.challenges(params),
    queryFn: () => gamificationService.listChallenges(params),
    staleTime: 60 * 1000,
  })
}

export function useChallenge(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: rewardsKeys.challenge(idOrSlug ?? ''),
    queryFn: () => gamificationService.getChallenge(idOrSlug as string),
    enabled: !!idOrSlug,
    staleTime: 20 * 1000,
    refetchInterval: 60 * 1000,
  })
}

// ── RG-11 Treasure Hunts ────────────────────────────────────────────────────
export function useTreasureHunts(params: { city?: string } = {}) {
  return useQuery({
    queryKey: rewardsKeys.hunts(params),
    queryFn: () => gamificationService.listHunts(params),
    staleTime: 60 * 1000,
  })
}

export function useTreasureHunt(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: rewardsKeys.hunt(idOrSlug ?? ''),
    queryFn: () => gamificationService.getHunt(idOrSlug as string),
    enabled: !!idOrSlug,
    staleTime: 15 * 1000,
  })
}

export function useFindStop(idOrSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (attempt: { code?: string; lat?: number; lng?: number }) =>
      gamificationService.findStop(idOrSlug, attempt),
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: rewardsKeys.hunt(idOrSlug) })
      qc.invalidateQueries({ queryKey: rewardsKeys.progress() })
      if (result.already_found) toast.info(`You already found "${result.stop}".`)
      else if (result.hunt_completed) toast.success(`🏆 Hunt complete! +${result.xp_awarded} XP`)
      else toast.success(`✅ Found "${result.stop}"! +${result.xp_awarded} XP`)
    },
    onError: (e: Error) => toast.error(e.message || 'No stop matched.'),
  })
}

// ── RG-19 Miracle Mode ──────────────────────────────────────────────────────
export function useMiracleCampaigns(limit = 20) {
  return useQuery({
    queryKey: rewardsKeys.miracle(limit),
    queryFn: () => gamificationService.getMiracleCampaigns(limit),
    staleTime: 30 * 1000,
  })
}

export function useActivateMiracleMode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campaignId, reason, duration_hours }: { campaignId: string; reason?: string; duration_hours?: number }) =>
      gamificationService.activateMiracleMode(campaignId, { reason, duration_hours }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardsKeys.all })
      toast.success('✨ Miracle Mode activated!')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not activate Miracle Mode.'),
  })
}

export function useDeactivateMiracleMode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (campaignId: string) => gamificationService.deactivateMiracleMode(campaignId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: rewardsKeys.all })
      toast.info('Miracle Mode deactivated.')
    },
    onError: (e: Error) => toast.error(e.message || 'Could not deactivate.'),
  })
}
