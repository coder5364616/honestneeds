/**
 * Volunteer Features Types (VO-01..VO-08)
 *
 * Mirror the HonestNeed backend exactly:
 *  - VolunteerProfile (xp / level / proof_of_kindness_count / hope_responder)
 *  - VolunteerHourLog (VO-03 logging, VO-06 proof of kindness)
 *  - VolunteerReferenceLetter (VO-07)
 *  - HopeResponderRequest (VO-08 "Need Now")
 *  - VolunteerProgramService / HopeResponderService
 *  - config/volunteerProgram.js (XP rates, levels, badges, categories)
 *
 * Endpoints:
 *  - /api/volunteers/*         (volunteerRoutes.js)
 *  - /api/hope-responders/*    (hopeResponderRoutes.js)
 */

import type { ApiEnvelope } from './profile'

export type { ApiEnvelope }

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ── VO-01: Volunteer profile ───────────────────────────────────────────

export const VOLUNTEERING_TYPES = ['community_support', 'fundraising_help', 'direct_assistance'] as const
export type VolunteeringType = (typeof VOLUNTEERING_TYPES)[number]

export interface VolunteerAvailability {
  days_per_week: number
  hours_per_week: number
  flexible_schedule: boolean
  preferred_times: string[]
}

export const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'expert'] as const
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]

export const ENGAGEMENT_OPEN_TO = ['volunteer_only', 'paid', 'both'] as const
export type EngagementOpenTo = (typeof ENGAGEMENT_OPEN_TO)[number]

export const RATE_PERIODS = ['hour', 'day', 'project', 'month'] as const
export type RatePeriod = (typeof RATE_PERIODS)[number]

export interface VolunteerLocation {
  city?: string
  region?: string
  country?: string
}

export interface VolunteerEngagement {
  open_to: EngagementOpenTo
  expected_rate?: number | null
  rate_currency?: string
  rate_period?: RatePeriod
}

export interface VolunteerWorkPreferences {
  remote: boolean
  onsite: boolean
  willing_to_travel: boolean
}

export interface VolunteerLinks {
  portfolio_url?: string
  linkedin_url?: string
  resume_url?: string
}

export interface VolunteerContact {
  email?: string
  phone?: string
  preferred_method?: 'inApp' | 'email' | 'phone'
}

export interface VolunteerCertification {
  name: string
  issuer?: string
  issue_date?: string
  expiry_date?: string
  credential_url?: string
}

export interface VolunteerProfile {
  _id: string
  user_id: string
  volunteering_type: VolunteeringType
  bio: string
  skills: string[]
  availability: VolunteerAvailability
  headline?: string
  location?: VolunteerLocation
  languages?: string[]
  experience_level?: ExperienceLevel
  years_experience?: number
  engagement?: VolunteerEngagement
  work_preferences?: VolunteerWorkPreferences
  links?: VolunteerLinks
  contact?: VolunteerContact
  certifications?: VolunteerCertification[]
  total_hours: number
  total_assignments: number
  xp: number
  level: number
  proof_of_kindness_count: number
  rating: number
  review_count: number
  badges: string[]
  status: 'active' | 'inactive' | 'suspended'
  joined_date: string
  user?: {
    display_name?: string
    profile_picture?: string
    email?: string
  }
}

export interface RegisterVolunteerPayload {
  volunteering_type: VolunteeringType
  bio?: string
  skills?: string[]
  availability?: Partial<VolunteerAvailability>
  headline?: string
  location?: VolunteerLocation
  languages?: string[]
  experience_level?: ExperienceLevel
  years_experience?: number
  engagement?: Partial<VolunteerEngagement>
  work_preferences?: Partial<VolunteerWorkPreferences>
  links?: VolunteerLinks
  contact?: VolunteerContact
  certifications?: VolunteerCertification[]
}

// ── Directory + hiring (employer-facing) ───────────────────────────────

export interface DirectoryVolunteer {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  headline: string
  bio: string
  volunteering_type: VolunteeringType
  experience_level?: ExperienceLevel
  years_experience?: number
  skills: string[]
  languages?: string[]
  location?: VolunteerLocation
  engagement?: VolunteerEngagement
  work_preferences?: VolunteerWorkPreferences
  availability?: VolunteerAvailability
  total_hours: number
  total_assignments?: number
  rating: number
  review_count: number
  badges: string[]
  joined_date: string
}

export interface DirectoryListResponse {
  volunteers: DirectoryVolunteer[]
  total: number
  skip: number
  limit: number
}

export interface DirectoryFilters {
  search?: string
  type?: VolunteeringType
  skills?: string
  experience_level?: ExperienceLevel
  open_to?: EngagementOpenTo
  city?: string
  minRating?: number
  sortBy?: 'rating' | 'hours' | 'recent'
  skip?: number
  limit?: number
}

export interface RequestAssignmentPayload {
  campaign_id: string
  title: string
  description: string
  required_skills?: string[]
  estimated_hours: number
  start_date: string
  deadline: string
}

export interface AssignmentResult {
  id: string
  volunteer_id: string
  campaign_id: string
  title: string
  status: string
  estimated_hours: number
  start_date: string
  deadline: string
}

// ── Volunteer-side assignment inbox ────────────────────────────────────

export type AssignmentStatus =
  | 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'rejected'

export interface AssignmentRef {
  _id: string
  title?: string
  image_url?: string
}

export interface AssignmentRequester {
  _id: string
  display_name?: string
  username?: string
  profile_picture?: string
  avatar_url?: string
}

export interface AssignmentInboxItem {
  _id: string
  volunteer_id: string
  campaign_id: string | AssignmentRef | null
  creator_id: string | AssignmentRequester | null
  title: string
  description: string
  required_skills: string[]
  estimated_hours: number
  start_date: string
  deadline: string
  status: AssignmentStatus
  actual_hours?: number
  completion_notes?: string
  rejection_reason?: string
  review?: { rating?: number; comment?: string; reviewed_at?: string }
  created_at: string
}

export interface MyAssignmentsResponse {
  volunteer_id: string | null
  assignments: AssignmentInboxItem[]
}

// ── Employer-side "sent assignments" + review ──────────────────────────

export interface SentAssignmentVolunteer {
  _id: string
  headline?: string
  rating?: number
  user_id?: {
    _id?: string
    display_name?: string
    username?: string
    profile_picture?: string
    avatar_url?: string
  }
}

export interface SentAssignment {
  _id: string
  campaign_id: string | AssignmentRef | null
  volunteer_id: string | SentAssignmentVolunteer
  title: string
  description: string
  required_skills: string[]
  estimated_hours: number
  start_date: string
  deadline: string
  status: AssignmentStatus
  actual_hours?: number
  completion_notes?: string
  rejection_reason?: string
  review?: { rating?: number; comment?: string; reviewed_at?: string }
  created_at: string
}

export interface SentAssignmentsResponse {
  assignments: SentAssignment[]
}

// ── VO-04: XP / level / badges ─────────────────────────────────────────

export interface BadgeDef {
  code: string
  name?: string
  icon?: string
  criteria?: string
}

export interface VolunteerProgress {
  current_level: number
  current_title: string
  next_level: number | null
  next_title: string | null
  xp: number
  xp_into_level: number
  xp_for_next: number | null
  xp_remaining: number | null
  percent_to_next: number
  total_hours: number
  total_assignments: number
  proof_of_kindness_count: number
  rating: number
  badges: BadgeDef[]
}

// ── VO-03 / VO-06: Hour logging + proof of kindness ────────────────────

export type HourLogStatus = 'pending' | 'verified' | 'rejected' | 'cancelled'
export type HourLogSource = 'campaign' | 'opportunity' | 'assignment' | 'independent'

export interface ProofAttachment {
  url: string
  type?: 'image' | 'video' | 'document' | 'link'
  caption?: string
}

export interface VolunteerHourLog {
  _id: string
  volunteer_id: string | { _id: string; display_name?: string; username?: string; avatar_url?: string; email?: string }
  source: HourLogSource
  campaign_id?: string | { _id: string; title?: string } | null
  opportunity_id?: string | { _id: string; title?: string } | null
  hours: number
  activity_date: string
  description: string
  proof_attachments: ProofAttachment[]
  proof_of_kindness: boolean
  status: HourLogStatus
  verified_at?: string | null
  verifier_role?: 'creator' | 'business' | 'admin' | null
  decision_note?: string | null
  created_at: string
}

export interface LogHoursPayload {
  hours: number
  activity_date: string
  description?: string
  campaign_id?: string
  opportunity_id?: string
  proof_attachments?: ProofAttachment[]
}

export interface VerifyHourLogPayload {
  decision: 'verify' | 'reject'
  proof_of_kindness?: boolean
  note?: string
}

export interface HourLogListResponse {
  logs: VolunteerHourLog[]
  pagination: Pagination
}

// ── VO-05: Leaderboard ─────────────────────────────────────────────────

export type LeaderboardMetric = 'hours' | 'xp'

export interface LeaderboardEntry {
  rank: number
  volunteer_id: string
  user_id: string
  display_name: string | null
  username: string | null
  avatar_url: string | null
  city: string | null
  total_hours: number
  xp: number
  level: number
  rating: number
  proof_of_kindness_count: number
  badges: string[]
}

// ── VO-07: Reference letters ───────────────────────────────────────────

export type ReferenceStatus = 'requested' | 'issued' | 'declined'

export interface ReferenceSnapshot {
  total_hours: number
  total_assignments: number
  rating: number
  proof_of_kindness_count: number
}

export interface VolunteerReferenceLetter {
  _id: string
  volunteer_id: string | { _id: string; display_name?: string; username?: string; avatar_url?: string }
  referrer_id: string | { _id: string; display_name?: string; username?: string; avatar_url?: string }
  referrer_role: 'creator' | 'business' | 'admin'
  referrer_name: string
  referrer_title: string
  request_message: string
  body: string
  relationship: string
  status: ReferenceStatus
  decline_reason?: string | null
  snapshot: ReferenceSnapshot
  is_public: boolean
  public_token?: string | null
  issued_at?: string | null
  created_at: string
}

export interface RequestReferencePayload {
  referrer_id: string
  campaign_id?: string
  business_id?: string
  message?: string
}

export interface IssueReferencePayload {
  letter_id?: string
  volunteer_id?: string
  body: string
  relationship?: string
  referrer_title?: string
  campaign_id?: string
  business_id?: string
}

export interface PublicReference {
  id: string
  referrer_name: string
  referrer_title: string
  referrer_role: string
  relationship: string
  body: string
  snapshot: ReferenceSnapshot
  issued_at: string | null
  volunteer?: { display_name?: string; username?: string; avatar_url?: string }
}

export interface ReferenceListResponse {
  letters: VolunteerReferenceLetter[]
  pagination: Pagination
}

// ── VO-08: Hope Responder Program ("Need Now") ─────────────────────────

export const HOPE_RESPONDER_CATEGORIES = [
  'food',
  'shelter',
  'medical',
  'transport',
  'supplies',
  'wellness_check',
  'other',
] as const
export type HopeResponderCategory = (typeof HOPE_RESPONDER_CATEGORIES)[number]

export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'] as const
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number]

export interface HopeResponderEnrollment {
  enrolled: boolean
  status: 'inactive' | 'pending' | 'active' | 'suspended'
  verified: boolean
  enrolled_at: string | null
  radius_km: number
  categories: HopeResponderCategory[]
  location?: { type: 'Point'; coordinates: [number, number] }
  responses_count: number
  resolved_count: number
}

export interface EnrollResponderPayload {
  latitude: number
  longitude: number
  radius_km?: number
  categories?: HopeResponderCategory[]
}

export type RequestStatus = 'open' | 'matched' | 'resolved' | 'expired' | 'cancelled'
export type ResponderEntryStatus = 'accepted' | 'on_the_way' | 'arrived' | 'completed' | 'withdrawn'

export interface ResponderEntry {
  volunteer_id: string | { _id: string; display_name?: string; username?: string; avatar_url?: string }
  status: ResponderEntryStatus
  accepted_at: string
  completed_at?: string | null
}

export interface HopeResponderRequest {
  _id: string
  requester_id: string
  campaign_id?: string | null
  title: string
  description: string
  category: HopeResponderCategory
  urgency: UrgencyLevel
  location: { type: 'Point'; coordinates: [number, number] }
  address_text: string
  city: string
  responders_needed: number
  responders: ResponderEntry[]
  status: RequestStatus
  contact_phone: string
  contact_method: 'phone' | 'inApp' | 'email'
  expires_at?: string | null
  resolved_at?: string | null
  notified_count: number
  created_at: string
  /** The viewer's own responder status on this request (browse only, when authed). */
  my_status?: ResponderEntryStatus | null
}

export interface CreateRequestPayload {
  title: string
  description: string
  category: HopeResponderCategory
  urgency?: UrgencyLevel
  latitude: number
  longitude: number
  address_text?: string
  city?: string
  responders_needed?: number
  contact_phone?: string
  contact_method?: 'phone' | 'inApp' | 'email'
  expires_in_hours?: number
  campaign_id?: string
}

export interface RequestListResponse {
  requests: HopeResponderRequest[]
  pagination: Pagination
}
