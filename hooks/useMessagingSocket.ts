'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { messageKeys } from '@/api/hooks/useMessaging'
import { notificationKeys } from '@/api/hooks/useNotifications'
import { useMessagingUiStore } from '@/store/messagingUiStore'
import type {
  WsFrame,
  NewMessageFrame,
  MessagesReadFrame,
  Message,
  Paginated,
} from '@/types/messaging'

/**
 * Realtime messaging socket — native WebSocket client (singleton).
 *
 * The backend runs a RAW `ws` server at `${WS_BASE}/api/notifications?token=<jwt>`
 * (NOT socket.io — `hooks/useWebSocket.ts` will not connect to it). The backend
 * verifies the JWT and derives the userId from it.
 *
 * A single module-level connection is shared across every component that calls
 * this hook (Messaging Center, NotificationBell, NotificationsPage, …). Frame
 * handling / React Query reconciliation happens exactly once per frame in the
 * connection's `onmessage`, so multiple mounts don't multiply work or sockets.
 */

let ws: WebSocket | null = null
let currentToken: string | null = null
let reconnectAttempts = 0
let pingTimer: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let intentionalClose = false
const openListeners = new Set<(open: boolean) => void>()
// Listeners notified for every inbound user-facing notification frame (bell UX:
// toast / sound / browser notification). Registered via subscribeToNotifications.
const notificationListeners = new Set<(n: IncomingNotification) => void>()

/** Normalized shape emitted to notification listeners (matches AppNotification). */
export interface IncomingNotification {
  id?: string
  type: string
  title: string
  message: string
  icon_emoji?: string
  color?: string
  action_url?: string | null
  data?: Record<string, unknown>
  created_at?: string
}

/**
 * Subscribe to inbound realtime notification frames. Returns an unsubscribe fn.
 * Used by useRealtimeNotifications to drive toast/sound/browser notifications.
 */
export function subscribeToNotifications(
  listener: (n: IncomingNotification) => void
): () => void {
  notificationListeners.add(listener)
  return () => notificationListeners.delete(listener)
}
// Per-conversation timers that auto-clear a stale "typing" indicator.
const typingClearTimers: Record<string, ReturnType<typeof setTimeout>> = {}

const RECONNECT_BASE = 1000
const RECONNECT_MAX = 15000

function resolveWsBase(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_URL
  if (explicit) return explicit.replace(/\/$/, '')
  const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const root = api.replace(/\/api\/?$/, '')
  return root.replace(/^http/, 'ws')
}

function notifyOpen(open: boolean) {
  openListeners.forEach((l) => l(open))
}

function startPing() {
  stopPing()
  pingTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping' }))
    }
  }, 25000)
}

function stopPing() {
  if (pingTimer) {
    clearInterval(pingTimer)
    pingTimer = null
  }
}

function handleFrame(frame: WsFrame, qc: QueryClient) {
  switch (frame.type) {
    case 'new_message': {
      const m = frame.data as NewMessageFrame
      qc.setQueryData(messageKeys.thread(m.conversation_id), (old: any) => {
        if (!old) return old
        const exists = old.pages.some((p: Paginated<Message>) =>
          p.data.some((x) => x.message_id === m.message_id)
        )
        if (exists) return old
        const incoming: Message = {
          message_id: m.message_id,
          conversation_id: m.conversation_id,
          sender_id: m.sender_id,
          recipient_id: '',
          body: m.body,
          attachments: m.attachments ?? [],
          is_system: m.is_system,
          delivered: true,
          read: false,
          edited: false,
          created_at: m.created_at,
          _status: 'sent',
        }
        const pages = [...old.pages]
        pages[0] = { ...pages[0], data: [incoming, ...pages[0].data] }
        return { ...old, pages }
      })
      qc.invalidateQueries({ queryKey: messageKeys.conversations() })
      qc.invalidateQueries({ queryKey: messageKeys.unread() })
      qc.invalidateQueries({ queryKey: notificationKeys.all })
      break
    }

    case 'messages_read': {
      const r = frame.data as MessagesReadFrame
      qc.setQueryData(messageKeys.thread(r.conversation_id), (old: any) => {
        if (!old) return old
        const pages = old.pages.map((p: Paginated<Message>) => ({
          ...p,
          data: p.data.map((m) =>
            m.sender_id === r.read_by ? m : { ...m, read: true, _status: 'read' as const }
          ),
        }))
        return { ...old, pages }
      })
      break
    }

    case 'typing': {
      const { conversation_id, is_typing } = frame.data as {
        conversation_id: string
        is_typing: boolean
      }
      const setTyping = useMessagingUiStore.getState().setTyping
      setTyping(conversation_id, !!is_typing)
      if (typingClearTimers[conversation_id]) {
        clearTimeout(typingClearTimers[conversation_id])
        delete typingClearTimers[conversation_id]
      }
      if (is_typing) {
        // Safety auto-expire if we never receive an explicit "stopped typing".
        typingClearTimers[conversation_id] = setTimeout(() => {
          useMessagingUiStore.getState().setTyping(conversation_id, false)
          delete typingClearTimers[conversation_id]
        }, 5000)
      }
      break
    }

    case 'notification': {
      // Unified dispatcher frame: { type:'notification', data:<AppNotification> }.
      qc.invalidateQueries({ queryKey: notificationKeys.all })
      const n = (frame.data || {}) as IncomingNotification
      if (n && n.type) {
        notificationListeners.forEach((l) => {
          try {
            l(n)
          } catch {
            /* a listener error must not break frame handling */
          }
        })
      }
      break
    }

    case 'donation_received':
    case 'milestone_reached':
      qc.invalidateQueries({ queryKey: notificationKeys.all })
      break

    case 'unread_count':
      // Lightweight nudge to refresh the unread badge.
      qc.invalidateQueries({ queryKey: notificationKeys.unread() })
      break

    default:
      break
  }
}

function connect(token: string, qc: QueryClient) {
  currentToken = token
  intentionalClose = false
  const url = `${resolveWsBase()}/api/notifications?token=${encodeURIComponent(token)}`
  ws = new WebSocket(url)

  ws.onopen = () => {
    reconnectAttempts = 0
    notifyOpen(true)
    startPing()
  }
  ws.onmessage = (event) => {
    try {
      handleFrame(JSON.parse(event.data) as WsFrame, qc)
    } catch {
      /* ignore non-JSON frames */
    }
  }
  ws.onclose = () => {
    notifyOpen(false)
    stopPing()
    if (!intentionalClose) {
      const delay = Math.min(RECONNECT_BASE * 2 ** reconnectAttempts, RECONNECT_MAX)
      reconnectAttempts += 1
      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => connect(token, qc), delay)
    }
  }
  ws.onerror = () => {
    ws?.close()
  }
}

function ensureConnection(token: string, qc: QueryClient) {
  if (
    ws &&
    currentToken === token &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  ) {
    return
  }
  // Token changed (e.g. re-login): tear down the old socket first.
  if (ws && currentToken !== token) {
    intentionalClose = true
    ws.close()
    ws = null
  }
  connect(token, qc)
}

/** Send a raw frame over the shared socket. Returns false if not connected. */
export function sendSocketFrame(obj: Record<string, unknown>): boolean {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj))
    return true
  }
  return false
}

export function useMessagingSocket() {
  const qc = useQueryClient()
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const token = localStorage.getItem('auth_token')
    if (!token) return

    ensureConnection(token, qc)
    setConnected(ws?.readyState === WebSocket.OPEN)

    const onOpen = (open: boolean) => setConnected(open)
    openListeners.add(onOpen)
    return () => {
      openListeners.delete(onOpen)
      // NOTE: we intentionally keep the shared socket open across unmounts so
      // other consumers keep receiving realtime updates. It is torn down only
      // on token change (re-login).
    }
  }, [qc])

  const sendTyping = useCallback(
    (toUserId: string, conversationId: string, isTyping: boolean) => {
      sendSocketFrame({
        type: 'typing',
        to_user_id: toUserId,
        conversation_id: conversationId,
        is_typing: isTyping,
      })
    },
    []
  )

  return { connected, sendTyping }
}
