'use client'

import { useQuery } from '@tanstack/react-query'
import { advancedAnalyticsService } from '@/api/services/advancedAnalyticsService'
import type { AnalyticsPeriod, RegionGroupBy } from '@/types/analytics'

/**
 * Advanced analytics hooks (PRD §3.10 — AN-02, AN-04..AN-09).
 * One key factory keeps cache invalidation coherent across the surfaces.
 */
export const analyticsKeys = {
  all: ['advanced-analytics'] as const,
  platform: (period: string) => [...analyticsKeys.all, 'platform', period] as const,
  donor: (period: string, userId?: string) =>
    [...analyticsKeys.all, 'donor', period, userId ?? 'self'] as const,
  businessImpact: (id: string) => [...analyticsKeys.all, 'business-impact', id] as const,
  sponsorROI: (userId?: string) => [...analyticsKeys.all, 'sponsor-roi', userId ?? 'self'] as const,
  publicImpact: () => [...analyticsKeys.all, 'public-impact'] as const,
  regions: (params: Record<string, unknown>) => [...analyticsKeys.all, 'regions', params] as const,
  viral: (id: string) => [...analyticsKeys.all, 'viral', id] as const,
}

// AN-02 — Platform Analytics (admin)
export function usePlatformAnalytics(period: AnalyticsPeriod = 'month', enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.platform(period),
    queryFn: () => advancedAnalyticsService.getPlatformAnalytics(period),
    enabled,
    staleTime: 2 * 60 * 1000,
  })
}

// AN-04 — Donor Analytics
export function useDonorAnalytics(period: AnalyticsPeriod = 'all', userId?: string, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.donor(period, userId),
    queryFn: () => advancedAnalyticsService.getDonorAnalytics(period, userId),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

// AN-05 — Business Impact Analytics
export function useBusinessImpact(businessId: string | undefined) {
  return useQuery({
    queryKey: analyticsKeys.businessImpact(businessId ?? ''),
    queryFn: () => advancedAnalyticsService.getBusinessImpact(businessId as string),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000,
  })
}

// AN-06 — Sponsor ROI Analytics
export function useSponsorROI(userId?: string, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.sponsorROI(userId),
    queryFn: () => advancedAnalyticsService.getSponsorROI(userId),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

// AN-07 — Public Impact Dashboard
export function usePublicImpact() {
  return useQuery({
    queryKey: analyticsKeys.publicImpact(),
    queryFn: () => advancedAnalyticsService.getPublicImpact(),
    staleTime: 10 * 60 * 1000,
  })
}

// AN-08 — City/Region Impact Reports
export function useRegionReport(params: {
  groupBy?: RegionGroupBy
  country?: string
  state?: string
  limit?: number
} = {}) {
  return useQuery({
    queryKey: analyticsKeys.regions(params),
    queryFn: () => advancedAnalyticsService.getRegionReport(params),
    staleTime: 10 * 60 * 1000,
  })
}

// AN-09 — AI Viral Score Predictor
export function useViralScore(campaignId: string | undefined) {
  return useQuery({
    queryKey: analyticsKeys.viral(campaignId ?? ''),
    queryFn: () => advancedAnalyticsService.getViralScore(campaignId as string),
    enabled: !!campaignId,
    staleTime: 5 * 60 * 1000,
  })
}
