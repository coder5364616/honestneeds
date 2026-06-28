'use client'

/**
 * Shared styled kit + helpers for the Analytics feature (PRD §3.10).
 * Re-exports the core business primitives so analytics pages match the rest of
 * the app, and adds a few analytics-specific building blocks (stat cards,
 * horizontal bar breakdowns, a score gauge, a period selector).
 */

import styled from 'styled-components'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/styles/tokens'

export {
  Page,
  Container,
  Hero,
  HeroTitle,
  HeroSubtitle,
  SectionTitle,
  Card,
  Grid,
  Row,
  Select,
  Label,
  Button,
  Badge,
  Muted,
  Empty,
  StatValue,
  StatLabel,
  formatCents,
  formatDate,
  humanize,
  statusTone,
} from '@/features/business/ui'

import { Card, StatValue, StatLabel, humanize } from '@/features/business/ui'

// ── Formatting helpers ─────────────────────────────────────────────────────

/** Format a dollar number as $X,XXX.XX (or $X,XXX for whole amounts). */
export function formatDollars(value: number | null | undefined): string {
  const n = value ?? 0
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

/** Compact number formatting (1.2k, 3.4M). */
export function formatCompact(value: number | null | undefined): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value ?? 0
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────

/** Headline metric tile used across every analytics surface. */
export function StatCard({
  value,
  label,
  hint,
}: {
  value: React.ReactNode
  label: string
  hint?: string
}) {
  return (
    <Card>
      <StatValue>{value}</StatValue>
      <StatLabel>{label}</StatLabel>
      {hint ? <StatLabel style={{ opacity: 0.7 }}>{hint}</StatLabel> : null}
    </Card>
  )
}

// ── Horizontal bar breakdown ────────────────────────────────────────────────

const BarRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr auto;
  align-items: center;
  gap: ${SPACING[3]};
  margin-bottom: ${SPACING[3]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.TEXT};
`

const BarTrack = styled.div`
  height: 10px;
  border-radius: ${BORDER_RADIUS.FULL};
  background: ${COLORS.BORDER};
  overflow: hidden;
`

const BarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${(p) => Math.max(2, Math.min(100, p.$pct))}%;
  border-radius: ${BORDER_RADIUS.FULL};
  background: linear-gradient(90deg, #D4870A, #F5C961);
`

export interface BarDatum {
  label: string
  value: number
  display?: string
}

/** Ranked horizontal bar list — used for category/region/tier breakdowns. */
export function BarList({ items, emptyText = 'No data yet.' }: { items: BarDatum[]; emptyText?: string }) {
  if (!items || items.length === 0) {
    return <StatLabel>{emptyText}</StatLabel>
  }
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <div>
      {items.map((it) => (
        <BarRow key={it.label}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {humanize(it.label)}
          </span>
          <BarTrack>
            <BarFill $pct={(it.value / max) * 100} />
          </BarTrack>
          <strong>{it.display ?? it.value.toLocaleString()}</strong>
        </BarRow>
      ))}
    </div>
  )
}

// ── Score gauge (viral score) ───────────────────────────────────────────────

const GaugeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING[2]};
`

const GaugeRing = styled.div<{ $deg: number; $color: string }>`
  width: 132px;
  height: 132px;
  border-radius: 50%;
  background: conic-gradient(${(p) => p.$color} ${(p) => p.$deg}deg, ${COLORS.BORDER} 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${SHADOWS.SM};
`

const GaugeInner = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${COLORS.SURFACE};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

/** Circular 0-100 score gauge with a color keyed to the rating tier. */
export function ScoreGauge({ score, rating }: { score: number; rating: string }) {
  const color =
    rating === 'high'
      ? COLORS.SUCCESS
      : rating === 'moderate'
        ? '#1A5FA8'
        : rating === 'low'
          ? COLORS.WARNING
          : COLORS.ERROR
  return (
    <GaugeWrap>
      <GaugeRing $deg={(score / 100) * 360} $color={color}>
        <GaugeInner>
          <div style={{ fontSize: TYPOGRAPHY.SIZE_3XL, fontWeight: 800, color: COLORS.TEXT }}>
            {score}
          </div>
          <div style={{ fontSize: TYPOGRAPHY.SIZE_XS, color: COLORS.MUTED_TEXT }}>/ 100</div>
        </GaugeInner>
      </GaugeRing>
      <div style={{ fontWeight: 700, color, textTransform: 'capitalize' }}>{rating}</div>
    </GaugeWrap>
  )
}

// ── Loading spinner ──────────────────────────────────────────────────────────

export const Spinner = styled.div`
  width: 36px;
  height: 36px;
  margin: ${SPACING[8]} auto;
  border-radius: 50%;
  border: 3px solid ${COLORS.BORDER};
  border-top-color: #D4870A;
  animation: an-spin 0.9s linear infinite;
  @keyframes an-spin {
    to {
      transform: rotate(360deg);
    }
  }
`
