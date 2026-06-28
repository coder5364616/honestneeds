'use client'

import Link from 'next/link'
import styled from 'styled-components'
import { Gift, Users, Trophy, Clock } from 'lucide-react'
import { Badge, Muted, Button, humanize, statusTone, formatCents, formatDate, tk } from '@/features/dashboardUI'
import type { BusinessGiveaway } from '@/types/business'

const Wrap = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 200ms, box-shadow 200ms, transform 120ms;
  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
    transform: translateY(-1px);
  }
`

const Image = styled.div<{ $img?: string }>`
  height: 150px;
  background: ${(p) =>
    p.$img ? `url(${p.$img}) center/cover` : `linear-gradient(135deg, ${tk.amber}, ${tk.amberMid})`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tk.white};
`

const Body = styled.div`
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
`

const Title = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
`

const Meta = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  color: ${tk.muted};
  font-size: 0.82rem;
  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
`

export default function GiveawayCard({
  giveaway,
  onEnter,
  entering,
}: {
  giveaway: BusinessGiveaway
  onEnter?: (id: string) => void
  entering?: boolean
}) {
  const open = giveaway.status === 'active' && new Date(giveaway.ends_at) > new Date()

  return (
    <Wrap>
      <Image $img={giveaway.image_url}>{!giveaway.image_url && <Gift size={48} />}</Image>
      <Body>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <Badge $tone="info">{humanize(giveaway.giveaway_type)}</Badge>
          <Badge $tone={statusTone(giveaway.status)}>{humanize(giveaway.status)}</Badge>
        </div>
        <Title>
          <Link href={`/giveaways/${giveaway.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {giveaway.title}
          </Link>
        </Title>
        {giveaway.business?.business_name && <Muted>by {giveaway.business.business_name}</Muted>}
        <Meta>
          {giveaway.estimated_value_cents > 0 && (
            <span>
              <Trophy size={14} /> {formatCents(giveaway.estimated_value_cents)} value
            </span>
          )}
          <span>
            <Users size={14} /> {giveaway.entries_count} entries
          </span>
          <span>
            <Clock size={14} /> ends {formatDate(giveaway.ends_at)}
          </span>
        </Meta>
        {onEnter && (
          <Button onClick={() => onEnter(giveaway.id)} disabled={!open || entering} style={{ marginTop: 'auto' }}>
            {!open ? 'Closed' : entering ? 'Entering…' : 'Enter giveaway'}
          </Button>
        )}
      </Body>
    </Wrap>
  )
}
