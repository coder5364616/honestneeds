/**
 * Profile System Types
 *
 * Mirror the HonestNeed backend profile/verification/gamification responses
 * exactly (see backend ProfileService, VerificationService, GamificationService).
 * All money values are in CENTS unless suffixed otherwise.
 */

// ── Shared API envelope ────────────────────────────────────────────────
export interface ApiEnvelope<T> {
  success: boolean
  message?: string
  data: T
}

export interface Paginated<T> {
  items?: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore?: boolean
  }
}

// ── Verification badges (backend: user.verification_badges) ────────────
export interface VerificationBadges {
  email_verified: boolean
  phone_verified: boolean
  identity_verified: boolean
  community_verified: boolean
  nonprofit_verified: boolean
}

export type IdentityTier = 'basic' | 'premium' | null
export type IdentityStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

// ── Gamification (backend: getLevelProgress + badges) ──────────────────
export interface GamificationBadge {
  code: string
  name: string
  icon: string
  category: string
  earned_at: string
}

export interface LevelProgress {
  current_level: number
  current_title: string
  next_level: number | null
  next_title: string | null
  xp: number
  xp_into_level: number
  xp_for_next: number | null
  xp_remaining: number | null
  percent_to_next: number
}

export interface GamificationState extends LevelProgress {
  badges: GamificationBadge[]
}

export interface LeaderboardEntry {
  rank: number
  id: string
  display_name: string
  username: string | null
  avatar_url: string | null
  xp: number
  level: number
}

// ── Completion meter ───────────────────────────────────────────────────
export interface CompletionChecklistItem {
  key: string
  done: boolean
  weight: number
}

export interface ProfileCompletion {
  percent: number
  setup_completed: boolean
  checklist: CompletionChecklistItem[]
}

// ── Profile strength (AI-style) ────────────────────────────────────────
export interface ProfileStrengthSuggestion {
  key: string
  label: string
  impact: number
}

export interface ProfileStrength {
  score: number
  level: 'excellent' | 'strong' | 'developing' | 'incomplete'
  suggestions: ProfileStrengthSuggestion[]
}

// ── Stats ──────────────────────────────────────────────────────────────
export interface SupporterStats {
  campaigns_supported: number
  total_donated_cents: number
  volunteer_hours: number
  shares_completed: number
  rewards_earned_cents: number
  referrals: number
  community_impact_score: number
}

export interface CreatorStats {
  campaigns_created: number
  campaigns_completed: number
  funds_raised_cents: number
  supporters_reached: number
  success_rate: number
  response_rate: number
  community_rating: number
  rating_count: number
  verification_level: string
  profile_completion: number
}

export interface CreatorProfile {
  personal_story: string
  why_joined: string
  areas_of_need: string[]
  response_rate: number
  community_rating: number
  rating_count: number
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private'
  show_activity_feed: boolean
  show_stats: boolean
  show_donations: boolean
  show_location: boolean
}

export interface ProfileLocation {
  city?: string
  state?: string
  country?: string
  address?: string
  latitude?: number
  longitude?: number
}

// ── Full dashboard (backend: ProfileService.getDashboard) ──────────────
export interface ProfileDashboard {
  identity: {
    id: string
    email: string
    username: string | null
    display_name: string
    full_name: string
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
    bio: string
    phone: string | null
    location: ProfileLocation | null
    role: 'user' | 'creator' | 'admin'
    interests: string[]
    created_at: string
  }
  completion: ProfileCompletion
  verification: {
    badges: VerificationBadges
    identity_tier: IdentityTier
    identity_status: IdentityStatus
    trust_score: number
  }
  gamification: GamificationState
  supporter_stats: SupporterStats
  creator_stats: CreatorStats
  creator_profile: CreatorProfile
  privacy: PrivacySettings
}

// ── Public profile (backend: ProfileService.getPublicProfile) ──────────
export interface PublicProfile {
  id: string
  username: string | null
  display_name: string
  full_name?: string
  avatar_url: string | null
  bio?: string
  role?: string
  is_private?: boolean
  verification_badges: VerificationBadges
  identity_tier?: IdentityTier
  trust_score?: number
  gamification?: GamificationState & { level: number }
  creator_profile?: { personal_story: string; areas_of_need: string[] }
  location?: { city?: string; state?: string; country?: string }
  supporter_stats?: SupporterStats
  creator_stats?: CreatorStats
  created_at?: string
}

// ── Profile update payload (backend: PATCH /users/me/profile) ──────────
export interface ProfileUpdatePayload {
  first_name?: string
  last_name?: string
  username?: string
  bio?: string
  location?: ProfileLocation
  interests?: string[]
  creator_profile?: Partial<Pick<CreatorProfile, 'personal_story' | 'why_joined' | 'areas_of_need'>>
  privacy?: Partial<PrivacySettings>
}

export interface UsernameCheckResult {
  username: string
  valid: boolean
  available: boolean
  reason?: string
}

// ── Verification ───────────────────────────────────────────────────────
export type DocumentType = 'drivers_license' | 'state_id' | 'passport'
export type ReviewDecision = 'approve' | 'reject' | 'needs_more_info'

export interface IdentityAssetRef {
  url: string
  public_id?: string | null
}

export interface IdentitySubmission {
  _id: string
  user_id: string | { _id: string; display_name: string; username?: string; email?: string; avatar_url?: string }
  tier: 'basic' | 'premium'
  document_type: DocumentType
  status: 'pending' | 'approved' | 'rejected' | 'needs_more_info'
  automated_checks?: {
    face_match_score: number | null
    liveness_passed: boolean | null
    duplicate_suspected: boolean
  }
  review_notes?: string | null
  rejection_reason?: string | null
  submitted_at: string
  reviewed_at?: string | null
}

export interface VerificationStatus {
  badges: VerificationBadges
  identity_tier: IdentityTier
  identity_status: IdentityStatus
  trust_score: number
  phone_on_file: boolean
  latest_submission: IdentitySubmission | null
}

export interface PhoneSendResult {
  sent: boolean
  expires_in_seconds: number
  debug_code?: string
}

export interface IdentitySubmitPayload {
  tier?: 'basic' | 'premium'
  document_type: DocumentType
  front: IdentityAssetRef
  back?: IdentityAssetRef
  selfie: IdentityAssetRef
}
