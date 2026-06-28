/**
 * dashboardTokens.ts
 * Shared design tokens for the /dashboard design system — warm-amber + ink
 * palette, Syne / DM Sans / DM Mono typography. Imported by surfaces that need
 * to match the dashboard look (campaigns browse, donation flow, share modal,
 * share-rewards) so the palette is defined once instead of copied per file.
 */

import { createGlobalStyle, keyframes } from 'styled-components'

// ─── Design Tokens ────────────────────────────────────────────────────────────

export const tk = {
  // Core ink palette
  ink:         '#18171A',
  inkLight:    '#242228',
  inkMid:      '#302E35',
  inkBorder:   '#3D3A44',
  // Canvas
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  // Type
  white:       '#FFFFFF',
  offWhite:    '#F0EDE8',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  // Accent — warm amber
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  // Status
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
} as const

// ─── Fonts & Global ───────────────────────────────────────────────────────────

export const DashboardGlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
`

// ─── Animations ───────────────────────────────────────────────────────────────

export const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const fadeDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`

export const countUp = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`

export const barGrow = keyframes`
  from { width: 0%; }
  to   { width: var(--bar-w); }
`

export const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`

export const spin = keyframes`
  to { transform: rotate(360deg); }
`
