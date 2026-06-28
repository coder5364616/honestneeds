'use client'

import React, { useMemo } from 'react'
import styled from 'styled-components'
import { COLORS, SPACING, TYPOGRAPHY } from '@/styles/tokens'

// Styled Components
const ChartContainer = styled.div`
  background: ${COLORS.SURFACE};
  border-radius: 0.5rem;
  padding: ${SPACING[6]};
  border: 1px solid ${COLORS.BORDER};
`

const ChartHeader = styled.div`
  margin-bottom: ${SPACING[6]};
`

const ChartTitle = styled.h3`
  font-weight: 600;
  color: ${COLORS.TEXT};
  font-size: ${TYPOGRAPHY.SIZE_LG};
  margin-bottom: ${SPACING[2]};
`

const StatsGrid = styled.div`
  display: flex;
  gap: ${SPACING[6]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
`

const StatLabel = styled.p`
  color: ${COLORS.MUTED_TEXT};
  margin-bottom: ${SPACING[1]};
`

const StatValue = styled.p`
  font-size: 1.5rem;
  font-weight: 700;
  color: #9333ea;
`

const ChartSpace = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[4]};
`

const ChartSvg = styled.svg`
  width: 100%;
  height: 16rem;
  max-height: 300px;
`

const LegendContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${SPACING[4]};
  padding-top: ${SPACING[4]};
  border-top: 1px solid ${COLORS.BORDER};
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING[2]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.MUTED_TEXT};
`

const LegendColor = styled.div`
  width: 1rem;
  height: 1rem;
  background: #9333ea;
  border-radius: 0.25rem;
`

const DailyBreakdownContainer = styled.div`
  margin-top: ${SPACING[6]};
  padding-top: ${SPACING[6]};
  border-top: 1px solid ${COLORS.BORDER};
`

const BreakdownTitle = styled.h4`
  font-weight: 500;
  color: ${COLORS.TEXT};
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  margin-bottom: ${SPACING[3]};
`

const DailyBreakdownGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: ${SPACING[2]};

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const DailyCard = styled.div`
  text-align: center;
  padding: ${SPACING[2]};
  background: ${COLORS.BG};
  border-radius: 0.25rem;
`

const DailyDate = styled.p`
  font-size: 0.75rem;
  color: ${COLORS.MUTED_TEXT};
`

const DailyCount = styled.p`
  font-size: 1.125rem;
  font-weight: 700;
  color: #9333ea;
`

const InsightBox = styled.div`
  margin-top: ${SPACING[6]};
  padding: ${SPACING[4]};
  background: #eff6ff;
  border-radius: 0.5rem;
  border: 1px solid #bfdbfe;

  p {
    font-size: ${TYPOGRAPHY.SIZE_SM};
    color: #1e40af;
  }

  strong {
    font-weight: 600;
  }
`

const EmptyStateContainer = styled.div`
  text-align: center;
  padding: ${SPACING[8]} 0;

  p {
    color: ${COLORS.MUTED_TEXT};
    font-size: ${TYPOGRAPHY.SIZE_SM};
  }
`

interface DailyPrayerData {
  date: string
  count: number
}

interface PrayerTrendChartProps {
  campaignId: string
  analytics?: {
    daily_trends?: DailyPrayerData[]
    [key: string]: unknown
  }
}

/**
 * PrayerTrendChart Component
 * Displays prayer trends over time using a simple bar chart
 * No external charting library required (uses SVG)
 */
const PrayerTrendChart: React.FC<PrayerTrendChartProps> = ({
  analytics,
}) => {
  // SF-4: NEVER fabricate analytics. Real campaigns must show real data — a
  // synthetic random trend (the old "demo" mock) made a brand-new campaign with
  // 0 prayers report 132 prayers / 9.4-a-day, which is misleading. When there is
  // no real `daily_trends`, fall through to the empty state below.
  const dailyData = useMemo(() => {
    if (analytics?.daily_trends && analytics.daily_trends.length > 0) {
      return analytics.daily_trends.slice(-14) // Last 14 days
    }
    return [] as DailyPrayerData[]
  }, [analytics])

  const maxCount = useMemo(() => {
    return Math.max(...dailyData.map((d) => d.count), 10)
  }, [dailyData])

  const totalCount = useMemo(
    () => dailyData.reduce((sum, d) => sum + d.count, 0),
    [dailyData]
  )

  const averageCount = useMemo(
    () => (totalCount / dailyData.length).toFixed(1),
    [totalCount, dailyData]
  )

  if (!dailyData || dailyData.length === 0) {
    return (
      <EmptyStateContainer>
        <p>No trend data available yet. Come back after prayers are submitted!</p>
      </EmptyStateContainer>
    )
  }

  return (
    <ChartContainer>
      {/* Header */}
      <ChartHeader>
        <ChartTitle>Prayer Trend (Last 14 Days)</ChartTitle>
        <StatsGrid>
          <StatItem>
            <StatLabel>Total</StatLabel>
            <StatValue>{totalCount}</StatValue>
          </StatItem>
          <StatItem>
            <StatLabel>Average/Day</StatLabel>
            <StatValue>{averageCount}</StatValue>
          </StatItem>
        </StatsGrid>
      </ChartHeader>

      {/* Chart */}
      <ChartSpace>
        {/* SVG Bar Chart */}
        <ChartSvg viewBox={`0 0 ${dailyData.length * 45} 250`}>
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <g key={`label-${ratio}`}>
              <line
                x1="0"
                y1={200 - ratio * 200}
                x2={dailyData.length * 45}
                y2={200 - ratio * 200}
                stroke="#e5e7eb"
                strokeDasharray="2,2"
                vectorEffect="non-scaling-stroke"
              />
              <text
                x="-5"
                y={205 - ratio * 200}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {Math.round(ratio * maxCount)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {dailyData.map((data, idx) => {
            const barHeight = (data.count / maxCount) * 200
            const x = idx * 45 + 25
            const y = 200 - barHeight

            return (
              <g key={`bar-${idx}`}>
                <rect
                  x={x - 15}
                  y={y}
                  width="30"
                  height={barHeight}
                  fill="#a855f7"
                  style={{ cursor: 'pointer' }}
                  rx="4"
                  onMouseEnter={(e) => {
                    e.currentTarget.setAttribute('fill', '#9333ea')
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.setAttribute('fill', '#a855f7')
                  }}
                />
                {/* Hover value display */}
                <title>{`${data.date}: ${data.count} prayers`}</title>
              </g>
            )
          })}

          {/* X-axis labels (dates) */}
          {dailyData.map((data, idx) => {
            const [, month, day] = data.date.split('-')
            const x = idx * 45 + 25

            // Show every 3rd date to avoid crowding
            if (idx % 3 === 0 || idx === dailyData.length - 1) {
              return (
                <text
                  key={`date-${idx}`}
                  x={x}
                  y="220"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {month}/{day}
                </text>
              )
            }
            return null
          })}
        </ChartSvg>

        {/* Legend */}
        <LegendContainer>
          <LegendItem>
            <LegendColor />
            <span>Prayers by Day</span>
          </LegendItem>
        </LegendContainer>
      </ChartSpace>

      {/* Daily Breakdown Table */}
      <DailyBreakdownContainer>
        <BreakdownTitle>Daily Breakdown</BreakdownTitle>

        <DailyBreakdownGrid>
          {dailyData.map((data, idx) => {
            const [, month, day] = data.date.split('-')

            return (
              <DailyCard key={`daily-${idx}`}>
                <DailyDate>
                  {month}/{day}
                </DailyDate>
                <DailyCount>{data.count}</DailyCount>
              </DailyCard>
            )
          })}
        </DailyBreakdownGrid>
      </DailyBreakdownContainer>

      {/* Insights */}
      <InsightBox>
        <p>
          <strong>📈 Insight:</strong> Your campaign is receiving an average of{' '}
          <strong>{averageCount}</strong> prayers per day. Keep sharing to increase engagement!
        </p>
      </InsightBox>
    </ChartContainer>
  )
}

export { PrayerTrendChart }
