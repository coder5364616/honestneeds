'use client'

import { useState } from 'react'
import { useFraudDashboard, useFraudAlerts, useFraudAction } from '@/api/hooks/useAdmin'
import type { FraudAlert, FraudAssessment } from '@/api/services/adminService'
import { PageHeader, Stat, Loading, ErrorBlock, Empty, Badge, Pagination, ReasonModal, adminStyles as s } from '../_components/ui'
import { fmtNum, fmtDateTime } from '../_lib/format'

export default function FraudPage() {
  return (
    <div className={s.page}>
      <PageHeader title="Fraud Detection" subtitle="Alerts and AI risk assessments across the platform" />
      <Summary />
      <Alerts />
      <TopRisks />
    </div>
  )
}

function Summary() {
  const { data, isLoading, isError } = useFraudDashboard()
  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBlock message="Failed to load fraud dashboard." />
  const sev = data.alerts.by_severity
  return (
    <div className={s.statGrid}>
      <Stat accent label="Critical Alerts" value={fmtNum(sev.critical)} />
      <Stat label="High Alerts" value={fmtNum(sev.high)} />
      <Stat label="Medium Alerts" value={fmtNum(sev.medium)} />
      <Stat label="Open" value={fmtNum(data.alerts.by_status.open)} sub={`${fmtNum(data.alerts.by_status.investigating)} investigating`} />
    </div>
  )
}

function Alerts() {
  const [status, setStatus] = useState('open')
  const [severity, setSeverity] = useState('')
  const [page, setPage] = useState(1)
  const [resolve, setResolve] = useState<string | null>(null)
  const { data, isLoading, isError } = useFraudAlerts({ status, severity, page, limit: 20 })
  const actions = useFraudAction()

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>Alerts</h2>
      <div className={s.toolbar}>
        <select className={s.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All</option><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option><option value="escalated">Escalated</option>
        </select>
        <select className={s.select} value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1) }}>
          <option value="">All severities</option><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load alerts." />}

      {data && (data.alerts.length === 0 ? <Empty text="No alerts match." /> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Alert</th><th>Type</th><th>Severity</th><th>Status</th><th>Raised</th><th>Actions</th></tr></thead>
              <tbody>
                {data.alerts.map((a: FraudAlert) => (
                  <tr key={a._id}>
                    <td><strong>{a.title}</strong><div className={s.muted}>{a.description?.slice(0, 70)}</div></td>
                    <td className={s.muted}>{a.alert_type?.replace(/_/g, ' ')}</td>
                    <td><Badge status={a.severity} /></td>
                    <td><Badge status={a.status} /></td>
                    <td className={s.muted}>{fmtDateTime(a.created_at)}</td>
                    <td>
                      {!['resolved', 'dismissed'].includes(a.status) && (
                        <div className={s.row}>
                          <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => actions.actOnAlert.mutate({ id: a._id, action: 'assign' })}>Assign</button>
                          <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => setResolve(a._id)}>Resolve</button>
                          <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => actions.actOnAlert.mutate({ id: a._id, action: 'dismiss', notes: 'False positive' })}>Dismiss</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
        </>
      ))}

      {resolve && (
        <ReasonModal
          title="Resolve alert" label="Resolution notes" confirmLabel="Resolve"
          onConfirm={(notes) => { actions.actOnAlert.mutate({ id: resolve, action: 'resolve', notes }); setResolve(null) }}
          onClose={() => setResolve(null)}
        />
      )}
    </div>
  )
}

function TopRisks() {
  const { data } = useFraudDashboard()
  const actions = useFraudAction()
  const risks = data?.ai_assessments.top_risks || []
  if (risks.length === 0) return null
  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>Top AI Risk Assessments</h2>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead><tr><th>Subject</th><th>Risk</th><th>Score</th><th>Recommended</th><th>Actions</th></tr></thead>
          <tbody>
            {risks.map((r: FraudAssessment) => (
              <tr key={r._id}>
                <td>{r.subject_type} · <span className={s.mono}>{String(r.subject_id).slice(0, 10)}</span></td>
                <td><Badge status={r.risk_level} /></td>
                <td><strong>{r.risk_score}</strong></td>
                <td className={s.muted}>{r.recommended_action}</td>
                <td>
                  <div className={s.row}>
                    <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => actions.reviewAssessment.mutate({ id: r._id, decision: 'clear' })}>Clear</button>
                    <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => actions.reviewAssessment.mutate({ id: r._id, decision: 'confirm' })}>Confirm fraud</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
