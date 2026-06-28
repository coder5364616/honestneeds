'use client'

import styled from 'styled-components'
import { useState } from 'react'
import { Repeat, Check, X, Clock } from 'lucide-react'
import { tk } from '@/styles/dashboardTokens'
import { toast } from 'react-toastify'
import {
  useCampaignShareRequests,
  useReviewShareRequest,
} from '@/api/hooks/useShareLimit'
import type { ShareGrantStatus } from '@/api/services/shareLimitService'

/**
 * ShareRequestsInbox
 *
 * Creator-facing inbox for "request another share" asks (daily share-limit rule,
 * 2026-06). A sharer can earn a tip from only one share/campaign/day; here the
 * creator approves or denies their requests to share again for a tip.
 */

interface Props {
  campaignId: string
}

const Wrap = styled.section`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.4rem;
  h2 {
    font-size: 1.05rem;
    font-weight: 800;
    color: ${tk.ink};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .count {
    margin-left: auto;
    background: ${tk.amberLight};
    color: ${tk.amberDark};
    font-weight: 700;
    font-size: 0.78rem;
    padding: 2px 10px;
    border-radius: 999px;
  }
`

const Sub = styled.p`
  color: ${tk.body};
  font-size: 0.85rem;
  margin: 0 0 1rem;
`

const Tabs = styled.div`
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  button {
    border: 1px solid ${tk.border};
    background: ${tk.white};
    color: ${tk.body};
    border-radius: 999px;
    padding: 5px 12px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    &[data-active='true'] {
      background: ${tk.ink};
      color: ${tk.white};
      border-color: ${tk.ink};
    }
  }
`

const Card = styled.div`
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.9rem 1rem;
  margin-bottom: 0.75rem;
  .top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 0.4rem;
  }
  .name { font-weight: 700; color: ${tk.ink}; font-size: 0.9rem; }
  .meta { color: ${tk.muted}; font-size: 0.78rem; }
  .reason {
    color: ${tk.body};
    font-size: 0.88rem;
    background: ${tk.canvas ?? '#f8f9fb'};
    border-radius: 8px;
    padding: 0.55rem 0.7rem;
    margin: 0.35rem 0 0.6rem;
  }
  .status {
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: capitalize;
  }
`

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border-radius: 8px;
    padding: 7px 14px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
    border: 1px solid transparent;
    &:disabled { opacity: 0.55; cursor: not-allowed; }
  }
  .approve { background: ${tk.green}; color: #fff; }
  .deny { background: ${tk.white}; color: #b42318; border-color: #fda29b; }
`

const Empty = styled.div`
  color: ${tk.muted};
  font-size: 0.88rem;
  text-align: center;
  padding: 1.5rem 0;
`

const STATUS_TABS: { value: ShareGrantStatus | 'all'; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'consumed', label: 'Used' },
  { value: 'denied', label: 'Denied' },
  { value: 'all', label: 'All' },
]

export function ShareRequestsInbox({ campaignId }: Props) {
  const [tab, setTab] = useState<ShareGrantStatus | 'all'>('pending')
  const { data, isLoading } = useCampaignShareRequests(campaignId, tab)
  const { mutate: review, isPending } = useReviewShareRequest(campaignId)
  const [busyId, setBusyId] = useState<string | null>(null)

  const items = data?.items ?? []
  const pendingCount = tab === 'pending' ? items.length : undefined

  const act = (requestId: string, approved: boolean) => {
    setBusyId(requestId)
    review(
      { requestId, approved },
      {
        onSuccess: () => {
          toast.success(approved ? 'Share approved — the sharer can earn a tip again today.' : 'Request declined.')
          setBusyId(null)
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || 'Could not update the request.')
          setBusyId(null)
        },
      }
    )
  }

  return (
    <Wrap>
      <Head>
        <h2>
          <Repeat size={18} /> Extra-Share Requests
        </h2>
        {pendingCount ? <span className="count">{pendingCount} pending</span> : null}
      </Head>
      <Sub>
        Supporters earn a tip from one share of this campaign per day. Approve a request to let a
        supporter share again for a tip today (e.g. on a different platform).
      </Sub>

      <Tabs>
        {STATUS_TABS.map((t) => (
          <button key={t.value} data-active={tab === t.value} onClick={() => setTab(t.value)}>
            {t.label}
          </button>
        ))}
      </Tabs>

      {isLoading ? (
        <Empty>Loading requests…</Empty>
      ) : items.length === 0 ? (
        <Empty>No {tab === 'all' ? '' : tab} requests.</Empty>
      ) : (
        items.map((req) => (
          <Card key={req.request_id}>
            <div className="top">
              <span className="name">{req.requester?.name || 'A supporter'}</span>
              <span className="meta">
                · {new Date(req.created_at).toLocaleDateString()}
                {req.requested_channel ? ` · wants to share on ${req.requested_channel}` : ''}
              </span>
            </div>
            <div className="reason">“{req.reason}”</div>
            {req.status === 'pending' ? (
              <Actions>
                <button
                  className="approve"
                  disabled={isPending && busyId === req.request_id}
                  onClick={() => act(req.request_id, true)}
                >
                  <Check size={15} /> Approve
                </button>
                <button
                  className="deny"
                  disabled={isPending && busyId === req.request_id}
                  onClick={() => act(req.request_id, false)}
                >
                  <X size={15} /> Decline
                </button>
              </Actions>
            ) : (
              <span
                className="status"
                style={{
                  color:
                    req.status === 'denied'
                      ? '#b42318'
                      : req.status === 'consumed'
                      ? tk.muted
                      : tk.green,
                }}
              >
                {req.status === 'consumed' ? (
                  <>
                    <Clock size={13} style={{ verticalAlign: 'middle' }} /> approved &amp; used
                  </>
                ) : (
                  req.status
                )}
              </span>
            )}
          </Card>
        ))
      )}
    </Wrap>
  )
}

export default ShareRequestsInbox
