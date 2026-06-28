'use client'

import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import {
  useCampaignPayoutRequests,
  useCampaignPayoutSummary,
  useMarkPayoutAsPaid,
  useSharerTracking,
  useDisputePayout,
} from '@/api/hooks/useCampaignPayouts'
import { useRouter, useParams } from 'next/navigation'
import {
  DollarSign,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Filter,
  ChevronLeft,
  Eye,
  X,
  Copy,
  Search,
  Activity,
  Flag,
  MousePointerClick,
  Share2
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { ShareRequestsInbox } from '@/components/campaign/ShareRequestsInbox'
import { tk } from '@/styles/dashboardTokens'

const MethodHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  background: ${tk.amberLight};
  border-bottom: 1px solid ${tk.border};
  label {
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    input { width: 18px; height: 18px; cursor: pointer; }
    strong { color: ${tk.ink}; font-size: 0.95rem; }
    span { color: ${tk.body}; font-size: 0.85rem; }
  }
  small { color: ${tk.amberDark}; font-weight: 700; font-size: 0.8rem; }
`

const SearchBox = styled.div`
  display: flex; align-items: center; gap: 8px;
  background: ${tk.white}; border: 1px solid ${tk.border}; border-radius: 10px;
  padding: 0 12px; margin-bottom: 1.25rem; color: ${tk.muted};
  input {
    flex: 1; border: none; outline: none; padding: 11px 0; font-size: 0.9rem;
    color: ${tk.ink}; background: transparent;
  }
  &:focus-within { border-color: ${tk.amber}; }
`

const BulkBar = styled.div`
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1.25rem;
  background: ${tk.ink};
  color: ${tk.white};
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.18);
  .meta { font-weight: 700; }
  .actions { display: flex; gap: 0.6rem; }
  button {
    border: none; border-radius: 8px; padding: 8px 14px; font-weight: 700; font-size: 0.85rem; cursor: pointer;
  }
  .clear { background: transparent; color: ${tk.offWhite}; border: 1px solid ${tk.inkBorder}; }
  .pay { background: ${tk.amber}; color: #fff; }
`

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #F7F5F1;
  padding: 2rem;
`

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1a1a1a;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .breadcrumb {
    display: flex;
    gap: 8px;
    align-items: center;
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 12px;

    button {
      background: none;
      border: none;
      color: #0066cc;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .campaign-title {
    color: #666;
    font-size: 0.95rem;
    margin-top: 0.5rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || tk.amber};

  .label {
    font-size: 0.9rem;
    color: #666;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  .subtext {
    font-size: 0.8rem;
    color: #999;
    margin-top: 0.5rem;
  }
`

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;

  button {
    padding: 0.5rem 1rem;
    border: 2px solid ${tk.border};
    background: ${tk.white};
    color: ${tk.body};
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      border-color: ${tk.amberMid};
    }

    &[data-active="true"] {
      border-color: ${tk.amber};
      background: ${tk.amber};
      color: white;
    }
  }
`

const RequestsTable = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    background: transparent;
    padding: 0;
    box-shadow: none;
  }
`

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9f9f9;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    display: none;
  }
`

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  align-items: center;

  &:hover {
    background: #fafafa;
  }

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    margin-bottom: 1rem;
    background: white;
    padding: 1rem;
    border-bottom: 1px solid #e0e0e0;

    &:hover {
      background: #fafafa;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
`

const SharerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background: #e0e0e0;
  }

  .details {
    h4 {
      margin: 0;
      font-size: 0.95rem;
      color: #1a1a1a;
    }

    p {
      margin: 4px 0 0 0;
      font-size: 0.85rem;
      color: #666;
    }
  }

  @media (max-width: 768px) {
    width: 100%;

    img {
      width: 50px;
      height: 50px;
    }

    .details {
      flex: 1;

      h4 {
        font-size: 1rem;
      }

      p {
        font-size: 0.8rem;
      }
    }
  }
`

const PaymentDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .type {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0066cc;
  }

  .details {
    font-size: 0.85rem;
    color: #666;
  }

  @media (max-width: 768px) {
    width: 100%;
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 8px;
    border-left: 4px solid #0066cc;

    .type {
      font-size: 0.85rem;
      text-transform: uppercase;
      font-weight: 700;
    }

    .details {
      font-size: 0.8rem;
    }
  }
`

const AmountColumn = styled.div`
  text-align: right;

  .amount {
    font-size: 1rem;
    font-weight: 700;
    color: #1a1a1a;
  }

  .with-fee {
    font-size: 0.8rem;
    color: #999;
    margin-top: 2px;
  }

  @media (max-width: 768px) {
    width: 100%;
    text-align: left;
    background: #f8f9fa;
    padding: 0.75rem;
    border-radius: 8px;
    border-left: 4px solid #28a745;

    .amount {
      font-size: 1.3rem;
    }

    .with-fee {
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }
  }
`

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  
  &.pending {
    background: ${tk.amberLight};
    color: ${tk.amberDark};
  }

  &.processing {
    background: ${tk.blueLight};
    color: ${tk.blue};
  }

  &.completed {
    background: ${tk.greenLight};
    color: ${tk.green};
  }

  &.failed, &.cancelled {
    background: ${tk.redLight};
    color: ${tk.red};
  }

  &.disputed {
    background: ${tk.redLight};
    color: ${tk.red};
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;

  button {
    padding: 0.4rem 0.8rem;
    border: none;
    background: ${tk.amber};
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: ${tk.amberDark};
      transform: translateY(-1px);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  @media (max-width: 768px) {
    width: 100%;
    gap: 0.5rem;
    flex-wrap: wrap;

    button {
      flex: 1;
      min-width: 100px;
      justify-content: center;
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
    }
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  p {
    font-size: 0.95rem;
  }
`

const LoadingState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: #666;
`

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`

const DetailModal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 1001;
  flex-direction: column;
  gap: 1.5rem;
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 1rem;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #1a1a1a;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: #1a1a1a;
    }
  }
`

const ModalSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin: 0 0 0.5rem 0;
  }
`

const DetailField = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #0066cc;

  .label {
    font-size: 0.8rem;
    color: #666;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1rem;
    color: #1a1a1a;
    font-weight: 500;
    word-break: break-all;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .copy-btn {
    background: none;
    border: 1px solid #ddd;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    color: #0066cc;
    font-size: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: all 0.2s;
    flex-shrink: 0;

    &:hover {
      background: #0066cc;
      color: white;
    }
  }
`

const SharerDetails = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 1rem;
  align-items: center;

  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    object-fit: cover;
    background: #e0e0e0;
  }

  .info {
    h4 {
      margin: 0;
      font-size: 1rem;
      color: #1a1a1a;
    }

    p {
      margin: 4px 0 0 0;
      font-size: 0.9rem;
      color: #666;
    }
  }
`

/**
 * Creator Sharers Payouts - Campaign Detail
 * View and manage withdrawal requests for a specific campaign
 */

// Memoize statusOptions outside component to prevent recreation
const STATUS_OPTIONS = [
  { value: 'actionable', label: 'Action needed', icon: AlertCircle },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'processing', label: 'Processing', icon: ArrowRight },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
  { value: 'all', label: 'All', icon: Filter }
]

export default function CampaignPayoutsPage() {
  const router = useRouter()
  const params = useParams()
  const campaignId = params.campaignId as string
  const [selectedStatus, setSelectedStatus] = useState('actionable')
  const [page, setPage] = useState(1)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  // F-2: Mark-paid modal state (reference + optional proof screenshot)
  const [payRequest, setPayRequest] = useState<any>(null)
  const [payReference, setPayReference] = useState('')
  const [payProof, setPayProof] = useState<File | null>(null)
  // C2: bulk selection + bulk mark-paid
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkReference, setBulkReference] = useState('')
  const [bulkBusy, setBulkBusy] = useState(false)
  // C3: in-campaign search
  const [search, setSearch] = useState('')
  // Phase 4: tracking proof view + dispute
  const [trackingSharer, setTrackingSharer] = useState<{ id: string; name: string } | null>(null)
  const [disputeRequest, setDisputeRequest] = useState<any>(null)
  const [disputeReason, setDisputeReason] = useState('')
  const { showToast } = useToast()

  // Fetch payout requests - stable dependencies
  const { 
    data: requestsData, 
    isLoading: requestsLoading, 
    error: requestsError 
  } = useCampaignPayoutRequests(
    campaignId,
    selectedStatus as any,
    page
  )

  // Fetch summary - stable dependencies
  const { data: summaryData } = useCampaignPayoutSummary(campaignId)

  // Mark as paid mutation
  const { mutate: markAsPaid, mutateAsync: markAsPaidAsync, isPending: isMarking } = useMarkPayoutAsPaid()

  // Phase 4: tracking proof view (lazy — only fetches when a sharer is selected) + dispute
  const { data: tracking, isLoading: trackingLoading } = useSharerTracking(
    campaignId,
    trackingSharer?.id ?? null
  )
  const { mutate: disputePayout, isPending: isDisputing } = useDisputePayout()

  const submitDispute = useCallback(() => {
    if (!disputeRequest || !disputeReason.trim()) return
    disputePayout(
      { campaignId, withdrawalId: disputeRequest.id, reason: disputeReason.trim() },
      {
        onSuccess: () => {
          showToast({ type: 'success', message: 'Claim disputed. The sharer has been notified.' })
          setDisputeRequest(null)
          setDisputeReason('')
        },
        onError: (error: Error) => {
          const msg = (error as any).response?.data?.error || 'Failed to dispute claim'
          showToast({ type: 'error', message: msg })
        },
      }
    )
  }, [campaignId, disputePayout, disputeRequest, disputeReason, showToast])

  const isPendingSlice = (r: any) => ((r?.slice_status ?? r?.status) === 'pending')
  const isDisputedSlice = (r: any) => ((r?.slice_status ?? r?.status) === 'disputed')

  // C5: aging helpers
  const ageDays = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000))
  const ageColor = (d: number) => (d > 7 ? tk.red : d >= 3 ? tk.amberDark : tk.muted)

  // C6: build a payable "name · handle · amount" block for a method group
  const payHandle = (pm: any) => {
    if (!pm) return ''
    if (pm.type === 'bank_transfer') {
      return [pm.bank_account_holder, pm.bank_name, pm.bank_account_number || (pm.bank_account_last_four && `****${pm.bank_account_last_four}`)].filter(Boolean).join(' / ')
    }
    if (pm.type === 'mobile_money') return [pm.mobile_money_provider, pm.mobile_number].filter(Boolean).join(' ')
    if (pm.type === 'paypal') return pm.account_holder || pm.display_name || 'PayPal'
    return pm.display_name || pm.account_holder || (pm.last4 && `****${pm.last4}`) || ''
  }
  const copyGroupToPay = (rows: any[]) => {
    const lines = rows.filter(isPendingSlice).map(
      (r) => `${r.sharer?.name || r.sharer?.username || 'Sharer'} · ${payHandle(r.payment_method)} · $${r.amount.toFixed(2)}`
    )
    if (lines.length === 0) return
    navigator.clipboard.writeText(lines.join('\n'))
    showToast({ type: 'success', message: `Copied ${lines.length} payment line${lines.length !== 1 ? 's' : ''} to clipboard.` })
  }

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }, [])

  const submitBulkPaid = useCallback(async () => {
    const ids = [...selected]
    if (ids.length === 0) return
    setBulkBusy(true)
    let ok = 0
    let fail = 0
    for (const id of ids) {
      try {
        await markAsPaidAsync({
          campaignId,
          withdrawalId: id,
          transaction_id: bulkReference.trim() || undefined,
          notes: 'Bulk marked paid by creator',
        })
        ok += 1
      } catch {
        fail += 1
      }
    }
    setBulkBusy(false)
    setBulkOpen(false)
    setBulkReference('')
    setSelected(new Set())
    showToast({
      type: fail ? 'error' : 'success',
      message: `Marked ${ok} paid${fail ? `, ${fail} failed` : ''}. Sharers notified.`,
    })
  }, [selected, campaignId, bulkReference, markAsPaidAsync, showToast])

  const submitMarkAsPaid = useCallback(() => {
    if (!payRequest) return
    markAsPaid(
      {
        campaignId,
        withdrawalId: payRequest.id,
        transaction_id: payReference.trim() || undefined,
        notes: 'Marked as paid by creator',
        proof: payProof,
      },
      {
        onSuccess: () => {
          showToast({ type: 'success', message: 'Payment marked as paid! Sharer will be notified.' })
          setPayRequest(null)
          setPayReference('')
          setPayProof(null)
        },
        onError: (error: Error) => {
          const errorMessage = (error as any).response?.data?.error || 'Failed to mark as paid'
          showToast({ type: 'error', message: errorMessage })
        }
      }
    )
  }, [campaignId, markAsPaid, showToast, payRequest, payReference, payProof])

  // Memoize clipboard handler to prevent recreation on every render
  const handleCopyToClipboard = useCallback((text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    const timeoutId = setTimeout(() => setCopiedField(null), 2000)
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <PageWrapper>
      <Container>
        <Header>
          <div>
            <div className="breadcrumb">
              <button onClick={() => router.back()}>
                <ChevronLeft size={16} /> Back
              </button>
            </div>
            <h1>
              <DollarSign size={32} />
              Pay Your Sharers
            </h1>
            <div className="campaign-title">
              Pay sharers who&apos;ve claimed their share-to-earn rewards. You pay them
              directly using the details below, then mark each claim as paid.
            </div>
          </div>
        </Header>

        {/* Summary Stats — what you owe, what you've paid, what you've funded */}
        {summaryData && (
          <>
            <StatsGrid>
              <StatCard color={tk.amber}>
                <div className="label">You Owe Now</div>
                <div className="value">${(summaryData.ledger?.owed_now ?? 0).toFixed(2)}</div>
                <div className="subtext">{summaryData.summary?.pending?.count ?? 0} unpaid claim(s)</div>
              </StatCard>
              <StatCard color={tk.green}>
                <div className="label">Paid to Sharers</div>
                <div className="value">${(summaryData.ledger?.paid_via_payouts ?? 0).toFixed(2)}</div>
                <div className="subtext">{summaryData.summary?.completed?.count ?? 0} settled</div>
              </StatCard>
              <StatCard color={tk.blue}>
                <div className="label">Budget Funded</div>
                <div className="value">${(summaryData.ledger?.funded_budget ?? 0).toFixed(2)}</div>
                <div className="subtext">${(summaryData.ledger?.funded_remaining ?? 0).toFixed(2)} remaining</div>
              </StatCard>
            </StatsGrid>
            {summaryData.ledger && !summaryData.ledger.can_cover_owed && (summaryData.ledger.shortfall ?? 0) > 0 && (
              <div style={{
                margin: '0 0 1.5rem',
                padding: '0.875rem 1.125rem',
                borderRadius: '10px',
                background: '#FEF3F2',
                border: '1px solid #FDA29B',
                color: '#B42318',
                fontSize: '0.9rem',
                fontWeight: 500,
              }}>
                ⚠️ You owe <strong>${summaryData.ledger.owed_now.toFixed(2)}</strong> in claims but only{' '}
                <strong>${summaryData.ledger.funded_remaining.toFixed(2)}</strong> of your share budget is
                funded — a <strong>${summaryData.ledger.shortfall.toFixed(2)}</strong> shortfall. Reload your
                share budget to cover these payouts.
              </div>
            )}
          </>
        )}

        {/* Extra-share request inbox (daily share-limit rule) */}
        <ShareRequestsInbox campaignId={campaignId} />

        {/* Status Filter Bar */}
        <FilterBar>
          {STATUS_OPTIONS.map((option) => {
            const IconComponent = option.icon
            return (
              <button
                key={option.value}
                onClick={() => {
                  setSelectedStatus(option.value)
                  setPage(1)
                }}
                title={`Filter by ${option.label}`}
                data-active={selectedStatus === option.value}
              >
                <IconComponent size={16} />
                {option.label}
              </button>
            )
          })}
        </FilterBar>

        {/* C3: in-campaign search */}
        <SearchBox>
          <Search size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search this campaign's sharers by name, @username or email…"
          />
        </SearchBox>

        {/* C2: bulk action bar */}
        {selected.size > 0 && (
          <BulkBar>
            <span className="meta">
              {selected.size} selected ·{' '}
              ${(requestsData?.withdrawals || [])
                .filter((r: any) => selected.has(r.id))
                .reduce((s: number, r: any) => s + r.amount, 0)
                .toFixed(2)}
            </span>
            <div className="actions">
              <button className="clear" onClick={() => setSelected(new Set())}>Clear</button>
              <button className="pay" onClick={() => { setBulkReference(''); setBulkOpen(true) }}>
                Mark {selected.size} paid
              </button>
            </div>
          </BulkBar>
        )}

        {/* Requests Table */}
        {requestsLoading ? (
          <LoadingState>Loading payout requests...</LoadingState>
        ) : requestsError ? (
          <EmptyState>
            <AlertCircle />
            <h3>Error Loading Requests</h3>
            <p>{(requestsError as any).message || 'Failed to load payout requests'}</p>
          </EmptyState>
        ) : !requestsData?.withdrawals || requestsData.withdrawals.length === 0 ? (
          <EmptyState>
            <DollarSign />
            <h3>{selectedStatus === 'actionable' ? "You're all caught up" : 'No claims to show'}</h3>
            <p>
              {selectedStatus === 'actionable'
                ? 'No sharer payouts are waiting on you right now. New claims will appear here to pay.'
                : 'When sharers claim their earnings, their payment requests show up here for you to pay.'}
            </p>
          </EmptyState>
        ) : (
          (() => {
            // C3: filter by sharer name/username/email within the campaign.
            const sq = search.trim().toLowerCase()
            const visible = sq
              ? requestsData.withdrawals.filter((r: any) =>
                  `${r.sharer?.name || ''} ${r.sharer?.username || ''} ${r.sharer?.email || ''}`.toLowerCase().includes(sq)
                )
              : requestsData.withdrawals
            if (visible.length === 0) {
              return (
                <EmptyState>
                  <DollarSign />
                  <h3>No matches</h3>
                  <p>No sharers match “{search}”.</p>
                </EmptyState>
              )
            }
            // C1: group claims by payout method so the creator can batch one rail.
            const groups: Record<string, any[]> = {}
            visible.forEach((r: any) => {
              const key = r.payment_method?.type || 'other'
              ;(groups[key] = groups[key] || []).push(r)
            })
            const label = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

            return Object.entries(groups).map(([method, rows]) => {
              const pendingRows = rows.filter(isPendingSlice)
              const groupTotal = rows.reduce((s, r) => s + r.amount, 0)
              const allSel = pendingRows.length > 0 && pendingRows.every((r) => selected.has(r.id))
              const toggleGroup = () => {
                setSelected((prev) => {
                  const n = new Set(prev)
                  if (allSel) pendingRows.forEach((r) => n.delete(r.id))
                  else pendingRows.forEach((r) => n.add(r.id))
                  return n
                })
              }
              return (
                <RequestsTable key={method}>
                  <MethodHead>
                    <label>
                      {pendingRows.length > 0 && (
                        <input type="checkbox" checked={allSel} onChange={toggleGroup} />
                      )}
                      <strong>{label(method)}</strong>
                      <span>{rows.length} claim{rows.length !== 1 ? 's' : ''} · ${groupTotal.toFixed(2)}</span>
                    </label>
                    {pendingRows.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <small>{pendingRows.length} to pay</small>
                        <button
                          type="button"
                          onClick={() => copyGroupToPay(rows)}
                          title="Copy name · handle · amount for all pending in this group"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: tk.white, border: `1px solid ${tk.border}`, color: tk.amberDark,
                            borderRadius: 8, padding: '5px 10px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                          }}
                        >
                          <Copy size={13} /> Copy to pay
                        </button>
                      </div>
                    )}
                  </MethodHead>
                  <TableHeader>
                    <div>Sharer</div>
                    <div>Payment Method</div>
                    <div>Amount</div>
                    <div>Status</div>
                    <div>Requested</div>
                    <div>Action</div>
                  </TableHeader>

                  {rows.map((request: any) => {
                    const pending = isPendingSlice(request)
                    return (
                      <TableRow key={request.id} data-selected={selected.has(request.id)}>
                        <SharerInfo>
                          {pending && (
                            <input
                              type="checkbox"
                              checked={selected.has(request.id)}
                              onChange={() => toggleSelect(request.id)}
                              style={{ width: 18, height: 18, flexShrink: 0, cursor: 'pointer' }}
                            />
                          )}
                          {request.sharer.profile_picture && (
                            <img src={request.sharer.profile_picture} alt={request.sharer.name} />
                          )}
                          <div className="details">
                            <h4>{request.sharer.name}</h4>
                            <p>@{request.sharer.username} • {request.sharer.email}</p>
                          </div>
                        </SharerInfo>

                        <PaymentDetails>
                          <div className="type">
                            {request.payment_method.type.replace('_', ' ').toUpperCase()}
                          </div>
                          <div className="details">
                            {request.payment_method.account_holder && `${request.payment_method.account_holder} `}
                            {request.payment_method.last4 && `•••• ${request.payment_method.last4}`}
                          </div>
                        </PaymentDetails>

                        <AmountColumn>
                          <div className="amount">${request.amount.toFixed(2)}</div>
                          {request.slice_received_at && (
                            <div className="with-fee" style={{ color: tk.green }}>✓ received</div>
                          )}
                        </AmountColumn>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-start' }}>
                          {(() => {
                            const display = isDisputedSlice(request) ? 'disputed' : pending ? 'pending' : request.status
                            return (
                              <StatusBadge className={display}>
                                {display.charAt(0).toUpperCase() + display.slice(1)}
                              </StatusBadge>
                            )
                          })()}
                          {request.slice_proof_url && (
                            <a href={request.slice_proof_url} target="_blank" rel="noopener noreferrer"
                               style={{ fontSize: '0.72rem', color: tk.blue, textDecoration: 'underline' }}>
                              view proof
                            </a>
                          )}
                        </div>

                        <div style={{ fontSize: '0.9rem', color: tk.muted }}>
                          {new Date(request.requested_at).toLocaleDateString()}
                          {pending && (() => {
                            const d = ageDays(request.requested_at)
                            return (
                              <div style={{ fontSize: '0.75rem', fontWeight: d > 7 ? 700 : 500, color: ageColor(d), marginTop: 3 }}>
                                {d > 7 ? '⚠ ' : ''}waiting {d}d
                                {request.slice_reminder_count > 0 && ` · ${request.slice_reminder_count} reminder${request.slice_reminder_count !== 1 ? 's' : ''}`}
                              </div>
                            )
                          })()}
                        </div>

                        <ActionButtons>
                          <button onClick={() => setSelectedRequest(request)} title="View account details" style={{ background: tk.blue }}>
                            <Eye size={14} /> Details
                          </button>
                          <button
                            onClick={() => setTrackingSharer({ id: request.sharer.id, name: request.sharer.name || request.sharer.username || 'Sharer' })}
                            title="View this sharer's share/conversion tracking before paying"
                            style={{ background: tk.green }}
                          >
                            <Activity size={14} /> Tracking
                          </button>
                          {isDisputedSlice(request) ? (
                            <span style={{ color: tk.red, fontWeight: 600, fontSize: '0.8rem' }}>⚠ Disputed</span>
                          ) : pending ? (
                            <>
                              <button
                                onClick={() => { setPayRequest(request); setPayReference(''); setPayProof(null) }}
                                disabled={isMarking}
                                title="Record payment to this sharer"
                              >
                                <Send size={14} /> Mark Paid
                              </button>
                              <button
                                onClick={() => { setDisputeRequest(request); setDisputeReason('') }}
                                title="Dispute this claim"
                                style={{ background: tk.red }}
                              >
                                <Flag size={14} /> Dispute
                              </button>
                            </>
                          ) : request.status === 'completed' ? (
                            <span style={{ color: tk.green, fontWeight: 600, fontSize: '0.8rem' }}>✓ Completed</span>
                          ) : (
                            <span style={{ color: tk.blue, fontWeight: 600, fontSize: '0.8rem' }}>✓ You paid · awaiting other campaigns</span>
                          )}
                        </ActionButtons>
                      </TableRow>
                    )
                  })}
                </RequestsTable>
              )
            })
          })()
        )}

        {/* Pagination */}
        {requestsData?.pagination && requestsData.pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.5 : 1
              }}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
              Page {page} of {requestsData.pagination.pages}
            </span>
            <button
              onClick={() => setPage(Math.min(requestsData.pagination.pages, page + 1))}
              disabled={page === requestsData.pagination.pages}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                cursor: page === requestsData.pagination.pages ? 'not-allowed' : 'pointer',
                opacity: page === requestsData.pagination.pages ? 0.5 : 1
              }}
            >
              Next
            </button>
          </div>
        )}
      </Container>

      {/* Account Details Modal */}
      <Overlay isOpen={!!selectedRequest} onClick={() => setSelectedRequest(null)} />
      <DetailModal isOpen={!!selectedRequest}>
        {selectedRequest && (
          <>
            <ModalHeader>
              <h2>Sharer Account Details</h2>
              <button onClick={() => setSelectedRequest(null)}>
                <X size={24} />
              </button>
            </ModalHeader>

            {/* Sharer Information */}
            <ModalSection>
              <SharerDetails>
                {selectedRequest.sharer.profile_picture && (
                  <img src={selectedRequest.sharer.profile_picture} alt={selectedRequest.sharer.name} />
                )}
                <div className="info">
                  <h4>{selectedRequest.sharer.name}</h4>
                  <p>@{selectedRequest.sharer.username}</p>
                  <p>{selectedRequest.sharer.email}</p>
                </div>
              </SharerDetails>
            </ModalSection>

            {/* Payout Amount Details */}
            <ModalSection>
              <h3>📊 Payout Details</h3>
              <DetailField>
                <div className="label">Requested Amount</div>
                <div className="value">${selectedRequest.amount.toFixed(2)}</div>
              </DetailField>
              <DetailField>
                <div className="label">Processing Fee</div>
                <div className="value">-${selectedRequest.fee.toFixed(2)}</div>
              </DetailField>
              <DetailField>
                <div className="label">Amount After Fee</div>
                <div className="value">${(selectedRequest.amount - selectedRequest.fee).toFixed(2)}</div>
              </DetailField>
              <DetailField>
                <div className="label">Status</div>
                <div className="value">
                  <StatusBadge className={selectedRequest.status}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </StatusBadge>
                </div>
              </DetailField>
              <DetailField>
                <div className="label">Requested Date</div>
                <div className="value">{new Date(selectedRequest.requested_at).toLocaleString()}</div>
              </DetailField>
            </ModalSection>

            {/* Payment Method Details */}
            <ModalSection>
              <h3>💳 Payment Method Details</h3>
              <DetailField>
                <div className="label">Payment Method Type</div>
                <div className="value">
                  {selectedRequest.payment_method.type.replace(/_/g, ' ').toUpperCase()}
                </div>
              </DetailField>

              {/* Bank Transfer Details */}
              {selectedRequest.payment_method.type === 'bank_transfer' && (
                <>
                  {selectedRequest.payment_method.bank_account_holder && (
                    <DetailField>
                      <div className="label">Account Holder Name</div>
                      <div className="value">
                        <span>{selectedRequest.payment_method.bank_account_holder}</span>
                        <button
                          className="copy-btn"
                          onClick={() =>
                            handleCopyToClipboard(
                              selectedRequest.payment_method.bank_account_holder,
                              'bank_account_holder'
                            )
                          }
                        >
                          <Copy size={12} />
                          {copiedField === 'bank_account_holder' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </DetailField>
                  )}

                  {selectedRequest.payment_method.bank_name && (
                    <DetailField>
                      <div className="label">Bank Name</div>
                      <div className="value">
                        <span>{selectedRequest.payment_method.bank_name}</span>
                        <button
                          className="copy-btn"
                          onClick={() =>
                            handleCopyToClipboard(
                              selectedRequest.payment_method.bank_name,
                              'bank_name'
                            )
                          }
                        >
                          <Copy size={12} />
                          {copiedField === 'bank_name' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </DetailField>
                  )}

                  {selectedRequest.payment_method.bank_account_number && (
                    <DetailField>
                      <div className="label">Account Number</div>
                      <div className="value">
                        <span>{selectedRequest.payment_method.bank_account_number}</span>
                        <button
                          className="copy-btn"
                          onClick={() =>
                            handleCopyToClipboard(
                              selectedRequest.payment_method.bank_account_number,
                              'bank_account_number'
                            )
                          }
                        >
                          <Copy size={12} />
                          {copiedField === 'bank_account_number' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </DetailField>
                  )}

                  {selectedRequest.payment_method.bank_account_type && (
                    <DetailField>
                      <div className="label">Account Type</div>
                      <div className="value">
                        {selectedRequest.payment_method.bank_account_type.charAt(0).toUpperCase() +
                          selectedRequest.payment_method.bank_account_type.slice(1)}
                      </div>
                    </DetailField>
                  )}

                  {selectedRequest.payment_method.bank_routing_number && (
                    <DetailField>
                      <div className="label">Routing Number</div>
                      <div className="value">
                        <span>{selectedRequest.payment_method.bank_routing_number}</span>
                        <button
                          className="copy-btn"
                          onClick={() =>
                            handleCopyToClipboard(
                              selectedRequest.payment_method.bank_routing_number,
                              'bank_routing_number'
                            )
                          }
                        >
                          <Copy size={12} />
                          {copiedField === 'bank_routing_number' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </DetailField>
                  )}

                  {/* Note about account details */}
                  <div style={{
                    background: '#e3f2fd',
                    padding: '1rem',
                    borderRadius: '8px',
                    borderLeft: '4px solid #1976d2',
                    fontSize: '0.9rem',
                    color: '#0d47a1',
                    marginTop: '1rem'
                  }}>
                    <strong>💡 Note:</strong> Full account and routing numbers are displayed here for bank transfer processing. Keep this information secure and only share with authorized payment processors.
                  </div>
                </>
              )}

              {/* Mobile Money Details */}
              {selectedRequest.payment_method.type === 'mobile_money' && (
                <>
                  {selectedRequest.payment_method.mobile_money_provider && (
                    <DetailField>
                      <div className="label">Mobile Money Provider</div>
                      <div className="value">
                        {selectedRequest.payment_method.mobile_money_provider.toUpperCase()}
                      </div>
                    </DetailField>
                  )}

                  {selectedRequest.payment_method.mobile_number && (
                    <DetailField>
                      <div className="label">Mobile Number</div>
                      <div className="value">
                        <span>{selectedRequest.payment_method.mobile_number}</span>
                        <button
                          className="copy-btn"
                          onClick={() =>
                            handleCopyToClipboard(
                              selectedRequest.payment_method.mobile_number,
                              'mobile_number'
                            )
                          }
                        >
                          <Copy size={12} />
                          {copiedField === 'mobile_number' ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                    </DetailField>
                  )}

                  {selectedRequest.payment_method.mobile_country_code && (
                    <DetailField>
                      <div className="label">Country Code</div>
                      <div className="value">
                        {selectedRequest.payment_method.mobile_country_code}
                      </div>
                    </DetailField>
                  )}
                </>
              )}

              {/* Card Details */}
              {selectedRequest.payment_method.type === 'stripe' && (
                <>
                  {selectedRequest.payment_method.card_brand && (
                    <DetailField>
                      <div className="label">Card Brand</div>
                      <div className="value">
                        {selectedRequest.payment_method.card_brand.charAt(0).toUpperCase() +
                          selectedRequest.payment_method.card_brand.slice(1)}
                      </div>
                    </DetailField>
                  )}

                  {selectedRequest.payment_method.card_last_four && (
                    <DetailField>
                      <div className="label">Card Last 4</div>
                      <div className="value">•••• {selectedRequest.payment_method.card_last_four}</div>
                    </DetailField>
                  )}
                </>
              )}
            </ModalSection>
          </>
        )}
      </DetailModal>

      {/* F-2: Mark-Paid modal — reference + optional proof screenshot */}
      <Overlay isOpen={!!payRequest} onClick={() => !isMarking && setPayRequest(null)} />
      <DetailModal isOpen={!!payRequest}>
        {payRequest && (
          <>
            <ModalHeader>
              <h2>Record payment</h2>
              <button onClick={() => !isMarking && setPayRequest(null)}>
                <X size={24} />
              </button>
            </ModalHeader>

            <div style={{ padding: '0 0 1rem' }}>
              <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: 0 }}>
                Confirm you&apos;ve paid <strong>{payRequest.sharer?.name || payRequest.sharer?.username || 'this sharer'}</strong>{' '}
                <strong>${Number(payRequest.amount).toFixed(2)}</strong> off-platform. A reference or
                screenshot gives the sharer evidence and you a dispute trail.
              </p>

              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: '0.75rem 0 0.35rem' }}>
                Reference / transaction number (optional)
              </label>
              <input
                type="text"
                value={payReference}
                onChange={(e) => setPayReference(e.target.value)}
                placeholder="e.g. PayPal txn 4XY..., bank ref 99812"
                style={{ width: '100%', padding: '9px 11px', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '0.88rem' }}
              />

              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', margin: '0.9rem 0 0.35rem' }}>
                Proof screenshot (optional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setPayProof(e.target.files?.[0] || null)}
                style={{ fontSize: '0.85rem' }}
              />
              {payProof && (
                <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: 4 }}>{payProof.name} attached</div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
                <button
                  onClick={() => setPayRequest(null)}
                  disabled={isMarking}
                  style={{ flex: 1, background: '#fff', border: '1px solid #cbd5e1', color: '#334155', borderRadius: 8, padding: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitMarkAsPaid}
                  disabled={isMarking}
                  style={{ flex: 1, background: '#16a34a', border: 'none', color: '#fff', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer', opacity: isMarking ? 0.6 : 1 }}
                >
                  {isMarking ? 'Saving…' : 'Confirm paid'}
                </button>
              </div>
            </div>
          </>
        )}
      </DetailModal>

      {/* C2: bulk Mark-Paid modal — one shared reference for all selected */}
      <Overlay isOpen={bulkOpen} onClick={() => !bulkBusy && setBulkOpen(false)} />
      <DetailModal isOpen={bulkOpen}>
        <ModalHeader>
          <h2>Mark {selected.size} payouts paid</h2>
          <button onClick={() => !bulkBusy && setBulkOpen(false)}><X size={24} /></button>
        </ModalHeader>
        <div style={{ padding: '0 0 1rem' }}>
          <p style={{ color: tk.body, fontSize: '0.9rem', marginTop: 0 }}>
            Confirm you&apos;ve paid all <strong>{selected.size}</strong> selected sharers off-platform.
            One reference is recorded against each (optional).
          </p>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: tk.ink, margin: '0.5rem 0 0.35rem' }}>
            Shared reference / batch id (optional)
          </label>
          <input
            type="text"
            value={bulkReference}
            onChange={(e) => setBulkReference(e.target.value)}
            placeholder="e.g. PayPal batch 2026-07-01"
            style={{ width: '100%', padding: '9px 11px', border: `1px solid ${tk.border}`, borderRadius: 8, fontSize: '0.88rem' }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
            <button
              onClick={() => setBulkOpen(false)}
              disabled={bulkBusy}
              style={{ flex: 1, background: '#fff', border: `1px solid ${tk.border}`, color: tk.body, borderRadius: 8, padding: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              onClick={submitBulkPaid}
              disabled={bulkBusy}
              style={{ flex: 1, background: tk.green, border: 'none', color: '#fff', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer', opacity: bulkBusy ? 0.6 : 1 }}
            >
              {bulkBusy ? 'Marking…' : `Confirm ${selected.size} paid`}
            </button>
          </div>
        </div>
      </DetailModal>

      {/* Phase 4: Sharer tracking proof view — what you inspect before paying */}
      <Overlay isOpen={!!trackingSharer} onClick={() => setTrackingSharer(null)} />
      <DetailModal isOpen={!!trackingSharer}>
        {trackingSharer && (
          <>
            <ModalHeader>
              <h2>Share tracking — {trackingSharer.name}</h2>
              <button onClick={() => setTrackingSharer(null)}><X size={24} /></button>
            </ModalHeader>

            {trackingLoading ? (
              <LoadingState>Loading tracking…</LoadingState>
            ) : !tracking ? (
              <EmptyState>
                <Activity />
                <h3>No tracking found</h3>
                <p>This sharer has no recorded shares for this campaign.</p>
              </EmptyState>
            ) : (
              <>
                {/* Headline tallies */}
                <ModalSection>
                  <h3>📈 Summary</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                    <DetailField>
                      <div className="label"><Share2 size={12} style={{ verticalAlign: 'middle' }} /> Shares</div>
                      <div className="value">{tracking.share_summary.total_shares}</div>
                    </DetailField>
                    <DetailField>
                      <div className="label"><MousePointerClick size={12} style={{ verticalAlign: 'middle' }} /> Clicks</div>
                      <div className="value">{tracking.share_summary.total_clicks}</div>
                    </DetailField>
                    <DetailField>
                      <div className="label">Conversions</div>
                      <div className="value">{tracking.share_summary.total_conversions}</div>
                    </DetailField>
                    <DetailField>
                      <div className="label">Owed / Paid</div>
                      <div className="value" style={{ fontSize: '0.95rem' }}>
                        ${tracking.totals.owed_dollars} / ${tracking.totals.paid_dollars}
                      </div>
                    </DetailField>
                  </div>
                </ModalSection>

                {/* Converting donations — the evidence each reward is real */}
                <ModalSection>
                  <h3>💸 Converting donations ({tracking.totals.conversion_count})</h3>
                  {tracking.conversions.length === 0 ? (
                    <p style={{ color: tk.muted, fontSize: '0.9rem', margin: 0 }}>No conversions yet.</p>
                  ) : (
                    tracking.conversions.map((c) => (
                      <DetailField key={c.reward_id}>
                        <div className="value" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.9rem' }}>
                            {c.donation.amount_cents != null
                              ? `$${(c.donation.amount_cents / 100).toFixed(2)} donation`
                              : 'Donation'}
                            {c.channel ? ` · ${c.channel}` : ''}
                            {c.donation.donated_at ? ` · ${new Date(c.donation.donated_at).toLocaleDateString()}` : ''}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            <strong>+${(c.reward_amount_cents / 100).toFixed(2)}</strong>
                            <StatusBadge className={c.reward_status === 'paid' ? 'completed' : 'pending'}>
                              {c.reward_status === 'paid' ? 'Paid' : 'Owed'}
                            </StatusBadge>
                          </span>
                        </div>
                      </DetailField>
                    ))
                  )}
                </ModalSection>

                {/* Raw share links */}
                <ModalSection>
                  <h3>🔗 Shares</h3>
                  {tracking.shares.length === 0 ? (
                    <p style={{ color: tk.muted, fontSize: '0.9rem', margin: 0 }}>No shares recorded.</p>
                  ) : (
                    tracking.shares.map((s) => (
                      <DetailField key={s.share_id}>
                        <div className="value" style={{ fontSize: '0.85rem' }}>
                          <span>{s.channel} · {s.referral_code}</span>
                          <span style={{ color: tk.muted }}>{s.clicks} clicks · {s.conversions} conv.</span>
                        </div>
                      </DetailField>
                    ))
                  )}
                </ModalSection>
              </>
            )}
          </>
        )}
      </DetailModal>

      {/* Phase 4: Dispute modal */}
      <Overlay isOpen={!!disputeRequest} onClick={() => !isDisputing && setDisputeRequest(null)} />
      <DetailModal isOpen={!!disputeRequest}>
        {disputeRequest && (
          <>
            <ModalHeader>
              <h2>Dispute claim</h2>
              <button onClick={() => !isDisputing && setDisputeRequest(null)}><X size={24} /></button>
            </ModalHeader>
            <div style={{ padding: '0 0 1rem' }}>
              <p style={{ color: tk.body, fontSize: '0.9rem', marginTop: 0 }}>
                Dispute <strong>{disputeRequest.sharer?.name || disputeRequest.sharer?.username || 'this sharer'}</strong>&apos;s{' '}
                <strong>${Number(disputeRequest.amount).toFixed(2)}</strong> claim if you believe it&apos;s
                fraudulent or incorrect. The sharer is notified; the claim is held until resolved.
              </p>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: tk.ink, margin: '0.5rem 0 0.35rem' }}>
                Reason <span style={{ color: tk.red }}>*</span>
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder="e.g. Conversions look like self-referrals / fake donations…"
                rows={4}
                style={{ width: '100%', padding: '9px 11px', border: `1px solid ${tk.border}`, borderRadius: 8, fontSize: '0.88rem', resize: 'vertical', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', gap: 10, marginTop: '1.25rem' }}>
                <button
                  onClick={() => setDisputeRequest(null)}
                  disabled={isDisputing}
                  style={{ flex: 1, background: '#fff', border: `1px solid ${tk.border}`, color: tk.body, borderRadius: 8, padding: '10px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitDispute}
                  disabled={isDisputing || !disputeReason.trim()}
                  style={{ flex: 1, background: tk.red, border: 'none', color: '#fff', borderRadius: 8, padding: '10px', fontWeight: 700, cursor: 'pointer', opacity: (isDisputing || !disputeReason.trim()) ? 0.6 : 1 }}
                >
                  {isDisputing ? 'Submitting…' : 'Submit dispute'}
                </button>
              </div>
            </div>
          </>
        )}
      </DetailModal>
    </PageWrapper>
  )
}
