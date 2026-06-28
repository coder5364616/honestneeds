'use client'

/** Community Leaderboards page (RG-05). */

import { Page, Hero, HeroTitle, HeroSubtitle, Container } from '@/features/gamification/ui'
import { LeaderboardPanel } from '@/features/gamification/components/LeaderboardPanel'
import { useCurrentUser } from '@/hooks/useAuth'

export default function LeaderboardsPage() {
  const user = useCurrentUser()
  return (
    <Page>
      <Hero>
        <HeroTitle>Leaderboards</HeroTitle>
        <HeroSubtitle>See who&apos;s leading the way across giving, sharing, referrals and volunteering.</HeroSubtitle>
      </Hero>
      <Container>
        <LeaderboardPanel currentUserId={user?.id} />
      </Container>
    </Page>
  )
}
