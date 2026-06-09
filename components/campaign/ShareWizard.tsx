'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import { useRecordShare } from '@/api/hooks/useCampaigns'
import ShareResult from '@/components/campaign/ShareResult'
import { toast } from 'react-toastify'

// ============================================
// Types
// ============================================

interface ShareWizardProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  campaignTitle: string
  campaignDescription?: string
  creator_name?: string
  share_config?: {
    amount_per_share?: number
    total_budget?: number
    share_channels?: string[]
    platforms?: string[]  // Backend may use 'platforms' instead of 'share_channels'
  }
}

type Step = 'platform' | 'preview' | 'confirm'

// ============================================
// Platform Configuration
// ============================================

const SHARING_PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '𝕏',
    color: '#000000',
    bgColor: 'rgba(0, 0, 0, 0.05)',
    description: 'Share to your Twitter followers',
    intent: (text: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    bgColor: 'rgba(24, 119, 242, 0.05)',
    description: 'Share to your Facebook timeline',
    intent: (text: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'in',
    color: '#0A66C2',
    bgColor: 'rgba(10, 102, 194, 0.05)',
    description: 'Share to your LinkedIn network',
    intent: (text: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
  },
  {
    id: 'email',
    name: 'Email',
    icon: '✉️',
    color: '#EA4335',
    bgColor: 'rgba(234, 67, 53, 0.05)',
    description: 'Share via email',
    intent: (text: string, url: string) =>
      `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(
        url
      )}`,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    bgColor: 'rgba(37, 211, 102, 0.05)',
    description: 'Share via WhatsApp',
    intent: (text: string, url: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    color: '#0088cc',
    bgColor: 'rgba(0, 136, 204, 0.05)',
    description: 'Share via Telegram',
    intent: (text: string, url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
        text
      )}`,
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: 'R',
    color: '#FF4500',
    bgColor: 'rgba(255, 69, 0, 0.05)',
    description: 'Share to Reddit communities',
    intent: (text: string, url: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(
        text
      )}`,
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: '📋',
    color: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.05)',
    description: 'Copy link to clipboard',
    intent: () => '',
  },
]

// ============================================
// Styled Components
// ============================================

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 200ms ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const ModalContainer = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    border-radius: 0;
    max-height: 100vh;
    margin: auto;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;

  @media (min-width: 640px) {
    padding: 2rem;
  }
`

const Title = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;

  @media (min-width: 640px) {
    font-size: 1.5rem;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 200ms ease;

  &:hover {
    color: #111827;
  }
`

const Content = styled.div`
  padding: 1.5rem;

  @media (min-width: 640px) {
    padding: 2rem;
  }
`

const StepIndicator = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  justify-content: center;

  @media (min-width: 640px) {
    margin-bottom: 2rem;
  }
`

const StepDot = styled.div<{ active: boolean; completed: boolean }>`
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: ${(props) =>
    props.completed ? '#10b981' : props.active ? '#6366f1' : '#e5e7eb'};
  transition: background-color 200ms ease;

  @media (min-width: 640px) {
    width: 1rem;
    height: 1rem;
  }
`

// Platform Selection Step
const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.25rem;
  }
`

const PlatformCard = styled.button<{ selected: boolean; $bgColor: string; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  border: 2px solid ${(props) => (props.selected ? props.$color : '#e5e7eb')};
  border-radius: 0.5rem;
  background-color: ${(props) => (props.selected ? props.$bgColor : '#f9fafb')};
  cursor: pointer;
  transition: all 200ms ease;
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;

  @media (min-width: 640px) {
    padding: 1.75rem 1.25rem;
    font-size: 0.95rem;
    gap: 0.875rem;
  }

  &:hover {
    border-color: ${(props) => props.$color};
    background-color: ${(props) => props.$bgColor};
    transform: translateY(-2px);
  }

  span {
    font-size: 2rem;

    @media (min-width: 640px) {
      font-size: 2.5rem;
    }
  }
`

const PlatformDescription = styled.p`
  font-size: 0.7rem;
  color: #6b7280;
  margin: 0;
  text-align: center;

  @media (min-width: 640px) {
    font-size: 0.75rem;
  }
`

// Preview Step
const PreviewCard = styled.div`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    padding: 2rem;
    margin-bottom: 2rem;
  }
`

const PreviewTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;

  @media (min-width: 640px) {
    font-size: 1.125rem;
  }
`

const PreviewText = styled.p`
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
  margin: 0 0 1rem 0;
  word-break: break-word;

  @media (min-width: 640px) {
    font-size: 0.95rem;
  }
`

const RewardBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #dbeafe;
  color: #0c4a6e;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-top: 1rem;

  @media (min-width: 640px) {
    font-size: 0.95rem;
  }
`

const ShareURLSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const ShareURLLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  display: block;

  @media (min-width: 640px) {
    font-size: 0.95rem;
  }
`

const ShareURLInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #111827;
  background-color: white;
  cursor: text;
  user-select: all;

  @media (min-width: 640px) {
    padding: 0.875rem;
    font-size: 0.95rem;
  }

  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`

// Footer
const Footer = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;

  @media (min-width: 640px) {
    gap: 1rem;
    padding: 2rem;
  }
`

const Spacer = styled.div`
  flex: 1;
`

const InfoText = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
  padding: 1rem 0 0 0;
  margin: 0;

  @media (min-width: 640px) {
    font-size: 0.8rem;
  }
`

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    font-size: 0.95rem;
    margin-bottom: 2rem;
  }
`

// ============================================
// ShareWizard Component
// ============================================

export function ShareWizard({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
  campaignDescription,
  creator_name,
  share_config,
}: ShareWizardProps) {
  const [step, setStep] = useState<Step>('platform')
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [sharedPlatform, setSharedPlatform] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const recordShareMutation = useRecordShare()

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/campaigns/${campaignId}`
      : ''

  const shareText = `Check out "${campaignTitle}"${
    creator_name ? ` by ${creator_name}` : ''
  } on HonestNeed - Help make a difference!`

  const rewardAmount = share_config?.amount_per_share
    ? (share_config.amount_per_share / 100).toFixed(2)
    : '0.50'

  // Platform filtering - check both 'share_channels' and 'platforms' field names
  // If platforms are configured, only show those; otherwise show all available platforms
  const configuredPlatforms = share_config?.share_channels || share_config?.platforms
  const availablePlatforms = configuredPlatforms && configuredPlatforms.length > 0
    ? SHARING_PLATFORMS.filter((p) =>
        configuredPlatforms.includes(p.id)
      )
    : SHARING_PLATFORMS  // Default to all platforms if none specifically configured

  // DEBUG LOGGING
  useEffect(() => {
    console.log('🔍 [ShareWizard] Debug Info:', {
      isOpen,
      campaignId,
      share_config,
      share_channels: share_config?.share_channels,
      platforms: share_config?.platforms,
      configuredPlatforms,
      configuredPlatformsLength: configuredPlatforms?.length,
      availablePlatformsCount: availablePlatforms.length,
      availablePlatformIds: availablePlatforms.map(p => p.id),
      allPlatformsCount: SHARING_PLATFORMS.length,
      allPlatformIds: SHARING_PLATFORMS.map(p => p.id),
    })
  }, [isOpen, share_config, campaignId])

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId)
    setStep('preview')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    if (!selectedPlatform) return

    setIsSharing(true)
    try {
      // Record the share with the backend
      const shareResponse = await recordShareMutation.mutateAsync({
        campaignId,
        channel: selectedPlatform as any,
      })

      // ✅ Capture referral code from response for tracking
      if (shareResponse?.referral_code) {
        setReferralCode(shareResponse.referral_code)
        console.log('🔗 ShareWizard: Referral code captured', { 
          referral_code: shareResponse.referral_code 
        })
      }

      // Store the platform for result display
      setSharedPlatform(selectedPlatform)

      // Handle special cases
      if (selectedPlatform === 'copy') {
        await handleCopyLink()
      } else {
        const platform = SHARING_PLATFORMS.find((p) => p.id === selectedPlatform)
        if (platform && platform.id !== 'copy') {
          const shareLink = platform.intent(shareText, shareUrl)
          window.open(shareLink, '_blank', 'width=600,height=600')
        }
      }

      setStep('confirm')
    } catch (error) {
      console.error('Error recording share:', error)
      toast.error('Failed to record share. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const handleReset = () => {
    setStep('platform')
    setSelectedPlatform(null)
    setCopied(false)
    setReferralCode(null)
    setSharedPlatform(null)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  if (!isOpen || !isMounted) return null

  const selectedPlatformData = SHARING_PLATFORMS.find(
    (p) => p.id === selectedPlatform
  )

  return createPortal(
    <Overlay onClick={handleClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <Header>
          <Title>Share to Earn 💰</Title>
          <CloseButton onClick={handleClose} title="Close">
            <X size={24} />
          </CloseButton>
        </Header>

        {/* Content */}
        <Content>
          {/* Step Indicators */}
          <StepIndicator>
            <StepDot
              active={step === 'platform'}
              completed={
                step === 'preview' || step === 'confirm'
              }
            />
            <StepDot
              active={step === 'preview'}
              completed={step === 'confirm'}
            />
            <StepDot active={step === 'confirm'} completed={false} />
          </StepIndicator>

          {/* Platform Selection Step */}
          {step === 'platform' && (
            <div>
              <PreviewTitle style={{ marginBottom: '1.5rem' }}>
                Choose a platform to share
              </PreviewTitle>
              <PlatformGrid>
                {availablePlatforms.map((platform) => (
                  <PlatformCard
                    key={platform.id}
                    selected={selectedPlatform === platform.id}
                    $bgColor={platform.bgColor}
                    $color={platform.color}
                    onClick={() => handlePlatformSelect(platform.id)}
                  >
                    <span>{platform.icon}</span>
                    <div>
                      <strong>{platform.name}</strong>
                      <PlatformDescription>
                        {platform.description}
                      </PlatformDescription>
                    </div>
                  </PlatformCard>
                ))}
              </PlatformGrid>
              <InfoText>
                Earn ${rewardAmount} for each new donor who uses your referral link
              </InfoText>
            </div>
          )}

          {/* Preview Step */}
          {step === 'preview' && selectedPlatformData && (
            <div>
              <PreviewTitle>Preview your share</PreviewTitle>

              <PreviewCard>
                <PreviewTitle>{campaignTitle}</PreviewTitle>
                <PreviewText>
                  {campaignDescription?.substring(0, 150)
                    ? campaignDescription.substring(0, 150) + '...'
                    : 'Help support this campaign'}
                </PreviewText>
                {creator_name && (
                  <PreviewText style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
                    By {creator_name}
                  </PreviewText>
                )}
                <RewardBadge>
                  💵 Earn ${rewardAmount} per share
                </RewardBadge>
              </PreviewCard>

              <ShareURLSection>
                <ShareURLLabel>Your unique share link:</ShareURLLabel>
                <ShareURLInput
                  type="text"
                  value={shareUrl}
                  readOnly
                  onClick={(e) => e.currentTarget.select()}
                />
              </ShareURLSection>

              <InfoText>
                This link tracks your shares and validates rewards
              </InfoText>
            </div>
          )}

          {/* Confirmation Step with ShareResult */}
          {step === 'confirm' && selectedPlatformData && referralCode && (
            <ShareResult
              campaignId={campaignId}
              campaignTitle={campaignTitle}
              referralCode={referralCode}
              rewardAmount={share_config?.amount_per_share || 50}
              sharedPlatform={sharedPlatform || undefined}
              onClose={handleClose}
            />
          )}

          {/* Fallback confirmation if referral code not available */}
          {step === 'confirm' && selectedPlatformData && !referralCode && (
            <div>
              <SuccessMessage>
                ✓ Share recorded successfully!
              </SuccessMessage>

              <PreviewCard>
                <PreviewTitle style={{ color: '#10b981' }}>
                  🎉 Great! You're earning
                </PreviewTitle>
                <PreviewText>
                  Your unique share link has been tracked. When someone clicks it
                  and makes a donation, you'll earn ${rewardAmount}.
                </PreviewText>
                <div style={{ marginTop: '1rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#111827' }}>
                    What's next?
                  </strong>
                  <ul
                    style={{
                      fontSize: '0.85rem',
                      color: '#6b7280',
                      lineHeight: '1.6',
                      marginTop: '0.5rem',
                      paddingLeft: '1.25rem',
                    }}
                  >
                    <li>Open {selectedPlatformData.name} to share</li>
                    <li>Share your unique link</li>
                    <li>Wait 30 days for fraud verification</li>
                    <li>Your earnings will be approved & available to withdraw</li>
                  </ul>
                </div>
              </PreviewCard>

              <InfoText>
                Your rewards are held for 30 days to prevent fraud
              </InfoText>
            </div>
          )}
        </Content>

        {/* Footer */}
        <Footer>
          {step !== 'platform' && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                if (step === 'confirm') {
                  handleReset()
                } else {
                  setStep('platform')
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ChevronLeft size={16} />
              Back
            </Button>
          )}

          <Spacer />

          {step === 'confirm' ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleClose}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Done
            </Button>
          ) : (
            <>
              {step === 'preview' && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleCopyLink}
                  disabled={isSharing}
                  title="Copy link to clipboard"
                >
                  {copied ? '✓ Copied' : 'Copy Link'}
                </Button>
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={handleShare}
                disabled={
                  !selectedPlatform || isSharing || recordShareMutation.isPending
                }
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {isSharing || recordShareMutation.isPending ? (
                  <>
                    ⏳ Sharing...
                  </>
                ) : (
                  <>
                    Share <ChevronRight size={16} />
                  </>
                )}
              </Button>
            </>
          )}
        </Footer>
      </ModalContainer>
    </Overlay>,
    document.body
  )
}
