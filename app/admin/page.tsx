'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAdminDashboard } from '@/api/hooks/useAdmin'
import { PageHeader, Stat, Loading, ErrorBlock, Badge, adminStyles as s } from './_components/ui'
import { fmtNum, fmtDollars, fmtDateTime } from './_lib/format'

const WINDOWS = [7, 30, 90]

export default function AdminDashboardPage() {
  const [windowDays, setWindowDays] = useState(30)
  const { data, isLoading, isError } = useAdminDashboard(windowDays)

  return (
    <div className={s.page}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform health at a glance"
        actions={
          <select className={s.select} value={windowDays} onChange={(e) => setWindowDays(Number(e.target.value))}>
            {WINDOWS.map((w) => (
              <option key={w} value={w}>Last {w} days</option>
            ))}
          </select>
        }
      />

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load dashboard." />}

      {data && (
        <>
          {/* Headline finance + users */}
          <div className={s.statGrid}>
            <Stat
              accent
              label="Gross Volume (all time)"
              value={fmtDollars(data.finance.all_time.gross_dollars)}
              sub={`${fmtNum(data.finance.all_time.transaction_count)} transactions`}
            />
            <Stat
              label="Platform Fees (all time)"
              value={fmtDollars(data.finance.all_time.platform_fees_dollars)}
              sub={`${fmtDollars(data.finance.window.platform_fees_dollars)} in window`}
            />
            <Stat label="Total Users" value={fmtNum(data.users.total)} sub={`+${fmtNum(data.users.new_in_window)} new · ${fmtNum(data.users.active_30d)} active`} />
            <Stat label="Campaigns" value={fmtNum(data.campaigns.total)} sub={`+${fmtNum(data.campaigns.new_in_window)} new`} />
          </div>

          {/* Queues needing attention */}
          <div className={s.card}>
            <h2 className={s.sectionTitle}>Needs Attention</h2>
            <div className={s.statGrid}>
              <QueueStat label="Pending Moderation" value={data.campaigns.pending_moderation} href="/admin/moderation" />
              <QueueStat label="Flagged Campaigns" value={data.campaigns.flagged} href="/admin/moderation?status=flagged" />
              <QueueStat label="Open Reports" value={data.queues.open_reports} href="/admin/users?tab=reports" />
              <QueueStat label="Pending Verifications" value={data.queues.pending_verifications} href="/admin/verifications" />
              <QueueStat label="Critical Alerts" value={data.queues.critical_alerts} href="/admin/fraud" />
              <QueueStat label="Transactions On Hold" value={data.queues.transactions_on_hold} href="/admin/finance?status=pending_hold" />
            </div>
          </div>

          {/* Campaign status breakdown + blocked users */}
          <div className={s.split}>
            <div className={s.card}>
              <h2 className={s.sectionTitle}>Campaigns by Status</h2>
              {Object.entries(data.campaigns.by_status).map(([status, count]) => (
                <div key={status} className={s.defRow}>
                  <span className={s.defKey}><Badge status={status} /></span>
                  <span className={s.defVal}>{fmtNum(count as number)}</span>
                </div>
              ))}
            </div>
            <div className={s.card}>
              <h2 className={s.sectionTitle}>User Composition</h2>
              <div className={s.defRow}><span className={s.defKey}>Creators</span><span className={s.defVal}>{fmtNum(data.users.creators)}</span></div>
              <div className={s.defRow}><span className={s.defKey}>Admins</span><span className={s.defVal}>{fmtNum(data.users.admins)}</span></div>
              <div className={s.defRow}><span className={s.defKey}>Blocked</span><span className={s.defVal}>{fmtNum(data.users.blocked)}</span></div>
              <div className={s.defRow}><span className={s.defKey}>Active (30d)</span><span className={s.defVal}>{fmtNum(data.users.active_30d)}</span></div>
            </div>
          </div>

          {/* Recent activity */}
          <div className={s.card}>
            <h2 className={s.sectionTitle}>Recent Admin Activity</h2>
            {data.recent_activity.length === 0 ? (
              <p className={s.muted}>No recent activity.</p>
            ) : (
              <div className={s.tableWrap}>
                <table className={s.table}>
                  <thead>
                    <tr><th>When</th><th>Admin</th><th>Action</th><th>Description</th></tr>
                  </thead>
                  <tbody>
                    {data.recent_activity.map((a) => (
                      <tr key={a._id}>
                        <td className={s.muted}>{fmtDateTime(a.created_at)}</td>
                        <td>{a.admin_id?.display_name || '—'}</td>
                        <td><span className={s.mono}>{a.action_type}</span></td>
                        <td>{a.description || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function QueueStat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className={s.statCard} style={{ cursor: 'pointer' }}>
        <p className={s.statLabel}>{label}</p>
        <p className={s.statValue} style={{ color: value > 0 ? '#C0392B' : '#18171A' }}>{fmtNum(value)}</p>
        <p className={s.statSub}>Review →</p>
      </div>
    </Link>
  )
}
