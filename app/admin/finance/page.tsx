'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFinanceOverview, useAdminTransactions, useRefundTransaction } from '@/api/hooks/useAdmin'
import type { AdminTransaction, StatusBucket } from '@/api/services/adminService'
import { PageHeader, Stat, Loading, ErrorBlock, Empty, Badge, Pagination, ReasonModal, adminStyles as s } from '../_components/ui'
import { fmtMoney, fmtDollars, fmtNum, fmtDate } from '../_lib/format'

export default function FinancePage() {
  return (
    <Suspense fallback={<Loading />}>
      <FinanceInner />
    </Suspense>
  )
}

function FinanceInner() {
  const initialStatus = useSearchParams().get('status') || ''
  return (
    <div className={s.page}>
      <PageHeader title="Financial Oversight" subtitle="Live view of volume, fees, refunds and payouts" />
      <Overview />
      <Transactions initialStatus={initialStatus} />
    </div>
  )
}

function Overview() {
  const { data, isLoading, isError } = useFinanceOverview({})
  if (isLoading) return <Loading />
  if (isError || !data) return <ErrorBlock message="Failed to load financial overview." />

  return (
    <>
      <div className={s.statGrid}>
        <Stat accent label="Gross Volume" value={fmtDollars(data.volume.gross_dollars)} sub={`${fmtNum(data.volume.transaction_count)} transactions`} />
        <Stat label="Platform Fees" value={fmtDollars(data.volume.platform_fees_dollars)} />
        <Stat label="Net to Creators" value={fmtDollars(data.volume.net_to_creators_dollars)} />
        <Stat label="Refunds" value={fmtDollars(data.refunds.amount_dollars)} sub={`${fmtNum(data.refunds.count)} refunded`} />
        <Stat label="On Hold" value={fmtDollars(data.on_hold.amount_dollars)} sub={`${fmtNum(data.on_hold.count)} transactions`} />
      </div>

      <div className={s.split}>
        <StatusPanel title="Withdrawals by Status" buckets={data.withdrawals_by_status} />
        <StatusPanel title="Payouts by Status" buckets={data.payouts_by_status} />
      </div>
    </>
  )
}

function StatusPanel({ title, buckets }: { title: string; buckets: Record<string, StatusBucket> }) {
  const entries = Object.entries(buckets)
  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>{title}</h2>
      {entries.length === 0 ? <p className={s.muted}>No data.</p> : entries.map(([st, b]) => (
        <div key={st} className={s.defRow}>
          <span className={s.defKey}><Badge status={st} /> · {fmtNum(b.count)}</span>
          <span className={s.defVal}>{fmtDollars(b.amount_dollars)}</span>
        </div>
      ))}
    </div>
  )
}

function Transactions({ initialStatus }: { initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [page, setPage] = useState(1)
  const [refund, setRefund] = useState<string | null>(null)
  const { data, isLoading, isError } = useAdminTransactions({ status, page, limit: 25 })
  const refundMut = useRefundTransaction()

  return (
    <div className={s.card}>
      <h2 className={s.sectionTitle}>Transactions</h2>
      <div className={s.toolbar}>
        <select className={s.select} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          <option value="verified">Verified</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="pending_hold">On hold</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {isLoading && <Loading />}
      {isError && <ErrorBlock message="Failed to load transactions." />}

      {data && (data.transactions.length === 0 ? <Empty text="No transactions found." /> : (
        <>
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr><th>Txn</th><th>Campaign</th><th>Supporter</th><th>Amount</th><th>Fee</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {data.transactions.map((t: AdminTransaction) => (
                  <tr key={t._id}>
                    <td className={s.mono}>{t.transaction_id}</td>
                    <td>{t.campaign_id?.title || '—'}</td>
                    <td>{t.supporter_id?.display_name || '—'}</td>
                    <td><strong>{fmtMoney(t.amount_cents)}</strong></td>
                    <td className={s.muted}>{fmtMoney(t.platform_fee_cents)}</td>
                    <td><Badge status={t.status} /></td>
                    <td className={s.muted}>{fmtDate(t.created_at)}</td>
                    <td>
                      {['verified', 'approved'].includes(t.status) && (
                        <button className={`${s.btn} ${s.btnDanger} ${s.btnSm}`} onClick={() => setRefund(t._id)}>Refund</button>
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

      {refund && (
        <ReasonModal
          title="Refund transaction" label="Refund reason (required)" required danger confirmLabel="Process refund"
          onConfirm={(reason) => { refundMut.mutate({ id: refund, reason }); setRefund(null) }}
          onClose={() => setRefund(null)}
        />
      )}
    </div>
  )
}
