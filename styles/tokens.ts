/**
 * Design System Tokens
 * Exported constants for use in styled-components and JavaScript
 */

/* Colors */
export const COLORS = {
  PRIMARY: '#6366F1',
  PRIMARY_LIGHT: '#818CF8',
  PRIMARY_DARK: '#4F46E5',
  PRIMARY_BG: '#FEF3C7',

  SECONDARY: '#F43F5E',
  SECONDARY_LIGHT: '#FB7185',
  SECONDARY_DARK: '#E11D48',
  SECONDARY_BG: '#FFE4E6',

  ACCENT: '#F59E0B',
  ACCENT_LIGHT: '#FBBF24',
  ACCENT_DARK: '#D97706',
  ACCENT_BG: '#FEF3C7',

  SUCCESS: '#10B981',
  SUCCESS_LIGHT: '#6EE7B7',
  SUCCESS_DARK: '#059669',
  SUCCESS_BG: '#ECFDF5',

  ERROR: '#EF4444',
  ERROR_LIGHT: '#FCA5A5',
  ERROR_DARK: '#DC2626',
  ERROR_BG: '#FEF2F2',

  WARNING: '#F59E0B',
  WARNING_LIGHT: '#FBBF24',
  WARNING_DARK: '#D97706',
  WARNING_BG: '#FEF3C7',

  INFO: '#3B82F6',
  INFO_LIGHT: '#93C5FD',
  INFO_DARK: '#1D4ED8',
  INFO_BG: '#EFF6FF',

  BG: '#F7F5F1',
  SURFACE: '#FFFFFF',
  TEXT: '#0F172A',
  MUTED_TEXT: '#64748B',
  MUTED: '#94A3B8',
  BORDER: '#E2E8F0',
  DIVIDER: '#CBD5E1',
  DISABLED: '#F1F5F9',

  OVERLAY: 'rgba(15, 23, 42, 0.5)',
  OVERLAY_LIGHT: 'rgba(15, 23, 42, 0.25)',
  OVERLAY_DARK: 'rgba(15, 23, 42, 0.75)',
};

/* Typography */
export const TYPOGRAPHY = {
  FONT_BODY:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  FONT_MONO: '"Courier New", monospace',

  SIZE_XS: '0.75rem',
  SIZE_SM: '0.875rem',
  SIZE_BASE: '1rem',
  SIZE_LG: '1.125rem',
  SIZE_XL: '1.25rem',
  SIZE_2XL: '1.5rem',
  SIZE_3XL: '1.875rem',
  SIZE_4XL: '2.25rem',

  WEIGHT_LIGHT: 300,
  WEIGHT_NORMAL: 400,
  WEIGHT_MEDIUM: 500,
  WEIGHT_SEMIBOLD: 600,
  WEIGHT_BOLD: 700,
  WEIGHT_EXTRABOLD: 800,

  LINE_HEIGHT_TIGHT: 1.2,
  LINE_HEIGHT_NORMAL: 1.5,
  LINE_HEIGHT_RELAXED: 1.75,
  LINE_HEIGHT_LOOSE: 2,

  LETTER_SPACING_TIGHT: '-0.01em',
  LETTER_SPACING_NORMAL: '0em',
  LETTER_SPACING_WIDE: '0.025em',
};

/* Spacing */
export const SPACING = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
};

/* Border Radius */
export const BORDER_RADIUS = {
  NONE: '0',
  XS: '0.125rem',
  SM: '0.25rem',
  BASE: '0.375rem',
  MD: '0.5rem',
  LG: '0.75rem',
  XL: '1rem',
  FULL: '9999px',
};

/* Shadows */
export const SHADOWS = {
  NONE: 'none',
  XS: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  SM: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  MD: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  LG: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  XL: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  FOCUS: '0 0 0 3px rgba(99, 102, 241, 0.5)',
};

/* Breakpoints */
export const BREAKPOINTS = {
  XS: '0px',
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
};

/* Media Queries */
export const MEDIA_QUERIES = {
  UP_XS: '@media (min-width: 0px)',
  UP_SM: '@media (min-width: 640px)',
  UP_MD: '@media (min-width: 768px)',
  UP_LG: '@media (min-width: 1024px)',
  UP_XL: '@media (min-width: 1280px)',

  DOWN_XS: '@media (max-width: 639px)',
  DOWN_SM: '@media (max-width: 767px)',
  DOWN_MD: '@media (max-width: 1023px)',
  DOWN_LG: '@media (max-width: 1279px)',
  DOWN_XL: '@media (max-width: 1919px)',
};

/* Transitions */
export const TRANSITIONS = {
  FAST: '150ms ease-in-out',
  BASE: '200ms ease-in-out',
  SLOW: '300ms ease-in-out',
};

/* Size Variants */
export const SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
};

/* Button Variants */
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
};

/* Badge Variants */
export const BADGE_VARIANTS = {
  DEFAULT: 'default',
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/* Status Colors Map */
export const STATUS_COLORS = {
  SUCCESS: COLORS.SUCCESS,
  ERROR: COLORS.ERROR,
  WARNING: COLORS.WARNING,
  INFO: COLORS.INFO,
  PRIMARY: COLORS.PRIMARY,
};
