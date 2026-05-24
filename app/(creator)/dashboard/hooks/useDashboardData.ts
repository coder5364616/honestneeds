'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

/**
 * Unified hook for all dashboard data
 * Fetches campaigns, stats, and analytics in one place
 */

export interface Campaign {
  _id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'rejected'
  campaign_type: 'fundraising' | 'sharing'
  goal: number
  raised: number
  image_url?: string
  created_at: string
  updated_at: string
  donor_count?: number
  share_count?: number
}

export interface DashboardStats {
  totalRaised: number
  totalActiveCampaigns: number
  totalDonors: number
  totalCampaigns: number
  averageDonation: number
  successRate: number
}

export interface DashboardData {
  campaigns: Campaign[]
  stats: DashboardStats
  totalCount: number
}

const EMPTY_CAMPAIGNS: Campaign[] = []
const DEFAULT_STATS: DashboardStats = {
  totalRaised: 0,
  totalActiveCampaigns: 0,
  totalDonors: 0,
  totalCampaigns: 0,
  averageDonation: 0,
  successRate: 0,
}

/**
 * Main hook for fetching all dashboard data
 */
export function useDashboardData(
  status?: string[],
  page: number = 1,
  searchQuery: string = ''
) {
  const { user } = useAuthStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-data', user?.id, status, page, searchQuery],
    queryFn: async (): Promise<DashboardData> => {
      try {
        // Fetch campaigns list
        const campaignParams = new URLSearchParams()
        if (status && status.length > 0) {
          campaignParams.append('status', status.join(','))
        }
        if (searchQuery) {
          campaignParams.append('search', searchQuery)
        }
        campaignParams.append('page', page.toString())
        campaignParams.append('limit', '12')

        const campaignsRes = await axios.get('/api/campaigns/my-campaigns', {
          params: Object.fromEntries(campaignParams),
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        // DEBUG: Log what we're receiving from the backend
        console.log('📊 [useDashboardData] Raw campaigns response:', {
          campaignCount: campaignsRes.data.campaigns?.length,
          firstCampaign: campaignsRes.data.campaigns?.[0],
          sampleFields: campaignsRes.data.campaigns?.[0] ? {
            has_raised_amount: 'raised_amount' in campaignsRes.data.campaigns[0],
            has_goal_amount: 'goal_amount' in campaignsRes.data.campaigns[0],
            has_total_donation_amount: 'total_donation_amount' in campaignsRes.data.campaigns[0],
            has_supporter_count: 'supporter_count' in campaignsRes.data.campaigns[0],
            raised_amount: campaignsRes.data.campaigns[0].raised_amount,
            goal_amount: campaignsRes.data.campaigns[0].goal_amount,
          } : null,
        })

        // Map backend field names to dashboard field names
        const campaigns = (campaignsRes.data.campaigns || []).map((c: any) => {
          // Backend returns: raised_amount, goal_amount, supporter_count, donation_count
          // raised_amount is in cents (already calculated from goals array)
          // goal_amount is in cents (already calculated from goals array)
          
          return {
            ...c,
            // Ensure _id is always set (backend might return id or _id)
            _id: c._id || c.id,
            // Map backend field names to dashboard interface names
            raised: c.raised_amount ?? c.total_donation_amount ?? 0,
            goal: c.goal_amount ?? 0,
            donor_count: c.supporter_count ?? c.total_donors ?? c.donation_count ?? 0,
          }
        })

        // DEBUG: Log mapped campaigns
        console.log('📊 [useDashboardData] Mapped campaigns:', {
          campaignCount: campaigns.length,
          firstCampaign: campaigns[0] ? {
            title: campaigns[0].title,
            raised: campaigns[0].raised,
            goal: campaigns[0].goal,
            donor_count: campaigns[0].donor_count,
          } : null,
        })

        const totalCount = campaignsRes.data.pagination?.total ?? (campaignsRes.data.total || 0)

        // Fetch dashboard stats
        const statsRes = await axios.get('/api/campaigns/my-stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const statsData = statsRes.data.data || {}

        // Calculate derived stats
        const stats: DashboardStats = {
          totalRaised: statsData.totalRaised || 0,
          totalActiveCampaigns: campaigns.filter((c: Campaign) => c.status === 'active').length,
          totalDonors: statsData.totalDonors || 0,
          totalCampaigns: totalCount,
          averageDonation: statsData.averageDonation || 0,
          successRate: campaigns.length > 0
            ? (campaigns.filter((c: Campaign) => c.status === 'completed').length / campaigns.length) * 100
            : 0,
        }

        return {
          campaigns,
          stats,
          totalCount,
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        throw err
      }
    },
    enabled: !!user && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  })

  return {
    campaigns: data?.campaigns || EMPTY_CAMPAIGNS,
    stats: data?.stats || DEFAULT_STATS,
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook for fetching real-time metrics
 */
export function useDashboardMetrics(startDate?: string, endDate?: string) {
  const { user } = useAuthStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics', user?.id, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const res = await axios.get('/api/metrics/creator/dashboard', {
        params: Object.fromEntries(params),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return res.data.data
    },
    enabled: !!user && !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    metrics: data || null,
    isLoading,
    error,
  }
}
