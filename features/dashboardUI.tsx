'use client'

/**
 * Dashboard Design System — shared UI kit.
 *
 * Mirrors the visual language of the creator `/dashboard` (warm-amber accent,
 * cream canvas, Syne / DM Sans / DM Mono type, white cards with a soft blue
 * hover glow, fade-up motion). Used by the Rewards / Gamification hub and the
 * Giveaways / Sweepstakes pages so they all match the dashboard look.
 *
 * It is intentionally a drop-in superset of the primitives the rewards &
 * giveaway pages previously imported from `@/features/business/ui`, so those
 * pages only need to switch the import path.
 */

import React from 'react'
import styled, { keyframes, createGlobalStyle } from 'styled-components'

// ─── Design Tokens (shared with the creator dashboard) ─────────────────────────

export const tk = {
  // Core ink palette
  ink:        '#18171A',
  inkLight:   '#242228',
  inkMid:     '#302E35',
  inkBorder:  '#3D3A44',
  // Canvas
  canvas:     '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border:     '#E2DDD6',
  // Type
  white:      '#FFFFFF',
  offWhite:   '#F0EDE8',
  muted:      '#8C8790',
  body:       '#4A4750',
  heading:    '#18171A',
  // Accent — warm amber
  amber:      '#D4870A',
  amberLight: '#FBF3E0',
  amberMid:   '#F5C961',
  amberDark:  '#A8680A',
  // Status
  green:      '#1A7A4A',
  greenLight: '#E8F5EE',
  red:        '#C0392B',
  redLight:   '#FBE9E7',
  blue:       '#1A5FA8',
  blueLight:  '#E8F0FB',
} as const

// ─── Fonts / Global ────────────────────────────────────────────────────────────

export const DashboardFonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
`

// ─── Animations ────────────────────────────────────────────────────────────────

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const barGrow = keyframes`
  from { width: 0%; }
  to   { width: var(--bar-w); }
`

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`

// ─── Page Shell ────────────────────────────────────────────────────────────────

const PageShell = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  -webkit-font-smoothing: antialiased;
`

/** Cream canvas page wrapper. Injects the dashboard webfonts once. */
export function Page({ children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <>
      <DashboardFonts />
      <PageShell {...rest}>{children}</PageShell>
    </>
  )
}

export const Container = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  padding: clamp(1.5rem, 3vw, 2.5rem) clamp(1rem, 3vw, 2rem) 4rem;
`

// ─── Hero / Page Header ────────────────────────────────────────────────────────

export const Hero = styled.section`
  background: rgba(247, 245, 241, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid ${tk.blue};
  padding: clamp(1.75rem, 4vw, 2.75rem) clamp(1rem, 3vw, 2rem) clamp(1.5rem, 3vw, 2rem);
  text-align: left;
  animation: ${fadeUp} 0.4s ease both;

  > * { max-width: 1180px; margin-left: auto; margin-right: auto; }
`

export const HeroTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.6rem, 3.4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1.1;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

export const HeroSubtitle = styled.p`
  font-size: clamp(0.9rem, 1.6vw, 1.05rem);
  color: ${tk.body};
  max-width: 680px;
  margin: 0;
  line-height: 1.55;
`

// ─── Section Title ─────────────────────────────────────────────────────────────

export const SectionTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 1.25rem 0;
  letter-spacing: -0.2px;
`

// ─── Card ──────────────────────────────────────────────────────────────────────

export const Card = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.5rem;
  animation: ${fadeUp} 0.5s ease both;
  transition: border-color 200ms, box-shadow 200ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 2px 8px rgba(26, 95, 168, 0.08);
  }
`

// ─── Layout helpers ────────────────────────────────────────────────────────────

export const Grid = styled.div<{ $min?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(${(p) => p.$min || '280px'}, 1fr));
  gap: 1.25rem;
`

const GAP_MAP: Record<number, string> = {
  1: '0.25rem', 2: '0.5rem', 3: '0.75rem', 4: '1rem',
  5: '1.25rem', 6: '1.5rem', 8: '2rem',
}

export const Row = styled.div<{ $gap?: number; $wrap?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${(p) => GAP_MAP[p.$gap ?? 3] ?? '0.75rem'};
  flex-wrap: ${(p) => (p.$wrap ? 'wrap' : 'nowrap')};
`

// ─── Form controls ─────────────────────────────────────────────────────────────

export const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.875rem;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: ${tk.heading};
  background: ${tk.white};
  transition: border-color 140ms, box-shadow 140ms;
  &::placeholder { color: ${tk.muted}; }
  &:focus {
    outline: none;
    border-color: ${tk.amber};
    box-shadow: 0 0 0 3px ${tk.amberLight};
  }
`

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.6rem 0.875rem;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: ${tk.heading};
  background: ${tk.white};
  resize: vertical;
  min-height: 96px;
  transition: border-color 140ms, box-shadow 140ms;
  &:focus {
    outline: none;
    border-color: ${tk.amber};
    box-shadow: 0 0 0 3px ${tk.amberLight};
  }
`

export const Select = styled.select`
  padding: 0.6rem 0.875rem;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: ${tk.heading};
  background: ${tk.white};
  cursor: pointer;
  transition: border-color 140ms;
  &:focus { outline: none; border-color: ${tk.amber}; }
`

export const Label = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${tk.heading};
  margin-bottom: 0.4rem;
`

export const Field = styled.div`
  margin-bottom: 1rem;
`

// ─── Button ────────────────────────────────────────────────────────────────────

export const Button = styled.button<{ $variant?: 'primary' | 'outline' | 'danger' | 'ghost' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.125rem;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 140ms;
  border: 1px solid transparent;
  white-space: nowrap;

  ${(p) =>
    p.$variant === 'outline'
      ? `background: ${tk.white}; color: ${tk.body}; border-color: ${tk.border};`
      : p.$variant === 'danger'
        ? `background: ${tk.red}; color: ${tk.white};`
        : p.$variant === 'ghost'
          ? `background: transparent; color: ${tk.muted};`
          : `background: ${tk.blue}; color: ${tk.white};`}

  &:hover:not(:disabled) {
    ${(p) =>
      p.$variant === 'outline'
        ? `background: ${tk.canvasDeep};`
        : p.$variant === 'ghost'
          ? `background: ${tk.canvasDeep}; color: ${tk.heading};`
          : p.$variant === 'danger'
            ? `filter: brightness(0.94);`
            : `background: #0D4A8C;`}
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

// ─── Badge ─────────────────────────────────────────────────────────────────────

export const Badge = styled.span<{ $tone?: 'success' | 'warning' | 'error' | 'info' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 100px;
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  ${(p) => {
    const map = {
      success: `background:${tk.greenLight};color:${tk.green};`,
      warning: `background:${tk.amberLight};color:${tk.amberDark};`,
      error:   `background:${tk.redLight};color:${tk.red};`,
      info:    `background:${tk.blueLight};color:${tk.blue};`,
      muted:   `background:${tk.canvasDeep};color:${tk.muted};`,
    }
    return map[p.$tone ?? 'muted']
  }}
`

// ─── Text helpers ──────────────────────────────────────────────────────────────

export const Muted = styled.p`
  color: ${tk.muted};
  font-size: 0.875rem;
  line-height: 1.55;
  margin: 0;
`

export const Empty = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: ${tk.white};
  border: 1.5px dashed ${tk.border};
  border-radius: 16px;
  color: ${tk.muted};
  font-size: 0.9rem;
`

export const StatValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.875rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

export const StatLabel = styled.div`
  font-size: 0.78rem;
  color: ${tk.muted};
  margin-top: 0.375rem;
`

// ─── Skeleton ──────────────────────────────────────────────────────────────────

export const SkeletonLine = styled.div<{ $w?: string; $h?: string }>`
  width: ${(p) => p.$w || '100%'};
  height: ${(p) => p.$h || '12px'};
  background: linear-gradient(90deg, ${tk.canvasDeep} 25%, ${tk.border} 50%, ${tk.canvasDeep} 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 100px;
`

// ─── Formatting helpers (unchanged behaviour) ──────────────────────────────────

export function formatCents(cents: number | undefined | null): string {
  return `$${((cents ?? 0) / 100).toFixed(2)}`
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString()
}

export function humanize(value: string | undefined | null): string {
  if (!value) return ''
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const STATUS_TONE: Record<string, 'success' | 'warning' | 'error' | 'info' | 'muted'> = {
  verified: 'success', active: 'success', approved: 'success', accepted: 'success',
  completed: 'success', fulfilled: 'success', open: 'success',
  claimed: 'info', shipped: 'info', redeemed: 'info', drawing_complete: 'info',
  pending: 'warning', pending_claim: 'warning', needs_more_info: 'warning',
  draft: 'muted', unverified: 'muted', closed: 'muted', hidden: 'muted', withdrawn: 'muted',
  rejected: 'error', expired: 'error', cancelled: 'error', suspended: 'error',
}

export function statusTone(status: string): 'success' | 'warning' | 'error' | 'info' | 'muted' {
  return STATUS_TONE[status] ?? 'muted'
}
