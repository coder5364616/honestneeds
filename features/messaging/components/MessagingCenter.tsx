'use client'

import React, { useMemo, useState } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { useRouter, useSearchParams } from 'next/navigation'
import { tk } from './tokens'
import { useAuthUserId } from '@/store/authStore'
import {
  useConversations,
  useMessageThread,
  useSendMessage,
  useMarkConversationRead,
  useMessageActions,
} from '@/api/hooks/useMessaging'
import { useMessagingSocket } from '@/hooks/useMessagingSocket'
import { useMessagingUiStore } from '@/store/messagingUiStore'
import type {
  Conversation,
  ConversationContext,
  Message,
  MessageAttachment,
} from '@/types/messaging'
import { ConversationList } from './ConversationList'
import { MessageThread } from './MessageThread'

/**
 * MessagingCenter — orchestrates the master-detail messaging experience.
 * Responsive: two-pane on desktop, stacked (list <-> thread) on mobile.
 * Deep-linkable via ?c=<conversation_id>.
 */

const Shell = styled.div`
  display: grid;
  grid-template-columns: 360px 1fr;
  height: calc(100vh - 200px);
  min-height: 520px;
  border: 1px solid ${tk.border};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(24, 23, 26, 0.06);
  background: ${tk.white};

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    height: calc(100dvh - 140px);
    border-radius: 14px;
  }
`

/**
 * Mobile only: while the messaging view is mounted, lift the floating AI
 * Responder guide (#hn-ai-btn / #hn-ai-pulse) up above the message composer so
 * it never overlays the Send button. It stays in its familiar bottom-right
 * corner — stacked above the bottom nav / music button — so users still notice
 * it. Desktop is intentionally left at its default position (no override).
 *
 * The `body` prefix raises specificity (0,1,1) above FloatingBottomNav's own
 * `#hn-ai-btn` lift (0,1,0); without it the two `!important` rules tie and the
 * winner depends on stylesheet injection order — which is exactly what dragged
 * the button back onto the composer on mobile. Rules mount/unmount with this
 * route only.
 */
const LiftAiGuide = createGlobalStyle`
  /* < 1024px: the bottom nav is visible and the composer is anchored near the
     viewport bottom. Sit above both (mirrors the nav's own 158px stack). */
  @media (max-width: 1023px) {
    body #hn-ai-btn,
    body #hn-ai-pulse {
      bottom: calc(160px + env(safe-area-inset-bottom, 0px)) !important;
      right: 14px !important;
    }
  }
`

const Pane = styled.div<{ $show: boolean }>`
  min-width: 0;
  height: 100%;
  @media (max-width: 767px) {
    display: ${({ $show }) => ($show ? 'block' : 'none')};
  }
`

export function MessagingCenter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentUserId = useAuthUserId() || ''

  const initialActive = searchParams.get('c') || undefined
  const [activeId, setActiveId] = useState<string | undefined>(initialActive)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | ConversationContext>('all')
  const [mobileView, setMobileView] = useState<'list' | 'thread'>(
    initialActive ? 'thread' : 'list'
  )
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  // Live updates (reconciles into React Query cache) + typing relay
  const { sendTyping } = useMessagingSocket()
  const isOtherTyping = useMessagingUiStore((s) =>
    activeId ? !!s.typingByConversation[activeId] : false
  )

  const { data: convData, isLoading: loadingConvos } = useConversations(
    filter === 'all' ? {} : { context_type: filter }
  )

  const conversations = useMemo(() => {
    const list = convData?.data ?? []
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter(
      (c) =>
        c.other_participant?.display_name?.toLowerCase().includes(q) ||
        c.last_message?.body?.toLowerCase().includes(q) ||
        c.campaign?.title?.toLowerCase().includes(q)
    )
  }, [convData, search])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.conversation_id === activeId),
    [conversations, activeId]
  )

  const {
    data: threadData,
    isLoading: loadingThread,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useMessageThread(activeId)

  // Flatten newest-first pages → chronological order for rendering
  const messages: Message[] = useMemo(() => {
    if (!threadData) return []
    const flat = threadData.pages.flatMap((p) => p.data)
    return [...flat].reverse()
  }, [threadData])

  const sendMessage = useSendMessage(activeId || '', currentUserId)
  const markRead = useMarkConversationRead()
  const messageActions = useMessageActions(activeId || '')

  const openConversation = (c: Conversation) => {
    setActiveId(c.conversation_id)
    setMobileView('thread')
    router.replace(`?c=${c.conversation_id}`, { scroll: false })
    if (c.unread_count > 0) {
      markRead.mutate(c.conversation_id)
    }
  }

  const handleSend = (body: string, attachments: MessageAttachment[] = []) => {
    if (!activeId) return
    sendMessage.mutate({ body, attachments })
  }

  const otherParticipantId = activeConversation?.other_participant?._id
  const handleTyping = (isTyping: boolean) => {
    if (activeId && otherParticipantId) {
      sendTyping(otherParticipantId, activeId, isTyping)
    }
  }

  return (
    <Shell>
      <LiftAiGuide />
      <Pane $show={mobileView === 'list'}>
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          isLoading={loadingConvos}
          search={search}
          onSearch={setSearch}
          filter={filter}
          onFilter={setFilter}
          onSelect={openConversation}
        />
      </Pane>

      {/* Thread pane: hidden on mobile while viewing the list; always shown on desktop */}
      <Pane $show={mobileView === 'thread'}>
        <MessageThread
          conversation={activeConversation}
          messages={messages}
          currentUserId={currentUserId}
          isLoading={loadingThread}
          hasMore={hasNextPage}
          isFetchingMore={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          onSend={handleSend}
          onBack={() => setMobileView('list')}
          onEditMessage={(messageId, body) => messageActions.edit.mutate({ messageId, body })}
          onDeleteMessage={(messageId) =>
            messageActions.remove.mutate({ messageId, forEveryone: true })
          }
          isOtherTyping={isOtherTyping}
          onTyping={handleTyping}
          draft={activeId ? drafts[activeId] : ''}
          onDraftChange={(v) =>
            activeId && setDrafts((d) => ({ ...d, [activeId]: v }))
          }
        />
      </Pane>
    </Shell>
  )
}
