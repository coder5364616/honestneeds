'use client'

/**
 * BU-07 Winner experience — "you won, claim your prize".
 * Lists the current user's giveaway wins (GiveawayClaim records) and lets them
 * submit fulfilment details for any prize still awaiting a claim.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Gift, PartyPopper, Truck } from 'lucide-react'
import { Page, Hero, HeroTitle, HeroSubtitle, Container, Card, Grid, Field, Label, Input, Textarea, Button, Row, Badge, Muted, Empty, humanize, statusTone, formatCents, formatDate } from '@/features/dashboardUI'
import { useMyClaims, useClaimPrize } from '@/api/hooks/useBusiness'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useAuthHydration } from '@/hooks/useAuthHydration'
import type { GiveawayClaim } from '@/types/business'

function giveawayTitle(claim: GiveawayClaim): string {
  return typeof claim.giveaway_id === 'object' ? claim.giveaway_id.title : 'Giveaway prize'
}
function giveawayValue(claim: GiveawayClaim): number {
  return typeof claim.giveaway_id === 'object' ? claim.giveaway_id.estimated_value_cents : 0
}
function businessName(claim: GiveawayClaim): string {
  return typeof claim.business_id === 'object' ? claim.business_id.business_name : ''
}

function ClaimForm({ claim }: { claim: GiveawayClaim }) {
  const claimPrize = useClaimPrize()
  const [email, setEmail] = useState(claim.fulfilment?.contact_email ?? '')
  const [phone, setPhone] = useState(claim.fulfilment?.contact_phone ?? '')
  const [address, setAddress] = useState(claim.fulfilment?.shipping_address ?? '')
  const [notes, setNotes] = useState(claim.fulfilment?.notes ?? '')

  const submit = async () => {
    try {
      await claimPrize.mutateAsync({
        claimId: claim._id,
        payload: { contact_email: email, contact_phone: phone, shipping_address: address, notes },
      })
      toast.success('Prize claimed! The business will arrange fulfilment.')
    } catch {
      /* handled by api client */
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <Field>
        <Label>Contact email</Label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Field>
        <Label>Contact phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field>
        <Label>Shipping address (for physical prizes)</Label>
        <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
      </Field>
      <Field>
        <Label>Notes (sizing, preferences, redemption details…)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <Button onClick={submit} disabled={claimPrize.isPending}>
        {claimPrize.isPending ? 'Submitting…' : 'Claim my prize'}
      </Button>
    </div>
  )
}

export default function GiveawayWinsPage() {
  const router = useRouter()
  const hydrated = useAuthHydration()
  const isAuthed = useIsAuthenticated()
  const { data, isLoading } = useMyClaims()

  useEffect(() => {
    if (hydrated && !isAuthed) router.push('/login')
  }, [hydrated, isAuthed, router])

  if (!hydrated || !isAuthed) {
    return (
      <Page>
        <Container>
          <Muted>{hydrated ? 'Redirecting to login…' : 'Loading…'}</Muted>
        </Container>
      </Page>
    )
  }

  const claims = data?.claims ?? []

  return (
    <Page>
      <Hero>
        <HeroTitle>
          <Row $gap={2} style={{ justifyContent: 'center' }}>
            <PartyPopper size={28} /> Your Giveaway Wins
          </Row>
        </HeroTitle>
        <HeroSubtitle>Claim the prizes you&apos;ve won and track their fulfilment.</HeroSubtitle>
      </Hero>

      <Container>
        {isLoading && <Muted>Loading your wins…</Muted>}

        {!isLoading && claims.length === 0 && (
          <Empty>
            <Gift size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
            <h3>No wins yet</h3>
            <p>Enter active giveaways for a chance to win prizes from businesses.</p>
            <Button $variant="outline" onClick={() => router.push('/giveaways')}>
              Browse giveaways
            </Button>
          </Empty>
        )}

        {claims.length > 0 && (
          <Grid $min="340px">
            {claims.map((claim) => {
              const value = giveawayValue(claim)
              const isPending = claim.status === 'pending_claim'
              const expired = claim.status === 'expired'
              return (
                <Card key={claim._id}>
                  <Row $gap={2} style={{ justifyContent: 'space-between' }}>
                    <h3 style={{ margin: 0 }}>{giveawayTitle(claim)}</h3>
                    <Badge $tone={statusTone(claim.status)}>{humanize(claim.status)}</Badge>
                  </Row>
                  {businessName(claim) && <Muted>from {businessName(claim)}</Muted>}
                  {value > 0 && <Muted>Estimated value: {formatCents(value)}</Muted>}

                  {isPending && (
                    <>
                      <Muted style={{ marginTop: 8 }}>
                        🎉 Congratulations! Claim by <strong>{formatDate(claim.claim_deadline)}</strong>.
                      </Muted>
                      <ClaimForm claim={claim} />
                    </>
                  )}

                  {expired && <Muted style={{ marginTop: 8 }}>This claim window has expired.</Muted>}

                  {!isPending && !expired && (
                    <Muted style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Truck size={15} />
                      {claim.tracking_reference
                        ? `Tracking: ${claim.tracking_reference}`
                        : claim.status === 'claimed'
                          ? 'Claimed — awaiting fulfilment by the business.'
                          : `Status: ${humanize(claim.status)}`}
                    </Muted>
                  )}
                </Card>
              )
            })}
          </Grid>
        )}
      </Container>
    </Page>
  )
}
