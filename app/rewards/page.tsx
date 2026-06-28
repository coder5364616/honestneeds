'use client'

/**
 * Rewards Hub (RG-02..RG-21 entry point).
 *
 * Composes the gamification cards (level/XP/badges, streak, viral multiplier,
 * hope meter, golden tickets, missions) and links out to the dedicated
 * leaderboards, challenges, teams, treasure hunts, journey, swipe feed and
 * miracle-mode pages.
 */

import React from 'react'
import Link from 'next/link'
import { Trophy, Target, Users, Map, Sparkles, Heart, Swords, Siren } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, SectionTitle, Grid, Muted, Card, Row,
  TileGrid, Tile,
} from '@/features/gamification/ui'
import {
  LevelCard, StreakCard, ViralCard, HopeMeterCard, GoldenTicketsCard,
} from '@/features/gamification/components/HubCards'
import { MissionsCard } from '@/features/gamification/components/MissionsCard'
import { LeaderboardPanel } from '@/features/gamification/components/LeaderboardPanel'
import { MiracleBanner } from '@/features/gamification/components/MiracleControls'
import { useIsAuthenticated, useCurrentUser } from '@/hooks/useAuth'

const TILES = [
  { href: '/rewards/leaderboards', icon: Trophy, title: 'Leaderboards', desc: 'Top members, donors, sharers & volunteers' },
  { href: '/rewards/missions', icon: Target, title: 'Missions', desc: 'Daily & weekly objectives for bonus XP' },
  { href: '/rewards/challenges', icon: Swords, title: 'Challenges', desc: 'City vs city, crowd storms & rallies' },
  { href: '/rewards/teams', icon: Users, title: 'Teams', desc: 'Compete together for your cause' },
  { href: '/rewards/treasure-hunts', icon: Map, title: 'Treasure Hunts', desc: 'Find hidden QR & GPS stops for XP' },
  { href: '/rewards/journey', icon: Sparkles, title: 'My Journey', desc: 'Your transformation timeline' },
  { href: '/rewards/swipe', icon: Heart, title: 'Swipe to Help', desc: 'Discover campaigns, one swipe at a time' },
  { href: '/rewards/miracle', icon: Siren, title: 'Miracle Mode', desc: 'Emergency campaigns rallying now' },
]

export default function RewardsHubPage() {
  const isAuthed = useIsAuthenticated()
  const user = useCurrentUser()

  return (
    <Page>
      <Hero>
        <HeroTitle>Rewards & Recognition</HeroTitle>
        <HeroSubtitle>Earn XP, unlock badges, climb leaderboards and rally your community — every act of kindness counts.</HeroSubtitle>
      </Hero>

      <Container>
        <div style={{ marginBottom: 24 }}>
          <MiracleBanner />
        </div>

        {!isAuthed ? (
          <Card>
            <SectionTitle>Sign in to start earning</SectionTitle>
            <Muted>Create an account to track XP, streaks, badges and rewards.</Muted>
            <Row style={{ marginTop: 12 }}>
              <Link href="/login" style={{ fontWeight: 600 }}>Sign in →</Link>
            </Row>
          </Card>
        ) : (
          <>
            <LevelCard />

            <Grid $min="320px" style={{ marginTop: 24 }}>
              <StreakCard />
              <ViralCard />
              <GoldenTicketsCard />
              <MissionsCard />
            </Grid>

            <div style={{ marginTop: 24 }}>
              <HopeMeterCard />
            </div>

            <div style={{ marginTop: 24 }}>
              <LeaderboardPanel compact currentUserId={user?.id} />
            </div>
          </>
        )}

        <SectionTitle style={{ marginTop: 40 }}>Explore</SectionTitle>
        <TileGrid>
          {TILES.map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <Tile>
                <Row $gap={3} style={{ marginBottom: 8 }}>
                  <Icon size={22} />
                  <strong style={{ fontSize: 18 }}>{title}</strong>
                </Row>
                <Muted>{desc}</Muted>
              </Tile>
            </Link>
          ))}
        </TileGrid>
      </Container>
    </Page>
  )
}
