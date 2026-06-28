'use client'

/**
 * FloatingBottomNav — premium floating mobile navigation for the authenticated
 * HonestNeed experience.
 *
 * Design language is lifted directly from the /dashboard system (the dark-ink
 * sidebar): an `#18171A` floating pill on the warm `#F7F5F1` canvas, amber
 * (`#D4870A`) active accents, Syne/DM Sans type, 8px radii and the dashboard's
 * `cubic-bezier(0.4,0,0.2,1)` motion curve. The active tab uses a Framer Motion
 * shared-layout (`layoutId`) pill so selection glides between items the same way
 * the sidebar's active indicator behaves — no bouncy / toy easing.
 *
 * Centering note: the bar is centered with flexbox (NavRoot is full-width with
 * `justify-content:center`), NOT `translateX(-50%)`. Framer Motion writes the
 * entrance `y` animation into the element's inline `transform`, which would
 * clobber a CSS translate and shove the bar off-center — flex centering avoids
 * that conflict entirely.
 *
 * The component self-gates (FloatingBottomNav): renders nothing for signed-out
 * users, on the marketing home page, auth screens, or the admin console (which
 * has its own chrome), and is hidden on desktop (≥1024px). The unread-count
 * query lives in the inner component so it only runs when the nav is actually
 * shown (i.e. for an authenticated user), respecting the rules of hooks.
 */

import React from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Home, Compass, Plus, MessageCircle, User } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUnreadMessageCount } from '@/api/hooks/useMessaging'

// ── Dashboard token palette (mirrors app/(creator)/dashboard `tk`) ───────────
const tk = {
  ink: '#18171A',
  inkLight: '#242228',
  inkMid: '#302E35',
  inkBorder: '#3D3A44',
  canvas: '#F7F5F1',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  amber: '#D4870A',
  amberMid: '#F5C961',
  amberDark: '#A8680A',
  red: '#C0392B',
}

const DESKTOP_BP = 1024 // matches Navbar / dashboard sidebar collapse point

// ── Navigation model ─────────────────────────────────────────────────────────
interface NavTab {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>
  href: string
}

// NOTE: routes map to canonical routes that exist in the app —
//  • Explore → /discover (the discovery feed; /explore redirects here)
//  • Create  → /campaigns/new (the real creation route; /campaigns/create redirects here)
const TABS: NavTab[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' },
  { id: 'explore', label: 'Explore', icon: Compass, href: '/discover' },
  { id: 'messages', label: 'Messages', icon: MessageCircle, href: '/messages' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
]

const CREATE_HREF = '/campaigns/new'

// Routes where the floating nav must never appear.
const HIDDEN_PREFIXES = ['/login', '/register', '/forgot-password', '/reset-password', '/auth', '/admin']

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/')
}

// ── Styled shell ──────────────────────────────────────────────────────────────
// Full-width track that centers the pill with flexbox so Framer Motion's inline
// transform (entrance `y`) never fights a CSS translate.
const NavRoot = styled(motion.nav)`
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  z-index: 950; /* below the top Header (1000), above page content */
  display: flex;
  justify-content: center;
  padding: 0 16px;
  pointer-events: none; /* let the gutters pass clicks through */

  @media (min-width: ${DESKTOP_BP}px) {
    display: none;
  }
`

const Pill = styled.div`
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(440px, 100%);
  height: 64px;
  padding: 0 8px;
  background: ${tk.ink};
  border: 1px solid ${tk.inkBorder};
  border-radius: 24px;
  box-shadow:
    0 1px 1px rgba(24, 23, 26, 0.04),
    0 8px 24px rgba(24, 23, 26, 0.18),
    0 18px 48px rgba(24, 23, 26, 0.16);
  font-family: 'DM Sans', sans-serif;
`

const TabButton = styled.button<{ $active: boolean }>`
  position: relative;
  flex: 1;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${p => (p.$active ? tk.white : tk.muted)};
  -webkit-tap-highlight-color: transparent;
  transition: color 180ms cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    color: ${tk.white};
  }

  &:focus-visible {
    outline: 2px solid ${tk.amber};
    outline-offset: 2px;
    border-radius: 14px;
  }
`

const IconWrap = styled(motion.span)`
  position: relative;
  z-index: 1;
  display: inline-flex;
`

const TabLabel = styled(motion.span)`
  position: relative;
  z-index: 1;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1px;
  line-height: 1;
`

// Shared-layout active background that glides between tabs.
const ActivePill = styled(motion.span)`
  position: absolute;
  inset: 5px 4px;
  z-index: 0;
  background: ${tk.inkMid};
  border-radius: 15px;
`

// Amber accent dot above the active icon — echoes the sidebar's amber bar.
const ActiveDot = styled(motion.span)`
  position: absolute;
  top: -3px;
  left: 50%;
  margin-left: -2.5px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${tk.amber};
`

const Badge = styled.span`
  position: absolute;
  top: 4px;
  left: calc(50% + 8px);
  z-index: 2;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${tk.red};
  color: ${tk.white};
  font-family: 'DM Mono', monospace;
  font-size: 0.55rem;
  font-weight: 500;
  border-radius: 100px;
  border: 2px solid ${tk.ink};
`

// Elevated center create button — gets its own fixed-width, full-height slot so
// it stays perfectly centered between the two tab pairs.
const CenterSlot = styled.div`
  flex: 0 0 60px;
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CreateButton = styled(motion.button)`
  width: 54px;
  height: 54px;
  margin-top: -28px; /* floats above the pill */
  border-radius: 18px;
  border: 3px solid ${tk.ink};
  background: linear-gradient(160deg, ${tk.amberMid} 0%, ${tk.amber} 55%, ${tk.amberDark} 100%);
  color: ${tk.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow:
    0 6px 16px rgba(212, 135, 10, 0.42),
    0 2px 4px rgba(24, 23, 26, 0.2);
  -webkit-tap-highlight-color: transparent;

  &:focus-visible {
    outline: 2px solid ${tk.amber};
    outline-offset: 3px;
  }
`

// Mobile-only global tweaks that should apply *only while the nav is present*.
// Because this is rendered inside the inner component, these rules mount/unmount
// with the nav — so the utility buttons only lift on routes where the bar shows
// (not on home / logged-out pages where they belong at the bottom corner).
//   • #main-content gets bottom padding so content scrolls clear of the bar.
//   • The AI (#hn-ai-*) and music (#hn-music-*) floating buttons are lifted above
//     the bar and stacked vertically (AI on top of music) instead of sitting in a
//     row at bottom-right where they'd collide with the nav. `!important` is
//     required to beat the music button's inline styles.
const BodySpacer = createGlobalStyle`
  @media (max-width: ${DESKTOP_BP - 1}px) {
    #main-content {
      padding-bottom: calc(100px + env(safe-area-inset-bottom, 0px));
    }

    /* Bottom of the stack — music button, just above the nav bar */
    #hn-music-btn,
    #hn-music-pulse {
      bottom: calc(96px + env(safe-area-inset-bottom, 0px)) !important;
      right: 16px !important;
    }

    /* Top of the stack — AI button, sits above the music button */
    #hn-ai-btn,
    #hn-ai-pulse {
      bottom: calc(158px + env(safe-area-inset-bottom, 0px)) !important;
      right: 14px !important; /* +2px vs music to centre the 52px button over the 48px one */
    }
  }
`

// ── Outer: gating only (no data hooks before the early return) ────────────────
export default function FloatingBottomNav() {
  const pathname = usePathname() || '/'
  const { user } = useAuthStore()

  const hidden =
    !user ||
    pathname === '/' ||
    HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (hidden) return null

  return <FloatingBottomNavInner pathname={pathname} />
}

// ── Inner: rendered only for an authenticated, eligible route ─────────────────
function FloatingBottomNavInner({ pathname }: { pathname: string }) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const { data: unreadCount = 0 } = useUnreadMessageCount()

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 480, damping: 38, mass: 0.7 }

  const renderTab = (tab: NavTab) => {
    const active = isActive(pathname, tab.href)
    const Icon = tab.icon
    const badge = tab.id === 'messages' && unreadCount > 0 ? unreadCount : 0
    return (
      <TabButton
        key={tab.id}
        $active={active}
        onClick={() => router.push(tab.href)}
        aria-label={badge ? `${tab.label}, ${badge} unread` : tab.label}
        aria-current={active ? 'page' : undefined}
      >
        {active && (
          <ActivePill layoutId="active-pill" transition={spring} aria-hidden />
        )}
        {badge ? <Badge aria-hidden>{badge > 99 ? '99+' : badge}</Badge> : null}
        <IconWrap
          animate={reduceMotion ? undefined : { scale: active ? 1.08 : 1, y: active ? -1 : 0 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
        >
          {active && <ActiveDot layoutId="active-dot" transition={spring} aria-hidden />}
          <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        </IconWrap>
        <AnimatePresence initial={false}>
          {active && (
            <TabLabel
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
              transition={{ duration: 0.18 }}
            >
              {tab.label}
            </TabLabel>
          )}
        </AnimatePresence>
      </TabButton>
    )
  }

  return (
    <>
      <BodySpacer />
      <NavRoot
        aria-label="Primary"
        initial={reduceMotion ? false : { y: 90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 320, damping: 32, delay: 0.05 }}
      >
        <Pill>
          {renderTab(TABS[0])}
          {renderTab(TABS[1])}

          <CenterSlot>
            <CreateButton
              onClick={() => router.push(CREATE_HREF)}
              aria-label="Create a campaign"
              whileTap={reduceMotion ? undefined : { scale: 0.9 }}
              whileHover={reduceMotion ? undefined : { scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            >
              <Plus size={26} strokeWidth={2.6} />
            </CreateButton>
          </CenterSlot>

          {renderTab(TABS[2])}
          {renderTab(TABS[3])}
        </Pill>
      </NavRoot>
    </>
  )
}
