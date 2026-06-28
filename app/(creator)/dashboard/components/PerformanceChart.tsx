'use client'

import React, { useEffect, useState, useCallback } from 'react'
import styled, { keyframes, css } from 'styled-components'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Target,
  Zap,
  BarChart2,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DataPoint {
  date: string
  revenue: number
  donorCount: number
  shared?: number
}

interface PerformanceChartProps {
  campaignId?: string
  data: DataPoint[]
  goal?: number
  chartType?: 'line' | 'area'
  onExport?: () => void
}

// ─── Design Tokens ────────────────────────────────────────────────────────────

const tokens = {
  brand: '#667eea',
  brandDark: '#4f5fc4',
  brandLight: 'rgba(102,126,234,0.1)',
  brandGlow: 'rgba(102,126,234,0.18)',
  green: '#10b981',
  greenLight: 'rgba(16,185,129,0.1)',
  red: '#ef4444',
  redLight: 'rgba(239,68,68,0.1)',
  amber: '#f59e0b',
  bg: '#ffffff',
  surface: '#f8f9fc',
  surfaceHover: '#f1f3f9',
  border: '#e8eaf0',
  borderLight: '#f0f2f8',
  text: '#0d1117',
  textSecondary: '#5a6270',
  textTertiary: '#9ca3af',
  radius: '16px',
  radiusSm: '10px',
  radiusXs: '7px',
  shadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)',
  shadowHover: '0 4px 24px rgba(102,126,234,0.12)',
}

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
`

// ─── Root ─────────────────────────────────────────────────────────────────────

const Root = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${fadeUp} 0.4s ease both;
  font-family: 'DM Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
`

// ─── Section Header ──────────────────────────────────────────────────────────

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const SectionTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const SectionLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${tokens.brand};
`

const SectionTitle = styled.h2`
  font-size: clamp(1.1rem, 3vw, 1.35rem);
  font-weight: 700;
  color: ${tokens.text};
  margin: 0;
  letter-spacing: -0.025em;
  line-height: 1.2;
`

const ViewReportLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 500;
  color: ${tokens.brand};
  text-decoration: none;
  padding: 6px 12px;
  border-radius: ${tokens.radiusXs};
  border: 1px solid ${tokens.brandLight};
  background: ${tokens.brandLight};
  transition: all 150ms ease;
  white-space: nowrap;

  &:hover {
    background: rgba(102, 126, 234, 0.16);
    border-color: rgba(102, 126, 234, 0.3);
  }

  svg { flex-shrink: 0; }
`

// ─── KPI Grid ─────────────────────────────────────────────────────────────────

const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (min-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 900px) {
    grid-template-columns: repeat(6, 1fr);
  }
`

const KpiCard = styled.div<{ $accent?: string; $delay?: number }>`
  background: ${tokens.bg};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  padding: 16px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 200ms ease;
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${({ $delay = 0 }) => $delay}ms;
  cursor: default;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${({ $accent }) => $accent || tokens.brand};
    opacity: 0;
    transition: opacity 200ms ease;
    border-radius: ${tokens.radius} ${tokens.radius} 0 0;
  }

  &:hover {
    border-color: ${({ $accent }) => $accent || tokens.brand}33;
    box-shadow: ${tokens.shadowHover};
    transform: translateY(-1px);

    &::before { opacity: 1; }
  }

  @media (min-width: 900px) {
    padding: 18px 16px 16px;
  }
`

const KpiTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const KpiIconBox = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: ${({ $color }) => $color}18;
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const KpiBadge = styled.span<{ $trend: 'up' | 'down' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 10.5px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 99px;
  color: ${({ $trend }) =>
    $trend === 'up' ? tokens.green : $trend === 'down' ? tokens.red : tokens.textTertiary};
  background: ${({ $trend }) =>
    $trend === 'up' ? tokens.greenLight : $trend === 'down' ? tokens.redLight : '#f5f5f5'};
`

const KpiValue = styled.p`
  font-size: clamp(1.15rem, 3vw, 1.5rem);
  font-weight: 800;
  color: ${tokens.text};
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1;
`

const KpiLabel = styled.p`
  font-size: 11px;
  font-weight: 500;
  color: ${tokens.textSecondary};
  margin: 0;
  line-height: 1.3;
`

// ─── Chart Card ──────────────────────────────────────────────────────────────

const ChartCard = styled.div`
  background: ${tokens.bg};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radius};
  padding: 20px;
  box-shadow: ${tokens.shadow};
  animation: ${fadeUp} 0.4s 0.1s ease both;

  @media (min-width: 640px) {
    padding: 24px;
  }
`

const ChartCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`

const ChartTitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const ChartTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${tokens.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  letter-spacing: -0.02em;
`

const ChartSubtitle = styled.p`
  font-size: 12px;
  color: ${tokens.textTertiary};
  margin: 0;
`

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const SegmentedControl = styled.div`
  display: flex;
  background: ${tokens.surface};
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusXs};
  padding: 3px;
  gap: 2px;
`

const SegmentBtn = styled.button<{ $active: boolean }>`
  padding: 5px 10px;
  border-radius: 5px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  background: ${({ $active }) => ($active ? tokens.bg : 'transparent')};
  color: ${({ $active }) => ($active ? tokens.text : tokens.textSecondary)};
  box-shadow: ${({ $active }) => ($active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none')};

  &:hover {
    color: ${tokens.text};
  }
`

const ExportBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: ${tokens.radiusXs};
  border: 1px solid ${tokens.border};
  background: ${tokens.bg};
  color: ${tokens.textSecondary};
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;

  &:hover {
    background: ${tokens.surface};
    color: ${tokens.text};
    border-color: #d1d5db;
  }

  &:active { transform: scale(0.98); }
`

// ─── Legend Dots ─────────────────────────────────────────────────────────────

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`

const LegendItem = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? tokens.text : tokens.textTertiary)};
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 150ms ease;
  opacity: ${({ $active }) => ($active ? 1 : 0.45)};

  &:hover { background: ${tokens.surface}; opacity: 1; color: ${tokens.text}; }
`

const LegendDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

// ─── Goal Progress ────────────────────────────────────────────────────────────

const GoalBar = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid ${tokens.borderLight};
`

const GoalBarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const GoalBarLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${tokens.textSecondary};
  display: flex;
  align-items: center;
  gap: 5px;
`

const GoalBarPct = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${tokens.text};
`

const GoalTrack = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 99px;
  background: ${tokens.surface};
  overflow: hidden;
`

const GoalFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.min($pct, 100)}%;
  border-radius: 99px;
  background: linear-gradient(90deg, ${tokens.brand}, ${tokens.brandDark});
  transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 60%, rgba(255,255,255,0.3));
    border-radius: inherit;
  }
`

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const TooltipBox = styled.div`
  background: rgba(13, 17, 23, 0.92);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 14px;
  min-width: 160px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
`

const TooltipDate = styled.p`
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 8px;
  font-weight: 500;
`

const TooltipRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;

  &:last-child { margin-bottom: 0; }
`

const TooltipKey = styled.span<{ $color: string }>`
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  display: flex;
  align-items: center;
  gap: 5px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
    flex-shrink: 0;
  }
`

const TooltipVal = styled.span`
  font-size: 12.5px;
  font-weight: 700;
  color: #fff;
`

// ─── Recharts custom tooltip component ───────────────────────────────────────

const CustomTooltip = ({ active, payload, label, visibleSeries }: any) => {
  if (!active || !payload?.length) return null
  return (
    <TooltipBox>
      <TooltipDate>{label}</TooltipDate>
      {payload
        .filter((p: any) => visibleSeries[p.dataKey])
        .map((entry: any) => (
          <TooltipRow key={entry.dataKey}>
            <TooltipKey $color={entry.color}>
              {entry.dataKey === 'revenue' ? 'Revenue' : 'Donors'}
            </TooltipKey>
            <TooltipVal>
              {entry.dataKey === 'revenue'
                ? `$${Number(entry.value).toFixed(2)}`
                : entry.value}
            </TooltipVal>
          </TooltipRow>
        ))}
    </TooltipBox>
  )
}

// ─── Tick formatters ─────────────────────────────────────────────────────────

const formatXTick = (val: string) => {
  try {
    const d = new Date(val)
    return `${d.getMonth() + 1}/${d.getDate()}`
  } catch {
    return val
  }
}

const formatYTick = (val: number) =>
  val >= 1000 ? `$${(val / 1000).toFixed(1)}k` : `$${val}`

// ─── Component ────────────────────────────────────────────────────────────────

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  goal,
  chartType: initialChartType = 'area',
  onExport,
}) => {
  const [chartType, setChartType] = useState<'line' | 'area'>(initialChartType)
  const [visibleSeries, setVisibleSeries] = useState({ revenue: true, donorCount: true })
  const [stats, setStats] = useState({
    totalRevenue: 0,
    averageDaily: 0,
    peakDay: 0,
    totalDonors: 0,
    daysActive: 0,
  })

  useEffect(() => {
    const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
    const totalDonors = data.length > 0 ? data[data.length - 1].donorCount : 0
    const averageDaily = data.length > 0 ? totalRevenue / data.length : 0
    const peakDay = Math.max(...data.map((d) => d.revenue), 0)
    setStats({ totalRevenue, averageDaily, peakDay, totalDonors, daysActive: data.length })
  }, [data])

  const handleExport = useCallback(() => {
    if (onExport) { onExport(); return }
    const csv = [
      ['Date', 'Revenue', 'Donors'],
      ...data.map((d) => [d.date, d.revenue, d.donorCount]),
    ].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: 'performance.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }, [data, onExport])

  const toggleSeries = (key: 'revenue' | 'donorCount') =>
    setVisibleSeries((prev) => ({ ...prev, [key]: !prev[key] }))

  const goalPct = goal && goal > 0 ? (stats.totalRevenue / goal) * 100 : 0

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart

  // KPI config
  const kpis = [
    {
      label: 'Total Revenue',
      value: `$${stats.totalRevenue >= 1000 ? (stats.totalRevenue / 1000).toFixed(1) + 'k' : stats.totalRevenue.toFixed(2)}`,
      fullValue: `$${stats.totalRevenue.toFixed(2)}`,
      icon: <TrendingUp size={15} />,
      color: tokens.brand,
      trend: 'up' as const,
      trendLabel: '+12%',
      delay: 0,
    },
    {
      label: 'Daily Average',
      value: `$${stats.averageDaily.toFixed(0)}`,
      fullValue: `$${stats.averageDaily.toFixed(2)}`,
      icon: <Activity size={15} />,
      color: tokens.green,
      trend: 'up' as const,
      trendLabel: '+5%',
      delay: 60,
    },
    {
      label: 'Peak Day',
      value: `$${stats.peakDay.toFixed(0)}`,
      fullValue: `$${stats.peakDay.toFixed(2)}`,
      icon: <Zap size={15} />,
      color: tokens.amber,
      trend: 'neutral' as const,
      trendLabel: '—',
      delay: 120,
    },
    {
      label: 'Total Donors',
      value: stats.totalDonors.toString(),
      fullValue: stats.totalDonors.toString(),
      icon: <Users size={15} />,
      color: '#8b5cf6',
      trend: (stats.totalDonors > 0 ? 'up' : 'neutral') as 'up' | 'neutral',
      trendLabel: stats.totalDonors > 0 ? `+${stats.totalDonors}` : '—',
      delay: 180,
    },
    {
      label: 'Days Active',
      value: stats.daysActive.toString(),
      fullValue: stats.daysActive.toString(),
      icon: <Calendar size={15} />,
      color: '#ec4899',
      trend: 'neutral' as const,
      trendLabel: '—',
      delay: 240,
    },
    ...(goal && goal > 0
      ? [{
          label: 'Goal Progress',
          value: `${goalPct.toFixed(1)}%`,
          fullValue: `${goalPct.toFixed(2)}%`,
          icon: <Target size={15} />,
          color: goalPct >= 100 ? tokens.green : tokens.brand,
          trend: (goalPct >= 50 ? 'up' : 'down') as 'up' | 'down',
          trendLabel: goalPct >= 100 ? 'Hit!' : `${(100 - goalPct).toFixed(0)}% left`,
          delay: 300,
        }]
      : []),
  ]

  return (
    <Root>
      {/* ── Section header ─────────────────────────────────────────── */}
      <SectionHeader>
        <SectionTitleGroup>
          <SectionLabel>Analytics</SectionLabel>
          <SectionTitle>Performance</SectionTitle>
        </SectionTitleGroup>
        <ViewReportLink href="#">
          <BarChart2 size={13} />
          Full report
          <ArrowUpRight size={12} />
        </ViewReportLink>
      </SectionHeader>

      {/* ── KPI grid ──────────────────────────────────────────────── */}
      <KpiGrid>
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} $accent={kpi.color} $delay={kpi.delay} title={kpi.fullValue}>
            <KpiTop>
              <KpiIconBox $color={kpi.color}>{kpi.icon}</KpiIconBox>
              <KpiBadge $trend={kpi.trend}>
                {kpi.trend === 'up' && <ArrowUpRight size={10} />}
                {kpi.trend === 'down' && <ArrowDownRight size={10} />}
                {kpi.trend === 'neutral' && <Minus size={10} />}
                {kpi.trendLabel}
              </KpiBadge>
            </KpiTop>
            <div>
              <KpiValue>{kpi.value}</KpiValue>
              <KpiLabel>{kpi.label}</KpiLabel>
            </div>
          </KpiCard>
        ))}
      </KpiGrid>

      {/* ── Chart card ────────────────────────────────────────────── */}
      <ChartCard>
        <ChartCardHeader>
          <ChartTitleGroup>
            <ChartTitle>
              <TrendingUp size={16} color={tokens.brand} />
              Revenue Performance
            </ChartTitle>
            <ChartSubtitle>Daily revenue and donor trends over time</ChartSubtitle>
          </ChartTitleGroup>

          <ChartControls>
            <SegmentedControl>
              <SegmentBtn $active={chartType === 'area'} onClick={() => setChartType('area')}>
                Area
              </SegmentBtn>
              <SegmentBtn $active={chartType === 'line'} onClick={() => setChartType('line')}>
                Line
              </SegmentBtn>
            </SegmentedControl>
            <ExportBtn onClick={handleExport}>
              <Download size={13} />
              Export
            </ExportBtn>
          </ChartControls>
        </ChartCardHeader>

        {/* Legend */}
        <LegendRow>
          <LegendItem $active={visibleSeries.revenue} onClick={() => toggleSeries('revenue')}>
            <LegendDot $color={tokens.brand} />
            Revenue
          </LegendItem>
          <LegendItem $active={visibleSeries.donorCount} onClick={() => toggleSeries('donorCount')}>
            <LegendDot $color={tokens.green} />
            Donors
          </LegendItem>
        </LegendRow>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={240}>
          <ChartComponent
            data={data}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tokens.brand} stopOpacity={0.22} />
                <stop offset="100%" stopColor={tokens.brand} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradDonors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tokens.green} stopOpacity={0.18} />
                <stop offset="100%" stopColor={tokens.green} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke={tokens.borderLight}
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={formatXTick}
              tick={{ fill: tokens.textTertiary, fontSize: 11 }}
              stroke={tokens.border}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatYTick}
              tick={{ fill: tokens.textTertiary, fontSize: 11 }}
              stroke="none"
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip
              content={<CustomTooltip visibleSeries={visibleSeries} />}
              cursor={{ stroke: tokens.brand, strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }}
            />

            {chartType === 'area' ? (
              <>
                {visibleSeries.revenue && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={tokens.brand}
                    strokeWidth={2}
                    fill="url(#gradRevenue)"
                    dot={false}
                    activeDot={{ r: 4, fill: tokens.brand, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={900}
                  />
                )}
                {visibleSeries.donorCount && (
                  <Area
                    type="monotone"
                    dataKey="donorCount"
                    stroke={tokens.green}
                    strokeWidth={2}
                    fill="url(#gradDonors)"
                    dot={false}
                    activeDot={{ r: 4, fill: tokens.green, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={900}
                  />
                )}
              </>
            ) : (
              <>
                {visibleSeries.revenue && (
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={tokens.brand}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: tokens.brand, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={900}
                  />
                )}
                {visibleSeries.donorCount && (
                  <Line
                    type="monotone"
                    dataKey="donorCount"
                    stroke={tokens.green}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: tokens.green, stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive
                    animationDuration={900}
                  />
                )}
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>

        {/* Goal progress bar */}
        {goal && goal > 0 && (
          <GoalBar>
            <GoalBarHeader>
              <GoalBarLabel>
                <Target size={12} color={tokens.brand} />
                Goal progress
                <span style={{ color: tokens.textTertiary }}>
                  ${stats.totalRevenue.toFixed(0)} of ${goal}
                </span>
              </GoalBarLabel>
              <GoalBarPct>{goalPct.toFixed(1)}%</GoalBarPct>
            </GoalBarHeader>
            <GoalTrack>
              <GoalFill $pct={goalPct} />
            </GoalTrack>
          </GoalBar>
        )}
      </ChartCard>
    </Root>
  )
}

export default PerformanceChart