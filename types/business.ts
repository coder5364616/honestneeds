/**
 * Business Features Types (BU-01..BU-07)
 *
 * Mirror the HonestNeed backend exactly:
 *  - BusinessProfile / BusinessVerification models
 *  - VolunteerOpportunity / VolunteerApplication models
 *  - BusinessGiveaway / GiveawayClaim models
 *  - BusinessProfileService / VolunteerOpportunityService / BusinessGiveawayService
 *
 * All money values are in CENTS unless suffixed otherwise (matches backend
 * normalisation in BusinessProfileService).
 */

import type { ApiEnvelope } from './profile'

export type { ApiEnvelope }

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ── BU-01 / BU-02 / BU-05: Business Profile ────────────────────────────

export const BUSINESS_INDUSTRIES = [
  'retail',
  'food_beverage',
  'technology',
  'healthcare',
  'finance',
  'real_estate',
  'manufacturing',
  'professional_services',
  'education',
  'nonprofit',
  'hospitality',
  'construction',
  'transportation',
  'media',
  'other',
] as const
export type BusinessIndustry = (typeof BUSINESS_INDUSTRIES)[number]

export type VerificationStatusValue = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface BusinessSocialLinks {
  facebook?: string
  instagram?: string
  linkedin?: string
  twitter?: string
}

export interface BusinessLocation {
  city?: string
  state?: string
  country?: string
}

export interface BusinessProfileStats {
  total_sponsored_cents: number
  sponsorships_count: number
  opportunities_posted: number
  giveaways_count: number
}

/** Public-facing profile (BusinessProfile.getPublicProfile()). */
export interface BusinessProfile {
  id: string
  user_id?: string
  business_name: string
  slug: string
  tagline: string
  description: string
  industry: BusinessIndustry
  logo_url: string
  banner_url: string
  website_url: string
  social_links: BusinessSocialLinks
  location: BusinessLocation
  mission_statement: string
  is_verified: boolean
  verification_status: VerificationStatusValue
  stats: BusinessProfileStats
  created_at: string
}

/** Owner view adds private-ish fields + latest verification. */
export interface OwnBusinessProfile extends BusinessProfile {
  contact_email: string
  contact_phone: string
  status: 'active' | 'hidden' | 'suspended'
  verification: BusinessVerificationSubmission | null
}

export interface BusinessProfileCreatePayload {
  business_name: string
  tagline?: string
  description?: string
  industry?: BusinessIndustry
  logo_url?: string
  logo_public_id?: string
  banner_url?: string
  banner_public_id?: string
  website_url?: string
  contact_email?: string
  contact_phone?: string
  social_links?: BusinessSocialLinks
  location?: BusinessLocation
  mission_statement?: string
}

export type BusinessProfileUpdatePayload = Partial<BusinessProfileCreatePayload> & {
  status?: 'active' | 'hidden'
}

export interface DirectoryParams {
  q?: string
  industry?: BusinessIndustry
  city?: string
  state?: string
  country?: string
  verified?: boolean
  page?: number
  limit?: number
}

export interface DirectoryResponse {
  businesses: BusinessProfile[]
  pagination: Pagination
}

export interface AssetRef {
  url: string
  public_id: string
}

// ── BU-03: Analytics ───────────────────────────────────────────────────

export interface BusinessAnalytics {
  business: { id: string; business_name: string; is_verified: boolean }
  sponsorship: { count: number; gross_cents: number; net_cents: number }
  volunteer: {
    opportunities_posted: number
    opportunities_by_status: Record<string, number>
    applications_total: number
    applications_by_status: Record<string, number>
    total_hours_logged: number
  }
  giveaways: { count: number; total_entries: number; total_value_cents: number }
  profile_views: number
}

// ── BU-04: CSR Report ──────────────────────────────────────────────────

export interface CsrReport {
  business: {
    id: string
    business_name: string
    is_verified: boolean
    mission_statement: string
  }
  period: { from: string; to: string }
  generated_at: string
  summary: {
    total_contribution_cents: number
    total_contribution_formatted: string
    campaigns_sponsored: number
    sponsorship_cents: number
    giveaways_donated: number
    giveaway_value_cents: number
    giveaway_entrants_reached: number
    volunteers_engaged: number
    volunteer_hours_enabled: number
  }
}

// ── BU-05: Verification ────────────────────────────────────────────────

export const BUSINESS_DOCUMENT_TYPES = [
  'business_registration',
  'tax_certificate',
  'proof_of_address',
  'incorporation_certificate',
  'other',
] as const
export type BusinessDocumentType = (typeof BUSINESS_DOCUMENT_TYPES)[number]

export interface BusinessVerificationDocInput {
  document_type: BusinessDocumentType
  url: string
  public_id?: string
}

export interface BusinessVerificationPayload {
  legal_business_name: string
  registration_number?: string
  tax_id?: string
  documents: BusinessVerificationDocInput[]
}

export interface BusinessVerificationSubmission {
  _id: string
  business_id: string
  user_id: string
  legal_business_name: string
  registration_number: string | null
  tax_id: string | null
  documents: { document_type: BusinessDocumentType }[]
  status: 'pending' | 'approved' | 'rejected' | 'needs_more_info'
  review_notes: string | null
  rejection_reason: string | null
  submitted_at: string
  reviewed_at: string | null
}

export type ReviewDecision = 'approve' | 'reject' | 'needs_more_info'

/** Admin review-queue shape: business + applicant are populated and the
 *  document objects keep their (private) URLs so reviewers can open them. */
export interface AdminBusinessVerification {
  _id: string
  business_id: { _id: string; business_name: string; slug: string; industry: BusinessIndustry } | string
  user_id: { _id: string; display_name?: string; username?: string; email?: string } | string
  legal_business_name: string
  registration_number: string | null
  tax_id: string | null
  documents: { document_type: BusinessDocumentType; url?: string; public_id?: string | null }[]
  status: 'pending' | 'approved' | 'rejected' | 'needs_more_info'
  review_notes: string | null
  rejection_reason: string | null
  submitted_at: string
  reviewed_at: string | null
}

// ── BU-06: Volunteer Opportunities ─────────────────────────────────────

export const OPPORTUNITY_CATEGORIES = [
  'community_support',
  'fundraising',
  'event_staffing',
  'skilled_professional',
  'mentorship',
  'logistics',
  'administrative',
  'other',
] as const
export type OpportunityCategory = (typeof OPPORTUNITY_CATEGORIES)[number]

export interface OpportunityTimeCommitment {
  hours_per_week?: number
  duration_weeks?: number
  schedule_notes?: string
}

export interface VolunteerOpportunity {
  id: string
  business_id: string
  title: string
  description: string
  category: OpportunityCategory
  skills_required: string[]
  is_remote: boolean
  location: BusinessLocation & { address?: string }
  time_commitment: OpportunityTimeCommitment
  slots_available: number
  slots_filled: number
  start_date: string | null
  end_date: string | null
  status: 'open' | 'closed' | 'expired'
  applications_count: number
  created_at: string
  business?: Pick<BusinessProfile, 'business_name' | 'slug' | 'logo_url' | 'is_verified'> & { _id?: string }
}

export interface OpportunityCreatePayload {
  title: string
  description: string
  category: OpportunityCategory
  skills_required?: string[]
  is_remote?: boolean
  location?: BusinessLocation & { address?: string }
  time_commitment?: OpportunityTimeCommitment
  slots_available?: number
  start_date?: string | null
  end_date?: string | null
}

export interface OpportunityListResponse {
  opportunities: VolunteerOpportunity[]
  pagination: Pagination
}

/** One answer to a category-specific application question (self-describing). */
export interface ApplicationAnswer {
  key: string
  label: string
  value: string | string[] | number | boolean | null
}

export interface VolunteerApplication {
  _id: string
  opportunity_id:
    | string
    | { _id: string; title: string; category: string; status: string; slots_available?: number; slots_filled?: number }
  business_id: string | { _id: string; business_name: string; slug: string; logo_url: string }
  volunteer_id: string | { _id: string; display_name?: string; username?: string; email?: string; avatar_url?: string }
  message: string
  relevant_skills: string[]
  contact_email: string
  contact_phone: string
  application_answers: ApplicationAnswer[]
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'completed'
  decision_note: string | null
  hours_logged: number
  completed_at: string | null
  created_at: string
}

export interface ApplicationPayload {
  message?: string
  relevant_skills?: string[]
  contact_email?: string
  contact_phone?: string
  application_answers?: ApplicationAnswer[]
}

export interface ApplicationListResponse {
  applications: VolunteerApplication[]
  pagination: Pagination
}

// ── BU-07: Giveaways ───────────────────────────────────────────────────

export const GIVEAWAY_TYPES = ['product', 'service', 'voucher', 'experience'] as const
export type GiveawayType = (typeof GIVEAWAY_TYPES)[number]

export type GiveawayStatus = 'draft' | 'active' | 'drawing_complete' | 'fulfilled' | 'cancelled'

export interface BusinessGiveaway {
  id: string
  business_id: string
  title: string
  description: string
  giveaway_type: GiveawayType
  estimated_value_cents: number
  image_url: string
  winners_count: number
  entry_requirement: 'none' | 'donor' | 'verified_user'
  starts_at: string
  ends_at: string
  status: GiveawayStatus
  entries_count: number
  drawn_at: string | null
  created_at: string
  business?: Pick<BusinessProfile, 'business_name' | 'slug' | 'logo_url' | 'is_verified'> & { _id?: string }
  /** Viewer-specific flags, present only on the authenticated detail view. */
  has_entered?: boolean
  is_owner?: boolean
}

export interface GiveawayCreatePayload {
  title: string
  description: string
  giveaway_type: GiveawayType
  estimated_value_cents?: number
  image_url?: string
  image_public_id?: string
  winners_count?: number
  entry_requirement?: 'none' | 'donor' | 'verified_user'
  starts_at?: string
  ends_at: string
}

export interface GiveawayListResponse {
  giveaways: BusinessGiveaway[]
  pagination: Pagination
}

export interface GiveawayClaim {
  _id: string
  giveaway_id: string | { _id: string; title: string; giveaway_type: GiveawayType; estimated_value_cents: number }
  business_id: string | { _id: string; business_name: string; slug: string; logo_url: string }
  winner_id: string | { _id: string; display_name?: string; username?: string; email?: string }
  status: 'pending_claim' | 'claimed' | 'shipped' | 'redeemed' | 'fulfilled' | 'expired'
  fulfilment: {
    contact_email: string
    contact_phone: string
    shipping_address: string
    notes: string
  }
  tracking_reference: string | null
  claim_deadline: string
  claimed_at: string | null
  fulfilled_at: string | null
  created_at: string
}

export interface ClaimFulfilmentPayload {
  contact_email?: string
  contact_phone?: string
  shipping_address?: string
  notes?: string
}

export interface DrawResult {
  giveaway: BusinessGiveaway
  winners: { claim_id: string; winner_id: string; status: string }[]
  seed: string
}
