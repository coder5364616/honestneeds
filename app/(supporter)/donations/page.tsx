'use client'

import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { useState, useEffect } from 'react'
import {
  DollarSign, Heart, CheckCircle2, Clock,
  ArrowUpRight, ArrowDownRight, RotateCcw,
} from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DonationList } from '@/components/donation/DonationList'
import { DonationDetailModal } from '@/components/donation/DonationDetailModal'
import { useDonations, useDonorDashboard } from '@/api/hooks/useDonations'

// ─── Fonts & Global ───────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; -webkit-font-smoothing: antialiased; }
`

// ─── Design Tokens (shared with /dashboard) ─────────────────────────────────────

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  inkMid:      '#302E35',
  inkBorder:   '#3D3A44',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  offWhite:    '#F0EDE8',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
}

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const countUp = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`

// ─── Layout ─────────────────────────────────────────────────────────────────

const Shell = styled.div`
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

const PageBody = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2.5rem) clamp(1rem, 3vw, 2rem);
`

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  margin-bottom: 2rem;
  animation: ${fadeUp} 0.4s ease both;
`

const Greeting = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 400;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
`

const PageTitle = styled.h1`
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
`

const PageDescription = styled.p`
  color: ${tk.muted};
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
`

// ─── KPI Strip ────────────────────────────────────────────────────────────────

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { grid-template-columns: repeat(2, 1fr); gap: 0.75rem; }
`

const KPICard = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 80}ms;
  position: relative;
  overflow: hidden;
  transition: box-shadow 180ms, border-color 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }
`

const KPITop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.875rem;
`

const KPIIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' | 'red' }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => ({ amber: tk.amberLight, green: tk.greenLight, blue: tk.blueLight, red: tk.redLight }[p.$color])};
  color: ${p => ({ amber: tk.amber, green: tk.green, blue: tk.blue, red: tk.red }[p.$color])};
`

const KPITrend = styled.div<{ $up: boolean }>`
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${p => p.$up ? tk.green : tk.red};
  background: ${p => p.$up ? tk.greenLight : tk.redLight};
  padding: 3px 8px;
  border-radius: 100px;
`

const KPIValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
  margin-bottom: 5px;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const KPILabel = styled.div`
  font-size: 0.75rem;
  color: ${tk.muted};
  font-weight: 400;
`

const KPISub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 3px;
`

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const FilterTabs = styled.div`
  display: inline-flex;
  gap: 4px;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  max-width: 100%;
`

const FilterTab = styled.button<{ $active?: boolean }>`
  padding: 0.45rem 1rem;
  border-radius: 7px;
  border: none;
  background: ${p => p.$active ? tk.white : 'transparent'};
  color: ${p => p.$active ? tk.heading : tk.muted};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: ${p => p.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  box-shadow: ${p => p.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};

  &:hover { color: ${tk.heading}; }
`

// ─── Error Banner ─────────────────────────────────────────────────────────────

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${tk.redLight};
  border: 1px solid rgba(192,57,43,0.2);
  border-radius: 10px;
  padding: 0.875rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: ${tk.red};
  animation: ${fadeUp} 0.3s ease both;
`

type StatusFilter = 'all' | 'pending' | 'verified' | 'rejected'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All Donations' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

function DonationHistoryContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const { data, isLoading, refetch, error } = useDonations(currentPage, 25)
  const { data: dash } = useDonorDashboard()

  useEffect(() => {
    // Auto-refetch every 30 seconds to check for status updates
    const interval = setInterval(() => {
      refetch()
    }, 30000)

    return () => clearInterval(interval)
  }, [refetch])

  const donations = data?.donations || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 25)

  // Filter donations by status
  const filteredDonations =
    statusFilter === 'all'
      ? donations
      : donations.filter(d => d.status === statusFilter)

  // Prefer the all-time dashboard summary (accurate across pages); fall back to
  // the current page when it hasn't loaded yet.
  const stats = {
    totalDonations: dash?.total_donations ?? total,
    totalAmount: dash ? parseFloat(dash.total_confirmed_dollars) : donations.reduce((sum, d) => sum + d.amount, 0) / 100,
    pending: dash?.pending_confirmation ?? donations.filter(d => d.status === 'pending').length,
    openRefunds: dash?.open_refund_requests ?? 0,
  }

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransactionId(transactionId)
    setIsDetailOpen(true)
  }

  const kpis = [
    {
      label: 'Total Donations',
      value: String(stats.totalDonations),
      sub: 'All time',
      icon: <Heart size={16} />,
      color: 'amber' as const,
    },
    {
      label: 'Total Amount',
      value: `$${stats.totalAmount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
      sub: 'Across all campaigns',
      icon: <DollarSign size={16} />,
      color: 'green' as const,
    },
    {
      label: 'Pending Review',
      value: String(stats.pending),
      sub: 'Awaiting confirmation',
      icon: <Clock size={16} />,
      color: 'blue' as const,
    },
    {
      label: 'Refund Requests',
      value: String(stats.openRefunds),
      sub: stats.openRefunds === 1 ? 'awaiting decision' : 'awaiting decision',
      icon: <RotateCcw size={16} />,
      color: 'red' as const,
    },
  ]

  return (
    <>
      <GlobalStyle />
      <Shell>
        <PageBody>
          <PageHeader>
            <Greeting>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Greeting>
            <PageTitle>Donation History</PageTitle>
            <PageDescription>
              Track all your donations and their verification status
            </PageDescription>
          </PageHeader>

          {/* Stats Section */}
          {total > 0 && (
            <KPIStrip>
              {kpis.map((kpi, i) => (
                <KPICard key={kpi.label} $delay={i}>
                  <KPITop>
                    <KPIIcon $color={kpi.color}>{kpi.icon}</KPIIcon>
                  </KPITop>
                  <KPIValue>{kpi.value}</KPIValue>
                  <KPILabel>{kpi.label}</KPILabel>
                  <KPISub>{kpi.sub}</KPISub>
                </KPICard>
              ))}
            </KPIStrip>
          )}

          {/* Filters */}
          <FilterTabs>
            {FILTERS.map(f => (
              <FilterTab
                key={f.value}
                $active={statusFilter === f.value}
                onClick={() => {
                  setStatusFilter(f.value)
                  setCurrentPage(1)
                }}
              >
                {f.label}
              </FilterTab>
            ))}
          </FilterTabs>

          {/* Error Message */}
          {error && (
            <ErrorBanner>
              Failed to load donations. Please try again later.
            </ErrorBanner>
          )}

          {/* Donation List */}
          <DonationList
            donations={filteredDonations}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </PageBody>

        {/* Detail Modal */}
        <DonationDetailModal
          transactionId={selectedTransactionId}
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedTransactionId(null)
          }}
        />
      </Shell>
    </>
  )
}

export default function DonationHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={['supporter', 'creator', 'admin']}>
      <DonationHistoryContent />
    </ProtectedRoute>
  )
}
