/**
 * SharerRewardsDashboard.tsx
 * Complete rewards dashboard page component
 * Integrates all reward components together
 */

'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { SharerRewardsOverview } from '@/components/share/SharerRewardsOverview'
import { PendingRewardsList } from '@/components/share/PendingRewardsList'
import { VerifiedRewardsList } from '@/components/share/VerifiedRewardsList'
import { SharerPayoutRequestForm } from '@/components/share/SharerPayoutRequestForm'
import { Modal } from '@/components/Modal'
import { tk, DashboardGlobalStyle } from '@/styles/dashboardTokens'

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  padding: 2rem 1rem;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const PageHeader = styled.div`
  margin-bottom: 2.5rem;
`

const PageTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
`

const PageDescription = styled.p`
  color: ${tk.muted};
  margin: 0;
  font-size: 1rem;
`

const TabContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${tk.border};
  flex-wrap: wrap;

  @media (max-width: 640px) {
    margin-bottom: 1rem;
  }
`

const Tab = styled.button<{ $active: boolean }>`
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  font-family: 'Syne', sans-serif;
  color: ${props => props.$active ? tk.heading : tk.muted};
  font-weight: ${props => (props.$active ? 700 : 500)};
  font-size: 1rem;
  cursor: pointer;
  border-bottom: 2px solid ${props => (props.$active ? tk.amber : 'transparent')};
  margin-bottom: -1px;
  transition: all 0.2s ease;

  &:hover {
    color: ${tk.heading};
  }

  @media (max-width: 640px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`

const TabContent = styled.div`
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

interface SharerRewardsDashboardProps {
  showPayoutForm?: boolean
}

export const SharerRewardsDashboard: React.FC<SharerRewardsDashboardProps> = ({
  showPayoutForm = false,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'verified' | 'payout'>(
    showPayoutForm ? 'payout' : 'overview'
  )
  const [showPayoutModal, setShowPayoutModal] = useState(showPayoutForm)

  const handleRequestPayout = () => {
    setActiveTab('payout')
    setShowPayoutModal(true)
  }

  const handleClosePayoutForm = () => {
    setShowPayoutModal(false)
    setActiveTab('overview')
  }

  return (
    <DashboardContainer>
      <DashboardGlobalStyle />
      <ContentWrapper>
        <PageHeader>
          <PageTitle>💰 Your Rewards</PageTitle>
          <PageDescription>Track your earnings, pending rewards, and manage payouts</PageDescription>
        </PageHeader>

        {/* Overview Summary */}
        <SharerRewardsOverview
          onRequestPayout={handleRequestPayout}
          onViewDetails={() => setActiveTab('verified')}
        />

        {/* Tab Navigation */}
        <TabContainer>
          <Tab
            $active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
          >
            ⏳ Owed
          </Tab>
          <Tab
            $active={activeTab === 'verified'}
            onClick={() => setActiveTab('verified')}
          >
            ✓ Ready to Withdraw
          </Tab>
          <Tab
            $active={activeTab === 'payout'}
            onClick={() => setActiveTab('payout')}
          >
            💳 Request Payout
          </Tab>
        </TabContainer>

        {/* Tab Content */}
        <TabContent>
          {activeTab === 'pending' && <PendingRewardsList limit={20} />}

          {activeTab === 'verified' && (
            <VerifiedRewardsList limit={20} onRequestPayout={handleRequestPayout} />
          )}

          {activeTab === 'payout' && (
            <SharerPayoutRequestForm
              onSuccess={handleClosePayoutForm}
              onCancel={handleClosePayoutForm}
            />
          )}
        </TabContent>
      </ContentWrapper>

      {/* Payout Modal (Alternative) */}
      {showPayoutModal && activeTab !== 'payout' && (
        <Modal onClose={() => setShowPayoutModal(false)}>
          <SharerPayoutRequestForm
            onSuccess={handleClosePayoutForm}
            onCancel={handleClosePayoutForm}
          />
        </Modal>
      )}
    </DashboardContainer>
  )
}
