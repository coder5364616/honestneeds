'use client'

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { messagingService } from '@/api/services/messagingService'
import type {
  Conversation,
  Message,
  Paginated,
  StartConversationPayload,
  SendMessagePayload,
  ListConversationsFilters,
} from '@/types/messaging'

/**
 * React Query hooks for the direct messaging system.
 * Conventions match existing hooks (key factories, staleTime, invalidation).
 */

export const messageKeys = {
  all: ['messages'] as const,
  conversations: (f?: ListConversationsFilters) =>
    [...messageKeys.all, 'conversations', f ?? {}] as const,
  conversation: (id: string) => [...messageKeys.all, 'conversation', id] as const,
  thread: (id: string) => [...messageKeys.all, 'thread', id] as const,
  unread: () => [...messageKeys.all, 'unread-count'] as const,
}

const THREAD_PAGE_SIZE = 50

/* ----------------------------- queries ----------------------------- */

export function useConversations(filters: ListConversationsFilters = {}) {
  return useQuery({
    queryKey: messageKeys.conversations(filters),
    queryFn: () => messagingService.listConversations(filters),
    staleTime: 30 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}

export function useConversation(conversationId?: string) {
  return useQuery({
    queryKey: messageKeys.conversation(conversationId ?? ''),
    queryFn: () => messagingService.getConversation(conversationId as string),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  })
}

/**
 * Infinite (paginated) message thread. Server returns newest-first pages;
 * the UI flattens + reverses for chronological rendering.
 */
export function useMessageThread(conversationId?: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.thread(conversationId ?? ''),
    queryFn: ({ pageParam = 1 }) =>
      messagingService.listMessages(conversationId as string, {
        page: pageParam as number,
        limit: THREAD_PAGE_SIZE,
      }),
    enabled: !!conversationId,
    initialPageParam: 1,
    getNextPageParam: (lastPage: Paginated<Message>) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    staleTime: 15 * 1000,
  })
}

export function useUnreadMessageCount() {
  return useQuery({
    queryKey: messageKeys.unread(),
    queryFn: () => messagingService.getUnreadCount(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

/* ---------------------------- mutations ---------------------------- */

export function useUploadAttachment() {
  return useMutation({
    mutationFn: (file: File) => messagingService.uploadAttachment(file),
  })
}

export function useStartConversation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StartConversationPayload) =>
      messagingService.startConversation(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messageKeys.all })
    },
  })
}

/**
 * Send a message with optimistic insertion into the infinite thread cache.
 * Rolls back on error and reconciles on settle.
 */
export function useSendMessage(conversationId: string, currentUserId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      messagingService.sendMessage(conversationId, payload),

    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: messageKeys.thread(conversationId) })
      const previous = qc.getQueryData(messageKeys.thread(conversationId))

      const tempId = `temp-${Date.now()}`
      const optimistic: Message = {
        message_id: tempId,
        _tempId: tempId,
        _status: 'sending',
        conversation_id: conversationId,
        sender_id: currentUserId,
        recipient_id: '',
        body: payload.body ?? '',
        attachments: payload.attachments ?? [],
        is_system: false,
        delivered: false,
        read: false,
        edited: false,
        created_at: new Date().toISOString(),
      }

      qc.setQueryData(messageKeys.thread(conversationId), (old: any) => {
        if (!old) {
          return {
            pageParams: [1],
            pages: [
              {
                data: [optimistic],
                pagination: { page: 1, limit: THREAD_PAGE_SIZE, total: 1, totalPages: 1, hasMore: false },
              },
            ],
          }
        }
        // newest-first: prepend to the first page
        const pages = [...old.pages]
        pages[0] = { ...pages[0], data: [optimistic, ...pages[0].data] }
        return { ...old, pages }
      })

      return { previous, tempId }
    },

    onError: (_err, _payload, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(messageKeys.thread(conversationId), ctx.previous)
      }
    },

    onSuccess: (real, _payload, ctx) => {
      // Replace the optimistic temp message with the server message
      qc.setQueryData(messageKeys.thread(conversationId), (old: any) => {
        if (!old) return old
        const pages = old.pages.map((p: Paginated<Message>) => ({
          ...p,
          data: p.data.map((m) =>
            m._tempId === ctx?.tempId ? { ...real, _status: 'sent' as const } : m
          ),
        }))
        return { ...old, pages }
      })
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: messageKeys.conversations() })
      qc.invalidateQueries({ queryKey: messageKeys.unread() })
    },
  })
}

export function useMarkConversationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messagingService.markRead(conversationId),
    onMutate: async (conversationId) => {
      // Optimistically zero the unread badge on the cached conversation lists
      const snapshots = qc.getQueriesData<Paginated<Conversation>>({
        queryKey: messageKeys.conversations(),
      })
      snapshots.forEach(([key, value]) => {
        if (!value) return
        qc.setQueryData(key, {
          ...value,
          data: value.data.map((c) =>
            c.conversation_id === conversationId || c.id === conversationId
              ? { ...c, unread_count: 0 }
              : c
          ),
        })
      })
      return { snapshots }
    },
    onError: (_e, _v, ctx) => {
      ctx?.snapshots?.forEach(([key, value]) => qc.setQueryData(key, value))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: messageKeys.unread() })
    },
  })
}

export function useConversationActions() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: messageKeys.all })

  const archive = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      messagingService.setArchived(id, archived),
    onSuccess: invalidate,
  })
  const mute = useMutation({
    mutationFn: ({ id, muted }: { id: string; muted: boolean }) =>
      messagingService.setMuted(id, muted),
    onSuccess: invalidate,
  })
  const block = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      messagingService.setBlocked(id, blocked),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => messagingService.deleteConversation(id),
    onSuccess: invalidate,
  })

  return { archive, mute, block, remove }
}

export function useMessageActions(conversationId: string) {
  const qc = useQueryClient()
  const invalidateThread = () =>
    qc.invalidateQueries({ queryKey: messageKeys.thread(conversationId) })

  const edit = useMutation({
    mutationFn: ({ messageId, body }: { messageId: string; body: string }) =>
      messagingService.editMessage(messageId, body),
    onSuccess: invalidateThread,
  })
  const remove = useMutation({
    mutationFn: ({ messageId, forEveryone }: { messageId: string; forEveryone?: boolean }) =>
      messagingService.deleteMessage(messageId, forEveryone),
    onSuccess: invalidateThread,
  })

  return { edit, remove }
}
