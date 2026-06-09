'use client'

import { useEffect, useCallback, useMemo, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'react-toastify'
import styled, { keyframes, css } from 'styled-components'
import { useDonationWizardStore } from '@/store/donationWizardStore'
import { StepIndicator, WizardActions } from './DonationWizardSteps'
import { DonationStep1Amount, type Step1AmountRef } from './DonationStep1Amount'
import { DonationStep2PaymentMethod } from './DonationStep2PaymentMethod'
import { DonationStep3Confirmation } from './DonationStep3Confirmation'
import { DonationSuccessModal } from './DonationSuccessModal'
import { useCreateDonation } from '@/api/hooks/useDonations'
import { useCampaign } from '@/api/hooks/useCampaigns'
import type { DonationPaymentMethod, DonationConfirmationFormData } from '@/utils/validationSchemas'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DonationWizardProps {
  campaignId: string
}

export interface DonationWizardContentProps {
  campaignId: string
  campaignTitle: string
  creatorName: string
  paymentMethods: Array<{ type: string; [key: string]: any }>
  onDonationSuccess: (transactionId: string, amount: number) => void
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`

const glowPulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50%       { opacity: 0.8; transform: scale(1.08); }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

// ─── Page Shell ───────────────────────────────────────────────────────────────

const PageShell = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #F8FAFF;
  position: relative;
  overflow: hidden;

  /* Multi-radial background wash — brand-consistent */
  &::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 65% 45% at 5%  10%,  rgba(253,224,71, 0.12) 0%, transparent 55%),
      radial-gradient(ellipse 55% 40% at 95% 5%,   rgba(56,189,248, 0.10) 0%, transparent 50%),
      radial-gradient(ellipse 50% 50% at 50% 100%,  rgba(244,63, 94, 0.08) 0%, transparent 55%);
    pointer-events: none;
    z-index: 0;
  }

  /* Dot grid */
  &::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(15,23,42,0.045) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 20%, transparent 100%);
  }
`

const Blob = styled.div`
  position: fixed;
  border-radius: 50%;
  filter: blur(72px);
  pointer-events: none;
  z-index: 0;
`

const BlobAmber = styled(Blob)`
  width: 300px; height: 300px;
  background: rgba(253,224,71,0.18);
  top: -80px; left: -60px;
  animation: ${glowPulse} 8s ease-in-out infinite;
`

const BlobBlue = styled(Blob)`
  width: 240px; height: 240px;
  background: rgba(56,189,248,0.14);
  top: 40px; right: -50px;
  animation: ${glowPulse} 10s ease-in-out infinite 3s;
`

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageInner = styled.div`
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-start;
  }
`

// ─── LEFT: Campaign context sidebar ──────────────────────────────────────────

const CampaignSidebar = styled.aside`
  width: 100%;
  padding: 24px 20px 0;

  @media (min-width: 768px) {
    width: 300px;
    min-width: 280px;
    max-width: 320px;
    padding: 40px 0 40px 32px;
    position: sticky;
    top: 80px;
    align-self: flex-start;
  }

  @media (min-width: 1024px) {
    width: 340px;
    padding: 48px 0 48px 48px;
  }
`

const SidebarCard = styled.div`
  border-radius: 20px;
  background: rgba(255,255,255,0.90);
  backdrop-filter: blur(12px);
  border: 1.5px solid rgba(255,255,255,0.75);
  box-shadow: 0 4px 20px rgba(15,23,42,0.08), 0 1px 4px rgba(15,23,42,0.04);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 16px; right: 16px; height: 2.5px;
    background: linear-gradient(90deg, #F59E0B, #EF4444, #EC4899);
    border-radius: 0 0 2px 2px;
  }
`

const SidebarLabel = styled.p`
  font-size: 10.5px;
  font-weight: 800;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 10px;
`

const CampaignTitle = styled.h3`
  font-family: 'Nunito', 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.3;
  margin: 0 0 6px;
`

const CreatorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`

const CreatorAvatar = styled.div`
  width: 28px; height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: white; flex-shrink: 0;
`

const CreatorName = styled.span`
  font-size: 13px; font-weight: 600; color: #475569;
`

const SidebarDivider = styled.div`
  height: 1px; background: #F1F5F9; margin: 14px 0;
`

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 600;
  color: #64748B;
  margin-bottom: 10px;

  .icon { font-size: 15px; flex-shrink: 0; }
`

const SecureBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  background: rgba(34,197,94,0.07);
  border: 1.5px solid rgba(34,197,94,0.18);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: #15803D;
  margin-top: 14px;

  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #22C55E; flex-shrink: 0;
  }
`

// ─── RIGHT: Wizard card ───────────────────────────────────────────────────────

const WizardColumn = styled.main`
  flex: 1;
  padding: 24px 20px 48px;

  @media (min-width: 768px) {
    padding: 40px 32px 60px;
    max-width: 600px;
  }

  @media (min-width: 1024px) {
    padding: 48px 48px 80px;
    max-width: 660px;
  }
`

const WizardCard = styled.div`
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(14px);
  border: 1.5px solid rgba(255,255,255,0.75);
  border-radius: 24px;
  box-shadow:
    0 8px 32px rgba(15,23,42,0.09),
    0 2px 8px rgba(15,23,42,0.05);
  padding: 28px 24px;
  animation: ${fadeUp} 0.45s ease forwards;

  @media (min-width: 640px) {
    padding: 36px 32px;
  }
`

// ─── Step Progress ────────────────────────────────────────────────────────────

const StepProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
`

const StepDot = styled.div<{ $state: 'done' | 'active' | 'idle' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  min-width: 32px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  transition: all 0.25s ease;
  position: relative;
  z-index: 1;

  ${({ $state }) => $state === 'done' && css`
    background: linear-gradient(135deg, #22C55E, #16A34A);
    color: white;
    box-shadow: 0 3px 10px rgba(34,197,94,0.30);
  `}
  ${({ $state }) => $state === 'active' && css`
    background: linear-gradient(135deg, #F59E0B, #EF4444);
    color: white;
    box-shadow: 0 3px 12px rgba(245,158,11,0.35);
  `}
  ${({ $state }) => $state === 'idle' && css`
    background: #F1F5F9;
    color: #94A3B8;
    border: 2px solid #E2E8F0;
  `}
`

const StepConnector = styled.div<{ $done: boolean }>`
  flex: 1;
  height: 2px;
  margin: 0 6px;
  border-radius: 999px;
  background: ${({ $done }) => $done
    ? 'linear-gradient(90deg, #22C55E, #16A34A)'
    : '#E2E8F0'};
  transition: background 0.4s ease;
`

const StepMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`

const StepLabel = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: #94A3B8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
`

const StepCount = styled.p`
  font-size: 12px;
  font-weight: 700;
  color: #CBD5E1;
  margin: 0;
`

// ─── States ───────────────────────────────────────────────────────────────────

const StateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  text-align: center;
  padding: 24px;
`

const SpinnerRing = styled.div`
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 3px solid #F1F5F9;
  border-top-color: #F59E0B;
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 16px;
`

const StateEmoji = styled.div`
  font-size: 40px;
  margin-bottom: 14px;
  line-height: 1;
`

const StateTitle = styled.h3`
  font-family: 'Nunito', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 8px;
`

const StateText = styled.p`
  font-size: 14px;
  color: #64748B;
  line-height: 1.6;
  margin: 0 0 20px;
  max-width: 320px;
`

const StateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  color: white;
  font-family: 'Nunito', sans-serif;
  font-size: 14px;
  font-weight: 800;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(239,68,68,0.28);
  transition: box-shadow 0.2s ease, transform 0.15s ease;

  &:hover {
    box-shadow: 0 6px 22px rgba(239,68,68,0.38);
    transform: translateY(-1px);
  }
`

// ─── Mobile Campaign Banner (shows above card on mobile) ─────────────────────

const MobileCampaignBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.88);
  backdrop-filter: blur(10px);
  border: 1.5px solid rgba(255,255,255,0.7);
  border-radius: 14px;
  box-shadow: 0 2px 12px rgba(15,23,42,0.07);
  margin-bottom: 16px;

  @media (min-width: 768px) {
    display: none;
  }
`

const BannerAccent = styled.div`
  width: 4px;
  min-width: 4px;
  height: 36px;
  border-radius: 999px;
  background: linear-gradient(180deg, #F59E0B, #EF4444);
  flex-shrink: 0;
`

const BannerText = styled.div`
  .label { font-size: 10px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.06em; }
  .title { font-size: 13.5px; font-weight: 800; color: #0F172A; line-height: 1.2; }
`

// ─── Step label map ───────────────────────────────────────────────────────────

const STEP_LABELS = ['Amount', 'Payment', 'Confirm']

// ─── DonationWizardContent ────────────────────────────────────────────────────

function DonationWizardContent({
  campaignId,
  campaignTitle,
  creatorName,
  paymentMethods,
  onDonationSuccess,
}: DonationWizardContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const step1FormRef = useRef<Step1AmountRef>(null)

  const {
    currentStep, formData, errors, isSubmitting,
    setCurrentStep, setAmount, setPaymentMethod,
    setErrors, setIsSubmitting, setCampaignId,
  } = useDonationWizardStore()

  const { mutateAsync: createDonation } = useCreateDonation()

  useEffect(() => {
    const refFromUrl = searchParams.get('ref')
    if (refFromUrl) {
      setReferralCode(refFromUrl)
      sessionStorage.setItem(`referral_code_${campaignId}`, refFromUrl)
    } else {
      const refFromStorage = sessionStorage.getItem(`referral_code_${campaignId}`)
      if (refFromStorage) setReferralCode(refFromStorage)
    }
  }, [campaignId, searchParams])

  useEffect(() => { setCampaignId(campaignId) }, [campaignId, setCampaignId])

  const validateStep2 = useCallback(() => {
    if (!formData.paymentMethod) {
      setErrors({ paymentMethod: 'Please select a payment method' })
      return false
    }
    setErrors({})
    return true
  }, [formData.paymentMethod, setErrors])

  const validateStep3 = useCallback(() => {
    if (!formData.agreePaymentSent) {
      setErrors({ agreement: 'You must confirm that you have sent payment' })
      return false
    }
    setErrors({})
    return true
  }, [formData.agreePaymentSent, setErrors])

  const handleNext = useCallback(() => {
    if (currentStep === 1) {
      step1FormRef.current?.submitForm()
      return
    }
    const valid = currentStep === 2 ? validateStep2() : validateStep3()
    if (valid) setCurrentStep(currentStep + 1)
  }, [currentStep, validateStep2, validateStep3, setCurrentStep])

  const handleBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
    else router.back()
  }, [currentStep, setCurrentStep, router])

  const handleStep1Next = useCallback((amount: number) => {
    setAmount(amount)
    setCurrentStep(currentStep + 1)
  }, [setAmount, setCurrentStep, currentStep])

  const handleStep2Next = useCallback((method: DonationPaymentMethod) => {
    setPaymentMethod(method)
    setCurrentStep(currentStep + 1)
  }, [setPaymentMethod, setCurrentStep, currentStep])

  const handleStep3Submit = useCallback(async (data: DonationConfirmationFormData) => {
    setIsSubmitting(true)
    try {
      const paymentMethodType = typeof formData.paymentMethod === 'string'
        ? formData.paymentMethod
        : (formData.paymentMethod as any)?.type

      const payload: any = {
        campaignId,
        amount: formData.amount || 0,
        paymentMethod: paymentMethodType,
        screenshotProof: data.screenshotProof,
      }
      if (referralCode) payload.referralCode = referralCode

      const result = await createDonation(payload)

      if (result.share_reward) {
        toast.info(
          `🎉 You earned $${result.share_reward.amount_dollars} from your share (pending 30-day verification)`,
          { autoClose: 6000, toastId: 'donation-share-reward' }
        )
      }
      onDonationSuccess(result.transactionId, formData.amount || 0)
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to submit donation'
      toast.error(msg)
      setIsSubmitting(false)
    }
  }, [campaignId, formData, createDonation, onDonationSuccess, setIsSubmitting, referralCode])

  const canContinue = useMemo(() => {
    if (currentStep < 3) return true
    return !!formData.agreePaymentSent
  }, [currentStep, formData.agreePaymentSent])

  const stepState = (n: number): 'done' | 'active' | 'idle' =>
    n < currentStep ? 'done' : n === currentStep ? 'active' : 'idle'

  const creatorInitial = creatorName?.[0]?.toUpperCase() || 'C'

  return (
    <>
      {/* Mobile campaign banner */}
      <MobileCampaignBanner>
        <BannerAccent />
        <BannerText>
          <div className="label">Donating to</div>
          <div className="title">{campaignTitle}</div>
        </BannerText>
      </MobileCampaignBanner>

      {/* Step progress */}
      <StepMeta>
        <StepLabel>{STEP_LABELS[currentStep - 1]}</StepLabel>
        <StepCount>Step {currentStep} of 3</StepCount>
      </StepMeta>

      <StepProgress>
        <StepDot $state={stepState(1)}>
          {currentStep > 1 ? '✓' : '1'}
        </StepDot>
        <StepConnector $done={currentStep > 1} />
        <StepDot $state={stepState(2)}>
          {currentStep > 2 ? '✓' : '2'}
        </StepDot>
        <StepConnector $done={currentStep > 2} />
        <StepDot $state={stepState(3)}>3</StepDot>
      </StepProgress>

      {/* Step content */}
      {currentStep === 1 && (
        <DonationStep1Amount
          ref={step1FormRef}
          initialAmount={formData.amount || 25}
          onNext={handleStep1Next}
          isLoading={isSubmitting}
        />
      )}

      {currentStep === 2 && formData.amount && (
        <DonationStep2PaymentMethod
          paymentMethods={paymentMethods}
          creatorName={creatorName}
          amount={formData.amount}
          onNext={handleStep2Next}
          isLoading={isSubmitting}
        />
      )}

      {currentStep === 3 && formData.amount && formData.paymentMethod && (
        <DonationStep3Confirmation
          amount={formData.amount}
          paymentMethod={formData.paymentMethod as DonationPaymentMethod}
          campaignTitle={campaignTitle}
          onSubmit={handleStep3Submit}
          isLoading={isSubmitting}
        />
      )}

      {currentStep < 3 && (
        <WizardActions
          currentStep={currentStep}
          totalSteps={3}
          canGoBack={true}
          canContinue={canContinue}
          onBack={handleBack}
          onNext={handleNext}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  )
}

// ─── Main DonationWizard ──────────────────────────────────────────────────────

export function DonationWizard({ campaignId }: DonationWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [successData, setSuccessData] = useState<{
    transactionId: string
    amount: number
    referralCode?: string | null
  } | null>(null)

  const { data: campaign, isLoading, error: campaignError } = useCampaign(campaignId)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setReferralCode(ref)
  }, [searchParams])

  const handleDonationSuccess = (transactionId: string, amount: number) => {
    setSuccessData({ transactionId, amount, referralCode })
    setShowSuccess(true)
  }

  const creatorInitial = campaign?.creator_name?.[0]?.toUpperCase() || 'C'

  // ── Loading ──
  if (isLoading) {
    return (
      <PageShell>
        <BlobAmber /><BlobBlue />
        <PageInner style={{ alignItems: 'center', justifyContent: 'center' }}>
          <WizardCard style={{ maxWidth: 400, width: '90%', margin: '40px auto' }}>
            <StateContainer>
              <SpinnerRing />
              <StateTitle>Loading campaign…</StateTitle>
              <StateText>Fetching the details for your donation.</StateText>
            </StateContainer>
          </WizardCard>
        </PageInner>
      </PageShell>
    )
  }

  // ── Error ──
  if (campaignError || !campaign) {
    return (
      <PageShell>
        <BlobAmber /><BlobBlue />
        <PageInner style={{ alignItems: 'center', justifyContent: 'center' }}>
          <WizardCard style={{ maxWidth: 420, width: '90%', margin: '40px auto' }}>
            <StateContainer>
              <StateEmoji>😔</StateEmoji>
              <StateTitle>Campaign not found</StateTitle>
              <StateText>We couldn't find the campaign you're trying to donate to. It may have been removed or the link is incorrect.</StateText>
              <StateBtn onClick={() => router.push('/campaigns')}>Browse Campaigns</StateBtn>
            </StateContainer>
          </WizardCard>
        </PageInner>
      </PageShell>
    )
  }

  // ── No payment methods ──
  const paymentMethods = campaign?.payment_methods || []
  if (!paymentMethods.length) {
    return (
      <PageShell>
        <BlobAmber /><BlobBlue />
        <PageInner style={{ alignItems: 'center', justifyContent: 'center' }}>
          <WizardCard style={{ maxWidth: 420, width: '90%', margin: '40px auto' }}>
            <StateContainer>
              <StateEmoji>💳</StateEmoji>
              <StateTitle>No payment methods</StateTitle>
              <StateText>This campaign doesn't have payment methods set up yet. Try another campaign or contact the creator.</StateText>
              <StateBtn onClick={() => router.push(`/campaigns/${campaignId}`)}>Return to Campaign</StateBtn>
            </StateContainer>
          </WizardCard>
        </PageInner>
      </PageShell>
    )
  }

  // ── Self-donation guard ──
  const userIdStr = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
  if (userIdStr === campaign.creator_id) {
    return (
      <PageShell>
        <BlobAmber /><BlobBlue />
        <PageInner style={{ alignItems: 'center', justifyContent: 'center' }}>
          <WizardCard style={{ maxWidth: 420, width: '90%', margin: '40px auto' }}>
            <StateContainer>
              <StateEmoji>🚫</StateEmoji>
              <StateTitle>Can't donate to your own campaign</StateTitle>
              <StateText>You created this campaign. Support other creators instead — your community is waiting!</StateText>
              <StateBtn onClick={() => router.push('/campaigns')}>Browse Other Campaigns</StateBtn>
            </StateContainer>
          </WizardCard>
        </PageInner>
      </PageShell>
    )
  }

  // ── Main wizard ──
  return (
    <PageShell>
      <BlobAmber /><BlobBlue />
      <PageInner>

        {/* Sidebar — desktop only */}
        <CampaignSidebar>
          <SidebarCard>
            <SidebarLabel>You're supporting</SidebarLabel>
            <CampaignTitle>{campaign.title}</CampaignTitle>

            <CreatorRow>
              <CreatorAvatar>{creatorInitial}</CreatorAvatar>
              <CreatorName>by {campaign.creator_name || 'Creator'}</CreatorName>
            </CreatorRow>

            <SidebarDivider />

            <TrustItem>
              <span className="icon">🔒</span>
              Secure, direct payment
            </TrustItem>
            <TrustItem>
              <span className="icon">👁</span>
              Full fee transparency
            </TrustItem>
            <TrustItem>
              <span className="icon">💸</span>
              Funds go directly to creator
            </TrustItem>

            <SecureBadge>
              <span className="dot" />
              Verified Platform
            </SecureBadge>
          </SidebarCard>
        </CampaignSidebar>

        {/* Main wizard column */}
        <WizardColumn>
          {!showSuccess && (
            <WizardCard>
              <DonationWizardContent
                campaignId={campaignId}
                campaignTitle={campaign.title}
                creatorName={campaign.creator_name || 'Creator'}
                paymentMethods={paymentMethods}
                onDonationSuccess={handleDonationSuccess}
              />
            </WizardCard>
          )}
        </WizardColumn>
      </PageInner>

      {showSuccess && successData && (
        <DonationSuccessModal
          isOpen={showSuccess}
          transactionId={successData.transactionId}
          amount={successData.amount}
          campaignId={campaignId}
          campaignTitle={campaign.title}
          referralCode={successData.referralCode}
        />
      )}
    </PageShell>
  )
}