'use client'

/**
 * ProfileCompletionMeter
 *
 * A branded, animated circular completion ring (Sky-blue â†’ Green sweep) with an
 * inline checklist of remaining items. High-conversion: the ring fills on mount,
 * the percentage counts up, and incomplete items are tappable nudges.
 *
 * Data: useProfileCompletion() (GET /users/me/profile/completion).
 */

import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import type { CompletionChecklistItem } from '@/types/profile'

const ITEM_LABELS: Record<string, string> = {
  first_name: 'Add your first name',
  last_name: 'Add your last name',
  username: 'Choose a username',
  avatar: 'Add a profile photo',
  bio: 'Write a short bio',
  location: 'Add your location',
  email_verified: 'Verify your email',
  phone_verified: 'Verify your phone',
  identity_verified: 'Verify your identity (ID+)',
}

const RADIUS = 54
const CIRC = 2 * Math.PI * RADIUS

interface Props {
  percent: number
  checklist?: CompletionChecklistItem[]
  /** Called when a user taps an incomplete checklist item. */
  onItemClick?: (key: string) => void
  compact?: boolean
}

export function ProfileCompletionMeter({ percent, checklist = [], onItemClick, compact }: Props) {
  const [display, setDisplay] = useState(0)
  const offset = useMotionValue(CIRC)
  const ringRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    const target = Math.max(0, Math.min(100, percent))
    const countControls = animate(0, target, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
    })
    const dashControls = animate(offset, CIRC - (CIRC * target) / 100, {
      duration: 1.1,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ringRef.current) ringRef.current.style.strokeDashoffset = String(v)
      },
    })
    return () => {
      countControls.stop()
      dashControls.stop()
    }
  }, [percent, offset])

  const remaining = checklist.filter((c) => !c.done)
  const isComplete = percent >= 100

  return (
    <Wrapper $compact={!!compact}>
      <RingArea>
        <svg width={132} height={132} viewBox="0 0 132 132" role="img" aria-label={`Profile ${display}% complete`}>
          <defs>
            <linearGradient id="hn-completion" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={honestNeed.colors.primary} />
              <stop offset="100%" stopColor={honestNeed.colors.success} />
            </linearGradient>
          </defs>
          <circle cx={66} cy={66} r={RADIUS} fill="none" stroke={honestNeed.colors.border} strokeWidth={11} />
          <circle
            ref={ringRef}
            cx={66}
            cy={66}
            r={RADIUS}
            fill="none"
            stroke="url(#hn-completion)"
            strokeWidth={11}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
            transform="rotate(-90 66 66)"
          />
        </svg>
        <RingCenter>
          <Percent>{display}%</Percent>
          <PercentLabel>{isComplete ? 'Complete!' : 'Complete'}</PercentLabel>
        </RingCenter>
      </RingArea>

      {!compact && (
        <Details>
          <Heading>{isComplete ? 'ðŸŽ‰ Your profile shines!' : 'Boost your profile'}</Heading>
          <Sub>
            {isComplete
              ? 'Verified, complete profiles earn more trust and support.'
              : `${remaining.length} step${remaining.length === 1 ? '' : 's'} left to build trust.`}
          </Sub>
          <List>
            {checklist.map((item, i) => (
              <Item
                key={item.key}
                as={motion.button}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                $done={item.done}
                disabled={item.done}
                onClick={() => !item.done && onItemClick?.(item.key)}
              >
                <Tick $done={item.done}>{item.done && <Check size={13} strokeWidth={3} />}</Tick>
                <ItemLabel $done={item.done}>{ITEM_LABELS[item.key] ?? item.key}</ItemLabel>
                {!item.done && (
                  <>
                    <Impact>+{item.weight}%</Impact>
                    <ChevronRight size={15} />
                  </>
                )}
              </Item>
            ))}
          </List>
        </Details>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div<{ $compact: boolean }>`
  display: flex;
  flex-direction: ${({ $compact }) => ($compact ? 'column' : 'row')};
  align-items: ${({ $compact }) => ($compact ? 'center' : 'flex-start')};
  gap: 20px;
  padding: 20px;
  background: ${honestNeed.gradients.glassSky};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 18px;
  backdrop-filter: blur(8px);
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: center;
  }
`

const RingArea = styled.div`
  position: relative;
  width: 132px;
  height: 132px;
  flex-shrink: 0;
`

const RingCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Percent = styled.span`
  font-size: 1.9rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
  line-height: 1;
`

const PercentLabel = styled.span`
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${honestNeed.colors.mutedText};
`

const Details = styled.div`
  flex: 1;
  min-width: 0;
`

const Heading = styled.h3`
  margin: 0 0 2px;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${honestNeed.colors.text};
`

const Sub = styled.p`
  margin: 0 0 12px;
  font-size: 0.85rem;
  color: ${honestNeed.colors.mutedText};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Item = styled.button<{ $done: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid ${({ $done }) => ($done ? 'transparent' : honestNeed.colors.border)};
  border-radius: 10px;
  background: ${({ $done }) => ($done ? 'transparent' : honestNeed.colors.surface)};
  cursor: ${({ $done }) => ($done ? 'default' : 'pointer')};
  text-align: left;
  transition: all 150ms ease-in-out;
  &:hover:not(:disabled) {
    border-color: ${honestNeed.colors.primary};
    box-shadow: 0 2px 8px rgba(28, 155, 216, 0.12);
  }
`

const Tick = styled.span<{ $done: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  border-radius: 50%;
  color: #fff;
  background: ${({ $done }) => ($done ? honestNeed.colors.success : honestNeed.colors.disabled)};
  border: ${({ $done }) => ($done ? 'none' : `1.5px solid ${honestNeed.colors.divider}`)};
`

const ItemLabel = styled.span<{ $done: boolean }>`
  flex: 1;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ $done }) => ($done ? honestNeed.colors.muted : honestNeed.colors.text)};
  text-decoration: ${({ $done }) => ($done ? 'line-through' : 'none')};
`

const Impact = styled.span`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${honestNeed.colors.secondaryDark};
  background: ${honestNeed.colors.secondaryBg};
  padding: 2px 7px;
  border-radius: 999px;
`

export default ProfileCompletionMeter
