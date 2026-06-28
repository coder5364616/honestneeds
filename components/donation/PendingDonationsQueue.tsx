'use client'

import { useState } from 'react'
import styled from 'styled-components'
import {
  useCampaignPendingDonations,
  useConfirmDonationReceipt,
  useRejectDonationReceipt,
} from '@/api/hooks/useDonations'
import type { PendingDonation } from '@/api/services/donationService'

/**
 * PendingDonationsQueue (CF-1)
 *
 * Creator-facing confirmation queue for manual donations. Because payments move
 * directly from donor → creator off-platform, a donation only counts toward the
 * campaign total once the creator confirms "I received this". This surfaces the
 * pending pipeline with proof-of-payment + "donor marked sent" status and lets
 * the creator confirm or reject each one.
 */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`

const SummaryPill = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 999px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  color: #92400e;
  font-size: 0.85rem;
  font-weight: 700;

  span.amt { font-size: 1rem; }
`

const Empty = styled.div`
  padding: 28px;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const Info = styled.div`
  min-width: 0;
`

const TopLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
`

const Donor = styled.span`
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
`

const Amount = styled.span`
  font-weight: 800;
  color: #0f172a;
  font-size: 1rem;
`

const Sub = styled.div`
  font-size: 0.78rem;
  color: #64748b;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
`

const Tag = styled.span<{ $tone?: 'amber' | 'green' | 'slate' | 'violet' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 700;
  ${({ $tone }) => {
    switch ($tone) {
      case 'green':
        return 'background:#d1fae5;color:#065f46;'
      case 'amber':
        return 'background:#fef3c7;color:#92400e;'
      case 'violet':
        return 'background:#ede9fe;color:#5b21b6;'
      default:
        return 'background:#f1f5f9;color:#475569;'
    }
  }}
`

const ProofLink = styled.a`
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`

const Actions = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 640px) {
    width: 100%;
  }
`

const Btn = styled.button<{ $variant: 'confirm' | 'reject' }>`
  flex: 1;
  padding: 9px 16px;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  transition: filter 0.15s ease, opacity 0.15s ease;
  white-space: nowrap;

  ${({ $variant }) =>
    $variant === 'confirm'
      ? 'background:#16a34a;color:#fff;'
      : 'background:#fff;color:#b91c1c;border-color:#fca5a5;'}

  &:hover:not(:disabled) { filter: brightness(0.96); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`

const RejectForm = styled.div`
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  margin-top: 4px;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const ReasonInput = styled.input`
  flex: 1;
  padding: 9px 12px;
  border: 1px solid #fca5a5;
  border-radius: 9px;
  font-size: 0.85rem;
  &:focus { outline: 2px solid #ef4444; outline-offset: 1px; }
`

interface PendingDonationsQueueProps {
  campaignId: string
}

function formatWhen(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function PendingRow({ campaignId, donation }: { campaignId: string; donation: PendingDonation }) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  const confirm = useConfirmDonationReceipt(campaignId)
  const reject = useRejectDonationReceipt(campaignId)
  const busy = confirm.isPending || reject.isPending

  return (
    <>
      <Row>
        <Info>
          <TopLine>
            <Donor>{donation.donor_name}</Donor>
            <Amount>${donation.amount_dollars}</Amount>
            <Tag $tone="slate">{donation.payment_method}</Tag>
            {donation.has_referral && <Tag $tone="violet">↗ referral</Tag>}
          </TopLine>
          <Sub>
            {donation.payment_marked_sent ? (
              <Tag $tone="green">✓ donor marked sent</Tag>
            ) : (
              <Tag $tone="amber">awaiting donor payment</Tag>
            )}
            {donation.proof_url ? (
              <ProofLink href={donation.proof_url} target="_blank" rel="noopener noreferrer">
                View proof
              </ProofLink>
            ) : (
              <span>No proof attached</span>
            )}
            <span>· {formatWhen(donation.payment_sent_at) || formatWhen(donation.created_at)}</span>
          </Sub>
        </Info>

        <Actions>
          <Btn
            $variant="confirm"
            disabled={busy}
            onClick={() => confirm.mutate(donation._id)}
          >
            {confirm.isPending ? 'Confirming…' : 'Confirm received'}
          </Btn>
          <Btn
            $variant="reject"
            disabled={busy}
            onClick={() => setRejecting((v) => !v)}
          >
            Reject
          </Btn>
        </Actions>

        {rejecting && (
          <RejectForm>
            <ReasonInput
              placeholder="Reason (e.g. payment never arrived)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={reject.isPending}
            />
            <Btn
              $variant="reject"
              disabled={reject.isPending || reason.trim().length === 0}
              onClick={() =>
                reject.mutate(
                  { transactionId: donation._id, reason: reason.trim() },
                  { onSuccess: () => setRejecting(false) }
                )
              }
              style={{ flex: 'none', minWidth: 130 }}
            >
              {reject.isPending ? 'Rejecting…' : 'Confirm reject'}
            </Btn>
          </RejectForm>
        )}
      </Row>
    </>
  )
}

export function PendingDonationsQueue({ campaignId }: PendingDonationsQueueProps) {
  const { data, isLoading, error } = useCampaignPendingDonations(campaignId)

  if (isLoading) {
    return <Empty>Loading pending donations…</Empty>
  }

  if (error) {
    return <Empty>Could not load the confirmation queue. Please retry shortly.</Empty>
  }

  const donations = data?.donations ?? []

  return (
    <Wrap>
      <SummaryRow>
        <SummaryPill>
          {data?.summary.pending_count ?? donations.length} awaiting confirmation
          <span className="amt">${data?.summary.pending_amount_dollars ?? '0.00'}</span>
        </SummaryPill>
      </SummaryRow>

      {donations.length === 0 ? (
        <Empty>
          No donations awaiting confirmation. New donations appear here for you to confirm once a
          donor sends payment.
        </Empty>
      ) : (
        donations.map((d) => <PendingRow key={d._id} campaignId={campaignId} donation={d} />)
      )}
    </Wrap>
  )
}
