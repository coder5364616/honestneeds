/**
 * Conversion Tracking Hooks
 * Handles recording conversions and fetching conversion analytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// ===== Services =====

class ConversionTrackingService {
  /**
   * Record a conversion event
   * Called when visitor who came from referral link completes action
   */
  static async recordConversion(campaignId: string, params: {
    ref: string; // referral code
    conversionType: 'donation' | 'signup' | 'form_submission' | 'purchase';
    conversionValue: number; // cents (0 if non-monetary)
    metadata?: Record<string, unknown>;
  }) {
    const response = await apiClient.post(
      `/campaigns/${campaignId}/conversion`,
      params
    );
    return response.data;
  }

  /**
   * Get conversion analytics for campaign
   */
  static async getCampaignConversionAnalytics(campaignId: string) {
    const response = await apiClient.get(
      `/campaigns/${campaignId}/analytics/conversions`
    );
    return response.data;
  }

  /**
   * Get conversion analytics for specific share
   */
  static async getShareConversionAnalytics(shareId: string) {
    const response = await apiClient.get(
      `/shares/${shareId}/analytics`
    );
    return response.data;
  }

  /**
   * Get supporter's conversion analytics (all shares)
   * Tries primary endpoint first, falls back to referral-performance
   */
  static async getSupporterConversionAnalytics() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    console.log('🔄 [ConversionTrackingService] getSupporterConversionAnalytics called', {
      hasToken: !!token,
      tokenKey: 'auth_token',
      apiBase: apiClient.defaults.baseURL,
    });

    if (!token) {
      console.warn('⚠️ [ConversionTrackingService] No auth_token in localStorage');
      throw new Error('No authentication token available');
    }

    try {
      console.log('🔄 [ConversionTrackingService] Using apiClient to call /user/conversion-analytics');
      
      const response = await apiClient.get('/user/conversion-analytics');
      
      console.log('✅ [ConversionTrackingService] Primary endpoint succeeded:', response.data);
      return response.data;
    } catch (primaryError: any) {
      console.warn('⚠️ [ConversionTrackingService] Primary endpoint failed, trying fallback:', {
        status: primaryError.response?.status,
        message: primaryError.message,
      });

      try {
        // Fallback to referral-performance endpoint using apiClient
        console.log('🔄 [ConversionTrackingService] Using apiClient to call /user/referral-performance');
        
        const fallbackResponse = await apiClient.get('/user/referral-performance');
        
        console.log('✅ [ConversionTrackingService] Fallback endpoint succeeded:', fallbackResponse.data);
        
        // Transform referral-performance data to match conversion analytics structure
        const transformedData = {
          success: true,
          data: {
            total_clicks: fallbackResponse.data.totalReferrals || 0,
            total_conversions: fallbackResponse.data.totalConversions || 0,
            conversion_rate: fallbackResponse.data.conversionRate || 0,
            total_revenue: fallbackResponse.data.totalRewardEarned || 0,
            shares_by_channel: fallbackResponse.data.sharesByChannel || {},
          }
        };
        
        console.log('✅ [ConversionTrackingService] Data transformed:', transformedData);
        return transformedData;
      } catch (fallbackError: any) {
        console.error('❌ [ConversionTrackingService] Both endpoints failed:', {
          primary: primaryError.message,
          fallback: fallbackError.message,
        });
        throw fallbackError;
      }
    }
  }
}

// ===== HOOKS =====

/**
 * Hook: Record a conversion
 * Returns mutation to record conversion and handle success/error
 */
export function useRecordConversion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      campaignId: string;
      ref: string;
      conversionType: 'donation' | 'signup' | 'form_submission' | 'purchase';
      conversionValue: number;
      metadata?: Record<string, unknown>;
    }) => {
      const { campaignId, ...rest } = params;
      return ConversionTrackingService.recordConversion(campaignId, rest);
    },
    onSuccess: (data) => {
      // Invalidate related queries to get fresh data
      queryClient.invalidateQueries({ queryKey: ['campaign', 'conversions'] });
      queryClient.invalidateQueries({ queryKey: ['share', 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['supporter', 'conversions'] });
    },
  });
}

/**
 * Hook: Get campaign conversion analytics
 * @param campaignId - Campaign ID
 * @param enabled - Whether to fetch (useful for conditional queries)
 */
export function useCampaignConversionAnalytics(
  campaignId: string,
  enabled: boolean = true
) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return useQuery({
    queryKey: ['campaign', campaignId, 'conversions'],
    queryFn: () => ConversionTrackingService.getCampaignConversionAnalytics(campaignId),
    enabled: (enabled && !!campaignId && !!token), // Only run if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook: Get share conversion analytics
 * @param shareId - Share ID (format: SHARE-YYYY-XXXXXX)
 */
export function useShareConversionAnalytics(shareId: string) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  return useQuery({
    queryKey: ['share', shareId, 'analytics'],
    queryFn: () => ConversionTrackingService.getShareConversionAnalytics(shareId),
    enabled: (!!shareId && !!token), // Only run if token exists
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook: Get supporter's conversion analytics
 * Aggregated across all shares
 */
export function useSupporterConversionAnalytics() {
  console.log('🔍 [useSupporterConversionAnalytics] Hook initialized');
  
  return useQuery({
    queryKey: ['supporter', 'conversion-analytics'],
    queryFn: async () => {
      console.log('🔄 [useSupporterConversionAnalytics] queryFn executing...');
      try {
        const result = await ConversionTrackingService.getSupporterConversionAnalytics();
        console.log('✅ [useSupporterConversionAnalytics] queryFn result:', result);
        return result;
      } catch (error: any) {
        console.error('❌ [useSupporterConversionAnalytics] queryFn error:', error.message);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
  });
}

/**
 * Hook: Record conversion and handle in UI
 * Combines recording + analytics refresh
 */
export function useConversionFlow() {
  const recordMutation = useRecordConversion();
  const queryClient = useQueryClient();

  return {
    recordConversion: async (params: {
      campaignId: string;
      ref: string;
      conversionType: 'donation' | 'signup' | 'form_submission' | 'purchase';
      conversionValue: number;
      metadata?: Record<string, unknown>;
    }) => {
      try {
        const result = await recordMutation.mutateAsync(params);

        if (result.success && result.conversion_recorded) {
          // Success - refresh all related data
          await queryClient.invalidateQueries({ queryKey: ['supporter', 'shares'] });
          await queryClient.invalidateQueries({ queryKey: ['campaign', params.campaignId] });
          
          return {
            success: true,
            message: result.data?.reward_applied
              ? `Conversion recorded! Earned $${(result.data?.reward_amount / 100).toFixed(2)}`
              : 'Conversion recorded successfully!',
            data: result.data,
          };
        } else {
          return {
            success: true,
            message: 'Conversion attributed (no reward)',
            data: result.data,
          };
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to record conversion',
          error,
        };
      }
    },
    isLoading: recordMutation.isPending,
    isError: recordMutation.isError,
    error: recordMutation.error,
  };
}

export default ConversionTrackingService;
