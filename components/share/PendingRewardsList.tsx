/**
 * PendingRewardsList.tsx
 * Component displaying pending rewards on 30-day hold
 * Shows hold countdown and when rewards will be available
 */

'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { tk } from '@/styles/dashboardTokens'
import { usePendingRewards } from '@/api/hooks/useSharerRewards'
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
  background-color: ${tk.canvas};
  border-bottom: 1px solid ${tk.border};
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
  color: ${tk.heading};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const SummaryBadge = styled.span`
  background-color: ${tk.amberLight};
  color: ${tk.amberDark};
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
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
  border: 1px solid ${props => props.$active ? tk.blue : tk.border};
  background-color: ${props => props.$active ? tk.blue : 'white'};
  color: ${props => props.$active ? 'white' : tk.heading};
  border-radius: 6px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${tk.blue};
  }
`

const PageInfo = styled.span`
  color: ${tk.muted};
  font-size: 0.9rem;
`

interface PendingRewardsListProps {
  limit?: number
}

export const PendingRewardsList: React.FC<PendingRewardsListProps> = ({ limit = 20 }) => {
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePendingRewards(page, limit)

  if (isLoading) {
    return (
      <ContainerWrapper>
        <SectionHeader>
          <SectionTitle>⏳ Owed — awaiting payout</SectionTitle>
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

  return (
    <ContainerWrapper>
      <SectionHeader>
        <SectionTitle>
          ⏳ Owed — awaiting payout
          {rewards.length > 0 && (
            <SummaryBadge>${rewards.reduce((sum, r) => sum + r.amountCents, 0) / 100} pending</SummaryBadge>
          )}
        </SectionTitle>
      </SectionHeader>

      {rewards.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>🎉</EmptyStateIcon>
          <EmptyStateText>
            {data?.summary?.countPending === 0
              ? 'No rewards currently on hold'
              : 'All your rewards have been verified!'}
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
