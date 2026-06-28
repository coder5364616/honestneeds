'use client'

import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Card } from '@/components/Card'
import { currencyUtils } from '@/utils/validationSchemas'

interface ChannelConversion {
  total_clicks?: number
  total_conversions?: number
  total_value?: number
  share_count?: number
}

interface ConversionData {
  total_shares?: number
  total_clicks?: number
  total_conversions?: number
  by_channel?: Record<string, ChannelConversion>
}

interface ShareAnalyticsProps {
  analytics?: {
    totalShares?: number
    sharesByChannel?: Record<string, number>
    [key: string]: any
  }
  campaign?: {
    share_config?: {
      total_budget?: number
      current_budget_remaining?: number
      amount_per_share?: number
      is_paid_sharing_active?: boolean
      share_channels?: string[]
    }
    [key: string]: any
  }
  // Real per-share conversion counts from GET /campaigns/:id/analytics/conversions —
  // used instead of raw share count so "earned" reflects converting shares only.
  conversionData?: ConversionData
}

// ─── Design tokens (mirrors /dashboard & the analytics page shell) ───────────
const tk = {
  ink: '#18171A',
  canvas: '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  body: '#4A4750',
  heading: '#18171A',
  amber: '#D4870A',
  amberLight: '#FBF3E0',
  green: '#1A7A4A',
  greenLight: '#E8F5EE',
  red: '#C0392B',
  redLight: '#FBE9E7',
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
}

const Container = styled.div`
  display: grid;
  gap: 24px;
  font-family: 'DM Sans', sans-serif;
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`

const MetricCard = styled(Card)`
  padding: 20px;
  border: 1.5px solid ${tk.border};
  border-radius: 14px;
  transition: all 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }
`

const MetricLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${tk.muted};
  margin: 0 0 8px 0;
`

const MetricValue = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${tk.heading};
  margin: 0;
  line-height: 1;
`

const MetricSubtext = styled.div`
  margin-top: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
`

const ChannelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`

const ChannelCard = styled(Card)`
  padding: 16px;
  border: 1.5px solid ${tk.border};
  border-radius: 14px;
  text-align: center;
  transition: all 180ms;

  &:hover {
    border-color: ${tk.blue};
    background: ${tk.canvas};
  }
`

const ChannelEmoji = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`

const ChannelName = styled.p`
  font-size: 0.75rem;
  font-weight: 500;
  color: ${tk.muted};
  text-transform: uppercase;
  margin: 0 0 8px 0;
  letter-spacing: 0.5px;
`

const ChannelCount = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0;
`

const SectionTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 16px 0;
`

const EmptyState = styled.div`
  padding: 32px 24px;
  text-align: center;
  background: ${tk.canvas};
  border: 1px dashed ${tk.border};
  border-radius: 12px;
`

const EmptyStateText = styled.p`
  color: ${tk.muted};
  margin: 0;
  font-size: 0.875rem;
`

const RewardBadge = styled.span`
  display: inline-block;
  background: ${tk.blueLight};
  color: ${tk.blue};
  padding: 4px 8px;
  border-radius: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 4px;
`

const CHANNEL_EMOJIS: Record<string, string> = {
  facebook: '👍',
  twitter: '𝕏',
  linkedin: '💼',
  email: '📧',
  whatsapp: '💬',
  telegram: '📱',
  instagram: '📷',
  reddit: '🔴',
  tiktok: '🎵',
  sms: '💭',
  link: '🔗',
  other: '🌐',
}

/**
 * ShareAnalyticsDashboard Component
 * Displays detailed share analytics including platform breakdown,
 * rewards earned, and performance metrics
 */
export const ShareAnalyticsDashboard: React.FC<ShareAnalyticsProps> = ({
  analytics,
  campaign,
  conversionData,
}) => {
  const totalShares = analytics?.totalShares || 0
  const sharesByChannel = analytics?.sharesByChannel || {}
  const shareConfig = campaign?.share_config
  // SF-1: non-dollar reach meter (unit = shares), if the campaign set one.
  const reachGoal = (campaign as any)?.reach_goal as
    | { target_shares: number; current_shares: number; unit: string }
    | null
    | undefined
  const reachPct =
    reachGoal && reachGoal.target_shares > 0
      ? Math.min(100, (reachGoal.current_shares / reachGoal.target_shares) * 100)
      : 0

  // Rewards are paid per CONVERTING share, not per share created — use the
  // real conversion count from GET /campaigns/:id/analytics/conversions
  // rather than raw share count (fixes "earned" showing as if every share converted).
  const convertingShares = conversionData?.total_conversions ?? 0
  const rewardPerShare = shareConfig?.amount_per_share ? shareConfig.amount_per_share / 100 : 0
  const totalRewardsEarned = convertingShares * rewardPerShare
  const isPaidSharing = shareConfig?.is_paid_sharing_active || false

  // Calculate budget info
  const totalBudget = shareConfig?.total_budget ? shareConfig.total_budget / 100 : 0
  const budgetRemaining = shareConfig?.current_budget_remaining ? shareConfig.current_budget_remaining / 100 : totalBudget - totalRewardsEarned

  // Get enabled channels from config
  const enabledChannels = shareConfig?.share_channels || []

  // Format channels for display — reward per channel is driven by that
  // channel's real conversions, not its raw share count.
  const byChannelConversions = conversionData?.by_channel || {}
  const channelsWithData = useMemo(() => {
    const allChannels = enabledChannels.length > 0 ? enabledChannels : Object.keys(sharesByChannel)

    return allChannels.map((channel) => ({
      name: channel,
      emoji: CHANNEL_EMOJIS[channel] || '🌐',
      count: sharesByChannel[channel] || 0,
      reward: (byChannelConversions[channel]?.total_conversions || 0) * rewardPerShare,
    }))
  }, [enabledChannels, sharesByChannel, byChannelConversions, rewardPerShare])

  // Count active channels (channels with shares)
  const activeChannels = Object.keys(sharesByChannel).length

  return (
    <Container>
      {/* Share Metrics */}
      <div>
        <SectionTitle>🎯 Share Performance Summary</SectionTitle>
        <MetricsGrid>
          <MetricCard>
            <MetricLabel>📢 Total Shares</MetricLabel>
            <MetricValue>{totalShares}</MetricValue>
            <MetricSubtext>
              {activeChannels > 0 ? `From ${activeChannels} platform${activeChannels !== 1 ? 's' : ''}` : 'No shares yet'}
            </MetricSubtext>
          </MetricCard>

          {reachGoal && reachGoal.target_shares > 0 && (
            <MetricCard>
              <MetricLabel>🎯 Reach Goal</MetricLabel>
              <MetricValue>{reachPct.toFixed(0)}%</MetricValue>
              <MetricSubtext>
                {(reachGoal.current_shares || 0).toLocaleString()} of{' '}
                {reachGoal.target_shares.toLocaleString()} shares
              </MetricSubtext>
            </MetricCard>
          )}

          {isPaidSharing && (
            <MetricCard>
              <MetricLabel>💰 Total Rewards Earned</MetricLabel>
              <MetricValue>{currencyUtils.formatCurrency(totalRewardsEarned * 100)}</MetricValue>
              <MetricSubtext>
                {rewardPerShare > 0 ? `$${rewardPerShare.toFixed(2)} per converting share` : 'N/A'}
              </MetricSubtext>
            </MetricCard>
          )}

          {isPaidSharing && totalBudget > 0 && (
            <MetricCard>
              <MetricLabel>💵 Budget Status</MetricLabel>
              <MetricValue>{totalBudget > 0 ? ((totalRewardsEarned / totalBudget) * 100).toFixed(2) : '0'}%</MetricValue>
              <MetricSubtext>
                {currencyUtils.formatCurrency(totalRewardsEarned * 100)} of{' '}
                {currencyUtils.formatCurrency(totalBudget * 100)}
              </MetricSubtext>
            </MetricCard>
          )}

          <MetricCard>
            <MetricLabel>📊 Average Shares/Day</MetricLabel>
            <MetricValue>{totalShares > 0 ? (totalShares / 7).toFixed(1) : '0'}</MetricValue>
            <MetricSubtext>Last 7 days (estimated)</MetricSubtext>
          </MetricCard>
        </MetricsGrid>
      </div>

      {/* Shares by Channel */}
      {totalShares > 0 ? (
        <div>
          <SectionTitle>📱 Shares by Platform</SectionTitle>
          <ChannelGrid>
            {channelsWithData.map((channel) => (
              <ChannelCard key={channel.name}>
                <ChannelEmoji>{channel.emoji}</ChannelEmoji>
                <ChannelName>{channel.name}</ChannelName>
                <ChannelCount>{channel.count}</ChannelCount>
                {isPaidSharing && channel.reward > 0 && (
                  <RewardBadge>
                    +{currencyUtils.formatCurrency(channel.reward * 100)}
                  </RewardBadge>
                )}
              </ChannelCard>
            ))}
          </ChannelGrid>
        </div>
      ) : (
        <div>
          <SectionTitle>📱 Shares by Platform</SectionTitle>
          <EmptyState>
            <EmptyStateText>
              No shares yet. Start sharing your campaign to see performance data!
            </EmptyStateText>
          </EmptyState>
        </div>
      )}

      {/* Paid Sharing Info */}
      {isPaidSharing && (
        <div>
          <SectionTitle>💡 Get Paid to Share</SectionTitle>
          <MetricsGrid>
            <MetricCard style={{ background: tk.greenLight, borderColor: tk.green }}>
              <MetricLabel>Reward per Share</MetricLabel>
              <MetricValue>${rewardPerShare.toFixed(2)}</MetricValue>
              <MetricSubtext>Split with each supporter who shares</MetricSubtext>
            </MetricCard>

            <MetricCard style={{ background: tk.amberLight, borderColor: tk.amber }}>
              <MetricLabel>Remaining Budget</MetricLabel>
              <MetricValue>{currencyUtils.formatCurrency(budgetRemaining * 100)}</MetricValue>
              <MetricSubtext>
                Can reward ~{Math.floor(budgetRemaining / rewardPerShare)} more share
                {Math.floor(budgetRemaining / rewardPerShare) !== 1 ? 's' : ''}
              </MetricSubtext>
            </MetricCard>
          </MetricsGrid>
        </div>
      )}

      {/* Help Text */}
      {totalShares === 0 && (
        <div>
          <SectionTitle>📖 How Share Analytics Work</SectionTitle>
          <Card style={{ padding: '16px', background: tk.blueLight, borderColor: tk.blue, border: '1px solid' }}>
            <p style={{ margin: 0, color: tk.blue, fontSize: '14px', lineHeight: '1.6' }}>
              Share analytics track how many times your campaign is shared on different social platforms. 
              {isPaidSharing && ' Supporters earn rewards for sharing your campaign.'} 
              The data updates every 5 minutes.
            </p>
          </Card>
        </div>
      )}
    </Container>
  )
}
