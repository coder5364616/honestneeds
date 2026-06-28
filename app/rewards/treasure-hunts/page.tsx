'use client'

/** Treasure Hunts list (RG-11). */

import Link from 'next/link'
import { Map, MapPin, Star } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, Grid, Row, Muted, Empty, Chip,
} from '@/features/gamification/ui'
import { useTreasureHunts } from '@/api/hooks/useRewards'

export default function TreasureHuntsPage() {
  const { data, isLoading } = useTreasureHunts()
  const hunts = data ?? []

  return (
    <Page>
      <Hero>
        <HeroTitle>Treasure Hunts</HeroTitle>
        <HeroSubtitle>Find hidden QR codes and GPS stops around your city to earn XP and badges.</HeroSubtitle>
      </Hero>
      <Container>
        {isLoading && <Muted>Loading hunts…</Muted>}
        {!isLoading && hunts.length === 0 && <Empty>No active treasure hunts right now. Check back soon! 🗺️</Empty>}

        <Grid $min="280px">
          {hunts.map((h) => (
            <Link key={h._id} href={`/rewards/treasure-hunts/${h.slug}`} style={{ textDecoration: 'none' }}>
              <Card style={{ height: '100%' }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Map size={18} /> {h.title}
                  </strong>
                  <Chip $bg="#fef9c3" $fg="#a16207"><Star size={13} /> {h.completion_reward_xp} XP</Chip>
                </Row>
                {h.city && <Muted style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}><MapPin size={13} /> {h.city}</Muted>}
                {h.description && <Muted style={{ marginTop: 8 }}>{h.description.slice(0, 120)}</Muted>}
              </Card>
            </Link>
          ))}
        </Grid>
      </Container>
    </Page>
  )
}
