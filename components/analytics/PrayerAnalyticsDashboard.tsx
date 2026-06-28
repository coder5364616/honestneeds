'use client'

import React from 'react'
import styled from 'styled-components'
import { usePrayerMetrics, useCampaignPrayerAnalytics } from '@/api/hooks/usePrayers'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PrayerTrendChart } from '@/components/analytics/PrayerTrendChart'
import { COLORS, SPACING, TYPOGRAPHY } from '@/styles/tokens'

// ─── Accent tokens (mirrors /dashboard & the analytics page shell) ───────────
const tk = {
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
  green: '#1A7A4A',
  greenLight: '#E8F5EE',
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[6]};
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${SPACING[8]} 0;
`

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: ${SPACING[8]} 0;

  p {
    color: ${COLORS.MUTED_TEXT};
    font-size: ${TYPOGRAPHY.SIZE_SM};
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[1]};
`

const Title = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${COLORS.TEXT};
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
`

const TitleIcon = styled.span`
  font-size: 1.875rem;
`

const Subtitle = styled.p`
  color: ${COLORS.MUTED_TEXT};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  margin-top: ${SPACING[1]};

  strong {
    color: ${COLORS.TEXT};
  }
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${SPACING[4]};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const MetricCard = styled.div`
  background: ${COLORS.SURFACE};
  border-radius: 0.5rem;
  padding: ${SPACING[6]};
  border: 1px solid ${COLORS.BORDER};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const MetricContent = styled.div`
  flex: 1;
`

const MetricLabel = styled.p`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: 500;
  color: ${COLORS.MUTED_TEXT};
`

const MetricValue = styled.p`
  font-size: 1.875rem;
  font-weight: 700;
  color: ${COLORS.TEXT};
  margin-top: ${SPACING[2]};
`

const MetricHint = styled.p`
  font-size: 0.75rem;
  color: ${COLORS.MUTED_TEXT};
  margin-top: ${SPACING[1]};
`

const MetricIcon = styled.span`
  font-size: 2rem;
`

const ProgressSection = styled.div`
  background: ${COLORS.SURFACE};
  border-radius: 0.5rem;
  padding: ${SPACING[6]};
  border: 1px solid ${COLORS.BORDER};
`

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${SPACING[3]};
`

const ProgressTitle = styled.h3`
  font-weight: 600;
  color: ${COLORS.TEXT};
  font-size: ${TYPOGRAPHY.SIZE_LG};
`

const ProgressPercent = styled.span`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: 700;
  color: ${tk.blue};
`

const ProgressTrack = styled.div`
  width: 100%;
  background: ${COLORS.BG};
  border-radius: 9999px;
  height: 0.75rem;
  overflow: hidden;
`

const ProgressFill = styled.div<{ width: number; isGoalReached: boolean }>`
  height: 100%;
  background: ${tk.blue};
  transition: width 500ms ease-in-out;
  width: ${(props) => props.width}%;
  animation: ${(props) => (props.isGoalReached ? 'pulse 2s infinite' : 'none')};

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
`

const ProgressStats = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.MUTED_TEXT};
  margin-top: ${SPACING[3]};
`

const GoalMessage = styled.div`
  margin-top: ${SPACING[3]};
  padding: ${SPACING[2]};
  background: ${tk.greenLight};
  border-radius: 0.25rem;
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${tk.green};
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
`

const BreakdownSection = styled.div`
  background: ${COLORS.SURFACE};
  border-radius: 0.5rem;
  padding: ${SPACING[6]};
  border: 1px solid ${COLORS.BORDER};
`

const BreakdownTitle = styled.h3`
  font-weight: 600;
  color: ${COLORS.TEXT};
  font-size: ${TYPOGRAPHY.SIZE_LG};
  margin-bottom: ${SPACING[4]};
`

const BreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${SPACING[3]};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const BreakdownCard = styled.div`
  text-align: center;
  padding: ${SPACING[3]};
  background: ${COLORS.BG};
  border-radius: 0.5rem;
`

const BreakdownEmoji = styled.div`
  font-size: 1.5rem;
  margin-bottom: ${SPACING[2]};
`

const BreakdownNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${COLORS.TEXT};
`

const BreakdownLabel = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.MUTED_TEXT};
  margin-top: ${SPACING[1]};
`

const BreakdownPercentage = styled.div`
  font-size: 0.75rem;
  color: ${tk.blue};
  font-weight: 600;
  margin-top: ${SPACING[1]};
`

const InfoBox = styled.div`
  background: ${tk.blueLight};
  border: 1px solid ${tk.blue}33;
  border-radius: 0.5rem;
  padding: ${SPACING[4]};

  p {
    font-size: ${TYPOGRAPHY.SIZE_SM};
    color: ${tk.blue};
  }

  strong {
    font-weight: 600;
  }
`

interface PrayerAnalyticsDashboardProps {
  campaignId: string
  campaignTitle?: string
}

/**
 * PrayerAnalyticsDashboard Component
 * Shows prayer metrics, trends, and analytics for creators
 */
const PrayerAnalyticsDashboard: React.FC<PrayerAnalyticsDashboardProps> = ({
  campaignId,
  campaignTitle,
}) => {
  const { data: metrics, isLoading: metricsLoading } = usePrayerMetrics(campaignId)
  const { data: analytics, isLoading: analyticsLoading } = useCampaignPrayerAnalytics(
    campaignId
  )

  const isLoading = metricsLoading || analyticsLoading

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner size="lg" />
      </LoadingContainer>
    )
  }

  if (!metrics) {
    return (
      <EmptyStateContainer>
        <p>No prayer data available yet.</p>
      </EmptyStateContainer>
    )
  }

  // Calculate statistics
  const totalPrayers = metrics.total_prayers || 0
  const prayersToday = metrics.prayers_today || 0
  const prayerGoal = metrics.prayer_goal || 100
  const progressPercent = Math.min((totalPrayers / prayerGoal) * 100, 100)
  const isGoalReached = totalPrayers >= prayerGoal

  const breakdown = metrics.breakdown || {
    tap: 0,
    text: 0,
    voice: 0,
    video: 0,
  }

  const uniqueSupporters = metrics.unique_supporters_prayed?.length || 0

  // Calculate most common prayer type
  const prayerTypes = [
    { type: 'tap', count: breakdown.tap, emoji: '👆' },
    { type: 'text', count: breakdown.text, emoji: '✍️' },
    { type: 'voice', count: breakdown.voice, emoji: '🎙️' },
    { type: 'video', count: breakdown.video, emoji: '🎥' },
  ]
  const mostCommonType = prayerTypes.reduce((prev, current) =>
    prev.count > current.count ? prev : current
  )

  return (
    <Container>
      {/* Page Header */}
      {campaignTitle && (
        <Header>
          <Title>
            <TitleIcon>📊</TitleIcon>
            Prayer Analytics
          </Title>
          <Subtitle>
            Campaign: <strong>{campaignTitle}</strong>
          </Subtitle>
        </Header>
      )}

      {/* Key Metrics Grid */}
      <MetricsGrid>
        {/* Total Prayers */}
        <MetricCard>
          <MetricContent>
            <MetricLabel>Total Prayers</MetricLabel>
            <MetricValue>{totalPrayers}</MetricValue>
            {prayerGoal && <MetricHint>Goal: {prayerGoal}</MetricHint>}
          </MetricContent>
          <MetricIcon>🙏</MetricIcon>
        </MetricCard>

        {/* Prayers Today */}
        <MetricCard>
          <MetricContent>
            <MetricLabel>Today</MetricLabel>
            <MetricValue>{prayersToday}</MetricValue>
            <MetricHint>{prayersToday === 1 ? 'prayer' : 'prayers'}</MetricHint>
          </MetricContent>
          <MetricIcon>⭐</MetricIcon>
        </MetricCard>

        {/* Unique Supporters */}
        <MetricCard>
          <MetricContent>
            <MetricLabel>Unique Supporters</MetricLabel>
            <MetricValue>{uniqueSupporters}</MetricValue>
            <MetricHint>People praying</MetricHint>
          </MetricContent>
          <MetricIcon>👥</MetricIcon>
        </MetricCard>

        {/* Most Common Type */}
        <MetricCard>
          <MetricContent>
            <MetricLabel>Most Common</MetricLabel>
            <MetricValue>{mostCommonType.count}</MetricValue>
            <MetricHint>{mostCommonType.type} prayers</MetricHint>
          </MetricContent>
          <MetricIcon>{mostCommonType.emoji}</MetricIcon>
        </MetricCard>
      </MetricsGrid>

      {/* Progress Bar Section */}
      {prayerGoal && (
        <ProgressSection>
          <ProgressHeader>
            <ProgressTitle>Goal Progress</ProgressTitle>
            <ProgressPercent>{progressPercent.toFixed(0)}%</ProgressPercent>
          </ProgressHeader>

          <ProgressTrack>
            <ProgressFill width={progressPercent} isGoalReached={isGoalReached} />
          </ProgressTrack>

          <ProgressStats>
            <span>{totalPrayers} prayers received</span>
            <span>{prayerGoal} goal</span>
          </ProgressStats>

          {isGoalReached && (
            <GoalMessage>
              <span>✅</span>
              <span>Goal reached! Celebrate your prayer support!</span>
            </GoalMessage>
          )}
        </ProgressSection>
      )}

      {/* Prayer Type Breakdown */}
      <BreakdownSection>
        <BreakdownTitle>Prayer Breakdown by Type</BreakdownTitle>

        <BreakdownGrid>
          {/* Tap Prayers */}
          <BreakdownCard>
            <BreakdownEmoji>👆</BreakdownEmoji>
            <BreakdownNumber>{breakdown.tap}</BreakdownNumber>
            <BreakdownLabel>Tap Prayers</BreakdownLabel>
            {totalPrayers > 0 && (
              <BreakdownPercentage>
                {((breakdown.tap / totalPrayers) * 100).toFixed(0)}%
              </BreakdownPercentage>
            )}
          </BreakdownCard>

          {/* Text Prayers */}
          <BreakdownCard>
            <BreakdownEmoji>✍️</BreakdownEmoji>
            <BreakdownNumber>{breakdown.text}</BreakdownNumber>
            <BreakdownLabel>Text Prayers</BreakdownLabel>
            {totalPrayers > 0 && (
              <BreakdownPercentage>
                {((breakdown.text / totalPrayers) * 100).toFixed(0)}%
              </BreakdownPercentage>
            )}
          </BreakdownCard>

          {/* Voice Prayers */}
          <BreakdownCard>
            <BreakdownEmoji>🎙️</BreakdownEmoji>
            <BreakdownNumber>{breakdown.voice}</BreakdownNumber>
            <BreakdownLabel>Voice Prayers</BreakdownLabel>
            {totalPrayers > 0 && (
              <BreakdownPercentage>
                {((breakdown.voice / totalPrayers) * 100).toFixed(0)}%
              </BreakdownPercentage>
            )}
          </BreakdownCard>

          {/* Video Prayers */}
          <BreakdownCard>
            <BreakdownEmoji>🎥</BreakdownEmoji>
            <BreakdownNumber>{breakdown.video}</BreakdownNumber>
            <BreakdownLabel>Video Prayers</BreakdownLabel>
            {totalPrayers > 0 && (
              <BreakdownPercentage>
                {((breakdown.video / totalPrayers) * 100).toFixed(0)}%
              </BreakdownPercentage>
            )}
          </BreakdownCard>
        </BreakdownGrid>
      </BreakdownSection>

      {/* Trend Chart */}
      {analytics && (
        <PrayerTrendChart
          campaignId={campaignId}
          analytics={analytics}
        />
      )}

      {/* Info Box */}
      <InfoBox>
        <p>
          <strong>💡 Tip:</strong> Prayer support builds community engagement and emotional
          connection. Share your campaign with supporters who believe in your mission!
        </p>
      </InfoBox>
    </Container>
  )
}

export { PrayerAnalyticsDashboard }
