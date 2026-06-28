'use client'

/**
 * Miracle Mode (RG-19). Two pieces:
 *  - MiracleBanner: a platform-wide rally banner listing campaigns currently in
 *    emergency Miracle Mode.
 *  - MiracleModeToggle: creator/admin control to activate or deactivate Miracle
 *    Mode on a specific campaign.
 */

import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { Siren, Flame } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS } from '@/styles/tokens'
import { Card, SectionTitle, Muted, Empty, Button, Field, Label, Input } from '@/features/gamification/ui'
import {
  useMiracleCampaigns, useActivateMiracleMode, useDeactivateMiracleMode,
} from '@/api/hooks/useRewards'

const Banner = styled.div`
  border-radius: ${BORDER_RADIUS.LG};
  border: 1px solid #fecaca;
  background: linear-gradient(135deg, #fff1f2, #ffe4e6);
  padding: ${SPACING[4]};
`

const Item = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${SPACING[3]};
  padding: ${SPACING[3]};
  border-radius: ${BORDER_RADIUS.MD};
  text-decoration: none;
  color: ${COLORS.TEXT};
  &:hover { background: rgba(255,255,255,0.6); }
`

const Thumb = styled.div<{ $url?: string | null }>`
  width: 44px; height: 44px; border-radius: ${BORDER_RADIUS.MD}; flex-shrink: 0;
  background: ${(p) => (p.$url ? `url(${p.$url}) center/cover` : '#fecaca')};
`

export function MiracleBanner() {
  const { data } = useMiracleCampaigns(10)
  const campaigns = data ?? []
  if (campaigns.length === 0) return null

  return (
    <Banner>
      <SectionTitle style={{ color: '#b91c1c' }}><Siren size={18} color="#b91c1c" /> Miracle Mode — campaigns rallying now</SectionTitle>
      <div>
        {campaigns.map((c) => (
          <Item key={c._id} href={`/campaigns/${c._id}`}>
            <Thumb $url={c.image_url} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: 14 }}>{c.title}</strong>
              {c.miracle_mode?.reason && <Muted style={{ fontSize: 12 }}>{c.miracle_mode.reason}</Muted>}
            </div>
            <Flame size={18} color="#ef4444" />
          </Item>
        ))}
      </div>
    </Banner>
  )
}

export function MiracleModeToggle({ campaignId, active }: { campaignId: string; active: boolean }) {
  const activate = useActivateMiracleMode()
  const deactivate = useDeactivateMiracleMode()
  const [reason, setReason] = React.useState('')
  const [hours, setHours] = React.useState<number | ''>('')

  if (active) {
    return (
      <Card>
        <SectionTitle style={{ color: '#b91c1c' }}><Siren size={18} color="#b91c1c" /> Miracle Mode is ON</SectionTitle>
        <Muted>This campaign is being boosted and rallied platform-wide.</Muted>
        <Button $variant="danger" style={{ marginTop: 12 }} disabled={deactivate.isPending} onClick={() => deactivate.mutate(campaignId)}>
          {deactivate.isPending ? 'Turning off…' : 'Turn off Miracle Mode'}
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <SectionTitle><Siren size={18} color="#b91c1c" /> Activate Miracle Mode</SectionTitle>
      <Muted>For genuine emergencies — rally the whole community to this campaign.</Muted>
      <Field>
        <Label>Reason (optional)</Label>
        <Input value={reason} maxLength={500} placeholder="Why is this urgent?" onChange={(e) => setReason(e.target.value)} />
      </Field>
      <Field>
        <Label>Duration in hours (optional)</Label>
        <Input type="number" min={1} max={168} value={hours} placeholder="e.g. 48"
          onChange={(e) => setHours(e.target.value === '' ? '' : Number(e.target.value))} />
      </Field>
      <Button
        disabled={activate.isPending}
        onClick={() => activate.mutate({ campaignId, reason: reason.trim() || undefined, duration_hours: hours === '' ? undefined : Number(hours) })}
      >
        {activate.isPending ? 'Activating…' : 'Activate Miracle Mode'}
      </Button>
    </Card>
  )
}
