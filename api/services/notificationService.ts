import { apiClient } from '@/lib/api'
import type { AppNotification, NotificationPreferences } from '@/types/messaging'

/**
 * Notification Service
 * Wraps `/api/notifications`. The backend currently serves the feed via
 * ActivityFeedService (`/activity`); we normalize it to `AppNotification`.
 *
 * NOTE (gap G3): a typed `Notification` list endpoint is requested from
 * backend. Until then `/activity` is the source for the dropdown/page.
 */

interface Envelope<T> {
  success: boolean
  message?: string
  data: T
  unreadCount?: number
  pagination?: { limit: number; offset: number; total: number }
}

function normalize(raw: any): AppNotification {
  return {
    id: raw.id ?? raw._id,
    type: raw.type ?? 'system_alert',
    title: raw.title ?? '',
    message: raw.message ?? raw.body ?? '',
    data: raw.data,
    action_url: raw.action_url ?? raw.actionUrl ?? null,
    icon_emoji: raw.icon_emoji ?? raw.icon ?? '🔔',
    color: raw.color ?? 'primary',
    read: raw.read ?? raw.is_read ?? false,
    read_at: raw.read_at ?? null,
    created_at: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  }
}

export const notificationService = {
  /** Paginated notification feed. */
  async list(
    params: { limit?: number; offset?: number; filter?: string } = {}
  ): Promise<{ items: AppNotification[]; unreadCount: number }> {
    const res = await apiClient.get<Envelope<any[]>>('/notifications/activity', { params })
    return {
      items: (res.data.data ?? []).map(normalize),
      unreadCount: res.data.unreadCount ?? 0,
    }
  },

  /** Unread notification count. */
  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<{ success: boolean; unreadCount: number }>(
      '/notifications/unread-count'
    )
    return res.data.unreadCount ?? 0
  },

  /** Mark a single notification as read. */
  async markRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/activity/${id}/read`)
  },

  /** Mark all notifications as read. */
  async markAllRead(): Promise<void> {
    await apiClient.post('/notifications/activity/read-all')
  },

  /** Archive a notification. */
  async archive(id: string): Promise<void> {
    await apiClient.post(`/notifications/activity/${id}/archive`)
  },

  /** Fetch notification preferences. */
  async getPreferences(): Promise<NotificationPreferences> {
    const res = await apiClient.get<Envelope<NotificationPreferences>>(
      '/notifications/preferences'
    )
    return res.data.data
  },

  /** Update notification preferences. */
  async updatePreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const res = await apiClient.post<Envelope<NotificationPreferences>>(
      '/notifications/preferences',
      { preferences }
    )
    return res.data.data
  },
}
