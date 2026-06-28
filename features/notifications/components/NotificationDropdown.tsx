'use client'

import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { CheckCheck, Inbox } from 'lucide-react'
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme'
import {
  useNotificationFeed,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/api/hooks/useNotifications'
import type { AppNotification } from '@/types/messaging'

/**
 * NotificationDropdown — panel anchored under the bell.
 * Lists recent notifications grouped Today / Earlier, mark-all, deep-link.
 */

// Positioning is applied inline (computed from the bell's viewport rect) because
// the panel is portaled to <body> to escape the navbar's backdrop-filter
// containing block. z-index sits above the sticky header (1000) and toasts.
const Panel = styled(motion.div)`
  display: flex;
  flex-direction: column;
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.xl};
  z-index: 4000;
  overflow: hidden;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing[3]} ${spacing[4]};
  border-bottom: 1px solid ${colors.border};
`
const HeadTitle = styled.h3`
  margin: 0;
  font-size: ${typography.fontSize.base};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text};
`
const MarkAll = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: ${colors.primary};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  &:hover { text-decoration: underline; }
`

const List = styled.div`
  overflow-y: auto;
  flex: 1;
`
const GroupLabel = styled.div`
  padding: ${spacing[2]} ${spacing[4]};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${colors.background};
`

const Item = styled.button<{ $unread: boolean }>`
  display: flex;
  gap: ${spacing[3]};
  width: 100%;
  text-align: left;
  padding: ${spacing[3]} ${spacing[4]};
  border: none;
  border-bottom: 1px solid ${colors.border};
  background: ${({ $unread }) => ($unread ? 'rgba(99,102,241,0.05)' : 'transparent')};
  cursor: pointer;
  &:hover { background: rgba(99, 102, 241, 0.08); }
`
const IconCol = styled.div`
  font-size: 18px;
  line-height: 1;
`
const Body = styled.div`
  flex: 1;
  min-width: 0;
`
const ItemTitle = styled.div`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text};
`
const ItemMsg = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
const Time = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.textMuted};
  margin-top: 2px;
`
const Dot = styled.span`
  flex: 0 0 auto;
  align-self: center;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${colors.primary};
`
const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[2]};
  padding: ${spacing[10]} ${spacing[6]};
  color: ${colors.textMuted};
  text-align: center;
  svg { color: ${colors.border}; }
`
const Footer = styled.div`
  padding: ${spacing[2]};
  border-top: 1px solid ${colors.border};
  text-align: center;
`
const ViewAll = styled.button`
  border: none;
  background: transparent;
  color: ${colors.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  padding: ${spacing[2]};
  width: 100%;
  &:hover { background: ${colors.background}; border-radius: ${borderRadius.md}; }
`

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

export function NotificationDropdown({
  anchor,
  onClose,
}: {
  anchor?: DOMRect | null
  onClose: () => void
}) {
  const router = useRouter()
  const { data, isLoading } = useNotificationFeed(undefined, 15)
  const markAll = useMarkAllNotificationsRead()
  const markOne = useMarkNotificationRead()

  // Compute placement: bottom sheet on phones, anchored panel otherwise.
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024
  const isMobile = vw <= 480
  const placement: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        top: 'auto',
        width: '100%',
        maxWidth: '100%',
        maxHeight: '70dvh',
        borderRadius: '16px 16px 0 0',
      }
    : {
        position: 'fixed',
        top: anchor ? anchor.bottom + 10 : 70,
        right: anchor ? Math.max(8, vw - anchor.right) : 16,
        width: 380,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: 520,
      }

  const items = data?.items ?? []
  const today = items.filter((n) => isToday(n.created_at))
  const earlier = items.filter((n) => !isToday(n.created_at))

  const handleClick = (n: AppNotification) => {
    if (!n.read) markOne.mutate(n.id)
    if (n.action_url) {
      router.push(n.action_url)
      onClose()
    }
  }

  const renderGroup = (label: string, group: AppNotification[]) =>
    group.length > 0 && (
      <>
        <GroupLabel>{label}</GroupLabel>
        {group.map((n) => (
          <Item key={n.id} $unread={!n.read} onClick={() => handleClick(n)}>
            <IconCol>{n.icon_emoji || '🔔'}</IconCol>
            <Body>
              <ItemTitle>{n.title}</ItemTitle>
              <ItemMsg>{n.message}</ItemMsg>
              <Time>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</Time>
            </Body>
            {!n.read && <Dot />}
          </Item>
        ))}
      </>
    )

  return (
    <Panel
      data-notif-panel
      role="dialog"
      aria-label="Notifications"
      initial={{ opacity: 0, scale: 0.96, y: isMobile ? 12 : -6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: isMobile ? 12 : -6 }}
      transition={{ duration: 0.15 }}
      style={{ ...placement, transformOrigin: isMobile ? 'bottom center' : 'top right' }}
    >
      <Head>
        <HeadTitle>Notifications</HeadTitle>
        <MarkAll onClick={() => markAll.mutate()} disabled={markAll.isPending}>
          <CheckCheck size={14} /> Mark all read
        </MarkAll>
      </Head>

      <List>
        {isLoading ? (
          <Empty>Loading…</Empty>
        ) : items.length === 0 ? (
          <Empty>
            <Inbox size={40} />
            <div>You’re all caught up</div>
          </Empty>
        ) : (
          <>
            {renderGroup('Today', today)}
            {renderGroup('Earlier', earlier)}
          </>
        )}
      </List>

      <Footer>
        <ViewAll
          onClick={() => {
            router.push('/notifications')
            onClose()
          }}
        >
          View all notifications
        </ViewAll>
      </Footer>
    </Panel>
  )
}
