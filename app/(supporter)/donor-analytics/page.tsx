'use client'

/** AN-04 — Donor Analytics (self), styled to match the /dashboard design system. */

import { useState } from 'react'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import {
  DollarSign, Heart, Target, Gift, Award, CalendarDays,
  RefreshCw, Loader2,
} from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useDonorAnalytics } from '@/api/hooks/useAdvancedAnalytics'
import type { AnalyticsPeriod } from '@/types/analytics'

// ─── Fonts & Global ───────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; -webkit-font-smoothing: antialiased; }
`

// ─── Design Tokens (shared with /dashboard) ─────────────────────────────────────

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  inkMid:      '#302E35',
  inkBorder:   '#3D3A44',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  offWhite:    '#F0EDE8',
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

// ─── Animations ───────────────────────────────────────────────────────────────

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

const spin = keyframes`
  to { transform: rotate(360deg); }
`

// ─── Layout ─────────────────────────────────────────────────────────────────

const Shell = styled.div`
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

const PageBody = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2.5rem) clamp(1rem, 3vw, 2rem);
`

// ─── Page Header ──────────────────────────────────────────────────────────────

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
  font-weight: 400;
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

const PageDescription = styled.p`
  color: ${tk.muted};
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
`

// ─── Controls ─────────────────────────────────────────────────────────────────

const PeriodSelect = styled.select`
  height: 38px;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0 2rem 0 0.875rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${tk.heading};
  cursor: pointer;
  outline: none;
  transition: border-color 140ms, box-shadow 140ms;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C8790' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;

  &:hover { border-color: ${tk.muted}; }
  &:focus { border-color: ${tk.blue}; box-shadow: 0 0 0 3px ${tk.blueLight}; }
`

const RefreshBtn = styled.button<{ $primary?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 38px;
  padding: 0 1rem;
  border-radius: 10px;
  border: 1px solid transparent;
  background: ${tk.blue};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 140ms, opacity 140ms;
  white-space: nowrap;

  &:hover { background: #0D4A8C; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }

  svg.spin { animation: ${spin} 0.9s linear infinite; }
`

// ─── KPI Strip ────────────────────────────────────────────────────────────────

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
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

const KPIValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.3rem, 2.5vw, 1.75rem);
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1.05;
  margin-bottom: 5px;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const KPILabel = styled.div`
  font-size: 0.75rem;
  color: ${tk.muted};
  font-weight: 400;
`

const KPISub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 3px;
`

// ─── Cards / Grid ─────────────────────────────────────────────────────────────

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
`

const Card = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 60}ms;
  transition: border-color 200ms, box-shadow 200ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 2px 8px rgba(26, 95, 168, 0.08);
  }
`

const CardTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 1.125rem;
`

// ─── Horizontal bar breakdown ───────────────────────────────────────────────

const BarRow = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.875rem;
  font-size: 0.82rem;
  color: ${tk.body};

  &:last-child { margin-bottom: 0; }

  span.label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: capitalize;
  }

  strong {
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    color: ${tk.heading};
  }
`

const BarTrack = styled.div`
  height: 8px;
  border-radius: 100px;
  background: ${tk.canvasDeep};
  overflow: hidden;
`

const BarFill = styled.div<{ $pct: number }>`
  height: 100%;
  --bar-w: ${p => Math.max(2, Math.min(100, p.$pct))}%;
  width: var(--bar-w);
  border-radius: 100px;
  background: linear-gradient(90deg, ${tk.amber}, ${tk.amberMid});
  animation: ${barGrow} 1s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

// ─── Recent donations list ──────────────────────────────────────────────────

const DonationRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${tk.canvasDeep};

  &:last-child { border-bottom: none; padding-bottom: 0; }
`

const DonationName = styled.span`
  font-size: 0.85rem;
  color: ${tk.heading};
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const DonationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-shrink: 0;

  span.date {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: ${tk.muted};
  }
  strong {
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    font-weight: 500;
    color: ${tk.heading};
  }
`

// ─── States ───────────────────────────────────────────────────────────────────

const CenterState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  color: ${tk.muted};
  font-size: 0.9rem;

  svg.spin { animation: ${spin} 0.9s linear infinite; color: ${tk.blue}; }
`

const Muted = styled.p`
  font-size: 0.85rem;
  color: ${tk.muted};
  margin: 0;
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDollars(value: number | null | undefined): string {
  const n = value ?? 0
  return `$${n.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const PERIODS: AnalyticsPeriod[] = ['month', 'quarter', 'year', 'all']

function BarList({ items, emptyText }: { items: { label: string; value: number; display?: string }[]; emptyText: string }) {
  if (!items || items.length === 0) return <Muted>{emptyText}</Muted>
  const max = Math.max(...items.map(i => i.value), 1)
  return (
    <div>
      {items.map(it => (
        <BarRow key={it.label}>
          <span className="label">{it.label}</span>
          <BarTrack><BarFill $pct={(it.value / max) * 100} /></BarTrack>
          <strong>{it.display ?? it.value.toLocaleString()}</strong>
        </BarRow>
      ))}
    </div>
  )
}

function DonorAnalyticsContent({ userId }: { userId?: string }) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('all')
  const { data, isLoading, isError, refetch, isFetching } = useDonorAnalytics(period, userId)

  return (
    <>
      <GlobalStyle />
      <Shell>
        <PageBody>
          <PageHeader>
            <div>
              <Greeting>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Greeting>
              <PageTitle>My Giving</PageTitle>
              <PageDescription>
                Your giving history, impact, and tax-year summary
              </PageDescription>
            </div>

            <HeaderActions>
              <PeriodSelect value={period} onChange={e => setPeriod(e.target.value as AnalyticsPeriod)}>
                {PERIODS.map(p => (
                  <option key={p} value={p}>{p === 'all' ? 'All time' : `Last ${p}`}</option>
                ))}
              </PeriodSelect>
              <RefreshBtn onClick={() => refetch()} disabled={isFetching}>
                {isFetching
                  ? <><Loader2 size={15} className="spin" /> Refreshing</>
                  : <><RefreshCw size={15} /> Refresh</>
                }
              </RefreshBtn>
            </HeaderActions>
          </PageHeader>

          {isLoading && (
            <CenterState>
              <Loader2 size={32} className="spin" />
              Loading your giving analytics…
            </CenterState>
          )}

          {isError && (
            <CenterState>Failed to load your giving analytics.</CenterState>
          )}

          {data && (
            <>
              <KPIStrip>
                <KPICard $delay={0}>
                  <KPITop><KPIIcon $color="amber"><DollarSign size={16} /></KPIIcon></KPITop>
                  <KPIValue>{formatDollars(data.summary.total_donated_dollars)}</KPIValue>
                  <KPILabel>Total donated</KPILabel>
                </KPICard>
                <KPICard $delay={1}>
                  <KPITop><KPIIcon $color="blue"><Heart size={16} /></KPIIcon></KPITop>
                  <KPIValue>{data.summary.total_donations.toLocaleString()}</KPIValue>
                  <KPILabel>Donations made</KPILabel>
                </KPICard>
                <KPICard $delay={2}>
                  <KPITop><KPIIcon $color="green"><Target size={16} /></KPIIcon></KPITop>
                  <KPIValue>{data.summary.campaigns_supported.toLocaleString()}</KPIValue>
                  <KPILabel>Campaigns supported</KPILabel>
                </KPICard>
                <KPICard $delay={3}>
                  <KPITop><KPIIcon $color="amber"><Gift size={16} /></KPIIcon></KPITop>
                  <KPIValue>{formatDollars(data.summary.average_donation_dollars)}</KPIValue>
                  <KPILabel>Average gift</KPILabel>
                </KPICard>
                <KPICard $delay={4}>
                  <KPITop><KPIIcon $color="green"><Award size={16} /></KPIIcon></KPITop>
                  <KPIValue>{formatDollars(data.summary.largest_donation_dollars)}</KPIValue>
                  <KPILabel>Largest gift</KPILabel>
                </KPICard>
                <KPICard $delay={5}>
                  <KPITop><KPIIcon $color="blue"><CalendarDays size={16} /></KPIIcon></KPITop>
                  <KPIValue style={{ fontSize: '1.05rem' }}>{formatDate(data.summary.first_donation_at)}</KPIValue>
                  <KPILabel>First donation</KPILabel>
                  <KPISub>Last: {formatDate(data.summary.last_donation_at)}</KPISub>
                </KPICard>
              </KPIStrip>

              <TwoCol>
                <Card $delay={0}>
                  <CardTitle>Causes you support</CardTitle>
                  <BarList
                    items={data.by_category.map(c => ({
                      label: c.category,
                      value: c.total_dollars,
                      display: formatDollars(c.total_dollars),
                    }))}
                    emptyText="No donations yet."
                  />
                </Card>
                <Card $delay={1}>
                  <CardTitle>Tax-year summary</CardTitle>
                  <BarList
                    items={data.tax_year_summary.map(y => ({
                      label: String(y.year),
                      value: y.total_dollars,
                      display: `${formatDollars(y.total_dollars)} (${y.donations})`,
                    }))}
                    emptyText="No donations yet."
                  />
                </Card>
              </TwoCol>

              <Card $delay={2}>
                <CardTitle>Recent donations</CardTitle>
                {data.recent_donations.length === 0 ? (
                  <Muted>No donations yet.</Muted>
                ) : (
                  data.recent_donations.map((d, i) => (
                    <DonationRow key={i}>
                      <DonationName>{d.campaign_title}</DonationName>
                      <DonationMeta>
                        <span className="date">{formatDate(d.date)}</span>
                        <strong>{formatDollars(d.amount_dollars)}</strong>
                      </DonationMeta>
                    </DonationRow>
                  ))
                )}
              </Card>
            </>
          )}
        </PageBody>
      </Shell>
    </>
  )
}

export default function DonorAnalyticsPage() {
  return (
    <ProtectedRoute>
      <DonorAnalyticsContent />
    </ProtectedRoute>
  )
}
