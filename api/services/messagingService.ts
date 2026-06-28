import { apiClient } from '@/lib/api'
import type {
  Conversation,
  Message,
  MessageAttachment,
  Paginated,
  StartConversationPayload,
  SendMessagePayload,
  ListConversationsFilters,
  ListMessagesParams,
} from '@/types/messaging'

/**
 * Messaging Service
 * Thin typed wrapper over the backend direct-messaging API (`/api/messages`).
 * Every endpoint returns the standard `{ success, message, data, pagination }`
 * envelope; we unwrap to the useful payload to match existing services.
 */

interface Envelope<T> {
  success: boolean
  message?: string
  data: T
  pagination?: Paginated<unknown>['pagination']
}

export const messagingService = {
  /** Start (or fetch existing) conversation; optionally send the first message. */
  async startConversation(
    payload: StartConversationPayload
  ): Promise<{ conversation: Conversation; sent_message: Message | null }> {
    const res = await apiClient.post<
      Envelope<{ conversation: Conversation; sent_message: Message | null }>
    >('/messages/conversations', payload)
    return res.data.data
  },

  /** List the current user's conversations. */
  async listConversations(
    filters: ListConversationsFilters = {}
  ): Promise<Paginated<Conversation>> {
    const res = await apiClient.get<Envelope<Conversation[]>>('/messages/conversations', {
      params: filters,
    })
    return {
      data: res.data.data ?? [],
      pagination: res.data.pagination ?? {
        page: 1,
        limit: filters.limit ?? 25,
        total: res.data.data?.length ?? 0,
        totalPages: 1,
        hasMore: false,
      },
    }
  },

  /** Get a single conversation's detail. */
  async getConversation(conversationId: string): Promise<Conversation> {
    const res = await apiClient.get<Envelope<Conversation>>(
      `/messages/conversations/${conversationId}`
    )
    return res.data.data
  },

  /** List messages in a conversation (server returns newest-first). */
  async listMessages(
    conversationId: string,
    params: ListMessagesParams = {}
  ): Promise<Paginated<Message>> {
    const res = await apiClient.get<Envelope<Message[]>>(
      `/messages/conversations/${conversationId}/messages`,
      { params }
    )
    return {
      data: res.data.data ?? [],
      pagination: res.data.pagination ?? {
        page: 1,
        limit: params.limit ?? 50,
        total: res.data.data?.length ?? 0,
        totalPages: 1,
        hasMore: false,
      },
    }
  },

  /** Send a message in an existing conversation. */
  async sendMessage(conversationId: string, payload: SendMessagePayload): Promise<Message> {
    const res = await apiClient.post<Envelope<Message>>(
      `/messages/conversations/${conversationId}/messages`,
      payload
    )
    return res.data.data
  },

  /** Mark a conversation as read. */
  async markRead(conversationId: string): Promise<{ marked: number }> {
    const res = await apiClient.patch<Envelope<{ marked: number }>>(
      `/messages/conversations/${conversationId}/read`
    )
    return res.data.data
  },

  /** Archive / unarchive a conversation for the current user. */
  async setArchived(conversationId: string, archived: boolean): Promise<{ archived: boolean }> {
    const res = await apiClient.patch<Envelope<{ archived: boolean }>>(
      `/messages/conversations/${conversationId}/archive`,
      { archived }
    )
    return res.data.data
  },

  /** Mute / unmute notifications for a conversation. */
  async setMuted(conversationId: string, muted: boolean): Promise<{ muted: boolean }> {
    const res = await apiClient.patch<Envelope<{ muted: boolean }>>(
      `/messages/conversations/${conversationId}/mute`,
      { muted }
    )
    return res.data.data
  },

  /** Block / unblock the other participant. */
  async setBlocked(
    conversationId: string,
    blocked: boolean
  ): Promise<{ blocked: boolean; conversation_status: string }> {
    const res = await apiClient.patch<
      Envelope<{ blocked: boolean; conversation_status: string }>
    >(`/messages/conversations/${conversationId}/block`, { blocked })
    return res.data.data
  },

  /** Soft-delete (hide) a conversation for the current user. */
  async deleteConversation(conversationId: string): Promise<{ deleted: boolean }> {
    const res = await apiClient.delete<Envelope<{ deleted: boolean }>>(
      `/messages/conversations/${conversationId}`
    )
    return res.data.data
  },

  /** Edit a message (sender only). */
  async editMessage(messageId: string, body: string): Promise<Message> {
    const res = await apiClient.patch<Envelope<Message>>(`/messages/messages/${messageId}`, {
      body,
    })
    return res.data.data
  },

  /** Delete a message; `forEveryone` hard-deletes (sender only). */
  async deleteMessage(
    messageId: string,
    forEveryone = false
  ): Promise<{ deleted: boolean; scope: string }> {
    const res = await apiClient.delete<Envelope<{ deleted: boolean; scope: string }>>(
      `/messages/messages/${messageId}`,
      { params: forEveryone ? { scope: 'everyone' } : {} }
    )
    return res.data.data
  },

  /**
   * Upload an image attachment. Returns a MessageAttachment to include in a
   * subsequent sendMessage call. Backend expects multipart field name "image".
   */
  async uploadAttachment(file: File): Promise<MessageAttachment> {
    const form = new FormData()
    form.append('image', file)
    const res = await apiClient.post<Envelope<MessageAttachment>>(
      '/messages/attachments',
      form
    )
    return res.data.data
  },

  /** Total unread message count across all conversations. */
  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<Envelope<{ unread_count: number }>>(
      '/messages/unread-count'
    )
    return res.data.data?.unread_count ?? 0
  },
}
