'use client'

/** Challenge scoreboard detail (RG-07/08/20/21). */

import { use } from 'react'
import { Swords, Clock, Trophy } from 'lucide-react'
import {
  Page, Container, Card, SectionTitle, Row, Muted, Empty, Badge, Meter, Chip, compactNumber, formatDate,
} from '@/features/gamification/ui'
import { useChallenge } from '@/api/hooks/useRewards'

const MEDALS = ['🥇', '🥈', '🥉']

function metricValue(metric: string, v: number): string {
  if (metric === 'amount') return `$${compactNumber(Math.round(v / 100))}`
  if (metric === 'volunteer_hours') return `${v} hrs`
  return compactNumber(v)
}

export default function ChallengeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: board, isLoading, isError } = useChallenge(slug)

  const pct = board?.goal ? Math.min(100, Math.round((board.total_score / board.goal) * 100)) : null

  return (
    <Page>
      <Container style={{ maxWidth: 800 }}>
        {isLoading && <Muted>Loading challenge…</Muted>}
        {isError && <Card><Muted>Challenge not found.</Muted></Card>}

        {board && (
          <>
            <Card>
              <Row style={{ justifyContent: 'space-between' }} $wrap>
                <h1 style={{ margin: 0, fontSize: 26, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Swords size={24} /> {board.title}
                </h1>
                <Badge $tone={board.status === 'active' ? 'success' : 'muted'}>{board.status}</Badge>
              </Row>
              <Muted style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} /> Ends {formatDate(board.ends_at)}
              </Muted>

              {pct !== null && (
                <div style={{ marginTop: 16 }}>
                  <Meter percent={pct} height={14} />
                  <Muted style={{ marginTop: 6 }}>
                    {metricValue(board.metric, board.total_score)} of {metricValue(board.metric, board.goal!)} goal
                  </Muted>
                </div>
              )}
            </Card>

            <Card style={{ marginTop: 24 }}>
              <SectionTitle><Trophy size={18} color="#a16207" /> Scoreboard</SectionTitle>
              {board.entrants.length === 0 ? (
                <Empty>No entrants yet — contributions will appear here as they roll in.</Empty>
              ) : (
                board.entrants.map((e) => (
                  <Row key={`${e.label}-${e.rank}`} style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <strong style={{ width: 28, textAlign: 'center' }}>
                        {(e.rank ?? 0) <= 3 ? MEDALS[(e.rank ?? 1) - 1] : e.rank}
                      </strong>
                      {e.label}
                      <Chip $bg="#E8F0FB" $fg="#1A5FA8">{e.kind}</Chip>
                    </span>
                    <strong>{metricValue(board.metric, e.score)}</strong>
                  </Row>
                ))
              )}
            </Card>
          </>
        )}
      </Container>
    </Page>
  )
}
