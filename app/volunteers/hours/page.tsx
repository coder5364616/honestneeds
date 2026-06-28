'use client'

/**
 * Volunteer Hour Logging (VO-03) + Proof of Kindness attachments (VO-06).
 * Log hours against a campaign / opportunity (or independently), attach proof,
 * and track verification status. Only verified hours count toward totals.
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react'
import {
  Page, Hero, HeroTitle, HeroSubtitle, Container, Card, SectionTitle, Grid, Row,
  Field, Label, Input, Textarea, Select, Button, Badge, Muted, Empty, humanize, formatDate, statusTone,
} from '@/features/volunteer/ui'
import { useMyHourLogs, useLogHours, useCancelHourLog } from '@/api/hooks/useVolunteerProgram'
import { useIsAuthenticated } from '@/hooks/useAuth'
import type { ProofAttachment } from '@/types/volunteer'

function refTitle(ref: unknown): string | null {
  if (ref && typeof ref === 'object' && 'title' in ref) return (ref as { title?: string }).title ?? null
  return null
}

export default function VolunteerHoursPage() {
  const isAuthed = useIsAuthenticated()
  const logHours = useLogHours()
  const cancelLog = useCancelHourLog()
  const [statusFilter, setStatusFilter] = useState<string>('')
  const { data, isLoading } = useMyHourLogs({ status: statusFilter || undefined, limit: 50 })

  const [form, setForm] = useState({
    hours: 1,
    activity_date: new Date().toISOString().slice(0, 10),
    description: '',
    link_type: 'independent' as 'independent' | 'campaign' | 'opportunity',
    link_id: '',
  })
  const [proofs, setProofs] = useState<ProofAttachment[]>([])
  const [proofDraft, setProofDraft] = useState({ url: '', caption: '' })

  const addProof = () => {
    if (!proofDraft.url.trim()) return
    setProofs((p) => [...p, { url: proofDraft.url.trim(), type: 'image', caption: proofDraft.caption.trim() }])
    setProofDraft({ url: '', caption: '' })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await logHours.mutateAsync({
      hours: Number(form.hours),
      activity_date: new Date(form.activity_date).toISOString(),
      description: form.description.trim() || undefined,
      campaign_id: form.link_type === 'campaign' ? form.link_id.trim() || undefined : undefined,
      opportunity_id: form.link_type === 'opportunity' ? form.link_id.trim() || undefined : undefined,
      proof_attachments: proofs.length ? proofs : undefined,
    })
    setForm((f) => ({ ...f, hours: 1, description: '', link_id: '' }))
    setProofs([])
  }

  if (!isAuthed) {
    return (
      <Page><Container><Card><Muted>Please sign in to log volunteer hours.</Muted></Card></Container></Page>
    )
  }

  return (
    <Page>
      <Hero>
        <HeroTitle>Log Volunteer Hours</HeroTitle>
        <HeroSubtitle>Record what you did. A campaign creator, business, or admin verifies it — then it counts.</HeroSubtitle>
      </Hero>

      <Container>
        <Link href="/volunteers" style={{ textDecoration: 'none' }}>
          <Row $gap={2} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> <Muted>Back to Volunteer Center</Muted></Row>
        </Link>

        <Grid $min="320px">
          {/* Log form */}
          <Card as="form" onSubmit={submit}>
            <SectionTitle>New hour log</SectionTitle>

            <Row $gap={3} $wrap>
              <Field style={{ flex: 1, minWidth: 120 }}>
                <Label>Hours</Label>
                <Input type="number" min={0.25} max={24} step={0.25} value={form.hours}
                  onChange={(e) => setForm((f) => ({ ...f, hours: Number(e.target.value) }))} required />
              </Field>
              <Field style={{ flex: 1, minWidth: 160 }}>
                <Label>Activity date</Label>
                <Input type="date" max={new Date().toISOString().slice(0, 10)} value={form.activity_date}
                  onChange={(e) => setForm((f) => ({ ...f, activity_date: e.target.value }))} required />
              </Field>
            </Row>

            <Field>
              <Label>What did you do?</Label>
              <Textarea placeholder="Describe the volunteer activity…" maxLength={2000} value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </Field>

            <Row $gap={3} $wrap>
              <Field style={{ flex: 1, minWidth: 160 }}>
                <Label>Link to</Label>
                <Select
                  value={form.link_type}
                  onChange={(e) => setForm((f) => ({ ...f, link_type: e.target.value as typeof form.link_type, link_id: '' }))}
                  style={{ width: '100%' }}
                >
                  <option value="independent">Independent (no link)</option>
                  <option value="campaign">A campaign</option>
                  <option value="opportunity">An opportunity</option>
                </Select>
              </Field>
              {form.link_type !== 'independent' && (
                <Field style={{ flex: 1, minWidth: 200 }}>
                  <Label>{humanize(form.link_type)} ID</Label>
                  <Input placeholder={`Paste ${form.link_type} ID`} value={form.link_id}
                    onChange={(e) => setForm((f) => ({ ...f, link_id: e.target.value }))} />
                </Field>
              )}
            </Row>

            {/* Proof of kindness (VO-06) */}
            <Field>
              <Label>Proof of kindness (optional)</Label>
              <Muted style={{ marginBottom: 8 }}>
                Attach photos/links. A verifier can flag a proven log as a “Proof of Kindness”.
              </Muted>
              {proofs.map((p, i) => (
                <Row key={i} $gap={2} style={{ marginBottom: 6 }}>
                  <Badge $tone="info">{p.caption || p.url}</Badge>
                  <Button type="button" $variant="ghost" onClick={() => setProofs((arr) => arr.filter((_, idx) => idx !== i))}>
                    <X size={14} />
                  </Button>
                </Row>
              ))}
              <Row $gap={2} $wrap>
                <Input placeholder="https://image-url…" value={proofDraft.url}
                  onChange={(e) => setProofDraft((d) => ({ ...d, url: e.target.value }))} style={{ flex: 2, minWidth: 160 }} />
                <Input placeholder="Caption" value={proofDraft.caption}
                  onChange={(e) => setProofDraft((d) => ({ ...d, caption: e.target.value }))} style={{ flex: 1, minWidth: 120 }} />
                <Button type="button" $variant="outline" onClick={addProof}><Plus size={14} /> Add</Button>
              </Row>
            </Field>

            <Button type="submit" disabled={logHours.isPending}>
              {logHours.isPending ? 'Logging…' : 'Log hours'}
            </Button>
          </Card>

          {/* My logs */}
          <div>
            <Row style={{ justifyContent: 'space-between', marginBottom: 12 }}>
              <SectionTitle style={{ margin: 0 }}>My hour logs</SectionTitle>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Row>

            {isLoading && <Muted>Loading…</Muted>}
            {data && data.logs.length === 0 && <Empty>No hour logs yet.</Empty>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data?.logs.map((log) => {
                const linked = refTitle(log.campaign_id) || refTitle(log.opportunity_id)
                return (
                  <Card key={log._id}>
                    <Row style={{ justifyContent: 'space-between' }}>
                      <strong>{log.hours} hrs · {formatDate(log.activity_date)}</strong>
                      <Row $gap={2}>
                        <Badge $tone={statusTone(log.status)}>{humanize(log.status)}</Badge>
                        {log.proof_of_kindness && <Badge $tone="info">💗 Proof of Kindness</Badge>}
                      </Row>
                    </Row>
                    {linked && <Muted style={{ marginTop: 4 }}>For: {linked}</Muted>}
                    {log.description && <p style={{ margin: '8px 0 0', fontSize: 14 }}>{log.description}</p>}
                    {log.decision_note && <Muted style={{ marginTop: 6 }}>Note: {log.decision_note}</Muted>}
                    {log.status === 'pending' && (
                      <Row style={{ marginTop: 10 }}>
                        <Button $variant="ghost" onClick={() => cancelLog.mutate(log._id)} disabled={cancelLog.isPending}>
                          <Trash2 size={14} /> Cancel
                        </Button>
                      </Row>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        </Grid>
      </Container>
    </Page>
  )
}
