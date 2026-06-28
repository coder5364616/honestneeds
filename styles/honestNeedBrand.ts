/**
 * HonestNeed Brand Tokens — derived from the official logo.
 *
 * The logo is warm, hopeful and playful: a rainbow arc behind a sunny yellow
 * "Honest" wordmark and a sky-blue "Need" wordmark, sitting on a fresh-green
 * banner ("Get Your Needs Filled!"), surrounded by joyful community icons
 * (heart, gift, teddy bear, megaphone, sun, pizza). The palette below extracts
 * those hues and organizes them into a usable, accessible token system.
 *
 * This layer is shape-compatible with `styles/theme.ts` so it can be merged
 * into the existing ThemeProvider without breaking current components:
 *
 *   import theme from '@/styles/theme'
 *   import { honestNeed } from '@/styles/honestNeedBrand'
 *   const brandedTheme = { ...theme, colors: { ...theme.colors, ...honestNeed.colors } }
 *
 * Color psychology (why each role):
 *  - Sky Blue (Need)   → trust, calm, reliability        → PRIMARY / actions, links, focus
 *  - Sunny Yellow      → hope, optimism, energy          → ACCENT / rewards, XP, highlights
 *  - Warm Orange       → warmth, generosity, urgency     → SECONDARY / CTAs, donate
 *  - Fresh Green       → growth, success, "filled needs" → SUCCESS / verified, completed
 *  - Heart Red/Pink    → compassion, love, care          → LOVE / prayers, support
 *  - Rainbow gradient  → diversity, joy, community        → CELEBRATION / achievements
 */

// ── Raw logo hues (the source swatches) ────────────────────────────────
export const logoSwatches = {
  needBlue: '#29ABE2',       // "Need" wordmark
  needBlueDeep: '#1C7FB8',
  honestYellow: '#FFC20E',   // "Honest" wordmark
  honestOrange: '#F7931E',   // wordmark shading / gift
  bannerGreen: '#4CAF1F',    // "Get Your Needs Filled!" banner
  bannerGreenDeep: '#3A8417',
  heartRed: '#FF3B5C',       // heart icon
  megentaPink: '#E91E8C',    // megaphone / music note
  skyCloud: '#EAF6FD',       // clouds / sky behind
  sunGold: '#FFD23F',        // sun
} as const;

// ── Mapped semantic tokens (same keys as theme.ts colors) ──────────────
export const colors = {
  // PRIMARY — sky blue ("Need"): trust + primary actions
  primary: '#1C9BD8',
  primaryLight: '#5BC0EA',
  primaryDark: '#127099',
  primaryBg: '#E3F4FC',

  // SECONDARY — warm orange: generosity, donate CTAs
  secondary: '#F7931E',
  secondaryLight: '#FBB04C',
  secondaryDark: '#D9760A',
  secondaryBg: '#FEF0DC',

  // ACCENT — sunny yellow: rewards, XP, optimism highlights
  accent: '#FFC20E',
  accentLight: '#FFD557',
  accentDark: '#E0A400',
  accentBg: '#FFF6D6',

  // SUCCESS — fresh green: verified, completed, "need filled"
  success: '#4CAF1F',
  successLight: '#7FD24F',
  successDark: '#3A8417',
  successBg: '#EBF8E2',

  // ERROR
  error: '#EF4444',
  errorLight: '#FCA5A5',
  errorDark: '#DC2626',
  errorBg: '#FEF2F2',

  // WARNING — amber (distinct from accent yellow for contrast safety)
  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#B45309',
  warningBg: '#FEF3C7',

  // INFO — reuse the brand blue family, slightly cooler
  info: '#29ABE2',
  infoLight: '#7CCBEF',
  infoDark: '#1C7FB8',
  infoBg: '#E6F5FC',

  // LOVE / compassion — heart red/pink (prayers, support, encouragement)
  love: '#FF3B5C',
  loveLight: '#FF7088',
  loveDark: '#D81E40',
  loveBg: '#FFE8EC',

  // Neutrals — warm-tinted to match the friendly brand (not cold slate)
  bg: '#FBFCFE',
  surface: '#FFFFFF',
  surfaceAlt: '#F4F9FD',
  text: '#10243A',        // deep blue-charcoal (reads on white, ties to brand blue)
  mutedText: '#5B7186',
  muted: '#94A8BC',
  border: '#E2ECF4',
  divider: '#D2E0EC',
  disabled: '#EFF4F8',

  overlay: 'rgba(16, 36, 58, 0.55)',
  overlayLight: 'rgba(16, 36, 58, 0.25)',
  overlayDark: 'rgba(16, 36, 58, 0.78)',
} as const;

// ── Brand gradients (for hero cards, level-up, achievement moments) ────
export const gradients = {
  // Signature rainbow arc — use sparingly for celebration/achievements
  rainbow: 'linear-gradient(90deg, #FF3B5C 0%, #F7931E 22%, #FFC20E 42%, #4CAF1F 62%, #29ABE2 82%, #8E5BEA 100%)',
  // Primary hero (sky blue)
  sky: 'linear-gradient(135deg, #29ABE2 0%, #1C7FB8 100%)',
  // Reward / XP (sunny)
  sunrise: 'linear-gradient(135deg, #FFD23F 0%, #F7931E 100%)',
  // Success / verified
  growth: 'linear-gradient(135deg, #7FD24F 0%, #3A8417 100%)',
  // Compassion
  warmth: 'linear-gradient(135deg, #FF7088 0%, #E91E8C 100%)',
  // Subtle surface wash for glass cards
  glassSky: 'linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(227,244,252,0.6) 100%)',
} as const;

// ── Trust / verification badge colors (per backend verification_badges) ─
export const badgeColors = {
  email_verified: { fg: '#1C7FB8', bg: '#E6F5FC', label: 'Email Verified' },
  phone_verified: { fg: '#3A8417', bg: '#EBF8E2', label: 'Phone Verified' },
  identity_verified: { fg: '#D9760A', bg: '#FEF0DC', label: 'ID Verified' },
  community_verified: { fg: '#1C9BD8', bg: '#E3F4FC', label: 'Community Verified' },
  nonprofit_verified: { fg: '#8E5BEA', bg: '#F1EAFE', label: 'Nonprofit Verified' },
  // Identity tiers
  identity_basic: { fg: '#1C7FB8', bg: '#E6F5FC', label: 'ID+ Verified' },
  identity_premium: { fg: '#B8860B', bg: '#FFF6D6', label: 'ID+ Premium' },
} as const;

// ── Gamification level theming (maps to backend LEVELS 1-6) ────────────
export const levelThemes: Record<number, { color: string; gradient: string; glow: string }> = {
  1: { color: '#7FD24F', gradient: gradients.growth, glow: 'rgba(76,175,31,0.35)' },     // New Member
  2: { color: '#29ABE2', gradient: gradients.sky, glow: 'rgba(41,171,226,0.35)' },        // Supporter
  3: { color: '#F7931E', gradient: gradients.sunrise, glow: 'rgba(247,147,30,0.35)' },    // Community Builder
  4: { color: '#E91E8C', gradient: gradients.warmth, glow: 'rgba(233,30,140,0.35)' },     // Local Hero
  5: { color: '#8E5BEA', gradient: 'linear-gradient(135deg,#B388F5 0%,#6D32D9 100%)', glow: 'rgba(142,91,234,0.4)' }, // Impact Leader
  6: { color: '#FFC20E', gradient: gradients.rainbow, glow: 'rgba(255,194,14,0.45)' },    // Community Champion
};

// ── Trust-score → color scale (0-100) ──────────────────────────────────
export function trustScoreColor(score: number): string {
  if (score >= 80) return colors.success;
  if (score >= 50) return colors.primary;
  if (score >= 25) return colors.accent;
  return colors.muted;
}

export const honestNeed = {
  swatches: logoSwatches,
  colors,
  gradients,
  badgeColors,
  levelThemes,
  trustScoreColor,
};

export default honestNeed;
