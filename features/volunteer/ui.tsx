'use client'

/**
 * Volunteer Features UI kit (VO-01..VO-08).
 *
 * Re-exports the shared Dashboard design system (via the Business UI kit) so
 * every volunteer surface matches the creator `/dashboard` look — cream canvas,
 * Syne / DM Sans / DM Mono type, warm-amber + blue accents, white cards with a
 * soft blue hover glow. Adds a few volunteer-specific atoms (XP bar, level pill,
 * badge chip, stat block, nav tabs, urgency tag) drawn from the same `tk`
 * design tokens so they no longer drift to an off-brand palette.
 */

import styled from 'styled-components'
import { tk } from '@/features/dashboardUI'

export * from '@/features/business/ui'

// ── Volunteer-specific atoms ──────────────────────────────────────────────

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
  transition: border-color 200ms, box-shadow 200ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 2px 8px rgba(26, 95, 168, 0.08);
  }
`

export const LevelPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border-radius: 100px;
  font-family: 'Syne', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: ${tk.ink};
  background: linear-gradient(135deg, ${tk.amberMid}, ${tk.amber});
`

const BarTrack = styled.div`
  width: 100%;
  height: 10px;
  border-radius: 100px;
  background: ${tk.canvasDeep};
  overflow: hidden;
`

const BarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${(p) => Math.max(0, Math.min(100, p.$pct))}%;
  border-radius: 100px;
  background: linear-gradient(90deg, ${tk.amber}, ${tk.amberMid});
  transition: width 400ms ease;
`

export function XPBar({ percent }: { percent: number }) {
  return (
    <BarTrack>
      <BarFill $pct={percent} />
    </BarTrack>
  )
}

export const BadgeChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 100px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${tk.heading};
  background: ${tk.white};
  border: 1px solid ${tk.border};
  transition: border-color 140ms, box-shadow 140ms;

  &:hover {
    border-color: ${tk.amber};
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
`

export const NavTabs = styled.div`
  display: inline-flex;
  gap: 4px;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

export const NavTab = styled.button<{ $active?: boolean }>`
  padding: 0.45rem 1rem;
  border-radius: 7px;
  border: none;
  background: ${(p) => (p.$active ? tk.white : 'transparent')};
  color: ${(p) => (p.$active ? tk.heading : tk.muted)};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  box-shadow: ${(p) => (p.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none')};

  &:hover { color: ${tk.heading}; }
`

const URGENCY_BG: Record<string, string> = {
  low: tk.blueLight,
  medium: tk.amberLight,
  high: tk.amberLight,
  critical: tk.redLight,
}
const URGENCY_FG: Record<string, string> = {
  low: tk.blue,
  medium: tk.amberDark,
  high: tk.amberDark,
  critical: tk.red,
}

export const UrgencyTag = styled.span<{ $urgency: string }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 100px;
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${(p) => URGENCY_BG[p.$urgency] ?? tk.canvasDeep};
  color: ${(p) => URGENCY_FG[p.$urgency] ?? tk.muted};
`
