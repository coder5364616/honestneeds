import { apiClient } from '@/lib/api'
import { CreateBoostSessionInput, BoostResponse, BoostSessionResponse } from '@/utils/boostValidationSchemas'

/**
 * Boost Service
 * Handles all boost-related API calls
 * Integrated with Next.js frontend
 *
 * Uses the shared apiClient so auth-token injection and silent token
 * refresh/retry are handled centrally (see lib/api.ts).
 */

class BoostService {
  /**
   * Get available boost tiers
   */
  async getBoostTiers() {
    try {
      const response = await apiClient.get('/boosts/tiers');
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch boost tiers',
      };
    }
  }

  /**
   * Create a checkout session for boost purchase
   */
  async createCheckoutSession(data: CreateBoostSessionInput) {
    try {
      const response = await apiClient.post<any>('/boosts/create-session', {
        campaign_id: data.campaign_id,
        tier: data.tier,
      });

      return {
        success: true,
        data: response.data.data as BoostSessionResponse,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create checkout session',
      };
    }
  }

  /**
   * Get boost details for a specific campaign
   */
  async getCampaignBoost(campaignId: string) {
    try {
      const response = await apiClient.get<any>(`/boosts/campaign/${campaignId}`);
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch campaign boost',
      };
    }
  }

  /**
   * Get all active boosts for the current user
   */
  async getCreatorBoosts(page: number = 1, limit: number = 10) {
    try {
      const response = await apiClient.get<any>('/boosts/my-boosts', {
        params: { page, limit },
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch your boosts',
      };
    }
  }

  /**
   * Extend an active boost for additional 30 days
   */
  async extendBoost(boostId: string) {
    try {
      const response = await apiClient.post<any>(`/boosts/${boostId}/extend`);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to extend boost',
      };
    }
  }

  /**
   * Cancel an active boost
   */
  async cancelBoost(boostId: string, reason?: string) {
    try {
      const response = await apiClient.post<any>(`/boosts/${boostId}/cancel`, {
        reason: reason || 'user_cancelled',
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel boost',
      };
    }
  }

  /**
   * Update boost statistics (internal)
   */
  async updateBoostStats(boostId: string, views: number, engagement: number, conversions: number) {
    try {
      const response = await apiClient.post<any>(`/boosts/${boostId}/update-stats`, {
        views,
        engagement,
        conversions,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update boost stats',
      };
    }
  }

  /**
   * Get Stripe checkout session status
   */
  async getSessionStatus(sessionId: string) {
    try {
      const response = await apiClient.get<any>(`/boosts/session/${sessionId}/status`);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch session status',
      };
    }
  }
}

export default new BoostService();
