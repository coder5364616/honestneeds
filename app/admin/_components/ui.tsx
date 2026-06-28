'use client'

import { ReactNode, useState } from 'react'
import styles from '../admin.module.css'
import { badgeClass } from '../_lib/format'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className={styles.header}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className={styles.row}>{actions}</div>}
    </div>
  )
}

export function Stat({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: string; accent?: boolean }) {
  return (
    <div className={`${styles.statCard} ${accent ? styles.accent : ''}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  )
}

export function Badge({ status, label }: { status?: string; label?: string }) {
  return <span className={`${styles.badge} ${badgeClass(status)}`}>{label ?? status ?? '—'}</span>
}

export function Loading({ text = 'Loading…' }: { text?: string }) {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      {text}
    </div>
  )
}

export function ErrorBlock({ message = 'Something went wrong.' }: { message?: string }) {
  return <div className={styles.error}>{message}</div>
}

export function Empty({ text = 'Nothing here yet.' }: { text?: string }) {
  return <div className={styles.empty}>{text}</div>
}

export function Pagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number
  totalPages: number
  total: number
  onChange: (p: number) => void
}) {
  return (
    <div className={styles.pagination}>
      <span className={styles.pageInfo}>
        Page {page} of {totalPages} · {total.toLocaleString()} total
      </span>
      <div className={styles.row}>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}

/** Lightweight modal that collects an optional reason/notes string then confirms. */
export function ReasonModal({
  title,
  label = 'Reason',
  required,
  confirmLabel = 'Confirm',
  danger,
  onConfirm,
  onClose,
}: {
  title: string
  label?: string
  required?: boolean
  confirmLabel?: string
  danger?: boolean
  onConfirm: (reason: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState('')
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <textarea
          className={styles.textarea}
          placeholder={label}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className={styles.modalActions}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>
            Cancel
          </button>
          <button
            className={`${styles.btn} ${danger ? styles.btnDanger : styles.btnPrimary}`}
            disabled={required && !text.trim()}
            onClick={() => onConfirm(text.trim())}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export { styles as adminStyles }
