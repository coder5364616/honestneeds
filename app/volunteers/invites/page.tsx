'use client'

/**
 * Volunteer Invitations inbox. Lists assignment invites employers/creators have
 * sent (request-assignment), letting the volunteer accept, decline, or mark an
 * accepted assignment complete with logged hours.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, X, Clock, Calendar, Inbox, Briefcase } from 'lucide-react'
import styled from 'styled-components'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Row,
  Field, Label, Input, Textarea, Button, Muted, Empty, NavTabs, NavTab, humanize,
} from '@/features/volunteer/ui'
import {
  useMyAssignments, useAcceptAssignment, useDeclineAssignment, useCompleteAssignment,
} from '@/api/hooks/useVolunteerProgram'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { MessageButton } from '@/features/messaging/components/MessageButton'
import type { AssignmentInboxItem, AssignmentRef, AssignmentRequester, AssignmentStatus } from '@/types/volunteer'

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  ${({ $status }) => {
    switch ($status) {
      case 'requested': return 'background:#FBF3E0;color:#B36B00;'
      case 'accepted':
      case 'in_progress': return 'background:#E3F0FB;color:#1a5fa8;'
      case 'completed': return 'background:#E4F5E9;color:#1B8A4B;'
      default: return 'background:#EEEBE5;color:#8C8790;'
    }
  }}
`

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.72rem;
  font-weight: 600;
  background: #eeebe5;
  color: #4a4750;
`

const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString() : '—')

function refTitle(c: AssignmentInboxItem['campaign_id']): { title: string; id?: string } {
  if (c && typeof c === 'object') return { title: (c as AssignmentRef).title || 'Campaign', id: (c as AssignmentRef)._id }
  return { title: 'Campaign', id: typeof c === 'string' ? c : undefined }
}

function requesterName(c: AssignmentInboxItem['creator_id']): string {
  if (c && typeof c === 'object') {
    const r = c as AssignmentRequester
    return r.display_name || r.username || 'A campaign creator'
  }
  return 'A campaign creator'
}

function requesterId(c: AssignmentInboxItem['creator_id']): string | null {
  if (c && typeof c === 'object') return (c as AssignmentRequester)._id || null
  return typeof c === 'string' ? c : null
}

// Messaging opens once the volunteer has accepted (or is working on / has
// finished) the assignment — mirrors the backend conversation gate.
const MESSAGEABLE: AssignmentStatus[] = ['accepted', 'in_progress', 'completed']

// ── Complete form (inline) ──────────────────────────────────────────────────

function CompleteForm({ onSubmit, pending }: { onSubmit: (hours: number, notes: string) => void; pending: boolean }) {
  const [hours, setHours] = useState(1)
  const [notes, setNotes] = useState('')
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2DDD6' }}>
      <Row $gap={3} $wrap>
        <Field style={{ flex: 1, minWidth: 120 }}>
          <Label>Hours worked</Label>
          <Input type="number" min={0} max={300} step={0.5} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
        </Field>
      </Row>
      <Field>
        <Label>Completion notes (optional)</Label>
        <Textarea placeholder="What did you do?" maxLength={1000} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <Button disabled={pending || hours < 0} onClick={() => onSubmit(hours, notes.trim())}>
        <Check size={15} /> {pending ? 'Saving…' : 'Submit & log hours'}
      </Button>
    </div>
  )
}

// ── Assignment card ─────────────────────────────────────────────────────────

function AssignmentCard({ a, volunteerId }: { a: AssignmentInboxItem; volunteerId: string }) {
  const accept = useAcceptAssignment()
  const decline = useDeclineAssignment()
  const complete = useCompleteAssignment()
  const [showComplete, setShowComplete] = useState(false)

  const campaign = refTitle(a.campaign_id)
  const canRespond = a.status === 'requested'
  const canComplete = a.status === 'accepted' || a.status === 'in_progress'
  const busy = accept.isPending || decline.isPending || complete.isPending
  const creatorUserId = requesterId(a.creator_id)
  const canMessage = MESSAGEABLE.includes(a.status) && !!creatorUserId

  return (
    <Card style={{ marginBottom: 16 }}>
      <Row $gap={3} $wrap style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row $gap={2} $wrap style={{ marginBottom: 6 }}>
            <strong style={{ fontSize: 16 }}>{a.title}</strong>
            <StatusBadge $status={a.status}>{humanize(a.status)}</StatusBadge>
          </Row>
          <Muted style={{ margin: '0 0 8px', fontSize: 13 }}>
            From <strong>{requesterName(a.creator_id)}</strong> ·{' '}
            {campaign.id ? <Link href={`/campaigns/${campaign.id}`}>{campaign.title}</Link> : campaign.title}
          </Muted>
          <Muted style={{ margin: '0 0 10px', whiteSpace: 'pre-wrap' }}>{a.description}</Muted>
          <Row $gap={2} $wrap>
            <Chip><Clock size={11} /> {a.estimated_hours}h est.</Chip>
            <Chip><Calendar size={11} /> {fmtDate(a.start_date)} → {fmtDate(a.deadline)}</Chip>
            {a.required_skills?.slice(0, 4).map((s) => <Chip key={s}><Briefcase size={11} /> {s}</Chip>)}
          </Row>
          {a.status === 'completed' && (
            <Muted style={{ marginTop: 8, fontSize: 13, color: '#1B8A4B' }}>
              ✓ Completed · {a.actual_hours ?? 0}h logged
              {a.review?.rating ? ` · rated ${a.review.rating}/5` : ''}
            </Muted>
          )}
          {a.status === 'rejected' && a.rejection_reason && (
            <Muted style={{ marginTop: 8, fontSize: 13 }}>Declined: {a.rejection_reason}</Muted>
          )}
        </div>
      </Row>

      {canRespond && (
        <Row $gap={2} style={{ marginTop: 12 }}>
          <Button disabled={busy} onClick={() => accept.mutate({ volunteerId, assignmentId: a._id })}>
            <Check size={15} /> Accept
          </Button>
          <Button $variant="outline" disabled={busy} onClick={() => decline.mutate({ volunteerId, assignmentId: a._id })}>
            <X size={15} /> Decline
          </Button>
        </Row>
      )}

      {canMessage && (
        <Row $gap={2} style={{ marginTop: 12 }}>
          {canComplete && !showComplete && (
            <Button onClick={() => setShowComplete(true)}><Check size={15} /> Mark complete</Button>
          )}
          <MessageButton
            recipientId={creatorUserId as string}
            recipientName={requesterName(a.creator_id)}
            contextType="volunteer"
            campaignId={campaign.id ?? null}
            subject={a.title}
            label="Message employer"
          />
        </Row>
      )}

      {!canMessage && canComplete && !showComplete && (
        <Row $gap={2} style={{ marginTop: 12 }}>
          <Button onClick={() => setShowComplete(true)}><Check size={15} /> Mark complete</Button>
        </Row>
      )}

      {canComplete && showComplete && (
        <CompleteForm
          pending={complete.isPending}
          onSubmit={(hours, notes) =>
            complete.mutate(
              { volunteerId, assignmentId: a._id, hours, notes },
              { onSuccess: () => setShowComplete(false) }
            )
          }
        />
      )}
    </Card>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

const TABS: { key: 'active' | 'completed' | 'all'; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
]

export default function VolunteerInvitesPage() {
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const [tab, setTab] = useState<'active' | 'completed' | 'all'>('active')

  const { data, isLoading, isError } = useMyAssignments(undefined, isAuthed)
  const volunteerId = data?.volunteer_id ?? null
  const all = useMemo(() => data?.assignments ?? [], [data])

  const ACTIVE: AssignmentStatus[] = ['requested', 'accepted', 'in_progress']
  const filtered = useMemo(() => {
    if (tab === 'active') return all.filter((a) => ACTIVE.includes(a.status))
    if (tab === 'completed') return all.filter((a) => a.status === 'completed')
    return all
  }, [all, tab])

  const pendingCount = all.filter((a) => a.status === 'requested').length

  return (
    <Page>
      <Hero>
        <HeroTitle>My Invitations</HeroTitle>
        <HeroSubtitle>
          Assignment invites from campaigns. Accept the ones you can help with, then log your hours when done.
        </HeroSubtitle>
      </Hero>

      <Container>
        {!isAuthed && (
          <Card>
            <SectionTitle>Sign in to view invitations</SectionTitle>
            <Row style={{ marginTop: 16 }}>
              <Button onClick={() => router.push('/login')}>Sign in</Button>
            </Row>
          </Card>
        )}

        {isAuthed && (
          <>
            <NavTabs>
              {TABS.map((t) => (
                <NavTab key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
                  {t.label}
                  {t.key === 'active' && pendingCount > 0 ? ` (${pendingCount})` : ''}
                </NavTab>
              ))}
            </NavTabs>

            {isLoading && <Muted>Loading your invitations…</Muted>}
            {isError && <Empty>Could not load your invitations. Please try again.</Empty>}

            {!isLoading && !isError && !volunteerId && (
              <Card>
                <Row $gap={2} style={{ alignItems: 'center' }}>
                  <Inbox size={20} />
                  <Muted style={{ margin: 0 }}>
                    You don’t have a volunteer profile yet.{' '}
                    <Link href="/volunteers">Create one</Link> to receive invitations.
                  </Muted>
                </Row>
              </Card>
            )}

            {!isLoading && !isError && volunteerId && filtered.length === 0 && (
              <Empty>No {tab === 'all' ? '' : tab} invitations yet.</Empty>
            )}

            {volunteerId && filtered.map((a) => (
              <AssignmentCard key={a._id} a={a} volunteerId={volunteerId} />
            ))}
          </>
        )}
      </Container>
    </Page>
  )
}
