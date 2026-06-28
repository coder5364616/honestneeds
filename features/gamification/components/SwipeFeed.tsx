'use client'

/**
 * Swipe-to-Help feed (RG-17). A TikTok-style card stack of campaigns needing
 * help. Drag/flick right to "help" (opens the campaign), left to skip. Buttons
 * provide an accessible fallback for the gesture.
 */

import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/navigation'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { Heart, X, MapPin, Flame } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/styles/tokens'
import { SectionTitle, Muted, Empty, Chip, compactNumber } from '@/features/gamification/ui'
import { useSwipeFeed } from '@/api/hooks/useRewards'
import type { SwipeCard } from '@/types/gamification'

const Stage = styled.div`
  position: relative;
  width: 100%;
  max-width: 420px;
  height: 560px;
  margin: 0 auto;
`

const CardShell = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: ${BORDER_RADIUS.XL ?? '20px'};
  overflow: hidden;
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  box-shadow: ${SHADOWS.LG};
  display: flex;
  flex-direction: column;
  cursor: grab;
  &:active { cursor: grabbing; }
`

const Media = styled.div<{ $url?: string | null }>`
  height: 62%;
  background: ${(p) => (p.$url ? `url(${p.$url}) center/cover` : 'linear-gradient(135deg,#1A5FA8,#D4870A)')};
  position: relative;
`

const Body = styled.div`
  padding: ${SPACING[5]};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${SPACING[2]};
`

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${TYPOGRAPHY.SIZE_LG};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
`

const Actions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${SPACING[6]};
  margin-top: ${SPACING[5]};
`

const ActionBtn = styled.button<{ $tone: 'skip' | 'help' }>`
  width: 64px; height: 64px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: grid; place-items: center;
  color: white;
  box-shadow: ${SHADOWS.MD};
  background: ${(p) => (p.$tone === 'help' ? 'linear-gradient(135deg,#D4870A,#A8680A)' : COLORS.MUTED_TEXT)};
  transition: transform 120ms ease;
  &:hover { transform: scale(1.08); }
`

function FeedCard({ card, onResolve }: { card: SwipeCard; onResolve: (dir: 'left' | 'right') => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-16, 16])
  const opacity = useTransform(x, [-220, 0, 220], [0, 1, 0])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 120) onResolve('right')
    else if (info.offset.x < -120) onResolve('left')
  }

  return (
    <CardShell
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      whileTap={{ scale: 0.98 }}
    >
      <Media $url={card.image_url}>
        {card.miracle_mode && (
          <div style={{ position: 'absolute', top: 12, left: 12 }}>
            <Chip $bg="#fee2e2" $fg="#b91c1c"><Flame size={13} /> Miracle Mode</Chip>
          </div>
        )}
      </Media>
      <Body>
        <CardTitle>{card.title}</CardTitle>
        {card.city && <Muted style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} /> {card.city}</Muted>}
        <Muted style={{ flex: 1 }}>{card.summary}</Muted>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip $bg="#E8F0FB" $fg="#1A5FA8">🙏 {compactNumber(card.prayers)}</Chip>
          <Chip $bg="#E8F0FB" $fg="#1A5FA8">📣 {compactNumber(card.shares)}</Chip>
        </div>
      </Body>
    </CardShell>
  )
}

export function SwipeFeed({ city }: { city?: string }) {
  const router = useRouter()
  const { data, isLoading } = useSwipeFeed({ limit: 20, city })
  const [index, setIndex] = React.useState(0)
  const cards = data ?? []
  const current = cards[index]

  const resolve = (dir: 'left' | 'right') => {
    if (dir === 'right' && current) router.push(`/campaigns/${current.id}`)
    setIndex((i) => i + 1)
  }

  return (
    <div>
      <SectionTitle>Swipe to Help</SectionTitle>
      <Muted style={{ marginBottom: 16 }}>Flick right to open a campaign and help, left to see the next one.</Muted>

      {isLoading && <Muted>Loading campaigns…</Muted>}
      {!isLoading && cards.length === 0 && <Empty>No campaigns to show right now.</Empty>}

      {!isLoading && cards.length > 0 && (
        <>
          <Stage>
            {!current ? (
              <Empty>You&apos;ve seen them all! 🎉 Check back later for more.</Empty>
            ) : (
              <FeedCard key={current.id} card={current} onResolve={resolve} />
            )}
          </Stage>

          {current && (
            <Actions>
              <ActionBtn $tone="skip" aria-label="Skip" onClick={() => resolve('left')}><X size={26} /></ActionBtn>
              <ActionBtn $tone="help" aria-label="Help" onClick={() => resolve('right')}><Heart size={26} /></ActionBtn>
            </Actions>
          )}
        </>
      )}
    </div>
  )
}
