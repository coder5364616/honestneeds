'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  campaignEngagementService,
  SetVideoPayload,
  UpdateShareBudgetPayload,
} from '@/api/services/campaignEngagementService'

const ENGAGEMENT_KEYS = {
  all: ['campaignEngagement'] as const,
  meters: (campaignId: string) => [...ENGAGEMENT_KEYS.all, 'meters', campaignId] as const,
  virality: (campaignId: string) => [...ENGAGEMENT_KEYS.all, 'virality', campaignId] as const,
  donorFeed: (campaignId: string) => [...ENGAGEMENT_KEYS.all, 'donorFeed', campaignId] as const,
}

/** CA-12 — Multi-meter system */
export const useCampaignMeters = (campaignId: string) => {
  return useQuery({
    queryKey: ENGAGEMENT_KEYS.meters(campaignId),
    queryFn: () => campaignEngagementService.getMeters(campaignId),
    enabled: !!campaignId,
    staleTime: 60 * 1000,
    retry: 1,
  })
}

/** CA-13 — Crowdfunded virality (creator-facing) */
export const useCampaignVirality = (campaignId: string, enabled = true) => {
  return useQuery({
    queryKey: ENGAGEMENT_KEYS.virality(campaignId),
    queryFn: () => campaignEngagementService.getVirality(campaignId),
    enabled: enabled && !!campaignId,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}

/** CA-18 — Social proof / donor feed */
export const useDonorFeed = (campaignId: string, limit = 20) => {
  return useQuery({
    queryKey: ENGAGEMENT_KEYS.donorFeed(campaignId),
    queryFn: () => campaignEngagementService.getDonorFeed(campaignId, limit),
    enabled: !!campaignId,
    staleTime: 30 * 1000,
    retry: 1,
  })
}

/** CA-17 — Set/replace campaign video */
export const useSetCampaignVideo = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SetVideoPayload) =>
      campaignEngagementService.setVideo(campaignId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId] })
      toast.success('Campaign video saved')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to save video')
    },
  })
}

/** CA-17 — Remove campaign video */
export const useRemoveCampaignVideo = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => campaignEngagementService.removeVideo(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', campaignId] })
      toast.success('Video removed')
    },
  })
}

/** CA-08 — Update share budget */
export const useUpdateShareBudget = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateShareBudgetPayload) =>
      campaignEngagementService.updateShareBudget(campaignId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ENGAGEMENT_KEYS.meters(campaignId) })
      toast.success('Share budget updated')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update share budget')
    },
  })
}
