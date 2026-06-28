/**
 * Referral Analytics Dashboard
 * Shows creators their referral performance for shares
 */

'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { TrendingUp, Users, Eye, Zap } from 'lucide-react'
import { useCampaignReferralAnalytics } from '@/api/hooks/useReferralUrl'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// ─── Design tokens (mirrors /dashboard & the analytics page shell) ───────────
const tk = {
  canvas: '#F7F5F1',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  heading: '#18171A',
  green: '#1A7A4A',
  red: '#C0392B',
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-family: 'DM Sans', sans-serif;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`

const Title = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`

const TitleIcon = styled.span`
  font-size: 1.75rem;
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`

const MetricCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  background: ${tk.white};
  border: 1.5px solid ${tk.border};
  border-radius: 14px;
  transition: all 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }
`

const MetricLabel = styled.span`
  font-size: 0.75rem;
  color: ${tk.muted};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const MetricValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

const MetricChange = styled.span<{ positive?: boolean }>`
  font-size: 0.8rem;
  color: ${(props) => (props.positive ? tk.green : tk.red)};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`

const MetricIcon = styled.div`
  width: 3rem;
  height: 3rem;
  background: ${tk.blueLight};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tk.blue};
`

const SectionTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 2rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    color: ${tk.blue};
  }
`

const SharesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const ShareItem = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`

const ShareInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const ShareTitle = styled.h4`
  font-weight: 600;
  color: #111827;
  margin: 0;
  font-size: 0.9375rem;
`

const ShareDate = styled.span`
  font-size: 0.8125rem;
  color: #9ca3af;
`

const ShareStats = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  text-align: center;
`

const StatValue = styled.span`
  font-weight: 700;
  color: #111827;
  font-size: 1.125rem;
`

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
`

const PlatformBadge = styled.span<{ platform: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: ${(props) => {
    const colors: Record<string, string> = {
      twitter: '#f3f4f6',
      facebook: '#eff6ff',
      linkedin: '#f0fdf4',
      telegram: '#fef3c7',
      email: '#fee2e2',
    }
    return colors[props.platform] || '#f3f4f6'
  }};
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #111827;
  text-transform: capitalize;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
`

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

interface ReferralAnalyticsDashboardProps {
  campaignId: string
}

/**
 * Referral Analytics Dashboard Component
 * Shows detailed referral performance for a campaign
 */
export const ReferralAnalyticsDashboard: React.FC<ReferralAnalyticsDashboardProps> = ({
  campaignId,
}) => {
  const { data, isLoading, error } = useCampaignReferralAnalytics(campaignId)

  if (isLoading) {
    return (
      <LoadingState>
        <LoadingSpinner />
      </LoadingState>
    )
  }

  if (error || !data?.data) {
    return (
      <EmptyState>
        <p>No referral data available yet</p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          Share your campaign to start tracking referrals
        </p>
      </EmptyState>
    )
  }

  const analytics = data.data
  const totalReward = analytics.total_shares * (analytics.reward_per_share || 0)
  const conversionRate = analytics.total_shares > 0
    ? ((analytics.total_conversions / analytics.total_shares) * 100).toFixed(1)
    : 0

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>
          <TitleIcon>📊</TitleIcon>
          Referral Performance
        </Title>
      </Header>

      {/* Key Metrics */}
      <MetricsGrid>
        <MetricCard>
          <MetricIcon>
            <Eye size={24} />
          </MetricIcon>
          <MetricLabel>Total Shares</MetricLabel>
          <MetricValue>{analytics.total_shares}</MetricValue>
          <MetricChange positive>↑ Active sharing</MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <Users size={24} />
          </MetricIcon>
          <MetricLabel>Total Clicks</MetricLabel>
          <MetricValue>{analytics.total_clicks || 0}</MetricValue>
          <MetricChange positive={analytics.total_clicks > 0}>
            {analytics.total_clicks > 0 ? '↑ People visiting' : 'No clicks yet'}
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <Zap size={24} />
          </MetricIcon>
          <MetricLabel>Conversions</MetricLabel>
          <MetricValue>{analytics.total_conversions || 0}</MetricValue>
          <MetricChange positive={analytics.total_conversions > 0}>
            {conversionRate}% conversion
          </MetricChange>
        </MetricCard>

        <MetricCard>
          <MetricIcon>
            <TrendingUp size={24} />
          </MetricIcon>
          <MetricLabel>Total Earned</MetricLabel>
          <MetricValue>${(totalReward / 100).toFixed(2)}</MetricValue>
          <MetricChange positive={totalReward > 0}>
            Pending verification
          </MetricChange>
        </MetricCard>
      </MetricsGrid>

      {/* Platform Breakdown */}
      {analytics.platform_breakdown && Object.keys(analytics.platform_breakdown).length > 0 && (
        <>
          <SectionTitle>
            <TrendingUp size={20} />
            Performance by Platform
          </SectionTitle>
          <MetricsGrid>
            {Object.entries(analytics.platform_breakdown).map(([platform, count]) => (
              <MetricCard key={platform}>
                <PlatformBadge platform={platform}>
                  {platform}
                </PlatformBadge>
                <MetricValue style={{ marginTop: '0.5rem' }}>
                  {count as number}
                </MetricValue>
                <MetricLabel>shares</MetricLabel>
              </MetricCard>
            ))}
          </MetricsGrid>
        </>
      )}

      {/* Individual Shares */}
      {analytics.shares && analytics.shares.length > 0 && (
        <>
          <SectionTitle>
            Individual Shares
          </SectionTitle>
          <SharesList>
            {analytics.shares.map((share: any) => (
              <ShareItem key={share.share_id}>
                <ShareInfo>
                  <ShareTitle>{share.share_id}</ShareTitle>
                  <ShareDate>
                    {new Date(share.created_at).toLocaleDateString()}
                  </ShareDate>
                </ShareInfo>

                <PlatformBadge platform={share.channel}>
                  {share.channel}
                </PlatformBadge>

                <ShareStats>
                  <Stat>
                    <StatValue>{share.clicks || 0}</StatValue>
                    <StatLabel>Clicks</StatLabel>
                  </Stat>
                  <Stat>
                    <StatValue>{share.conversions || 0}</StatValue>
                    <StatLabel>Conversions</StatLabel>
                  </Stat>
                </ShareStats>

                <Stat>
                  <StatValue style={{ color: '#667eea' }}>
                    ${((share.conversions || 0) * (analytics.reward_per_share || 0) / 100).toFixed(2)}
                  </StatValue>
                  <StatLabel>Earned</StatLabel>
                </Stat>
              </ShareItem>
            ))}
          </SharesList>
        </>
      )}

      {(!analytics.shares || analytics.shares.length === 0) && analytics.total_shares === 0 && (
        <EmptyState>
          <p>No shares recorded yet</p>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Start sharing your campaign to see referral analytics here
          </p>
        </EmptyState>
      )}
    </Container>
  )
}

export default ReferralAnalyticsDashboard
