'use client'

/**
 * Community Leaderboards (RG-05). Category + period switchers over a ranked
 * table. Reusable on the hub (compact) and the dedicated leaderboards page.
 */

import React from 'react'
import styled from 'styled-components'
import { Trophy } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/styles/tokens'
import { Card, SectionTitle, Muted, Empty, NavTabs, NavTab, compactNumber } from '@/features/gamification/ui'
import { useLeaderboardBoard } from '@/api/hooks/useRewards'
import type { LeaderboardCategory, LeaderboardPeriod } from '@/types/gamification'

const CATEGORIES: { key: LeaderboardCategory; label: string }[] = [
  { key: 'xp', label: 'Top Members' },
  { key: 'donors', label: 'Top Donors' },
  { key: 'sharers', label: 'Top Sharers' },
  { key: 'referrers', label: 'Top Referrers' },
  { key: 'volunteers', label: 'Top Volunteers' },
]

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: 'all_time', label: 'All time' },
  { key: 'monthly', label: 'Month' },
  { key: 'weekly', label: 'Week' },
  { key: 'daily', label: 'Today' },
]

const Rows = styled.div`
  display: flex;
  flex-direction: column;
`

const RowItem = styled.div<{ $me?: boolean }>`
  display: grid;
  grid-template-columns: 40px 1fr auto;
  align-items: center;
  gap: ${SPACING[3]};
  padding: ${SPACING[3]};
  border-radius: ${BORDER_RADIUS.MD};
  background: ${(p) => (p.$me ? '#FBF3E0' : 'transparent')};
  border-bottom: 1px solid ${COLORS.DIVIDER};
`

const Rank = styled.div<{ $top?: boolean }>`
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  font-size: ${(p) => (p.$top ? '1.2rem' : '0.95rem')};
  color: ${(p) => (p.$top ? '#A8680A' : COLORS.MUTED_TEXT)};
  text-align: center;
`

const Name = styled.div`
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  color: ${COLORS.TEXT};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Avatar = styled.div<{ $url?: string | null }>`
  width: 30px; height: 30px; border-radius: 50%;
  background: ${(p) => (p.$url ? `url(${p.$url}) center/cover` : COLORS.DISABLED)};
  display: inline-block; margin-right: 8px; vertical-align: middle;
`

const MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardPanel({
  defaultCategory = 'xp',
  compact = false,
  currentUserId,
}: {
  defaultCategory?: LeaderboardCategory
  compact?: boolean
  currentUserId?: string
}) {
  const [category, setCategory] = React.useState<LeaderboardCategory>(defaultCategory)
  const [period, setPeriod] = React.useState<LeaderboardPeriod>('all_time')
  const { data, isLoading } = useLeaderboardBoard(category, period, compact ? 10 : 50)

  const valueLabel = (v: number) => {
    if (category === 'donors') return `$${compactNumber(Math.round(v / 100))}`
    if (category === 'volunteers') return `${v} hrs`
    if (category === 'xp') return `${compactNumber(v)} XP`
    return compactNumber(v)
  }

  return (
    <Card>
      <SectionTitle><Trophy size={18} color="#D4870A" /> {data?.label ?? 'Leaderboard'}</SectionTitle>

      <NavTabs>
        {CATEGORIES.map((c) => (
          <NavTab key={c.key} $active={category === c.key} onClick={() => setCategory(c.key)}>
            {c.label}
          </NavTab>
        ))}
      </NavTabs>

      {category !== 'volunteers' && (
        <NavTabs>
          {PERIODS.map((p) => (
            <NavTab key={p.key} $active={period === p.key} onClick={() => setPeriod(p.key)}>
              {p.label}
            </NavTab>
          ))}
        </NavTabs>
      )}

      {isLoading && <Muted>Loading…</Muted>}
      {!isLoading && (!data || data.entries.length === 0) && <Empty>No rankings yet. Be the first!</Empty>}

      <Rows>
        {data?.entries.map((e) => (
          <RowItem key={e.id} $me={!!currentUserId && e.id === currentUserId}>
            <Rank $top={e.rank <= 3}>{e.rank <= 3 ? MEDALS[e.rank - 1] : e.rank}</Rank>
            <Name>
              <Avatar $url={e.avatar_url} />
              {e.display_name || e.username || 'Member'}
              <Muted as="span" style={{ marginLeft: 8, fontSize: 12 }}>Lv {e.level}</Muted>
            </Name>
            <strong>{valueLabel(e.value)}</strong>
          </RowItem>
        ))}
      </Rows>
    </Card>
  )
}
