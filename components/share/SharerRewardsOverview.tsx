/**
 * SharerRewardsOverview.tsx
 * Main dashboard component showing sharer rewards summary
 * Displays verified, pending, and lifetime earnings with quick stats
 */

'use client'

import styled from 'styled-components'
import { useRewardsAvailableBalance, useSharerRewards } from '@/api/hooks/useSharerRewards'
import { usePendingPayouts } from '@/api/hooks/useSharerPayoutRequest'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { tk } from '@/styles/dashboardTokens'

const OverviewContainer = styled.div`
  background: ${tk.ink};
  border: 1px solid ${tk.inkBorder};
  border-radius: 14px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: ${tk.white};
  font-family: 'DM Sans', sans-serif;

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`

const OverviewTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 1.5rem 0;
  color: ${tk.white};
  letter-spacing: -0.3px;

  @media (max-width: 640px) {
    font-size: 1.25rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled.div`
  background-color: ${tk.inkLight};
  border: 1px solid ${tk.inkBorder};
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${tk.amber};
  }
`

const StatLabel = styled.span`
  display: block;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`

const StatValue = styled.span`
  display: block;
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: ${tk.amberMid};
  margin-bottom: 0.25rem;
`

const StatSubtext = styled.span`
  display: block;
  font-size: 0.8rem;
  color: ${tk.muted};
`

const ActionArea = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const PrimaryButton = styled.button`
  background-color: ${tk.amber};
  color: ${tk.ink};
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${tk.amberMid};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`

const SecondaryButton = styled.button`
  background-color: transparent;
  color: ${tk.white};
  padding: 0.75rem 1.5rem;
  border: 1.5px solid ${tk.inkBorder};
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${tk.inkLight};
    border-color: ${tk.muted};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

interface SharerRewardsOverviewProps {
  onRequestPayout?: () => void
  onViewDetails?: () => void
}

export const SharerRewardsOverview: React.FC<SharerRewardsOverviewProps> = ({
  onRequestPayout,
  onViewDetails,
}) => {
  const { data: availableBalance, isLoading: loadingBalance } = useRewardsAvailableBalance()
  const { data: allRewards, isLoading: loadingRewards } = useSharerRewards('all')
  const { data: pendingPayouts, isLoading: loadingPayouts } = usePendingPayouts()

  const isLoading = loadingBalance || loadingRewards || loadingPayouts

  if (isLoading) {
    return (
      <OverviewContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </OverviewContainer>
    )
  }

  const summary = allRewards?.summary
  const verified = availableBalance?.totalCents || 0
  const pending = summary?.totalPending || 0
  const lifetime = summary?.totalLifetime || 0
  const pendingPayoutCount = pendingPayouts?.count || 0
  const pendingPayoutAmount = pendingPayouts?.totalAmountCents || 0

  // Format currency
  const formatCurrency = (cents: number) => {
    return (cents / 100).toFixed(2)
  }

  return (
    <OverviewContainer>
      <OverviewTitle>Your Sharing Earnings</OverviewTitle>

      <StatsGrid>
        <StatCard>
          <StatLabel>✓ Available to Withdraw</StatLabel>
          <StatValue>${formatCurrency(verified)}</StatValue>
          <StatSubtext>{summary?.countVerified || 0} verified rewards</StatSubtext>
        </StatCard>

        <StatCard>
          <StatLabel>⏳ Owed</StatLabel>
          <StatValue>${formatCurrency(pending)}</StatValue>
          <StatSubtext>{summary?.countPending || 0} rewards awaiting payout</StatSubtext>
        </StatCard>

        <StatCard>
          <StatLabel>💰 Total Lifetime Earnings</StatLabel>
          <StatValue>${formatCurrency(lifetime)}</StatValue>
          <StatSubtext>{summary?.totalCompleted ? `${summary.totalCompleted} completed` : 'No payouts yet'}</StatSubtext>
        </StatCard>

        {pendingPayoutCount > 0 && (
          <StatCard>
            <StatLabel>📤 Awaiting Approval</StatLabel>
            <StatValue>${formatCurrency(pendingPayoutAmount)}</StatValue>
            <StatSubtext>{pendingPayoutCount} payout request{pendingPayoutCount !== 1 ? 's' : ''}</StatSubtext>
          </StatCard>
        )}
      </StatsGrid>

      <ActionArea>
        <PrimaryButton
          onClick={onRequestPayout}
          disabled={!availableBalance || availableBalance.totalCents < 1000}
          title={
            availableBalance && availableBalance.totalCents < 1000
              ? 'Minimum payout is $10.00'
              : 'Request a payout of verified earnings'
          }
        >
          💳 Request Payout
        </PrimaryButton>

        {onViewDetails && (
          <SecondaryButton onClick={onViewDetails}>
            📊 View Details
          </SecondaryButton>
        )}
      </ActionArea>
    </OverviewContainer>
  )
}
