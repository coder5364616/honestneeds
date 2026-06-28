'use client'

/**
 * Volunteer Reference Letters (VO-07).
 * - "My references": request letters, toggle public sharing, copy share link.
 * - "Requests to me": referrers issue or decline incoming requests.
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Link2, Send, Check, X } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Row, Field, Label,
  Input, Textarea, Button, Badge, Muted, Empty, NavTabs, NavTab, humanize, statusTone,
} from '@/features/volunteer/ui'
import { toast } from 'react-toastify'
import {
  useMyReferences, useReferenceRequests, useRequestReference, useIssueReference,
  useDeclineReference, useSetReferenceVisibility,
} from '@/api/hooks/useVolunteerProgram'
import { useIsAuthenticated } from '@/hooks/useAuth'
import type { VolunteerReferenceLetter } from '@/types/volunteer'

function personName(p: VolunteerReferenceLetter['referrer_id']): string {
  if (p && typeof p === 'object') return p.display_name || p.username || 'User'
  return 'User'
}

export default function VolunteerReferencesPage() {
  const isAuthed = useIsAuthenticated()
  const [tab, setTab] = useState<'mine' | 'requests'>('mine')

  if (!isAuthed) {
    return <Page><Container><Card><Muted>Please sign in to manage reference letters.</Muted></Card></Container></Page>
  }

  return (
    <Page>
      <Hero>
        <HeroTitle>Reference Letters</HeroTitle>
        <HeroSubtitle>Turn your verified service into references you can share with employers and schools.</HeroSubtitle>
      </Hero>

      <Container>
        <Link href="/volunteers" style={{ textDecoration: 'none' }}>
          <Row $gap={2} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> <Muted>Back to Volunteer Center</Muted></Row>
        </Link>

        <NavTabs>
          <NavTab $active={tab === 'mine'} onClick={() => setTab('mine')}>My references</NavTab>
          <NavTab $active={tab === 'requests'} onClick={() => setTab('requests')}>Requests to me</NavTab>
        </NavTabs>

        {tab === 'mine' ? <MyReferences /> : <IncomingRequests personName={personName} />}
      </Container>
    </Page>
  )
}

function MyReferences() {
  const { data, isLoading } = useMyReferences({ limit: 50 })
  const requestRef = useRequestReference()
  const setVisibility = useSetReferenceVisibility()
  const [referrerId, setReferrerId] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!referrerId.trim()) return
    await requestRef.mutateAsync({ referrer_id: referrerId.trim(), message: message.trim() || undefined })
    setReferrerId('')
    setMessage('')
  }

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/volunteers/references/${token}`
    navigator.clipboard?.writeText(url)
    toast.success('Public link copied to clipboard.')
  }

  return (
    <>
      <Card as="form" onSubmit={submit} style={{ marginBottom: 24 }}>
        <SectionTitle>Request a reference</SectionTitle>
        <Muted>Ask a campaign creator or business you volunteered with to write you a reference.</Muted>
        <Row $gap={3} $wrap style={{ marginTop: 16 }}>
          <Field style={{ flex: 1, minWidth: 220 }}>
            <Label>Referrer user ID</Label>
            <Input placeholder="User ID of the creator/business owner" value={referrerId}
              onChange={(e) => setReferrerId(e.target.value)} />
          </Field>
          <Field style={{ flex: 2, minWidth: 220 }}>
            <Label>Message (optional)</Label>
            <Input placeholder="Hi! Could you write me a reference for…" value={message}
              onChange={(e) => setMessage(e.target.value)} />
          </Field>
        </Row>
        <Button type="submit" disabled={requestRef.isPending}><Send size={14} /> Request reference</Button>
      </Card>

      {isLoading && <Muted>Loading…</Muted>}
      {data && data.letters.length === 0 && <Empty>You have no reference letters yet.</Empty>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data?.letters.map((l) => (
          <Card key={l._id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <strong>{l.referrer_name || 'Referrer'}{l.referrer_title ? ` · ${l.referrer_title}` : ''}</strong>
              <Badge $tone={statusTone(l.status)}>{humanize(l.status)}</Badge>
            </Row>
            {l.relationship && <Muted style={{ marginTop: 4 }}>{l.relationship}</Muted>}
            {l.status === 'issued' && l.body && <p style={{ margin: '10px 0 0', fontSize: 14, whiteSpace: 'pre-wrap' }}>{l.body}</p>}
            {l.status === 'declined' && l.decline_reason && <Muted style={{ marginTop: 8 }}>Declined: {l.decline_reason}</Muted>}

            {l.status === 'issued' && (
              <Row $gap={2} style={{ marginTop: 12 }} $wrap>
                <Button
                  $variant={l.is_public ? 'outline' : 'primary'}
                  onClick={() => setVisibility.mutate({ letterId: l._id, isPublic: !l.is_public })}
                  disabled={setVisibility.isPending}
                >
                  {l.is_public ? 'Make private' : 'Make public'}
                </Button>
                {l.is_public && l.public_token && (
                  <Button $variant="outline" onClick={() => copyLink(l.public_token!)}>
                    <Link2 size={14} /> Copy link
                  </Button>
                )}
              </Row>
            )}
          </Card>
        ))}
      </div>
    </>
  )
}

function IncomingRequests({ personName }: { personName: (p: VolunteerReferenceLetter['referrer_id']) => string }) {
  const { data, isLoading } = useReferenceRequests({ limit: 50 })
  const issue = useIssueReference()
  const decline = useDeclineReference()
  const [drafts, setDrafts] = useState<Record<string, { body: string; relationship: string; title: string }>>({})

  const setDraft = (id: string, patch: Partial<{ body: string; relationship: string; title: string }>) =>
    setDrafts((d) => ({ ...d, [id]: { body: '', relationship: '', title: '', ...d[id], ...patch } }))

  return (
    <>
      {isLoading && <Muted>Loading…</Muted>}
      {data && data.letters.length === 0 && <Empty>No reference requests addressed to you.</Empty>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data?.letters.map((l) => {
          const draft = drafts[l._id] ?? { body: '', relationship: '', title: '' }
          return (
            <Card key={l._id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <strong>From {personName(l.volunteer_id)}</strong>
                <Badge $tone={statusTone(l.status)}>{humanize(l.status)}</Badge>
              </Row>
              {l.request_message && <Muted style={{ marginTop: 6 }}>“{l.request_message}”</Muted>}
              <Muted style={{ marginTop: 6 }}>
                Verified hours: {l.snapshot?.total_hours ?? 0} · Rating: {l.snapshot?.rating?.toFixed?.(1) ?? '—'}
              </Muted>

              {l.status === 'requested' && (
                <div style={{ marginTop: 12 }}>
                  <Field>
                    <Label>Relationship (optional)</Label>
                    <Input placeholder="e.g. Campaign organizer who supervised them"
                      value={draft.relationship} onChange={(e) => setDraft(l._id, { relationship: e.target.value })} />
                  </Field>
                  <Field>
                    <Label>Your title (optional)</Label>
                    <Input placeholder="e.g. Executive Director, Hope Foundation"
                      value={draft.title} onChange={(e) => setDraft(l._id, { title: e.target.value })} />
                  </Field>
                  <Field>
                    <Label>Reference letter</Label>
                    <Textarea placeholder="Write the reference (min 20 characters)…"
                      value={draft.body} onChange={(e) => setDraft(l._id, { body: e.target.value })} />
                  </Field>
                  <Row $gap={2}>
                    <Button
                      onClick={() => issue.mutate({ letter_id: l._id, body: draft.body, relationship: draft.relationship || undefined, referrer_title: draft.title || undefined })}
                      disabled={issue.isPending || draft.body.trim().length < 20}
                    >
                      <Check size={14} /> Issue
                    </Button>
                    <Button $variant="danger"
                      onClick={() => decline.mutate({ letterId: l._id, reason: 'Unable to provide a reference at this time' })}
                      disabled={decline.isPending}
                    >
                      <X size={14} /> Decline
                    </Button>
                  </Row>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}
