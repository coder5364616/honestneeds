/**
 * Messaging & Notifications — shared types
 * Mirrors the backend response shapes from:
 *   - src/routes/messageRoutes.js / MessageController.js (shaped objects)
 *   - src/routes/notificationRoutes.js
 *   - src/websocket/NotificationService.js (realtime frames)
 */

export type ConversationContext = 'direct' | 'campaign' | 'volunteer' | 'sponsor'
export type ConversationStatus = 'active' | 'blocked' | 'closed'
export type AttachmentType = 'image' | 'file' | 'video' | 'audio'

/** Local-only lifecycle status for optimistic UI (never sent by the server). */
export type MessageDeliveryStatus = 'sending' | 'sent' | 'read' | 'failed'

export interface ParticipantSummary {
  _id: string
  display_name: string
  avatar_url?: string | null
  role?: string
}

export interface MessageAttachment {
  url: string
  type: AttachmentType
  name?: string | null
  size_bytes?: number | null
}

export interface LastMessagePreview {
  body: string | null
  sender_id: string | null
  sent_at: string | null
  is_system: boolean
}

/** Shaped conversation as returned by the backend for the current user. */
export interface Conversation {
  id: string
  conversation_id: string
  context_type: ConversationContext
  campaign: { _id?: string; title: string } | null
  subject: string | null
  status: ConversationStatus
  other_participant: ParticipantSummary | null
  last_message: LastMessagePreview | null
  message_count: number
  unread_count: number
  archived: boolean
  muted: boolean
  is_blocked: boolean
  created_at: string
  updated_at: string
}

export interface Message {
  message_id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  body: string
  attachments: MessageAttachment[]
  is_system: boolean
  delivered: boolean
  delivered_at?: string | null
  read: boolean
  read_at?: string | null
  edited: boolean
  edited_at?: string | null
  created_at: string
  updated_at?: string
  /** client-only — present on optimistic messages */
  _status?: MessageDeliveryStatus
  _tempId?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export interface Paginated<T> {
  data: T[]
  pagination: Pagination
}

/* ---------- request payloads ---------- */

export interface StartConversationPayload {
  recipient_id: string
  context_type?: ConversationContext
  campaign_id?: string | null
  subject?: string | null
  body?: string
  attachments?: MessageAttachment[]
}

export interface SendMessagePayload {
  body?: string
  attachments?: MessageAttachment[]
}

export interface ListConversationsFilters {
  page?: number
  limit?: number
  context_type?: ConversationContext
  unread_only?: boolean
  archived?: boolean
}

export interface ListMessagesParams {
  page?: number
  limit?: number
  before?: string
}

/* ---------- notifications ---------- */

export type NotificationType =
  // Prayer support
  | 'someone_prayed'
  | 'new_text_prayer'
  | 'new_voice_prayer'
  | 'new_video_prayer'
  | 'prayer_approved'
  | 'prayer_rejected'
  | 'prayer_flagged'
  | 'prayer_milestone'
  // Campaign lifecycle
  | 'goal_reached'
  | 'milestone_reached'
  | 'campaign_activated'
  | 'campaign_ended'
  | 'campaign_paused'
  // Donations & sponsorships
  | 'donation_received'
  | 'donation_made'
  | 'sponsorship_received'
  | 'sponsorship_approved'
  // Volunteer
  | 'volunteer_hours_verified'
  | 'volunteer_badge_earned'
  | 'volunteer_request'
  // Comments / social
  | 'comment_received'
  | 'comment_reply'
  // Share-to-earn
  | 'share_reward_owed'
  | 'share_reward_approved'
  | 'share_reward_rejected'
  | 'referral_converted'
  // Payouts
  | 'payout_requested'
  | 'payout_sent'
  | 'payout_received'
  | 'payout_reminder'
  | 'payout_cancelled'
  | 'payout_disputed'
  // Gamification
  | 'badge_earned'
  | 'level_up'
  | 'streak_milestone'
  | 'leaderboard_rank'
  // Messaging & system
  | 'new_message'
  | 'system_alert'
  | 'admin_message'

export type NotificationColor = 'primary' | 'success' | 'warning' | 'danger' | 'info'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  action_url?: string | null
  icon_emoji?: string
  color?: NotificationColor
  read: boolean
  read_at?: string | null
  created_at: string
}

/**
 * Server-persisted notification preferences. Mirrors the backend
 * `NotificationPreferences` model (src/models/NotificationPreferences.js).
 * These control DELIVERY (channels / per-type / quiet hours). Client-only UX
 * settings (sound, browser-toggle, volume) live in NotificationPreferencesContext.
 */
export interface NotificationTypePref {
  enabled: boolean
  channels?: Array<'email' | 'in_app' | 'push'>
}

export interface NotificationPreferences {
  notifications_enabled: boolean
  channels: {
    email: { enabled: boolean; digest?: 'instant' | 'daily' | 'weekly' }
    in_app: { enabled: boolean }
    push: { enabled: boolean }
    sms: { enabled: boolean }
  }
  prayer_notifications?: Record<string, NotificationTypePref>
  campaign_notifications?: Record<string, NotificationTypePref>
  marketing?: {
    enabled: boolean
    product_updates?: boolean
    feature_announcements?: boolean
    promotional_offers?: boolean
  }
  do_not_disturb?: {
    enabled: boolean
    start_time: string
    end_time: string
    timezone?: string
    apply_to_all?: boolean
  }
  frequency_limits?: {
    max_daily_emails?: number
    max_daily_push?: number
    batching_window_minutes?: number
  }
}

/* ---------- realtime frames (raw ws) ---------- */

export interface WsFrame<T = unknown> {
  type: string
  data: T
  timestamp?: string
}

export interface NewMessageFrame {
  conversation_id: string
  message_id: string
  sender_id: string
  sender_name: string | null
  body: string
  attachments: MessageAttachment[]
  is_system: boolean
  context_type: ConversationContext
  campaign_id: string | null
  created_at: string
}

export interface MessagesReadFrame {
  conversation_id: string
  read_by: string
  read_at: string
}
