'use client'

/**
 * Rewards & Gamification UI kit (RG-02..RG-21).
 *
 * Re-exports the shared Dashboard design-system primitives (so gamification
 * pages match the creator `/dashboard` look) and adds gamification-specific
 * atoms: meters, level/tier badges, a stat block, a nav tile, and a
 * dependency-free confetti burst used for milestone celebrations (RG-12).
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { tk } from '@/features/dashboardUI'

export * from '@/features/dashboardUI'

// ── Layout atoms ──────────────────────────────────────────────────────────
export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
`

export const StatBox = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem;
  text-align: center;
`

export const TileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;
`

export const Tile = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem;
  height: 100%;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  &:hover {
    transform: translateY(-3px);
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }
  strong { font-family: 'Syne', sans-serif; color: ${tk.heading}; }
  svg { color: ${tk.amber}; }
`

// ── Level / tier badges ───────────────────────────────────────────────────
export const LevelPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 100px;
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  font-weight: 500;
  color: ${tk.ink};
  background: linear-gradient(135deg, ${tk.amberMid}, ${tk.amber});
`

export const Chip = styled.span<{ $bg?: string; $fg?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 100px;
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  font-weight: 500;
  background: ${(p) => p.$bg ?? tk.canvasDeep};
  color: ${(p) => p.$fg ?? tk.body};
  border: 1px solid ${tk.border};
`

export const BadgeChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: 'DM Sans', sans-serif;
  color: ${tk.heading};
  background: ${tk.white};
  border: 1px solid ${tk.border};
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
`

// ── Meters ────────────────────────────────────────────────────────────────
const Track = styled.div<{ $h?: number }>`
  width: 100%;
  height: ${(p) => p.$h ?? 12}px;
  border-radius: 100px;
  background: ${tk.canvasDeep};
  overflow: hidden;
`

const Fill = styled.div<{ $pct: number; $gradient?: string }>`
  height: 100%;
  width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
  background: ${(p) => p.$gradient ?? `linear-gradient(90deg, ${tk.amber}, ${tk.amberMid})`};
  transition: width 500ms ease;
`

export function Meter({ percent, height, gradient }: { percent: number; height?: number; gradient?: string }) {
  return (
    <Track $h={height}>
      <Fill $pct={percent} $gradient={gradient} />
    </Track>
  )
}

/** Alias kept for parity with other hubs. */
export function XPBar({ percent }: { percent: number }) {
  return <Meter percent={percent} />
}

// ── Nav tabs ──────────────────────────────────────────────────────────────
export const NavTabs = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
  width: fit-content;
  max-width: 100%;
`

export const NavTab = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.875rem;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  cursor: pointer;
  border: none;
  background: ${(p) => (p.$active ? tk.white : 'transparent')};
  color: ${(p) => (p.$active ? tk.heading : tk.muted)};
  box-shadow: ${(p) => (p.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none')};
  transition: all 140ms;
  &:hover { color: ${tk.heading}; }
`

// ── Confetti (RG-12) — dependency-free CSS burst ──────────────────────────
const fall = keyframes`
  0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
`

const ConfettiLayer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
`

const Piece = styled.span<{ $left: number; $delay: number; $color: string; $dur: number }>`
  position: absolute;
  top: -10vh;
  left: ${(p) => p.$left}%;
  width: 9px;
  height: 14px;
  background: ${(p) => p.$color};
  border-radius: 2px;
  animation: ${fall} ${(p) => p.$dur}s ${(p) => p.$delay}s ease-in forwards;
`

const CONFETTI_COLORS = [tk.amber, tk.amberMid, tk.blue, tk.green, tk.red, '#3b82f6']

/**
 * Fires a one-shot confetti burst when `fire` flips truthy. Auto-clears after
 * the animation; safe to leave mounted.
 */
export function Confetti({ fire, count = 70 }: { fire: boolean | number; count?: number }) {
  const [show, setShow] = React.useState(false)
  React.useEffect(() => {
    if (!fire) return
    setShow(true)
    const t = setTimeout(() => setShow(false), 4200)
    return () => clearTimeout(t)
  }, [fire])

  if (!show) return null
  return (
    <ConfettiLayer aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <Piece
          key={i}
          $left={Math.random() * 100}
          $delay={Math.random() * 0.6}
          $dur={2.6 + Math.random() * 1.6}
          $color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
        />
      ))}
    </ConfettiLayer>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────
export const VIRAL_TIER_STYLES: Record<string, { bg: string; fg: string; icon: string }> = {
  Inferno: { bg: tk.redLight, fg: tk.red, icon: '🔥' },
  Blazing: { bg: tk.amberLight, fg: tk.amberDark, icon: '⚡' },
  'Heating Up': { bg: '#fef9c3', fg: '#a16207', icon: '🌡️' },
  Spark: { bg: tk.blueLight, fg: tk.blue, icon: '✨' },
  Cold: { bg: tk.canvasDeep, fg: tk.muted, icon: '❄️' },
}

export const POWER_LEVEL_LABEL: Record<string, string> = {
  kindled: 'Kindled',
  growing: 'Growing',
  strong: 'Strong',
  blazing: 'Blazing',
  supernova: 'Supernova',
}

export function compactNumber(n: number | undefined | null): string {
  const v = n ?? 0
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v)
}
