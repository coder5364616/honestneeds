'use client'

import styled from 'styled-components'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { tk } from '@/styles/dashboardTokens'
import { useShareEligibility, useRequestExtraShare } from '@/api/hooks/useShareLimit'

/**
 * ShareLimitNotice
 *
 * Shows the sharer their daily tip-eligibility for a campaign and lets them ask
 * the creator to share again for a tip once the 1/day allowance is used. Free
 * sharing is always allowed, so this never blocks the share buttons — it only
 * sets expectations and surfaces the "request another" flow.
 */

interface Props {
  campaignId: string
  /** Re-fetch trigger key — bump after a successful share to refresh the count. */
  refreshKey?: number
}

const Box = styled.div<{ tone: 'eligible' | 'free' | 'pending' }>`
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  line-height: 1.45;
  border: 1px solid
    ${(p) => (p.tone === 'eligible' ? '#bfe3c6' : p.tone === 'pending' ? '#cdd9ea' : '#f0dcae')};
  background: ${(p) =>
    p.tone === 'eligible' ? '#eef9f0' : p.tone === 'pending' ? '#eef3fb' : '#fdf6e3'};
  color: ${tk.heading};
`

const Title = styled.div`
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  margin-bottom: 0.25rem;
`

const RequestButton = styled.button`
  margin-top: 0.65rem;
  padding: 0.55rem 1rem;
  background: ${tk.blue};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  &:hover { background: #0d4a8c; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`

const TextArea = styled.textarea`
  width: 100%;
  margin-top: 0.6rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid ${tk.border};
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  resize: vertical;
  min-height: 64px;
  &:focus { outline: none; border-color: ${tk.blue}; }
`

const Row = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

const Secondary = styled.button`
  padding: 0.5rem 0.9rem;
  background: #fff;
  color: ${tk.heading};
  border: 1px solid ${tk.border};
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
`

export function ShareLimitNotice({ campaignId }: Props) {
  const { data: eligibility, isLoading } = useShareEligibility(campaignId)
  const { mutate: requestExtra, isPending } = useRequestExtraShare(campaignId)
  const [showForm, setShowForm] = useState(false)
  const [reason, setReason] = useState('')

  if (isLoading || !eligibility) return null

  const submit = () => {
    if (!reason.trim()) {
      toast.error('Please tell the creator why you want to share again.')
      return
    }
    requestExtra(
      { reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success('Request sent! The creator will be notified.')
          setShowForm(false)
          setReason('')
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Could not send your request.')
        },
      }
    )
  }

  // Still has a tip-eligible share available today.
  if (eligibility.next_share_reward_eligible) {
    return (
      <Box tone="eligible">
        <Title>💸 This share can earn you a tip</Title>
        You have {eligibility.remaining_reward_shares} tip-eligible share
        {eligibility.remaining_reward_shares === 1 ? '' : 's'} left for this campaign today. When
        someone donates through your link, you earn a reward.
      </Box>
    )
  }

  // A request is already awaiting the creator.
  if (eligibility.has_pending_request) {
    return (
      <Box tone="pending">
        <Title>⏳ Request pending</Title>
        You’ve asked the creator for another tip-eligible share today. You can still share for free
        in the meantime — you’ll be notified when they respond.
      </Box>
    )
  }

  // Daily tip allowance used — offer the request flow.
  return (
    <Box tone="free">
      <Title>🆓 You’ve used today’s tip-eligible share</Title>
      You can keep sharing this campaign for <strong>free</strong> as much as you like — it still
      helps. To share again <strong>for a tip</strong> today, ask the creator and tell them why
      (e.g. “I’ll post it to a different platform”).
      {!showForm ? (
        <div>
          <RequestButton onClick={() => setShowForm(true)}>Request another share</RequestButton>
        </div>
      ) : (
        <>
          <TextArea
            placeholder="Why do you want to share again? e.g. I'll share it on a different platform to reach new people."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={1000}
          />
          <Row>
            <RequestButton onClick={submit} disabled={isPending}>
              {isPending ? 'Sending…' : 'Send request'}
            </RequestButton>
            <Secondary onClick={() => setShowForm(false)} disabled={isPending}>
              Cancel
            </Secondary>
          </Row>
        </>
      )}
    </Box>
  )
}

export default ShareLimitNotice
