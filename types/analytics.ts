/**
 * Advanced Analytics types (PRD §3.10 — AN-02, AN-04..AN-09).
 * Mirror the payloads returned by the backend AdvancedAnalyticsService
 * (src/services/AdvancedAnalyticsService.js) wrapped in the `{ success, data }`
 * envelope.
 */

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface CategorySlice {
  category: string
  campaigns: number
  raised_dollars: number
}

export interface GeoSlice {
  country: string
  state: string
  campaigns: number
  raised_dollars: number
}

// ── AN-02 Platform Analytics (admin) ──────────────────────────────────────
export interface PlatformAnalytics {
  period: AnalyticsPeriod
  generated_at: string
  users: {
    total: number
    new_this_period: number
    active_donors_this_period: number
  }
  campaigns: {
    total: number
    active: number
    completed: number
    new_this_period: number
    completion_rate: number
  }
  donations: {
    count: number
    gross_cents: number
    gross_dollars: number
    platform_fees_cents: number
    platform_fees_dollars: number
    average_donation_dollars: number
  }
  revenue: {
    donation_fees_dollars: number
    sponsorship_fees_dollars: number
    total_platform_revenue_dollars: number
  }
  sponsorships: { active: number; gross_dollars: number }
  businesses: { total: number }
  top_categories: CategorySlice[]
  geographic_distribution: GeoSlice[]
}

// ── AN-04 Donor Analytics ─────────────────────────────────────────────────
export interface DonorAnalytics {
  donor_id: string
  period: AnalyticsPeriod
  generated_at: string
  summary: {
    total_donations: number
    total_donated_dollars: number
    average_donation_dollars: number
    largest_donation_dollars: number
    campaigns_supported: number
    first_donation_at: string | null
    last_donation_at: string | null
  }
  by_category: { category: string; donations: number; total_dollars: number }[]
  monthly_timeline: { month: string; donations: number; total_dollars: number }[]
  tax_year_summary: { year: number; donations: number; total_dollars: number }[]
  recent_donations: {
    amount_dollars: number
    campaign_title: string
    campaign_id: string
    payment_method: string
    date: string
  }[]
}

// ── AN-05 Business Impact Analytics ───────────────────────────────────────
export interface BusinessImpactAnalytics {
  business_id: string
  business_name: string
  industry: string
  generated_at: string
  impact_summary: {
    total_contributed_dollars: number
    people_reached: number
    prizes_fulfilled: number
    profile_views: number
  }
  sponsorships: { count: number; gross_dollars: number; net_to_causes_dollars: number }
  giveaways: { count: number; total_entries: number; winners: number; prize_value_dollars: number }
  contribution_timeline: { month: string; sponsorships: number; gross_dollars: number }[]
}

// ── AN-06 Sponsor ROI Analytics ───────────────────────────────────────────
export interface SponsorROIAnalytics {
  sponsor_user_id: string
  business_id: string | null
  generated_at: string
  investment: {
    sponsorships: number
    gross_invested_dollars: number
    net_to_causes_dollars: number
  }
  exposure: {
    profile_views: number
    giveaway_reach: number
    total_impressions: number
  }
  roi: {
    cost_per_impression_dollars: number | null
    impressions_per_dollar: number | null
    net_to_causes_ratio: number
  }
  tier_breakdown: { tier: string; count: number; gross_dollars: number }[]
}

// ── AN-07 Public Impact Dashboard ─────────────────────────────────────────
export interface PublicImpactDashboard {
  generated_at: string
  total_raised_dollars: number
  total_donations: number
  total_donors: number
  campaigns_funded: number
  active_campaigns: number
  partner_businesses: number
  volunteer_hours_logged: number
  top_causes: CategorySlice[]
}

// ── AN-08 City/Region Impact Reports ──────────────────────────────────────
export type RegionGroupBy = 'country' | 'state' | 'city'

export interface RegionImpactReport {
  group_by: RegionGroupBy
  filters: { country: string | null; state: string | null }
  generated_at: string
  regions: {
    region: string
    campaigns: number
    active_campaigns: number
    completed_campaigns: number
    donations: number
    volunteers: number
    raised_dollars: number
    goal_dollars: number
    funding_progress: number
  }[]
}

// ── AN-09 AI Viral Score Predictor ────────────────────────────────────────
export type ViralRating = 'high' | 'moderate' | 'low' | 'minimal'

export interface ViralScorePrediction {
  campaign_id: string
  title: string
  generated_at: string
  viral_score: number
  rating: ViralRating
  factor_breakdown: {
    factor: string
    score: number
    weighted_points: number
    weight: number
  }[]
  signals: {
    viral_coefficient: number
    referral_clicks: number
    referral_conversions: number
    referral_conversion_rate: number
    total_shares: number
    shares_per_day: number
    secondary_sharers: number
    age_days: number
    has_video: boolean
    has_image: boolean
  }
  recommendations: string[]
}
