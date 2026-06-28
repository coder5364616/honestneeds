'use client'

import { create } from 'zustand'

export type ConnectivityReason = 'browser-offline' | 'network-error' | 'timeout' | 'server-error'

interface ConnectivityCopy {
  title: string
  message: string
  tone: 'offline' | 'warning' | 'error'
}

const COPY: Record<ConnectivityReason, ConnectivityCopy> = {
  'browser-offline': {
    title: "You're offline",
    message: "Check your Wi-Fi or mobile data. We'll reconnect automatically as soon as you're back online.",
    tone: 'offline',
  },
  'network-error': {
    title: "Can't reach Honest Need",
    message: "We're having trouble connecting to our servers. Check your internet connection, then tap Retry.",
    tone: 'warning',
  },
  timeout: {
    title: 'This is taking longer than usual',
    message: 'Your connection may be slow or unstable. Tap Retry, or check your network and try again.',
    tone: 'warning',
  },
  'server-error': {
    title: 'Something went wrong on our end',
    message: "Our team has been notified and we're on it. Please try again in a moment.",
    tone: 'error',
  },
}

interface ConnectivityState {
  reason: ConnectivityReason | null
  dismissed: boolean
  copy: ConnectivityCopy | null
  reportIssue: (reason: ConnectivityReason) => void
  reportSuccess: () => void
  dismiss: () => void
}

export const useConnectivityStore = create<ConnectivityState>((set, get) => ({
  reason: null,
  dismissed: false,
  copy: null,

  reportIssue: (reason) => {
    // Being offline always wins — it's the more actionable, more urgent state.
    if (get().reason === 'browser-offline' && reason !== 'browser-offline') return
    set({ reason, copy: COPY[reason], dismissed: false })
  },

  reportSuccess: () => {
    if (get().reason !== null) set({ reason: null, copy: null, dismissed: false })
  },

  dismiss: () => set({ dismissed: true }),
}))
