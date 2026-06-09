'use client'

import styled, { css, keyframes } from 'styled-components'
import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Compass,
  Gift,
  Heart,
  Share2,
  FileText,
  Banknote,
  Settings,
  Layers,
  Briefcase,
  LogOut,
  User,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────

interface NavLink {
  label: string
  href: string
  roles?: string[]
  icon?: React.ReactNode
  group?: string
}

// ─── Nav Link Definitions ───────────────────────────────────────────────────

const publicNavLinks: NavLink[] = [
  { label: 'Browse Campaigns', href: '/campaigns', icon: <Compass size={15} />, group: 'Explore' },
  { label: 'Sweepstakes', href: '/sweepstakes', icon: <Gift size={15} />, group: 'Explore' },
]

const authenticatedNavLinks: NavLink[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard size={15} />,
    roles: ['supporter', 'creator', 'admin'],
    group: 'General',
  },
]

const supporterNavLinks: NavLink[] = [
  { label: 'My Donations', href: '/donations', icon: <Heart size={15} />, roles: ['supporter'], group: 'My Activity' },
  { label: 'My Shares', href: '/shares', icon: <Share2 size={15} />, roles: ['supporter'], group: 'My Activity' },
  { label: 'Sweepstakes', href: '/sweepstakes', icon: <Gift size={15} />, roles: ['supporter'], group: 'My Activity' },
]

const creatorNavLinks: NavLink[] = [
  { label: 'My Campaigns', href: '/dashboard/campaigns', icon: <FileText size={15} />, roles: ['creator', 'admin'], group: 'Creator Tools' },
  { label: 'Sharers Payouts', href: '/sharers-payouts', icon: <Banknote size={15} />, roles: ['creator', 'admin'], group: 'Creator Tools' },
  { label: 'Settings', href: '/settings', icon: <Settings size={15} />, roles: ['creator', 'admin'], group: 'Creator Tools' },
]

const adminNavLinks: NavLink[] = [
  { label: 'Manage Sweepstakes', href: '/admin/sweepstakes', icon: <Layers size={15} />, roles: ['admin'], group: 'Admin' },
  { label: 'Manage Sponsorships', href: '/admin/sponsorships', icon: <Briefcase size={15} />, roles: ['admin'], group: 'Admin' },
]

// ─── Design Tokens ──────────────────────────────────────────────────────────

const BRAND = '#667eea'
const BRAND_DARK = '#5a6fd8'
const BRAND_BG = 'rgba(102, 126, 234, 0.08)'
const BRAND_BG_HOVER = 'rgba(102, 126, 234, 0.12)'

// ─── Styled Components ──────────────────────────────────────────────────────

const NavbarRoot = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
  background: rgba(247, 245, 241, 0.92);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid rgba(226, 221, 214, 0.6);
  transition: box-shadow 200ms ease;

  &[data-scrolled='true'] {
    box-shadow: 0 1px 24px rgba(0, 0, 0, 0.06);
  }
`

const NavInner = styled.nav`
  max-width: 1400px;
  margin: 0 auto;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  gap: 1rem;

  @media (min-width: 1024px) {
    padding: 0 2rem;
  }
`

// ── Logo ────────────────────────────────────────────────────────────────────

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
  outline: none;
  border-radius: 6px;

  &:focus-visible {
    box-shadow: 0 0 0 2px ${BRAND};
  }

  img {
    height: 26px;
    width: auto;
    display: block;
  }
`

const LogoText = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.02em;

  @media (max-width: 639px) {
    display: none;
  }
`

const LogoShort = styled.span`
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.02em;

  @media (min-width: 640px) {
    display: none;
  }
`

// ── Desktop Nav ──────────────────────────────────────────────────────────────

const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: 0.125rem;
  flex: 1;
  justify-content: center;

  @media (min-width: 1024px) {
    display: flex;
  }
`

const flatLinkStyle = css<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.7rem;
  border-radius: 7px;
  font-size: 0.8375rem;
  font-weight: 500;
  color: ${({ $active }) => ($active ? BRAND : '#374151')};
  text-decoration: none;
  background: ${({ $active }) => ($active ? BRAND_BG : 'transparent')};
  border: none;
  cursor: pointer;
  transition: background 150ms ease, color 150ms ease;
  position: relative;
  white-space: nowrap;

  &:hover {
    background: ${({ $active }) => ($active ? BRAND_BG_HOVER : '#f5f5f5')};
    color: ${({ $active }) => ($active ? BRAND : '#111')};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${BRAND};
  }
`

const FlatNavLink = styled(Link)<{ $active?: boolean }>`
  ${flatLinkStyle}
`

// ── Dropdown ────────────────────────────────────────────────────────────────

const DropdownWrapper = styled.div`
  position: relative;
`

const DropdownTrigger = styled.button<{ $active?: boolean }>`
  ${flatLinkStyle}
  background: ${({ $active }) => ($active ? BRAND_BG : 'transparent')};
  color: ${({ $active }) => ($active ? BRAND : '#374151')};

  &:hover {
    background: ${({ $active }) => ($active ? BRAND_BG_HOVER : '#f5f5f5')};
    color: ${({ $active }) => ($active ? BRAND : '#111')};
  }
`

const DropdownChevron = styled(ChevronDown)<{ $open: boolean }>`
  width: 14px;
  height: 14px;
  transition: transform 200ms ease;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
  opacity: 0.6;
`

const dropdownIn = keyframes`
  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  min-width: 200px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0.35rem;
  z-index: 200;
  animation: ${dropdownIn} 150ms ease forwards;
`

const DropdownItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8375rem;
  font-weight: 500;
  color: ${({ $active }) => ($active ? BRAND : '#374151')};
  background: ${({ $active }) => ($active ? BRAND_BG : 'transparent')};
  text-decoration: none;
  transition: background 120ms ease, color 120ms ease;

  svg {
    opacity: 0.7;
    flex-shrink: 0;
  }

  &:hover {
    background: ${({ $active }) => ($active ? BRAND_BG_HOVER : '#f5f5f5')};
    color: ${({ $active }) => ($active ? BRAND_DARK : '#111')};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${BRAND} inset;
  }
`

// ── Right section ────────────────────────────────────────────────────────────

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
`

const AuthButtons = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 640px) {
    display: flex;
  }
`

// ── Avatar / User Menu ───────────────────────────────────────────────────────

const AvatarMenuWrapper = styled.div`
  position: relative;
  display: none;

  @media (min-width: 768px) {
    display: block;
  }
`

const AvatarButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;

  &:hover {
    background: #f5f5f5;
    border-color: rgba(0, 0, 0, 0.15);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${BRAND};
  }
`

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${BRAND};
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  flex-shrink: 0;
`

const AvatarChevron = styled(ChevronDown)<{ $open: boolean }>`
  width: 14px;
  height: 14px;
  color: #6b7280;
  transition: transform 200ms ease;
  transform: ${({ $open }) => ($open ? 'rotate(180deg)' : 'rotate(0deg)')};
`

const UserDropdown = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 220px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0.35rem;
  z-index: 200;
  animation: ${dropdownIn} 150ms ease forwards;
`

const UserInfo = styled.div`
  padding: 0.6rem 0.75rem 0.5rem;
  pointer-events: none;
`

const UserName = styled.p`
  font-size: 0.8375rem;
  font-weight: 600;
  color: #111;
  margin: 0 0 2px;
  line-height: 1.3;
`

const UserEmail = styled.p`
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DropdownDivider = styled.hr`
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  margin: 0.35rem 0;
`

const DropdownActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8375rem;
  font-weight: 500;
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 120ms ease;

  &:hover {
    background: #fef2f2;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px #ef4444 inset;
  }

  svg {
    opacity: 0.8;
    flex-shrink: 0;
  }
`

// ── Mobile Button ────────────────────────────────────────────────────────────

const MobileMenuToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(226, 221, 214, 0.8);
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: background 150ms ease;

  @media (min-width: 768px) {
    display: none;
  }

  &:hover {
    background: rgba(26, 95, 168, 0.08);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${BRAND};
  }
`

// ── Mobile Drawer ────────────────────────────────────────────────────────────

const DrawerOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 9998;
  backdrop-filter: blur(2px);
`

const DrawerPanel = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(340px, 90vw);
  background: #f7f5f1;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(226, 221, 214, 0.6);
  flex-shrink: 0;
`

const DrawerLogoText = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #111;
  letter-spacing: -0.02em;
`

const DrawerClose = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 7px;
  border: 1px solid rgba(226, 221, 214, 0.8);
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: rgba(26, 95, 168, 0.08);
  }
`

const DrawerBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const DrawerLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ $active }) => ($active ? BRAND : '#374151')};
  background: ${({ $active }) => ($active ? BRAND_BG : 'transparent')};
  text-decoration: none;
  transition: background 120ms ease, color 120ms ease;

  svg {
    flex-shrink: 0;
    opacity: ${({ $active }) => ($active ? 1 : 0.6)};
  }

  &:hover {
    background: ${({ $active }) => ($active ? BRAND_BG_HOVER : 'rgba(226, 221, 214, 0.4)')};
    color: ${({ $active }) => ($active ? BRAND_DARK : '#111')};
  }
`

const DrawerSection = styled.div`
  margin-top: 0.5rem;
`

const DrawerSectionHeader = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.4rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #9ca3af;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background 120ms ease;

  &:hover {
    background: #f9f9f9;
    color: #6b7280;
  }
`

const DrawerSectionLinks = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  overflow: hidden;
`

const DrawerFooter = styled.div`
  padding: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  flex-shrink: 0;
`

const DrawerUserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  margin-bottom: 0.5rem;
`

const DrawerUserInfo = styled.div`
  flex: 1;
  min-width: 0;
`

const DrawerUserName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111;
  margin: 0;
  line-height: 1.3;
`

const DrawerUserEmail = styled.p`
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DrawerSignOut = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.65rem 0.75rem;
  border-radius: 9px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #ef4444;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 120ms ease;
  text-align: left;

  &:hover {
    background: #fef2f2;
  }

  svg {
    opacity: 0.8;
    flex-shrink: 0;
  }
`

const DrawerAuthButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name?: string): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [scrolled, setScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  // SSR-safe portal mount
  useEffect(() => { setIsMounted(true) }, [])

  // Scroll listener for shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close on route change
  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  // Escape key closes everything
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null)
        setUserMenuOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Dropdown hover handlers (shared leaveTimer fixes the gap bug)
  const handleDropdownEnter = useCallback((group: string) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setOpenDropdown(group)
  }, [])

  const handleDropdownLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setOpenDropdown(null), 150)
  }, [])

  // User menu hover handlers
  const handleUserMenuEnter = useCallback(() => {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current)
    setUserMenuOpen(true)
  }, [])

  const handleUserMenuLeave = useCallback(() => {
    userMenuTimer.current = setTimeout(() => setUserMenuOpen(false), 150)
  }, [])

  const handleLogout = useCallback(async () => {
    clearAuth()
    setUserMenuOpen(false)
    setMobileOpen(false)
    router.push('/')
  }, [clearAuth, router])

  const isActive = useCallback(
    (href: string) => pathname === href || pathname?.startsWith(href + '/'),
    [pathname]
  )

  const toggleSection = useCallback((section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }, [])

  // ── Nav link resolution ────────────────────────────────────────────────────

  const getVisibleLinks = useCallback((): NavLink[] => {
    if (!isAuthenticated) return publicNavLinks

    const role = user?.role || 'supporter'
    const links: NavLink[] = [
      ...authenticatedNavLinks.filter((l) => !l.roles || l.roles.includes(role)),
      ...publicNavLinks,
    ]

    if (role === 'supporter') {
      links.push(...supporterNavLinks.filter((l) => l.roles?.includes('supporter')))
    } else if (role === 'creator') {
      links.push(...creatorNavLinks.filter((l) => l.roles?.includes('creator')))
      links.push(...supporterNavLinks.filter((l) => l.roles?.includes('supporter')))
    } else if (role === 'admin') {
      links.push(...creatorNavLinks.filter((l) => l.roles?.includes('admin')))
      links.push(...adminNavLinks.filter((l) => l.roles?.includes('admin')))
      links.push(...supporterNavLinks.filter((l) => l.roles?.includes('supporter')))
    }

    return links
  }, [isAuthenticated, user?.role])

  const groupLinks = useCallback((links: NavLink[]) => {
    const grouped: Record<string, NavLink[]> = {}
    links.forEach((link) => {
      const g = link.group || 'General'
      if (!grouped[g]) grouped[g] = []
      grouped[g].push(link)
    })
    return grouped
  }, [])

  const visibleLinks = getVisibleLinks()
  const grouped = groupLinks(visibleLinks)
  const groupEntries = Object.entries(grouped)

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <NavbarRoot data-scrolled={scrolled}>
        <NavInner role="navigation" aria-label="Main navigation">

          {/* Logo */}
          <Logo href="/" aria-label="HonestNeed home">
            <img src="/1000019752.png" alt="" aria-hidden="true" />
            <LogoText>HonestNeed</LogoText>
            <LogoShort>Honest Need</LogoShort>
          </Logo>

          {/* Desktop Nav */}
          <DesktopNav>
            {groupEntries.map(([group, links]) => {
              const anyActive = links.some((l) => isActive(l.href))

              // Single link in group → flat link
              if (links.length === 1) {
                const link = links[0]
                return (
                  <FlatNavLink
                    key={link.href}
                    href={link.href}
                    $active={isActive(link.href)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.icon}
                    {link.label}
                  </FlatNavLink>
                )
              }

              // Multiple links → dropdown
              return (
                <DropdownWrapper
                  key={group}
                  onMouseEnter={() => handleDropdownEnter(group)}
                  onMouseLeave={handleDropdownLeave}
                >
                  <DropdownTrigger
                    $active={anyActive}
                    aria-haspopup="true"
                    aria-expanded={openDropdown === group}
                  >
                    {links[0].icon}
                    {group}
                    <DropdownChevron $open={openDropdown === group} />
                  </DropdownTrigger>

                  {openDropdown === group && (
                    <DropdownMenu role="menu">
                      {links.map((link) => (
                        <DropdownItem
                          key={link.href}
                          href={link.href}
                          $active={isActive(link.href)}
                          role="menuitem"
                          aria-current={isActive(link.href) ? 'page' : undefined}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {link.icon}
                          {link.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  )}
                </DropdownWrapper>
              )
            })}
          </DesktopNav>

          {/* Right section */}
          <RightSection>
            {!isAuthenticated ? (
              <AuthButtons>
                <Button variant="ghost" as="link" href="/login" size="sm">
                  Sign in
                </Button>
                <Button variant="primary" as="link" href="/register" size="sm">
                  Get started
                </Button>
              </AuthButtons>
            ) : (
              <AvatarMenuWrapper
                onMouseEnter={handleUserMenuEnter}
                onMouseLeave={handleUserMenuLeave}
              >
                <AvatarButton
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                  aria-label={`Account menu for ${user?.name || 'User'}`}
                >
                  <Avatar aria-hidden="true">{getInitials(user?.name)}</Avatar>
                  <AvatarChevron $open={userMenuOpen} />
                </AvatarButton>

                {userMenuOpen && (
                  <UserDropdown role="menu" aria-orientation="vertical">
                    <UserInfo aria-hidden="true">
                      <UserName>{user?.name}</UserName>
                      <UserEmail>{user?.email || 'No email set'}</UserEmail>
                    </UserInfo>
                    <DropdownDivider />
                    <DropdownActionButton
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      Sign out
                    </DropdownActionButton>
                  </UserDropdown>
                )}
              </AvatarMenuWrapper>
            )}

            {/* Mobile toggle */}
            <MobileMenuToggle
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={18} />
            </MobileMenuToggle>
          </RightSection>
        </NavInner>
      </NavbarRoot>

      {/* ── Mobile Drawer (portalled to body to escape stacking contexts) ── */}
      {isMounted && createPortal(
        <AnimatePresence>
          {mobileOpen && (
            <>
              <DrawerOverlay
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
              />

              <DrawerPanel
                key="panel"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 380, damping: 38, mass: 0.8 }}
              >
                {/* Drawer Header */}
                <DrawerHeader>
                  <DrawerLogoText>HonestNeed</DrawerLogoText>
                  <DrawerClose
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                  >
                    <X size={16} />
                  </DrawerClose>
                </DrawerHeader>

                {/* Drawer Body */}
                <DrawerBody>
                  {!isAuthenticated ? (
                    <>
                      {publicNavLinks.map((link) => (
                        <DrawerLink
                          key={link.href}
                          href={link.href}
                          $active={isActive(link.href)}
                          onClick={() => setMobileOpen(false)}
                        >
                          {link.icon}
                          {link.label}
                        </DrawerLink>
                      ))}
                      <DrawerAuthButtons>
                        <Button variant="ghost" as="link" href="/login" onClick={() => setMobileOpen(false)}>
                          Sign in
                        </Button>
                        <Button variant="primary" as="link" href="/register" onClick={() => setMobileOpen(false)}>
                          Get started
                        </Button>
                      </DrawerAuthButtons>
                    </>
                  ) : (
                    groupEntries.map(([group, links]) => {
                      const isSectionOpen = openSections[group] !== false
                      return (
                        <DrawerSection key={group}>
                          <DrawerSectionHeader
                            onClick={() => toggleSection(group)}
                            aria-expanded={isSectionOpen}
                          >
                            <span>{group}</span>
                            <ChevronRight
                              size={13}
                              style={{
                                transform: isSectionOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 200ms ease',
                                opacity: 0.5,
                              }}
                            />
                          </DrawerSectionHeader>
                          <AnimatePresence initial={false}>
                            {isSectionOpen && (
                              <DrawerSectionLinks
                                key="content"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                              >
                                {links.map((link) => (
                                  <DrawerLink
                                    key={link.href}
                                    href={link.href}
                                    $active={isActive(link.href)}
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {link.icon}
                                    {link.label}
                                  </DrawerLink>
                                ))}
                              </DrawerSectionLinks>
                            )}
                          </AnimatePresence>
                        </DrawerSection>
                      )
                    })
                  )}
                </DrawerBody>

                {/* Drawer Footer */}
                {isAuthenticated && (
                  <DrawerFooter>
                    <DrawerUserRow>
                      <Avatar>{getInitials(user?.name)}</Avatar>
                      <DrawerUserInfo>
                        <DrawerUserName>{user?.name}</DrawerUserName>
                        <DrawerUserEmail>{user?.email || 'No email set'}</DrawerUserEmail>
                      </DrawerUserInfo>
                    </DrawerUserRow>
                    <DrawerSignOut onClick={handleLogout}>
                      <LogOut size={15} />
                      Sign out
                    </DrawerSignOut>
                  </DrawerFooter>
                )}
              </DrawerPanel>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}