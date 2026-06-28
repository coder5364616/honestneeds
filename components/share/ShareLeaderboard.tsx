'use client'

/**
 * ShareLeaderboard
 * Top sharers ranked by total earnings (RG-01 "Leaderboard tracking").
 * Consumes GET /share/leaderboard via useShareLeaderboard.
 *
 * - Global by default; pass `campaignId` to scope to one campaign.
 * - Highlights the signed-in user's own row.
 * - Near-real-time (refetches every 60s).
 */

import React from 'react'
import styled from 'styled-components'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import { useShareLeaderboard } from '@/api/hooks/useShareLeaderboard'
import { useAuthUserId } from '@/store/authStore'

interface ShareLeaderboardProps {
  campaignId?: string
  limit?: number
  title?: string
}

const Container = styled.div`
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`

const Title = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`

const Subtitle = styled.span`
  font-size: 0.8rem;
  color: #64748b;
`

const Row = styled.div<{ $me?: boolean }>`
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0.75rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$me ? '#c7d2fe' : 'transparent')};
  background-color: ${(p) => (p.$me ? '#eef2ff' : 'transparent')};

  & + & {
    border-top: 1px solid #f1f5f9;
  }
`

const Rank = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: #475569;
`

const NameBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
`

const Avatar = styled.div<{ $src?: string | null }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: #e2e8f0;
  background-size: cover;
  background-position: center;
  ${(p) => (p.$src ? `background-image: url(${p.$src});` : '')}
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #64748b;
  font-size: 0.85rem;
`

const NameText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Name = styled.span`
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.span`
  font-size: 0.78rem;
  color: #64748b;
`

const Earnings = styled.div`
  font-weight: 700;
  color: #059669;
  font-size: 1rem;
  text-align: right;
  white-space: nowrap;
`

const Empty = styled.div`
  text-align: center;
  padding: 2.5rem 1rem;
  color: #64748b;
`

const Skeleton = styled.div`
  height: 56px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;

  & + & {
    margin-top: 0.5rem;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`

const formatCurrency = (cents: number) => `$${((cents || 0) / 100).toFixed(2)}`

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={20} color="#eab308" />
  if (rank === 2) return <Medal size={20} color="#94a3b8" />
  if (rank === 3) return <Award size={20} color="#d97706" />
  return <span>{rank}</span>
}

export function ShareLeaderboard({ campaignId, limit = 20, title }: ShareLeaderboardProps) {
  const myUserId = useAuthUserId()
  const { data, isLoading, error } = useShareLeaderboard({ campaignId, limit })

  const entries = data?.entries || []

  return (
    <Container>
      <Header>
        <Title>
          <Trophy size={20} color="#6366f1" />
          {title || (campaignId ? 'Campaign Top Sharers' : 'Top Sharers')}
        </Title>
        {typeof data?.total_participants === 'number' && (
          <Subtitle>{data.total_participants} participants</Subtitle>
        )}
      </Header>

      {isLoading && (
        <div>
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      )}

      {!isLoading && error && (
        <Empty>Unable to load the leaderboard right now. Please try again later.</Empty>
      )}

      {!isLoading && !error && entries.length === 0 && (
        <Empty>
          <TrendingUp size={40} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
          <div style={{ fontWeight: 600, color: '#0f172a' }}>No sharers yet</div>
          <div style={{ marginTop: '0.25rem' }}>
            Be the first to share a campaign and climb the leaderboard.
          </div>
        </Empty>
      )}

      {!isLoading &&
        !error &&
        entries.map((entry) => {
          const isMe = !!myUserId && String(entry.user_id) === String(myUserId)
          const name = entry.user_name || 'Anonymous'
          const initial = name.charAt(0).toUpperCase()
          return (
            <Row key={`${entry.rank}-${entry.user_id}`} $me={isMe}>
              <Rank>
                <RankBadge rank={entry.rank} />
              </Rank>
              <NameBlock>
                <Avatar $src={entry.user_picture}>{!entry.user_picture && initial}</Avatar>
                <NameText>
                  <Name>
                    {name}
                    {isMe && ' (You)'}
                  </Name>
                  <Meta>
                    {entry.total_shares} shares · {entry.total_conversions} conversions ·{' '}
                    {(entry.conversion_rate ?? 0).toFixed(1)}% rate
                  </Meta>
                </NameText>
              </NameBlock>
              <Earnings>{formatCurrency(entry.total_earnings)}</Earnings>
            </Row>
          )
        })}
    </Container>
  )
}

export default ShareLeaderboard
