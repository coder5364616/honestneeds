'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { Bell } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { colors, borderRadius } from '@/lib/theme'
import { useUnreadNotificationCount } from '@/api/hooks/useNotifications'
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications'
import { NotificationDropdown } from './NotificationDropdown'

/**
 * NotificationBell — bell icon + unread badge + dropdown panel.
 * Drop into DashboardHeader's ButtonGroup (it already reserves
 * `unreadCount` / `onNotificationsClick` for "Phase 4: Notifications").
 */

const Wrap = styled.div`
  position: relative;
`

const BellButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${borderRadius.full};
  border: 1px solid ${colors.border};
  background: ${colors.surface};
  color: ${colors.text};
  cursor: pointer;
  transition: background 150ms ease;
  &:hover { background: ${colors.background}; }
`

const Badge = styled(motion.span)`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: ${borderRadius.full};
  background: ${colors.secondary};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${colors.surface};
`

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  // Keep the badge live via the realtime socket (invalidates notif queries) and
  // drive the arrival UX (toast + sound + browser notification).
  useRealtimeNotifications()
  const { data: unread = 0 } = useUnreadNotificationCount()

  // SSR-safe portal mount.
  useEffect(() => setMounted(true), [])

  // Capture the bell's viewport position so the portaled panel can anchor to it.
  const measure = useCallback(() => {
    if (btnRef.current) setAnchor(btnRef.current.getBoundingClientRect())
  }, [])

  const toggle = useCallback(() => {
    if (!open) measure() // capture anchor position before opening
    setOpen((v) => !v)
  }, [open, measure])

  // The panel is portaled to <body> (to escape the navbar's backdrop-filter
  // containing block), so it is NOT inside wrapRef. Treat clicks inside the
  // panel (tagged with data-notif-panel) as "inside" too.
  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (wrapRef.current?.contains(t)) return
      if (t.closest('[data-notif-panel]')) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onReflow = () => measure()
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open, measure])

  return (
    <Wrap ref={wrapRef}>
      <BellButton
        ref={btnRef}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
      >
        <Bell size={20} />
        <AnimatePresence>
          {unread > 0 && (
            <Badge
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 18 }}
            >
              {unread > 99 ? '99+' : unread}
            </Badge>
          )}
        </AnimatePresence>
      </BellButton>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <NotificationDropdown anchor={anchor} onClose={() => setOpen(false)} />
            )}
          </AnimatePresence>,
          document.body
        )}
    </Wrap>
  )
}
