'use client'

/**
 * Missions board (RG-18). Shows the current daily/weekly missions with progress
 * bars; completed missions are checked off. Read-only — progress advances
 * server-side as the user acts (share/pray/donate/refer).
 */

import styled from 'styled-components'
import { CheckCircle2, Target } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/styles/tokens'
import { Card, SectionTitle, Muted, Empty, Meter, Chip } from '@/features/gamification/ui'
import { useMyMissions } from '@/api/hooks/useRewards'

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[3]};
  padding: ${SPACING[3]} 0;
  border-bottom: 1px solid ${COLORS.DIVIDER};
  &:last-child { border-bottom: none; }
`

const Icon = styled.div`
  font-size: 1.4rem;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: ${BORDER_RADIUS.MD};
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  flex-shrink: 0;
`

const Title = styled.div`
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.TEXT};
`

export function MissionsCard() {
  const { data, isLoading } = useMyMissions()
  const missions = data ?? []

  return (
    <Card>
      <SectionTitle><Target size={18} color="#1A5FA8" /> Missions</SectionTitle>
      {isLoading && <Muted>Loading missions…</Muted>}
      {!isLoading && missions.length === 0 && <Empty>No active missions right now. Check back soon!</Empty>}
      {missions.map((m) => {
        const pct = Math.min(100, Math.round((m.progress / m.target) * 100))
        return (
          <Item key={`${m.code}-${m.period_key}`}>
            <Icon aria-hidden>{m.icon}</Icon>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <Title>{m.title}</Title>
                <Chip $bg="#E8F0FB" $fg="#1A5FA8">+{m.reward_xp} XP</Chip>
              </div>
              <Muted style={{ margin: '2px 0 6px' }}>{m.description}</Muted>
              {m.completed ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: COLORS.SUCCESS, fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={15} /> Completed
                </span>
              ) : (
                <>
                  <Meter percent={pct} height={8} />
                  <Muted style={{ marginTop: 4, fontSize: 12 }}>{m.progress}/{m.target} · {m.cadence}</Muted>
                </>
              )}
            </div>
          </Item>
        )
      })}
    </Card>
  )
}
