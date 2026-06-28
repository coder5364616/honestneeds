'use client'

/** Team detail (RG-07) — roster, score, join/leave. */

import { use } from 'react'
import { Trophy, Crown } from 'lucide-react'
import {
  Page, Container, Card, SectionTitle, Row, Muted, Empty, Button, Chip, StatGrid, StatBox,
  StatValue, StatLabel, compactNumber,
} from '@/features/gamification/ui'
import { useTeam, useJoinTeam, useLeaveTeam } from '@/api/hooks/useRewards'
import { useIsAuthenticated, useCurrentUser } from '@/hooks/useAuth'

export default function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: team, isLoading, isError } = useTeam(slug)
  const join = useJoinTeam()
  const leave = useLeaveTeam()
  const isAuthed = useIsAuthenticated()
  const user = useCurrentUser()

  const isMember = !!user && (team?.members ?? []).some((m) => m.user_id === user.id)

  return (
    <Page>
      <Container style={{ maxWidth: 760 }}>
        {isLoading && <Muted>Loading team…</Muted>}
        {isError && <Card><Muted>Team not found.</Muted></Card>}

        {team && (
          <>
            <Card>
              <Row style={{ justifyContent: 'space-between' }} $wrap>
                <div>
                  <h1 style={{ margin: 0, fontSize: 26 }}>{team.name}</h1>
                  {team.city && <Muted>{team.city}</Muted>}
                </div>
                <Chip $bg="#fef9c3" $fg="#a16207"><Trophy size={14} /> {compactNumber(team.score)}</Chip>
              </Row>
              {team.description && <Muted style={{ marginTop: 12 }}>{team.description}</Muted>}

              <StatGrid style={{ marginTop: 20 }}>
                <StatBox><StatValue>{team.member_count}</StatValue><StatLabel>Members</StatLabel></StatBox>
                <StatBox><StatValue>{compactNumber(team.score)}</StatValue><StatLabel>Team score</StatLabel></StatBox>
              </StatGrid>

              {isAuthed && (
                <Row style={{ marginTop: 16 }}>
                  {isMember ? (
                    <Button $variant="outline" disabled={leave.isPending} onClick={() => leave.mutate(team._id)}>
                      {leave.isPending ? 'Leaving…' : 'Leave team'}
                    </Button>
                  ) : (
                    team.is_open !== false && (
                      <Button disabled={join.isPending} onClick={() => join.mutate(team._id)}>
                        {join.isPending ? 'Joining…' : 'Join team'}
                      </Button>
                    )
                  )}
                </Row>
              )}
            </Card>

            <Card style={{ marginTop: 24 }}>
              <SectionTitle>Roster</SectionTitle>
              {(team.members ?? []).length === 0 ? (
                <Empty>No members yet.</Empty>
              ) : (
                (team.members ?? [])
                  .slice()
                  .sort((a, b) => b.contribution - a.contribution)
                  .map((m) => (
                    <Row key={m.user_id} style={{ justifyContent: 'space-between', padding: '8px 0' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {m.role === 'captain' && <Crown size={15} color="#a16207" />}
                        {m.user_id === user?.id ? 'You' : `Member ${m.user_id.slice(-4)}`}
                      </span>
                      <Muted>{compactNumber(m.contribution)}</Muted>
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
