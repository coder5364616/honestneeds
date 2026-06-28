'use client'

/**
 * BU-06 Business: single application detail + review.
 *
 * Shows the applicant, their contact details, the standard fields and every
 * category-specific answer (rendered from the self-describing
 * `application_answers`), with accept/reject (pending) and mark-complete
 * (accepted) actions.
 */

import { use, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { ArrowLeft, Mail, Phone, Check, X, CheckCircle2, User } from 'lucide-react'
import {
  Page,
  Container,
  Card,
  Badge,
  Button,
  Muted,
  Empty,
  Row,
  Field,
  Label,
  Input,
  Textarea,
  humanize,
  statusTone,
  formatDate,
  tk,
} from '@/features/business/ui'
import {
  useApplication,
  useReviewApplication,
  useCompleteApplication,
} from '@/api/hooks/useBusiness'
import { MessageButton } from '@/features/messaging'
import type { ApplicationAnswer } from '@/types/business'

const DefRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0.5rem 1.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid ${tk.border};
  font-size: 0.9rem;

  @media (max-width: 540px) {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }
`
const DefKey = styled.div`
  color: ${tk.muted};
  font-weight: 600;
`
const DefVal = styled.div`
  color: ${tk.heading};
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`

function renderValue(value: ApplicationAnswer['value']) {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (value === null || value === '') return '—'
  return String(value)
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = use(params)
  const { data: app, isLoading, isError } = useApplication(applicationId)
  const review = useReviewApplication()
  const complete = useCompleteApplication()

  const [note, setNote] = useState('')
  const [hours, setHours] = useState('')

  if (isLoading) {
    return (
      <Page>
        <Container>
          <Muted>Loading application…</Muted>
        </Container>
      </Page>
    )
  }

  if (isError || !app) {
    return (
      <Page>
        <Container>
          <Empty>
            <h2>Application not found</h2>
            <p>It may have been withdrawn, or you don’t have access to it.</p>
            <Link href="/business/dashboard">← Dashboard</Link>
          </Empty>
        </Container>
      </Page>
    )
  }

  const v = typeof app.volunteer_id === 'object' ? app.volunteer_id : null
  const opp = typeof app.opportunity_id === 'object' ? app.opportunity_id : null
  const name = v?.display_name || v?.username || 'Volunteer'
  const backHref = opp ? `/business/opportunities/${(app.opportunity_id as { _id: string })._id}/applications` : '/business/dashboard'

  const decide = async (decision: 'accept' | 'reject') => {
    try {
      await review.mutateAsync({ applicationId, decision, note: note.trim() || undefined })
      toast.success(decision === 'accept' ? 'Applicant accepted' : 'Applicant rejected')
    } catch {
      /* handled by api client */
    }
  }

  const markComplete = async () => {
    try {
      await complete.mutateAsync({ applicationId, hours: Number(hours) || 0 })
      toast.success('Marked complete — hours logged.')
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Page>
      <Container style={{ maxWidth: 820 }}>
        <Link
          href={backHref}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14, marginBottom: 20 }}
        >
          <ArrowLeft size={15} /> Back to applications
        </Link>

        <Card style={{ marginBottom: 20 }}>
          <Row $gap={3} $wrap style={{ justifyContent: 'space-between', marginBottom: 16 }}>
            <Row $gap={3}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: v?.avatar_url ? `url(${v.avatar_url}) center/cover` : tk.amberLight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: tk.amberDark,
                }}
              >
                {!v?.avatar_url && <User size={22} />}
              </div>
              <div>
                <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', margin: 0, color: '#18171A' }}>{name}</h1>
                {opp && <Muted>Applied to “{opp.title}”</Muted>}
              </div>
            </Row>
            <Badge $tone={statusTone(app.status)}>{humanize(app.status)}</Badge>
          </Row>

          <Row $gap={5} $wrap style={{ color: tk.muted, fontSize: '0.85rem' }}>
            <span>Applied {formatDate(app.created_at)}</span>
            {app.contact_email && (
              <a href={`mailto:${app.contact_email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1A5FA8' }}>
                <Mail size={14} /> {app.contact_email}
              </a>
            )}
            {app.contact_phone && (
              <a href={`tel:${app.contact_phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#1A5FA8' }}>
                <Phone size={14} /> {app.contact_phone}
              </a>
            )}
          </Row>

          {(app.status === 'accepted' || app.status === 'completed') && v?._id && (
            <Row style={{ marginTop: 16 }}>
              <MessageButton recipientId={v._id} recipientName={name} contextType="volunteer"
                label={`Message ${name}`} subject={opp ? opp.title : 'Volunteer opportunity'} />
            </Row>
          )}
        </Card>

        <Card style={{ marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', margin: '0 0 8px', color: '#18171A' }}>
            Application details
          </h3>

          {app.message && (
            <DefRow>
              <DefKey>Why they want to help</DefKey>
              <DefVal>{app.message}</DefVal>
            </DefRow>
          )}

          {app.relevant_skills?.length > 0 && (
            <DefRow>
              <DefKey>Relevant skills</DefKey>
              <DefVal>
                <Row $gap={2} $wrap>
                  {app.relevant_skills.map((s) => (
                    <Badge key={s} $tone="muted">
                      {s}
                    </Badge>
                  ))}
                </Row>
              </DefVal>
            </DefRow>
          )}

          {app.application_answers?.map((a) => (
            <DefRow key={a.key}>
              <DefKey>{a.label || humanize(a.key)}</DefKey>
              <DefVal>{renderValue(a.value)}</DefVal>
            </DefRow>
          ))}

          {!app.message && !app.relevant_skills?.length && !app.application_answers?.length && (
            <Muted style={{ paddingTop: 12 }}>No extra details were provided.</Muted>
          )}

          {app.decision_note && (
            <DefRow>
              <DefKey>Your decision note</DefKey>
              <DefVal>{app.decision_note}</DefVal>
            </DefRow>
          )}
          {app.status === 'completed' && (
            <DefRow>
              <DefKey>Hours logged</DefKey>
              <DefVal>{app.hours_logged}</DefVal>
            </DefRow>
          )}
        </Card>

        {/* ── Review actions ── */}
        {app.status === 'pending' && (
          <Card>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', margin: '0 0 12px', color: '#18171A' }}>
              Review this applicant
            </h3>
            <Field>
              <Label>Decision note (optional)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Shared internally with this decision."
              />
            </Field>
            <Row $gap={3}>
              <Button onClick={() => decide('accept')} disabled={review.isPending}>
                <Check size={15} /> Accept applicant
              </Button>
              <Button $variant="outline" onClick={() => decide('reject')} disabled={review.isPending}>
                <X size={15} /> Reject
              </Button>
            </Row>
          </Card>
        )}

        {app.status === 'accepted' && (
          <Card>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.05rem', margin: '0 0 12px', color: '#18171A' }}>
              Mark as complete
            </h3>
            <Muted style={{ marginBottom: 12 }}>Once the volunteer has finished, log their hours to credit their impact.</Muted>
            <Row $gap={3} $wrap style={{ alignItems: 'flex-end' }}>
              <Field style={{ marginBottom: 0, width: 160 }}>
                <Label>Hours volunteered</Label>
                <Input type="number" min={0} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 8" />
              </Field>
              <Button onClick={markComplete} disabled={complete.isPending}>
                <CheckCircle2 size={15} /> Mark complete
              </Button>
            </Row>
          </Card>
        )}
      </Container>
    </Page>
  )
}
