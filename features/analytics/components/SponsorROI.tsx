'use client'

/** AN-06 — Sponsor return-on-investment analytics. */

import { useSponsorROI } from '@/api/hooks/useAdvancedAnalytics'
import {
  SectionTitle,
  Card,
  Grid,
  Muted,
  Empty,
  StatCard,
  BarList,
  Spinner,
  formatDollars,
} from '@/features/analytics/ui'

export default function SponsorROI({ userId }: { userId?: string }) {
  const { data, isLoading, isError } = useSponsorROI(userId)

  if (isLoading) return <Spinner />
  if (isError) return <Empty>Failed to load sponsor ROI analytics.</Empty>
  if (!data) return <Empty>No sponsorship data found.</Empty>

  const cpi = data.roi.cost_per_impression_dollars
  const ipd = data.roi.impressions_per_dollar

  return (
    <div>
      <SectionTitle>Sponsor ROI</SectionTitle>

      <Grid $min="180px" style={{ marginBottom: 24 }}>
        <StatCard
          value={formatDollars(data.investment.gross_invested_dollars)}
          label="Invested"
          hint={`${data.investment.sponsorships} sponsorships`}
        />
        <StatCard value={data.exposure.total_impressions.toLocaleString()} label="Total impressions" />
        <StatCard
          value={cpi != null ? `$${cpi.toFixed(4)}` : '—'}
          label="Cost per impression"
        />
        <StatCard value={ipd != null ? ipd.toLocaleString() : '—'} label="Impressions per $" />
        <StatCard
          value={formatDollars(data.investment.net_to_causes_dollars)}
          label="Reached causes"
          hint={`${data.roi.net_to_causes_ratio}% of investment`}
        />
        <StatCard value={data.exposure.profile_views.toLocaleString()} label="Profile views" hint={`${data.exposure.giveaway_reach} giveaway reach`} />
      </Grid>

      <Card>
        <SectionTitle style={{ fontSize: '1.1rem' }}>Investment by tier</SectionTitle>
        <BarList
          items={data.tier_breakdown.map((t) => ({
            label: t.tier,
            value: t.gross_dollars,
            display: `${formatDollars(t.gross_dollars)} (${t.count})`,
          }))}
          emptyText="No sponsorships yet."
        />
      </Card>

      <Muted style={{ marginTop: 16 }}>Generated {new Date(data.generated_at).toLocaleString()}</Muted>
    </div>
  )
}
