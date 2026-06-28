'use client'

import React from 'react'
import styled from 'styled-components'
import { MessageCircle, ArrowRight } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import { useUnreadMessageCount } from '@/api/hooks/useMessaging'
import { SectionCard, SectionTitle, EmptyState, PrimaryLink } from '../shared'

/**
 * Messages tab â€” surfaces unread count and routes into the full messaging
 * inbox (features/messaging). Keeps the profile dashboard light while reusing
 * the existing messaging stack.
 */
export function MessagesTab() {
  const { data: unread = 0, isLoading } = useUnreadMessageCount()

  return (
    <SectionCard>
      <SectionTitle>
        <MessageCircle size={16} color={honestNeed.colors.primary} /> Messages
      </SectionTitle>
      {isLoading ? (
        <Muted>Loading conversationsâ€¦</Muted>
      ) : unread > 0 ? (
        <Inbox>
          <Badge>{unread}</Badge>
          <InboxText>
            You have <strong>{unread}</strong> unread message{unread === 1 ? '' : 's'}.
          </InboxText>
          <PrimaryLink href="/messages">
            Open inbox <ArrowRight size={16} />
          </PrimaryLink>
        </Inbox>
      ) : (
        <EmptyState
          emoji="ðŸ’¬"
          title="You're all caught up"
          description="Private conversations with supporters and creators live in your inbox."
          action={
            <PrimaryLink href="/messages">
              Open inbox <ArrowRight size={16} />
            </PrimaryLink>
          }
        />
      )}
    </SectionCard>
  )
}

const Muted = styled.p`
  margin: 0;
  font-size: 0.86rem;
  color: ${honestNeed.colors.mutedText};
`
const Inbox = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 0;
  flex-wrap: wrap;
`
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${honestNeed.colors.love};
  color: #fff;
  font-weight: 800;
  font-size: 1.1rem;
`
const InboxText = styled.p`
  flex: 1;
  margin: 0;
  font-size: 0.92rem;
  color: ${honestNeed.colors.text};
  strong { color: ${honestNeed.colors.love}; }
`

export default MessagesTab
