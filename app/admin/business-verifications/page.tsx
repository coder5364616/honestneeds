'use client'

/**
 * Admin review queue for BU-05 business verification submissions.
 * Backend: GET /business/admin/verification/queue (pending only) and
 *          POST /business/admin/verification/:id/review.
 *
 * Mirrors the identity (/admin/verifications) layout: a list on the left, a
 * review panel with the submitted documents on the right.
 */

import { useState } from 'react'
import { useBusinessVerificationQueue, useReviewBusinessVerification } from '@/api/hooks/useBusiness'
import { humanize } from '@/features/business/ui'
import type { AdminBusinessVerification } from '@/types/business'
import { PageHeader, Loading, ErrorBlock, Empty, Badge, Pagination, ReasonModal, adminStyles as s } from '../_components/ui'
import { fmtDate } from '../_lib/format'

// The queue returns `business_id` / `user_id` either populated or as a raw id.
function business(v: AdminBusinessVerification) {
  return typeof v.business_id === 'object' ? v.business_id : null
}
function applicant(v: AdminBusinessVerification) {
  return typeof v.user_id === 'object' ? v.user_id : null
}

const STATUSES = ['pending', 'needs_more_info', 'approved', 'rejected', 'all']

export default function BusinessVerificationsPage() {
  const [status, setStatus] = useState('pending')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, isLoading, isError } = useBusinessVerificationQueue(page, 20, status)
  const selected = data?.submissions.find((v) => v._id === selectedId) ?? null

  return (
    <div className={s.page}>
      <PageHeader title="Business Verification Queue" subtitle="Review business documents (BU-05) — approve or reject" />

      <div className={s.toolbar}>
        <select
          className={s.select}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); setSelectedId(null) }}
        >
          {STATUSES.map((st) => <option key={st} value={st}>{st === 'all' ? 'All' : humanize(st)}</option>)}
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load the business verification queue." />}

      {data && (data.submissions.length === 0 ? (
        <Empty text={status === 'all' ? 'No business verifications yet.' : `No ${humanize(status).toLowerCase()} business verifications.`} />
      ) : (
        <div className={s.split}>
          <div>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr><th>Business</th><th>Applicant</th><th>Documents</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {data.submissions.map((v) => {
                    const biz = business(v)
                    const who = applicant(v)
                    return (
                      <tr
                        key={v._id}
                        onClick={() => setSelectedId(v._id)}
                        style={{ cursor: 'pointer', background: selectedId === v._id ? '#E8F0FB' : undefined }}
                      >
                        <td>
                          <strong>{biz?.business_name || v.legal_business_name}</strong>
                          {biz?.industry && <div className={s.muted}>{humanize(biz.industry)}</div>}
                        </td>
                        <td>
                          {who?.display_name || who?.username || '—'}
                          {who?.email && <div className={s.muted}>{who.email}</div>}
                        </td>
                        <td>{v.documents?.length ?? 0}</td>
                        <td className={s.muted}>{fmtDate(v.submitted_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={data.pagination.page} totalPages={data.pagination.totalPages} total={data.pagination.total} onChange={setPage} />
          </div>

          <div>
            {selected ? (
              <ReviewPanel submission={selected} onDone={() => setSelectedId(null)} />
            ) : (
              <div className={s.card}><p className={s.muted}>Select a submission to review its documents.</p></div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function ReviewPanel({ submission: v, onDone }: { submission: AdminBusinessVerification; onDone: () => void }) {
  const review = useReviewBusinessVerification()
  const [reject, setReject] = useState(false)
  const biz = business(v)
  const who = applicant(v)

  const act = (decision: 'approve' | 'needs_more_info', extra?: { notes?: string }) =>
    review.mutate({ submissionId: v._id, decision, ...extra }, { onSuccess: onDone })

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>{biz?.business_name || v.legal_business_name}</h2>

      <div className={s.defRow}><span className={s.defKey}>Legal name</span><span className={s.defVal}>{v.legal_business_name}</span></div>
      <div className={s.defRow}><span className={s.defKey}>Applicant</span><span className={s.defVal}>{who?.display_name || who?.username || '—'}</span></div>
      <div className={s.defRow}><span className={s.defKey}>Email</span><span className={s.defVal}>{who?.email || '—'}</span></div>
      <div className={s.defRow}><span className={s.defKey}>Registration #</span><span className={s.defVal}>{v.registration_number || '—'}</span></div>
      <div className={s.defRow}><span className={s.defKey}>Tax ID</span><span className={s.defVal}>{v.tax_id || '—'}</span></div>
      <div className={s.defRow}><span className={s.defKey}>Status</span><span className={s.defVal}><Badge status={v.status} /></span></div>
      <div className={s.defRow}><span className={s.defKey}>Submitted</span><span className={s.defVal}>{fmtDate(v.submitted_at)}</span></div>
      {v.reviewed_at && <div className={s.defRow}><span className={s.defKey}>Reviewed</span><span className={s.defVal}>{fmtDate(v.reviewed_at)}</span></div>}
      {v.rejection_reason && <div className={s.defRow}><span className={s.defKey}>Rejection reason</span><span className={s.defVal}>{v.rejection_reason}</span></div>}
      {v.review_notes && <div className={s.defRow}><span className={s.defKey}>Notes</span><span className={s.defVal}>{v.review_notes}</span></div>}

      <h3 className={s.sectionTitle} style={{ fontSize: '0.9rem', marginTop: 16 }}>Documents ({v.documents?.length ?? 0})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '8px 0 16px' }}>
        {(v.documents ?? []).map((d, i) =>
          d.url ? (
            <a key={i} href={d.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.url} alt={d.document_type} style={{ width: '100%', borderRadius: 8, border: '1px solid #E2DDD6' }} />
              <div className={s.muted} style={{ textAlign: 'center', marginTop: 4 }}>{humanize(d.document_type)}</div>
            </a>
          ) : (
            <div key={i} className={s.muted}>{humanize(d.document_type)} — no preview</div>
          )
        )}
        {(v.documents?.length ?? 0) === 0 && <p className={s.muted}>No documents attached.</p>}
      </div>

      {['pending', 'needs_more_info'].includes(v.status) && (
        <div className={s.row}>
          <button className={`${s.btn} ${s.btnSuccess}`} disabled={review.isPending} onClick={() => act('approve')}>Approve</button>
          <button className={`${s.btn} ${s.btnDanger}`} disabled={review.isPending} onClick={() => setReject(true)}>Reject</button>
          <button className={`${s.btn} ${s.btnGhost}`} disabled={review.isPending} onClick={() => act('needs_more_info', { notes: 'Please resubmit clearer documents.' })}>Request info</button>
        </div>
      )}

      {reject && (
        <ReasonModal
          title="Reject business verification" label="Rejection reason (required)" required danger confirmLabel="Reject"
          onConfirm={(reason) => {
            review.mutate({ submissionId: v._id, decision: 'reject', rejection_reason: reason }, { onSuccess: onDone })
            setReject(false)
          }}
          onClose={() => setReject(false)}
        />
      )}
    </div>
  )
}
