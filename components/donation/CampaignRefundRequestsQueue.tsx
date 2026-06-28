'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { useCampaignRefundRequests, useDecideRefundRequest } from '@/api/hooks/useDonations'
import type { CampaignRefundRequest } from '@/api/services/donationService'

/**
 * CampaignRefundRequestsQueue (CE-7)
 * Creator/admin view of donor refund requests for a campaign. Approving reverses
 * the donation (accounting + fee); declining closes the request with a note.
 */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`

const Info = styled.div`min-width: 0;`

const TopLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 4px;
`

const Donor = styled.span`font-weight: 700; color: #0f172a; font-size: 0.95rem;`
const Amount = styled.span`font-weight: 800; color: #0f172a; font-size: 1rem;`

const Tag = styled.span<{ $tone?: 'amber' | 'slate' }>`
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 999px; font-size: 0.7rem; font-weight: 700;
  ${({ $tone }) => $tone === 'amber' ? 'background:#fef3c7;color:#92400e;' : 'background:#f1f5f9;color:#475569;'}
`

const Reason = styled.div`
  font-size: 0.82rem; color: #475569; margin-top: 2px;
  span.label { color: #94a3b8; font-weight: 600; }
`

const Actions = styled.div`
  display: flex; gap: 8px;
  @media (max-width: 640px) { width: 100%; }
`

const Btn = styled.button<{ $variant: 'approve' | 'decline' }>`
  flex: 1; padding: 9px 16px; border-radius: 9px; font-size: 0.85rem; font-weight: 700;
  cursor: pointer; border: 1px solid transparent; white-space: nowrap;
  ${({ $variant }) => $variant === 'approve'
    ? 'background:#16a34a;color:#fff;'
    : 'background:#fff;color:#b91c1c;border-color:#fca5a5;'}
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`

const DeclineForm = styled.div`
  grid-column: 1 / -1; display: flex; gap: 8px; margin-top: 4px;
  @media (max-width: 640px) { flex-direction: column; }
`

const NoteInput = styled.input`
  flex: 1; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 9px; font-size: 0.85rem;
  &:focus { outline: 2px solid #6366f1; outline-offset: 1px; }
`

function formatWhen(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function RequestRow({ campaignId, req }: { campaignId: string; req: CampaignRefundRequest }) {
  const [declining, setDeclining] = useState(false)
  const [note, setNote] = useState('')
  const decide = useDecideRefundRequest(campaignId)
  const busy = decide.isPending

  return (
    <Row>
      <Info>
        <TopLine>
          <Donor>{req.donor_name}</Donor>
          <Amount>${req.amount_dollars}</Amount>
          <Tag $tone="slate">{req.donation_status}</Tag>
          <Tag $tone="amber">refund requested</Tag>
        </TopLine>
        <Reason>
          <span className="label">Reason:</span> {req.refund_request?.reason || '—'}
        </Reason>
        <Reason>· {formatWhen(req.refund_request?.requested_at)}</Reason>
      </Info>

      <Actions>
        <Btn
          $variant="approve"
          disabled={busy}
          onClick={() => decide.mutate({ donationId: req._id, decision: 'approve' })}
        >
          {decide.isPending ? 'Working…' : 'Approve refund'}
        </Btn>
        <Btn $variant="decline" disabled={busy} onClick={() => setDeclining((v) => !v)}>
          Decline
        </Btn>
      </Actions>

      {declining && (
        <DeclineForm>
          <NoteInput
            placeholder="Reason for declining (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={decide.isPending}
          />
          <Btn
            $variant="decline"
            style={{ flex: 'none', minWidth: 130 }}
            disabled={decide.isPending}
            onClick={() =>
              decide.mutate(
                { donationId: req._id, decision: 'decline', note: note.trim() || undefined },
                { onSuccess: () => setDeclining(false) }
              )
            }
          >
            {decide.isPending ? 'Working…' : 'Confirm decline'}
          </Btn>
        </DeclineForm>
      )}
    </Row>
  )
}

export function CampaignRefundRequestsQueue({ campaignId }: { campaignId: string }) {
  const { data, isLoading, error } = useCampaignRefundRequests(campaignId, 'requested')

  if (isLoading) return <Empty>Loading refund requests…</Empty>
  if (error) return <Empty>Could not load refund requests. Please retry shortly.</Empty>

  const requests = data?.requests ?? []
  if (requests.length === 0) {
    return <Empty>No pending refund requests. Donor refund requests appear here for you to approve or decline.</Empty>
  }

  return (
    <Wrap>
      {requests.map((r) => (
        <RequestRow key={r._id} campaignId={campaignId} req={r} />
      ))}
    </Wrap>
  )
}
