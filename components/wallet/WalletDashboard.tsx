/**
 * Wallet Dashboard
 * Main component for displaying wallet balance, earnings, and withdrawal options
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import {
  DollarSign,
  TrendingUp,
  Send,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { useWalletBalance, useWalletOverview } from '@/api/hooks/useWallet'
import { TransactionHistory } from './TransactionHistory'
import { Button } from '@/components/Button'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`

const Header = styled.div`
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: #64748b;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`

const BalanceCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
    animation: drift 20s linear infinite;
  }

  @keyframes drift {
    0% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(20px, 20px);
    }
  }
`

const CardContent = styled.div`
  position: relative;
  z-index: 1;
`

const CardLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`

const BalanceAmount = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  margin-bottom: 1.5rem;
`

const Amount = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
`

const Currency = styled.span`
  font-size: 1.25rem;
  opacity: 0.9;
`

const VisibilityButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`

const BreakdownList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.875rem;
`

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  &:last-child {
    border-bottom: none;
  }
`

const BreakdownLabel = styled.span`
  opacity: 0.9;
`

const BreakdownValue = styled.span`
  font-weight: 600;
`

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`

const StatIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const StatLabel = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`

const StatValue = styled.h3`
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`

const StatSubtext = styled.p`
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
`

const AlertBox = styled.div<{ type: 'info' | 'warning' | 'success' }>`
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border-left: 4px solid;

  ${(props) => {
    switch (props.type) {
      case 'info':
        return `
          background: #dbeafe;
          border-color: #0284c7;
          color: #0c4a6e;
        `
      case 'warning':
        return `
          background: #fef3c7;
          border-color: #ca8a04;
          color: #713f12;
        `
      case 'success':
        return `
          background: #dcfce7;
          border-color: #16a34a;
          color: #166534;
        `
    }
  }}

  svg {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
`

const ActionNow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    color: #667eea;
  }
`

const SectionContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
`

export interface WalletDashboardProps {
  hideBalance?: boolean
  compactMode?: boolean
}

/**
 * Main Wallet Dashboard Component
 */
export const WalletDashboard: React.FC<WalletDashboardProps> = ({ hideBalance = false, compactMode = false }) => {
  const router = useRouter()
  const [balanceVisible, setBalanceVisible] = useState(!hideBalance)

  const { data: balance, isLoading: balanceLoading, error: balanceError } = useWalletBalance()
  const { data: overview, isLoading: overviewLoading } = useWalletOverview()

  if (balanceLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    )
  }

  if (balanceError) {
    return (
      <Container>
        <AlertBox type="warning">
          <AlertCircle />
          <div>
            <strong>Failed to load wallet</strong>
            <p>Please refresh the page to try again</p>
          </div>
        </AlertBox>
      </Container>
    )
  }

  if (!balance) return null

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    })
  }

  const displayBalance = balanceVisible ? formatCurrency(balance.balance_cents) : '••••••'
  const availableBalance = formatCurrency(balance.available_cents)
  const pendingBalance = formatCurrency(balance.pending_cents)
  const totalEarned = formatCurrency(balance.total_earned_cents)

  return (
    <Container>
      {!compactMode && (
        <Header>
          <Title>Wallet</Title>
          <Subtitle>Track your share-to-earn earnings</Subtitle>
        </Header>
      )}

      {/* Main Balance Card */}
      <BalanceCard>
        <CardContent>
          <CardLabel>
            <DollarSign size={16} />
            Total Balance
          </CardLabel>

          <BalanceAmount>
            <Amount>{displayBalance}</Amount>
            <VisibilityButton
              onClick={() => setBalanceVisible(!balanceVisible)}
              title={balanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {balanceVisible ? <EyeOff /> : <Eye />}
            </VisibilityButton>
          </BalanceAmount>

          <BreakdownList>
            <BreakdownItem>
              <BreakdownLabel>Available to claim:</BreakdownLabel>
              <BreakdownValue>{availableBalance}</BreakdownValue>
            </BreakdownItem>
            <BreakdownItem>
              <BreakdownLabel>On hold (1-7 days):</BreakdownLabel>
              <BreakdownValue>{pendingBalance}</BreakdownValue>
            </BreakdownItem>
            <BreakdownItem>
              <BreakdownLabel>Lifetime earned:</BreakdownLabel>
              <BreakdownValue>{totalEarned}</BreakdownValue>
            </BreakdownItem>
          </BreakdownList>

          <ActionNow>
            {/* Manual model: no platform-held payout. Claiming routes to the
                share-rewards flow where the request goes to campaign creators
                who pay the sharer directly. */}
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard/share-rewards')}
              style={{ flex: 1 }}
            >
              <Send size={16} />
              Request payment from creators
            </Button>
          </ActionNow>
        </CardContent>
      </BalanceCard>

      {/* Stats Grid */}
      <Grid>
        <StatCard>
          <StatIconWrapper>
            <TrendingUp />
          </StatIconWrapper>
          <StatLabel>This Month</StatLabel>
          <StatValue>{overview ? formatCurrency(overview.pending_withdrawal_amount) : '$0.00'}</StatValue>
          <StatSubtext>Pending payout</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIconWrapper>
            <CheckCircle />
          </StatIconWrapper>
          <StatLabel>Total Withdrawn</StatLabel>
          <StatValue>{balance ? formatCurrency(balance.total_withdrawn_cents) : '$0.00'}</StatValue>
          <StatSubtext>{overview?.withdrawal_count || 0} withdrawals</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIconWrapper>
            <Clock />
          </StatIconWrapper>
          <StatLabel>Account Health</StatLabel>
          <StatValue>{overview?.account_health || 'Good'}</StatValue>
          <StatSubtext>Regular activity detected</StatSubtext>
        </StatCard>
      </Grid>

      {/* Transaction History */}
      <SectionContainer>
        <SectionTitle>
          <TrendingUp />
          Recent Transactions
        </SectionTitle>
        <TransactionHistory limit={10} />
      </SectionContainer>
    </Container>
  )
}

export default WalletDashboard
