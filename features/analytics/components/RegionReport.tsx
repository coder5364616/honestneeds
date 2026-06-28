'use client'

/** AN-08 — City/Region impact report. */

import { useState } from 'react'
import { useRegionReport } from '@/api/hooks/useAdvancedAnalytics'
import type { RegionGroupBy } from '@/types/analytics'
import {
  SectionTitle,
  Card,
  Row,
  Select,
  Muted,
  Empty,
  Spinner,
  Badge,
  formatDollars,
} from '@/features/analytics/ui'

const GROUPS: RegionGroupBy[] = ['state', 'city', 'country']

export default function RegionReport() {
  const [groupBy, setGroupBy] = useState<RegionGroupBy>('state')
  const { data, isLoading, isError } = useRegionReport({ groupBy, limit: 50 })

  return (
    <Card>
      <Row $gap={4} $wrap style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <SectionTitle style={{ margin: 0, fontSize: '1.1rem' }}>Impact by region</SectionTitle>
        <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value as RegionGroupBy)}>
          {GROUPS.map((g) => (
            <option key={g} value={g}>
              By {g}
            </option>
          ))}
        </Select>
      </Row>

      {isLoading && <Spinner />}
      {isError && <Empty>Failed to load region report.</Empty>}

      {data && data.regions.length === 0 && <Muted>No regional data yet.</Muted>}

      {data && data.regions.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '8px 10px' }}>Region</th>
                <th style={{ padding: '8px 10px' }}>Raised</th>
                <th style={{ padding: '8px 10px' }}>Campaigns</th>
                <th style={{ padding: '8px 10px' }}>Donations</th>
                <th style={{ padding: '8px 10px' }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {data.regions.map((r) => (
                <tr key={r.region} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{r.region}</td>
                  <td style={{ padding: '8px 10px' }}>{formatDollars(r.raised_dollars)}</td>
                  <td style={{ padding: '8px 10px' }}>
                    {r.campaigns}{' '}
                    <Badge $tone="muted">{r.active_campaigns} active</Badge>
                  </td>
                  <td style={{ padding: '8px 10px' }}>{r.donations.toLocaleString()}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <Badge $tone={r.funding_progress >= 75 ? 'success' : r.funding_progress >= 30 ? 'info' : 'warning'}>
                      {r.funding_progress}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
