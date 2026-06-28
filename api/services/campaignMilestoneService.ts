import { apiClient } from '@/lib/api'
import { AxiosError } from 'axios'

/**
 * Campaign Milestone Service (CA-19)
 * Endpoints mounted under /campaigns/:id/milestones
 */

export type MilestoneMeterType = 'funding' | 'sharing' | 'prayer' | 'donors' | 'custom'

export interface CampaignMilestone {
  _id: string
  milestone_id: string
  campaign_id: string
  meter_type: MilestoneMeterType
  percentage?: number
  value_at_reached: number
  goal_at_reached: number
  title: string
  message?: string
  source: 'auto' | 'manual'
  celebration_emoji: string
  is_celebrated: boolean
  reached_at: string
  created_at: string
}

export interface CreateMilestonePayload {
  title: string
  message?: string
  celebration_emoji?: string
}

export const campaignMilestoneService = {
  async listMilestones(campaignId: string, limit = 50): Promise<CampaignMilestone[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CampaignMilestone[] }>(
        `/campaigns/${campaignId}/milestones`,
        { params: { limit } }
      )
      return response.data?.data || []
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) return []
      console.error('Failed to fetch campaign milestones:', error)
      return []
    }
  },

  async createMilestone(campaignId: string, payload: CreateMilestonePayload): Promise<CampaignMilestone> {
    const response = await apiClient.post<{ success: boolean; data: CampaignMilestone }>(
      `/campaigns/${campaignId}/milestones`,
      payload
    )
    return response.data.data
  },

  /** Trigger recomputation of auto milestones (creator only). Returns any newly reached. */
  async checkMilestones(campaignId: string): Promise<CampaignMilestone[]> {
    const response = await apiClient.post<{ success: boolean; data: CampaignMilestone[] }>(
      `/campaigns/${campaignId}/milestones/check`
    )
    return response.data?.data || []
  },

  async deleteMilestone(campaignId: string, milestoneId: string): Promise<void> {
    await apiClient.delete(`/campaigns/${campaignId}/milestones/${milestoneId}`)
  },
}
