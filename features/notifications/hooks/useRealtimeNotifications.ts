'use client'

import { useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import {
  useMessagingSocket,
  subscribeToNotifications,
  type IncomingNotification,
} from '@/hooks/useMessagingSocket'
import { browserNotificationsService } from '@/app/(creator)/dashboard/services/BrowserNotificationsService'

/**
 * useRealtimeNotifications
 *
 * Drives the *arrival* UX for live notifications pushed by the backend
 * NotificationDispatcher over the shared messaging socket:
 *   - in-app toast (react-toastify, mounted globally in app/layout)
 *   - notification sound (short WebAudio chime — no asset dependency)
 *   - native browser notification (if permitted)
 *
 * React Query cache invalidation (badge + feed) is already handled inside
 * useMessagingSocket's frame handler; this hook only adds the sensory layer.
 *
 * Client-only UX gates (sound on/off, browser-notif on/off, master toggle) are
 * read from the same localStorage key NotificationPreferencesContext persists,
 * so we stay decoupled from the provider tree and never throw if it's absent.
 */

const UX_PREFS_KEY = 'honestneed_notification_prefs'

interface UxPrefs {
  notificationsEnabled: boolean
  soundEnabled: boolean
  browserNotificationsEnabled: boolean
  soundSettings?: { volume?: number }
}

function readUxPrefs(): UxPrefs {
  const defaults: UxPrefs = {
    notificationsEnabled: true,
    soundEnabled: true,
    browserNotificationsEnabled: false,
    soundSettings: { volume: 0.8 },
  }
  if (typeof window === 'undefined') return defaults
  try {
    const raw = localStorage.getItem(UX_PREFS_KEY)
    if (!raw) return defaults
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

/** Play a short two-tone chime via WebAudio (avoids bundling an audio asset). */
function playChime(volume: number) {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const gain = ctx.createGain()
    gain.gain.value = Math.max(0, Math.min(1, volume)) * 0.15
    gain.connect(ctx.destination)
    const tones = [880, 1175]
    tones.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.connect(gain)
      const start = ctx.currentTime + i * 0.12
      osc.start(start)
      osc.stop(start + 0.12)
    })
    // Release the context shortly after the sound finishes.
    setTimeout(() => ctx.close().catch(() => {}), 600)
  } catch {
    /* sound is best-effort */
  }
}

export function useRealtimeNotifications() {
  // Ensure the shared socket is connected (no-op if another consumer already did).
  useMessagingSocket()
  // De-dupe rapidly repeated identical frames (e.g. reconnect replays).
  const seen = useRef<Set<string>>(new Set())

  useEffect(() => {
    const unsub = subscribeToNotifications((n: IncomingNotification) => {
      const prefs = readUxPrefs()
      if (!prefs.notificationsEnabled) return

      const key = n.id || `${n.type}-${n.created_at || ''}-${n.title}`
      if (seen.current.has(key)) return
      seen.current.add(key)
      if (seen.current.size > 200) seen.current = new Set([...seen.current].slice(-100))

      const title = `${n.icon_emoji ? `${n.icon_emoji} ` : ''}${n.title}`

      // 1) In-app toast
      showToast(n)

      // 2) Sound
      if (prefs.soundEnabled) {
        playChime(prefs.soundSettings?.volume ?? 0.8)
      }

      // 3) Native browser notification
      if (
        prefs.browserNotificationsEnabled &&
        browserNotificationsService.getPermissionStatus() === 'granted'
      ) {
        browserNotificationsService.sendNotificationWithClick(
          title,
          { body: n.message, tag: key, data: { action_url: n.action_url } },
          () => {
            if (n.action_url && typeof window !== 'undefined') {
              window.location.href = n.action_url
            }
          }
        )
      }
    })

    return unsub
  }, [])
}

/** Render the toast with an action link when one is present. */
function showToast(n: IncomingNotification) {
  const body = `${n.icon_emoji ? `${n.icon_emoji} ` : ''}${n.title}${
    n.message ? ` — ${n.message}` : ''
  }`
  const type =
    n.color === 'danger'
      ? 'error'
      : n.color === 'warning'
        ? 'warning'
        : n.color === 'success'
          ? 'success'
          : 'info'
  toast(body, {
    type,
    autoClose: 6000,
    onClick: () => {
      if (n.action_url && typeof window !== 'undefined') {
        window.location.href = n.action_url
      }
    },
  })
}
