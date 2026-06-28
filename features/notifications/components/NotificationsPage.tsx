'use client'

import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'
import { CheckCheck, Inbox, Archive } from 'lucide-react'
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme'
import {
  useNotificationsInfinite,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useArchiveNotification,
} from '@/api/hooks/useNotifications'
import { useMessagingSocket } from '@/hooks/useMessagingSocket'
import type { AppNotification, NotificationType } from '@/types/messaging'

/**
 * NotificationsPage — full-page notification center with filter tabs,
 * day grouping, mark-all, per-item read/archive, and load-more pagination.
 */

const Wrap = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: ${spacing[6]};
  @media (max-width: 767px) {
    padding: ${spacing[3]};
  }
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing[4]};
  gap: ${spacing[3]};
`
const H1 = styled.h1`
  margin: 0;
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.text};
`
const MarkAll = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.md};
  background: ${colors.surface};
  color: ${colors.primary};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  &:hover { background: ${colors.background}; }
`

const Tabs = styled.div`
  display: flex;
  gap: ${spacing[2]};
  margin-bottom: ${spacing[4]};
  overflow-x: auto;
`
const Tab = styled.button<{ $active: boolean }>`
  flex: 0 0 auto;
  padding: 8px 16px;
  border-radius: ${borderRadius.full};
  border: 1px solid ${({ $active }) => ($active ? colors.primary : colors.border)};
  background: ${({ $active }) => ($active ? colors.primary : colors.surface)};
  color: ${({ $active }) => ($active ? '#fff' : colors.textMuted)};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 150ms ease;
`

const Group = styled.div`
  margin-bottom: ${spacing[5]};
`
const GroupTitle = styled.h2`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 ${spacing[2]} 0;
`

const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.sm};
  overflow: hidden;
`

const Item = styled.div<{ $unread: boolean }>`
  display: flex;
  gap: ${spacing[3]};
  padding: ${spacing[4]};
  border-bottom: 1px solid ${colors.border};
  background: ${({ $unread }) => ($unread ? 'rgba(99,102,241,0.04)' : 'transparent')};
  cursor: pointer;
  transition: background 120ms ease;
  &:last-child { border-bottom: none; }
  &:hover { background: rgba(99, 102, 241, 0.07); }
  &:hover .archive { opacity: 1; }
`
const Icon = styled.div`
  font-size: 22px;
  line-height: 1;
`
const Body = styled.div`
  flex: 1;
  min-width: 0;
`
const Title = styled.div`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.text};
`
const Msg = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
  margin-top: 2px;
`
const Time = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.textMuted};
  margin-top: 4px;
`
const ArchiveBtn = styled.button`
  opacity: 0;
  align-self: center;
  border: none;
  background: transparent;
  color: ${colors.textMuted};
  cursor: pointer;
  padding: 6px;
  border-radius: ${borderRadius.full};
  transition: opacity 120ms ease;
  &:hover { background: ${colors.background}; color: ${colors.text}; }
`
const Dot = styled.span`
  flex: 0 0 auto;
  align-self: center;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${colors.primary};
`

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${spacing[3]};
  padding: ${spacing[16]} ${spacing[6]};
  color: ${colors.textMuted};
  text-align: center;
  svg { color: ${colors.border}; }
`
const LoadMore = styled.button`
  display: block;
  margin: ${spacing[4]} auto 0;
  padding: 10px 20px;
  border: 1px solid ${colors.border};
  border-radius: ${borderRadius.full};
  background: ${colors.surface};
  color: ${colors.text};
  font-size: ${typography.fontSize.sm};
  cursor: pointer;
  &:hover { background: ${colors.background}; }
`
const SkeletonItem = styled.div`
  height: 76px;
  border-bottom: 1px solid ${colors.border};
  background: linear-gradient(90deg, #f8fafc, #eef2f7, #f8fafc);
  background-size: 200% 100%;
  animation: sh 1.4s ease-in-out infinite;
  @keyframes sh { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
`

type FilterKey = 'all' | 'messages' | 'donations' | 'campaigns' | 'system'

const FILTERS: { key: FilterKey; label: string; types?: NotificationType[] }[] = [
  { key: 'all', label: 'All' },
  { key: 'messages', label: 'Messages', types: ['new_message'] },
  { key: 'donations', label: 'Donations', types: ['donation_received', 'goal_reached'] },
  {
    key: 'campaigns',
    label: 'Campaigns',
    types: ['campaign_activated', 'campaign_ended', 'goal_reached'],
  },
  { key: 'system', label: 'System', types: ['system_alert', 'admin_message'] },
]

function groupLabel(iso: string) {
  const d = new Date(iso)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  return 'Earlier'
}

export function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterKey>('all')

  useMessagingSocket() // keep live

  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useNotificationsInfinite(filter === 'all' ? undefined : filter)
  const markAll = useMarkAllNotificationsRead()
  const markOne = useMarkNotificationRead()
  const archive = useArchiveNotification()

  const items = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])

  // Client-side type filtering as a safety net (server filter is best-effort)
  const filtered = useMemo(() => {
    const def = FILTERS.find((f) => f.key === filter)
    if (!def?.types) return items
    return items.filter((n) => def.types!.includes(n.type))
  }, [items, filter])

  const groups = useMemo(() => {
    const map: Record<string, AppNotification[]> = {}
    filtered.forEach((n) => {
      const g = groupLabel(n.created_at)
      ;(map[g] = map[g] || []).push(n)
    })
    return ['Today', 'Yesterday', 'Earlier']
      .filter((g) => map[g]?.length)
      .map((g) => ({ label: g, items: map[g] }))
  }, [filtered])

  const handleClick = (n: AppNotification) => {
    if (!n.read) markOne.mutate(n.id)
    if (n.action_url) router.push(n.action_url)
  }

  return (
    <Wrap>
      <TopBar>
        <H1>Notifications</H1>
        <MarkAll onClick={() => markAll.mutate()} disabled={markAll.isPending}>
          <CheckCheck size={16} /> Mark all read
        </MarkAll>
      </TopBar>

      <Tabs role="tablist">
        {FILTERS.map((f) => (
          <Tab
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            $active={filter === f.key}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </Tab>
        ))}
      </Tabs>

      {isLoading ? (
        <Card>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonItem key={i} />
          ))}
        </Card>
      ) : filtered.length === 0 ? (
        <Center>
          <Inbox size={56} />
          <div>
            <strong style={{ color: colors.text }}>Nothing here yet</strong>
            <p style={{ margin: '4px 0 0', fontSize: typography.fontSize.sm }}>
              You’re all caught up on {filter === 'all' ? 'notifications' : filter}.
            </p>
          </div>
        </Center>
      ) : (
        <>
          {groups.map((group) => (
            <Group key={group.label}>
              <GroupTitle>{group.label}</GroupTitle>
              <Card>
                {group.items.map((n) => (
                  <Item key={n.id} $unread={!n.read} onClick={() => handleClick(n)}>
                    <Icon>{n.icon_emoji || '🔔'}</Icon>
                    <Body>
                      <Title>{n.title}</Title>
                      <Msg>{n.message}</Msg>
                      <Time>
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </Time>
                    </Body>
                    {!n.read && <Dot />}
                    <ArchiveBtn
                      className="archive"
                      aria-label="Archive notification"
                      onClick={(e) => {
                        e.stopPropagation()
                        archive.mutate(n.id)
                      }}
                    >
                      <Archive size={16} />
                    </ArchiveBtn>
                  </Item>
                ))}
              </Card>
            </Group>
          ))}

          {hasNextPage && (
            <LoadMore onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
              {isFetchingNextPage ? 'Loading…' : 'Load more'}
            </LoadMore>
          )}
        </>
      )}
    </Wrap>
  )
}
