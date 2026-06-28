import { apiClient } from '@/lib/api'
import type { ApiEnvelope } from '@/types/profile'
import type {
  GamificationProgress,
  StreakSnapshot,
  Leaderboard,
  LeaderboardCategory,
  LeaderboardPeriod,
  UserRank,
  ViralStatus,
  GoldenTicket,
  HopeMeter,
  CampaignHopeMeter,
  PrayerPowerMeter,
  JourneyEvent,
  CelebrationEvent,
  SwipeCard,
  UserMissionView,
  CampaignTeam,
  CreateTeamPayload,
  CommunityChallenge,
  ChallengeScoreboard,
  TreasureHuntSummary,
  TreasureHuntView,
  FindStopResult,
  MiracleCampaign,
} from '@/types/gamification'

/**
 * Rewards & Gamification service (RG-02..RG-21) — wraps `/api/gamification`
 * (gamificationRoutes.js). apiClient.baseURL already includes `/api`, so paths
 * here omit it. Every endpoint returns the `{ success, message, data }`
 * envelope; helpers unwrap `.data.data`.
 */
export const gamificationService = {
  // ── Profile / XP / Badges (RG-02, RG-03) ────────────────────────────
  async getMyProgress(): Promise<GamificationProgress> {
    const res = await apiClient.get<ApiEnvelope<GamificationProgress>>('/gamification/me')
    return res.data.data
  },

  async getUserProgress(userId: string): Promise<GamificationProgress> {
    const res = await apiClient.get<ApiEnvelope<GamificationProgress>>(`/gamification/users/${userId}/progress`)
    return res.data.data
  },

  // ── RG-04 Streaks ───────────────────────────────────────────────────
  async checkInStreak(): Promise<StreakSnapshot> {
    const res = await apiClient.post<ApiEnvelope<StreakSnapshot>>('/gamification/streak/check-in', {})
    return res.data.data
  },

  // ── RG-05 Leaderboards ──────────────────────────────────────────────
  async getLeaderboard(
    category: LeaderboardCategory = 'xp',
    params: { period?: LeaderboardPeriod; limit?: number } = {}
  ): Promise<Leaderboard> {
    const res = await apiClient.get<ApiEnvelope<Leaderboard>>(`/gamification/leaderboard/${category}`, { params })
    return res.data.data
  },

  async getMyRank(category: LeaderboardCategory = 'xp'): Promise<UserRank | null> {
    const res = await apiClient.get<ApiEnvelope<UserRank | null>>('/gamification/leaderboard/me', {
      params: { category },
    })
    return res.data.data
  },

  // ── RG-09 Viral ─────────────────────────────────────────────────────
  async getMyViralStatus(): Promise<ViralStatus> {
    const res = await apiClient.get<ApiEnvelope<ViralStatus>>('/gamification/viral/me')
    return res.data.data
  },

  // ── RG-10 Golden Tickets ────────────────────────────────────────────
  async getMyGoldenTickets(): Promise<GoldenTicket[]> {
    const res = await apiClient.get<ApiEnvelope<GoldenTicket[]>>('/gamification/golden-tickets/me')
    return res.data.data
  },

  // ── RG-14 / RG-06 Meters ────────────────────────────────────────────
  async getMyHopeMeter(): Promise<HopeMeter> {
    const res = await apiClient.get<ApiEnvelope<HopeMeter>>('/gamification/hope-meter/me')
    return res.data.data
  },

  async getCampaignHopeMeter(campaignId: string): Promise<CampaignHopeMeter> {
    const res = await apiClient.get<ApiEnvelope<CampaignHopeMeter>>(`/gamification/hope-meter/campaign/${campaignId}`)
    return res.data.data
  },

  async getPrayerPowerMeter(campaignId: string): Promise<PrayerPowerMeter> {
    const res = await apiClient.get<ApiEnvelope<PrayerPowerMeter>>(`/gamification/prayer-meter/campaign/${campaignId}`)
    return res.data.data
  },

  // ── RG-15 Journey / RG-12 Celebrations ──────────────────────────────
  async getMyJourney(limit = 50): Promise<JourneyEvent[]> {
    const res = await apiClient.get<ApiEnvelope<JourneyEvent[]>>('/gamification/journey/me', { params: { limit } })
    return res.data.data
  },

  async getMyCelebrations(limit = 20): Promise<CelebrationEvent[]> {
    const res = await apiClient.get<ApiEnvelope<CelebrationEvent[]>>('/gamification/celebrations/me', {
      params: { limit },
    })
    return res.data.data
  },

  // ── RG-17 Swipe feed ────────────────────────────────────────────────
  async getSwipeFeed(params: { limit?: number; city?: string } = {}): Promise<SwipeCard[]> {
    const res = await apiClient.get<ApiEnvelope<SwipeCard[]>>('/gamification/swipe-feed', { params })
    return res.data.data
  },

  // ── RG-18 Missions ──────────────────────────────────────────────────
  async getMyMissions(): Promise<UserMissionView[]> {
    const res = await apiClient.get<ApiEnvelope<UserMissionView[]>>('/gamification/missions/me')
    return res.data.data
  },

  // ── RG-07 Teams ─────────────────────────────────────────────────────
  async listTeams(params: { challenge_id?: string; campaign_id?: string; city?: string; limit?: number } = {}): Promise<CampaignTeam[]> {
    const res = await apiClient.get<ApiEnvelope<CampaignTeam[]>>('/gamification/teams', { params })
    return res.data.data
  },
  async getTeam(idOrSlug: string): Promise<CampaignTeam> {
    const res = await apiClient.get<ApiEnvelope<CampaignTeam>>(`/gamification/teams/${idOrSlug}`)
    return res.data.data
  },
  async createTeam(payload: CreateTeamPayload): Promise<CampaignTeam> {
    const res = await apiClient.post<ApiEnvelope<CampaignTeam>>('/gamification/teams', payload)
    return res.data.data
  },
  async joinTeam(id: string): Promise<CampaignTeam> {
    const res = await apiClient.post<ApiEnvelope<CampaignTeam>>(`/gamification/teams/${id}/join`, {})
    return res.data.data
  },
  async leaveTeam(id: string): Promise<CampaignTeam> {
    const res = await apiClient.post<ApiEnvelope<CampaignTeam>>(`/gamification/teams/${id}/leave`, {})
    return res.data.data
  },

  // ── RG-08/20/21 Community Challenges ────────────────────────────────
  async listChallenges(params: { status?: string; type?: string } = {}): Promise<CommunityChallenge[]> {
    const res = await apiClient.get<ApiEnvelope<CommunityChallenge[]>>('/gamification/challenges', { params })
    return res.data.data
  },
  async getChallenge(idOrSlug: string): Promise<ChallengeScoreboard> {
    const res = await apiClient.get<ApiEnvelope<ChallengeScoreboard>>(`/gamification/challenges/${idOrSlug}`)
    return res.data.data
  },

  // ── RG-11 Treasure Hunts ────────────────────────────────────────────
  async listHunts(params: { city?: string } = {}): Promise<TreasureHuntSummary[]> {
    const res = await apiClient.get<ApiEnvelope<TreasureHuntSummary[]>>('/gamification/treasure-hunts', { params })
    return res.data.data
  },
  async getHunt(idOrSlug: string): Promise<TreasureHuntView> {
    const res = await apiClient.get<ApiEnvelope<TreasureHuntView>>(`/gamification/treasure-hunts/${idOrSlug}`)
    return res.data.data
  },
  async findStop(idOrSlug: string, attempt: { code?: string; lat?: number; lng?: number }): Promise<FindStopResult> {
    const res = await apiClient.post<ApiEnvelope<FindStopResult>>(`/gamification/treasure-hunts/${idOrSlug}/find`, attempt)
    return res.data.data
  },

  // ── RG-19 Miracle Mode ──────────────────────────────────────────────
  async getMiracleCampaigns(limit = 20): Promise<MiracleCampaign[]> {
    const res = await apiClient.get<ApiEnvelope<MiracleCampaign[]>>('/gamification/miracle-mode', { params: { limit } })
    return res.data.data
  },
  async activateMiracleMode(campaignId: string, payload: { reason?: string; duration_hours?: number }): Promise<MiracleCampaign['miracle_mode']> {
    const res = await apiClient.post<ApiEnvelope<MiracleCampaign['miracle_mode']>>(
      `/gamification/miracle-mode/${campaignId}/activate`,
      payload
    )
    return res.data.data
  },
  async deactivateMiracleMode(campaignId: string): Promise<MiracleCampaign['miracle_mode']> {
    const res = await apiClient.post<ApiEnvelope<MiracleCampaign['miracle_mode']>>(
      `/gamification/miracle-mode/${campaignId}/deactivate`,
      {}
    )
    return res.data.data
  },
}
