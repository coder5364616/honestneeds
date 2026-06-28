'use client'

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { notificationService } from '@/api/services/notificationService'
import type { NotificationPreferences } from '@/types/messaging'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filter?: string) => [...notificationKeys.all, 'list', filter ?? 'all'] as const,
  infinite: (filter?: string) =>
    [...notificationKeys.all, 'infinite', filter ?? 'all'] as const,
  unread: () => [...notificationKeys.all, 'unread-count'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
}

const PAGE_SIZE = 20

/**
 * Offset-paginated notification feed for the full Notifications page.
 * The backend `/activity` endpoint accepts `limit` + `offset`.
 */
export function useNotificationsInfinite(filter?: string) {
  return useInfiniteQuery({
    queryKey: notificationKeys.infinite(filter),
    queryFn: ({ pageParam = 0 }) =>
      notificationService.list({ limit: PAGE_SIZE, offset: pageParam as number, filter }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.items.length === PAGE_SIZE ? allPages.length * PAGE_SIZE : undefined,
    staleTime: 30 * 1000,
  })
}

export function useNotificationFeed(filter?: string, limit = 20) {
  return useQuery({
    queryKey: notificationKeys.list(filter),
    queryFn: () => notificationService.list({ limit, filter }),
    staleTime: 30 * 1000,
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unread(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useArchiveNotification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationService.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationService.getPreferences(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      notificationService.updatePreferences(prefs),
    onSuccess: (data) => {
      qc.setQueryData(notificationKeys.preferences(), data)
    },
  })
}
