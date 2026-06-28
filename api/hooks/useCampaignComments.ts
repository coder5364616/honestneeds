'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  campaignCommentService,
  CampaignComment,
  CreateCommentPayload,
  ListCommentsParams,
} from '@/api/services/campaignCommentService'

const COMMENT_KEYS = {
  all: ['campaignComments'] as const,
  list: (campaignId: string, params?: ListCommentsParams) =>
    [...COMMENT_KEYS.all, 'list', campaignId, params || {}] as const,
  replies: (campaignId: string, commentId: string) =>
    [...COMMENT_KEYS.all, 'replies', campaignId, commentId] as const,
}

/**
 * List top-level comments for a campaign.
 */
export const useCampaignComments = (campaignId: string, params: ListCommentsParams = {}) => {
  return useQuery({
    queryKey: COMMENT_KEYS.list(campaignId, params),
    queryFn: () => campaignCommentService.listComments(campaignId, params),
    enabled: !!campaignId,
    staleTime: 60 * 1000,
    retry: 1,
  })
}

/**
 * Replies for a single comment (lazy-loaded when a thread is expanded).
 */
export const useCommentReplies = (campaignId: string, commentId: string, enabled = false) => {
  return useQuery({
    queryKey: COMMENT_KEYS.replies(campaignId, commentId),
    queryFn: () => campaignCommentService.listReplies(campaignId, commentId),
    enabled: enabled && !!campaignId && !!commentId,
    staleTime: 60 * 1000,
  })
}

export const useCreateComment = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      campaignCommentService.createComment(campaignId, payload),
    onSuccess: (created: CampaignComment) => {
      queryClient.invalidateQueries({ queryKey: [...COMMENT_KEYS.all, 'list', campaignId] })
      if (created.parent_id) {
        queryClient.invalidateQueries({
          queryKey: COMMENT_KEYS.replies(campaignId, created.parent_id),
        })
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to post your message')
    },
  })
}

export const useUpdateComment = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      campaignCommentService.updateComment(campaignId, commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COMMENT_KEYS.all, 'list', campaignId] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to edit comment')
    },
  })
}

export const useDeleteComment = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => campaignCommentService.deleteComment(campaignId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COMMENT_KEYS.all, campaignId] })
      queryClient.invalidateQueries({ queryKey: [...COMMENT_KEYS.all, 'list', campaignId] })
      toast.success('Comment removed')
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete comment')
    },
  })
}

export const useToggleCommentLike = (campaignId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: string) => campaignCommentService.toggleLike(campaignId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...COMMENT_KEYS.all, 'list', campaignId] })
    },
  })
}

export const useReportComment = (campaignId: string) => {
  return useMutation({
    mutationFn: (commentId: string) => campaignCommentService.reportComment(campaignId, commentId),
    onSuccess: () => {
      toast.success('Reported. Thanks for keeping the community safe.')
    },
    onError: (err: any) => {
      const status = err?.response?.status
      if (status === 409) {
        toast.info('You have already reported this comment')
      } else {
        toast.error(err?.response?.data?.message || 'Failed to report comment')
      }
    },
  })
}
