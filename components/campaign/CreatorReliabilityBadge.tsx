'use client'

import styled from 'styled-components'
import { ShieldCheck, Zap, Clock, HelpCircle } from 'lucide-react'

/**
 * CreatorReliabilityBadge (Phase 5, trust-based Share-to-Earn)
 *
 * Since the platform doesn't escrow sharer rewards, sharers judge a creator by
 * how reliably they pay. This badge renders the `creator_reliability` score the
 * backend attaches to the campaign payload so sharers can gauge risk before
 * sharing. Compact variant is for share CTAs; full shows a tooltip-style detail.
 */

export interface CreatorReliability {
  rating: 'unrated' | 'building' | 'fair' | 'good' | 'excellent'
  label: string
  score: number | null
  payouts_confirmed: number
  payouts_received: number
  payouts_disputed: number
  on_time_rate: number | null
  avg_time_to_pay_hours: number | null
  total_paid_cents: number
}

const palette: Record<CreatorReliability['rating'], { bg: string; fg: string; border: string }> = {
  excellent: { bg: '#ECFDF5', fg: '#047857', border: '#A7F3D0' },
  good: { bg: '#ECFDF5', fg: '#059669', border: '#A7F3D0' },
  fair: { bg: '#FFFBEB', fg: '#B45309', border: '#FDE68A' },
  building: { bg: '#FFF7ED', fg: '#C2410C', border: '#FED7AA' },
  unrated: { bg: '#F1F5F9', fg: '#475569', border: '#E2E8F0' },
}

const Badge = styled.span<{ $bg: string; $fg: string; $border: string; $compact: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: ${({ $compact }) => ($compact ? '3px 8px' : '5px 11px')};
  border-radius: 999px;
  font-size: ${({ $compact }) => ($compact ? '0.72rem' : '0.78rem')};
  font-weight: 700;
  background: ${({ $bg }) => $bg};
  color: ${({ $fg }) => $fg};
  border: 1px solid ${({ $border }) => $border};
  cursor: default;
  white-space: nowrap;
`

const Detail = styled.span`
  font-weight: 500;
  opacity: 0.85;
`

function iconFor(rating: CreatorReliability['rating']) {
  if (rating === 'excellent') return <Zap size={13} />
  if (rating === 'good') return <ShieldCheck size={13} />
  if (rating === 'fair') return <Clock size={13} />
  if (rating === 'building') return <Clock size={13} />
  return <HelpCircle size={13} />
}

interface Props {
  reliability?: CreatorReliability | null
  compact?: boolean
}

export function CreatorReliabilityBadge({ reliability, compact = false }: Props) {
  if (!reliability) return null

  const c = palette[reliability.rating] || palette.unrated
  const title =
    reliability.rating === 'unrated'
      ? 'This creator hasn’t settled enough payouts to be rated yet.'
      : `${reliability.payouts_confirmed} payout(s) settled` +
        (reliability.on_time_rate != null
          ? ` · ${Math.round(reliability.on_time_rate * 100)}% on time`
          : '') +
        (reliability.avg_time_to_pay_hours != null
          ? ` · avg ${reliability.avg_time_to_pay_hours}h to pay`
          : '') +
        (reliability.payouts_disputed > 0 ? ` · ${reliability.payouts_disputed} disputed` : '')

  return (
    <Badge $bg={c.bg} $fg={c.fg} $border={c.border} $compact={compact} title={title}>
      {iconFor(reliability.rating)}
      {reliability.label}
      {!compact && reliability.score != null && <Detail>· {reliability.score}/100</Detail>}
    </Badge>
  )
}

export default CreatorReliabilityBadge
