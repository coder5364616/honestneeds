'use client'

import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useAdminAnalytics, useAdminTimeseries, useAnalyticsRegions } from '@/api/hooks/useAdmin'
import { PageHeader, Stat, Loading, ErrorBlock, Empty, adminStyles as s } from '../_components/ui'
import { fmtDollars, fmtNum } from '../_lib/format'

const PERIODS = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 90 days' },
  { value: 'year', label: 'Last 12 months' },
  { value: 'all', label: 'All time' },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month')
  const { data, isLoading, isError } = useAdminAnalytics(period)
  const { data: ts } = useAdminTimeseries(30)

  const categoryChart = (data?.top_categories || []).map((c) => ({
    category: c.category,
    Raised: c.raised_dollars,
  }))

  const trendChart = (ts?.donations || []).map((d) => ({
    date: d._id,
    Gross: d.gross_cents / 100,
  }))

  return (
    <div className={s.page}>
      <PageHeader
        title="Platform Analytics"
        subtitle="User growth, donation volume, revenue and category/geographic breakdowns"
        actions={
          <select className={s.select} value={period} onChange={(e) => setPeriod(e.target.value)}>
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        }
      />

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load platform analytics." />}

      {data && (
        <>
          <div className={s.statGrid}>
            <Stat
              accent
              label="Gross Donations"
              value={fmtDollars(data.donations.gross_dollars)}
              sub={`${fmtNum(data.donations.count)} donations · avg ${fmtDollars(data.donations.average_donation_dollars)}`}
            />
            <Stat
              label="Platform Revenue"
              value={fmtDollars(data.revenue.total_platform_revenue_dollars)}
              sub={`${fmtDollars(data.revenue.donation_fees_dollars)} donation fees · ${fmtDollars(data.revenue.sponsorship_fees_dollars)} sponsorship fees`}
            />
            <Stat
              label="Active Donors"
              value={fmtNum(data.users.active_donors_this_period)}
              sub={`+${fmtNum(data.users.new_this_period)} new users · ${fmtNum(data.users.total)} total`}
            />
            <Stat
              label="Campaigns"
              value={fmtNum(data.campaigns.total)}
              sub={`${fmtNum(data.campaigns.active)} active · ${data.campaigns.completion_rate}% completed`}
            />
          </div>

          <div className={s.split}>
            <div className={s.card}>
              <h2 className={s.sectionTitle}>Sponsorships & Businesses</h2>
              <div className={s.defRow}><span className={s.defKey}>Active sponsorships</span><span className={s.defVal}>{fmtNum(data.sponsorships.active)}</span></div>
              <div className={s.defRow}><span className={s.defKey}>Sponsorship gross</span><span className={s.defVal}>{fmtDollars(data.sponsorships.gross_dollars)}</span></div>
              <div className={s.defRow}><span className={s.defKey}>Partner businesses</span><span className={s.defVal}>{fmtNum(data.businesses.total)}</span></div>
              <div className={s.defRow}><span className={s.defKey}>New campaigns this period</span><span className={s.defVal}>{fmtNum(data.campaigns.new_this_period)}</span></div>
            </div>
            <div className={s.card}>
              <h2 className={s.sectionTitle}>Donation Volume (last 30 days)</h2>
              {trendChart.length === 0 ? <Empty text="No donations in this window." /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={trendChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="Gross" fill="#1A5FA8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className={s.card}>
            <h2 className={s.sectionTitle}>Top Categories by Amount Raised</h2>
            {categoryChart.length === 0 ? <Empty text="No campaign category data yet." /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryChart} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 12 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="Raised" fill="#D4870A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={s.card}>
            <h2 className={s.sectionTitle}>Geographic Distribution</h2>
            {data.geographic_distribution.length === 0 ? <Empty text="No geographic data yet." /> : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Country</th><th>State</th><th>Campaigns</th><th>Raised</th></tr></thead>
                  <tbody>
                    {data.geographic_distribution.map((g, i) => (
                      <tr key={`${g.country}-${g.state}-${i}`}>
                        <td>{g.country}</td>
                        <td>{g.state}</td>
                        <td>{fmtNum(g.campaigns)}</td>
                        <td><strong>{fmtDollars(g.raised_dollars)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <RegionDrilldown />
    </div>
  )
}

function RegionDrilldown() {
  const [groupBy, setGroupBy] = useState('state')
  const { data, isLoading, isError } = useAnalyticsRegions({ groupBy, limit: 20 })

  return (
    <div className={s.card}>
      <div className={s.row} style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className={s.sectionTitle}>Regional Impact</h2>
        <select className={s.select} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="country">By Country</option>
          <option value="state">By State</option>
          <option value="city">By City</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load regional impact." />}

      {data && (
        data.regions.length === 0 ? <Empty text="No regional data yet." /> : (
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr><th>Region</th><th>Campaigns</th><th>Active</th><th>Completed</th><th>Donations</th><th>Raised</th><th>Goal Progress</th></tr>
              </thead>
              <tbody>
                {data.regions.map((r) => (
                  <tr key={r.region}>
                    <td>{r.region}</td>
                    <td>{fmtNum(r.campaigns)}</td>
                    <td>{fmtNum(r.active_campaigns)}</td>
                    <td>{fmtNum(r.completed_campaigns)}</td>
                    <td>{fmtNum(r.donations)}</td>
                    <td><strong>{fmtDollars(r.raised_dollars)}</strong></td>
                    <td>{r.funding_progress}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  )
}
