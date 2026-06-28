'use client'

/**
 * LevelProgressCard
 *
 * Duolingo-style level + XP progress with a level-themed gradient ring, the
 * level title, an animated XP bar toward the next level, and recent badges.
 *
 * Data: GamificationState (useGamification() / dashboard.gamification).
 */

import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { honestNeed } from '@/features/profile/theme'
import type { GamificationState } from '@/types/profile'

interface Props {
  data: GamificationState
}

export function LevelProgressCard({ data }: Props) {
  const theme = honestNeed.levelThemes[data.current_level] ?? honestNeed.levelThemes[1]
  const pct = data.percent_to_next

  return (
    <Card style={{ ['--glow' as string]: theme.glow }}>
      <Top>
        <LevelBubble style={{ background: theme.gradient, boxShadow: `0 6px 20px ${theme.glow}` }}>
          <LvlNum>{data.current_level}</LvlNum>
          <LvlWord>LVL</LvlWord>
        </LevelBubble>
        <TitleBlock>
          <Title>{data.current_title}</Title>
          <Xp>{data.xp.toLocaleString()} XP</Xp>
        </TitleBlock>
      </Top>

      <BarRow>
        <BarLabel>
          {data.next_title ? (
            <>
              Next: <strong>{data.next_title}</strong>
            </>
          ) : (
            'Max level reached ðŸ†'
          )}
        </BarLabel>
        {data.xp_remaining != null && <BarLabel>{data.xp_remaining.toLocaleString()} XP to go</BarLabel>}
      </BarRow>

      <Track>
        <Fill
          as={motion.div}
          style={{ background: theme.gradient }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </Track>

      {data.badges.length > 0 && (
        <Badges>
          {data.badges.slice(0, 8).map((b, i) => (
            <BadgeChip
              as={motion.div}
              key={b.code}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              title={b.name}
            >
              <span aria-hidden>{b.icon}</span>
              <BadgeName>{b.name}</BadgeName>
            </BadgeChip>
          ))}
        </Badges>
      )}
    </Card>
  )
}

const Card = styled.section`
  padding: 20px;
  border-radius: 18px;
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
  box-shadow: 0 1px 3px rgba(16, 36, 58, 0.06);
`

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
`

const LevelBubble = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
`

const LvlNum = styled.span`
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
`
const LvlWord = styled.span`
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  opacity: 0.9;
`

const TitleBlock = styled.div``

const Title = styled.h3`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
`

const Xp = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${honestNeed.colors.accentDark};
`

const BarRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: ${honestNeed.colors.mutedText};
  margin-bottom: 6px;
  strong {
    color: ${honestNeed.colors.text};
  }
`

const BarLabel = styled.span``

const Track = styled.div`
  height: 12px;
  border-radius: 999px;
  background: ${honestNeed.colors.disabled};
  overflow: hidden;
`

const Fill = styled.div`
  height: 100%;
  border-radius: 999px;
`

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`

const BadgeChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: ${honestNeed.colors.accentBg};
  border: 1px solid ${honestNeed.colors.accentLight};
  font-size: 0.78rem;
`

const BadgeName = styled.span`
  font-weight: 600;
  color: ${honestNeed.colors.text};
`

export default LevelProgressCard
