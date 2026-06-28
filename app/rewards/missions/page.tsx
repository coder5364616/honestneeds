'use client'

/** Missions page (RG-18). */

import { Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Muted } from '@/features/gamification/ui'
import { MissionsCard } from '@/features/gamification/components/MissionsCard'
import { useIsAuthenticated } from '@/hooks/useAuth'

export default function MissionsPage() {
  const isAuthed = useIsAuthenticated()
  return (
    <Page>
      <Hero>
        <HeroTitle>Missions</HeroTitle>
        <HeroSubtitle>Complete daily and weekly objectives to earn bonus XP and keep your momentum.</HeroSubtitle>
      </Hero>
      <Container>
        {isAuthed ? (
          <MissionsCard />
        ) : (
          <Card>
            <SectionTitle>Sign in to view your missions</SectionTitle>
            <Muted>Missions track your share, pray, donate and referral activity.</Muted>
          </Card>
        )}
      </Container>
    </Page>
  )
}
