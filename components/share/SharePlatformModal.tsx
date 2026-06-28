/**
 * SharePlatformModal.tsx
 * Modal for selecting social media platform and tracking share action
 */

'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Modal } from '@/components/Modal'
import { useCreateShareReward } from '@/api/hooks/useSharerRewards'
import { tk } from '@/styles/dashboardTokens'

const ModalTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.3px;
`

const ModalDescription = styled.p`
  color: ${tk.muted};
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
  font-family: 'DM Sans', sans-serif;
`

const RewardInfo = styled.div`
  background-color: ${tk.greenLight};
  border: 1px solid rgba(26,122,74,0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const RewardAmount = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

const RewardLabel = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${tk.green};
  font-weight: 500;
`

const RewardValue = styled.span`
  font-family: 'Syne', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: ${tk.green};
`

const HoldInfo = styled.span`
  font-size: 0.8rem;
  color: ${tk.green};
  text-align: right;
`

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const PlatformButton = styled.button<{ $selected: boolean; $disabled: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid ${props => (props.$selected ? tk.blue : tk.border)};
  background-color: ${props => (props.$selected ? tk.blueLight : tk.canvas)};
  border-radius: 10px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.$disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${tk.blue};
    background-color: ${tk.blueLight};
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }
`

const PlatformIcon = styled.span`
  font-size: 2rem;
`

const PlatformName = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${tk.heading};
  text-align: center;
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: ${tk.ink};
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${tk.inkLight};
    transform: translateY(-2px);
  }

  &:disabled {
    background: ${tk.border};
    cursor: not-allowed;
  }
`

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: ${tk.body};
  border: 1px solid ${tk.border};
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${tk.canvasDeep};
    border-color: ${tk.muted};
  }
`

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'twitter', name: 'X (Twitter)', icon: '𝕏' },
  { id: 'facebook', name: 'Facebook', icon: '📘' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'reddit', name: 'Reddit', icon: '🤖' },
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
]

interface SharePlatformModalProps {
  campaignId: string
  campaignTitle: string
  rewardAmount: number
  onClose: () => void
  onRewardConfirmed: (rewardData: {
    amountDollars: string
    holdExpiresAt: string
    daysRemaining: number
  }) => void
}

export const SharePlatformModal: React.FC<SharePlatformModalProps> = ({
  campaignId,
  campaignTitle,
  rewardAmount,
  onClose,
  onRewardConfirmed,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  // Placeholder: useCreateShareReward hook would be created to call the backend
  // For now, we'll simulate the reward

  const handleShare = async () => {
    if (!selectedPlatform) return

    // TODO: Call actual API endpoint to create reward
    // const result = await createShareReward({ campaignId, platform: selectedPlatform, ...proofData })

    // Simulate success
    const mockHoldExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    const daysRemaining = 30

    onRewardConfirmed({
      amountDollars: (rewardAmount / 100).toFixed(2),
      holdExpiresAt: mockHoldExpiresAt.toISOString(),
      daysRemaining,
    })
  }

  return (
    <Modal onClose={onClose}>
      <ModalTitle>Share "{campaignTitle}" to Earn</ModalTitle>
      <ModalDescription>
        Select a platform and share the campaign. When your share converts, the reward
        is owed to you right away — the campaign creator pays you directly when you
        request a payout.
      </ModalDescription>

      <RewardInfo>
        <RewardAmount>
          <RewardLabel>Reward for Sharing:</RewardLabel>
          <RewardValue>${(rewardAmount / 100).toFixed(2)}</RewardValue>
        </RewardAmount>
        <HoldInfo>
          No hold<br />
          Claimable on conversion
        </HoldInfo>
      </RewardInfo>

      <PlatformGrid>
        {PLATFORMS.map(platform => (
          <PlatformButton
            key={platform.id}
            $selected={selectedPlatform === platform.id}
            $disabled={false}
            onClick={() => setSelectedPlatform(platform.id)}
          >
            <PlatformIcon>{platform.icon}</PlatformIcon>
            <PlatformName>{platform.name}</PlatformName>
          </PlatformButton>
        ))}
      </PlatformGrid>

      <ButtonContainer>
        <SubmitButton
          onClick={handleShare}
          disabled={!selectedPlatform}
        >
          ✓ Confirm Share
        </SubmitButton>
        <CancelButton onClick={onClose}>
          Cancel
        </CancelButton>
      </ButtonContainer>
    </Modal>
  )
}
