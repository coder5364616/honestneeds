'use client'

/**
 * BU-03 Analytics dashboard + BU-04 CSR impact report (with CSV download).
 */

import { useState } from 'react'
import { toast } from 'react-toastify'
import { Download, BarChart3 } from 'lucide-react'
import { Card, Grid, Row, Button, Input, Label, Muted, StatValue, StatLabel, SectionTitle, formatCents, humanize } from '@/features/business/ui'
import { useBusinessAnalytics, useCsrReport } from '@/api/hooks/useBusiness'
import { businessService } from '@/api/services/businessService'

export default function AnalyticsTab() {
  const { data: analytics, isLoading } = useBusinessAnalytics()
  const [range, setRange] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const csrOpts = { from: range.from || undefined, to: range.to || undefined }
  const { data: csr, isFetching: csrLoading } = useCsrReport(csrOpts)
  const [downloading, setDownloading] = useState(false)

  const downloadCsv = async () => {
    setDownloading(true)
    try {
      const blob = await businessService.downloadCsrCsv(csrOpts)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'csr-impact-report.csv'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download CSV')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <SectionTitle>
        <Row $gap={2}>
          <BarChart3 size={22} /> Analytics
        </Row>
      </SectionTitle>

      {isLoading && <Muted>Loading analytics…</Muted>}

      {analytics && (
        <>
          <Grid $min="180px" style={{ marginBottom: 24 }}>
            <Card>
              <StatValue>{formatCents(analytics.sponsorship.gross_cents)}</StatValue>
              <StatLabel>Sponsorship total ({analytics.sponsorship.count})</StatLabel>
            </Card>
            <Card>
              <StatValue>{analytics.volunteer.opportunities_posted}</StatValue>
              <StatLabel>Opportunities posted</StatLabel>
            </Card>
            <Card>
              <StatValue>{analytics.volunteer.applications_total}</StatValue>
              <StatLabel>Volunteer applications</StatLabel>
            </Card>
            <Card>
              <StatValue>{analytics.volunteer.total_hours_logged}</StatValue>
              <StatLabel>Volunteer hours logged</StatLabel>
            </Card>
            <Card>
              <StatValue>{analytics.giveaways.count}</StatValue>
              <StatLabel>Giveaways ({analytics.giveaways.total_entries} entries)</StatLabel>
            </Card>
            <Card>
              <StatValue>{analytics.profile_views}</StatValue>
              <StatLabel>Profile views</StatLabel>
            </Card>
          </Grid>

          {Object.keys(analytics.volunteer.applications_by_status).length > 0 && (
            <Card style={{ marginBottom: 24 }}>
              <Label>Applications by status</Label>
              <Row $gap={3} $wrap>
                {Object.entries(analytics.volunteer.applications_by_status).map(([k, v]) => (
                  <Muted key={k}>
                    {humanize(k)}: <strong>{v}</strong>
                  </Muted>
                ))}
              </Row>
            </Card>
          )}
        </>
      )}

      <SectionTitle style={{ marginTop: 32 }}>CSR Impact Report</SectionTitle>
      <Card>
        <Row $gap={4} $wrap style={{ marginBottom: 16, alignItems: 'flex-end' }}>
          <div>
            <Label>From</Label>
            <Input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
          </div>
          <div>
            <Label>To</Label>
            <Input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
          </div>
          <Button $variant="outline" onClick={downloadCsv} disabled={downloading}>
            <Download size={15} /> {downloading ? 'Preparing…' : 'Download CSV'}
          </Button>
        </Row>

        {csrLoading && <Muted>Generating report…</Muted>}

        {csr && (
          <Grid $min="200px">
            <div>
              <StatValue>{csr.summary.total_contribution_formatted}</StatValue>
              <StatLabel>Total contribution</StatLabel>
            </div>
            <div>
              <StatValue>{csr.summary.campaigns_sponsored}</StatValue>
              <StatLabel>Campaigns sponsored</StatLabel>
            </div>
            <div>
              <StatValue>{csr.summary.giveaways_donated}</StatValue>
              <StatLabel>Giveaways donated ({formatCents(csr.summary.giveaway_value_cents)})</StatLabel>
            </div>
            <div>
              <StatValue>{csr.summary.giveaway_entrants_reached}</StatValue>
              <StatLabel>Entrants reached</StatLabel>
            </div>
            <div>
              <StatValue>{csr.summary.volunteers_engaged}</StatValue>
              <StatLabel>Volunteers engaged</StatLabel>
            </div>
            <div>
              <StatValue>{csr.summary.volunteer_hours_enabled}</StatValue>
              <StatLabel>Volunteer hours enabled</StatLabel>
            </div>
          </Grid>
        )}
      </Card>
    </div>
  )
}
