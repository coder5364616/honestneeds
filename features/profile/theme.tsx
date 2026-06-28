'use client'

/**
 * Profile feature theme — REMAPPED to the /dashboard design system.
 *
 * The /profile, /profile/setup and /verify/identity pages were originally
 * branded with the sky-blue `honestNeed` logo palette. To make them read as
 * part of the same product surface as /dashboard, this module re-exports an
 * object that is *shape-compatible* with `@/styles/honestNeedBrand` (same keys,
 * so the existing components keep working untouched) but whose VALUES are the
 * warm-amber + ink token system used across the dashboard
 * (Syne / DM Sans / DM Mono, #F7F5F1 canvas, amber accent, ink text).
 *
 * Components import `{ honestNeed }` from here instead of the brand file — a
 * one-line import swap restyles the whole feature. Typography (Syne headings,
 * DM Sans body) is applied page-wide via <ProfileGlobalStyle/> scoped to the
 * `.hn-dash` wrapper the entry pages render.
 */

import { createGlobalStyle } from 'styled-components'

// ── Dashboard token palette (mirrors app/(creator)/dashboard `tk`) ──────────
const tk = {
  ink: '#18171A',
  inkLight: '#242228',
  inkBorder: '#3D3A44',
  canvas: '#F7F5F1',
  canvasDeep: '#EEEBE5',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  body: '#4A4750',
  heading: '#18171A',
  amber: '#D4870A',
  amberLight: '#FBF3E0',
  amberMid: '#F5C961',
  amberDark: '#A8680A',
  green: '#1A7A4A',
  greenLight: '#E8F5EE',
  red: '#C0392B',
  redLight: '#FBE9E7',
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
}

// ── Semantic tokens (same keys as styles/honestNeedBrand colors) ────────────
export const colors = {
  // PRIMARY — the dashboard signature accent (warm amber)
  primary: tk.amber,
  primaryLight: tk.amberMid,
  primaryDark: tk.amberDark,
  primaryBg: tk.amberLight,

  // SECONDARY — dashboard blue (links, info actions)
  secondary: tk.blue,
  secondaryLight: '#4A82C4',
  secondaryDark: '#0D4A8C',
  secondaryBg: tk.blueLight,

  // ACCENT — soft amber highlight (rewards, XP)
  accent: tk.amberMid,
  accentLight: '#F8D98A',
  accentDark: tk.amberDark,
  accentBg: tk.amberLight,

  // SUCCESS — verified / completed
  success: tk.green,
  successLight: '#4FA37A',
  successDark: '#14613A',
  successBg: tk.greenLight,

  // ERROR
  error: tk.red,
  errorLight: '#E0897F',
  errorDark: '#962115',
  errorBg: tk.redLight,

  // WARNING — amber family
  warning: tk.amber,
  warningLight: tk.amberMid,
  warningDark: tk.amberDark,
  warningBg: tk.amberLight,

  // INFO — blue family
  info: tk.blue,
  infoLight: '#4A82C4',
  infoDark: '#0D4A8C',
  infoBg: tk.blueLight,

  // LOVE / compassion — warm red
  love: tk.red,
  loveLight: '#E0897F',
  loveDark: '#962115',
  loveBg: tk.redLight,

  // Neutrals — warm dashboard canvas + ink text
  bg: tk.canvas,
  surface: tk.white,
  surfaceAlt: tk.canvasDeep,
  text: tk.heading,
  mutedText: '#6E6A73',
  muted: '#A09BA5',
  border: tk.border,
  divider: tk.canvasDeep,
  disabled: tk.canvasDeep,

  overlay: 'rgba(24, 23, 26, 0.55)',
  overlayLight: 'rgba(24, 23, 26, 0.25)',
  overlayDark: 'rgba(24, 23, 26, 0.78)',
} as const

// ── Gradients ───────────────────────────────────────────────────────────────
export const gradients = {
  // Celebration — kept on the warm amber axis
  rainbow: 'linear-gradient(90deg, #A8680A 0%, #D4870A 35%, #F5C961 70%, #D4870A 100%)',
  // Primary CTA — solid ink wash (matches dashboard primary buttons)
  sky: 'linear-gradient(135deg, #242228 0%, #18171A 100%)',
  // Reward / XP
  sunrise: 'linear-gradient(135deg, #F5C961 0%, #D4870A 100%)',
  // Success / verified
  growth: 'linear-gradient(135deg, #4FA37A 0%, #14613A 100%)',
  // Compassion
  warmth: 'linear-gradient(135deg, #E0897F 0%, #C0392B 100%)',
  // Subtle surface wash for glass cards
  glassSky: 'linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(238,235,229,0.6) 100%)',
} as const

// ── Trust / verification badge colors ───────────────────────────────────────
export const badgeColors = {
  email_verified: { fg: tk.blue, bg: tk.blueLight, label: 'Email Verified' },
  phone_verified: { fg: tk.green, bg: tk.greenLight, label: 'Phone Verified' },
  identity_verified: { fg: tk.amberDark, bg: tk.amberLight, label: 'ID Verified' },
  community_verified: { fg: tk.blue, bg: tk.blueLight, label: 'Community Verified' },
  nonprofit_verified: { fg: '#5A4A82', bg: '#EDEAF5', label: 'Nonprofit Verified' },
  identity_basic: { fg: tk.blue, bg: tk.blueLight, label: 'ID+ Verified' },
  identity_premium: { fg: tk.amberDark, bg: tk.amberLight, label: 'ID+ Premium' },
} as const

// ── Gamification level theming (maps to backend LEVELS 1-6) ─────────────────
export const levelThemes: Record<number, { color: string; gradient: string; glow: string }> = {
  1: { color: tk.green, gradient: gradients.growth, glow: 'rgba(26,122,74,0.3)' },
  2: { color: tk.blue, gradient: 'linear-gradient(135deg,#4A82C4 0%,#1A5FA8 100%)', glow: 'rgba(26,95,168,0.3)' },
  3: { color: tk.amber, gradient: gradients.sunrise, glow: 'rgba(212,135,10,0.35)' },
  4: { color: tk.red, gradient: gradients.warmth, glow: 'rgba(192,57,43,0.3)' },
  5: { color: tk.ink, gradient: 'linear-gradient(135deg,#3D3A44 0%,#18171A 100%)', glow: 'rgba(24,23,26,0.35)' },
  6: { color: tk.amber, gradient: gradients.rainbow, glow: 'rgba(212,135,10,0.4)' },
}

// ── Trust-score → color scale (0-100) ───────────────────────────────────────
export function trustScoreColor(score: number): string {
  if (score >= 80) return colors.success
  if (score >= 50) return colors.primary
  if (score >= 25) return colors.accent
  return colors.muted
}

export const honestNeed = {
  colors,
  gradients,
  badgeColors,
  levelThemes,
  trustScoreColor,
}

export default honestNeed

// ── Page-scoped typography (Syne / DM Sans / DM Mono) ────────────────────────
/**
 * Rendered once by each profile entry page on a `.hn-dash` wrapper. Applies the
 * dashboard font stack: DM Sans body, Syne for headings, without each styled
 * component needing to opt in individually.
 */
export const ProfileGlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  .hn-dash {
    font-family: 'DM Sans', sans-serif;
    color: ${colors.text};
    -webkit-font-smoothing: antialiased;
  }

  .hn-dash h1,
  .hn-dash h2,
  .hn-dash h3,
  .hn-dash h4 {
    font-family: 'Syne', sans-serif;
    letter-spacing: -0.4px;
  }
`
