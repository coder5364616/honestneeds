'use client'

import React, { useEffect, useMemo } from 'react'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Calendar, Download, TrendingUp, Target, Users, DollarSign, Share2,
  ArrowUpRight, ArrowDownRight, Activity, Zap, BarChart2, Trophy, MousePointerClick,
  ChevronRight, Lightbulb, AlertCircle, CheckCircle2, Percent,
} from 'lucide-react'
import {
  ForecastingChart,
  SeasonalHeatmap,
  ChannelROIChart,
  ActivityPredictionCard,
} from '@/components/analytics'
import { ActivityFeed } from '../dashboard/components/ActivityFeed'
import { useMetricsFilters } from '@/hooks/useMetricsFilters'
import { useAuthStore } from '@/store/authStore'
import { useAuthHydration } from '@/hooks/useAuthHydration'
import { apiClient } from '@/lib/api'

// ─── Fonts & Global (matches /dashboard) ─────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; -webkit-font-smoothing: antialiased; }
`

// ─── Design Tokens (shared with /dashboard) ──────────────────────────────────

const tk = {
  ink: '#18171A', inkLight: '#242228', inkMid: '#302E35', inkBorder: '#3D3A44',
  canvas: '#F7F5F1', canvasDeep: '#EEEBe5', border: '#E2DDD6',
  white: '#FFFFFF', offWhite: '#F0EDE8', muted: '#8C8790', body: '#4A4750', heading: '#18171A',
  amber: '#D4870A', amberLight: '#FBF3E0', amberMid: '#F5C961', amberDark: '#A8680A',
  green: '#1A7A4A', greenLight: '#E8F5EE', red: '#C0392B', redLight: '#FBE9E7',
  blue: '#1A5FA8', blueLight: '#E8F0FB',
}

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeUp = keyframes`from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); }`
const countUp = keyframes`from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); }`
const shimmer = keyframes`0% { background-position: -600px 0; } 100% { background-position: 600px 0; }`
const barGrow = keyframes`from { width: 0%; } to { width: var(--bar-w); }`

// ─── Shell ────────────────────────────────────────────────────────────────────

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

const Main = styled.main`
  flex: 1;
  margin-left: 240px;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  @media (max-width: 1024px) { margin-left: 0; }
`

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(247, 245, 241, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid ${tk.blue};
  padding: 0 clamp(1rem, 3vw, 2rem);
  height: 60px;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const TopBarActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const IconBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 0.875rem;
  border-radius: 10px;
  border: 1px solid ${p => (p.$primary ? 'transparent' : tk.border)};
  background: ${p => (p.$primary ? tk.blue : tk.white)};
  color: ${p => (p.$primary ? tk.white : tk.body)};
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  &:hover { background: ${p => (p.$primary ? '#0D4A8C' : tk.canvasDeep)}; }
`

const PageBody = styled.div`
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
  flex: 1;
  min-width: 0;
  max-width: 100%;
  @media (max-width: 480px) { padding: 1rem 0.875rem; }
`

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.4s ease both;
`

const Greeting = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
`

const PageTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
`

const PageSub = styled.p`
  font-size: 0.9rem;
  color: ${tk.muted};
  margin: 0.5rem 0 0;
`

// ─── Control Bar ───────────────────────────────────────────────────────────────

const ControlBar = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1rem;
  flex-wrap: wrap;
`

const RangeTabs = styled.div`
  display: flex;
  gap: 4px;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
`

const RangeTab = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.875rem;
  border-radius: 7px;
  border: none;
  background: ${p => (p.$active ? tk.white : 'transparent')};
  color: ${p => (p.$active ? tk.heading : tk.muted)};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: ${p => (p.$active ? 600 : 400)};
  cursor: pointer;
  transition: all 140ms;
  box-shadow: ${p => (p.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none')};
`

// ─── KPI Strip ─────────────────────────────────────────────────────────────────

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 480px) { gap: 0.75rem; }
`

const KPICard = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 80}ms;
  transition: box-shadow 180ms, border-color 180ms;
  &:hover { border-color: ${tk.blue}; box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12); }
`

const KPITop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.875rem;
`

const KPIIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' | 'red' }>`
  width: 34px; height: 34px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  background: ${p => ({ amber: tk.amberLight, green: tk.greenLight, blue: tk.blueLight, red: tk.redLight }[p.$color])};
  color: ${p => ({ amber: tk.amber, green: tk.green, blue: tk.blue, red: tk.red }[p.$color])};
`

const KPITrend = styled.div<{ $up: boolean }>`
  display: flex; align-items: center; gap: 3px;
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem; font-weight: 500;
  color: ${p => (p.$up ? tk.green : tk.red)};
  background: ${p => (p.$up ? tk.greenLight : tk.redLight)};
  padding: 3px 8px; border-radius: 100px;
`

const KPIValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
  margin-bottom: 5px;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const KPILabel = styled.div`font-size: 0.75rem; color: ${tk.muted};`
const KPISub = styled.div`font-family: 'DM Mono', monospace; font-size: 0.67rem; color: ${tk.muted}; margin-top: 3px;`

// ─── Stat Tiles ─────────────────────────────────────────────────────────────────

const StatTiles = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  @media (max-width: 900px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 480px) { gap: 0.75rem; }
`

const StatTile = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1rem 1.125rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 70}ms;
`

const StatTileTop = styled.div`display: flex; align-items: center; gap: 7px; color: ${tk.muted}; margin-bottom: 0.625rem;`
const StatTileLabel = styled.span`font-size: 0.72rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.4px;`
const StatTileVal = styled.div`font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; color: ${tk.heading}; line-height: 1;`
const StatTileSub = styled.div`font-family: 'DM Mono', monospace; font-size: 0.67rem; color: ${tk.muted}; margin-top: 5px;`

// ─── Section Heads & Cards ───────────────────────────────────────────────────

const SectionHead = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem; margin: 2rem 0 1rem; flex-wrap: wrap;
`

const SectionH = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1rem; font-weight: 700; color: ${tk.heading};
  margin: 0; display: flex; align-items: center; gap: 8px;
  span { font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 400; color: ${tk.muted}; }
`

const Card = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 60}ms;
  @media (max-width: 480px) { padding: 1rem 1rem; }
`

const CardTitle = styled.h3`font-family: 'Syne', sans-serif; font-size: 0.9rem; font-weight: 700; color: ${tk.heading}; margin: 0 0 1rem;`

// Scroll-contains embedded legacy chart panels (some have wide fixed-width
// tables/grids) so they never push the page into horizontal overflow on mobile.
const PanelWrap = styled.div`
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 1.5rem;
`

const TwoCol = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1.25rem; margin-bottom: 1.5rem;
  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }
`

// ─── Top Performers ─────────────────────────────────────────────────────────────

const RankList = styled.div`display: flex; flex-direction: column; gap: 0.5rem;`
const RankRow = styled.button`
  display: flex; align-items: center; gap: 0.875rem; width: 100%; text-align: left;
  background: transparent; border: 1px solid transparent; border-radius: 10px;
  padding: 0.625rem 0.5rem; cursor: pointer; font-family: 'DM Sans', sans-serif;
  transition: background 140ms, border-color 140ms;
  &:hover { background: ${tk.canvas}; border-color: ${tk.border}; }
`
const RankNum = styled.div<{ $top?: boolean }>`
  width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 0.78rem;
  background: ${p => (p.$top ? tk.amber : tk.canvasDeep)}; color: ${p => (p.$top ? tk.ink : tk.muted)};
`
const RankBody = styled.div`flex: 1; min-width: 0;`
const RankTitle = styled.div`font-size: 0.85rem; font-weight: 500; color: ${tk.heading}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
const RankBar = styled.div`height: 4px; background: ${tk.canvasDeep}; border-radius: 100px; overflow: hidden; margin-top: 5px;`
const RankBarFill = styled.div<{ $pct: number }>`height: 100%; --bar-w: ${p => Math.min(p.$pct, 100)}%; width: var(--bar-w); border-radius: 100px; background: ${tk.amber}; animation: ${barGrow} 1s ease both;`
const RankStat = styled.div`
  text-align: right; flex-shrink: 0;
  b { display: block; font-family: 'DM Mono', monospace; font-size: 0.85rem; font-weight: 500; color: ${tk.heading}; }
  span { font-size: 0.68rem; color: ${tk.muted}; }
`

// ─── Recommendations ────────────────────────────────────────────────────────────

const RecList = styled.div`display: flex; flex-direction: column; gap: 0.75rem;`
const RecItem = styled.div<{ $priority: string }>`
  display: flex; gap: 0.875rem; padding: 0.875rem 1rem; border-radius: 12px;
  background: ${tk.canvas}; border: 1px solid ${tk.border};
  border-left: 3px solid ${p => (p.$priority === 'critical' ? tk.red : p.$priority === 'major' ? tk.amber : tk.blue)};
`
const RecIcon = styled.div<{ $priority: string }>`
  flex-shrink: 0; width: 32px; height: 32px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  background: ${p => (p.$priority === 'critical' ? tk.redLight : p.$priority === 'major' ? tk.amberLight : tk.blueLight)};
  color: ${p => (p.$priority === 'critical' ? tk.red : p.$priority === 'major' ? tk.amberDark : tk.blue)};
`
const RecBody = styled.div`flex: 1; min-width: 0;`
const RecTitle = styled.div`font-family: 'Syne', sans-serif; font-size: 0.85rem; font-weight: 700; color: ${tk.heading}; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;`
const RecDesc = styled.div`font-size: 0.8rem; color: ${tk.body}; margin-top: 3px; line-height: 1.45;`
const RecBadge = styled.span<{ $impact: string }>`
  font-family: 'DM Mono', monospace; font-size: 0.6rem; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.3px; padding: 2px 7px; border-radius: 100px;
  background: ${p => (p.$impact === 'high' ? tk.greenLight : p.$impact === 'medium' ? tk.amberLight : tk.canvasDeep)};
  color: ${p => (p.$impact === 'high' ? tk.green : p.$impact === 'medium' ? tk.amberDark : tk.muted)};
`

// ─── Channel mini-bars (themed) ──────────────────────────────────────────────

const ChannelList = styled.div`display: flex; flex-direction: column; gap: 0.875rem; min-width: 0;`
const ChannelRow = styled.div`display: flex; flex-direction: column; gap: 5px; min-width: 0;`
const ChannelTop = styled.div`display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; min-width: 0;`
const ChannelName = styled.span`font-size: 0.82rem; font-weight: 600; color: ${tk.heading}; text-transform: capitalize; min-width: 0;`
const ChannelMeta = styled.span`font-family: 'DM Mono', monospace; font-size: 0.72rem; color: ${tk.muted}; min-width: 0;`
const ChannelTrack = styled.div`height: 6px; background: ${tk.canvasDeep}; border-radius: 100px; overflow: hidden;`
const ChannelFill = styled.div<{ $pct: number }>`height: 100%; --bar-w: ${p => Math.min(p.$pct, 100)}%; width: var(--bar-w); border-radius: 100px; background: linear-gradient(90deg, ${tk.blue}, #3b82f6); animation: ${barGrow} 1s ease both;`

// ─── States ──────────────────────────────────────────────────────────────────

const SkeletonLine = styled.div<{ $w?: string; $h?: string }>`
  width: ${p => p.$w || '100%'}; height: ${p => p.$h || '12px'};
  background: linear-gradient(90deg, ${tk.canvasDeep} 25%, ${tk.border} 50%, ${tk.canvasDeep} 75%);
  background-size: 600px 100%; animation: ${shimmer} 1.5s infinite linear; border-radius: 100px;
`
const SkeletonCard = styled.div`background: ${tk.white}; border: 1px solid ${tk.border}; border-radius: 14px; padding: 1.125rem; display: flex; flex-direction: column; gap: 10px;`

const EmptyState = styled.div`text-align: center; padding: 4rem 2rem; background: ${tk.white}; border: 1.5px dashed ${tk.border}; border-radius: 16px;`
const EmptyTitle = styled.p`font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 700; color: ${tk.heading}; margin: 0.75rem 0 0.375rem;`
const EmptyBody = styled.p`font-size: 0.85rem; color: ${tk.muted}; margin: 0 0 1.25rem;`
const CreateBtn = styled.button`display: inline-flex; align-items: center; gap: 6px; background: ${tk.ink}; color: ${tk.white}; font-family: 'Syne', sans-serif; font-size: 0.875rem; font-weight: 700; border: none; border-radius: 10px; padding: 0.65rem 1.25rem; cursor: pointer; &:hover { background: ${tk.inkLight}; }`
const ErrorBox = styled.div`background: ${tk.redLight}; border: 1px solid #fecaca; border-radius: 12px; padding: 1rem 1.25rem; color: ${tk.red}; margin-bottom: 1.5rem; font-size: 0.875rem;`

// ─── Themed chart tooltip ──────────────────────────────────────────────────────

const TipBox = styled.div`background: rgba(24,23,26,0.92); backdrop-filter: blur(8px); border-radius: 10px; padding: 10px 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2);`
const TipDate = styled.div`font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-bottom: 6px;`
const TipRow = styled.div`display: flex; justify-content: space-between; gap: 14px; font-size: 0.75rem; color: #fff; margin-top: 2px;`

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <TipBox>
      <TipDate>{payload[0]?.payload?.displayDate || label}</TipDate>
      {payload.map((p: any) => (
        <TipRow key={p.dataKey}>
          <span style={{ color: p.color }}>{p.name}</span>
          <b>{p.dataKey === 'donationAmount' ? `$${Number(p.value).toFixed(0)}` : p.value}</b>
        </TipRow>
      ))}
    </TipBox>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (n: number) => `$${(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${(n || 0).toFixed(1)}%`

/**
 * Creator Analytics Page
 * End-to-end analytics for campaign creators — donations, sharing, channels,
 * forecasting, supporter predictions and optimization recommendations.
 * Mirrors the /dashboard design system (Syne/DM Sans, warm canvas, KPI cards).
 */
export default function CreatorAnalyticsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isHydrated = useAuthHydration()
  const { state, setDateRange } = useMetricsFilters('30d')

  useEffect(() => {
    if (isHydrated && !user) router.push('/login')
  }, [isHydrated, user, router])

  const { data: metricsData, isLoading, error } = useQuery({
    queryKey: ['creator-analytics', user?.id, state.dateRange.startDate, state.dateRange.endDate],
    queryFn: async () => {
      const response = await apiClient.get('/metrics/creator/dashboard', {
        params: {
          startDate: state.dateRange.startDate.toISOString(),
          endDate: state.dateRange.endDate.toISOString(),
        },
      })
      return response.data.data
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })

  const summary = metricsData?.summary
  const trends = metricsData?.trends
  const timeSeries = metricsData?.timeSeries || []
  const channelMetrics = metricsData?.channelMetrics || []
  const forecastData = metricsData?.forecastData || []
  const topCampaigns = metricsData?.topCampaigns || []
  const predictions = metricsData?.activityPredictions || []
  const recommendations = metricsData?.recommendations || []
  const hourlyActivity = metricsData?.hourlyActivity || []
  const campaigns = metricsData?.campaigns || []

  const recentActivity = useMemo(
    () =>
      (metricsData?.recentActivity || []).map((a: any) => ({
        id: a.id,
        type: a.type || 'donation',
        title: a.title || 'New Donation',
        description: `${a.campaignTitle || 'A campaign'} received a donation`,
        timestamp: a.timestamp,
        campaignId: a.campaignId,
        campaignTitle: a.campaignTitle,
        amount: a.amount,
      })),
    [metricsData],
  )

  const channelMax = useMemo(
    () => Math.max(1, ...channelMetrics.map((c: any) => c.revenue || c.impressions || 0)),
    [channelMetrics],
  )

  const handleExport = () => {
    if (!timeSeries.length) return
    const csv = [
      ['Date', 'Donations', 'Donation Amount ($)', 'Shares', 'Cumulative Donors'],
      ...timeSeries.map((d: any) => [d.date, d.donations, d.donationAmount, d.shares, d.donorCount]),
    ]
      .map(r => r.join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), {
      href: url,
      download: `analytics-${new Date().toISOString().split('T')[0]}.csv`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isHydrated || !user) {
    return (
      <>
        <GlobalStyle />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: tk.canvas, fontFamily: "'DM Sans', sans-serif", color: tk.muted }}>
          <SkeletonLine $w="160px" $h="14px" />
          <span style={{ fontSize: '0.8rem' }}>Loading your analytics…</span>
        </div>
      </>
    )
  }

  const kpis = [
    {
      label: 'Total Raised', value: fmtMoney(summary?.totalRaised || 0),
      sub: `${summary?.donationCount || 0} donations`, icon: <DollarSign size={16} />,
      color: 'amber' as const, growth: trends?.donationGrowth ?? 0,
    },
    {
      label: 'Donations', value: (summary?.donationCount || 0).toLocaleString(),
      sub: `avg ${fmtMoney(summary?.avgDonation || 0)}`, icon: <Activity size={16} />,
      color: 'green' as const, growth: trends?.donationCountGrowth ?? 0,
    },
    {
      label: 'Supporters', value: (summary?.uniqueSupporters || 0).toLocaleString(),
      sub: 'unique donors', icon: <Users size={16} />,
      color: 'blue' as const, growth: trends?.supporterGrowth ?? 0,
    },
    {
      label: 'Shares', value: (summary?.totalShares || 0).toLocaleString(),
      sub: `${summary?.totalConversions || 0} conversions`, icon: <Share2 size={16} />,
      color: 'red' as const, growth: trends?.shareGrowth ?? 0,
    },
  ]

  const hasData = campaigns.length > 0

  return (
    <>
      <GlobalStyle />
      <Shell>
        <Main>
          <TopBar>
            <TopBarActions>
              <IconBtn onClick={handleExport}><Download size={14} /> Export CSV</IconBtn>
              <IconBtn $primary onClick={() => router.push('/dashboard')}><BarChart2 size={14} /> Dashboard</IconBtn>
            </TopBarActions>
          </TopBar>

          <PageBody>
            <PageHeader>
              <Greeting>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Greeting>
              <PageTitle>Campaign Analytics</PageTitle>
              <PageSub>Performance insights, channel ROI and optimization recommendations across all your campaigns.</PageSub>

              <ControlBar>
                <Calendar size={16} color={tk.muted} />
                <RangeTabs>
                  {(['7d', '30d', '90d'] as const).map(r => (
                    <RangeTab key={r} $active={state.dateRangeType === r} onClick={() => setDateRange(r)}>
                      {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
                    </RangeTab>
                  ))}
                </RangeTabs>
              </ControlBar>
            </PageHeader>

            {error && <ErrorBox>Failed to load analytics. Please refresh and try again.</ErrorBox>}

            {isLoading ? (
              <KPIStrip>
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} style={{ animationDelay: `${i * 60}ms` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <SkeletonLine $w="34px" $h="34px" style={{ borderRadius: 10 }} />
                      <SkeletonLine $w="50px" $h="22px" style={{ borderRadius: 100 }} />
                    </div>
                    <SkeletonLine $w="60%" $h="28px" style={{ marginTop: 4 }} />
                    <SkeletonLine $w="80%" $h="12px" />
                  </SkeletonCard>
                ))}
              </KPIStrip>
            ) : !hasData ? (
              <EmptyState>
                <TrendingUp size={32} color={tk.muted} style={{ margin: '0 auto' }} />
                <EmptyTitle>No campaigns yet</EmptyTitle>
                <EmptyBody>Create your first campaign to start tracking performance metrics and insights.</EmptyBody>
                <CreateBtn onClick={() => router.push('/campaigns/new')}>Create First Campaign</CreateBtn>
              </EmptyState>
            ) : (
              <>
                {/* ── KPI Strip ── */}
                <KPIStrip>
                  {kpis.map((kpi, i) => (
                    <KPICard key={kpi.label} $delay={i}>
                      <KPITop>
                        <KPIIcon $color={kpi.color}>{kpi.icon}</KPIIcon>
                        <KPITrend $up={kpi.growth >= 0}>
                          {kpi.growth >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                          {fmtPct(kpi.growth)}
                        </KPITrend>
                      </KPITop>
                      <KPIValue>{kpi.value}</KPIValue>
                      <KPILabel>{kpi.label}</KPILabel>
                      <KPISub>{kpi.sub}</KPISub>
                    </KPICard>
                  ))}
                </KPIStrip>

                {/* ── Secondary metrics ── */}
                <StatTiles>
                  <StatTile $delay={0}>
                    <StatTileTop><DollarSign size={14} /><StatTileLabel>Avg Donation</StatTileLabel></StatTileTop>
                    <StatTileVal>{fmtMoney(summary?.avgDonation || 0)}</StatTileVal>
                    <StatTileSub>per donation</StatTileSub>
                  </StatTile>
                  <StatTile $delay={1}>
                    <StatTileTop><Percent size={14} /><StatTileLabel>Conversion</StatTileLabel></StatTileTop>
                    <StatTileVal>{(summary?.conversionRate || 0).toFixed(1)}%</StatTileVal>
                    <StatTileSub>clicks → donations</StatTileSub>
                  </StatTile>
                  <StatTile $delay={2}>
                    <StatTileTop><MousePointerClick size={14} /><StatTileLabel>Share Clicks</StatTileLabel></StatTileTop>
                    <StatTileVal>{(summary?.totalClicks || 0).toLocaleString()}</StatTileVal>
                    <StatTileSub>referral traffic</StatTileSub>
                  </StatTile>
                  <StatTile $delay={3}>
                    <StatTileTop><Zap size={14} /><StatTileLabel>Active</StatTileLabel></StatTileTop>
                    <StatTileVal>{trends?.activeCampaigns || 0}</StatTileVal>
                    <StatTileSub>of {campaigns.length} campaigns</StatTileSub>
                  </StatTile>
                </StatTiles>

                {/* ── Performance over time (themed) ── */}
                <SectionHead>
                  <SectionH>Performance Over Time<span>donations & shares</span></SectionH>
                </SectionHead>
                <Card $delay={4} style={{ marginBottom: '1.5rem' }}>
                  {timeSeries.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <ComposedChart data={timeSeries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradDon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={tk.amber} stopOpacity={0.28} />
                            <stop offset="100%" stopColor={tk.amber} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={tk.canvasDeep} vertical={false} />
                        <XAxis dataKey="displayDate" tick={{ fill: tk.muted, fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis yAxisId="left" tick={{ fill: tk.muted, fontSize: 11 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`)} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fill: tk.muted, fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: tk.amber, strokeDasharray: '4 4', strokeOpacity: 0.5 }} />
                        <Area yAxisId="left" type="monotone" dataKey="donationAmount" name="Donations ($)" stroke={tk.amber} strokeWidth={2} fill="url(#gradDon)" dot={false} animationDuration={900} />
                        <Line yAxisId="right" type="monotone" dataKey="shares" name="Shares" stroke={tk.blue} strokeWidth={2} dot={false} animationDuration={900} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: tk.muted }}>
                      <BarChart2 size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>No activity in this period yet</p>
                    </div>
                  )}
                </Card>

                {/* ── Top campaigns + Channel performance ── */}
                <TwoCol>
                  <Card $delay={5}>
                    <CardTitle><Trophy size={15} color={tk.amber} style={{ verticalAlign: '-2px', marginRight: 6 }} />Top Campaigns</CardTitle>
                    {topCampaigns.length > 0 ? (
                      <RankList>
                        {topCampaigns.map((c: any, i: number) => (
                          <RankRow key={c._id} onClick={() => router.push(`/campaigns/${c._id}`)}>
                            <RankNum $top={i === 0}>{i + 1}</RankNum>
                            <RankBody>
                              <RankTitle>{c.title}</RankTitle>
                              <RankBar><RankBarFill $pct={c.pct} /></RankBar>
                            </RankBody>
                            <RankStat><b>{fmtMoney(c.raised)}</b><span>{c.donor_count} donors</span></RankStat>
                          </RankRow>
                        ))}
                      </RankList>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: tk.muted, fontSize: '0.85rem' }}>No donations in this period yet</div>
                    )}
                  </Card>

                  <Card $delay={6}>
                    <CardTitle><Share2 size={15} color={tk.blue} style={{ verticalAlign: '-2px', marginRight: 6 }} />Channel Performance</CardTitle>
                    {channelMetrics.length > 0 ? (
                      <ChannelList>
                        {channelMetrics.map((c: any) => (
                          <ChannelRow key={c.channel}>
                            <ChannelTop>
                              <ChannelName>{c.channel}</ChannelName>
                              <ChannelMeta>{c.impressions} shares · {c.conversions} conv · {c.roi}% ROI</ChannelMeta>
                            </ChannelTop>
                            <ChannelTrack><ChannelFill $pct={((c.revenue || c.impressions) / channelMax) * 100} /></ChannelTrack>
                          </ChannelRow>
                        ))}
                      </ChannelList>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '2rem 1rem', color: tk.muted, fontSize: '0.85rem' }}>No shares recorded yet — enable Share-to-Earn to grow reach</div>
                    )}
                  </Card>
                </TwoCol>

                {/* ── Optimization recommendations (themed) ── */}
                {recommendations.length > 0 && (
                  <>
                    <SectionHead><SectionH><Lightbulb size={16} color={tk.amber} />Recommendations</SectionH></SectionHead>
                    <Card $delay={6} style={{ marginBottom: '1.5rem' }}>
                      <RecList>
                        {recommendations.map((r: any) => (
                          <RecItem key={r.id} $priority={r.priority}>
                            <RecIcon $priority={r.priority}>
                              {r.priority === 'critical' ? <AlertCircle size={16} /> : r.priority === 'major' ? <TrendingUp size={16} /> : <CheckCircle2 size={16} />}
                            </RecIcon>
                            <RecBody>
                              <RecTitle>
                                {r.title}
                                <RecBadge $impact={r.impact}>{r.impact} impact</RecBadge>
                                {r.expectedImprovement ? <RecBadge $impact="medium">+{r.expectedImprovement}%</RecBadge> : null}
                              </RecTitle>
                              <RecDesc>{r.description}</RecDesc>
                            </RecBody>
                          </RecItem>
                        ))}
                      </RecList>
                    </Card>
                  </>
                )}

                {/* ── Forecast (recharts panel) ── */}
                {forecastData.length > 0 && (
                  <>
                    <SectionHead><SectionH>Revenue Forecast<span>next 14 days</span></SectionH></SectionHead>
                    <PanelWrap>
                      <ForecastingChart
                        data={forecastData}
                        title="Projected Daily Donations"
                        actualLabel="Recorded"
                        forecastLabel="Forecast"
                        confidence={90}
                      />
                    </PanelWrap>
                  </>
                )}

                {/* ── Channel ROI detail + Supporter predictions ── */}
                {channelMetrics.length > 0 && (
                  <PanelWrap>
                    <ChannelROIChart data={channelMetrics} title="Channel ROI Breakdown" currencySymbol="$" />
                  </PanelWrap>
                )}

                {predictions.length > 0 && (
                  <PanelWrap>
                    <ActivityPredictionCard
                      predictions={predictions}
                      title="Supporter Activity Predictions"
                      currencySymbol="$"
                    />
                  </PanelWrap>
                )}

                {/* ── Best times heatmap ── */}
                {hourlyActivity.length > 0 && (
                  <PanelWrap>
                    <SeasonalHeatmap
                      data={hourlyActivity}
                      title="Best Engagement Times"
                      valueKey="engagement"
                      xAxisKey="hour"
                      yAxisKey="dayOfWeek"
                    />
                  </PanelWrap>
                )}

                {/* ── Recent activity ── */}
                <SectionHead><SectionH>Recent Activity</SectionH></SectionHead>
                <Card $delay={7} style={{ marginBottom: '2rem' }}>
                  <ActivityFeed activities={recentActivity} limit={8} isLoading={isLoading} />
                </Card>
              </>
            )}
          </PageBody>
        </Main>
      </Shell>
    </>
  )
}
