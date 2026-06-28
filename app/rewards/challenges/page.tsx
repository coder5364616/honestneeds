'use client'

/** Community Challenges list (RG-08 city-vs-city, RG-20 crowd storm, RG-21 one heart one city). */

import React from 'react'
import Link from 'next/link'
import { Swords, Clock } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, Grid, Row, Muted, Empty, Badge,
  NavTabs, NavTab, Meter, compactNumber, formatDate,
} from '@/features/gamification/ui'
import { useChallenges } from '@/api/hooks/useRewards'
import type { ChallengeStatus } from '@/types/gamification'

const TYPE_LABEL: Record<string, string> = {
  team: 'Team Competition',
  city_vs_city: 'City vs City',
  crowd_storm: 'Crowd Storm',
  one_heart_one_city: 'One Heart, One City',
}

const FILTERS: { key: ChallengeStatus | 'all'; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'scheduled', label: 'Upcoming' },
  { key: 'completed', label: 'Past' },
  { key: 'all', label: 'All' },
]

export default function ChallengesPage() {
  const [filter, setFilter] = React.useState<ChallengeStatus | 'all'>('active')
  const { data, isLoading } = useChallenges(filter === 'all' ? {} : { status: filter })
  const challenges = data ?? []

  return (
    <Page>
      <Hero>
        <HeroTitle>Community Challenges</HeroTitle>
        <HeroSubtitle>City vs city, crowd storms and city-wide rallies — compete and give together.</HeroSubtitle>
      </Hero>
      <Container>
        <NavTabs>
          {FILTERS.map((f) => (
            <NavTab key={f.key} $active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</NavTab>
          ))}
        </NavTabs>

        {isLoading && <Muted>Loading challenges…</Muted>}
        {!isLoading && challenges.length === 0 && <Empty>No challenges here right now.</Empty>}

        <Grid $min="300px">
          {challenges.map((c) => {
            const pct = c.goal ? Math.min(100, Math.round((c.total_score / c.goal) * 100)) : null
            return (
              <Link key={c._id} href={`/rewards/challenges/${c.slug}`} style={{ textDecoration: 'none' }}>
                <Card style={{ height: '100%' }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 18, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Swords size={18} /> {c.title}
                    </strong>
                    <Badge $tone={c.status === 'active' ? 'success' : c.status === 'scheduled' ? 'info' : 'muted'}>
                      {c.status}
                    </Badge>
                  </Row>
                  <Muted style={{ marginTop: 4 }}>{TYPE_LABEL[c.type] ?? c.type}</Muted>
                  {c.description && <Muted style={{ marginTop: 8 }}>{c.description.slice(0, 120)}</Muted>}

                  {pct !== null && (
                    <div style={{ marginTop: 12 }}>
                      <Meter percent={pct} />
                      <Muted style={{ marginTop: 4, fontSize: 12 }}>{compactNumber(c.total_score)} / {compactNumber(c.goal!)}</Muted>
                    </div>
                  )}
                  <Muted style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <Clock size={12} /> Ends {formatDate(c.ends_at)}
                  </Muted>
                </Card>
              </Link>
            )
          })}
        </Grid>
      </Container>
    </Page>
  )
}
