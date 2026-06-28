'use client'

import { create } from 'zustand'

/**
 * Ephemeral messaging UI state (not server state).
 * Currently tracks which conversations have an inbound "typing" indicator.
 * Populated by the realtime socket; read by the active thread.
 */
interface MessagingUiState {
  typingByConversation: Record<string, boolean>
  setTyping: (conversationId: string, isTyping: boolean) => void
}

export const useMessagingUiStore = create<MessagingUiState>((set) => ({
  typingByConversation: {},
  setTyping: (conversationId, isTyping) =>
    set((state) => {
      // no-op if unchanged (avoids needless re-renders)
      if (!!state.typingByConversation[conversationId] === isTyping) return state
      const next = { ...state.typingByConversation }
      if (isTyping) next[conversationId] = true
      else delete next[conversationId]
      return { typingByConversation: next }
    }),
}))
