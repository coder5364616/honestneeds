'use client'

/**
 * AIResponderWidget (AI-01 — AI Responder Campaign Advisor)
 *
 * The persistent AI guide. Renders a floating button in the bottom-right corner,
 * sitting next to the global background-music button, and opens a chat panel that
 * never navigates the user away from their current page.
 *
 * Responsibilities (state/data live here; AIResponderPanel is presentational):
 *  - gate to authenticated users;
 *  - manage the active session, transcript, and composer state;
 *  - pass the current page (and campaign in view) so replies are context-aware;
 *  - load the user's recent sessions (history) and re-open any of them;
 *  - request human handoff and capture a satisfaction rating.
 */

import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { usePathname } from 'next/navigation'
import { Sparkles, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { gradients } from '@/styles/honestNeedBrand'
import { useIsAuthenticated } from '@/hooks/useAuth'
import {
  useResponderSend,
  useResponderSessions,
  useResponderHandoff,
  useResponderRate,
} from '@/api/hooks/useAI'
import { aiService } from '@/api/services/aiService'
import type { ResponderMessage } from '@/types/ai'
import AIResponderPanel from './AIResponderPanel'

// id="hn-ai-btn" — lets FloatingBottomNav lift/stack this above the mobile nav.
const LaunchButton = styled.button<{ $open: boolean }>`
  position: fixed;
  bottom: 24px;
  right: 84px; /* sits to the left of the 48px music button at right:24px */
  z-index: 10000;
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${({ $open }) => ($open ? 'rgba(16,36,58,0.85)' : gradients.sky)};
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 18px rgba(28, 155, 216, 0.45);
  transition: transform 0.2s ease, filter 0.2s ease;
  &:hover { transform: scale(1.08); filter: brightness(1.08); }

  @media (max-width: 520px) {
    right: 80px;
    bottom: 24px;
  }
`

const PulseRing = styled.span`
  position: fixed;
  bottom: 24px;
  right: 84px;
  z-index: 9999;
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  border: 2px solid rgba(41, 171, 226, 0.5);
  animation: hn-ai-pulse 2.2s ease-out infinite;
  pointer-events: none;

  @keyframes hn-ai-pulse {
    0%   { transform: scale(1);   opacity: 0.7; }
    100% { transform: scale(1.7); opacity: 0;   }
  }
  @media (max-width: 520px) { right: 80px; }
`

/** Best-effort extraction of a campaign id from the current path. */
function campaignIdFromPath(pathname: string | null): string | undefined {
  if (!pathname) return undefined
  const m = pathname.match(/\/campaigns\/([^/]+)/)
  if (!m) return undefined
  const id = m[1]
  if (['new', 'create', 'explore'].includes(id)) return undefined
  return id
}

export default function AIResponderWidget() {
  const isAuthenticated = useIsAuthenticated()
  const pathname = usePathname()

  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'chat' | 'history'>('chat')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ResponderMessage[]>([])
  const [input, setInput] = useState('')
  const [needsHuman, setNeedsHuman] = useState(false)
  const [handoffRequested, setHandoffRequested] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [loadingSession, setLoadingSession] = useState(false)

  const sendMutation = useResponderSend()
  const handoffMutation = useResponderHandoff()
  const rateMutation = useResponderRate()
  const sessionsQuery = useResponderSessions(open && view === 'history')

  const campaignId = useMemo(() => campaignIdFromPath(pathname), [pathname])

  const resetToNewChat = useCallback(() => {
    setConversationId(null)
    setMessages([])
    setNeedsHuman(false)
    setHandoffRequested(false)
    setRating(null)
    setView('chat')
  }, [])

  const handleSend = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim()
      if (!content || sendMutation.isPending) return

      setInput('')
      setMessages((prev) => [
        ...prev,
        { role: 'user', content, created_at: new Date().toISOString() },
      ])

      try {
        const reply = await sendMutation.mutateAsync({
          message: content,
          conversation_id: conversationId ?? undefined,
          page: pathname ?? undefined,
          campaign_id: campaignId,
        })
        setConversationId(reply.conversation_id)
        setNeedsHuman(reply.needs_human)
        if (reply.status === 'handoff_requested') setHandoffRequested(true)
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: reply.reply,
            suggestions: reply.suggestions,
            action_links: reply.action_links,
            needs_human: reply.needs_human,
            created_at: new Date().toISOString(),
          },
        ])
      } catch (err) {
        console.error('[AIResponder] send failed', err)
        toast.error('The AI Responder is unavailable right now. Please try again.')
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I couldn't reach the assistant just now. Please try again in a moment, or contact support if it persists.",
            created_at: new Date().toISOString(),
          },
        ])
      }
    },
    [input, conversationId, pathname, campaignId, sendMutation]
  )

  const handleSelectSession = useCallback(async (id: string) => {
    setLoadingSession(true)
    setView('chat')
    try {
      const session = await aiService.responderSession(id)
      setConversationId(session.conversation_id)
      setMessages(session.messages || [])
      setHandoffRequested(Boolean(session.handoff?.requested))
      setNeedsHuman(session.status === 'handoff_requested')
      setRating(session.satisfaction?.rating ?? null)
    } catch (err) {
      console.error('[AIResponder] load session failed', err)
      toast.error('Could not open that conversation.')
      setView('history')
    } finally {
      setLoadingSession(false)
    }
  }, [])

  const handleRequestHandoff = useCallback(async () => {
    if (!conversationId) return
    try {
      await handoffMutation.mutateAsync({ conversationId })
      setHandoffRequested(true)
      toast.success('Our support team has been notified.')
    } catch (err) {
      console.error('[AIResponder] handoff failed', err)
      toast.error('Could not reach support. Please try again.')
    }
  }, [conversationId, handoffMutation])

  const handleRate = useCallback(
    async (value: number) => {
      if (!conversationId) return
      setRating(value)
      try {
        await rateMutation.mutateAsync({ conversationId, rating: value })
        toast.success('Thanks for your feedback!')
      } catch (err) {
        console.error('[AIResponder] rating failed', err)
      }
    },
    [conversationId, rateMutation]
  )

  // Only registered users get the Responder.
  if (!isAuthenticated) return null

  return (
    <>
      {!open && <PulseRing id="hn-ai-pulse" aria-hidden="true" />}
      <LaunchButton
        id="hn-ai-btn"
        $open={open}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close AI Responder' : 'Open AI Responder'}
        aria-expanded={open}
        title="AI Responder — your HonestNeed guide"
      >
        {open ? <X size={22} /> : <Sparkles size={24} />}
      </LaunchButton>

      {open && (
        <AIResponderPanel
          view={view}
          messages={messages}
          input={input}
          sending={sendMutation.isPending}
          needsHuman={needsHuman}
          handoffRequested={handoffRequested}
          rating={rating}
          conversationId={conversationId}
          sessions={sessionsQuery.data ?? []}
          sessionsLoading={sessionsQuery.isLoading}
          loadingSession={loadingSession}
          onInputChange={setInput}
          onSend={handleSend}
          onClose={() => setOpen(false)}
          onNewChat={resetToNewChat}
          onToggleHistory={() => setView((v) => (v === 'history' ? 'chat' : 'history'))}
          onSelectSession={handleSelectSession}
          onRequestHandoff={handleRequestHandoff}
          onRate={handleRate}
        />
      )}
    </>
  )
}
