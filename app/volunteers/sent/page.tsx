'use client'

/**
 * Sent Invitations (employer view). Lists assignments the current user has sent
 * to volunteers, grouped by status, and lets them leave a star review on
 * completed assignments — POST /volunteers/:id/review.
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Star, Clock, Calendar, Send, Inbox } from 'lucide-react'
import styled from 'styled-components'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Row,
  Field, Label, Textarea, Button, Muted, Empty, NavTabs, NavTab, humanize,
} from '@/features/volunteer/ui'
import { useSentAssignments, useReviewAssignment } from '@/api/hooks/useVolunteerProgram'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { MessageButton } from '@/features/messaging/components/MessageButton'
import type { SentAssignment, SentAssignmentVolunteer, AssignmentRef, AssignmentStatus } from '@/types/volunteer'

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

const Avatar = styled.div<{ $url?: string | null }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => (p.$url ? `url(${p.$url}) center/cover` : 'linear-gradient(135deg,#F5C961,#D4870A)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
`

const StarBtn = styled.button<{ $on: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  color: ${(p) => (p.$on ? '#D4870A' : '#CFC9C0')};
  &:hover { color: #D4870A; }
`

const fmtDate = (s?: string) => (s ? new Date(s).toLocaleDateString() : '—')

function vol(a: SentAssignment): SentAssignmentVolunteer | null {
  return a.volunteer_id && typeof a.volunteer_id === 'object' ? (a.volunteer_id as SentAssignmentVolunteer) : null
}
function volName(a: SentAssignment): string {
  const v = vol(a)
  return v?.user_id?.display_name || v?.user_id?.username || 'Volunteer'
}
function volAvatar(a: SentAssignment): string | null {
  const v = vol(a)
  return v?.user_id?.profile_picture || v?.user_id?.avatar_url || null
}
function volProfileId(a: SentAssignment): string | null {
  const v = vol(a)
  if (v?._id) return v._id
  return typeof a.volunteer_id === 'string' ? a.volunteer_id : null
}
function volUserId(a: SentAssignment): string | null {
  return vol(a)?.user_id?._id || null
}

// The messaging channel opens once the volunteer accepts the invitation.
const MESSAGEABLE: AssignmentStatus[] = ['accepted', 'in_progress', 'completed']
function campaign(a: SentAssignment): { title: string; id?: string } {
  const c = a.campaign_id
  if (c && typeof c === 'object') return { title: (c as AssignmentRef).title || 'Campaign', id: (c as AssignmentRef)._id }
  return { title: 'Campaign', id: typeof c === 'string' ? c : undefined }
}
function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() || 'V'
}

// ── Review form ──────────────────────────────────────────────────────────────

function ReviewForm({ onSubmit, pending }: { onSubmit: (rating: number, comment: string) => void; pending: boolean }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E2DDD6' }}>
      <Label>Your rating</Label>
      <Row $gap={1} style={{ marginBottom: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <StarBtn key={n} $on={n <= rating} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`}>
            <Star size={22} fill={n <= rating ? '#D4870A' : 'none'} />
          </StarBtn>
        ))}
      </Row>
      <Field>
        <Label>Comment (optional)</Label>
        <Textarea placeholder="How was working with this volunteer?" maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
      </Field>
      <Button disabled={pending || rating < 1} onClick={() => onSubmit(rating, comment.trim())}>
        <Star size={15} /> {pending ? 'Submitting…' : 'Submit review'}
      </Button>
    </div>
  )
}

// ── Assignment card ─────────────────────────────────────────────────────────

function SentCard({ a }: { a: SentAssignment }) {
  const review = useReviewAssignment()
  const [showReview, setShowReview] = useState(false)
  const c = campaign(a)
  const profileId = volProfileId(a)
  const recipientUserId = volUserId(a)
  const canMessage = MESSAGEABLE.includes(a.status) && !!recipientUserId
  const hasReview = !!a.review?.rating
  const canReview = a.status === 'completed' && !hasReview && !!profileId

  return (
    <Card style={{ marginBottom: 16 }}>
      <Row $gap={3} style={{ alignItems: 'flex-start' }}>
        <Avatar $url={volAvatar(a)}>{!volAvatar(a) && initials(volName(a))}</Avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Row $gap={2} $wrap style={{ marginBottom: 4 }}>
            <strong style={{ fontSize: 16 }}>{a.title}</strong>
            <StatusBadge $status={a.status}>{humanize(a.status)}</StatusBadge>
          </Row>
          <Muted style={{ margin: '0 0 8px', fontSize: 13 }}>
            {profileId ? <Link href={`/volunteers/${profileId}`}>{volName(a)}</Link> : volName(a)}
            {' · '}
            {c.id ? <Link href={`/campaigns/${c.id}`}>{c.title}</Link> : c.title}
          </Muted>
          <Row $gap={2} $wrap>
            <Chip><Clock size={11} /> {a.estimated_hours}h est.</Chip>
            <Chip><Calendar size={11} /> {fmtDate(a.start_date)} → {fmtDate(a.deadline)}</Chip>
            {a.status === 'completed' && <Chip><Clock size={11} /> {a.actual_hours ?? 0}h logged</Chip>}
          </Row>

          {a.status === 'rejected' && a.rejection_reason && (
            <Muted style={{ marginTop: 8, fontSize: 13 }}>Declined: {a.rejection_reason}</Muted>
          )}

          {canMessage && (
            <Row style={{ marginTop: 12 }}>
              <MessageButton
                recipientId={recipientUserId as string}
                recipientName={volName(a)}
                contextType="volunteer"
                campaignId={c.id ?? null}
                subject={a.title}
                label={`Message ${volName(a)}`}
              />
            </Row>
          )}

          {hasReview && (
            <Row $gap={1} style={{ marginTop: 10, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={15} fill={n <= (a.review?.rating ?? 0) ? '#D4870A' : 'none'} stroke="#D4870A" />
              ))}
              {a.review?.comment && <Muted style={{ margin: '0 0 0 8px', fontSize: 13 }}>“{a.review.comment}”</Muted>}
            </Row>
          )}

          {canReview && !showReview && (
            <Row style={{ marginTop: 12 }}>
              <Button onClick={() => setShowReview(true)}><Star size={15} /> Leave a review</Button>
            </Row>
          )}

          {canReview && showReview && (
            <ReviewForm
              pending={review.isPending}
              onSubmit={(rating, comment) =>
                review.mutate(
                  { volunteerId: profileId as string, assignmentId: a._id, rating, comment },
                  { onSuccess: () => setShowReview(false) }
                )
              }
            />
          )}
        </div>
      </Row>
    </Card>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

const TABS: { key: 'all' | 'active' | 'completed'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'To review' },
]

export default function SentInvitationsPage() {
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const [tab, setTab] = useState<'all' | 'active' | 'completed'>('all')

  const { data, isLoading, isError } = useSentAssignments(undefined, isAuthed)
  const all = useMemo(() => data?.assignments ?? [], [data])

  const ACTIVE: AssignmentStatus[] = ['requested', 'accepted', 'in_progress']
  const filtered = useMemo(() => {
    if (tab === 'active') return all.filter((a) => ACTIVE.includes(a.status))
    if (tab === 'completed') return all.filter((a) => a.status === 'completed')
    return all
  }, [all, tab])

  const toReview = all.filter((a) => a.status === 'completed' && !a.review?.rating).length

  return (
    <Page>
      <Hero>
        <HeroTitle>Sent Invitations</HeroTitle>
        <HeroSubtitle>Track the volunteers you’ve invited and review their work once it’s done.</HeroSubtitle>
      </Hero>

      <Container>
        {!isAuthed && (
          <Card>
            <SectionTitle>Sign in to view sent invitations</SectionTitle>
            <Row style={{ marginTop: 16 }}><Button onClick={() => router.push('/login')}>Sign in</Button></Row>
          </Card>
        )}

        {isAuthed && (
          <>
            <Row $gap={2} $wrap style={{ justifyContent: 'space-between', marginBottom: 8 }}>
              <NavTabs>
                {TABS.map((t) => (
                  <NavTab key={t.key} $active={tab === t.key} onClick={() => setTab(t.key)}>
                    {t.label}{t.key === 'completed' && toReview > 0 ? ` (${toReview})` : ''}
                  </NavTab>
                ))}
              </NavTabs>
              <Button as={Link} href="/volunteers/directory" $variant="outline">
                <Send size={15} /> Invite more
              </Button>
            </Row>

            {isLoading && <Muted>Loading your sent invitations…</Muted>}
            {isError && <Empty>Could not load your sent invitations. Please try again.</Empty>}

            {!isLoading && !isError && all.length === 0 && (
              <Card>
                <Row $gap={2} style={{ alignItems: 'center' }}>
                  <Inbox size={20} />
                  <Muted style={{ margin: 0 }}>
                    You haven’t invited any volunteers yet.{' '}
                    <Link href="/volunteers/directory">Browse the directory</Link> to get started.
                  </Muted>
                </Row>
              </Card>
            )}

            {!isLoading && !isError && all.length > 0 && filtered.length === 0 && (
              <Empty>No {tab === 'all' ? '' : tab} invitations.</Empty>
            )}

            {filtered.map((a) => <SentCard key={a._id} a={a} />)}
          </>
        )}
      </Container>
    </Page>
  )
}
