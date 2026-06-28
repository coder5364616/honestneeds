'use client'

/** Transformation Journey page (RG-15) with celebrations (RG-12). */

import { Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Muted } from '@/features/gamification/ui'
import { JourneyTimeline } from '@/features/gamification/components/JourneyTimeline'
import { useIsAuthenticated } from '@/hooks/useAuth'

export default function JourneyPage() {
  const isAuthed = useIsAuthenticated()
  return (
    <Page>
      <Hero>
        <HeroTitle>My Journey</HeroTitle>
        <HeroSubtitle>Every milestone on your path of impact, from your first gift to your latest achievement.</HeroSubtitle>
      </Hero>
      <Container>
        {isAuthed ? (
          <JourneyTimeline limit={100} celebrateLatest />
        ) : (
          <Card>
            <SectionTitle>Sign in to see your journey</SectionTitle>
            <Muted>Your milestones appear here as you give, share, pray and volunteer.</Muted>
          </Card>
        )}
      </Container>
    </Page>
  )
}
