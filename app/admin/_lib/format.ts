/** Shared formatting + status→badge helpers for the admin console. */

import styles from '../admin.module.css'

export const fmtMoney = (cents?: number) =>
  `$${((cents || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const fmtDollars = (dollars?: number) =>
  `$${(dollars || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const fmtNum = (n?: number) => (n || 0).toLocaleString()

export const fmtDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'

export const fmtDateTime = (d?: string) =>
  d ? new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

/** Map a status-ish string to one of the badge color classes. */
export function badgeClass(status?: string): string {
  const s = (status || '').toLowerCase()
  if (['approved', 'verified', 'active', 'completed', 'resolved', 'cleared', 'success', 'settled', 'low'].includes(s))
    return styles.badgeGreen
  if (['pending', 'investigating', 'needs_more_info', 'pending_hold', 'scheduled', 'medium', 'draft'].includes(s))
    return styles.badgeYellow
  if (['rejected', 'blocked', 'failed', 'critical', 'confirmed_fraud', 'cancelled', 'refunded'].includes(s))
    return styles.badgeRed
  if (['flagged', 'escalated', 'high', 'paused'].includes(s)) return styles.badgePurple
  if (['open', 'new'].includes(s)) return styles.badgeBlue
  return styles.badgeGray
}

/** Permission check matching backend semantics ('*' = all). */
export const hasPerm = (perms: string[] | undefined, required: string): boolean =>
  !!perms && (perms.includes('*') || perms.includes(required))
