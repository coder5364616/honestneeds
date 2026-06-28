'use client'

/** AN-04 — Personal donor analytics (giving history, impact, tax summary). */

import { useState } from 'react'
import { useDonorAnalytics } from '@/api/hooks/useAdvancedAnalytics'
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
  formatDate,
} from '@/features/analytics/ui'

const PERIODS: AnalyticsPeriod[] = ['month', 'quarter', 'year', 'all']

export default function DonorAnalytics({ userId }: { userId?: string }) {
  const [period, setPeriod] = useState<AnalyticsPeriod>('all')
  const { data, isLoading, isError } = useDonorAnalytics(period, userId)

  return (
    <div>
      <Row $gap={4} $wrap style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <SectionTitle style={{ margin: 0 }}>My Giving</SectionTitle>
        <Select value={period} onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}>
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p === 'all' ? 'All time' : `Last ${p}`}
            </option>
          ))}
        </Select>
      </Row>

      {isLoading && <Spinner />}
      {isError && <Empty>Failed to load your giving analytics.</Empty>}

      {data && (
        <>
          <Grid $min="180px" style={{ marginBottom: 24 }}>
            <StatCard value={formatDollars(data.summary.total_donated_dollars)} label="Total donated" />
            <StatCard value={data.summary.total_donations.toLocaleString()} label="Donations made" />
            <StatCard value={data.summary.campaigns_supported.toLocaleString()} label="Campaigns supported" />
            <StatCard value={formatDollars(data.summary.average_donation_dollars)} label="Average gift" />
            <StatCard value={formatDollars(data.summary.largest_donation_dollars)} label="Largest gift" />
            <StatCard
              value={formatDate(data.summary.first_donation_at)}
              label="First donation"
              hint={`Last: ${formatDate(data.summary.last_donation_at)}`}
            />
          </Grid>

          <Grid $min="320px" style={{ marginBottom: 24 }}>
            <Card>
              <SectionTitle style={{ fontSize: '1.1rem' }}>Causes you support</SectionTitle>
              <BarList
                items={data.by_category.map((c) => ({
                  label: c.category,
                  value: c.total_dollars,
                  display: formatDollars(c.total_dollars),
                }))}
                emptyText="No donations yet."
              />
            </Card>
            <Card>
              <SectionTitle style={{ fontSize: '1.1rem' }}>Tax-year summary</SectionTitle>
              <BarList
                items={data.tax_year_summary.map((y) => ({
                  label: String(y.year),
                  value: y.total_dollars,
                  display: `${formatDollars(y.total_dollars)} (${y.donations})`,
                }))}
                emptyText="No donations yet."
              />
            </Card>
          </Grid>

          <Card>
            <SectionTitle style={{ fontSize: '1.1rem' }}>Recent donations</SectionTitle>
            {data.recent_donations.length === 0 ? (
              <Muted>No donations yet.</Muted>
            ) : (
              data.recent_donations.map((d, i) => (
                <Row key={i} $gap={3} style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.campaign_title}
                  </span>
                  <Row $gap={3}>
                    <Muted>{formatDate(d.date)}</Muted>
                    <strong>{formatDollars(d.amount_dollars)}</strong>
                  </Row>
                </Row>
              ))
            )}
          </Card>
        </>
      )}
    </div>
  )
}
