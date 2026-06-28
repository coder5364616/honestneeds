/**
 * VerifiedRewardsList.tsx
 * Component displaying verified rewards ready for payout
 * Shows verified rewards and allows requesting payout
 */

'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { tk } from '@/styles/dashboardTokens'
import { useVerifiedRewards } from '@/api/hooks/useSharerRewards'
import { RewardEarningCard } from './RewardEarningCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const ContainerWrapper = styled.div`
  background-color: white;
  border-radius: 12px;
  border: 1px solid ${tk.border};
  overflow: hidden;
  margin-bottom: 2rem;
`

const SectionHeader = styled.div`
  background: ${tk.green};
  color: white;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SummaryInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;

  @media (max-width: 640px) {
    align-items: flex-start;
  }
`

const RewardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${tk.muted};
`

const EmptyStateIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 1rem;
`

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border-top: 1px solid ${tk.border};
  background-color: ${tk.canvas};
`

const PaginationButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  min-width: 40px;
  height: 40px;
  padding: 0;
  border: 1px solid ${props => props.$active ? tk.green : tk.border};
  background-color: ${props => props.$active ? tk.green : 'white'};
  color: ${props => props.$active ? 'white' : tk.heading};
  border-radius: 6px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${tk.green};
  }
`

const PageInfo = styled.span`
  color: ${tk.muted};
  font-size: 0.9rem;
`

interface VerifiedRewardsListProps {
  limit?: number
  onRequestPayout?: (totalCents: number) => void
}

export const VerifiedRewardsList: React.FC<VerifiedRewardsListProps> = ({
  limit = 20,
  onRequestPayout,
}) => {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useVerifiedRewards(page, limit)

  if (isLoading) {
    return (
      <ContainerWrapper>
        <SectionHeader>
          <SectionTitle>✓ Available to Withdraw</SectionTitle>
        </SectionHeader>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </ContainerWrapper>
    )
  }

  const rewards = data?.rewards || []
  const pagination = data?.pagination
  const totalPages = pagination?.pages || 1
  const totalAmount = rewards.reduce((sum, r) => sum + r.amountCents, 0)

  return (
    <ContainerWrapper>
      <SectionHeader>
        <SectionTitle>✓ Available to Withdraw ({rewards.length})</SectionTitle>
        <SummaryInfo>
          <div>Total Available: ${(totalAmount / 100).toFixed(2)}</div>
        </SummaryInfo>
      </SectionHeader>

      {rewards.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🎯</EmptyStateIcon>
          <EmptyStateText>
            Share campaigns to earn rewards. When a share converts, the reward is owed to you right away — request a payout and the creator pays you directly.
          </EmptyStateText>
        </EmptyState>
      ) : (
        <>
          <RewardsList>
            {rewards.map(reward => (
              <RewardEarningCard key={reward.id} reward={reward} />
            ))}
          </RewardsList>

          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                $disabled={page === 1}
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                ← Prev
              </PaginationButton>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page - 2 + i
                if (pageNum > totalPages) return null
                return (
                  <PaginationButton
                    key={pageNum}
                    $active={pageNum === page}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                )
              })}

              {totalPages > 5 && page <= totalPages - 3 && <span>...</span>}

              <PaginationButton
                $disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next →
              </PaginationButton>

              <PageInfo>
                Page {page} of {totalPages}
              </PageInfo>
            </PaginationContainer>
          )}
        </>
      )}
    </ContainerWrapper>
  )
}
