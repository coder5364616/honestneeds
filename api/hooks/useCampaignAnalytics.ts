/**
 * Campaign Analytics Hooks
 * 
 * Core hooks for fetching campaign analytics data:
 * - Time-series metrics (donations, shares, engagement)
 * - Trend analysis
 * - Predictive analytics & AI recommendations
 * - Cohort analysis
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';


// ============================================================================
// INTERFACES
// ============================================================================

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  count?: number;
}

export interface TimeSeriesData {
  shares?: TimeSeriesDataPoint[];
  donations?: TimeSeriesDataPoint[];
  engagement?: TimeSeriesDataPoint[];
  campaign?: TimeSeriesDataPoint[];
}

export interface TrendMetrics {
  direction: 'up' | 'down' | 'stable';
  percentageChange: number;
  explanation: string;
}

export interface TrendAnalysis {
  campaign?: TrendMetrics;
  byPlatform?: Record<string, TrendMetrics>;
  seasonal?: TrendMetrics;
}

export interface PredictionData {
  forecast: TimeSeriesDataPoint[];
  successProbability: number;
  budgetDepletionDays: number | null;
  budgetDepletion: boolean;
  estimatedFinalValue: number;
  recommendations: string[];
}

export interface CohortData {
  cohortDate: string;
  cohortCount: number;
  metrics: {
    avgConversions: number;
    totalValue: number;
    retentionRate: number;
    shareCount: number;
  };
}

export interface CohortAnalysis {
  cohorts: CohortData[];
  bestCohort: string;
  avgRetention: number;
}

export interface AnalyticsMetadata {
  campaignId: string;
  campaignName: string;
  period: string;
  days: number;
  lastUpdated: string;
  realTimeEnabled: boolean;
}

// ============================================================================
// Query Key Factory
// ============================================================================

const analyticsKeys = {
  all: ['campaign-analytics'] as const,
  campaign: (campaignId: string) => [...analyticsKeys.all, 'campaign', campaignId] as const,
  timeSeries: (campaignId: string, period: string, days: number) =>
    [...analyticsKeys.campaign(campaignId), 'timeSeries', period, days] as const,
  trends: (campaignId: string, days: number) =>
    [...analyticsKeys.campaign(campaignId), 'trends', days] as const,
  predictions: (campaignId: string, days: number) =>
    [...analyticsKeys.campaign(campaignId), 'predictions', days] as const,
  cohorts: (campaignId: string) =>
    [...analyticsKeys.campaign(campaignId), 'cohorts'] as const,
};

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook: Main Campaign Analytics
 * 
 * Fetches comprehensive campaign analytics from the main analytics endpoint
 * Returns complete financial, donation, share, and engagement metrics
 * 
 * @param campaignId - Campaign ID
 */
export function useMainAnalytics(campaignId: string) {
  return useQuery({
    queryKey: ['analytics', 'main', campaignId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(
          `/campaigns/${campaignId}/analytics`
        );
        
        console.log('📊 [useMainAnalytics] Backend Analytics Response:', {
          campaignId,
          financial: data?.data?.financial,
          donations: data?.data?.donations,
          shares: data?.data?.shares,
          goalAmount: data?.data?.financial?.goalAmount,
          totalRaised: data?.data?.financial?.totalRaised,
        });
        
        return data.data || {};
      } catch (error: any) {
        console.error('[Analytics] Main analytics fetch error:', {
          campaignId,
          error: error.message,
          status: error.response?.status,
        });
        throw error;
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!campaignId,
  });
}

/**
 * Hook: Get Time-Series Analytics
 * 
 * Fetches time-series data for donations, shares, and engagement over specified period
 * 
 * @param campaignId - Campaign ID
 * @param period - Period: 'daily', 'weekly', 'monthly'
 * @param days - Number of days to fetch
 */
export function useTimeSeriesAnalytics(
  campaignId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 30
): UseQueryResult<TimeSeriesData, Error> {
  return useQuery({
    queryKey: analyticsKeys.timeSeries(campaignId, period, days),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(
          `/analytics/campaigns/${campaignId}/time-series`,
          {
            params: { period, days },
          }
        );
        
        // DEBUG: Log the raw response
        console.log('🔍 [useTimeSeriesAnalytics] Backend Response:', {
          campaignId,
          period,
          days,
          rawData: data,
          timeSeriesData: data.data,
        });
        
        return data.data || {};
      } catch (error: any) {
        console.error('[Analytics] Time-series fetch error:', {
          campaignId,
          period,
          days,
          error: error.message,
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!campaignId,
  });
}

/**
 * Hook: Get Trend Analysis
 * 
 * Analyzes trends in donations, shares, and seasonal patterns
 * 
 * @param campaignId - Campaign ID
 * @param days - Number of days to analyze
 */
export function useTrendAnalytics(
  campaignId: string,
  days: number = 30
): UseQueryResult<TrendAnalysis, Error> {
  return useQuery({
    queryKey: analyticsKeys.trends(campaignId, days),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(
          `/analytics/campaigns/${campaignId}/trends`,
          {
            params: { days },
          }
        );
        return data.data || {};
      } catch (error: any) {
        console.error('[Analytics] Trend fetch error:', {
          campaignId,
          days,
          error: error.message,
        });
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!campaignId,
  });
}

/**
 * Hook: Get Predictive Analytics & AI Recommendations
 * 
 * Fetches ML-generated predictions, success probability, and actionable recommendations
 * 
 * @param campaignId - Campaign ID
 * @param forecastDays - Number of days to forecast
 */
export function usePredictiveAnalytics(
  campaignId: string,
  forecastDays: number = 14
): UseQueryResult<PredictionData, Error> {
  return useQuery({
    queryKey: analyticsKeys.predictions(campaignId, forecastDays),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(
          `/analytics/campaigns/${campaignId}/predict`,
          {
            params: { forecastDays },
          }
        );
        
        // DEBUG: Log prediction response
        console.log('🔍 [usePredictiveAnalytics] Backend Response:', {
          campaignId,
          forecastDays,
          rawData: data,
          predictions: data.data,
          estimatedFinalValue: data.data?.estimatedFinalValue,
        });
        
        return data.data || {};
      } catch (error: any) {
        console.error('[Analytics] Predictive analytics fetch error:', {
          campaignId,
          forecastDays,
          error: error.message,
        });
        // Return empty but don't throw - not critical
        return {
          forecast: [],
          successProbability: 0,
          budgetDepletionDays: null,
          budgetDepletion: false,
          estimatedFinalValue: 0,
          recommendations: [],
        };
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (longer, as predictions don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!campaignId,
  });
}

/**
 * Hook: Get Cohort Analysis
 * 
 * Analyzes user cohorts and their behavior patterns
 * 
 * @param campaignId - Campaign ID
 */
export function useCohortAnalytics(
  campaignId: string
): UseQueryResult<CohortAnalysis, Error> {
  return useQuery({
    queryKey: analyticsKeys.cohorts(campaignId),
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(
          `/analytics/campaigns/${campaignId}/cohorts`
        );
        return data.data || {};
      } catch (error: any) {
        console.error('[Analytics] Cohort analysis fetch error:', {
          campaignId,
          error: error.message,
        });
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (cohorts change slowly)
    gcTime: 60 * 60 * 1000, // 60 minutes
    enabled: !!campaignId,
  });
}

/**
 * Hook: Combined Analytics Data
 * 
 * Fetches all analytics data at once with parallel requests
 * 
 * @param campaignId - Campaign ID
 * @param period - Time period
 * @param days - Number of days
 */
export function useCombinedAnalytics(
  campaignId: string,
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  days: number = 30
) {
  const timeSeries = useTimeSeriesAnalytics(campaignId, period, days);
  const trends = useTrendAnalytics(campaignId, days);
  const predictions = usePredictiveAnalytics(campaignId, 14);
  const cohorts = useCohortAnalytics(campaignId);

  return {
    timeSeries,
    trends,
    predictions,
    cohorts,
    isLoading: timeSeries.isPending || trends.isPending,
    isError: timeSeries.isError || trends.isError,
    error: timeSeries.error || trends.error,
  };
}

/**
 * Hook: Export Campaign Analytics
 * 
 * Exports analytics data in specified format
 * 
 * @param campaignId - Campaign ID
 * @param format - Export format: 'csv', 'json', 'pdf'
 * @param startDate - Start date for export
 * @param endDate - End date for export
 */
export function useExportAnalytics(
  campaignId: string,
  format: 'csv' | 'json' | 'pdf' = 'csv',
  startDate?: string,
  endDate?: string
) {
  return async () => {
    try {
      const response = await apiClient.get(
        `/analytics/export`,
        {
          params: {
            campaignId,
            format,
            startDate,
            endDate,
          },
          responseType: format === 'pdf' ? 'blob' : 'json',
        }
      );

      // Handle file download
      if (format === 'pdf' || format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          `campaign-analytics-${campaignId}-${new Date().toISOString().split('T')[0]}.${format}`
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      }

      return response.data;
    } catch (error: any) {
      console.error('[Analytics] Export error:', {
        campaignId,
        format,
        error: error.message,
      });
      throw error;
    }
  };
}

export default {
  useTimeSeriesAnalytics,
  useTrendAnalytics,
  usePredictiveAnalytics,
  useCohortAnalytics,
  useCombinedAnalytics,
  useExportAnalytics,
};
