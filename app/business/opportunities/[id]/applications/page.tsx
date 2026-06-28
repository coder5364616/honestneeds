'use client'

/**
 * BU-06 Business: applications overview for one opportunity.
 *
 * Owner-scoped list of everyone who applied, with a status filter and quick
 * accept/reject actions. Each row links to the full application detail page.
 */

import { use, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { ArrowLeft, ChevronRight, Mail, Phone, Check, X } from 'lucide-react'
import {
  Page,
  Container,
  Card,
  Badge,
  Button,
  Muted,
  Empty,
  Row,
  Select,
  humanize,
  statusTone,
  formatDate,
  tk,
} from '@/features/business/ui'
import {
  useOpportunity,
  useOpportunityApplications,
  useReviewApplication,
} from '@/api/hooks/useBusiness'
import { MessageButton } from '@/features/messaging'
import type { VolunteerApplication } from '@/types/business'

const STATUS_FILTERS = ['', 'pending', 'accepted', 'rejected', 'withdrawn', 'completed'] as const

// Messaging opens once the business has accepted the application — mirrors the
// backend conversation gate.
const MESSAGEABLE = ['accepted', 'completed']

const ApplicantRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 0;
  border-top: 1px solid ${tk.border};
`

function volunteerOf(app: VolunteerApplication) {
  return typeof app.volunteer_id === 'object' ? app.volunteer_id : null
}

export default function OpportunityApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [status, setStatus] = useState<string>('')

  const { data: opportunity } = useOpportunity(id)
  const { data, isLoading, isError } = useOpportunityApplications(id, { status: status || undefined, limit: 100 })
  const review = useReviewApplication()

  const applications = data?.applications ?? []

  const decide = async (applicationId: string, decision: 'accept' | 'reject') => {
    try {
      await review.mutateAsync({ applicationId, decision })
      toast.success(decision === 'accept' ? 'Applicant accepted' : 'Applicant rejected')
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Page>
      <Container>
        <Link
          href="/business/dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14, marginBottom: 20 }}
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', margin: '0 0 4px', color: '#18171A' }}>
          Applications
        </h1>
        <Muted style={{ marginBottom: 4 }}>
          {opportunity ? (
            <>
              For{' '}
              <Link href={`/opportunities/${id}`} style={{ color: '#1A5FA8' }}>
                {opportunity.title}
              </Link>{' '}
              · {opportunity.slots_filled}/{opportunity.slots_available} slots filled
            </>
          ) : (
            'Loading opportunity…'
          )}
        </Muted>

        <Row $gap={3} style={{ margin: '20px 0' }}>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_FILTERS.map((s) => (
              <option key={s || 'all'} value={s}>
                {s ? humanize(s) : 'All statuses'}
              </option>
            ))}
          </Select>
          <Muted>{applications.length} application{applications.length === 1 ? '' : 's'}</Muted>
        </Row>

        <Card>
          {isLoading && <Muted>Loading applications…</Muted>}
          {isError && <Muted>Could not load applications.</Muted>}
          {!isLoading && !isError && applications.length === 0 && (
            <Empty style={{ border: 'none', background: 'transparent', padding: '2rem 0' }}>
              No applications {status ? `with status “${humanize(status)}”` : 'yet'}.
            </Empty>
          )}

          {applications.map((app) => {
            const v = volunteerOf(app)
            const name = v?.display_name || v?.username || 'Volunteer'
            const canMessage = MESSAGEABLE.includes(app.status) && !!v?._id
            return (
              <ApplicantRow key={app._id}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Row $gap={2} $wrap style={{ marginBottom: 4 }}>
                    <Link
                      href={`/business/applications/${app._id}`}
                      style={{ color: '#18171A', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}
                    >
                      {name}
                    </Link>
                    <Badge $tone={statusTone(app.status)}>{humanize(app.status)}</Badge>
                  </Row>
                  <Row $gap={4} $wrap style={{ color: tk.muted, fontSize: '0.8rem' }}>
                    <span>Applied {formatDate(app.created_at)}</span>
                    {app.contact_email && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Mail size={12} /> {app.contact_email}
                      </span>
                    )}
                    {app.contact_phone && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Phone size={12} /> {app.contact_phone}
                      </span>
                    )}
                  </Row>
                </div>

                <Row $gap={2}>
                  {app.status === 'pending' && (
                    <>
                      <Button onClick={() => decide(app._id, 'accept')} disabled={review.isPending}>
                        <Check size={14} /> Accept
                      </Button>
                      <Button $variant="outline" onClick={() => decide(app._id, 'reject')} disabled={review.isPending}>
                        <X size={14} /> Reject
                      </Button>
                    </>
                  )}
                  {canMessage && (
                    <MessageButton recipientId={v!._id} recipientName={name} contextType="volunteer"
                      label="Message" subject={app.contact_email ? name : 'Volunteer opportunity'} />
                  )}
                  <Link
                    href={`/business/applications/${app._id}`}
                    style={{ display: 'inline-flex', alignItems: 'center', color: '#1A5FA8', fontSize: 14 }}
                  >
                    View <ChevronRight size={16} />
                  </Link>
                </Row>
              </ApplicantRow>
            )
          })}
        </Card>
      </Container>
    </Page>
  )
}
