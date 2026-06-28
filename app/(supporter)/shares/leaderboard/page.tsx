'use client'

import styled, { createGlobalStyle, keyframes } from 'styled-components'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { ShareLeaderboard } from '@/components/share/ShareLeaderboard'

// ─── Design Tokens (mirrors /dashboard) ───────────────────────────────────────

const tk = {
  ink: '#18171A',
  canvas: '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  body: '#4A4750',
  heading: '#18171A',
  amber: '#D4870A',
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
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
  background: ${tk.canvas};
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

const Body = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: ${tk.blue};
  font-weight: 500;
  font-size: 0.85rem;
  text-decoration: none;
  padding: 4px 8px;
  margin: 0 0 1.25rem -8px;
  border-radius: 6px;
  transition: background 140ms;
  &:hover { background: ${tk.blueLight}; }
`

const PageHeader = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeUp} 0.4s ease both;
`

const Greeting = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
`

const PageTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
`

const PageDescription = styled.p`
  color: ${tk.muted};
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  max-width: 560px;
`

export default function ShareLeaderboardPage() {
  return (
    <Page>
      <GlobalStyle />
      <Body>
        <BackLink href="/shares">
          <ArrowLeft size={16} />
          Back to My Shares
        </BackLink>

        <PageHeader>
          <Greeting><Trophy size={13} style={{ color: tk.amber }} /> Share to Earn</Greeting>
          <PageTitle>Sharer Leaderboard</PageTitle>
          <PageDescription>
            See how you stack up against the top earners. Share more campaigns and drive donations
            to climb the rankings.
          </PageDescription>
        </PageHeader>

        <ShareLeaderboard limit={50} />
      </Body>
    </Page>
  )
}
