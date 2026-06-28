'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { CheckCircle, Home, Heart, ArrowRight, Sparkles } from 'lucide-react'
import { useEffect } from 'react'
import { useConversionPixel } from '@/utils/conversionPixel'

interface DonationSuccessModalProps {
  transactionId: string
  amount: number
  campaignId: string
  campaignTitle: string
  isOpen: boolean
  referralCode?: string | null
  onClose?: () => void
}

// ─── Design Tokens (matched to /dashboard) ──────────────────────────────────

const tk = {
  ink:        '#18171A',
  inkLight:   '#242228',
  canvas:     '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border:     '#E2DDD6',
  white:      '#FFFFFF',
  muted:      '#8C8790',
  body:       '#4A4750',
  heading:    '#18171A',
  amber:      '#D4870A',
  amberLight: '#FBF3E0',
  amberMid:   '#F5C961',
  amberDark:  '#A8680A',
  green:      '#1A7A4A',
  greenLight: '#E8F5EE',
  blue:       '#1A5FA8',
  blueLight:  '#E8F0FB',
  purple:     '#7E22CE',
  purpleLight:'#F3E8FF',
  purpleBorder:'#E9D5FF',
}

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
`

// ─── Animations ──────────────────────────────────────────────────────────────

const popIn = keyframes`
  from { opacity: 0; transform: translateY(16px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
`

const scaleIn = keyframes`
  from { transform: scale(0.5); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
`

// ─── Layout ──────────────────────────────────────────────────────────────────

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(24, 23, 26, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  opacity: ${(p) => (p.$isOpen ? 1 : 0)};
  pointer-events: ${(p) => (p.$isOpen ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
  font-family: 'DM Sans', sans-serif;
`

const Modal = styled.div<{ $isOpen: boolean }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 16px;
  padding: 2rem;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 24px 48px -12px rgba(24, 23, 26, 0.28);
  max-height: 90vh;
  overflow-y: auto;
  animation: ${popIn} 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (max-width: 640px) {
    padding: 1.5rem;
    border-radius: 14px;
  }
`

const IconContainer = styled.div`
  text-align: center;
  margin-bottom: 1.25rem;
`

const CheckBadge = styled.div`
  width: 4.5rem;
  height: 4.5rem;
  margin: 0 auto;
  border-radius: 18px;
  background: ${tk.greenLight};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${scaleIn} 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;

  svg {
    width: 2.25rem;
    height: 2.25rem;
    color: ${tk.green};
  }
`

const Title = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0 0 0.5rem 0;
  text-align: center;
  line-height: 1.15;
  letter-spacing: -0.5px;

  @media (max-width: 640px) {
    font-size: 1.4rem;
  }
`

const Subtitle = styled.p`
  font-size: 0.95rem;
  color: ${tk.muted};
  text-align: center;
  margin: 0 0 1.75rem 0;
  line-height: 1.5;
`

const DetailsCard = styled.div`
  background: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 0.5rem 1rem;
  margin-bottom: 1.25rem;
`

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid ${tk.border};

  &:last-child {
    border-bottom: none;
  }
`

const DetailLabel = styled.span`
  color: ${tk.muted};
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
`

const DetailValue = styled.span`
  color: ${tk.heading};
  font-size: 0.9rem;
  font-weight: 500;
  font-family: 'DM Mono', monospace;
  text-align: right;
`

const DetailValueText = styled(DetailValue)`
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
`

const InfoBox = styled.div<{ $variant?: 'info' | 'prayer' }>`
  border-radius: 14px;
  padding: 1rem 1.125rem;
  margin-bottom: 1.25rem;
  font-size: 0.85rem;
  line-height: 1.6;

  ${(p) =>
    p.$variant === 'prayer'
      ? `
    background: ${tk.purpleLight};
    border: 1px solid ${tk.purpleBorder};
    color: ${tk.purple};
  `
      : `
    background: ${tk.blueLight};
    border: 1px solid rgba(26, 95, 168, 0.18);
    color: ${tk.blue};
  `}
`

const InfoHead = styled.strong`
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
`

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const Button = styled(Link)<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: 11px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.875rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 160ms ease;

  ${(p) =>
    p.$variant === 'secondary'
      ? `
    background: ${tk.white};
    color: ${tk.body};
    border: 1px solid ${tk.border};

    &:hover {
      background: ${tk.canvasDeep};
      color: ${tk.heading};
    }
  `
      : `
    background: ${tk.ink};
    color: ${tk.white};
    border: 1px solid transparent;

    &:hover {
      background: ${tk.inkLight};
      transform: translateY(-1px);
    }
  `}

  &:focus-visible {
    outline: 2px solid ${tk.amber};
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    padding: 0.85rem 1rem;
  }
`

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * DonationSuccessModal Component
 * Modal displayed after successful donation submission
 */
export function DonationSuccessModal({
  transactionId,
  amount,
  campaignId,
  campaignTitle,
  isOpen,
  referralCode,
}: DonationSuccessModalProps) {
  const router = useRouter()
  const { fireConversionPixel } = useConversionPixel(campaignId, referralCode || '', amount * 100)

  // Fire conversion pixel when modal opens with a referral code
  useEffect(() => {
    if (isOpen && referralCode && fireConversionPixel) {
      console.log('🎯 DonationSuccessModal: Recording conversion pixel', {
        campaignId,
        referralCode,
        amount
      })
      // Fire the conversion pixel programmatically
      fireConversionPixel()
    }
  }, [isOpen, referralCode, campaignId, amount, fireConversionPixel])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      router.push(`/campaigns/${campaignId}`)
    }
  }

  return (
    <>
      <GlobalStyle />
      <Overlay $isOpen={isOpen} onClick={handleOverlayClick} role="presentation">
        <Modal $isOpen={isOpen} role="alertdialog" aria-labelledby="success-title" aria-describedby="success-description">
          <IconContainer>
            <CheckBadge>
              <CheckCircle aria-hidden="true" />
            </CheckBadge>
          </IconContainer>

          <Title id="success-title">Donation Recorded</Title>
          <Subtitle id="success-description">
            Thank you! Your donation is awaiting the creator&apos;s confirmation.
          </Subtitle>

          <DetailsCard>
            <DetailRow>
              <DetailLabel>Transaction ID</DetailLabel>
              <DetailValue>{transactionId}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Amount</DetailLabel>
              <DetailValue>{formatCurrency(amount)}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Campaign</DetailLabel>
              <DetailValueText>{campaignTitle}</DetailValueText>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Date</DetailLabel>
              <DetailValue>{formatDate(new Date().toISOString())}</DetailValue>
            </DetailRow>
          </DetailsCard>

          <InfoBox $variant="info">
            <InfoHead>What happens next?</InfoHead>
            Send your payment directly to the creator using the details shown, if you haven&apos;t already.
            The creator then confirms they received it — only then does your donation count toward the
            campaign total. You can track its status anytime in your donation history.
          </InfoBox>

          <InfoBox $variant="prayer">
            <InfoHead>
              <Sparkles size={16} /> Want to do more?
            </InfoHead>
            Consider adding a prayer of encouragement for this campaign. Your prayers complement your generous donation!
          </InfoBox>

          <ButtonGroup>
            <Button href={`/campaigns/${campaignId}`} $variant="primary" aria-label={`Return to ${campaignTitle} campaign`}>
              <Heart size={18} />
              View Campaign
            </Button>
            <Button href="/donations" $variant="secondary" aria-label="View all your donations">
              View My Donations
              <ArrowRight size={18} />
            </Button>
            <Button href="/campaigns" $variant="secondary" aria-label="Browse more campaigns to support">
              <Home size={18} />
              Browse More Campaigns
            </Button>
          </ButtonGroup>
        </Modal>
      </Overlay>
    </>
  )
}
