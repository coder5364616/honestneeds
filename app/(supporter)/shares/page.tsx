'use client'

/**
 * My Shares — Share-to-Earn hub for supporters.
 *
 * Restyled to match the /dashboard design system (Syne / DM Sans / DM Mono,
 * warm-amber + ink token palette, styled-components). Consolidates the full
 * share-to-earn flow in one place:
 *   - Earnings KPI strip (available / pending hold / total earned / shares)
 *   - Wallet breakdown card with Request Withdrawal
 *   - Quick actions (browse campaigns, rewards, leaderboard, sweepstakes)
 *   - Conversion performance (clicks, conversions, rate, referral earnings)
 *   - Channel performance breakdown
 *   - Share history table with copy-link + pagination
 *   - How-it-works explainer
 */

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import {
  Wallet, Clock, Gift, Share2, TrendingUp, MousePointerClick,
  Target, Trophy, Ticket, Compass, Link2, Check,
  AlertCircle, Percent, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useMyShareAnalytics } from '@/api/hooks/useMyShareAnalytics'
import { useSharerEarnings } from '@/api/hooks/useSharerEarnings'
import { useSupporterConversionAnalytics } from '@/api/hooks/useConversionTracking'
import { WithdrawalRequestModal } from '@/components/wallet/WithdrawalRequestModal'

// ─── Design Tokens (mirrors /dashboard) ───────────────────────────────────────

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  inkBorder:   '#3D3A44',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
}

// ─── Fonts & Global ────────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
`

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`
const countUp = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`
const barGrow = keyframes`
  from { width: 0%; }
  to   { width: var(--bar-w); }
`
const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`

// ─── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  background: ${tk.canvas};
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

const Body = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
`

const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
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
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: ${tk.muted};
  max-width: 460px;
`

const HeaderActions = styled.div`
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
`

// ─── Buttons ───────────────────────────────────────────────────────────────────

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  transition: background 140ms, transform 120ms;
  &:hover:not(:disabled) { background: ${tk.inkLight}; transform: translateY(-1px); }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${tk.white};
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.65rem 1.1rem;
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
  &:hover { background: ${tk.canvasDeep}; border-color: ${tk.amber}; }
`

// ─── KPI Strip ──────────────────────────────────────────────────────────────

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { gap: 0.75rem; }
`

const KPICard = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 80}ms;
  position: relative;
  overflow: hidden;
  transition: box-shadow 180ms, border-color 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }
`

const KPITop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.875rem;
`

const KPIIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' | 'red' }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => ({ amber: tk.amberLight, green: tk.greenLight, blue: tk.blueLight, red: tk.redLight }[p.$color])};
  color: ${p => ({ amber: tk.amber, green: tk.green, blue: tk.blue, red: tk.red }[p.$color])};
`

const KPIValue = styled.div<{ $color?: string }>`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${p => p.$color || tk.heading};
  line-height: 1;
  margin-bottom: 5px;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const KPILabel = styled.div`
  font-size: 0.75rem;
  color: ${tk.muted};
`

const KPISub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 3px;
`

// ─── Section / Card ────────────────────────────────────────────────────────────

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem 0 1rem;
  flex-wrap: wrap;
`

const SectionH = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    color: ${tk.muted};
  }
`

const SectionAction = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: ${tk.blue};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 140ms;
  &:hover { background: ${tk.blueLight}; }
`

const Card = styled.div<{ $accent?: 'amber' | 'green'; $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 60}ms;
  ${p => p.$accent === 'amber' && `border-color: ${tk.amberMid};`}
  ${p => p.$accent === 'green' && `border-color: ${tk.green}33;`}
`

// ─── Wallet breakdown ─────────────────────────────────────────────────────────

const WalletGrid = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
`

const WalletMain = styled.div`
  flex: 1;
  min-width: 220px;
`

const WalletBalance = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  color: ${tk.green};
  line-height: 1;
  margin: 0.25rem 0 0.75rem;
`

const WalletMeta = styled.div`
  display: flex;
  gap: 1.75rem;
  flex-wrap: wrap;
`

const WalletMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  b {
    font-family: 'DM Mono', monospace;
    font-size: 0.95rem;
    color: ${tk.heading};
    font-weight: 500;
  }
  span {
    font-size: 0.68rem;
    color: ${tk.muted};
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
`

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { gap: 0.75rem; }
`

const QuickCard = styled.button<{ $delay?: number }>`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-align: left;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1rem 1.125rem;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 70}ms;
  transition: border-color 160ms, box-shadow 160ms, transform 120ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
    transform: translateY(-1px);
  }
`

const QuickIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' | 'red' }>`
  width: 40px;
  height: 40px;
  border-radius: 11px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => ({ amber: tk.amberLight, green: tk.greenLight, blue: tk.blueLight, red: tk.redLight }[p.$color])};
  color: ${p => ({ amber: tk.amber, green: tk.green, blue: tk.blue, red: tk.red }[p.$color])};
`

const QuickText = styled.div`
  min-width: 0;
`

const QuickTitle = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${tk.heading};
  line-height: 1.2;
`

const QuickSub = styled.div`
  font-size: 0.72rem;
  color: ${tk.muted};
  margin-top: 2px;
`

// ─── Stat Tiles ───────────────────────────────────────────────────────────────

const StatTiles = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
`

const StatTile = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1rem 1.125rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 70}ms;
`

const StatTileTop = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  color: ${tk.muted};
  margin-bottom: 0.625rem;
`

const StatTileLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const StatTileVal = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

const StatTileSub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 5px;
`

// ─── Channel bars ─────────────────────────────────────────────────────────────

const ChannelRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.625rem 0;
  border-bottom: 1px solid ${tk.canvasDeep};
  &:last-child { border-bottom: none; }
`

const ChannelName = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 130px;
  flex-shrink: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${tk.heading};
  text-transform: capitalize;
`

const ChannelTrack = styled.div`
  flex: 1;
  height: 7px;
  background: ${tk.canvasDeep};
  border-radius: 100px;
  overflow: hidden;
`

const ChannelFill = styled.div<{ $pct: number }>`
  height: 100%;
  --bar-w: ${p => Math.min(Math.max(p.$pct, 3), 100)}%;
  width: var(--bar-w);
  border-radius: 100px;
  background: linear-gradient(90deg, ${tk.amber}, ${tk.amberMid});
  animation: ${barGrow} 0.9s cubic-bezier(0.22,1,0.36,1) both;
`

const ChannelCount = styled.div`
  width: 48px;
  flex-shrink: 0;
  text-align: right;
  font-family: 'DM Mono', monospace;
  font-size: 0.82rem;
  font-weight: 500;
  color: ${tk.heading};
`

// ─── Table ──────────────────────────────────────────────────────────────────

const TableWrap = styled.div`
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`

const Th = styled.th`
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${tk.muted};
  border-bottom: 1px solid ${tk.border};
  white-space: nowrap;
`

const Tr = styled.tr`
  border-bottom: 1px solid ${tk.canvasDeep};
  transition: background 140ms;
  &:hover { background: ${tk.canvas}; }
  &:last-child { border-bottom: none; }
`

const Td = styled.td`
  padding: 0.875rem 0.75rem;
  color: ${tk.body};
  vertical-align: middle;
`

const CampaignName = styled.a`
  font-weight: 500;
  color: ${tk.heading};
  text-decoration: none;
  cursor: pointer;
  &:hover { color: ${tk.blue}; text-decoration: underline; }
`

const Money = styled.span`
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  color: ${tk.heading};
`

const ChannelPill = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 100px;
  text-transform: capitalize;
  background: ${tk.blueLight};
  color: ${tk.blue};
`

const StatusPill = styled.span<{ $tone: 'green' | 'amber' | 'blue' }>`
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 100px;
  text-transform: capitalize;
  letter-spacing: 0.3px;
  background: ${p => ({ green: tk.greenLight, amber: tk.amberLight, blue: tk.blueLight }[p.$tone])};
  color: ${p => ({ green: tk.green, amber: tk.amberDark, blue: tk.blue }[p.$tone])};
`

const CopyBtn = styled.button<{ $copied?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0.35rem 0.7rem;
  border-radius: 8px;
  border: 1px solid ${p => p.$copied ? tk.green : tk.border};
  background: ${p => p.$copied ? tk.greenLight : tk.white};
  color: ${p => p.$copied ? tk.green : tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  &:hover { border-color: ${tk.amber}; background: ${tk.canvasDeep}; }
`

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
`

const PageBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 140ms;
  &:hover:not(:disabled) { border-color: ${tk.amber}; background: ${tk.canvasDeep}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const PageInfo = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  color: ${tk.muted};
`

// ─── Empty / Skeleton / Error ────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 3.5rem 2rem;
`

const EmptyTitle = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 1rem 0 0.375rem;
`

const EmptyBody = styled.p`
  font-size: 0.85rem;
  color: ${tk.muted};
  margin: 0 0 1.25rem;
`

const SkeletonLine = styled.div<{ $w?: string; $h?: string }>`
  width: ${p => p.$w || '100%'};
  height: ${p => p.$h || '12px'};
  background: linear-gradient(90deg, ${tk.canvasDeep} 25%, ${tk.border} 50%, ${tk.canvasDeep} 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 100px;
`

const SkeletonCard = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${tk.redLight};
  border: 1px solid rgba(192,57,43,0.2);
  border-radius: 10px;
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: ${tk.red};
`

// ─── How it works ─────────────────────────────────────────────────────────────

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`

const Step = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const StepNum = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 0.78rem;
  background: ${tk.amber};
  color: ${tk.ink};
`

const StepTitle = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${tk.heading};
`

const StepBody = styled.div`
  font-size: 0.78rem;
  color: ${tk.muted};
  line-height: 1.45;
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtMoney = (cents: number) =>
  `$${((cents || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const channelEmoji = (c: string): string => ({
  facebook: '📘', twitter: '🐦', x: '🐦', linkedin: '💼',
  email: '✉️', whatsapp: '💬', link: '🔗', sms: '📱', copy: '🔗',
}[c?.toLowerCase()] || '📢')

const statusTone = (s: string): 'green' | 'amber' | 'blue' => {
  const v = (s || '').toLowerCase()
  if (v === 'completed' || v === 'verified' || v === 'paid') return 'green'
  if (v.startsWith('pending')) return 'amber'
  return 'blue'
}

const statusLabel = (s: string): string => {
  const v = (s || '').toLowerCase()
  if (v === 'pending_verification') return 'On Hold'
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : 'Unknown'
}

// ─── Component ────────────────────────────────────────────────────────────────

function SharesPageContent() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { shares, isLoading, sharesError: error } = useMyShareAnalytics(currentPage, 25)
  const { data: earnings, isLoading: earningsLoading } = useSharerEarnings()
  const { data: convRaw } = useSupporterConversionAnalytics()

  // Conversion metrics can arrive as { data: {...} } or flat — normalise both.
  const conv = useMemo(() => {
    const c: any = (convRaw as any)?.data ?? convRaw ?? {}
    return {
      totalShares: c.total_shares ?? c.totalShares ?? 0,
      totalClicks: c.total_clicks ?? c.totalReferrals ?? 0,
      totalConversions: c.total_conversions ?? c.totalConversions ?? 0,
      conversionRate: Number(c.conversion_rate ?? c.conversionRate ?? 0),
      totalRevenue: c.total_revenue ?? c.totalRewardEarned ?? 0,
      byChannel: (c.shares_by_channel ?? c.sharesByChannel ?? c.by_channel ?? {}) as Record<string, any>,
    }
  }, [convRaw])

  const shareRows: any[] = shares?.shares || []
  const totalPages =
    (shares as any)?.pagination?.totalPages ||
    Math.max(1, Math.ceil(((shares as any)?.total || shareRows.length) / 25))

  const channels = useMemo(() => {
    const entries = Object.entries(conv.byChannel).map(([name, v]: [string, any]) => ({
      name,
      count: typeof v === 'object' ? (v?.share_count ?? 0) : Number(v) || 0,
    }))
    const max = Math.max(1, ...entries.map(e => e.count))
    return entries
      .sort((a, b) => b.count - a.count)
      .map(e => ({ ...e, pct: (e.count / max) * 100 }))
  }, [conv.byChannel])

  const handleCopyLink = (shareId: string) => {
    const url = `${window.location.origin}/campaigns?ref=${shareId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(shareId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const available = earnings?.available_cents || 0
  const pending = earnings?.pending_cents || 0
  const reserved = earnings?.reserved_cents || 0
  const totalEarned = earnings?.total_earned_cents || 0

  // SA-2: distinct campaigns this sharer has shared/earned from.
  const campaignsShared = useMemo(
    () =>
      new Set(
        shareRows.map((r: any) => r.campaign_id || r.campaignId || r.campaign?._id).filter(Boolean)
      ).size,
    [shareRows]
  )

  return (
    <Page>
      <GlobalStyle />
      <Body>
        {/* Header */}
        <PageHeader>
          <div>
            <Greeting>Share to Earn</Greeting>
            <PageTitle>My Shares</PageTitle>
            <PageSub>
              Track the campaigns you&apos;ve shared, your referral impact, and the rewards you&apos;ve earned.
            </PageSub>
          </div>
          <HeaderActions>
            <GhostBtn onClick={() => router.push('/campaigns')}>
              <Compass size={16} /> Find Campaigns
            </GhostBtn>
            <PrimaryBtn onClick={() => setShowWithdrawalModal(true)} disabled={available <= 0}>
              <Wallet size={16} /> Request Withdrawal
            </PrimaryBtn>
          </HeaderActions>
        </PageHeader>

        {error && (
          <ErrorBanner>
            <AlertCircle size={18} />
            Failed to load your shares. Please try again later.
          </ErrorBanner>
        )}

        {/* KPI Strip */}
        <KPIStrip>
          <KPICard $delay={0}>
            <KPITop><KPIIcon $color="green"><Wallet size={16} /></KPIIcon></KPITop>
            <KPIValue $color={tk.green}>
              {earningsLoading ? '—' : fmtMoney(available)}
            </KPIValue>
            <KPILabel>Available Balance</KPILabel>
            <KPISub>ready to withdraw</KPISub>
          </KPICard>

          <KPICard $delay={1}>
            <KPITop><KPIIcon $color="amber"><Clock size={16} /></KPIIcon></KPITop>
            <KPIValue $color={tk.amberDark}>
              {earningsLoading ? '—' : fmtMoney(pending)}
            </KPIValue>
            <KPILabel>Owed</KPILabel>
            <KPISub>awaiting payout</KPISub>
          </KPICard>

          <KPICard $delay={2}>
            <KPITop><KPIIcon $color="blue"><Gift size={16} /></KPIIcon></KPITop>
            <KPIValue>
              {earningsLoading ? '—' : fmtMoney(totalEarned)}
            </KPIValue>
            <KPILabel>Total Earned</KPILabel>
            <KPISub>lifetime rewards</KPISub>
          </KPICard>

          <KPICard $delay={3}>
            <KPITop><KPIIcon $color="amber"><Share2 size={16} /></KPIIcon></KPITop>
            <KPIValue>{(conv.totalShares || shareRows.length).toLocaleString()}</KPIValue>
            <KPILabel>Total Shares</KPILabel>
            <KPISub>
              {conv.totalConversions.toLocaleString()} conversions
              {campaignsShared > 0 ? ` · ${campaignsShared} campaign${campaignsShared !== 1 ? 's' : ''}` : ''}
            </KPISub>
          </KPICard>
        </KPIStrip>

        {/* Wallet breakdown */}
        <Card $accent="green" $delay={1}>
          <WalletGrid>
            <WalletMain>
              <KPILabel>Available to withdraw</KPILabel>
              <WalletBalance>{earningsLoading ? '—' : fmtMoney(available)}</WalletBalance>
              <WalletMeta>
                <WalletMetaItem>
                  <b>{fmtMoney(pending)}</b>
                  <span>Pending Hold</span>
                </WalletMetaItem>
                <WalletMetaItem>
                  <b>{fmtMoney(reserved)}</b>
                  <span>Reserved</span>
                </WalletMetaItem>
                <WalletMetaItem>
                  <b>{fmtMoney(totalEarned)}</b>
                  <span>Total Earned</span>
                </WalletMetaItem>
              </WalletMeta>
            </WalletMain>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <PrimaryBtn onClick={() => setShowWithdrawalModal(true)} disabled={available <= 0}>
                <Wallet size={16} /> Request Withdrawal
              </PrimaryBtn>
              <GhostBtn onClick={() => router.push('/dashboard/share-rewards')}>
                <Gift size={15} /> Manage Rewards
              </GhostBtn>
            </div>
          </WalletGrid>
        </Card>

        {/* Quick Actions */}
        <SectionHead><SectionH>Quick Actions</SectionH></SectionHead>
        <QuickGrid>
          <QuickCard $delay={0} onClick={() => router.push('/campaigns')}>
            <QuickIcon $color="amber"><Compass size={20} /></QuickIcon>
            <QuickText>
              <QuickTitle>Browse Campaigns</QuickTitle>
              <QuickSub>Find causes to share</QuickSub>
            </QuickText>
          </QuickCard>
          <QuickCard $delay={1} onClick={() => router.push('/dashboard/share-rewards')}>
            <QuickIcon $color="green"><Gift size={20} /></QuickIcon>
            <QuickText>
              <QuickTitle>Share Rewards</QuickTitle>
              <QuickSub>Earnings &amp; payouts</QuickSub>
            </QuickText>
          </QuickCard>
          <QuickCard $delay={2} onClick={() => router.push('/shares/leaderboard')}>
            <QuickIcon $color="blue"><Trophy size={20} /></QuickIcon>
            <QuickText>
              <QuickTitle>Leaderboard</QuickTitle>
              <QuickSub>Top sharers &amp; rank</QuickSub>
            </QuickText>
          </QuickCard>
          <QuickCard $delay={3} onClick={() => router.push('/shares/sweepstakes')}>
            <QuickIcon $color="red"><Ticket size={20} /></QuickIcon>
            <QuickText>
              <QuickTitle>Sweepstakes</QuickTitle>
              <QuickSub>Entries &amp; prizes</QuickSub>
            </QuickText>
          </QuickCard>
        </QuickGrid>

        {/* Conversion performance */}
        <SectionHead>
          <SectionH>Conversion Performance <span>across all shares</span></SectionH>
        </SectionHead>
        <StatTiles>
          <StatTile $delay={0}>
            <StatTileTop><MousePointerClick size={14} /><StatTileLabel>Clicks</StatTileLabel></StatTileTop>
            <StatTileVal>{conv.totalClicks.toLocaleString()}</StatTileVal>
            <StatTileSub>visitors from shares</StatTileSub>
          </StatTile>
          <StatTile $delay={1}>
            <StatTileTop><Target size={14} /><StatTileLabel>Conversions</StatTileLabel></StatTileTop>
            <StatTileVal>{conv.totalConversions.toLocaleString()}</StatTileVal>
            <StatTileSub>actions driven</StatTileSub>
          </StatTile>
          <StatTile $delay={2}>
            <StatTileTop><Percent size={14} /><StatTileLabel>Conv. Rate</StatTileLabel></StatTileTop>
            <StatTileVal>{conv.conversionRate.toFixed(1)}%</StatTileVal>
            <StatTileSub>clicks → conversions</StatTileSub>
          </StatTile>
          <StatTile $delay={3}>
            <StatTileTop><TrendingUp size={14} /><StatTileLabel>Referral Earnings</StatTileLabel></StatTileTop>
            <StatTileVal>{fmtMoney(conv.totalRevenue)}</StatTileVal>
            <StatTileSub>from your referrals</StatTileSub>
          </StatTile>
        </StatTiles>

        {/* Channel performance */}
        {channels.length > 0 && (
          <>
            <SectionHead><SectionH>Performance by Channel</SectionH></SectionHead>
            <Card $delay={2}>
              {channels.map(ch => (
                <ChannelRow key={ch.name}>
                  <ChannelName>{channelEmoji(ch.name)} {ch.name}</ChannelName>
                  <ChannelTrack><ChannelFill $pct={ch.pct} /></ChannelTrack>
                  <ChannelCount>{ch.count}</ChannelCount>
                </ChannelRow>
              ))}
            </Card>
          </>
        )}

        {/* Share history */}
        <SectionHead>
          <SectionH>
            Share History
            {shareRows.length > 0 && <span>{shareRows.length} on this page</span>}
          </SectionH>
          <SectionAction onClick={() => router.push('/campaigns')}>
            Share more <ChevronRight size={14} />
          </SectionAction>
        </SectionHead>

        <Card $delay={2}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...Array(5)].map((_, i) => <SkeletonLine key={i} $h="20px" />)}
            </div>
          ) : shareRows.length === 0 ? (
            <EmptyState>
              <QuickIcon $color="amber" style={{ margin: '0 auto', width: 48, height: 48, borderRadius: 14 }}>
                <Link2 size={24} />
              </QuickIcon>
              <EmptyTitle>No shares yet</EmptyTitle>
              <EmptyBody>Share campaigns to help creators reach more supporters — and earn rewards.</EmptyBody>
              <PrimaryBtn onClick={() => router.push('/campaigns')}>
                <Compass size={16} /> Browse Campaigns
              </PrimaryBtn>
            </EmptyState>
          ) : (
            <>
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <Th>Campaign</Th>
                      <Th>Channel</Th>
                      <Th>Date</Th>
                      <Th>Status</Th>
                      <Th>Reward</Th>
                      <Th>Referral Link</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {shareRows.map(s => (
                      <Tr key={s.shareId}>
                        <Td>
                          <CampaignName onClick={() => router.push(`/campaigns/${s.campaignId}`)}>
                            {s.campaignTitle || 'Campaign'}
                          </CampaignName>
                        </Td>
                        <Td><ChannelPill>{channelEmoji(s.channel)} {s.channel}</ChannelPill></Td>
                        <Td>
                          {new Date(s.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </Td>
                        <Td><StatusPill $tone={statusTone(s.status)}>{statusLabel(s.status)}</StatusPill></Td>
                        <Td>
                          <Money>{fmtMoney(s.reward_amount)}</Money>
                          {s.is_paid && <Check size={13} color={tk.green} style={{ marginLeft: 6, verticalAlign: 'middle' }} />}
                        </Td>
                        <Td>
                          <CopyBtn $copied={copiedId === s.shareId} onClick={() => handleCopyLink(s.shareId)}>
                            {copiedId === s.shareId
                              ? <><Check size={13} /> Copied</>
                              : <><Link2 size={13} /> Copy</>}
                          </CopyBtn>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>

              {totalPages > 1 && (
                <Pagination>
                  <PageBtn onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <ChevronLeft size={14} /> Prev
                  </PageBtn>
                  <PageInfo>Page {currentPage} of {totalPages}</PageInfo>
                  <PageBtn onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                    Next <ChevronRight size={14} />
                  </PageBtn>
                </Pagination>
              )}
            </>
          )}
        </Card>

        {/* How it works */}
        <SectionHead>
          <SectionH><Sparkles size={16} style={{ color: tk.amber }} /> How Share to Earn Works</SectionH>
        </SectionHead>
        <Card $accent="amber" $delay={2}>
          <Steps>
            <Step>
              <StepNum>1</StepNum>
              <StepTitle>Share a campaign</StepTitle>
              <StepBody>Pick a cause you believe in and share your referral link on any channel.</StepBody>
            </Step>
            <Step>
              <StepNum>2</StepNum>
              <StepTitle>Drive supporters</StepTitle>
              <StepBody>When people click your link and donate, the conversion is credited to you.</StepBody>
            </Step>
            <Step>
              <StepNum>3</StepNum>
              <StepTitle>Earn rewards</StepTitle>
              <StepBody>When your share converts, the reward is owed to you right away — the creator pays you directly when you request a payout.</StepBody>
            </Step>
            <Step>
              <StepNum>4</StepNum>
              <StepTitle>Withdraw earnings</StepTitle>
              <StepBody>Cleared rewards move to your available balance — withdraw anytime above the minimum.</StepBody>
            </Step>
          </Steps>
        </Card>
      </Body>

      {showWithdrawalModal && (
        <WithdrawalRequestModal
          availableBalance={available}
          onClose={() => setShowWithdrawalModal(false)}
          onSuccess={() => setShowWithdrawalModal(false)}
        />
      )}
    </Page>
  )
}

export default function SharesPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'creator', 'admin']}>
      <SharesPageContent />
    </ProtectedRoute>
  )
}
