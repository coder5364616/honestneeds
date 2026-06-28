'use client'

import { useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { usePeriodReport, useReconciliation } from '@/api/hooks/useAdmin'
import { adminService } from '@/api/services/adminService'
import { toast } from 'react-toastify'
import { PageHeader, Stat, Loading, ErrorBlock, Empty, Badge, adminStyles as s } from '../_components/ui'
import { fmtDollars, fmtNum, fmtMoney } from '../_lib/format'

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString().slice(0, 10)
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState(isoDaysAgo(30))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [groupBy, setGroupBy] = useState('day')
  const [downloading, setDownloading] = useState(false)

  const params = { startDate, endDate, groupBy }
  const { data, isLoading, isError } = usePeriodReport(params)

  const download = async () => {
    setDownloading(true)
    try {
      const blob = await adminService.downloadReportCsv(params)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-report-${startDate}-to-${endDate}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download CSV')
    } finally {
      setDownloading(false)
    }
  }

  const chartData = (data?.periods || []).map((p) => ({
    period: p.period,
    Gross: p.gross_dollars,
    Fees: p.platform_fees_dollars,
  }))

  return (
    <div className={s.page}>
      <PageHeader
        title="Financial Reports &amp; Reconciliation"
        subtitle="Period revenue reporting and fee ledger reconciliation"
        actions={
          <button className={`${s.btn} ${s.btnPrimary}`} disabled={downloading} onClick={download}>
            {downloading ? 'Preparing…' : 'Export CSV'}
          </button>
        }
      />

      <div className={s.toolbar}>
        <input className={s.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ minWidth: 0 }} />
        <input className={s.input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ minWidth: 0 }} />
        <select className={s.select} value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
          <option value="day">Daily</option><option value="month">Monthly</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load report." />}

      {data && (
        <>
          <div className={s.statGrid}>
            <Stat accent label="Gross Revenue" value={fmtDollars(data.totals.gross_dollars)} sub={`${fmtNum(data.totals.count)} transactions`} />
            <Stat label="Platform Fees" value={fmtDollars(data.totals.platform_fees_dollars)} />
            <Stat label="Net to Creators" value={fmtDollars(data.totals.net_dollars)} />
          </div>

          {chartData.length > 0 && (
            <div className={s.card}>
              <h2 className={s.sectionTitle}>Revenue vs Fees</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="Gross" fill="#1A5FA8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Fees" fill="#F5C961" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className={s.card}>
            <h2 className={s.sectionTitle}>Period Breakdown</h2>
            {data.periods.length === 0 ? <Empty text="No data for this range." /> : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead><tr><th>Period</th><th>Gross</th><th>Fees</th><th>Net</th><th>Transactions</th></tr></thead>
                  <tbody>
                    {data.periods.map((p) => (
                      <tr key={p.period}>
                        <td>{p.period}</td>
                        <td><strong>{fmtDollars(p.gross_dollars)}</strong></td>
                        <td className={s.muted}>{fmtDollars(p.platform_fees_dollars)}</td>
                        <td>{fmtDollars(p.net_dollars)}</td>
                        <td>{fmtNum(p.transaction_count)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <Reconcile startDate={startDate} endDate={endDate} />
    </div>
  )
}

function Reconcile({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { data, isLoading, isError } = useReconciliation({ startDate, endDate })

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>Fee Reconciliation</h2>
      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to run reconciliation." />}
      {data && (
        <>
          <div className={s.row} style={{ marginBottom: 14 }}>
            {data.balanced
              ? <Badge status="success" label="Balanced" />
              : <Badge status="critical" label={`Discrepancy ${fmtDollars(Math.abs(data.difference_dollars))}`} />}
          </div>
          <div className={s.defRow}><span className={s.defKey}>Transaction-derived fees</span><span className={s.defVal}>{fmtMoney(data.transaction_fees_cents)}</span></div>
          <div className={s.defRow}><span className={s.defKey}>Fee ledger total</span><span className={s.defVal}>{fmtMoney(data.ledger_fees_cents)}</span></div>
          <div className={s.defRow}><span className={s.defKey}>Difference</span><span className={s.defVal}>{fmtMoney(data.difference_cents)}</span></div>
          <div className={s.defRow}><span className={s.defKey}>Transactions missing ledger entry</span><span className={s.defVal}>{fmtNum(data.discrepancies.transactions_missing_ledger)}</span></div>
          <div className={s.defRow}><span className={s.defKey}>Orphaned ledger entries</span><span className={s.defVal}>{fmtNum(data.discrepancies.ledger_orphans)}</span></div>
        </>
      )}
    </div>
  )
}
