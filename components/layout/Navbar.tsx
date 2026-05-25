'use client'

import styled from 'styled-components'
import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import Button from '@/components/ui/Button'
import { Menu, X, ChevronDown, Home, PlusCircle, MessageSquare, Settings, LogOut, Shield } from 'lucide-react'

interface NavLink {
  label: string
  href: string
  roles?: string[]
  icon?: React.ReactNode
  badge?: number
  group?: string
}

// Public navigation links
const publicNavLinks: NavLink[] = [
  { label: 'Browse Campaigns', href: '/campaigns', icon: '🎯', group: 'Explore' },
  { label: 'Sweepstakes', href: '/sweepstakes', icon: '🎁', group: 'Explore' },
]

// Authenticated user navigation links (all roles)
const authenticatedNavLinks: NavLink[] = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['supporter', 'creator', 'admin'] },
]

// Supporter-specific links
const supporterNavLinks: NavLink[] = [
  { label: 'My Donations', href: '/donations', icon: '❤️', roles: ['supporter'], group: 'My Activity' },
  { label: 'My Shares', href: '/shares', icon: '📤', roles: ['supporter'], group: 'My Activity' },
  { label: 'Sweepstakes', href: '/sweepstakes', icon: '🎁', roles: ['supporter'], group: 'My Activity' },
]

// Creator-specific links
const creatorNavLinks: NavLink[] = [
  { label: 'My Campaigns', href: '/dashboard/campaigns', icon: '📝', roles: ['creator', 'admin'], group: 'Creator Tools' },
  { label: 'Sharers Payouts', href: '/sharers-payouts', icon: '💳', roles: ['creator', 'admin'], group: 'Creator Tools' },
  { label: 'Settings', href: '/settings', icon: '⚙️', roles: ['creator', 'admin'], group: 'Creator Tools' },
]

// Shared authenticated links
const sharedAuthLinks: NavLink[] = []

// Admin-specific links
const adminNavLinks: NavLink[] = [
  
  { label: 'Manage Sweepstakes', href: '/admin/sweepstakes', icon: '🎲', roles: ['admin'], group: 'Admin Panel' },
  { label: 'Manage Sponsorships', href: '/admin/sponsorships', icon: '💼', roles: ['admin'], group: 'Admin Panel' },
  
]

// Styled Components
const NavWrapper = styled.nav`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  height: 4rem;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  position: relative;

  @media (min-width: 640px) {
    padding: 0 1.5rem;
  }

  @media (min-width: 1024px) {
    padding: 0 2rem;
    gap: 2rem;
  }
`

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: #667eea;
  text-decoration: none;
  transition: color 200ms ease-out;

  &:hover {
    color: #764ba2;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 4px;
    border-radius: 4px;
  }

  img {
    display: block;
    height: 24px;
    width: auto;
  }

  span:first-child {
    font-size: 1.5rem;
  }

  &:hover svg {
    color: #764ba2;
  }

  span:nth-child(2) {
    @media (max-width: 639px) {
      display: none;
    }
  }

  span:nth-child(3) {
    @media (min-width: 640px) {
      display: none;
    }
  }
`

const DesktopNav = styled.div`
  display: none;
  align-items: center;
  gap: 0.25rem;
  justify-content: center;
  flex: 1;

  @media (min-width: 1024px) {
    display: flex;
  }
`

const NavDropdown = styled.div`
  position: relative;
  display: inline-block;
`

const NavDropdownButton = styled.button<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.$isActive ? '#667eea' : '#1f2937'};
  background: none;
  border: none;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 200ms ease-out, color 200ms ease-out;
  border-bottom: ${props => props.$isActive ? '2px solid #667eea' : 'none'};
  padding-bottom: ${props => props.$isActive ? 'calc(0.5rem - 2px)' : '0.5rem'};

  &:hover {
    background-color: #f3f4f6;
    color: #667eea;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
    border-radius: 2px;
  }
`

const NavDropdownChevron = styled(ChevronDown)<{ $isOpen: boolean }>`
  transition: transform 200ms ease-out;
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  width: 16px;
  height: 16px;
`

const NavDropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  min-width: 200px;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 50;
`

const NavDropdownLink = styled(Link)<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: ${props => props.$isActive ? '#667eea' : '#1f2937'};
  text-decoration: none;
  transition: background-color 200ms ease-out;
  font-weight: ${props => props.$isActive ? '600' : '500'};

  &:hover {
    background-color: #f3f4f6;
    color: #667eea;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: -2px;
  }
`

const NavLink = styled(Link)<{ $isActive?: boolean }>`
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.$isActive ? '#667eea' : '#1f2937'};
  text-decoration: none;
  transition: background-color 200ms ease-out, color 200ms ease-out;
  border-bottom: ${props => props.$isActive ? '2px solid #667eea' : 'none'};
  padding-bottom: ${props => props.$isActive ? 'calc(0.5rem - 2px)' : '0.5rem'};

  &:hover {
    background-color: #f3f4f6;
    color: #667eea;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
    border-radius: 2px;
  }
`

const NavGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-left: 1px solid #e5e7eb;
  padding-left: 0.5rem;
  margin-left: 0.5rem;

  &:first-child {
    border-left: none;
    margin-left: 0;
    padding-left: 0;
  }
`

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 640px) {
    gap: 1rem;
  }
`

const AuthButtonsContainer = styled.div`
  display: none;
  gap: 0.5rem;

  @media (min-width: 640px) {
    display: flex;
  }
`

const UserMenuContainer = styled.div`
  display: none;
  position: relative;

  @media (min-width: 768px) {
    display: block;
  }
`

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #1f2937;
  transition: background-color 200ms ease-out;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  span {
    font-size: 0.875rem;
    font-weight: 500;
  }
`

const ChevronIcon = styled(ChevronDown)<{ $isOpen: boolean }>`
  transition: transform 200ms ease-out;
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
`

const UserMenuDropdown = styled.div`
  position: absolute;
  right: 0;
  margin-top: 0.5rem;
  width: 12rem;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  z-index: 50;
`

const MenuLink = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #1f2937;
  text-decoration: none;
  transition: background-color 200ms ease-out;

  &:hover {
    background-color: #f3f4f6;
    color: #667eea;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: -2px;
  }
`

const MenuButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 200ms ease-out;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: -2px;
  }
`

const MenuDivider = styled.hr`
  margin: 0.25rem 0;
  border: none;
  border-top: 1px solid #e5e7eb;
`

const MobileMenuButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 0.375rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #1f2937;
  transition: background-color 200ms ease-out;

  @media (min-width: 768px) {
    display: none;
  }

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`

const MobileMenu = styled.div`
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  display: none;
  z-index: 40;
  max-height: calc(100vh - 4rem);
  overflow-y: auto;

  @media (max-width: 767px) {
    display: block;
  }
`

const MobileMenuContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const MobileMenuLink = styled(Link)`
  display: block;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  color: #1f2937;
  text-decoration: none;
  transition: background-color 200ms ease-out;

  &:hover {
    background-color: #f3f4f6;
    color: #667eea;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`

const MobileMenuSection = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const MobileMenuButton2 = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 1rem;
  font-weight: 500;
  color: #dc2626;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 200ms ease-out;

  &:hover {
    background-color: #f3f4f6;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
`

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false)
    setIsUserMenuOpen(false)
    setOpenDropdown(null)
  }, [pathname])

  const handleLogout = useCallback(async () => {
    clearAuth()
    setIsUserMenuOpen(false)
    setIsOpen(false)
    router.push('/')
  }, [clearAuth, router])

  // Filter and organize navigation links by role
  const getNavigationLinks = useCallback(() => {
    if (!isAuthenticated) {
      return { public: publicNavLinks, authenticated: [] }
    }

    const userRole = user?.role || 'supporter'
    const allAuthLinks: NavLink[] = [
      ...authenticatedNavLinks.filter(l => !l.roles || l.roles.includes(userRole)),
    ]

    // Add public links that don't require auth (for authenticated users)
    allAuthLinks.push(
      ...publicNavLinks.filter(l => !l.roles || l.roles.includes(userRole))
    )

    // Add role-specific links
    if (userRole === 'supporter') {
      // Supporters get their own links
      allAuthLinks.push(...supporterNavLinks.filter(l => l.roles?.includes('supporter')))
    } else if (userRole === 'creator') {
      // Creators get creator-specific, supporter, and shared links
      allAuthLinks.push(...creatorNavLinks.filter(l => l.roles?.includes('creator')))
      allAuthLinks.push(...supporterNavLinks.filter(l => l.roles?.includes('supporter')))
      allAuthLinks.push(...sharedAuthLinks.filter(l => l.roles?.includes('creator')))
    } else if (userRole === 'admin') {
      // Admins get everything except supporter-specific links
      allAuthLinks.push(...creatorNavLinks.filter(l => l.roles?.includes('admin')))
      allAuthLinks.push(...adminNavLinks.filter(l => l.roles?.includes('admin')))
      allAuthLinks.push(...supporterNavLinks.filter(l => l.roles?.includes('supporter')))
      allAuthLinks.push(...sharedAuthLinks.filter(l => l.roles?.includes('creator')))
    }

    return { public: [], authenticated: allAuthLinks }
  }, [isAuthenticated, user?.role])

  const isLinkActive = useCallback((href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }, [pathname])

  // Group links by their group property
  const groupLinksByCategory = useCallback((links: NavLink[]) => {
    const grouped: { [key: string]: NavLink[] } = {}
    links.forEach(link => {
      const group = link.group || 'Other'
      if (!grouped[group]) {
        grouped[group] = []
      }
      grouped[group].push(link)
    })
    return grouped
  }, [])

  const navLinks = getNavigationLinks()
  const visibleLinks = isAuthenticated ? navLinks.authenticated : navLinks.public

  const toggleMobileMenu = useCallback(() => {
    setIsOpen(!isOpen)
    setIsUserMenuOpen(false)
  }, [isOpen])

  const handleNavClick = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <NavWrapper role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <Logo href="/" aria-label="HonestNeed home">
        <img src="/1000019752.png" alt="HonestNeed" />
        <span>HonestNeed</span>
        <span>HN</span>
      </Logo>

      {/* Desktop Navigation */}
      <DesktopNav>
        {(() => {
          const grouped = groupLinksByCategory(visibleLinks)
          const groups = Object.keys(grouped).sort()
          
          return groups.map(group => {
            const groupLinks = grouped[group]
            const anyActive = groupLinks.some(link => isLinkActive(link.href))
            
            return (
              <NavDropdown key={group}>
                <NavDropdownButton
                  onClick={() => setOpenDropdown(openDropdown === group ? null : group)}
                  onMouseEnter={() => setOpenDropdown(group)}
                  onMouseLeave={() => setOpenDropdown(null)}
                  $isActive={anyActive}
                  title={group}
                >
                  {groupLinks[0]?.icon && <span>{groupLinks[0].icon}</span>}
                  <span>{group}</span>
                  <NavDropdownChevron size={16} $isOpen={openDropdown === group} />
                </NavDropdownButton>

                {openDropdown === group && (
                  <NavDropdownMenu
                    onMouseEnter={() => setOpenDropdown(group)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {groupLinks.map((link) => (
                      <NavDropdownLink
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          handleNavClick()
                          setOpenDropdown(null)
                        }}
                        $isActive={isLinkActive(link.href)}
                        title={link.label}
                      >
                        {link.icon && <span>{link.icon}</span>}
                        <span>{link.label}</span>
                      </NavDropdownLink>
                    ))}
                  </NavDropdownMenu>
                )}
              </NavDropdown>
            )
          })
        })()}
      </DesktopNav>

      {/* Right side: Auth buttons / User menu */}
      <RightSection>
        {!isAuthenticated ? (
          <AuthButtonsContainer>
            <Button
              variant="ghost"
              as="link"
              href="/login"
              size="sm"
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              as="link"
              href="/register"
              size="sm"
            >
              Register
            </Button>
          </AuthButtonsContainer>
        ) : (
          <UserMenuContainer>
            <UserMenuButton
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isUserMenuOpen}
              aria-label={`User menu for ${user?.name || 'User'}`}
            >
              <span>{user?.name}</span>
              <ChevronIcon size={18} $isOpen={isUserMenuOpen} />
            </UserMenuButton>

            {/* User Menu Dropdown */}
            {isUserMenuOpen && (
              <UserMenuDropdown
                role="menu"
                aria-orientation="vertical"
              >
                <MenuDivider />
                <MenuButton
                  onClick={handleLogout}
                  role="menuitem"
                >
                  Sign Out
                </MenuButton>
              </UserMenuDropdown>
            )}
          </UserMenuContainer>
        )}

        {/* Mobile Menu Button */}
        <MobileMenuButton
          onClick={toggleMobileMenu}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </MobileMenuButton>
      </RightSection>

      {/* Mobile Menu */}
      {isOpen && (
        <MobileMenu role="navigation" aria-label="Mobile navigation">
          <MobileMenuContent>
            {/* All visible links organized by section */}
            {!isAuthenticated ? (
              <>
                {/* Public links */}
                {publicNavLinks.map((link) => (
                  <MobileMenuLink
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick}
                  >
                    {link.icon} {link.label}
                  </MobileMenuLink>
                ))}

                {/* Mobile Auth Buttons */}
                <MobileMenuSection>
                  <Button
                    variant="ghost"
                    as="link"
                    href="/login"
                    onClick={handleNavClick}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    as="link"
                    href="/register"
                    onClick={handleNavClick}
                  >
                    Register
                  </Button>
                </MobileMenuSection>
              </>
            ) : (
              <>
                {/* Browse Campaigns - always available */}
                <MobileMenuLink
                  href="/campaigns"
                  onClick={handleNavClick}
                >
                  🎯 Browse Campaigns
                </MobileMenuLink>

                {/* Authenticated general links */}
                {authenticatedNavLinks.filter(l => !l.roles || l.roles.includes(user?.role || 'supporter')).map((link) => (
                  <MobileMenuLink
                    key={link.href}
                    href={link.href}
                    onClick={handleNavClick}
                  >
                    {link.icon} {link.label}
                  </MobileMenuLink>
                ))}

                {/* Supporter-specific section */}
                {(user?.role === 'supporter' || user?.role === 'creator' || user?.role === 'admin') && supporterNavLinks.length > 0 && (
                  <MobileMenuSection>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
                      My Activities
                    </div>
                    {supporterNavLinks.map((link) => (
                      <MobileMenuLink
                        key={link.href}
                        href={link.href}
                        onClick={handleNavClick}
                      >
                        {link.icon} {link.label}
                      </MobileMenuLink>
                    ))}
                  </MobileMenuSection>
                )}

                {/* Creator-specific section */}
                {(user?.role === 'creator' || user?.role === 'admin') && creatorNavLinks.filter(l => l.roles?.includes(user?.role || '')).length > 0 && (
                  <MobileMenuSection>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
                      Creator Tools
                    </div>
                    {creatorNavLinks.filter(l => l.roles?.includes(user?.role || '')).map((link) => (
                      <MobileMenuLink
                        key={link.href}
                        href={link.href}
                        onClick={handleNavClick}
                      >
                        {link.icon} {link.label}
                      </MobileMenuLink>
                    ))}
                  </MobileMenuSection>
                )}

                {/* Admin-specific section */}
                {user?.role === 'admin' && adminNavLinks.filter(l => l.roles?.includes('admin')).length > 0 && (
                  <MobileMenuSection>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
                      Admin Panel
                    </div>
                    {adminNavLinks.filter(l => l.roles?.includes('admin')).map((link) => (
                      <MobileMenuLink
                        key={link.href}
                        href={link.href}
                        onClick={handleNavClick}
                      >
                        {link.icon} {link.label}
                      </MobileMenuLink>
                    ))}
                  </MobileMenuSection>
                )}

                {/* Shared authenticated links */}
                {sharedAuthLinks.filter(l => l.roles?.includes(user?.role || 'supporter')).length > 0 && (
                  <MobileMenuSection>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
                      Communication
                    </div>
                    {sharedAuthLinks.filter(l => l.roles?.includes(user?.role || 'supporter')).map((link) => (
                      <MobileMenuLink
                        key={link.href}
                        href={link.href}
                        onClick={handleNavClick}
                      >
                        {link.icon} {link.label}
                      </MobileMenuLink>
                    ))}
                  </MobileMenuSection>
                )}

                {/* Mobile User Menu */}
                <MobileMenuSection>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', padding: '0.5rem 0.75rem' }}>
                    Account
                  </div>
                  <MobileMenuButton2 onClick={handleLogout}>
                    🚪 Sign Out
                  </MobileMenuButton2>
                </MobileMenuSection>
              </>
            )}
          </MobileMenuContent>
        </MobileMenu>
      )}
    </NavWrapper>
  )
}
