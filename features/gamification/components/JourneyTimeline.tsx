'use client'

/**
 * Transformation Journey (RG-15) + Celebrations (RG-12). Renders the user's
 * milestone-worthy gamification events as a vertical timeline, and fires a
 * confetti burst when a new celebratory event appears since mount.
 */

import styled from 'styled-components'
import { Sparkles } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/styles/tokens'
import { Card, SectionTitle, Muted, Empty, Confetti } from '@/features/gamification/ui'
import { useMyJourney } from '@/api/hooks/useRewards'
import type { JourneyEvent, GamificationEventType } from '@/types/gamification'

const ICONS: Record<GamificationEventType, string> = {
  level_up: '⬆️',
  badge_earned: '🏅',
  streak_milestone: '🔥',
  golden_ticket: '🎟️',
  mission_complete: '🎯',
  treasure_find: '🗺️',
  xp_award: '✨',
  conversion: '📈',
}

const LABELS: Record<GamificationEventType, string> = {
  level_up: 'Leveled up',
  badge_earned: 'Earned a badge',
  streak_milestone: 'Streak milestone',
  golden_ticket: 'Won a golden ticket',
  mission_complete: 'Completed a mission',
  treasure_find: 'Found a treasure stop',
  xp_award: 'Earned XP',
  conversion: 'Drove a conversion',
}

const Line = styled.div`
  position: relative;
  padding-left: ${SPACING[6]};
  &::before {
    content: '';
    position: absolute;
    left: 14px; top: 0; bottom: 0;
    width: 2px;
    background: ${COLORS.DIVIDER};
  }
`

const Node = styled.div`
  position: relative;
  padding: ${SPACING[3]} 0;
`

const Dot = styled.span`
  position: absolute;
  left: -${SPACING[6]};
  top: ${SPACING[3]};
  width: 30px; height: 30px;
  border-radius: 50%;
  display: grid; place-items: center;
  background: ${COLORS.SURFACE};
  border: 2px solid #1A5FA8;
  font-size: 0.9rem;
`

const When = styled.div`
  font-size: ${TYPOGRAPHY.SIZE_XS};
  color: ${COLORS.MUTED_TEXT};
`

function describe(e: JourneyEvent): string {
  const base = LABELS[e.type] ?? 'Activity'
  if (e.type === 'level_up' && e.meta?.level) return `Reached level ${e.meta.level}`
  if (e.type === 'badge_earned' && e.meta?.code) return `Earned the "${String(e.meta.code).replace(/_/g, ' ')}" badge`
  if (e.type === 'streak_milestone' && e.meta?.days) return `${e.meta.days}-day streak milestone`
  if (e.type === 'mission_complete' && e.meta?.code) return `Completed "${String(e.meta.code).replace(/_/g, ' ')}"`
  if (e.type === 'golden_ticket' && e.meta?.prize_label) return `Won: ${e.meta.prize_label}`
  return base
}

export function JourneyTimeline({ limit = 50, celebrateLatest = false }: { limit?: number; celebrateLatest?: boolean }) {
  const { data, isLoading } = useMyJourney(limit)
  const events = data ?? []
  const fireKey = celebrateLatest && events.length > 0 ? events[0].at : 0

  return (
    <Card>
      {celebrateLatest && <Confetti fire={fireKey} />}
      <SectionTitle><Sparkles size={18} color="#D4870A" /> Your Journey</SectionTitle>
      {isLoading && <Muted>Loading your journey…</Muted>}
      {!isLoading && events.length === 0 && (
        <Empty>Your impact story starts here. Take an action to add your first milestone! ✨</Empty>
      )}
      <Line>
        {events.map((e, i) => (
          <Node key={`${e.at}-${i}`}>
            <Dot aria-hidden>{ICONS[e.type] ?? '✨'}</Dot>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <strong style={{ fontSize: 14 }}>{describe(e)}</strong>
              {e.xp > 0 && <span style={{ color: '#1A5FA8', fontWeight: 700, fontSize: 13 }}>+{e.xp} XP</span>}
            </div>
            <When>{new Date(e.at).toLocaleString()}</When>
          </Node>
        ))}
      </Line>
    </Card>
  )
}
