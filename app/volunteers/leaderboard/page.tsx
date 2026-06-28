'use client'

/**
 * Volunteer Leaderboard (VO-05). Public — top volunteers by verified hours or XP.
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, Row, Muted, Empty, Select,
  NavTabs, NavTab, Badge, humanize,
} from '@/features/volunteer/ui'
import { useVolunteerLeaderboard } from '@/api/hooks/useVolunteerProgram'
import { VOLUNTEERING_TYPES, type LeaderboardMetric } from '@/types/volunteer'

const MEDALS = ['🥇', '🥈', '🥉']

export default function VolunteerLeaderboardPage() {
  const [metric, setMetric] = useState<LeaderboardMetric>('hours')
  const [type, setType] = useState<string>('')
  const { data, isLoading, isError } = useVolunteerLeaderboard({ metric, type: type || undefined, limit: 50 })

  return (
    <Page>
      <Hero>
        <HeroTitle>Volunteer Leaderboard</HeroTitle>
        <HeroSubtitle>Celebrating the people giving the most time and heart to their communities.</HeroSubtitle>
      </Hero>

      <Container>
        <Row style={{ justifyContent: 'space-between', marginBottom: 16 }} $wrap>
          <Link href="/volunteers" style={{ textDecoration: 'none' }}>
            <Row $gap={2}><ArrowLeft size={16} /> <Muted>Back to Volunteer Center</Muted></Row>
          </Link>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All volunteer types</option>
            {VOLUNTEERING_TYPES.map((t) => (
              <option key={t} value={t}>{humanize(t)}</option>
            ))}
          </Select>
        </Row>

        <NavTabs>
          <NavTab $active={metric === 'hours'} onClick={() => setMetric('hours')}>By Hours</NavTab>
          <NavTab $active={metric === 'xp'} onClick={() => setMetric('xp')}>By XP</NavTab>
        </NavTabs>

        {isLoading && <Muted>Loading leaderboard…</Muted>}
        {isError && <Muted>Could not load the leaderboard.</Muted>}
        {data && data.leaderboard.length === 0 && <Empty>No ranked volunteers yet. Be the first!</Empty>}

        {data && data.leaderboard.length > 0 && (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            {data.leaderboard.map((row, i) => (
              <Row
                key={row.volunteer_id}
                $gap={4}
                style={{
                  padding: '14px 20px',
                  borderTop: i === 0 ? 'none' : '1px solid #E2DDD6',
                  justifyContent: 'space-between',
                }}
              >
                <Row $gap={3} style={{ minWidth: 0 }}>
                  <span style={{ width: 32, textAlign: 'center', fontWeight: 700 }}>
                    {MEDALS[i] ?? `#${row.rank}`}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {row.display_name || row.username || 'Volunteer'}
                    </strong>
                    <Muted>
                      Lvl {row.level}{row.city ? ` · ${row.city}` : ''}
                      {row.proof_of_kindness_count > 0 ? ` · 💗 ${row.proof_of_kindness_count}` : ''}
                    </Muted>
                  </div>
                </Row>
                <Row $gap={3}>
                  {metric === 'hours' ? (
                    <strong>{row.total_hours} hrs</strong>
                  ) : (
                    <strong>{row.xp.toLocaleString()} XP</strong>
                  )}
                  {i < 3 && <Badge $tone="success"><Trophy size={12} /> Top {row.rank}</Badge>}
                </Row>
              </Row>
            ))}
          </Card>
        )}
      </Container>
    </Page>
  )
}
