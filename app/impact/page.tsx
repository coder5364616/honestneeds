'use client'

/** AN-07 — Public Platform Impact Dashboard + AN-08 City/Region Impact Reports. */

import { PublicImpact, RegionReport } from '@/features/analytics'
import { Page, Hero, HeroTitle, HeroSubtitle, Container, SectionTitle } from '@/features/analytics/ui'

export default function ImpactPage() {
  return (
    <Page>
      <Hero>
        <HeroTitle>Our Collective Impact</HeroTitle>
        <HeroSubtitle>
          Every donation, share and volunteer hour adds up. Here’s what the HonestNeed community
          has achieved together.
        </HeroSubtitle>
      </Hero>
      <Container>
        <PublicImpact />
        <SectionTitle style={{ marginTop: 40 }}>Impact across regions</SectionTitle>
        <RegionReport />
      </Container>
    </Page>
  )
}
