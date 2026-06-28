'use client'

/** Miracle Mode rally page (RG-19) — campaigns currently rallying. */

import { Page, Hero, HeroTitle, HeroSubtitle, Container, Empty } from '@/features/gamification/ui'
import { MiracleBanner } from '@/features/gamification/components/MiracleControls'
import { useMiracleCampaigns } from '@/api/hooks/useRewards'

export default function MiraclePage() {
  const { data, isLoading } = useMiracleCampaigns(50)
  const empty = !isLoading && (data?.length ?? 0) === 0

  return (
    <Page>
      <Hero>
        <HeroTitle>Miracle Mode</HeroTitle>
        <HeroSubtitle>Emergency campaigns the whole community is rallying behind right now.</HeroSubtitle>
      </Hero>
      <Container>
        {empty ? (
          <Empty>No campaigns are in Miracle Mode right now. 🙏</Empty>
        ) : (
          <MiracleBanner />
        )}
      </Container>
    </Page>
  )
}
