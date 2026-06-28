'use client'

/** AN-07 — Public platform impact dashboard (headline numbers + top causes). */

import { usePublicImpact } from '@/api/hooks/useAdvancedAnalytics'
import {
  SectionTitle,
  Card,
  Grid,
  Empty,
  StatCard,
  BarList,
  Spinner,
  formatDollars,
  formatCompact,
} from '@/features/analytics/ui'

export default function PublicImpact() {
  const { data, isLoading, isError } = usePublicImpact()

  if (isLoading) return <Spinner />
  if (isError) return <Empty>Impact numbers are unavailable right now.</Empty>
  if (!data) return null

  return (
    <div>
      <Grid $min="180px" style={{ marginBottom: 24 }}>
        <StatCard value={formatDollars(data.total_raised_dollars)} label="Total raised" />
        <StatCard value={formatCompact(data.total_donors)} label="Generous donors" />
        <StatCard value={formatCompact(data.total_donations)} label="Donations made" />
        <StatCard value={formatCompact(data.campaigns_funded)} label="Campaigns funded" />
        <StatCard value={formatCompact(data.active_campaigns)} label="Active campaigns" />
        <StatCard value={formatCompact(data.partner_businesses)} label="Partner businesses" />
        <StatCard value={formatCompact(data.volunteer_hours_logged)} label="Volunteer hours" />
      </Grid>

      <Card>
        <SectionTitle style={{ fontSize: '1.1rem' }}>Top causes</SectionTitle>
        <BarList
          items={data.top_causes.map((c) => ({
            label: c.category,
            value: c.raised_dollars,
            display: formatDollars(c.raised_dollars),
          }))}
        />
      </Card>
    </div>
  )
}
