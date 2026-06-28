'use client'

import React from 'react'
import styled from 'styled-components'
import { Zap, TrendingUp, Users, MousePointerClick, Repeat2, Share2 } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useCampaignVirality } from '@/api/hooks/useCampaignEngagement'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const ViralBadge = styled.span<{ $viral: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 100px;
  color: ${(p) => (p.$viral ? '#166534' : '#6b7280')};
  background: ${(p) => (p.$viral ? '#f0fdf4' : '#f3f4f6')};
  border: 1px solid ${(p) => (p.$viral ? '#bbf7d0' : '#e5e7eb')};
`

const CoefBlock = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 16px;
  background: linear-gradient(135deg, #faeae1, #fff);
  border: 1px solid #f0c9b5;
  border-radius: 12px;
`

const CoefValue = styled.span`
  font-size: 36px;
  font-weight: 800;
  color: #9e4a1e;
  line-height: 1;
`

const CoefLabel = styled.div`
  font-size: 13px;
  color: #6b7280;
  b { color: #111827; }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (min-width: 520px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const Stat = styled.div`
  background: #f9fafb;
  border: 1px solid #eceae5;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
`

const StatIcon = styled.div`
  display: flex;
  justify-content: center;
  color: #c4622d;
  margin-bottom: 6px;
`

const StatVal = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
`

const StatLabel = styled.div`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: #9ca3af;
  font-weight: 600;
  margin-top: 4px;
`

const Note = styled.p`
  font-size: 12.5px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`

interface ViralityCardProps {
  campaignId: string
}

/**
 * CA-13 — Crowdfunded Virality
 * Creator-facing snapshot of how virally a campaign is spreading.
 */
export const ViralityCard: React.FC<ViralityCardProps> = ({ campaignId }) => {
  const { data, isLoading } = useCampaignVirality(campaignId)

  if (isLoading) return <LoadingSpinner />
  if (!data) return null

  return (
    <Container>
      <Header>
        <Title>
          <Zap size={20} /> Virality
        </Title>
        <ViralBadge $viral={data.is_viral}>
          <TrendingUp size={13} />
          {data.is_viral ? 'Going viral' : 'Building momentum'}
        </ViralBadge>
      </Header>

      <CoefBlock>
        <CoefValue>{data.viral_coefficient.toFixed(2)}</CoefValue>
        <CoefLabel>
          <b>Viral coefficient</b>
          <div>Avg. shares generated per sharer. Above 1.0 means self-sustaining growth.</div>
        </CoefLabel>
      </CoefBlock>

      <Grid>
        <Stat>
          <StatIcon><Share2 size={18} /></StatIcon>
          <StatVal>{data.total_shares.toLocaleString()}</StatVal>
          <StatLabel>Total Shares</StatLabel>
        </Stat>
        <Stat>
          <StatIcon><Users size={18} /></StatIcon>
          <StatVal>{data.unique_sharers.toLocaleString()}</StatVal>
          <StatLabel>Sharers</StatLabel>
        </Stat>
        <Stat>
          <StatIcon><MousePointerClick size={18} /></StatIcon>
          <StatVal>{data.referral_clicks.toLocaleString()}</StatVal>
          <StatLabel>Ref. Clicks</StatLabel>
        </Stat>
        <Stat>
          <StatIcon><Repeat2 size={18} /></StatIcon>
          <StatVal>{data.referral_conversion_rate.toFixed(1)}%</StatVal>
          <StatLabel>Conv. Rate</StatLabel>
        </Stat>
      </Grid>

      <Note>
        {data.referral_conversions.toLocaleString()} conversions from {data.referral_clicks.toLocaleString()} referral
        clicks. Encourage supporters to share to push your coefficient above 1.0.
      </Note>
    </Container>
  )
}

export default ViralityCard
