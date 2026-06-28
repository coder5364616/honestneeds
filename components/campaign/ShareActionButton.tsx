'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Share2, Camera, ThumbsUp, AtSign, Briefcase, ArrowRight, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useCreateShareReward } from '@/api/hooks/useSharerRewards'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'

/**
 * ShareActionButton Component
 * 
 * "Share to Earn" button on sharing campaign pages
 * Allows supporters to share campaigns and earn instant rewards
 * 
 * Features:
 * - Platform selection (Instagram, TikTok, Facebook, Twitter, LinkedIn, Email)
 * - Reward amount display with countdown to verification
 * - Integration with SharerRewardCreationService
 * - Success/error states with user feedback
 * - 30-day hold explanation
 */

interface ShareActionButtonProps {
  campaignId: string
  rewardAmountCents: number
  rewardAmountDollars: string
  campaignTitle: string
  onRewardEarned?: (rewardData: any) => void
  disabled?: boolean
}

const PlatformOption = {
  instagram: { label: 'Instagram', icon: Camera, color: '#E4405F' },
  tiktok: { label: 'TikTok', icon: () => <span>🎵</span>, color: '#000000' },
  facebook: { label: 'Facebook', icon: ThumbsUp, color: '#1877F2' },
  twitter: { label: 'Twitter (X)', icon: AtSign, color: '#000000' },
  linkedin: { label: 'LinkedIn', icon: Briefcase, color: '#0A66C2' },
  email: { label: 'Email', icon: null, color: '#666666' },
}

type PlatformKey = keyof typeof PlatformOption

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const TriggerButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 1rem;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`

const CloseButton = styled.button`
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
`

const RewardBanner = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 2rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const RewardAmount = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  span:first-child {
    font-size: 0.875rem;
    opacity: 0.9;
  }
  
  span:last-child {
    font-size: 1.75rem;
    font-weight: 700;
  }
`

const HoldInfo = styled.div`
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #92400e;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`

const PlatformsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const PlatformButton = styled.button<{ isSelected: boolean; color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid ${props => props.isSelected ? props.color || '#6366f1' : '#e2e8f0'};
  background: ${props => props.isSelected ? `${props.color}10` || '#eef2ff' : '#f8fafc'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  color: ${props => props.isSelected ? props.color || '#6366f1' : '#0f172a'};
  
  &:hover {
    border-color: ${props => props.color || '#6366f1'};
    background: ${props => `${props.color}10` || '#eef2ff'};
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const PrimaryButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const SecondaryButton = styled.button`
  flex: 1;
  padding: 0.875rem 1.25rem;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #e2e8f0;
  }
`

const SuccessState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem 0;
`

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`

const SuccessTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`

const SuccessMessage = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
`

const VerificationTimeline = styled.div`
  background: #f0f9ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #1e40af;
`

const ErrorMessage = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  color: #991b1b;
  font-size: 0.875rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;

  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
`

type StateType = 'idle' | 'platform-select' | 'loading' | 'success' | 'error'

export const ShareActionButton: React.FC<ShareActionButtonProps> = ({
  campaignId,
  rewardAmountCents,
  rewardAmountDollars,
  campaignTitle,
  onRewardEarned,
  disabled = false,
}) => {
  const [state, setState] = useState<StateType>('idle')
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { mutate: createReward, isPending } = useCreateShareReward()

  const handleOpenModal = () => {
    setState('platform-select')
    setError(null)
  }

  const handleCloseModal = () => {
    setState('idle')
    setSelectedPlatform(null)
    setError(null)
  }

  const handleShareClick = async () => {
    if (!selectedPlatform) {
      setError('Please select a platform to share on')
      return
    }

    setState('loading')
    setError(null)

    try {
      createReward(
        {
          campaignId,
          action: 'social_share',
          platform: selectedPlatform,
          proofData: {
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
          },
        },
        {
          onSuccess: (data: any) => {
            setState('success')
            onRewardEarned?.(data)
            
            // Auto-close after 3 seconds
            setTimeout(() => {
              handleCloseModal()
            }, 3000)
          },
          onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || 'Failed to create reward'
            setError(errorMsg)
            setState('error')
          },
        }
      )
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'An error occurred'
      setError(errorMsg)
      setState('error')
    }
  }

  const handleRetry = () => {
    setState('platform-select')
    setError(null)
  }

  const isOpen = state !== 'idle'

  return (
    <Container>
      <TriggerButton
        onClick={handleOpenModal}
        disabled={disabled || isPending}
      >
        <Share2 size={18} />
        <span>Share to Earn {rewardAmountDollars}</span>
        <ArrowRight size={16} />
      </TriggerButton>

      <Modal isOpen={isOpen} onClick={handleCloseModal}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <ModalHeader>
            <ModalTitle>
              {state === 'success' ? 'Reward Earned! 🎉' : 'Share to Earn'}
            </ModalTitle>
            {state !== 'loading' && (
              <CloseButton onClick={handleCloseModal}>
                ✕
              </CloseButton>
            )}
          </ModalHeader>

          {/* Reward Banner */}
          {(state === 'platform-select' || state === 'error') && (
            <RewardBanner>
              <RewardAmount>
                <span>You'll Earn</span>
                <span>{rewardAmountDollars}</span>
              </RewardAmount>
              <Clock size={24} />
            </RewardBanner>
          )}

          {/* Hold Information */}
          {(state === 'platform-select' || state === 'error') && (
            <HoldInfo>
              <Clock size={18} />
              <div>
                <strong>30-Day Hold:</strong> Your reward will be available in 30 days after sharing. This helps us prevent fraud.
              </div>
            </HoldInfo>
          )}

          {/* Platform Selection */}
          {state === 'platform-select' && (
            <>
              <div>
                <p style={{ marginTop: 0, color: '#64748b', fontSize: '0.95rem' }}>
                  Where would you like to share "{campaignTitle}"?
                </p>
                <PlatformsGrid>
                  {(Object.entries(PlatformOption) as Array<[PlatformKey, typeof PlatformOption[PlatformKey]]>).map(
                    ([key, platform]) => {
                      const Icon = platform.icon
                      return (
                        <PlatformButton
                          key={key}
                          isSelected={selectedPlatform === key}
                          color={platform.color}
                          onClick={() => setSelectedPlatform(key)}
                        >
                          {Icon && <Icon />}
                          {platform.label}
                        </PlatformButton>
                      )
                    }
                  )}
                </PlatformsGrid>
              </div>

              <ActionButtons>
                <PrimaryButton
                  onClick={handleShareClick}
                  disabled={!selectedPlatform || isPending}
                >
                  {isPending ? 'Processing...' : 'Confirm Share'}
                </PrimaryButton>
                <SecondaryButton onClick={handleCloseModal}>
                  Cancel
                </SecondaryButton>
              </ActionButtons>
            </>
          )}

          {/* Loading State */}
          {state === 'loading' && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid #e2e8f0',
                borderTop: '3px solid #6366f1',
                borderRadius: '50%',
                margin: '0 auto 1rem',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{ color: '#64748b' }}>Processing your reward...</p>
              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <SuccessState>
              <SuccessIcon>
                <CheckCircle />
              </SuccessIcon>
              <SuccessTitle>Reward Earned!</SuccessTitle>
              <SuccessMessage>
                You've earned {rewardAmountDollars} for sharing "{campaignTitle}"
              </SuccessMessage>
              <VerificationTimeline>
                <strong>📅 Timeline:</strong>
                <div style={{ marginTop: '0.5rem', opacity: 0.9 }}>
                  🔒 Day 1-30: Reward on hold (fraud prevention)<br/>
                  ✅ Day 30+: Reward verified & ready for payout<br/>
                  💰 Request payout anytime after verification
                </div>
              </VerificationTimeline>
            </SuccessState>
          )}

          {/* Error State */}
          {state === 'error' && (
            <>
              <ErrorMessage>
                <AlertCircle size={18} />
                {error || 'An error occurred. Please try again.'}
              </ErrorMessage>
              <ActionButtons>
                <PrimaryButton onClick={handleRetry}>
                  Try Again
                </PrimaryButton>
                <SecondaryButton onClick={handleCloseModal}>
                  Close
                </SecondaryButton>
              </ActionButtons>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  )
}
