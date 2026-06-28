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
import { donationService } from '@/api/services/donationService'
import { useCampaign } from '@/api/hooks/useCampaigns'
import type { DonationPaymentMethod, DonationConfirmationFormData } from '@/utils/validationSchemas'
import { tk, DashboardGlobalStyle } from '@/styles/dashboardTokens'

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
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  position: relative;
`

// Decorative blobs are retained as no-op spacers so the existing call sites keep
// working, but render nothing — the dashboard look is flat canvas, no glass.
const Blob = styled.div`
  display: none;
`

const BlobAmber = styled(Blob)``

const BlobBlue = styled(Blob)``

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
  border-radius: 14px;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 20px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 3px;
    background: ${tk.amber};
  }
`

const SidebarLabel = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  font-weight: 500;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 4px 0 10px;
`

const CampaignTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1.3;
  margin: 0 0 6px;
  letter-spacing: -0.3px;
`

const CreatorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`

const CreatorAvatar = styled.div`
  width: 28px; height: 28px;
  border-radius: 8px;
  background: ${tk.amberMid};
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif;
  font-size: 12px; font-weight: 700; color: ${tk.ink}; flex-shrink: 0;
`

const CreatorName = styled.span`
  font-size: 13px; font-weight: 500; color: ${tk.body};
`

const SidebarDivider = styled.div`
  height: 1px; background: ${tk.canvasDeep}; margin: 14px 0;
`

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 500;
  color: ${tk.body};
  margin-bottom: 10px;

  .icon { font-size: 15px; flex-shrink: 0; }
`

const SecureBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  background: ${tk.greenLight};
  border: 1px solid rgba(26,122,74,0.2);
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  color: ${tk.green};
  margin-top: 14px;

  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: ${tk.green}; flex-shrink: 0;
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
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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

  font-family: 'Syne', sans-serif;
  ${({ $state }) => $state === 'done' && css`
    background: ${tk.green};
    color: ${tk.white};
  `}
  ${({ $state }) => $state === 'active' && css`
    background: ${tk.amber};
    color: ${tk.white};
  `}
  ${({ $state }) => $state === 'idle' && css`
    background: ${tk.canvasDeep};
    color: ${tk.muted};
    border: 2px solid ${tk.border};
  `}
`

const StepConnector = styled.div<{ $done: boolean }>`
  flex: 1;
  height: 2px;
  margin: 0 6px;
  border-radius: 999px;
  background: ${({ $done }) => $done ? tk.green : tk.border};
  transition: background 0.4s ease;
`

const StepMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`

const StepLabel = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: ${tk.muted};
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0;
`

const StepCount = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 400;
  color: ${tk.muted};
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
  border: 3px solid ${tk.canvasDeep};
  border-top-color: ${tk.amber};
  animation: ${spin} 0.8s linear infinite;
  margin-bottom: 16px;
`

const StateEmoji = styled.div`
  font-size: 40px;
  margin-bottom: 14px;
  line-height: 1;
`

const StateTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0 0 8px;
  letter-spacing: -0.3px;
`

const StateText = styled.p`
  font-size: 14px;
  color: ${tk.muted};
  line-height: 1.6;
  margin: 0 0 20px;
  max-width: 320px;
`

const StateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 14px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;

  &:hover {
    background: ${tk.inkLight};
    transform: translateY(-1px);
  }
`

// ─── Mobile Campaign Banner (shows above card on mobile) ─────────────────────

const MobileCampaignBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
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
  background: ${tk.amber};
  flex-shrink: 0;
`

const BannerText = styled.div`
  .label { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; color: ${tk.muted}; text-transform: uppercase; letter-spacing: 1px; }
  .title { font-family: 'Syne', sans-serif; font-size: 13.5px; font-weight: 800; color: ${tk.heading}; line-height: 1.2; }
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

      const result: any = await createDonation(payload)

      // The backend returns { success, data: { transaction_id, _id, ... }, message }.
      // Support both that shape and any flattened legacy shape.
      const txDbId: string | undefined = result?.data?._id || result?.id
      const txPublicId: string | undefined = result?.data?.transaction_id || result?.transactionId
      const txRef = txDbId || txPublicId

      // CF-2: best-effort proof-of-payment. The donation is already recorded as
      // pending — attaching proof (or just marking sent) must never block or
      // fail the flow; the creator can still confirm without it.
      if (txRef) {
        try {
          if (data.screenshotProof instanceof File) {
            await donationService.uploadDonationProof(campaignId, txRef, data.screenshotProof)
          } else {
            await donationService.markDonationSent(campaignId, txRef)
          }
        } catch (proofError) {
          console.warn('Proof upload / mark-sent failed (non-fatal):', proofError)
        }
      }

      onDonationSuccess(txPublicId || txRef || '', formData.amount || 0)
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
        <DashboardGlobalStyle />
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
        <DashboardGlobalStyle />
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
        <DashboardGlobalStyle />
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
        <DashboardGlobalStyle />
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
      <DashboardGlobalStyle />
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