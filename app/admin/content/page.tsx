'use client'

import { useState } from 'react'
import { useFlaggedComments, useModerateComment } from '@/api/hooks/useAdmin'
import type { FlaggedComment } from '@/api/services/adminService'
import { PageHeader, Loading, ErrorBlock, Empty, Badge, Pagination, adminStyles as s } from '../_components/ui'
import { fmtNum, fmtDateTime } from '../_lib/format'

export default function ContentPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading, isError } = useFlaggedComments({ status, page, limit: 20 })
  const moderate = useModerateComment()

  return (
    <div className={s.page}>
      <PageHeader title="Content Moderation" subtitle="Review reported and flagged comments" />

      <div className={s.toolbar}>
        <select className={s.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">Reported &amp; flagged</option>
          <option value="flagged">Flagged</option>
          <option value="hidden">Hidden</option>
          <option value="visible">Visible</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load comments." />}

      {data && (data.comments.length === 0 ? <Empty text="No comments need moderation." /> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead><tr><th>Comment</th><th>Author</th><th>Campaign</th><th>Reports</th><th>Status</th><th>Posted</th><th>Actions</th></tr></thead>
              <tbody>
                {data.comments.map((c: FlaggedComment) => (
                  <tr key={c._id}>
                    <td style={{ maxWidth: 320 }}>{c.content}</td>
                    <td>{c.user_id?.display_name || '—'}<div className={s.muted}>{c.user_id?.email}</div></td>
                    <td className={s.muted}>{c.campaign_id?.title || '—'}</td>
                    <td>{fmtNum(c.report_count)}</td>
                    <td><Badge status={c.status} /></td>
                    <td className={s.muted}>{fmtDateTime(c.created_at)}</td>
                    <td>
                      <div className={s.row}>
                        {c.status !== 'hidden' && <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => moderate.mutate({ id: c._id, action: 'hide' })}>Hide</button>}
                        {c.status === 'hidden' && !c.is_deleted && <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={() => moderate.mutate({ id: c._id, action: 'unhide' })}>Unhide</button>}
                        <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => moderate.mutate({ id: c._id, action: 'remove', reason: 'Policy violation' })}>Remove</button>
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
    </div>
  )
}
