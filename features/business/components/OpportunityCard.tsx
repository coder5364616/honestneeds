'use client'

import Link from 'next/link'
import styled from 'styled-components'
import { MapPin, Clock, Users, Briefcase } from 'lucide-react'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '@/styles/tokens'
import { Badge, Muted, Button, humanize, statusTone } from '@/features/business/ui'
import type { VolunteerOpportunity } from '@/types/business'

const Wrap = styled.div`
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.LG};
  box-shadow: ${SHADOWS.SM};
  padding: ${SPACING[5]};
  display: flex;
  flex-direction: column;
  gap: ${SPACING[3]};
`

const Title = styled.h3`
  font-size: ${TYPOGRAPHY.SIZE_LG};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
  margin: 0;
`

const Desc = styled.p`
  color: ${COLORS.MUTED_TEXT};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const Meta = styled.div`
  display: flex;
  gap: ${SPACING[4]};
  flex-wrap: wrap;
  color: ${COLORS.MUTED_TEXT};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`

export default function OpportunityCard({
  opportunity,
  onApply,
  applying,
}: {
  opportunity: VolunteerOpportunity
  onApply?: (id: string) => void
  applying?: boolean
}) {
  const loc = opportunity.is_remote
    ? 'Remote'
    : [opportunity.location?.city, opportunity.location?.state].filter(Boolean).join(', ') || 'On-site'
  const slotsLeft = Math.max(0, opportunity.slots_available - opportunity.slots_filled)

  return (
    <Wrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Badge $tone="info">{humanize(opportunity.category)}</Badge>
        <Badge $tone={statusTone(opportunity.status)}>{humanize(opportunity.status)}</Badge>
      </div>
      <Title>
        <Link href={`/opportunities/${opportunity.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
          {opportunity.title}
        </Link>
      </Title>
      {opportunity.business?.business_name && (
        <Muted style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Briefcase size={13} /> {opportunity.business.business_name}
        </Muted>
      )}
      <Desc>{opportunity.description}</Desc>
      <Meta>
        <span>
          <MapPin size={14} /> {loc}
        </span>
        {!!opportunity.time_commitment?.hours_per_week && (
          <span>
            <Clock size={14} /> {opportunity.time_commitment.hours_per_week}h/wk
          </span>
        )}
        <span>
          <Users size={14} /> {slotsLeft} slot{slotsLeft === 1 ? '' : 's'} left
        </span>
      </Meta>
      {opportunity.skills_required?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {opportunity.skills_required.slice(0, 5).map((s) => (
            <Badge key={s} $tone="muted">
              {s}
            </Badge>
          ))}
        </div>
      )}
      {onApply && (
        <Button
          onClick={() => onApply(opportunity.id)}
          disabled={applying || opportunity.status !== 'open' || slotsLeft === 0}
          style={{ marginTop: 'auto' }}
        >
          {slotsLeft === 0 ? 'Full' : applying ? 'Applying…' : 'Apply to volunteer'}
        </Button>
      )}
    </Wrap>
  )
}
