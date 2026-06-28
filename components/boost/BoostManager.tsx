'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { toast } from 'react-toastify'
import { useGetCreatorBoosts, useExtendBoost, useCancelBoost } from '@/api/hooks/useBoosts'
import { BOOST_TIERS } from '@/utils/boostValidationSchemas'
import { Eye, MessageCircle, ShoppingCart, Zap, TrendingUp, Clock, Plus } from 'lucide-react'

// ─── Design Tokens (shared with /dashboard) ────────────────────────────────────

const tk = {
  ink:        '#18171A',
  inkLight:   '#242228',
  inkBorder:  '#3D3A44',
  canvas:     '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border:     '#E2DDD6',
  white:      '#FFFFFF',
  muted:      '#8C8790',
  body:       '#4A4750',
  heading:    '#18171A',
  amber:      '#D4870A',
  amberLight: '#FBF3E0',
  amberMid:   '#F5C961',
  amberDark:  '#A8680A',
  green:      '#1A7A4A',
  greenLight: '#E8F5EE',
  red:        '#C0392B',
  redLight:   '#FBE9E7',
  blue:       '#1A5FA8',
  blueLight:  '#E8F0FB',
}

// ─── Fonts & Animations ─────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
`

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

// ─── Page Shell ─────────────────────────────────────────────────────────────────

const PageBody = styled.div`
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
  background: ${tk.canvas};
  min-height: 100vh;
`

const Inner = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`

const PageHeader = styled.div`
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
  margin: 0 0 6px;
  line-height: 1.1;
  letter-spacing: -0.5px;
`

const PageSub = styled.p`
  font-size: 0.9rem;
  color: ${tk.muted};
  margin: 0;
`

// ─── KPI Strip ──────────────────────────────────────────────────────────────────

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

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
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
  margin-bottom: 5px;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const KPILabel = styled.div`
  font-size: 0.75rem;
  color: ${tk.muted};
`

// ─── Boost Grid & Cards ─────────────────────────────────────────────────────────

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 0 1rem;
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

const BoostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;

  @media (max-width: 480px) { grid-template-columns: 1fr; }
`

const BoostCard = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  animation: ${fadeUp} 0.45s ease both;
  animation-delay: ${p => (p.$delay || 0) * 60}ms;
  transition: border-color 200ms, box-shadow 200ms, transform 120ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
    transform: translateY(-1px);
  }
`

const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.125rem;
`

const CardTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 3px;
`

const CardWeight = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: ${tk.muted};
`

const StatusPill = styled.span<{ $active: boolean }>`
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  white-space: nowrap;
  background: ${p => (p.$active ? tk.greenLight : tk.canvasDeep)};
  color: ${p => (p.$active ? tk.green : tk.muted)};
`

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding-bottom: 1.125rem;
  margin-bottom: 1.125rem;
  border-bottom: 1px solid ${tk.canvasDeep};
`

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StatTop = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${tk.muted};

  svg { width: 13px; height: 13px; }
`

const StatKey = styled.span`
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const StatVal = styled.span`
  font-family: 'Syne', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

const ProgressRow = styled.div`
  margin-bottom: 1.125rem;
`

const ProgressLabels = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`

const ProgressLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: ${tk.body};

  svg { width: 13px; height: 13px; color: ${tk.muted}; }
`

const ProgressVal = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  font-weight: 500;
  color: ${tk.heading};
`

const ProgressTrack = styled.div`
  height: 6px;
  background: ${tk.canvasDeep};
  border-radius: 100px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  --bar-w: ${p => Math.min(Math.max(p.$pct, 0), 100)}%;
  width: var(--bar-w);
  border-radius: 100px;
  background: linear-gradient(90deg, ${tk.amber}, ${tk.amberMid});
  animation: ${barGrow} 1s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.25s;
`

const ProgressPct = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 5px;
`

const PriceLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${tk.canvasDeep};
`

const PriceLabel = styled.span`
  font-size: 0.75rem;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const PriceVal = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${tk.heading};
`

const ROIBadge = styled.span<{ $positive: boolean }>`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 100px;
  background: ${p => (p.$positive ? tk.greenLight : tk.canvasDeep)};
  color: ${p => (p.$positive ? tk.green : tk.muted)};
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ExtendBtn = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.55rem;
  border-radius: 9px;
  border: none;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 140ms;

  &:hover:not(:disabled) { background: ${tk.inkLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const CancelBtn = styled.button`
  flex: 1;
  padding: 0.55rem;
  border-radius: 9px;
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 140ms, border-color 140ms, color 140ms;

  &:hover:not(:disabled) {
    background: ${tk.redLight};
    border-color: rgba(192,57,43,0.4);
    color: ${tk.red};
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

// ─── Empty / Error / Skeleton ──────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${tk.white};
  border: 1.5px dashed ${tk.border};
  border-radius: 16px;
  animation: ${fadeUp} 0.4s ease both;
`

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: ${tk.amberLight};
  color: ${tk.amber};
  display: flex;
  align-items: center;
  justify-content: center;
`

const EmptyTitle = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 0.375rem;
`

const EmptyBody = styled.p`
  font-size: 0.875rem;
  color: ${tk.muted};
  margin: 0 0 1.5rem;
`

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  transition: background 140ms;
  &:hover { background: ${tk.inkLight}; }
`

const ErrorState = styled.div`
  background: ${tk.redLight};
  border: 1px solid rgba(192,57,43,0.3);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  color: ${tk.red};
  font-size: 0.875rem;
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
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

// ─── Pagination ─────────────────────────────────────────────────────────────────

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${tk.border};
`

const PageInfo = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  color: ${tk.muted};
`

const PageBtns = styled.div`
  display: flex;
  gap: 0.5rem;
`

const PageBtn = styled.button`
  padding: 0.45rem 1rem;
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  border-radius: 9px;
  cursor: pointer;
  transition: background 140ms;

  &:hover:not(:disabled) { background: ${tk.canvasDeep}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

// ─── Component ──────────────────────────────────────────────────────────────────

/**
 * BoostManager
 * Creator boost dashboard — styled to match the /dashboard design system
 * (Syne/DM Sans/DM Mono, warm canvas, amber/blue accents, animated cards).
 */
export const BoostManager: React.FC = () => {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const { data, isLoading, error } = useGetCreatorBoosts(page, limit)
  const extendMutation = useExtendBoost()
  const cancelMutation = useCancelBoost()

  const boosts: any[] = data?.boosts || []
  const pagination = data?.pagination

  const summary = useMemo(() => {
    const active = boosts.filter(b => b.is_active).length
    const views = boosts.reduce((s, b) => s + (b.stats?.views || 0), 0)
    const engagement = boosts.reduce((s, b) => s + (b.stats?.engagement || 0), 0)
    const conversions = boosts.reduce((s, b) => s + (b.stats?.conversions || 0), 0)
    return { active, views, engagement, conversions }
  }, [boosts])

  const handleExtend = async (boostId: string) => {
    try {
      await extendMutation.mutateAsync(boostId)
      toast.success('Boost extended for 30 days!')
    } catch (err) {
      toast.error(`Error extending boost: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleCancel = async (boostId: string) => {
    if (!window.confirm('Are you sure you want to cancel this boost? This action cannot be undone.')) return
    try {
      await cancelMutation.mutateAsync({ boostId })
      toast.success('Boost cancelled successfully')
    } catch (err) {
      toast.error(`Error cancelling boost: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <>
      <GlobalStyle />
      <PageBody>
        <Inner>
          {/* Header */}
          <PageHeader>
            <Greeting>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Greeting>
            <PageTitle>Campaign Boosts</PageTitle>
            <PageSub>Manage your campaign visibility boosts and track their performance</PageSub>
          </PageHeader>

          {/* KPI Strip */}
          <KPIStrip>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <SkeletonCard key={i} style={{ animationDelay: `${i * 60}ms` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <SkeletonLine $w="34px" $h="34px" style={{ borderRadius: 10 }} />
                  </div>
                  <SkeletonLine $w="55%" $h="26px" />
                  <SkeletonLine $w="70%" $h="11px" />
                </SkeletonCard>
              ))
            ) : (
              <>
                <KPICard $delay={0}>
                  <KPITop><KPIIcon $color="green"><Zap size={16} /></KPIIcon></KPITop>
                  <KPIValue>{summary.active}</KPIValue>
                  <KPILabel>Active boosts</KPILabel>
                </KPICard>
                <KPICard $delay={1}>
                  <KPITop><KPIIcon $color="blue"><Eye size={16} /></KPIIcon></KPITop>
                  <KPIValue>{summary.views.toLocaleString()}</KPIValue>
                  <KPILabel>Boosted views</KPILabel>
                </KPICard>
                <KPICard $delay={2}>
                  <KPITop><KPIIcon $color="amber"><MessageCircle size={16} /></KPIIcon></KPITop>
                  <KPIValue>{summary.engagement.toLocaleString()}</KPIValue>
                  <KPILabel>Engagement</KPILabel>
                </KPICard>
                <KPICard $delay={3}>
                  <KPITop><KPIIcon $color="green"><ShoppingCart size={16} /></KPIIcon></KPITop>
                  <KPIValue>{summary.conversions.toLocaleString()}</KPIValue>
                  <KPILabel>Conversions</KPILabel>
                </KPICard>
              </>
            )}
          </KPIStrip>

          {/* Error */}
          {error && (
            <ErrorState>
              Error loading boosts: {error instanceof Error ? error.message : 'Unknown error'}
            </ErrorState>
          )}

          {/* Loading grid */}
          {isLoading && !error && (
            <BoostsGrid>
              {[...Array(2)].map((_, i) => (
                <SkeletonCard key={i} style={{ animationDelay: `${i * 60}ms`, gap: 16 }}>
                  <SkeletonLine $w="45%" $h="16px" />
                  <SkeletonLine $w="100%" $h="48px" />
                  <SkeletonLine $w="100%" $h="6px" />
                  <SkeletonLine $w="100%" $h="34px" />
                </SkeletonCard>
              ))}
            </BoostsGrid>
          )}

          {/* Empty */}
          {!isLoading && !error && boosts.length === 0 && (
            <EmptyState>
              <EmptyIcon><Zap size={28} /></EmptyIcon>
              <EmptyTitle>No active boosts</EmptyTitle>
              <EmptyBody>Start boosting your campaigns to increase visibility and reach more supporters.</EmptyBody>
              <PrimaryBtn onClick={() => router.push('/dashboard/campaigns')}>
                <Plus size={15} />
                Boost a campaign
              </PrimaryBtn>
            </EmptyState>
          )}

          {/* Boosts */}
          {!isLoading && !error && boosts.length > 0 && (
            <>
              <SectionHead>
                <SectionH>
                  Your boosts <span>{pagination?.total ?? boosts.length} total</span>
                </SectionH>
              </SectionHead>

              <BoostsGrid>
                {boosts.map((boost, idx) => {
                  const tierData = BOOST_TIERS[boost.tier as keyof typeof BOOST_TIERS]
                  const roi = boost.stats?.roi || 0
                  return (
                    <BoostCard key={boost._id} $delay={idx}>
                      <CardHead>
                        <div>
                          <CardTitle>{tierData?.name || boost.tier}</CardTitle>
                          <CardWeight>{boost.visibility_weight}x visibility</CardWeight>
                        </div>
                        <StatusPill $active={!!boost.is_active}>
                          {boost.is_active ? '● Active' : 'Inactive'}
                        </StatusPill>
                      </CardHead>

                      <StatsRow>
                        <Stat>
                          <StatTop><Eye /><StatKey>Views</StatKey></StatTop>
                          <StatVal>{(boost.stats?.views || 0).toLocaleString()}</StatVal>
                        </Stat>
                        <Stat>
                          <StatTop><MessageCircle /><StatKey>Engage</StatKey></StatTop>
                          <StatVal>{(boost.stats?.engagement || 0).toLocaleString()}</StatVal>
                        </Stat>
                        <Stat>
                          <StatTop><ShoppingCart /><StatKey>Conv.</StatKey></StatTop>
                          <StatVal>{(boost.stats?.conversions || 0).toLocaleString()}</StatVal>
                        </Stat>
                      </StatsRow>

                      <ProgressRow>
                        <ProgressLabels>
                          <ProgressLabel><Clock />Time remaining</ProgressLabel>
                          <ProgressVal>{boost.days_remaining} days</ProgressVal>
                        </ProgressLabels>
                        <ProgressTrack>
                          <ProgressFill $pct={boost.percentage_complete || 0} />
                        </ProgressTrack>
                        <ProgressPct>{boost.percentage_complete || 0}% complete</ProgressPct>
                      </ProgressRow>

                      <PriceLine>
                        <PriceLabel>Paid</PriceLabel>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {boost.tier !== 'free' && (
                            <ROIBadge $positive={roi >= 0}>
                              <TrendingUp size={11} style={{ verticalAlign: '-1px', marginRight: 3 }} />
                              {roi >= 0 ? '+' : ''}{roi}% ROI
                            </ROIBadge>
                          )}
                          <PriceVal>{boost.price}</PriceVal>
                        </span>
                      </PriceLine>

                      <Actions>
                        <ExtendBtn onClick={() => handleExtend(boost._id)} disabled={extendMutation.isPending}>
                          {extendMutation.isPending ? 'Extending…' : 'Extend 30 days'}
                        </ExtendBtn>
                        <CancelBtn onClick={() => handleCancel(boost._id)} disabled={cancelMutation.isPending}>
                          {cancelMutation.isPending ? 'Cancelling…' : 'Cancel'}
                        </CancelBtn>
                      </Actions>
                    </BoostCard>
                  )
                })}
              </BoostsGrid>

              {pagination && pagination.pages > 1 && (
                <Pagination>
                  <PageInfo>Page {pagination.page} of {pagination.pages}</PageInfo>
                  <PageBtns>
                    <PageBtn onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                      Previous
                    </PageBtn>
                    <PageBtn onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages}>
                      Next
                    </PageBtn>
                  </PageBtns>
                </Pagination>
              )}
            </>
          )}
        </Inner>
      </PageBody>
    </>
  )
}

export default BoostManager
