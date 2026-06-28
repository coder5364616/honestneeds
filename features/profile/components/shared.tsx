'use client'

/**
 * Shared primitives for the profile dashboard: stat cards, section cards,
 * empty states, skeleton loaders, and small formatters. Kept local to the
 * profile feature and branded with the HonestNeed token layer.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { motion } from 'framer-motion'
import { honestNeed } from '@/features/profile/theme'

/** Cents â†’ "$1,234.56" */
export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/** Cents â†’ "$1.2k" compact for stat tiles. */
export function formatCentsCompact(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1000) return `$${(dollars / 1000).toFixed(dollars >= 10000 ? 0 : 1)}k`
  return `$${dollars.toFixed(0)}`
}

// â”€â”€ Section card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const SectionCard = styled.section`
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(16, 36, 58, 0.06);
`

export const SectionTitle = styled.h3`
  margin: 0 0 14px;
  font-size: 1rem;
  font-weight: 700;
  color: ${honestNeed.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
`

// â”€â”€ Stat card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  tint?: string
  delay?: number
}

export function StatCard({ icon, label, value, tint = honestNeed.colors.primary, delay = 0 }: StatCardProps) {
  return (
    <StatWrap
      as={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 240, damping: 22 }}
    >
      <StatIcon style={{ color: tint, background: `${tint}1A` }}>{icon}</StatIcon>
      <StatBody>
        <StatValue>{value}</StatValue>
        <StatLabel>{label}</StatLabel>
      </StatBody>
    </StatWrap>
  )
}

const StatWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 14px;
  transition: box-shadow 150ms ease, transform 150ms ease;
  &:hover {
    box-shadow: 0 6px 18px rgba(16, 36, 58, 0.08);
    transform: translateY(-2px);
  }
`

const StatIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  flex-shrink: 0;
`

const StatBody = styled.div`
  min-width: 0;
`

const StatValue = styled.div`
  font-size: 1.3rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
  line-height: 1.1;
`

const StatLabel = styled.div`
  font-size: 0.78rem;
  color: ${honestNeed.colors.mutedText};
  font-weight: 500;
`

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
`

// â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ emoji = 'ðŸŒ±', title, description, action }: EmptyStateProps) {
  return (
    <EmptyWrap>
      <EmptyEmoji aria-hidden>{emoji}</EmptyEmoji>
      <EmptyTitle>{title}</EmptyTitle>
      {description && <EmptyDesc>{description}</EmptyDesc>}
      {action && <EmptyAction>{action}</EmptyAction>}
    </EmptyWrap>
  )
}

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
  gap: 6px;
`
const EmptyEmoji = styled.div`
  font-size: 2.6rem;
  margin-bottom: 4px;
`
const EmptyTitle = styled.h4`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${honestNeed.colors.text};
`
const EmptyDesc = styled.p`
  margin: 0;
  font-size: 0.88rem;
  color: ${honestNeed.colors.mutedText};
  max-width: 360px;
`
const EmptyAction = styled.div`
  margin-top: 12px;
`

// â”€â”€ Branded link button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const PrimaryLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #fff;
  background: ${honestNeed.gradients.sky};
  text-decoration: none;
  transition: transform 150ms ease, box-shadow 150ms ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(28, 155, 216, 0.3);
  }
`

export const GhostLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 700;
  color: ${honestNeed.colors.primary};
  background: ${honestNeed.colors.primaryBg};
  text-decoration: none;
  transition: background 150ms ease;
  &:hover {
    background: ${honestNeed.colors.primary};
    color: #fff;
  }
`

// â”€â”€ Skeleton â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

export const Skeleton = styled.div<{ $h?: number; $w?: string; $r?: number }>`
  height: ${({ $h }) => $h ?? 16}px;
  width: ${({ $w }) => $w ?? '100%'};
  border-radius: ${({ $r }) => $r ?? 8}px;
  background: linear-gradient(
    90deg,
    ${honestNeed.colors.disabled} 25%,
    ${honestNeed.colors.surfaceAlt} 50%,
    ${honestNeed.colors.disabled} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Skeleton $h={120} $r={18} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} $h={74} $r={14} />
        ))}
      </div>
      <Skeleton $h={220} $r={18} />
    </div>
  )
}
