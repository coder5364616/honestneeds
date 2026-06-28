'use client'

import React from 'react'
import styled from 'styled-components'
import { Heart, Share2, Users } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useDonorFeed } from '@/api/hooks/useCampaignEngagement'
import { DonorFeedItem } from '@/api/services/campaignEngagementService'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Summary = styled.div`
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
`

const Pill = styled.span`
  background: #f3f4f6;
  padding: 3px 10px;
  border-radius: 100px;
  font-weight: 600;
`

const Feed = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Item = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #f3f2ee;
  &:last-child { border-bottom: none; }
`

const Dot = styled.div<{ $type: 'donation' | 'share' }>`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: ${(p) => (p.$type === 'donation' ? 'linear-gradient(135deg,#166534,#16a34a)' : 'linear-gradient(135deg,#1d4ed8,#3b82f6)')};
`

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`

const ItemText = styled.div`
  font-size: 14px;
  color: #374151;
  line-height: 1.4;
  b { color: #111827; font-weight: 700; }
`

const ItemMsg = styled.div`
  font-size: 13px;
  color: #6b7280;
  font-style: italic;
  margin-top: 2px;
  word-break: break-word;
`

const ItemTime = styled.div`
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
`

const EmptyState = styled.div`
  padding: 28px 20px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 12px;
  font-size: 14px;
`

const fmt = (cents?: number) =>
  ((cents || 0) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

const renderLine = (item: DonorFeedItem) => {
  if (item.type === 'donation') {
    return (
      <ItemText>
        <b>{item.actor_name}</b> donated <b>{fmt(item.amount_cents)}</b>
      </ItemText>
    )
  }
  return (
    <ItemText>
      <b>{item.actor_name}</b> shared this campaign
      {item.channel ? ` on ${item.channel}` : ''}
    </ItemText>
  )
}

interface DonorFeedProps {
  campaignId: string
  limit?: number
}

/**
 * CA-18 — Social Proof / Donor Feed
 * A live-feeling activity feed of recent donations and shares.
 */
export const DonorFeed: React.FC<DonorFeedProps> = ({ campaignId, limit = 20 }) => {
  const { data, isLoading } = useDonorFeed(campaignId, limit)
  const feed = data?.feed || []

  return (
    <Container>
      <Header>
        <Title>
          <Users size={20} /> Recent Activity
        </Title>
        {data && (
          <Summary>
            <Pill>{(data.total_donors || 0).toLocaleString()} supporters</Pill>
            {data.total_raised_cents > 0 && <Pill>{fmt(data.total_raised_cents)} raised</Pill>}
          </Summary>
        )}
      </Header>

      {isLoading ? (
        <LoadingSpinner />
      ) : feed.length > 0 ? (
        <Feed>
          {feed.map((item, idx) => (
            <Item key={`${item.type}-${idx}-${item.date}`}>
              <Dot $type={item.type}>
                {item.type === 'donation' ? <Heart size={16} /> : <Share2 size={16} />}
              </Dot>
              <ItemBody>
                {renderLine(item)}
                {item.message && <ItemMsg>“{item.message}”</ItemMsg>}
                <ItemTime>{timeAgo(item.date)}</ItemTime>
              </ItemBody>
            </Item>
          ))}
        </Feed>
      ) : (
        <EmptyState>No activity yet — be the first to support this campaign!</EmptyState>
      )}
    </Container>
  )
}

export default DonorFeed
