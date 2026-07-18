'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import styled from 'styled-components'

const Header = styled.header`
  position: sticky;
  top: 0;
  /* Must sit above page content so the navbar's hover dropdowns aren't
     covered. backdrop-filter below makes this a stacking context, which
     caps everything inside (incl. NavbarRoot z-index), so it has to be high. */
  z-index: 1000;
  width: 100%;
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 300ms ease-in-out;
`

// Routes under app/(app) render their own <Navbar> in that route group's
// layout. Skipping them here prevents a stacked double navbar.
const SELF_HEADERED_ROUTES = [
  '/contact',
  '/cookie-policy',
  '/privacy-policy',
  '/refund-policy',
  '/terms',
]

export default function LayoutHeader() {
  const pathname = usePathname() || '/'

  // The landing page ships its own full-width marketing header.
  if (pathname === '/') {
    return null
  }

  if (SELF_HEADERED_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))) {
    return null
  }

  // Rendered for signed-out visitors too. A shared campaign link is the most
  // common way someone first lands on the site, and gating the navbar behind
  // auth left them with no logo, no menu and no way home (user-reported).
  // Navbar already handles the signed-out state: public links + a Sign in CTA.
  return (
    <Header>
      <Navbar />
    </Header>
  )
}
