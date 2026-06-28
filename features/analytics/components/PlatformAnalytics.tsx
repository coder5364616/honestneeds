'use client'

/** AN-02 — Platform Analytics (admin) dashboard. */

import { useState } from 'react'
import { usePlatformAnalytics } from '@/api/hooks/useAdvancedAnalytics'
import type { AnalyticsPeriod } from '@/types/analytics'
import {
  SectionTitle,
  Card,
  Grid,
  Row,
  Select,
  Muted,
  Empty,
  StatCard,
  BarList,
  Spinner,
  formatDollars,
} from '@/features/analytics/ui'

const PERIODS: AnalyticsPeriod[] = ['week', 'month', 'quarter', 'year', 'all']

export default function PlatformAnalytics() {
  const [period, setPeriod] = useState<AnalyticsPeriod>('month')
  const { data, isLoading, isError } = usePlatformAnalytics(period)

  return (
    <div>
      <Row $gap={4} $wrap style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0 }}>Platform Analytics</SectionTitle>
        <Select value={period} onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}>
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p === 'all' ? 'All time' : `Last ${p}`}
            </option>
          ))}
        </Select>
      </Row>

      {isLoading && <Spinner />}
      {isError && <Empty>Failed to load platform analytics.</Empty>}

      {data && (
        <>
          <Grid $min="180px" style={{ marginBottom: 24 }}>
            <StatCard
              value={formatDollars(data.donations.gross_dollars)}
              label="Donations raised"
              hint={`${data.donations.count.toLocaleString()} donations`}
            />
            <StatCard
              value={formatDollars(data.revenue.total_platform_revenue_dollars)}
              label="Platform revenue"
              hint={`Fees: ${formatDollars(data.revenue.donation_fees_dollars)} donations`}
            />
            <StatCard value={data.users.total.toLocaleString()} label="Total users" hint={`+${data.users.new_this_period} new`} />
            <StatCard
              value={data.campaigns.active.toLocaleString()}
              label="Active campaigns"
              hint={`${data.campaigns.total} total · ${data.campaigns.completion_rate}% completed`}
            />
            <StatCard
              value={data.users.active_donors_this_period.toLocaleString()}
              label="Active donors"
              hint="this period"
            />
            <StatCard
              value={formatDollars(data.sponsorships.gross_dollars)}
              label="Sponsorships"
              hint={`${data.sponsorships.active} active · ${data.businesses.total} businesses`}
            />
          </Grid>

          <Grid $min="320px">
            <Card>
              <SectionTitle style={{ fontSize: '1.1rem' }}>Top categories by raised</SectionTitle>
              <BarList
                items={data.top_categories.map((c) => ({
                  label: c.category,
                  value: c.raised_dollars,
                  display: formatDollars(c.raised_dollars),
                }))}
              />
            </Card>
            <Card>
              <SectionTitle style={{ fontSize: '1.1rem' }}>Geographic distribution</SectionTitle>
              <BarList
                items={data.geographic_distribution.slice(0, 10).map((g) => ({
                  label: `${g.state}, ${g.country}`,
                  value: g.raised_dollars,
                  display: formatDollars(g.raised_dollars),
                }))}
              />
            </Card>
          </Grid>

          <Muted style={{ marginTop: 16 }}>
            Generated {new Date(data.generated_at).toLocaleString()}
          </Muted>
        </>
      )}
    </div>
  )
}
