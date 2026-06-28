'use client'

/**
 * Hour Verification Inbox (VO-03 verification, VO-06 proof of kindness).
 * Campaign creators / business owners review hours logged against their
 * campaign or opportunity. Scoped via ?campaign_id= or ?opportunity_id=.
 */

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, X, Heart } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Row, Button,
  Select, Badge, Muted, Empty, humanize, formatDate,
} from '@/features/volunteer/ui'
import { useLogsForVerification, useVerifyHourLog } from '@/api/hooks/useVolunteerProgram'
import type { VolunteerHourLog } from '@/types/volunteer'

function volunteerName(v: VolunteerHourLog['volunteer_id']): string {
  if (v && typeof v === 'object') return v.display_name || v.username || v.email || 'Volunteer'
  return 'Volunteer'
}

function VerifyInner() {
  const sp = useSearchParams()
  const campaign_id = sp.get('campaign_id') || undefined
  const opportunity_id = sp.get('opportunity_id') || undefined
  const [status, setStatus] = useState('pending')

  const scoped = !!(campaign_id || opportunity_id)
  const { data, isLoading, isError } = useLogsForVerification(
    { campaign_id, opportunity_id, status, limit: 50 },
    scoped
  )
  const verify = useVerifyHourLog()
  const [pok, setPok] = useState<Record<string, boolean>>({})

  return (
    <Container>
      <Link href="/volunteers" style={{ textDecoration: 'none' }}>
        <Row $gap={2} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> <Muted>Back to Volunteer Center</Muted></Row>
      </Link>

      {!scoped && (
        <Card>
          <SectionTitle>Verification inbox</SectionTitle>
          <Muted>
            Open this page with a <code>?campaign_id=…</code> or <code>?opportunity_id=…</code> query to review hours
            logged against your campaign or opportunity.
          </Muted>
        </Card>
      )}

      {scoped && (
        <>
          <Row style={{ justifyContent: 'space-between', marginBottom: 16 }} $wrap>
            <SectionTitle style={{ margin: 0 }}>
              {campaign_id ? 'Campaign' : 'Opportunity'} hour logs
            </SectionTitle>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </Select>
          </Row>

          {isLoading && <Muted>Loading…</Muted>}
          {isError && <Muted>You are not authorized to verify these logs, or the link is invalid.</Muted>}
          {data && data.logs.length === 0 && <Empty>No {status} logs.</Empty>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data?.logs.map((log) => (
              <Card key={log._id}>
                <Row style={{ justifyContent: 'space-between' }} $wrap>
                  <strong>{volunteerName(log.volunteer_id)}</strong>
                  <Row $gap={2}>
                    <Badge $tone="info">{log.hours} hrs</Badge>
                    <Muted>{formatDate(log.activity_date)}</Muted>
                  </Row>
                </Row>
                {log.description && <p style={{ margin: '8px 0 0', fontSize: 14 }}>{log.description}</p>}

                {log.proof_attachments?.length > 0 && (
                  <Row $gap={2} $wrap style={{ marginTop: 10 }}>
                    {log.proof_attachments.map((p, i) => (
                      <a key={i} href={p.url} target="_blank" rel="noreferrer">
                        <Badge $tone="muted">📎 {p.caption || `Proof ${i + 1}`}</Badge>
                      </a>
                    ))}
                  </Row>
                )}

                {log.status === 'pending' ? (
                  <div style={{ marginTop: 12 }}>
                    {log.proof_attachments?.length > 0 && (
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 10 }}>
                        <input type="checkbox" checked={!!pok[log._id]}
                          onChange={(e) => setPok((m) => ({ ...m, [log._id]: e.target.checked }))} />
                        <Heart size={14} /> Mark as Proof of Kindness
                      </label>
                    )}
                    <Row $gap={2}>
                      <Button
                        onClick={() => verify.mutate({ logId: log._id, payload: { decision: 'verify', proof_of_kindness: !!pok[log._id] } })}
                        disabled={verify.isPending}
                      >
                        <Check size={14} /> Verify
                      </Button>
                      <Button $variant="danger"
                        onClick={() => verify.mutate({ logId: log._id, payload: { decision: 'reject' } })}
                        disabled={verify.isPending}
                      >
                        <X size={14} /> Reject
                      </Button>
                    </Row>
                  </div>
                ) : (
                  <Row $gap={2} style={{ marginTop: 10 }}>
                    <Badge $tone={log.status === 'verified' ? 'success' : 'error'}>{humanize(log.status)}</Badge>
                    {log.proof_of_kindness && <Badge $tone="info">💗 Proof of Kindness</Badge>}
                  </Row>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </Container>
  )
}

export default function VerifyHoursPage() {
  return (
    <Page>
      <Hero>
        <HeroTitle>Verify Volunteer Hours</HeroTitle>
        <HeroSubtitle>Confirm the hours volunteers logged for your campaign or opportunity.</HeroSubtitle>
      </Hero>
      <Suspense fallback={<Container><Muted>Loading…</Muted></Container>}>
        <VerifyInner />
      </Suspense>
    </Page>
  )
}
