'use client'

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { Sparkles, AlertTriangle } from 'lucide-react'

/**
 * Shared primitives for the AI feature module (AI-01..AI-12). Keeps the look &
 * feel consistent across the creator hub, discovery surfaces, and admin queues.
 */

// ── Layout cards ────────────────────────────────────────────────────────
export const AICard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`

export const AICardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 6px 0;
`

export const AICardSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 18px 0;
  line-height: 1.5;
`

export const AIFieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
`

export const AITextArea = styled.textarea`
  width: 100%;
  min-height: 110px;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  color: #111827;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }
`

export const AIInput = styled.input`
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  color: #111827;

  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.12);
  }
`

export const AISelect = styled.select`
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  background: #fff;
  color: #111827;

  &:focus {
    outline: none;
    border-color: #7c3aed;
  }
`

// ── "Powered by AI" pill ────────────────────────────────────────────────
const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: linear-gradient(90deg, #ede9fe, #f5f3ff);
  color: #7c3aed;
  border: 1px solid #ddd6fe;
`

export function AIBadge({ label = 'AI' }: { label?: string }) {
  return (
    <Pill>
      <Sparkles size={12} /> {label}
    </Pill>
  )
}

// ── Score bar (used by optimizer / viral / fraud) ───────────────────────
const ScoreTrack = styled.div`
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #f3f4f6;
  overflow: hidden;
`

const ScoreFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
  background: ${(p) => p.$color};
  border-radius: 999px;
  transition: width 0.5s ease;
`

const ScoreRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`

const ScoreValue = styled.span<{ $color: string }>`
  font-size: 22px;
  font-weight: 800;
  color: ${(p) => p.$color};
`

export function scoreColor(score: number, invert = false): string {
  // invert=true → higher is worse (risk). Default → higher is better.
  const good = '#16a34a'
  const mid = '#d97706'
  const bad = '#dc2626'
  const high = invert ? bad : good
  const low = invert ? good : bad
  if (score >= 70) return high
  if (score >= 40) return mid
  return low
}

export function AIScoreBar({
  score,
  label,
  invert = false,
}: {
  score: number
  label?: string
  invert?: boolean
}) {
  const color = scoreColor(score, invert)
  return (
    <div>
      <ScoreRow>
        {label && <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>}
        <ScoreValue $color={color}>{Math.round(score)}</ScoreValue>
      </ScoreRow>
      <ScoreTrack>
        <ScoreFill $pct={score} $color={color} />
      </ScoreTrack>
    </div>
  )
}

// ── Loading shimmer ─────────────────────────────────────────────────────
const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`

export const AISkeleton = styled.div<{ $h?: number }>`
  height: ${(p) => p.$h ?? 16}px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s infinite linear;
  margin-bottom: 10px;
`

// ── Disabled / empty states ─────────────────────────────────────────────
const Notice = styled.div<{ $tone: 'warn' | 'muted' }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
  background: ${(p) => (p.$tone === 'warn' ? '#fffbeb' : '#f9fafb')};
  border: 1px solid ${(p) => (p.$tone === 'warn' ? '#fde68a' : '#e5e7eb')};
  color: ${(p) => (p.$tone === 'warn' ? '#92400e' : '#6b7280')};
`

export function AIUnavailableNotice({
  message = 'AI features are running in limited mode. Connect an AI provider to enable full smart features.',
}: {
  message?: string
}) {
  return (
    <Notice $tone="warn">
      <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{message}</span>
    </Notice>
  )
}

export function AIEmptyState({ message }: { message: string }) {
  return <Notice $tone="muted">{message}</Notice>
}

// ── Chips ───────────────────────────────────────────────────────────────
export const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

export const Chip = styled.span<{ $tone?: 'default' | 'purple' | 'green' | 'red' | 'amber' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  ${(p) => {
    switch (p.$tone) {
      case 'purple':
        return 'background:#f5f3ff;color:#7c3aed;border:1px solid #ddd6fe;'
      case 'green':
        return 'background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0;'
      case 'red':
        return 'background:#fef2f2;color:#dc2626;border:1px solid #fecaca;'
      case 'amber':
        return 'background:#fffbeb;color:#b45309;border:1px solid #fde68a;'
      default:
        return 'background:#f3f4f6;color:#374151;border:1px solid #e5e7eb;'
    }
  }}
`
