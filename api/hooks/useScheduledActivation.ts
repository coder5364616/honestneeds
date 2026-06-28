/**
 * useScheduledActivation.ts
 * Custom hook for managing campaign scheduled activation
 * Provides mutation hooks for scheduling, rescheduling, and cancelling
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface ScheduleResponse {
  success: boolean
  data: {
    campaignId: string
    scheduledActivationAt: string
    jobId: string | number
    scheduleId: string
  }
}

interface ScheduledActivationStatus {
  scheduled: boolean
  campaignId?: string
  scheduledActivationAt?: string
  jobId?: string
  status?: string
  delayMs?: number
}

/**
 * Hook for scheduling a campaign activation
 */
export const useScheduleActivation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ campaignId, scheduledTime }: { campaignId: string; scheduledTime: Date }) => {
      const response = await apiClient.post<ScheduleResponse>(
        `/campaigns/${campaignId}/schedule-activation`,
        {
          scheduled_activation_at: scheduledTime.toISOString(),
        }
      )
      return response.data
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: ['campaign', data.data.campaignId],
        })
      },
    }
  )
}

/**
 * Hook for cancelling a scheduled activation
 */
export const useCancelScheduledActivation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async (campaignId: string) => {
      const response = await apiClient.delete(
        `/campaigns/${campaignId}/scheduled-activation`
      )
      return response.data
    },
    {
      onSuccess: (data, campaignId) => {
        queryClient.invalidateQueries({
          queryKey: ['campaign', campaignId],
        })
      },
    }
  )
}

/**
 * Hook for rescheduling a campaign activation
 */
export const useRescheduleActivation = () => {
  const queryClient = useQueryClient()

  return useMutation(
    async ({ campaignId, scheduledTime }: { campaignId: string; scheduledTime: Date }) => {
      const response = await apiClient.put(
        `/campaigns/${campaignId}/scheduled-activation`,
        {
          scheduled_activation_at: scheduledTime.toISOString(),
        }
      )
      return response.data
    },
    {
      onSuccess: (data, { campaignId }) => {
        queryClient.invalidateQueries({
          queryKey: ['campaign', campaignId],
        })
        queryClient.invalidateQueries({
          queryKey: ['scheduledActivation', campaignId],
        })
      },
    }
  )
}

/**
 * Hook for fetching scheduled activation status
 */
export const useGetScheduledActivation = (campaignId: string) => {
  return useQuery(
    ['scheduledActivation', campaignId],
    async () => {
      const response = await apiClient.get<{
        success: boolean
        data: ScheduledActivationStatus
      }>(`/campaigns/${campaignId}/scheduled-activation`)
      return response.data.data
    },
    {
      enabled: !!campaignId,
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
    }
  )
}

export default {
  useScheduleActivation,
  useCancelScheduledActivation,
  useRescheduleActivation,
  useGetScheduledActivation,
}
