'use client'

import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useCampaigns } from '@/api/hooks/useCampaigns'
import { useCreatorOwedPayouts } from '@/api/hooks/useCampaignPayouts'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { DollarSign, ChevronLeft, Clock, Users, ArrowRight, Search, Download } from 'lucide-react'
import { tk } from '@/styles/dashboardTokens'

// Age → urgency color (I3)
const ageColor = (days: number) => (days > 7 ? tk.red : days >= 3 ? tk.amberDark : tk.muted)

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${tk.canvas};
  padding: 2rem;
  @media (max-width: 640px) { padding: 1rem; }
`
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`
const Breadcrumb = styled.div`
  margin-bottom: 12px;
  button {
    background: none; border: none; color: ${tk.amberDark}; cursor: pointer;
    display: inline-flex; align-items: center; gap: 4px; font-size: 0.9rem; font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`
const Title = styled.h1`
  font-size: 2rem; font-weight: 800; color: ${tk.ink};
  display: flex; align-items: center; gap: 12px; margin: 0 0 0.25rem;
`
const Lede = styled.p`
  color: ${tk.body}; margin: 0 0 1.75rem; font-size: 0.95rem;
`

const Kpis = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.75rem;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`
const Kpi = styled.div<{ $accent?: string }>`
  background: ${tk.white}; border: 1px solid ${tk.border}; border-left: 4px solid ${({ $accent }) => $accent || tk.amber};
  border-radius: 12px; padding: 1.1rem 1.25rem;
  .label { font-size: 0.82rem; color: ${tk.muted}; font-weight: 600; display: flex; align-items: center; gap: 6px; }
  .value { font-size: 1.65rem; font-weight: 800; color: ${tk.ink}; margin-top: 0.35rem; }
`

const Toolbar = styled.div`
  display: flex; gap: 0.75rem; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap;
  .search {
    flex: 1; min-width: 220px; display: flex; align-items: center; gap: 8px;
    background: ${tk.white}; border: 1px solid ${tk.border}; border-radius: 10px; padding: 0 12px;
    color: ${tk.muted};
    input { flex: 1; border: none; outline: none; padding: 10px 0; font-size: 0.9rem; color: ${tk.ink}; background: transparent; }
    &:focus-within { border-color: ${tk.amber}; }
  }
  .export {
    display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
    background: ${tk.white}; border: 1px solid ${tk.border}; color: ${tk.body};
    border-radius: 10px; padding: 10px 14px; font-weight: 700; font-size: 0.85rem; cursor: pointer;
    &:hover:not(:disabled) { border-color: ${tk.amberMid}; color: ${tk.amberDark}; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
  }
`

const SectionLabel = styled.h2`
  font-size: 0.95rem; font-weight: 700; color: ${tk.ink}; margin: 0 0 0.85rem;
`
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;
`
const Card = styled.button<{ $owed: boolean }>`
  text-align: left; cursor: pointer; font: inherit;
  background: ${tk.white};
  border: 1px solid ${({ $owed }) => ($owed ? tk.amberMid : tk.border)};
  ${({ $owed }) => ($owed ? `box-shadow: 0 0 0 3px ${tk.amberLight};` : '')}
  border-radius: 14px; padding: 1.1rem 1.2rem;
  display: flex; flex-direction: column; gap: 0.6rem;
  transition: transform 0.12s, box-shadow 0.12s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.07); }
`
const CardTitle = styled.div`
  font-weight: 700; color: ${tk.ink}; font-size: 1rem;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`
const OwedBadge = styled.div`
  display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
  background: ${tk.amberLight}; color: ${tk.amberDark};
  border-radius: 999px; padding: 4px 11px; font-size: 0.82rem; font-weight: 800;
`
const SettledBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
  background: ${tk.greenLight}; color: ${tk.green};
  border-radius: 999px; padding: 4px 11px; font-size: 0.8rem; font-weight: 700;
`
const CardCta = styled.span<{ $owed: boolean }>`
  display: inline-flex; align-items: center; gap: 6px; margin-top: auto;
  font-size: 0.85rem; font-weight: 700;
  color: ${({ $owed }) => ($owed ? tk.amberDark : tk.muted)};
`
const Meta = styled.div`
  font-size: 0.78rem; color: ${tk.muted};
`

const EmptyState = styled.div`
  text-align: center; padding: 4rem 2rem; color: ${tk.body};
  background: ${tk.white}; border: 1px solid ${tk.border}; border-radius: 14px;
  svg { width: 56px; height: 56px; margin-bottom: 1rem; opacity: 0.5; color: ${tk.muted}; }
  h3 { font-size: 1.2rem; margin: 0 0 0.5rem; color: ${tk.ink}; }
  p { font-size: 0.95rem; margin: 0; }
`

const fmt = (n: number) => `$${n.toFixed(2)}`

export default function SharersPayoutsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  const campaignFilter = useMemo(() => (user?.id ? { userId: user.id } : {}), [user?.id])
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaigns(1, 100, campaignFilter)
  const { data: owed } = useCreatorOwedPayouts()

  const userCampaigns = useMemo(() => {
    if (!campaignsData?.campaigns || !user?.id) return []
    return campaignsData.campaigns.filter((c: any) => c.creator_id === user.id)
  }, [campaignsData?.campaigns, user?.id])

  // Per-campaign owed rollup from the cross-campaign owed feed.
  const owedByCampaign = useMemo(() => {
    const map: Record<string, { amount: number; count: number; oldest: number }> = {}
    owed?.items?.forEach((it) => {
      const k = it.campaign_id
      if (!map[k]) map[k] = { amount: 0, count: 0, oldest: 0 }
      map[k].amount += it.amount
      map[k].count += 1
      map[k].oldest = Math.max(map[k].oldest, it.age_days)
    })
    return map
  }, [owed])

  // Sharer names per campaign (for search by who you owe).
  const namesByCampaign = useMemo(() => {
    const map: Record<string, string> = {}
    owed?.items?.forEach((it) => {
      const n = `${it.sharer?.name || ''} ${it.sharer?.username || ''}`.toLowerCase()
      map[it.campaign_id] = (map[it.campaign_id] || '') + ' ' + n
    })
    return map
  }, [owed])

  // I4: search across campaign titles + owed sharer names.
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  // Owed campaigns first, then the rest; filtered by search.
  const sortedCampaigns = useMemo(() => {
    const list = [...userCampaigns].sort((a: any, b: any) => {
      const ao = owedByCampaign[a._id]?.amount || 0
      const bo = owedByCampaign[b._id]?.amount || 0
      return bo - ao
    })
    if (!q) return list
    return list.filter((c: any) =>
      (c.title || '').toLowerCase().includes(q) || (namesByCampaign[c._id] || '').includes(q)
    )
  }, [userCampaigns, owedByCampaign, namesByCampaign, q])

  const sharersWaiting = owed?.count || 0
  const campaignsNeedingAction = Object.keys(owedByCampaign).length

  // I5: export the owed list (what you owe, to whom) as CSV.
  const exportOwedCsv = () => {
    const rows = owed?.items || []
    if (rows.length === 0) return
    const header = ['Sharer', 'Username', 'Campaign', 'Amount (USD)', 'Days waiting', 'Method', 'Requested']
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const body = rows.map((r) => [
      r.sharer?.name || '', r.sharer?.username || '', r.campaign_title,
      r.amount.toFixed(2), r.age_days, r.payment_method?.type || '',
      new Date(r.requested_at).toISOString().slice(0, 10),
    ].map(esc).join(','))
    const csv = [header.map(esc).join(','), ...body].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `sharer-payouts-owed-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageWrapper>
      <Container>
        <Breadcrumb>
          <button onClick={() => router.back()}><ChevronLeft size={16} /> Back</button>
        </Breadcrumb>
        <Title><DollarSign size={30} /> Pay Your Sharers</Title>
        <Lede>Pay sharers who&apos;ve claimed their share-to-earn rewards, then mark each claim paid. Campaigns that owe money are highlighted and listed first.</Lede>

        {/* I1/KPI strip */}
        <Kpis>
          <Kpi $accent={tk.amber}>
            <div className="label"><DollarSign size={14} /> Total owed</div>
            <div className="value">{fmt(owed?.total_owed || 0)}</div>
          </Kpi>
          <Kpi $accent={tk.blue}>
            <div className="label"><Users size={14} /> Sharers waiting</div>
            <div className="value">{sharersWaiting}</div>
          </Kpi>
          <Kpi $accent={tk.amberDark}>
            <div className="label"><Clock size={14} /> Campaigns to pay</div>
            <div className="value">{campaignsNeedingAction}</div>
          </Kpi>
        </Kpis>

        {campaignsLoading ? (
          <EmptyState><p>Loading campaigns…</p></EmptyState>
        ) : userCampaigns.length === 0 ? (
          <EmptyState>
            <DollarSign />
            <h3>No campaigns yet</h3>
            <p>Create a campaign to start receiving shares and paying sharers.</p>
          </EmptyState>
        ) : (
          <>
            <Toolbar>
              <div className="search">
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search campaigns or sharers…"
                />
              </div>
              <button className="export" onClick={exportOwedCsv} disabled={!owed?.items?.length}>
                <Download size={15} /> Export owed (CSV)
              </button>
            </Toolbar>
            <SectionLabel>{q ? `Results for “${query}”` : 'Your campaigns'}</SectionLabel>
            <Grid>
              {sortedCampaigns.map((c: any) => {
                const o = owedByCampaign[c._id]
                const hasOwed = !!o && o.amount > 0
                return (
                  <Card key={c._id} $owed={hasOwed} onClick={() => router.push(`/sharers-payouts/${c._id}`)}>
                    <CardTitle>{c.title}</CardTitle>
                    {hasOwed ? (
                      <>
                        <OwedBadge>{fmt(o.amount)} owed · {o.count} claim{o.count !== 1 ? 's' : ''}</OwedBadge>
                        {o.oldest > 0 && (
                          <Meta style={{ color: ageColor(o.oldest), fontWeight: o.oldest > 7 ? 700 : 400 }}>
                            {o.oldest > 7 ? '⚠ ' : ''}oldest waiting {o.oldest} day{o.oldest !== 1 ? 's' : ''}
                          </Meta>
                        )}
                      </>
                    ) : (
                      <SettledBadge>✓ All settled</SettledBadge>
                    )}
                    <CardCta $owed={hasOwed}>
                      {hasOwed ? 'Pay sharers' : 'View payouts'} <ArrowRight size={14} />
                    </CardCta>
                  </Card>
                )
              })}
            </Grid>
          </>
        )}
      </Container>
    </PageWrapper>
  )
}
