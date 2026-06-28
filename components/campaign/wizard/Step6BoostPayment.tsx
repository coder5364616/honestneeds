'use client'

import React, { useEffect, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import {
  CreditCard, ShieldCheck, RefreshCw, AlertCircle,
  Lock, CheckCircle2, Loader2, Rocket, Leaf,
  Eye, Calendar, Bolt,
} from 'lucide-react'
import { useCreateCheckoutSession, useGetSessionStatus } from '@/api/hooks/useBoosts'
import { BOOST_TIERS } from '@/utils/boostValidationSchemas'

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const successPop = keyframes`
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); opacity: 1; }
`

// ─── Layout ────────────────────────────────────────────────────────────────────

const Wrap = styled.div`
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 520px;
  margin: 0 auto;
  padding: 0.25rem 0;
`

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = styled.div`
  text-align: center;
  animation: ${fadeUp} 0.35s ease both;
`

const StepTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 0.75rem;

  svg { width: 12px; height: 12px; }

  @media (prefers-color-scheme: dark) {
    background: #1e3a8a;
    color: #93c5fd;
  }
`

const Title = styled.h2`
  font-family: 'Syne', 'DM Sans', sans-serif;
  font-size: clamp(1.35rem, 4vw, 1.8rem);
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.3rem;

  @media (prefers-color-scheme: dark) { color: #f1f5f9; }
`

const CampaignLabel = styled.p`
  font-size: 0.875rem;
  color: #64748b;

  strong { color: #0f172a; font-weight: 500; }

  @media (prefers-color-scheme: dark) {
    color: #94a3b8;
    strong { color: #e2e8f0; }
  }
`

// ─── Order card ───────────────────────────────────────────────────────────────

const OrderCard = styled.div`
  background: #fff;
  border: 0.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  animation: ${fadeUp} 0.35s 0.05s ease both;

  @media (prefers-color-scheme: dark) {
    background: #1e293b;
    border-color: #334155;
  }
`

const OrderHead = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 1rem 1.25rem 0.875rem;
  border-bottom: 0.5px solid #f1f5f9;

  @media (prefers-color-scheme: dark) { border-color: #334155; }
`

const TierIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg { width: 18px; height: 18px; }

  @media (prefers-color-scheme: dark) {
    background: #1e3a8a;
    color: #93c5fd;
  }
`

const TierInfo = styled.div`
  flex: 1;
`

const TierName = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;

  @media (prefers-color-scheme: dark) { color: #f1f5f9; }
`

const TierSub = styled.div`
  font-size: 0.775rem;
  color: #94a3b8;
`

const OrderRows = styled.div`
  padding: 0.375rem 0;
`

const OrderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1.25rem;
`

const RowLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
  color: #64748b;

  svg { width: 14px; height: 14px; color: #cbd5e1; }
`

const RowVal = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;

  @media (prefers-color-scheme: dark) { color: #e2e8f0; }
`

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1.25rem;
  border-top: 0.5px solid #f1f5f9;
  background: #f8fafc;

  @media (prefers-color-scheme: dark) {
    border-color: #334155;
    background: #0f172a;
  }
`

const TotalLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #64748b;
`

const TotalVal = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;

  @media (prefers-color-scheme: dark) { color: #f1f5f9; }
`

// ─── Trust strip ──────────────────────────────────────────────────────────────

const TrustStrip = styled.div`
  display: flex;
  gap: 0.75rem;
  animation: ${fadeUp} 0.35s 0.1s ease both;

  @media (max-width: 480px) { flex-direction: column; }
`

const TrustItem = styled.div`
  flex: 1;
  background: #fff;
  border: 0.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  svg { color: #15803d; width: 15px; height: 15px; flex-shrink: 0; margin-top: 2px; }

  @media (prefers-color-scheme: dark) {
    background: #1e293b;
    border-color: #334155;
    svg { color: #4ade80; }
  }
`

const TrustText = styled.div`
  font-size: 0.775rem;
  color: #64748b;
  line-height: 1.45;

  strong { display: block; color: #0f172a; font-weight: 500; margin-bottom: 2px; }

  @media (prefers-color-scheme: dark) {
    color: #94a3b8;
    strong { color: #e2e8f0; }
  }
`

// ─── Info note ────────────────────────────────────────────────────────────────

const InfoNote = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 0.875rem 1rem;
  background: #eff6ff;
  border-radius: 8px;
  font-size: 0.825rem;
  color: #1e40af;
  line-height: 1.55;
  animation: ${fadeUp} 0.35s 0.15s ease both;

  svg { width: 15px; height: 15px; flex-shrink: 0; margin-top: 2px; }

  @media (prefers-color-scheme: dark) {
    background: #1e3a8a;
    color: #93c5fd;
  }
`

// ─── Processing state ─────────────────────────────────────────────────────────

const ProcessingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  padding: 2rem 1.5rem;
  background: #fff;
  border: 0.5px solid #e2e8f0;
  border-radius: 12px;
  text-align: center;
  animation: ${fadeUp} 0.3s ease both;

  @media (prefers-color-scheme: dark) {
    background: #1e293b;
    border-color: #334155;
  }
`

const SpinnerIcon = styled(Loader2)`
  animation: ${spin} 0.8s linear infinite;
  color: #1d4ed8;
  width: 32px;
  height: 32px;
`

const ProcessingLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #0f172a;

  @media (prefers-color-scheme: dark) { color: #f1f5f9; }
`

const ProcessingSub = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
`

// ─── Success state ────────────────────────────────────────────────────────────

const SuccessState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  background: #f0fdf4;
  border: 0.5px solid #bbf7d0;
  border-radius: 12px;
  text-align: center;
  animation: ${fadeUp} 0.3s ease both;

  @media (prefers-color-scheme: dark) {
    background: #14532d;
    border-color: #16a34a;
  }
`

const SuccessIconWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #15803d;
  color: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${successPop} 0.4s ease both;

  svg { width: 22px; height: 22px; }
`

const SuccessLabel = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #14532d;

  @media (prefers-color-scheme: dark) { color: #bbf7d0; }
`

const SuccessSub = styled.div`
  font-size: 0.825rem;
  color: #15803d;

  @media (prefers-color-scheme: dark) { color: #4ade80; }
`

// ─── Actions ──────────────────────────────────────────────────────────────────

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  animation: ${fadeUp} 0.35s 0.2s ease both;
`

const PayBtn = styled.button<{ $disabled?: boolean }>`
  width: 100%;
  padding: 0.9rem;
  background: ${({ $disabled }) => $disabled ? '#94a3b8' : '#1d4ed8'};
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s, transform 0.12s;

  svg { width: 17px; height: 17px; }

  &:hover:not(:disabled) { background: #1e40af; }
  &:active:not(:disabled) { transform: scale(0.99); }
`

const BackBtn = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  color: #64748b;
  border: 0.5px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;

  &:hover { background: #f8fafc; color: #0f172a; }

  @media (prefers-color-scheme: dark) {
    border-color: #334155;
    &:hover { background: #1e293b; color: #e2e8f0; }
  }
`

const StripeNote = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 0.74rem;
  color: #94a3b8;
  padding-top: 0.25rem;

  svg { width: 12px; height: 12px; }
`

// ─── Tier icon map ────────────────────────────────────────────────────────────

const TIER_ICONS: Record<string, React.ElementType> = {
  free: Leaf,
  pro: Rocket,
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Step6BoostPaymentProps {
  campaignId: string
  campaignTitle: string
  boostTier: string
  onSuccess: () => void
  onCancel: () => void
  isProcessing?: boolean
}

export const Step6BoostPayment: React.FC<Step6BoostPaymentProps> = ({
  campaignId,
  campaignTitle,
  boostTier,
  onSuccess,
  onCancel,
  isProcessing = false,
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isInitiating, setIsInitiating] = useState(false)

  const createCheckoutMutation = useCreateCheckoutSession()
  const { data: sessionStatus } = useGetSessionStatus(sessionId)

  const tierData = BOOST_TIERS[boostTier as keyof typeof BOOST_TIERS]
  const TierIconComp = TIER_ICONS[boostTier] ?? Rocket

  const isPaid = sessionStatus?.payment_status === 'paid'
  const isLoading = isInitiating || isProcessing || !!sessionId

  useEffect(() => {
    if (isPaid) {
      const t = setTimeout(() => onSuccess(), 1500)
      return () => clearTimeout(t)
    }
  }, [isPaid, onSuccess])

  const handleInitiateCheckout = async () => {
    if (!tierData || tierData.price === 0) {
      onSuccess()
      return
    }

    setIsInitiating(true)
    try {
      const result = await createCheckoutMutation.mutateAsync({
        campaign_id: campaignId,
        tier: boostTier as 'free' | 'pro',
      })

      if (result.checkout_url) {
        setSessionId(result.checkout_session_id)
        window.location.href = result.checkout_url
      } else {
        onSuccess()
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      setIsInitiating(false)
    }
  }

  if (!tierData) return <div>Invalid boost tier</div>

  const isFree = tierData.price === 0

  return (
    <Wrap>
      <Header>
        <StepTag><CreditCard /> Step 6 of 6</StepTag>
        <Title>Review &amp; confirm</Title>
        <CampaignLabel>Campaign: <strong>"{campaignTitle}"</strong></CampaignLabel>
      </Header>

      <OrderCard>
        <OrderHead>
          <TierIcon><TierIconComp /></TierIcon>
          <TierInfo>
            <TierName>{tierData.name} Boost</TierName>
            <TierSub>Selected visibility tier</TierSub>
          </TierInfo>
        </OrderHead>

        <OrderRows>
          <OrderRow>
            <RowLabel><Eye /> Visibility multiplier</RowLabel>
            <RowVal>{tierData.visibility_weight}× boost</RowVal>
          </OrderRow>
          <OrderRow>
            <RowLabel><Calendar /> Active duration</RowLabel>
            <RowVal>{tierData.duration_days ? `${tierData.duration_days} days` : 'Ongoing'}</RowVal>
          </OrderRow>
          <OrderRow>
            <RowLabel><Bolt /> Activation</RowLabel>
            <RowVal>Instant on publish</RowVal>
          </OrderRow>
        </OrderRows>

        <TotalRow>
          <TotalLabel>Total due today</TotalLabel>
          <TotalVal>{isFree ? 'Free' : `$${tierData.price.toFixed(2)}`}</TotalVal>
        </TotalRow>
      </OrderCard>

      <TrustStrip>
        <TrustItem>
          <ShieldCheck />
          <TrustText>
            <strong>Secure payment</strong>
            256-bit SSL via Stripe
          </TrustText>
        </TrustItem>
        <TrustItem>
          <RefreshCw />
          <TrustText>
            <strong>No recurring charges</strong>
            One-time purchase only
          </TrustText>
        </TrustItem>
      </TrustStrip>

      {!isFree && (
        <InfoNote>
          <AlertCircle />
          You'll be redirected to Stripe's secure checkout. Once payment completes, your boost
          activates and your campaign goes live instantly.
        </InfoNote>
      )}

      {isPaid && (
        <SuccessState>
          <SuccessIconWrap><CheckCircle2 /></SuccessIconWrap>
          <SuccessLabel>Payment successful!</SuccessLabel>
          <SuccessSub>Your boost is active — campaign publishing now</SuccessSub>
        </SuccessState>
      )}

      {isLoading && !isPaid && (
        <ProcessingState>
          <SpinnerIcon />
          <ProcessingLabel>
            {isFree ? 'Activating your boost…' : 'Redirecting to Stripe…'}
          </ProcessingLabel>
          <ProcessingSub>Please don't close this tab</ProcessingSub>
        </ProcessingState>
      )}

      {!isLoading && !isPaid && (
        <Actions>
          <PayBtn
            $disabled={isInitiating || isProcessing}
            disabled={isInitiating || isProcessing}
            onClick={handleInitiateCheckout}
            aria-label={isFree ? 'Continue with free boost' : `Pay $${tierData.price.toFixed(2)} and publish campaign`}
          >
            <Lock />
            {isFree ? 'Continue with free boost' : `Pay $${tierData.price.toFixed(2)} & publish campaign`}
          </PayBtn>
          <BackBtn onClick={onCancel} disabled={isInitiating || isProcessing}>
            ← Back to boost selection
          </BackBtn>
        </Actions>
      )}

      {!isFree && (
        <StripeNote>
          <Lock /> Powered by Stripe · Your card is never stored on our servers
        </StripeNote>
      )}
    </Wrap>
  )
}

export default Step6BoostPayment