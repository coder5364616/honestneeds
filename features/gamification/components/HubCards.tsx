'use client'

/**
 * Rewards Hub building-block cards (RG-02/03/04/09/10/14).
 * Each card is self-contained: it fetches its own slice and renders a graceful
 * empty/loading state so the hub can compose them freely.
 */

import React from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import { Flame, Zap, Gift, Heart, Star, Crown, TrendingUp } from 'lucide-react'
import { COLORS, TYPOGRAPHY } from '@/styles/tokens'
import {
  Card, SectionTitle, Row, Muted, Empty, Button, Meter, LevelPill, BadgeChip, Chip, StatGrid, StatBox,
  StatValue, StatLabel, Confetti, VIRAL_TIER_STYLES, compactNumber,
} from '@/features/gamification/ui'
import {
  useMyGamification, useStreakCheckIn, useMyViralStatus, useMyHopeMeter,
  useMyGoldenTickets,
} from '@/api/hooks/useRewards'
import type { GamificationProgress, HopeDimensions } from '@/types/gamification'

const Big = styled.div`
  font-size: 2.4rem;
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  line-height: 1.1;
  color: ${COLORS.TEXT};
`

// ── RG-02/03 Level, XP & Badges ──────────────────────────────────────────
export function LevelCard({ data }: { data?: GamificationProgress }) {
  const query = useMyGamification(!data)
  const prog = data ?? query.data
  const [celebrate, setCelebrate] = React.useState(0)
  const prevLevel = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!prog) return
    if (prevLevel.current !== null && prog.current_level > prevLevel.current) {
      setCelebrate((c) => c + 1)
    }
    prevLevel.current = prog.current_level
  }, [prog])

  if (!prog) return <Card><Muted>Loading your level…</Muted></Card>

  return (
    <Card>
      <Confetti fire={celebrate} />
      <Row $wrap style={{ justifyContent: 'space-between', gap: 12 }}>
        <div>
          <SectionTitle style={{ marginBottom: 8 }}>
            <Crown size={18} color="#1A5FA8" /> Your Level
          </SectionTitle>
          <LevelPill>Level {prog.current_level} · {prog.current_title}</LevelPill>
        </div>
        <div style={{ minWidth: 240, flex: 1 }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <Muted>{compactNumber(prog.xp)} XP</Muted>
            <Muted>
              {prog.next_title ? `${compactNumber(prog.xp_remaining ?? 0)} XP to ${prog.next_title}` : 'Max level 🎉'}
            </Muted>
          </Row>
          <Meter percent={prog.percent_to_next} />
        </div>
      </Row>

      <div style={{ marginTop: 20 }}>
        <Muted style={{ marginBottom: 8 }}>Badges ({prog.badges.length})</Muted>
        {prog.badges.length === 0 ? (
          <Empty>No badges yet — donate, share, pray and volunteer to earn them.</Empty>
        ) : (
          <Row $gap={2} $wrap>
            {prog.badges.map((b, i) => (
              <BadgeChip
                as={motion.span}
                key={b.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                title={b.category}
              >
                <span aria-hidden>{b.icon}</span> {b.name}
              </BadgeChip>
            ))}
          </Row>
        )}
      </div>
    </Card>
  )
}

// ── RG-04 Daily Streak ────────────────────────────────────────────────────
export function StreakCard() {
  const { data: prog } = useMyGamification()
  const checkIn = useStreakCheckIn()
  // The streak snapshot isn't part of progress; the check-in mutation returns
  // the live snapshot. Show last known via mutation result when available.
  const snap = checkIn.data
  const current = snap?.current ?? 0
  const longest = snap?.longest ?? 0

  return (
    <Card>
      <SectionTitle><Flame size={18} color="#D4870A" /> Daily Streak</SectionTitle>
      <Row $wrap style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <Big>{current} 🔥</Big>
          <Muted>{longest > 0 ? `Longest: ${longest} days` : 'Check in daily to build your streak'}</Muted>
        </div>
        <Button onClick={() => checkIn.mutate()} disabled={checkIn.isPending}>
          {checkIn.isPending ? 'Checking in…' : 'Check in today'}
        </Button>
      </Row>
      {!prog && <Muted style={{ marginTop: 8 }}>Sign in to track your streak.</Muted>}
    </Card>
  )
}

// ── RG-09 Viral Multiplier ────────────────────────────────────────────────
export function ViralCard() {
  const { data } = useMyViralStatus()
  const tier = data?.tier ?? 'Cold'
  const style = VIRAL_TIER_STYLES[tier] ?? VIRAL_TIER_STYLES.Cold

  return (
    <Card>
      <SectionTitle><Zap size={18} color="#A8680A" /> Viral Multiplier</SectionTitle>
      <Row $wrap style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <Big>{(data?.multiplier ?? 1).toFixed(1)}×</Big>
          <Chip $bg={style.bg} $fg={style.fg}>{style.icon} {tier}</Chip>
        </div>
        <Muted style={{ maxWidth: 220 }}>
          {data?.conversions_7d ?? 0} conversions in the last 7 days. Drive more shares to climb tiers and multiply rewards.
        </Muted>
      </Row>
    </Card>
  )
}

// ── RG-14 Hope Meter ──────────────────────────────────────────────────────
const HOPE_LABELS: Record<keyof HopeDimensions, string> = {
  donated: 'Donated',
  shares: 'Shares',
  prayers: 'Prayers',
  volunteer_hours: 'Volunteer hrs',
  referrals: 'Referrals',
}

export function HopeMeterCard() {
  const { data } = useMyHopeMeter()
  const score = data?.hope_score ?? 0
  const dims = data?.dimensions

  return (
    <Card>
      <SectionTitle><Heart size={18} color="#C0392B" /> Hope Meter</SectionTitle>
      <Row style={{ alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <Big style={{ color: '#C0392B' }}>{score}</Big>
        <div style={{ flex: 1 }}>
          <Meter percent={score} gradient="linear-gradient(90deg, #C0392B, #D4870A)" />
          <Muted style={{ marginTop: 6 }}>Your multi-dimensional impact score (0–100)</Muted>
        </div>
      </Row>
      {dims && (
        <StatGrid>
          {(Object.keys(HOPE_LABELS) as (keyof HopeDimensions)[]).map((k) => (
            <StatBox key={k}>
              <StatValue>
                {k === 'donated' ? `$${compactNumber(Math.round((dims[k] || 0) / 100))}` : compactNumber(dims[k])}
              </StatValue>
              <StatLabel>{HOPE_LABELS[k]}</StatLabel>
            </StatBox>
          ))}
        </StatGrid>
      )}
    </Card>
  )
}

// ── RG-10 Golden Tickets ──────────────────────────────────────────────────
export function GoldenTicketsCard() {
  const { data } = useMyGoldenTickets()
  const tickets = data ?? []

  return (
    <Card>
      <SectionTitle><Gift size={18} color="#D4870A" /> Golden Tickets ({tickets.length})</SectionTitle>
      {tickets.length === 0 ? (
        <Empty>No tickets yet — keep donating, sharing and praying for a chance at random rewards 🎟️</Empty>
      ) : (
        <Row $gap={2} $wrap>
          {tickets.slice(0, 8).map((t) => (
            <Chip key={t._id} $bg="#FBF3E0" $fg="#A8680A" title={new Date(t.created_at).toLocaleDateString()}>
              <Star size={13} /> {t.prize_label}
            </Chip>
          ))}
        </Row>
      )}
    </Card>
  )
}

// ── Compact rank strip (RG-05 teaser) ──────────────────────────────────────
export function RankStrip({ rank, value, label }: { rank?: number; value?: number; label: string }) {
  if (!rank) return null
  return (
    <Chip $bg="#E8F0FB" $fg="#1A5FA8">
      <TrendingUp size={13} /> #{rank} · {label} ({compactNumber(value)})
    </Chip>
  )
}
