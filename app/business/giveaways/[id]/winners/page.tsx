'use client'

/**
 * BU-07 Business: draw winners + fulfil giveaway prizes.
 *
 * The owner-side back half of the giveaway lifecycle:
 *  - active                → draw winners (seeded random) from the entrants
 *  - drawing_complete       → see each winner, their claim & fulfilment details,
 *                             then mark shipped / redeemed / fulfilled and record
 *                             a tracking reference.
 *
 * Backed by GET /giveaways/:id/claims and POST /giveaways/claims/:id/fulfil.
 */

import { use, useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import {
  ArrowLeft,
  Trophy,
  Mail,
  Phone,
  MapPin,
  Truck,
  CheckCircle2,
  Sparkles,
  User,
} from 'lucide-react'
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
  humanize,
  statusTone,
  formatCents,
  formatDate,
  tk,
} from '@/features/business/ui'
import {
  useGiveaway,
  useGiveawayClaims,
  useGiveawayLifecycle,
  useFulfilClaim,
} from '@/api/hooks/useBusiness'
import type { GiveawayClaim } from '@/types/business'

const Detail = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
  color: ${tk.body};
  font-size: 0.85rem;
  margin: 0.75rem 0;
  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    overflow-wrap: anywhere;
  }
`

function winnerName(claim: GiveawayClaim): string {
  const w = claim.winner_id
  return typeof w === 'object' ? w.display_name || w.username || w.email || 'Winner' : 'Winner'
}

function ClaimCard({ claim }: { claim: GiveawayClaim }) {
  const fulfil = useFulfilClaim()
  const [tracking, setTracking] = useState(claim.tracking_reference ?? '')
  const f = claim.fulfilment
  const isFulfilled = claim.status === 'fulfilled'
  const awaitingClaim = claim.status === 'pending_claim'

  const mark = async (m: 'shipped' | 'redeemed' | 'fulfilled') => {
    try {
      await fulfil.mutateAsync({ claimId: claim._id, mark: m, tracking_reference: tracking.trim() || undefined })
      toast.success(`Marked ${m}.`)
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Card>
      <Row $gap={3} $wrap style={{ justifyContent: 'space-between' }}>
        <Row $gap={2}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: tk.amberLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tk.amberDark,
            }}
          >
            <User size={18} />
          </div>
          <strong style={{ color: tk.heading }}>{winnerName(claim)}</strong>
        </Row>
        <Badge $tone={statusTone(claim.status)}>{humanize(claim.status)}</Badge>
      </Row>

      {awaitingClaim ? (
        <Muted style={{ marginTop: 12 }}>
          Waiting for the winner to claim and submit fulfilment details. Claim window closes{' '}
          <strong>{formatDate(claim.claim_deadline)}</strong>.
        </Muted>
      ) : (
        <>
          <Detail>
            {f?.contact_email && (
              <span>
                <Mail size={14} /> {f.contact_email}
              </span>
            )}
            {f?.contact_phone && (
              <span>
                <Phone size={14} /> {f.contact_phone}
              </span>
            )}
            {f?.shipping_address && (
              <span>
                <MapPin size={14} /> {f.shipping_address}
              </span>
            )}
          </Detail>
          {f?.notes && <Muted style={{ marginBottom: 8 }}>“{f.notes}”</Muted>}

          {!isFulfilled && (
            <>
              <Field style={{ marginBottom: 10 }}>
                <Label>Tracking / redemption reference</Label>
                <Input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="e.g. courier tracking no. or voucher code"
                />
              </Field>
              <Row $gap={2} $wrap>
                <Button $variant="outline" onClick={() => mark('shipped')} disabled={fulfil.isPending}>
                  <Truck size={14} /> Mark shipped
                </Button>
                <Button $variant="outline" onClick={() => mark('redeemed')} disabled={fulfil.isPending}>
                  <Sparkles size={14} /> Mark redeemed
                </Button>
                <Button onClick={() => mark('fulfilled')} disabled={fulfil.isPending}>
                  <CheckCircle2 size={14} /> Mark fulfilled
                </Button>
              </Row>
            </>
          )}

          {isFulfilled && (
            <Muted style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6, color: tk.green }}>
              <CheckCircle2 size={15} /> Fulfilled {claim.fulfilled_at ? `on ${formatDate(claim.fulfilled_at)}` : ''}
              {claim.tracking_reference ? ` · ${claim.tracking_reference}` : ''}
            </Muted>
          )}
        </>
      )}
    </Card>
  )
}

export default function GiveawayWinnersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: giveaway } = useGiveaway(id)
  const { data, isLoading, isError } = useGiveawayClaims(id)
  const { draw } = useGiveawayLifecycle()

  const claims = data?.claims ?? []
  const notDrawnYet = giveaway && (giveaway.status === 'active' || giveaway.status === 'draft')

  const handleDraw = async () => {
    try {
      await draw.mutateAsync(id)
      toast.success('Winners drawn! 🎉')
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Page>
      <Container style={{ maxWidth: 820 }}>
        <Link
          href="/business/dashboard"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14, marginBottom: 20 }}
        >
          <ArrowLeft size={15} /> Dashboard
        </Link>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', margin: '0 0 4px', color: '#18171A' }}>
          Winners & fulfilment
        </h1>
        <Muted style={{ marginBottom: 20 }}>
          {giveaway ? (
            <>
              For{' '}
              <Link href={`/giveaways/${id}`} style={{ color: '#1A5FA8' }}>
                {giveaway.title}
              </Link>{' '}
              · {giveaway.entries_count} entries · {giveaway.winners_count} winner
              {giveaway.winners_count === 1 ? '' : 's'}
              {giveaway.estimated_value_cents > 0 && <> · {formatCents(giveaway.estimated_value_cents)} value</>}
            </>
          ) : (
            'Loading giveaway…'
          )}
        </Muted>

        {/* ── Draw stage ── */}
        {notDrawnYet && (
          <Card style={{ marginBottom: 20 }}>
            <Row $gap={2} style={{ marginBottom: 8 }}>
              <Trophy size={18} style={{ color: tk.amber }} />
              <strong style={{ color: tk.heading }}>Ready to pick winners?</strong>
            </Row>
            <Muted style={{ marginBottom: 12 }}>
              {giveaway?.status === 'draft'
                ? 'Publish the giveaway first (from your dashboard) so people can enter before you draw.'
                : `Drawing is random and seeded for auditability. ${giveaway?.entries_count || 0} ${
                    giveaway?.entries_count === 1 ? 'person has' : 'people have'
                  } entered.`}
            </Muted>
            <Button
              onClick={handleDraw}
              disabled={draw.isPending || giveaway?.status !== 'active' || (giveaway?.entries_count ?? 0) === 0}
            >
              <Trophy size={15} /> {draw.isPending ? 'Drawing…' : 'Draw winners'}
            </Button>
          </Card>
        )}

        {/* ── Winners list ── */}
        {isLoading && <Muted>Loading winners…</Muted>}
        {isError && <Muted>Could not load winners.</Muted>}

        {!isLoading && !notDrawnYet && claims.length === 0 && (
          <Empty>No winners recorded for this giveaway.</Empty>
        )}

        {claims.length > 0 && (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {claims.map((claim) => (
              <ClaimCard key={claim._id} claim={claim} />
            ))}
          </div>
        )}
      </Container>
    </Page>
  )
}
