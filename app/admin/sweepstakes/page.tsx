'use client'

import { useState, useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import Link from 'next/link'
import { toast } from 'react-toastify'
import {
  Plus,
  Settings,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  ChevronDown,
  Filter,
  Search,
  Loader,
} from 'lucide-react'
import {
  useCreateSweepstakes,
  useSelectWinner,
  useClaimsForSweepstakes,
  useApproveClaim,
  useRejectClaim,
  useAllSweepstakes,
} from '@/api/hooks/useSimpleSweepstakes'
import Button from '@/components/ui/Button'

// ============ FONTS & DESIGN TOKENS (shared with /dashboard) ============

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
`

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberDark:   '#A8680A',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
  blueDark:    '#0D4A8C',
}

// ============ STYLED COMPONENTS ============

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) 4rem;
`

const Content = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`

const HeaderContent = styled.div`
  .eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    color: ${tk.muted};
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin: 0 0 4px;
  }

  h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 800;
    background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }

  p {
    color: ${tk.muted};
    font-size: 0.9rem;
    margin: 8px 0 0;
  }

  @media (max-width: 640px) {
    p { font-size: 0.82rem; }
  }
`

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
  }
`

const TabsContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 2rem;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const Tab = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${(props) => (props.active ? tk.white : 'transparent')};
  border: none;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: ${(props) => (props.active ? '600' : '400')};
  color: ${(props) => (props.active ? tk.heading : tk.muted)};
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: ${(props) => (props.active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none')};

  &:hover {
    color: ${tk.heading};
  }
`

const Card = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: border-color 200ms, box-shadow 200ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 2px 8px rgba(26, 95, 168, 0.08);
  }

  @media (max-width: 640px) {
    padding: 1.125rem;
    margin-bottom: 1rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`

const StatCard = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  transition: box-shadow 180ms, border-color 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    margin-bottom: 0.875rem;
    background: ${tk.amberLight};
  }

  .stat-label {
    font-size: 0.75rem;
    color: ${tk.muted};
    margin-bottom: 0.4rem;
    font-weight: 400;
  }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.4rem, 2.5vw, 1.75rem);
    font-weight: 800;
    color: ${tk.heading};
    line-height: 1;
  }

  &.winners .stat-icon { background: ${tk.greenLight}; }
  &.pending .stat-icon { background: ${tk.amberLight}; }
  &.active  .stat-icon { background: ${tk.blueLight}; }

  @media (max-width: 640px) {
    padding: 1rem;

    .stat-icon {
      width: 36px;
      height: 36px;
      font-size: 1.1rem;
      margin-bottom: 0.625rem;
    }

    .stat-value {
      font-size: 1.5rem;
    }
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    color: ${tk.heading};
    font-size: 0.9rem;
  }

  input,
  select,
  textarea {
    padding: 0.75rem;
    border: 1.5px solid ${tk.border};
    border-radius: 10px;
    font-size: 0.95rem;
    font-family: 'DM Sans', sans-serif;
    color: ${tk.heading};
    background: ${tk.white};
    transition: border-color 180ms, box-shadow 180ms;

    &::placeholder { color: ${tk.muted}; }

    &:focus {
      outline: none;
      border-color: ${tk.blue};
      box-shadow: 0 0 0 3px rgba(26, 95, 168, 0.15);
    }

    &:disabled {
      background-color: ${tk.canvasDeep};
      color: ${tk.muted};
    }
  }

  @media (max-width: 640px) {
    label { font-size: 0.875rem; }

    input,
    select,
    textarea {
      padding: 0.65rem;
      font-size: 0.9rem;
    }
  }
`

const HelperText = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  color: ${tk.muted};
  margin-top: 0.25rem;
`

const MessageBox = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.9rem;

  strong { font-family: 'Syne', sans-serif; font-weight: 700; }

  ${(props) => {
    switch (props.type) {
      case 'success':
        return `background: ${tk.greenLight}; border: 1px solid rgba(26,122,74,0.2); color: ${tk.green};`;
      case 'error':
        return `background: ${tk.redLight}; border: 1px solid rgba(192,57,43,0.2); color: ${tk.red};`;
      case 'info':
        return `background: ${tk.blueLight}; border: 1px solid rgba(26,95,168,0.2); color: ${tk.blueDark};`;
    }
  }}

  svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  @media (max-width: 640px) {
    padding: 0.75rem;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    gap: 0.5rem;

    svg {
      width: 20px;
      height: 20px;
    }
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;

  thead {
    background: ${tk.canvas};
    border-bottom: 1px solid ${tk.border};
  }

  th {
    padding: 0.875rem 1rem;
    text-align: left;
    font-family: 'DM Mono', monospace;
    font-weight: 500;
    color: ${tk.muted};
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  td {
    padding: 1rem;
    border-bottom: 1px solid ${tk.canvasDeep};
    font-size: 0.875rem;
    color: ${tk.body};
  }

  tbody tr:hover {
    background: ${tk.canvas};
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    font-size: 0.9rem;

    th, td {
      padding: 0.75rem 0.5rem;
    }
  }

  @media (max-width: 640px) {
    font-size: 0.8rem;
    display: block;

    thead {
      display: none;
    }

    tbody {
      display: block;
    }

    tr {
      display: block;
      border: 1px solid ${tk.border};
      border-radius: 12px;
      margin-bottom: 1rem;
      background: ${tk.white};
    }

    td {
      display: block;
      padding: 0.5rem;
      border: none;
      border-bottom: 1px solid ${tk.canvasDeep};
      text-align: right;
      position: relative;
      padding-left: 40%;
    }

    td:last-child {
      border-bottom: none;
    }

    td:before {
      content: attr(data-label);
      position: absolute;
      left: 0.5rem;
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      color: ${tk.muted};
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.4px;
    }
  }
`

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 9999px;
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.3px;

  ${(props) => {
    switch (props.status) {
      case 'active':
        return `background: ${tk.blueLight}; color: ${tk.blue};`;
      case 'completed':
        return `background: ${tk.greenLight}; color: ${tk.green};`;
      case 'pending':
        return `background: ${tk.amberLight}; color: ${tk.amberDark};`;
      case 'approved':
        return `background: ${tk.greenLight}; color: ${tk.green};`;
      case 'claimed':
        return `background: ${tk.greenLight}; color: ${tk.green};`;
      case 'rejected':
        return `background: ${tk.redLight}; color: ${tk.red};`;
      case 'expired':
        return `background: ${tk.canvasDeep}; color: ${tk.muted};`;
      default:
        return `background: ${tk.canvasDeep}; color: ${tk.muted};`;
    }
  }}
`

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;

  button {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    min-height: 36px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;

    button {
      padding: 0.75rem 0.5rem;
      font-size: 0.8rem;
      width: 100%;
      min-height: 40px;
    }
  }
`

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(24, 23, 26, 0.55);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`

const ModalContent = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 24px 60px rgba(24, 23, 26, 0.28);
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  font-family: 'DM Sans', sans-serif;

  @media (max-width: 640px) {
    padding: 1.5rem 1rem;
    max-width: calc(100% - 1rem);
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: ${tk.muted};
  padding: 6px;
  border-radius: 8px;
  display: flex;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: ${tk.heading};
    background: ${tk.canvasDeep};
  }
`

const ModalTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: ${tk.heading};
  letter-spacing: -0.3px;
  margin: 0 0 1.5rem 0;

  @media (max-width: 640px) {
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;

  @media (max-width: 480px) {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`

const PaymentDetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: ${tk.canvas};
  border-radius: 14px;
  border: 1px solid ${tk.border};

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 1rem;
  }
`

const DetailField = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    font-weight: 500;
    color: ${tk.muted};
    text-transform: uppercase;
    letter-spacing: 0.4px;
    margin-bottom: 0.5rem;
  }

  p {
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    color: ${tk.heading};
    margin: 0;
    word-break: break-all;
    background: ${tk.white};
    padding: 0.75rem;
    border-radius: 10px;
    border: 1px solid ${tk.border};
  }

  @media (max-width: 600px) {
    label {
      font-size: 0.68rem;
      margin-bottom: 0.25rem;
    }

    p {
      font-size: 0.8rem;
      padding: 0.5rem;
    }
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${tk.muted};

  svg {
    width: 3rem;
    height: 3rem;
    opacity: 0.3;
    margin-bottom: 1rem;
  }

  h3 {
    font-family: 'Syne', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: ${tk.heading};
    margin: 0 0 0.5rem 0;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid rgba(212, 135, 10, 0.2);
  border-radius: 50%;
  border-top-color: ${tk.amber};
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

const SectionH = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 1.5rem 0;
`

export default function AdminSweepstakesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'claims'>('overview')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSelectWinnerModal, setShowSelectWinnerModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const [createForm, setCreateForm] = useState({
    month: new Date().toISOString().slice(0, 7),
    prizeAmount: '500',
  })

  const [selectedSweepstakesId, setSelectedSweepstakesId] = useState<string | null>(null)
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null)
  const [selectedClaimForDetails, setSelectedClaimForDetails] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [selectionMethod, setSelectionMethod] = useState<'random' | 'manual'>('random')
  const [selectedUserId, setSelectedUserId] = useState('')

  const createSweepstakes = useCreateSweepstakes()
  const selectWinner = useSelectWinner(selectedSweepstakesId || '')
  const claimsForSweepstakes = useClaimsForSweepstakes(selectedSweepstakesId || '')
  const approveClaim = useApproveClaim(selectedSweepstakesId || '')
  const rejectClaimMutation = useRejectClaim(selectedSweepstakesId || '')
  const { data: allSweepstakesResponse, isLoading: isLoadingSweepstakes } = useAllSweepstakes()

  const sweepstakesList = allSweepstakesResponse?.data || []

  const handleCreateSweepstakes = (e: React.FormEvent) => {
    e.preventDefault()

    if (!createForm.month || !createForm.prizeAmount) {
      toast.error('❌ Please fill in all fields')
      return
    }

    const prizeInCents = Math.round(parseFloat(createForm.prizeAmount) * 100)
    if (isNaN(prizeInCents) || prizeInCents <= 0) {
      toast.error('❌ Please enter a valid prize amount')
      return
    }

    createSweepstakes.mutate(
      { month: createForm.month, prizeAmount: prizeInCents },
      {
        onSuccess: () => {
          setCreateForm({
            month: new Date().toISOString().slice(0, 7),
            prizeAmount: '500',
          })
          setShowCreateModal(false)
        },
      }
    )
  }

  const handleSelectWinner = (sweepstakesId: string) => {
    setSelectedSweepstakesId(sweepstakesId)
    setShowSelectWinnerModal(true)
  }

  const handleConfirmSelectWinner = () => {
    if (selectionMethod === 'random') {
      selectWinner.mutate({ randomSelection: true }, {
        onSuccess: () => {
          setShowSelectWinnerModal(false)
          setSelectedUserId('')
          setSelectionMethod('random')
        },
      })
    } else if (selectionMethod === 'manual' && selectedUserId) {
      selectWinner.mutate({ winnerId: selectedUserId }, {
        onSuccess: () => {
          setShowSelectWinnerModal(false)
          setSelectedUserId('')
          setSelectionMethod('random')
        },
      })
    } else {
      toast.error('❌ Please select a method and provide required information')
    }
  }

  const handleApproveClaim = (claimId: string) => {
    if (!selectedSweepstakesId) return
    approveClaim.mutate({ claimId })
  }

  const handleRejectClaim = (claimId: string) => {
    setSelectedClaimId(claimId)
    setShowRejectModal(true)
  }

  const handleConfirmReject = () => {
    if (!selectedClaimId || !rejectReason.trim()) {
      toast.error('❌ Please provide a rejection reason')
      return
    }

    if (!selectedSweepstakesId) return

    rejectClaimMutation.mutate(
      {
        claimId: selectedClaimId,
        rejectionReason: rejectReason,
      },
      {
        onSuccess: () => {
          setShowRejectModal(false)
          setSelectedClaimId(null)
          setRejectReason('')
        },
      }
    )
  }

  return (
    <>
      <GlobalStyle />
      <PageContainer>
      <Content>
        {/* Header */}
        <Header>
          <HeaderContent>
            <p className="eyebrow">Admin · Sweepstakes</p>
            <h1>Sweepstakes Management</h1>
            <p>Create and manage monthly sweepstakes drawings</p>
          </HeaderContent>
          <HeaderActions>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={20} />
              Create Drawing
            </Button>
          </HeaderActions>
        </Header>

        {/* Stats Grid */}
        {activeTab === 'overview' && (
          <StatsGrid>
            <StatCard>
              <div className="stat-icon">🎁</div>
              <div className="stat-label">Current Prize</div>
              <div className="stat-value">
                ${sweepstakesList[0]?.prizeAmountDollars || '0.00'}
              </div>
            </StatCard>
            <StatCard className="winners">
              <div className="stat-icon">🏆</div>
              <div className="stat-label">Winners This Year</div>
              <div className="stat-value">
                {sweepstakesList.filter(s => s.winnerId).length}
              </div>
            </StatCard>
            <StatCard className="pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-label">Pending Claims</div>
              <div className="stat-value">—</div>
            </StatCard>
            <StatCard className="active">
              <div className="stat-icon">👥</div>
              <div className="stat-label">Total Sweepstakes</div>
              <div className="stat-value">{sweepstakesList.length}</div>
            </StatCard>
          </StatsGrid>
        )}

        {/* Tabs */}
        <TabsContainer>
          <Tab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            <TrendingUp size={18} />
            Overview
          </Tab>
          <Tab active={activeTab === 'create'} onClick={() => setActiveTab('create')}>
            <Plus size={18} />
            Create Drawing
          </Tab>
          <Tab active={activeTab === 'claims'} onClick={() => setActiveTab('claims')}>
            <Users size={18} />
            Prize Claims
          </Tab>
        </TabsContainer>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Card>
            <SectionH>Recent Drawings</SectionH>

            {isLoadingSweepstakes ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <LoadingSpinner style={{ marginRight: '0.5rem' }} />
                Loading sweepstakes...
              </div>
            ) : sweepstakesList.length === 0 ? (
              <EmptyState>
                <AlertCircle size={48} />
                <h3>No Sweepstakes Found</h3>
                <p>Create your first sweepstakes by clicking the "Create Drawing" button.</p>
              </EmptyState>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Prize</th>
                    <th>Status</th>
                    <th>Winner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sweepstakesList.map((sweepstakes) => (
                    <tr key={sweepstakes.id}>
                      <td style={{ fontWeight: 600 }}>{sweepstakes.month}</td>
                      <td>${sweepstakes.prizeAmountDollars || '0.00'}</td>
                      <td>
                        <StatusBadge status={sweepstakes.status}>
                          {sweepstakes.status.charAt(0).toUpperCase() + sweepstakes.status.slice(1)}
                        </StatusBadge>
                      </td>
                      <td>{sweepstakes.winnerId ? '✅ Selected' : '—'}</td>
                      <td>
                        <ActionButtons>
                          {sweepstakes.status === 'active' && !sweepstakes.winnerId && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleSelectWinner(sweepstakes.id)}
                            >
                              Select Winner
                            </Button>
                          )}
                          {sweepstakes.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedSweepstakesId(sweepstakes.id)
                                setActiveTab('claims')
                              }}
                            >
                              View Claims
                            </Button>
                          )}
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <Card>
            <SectionH>Create New Drawing</SectionH>

            <MessageBox type="info">
              <AlertCircle size={20} />
              <div>
                <strong>Monthly Drawing</strong>
                <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                  All eligible users (18+, valid state, active account) will automatically be entered. Select
                  winner after entry period ends.
                </p>
              </div>
            </MessageBox>

            <Form onSubmit={handleCreateSweepstakes}>
              <FormGrid>
                <FormGroup>
                  <label htmlFor="month">Month (YYYY-MM) *</label>
                  <input
                    id="month"
                    type="month"
                    value={createForm.month}
                    onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
                    disabled={createSweepstakes.isPending}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <label htmlFor="prizeAmount">Prize Amount ($) *</label>
                  <input
                    id="prizeAmount"
                    type="number"
                    placeholder="500.00"
                    value={createForm.prizeAmount}
                    onChange={(e) => setCreateForm({ ...createForm, prizeAmount: e.target.value })}
                    step="0.01"
                    min="0"
                    disabled={createSweepstakes.isPending}
                    required
                  />
                  <HelperText>Enter amount in dollars (will be stored in cents)</HelperText>
                </FormGroup>
              </FormGrid>

              <Button
                variant="primary"
                type="submit"
                disabled={createSweepstakes.isPending}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {createSweepstakes.isPending ? (
                  <>
                    <LoadingSpinner />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Create Sweepstakes
                  </>
                )}
              </Button>
            </Form>
          </Card>
        )}

        {/* Claims Tab */}
        {activeTab === 'claims' && (
          <Card>
            <SectionH>Prize Claims</SectionH>

            {selectedSweepstakesId ? (
              <>
                <MessageBox type="info">
                  <AlertCircle size={20} />
                  <div>
                    <strong>Review Claims</strong>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                      Verify payment information and approve valid claims. Rejected claims expire automatically.
                    </p>
                  </div>
                </MessageBox>

                {claimsForSweepstakes.isLoading ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    <LoadingSpinner style={{ marginRight: '0.5rem' }} />
                    Loading claims...
                  </div>
                ) : !claimsForSweepstakes.data?.data || claimsForSweepstakes.data.data.length === 0 ? (
                  <EmptyState>
                    <AlertCircle size={48} />
                    <h3>No Claims</h3>
                    <p>No prize claims have been submitted for this sweepstakes yet.</p>
                  </EmptyState>
                ) : (
                  <Table>
                    <thead>
                      <tr>
                        <th>Winner Email</th>
                        <th>Prize Amount</th>
                        <th>Status</th>
                        <th>Claimed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(claimsForSweepstakes.data?.data?.claims || []).map((claim: any) => (
                        <tr key={claim.id}>
                          <td>{claim.winnerEmail || claim.winnerId}</td>
                          <td>${claim.prizeAmount || '0.00'}</td>
                          <td>
                            <StatusBadge status={claim.status}>
                              {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                            </StatusBadge>
                          </td>
                          <td>{claim.claimedAt ? new Date(claim.claimedAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <ActionButtons>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedClaimForDetails(claim)}
                              >
                                👁️ View Details
                              </Button>
                              {claim.status === 'pending' && (
                                <>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleApproveClaim(claim.id)}
                                    disabled={approveClaim.isPending}
                                  >
                                    ✅ Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectClaim(claim.id)}
                                  >
                                    ❌ Reject
                                  </Button>
                                </>
                              )}
                            </ActionButtons>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </>
            ) : (
              <EmptyState>
                <AlertCircle size={48} />
                <h3>No Sweepstakes Selected</h3>
                <p>Select a completed drawing from Overview tab to view its claims.</p>
              </EmptyState>
            )}
          </Card>
        )}
      </Content>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal onClick={() => setShowCreateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowCreateModal(false)}>
              <X size={24} />
            </CloseButton>

            <ModalTitle>Create New Sweepstakes</ModalTitle>

            <Form onSubmit={handleCreateSweepstakes}>
              <FormGroup>
                <label htmlFor="modal-month">Month (YYYY-MM) *</label>
                <input
                  id="modal-month"
                  type="month"
                  value={createForm.month}
                  onChange={(e) => setCreateForm({ ...createForm, month: e.target.value })}
                  disabled={createSweepstakes.isPending}
                  required
                />
              </FormGroup>

              <FormGroup>
                <label htmlFor="modal-prize">Prize Amount ($) *</label>
                <input
                  id="modal-prize"
                  type="number"
                  placeholder="500.00"
                  value={createForm.prizeAmount}
                  onChange={(e) => setCreateForm({ ...createForm, prizeAmount: e.target.value })}
                  step="0.01"
                  min="0"
                  disabled={createSweepstakes.isPending}
                  required
                />
              </FormGroup>

              <ButtonGroup>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createSweepstakes.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={createSweepstakes.isPending}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {createSweepstakes.isPending ? (
                    <>
                      <LoadingSpinner />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Create
                    </>
                  )}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Select Winner Modal */}
      {showSelectWinnerModal && (
        <Modal onClick={() => setShowSelectWinnerModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowSelectWinnerModal(false)}>
              <X size={24} />
            </CloseButton>

            <ModalTitle>🏆 Select Winner</ModalTitle>

            <MessageBox type="info">
              <AlertCircle size={20} />
              <p style={{ margin: 0 }}>
                Choose random selection for fair drawing or manually select a specific eligible user.
              </p>
            </MessageBox>

            <div style={{ marginBottom: '1.5rem' }}>
              <FormGroup>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="selection"
                    value="random"
                    checked={selectionMethod === 'random'}
                    onChange={(e) => setSelectionMethod(e.target.value as 'random' | 'manual')}
                  />
                  <span style={{ fontWeight: 500 }}>🎲 Random Selection</span>
                </label>
              </FormGroup>

              <FormGroup style={{ marginTop: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="selection"
                    value="manual"
                    checked={selectionMethod === 'manual'}
                    onChange={(e) => setSelectionMethod(e.target.value as 'random' | 'manual')}
                  />
                  <span style={{ fontWeight: 500 }}>👤 Manual Selection</span>
                </label>
              </FormGroup>
            </div>

            {selectionMethod === 'manual' && (
              <FormGroup style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="userId">Select User (ID) *</label>
                <input
                  id="userId"
                  type="text"
                  placeholder="Enter user ID"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={selectWinner.isPending}
                />
              </FormGroup>
            )}

            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => setShowSelectWinnerModal(false)}
                disabled={selectWinner.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSelectWinner}
                disabled={selectWinner.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {selectWinner.isPending ? (
                  <>
                    <LoadingSpinner />
                    Selecting...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    Select Winner
                  </>
                )}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal onClick={() => setShowRejectModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setShowRejectModal(false)}>
              <X size={24} />
            </CloseButton>

            <ModalTitle>❌ Reject Claim</ModalTitle>

            <FormGroup>
              <label htmlFor="rejectReason">Rejection Reason *</label>
              <textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                disabled={rejectClaimMutation.isPending}
                style={{ resize: 'vertical', minHeight: '100px' }}
              />
            </FormGroup>

            <ButtonGroup>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedClaimId(null)
                  setRejectReason('')
                }}
                disabled={rejectClaimMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmReject}
                disabled={rejectClaimMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {rejectClaimMutation.isPending ? (
                  <>
                    <LoadingSpinner />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} />
                    Reject Claim
                  </>
                )}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {selectedClaimForDetails && (
        <Modal onClick={() => setSelectedClaimForDetails(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedClaimForDetails(null)}>
              <X size={24} />
            </CloseButton>

            <ModalTitle>🏆 Prize Claim Details</ModalTitle>

            <MessageBox type="info">
              <AlertCircle size={20} />
              <div>
                <strong>Payment Information</strong>
                <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                  Use the details below to manually process payment outside the platform.
                </p>
              </div>
            </MessageBox>

            <PaymentDetailsGrid>
              <DetailField>
                <label>Winner Name</label>
                <p>{selectedClaimForDetails.winnerName || selectedClaimForDetails.winnerEmail}</p>
              </DetailField>

              <DetailField>
                <label>Winner Email</label>
                <p>{selectedClaimForDetails.winnerEmail}</p>
              </DetailField>

              <DetailField>
                <label>Prize Amount</label>
                <p>${selectedClaimForDetails.prizeAmount || '0.00'}</p>
              </DetailField>

              <DetailField>
                <label>Status</label>
                <p>
                  <StatusBadge status={selectedClaimForDetails.status}>
                    {selectedClaimForDetails.status.charAt(0).toUpperCase() + selectedClaimForDetails.status.slice(1)}
                  </StatusBadge>
                </p>
              </DetailField>

              <DetailField style={{ gridColumn: '1 / -1' }}>
                <label>Payment Method</label>
                <p>{selectedClaimForDetails.paymentMethod || 'N/A'}</p>
              </DetailField>

              {selectedClaimForDetails.paymentDetails && (
                <>
                  <DetailField>
                    <label>Account Name</label>
                    <p>{selectedClaimForDetails.paymentDetails.accountName || 'N/A'}</p>
                  </DetailField>

                  <DetailField>
                    <label>Bank Name</label>
                    <p>{selectedClaimForDetails.paymentDetails.bankName || 'N/A'}</p>
                  </DetailField>

                  <DetailField>
                    <label>Account Number (Last 4)</label>
                    <p>{selectedClaimForDetails.paymentDetails.accountNumber || 'N/A'}</p>
                  </DetailField>

                  <DetailField>
                    <label>Routing Number</label>
                    <p>{selectedClaimForDetails.paymentDetails.routingNumber || 'N/A'}</p>
                  </DetailField>
                </>
              )}

              <DetailField style={{ gridColumn: '1 / -1' }}>
                <label>Claimed On</label>
                <p>
                  {selectedClaimForDetails.claimedAt
                    ? new Date(selectedClaimForDetails.claimedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </DetailField>
            </PaymentDetailsGrid>

            <MessageBox type="success">
              <CheckCircle2 size={20} />
              <div>
                <strong>Processing Payment</strong>
                <p style={{ marginTop: '0.25rem', fontSize: '0.9rem' }}>
                  Use the account details above to process the payment manually. Once paid, approve the claim.
                </p>
              </div>
            </MessageBox>

            <ButtonGroup>
              <Button variant="outline" onClick={() => setSelectedClaimForDetails(null)}>
                Close
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
      </PageContainer>
    </>
  )
}
