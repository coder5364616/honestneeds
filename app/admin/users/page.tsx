'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  useAdminUsers,
  useUserAction,
  useAdminReports,
  useReportAction,
} from '@/api/hooks/useAdmin'
import type { AdminUser, UserReport } from '@/api/services/adminService'
import { PageHeader, Loading, ErrorBlock, Empty, Badge, Pagination, ReasonModal, adminStyles as s } from '../_components/ui'
import { fmtDate } from '../_lib/format'

export default function UsersPage() {
  return (
    <Suspense fallback={<Loading />}>
      <UsersInner />
    </Suspense>
  )
}

function UsersInner() {
  const initialTab = useSearchParams().get('tab') === 'reports' ? 'reports' : 'users'
  const [tab, setTab] = useState<'users' | 'reports'>(initialTab)

  return (
    <div className={s.page}>
      <PageHeader title="User Management" subtitle="Search, verify, block and manage user accounts" />
      <div className={s.tabs}>
        <button className={`${s.tab} ${tab === 'users' ? s.active : ''}`} onClick={() => setTab('users')}>Users</button>
        <button className={`${s.tab} ${tab === 'reports' ? s.active : ''}`} onClick={() => setTab('reports')}>Abuse Reports</button>
      </div>
      {tab === 'users' ? <UsersTab /> : <ReportsTab />}
    </div>
  )
}

function UsersTab() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [block, setBlock] = useState<string | null>(null)

  const { data, isLoading, isError } = useAdminUsers({ search, role, status, page, limit: 20 })
  const actions = useUserAction()

  return (
    <>
      <div className={s.toolbar}>
        <input className={s.input} placeholder="Search name, email or username…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
        <select className={s.select} value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }}>
          <option value="">All roles</option><option value="user">User</option><option value="creator">Creator</option><option value="admin">Admin</option>
        </select>
        <select className={s.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option><option value="deleted">Deleted</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load users." />}

      {data && (data.users.length === 0 ? <Empty text="No users found." /> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr><th>User</th><th>Role</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.users.map((u: AdminUser) => (
                  <tr key={u._id}>
                    <td><strong>{u.display_name}</strong><div className={s.muted}>{u.email}</div></td>
                    <td><Badge status={u.role} /></td>
                    <td>{u.verified ? <Badge status="verified" /> : <Badge status="unverified" label="No" />}</td>
                    <td>{u.blocked ? <Badge status="blocked" /> : <Badge status="active" />}</td>
                    <td className={s.muted}>{fmtDate(u.created_at)}</td>
                    <td>
                      <div className={s.row}>
                        {!u.verified && <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => actions.verify.mutate({ id: u._id })}>Verify</button>}
                        {u.blocked
                          ? <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => actions.unblock.mutate(u._id)}>Unblock</button>
                          : u.role !== 'admin' && <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setBlock(u._id)}>Block</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
        </>
      ))}

      {block && (
        <ReasonModal
          title="Block user" label="Reason for blocking" danger confirmLabel="Block"
          onConfirm={(reason) => { actions.block.mutate({ id: block, reason }); setBlock(null) }}
          onClose={() => setBlock(null)}
        />
      )}
    </>
  )
}

function ReportsTab() {
  const [status, setStatus] = useState('open')
  const [page, setPage] = useState(1)
  const [resolve, setResolve] = useState<string | null>(null)

  const { data, isLoading, isError } = useAdminReports({ status, page, limit: 20 })
  const actions = useReportAction()

  return (
    <>
      <div className={s.toolbar}>
        <select className={s.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All</option><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load reports." />}

      {data && (data.reports.length === 0 ? <Empty text="No reports found." /> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr><th>Reported User</th><th>Reason</th><th>Severity</th><th>Status</th><th>Filed</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.reports.map((r: UserReport) => (
                  <tr key={r._id}>
                    <td><strong>{r.reported_user_id?.display_name || '—'}</strong><div className={s.muted}>{r.reported_user_id?.email}</div></td>
                    <td>{r.reason?.replace(/_/g, ' ')}<div className={s.muted}>{r.description?.slice(0, 60)}</div></td>
                    <td><Badge status={r.severity} /></td>
                    <td><Badge status={r.status} /></td>
                    <td className={s.muted}>{fmtDate(r.created_at)}</td>
                    <td>
                      {['open', 'investigating'].includes(r.status) && (
                        <div className={s.row}>
                          <button className={`${s.btn} ${s.btnSuccess} ${s.btnSm}`} onClick={() => setResolve(r._id)}>Resolve</button>
                          <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => actions.dismiss.mutate({ id: r._id, reason: 'No action needed' })}>Dismiss</button>
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
          title="Resolve report" label="Resolution notes" confirmLabel="Resolve"
          onConfirm={(resolution) => { actions.resolve.mutate({ id: resolve, resolution, actionTaken: 'other' }); setResolve(null) }}
          onClose={() => setResolve(null)}
        />
      )}
    </>
  )
}
