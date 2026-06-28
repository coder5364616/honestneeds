'use client'

/**
 * Business owner dashboard hub.
 *  - No profile yet  → show only the create-profile tab (BU-01).
 *  - Profile exists  → Profile / Analytics (BU-03+04) / Verification (BU-05) /
 *    Programs (BU-06+07) tabs.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { Badge, humanize, statusTone } from '@/features/business/ui'
import ProfileTab from '@/features/business/components/dashboard/ProfileTab'
import AnalyticsTab from '@/features/business/components/dashboard/AnalyticsTab'
import VerificationTab from '@/features/business/components/dashboard/VerificationTab'
import ProgramsTab from '@/features/business/components/dashboard/ProgramsTab'
import { useOwnBusinessProfile } from '@/api/hooks/useBusiness'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useAuthHydration } from '@/hooks/useAuthHydration'

// ─── Design Tokens (mirrors /dashboard) ───────────────────────────────────────

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  inkBorder:   '#3D3A44',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  amber:       '#D4870A',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  green:       '#1A7A4A',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
}

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
  animation: ${fadeUp} 0.4s ease both;
`

const SectionTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1.25rem 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`

const Muted = styled.p`
  color: ${tk.muted};
  font-size: 0.9rem;
  margin: 0;
`

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`

const Tab = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(p) => (p.$active ? tk.white : 'transparent')};
  border: none;
  border-radius: 7px;
  color: ${(p) => (p.$active ? tk.heading : tk.muted)};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: ${(p) => (p.$active ? 600 : 400)};
  cursor: pointer;
  transition: all 140ms;
  box-shadow: ${(p) => (p.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none')};

  &:hover { color: ${tk.heading}; }
`

type TabKey = 'profile' | 'analytics' | 'verification' | 'programs'

export default function BusinessDashboardPage() {
  const router = useRouter()
  const hydrated = useAuthHydration()
  const isAuthed = useIsAuthenticated()
  const { data: profile, isLoading, isError, error } = useOwnBusinessProfile(hydrated && isAuthed)
  const [tab, setTab] = useState<TabKey>('profile')

  // 404 = no profile yet (retry:false on the hook). Any other error is real.
  const status = (error as { response?: { status?: number } } | undefined)?.response?.status
  const noProfileYet = isError && status === 404

  // Only redirect once hydration has settled, to avoid a flash redirect.
  useEffect(() => {
    if (hydrated && !isAuthed) router.push('/login')
  }, [hydrated, isAuthed, router])

  if (!hydrated || !isAuthed) {
    return (
      <Page>
        <GlobalStyle />
        <Container>
          <Muted>{hydrated ? 'Redirecting to login…' : 'Loading…'}</Muted>
        </Container>
      </Page>
    )
  }

  if (isLoading) {
    return (
      <Page>
        <GlobalStyle />
        <Container>
          <Muted>Loading your business dashboard…</Muted>
        </Container>
      </Page>
    )
  }

  if (isError && !noProfileYet) {
    return (
      <Page>
        <GlobalStyle />
        <Container>
          <Muted>Could not load your business dashboard. Please try again.</Muted>
        </Container>
      </Page>
    )
  }

  // No profile yet → onboarding (create only).
  if (!profile) {
    return (
      <Page>
        <GlobalStyle />
        <Container>
          <SectionTitle>Set up your business</SectionTitle>
          <Muted style={{ marginBottom: 24 }}>
            Create a business profile to access analytics, verification, volunteer opportunities and giveaways.
          </Muted>
          <ProfileTab profile={null} onCreated={() => setTab('verification')} />
        </Container>
      </Page>
    )
  }

  return (
    <Page>
      <GlobalStyle />
      <Container>
        <SectionTitle style={{ marginBottom: 8 }}>
          {profile.business_name}{' '}
          <Badge $tone={statusTone(profile.verification_status)}>{humanize(profile.verification_status)}</Badge>
        </SectionTitle>
        <Muted style={{ marginBottom: 24 }}>Manage your business presence and impact on HonestNeed.</Muted>

        <Tabs>
          <Tab $active={tab === 'profile'} onClick={() => setTab('profile')}>
            Profile
          </Tab>
          <Tab $active={tab === 'analytics'} onClick={() => setTab('analytics')}>
            Analytics & CSR
          </Tab>
          <Tab $active={tab === 'verification'} onClick={() => setTab('verification')}>
            Verification
          </Tab>
          <Tab $active={tab === 'programs'} onClick={() => setTab('programs')}>
            Opportunities & Giveaways
          </Tab>
        </Tabs>

        {tab === 'profile' && <ProfileTab profile={profile} />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'verification' && <VerificationTab profile={profile} />}
        {tab === 'programs' && <ProgramsTab />}
      </Container>
    </Page>
  )
}
