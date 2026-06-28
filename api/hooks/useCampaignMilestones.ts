'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  campaignMilestoneService,
  CreateMilestonePayload,
} from '@/api/services/campaignMilestoneService'

const MILESTONE_KEYS = {
  all: ['campaignMilestones'] as const,
  list: (campaignId: string) => [...MILESTONE_KEYS.all, 'list', campaignId] as const,
}

export const useCampaignMilestones = (campaignId: string, limit = 50) => {
  return useQuery({
    queryKey: MILESTONE_KEYS.list(campaignId),
    queryFn: () => campaignMilestoneService.listMilestones(campaignId, limit),
    enabled: !!campaignId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

export const useCreateMilestone = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateMilestonePayload) =>
      campaignMilestoneService.createMilestone(campaignId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MILESTONE_KEYS.list(campaignId) })
      toast.success('Milestone added 🎉')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add milestone')
    },
  })
}

export const useCheckMilestones = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => campaignMilestoneService.checkMilestones(campaignId),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: MILESTONE_KEYS.list(campaignId) })
      if (created.length > 0) {
        toast.success(`${created.length} new milestone${created.length > 1 ? 's' : ''} reached!`)
      } else {
        toast.info('No new milestones yet')
      }
    },
  })
}

export const useDeleteMilestone = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (milestoneId: string) =>
      campaignMilestoneService.deleteMilestone(campaignId, milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MILESTONE_KEYS.list(campaignId) })
    },
  })
}
