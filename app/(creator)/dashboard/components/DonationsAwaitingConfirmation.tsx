'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { useQueries, useQueryClient, useMutation } from '@tanstack/react-query'
import { Inbox, Check, X, ExternalLink, Loader2, ImageOff } from 'lucide-react'
import { donationService, type PendingDonation } from '@/api/services/donationService'
import { useToast } from '@/hooks/useToast'

/**
 * DonationsAwaitingConfirmation — CF-1 confirmation queue, dashboard widget.
 *
 * Pinned to the top of the creator dashboard whenever there are manual donations
 * a donor has marked sent but the creator hasn't yet confirmed receipt. The
 * backend queue is per-campaign (`/campaigns/:id/donations/pending`), so we fan
 * out one query per campaign and merge the results, tagging each row with its
 * campaign so confirm/reject can target the right endpoint.
 *
 * Tokens mirror the dashboard's local `tk` palette (warm amber / ink / canvas).
 */

// ─── Tokens (mirror dashboard page.tsx `tk`) ───────────────────────────────────
const tk = {
  ink:        '#18171A',
  canvas:     '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border:     '#E2DDD6',
  white:      '#FFFFFF',
  muted:      '#8C8790',
  body:       '#4A4750',
  heading:    '#18171A',
  amber:      '#D4870A',
  amberLight: '#FBF3E0',
  amberDark:  '#A8680A',
  green:      '#1A7A4A',
  greenLight: '#E8F5EE',
  red:        '#C0392B',
  redLight:   '#FBE9E7',
  blue:       '#1A5FA8',
  blueLight:  '#E8F0FB',
}

export interface PendingCampaignRef {
  _id: string
  title: string
}

interface RowItem extends PendingDonation {
  campaignId: string
  campaignTitle: string
}

// ─── Animations ────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`
const pulseRing = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(212,135,10,0.45); }
  70%  { box-shadow: 0 0 0 9px rgba(212,135,10,0); }
  100% { box-shadow: 0 0 0 0 rgba(212,135,10,0); }
`
const slideOut = keyframes`
  to { opacity: 0; transform: translateX(28px); max-height: 0; padding-top: 0; padding-bottom: 0; margin: 0; border-width: 0; }
`

// ─── Panel shell ────────────────────────────────────────────────────────────────
const Panel = styled.section`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-left: 3px solid ${tk.amber};
  border-radius: 14px;
  padding: 1.125rem 1.25rem;
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.45s ease both;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
`

const HeadIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${tk.amberLight};
  color: ${tk.amber};
`

const HeadTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
`

const CountBadge = styled.span<{ $pulse: boolean }>`
  margin-left: auto;
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  font-weight: 500;
  color: ${tk.amberDark};
  background: ${tk.amberLight};
  border-radius: 100px;
  padding: 4px 11px;
  white-space: nowrap;
  ${p => p.$pulse && css`animation: ${pulseRing} 1.4s ease-out 2;`}
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

// ─── Donation row ────────────────────────────────────────────────────────────────
const Row = styled.div<{ $removing?: boolean }>`
  background: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 11px;
  padding: 1rem 1.125rem;
  overflow: hidden;
  ${p => p.$removing && css`animation: ${slideOut} 0.22s ease forwards;`}
`

const RowTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
`

const Amount = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

const MethodChip = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  font-weight: 500;
  text-transform: lowercase;
  color: ${tk.blue};
  background: ${tk.blueLight};
  border-radius: 100px;
  padding: 3px 9px;
`

const SentPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.68rem;
  font-weight: 600;
  color: ${tk.green};
  background: ${tk.greenLight};
  border-radius: 100px;
  padding: 3px 9px;
`

const Meta = styled.div`
  font-size: 0.78rem;
  color: ${tk.muted};
  margin-top: 0.5rem;

  b { color: ${tk.body}; font-weight: 600; }
  span { color: #B3AEB6; }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-top: 0.875rem;
  flex-wrap: wrap;
`

const ProofLink = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 4px 2px;
  margin-right: auto;
  color: ${tk.blue};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  &:hover { text-decoration: underline; }
  &:disabled { color: ${tk.muted}; cursor: not-allowed; text-decoration: none; }
`

const RejectBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid rgba(192,57,43,0.3);
  border-radius: 9px;
  padding: 0.5rem 0.875rem;
  color: ${tk.red};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
  &:hover { background: ${tk.redLight}; border-color: rgba(192,57,43,0.5); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const ConfirmBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${tk.amber};
  border: none;
  border-radius: 9px;
  padding: 0.5rem 1rem;
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 140ms;
  &:hover { background: ${tk.amberDark}; }
  &:disabled { opacity: 0.65; cursor: not-allowed; }
`

const Spin = styled(Loader2)`
  animation: spin 0.8s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`

// ─── Modal (proof + reject reason) ──────────────────────────────────────────────
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(24,23,26,0.55);
  backdrop-filter: blur(3px);
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  animation: ${fadeUp} 0.2s ease both;
`

const Modal = styled.div`
  background: ${tk.white};
  border-radius: 16px;
  max-width: 460px;
  width: 100%;
  padding: 1.5rem;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
`

const ModalTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 0.25rem;
`

const ModalSub = styled.p`
  font-size: 0.82rem;
  color: ${tk.muted};
  margin: 0 0 1rem;
`

const ProofImg = styled.img`
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  border-radius: 10px;
  border: 1px solid ${tk.border};
  background: ${tk.canvasDeep};
`

const ProofMissing = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  color: ${tk.muted};
  font-size: 0.85rem;
  text-align: center;
`

const ReasonArea = styled.textarea`
  width: 100%;
  min-height: 84px;
  resize: vertical;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.75rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: ${tk.heading};
  outline: none;
  &:focus { border-color: ${tk.red}; }
  &::placeholder { color: ${tk.muted}; }
`

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  margin-top: 1.125rem;
`

const GhostBtn = styled.button`
  background: transparent;
  border: 1px solid ${tk.border};
  border-radius: 9px;
  padding: 0.5rem 1rem;
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  &:hover { background: ${tk.canvasDeep}; }
`

const DangerBtn = styled(GhostBtn)`
  background: ${tk.red};
  border-color: ${tk.red};
  color: ${tk.white};
  font-weight: 600;
  &:hover { background: #A53224; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const OpenExternal = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 0.875rem;
  color: ${tk.blue};
  font-size: 0.8rem;
  font-weight: 500;
  text-decoration: none;
  &:hover { text-decoration: underline; }
`

// ─── Helpers ─────────────────────────────────────────────────────────────────────
const formatDate = (ts: string | null): string => {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const looksLikeImage = (url: string | null): boolean =>
  !!url && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url)

// ─── Component ────────────────────────────────────────────────────────────────────
interface Props {
  campaigns: PendingCampaignRef[]
}

export function DonationsAwaitingConfirmation({ campaigns }: Props) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Fan out one pending-queue query per campaign and merge.
  const results = useQueries({
    queries: campaigns.map((c) => ({
      queryKey: ['pendingDonations', c._id],
      queryFn: () => donationService.getCampaignPendingDonations(c._id, 1, 50),
      staleTime: 15_000,
      refetchInterval: 30_000,
      enabled: !!c._id,
    })),
  })

  const items = useMemo<RowItem[]>(() => {
    const out: RowItem[] = []
    results.forEach((r, i) => {
      const c = campaigns[i]
      if (!c || !r.data?.donations) return
      for (const d of r.data.donations) {
        out.push({ ...d, campaignId: c._id, campaignTitle: c.title })
      }
    })
    // Most recently "marked sent" first, falling back to created order.
    return out.sort((a, b) => {
      const at = new Date(a.payment_sent_at || a.created_at).getTime()
      const bt = new Date(b.payment_sent_at || b.created_at).getTime()
      return bt - at
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.map((r) => r.dataUpdatedAt).join(','), campaigns])

  // Locally dismissed rows (optimistic) so confirmed/rejected items vanish at once.
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [removing, setRemoving] = useState<Set<string>>(new Set())
  const visible = items.filter((d) => !dismissed.has(d.transaction_id))

  // Pulse the count badge when the number of pending items grows.
  const prevCount = useRef(0)
  const [pulse, setPulse] = useState(false)
  useEffect(() => {
    if (visible.length > prevCount.current && prevCount.current !== 0) {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 2900)
      prevCount.current = visible.length
      return () => clearTimeout(t)
    }
    prevCount.current = visible.length
  }, [visible.length])

  // Proof + reject modal state.
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<RowItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const beginRemove = (campaignId: string, txId: string) => {
    setRemoving((s) => new Set(s).add(txId))
    setTimeout(() => {
      setDismissed((s) => new Set(s).add(txId))
      queryClient.invalidateQueries({ queryKey: ['pendingDonations', campaignId] })
    }, 220)
  }

  const confirmMut = useMutation({
    mutationFn: (row: RowItem) =>
      donationService.confirmDonationReceipt(row.campaignId, row.transaction_id),
    onSuccess: (_data, row) => {
      showToast({ type: 'success', message: `Confirmed $${row.amount_dollars} from ${row.donor_name}` })
      beginRemove(row.campaignId, row.transaction_id)
    },
    onError: () => showToast({ type: 'error', message: 'Could not confirm — please try again' }),
  })

  const rejectMut = useMutation({
    mutationFn: ({ row, reason }: { row: RowItem; reason: string }) =>
      donationService.rejectDonationReceipt(row.campaignId, row.transaction_id, reason),
    onSuccess: (_data, { row }) => {
      showToast({ type: 'success', message: `Rejected donation from ${row.donor_name}` })
      setRejectTarget(null)
      setRejectReason('')
      beginRemove(row.campaignId, row.transaction_id)
    },
    onError: () => showToast({ type: 'error', message: 'Could not reject — please try again' }),
  })

  // Collapse entirely when there's nothing to confirm (keeps the top of the
  // dashboard quiet until a donor actually marks a payment sent) — including
  // while the per-campaign queues are still loading, so the panel only ever
  // appears with real content.
  if (visible.length === 0) return null

  return (
    <>
      <Panel aria-label="Donations awaiting your confirmation">
        <Head>
          <HeadIcon><Inbox size={17} /></HeadIcon>
          <HeadTitle>Donations Awaiting Your Confirmation</HeadTitle>
          <CountBadge $pulse={pulse} role="status" aria-live="polite">
            {visible.length} awaiting confirmation
          </CountBadge>
        </Head>

        <List>
          {visible.map((d) => {
            const busy =
              (confirmMut.isPending && confirmMut.variables?.transaction_id === d.transaction_id) ||
              (rejectMut.isPending && rejectMut.variables?.row.transaction_id === d.transaction_id)
            return (
              <Row key={d.transaction_id} $removing={removing.has(d.transaction_id)}>
                <RowTop>
                  <Amount>${d.amount_dollars}</Amount>
                  <MethodChip>{d.payment_method}</MethodChip>
                  {d.payment_marked_sent && (
                    <SentPill><Check size={12} /> donor marked sent</SentPill>
                  )}
                </RowTop>

                <Meta>
                  from <b>{d.donor_name}</b> · {d.campaignTitle}
                  {' · '}
                  <span>{formatDate(d.payment_sent_at || d.created_at)}</span>
                </Meta>

                <Actions>
                  <ProofLink
                    onClick={() => setProofUrl(d.proof_url)}
                    disabled={!d.proof_url}
                    title={d.proof_url ? 'View proof of payment' : 'No proof attached'}
                  >
                    <ExternalLink size={14} />
                    {d.proof_url ? 'View proof' : 'No proof'}
                  </ProofLink>

                  <RejectBtn
                    onClick={() => { setRejectTarget(d); setRejectReason('') }}
                    disabled={busy}
                    aria-label={`Reject $${d.amount_dollars} donation from ${d.donor_name}`}
                  >
                    <X size={14} /> Reject
                  </RejectBtn>

                  <ConfirmBtn
                    onClick={() => confirmMut.mutate(d)}
                    disabled={busy}
                    aria-label={`Confirm receipt of $${d.amount_dollars} from ${d.donor_name}`}
                  >
                    {busy && confirmMut.variables?.transaction_id === d.transaction_id
                      ? <><Spin size={14} /> Confirming…</>
                      : <><Check size={15} /> Confirm received</>}
                  </ConfirmBtn>
                </Actions>
              </Row>
            )
          })}
        </List>
      </Panel>

      {/* Proof viewer */}
      {proofUrl !== null && (
        <Overlay onClick={() => setProofUrl(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Proof of payment</ModalTitle>
            <ModalSub>Sent by the donor as evidence of their off-platform payment.</ModalSub>
            {looksLikeImage(proofUrl) ? (
              <ProofImg src={proofUrl} alt="Proof of payment" />
            ) : (
              <ProofMissing>
                <ImageOff size={28} style={{ opacity: 0.5 }} />
                This proof isn’t a previewable image.
              </ProofMissing>
            )}
            <OpenExternal href={proofUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> Open in new tab
            </OpenExternal>
            <ModalActions>
              <GhostBtn onClick={() => setProofUrl(null)}>Close</GhostBtn>
            </ModalActions>
          </Modal>
        </Overlay>
      )}

      {/* Reject reason */}
      {rejectTarget && (
        <Overlay onClick={() => !rejectMut.isPending && setRejectTarget(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Reject this donation?</ModalTitle>
            <ModalSub>
              ${rejectTarget.amount_dollars} from {rejectTarget.donor_name}. This reverses any
              amount already counted toward your campaign. A reason is required.
            </ModalSub>
            <ReasonArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Payment never arrived in my Venmo account"
              autoFocus
            />
            <ModalActions>
              <GhostBtn onClick={() => setRejectTarget(null)} disabled={rejectMut.isPending}>
                Cancel
              </GhostBtn>
              <DangerBtn
                onClick={() => rejectMut.mutate({ row: rejectTarget, reason: rejectReason.trim() })}
                disabled={rejectMut.isPending || rejectReason.trim().length === 0}
              >
                {rejectMut.isPending ? 'Rejecting…' : 'Reject donation'}
              </DangerBtn>
            </ModalActions>
          </Modal>
        </Overlay>
      )}
    </>
  )
}

export default DonationsAwaitingConfirmation
