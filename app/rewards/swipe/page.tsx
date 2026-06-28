'use client'

/** Swipe-to-Help feed page (RG-17). */

import { Page, Hero, HeroTitle, HeroSubtitle, Container } from '@/features/gamification/ui'
import { SwipeFeed } from '@/features/gamification/components/SwipeFeed'

export default function SwipePage() {
  return (
    <Page>
      <Hero>
        <HeroTitle>Swipe to Help</HeroTitle>
        <HeroSubtitle>Discover people who need help, one card at a time.</HeroSubtitle>
      </Hero>
      <Container>
        <SwipeFeed />
      </Container>
    </Page>
  )
}
