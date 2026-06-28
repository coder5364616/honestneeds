'use client'

/** AN-05 — Business social-impact / CSR analytics. */

import { useBusinessImpact } from '@/api/hooks/useAdvancedAnalytics'
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
  humanize,
} from '@/features/analytics/ui'

export default function BusinessImpact({ businessId }: { businessId: string | undefined }) {
  const { data, isLoading, isError } = useBusinessImpact(businessId)

  if (isLoading) return <Spinner />
  if (isError) return <Empty>Failed to load business impact analytics.</Empty>
  if (!data) return <Empty>No business profile found.</Empty>

  return (
    <div>
      <SectionTitle>
        {data.business_name} · Impact ({humanize(data.industry)})
      </SectionTitle>

      <Grid $min="180px" style={{ marginBottom: 24 }}>
        <StatCard value={formatDollars(data.impact_summary.total_contributed_dollars)} label="Total contributed" />
        <StatCard value={data.impact_summary.people_reached.toLocaleString()} label="People reached" />
        <StatCard value={data.impact_summary.prizes_fulfilled.toLocaleString()} label="Prizes fulfilled" />
        <StatCard value={data.impact_summary.profile_views.toLocaleString()} label="Profile views" />
      </Grid>

      <Grid $min="280px" style={{ marginBottom: 24 }}>
        <Card>
          <SectionTitle style={{ fontSize: '1.1rem' }}>Sponsorships</SectionTitle>
          <StatCard value={formatDollars(data.sponsorships.gross_dollars)} label={`${data.sponsorships.count} sponsorships`} />
          <Muted style={{ marginTop: 8 }}>
            {formatDollars(data.sponsorships.net_to_causes_dollars)} reached causes
          </Muted>
        </Card>
        <Card>
          <SectionTitle style={{ fontSize: '1.1rem' }}>Giveaways</SectionTitle>
          <StatCard value={data.giveaways.count.toLocaleString()} label={`${data.giveaways.total_entries} entries · ${data.giveaways.winners} winners`} />
          <Muted style={{ marginTop: 8 }}>
            {formatDollars(data.giveaways.prize_value_dollars)} in prize value
          </Muted>
        </Card>
      </Grid>

      <Card>
        <SectionTitle style={{ fontSize: '1.1rem' }}>Contribution timeline</SectionTitle>
        <BarList
          items={data.contribution_timeline.map((t) => ({
            label: t.month,
            value: t.gross_dollars,
            display: formatDollars(t.gross_dollars),
          }))}
          emptyText="No sponsorship activity yet."
        />
      </Card>

      <Muted style={{ marginTop: 16 }}>Generated {new Date(data.generated_at).toLocaleString()}</Muted>
    </div>
  )
}
