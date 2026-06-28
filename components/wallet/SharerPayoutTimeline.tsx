'use client'

import styled from 'styled-components'
import { useSharerPayouts, useConfirmPayoutReceived, type SharerPayoutSlice } from '@/api/hooks/useSharerPayouts'

/**
 * SharerPayoutTimeline (F-3)
 * Shows the sharer their payout claims, split per campaign, with a clear
 * requested → paid → received timeline — so being paid by Creator A while
 * waiting on Creator B reads at a glance.
 */

const Wrap = styled.section`
  margin: 1.5rem 0;
`
const Heading = styled.h2`
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem;
`
const Claim = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0.9rem 1.1rem;
  margin-bottom: 0.9rem;
  background: #fff;
`
const ClaimHead = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #64748b;
  margin-bottom: 0.6rem;
`
const Slice = styled.div`
  border-top: 1px dashed #e2e8f0;
  padding: 0.7rem 0 0.2rem;
  &:first-child { border-top: none; }
`
const SliceTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`
const Steps = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0.55rem 0 0.2rem;
  flex-wrap: wrap;
`
const Step = styled.span<{ $on: boolean; $tone?: 'ok' | 'warn' }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 999px;
  ${({ $on, $tone }) =>
    !$on
      ? 'background:#f1f5f9;color:#94a3b8;'
      : $tone === 'warn'
      ? 'background:#FEF3F2;color:#B42318;'
      : 'background:#dcfce7;color:#166534;'}
`
const Arrow = styled.span`
  color: #cbd5e1;
  font-size: 0.7rem;
`
const ConfirmBtn = styled.button`
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`
const ProofLink = styled.a`
  font-size: 0.74rem;
  color: #2563eb;
  text-decoration: underline;
`

function fmtDate(d?: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function SliceRow({ withdrawalId, slice }: { withdrawalId: string; slice: SharerPayoutSlice }) {
  const confirm = useConfirmPayoutReceived()
  const cancelled = slice.status === 'cancelled'
  const paid = slice.status === 'paid'
  const received = !!slice.received_at

  return (
    <Slice>
      <SliceTop>
        <div>
          <strong style={{ color: '#0f172a' }}>${slice.amount.toFixed(2)}</strong>{' '}
          <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
            · {slice.campaign_title} · {slice.creator_name}
          </span>
        </div>
        {paid && !received && (
          <ConfirmBtn
            onClick={() => confirm.mutate({ withdrawalId, campaignId: slice.campaign_id })}
            disabled={confirm.isPending}
          >
            {confirm.isPending ? 'Saving…' : 'I received it'}
          </ConfirmBtn>
        )}
      </SliceTop>

      {cancelled ? (
        <Steps>
          <Step $on $tone="warn">⚠️ Cancelled {fmtDate(slice.cancelled_at)}</Step>
          <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>· balance returned to your available earnings</span>
        </Steps>
      ) : (
        <Steps>
          <Step $on>Requested {fmtDate(slice.requested_at)}</Step>
          <Arrow>→</Arrow>
          <Step $on>Sent to {slice.creator_name}</Step>
          <Arrow>→</Arrow>
          <Step $on={paid}>{paid ? `Paid ${fmtDate(slice.paid_at)}` : 'Awaiting payment'}</Step>
          <Arrow>→</Arrow>
          <Step $on={received}>{received ? `Received ${fmtDate(slice.received_at)}` : 'Confirm receipt'}</Step>
          {slice.reference && (
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>· ref {slice.reference}</span>
          )}
          {slice.proof_url && (
            <ProofLink href={slice.proof_url} target="_blank" rel="noopener noreferrer">proof</ProofLink>
          )}
        </Steps>
      )}
    </Slice>
  )
}

export function SharerPayoutTimeline() {
  const { data: payouts, isLoading } = useSharerPayouts()
  if (isLoading || !payouts || payouts.length === 0) return null

  return (
    <Wrap>
      <Heading>Your payout claims</Heading>
      {payouts.map((p) => (
        <Claim key={p.withdrawal_id}>
          <ClaimHead>
            <span>Claim · ${p.amount.toFixed(2)} · {fmtDate(p.requested_at)}</span>
            <span style={{ textTransform: 'capitalize' }}>{p.status}</span>
          </ClaimHead>
          {p.slices.map((s) => (
            <SliceRow key={`${p.withdrawal_id}-${s.campaign_id}`} withdrawalId={p.withdrawal_id} slice={s} />
          ))}
        </Claim>
      ))}
    </Wrap>
  )
}
