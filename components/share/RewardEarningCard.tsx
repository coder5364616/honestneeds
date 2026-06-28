/**
 * RewardEarningCard.tsx
 * Individual reward card component
 * Displays reward info, status, hold countdown, and action buttons
 */

'use client'

import styled from 'styled-components'
import { Reward } from '@/api/hooks/useSharerRewards'
import { Badge } from '@/components/Badge'
import { tk } from '@/styles/dashboardTokens'

const CardContainer = styled.div`
  background-color: white;
  border: 1px solid ${tk.border};
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: ${tk.border};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const ContentSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const CampaignTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${tk.heading};
  margin: 0;
`

const PlatformBadge = styled.span`
  display: inline-block;
  background-color: ${tk.canvasDeep};
  color: ${tk.body};
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  width: fit-content;
  text-transform: capitalize;
`

const ActionType = styled.span`
  font-size: 0.875rem;
  color: ${tk.muted};
  text-transform: capitalize;
`

const Amount = styled.span`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${tk.heading};
`

const StatusSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
  min-width: 180px;

  @media (max-width: 768px) {
    align-items: flex-start;
    min-width: auto;
    width: 100%;
  }
`

const StatusBadgeWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`

const HoldCountdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;

  @media (max-width: 768px) {
    align-items: flex-start;
  }
`

const HoldLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const HoldProgress = styled.div`
  width: 150px;
  height: 6px;
  background-color: ${tk.border};
  border-radius: 3px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const HoldProgressBar = styled.div<{ $progress: number }>`
  height: 100%;
  background: ${tk.green};
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
`

const HoldDaysRemaining = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${tk.amber};
`

const AchievedDate = styled.span`
  font-size: 0.75rem;
  color: ${tk.muted};
`

interface RewardEarningCardProps {
  reward: Reward
}

export const RewardEarningCard: React.FC<RewardEarningCardProps> = ({ reward }) => {
  // Calculate progress for hold countdown (30 days total)
  // Backend provides daysRemaining, so we calculate inversely: 
  // daysRemaining=30 -> 0%, daysRemaining=0 -> 100%
  const HOLD_DURATION_DAYS = 30
  const progressPercent = Math.max(0, Math.min(100, ((HOLD_DURATION_DAYS - Math.max(0, reward.daysRemaining)) / HOLD_DURATION_DAYS) * 100))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return tk.green
      case 'completed':
        return tk.blue
      case 'pending':
        return tk.amber
      case 'rejected':
        return tk.red
      default:
        return tk.muted
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified ✓'
      case 'completed':
        return 'Paid Out'
      case 'pending':
        return 'On Hold'
      case 'rejected':
        return 'Rejected'
      default:
        return status
    }
  }

  const formattedDate = new Date(reward.achievedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <CardContainer>
      <ContentSection>
        <CampaignTitle>{reward.campaignTitle}</CampaignTitle>
        <div>
          <PlatformBadge>{reward.platform}</PlatformBadge>
          <ActionType>• {reward.action?.replace(/_/g, ' ') || 'Share'}</ActionType>
        </div>
      </ContentSection>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <Amount>${reward.amountDollars}</Amount>
      </div>

      <StatusSection>
        <StatusBadgeWrapper>
          <Badge color={getStatusColor(reward.status)}>{getStatusLabel(reward.status)}</Badge>
        </StatusBadgeWrapper>

        {reward.status === 'pending' && (
          <HoldCountdown>
            <HoldLabel>Owed — ready for payout</HoldLabel>
            {reward.daysRemaining > 0 && (
              <>
                <HoldProgress>
                  <HoldProgressBar $progress={progressPercent} />
                </HoldProgress>
                <HoldDaysRemaining>{reward.daysRemaining} days remaining</HoldDaysRemaining>
              </>
            )}
            <AchievedDate>Earned {formattedDate}</AchievedDate>
          </HoldCountdown>
        )}

        {reward.status === 'verified' && (
          <div style={{ textAlign: 'right', fontSize: '0.875rem', color: tk.green, fontWeight: 600 }}>
            ✓ Ready to withdraw
          </div>
        )}

        {reward.status === 'completed' && (
          <div style={{ textAlign: 'right', fontSize: '0.875rem', color: tk.blue }}>
            Paid on {new Date(reward.verifiedAt || '').toLocaleDateString()}
          </div>
        )}

        {reward.status === 'rejected' && (
          <div style={{ textAlign: 'right', fontSize: '0.875rem', color: tk.red }}>
            Rejected on {new Date(reward.verifiedAt || '').toLocaleDateString()}
          </div>
        )}
      </StatusSection>
    </CardContainer>
  )
}
