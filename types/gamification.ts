/**
 * Rewards & Gamification types (RG-02..RG-21).
 *
 * Mirrors the backend gamification subsystem exposed at `/api/gamification`
 * (controllers/GamificationController.js). Reuses the level/badge shapes already
 * declared for the profile.
 */

import type { LevelProgress, GamificationBadge } from './profile'

export type { LevelProgress, GamificationBadge }

// ── RG-02/03 Progress ────────────────────────────────────────────────────
export interface GamificationProgress extends LevelProgress {
  badges: GamificationBadge[]
}

// ── RG-04 Streaks ────────────────────────────────────────────────────────
export interface StreakSnapshot {
  current: number
  longest: number
  last_active_date: string | null
  xp_awarded?: number
}

// ── RG-05 Leaderboards ───────────────────────────────────────────────────
export type LeaderboardCategory = 'xp' | 'donors' | 'sharers' | 'referrers' | 'volunteers'
export type LeaderboardPeriod = 'all_time' | 'monthly' | 'weekly' | 'daily'

export interface LeaderboardRow {
  rank: number
  id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  level: number
  value: number
}

export interface Leaderboard {
  category: LeaderboardCategory
  period: LeaderboardPeriod
  label: string
  entries: LeaderboardRow[]
}

export interface UserRank {
  rank: number
  value: number
}

// ── RG-09 Viral Multiplier ───────────────────────────────────────────────
export interface ViralStatus {
  tier: string
  multiplier: number
  conversions_7d: number
  icon?: string
  updated_at?: string | null
}

// ── RG-10 Golden Tickets ─────────────────────────────────────────────────
export type GoldenPrizeType = 'xp' | 'multiplier' | 'badge' | 'credit'

export interface GoldenTicket {
  _id: string
  prize_code: string
  prize_label: string
  prize_type: GoldenPrizeType
  prize_value: number | string
  duration_hours: number | null
  source_action: string | null
  redeemed: boolean
  created_at: string
}

// ── RG-14 Hope Meter ─────────────────────────────────────────────────────
export interface HopeDimensions {
  donated: number
  shares: number
  prayers: number
  volunteer_hours: number
  referrals: number
}

export interface HopeMeter {
  user_id: string
  hope_score: number
  dimensions: HopeDimensions
  weights: Record<string, number>
}

// ── RG-06 Prayer Power Meter ─────────────────────────────────────────────
export type PrayerPowerLevel = 'kindled' | 'growing' | 'strong' | 'blazing' | 'supernova'

export interface PrayerPowerMeter {
  campaign_id: string
  prayer_count: number
  unique_supporters: number
  goal: number
  percent: number
  power_level: PrayerPowerLevel
}

export interface CampaignHopeMeter {
  campaign_id: string
  dimensions: { prayers: number; shares: number }
  prayer_meter: PrayerPowerMeter | null
}

// ── RG-12 / RG-15 Journey & celebrations ─────────────────────────────────
export type GamificationEventType =
  | 'xp_award'
  | 'level_up'
  | 'badge_earned'
  | 'streak_milestone'
  | 'golden_ticket'
  | 'mission_complete'
  | 'treasure_find'
  | 'conversion'

export interface JourneyEvent {
  type: GamificationEventType
  action: string | null
  xp: number
  meta: Record<string, unknown>
  at: string
}

export interface CelebrationEvent {
  _id: string
  type: GamificationEventType
  action: string | null
  xp_awarded: number
  meta: Record<string, unknown>
  created_at: string
}

// ── RG-17 Swipe-to-Help feed ─────────────────────────────────────────────
export interface SwipeCard {
  id: string
  title: string
  summary: string
  image_url: string | null
  video: { embed_url?: string; url?: string; thumbnail_url?: string } | null
  city: string | null
  need_type: string | null
  miracle_mode: boolean
  prayers: number
  shares: number
}

// ── RG-18 Missions ───────────────────────────────────────────────────────
export type MissionCadence = 'daily' | 'weekly' | 'once'

export interface UserMissionView {
  code: string
  title: string
  description: string
  icon: string
  metric: string
  cadence: MissionCadence
  target: number
  reward_xp: number
  progress: number
  completed: boolean
  period_key: string
}

// ── RG-07 Teams ──────────────────────────────────────────────────────────
export interface TeamMember {
  user_id: string
  role: 'captain' | 'member'
  contribution: number
}

export interface CampaignTeam {
  _id: string
  name: string
  slug: string
  description?: string
  avatar_url: string | null
  captain_id: string
  challenge_id: string | null
  campaign_id?: string | null
  city: string | null
  members?: TeamMember[]
  member_count: number
  score: number
  is_open?: boolean
}

export interface CreateTeamPayload {
  name: string
  description?: string
  city?: string
  challenge_id?: string
  campaign_id?: string
  is_open?: boolean
}

// ── RG-07/08/20/21 Community Challenges ──────────────────────────────────
export type ChallengeType = 'team' | 'city_vs_city' | 'crowd_storm' | 'one_heart_one_city'
export type ChallengeMetric = 'amount' | 'shares' | 'prayers' | 'participants' | 'volunteer_hours'
export type ChallengeStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'

export interface ChallengeEntrant {
  rank?: number
  kind: 'team' | 'city' | 'platform'
  ref_id: string | null
  label: string
  score: number
  participant_count: number
}

export interface CommunityChallenge {
  _id: string
  title: string
  slug: string
  description?: string
  type: ChallengeType
  metric: ChallengeMetric
  banner_url?: string | null
  status: ChallengeStatus
  starts_at: string
  ends_at: string
  total_score: number
  total_participants?: number
  goal: number | null
  reward_xp?: number
  reward_badge?: string | null
  entrants?: ChallengeEntrant[]
}

export interface ChallengeScoreboard {
  id: string
  title: string
  type: ChallengeType
  metric: ChallengeMetric
  status: ChallengeStatus
  total_score: number
  goal: number | null
  ends_at: string
  entrants: ChallengeEntrant[]
}

// ── RG-11 Treasure Hunts ─────────────────────────────────────────────────
export interface TreasureStopView {
  name: string
  hint: string
  reward_xp: number
  has_gps: boolean
  found: boolean
}

export interface TreasureHuntView {
  id: string
  title: string
  slug: string
  description: string
  city: string | null
  total_stops: number
  found_count: number
  completed: boolean
  completion_reward_xp: number
  stops: TreasureStopView[]
}

export interface TreasureHuntSummary {
  _id: string
  title: string
  slug: string
  description: string
  city: string | null
  completion_reward_xp: number
  starts_at: string | null
  ends_at: string | null
}

export interface FindStopResult {
  already_found: boolean
  stop: string
  method?: 'gps' | 'qr'
  xp_awarded: number
  found_count?: number
  total_stops?: number
  hunt_completed: boolean
}

// ── RG-19 Miracle Mode ───────────────────────────────────────────────────
export interface MiracleCampaign {
  _id: string
  title: string
  summary?: string
  image_url: string | null
  miracle_mode: {
    active: boolean
    reason: string | null
    activated_at: string | null
    expires_at: string | null
  }
  location?: { city?: string }
}
