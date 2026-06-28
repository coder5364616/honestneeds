'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'

interface BatchResponse {
  success: boolean
  updated: number
  errors?: Array<{
    campaignId: string
    error: string
  }>
  message?: string
}

/**
 * Hook for batch pause campaigns
 */
export function useBatchPauseCampaigns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const response = await apiClient.post<BatchResponse>(
        `/campaigns/batch/pause`,
        { campaignIds }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] })
    },
  })
}

/**
 * Hook for batch complete campaigns
 */
export function useBatchCompleteCampaigns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const response = await apiClient.post<BatchResponse>(
        `/campaigns/batch/complete`,
        { campaignIds }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] })
    },
  })
}

/**
 * Hook for batch delete campaigns
 */
export function useBatchDeleteCampaigns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const response = await apiClient.post<BatchResponse>(
        `/campaigns/batch/delete`,
        { campaignIds }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] })
    },
  })
}

/**
 * Hook for batch resume campaigns (reverse of pause)
 */
export function useBatchResumeCampaigns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const response = await apiClient.post<BatchResponse>(
        `/campaigns/batch/resume`,
        { campaignIds }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] })
    },
  })
}

/**
 * Hook for batch activate campaigns
 */
export function useBatchActivateCampaigns() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const response = await apiClient.post<BatchResponse>(
        `/campaigns/batch/activate`,
        { campaignIds }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] })
    },
  })
}
