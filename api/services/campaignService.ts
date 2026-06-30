import { apiClient } from '@/lib/api'
import type { CampaignFilters } from '@/store/filterStore'
import { normalizeImageUrl } from '@/utils/imageUrlNormalizer'

/**
 * Campaign API Service
 * Handles all campaign-related API calls
 */

export interface CampaignImage {
  url: string
  alt: string
}

export interface Campaign {
  id: string
  _id?: string // MongoDB ID
  title: string
  description: string
  image?: CampaignImage
  creator_id: string
  creator_name: string
  creator_avatar?: string
  need_type: string
  campaign_type?: 'fundraising' | 'sharing' // NEW: Campaign type
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
  goal_amount?: number // in cents (optional, computed from goals array)
  raised_amount?: number // in cents (optional, use total_donation_amount instead)
  total_donation_amount: number // actual field from backend, in cents
  total_donations: number // donation count
  donation_count?: number // legacy, maps to total_donations
  goals?: Array<{
    goal_type: string
    goal_name: string
    target_amount: number
    current_amount: number
  }>
  share_count: number
  supporter_count?: number // legacy, use unique_supporters.length instead
  unique_supporters?: string[] // array of supporter IDs
  total_donors: number // total unique donors
  trending: boolean
  geographic_scope?: string // 'local', 'regional', 'national', 'global'
  location?: string | { address: string; city: string; state: string; country: string }
  created_at: string
  updated_at: string
  view_count?: number
  // NEW: Campaign Boost fields (visibility enhancement)
  is_boosted?: boolean // whether campaign has active boost
  current_boost_tier?: 'free' | 'pro' // active boost tier
  last_boost_date?: string // when boost was activated
  visibility_weight?: number // multiplier for feed ranking (1 = normal, 10 = pro boost)
  // NEW: Sharing campaign configuration
  share_config?: {
    total_budget?: number // in cents
    current_budget_remaining?: number // in cents
    amount_per_share?: number // in cents
    is_paid_sharing_active?: boolean
    share_channels?: string[]
    last_config_update?: string
    config_updated_by?: string
  }
  metrics?: {
    total_donations: number
    total_donation_amount: number
    unique_supporters: string[]
    [key: string]: any
  }
}

export interface CampaignDetail extends Campaign {
  full_description: string
  payment_methods: Array<{
    type: string
    username?: string
    email?: string
    cashtag?: string
    routing_number?: string
    account_number?: string
    wallet_address?: string
    details?: string
    [key: string]: any
  }>
  category: string
  tags: string[]
  duration: number // days
  end_date: string
  scope_description?: string
  related_campaigns: Campaign[]
  image_url?: string // Backend returns image_url
}

export interface CampaignAnalytics {
  campaignId: string
  totalDonations: number
  totalRaised: number
  uniqueDonors: number
  totalShares: number
  sharesByChannel: Record<string, number>
  donationsByDate: Array<{ date: string; amount: number; count: number }>
  lastUpdated: string
  financial?: {
    goalAmount: number
    goalProgress: number
    averageDonation: number
  }
}

export interface CampaignListResponse {
  campaigns: Campaign[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class CampaignService {
  /**
   * Get campaign list with filters
   */
  async getCampaigns(
    page: number = 1,
    limit: number = 12,
    filters?: Partial<CampaignFilters>
  ): Promise<CampaignListResponse> {
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
      }

      if (filters?.userId) params.userId = filters.userId
      if (filters?.searchQuery) params.search = filters.searchQuery
      if (filters?.needTypes?.length) params.needTypes = filters.needTypes.join(',')
      if (filters?.location) params.location = filters.location
      if (filters?.locationRadius) params.radius = filters.locationRadius
      if (filters?.geographicScope && filters.geographicScope !== 'all') params.scope = filters.geographicScope
      if (filters?.minGoal !== undefined) params.minGoal = filters.minGoal
      if (filters?.maxGoal !== undefined) params.maxGoal = filters.maxGoal
      // Only send status if it's not 'all' (treat 'all' as no filter)
      if (filters?.status && filters.status !== 'all') params.status = filters.status
      if (filters?.sortBy) params.sort = filters.sortBy

      console.log('📋 [CampaignService] getCampaigns: REQUEST', {
        page,
        limit,
        paramsKeys: Object.keys(params),
        params,
        statusFilter: filters?.status,
        sendingStatus: filters?.status && filters.status !== 'all' ? filters.status : 'NOT SENT (all)',
        endpoint: '/campaigns',
      })

      const response = await apiClient.get<any>('/campaigns', {
        params,
      })

      // Backend response structure: { success, message, data: [], pagination: {...} }
      const { data, pagination } = response.data
      
      // ✅ NORMALIZE IMAGE URLS FOR ALL CAMPAIGNS
      const campaignsWithIds = (data || []).map((campaign: any) => ({
        ...campaign,
        id: campaign.id || campaign._id, // Ensure id is set from _id
        image_url: campaign.image_url ? normalizeImageUrl(campaign.image_url) || campaign.image_url : null,
      }))
      
      const formattedResponse: CampaignListResponse = {
        campaigns: campaignsWithIds,
        total: pagination?.totalCount || 0,
        page: pagination?.page || 1,
        limit: pagination?.limit || 12,
        totalPages: pagination?.totalPages || 1,
      }

      console.log('📋 [CampaignService] getCampaigns: RESPONSE', {
        rawResponseKeys: Object.keys(response.data),
        campaignCount: formattedResponse.campaigns?.length || 0,
        total: formattedResponse.total,
        page: formattedResponse.page,
        totalPages: formattedResponse.totalPages,
        campaigns: formattedResponse.campaigns?.map(c => ({
          id: c.id || c._id,
          title: c.title,
          status: c.status,
          created_at: c.created_at,
        })),
      })

      return formattedResponse
    } catch (error: any) {
      console.error('❌ [CampaignService] getCampaigns: FAILED', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      throw error
    }
  }

  /**
   * Get single campaign detail
   */
  async getCampaign(id: string): Promise<CampaignDetail> {
    try {
      const response = await apiClient.get<{ success: boolean; message: string; data: CampaignDetail }>(
        `/campaigns/${id}`
      )
      // Backend wraps response in {success, message, data}
      const campaign = response.data.data

      // ✅ NORMALIZE IMAGE URL
      if (campaign.image_url) {
        campaign.image_url = normalizeImageUrl(campaign.image_url) || campaign.image_url
      }

      console.log('✅ [Service] useCampaign: Campaign data extracted', {
        campaignId: id,
        hasTitle: !!campaign?.title,
        hasStatus: !!campaign?.status,
        imageUrl: campaign?.image_url,
        imageUrlNormalized: campaign?.image_url ? normalizeImageUrl(campaign.image_url) : null,
      })
      return campaign
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Campaign not found')
      }
      throw error
    }
  }

  /**
   * Get campaign analytics
   * Transforms nested backend response into flat frontend structure
   */
  async getCampaignAnalytics(id: string): Promise<CampaignAnalytics> {
    const startTime = Date.now()
    try {
      console.log('📊 [Service] campaignService.getCampaignAnalytics: Starting request', {
        campaignId: id,
        endpoint: `/campaigns/${id}/analytics`,
        timestamp: new Date().toISOString(),
      })

      const response = await apiClient.get<{ success: boolean; message: string; data: any }>(
        `/campaigns/${id}/analytics`
      )

      // Backend wraps response in {success, message, data}
      const backendAnalytics = response.data.data

      // Transform backend nested structure to flat frontend structure
      const analytics = this.transformAnalyticsResponse(backendAnalytics)

      const elapsedTime = Date.now() - startTime
      console.log('✅ [Service] campaignService.getCampaignAnalytics: Request succeeded', {
        campaignId: id,
        analyticsKeys: Object.keys(analytics || {}),
        statusCode: response.status,
        elapsedTime: `${elapsedTime}ms`,
        dataSize: JSON.stringify(analytics || {}).length,
        totalDonations: analytics?.totalDonations,
        totalRaised: analytics?.totalRaised,
        totalShares: analytics?.totalShares,
      })

      return analytics
    } catch (error: any) {
      const elapsedTime = Date.now() - startTime
      console.error('❌ [Service] campaignService.getCampaignAnalytics: Request failed', {
        campaignId: id,
        error: error.message,
        errorStatus: error.response?.status,
        errorData: error.response?.data,
        elapsedTime: `${elapsedTime}ms`,
      })
      throw error
    }
  }

  /**
   * Transform nested backend analytics to flat frontend structure
   */
  private transformAnalyticsResponse(backendAnalytics: any): CampaignAnalytics {
    if (!backendAnalytics) {
      return {
        campaignId: '',
        totalDonations: 0,
        totalRaised: 0,
        uniqueDonors: 0,
        totalShares: 0,
        sharesByChannel: {},
        donationsByDate: [],
        lastUpdated: new Date().toISOString(),
        financial: {
          goalAmount: 0,
          goalProgress: 0,
          averageDonation: 0,
        },
      }
    }

    return {
      campaignId: backendAnalytics.campaignId || '',
      // Extract from nested structure or use flat structure if it exists
      totalDonations: 
        backendAnalytics.donations?.totalDonations || 
        backendAnalytics.totalDonations || 
        0,
      totalRaised: 
        backendAnalytics.financial?.totalRaised || 
        backendAnalytics.totalRaised || 
        0,
      uniqueDonors: 
        backendAnalytics.donations?.uniqueDonors || 
        backendAnalytics.uniqueDonors || 
        0,
      totalShares: 
        backendAnalytics.shares?.totalShares || 
        backendAnalytics.totalShares || 
        0,
      sharesByChannel: 
        backendAnalytics.shares?.sharesByChannel || 
        backendAnalytics.sharesByChannel || 
        {},
      donationsByDate: 
        backendAnalytics.donations?.donationsByDate || 
        backendAnalytics.donationsByDate || 
        backendAnalytics.trends?.dailyDonations || 
        [],
      lastUpdated: 
        backendAnalytics.generatedAt || 
        backendAnalytics.lastUpdated || 
        new Date().toISOString(),
        
      // NEW: Include financial data for goal calculations
      financial: {
        goalAmount: backendAnalytics.financial?.goalAmount || 0,
        goalProgress: backendAnalytics.financial?.goalProgress || 0,
        averageDonation: backendAnalytics.financial?.averageDonation || backendAnalytics.donations?.averageDonation || 0,
      },
    }
  }

  /**
   * Get trending campaigns
   */
  async getTrendingCampaigns(limit: number = 6): Promise<Campaign[]> {
    try {
      const response = await apiClient.get<{ campaigns: Campaign[] }>(
        '/campaigns/trending',
        {
          params: { limit },
        }
      )
      return response.data.campaigns
    } catch (error: any) {
      console.error('Failed to fetch trending campaigns:', error)
      return []
    }
  }

  /**
   * Get related campaigns by need type
   */
  async getRelatedCampaigns(
    excludeId: string,
    needType: string,
    limit: number = 3
  ): Promise<Campaign[]> {
    try {
      const response = await apiClient.get<{ campaigns: Campaign[] }>(
        `/campaigns/${excludeId}/related`,
        {
          params: {
            needType,
            limit,
          },
        }
      )
      return response.data.campaigns || []
    } catch (error: any) {
      console.error('Failed to fetch related campaigns:', error)
      return [] // Always return an array, never undefined
    }
  }

  /**
   * Record a campaign share
   * Supports: facebook, twitter, linkedin, email, whatsapp, telegram, instagram, 
   *           reddit, tiktok, sms, link, other
   */
  async recordShare(
    campaignId: string,
    channel: 'facebook' | 'twitter' | 'linkedin' | 'email' | 'whatsapp' | 'telegram' | 'instagram' | 'reddit' | 'tiktok' | 'sms' | 'link' | 'other'
  ): Promise<{ shareId: string; referralCode: string; isPaid?: boolean; rewardAmount?: number; message?: string }> {
    try {
      // Backend (ShareController.recordShare) returns:
      //   { success, shareId, isPaid, rewardAmount, referralCode: "?ref=<code>", message }
      const response = await apiClient.post<{
        success: boolean
        shareId: string
        referralCode: string
        isPaid?: boolean
        rewardAmount?: number
        message?: string
      }>(
        `/campaigns/${campaignId}/share`,
        { platform: channel }  // Campaign route validator expects 'platform' field
      )
      return response.data
    } catch (error: any) {
      console.error('Failed to record share:', error)
      throw error
    }
  }

  /**
   * Get need types for filters
   */
  async getNeedTypes(): Promise<Array<{ id: string; name: string; count: number }>> {
    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        // Backend returns need types grouped by category:
        //   [{ category, types: [{ value, label }] }]
        data: Array<{ category: string; types: Array<{ value: string; label: string; count?: number }> }>
      }>('/campaigns/need-types')

      // Unwrap { success, message, data } envelope (or accept a bare array)
      const raw = Array.isArray(response.data) ? response.data : (response.data?.data || [])

      // Flatten the grouped { category, types } shape into the flat
      // { id, name, count } shape the filter UI expects. `id` must be the
      // backend `need_type` value so the campaign-list filter matches exactly.
      // `count` is the live per-category active-campaign count from the backend.
      return raw.flatMap((group) =>
        (group?.types || []).map((t) => ({
          id: t.value,
          name: t.label ?? t.value,
          count: t.count ?? 0,
        }))
      )
    } catch (error: any) {
      console.error('Failed to fetch need types:', error)
      return []
    }
  }

  /**
   * Map frontend category IDs to backend need_type enum values
   * Frontend uses hyphenated format (medical-emergency)
   * Backend uses underscore format with different ordering (emergency_medical)
   */
  private static mapCategoryToNeedType(category: string): string {
    // Mapping of frontend category IDs to backend need_type enum values
    const categoryMap: Record<string, string> = {
      // Emergency categories
      'emergency-medical': 'emergency_medical',
      'emergency-food': 'emergency_food',
      'emergency-shelter': 'emergency_shelter',
      'emergency-transportation': 'emergency_transportation',
      'emergency-utilities': 'emergency_utilities',
      'emergency-legal': 'emergency_legal',
      'emergency-funeral': 'emergency_funeral',
      'emergency-fire-damage': 'emergency_fire_damage',
      'emergency-displacement': 'emergency_displacement',
      'emergency-other': 'emergency_other',

      // Medical categories (reordered from frontend)
      'medical-emergency': 'emergency_medical',  // Special mapping
      'medical-surgery': 'medical_surgery',
      'cancer-treatment': 'medical_cancer',  // ✅ NEW
      'medical-cancer': 'medical_cancer',
      'medical-cardiac': 'medical_cardiac',
      'mental-health': 'medical_mental_health',  // ✅ NEW
      'physical-therapy': 'medical_rehabilitation',  // ✅ NEW
      'dental-care': 'medical_treatment',  // ✅ NEW
      'vision-care': 'medical_treatment',  // ✅ NEW
      'disability-support': 'individual_disability_support',  // ✅ NEW
      'medical-treatment': 'medical_treatment',
      'medication-costs': 'medical_medication',  // ✅ NEW
      'hospital-bills': 'medical_treatment',  // ✅ NEW
      'reproductive-health': 'medical_treatment',  // ✅ NEW
      'mobility-aids': 'individual_disability_support',  // ✅ NEW
      'hearing-aids': 'individual_disability_support',  // ✅ NEW
      'medical-medication': 'medical_medication',
      'medical-hospice': 'medical_hospice',
      'medical-funeral-expenses': 'medical_funeral_expenses',
      'medical-recovery': 'medical_recovery',
      'medical-rehabilitation': 'medical_rehabilitation',
      'medical-mental-health': 'medical_mental_health',

      // Education categories
      'tuition-college': 'education_tuition',  // ✅ NEW
      'tuition-k12': 'education_tuition',  // ✅ NEW
      'vocational-training': 'education_training',  // ✅ NEW
      'student-loans': 'education_graduation_debt',  // ✅ NEW
      'school-supplies': 'education_supplies',  // ✅ NEW
      'study-abroad': 'education_study_abroad',  // ✅ NEW
      'exam-prep': 'education_training',  // ✅ NEW
      'art-music-lessons': 'education_training',  // ✅ NEW
      'language-courses': 'education_training',  // ✅ NEW
      'online-education': 'education_training',  // ✅ NEW
      'special-education': 'education_special_needs',  // ✅ NEW
      'tech-bootcamp': 'education_training',  // ✅ NEW
      'education-tuition': 'education_tuition',
      'education-textbooks': 'education_textbooks',
      'education-supplies': 'education_supplies',
      'education-training': 'education_training',
      'education-special-needs': 'education_special_needs',
      'education-study-abroad': 'education_study_abroad',
      'education-graduation-debt': 'education_graduation_debt',
      'education-scholarship-matching': 'education_scholarship_matching',

      // Housing & Living categories
      'emergency-rent': 'family_rent',  // ✅ NEW
      'mortgage-help': 'family_rent',  // ✅ NEW
      'security-deposit': 'family_rent',  // ✅ NEW
      'homelessness-prevention': 'community_homeless_support',  // ✅ NEW
      'home-repair': 'family_hardship',  // ✅ NEW
      'home-improvement': 'family_hardship',  // ✅ NEW
      'utilities': 'emergency_utilities',  // ✅ NEW
      'internet-phone': 'family_hardship',  // ✅ NEW
      'furniture-appliances': 'family_hardship',  // ✅ NEW
      'moving-costs': 'family_moving_assistance',  // ✅ NEW
      'temporary-housing': 'community_homeless_support',  // ✅ NEW
      'accessible-housing': 'individual_disability_support',  // ✅ NEW

      // Food & Nutrition categories
      'emergency-food': 'emergency_food',  // ✅ NEW
      'food-security': 'family_food_assistance',  // ✅ NEW
      'school-meals': 'community_education_program',  // ✅ NEW
      'senior-meals': 'community_senior_program',  // ✅ NEW
      'community-kitchen': 'community_infrastructure',  // ✅ NEW
      'nutrition-program': 'community_education_program',  // ✅ NEW
      'farmers-market': 'community_environmental',  // ✅ NEW
      'restaurant-support': 'business_startup',  // ✅ NEW
      'food-delivery-elderly': 'community_senior_program',  // ✅ NEW
      'food-allergy-support': 'medical_treatment',  // ✅ NEW

      // Family & Personal categories
      'childcare': 'family_childcare',  // ✅ NEW
      'after-school-programs': 'community_youth_program',  // ✅ NEW
      'emergency-childcare': 'family_childcare',  // ✅ NEW
      'funeral-expenses': 'family_bereavement',  // ✅ NEW
      'adoption-costs': 'family_adoption',  // ✅ NEW
      'parenting-support': 'community_education_program',  // ✅ NEW
      'child-support': 'family_newborn',  // ✅ NEW
      'senior-care': 'community_senior_program',  // ✅ NEW
      'caregiver-support': 'family_elder_care',  // ✅ NEW
      'pet-care': 'family_unexpected_expense',  // ✅ NEW
      'domestic-violence-support': 'community_homeless_support',  // ✅ NEW
      'lgbtq-support': 'community_disaster_relief',  // ✅ NEW
      'family-newborn': 'family_newborn',
      'family-childcare': 'family_childcare',
      'family-elder-care': 'family_elder_care',
      'family-adoption': 'family_adoption',
      'family-unexpected-expense': 'family_unexpected_expense',
      'family-bereavement': 'family_bereavement',
      'family-hardship': 'family_hardship',
      'family-rent': 'family_rent',
      'family-food-assistance': 'family_food_assistance',
      'family-clothing': 'family_clothing',
      'family-medical-support': 'family_medical_support',
      'family-moving-assistance': 'family_moving_assistance',

      // Community categories
      'food-bank': 'community_disaster_relief',  // ✅ NEW
      'homeless-shelter': 'community_homeless_support',  // ✅ NEW
      'community-center': 'community_infrastructure',
      'youth-programs': 'community_youth_program',  // ✅ NEW
      'senior-programs': 'community_senior_program',  // ✅ NEW
      'immigrant-support': 'community_disaster_relief',  // ✅ NEW
      'refugee-support': 'community_disaster_relief',  // ✅ NEW
      'tutoring-mentoring': 'community_education_program',  // ✅ NEW
      'sports-recreation': 'community_youth_program',  // ✅ NEW
      'environmental-projects': 'community_environmental',  // ✅ NEW
      'cultural-events': 'community_cultural_event',  // ✅ NEW
      'disaster-relief': 'community_disaster_relief',  // ✅ NEW
      'community-disaster-relief': 'community_disaster_relief',
      'community-infrastructure': 'community_infrastructure',
      'community-animal-rescue': 'community_animal_rescue',
      'community-environmental': 'community_environmental',
      'community-youth-program': 'community_youth_program',
      'community-senior-program': 'community_senior_program',
      'community-homeless-support': 'community_homeless_support',
      'community-cultural-event': 'community_cultural_event',
      'community-education-program': 'community_education_program',
      'community-arts-program': 'community_arts_program',

      // Business categories
      'startup-funding': 'business_startup',  // ✅ NEW
      'franchise-startup': 'business_startup',  // ✅ NEW
      'small-business-loan': 'business_expansion',  // ✅ NEW
      'retail-store-setup': 'business_startup',  // ✅ NEW
      'online-store': 'business_startup',  // ✅ NEW
      'restaurant-cafe': 'business_startup',  // ✅ NEW
      'service-business': 'business_startup',  // ✅ NEW
      'farming-agriculture': 'business_startup',  // ✅ NEW
      'women-entrepreneurs': 'business_startup',  // ✅ NEW
      'minority-business': 'business_startup',  // ✅ NEW
      'business-startup': 'business_startup',
      'business-equipment': 'business_equipment',
      'business-training': 'business_training',
      'business-expansion': 'business_expansion',
      'business-recovery': 'business_recovery',
      'business-inventory': 'business_inventory',
      'business-technology': 'business_technology',
      'business-marketing': 'business_marketing',

      // Creative & Arts categories
      'music-album': 'business_startup',  // ✅ NEW
      'film-production': 'business_startup',  // ✅ NEW
      'art-exhibition': 'business_startup',  // ✅ NEW
      'theater-production': 'business_startup',  // ✅ NEW
      'podcast-production': 'business_startup',  // ✅ NEW
      'book-publishing': 'business_startup',  // ✅ NEW
      'artist-residency': 'business_startup',  // ✅ NEW
      'craft-project': 'business_startup',  // ✅ NEW
      'photography-exhibit': 'business_startup',  // ✅ NEW
      'video-series': 'business_startup',  // ✅ NEW
      'game-development': 'business_startup',  // ✅ NEW
      'graphic-design': 'business_startup',  // ✅ NEW

      // Individual categories
      'addiction-recovery': 'individual_addiction_recovery',  // ✅ NEW
      'individual-disability-support': 'individual_disability_support',
      'individual-mental-health': 'individual_mental_health',
      'individual-addiction-recovery': 'individual_addiction_recovery',
      'individual-housing': 'individual_housing',
      'individual-job-retraining': 'individual_job_retraining',
      'individual-legal-support': 'individual_legal_support',
      'individual-financial-assistance': 'individual_financial_assistance',
      'individual-personal-development': 'individual_personal_development',

      // Other
      'other': 'other',

      // Environment/Sustainability categories
      'environmental-conservation': 'community_environmental',
      'clean-energy': 'community_environmental',
      'ocean-cleanup': 'community_environmental',
      'forest-restoration': 'community_environmental',
      'animal-rescue': 'community_animal_rescue',
      'climate-action': 'community_environmental',
      'sustainability': 'community_environmental',
      'human-rights': 'community_disaster_relief',
      'social-justice': 'community_disaster_relief',
      'animal-sanctuaries': 'community_animal_rescue',
      'advocacy-campaigns': 'community_disaster_relief',
      'international-aid': 'community_disaster_relief',

      // Technology categories
      'software-development': 'business_startup',
      'hardware-startup': 'business_startup',
      'iot-project': 'business_startup',
      'ai-ml-research': 'business_startup',
      'cybersecurity': 'business_startup',
      'blockchain-crypto': 'business_startup',
      'web3-nft': 'business_startup',
      'vr-ar-tech': 'business_startup',
      'drone-technology': 'business_startup',
      'health-tech': 'medical_treatment',
    }

    // Empty/missing category (e.g. a stale draft, or a step that was skipped):
    // fall back to the valid 'other' enum value so the backend never 400s.
    if (!category) {
      console.warn('⚠️ No category provided, defaulting need_type to "other"')
      return 'other'
    }

    const mappedType = categoryMap[category]
    if (!mappedType) {
      // Unknown category id (a category added to the list without a mapping, or a
      // stale persisted value). A blind hyphen→underscore replacement produces
      // values that are NOT in the backend need_type enum (e.g. "music_album"),
      // which the API rejects with a 400. Default to the always-valid 'other'.
      console.warn(
        `⚠️ No need_type mapping for category "${category}", defaulting to "other"`,
        { category }
      )
      return 'other'
    }

    console.log('📋 campaignService.mapCategoryToNeedType:', {
      category,
      mapped: mappedType,
    })

    return mappedType
  }

  /**
   * Convert wizard form data to backend schema format
   * Maps frontend camelCase fields to backend snake_case fields
   * Generates required fields like goals and payment_methods
   */
  private static convertWizardDataToBackendFormat(data: Record<string, any>): Record<string, any> {
    console.log('📋 campaignService.convertWizardDataToBackendFormat: Converting data', {
      dataKeys: Object.keys(data),
      campaignType: data.campaignType,
      category: data.category,
    })

    // Map category to need_type using conversion function
    const needType = CampaignService.mapCategoryToNeedType(data.category || '')

    // Start with basic fields (camelCase to snake_case mapping)
    const converted: Record<string, any> = {
      title: data.title || '',
      description: data.description || '',
      // Use mapped need_type
      need_type: needType,
      language: data.language || 'en',
      currency: data.currency || 'USD',
    }

    // Process location - make sure it's an object
    if (data.location) {
      if (typeof data.location === 'string') {
        converted.location = {
          address: data.location,
          city: '',
          state: '',
          country: '',
        }
      } else {
        converted.location = data.location
      }
    }

    // Generate goals array based on campaign type
    const goals: any[] = []

    if (data.campaignType === 'fundraising') {
      const fundraisingData = data.fundraisingData || {}
      
      // ✅ Set campaign_type for fundraising
      converted.campaign_type = 'fundraising'
      
      // Create fundraising goal
      if (fundraisingData.goalAmount) {
        goals.push({
          goal_type: 'fundraising',
          goal_name: 'Fundraising Goal',
          target_amount: Math.round(fundraisingData.goalAmount * 100), // Convert to cents
          current_amount: 0,
        })
      }

      // Add secondary goals if they exist
      if (fundraisingData.helpingHandsGoal) {
        goals.push({
          goal_type: 'sharing_reach',
          goal_name: 'Helping Hands Goal',
          target_amount: fundraisingData.helpingHandsGoal,
          current_amount: 0,
        })
      }

      if (fundraisingData.customersGoal) {
        goals.push({
          goal_type: 'sharing_reach',
          goal_name: 'Customers Goal',
          target_amount: fundraisingData.customersGoal,
          current_amount: 0,
        })
      }

      // Fallback: if no goals were added, create a default one
      if (goals.length === 0 && fundraisingData.goalAmount) {
        goals.push({
          goal_type: 'fundraising',
          goal_name: 'Fundraising Goal',
          target_amount: Math.round(fundraisingData.goalAmount * 100),
          current_amount: 0,
        })
      }

      // Handle payment methods
      const paymentMethods = fundraisingData.paymentMethods || []
      const processedPaymentMethods = paymentMethods.map((method: any) => {
        const processedMethod: any = {
          type: method.type || 'bank_transfer',
          is_primary: method.is_primary || false,
        }
        
        // Include all plain text payment details (no encryption needed)
        // Banking fields
        if (method.account_number?.trim()) {
          processedMethod.account_number = method.account_number
        }
        if (method.routing_number?.trim()) {
          processedMethod.routing_number = method.routing_number
        }
        if (method.account_holder?.trim()) {
          processedMethod.account_holder = method.account_holder
        }
        
        // Payment app fields
        if (method.username?.trim()) {
          processedMethod.username = method.username
        }
        if (method.email?.trim()) {
          processedMethod.email = method.email
        }
        if (method.phone?.trim()) {
          processedMethod.phone = method.phone
        }
        if (method.cashtag?.trim()) {
          processedMethod.cashtag = method.cashtag
        }
        if (method.wallet_address?.trim()) {
          processedMethod.wallet_address = method.wallet_address
        }
        if (method.details?.trim()) {
          processedMethod.details = method.details
        }
        
        console.log('💳 campaignService: Payment method fields to send', {
          type: method.type,
          methodFields: Object.keys(processedMethod),
          processedMethod,
        })
        
        return processedMethod
      })

      // Ensure at least one payment method (use default if none provided)
      if (processedPaymentMethods.length === 0) {
        console.warn(
          '⚠️ No payment methods provided, using default Stripe payment method',
          { fundraisingData }
        )
        processedPaymentMethods.push({
          type: 'stripe',
          is_primary: true,
        })
      }

      converted.payment_methods = processedPaymentMethods

      console.log('📋 campaignService: Payment methods prepared', {
        count: processedPaymentMethods.length,
        methods: processedPaymentMethods,
      })

      // Handle tags
      converted.tags = fundraisingData.tags || []

      // Handle dates
      if (fundraisingData.duration) {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + fundraisingData.duration)
        converted.start_date = startDate.toISOString()
        converted.end_date = endDate.toISOString()
      }
    } else if (data.campaignType === 'sharing') {
      const sharingData = data.sharingData || {}

      // ✅ PRESERVE sharingData for FormData submission
      converted.campaign_type = 'sharing'
      converted.sharingData = sharingData

      // SU-1: dollar fundraising goal (sharing campaigns still take donations).
      // Only added when the creator set a real (>= $5) goal — a pure-virality
      // campaign legitimately has no dollar goal.
      if (sharingData.fundraisingGoal && sharingData.fundraisingGoal >= 5) {
        goals.push({
          goal_type: 'fundraising',
          goal_name: 'Fundraising Goal',
          target_amount: Math.round(sharingData.fundraisingGoal * 100), // cents
          current_amount: 0,
        })
      }

      // SU-1: reach target — a SHARE COUNT on its own non-dollar meter. Prefer the
      // explicit reachTarget; fall back to a sensible default when platforms exist.
      const reachTarget =
        sharingData.reachTarget || sharingData.maxShares ||
        (sharingData.platforms?.length > 0 ? 100 : 0)
      if (reachTarget > 0) {
        goals.push({
          goal_type: 'sharing_reach',
          goal_name: 'Social Sharing Goal',
          target_amount: reachTarget, // a share count, NOT dollars
          current_amount: 0,
        })
      }

      // SU-1: real creator payment methods so donations actually work (no more
      // non-functional stripe placeholder).
      converted.payment_methods =
        Array.isArray(sharingData.paymentMethods) && sharingData.paymentMethods.length > 0
          ? sharingData.paymentMethods
          : [{ type: 'stripe', is_primary: true }];

      // Placeholder tags for sharing
      converted.tags = []

      console.log('📋 campaignService: Sharing campaign data preserved', {
        campaign_type: converted.campaign_type,
        sharingDataKeys: Object.keys(converted.sharingData),
        sharingData: converted.sharingData,
      })
    }

    // Ensure goals array has at least one goal
    if (goals.length === 0) {
      goals.push({
        goal_type: 'fundraising',
        goal_name: 'Default Goal',
        target_amount: 1000, // 10 dollars in cents
        current_amount: 0,
      })
    }

    converted.goals = goals

    console.log('📋 campaignService.convertWizardDataToBackendFormat: Conversion complete', {
      convertedKeys: Object.keys(converted),
      need_type: converted.need_type,
      goalsCount: goals.length,
      paymentMethodsCount: converted.payment_methods?.length,
    })

    return converted
  }

  /**
   * Create a new campaign
   * Handles FormData for multipart file upload
   */
  async createCampaign(
    data: Record<string, any>,
    imageFile?: File
  ): Promise<{ id: string; campaign: CampaignDetail }> {
    try {
      // Convert wizard form data to backend schema format
      const backendData = CampaignService.convertWizardDataToBackendFormat(data)

      console.log('📋 campaignService.createCampaign: Starting campaign creation', {
        backendDataKeys: Object.keys(backendData),
        imageFile: imageFile?.name,
      })

      // Prepare FormData for multipart request
      const formData = new FormData()

      // Basic fields (as strings) - using snake_case from converted data
      formData.append('title', backendData.title)
      formData.append('description', backendData.description)

      // ✅ Only append need_type for fundraising campaigns (not for sharing)
      if (backendData.campaign_type !== 'sharing') {
        formData.append('need_type', backendData.need_type)
        console.log('📋 campaignService: need_type appended (fundraising campaign)', {
          need_type: backendData.need_type,
        })
      }

      // location MUST be stringified as JSON
      if (backendData.location) {
        formData.append('location', JSON.stringify(backendData.location))
        console.log('📋 campaignService: location stringified as JSON', {
          location: backendData.location,
        })
      }

      // goals MUST be stringified as JSON array
      if (Array.isArray(backendData.goals)) {
        formData.append('goals', JSON.stringify(backendData.goals))
        console.log('📋 campaignService: goals stringified as JSON', {
          goalsCount: backendData.goals.length,
          goals: backendData.goals,
        })
      }

      // payment_methods MUST be stringified as JSON array
      if (Array.isArray(backendData.payment_methods)) {
        formData.append('payment_methods', JSON.stringify(backendData.payment_methods))
        console.log('📋 campaignService: payment_methods stringified as JSON', {
          methodsCount: backendData.payment_methods.length,
          payment_methods: backendData.payment_methods,
        })
      }

      // tags as CSV string
      if (Array.isArray(backendData.tags)) {
        formData.append('tags', backendData.tags.join(','))
        console.log('📋 campaignService: tags as CSV string', {
          tags: backendData.tags,
        })
      }

      // Optional fields
      if (backendData.category) {
        formData.append('category', backendData.category)
      }

      if (backendData.start_date) {
        formData.append('start_date', backendData.start_date)
      }

      if (backendData.end_date) {
        formData.append('end_date', backendData.end_date)
      }

      formData.append('language', backendData.language || 'en')
      formData.append('currency', backendData.currency || 'USD')

      // ✅ Handle prayer configuration if provided
      if (data.prayerConfig) {
        console.log('📋 campaignService: Prayer config received from wizard', {
          prayerConfig: data.prayerConfig,
          enabled: data.prayerConfig.enabled,
          title: data.prayerConfig.title,
          settings: data.prayerConfig.settings,
        })

        if (data.prayerConfig.enabled) {
          const prayerConfig = {
            enabled: true,
            title: data.prayerConfig.title,
            description: data.prayerConfig.description,
            prayer_goal: data.prayerConfig.prayer_goal,
            settings: data.prayerConfig.settings,
          }
          formData.append('prayer_config', JSON.stringify(prayerConfig))
          console.log('✅ campaignService: prayer_config stringified and appended to FormData', {
            prayer_config: prayerConfig,
            jsonString: JSON.stringify(prayerConfig),
          })
        } else {
          console.warn('⚠️ campaignService: Prayer config received but enabled=false, skipping FormData append', {
            prayerConfig: data.prayerConfig,
          })
        }
      } else {
        console.log('📋 campaignService: No prayer config provided in wizard data')
      }

      // ✅ Handle campaign type and type-specific fields
      if (backendData.campaign_type === 'sharing' && backendData.sharingData) {
        const { platforms, budget, rewardPerShare, maxShares, payoutConsent } = backendData.sharingData

        // Append campaign_type as 'sharing'
        formData.append('campaign_type', 'sharing')
        console.log('📋 campaignService: campaign_type = sharing')

        // Append sharing-specific fields
        if (platforms && Array.isArray(platforms) && platforms.length > 0) {
          formData.append('platforms', JSON.stringify(platforms))
          console.log('📋 campaignService: platforms stringified as JSON', {
            platforms: platforms,
            platformsCount: platforms.length,
          })
        }

        // Append budget (in dollars)
        if (budget) {
          formData.append('budget', budget.toString())
          console.log('📋 campaignService: budget appended', {
            budget: budget,
          })
        }

        // Append reward_per_share (in dollars)
        if (rewardPerShare) {
          formData.append('reward_per_share', rewardPerShare.toString())
          console.log('📋 campaignService: reward_per_share appended', {
            reward_per_share: rewardPerShare,
          })
        }

        // Append max_shares_per_person if provided
        if (maxShares) {
          formData.append('max_shares_per_person', maxShares.toString())
          console.log('📋 campaignService: max_shares_per_person appended', {
            max_shares_per_person: maxShares,
          })
        }

        // Phase A (trust-based): creator's agreement to pay sharers directly.
        // Required server-side before Share-to-Earn activates.
        formData.append('payout_consent', payoutConsent ? 'true' : 'false')
        console.log('📋 campaignService: payout_consent appended', {
          payout_consent: !!payoutConsent,
        })
      } else {
        // Default to fundraising for all other cases
        formData.append('campaign_type', 'fundraising')
        console.log('📋 campaignService: campaign_type = fundraising')
      }

      // Append image if provided
      // ✅ FIX: Check for File instance + size (not Object.keys which is empty for File objects)
      const hasImageFile = imageFile && imageFile instanceof File && imageFile.size > 0
      
      if (hasImageFile) {
        console.log('📋 campaignService: image file is valid, appending to FormData', {
          fileName: imageFile.name,
          fileSize: imageFile.size,
          fileMimeType: imageFile.type,
        })
        formData.append('image', imageFile as File)
        console.log('✅ campaignService: image file APPENDED to FormData')
      } else if (imageFile) {
        console.warn('⚠️ campaignService: imageFile exists but is not valid', {
          imageFileType: typeof imageFile,
          isFileInstance: imageFile instanceof File,
          fileSize: imageFile?.size || 'N/A',
          fileSizeGreaterThanZero: imageFile?.size > 0,
        })
      } else {
        console.warn('⚠️ campaignService: NO imageFile provided to createCampaign', {
          imageFile: imageFile,
        })
      }

      console.log('📋 campaignService: FormData prepared, sending to API', {
        contentType: 'multipart/form-data',
        formDataKeys: Array.from(new FormData().keys ? new FormData().keys() : []),
      })

      const response = await apiClient.post<{ id: string; campaign: CampaignDetail }>(
        '/campaigns',
        formData,
        {
          headers: {
            // Don't set Content-Type header for FormData - let axios/browser handle it
            // This ensures the boundary is correctly set for multipart form-data
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Failed to create campaign:', error)
      throw error
    }
  }

  /**
   * Submit a donation for a campaign
   */
  async createDonation(
    campaignId: string,
    amount: number,
    paymentMethod: Record<string, any>,
    screenshotProof?: File
  ): Promise<{ transactionId: string; status: string }> {
    try {
      const formData = new FormData()

      // Add donation details
      formData.append('campaignId', campaignId)
      formData.append('amount', String(Math.round(amount * 100))) // Convert to cents
      formData.append('paymentMethod', JSON.stringify(paymentMethod))

      // Add screenshot proof if provided
      if (screenshotProof) {
        formData.append('screenshotProof', screenshotProof, screenshotProof.name)
      }

      const response = await apiClient.post<{ transactionId: string; status: string }>(
        `/campaigns/${campaignId}/donate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      return response.data
    } catch (error: any) {
      console.error('Failed to create donation:', error)
      throw error
    }
  }

  /**
   * Get user's donations
   */
  async getDonations(
    page: number = 1,
    limit: number = 25
  ): Promise<{
    donations: Array<{
      transactionId: string
      campaignId: string
      campaignTitle: string
      amount: number
      status: 'pending' | 'verified' | 'rejected'
      createdAt: string
    }>
    total: number
  }> {
    try {
      const response = await apiClient.get('/donations', {
        params: { page, limit },
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch donations:', error)
      throw error
    }
  }

  /**
   * Get donation details
   */
  async getDonation(
    transactionId: string
  ): Promise<{
    transactionId: string
    campaignId: string
    campaignTitle: string
    amount: number
    paymentMethod: Record<string, any>
    status: 'pending' | 'verified' | 'rejected'
    createdAt: string
    updatedAt: string
  }> {
    try {
      const response = await apiClient.get(`/donations/${transactionId}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch donation:', error)
      throw error
    }
  }

  /**
   * Get user's shares
   */
  async getShares(
    page: number = 1,
    limit: number = 25
  ): Promise<{
    shares: Array<{
      shareId: string
      campaignId: string
      campaignTitle: string
      channel: string
      referrals: number
      conversions: number
      createdAt: string
    }>
    total: number
  }> {
    try {
      const response = await apiClient.get('/shares', {
        params: { page, limit },
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch shares:', error)
      throw error
    }
  }

  /**
   * Get campaign share statistics
   */
  async getCampaignShareStats(campaignId: string): Promise<{
    campaignId: string
    totalShares: number
    totalReferrals: number
    totalConversions: number
    sharesByChannel: Record<string, number>
    qrCodeUrl: string
  }> {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/share-stats`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch share stats:', error)
      throw error
    }
  }

  /**
   * Get campaign share budget
   */
  async getCampaignShareBudget(campaignId: string): Promise<{
    campaignId: string
    totalBudget: number
    usedBudget: number
    remainingBudget: number
  }> {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/share-budget`)
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch share budget:', error)
      throw error
    }
  }

  /**
   * Update campaign details (title, description, goalAmount, etc.)
   * Only allowed for draft campaigns
   * Immutable fields: campaign_type, need_type
   */
  async updateCampaign(
    id: string,
    data: Record<string, any>,
    imageFile?: File
  ): Promise<CampaignDetail> {
    try {
      const formData = new FormData()

      console.log('📝 [CampaignService] updateCampaign: Preparing update', {
        campaignId: id,
        updateFields: Object.keys(data),
        hasImage: !!imageFile,
      })

      // Basic fields
      if (data.title) formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      if (data.category) formData.append('category', data.category)

      // Tags as CSV
      if (data.tags && Array.isArray(data.tags)) {
        formData.append('tags', data.tags.join(','))
      }

      // Handle specific fields for fundraising campaigns
      if (data.fundraisingData) {
        const fData = typeof data.fundraisingData === 'string' 
          ? JSON.parse(data.fundraisingData) 
          : data.fundraisingData
        
        const fundraisingPayload: Record<string, any> = {}
        
        if (fData.goalAmount !== undefined) {
          fundraisingPayload.goalAmount = fData.goalAmount
        }
        if (fData.duration !== undefined) {
          fundraisingPayload.duration = fData.duration
        }
        if (fData.paymentMethods) {
          fundraisingPayload.paymentMethods = fData.paymentMethods
        }
        
        if (Object.keys(fundraisingPayload).length > 0) {
          formData.append('fundraisingData', JSON.stringify(fundraisingPayload))
        }
      }

      // Handle specific fields for sharing campaigns
      if (data.sharingData) {
        const sData = typeof data.sharingData === 'string' 
          ? JSON.parse(data.sharingData) 
          : data.sharingData
        
        const sharingPayload: Record<string, any> = {}
        
        if (sData.platforms) {
          sharingPayload.platforms = sData.platforms
        }
        if (sData.rewardPerShare !== undefined) {
          sharingPayload.rewardPerShare = sData.rewardPerShare
        }
        if (sData.totalBudget !== undefined) {
          sharingPayload.totalBudget = sData.totalBudget
        }
        
        if (Object.keys(sharingPayload).length > 0) {
          formData.append('sharingData', JSON.stringify(sharingPayload))
        }
      }

      // Append image if provided
      if (imageFile && imageFile instanceof File && imageFile.size > 0) {
        formData.append('image', imageFile)
        console.log('📝 [CampaignService] updateCampaign: Image appended', {
          fileName: imageFile.name,
          fileSize: imageFile.size,
        })
      }

      const response = await apiClient.put<{ success: boolean; data: CampaignDetail; message?: string }>(
        `/campaigns/${id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log('✅ [CampaignService] updateCampaign: Success', {
        campaignId: id,
        responseStatus: response.data.success,
      })

      return response.data.data
    } catch (error: any) {
      console.error('❌ [CampaignService] updateCampaign: Failed', {
        campaignId: id,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })

      // Handle specific error cases
      if (error.response?.status === 409) {
        throw new Error(error.response?.data?.message || 'Cannot edit campaign in this status')
      }

      if (error.response?.status === 422) {
        const validationErrors = error.response?.data?.validationErrors
        if (validationErrors && Array.isArray(validationErrors)) {
          throw new Error(validationErrors.map((e: any) => `${e.field}: ${e.message}`).join(', '))
        }
        throw new Error(error.response?.data?.message || 'Validation failed')
      }

      throw error
    }
  }

  /**
   * Publish a draft campaign (activate it)
   */
  async publishCampaign(id: string): Promise<CampaignDetail> {
    try {
      const response = await apiClient.post<{ success: boolean; data: CampaignDetail }>(`/campaigns/${id}/publish`)
      return response.data.data
    } catch (error: any) {
      console.error('Failed to publish campaign:', error)
      throw error
    }
  }

  /**
   * Pause an active campaign
   */
  async pauseCampaign(id: string): Promise<CampaignDetail> {
    try {
      const response = await apiClient.post<{ success: boolean; data: CampaignDetail }>(`/campaigns/${id}/pause`)
      return response.data.data
    } catch (error: any) {
      console.error('Failed to pause campaign:', error)
      throw error
    }
  }

  /**
   * Unpause a paused campaign (resume it)
   */
  async unpauseCampaign(id: string): Promise<CampaignDetail> {
    try {
      const response = await apiClient.post<{ success: boolean; data: CampaignDetail }>(`/campaigns/${id}/unpause`)
      return response.data.data
    } catch (error: any) {
      console.error('Failed to unpause campaign:', error)
      throw error
    }
  }

  /**
   * Complete an active or paused campaign
   */
  async completeCampaign(id: string): Promise<CampaignDetail> {
    try {
      const response = await apiClient.post<{ success: boolean; data: CampaignDetail }>(`/campaigns/${id}/complete`)
      return response.data.data
    } catch (error: any) {
      console.error('Failed to complete campaign:', error)
      throw error
    }
  }

  /**
   * Increase campaign goal amount
   */
  async increaseGoal(id: string, newGoalAmount: number): Promise<CampaignDetail> {
    try {
      const response = await apiClient.post<{ success: boolean; data: CampaignDetail }>(`/campaigns/${id}/increase-goal`, {
        newGoalAmount,
      })
      return response.data.data
    } catch (error: any) {
      console.error('Failed to increase goal:', error)
      throw error
    }
  }

  /**
   * Delete (soft delete) a campaign
   */
  async deleteCampaign(id: string): Promise<{ success: boolean }> {
    try {
      const response = await apiClient.delete<{ success: boolean }>(`/campaigns/${id}`)
      return response.data
    } catch (error: any) {
      console.error('Failed to delete campaign:', error)
      throw error
    }
  }

  /**
   * Request budget reload for sharing campaigns
   */
  async requestBudgetReload(
    campaignId: string,
    amount: number
  ): Promise<{ requestId: string; status: string }> {
    try {
      const response = await apiClient.post<{ requestId: string; status: string }>(
        `/campaigns/${campaignId}/budget-reload`,
        {
          amount: Math.round(amount * 100), // Convert to cents
        }
      )
      return response.data
    } catch (error: any) {
      console.error('Failed to request budget reload:', error)
      throw error
    }
  }

  /**
   * Get payment directory for a campaign
   * Returns creator's payment methods for displaying to potential supporters
   */
  async getPaymentDirectory(
    campaignId: string
  ): Promise<{
    campaignId: string
    creatorName: string
    paymentMethods: Array<{
      type: string
      [key: string]: any
    }>
  }> {
    try {
      const response = await apiClient.get(
        `/campaigns/${campaignId}/payment-directory`
      )
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch payment directory:', error)
      throw error
    }
  }
}

export const campaignService = new CampaignService()
