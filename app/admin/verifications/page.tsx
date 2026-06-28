'use client'

import { useState } from 'react'
import { useVerifications, useVerificationDetail, useVerificationAction } from '@/api/hooks/useAdmin'
import type { VerificationSubmission } from '@/api/services/adminService'
import { PageHeader, Loading, ErrorBlock, Empty, Badge, Pagination, ReasonModal, adminStyles as s } from '../_components/ui'
import { fmtDate } from '../_lib/format'

const STATUSES = ['pending', 'needs_more_info', 'approved', 'rejected', 'all']

export default function VerificationsPage() {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)

  const { data, isLoading, isError } = useVerifications({ status, page, limit: 20 })

  return (
    <div className={s.page}>
      <PageHeader title="ID+ Verification Queue" subtitle="Review identity submissions (KYC)" />

      <div className={s.toolbar}>
        <select className={s.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); setSelected(null) }}>
          {STATUSES.map((st) => <option key={st} value={st}>{st === 'all' ? 'All' : st.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load verification queue." />}

      {data && (data.submissions.length === 0 ? <Empty text="No submissions in this queue." /> : (
        <div className={s.split}>
          <div>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead><tr><th>Applicant</th><th>Tier</th><th>Status</th><th>Submitted</th></tr></thead>
                <tbody>
                  {data.submissions.map((v: VerificationSubmission) => (
                    <tr key={v._id} onClick={() => setSelected(v._id)} style={{ cursor: 'pointer', background: selected === v._id ? '#E8F0FB' : undefined }}>
                      <td><strong>{v.user_id?.display_name || '—'}</strong><div className={s.muted}>{v.user_id?.email}</div></td>
                      <td><Badge status={v.tier} /></td>
                      <td><Badge status={v.status} /></td>
                      <td className={s.muted}>{fmtDate(v.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
          </div>

          <div>
            {selected ? <ReviewPanel id={selected} onDone={() => setSelected(null)} /> : (
              <div className={s.card}><p className={s.muted}>Select a submission to review documents.</p></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewPanel({ id, onDone }: { id: string; onDone: () => void }) {
  const { data: v, isLoading } = useVerificationDetail(id)
  const actions = useVerificationAction()
  const [reject, setReject] = useState(false)

  if (isLoading || !v) return <div className={s.card}><Loading /></div>

  const images: Array<{ label: string; url?: string }> = [
    { label: 'Document Front', url: v.document_front_url },
    { label: 'Document Back', url: v.document_back_url },
    { label: 'Selfie', url: v.selfie_url },
  ].filter((i) => i.url)

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>{v.user_id?.display_name}</h2>
      <div className={s.defRow}><span className={s.defKey}>Email</span><span className={s.defVal}>{v.user_id?.email}</span></div>
      <div className={s.defRow}><span className={s.defKey}>Tier</span><span className={s.defVal}><Badge status={v.tier} /></span></div>
      <div className={s.defRow}><span className={s.defKey}>Document</span><span className={s.defVal}>{v.document_type?.replace(/_/g, ' ')}</span></div>
      <div className={s.defRow}><span className={s.defKey}>Status</span><span className={s.defVal}><Badge status={v.status} /></span></div>
      <div className={s.defRow}><span className={s.defKey}>Trust score</span><span className={s.defVal}>{v.user_id?.trust_score ?? '—'}</span></div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <a key={img.label} href={img.url} target="_blank" rel="noreferrer">
            <img src={img.url} alt={img.label} style={{ width: '100%', borderRadius: 8, border: '1px solid #E2DDD6' }} />
            <div className={s.muted} style={{ textAlign: 'center', marginTop: 4 }}>{img.label}</div>
          </a>
        ))}
        {images.length === 0 && <p className={s.muted}>No document assets available.</p>}
      </div>

      {['pending', 'needs_more_info'].includes(v.status) && (
        <div className={s.row}>
          <button className={`${s.btn} ${s.btnSuccess}`} onClick={() => actions.approve.mutate({ id }, { onSuccess: onDone })}>Approve</button>
          <button className={`${s.btn} ${s.btnDanger}`} onClick={() => setReject(true)}>Reject</button>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={() => actions.requestInfo.mutate({ id, notes: 'Please resubmit clearer documents.' }, { onSuccess: onDone })}>Request info</button>
        </div>
      )}

      {reject && (
        <ReasonModal
          title="Reject verification" label="Rejection reason (required)" required danger confirmLabel="Reject"
          onConfirm={(reason) => { actions.reject.mutate({ id, reason }, { onSuccess: onDone }); setReject(false) }}
          onClose={() => setReject(false)}
        />
      )}
    </div>
  )
}
