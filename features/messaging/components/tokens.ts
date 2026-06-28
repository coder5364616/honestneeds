/**
 * Messaging design tokens — mirror the Creator Dashboard design system
 * (warm canvas + ink + amber/blue accents, Syne / DM Sans / DM Mono type).
 * Kept local to the messaging feature so the two surfaces stay visually in sync.
 */

export const tk = {
  // Core palette
  ink:         '#18171A',
  inkLight:    '#242228',
  inkMid:      '#302E35',
  inkBorder:   '#3D3A44',
  // Canvas
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBE5',
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

export const font = {
  heading: "'Syne', sans-serif",
  body:    "'DM Sans', sans-serif",
  mono:    "'DM Mono', monospace",
}
