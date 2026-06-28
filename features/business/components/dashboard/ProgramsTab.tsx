'use client'

/**
 * BU-06 + BU-07 program management from the owner dashboard.
 *
 * Lists are owner-scoped (all statuses) via the backend /opportunities/mine and
 * /giveaways/mine endpoints, with create forms and lifecycle actions (publish /
 * draw giveaways, close opportunities).
 */

import { useState } from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Plus, Megaphone, Trophy } from 'lucide-react'
import Link from 'next/link'
import { Card, Field, Label, Input, Textarea, Select, Button, Row, Muted, Badge, humanize, statusTone, tk } from '@/features/business/ui'

/**
 * Responsive two-up grid that never forces a column wider than its container.
 * `min(420px, 100%)` keeps the track from overflowing narrow (mobile) viewports,
 * while `min-width: 0` stops long titles / wide inputs from blowing the columns out.
 */
const ProgramsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(420px, 100%), 1fr));
  gap: 1.25rem;
  width: 100%;

  > * {
    min-width: 0;
  }
`

// ─── Card header (icon badge + title + helper) — mirrors the dashboard look ────

const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
`
const HeadIcon = styled.div<{ $tone: 'amber' | 'blue' }>`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => (p.$tone === 'amber' ? tk.amberDark : tk.blue)};
  background: ${(p) => (p.$tone === 'amber' ? tk.amberLight : tk.blueLight)};
`
const HeadTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  letter-spacing: -0.2px;
`
const HeadSub = styled.p`
  font-size: 0.8rem;
  color: ${tk.muted};
  margin: 2px 0 0 0;
  line-height: 1.45;
`

// ─── Checkbox row ──────────────────────────────────────────────────────────────

const CheckRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: ${tk.body};
  cursor: pointer;
  margin-bottom: 1.25rem;

  input { width: 16px; height: 16px; accent-color: ${tk.amber}; cursor: pointer; }
`

// ─── "Your …" list ──────────────────────────────────────────────────────────────

const ListHead = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${tk.muted};
  margin: 1.75rem 0 0.5rem 0;
`
const ListItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 0.75rem 0;
  border-top: 1px solid ${tk.border};
`
const ItemLink = styled(Link)`
  color: ${tk.blue};
  font-size: 0.88rem;
  font-weight: 500;
  text-decoration: none;
  min-width: 0;
  overflow-wrap: anywhere;
  &:hover { text-decoration: underline; }
`
import {
  useCreateOpportunity,
  useCreateGiveaway,
  useGiveawayLifecycle,
  useCloseOpportunity,
  useMyOpportunities,
  useMyGiveaways,
} from '@/api/hooks/useBusiness'
import {
  OPPORTUNITY_CATEGORIES,
  GIVEAWAY_TYPES,
  type OpportunityCategory,
  type GiveawayType,
} from '@/types/business'

export default function ProgramsTab() {
  // ── Opportunity form ──
  const [oTitle, setOTitle] = useState('')
  const [oDesc, setODesc] = useState('')
  const [oCat, setOCat] = useState<OpportunityCategory>('community_support')
  const [oRemote, setORemote] = useState(false)
  const [oSlots, setOSlots] = useState(1)

  // ── Giveaway form ──
  const [gTitle, setGTitle] = useState('')
  const [gDesc, setGDesc] = useState('')
  const [gType, setGType] = useState<GiveawayType>('product')
  const [gValue, setGValue] = useState('')
  const [gWinners, setGWinners] = useState(1)
  const [gEnds, setGEnds] = useState('')

  const { data: oppData } = useMyOpportunities({ limit: 50 })
  const { data: giveawayData } = useMyGiveaways({ limit: 50 })

  const createOpp = useCreateOpportunity()
  const createGiveaway = useCreateGiveaway()
  const closeOpp = useCloseOpportunity()
  const { publish, draw, cancel } = useGiveawayLifecycle()

  const submitOpp = async () => {
    if (oTitle.trim().length < 5 || oDesc.trim().length < 20) {
      toast.error('Title (5+) and description (20+) are required')
      return
    }
    try {
      await createOpp.mutateAsync({
        title: oTitle.trim(),
        description: oDesc.trim(),
        category: oCat,
        is_remote: oRemote,
        slots_available: oSlots,
      })
      setOTitle('')
      setODesc('')
      toast.success('Opportunity posted!')
    } catch {
      /* handled by api client */
    }
  }

  const submitGiveaway = async () => {
    if (gTitle.trim().length < 5 || !gDesc.trim() || !gEnds) {
      toast.error('Title, description and end date are required')
      return
    }
    try {
      await createGiveaway.mutateAsync({
        title: gTitle.trim(),
        description: gDesc.trim(),
        giveaway_type: gType,
        estimated_value_cents: gValue ? Math.round(parseFloat(gValue) * 100) : 0,
        winners_count: gWinners,
        ends_at: new Date(gEnds).toISOString(),
      })
      setGTitle('')
      setGDesc('')
      setGEnds('')
      toast.success('Giveaway created as draft — publish it to open entries.')
    } catch {
      /* handled by api client */
    }
  }

  const runGiveawayAction = async (
    action: typeof publish | typeof draw | typeof cancel,
    id: string,
    successMsg: string
  ) => {
    try {
      await action.mutateAsync(id)
      toast.success(successMsg)
    } catch {
      /* handled */
    }
  }

  const opportunities = oppData?.opportunities ?? []
  const giveaways = giveawayData?.giveaways ?? []

  return (
    <ProgramsGrid>
      {/* ── BU-06 ── */}
      <Card>
        <CardHead>
          <HeadIcon $tone="blue"><Megaphone size={20} /></HeadIcon>
          <div>
            <HeadTitle>Post a Volunteer Opportunity</HeadTitle>
            <HeadSub>Recruit volunteers for a cause. Posted opportunities appear in the public directory.</HeadSub>
          </div>
        </CardHead>

        <Field>
          <Label>Title *</Label>
          <Input value={oTitle} onChange={(e) => setOTitle(e.target.value)} placeholder="e.g. Weekend food-bank packing" />
        </Field>
        <Field>
          <Label>Description *</Label>
          <Textarea value={oDesc} onChange={(e) => setODesc(e.target.value)} placeholder="What will volunteers do? (20+ characters)" />
        </Field>
        <Row $gap={4} $wrap style={{ alignItems: 'flex-start' }}>
          <Field style={{ flex: 1, minWidth: 180 }}>
            <Label>Category</Label>
            <Select value={oCat} onChange={(e) => setOCat(e.target.value as OpportunityCategory)} style={{ width: '100%' }}>
              {OPPORTUNITY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {humanize(c)}
                </option>
              ))}
            </Select>
          </Field>
          <Field style={{ width: 120 }}>
            <Label>Slots</Label>
            <Input type="number" min={1} value={oSlots} onChange={(e) => setOSlots(Math.max(1, +e.target.value))} />
          </Field>
        </Row>
        <CheckRow>
          <input type="checkbox" checked={oRemote} onChange={(e) => setORemote(e.target.checked)} /> Remote opportunity
        </CheckRow>
        <div>
          <Button onClick={submitOpp} disabled={createOpp.isPending}>
            <Plus size={15} /> {createOpp.isPending ? 'Posting…' : 'Post opportunity'}
          </Button>
        </div>

        <ListHead>Your opportunities</ListHead>
        {opportunities.length === 0 && <Muted>None yet.</Muted>}
        {opportunities.map((o) => (
          <ListItem key={o.id}>
            <ItemLink href={`/opportunities/${o.id}`}>
              {o.title} <Muted as="span">({o.slots_filled}/{o.slots_available} filled)</Muted>
            </ItemLink>
            <Row $gap={2}>
              <ItemLink href={`/business/opportunities/${o.id}/applications`}>
                {o.applications_count} application{o.applications_count === 1 ? '' : 's'}
              </ItemLink>
              <Badge $tone={statusTone(o.status)}>{humanize(o.status)}</Badge>
              {o.status === 'open' && (
                <Button $variant="outline" onClick={() => closeOpp.mutate(o.id)} disabled={closeOpp.isPending}>
                  Close
                </Button>
              )}
            </Row>
          </ListItem>
        ))}
      </Card>

      {/* ── BU-07 ── */}
      <Card>
        <CardHead>
          <HeadIcon $tone="amber"><Trophy size={20} /></HeadIcon>
          <div>
            <HeadTitle>Create a Giveaway</HeadTitle>
            <HeadSub>Reward your community. New giveaways start as a draft — publish to open entries.</HeadSub>
          </div>
        </CardHead>

        <Field>
          <Label>Title *</Label>
          <Input value={gTitle} onChange={(e) => setGTitle(e.target.value)} placeholder="e.g. $100 grocery gift card" />
        </Field>
        <Field>
          <Label>Description *</Label>
          <Textarea value={gDesc} onChange={(e) => setGDesc(e.target.value)} placeholder="Describe the prize and how to enter" />
        </Field>
        <Row $gap={4} $wrap style={{ alignItems: 'flex-start' }}>
          <Field style={{ flex: 1, minWidth: 160 }}>
            <Label>Type</Label>
            <Select value={gType} onChange={(e) => setGType(e.target.value as GiveawayType)} style={{ width: '100%' }}>
              {GIVEAWAY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {humanize(t)}
                </option>
              ))}
            </Select>
          </Field>
          <Field style={{ width: 140 }}>
            <Label>Value ($)</Label>
            <Input type="number" min={0} step="0.01" value={gValue} onChange={(e) => setGValue(e.target.value)} />
          </Field>
          <Field style={{ width: 110 }}>
            <Label>Winners</Label>
            <Input type="number" min={1} value={gWinners} onChange={(e) => setGWinners(Math.max(1, +e.target.value))} />
          </Field>
        </Row>
        <Field>
          <Label>Ends at *</Label>
          <Input type="datetime-local" value={gEnds} onChange={(e) => setGEnds(e.target.value)} />
        </Field>
        <div>
          <Button onClick={submitGiveaway} disabled={createGiveaway.isPending}>
            <Plus size={15} /> {createGiveaway.isPending ? 'Creating…' : 'Create giveaway'}
          </Button>
        </div>

        <ListHead>Your giveaways</ListHead>
        {giveaways.length === 0 && <Muted>None yet.</Muted>}
        {giveaways.map((g) => (
          <ListItem key={g.id}>
            <ItemLink href={`/giveaways/${g.id}`}>
              {g.title} <Muted as="span">({g.entries_count} entries)</Muted>
            </ItemLink>
            <Row $gap={2}>
              {(g.status === 'active' || g.status === 'drawing_complete' || g.status === 'fulfilled') && (
                <ItemLink href={`/business/giveaways/${g.id}/winners`}>Winners</ItemLink>
              )}
              <Badge $tone={statusTone(g.status)}>{humanize(g.status)}</Badge>
              {g.status === 'draft' && (
                <Button $variant="outline" onClick={() => runGiveawayAction(publish, g.id, 'Published!')} disabled={publish.isPending}>
                  Publish
                </Button>
              )}
              {g.status === 'active' && (
                <Button $variant="ghost" onClick={() => runGiveawayAction(cancel, g.id, 'Cancelled')} disabled={cancel.isPending}>
                  Cancel
                </Button>
              )}
            </Row>
          </ListItem>
        ))}
      </Card>
    </ProgramsGrid>
  )
}
