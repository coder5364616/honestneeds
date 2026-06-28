import { apiClient } from '@/lib/api'
import { AxiosError } from 'axios'

/**
 * Campaign Comments & Encouragement Service (CA-15)
 * Talks to the backend endpoints mounted under /campaigns/:id/comments
 */

export type CommentType = 'comment' | 'encouragement'

export type EncouragementKey =
  | 'praying_for_you'
  | 'stay_strong'
  | 'you_got_this'
  | 'sending_love'
  | 'we_are_with_you'
  | 'keep_going'

export interface CampaignComment {
  _id: string
  comment_id: string
  campaign_id: string
  user_id: string
  author_name: string
  author_avatar_url?: string
  parent_id: string | null
  comment_type: CommentType
  encouragement_key: EncouragementKey | null
  content?: string
  is_anonymous: boolean
  is_creator: boolean
  like_count: number
  reply_count: number
  liked_by_me?: boolean
  status: 'visible' | 'hidden' | 'flagged'
  created_at: string
  updated_at: string
}

export interface CommentsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface CommentListResult {
  comments: CampaignComment[]
  pagination: CommentsPagination
}

export interface CreateCommentPayload {
  content?: string
  parent_id?: string | null
  comment_type?: CommentType
  encouragement_key?: EncouragementKey
  is_anonymous?: boolean
}

export interface ListCommentsParams {
  page?: number
  limit?: number
  sort?: 'newest' | 'oldest' | 'most_liked'
  type?: CommentType
}

export const ENCOURAGEMENT_OPTIONS: { key: EncouragementKey; emoji: string; label: string }[] = [
  { key: 'praying_for_you', emoji: '🙏', label: 'Praying for you' },
  { key: 'stay_strong', emoji: '💪', label: 'Stay strong' },
  { key: 'you_got_this', emoji: '✨', label: 'You got this' },
  { key: 'sending_love', emoji: '❤️', label: 'Sending love' },
  { key: 'we_are_with_you', emoji: '🤝', label: 'We are with you' },
  { key: 'keep_going', emoji: '🔥', label: 'Keep going' },
]

export const campaignCommentService = {
  async listComments(campaignId: string, params: ListCommentsParams = {}): Promise<CommentListResult> {
    try {
      const response = await apiClient.get<{
        success: boolean
        data: CampaignComment[]
        pagination: CommentsPagination
      }>(`/campaigns/${campaignId}/comments`, { params })
      return {
        comments: response.data?.data || [],
        pagination:
          response.data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false },
      }
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        return { comments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } }
      }
      console.error('Failed to fetch campaign comments:', error)
      return { comments: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false } }
    }
  },

  async listReplies(campaignId: string, commentId: string, page = 1, limit = 20): Promise<CampaignComment[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: CampaignComment[] }>(
        `/campaigns/${campaignId}/comments/${commentId}/replies`,
        { params: { page, limit } }
      )
      return response.data?.data || []
    } catch (error) {
      console.error('Failed to fetch comment replies:', error)
      return []
    }
  },

  async createComment(campaignId: string, payload: CreateCommentPayload): Promise<CampaignComment> {
    const response = await apiClient.post<{ success: boolean; data: CampaignComment }>(
      `/campaigns/${campaignId}/comments`,
      payload
    )
    return response.data.data
  },

  async updateComment(campaignId: string, commentId: string, content: string): Promise<CampaignComment> {
    const response = await apiClient.patch<{ success: boolean; data: CampaignComment }>(
      `/campaigns/${campaignId}/comments/${commentId}`,
      { content }
    )
    return response.data.data
  },

  async deleteComment(campaignId: string, commentId: string): Promise<void> {
    await apiClient.delete(`/campaigns/${campaignId}/comments/${commentId}`)
  },

  async toggleLike(
    campaignId: string,
    commentId: string
  ): Promise<{ liked: boolean; like_count: number }> {
    const response = await apiClient.post<{
      success: boolean
      data: { liked: boolean; like_count: number }
    }>(`/campaigns/${campaignId}/comments/${commentId}/like`)
    return response.data.data
  },

  async reportComment(
    campaignId: string,
    commentId: string
  ): Promise<{ report_count: number; status: string }> {
    const response = await apiClient.post<{
      success: boolean
      data: { report_count: number; status: string }
    }>(`/campaigns/${campaignId}/comments/${commentId}/report`)
    return response.data.data
  },
}
