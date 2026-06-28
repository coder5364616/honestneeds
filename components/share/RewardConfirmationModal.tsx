/**
 * RewardConfirmationModal.tsx
 * Success confirmation modal showing reward earned and hold period
 */

'use client'

import React, { useEffect } from 'react'
import styled from 'styled-components'

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: bounce 0.6s ease-out;

  @keyframes bounce {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  margin: 0 0 0.5rem 0;
`

const Message = styled.p`
  color: #64748b;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
  font-size: 1rem;
`

const RewardAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 1rem 0;
`

const HoldInfo = styled.div`
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 1rem;
  margin: 1.5rem 0;
  font-size: 0.95rem;
  color: #92400e;
`

const HoldLabel = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const HoldDetails = styled.div`
  font-size: 0.9rem;
  line-height: 1.5;
`

const NextSteps = styled.div`
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #15803d;
`

const StepLabel = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
`

const StepDetails = styled.div`
  line-height: 1.6;
  font-size: 0.85rem;
`

interface RewardConfirmationModalProps {
  amountDollars: string
  holdExpiresAt: string
  daysRemaining: number
}

export const RewardConfirmationModal: React.FC<RewardConfirmationModalProps> = ({
  amountDollars,
  holdExpiresAt,
  daysRemaining,
}) => {
  const [isVisible, setIsVisible] = React.useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  const expiryDate = new Date(holdExpiresAt)
  const formattedDate = expiryDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Overlay>
      <ModalContent>
        <SuccessIcon>🎉</SuccessIcon>

        <Title>Reward Earned!</Title>
        <Message>Your share converted — this reward is now owed to you.</Message>

        <RewardAmount>${amountDollars}</RewardAmount>

        <HoldInfo>
          <HoldLabel>✅ Owed to you — no hold</HoldLabel>
          <HoldDetails>
            This reward is claimable right away. The campaign creator pays you
            directly when you request a payout.
          </HoldDetails>
        </HoldInfo>

        <NextSteps>
          <StepLabel>What's Next?</StepLabel>
          <StepDetails>
            Request a payout from your &quot;Rewards&quot; dashboard anytime. The creator
            settles it directly and you confirm once you&apos;ve received it.
          </StepDetails>
        </NextSteps>
      </ModalContent>
    </Overlay>
  )
}
