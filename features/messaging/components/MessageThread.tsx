'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { ArrowLeft, MessageSquare } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { tk, font } from './tokens'
import type { Conversation, Message } from '@/types/messaging'
import { MessageBubble } from './MessageBubble'
import { MessageComposer } from './MessageComposer'
import { ConversationMenu } from './ConversationMenu'
import { TypingIndicator } from './TypingIndicator'
import type { MessageAttachment } from '@/types/messaging'

/**
 * MessageThread — right pane: header, scrollable message log, composer.
 * Receives flattened chronological messages + paging callbacks.
 */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${tk.white};
  font-family: ${font.body};
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.125rem;
  border-bottom: 1px solid ${tk.border};
  background: ${tk.canvas};
`

const Back = styled.button`
  display: none;
  border: none;
  background: transparent;
  color: ${tk.body};
  cursor: pointer;
  @media (max-width: 767px) {
    display: flex;
  }
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 11px;
  background: ${tk.amberMid};
  color: ${tk.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.heading};
  font-weight: 700;
  font-size: 0.82rem;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const HeadInfo = styled.div`
  flex: 1;
  min-width: 0;
`
const HeadName = styled.div`
  font-family: ${font.heading};
  font-size: 0.95rem;
  font-weight: 700;
  color: ${tk.heading};
`
const HeadSub = styled.div`
  font-family: ${font.mono};
  font-size: 0.68rem;
  color: ${tk.muted};
  text-transform: capitalize;
`

const Log = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  background: ${tk.canvas};
`

const DayDivider = styled.div`
  align-self: center;
  margin: 0.75rem 0;
  padding: 3px 12px;
  border-radius: 100px;
  background: ${tk.canvasDeep};
  color: ${tk.muted};
  font-family: ${font.mono};
  font-size: 0.67rem;
`

const LoadMore = styled.button`
  align-self: center;
  margin: 0.5rem 0;
  padding: 0.4rem 0.875rem;
  border: 1px solid ${tk.border};
  border-radius: 100px;
  background: ${tk.white};
  color: ${tk.body};
  font-family: ${font.body};
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 140ms;
  &:hover { background: ${tk.canvasDeep}; }
`

const Placeholder = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: ${tk.muted};
  text-align: center;
  padding: 1.5rem;
  background: ${tk.canvas};
  svg { color: ${tk.border}; }
`

function initials(name?: string) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

interface Props {
  conversation?: Conversation
  messages: Message[]
  currentUserId: string
  isLoading: boolean
  hasMore?: boolean
  isFetchingMore?: boolean
  onLoadMore?: () => void
  onSend: (body: string, attachments: MessageAttachment[]) => void
  onBack?: () => void
  onEditMessage?: (messageId: string, body: string) => void
  onDeleteMessage?: (messageId: string) => void
  isOtherTyping?: boolean
  onTyping?: (isTyping: boolean) => void
  draft?: string
  onDraftChange?: (v: string) => void
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  isLoading,
  hasMore,
  isFetchingMore,
  onLoadMore,
  onSend,
  onBack,
  onEditMessage,
  onDeleteMessage,
  isOtherTyping,
  onTyping,
  draft,
  onDraftChange,
}: Props) {
  const logRef = useRef<HTMLDivElement>(null)
  const lastCountRef = useRef(0)

  // Auto-scroll to bottom when a new message arrives (not on history prepend)
  useEffect(() => {
    const el = logRef.current
    if (!el) return
    const grew = messages.length > lastCountRef.current
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
    if (grew && nearBottom) {
      el.scrollTop = el.scrollHeight
    }
    lastCountRef.current = messages.length
  }, [messages])

  const withDividers = useMemo(() => {
    const out: Array<{ type: 'divider'; key: string; label: string } | { type: 'msg'; m: Message }> = []
    let prev: Date | null = null
    messages.forEach((m) => {
      const d = new Date(m.created_at)
      if (!prev || !isSameDay(prev, d)) {
        out.push({ type: 'divider', key: `d-${m.message_id}`, label: format(d, 'EEEE, MMM d') })
      }
      out.push({ type: 'msg', m })
      prev = d
    })
    return out
  }, [messages])

  if (!conversation) {
    return (
      <Wrap>
        <Placeholder>
          <MessageSquare size={56} />
          <div>
            <strong style={{ color: tk.heading, fontFamily: font.heading }}>Select a conversation</strong>
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
              Choose a conversation from the list to start messaging.
            </p>
          </div>
        </Placeholder>
      </Wrap>
    )
  }

  const name = conversation.other_participant?.display_name || 'Unknown'

  return (
    <Wrap>
      <Header>
        <Back onClick={onBack} aria-label="Back to conversations">
          <ArrowLeft size={20} />
        </Back>
        <Avatar>
          {conversation.other_participant?.avatar_url ? (
            <img src={conversation.other_participant.avatar_url} alt={name} />
          ) : (
            initials(name)
          )}
        </Avatar>
        <HeadInfo>
          <HeadName>{name}</HeadName>
          <HeadSub>
            {conversation.context_type !== 'direct' && conversation.campaign?.title
              ? `${conversation.context_type} · ${conversation.campaign.title}`
              : conversation.is_blocked
              ? 'Blocked'
              : 'Active'}
          </HeadSub>
        </HeadInfo>
        <ConversationMenu conversation={conversation} />
      </Header>

      <Log ref={logRef} role="log" aria-live="polite">
        {hasMore && (
          <LoadMore onClick={onLoadMore} disabled={isFetchingMore}>
            {isFetchingMore ? 'Loading…' : 'Load earlier messages'}
          </LoadMore>
        )}

        {isLoading && messages.length === 0 ? (
          <Placeholder>Loading messages…</Placeholder>
        ) : (
          withDividers.map((row) =>
            row.type === 'divider' ? (
              <DayDivider key={row.key}>{row.label}</DayDivider>
            ) : (
              <MessageBubble
                key={row.m.message_id}
                message={row.m}
                mine={row.m.sender_id === currentUserId}
                showStatus
                onEdit={onEditMessage}
                onDelete={onDeleteMessage}
              />
            )
          )
        )}
      </Log>

      {isOtherTyping && <TypingIndicator name={name?.split(' ')[0]} />}

      <MessageComposer
        onSend={onSend}
        blocked={conversation.is_blocked}
        draft={draft}
        onDraftChange={onDraftChange}
        onTyping={onTyping}
      />
    </Wrap>
  )
}
