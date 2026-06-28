'use client'

import { useState } from 'react'
import { useAuditLog } from '@/api/hooks/useAdmin'
import type { AuditLogEntry } from '@/api/services/adminService'
import { PageHeader, Loading, ErrorBlock, Empty, Badge, Pagination, adminStyles as s } from '../_components/ui'
import { fmtDateTime } from '../_lib/format'

export default function AuditPage() {
  const [action, setAction] = useState('')
  const [entityType, setEntityType] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useAuditLog({ action, entityType, status, page, limit: 50 })

  return (
    <div className={s.page}>
      <PageHeader title="Audit Log" subtitle="Immutable trail of every admin action" />

      <div className={s.toolbar}>
        <input className={s.input} placeholder="Filter by action (e.g. user.blocked)" value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }} />
        <select className={s.select} value={entityType} onChange={(e) => { setEntityType(e.target.value); setPage(1) }}>
          <option value="">All entities</option>
          <option value="User">User</option><option value="Campaign">Campaign</option><option value="Transaction">Transaction</option>
          <option value="UserReport">Report</option><option value="IdentityVerification">Verification</option><option value="Settings">Settings</option>
        </select>
        <select className={s.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All outcomes</option><option value="success">Success</option><option value="failed">Failed</option><option value="rolled_back">Rolled back</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load audit log." />}

      {data && (data.logs.length === 0 ? <Empty text="No audit entries match." /> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>When</th><th>Admin</th><th>Action</th><th>Entity</th><th>Description</th><th>Outcome</th><th>IP</th></tr></thead>
              <tbody>
                {data.logs.map((l: AuditLogEntry) => (
                  <tr key={l._id}>
                    <td className={s.muted}>{fmtDateTime(l.created_at)}</td>
                    <td>{l.admin_id?.display_name || '—'}<div className={s.muted}>{l.admin_id?.email}</div></td>
                    <td><span className={s.mono}>{l.action_type}</span></td>
                    <td className={s.muted}>{l.entity_type || '—'}</td>
                    <td>{l.description || '—'}</td>
                    <td><Badge status={l.status} /></td>
                    <td className={s.muted}>{l.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
        </>
      ))}
    </div>
  )
}
