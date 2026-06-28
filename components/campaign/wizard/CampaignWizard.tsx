'use client'

import React, { useCallback, useMemo, useRef } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { useRouter } from 'next/navigation'
import { useWizardStore } from '@/store/wizardStore'
import { useCreateCampaign } from '@/api/hooks/useCampaigns'
import { toast } from 'react-toastify'
import { Step1TypeSelection } from './Step1TypeSelection'
import { Step1aTypeSelection } from './Step1aTypeSelection'
import { Step2BasicInfo } from './Step2BasicInfo'
import { Step3GoalsBudget } from './Step3GoalsBudget'
import { Step4Review, type Step4ReviewHandle } from './Step4Review'
import Step5PrayerConfiguration from './Step5PrayerConfiguration'
import { Step5BoostSelection } from './Step5BoostSelection'
import { Step6BoostPayment } from './Step6BoostPayment'
import { Step7ActivateCampaign } from './Step7ActivateCampaign'
import { WizardActions } from './WizardSteps'
import { ChevronLeft, FileText, Trash2, X } from 'lucide-react'

/* ─────────────────────────────────────────────
   Animations
───────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0);    }
`

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position:  600px 0; }
`

/* ─────────────────────────────────────────────
   Page shell — two-column on desktop, single on mobile
───────────────────────────────────────────── */
const Shell = styled.div`
  display: grid;
  grid-template-columns: 260px 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  max-width: 1100px;
  margin: 0 auto;
  gap: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto 1fr;
    max-width: 640px;
  }
`

/* ─────────────────────────────────────────────
   Top bar (full width) — breadcrumb + page title
───────────────────────────────────────────── */
const TopBar = styled.header`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 28px 0;
  box-sizing: border-box;

  @media (max-width: 900px) {
    padding: 16px 16px 0;
  }
`

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: #888882;
  padding: 0;
  transition: color 0.15s;

  &:hover { color: #0f0f0e; }

  svg { flex-shrink: 0; }
`

const TopSep = styled.span`
  color: #d4d4cf;
  font-size: 15px;
  line-height: 1;
`

const PageHeading = styled.h1`
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #0f0f0e;
  margin: 0;
  letter-spacing: -0.2px;
`

/* ─────────────────────────────────────────────
   Left sidebar — step rail
───────────────────────────────────────────── */
const Sidebar = styled.aside`
  grid-column: 1;
  grid-row: 2;
  padding: 28px 24px 28px 28px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: sticky;
  top: 0;
  align-self: start;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  box-sizing: border-box;

  /* Hide sidebar on mobile — show horizontal strip instead */
  @media (max-width: 900px) {
    display: none;
  }
`

const SideLabel = styled.p`
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.7px;
  text-transform: uppercase;
  color: #b0b0aa;
  margin: 0 0 12px 10px;
`

interface StepItemProps {
  state: 'done' | 'active' | 'upcoming'
}

const StepItem = styled.button<StepItemProps>`
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 12px;
  border: none;
  border-radius: 10px;
  cursor: default;
  text-align: left;
  background: ${({ state }) =>
    state === 'active' ? '#f0f0ec' : 'transparent'};
  transition: background 0.15s;
  width: 100%;
  box-sizing: border-box;
`

const StepDot = styled.span<StepItemProps>`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: -0.2px;
  transition: all 0.2s;

  ${({ state }) =>
    state === 'done' &&
    css`
      background: #0f0f0e;
      color: #fff;
    `}
  ${({ state }) =>
    state === 'active' &&
    css`
      background: #0f0f0e;
      color: #fff;
      box-shadow: 0 0 0 3px rgba(15, 15, 14, 0.12);
    `}
  ${({ state }) =>
    state === 'upcoming' &&
    css`
      background: #f0f0ec;
      color: #b0b0aa;
      border: 1.5px solid #e4e4df;
    `}
`

const StepText = styled.span<StepItemProps>`
  font-size: 13px;
  font-weight: ${({ state }) => (state === 'active' ? 600 : 500)};
  color: ${({ state }) =>
    state === 'done' ? '#6b6b66' :
    state === 'active' ? '#0f0f0e' :
    '#b0b0aa'};
  line-height: 1.3;
`

const StepConnector = styled.div`
  width: 1.5px;
  height: 12px;
  background: #e8e8e3;
  margin: 0 0 0 21px;
  flex-shrink: 0;
`

/* ─────────────────────────────────────────────
   Mobile step strip (visible only on mobile)
───────────────────────────────────────────── */
const MobileStrip = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 16px 16px 0;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
  }
`

interface MobileStepDotProps {
  state: 'done' | 'active' | 'upcoming'
}

const MobileStepDot = styled.div<MobileStepDotProps>`
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;

  ${({ state }) =>
    state === 'done' && css`background: #0f0f0e; color: #fff;`}
  ${({ state }) =>
    state === 'active' && css`
      background: #0f0f0e; color: #fff;
      box-shadow: 0 0 0 3px rgba(15,15,14,0.14);
    `}
  ${({ state }) =>
    state === 'upcoming' && css`
      background: #f0f0ec; color: #b0b0aa;
      border: 1.5px solid #e4e4df;
    `}
`

const MobileStepLine = styled.div<{ done: boolean }>`
  flex: 1;
  height: 1.5px;
  min-width: 16px;
  background: ${({ done }) => (done ? '#0f0f0e' : '#e4e4df')};
  transition: background 0.25s;
`

const MobileStepLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  color: #888882;
  margin: 8px 0 0 0;
  padding: 0 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (min-width: 901px) { display: none; }
`

/* ─────────────────────────────────────────────
   Main content area
───────────────────────────────────────────── */
const Main = styled.main`
  grid-column: 2;
  grid-row: 2;
  padding: 28px 28px 40px;
  box-sizing: border-box;
  min-width: 0;
  animation: ${fadeUp} 0.3s ease both;

  @media (max-width: 900px) {
    grid-column: 1;
    grid-row: 3;
    padding: 16px 16px 40px;
  }
`

/* Card wraps the step content */
const Card = styled.div`
  background: #fff;
  border: 1px solid #ebebе8;
  border-color: #ebebе8;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    border-radius: 14px;
    padding: 18px 16px;
  }
`

/* ─────────────────────────────────────────────
   Draft notification
───────────────────────────────────────────── */
const DraftBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #f0f6ff;
  border: 1px solid #c5dafc;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  box-sizing: border-box;
`

const DraftIcon = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #dbeafe;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
`

const DraftBody = styled.div`
  flex: 1;
  min-width: 0;
`

const DraftTitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 6px 0;
`

const DraftActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const DraftBtn = styled.button<{ variant?: 'ghost' }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;

  ${({ variant }) =>
    variant === 'ghost'
      ? css`
          background: transparent;
          color: #6b7280;
          border-color: #d1d5db;
          &:hover { background: #f9fafb; }
        `
      : css`
          background: #1e40af;
          color: #fff;
          &:hover { background: #1d4ed8; }
        `}
`

const DraftClose = styled.button`
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.15s;
  padding: 0;

  &:hover { background: #dbeafe; color: #1e40af; }
`

/* ─────────────────────────────────────────────
   Progress bar (thin accent line at top of card)
───────────────────────────────────────────── */
const ProgressWrap = styled.div`
  height: 3px;
  border-radius: 99px;
  background: #f0f0ec;
  margin-bottom: 24px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ pct: number }>`
  height: 100%;
  width: ${({ pct }) => pct}%;
  border-radius: 99px;
  background: #0f0f0e;
  transition: width 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
`

/* ─────────────────────────────────────────────
   Step label inside card
───────────────────────────────────────────── */
const CardStepLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #b0b0aa;
  margin: 0 0 6px 0;
`

const CardStepTitle = styled.h2`
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #0f0f0e;
  margin: 0 0 24px 0;
  letter-spacing: -0.4px;
  line-height: 1.25;

  @media (max-width: 480px) {
    font-size: 17px;
  }
`

/* ─────────────────────────────────────────────
   Step meta (labels + titles)
───────────────────────────────────────────── */
const STEP_LABELS = [
  'Category',
  'Campaign Type',
  'Basic Information',
  'Goals & Budget',
  'Prayer Support',
  'Review',
  'Boost Campaign',
  'Payment',
  'Activate',
]

const STEP_TITLES: Record<number, string> = {
  1: 'Choose a category',
  2: 'What type of campaign?',
  3: 'Tell your story',
  4: 'Set your goals',
  5: 'Prayer support',
  6: 'Review your campaign',
  7: 'Boost your campaign',
  8: 'Payment & confirmation',
  9: 'You\'re almost live!',
}

/* ─────────────────────────────────────────────
   Wizard component
───────────────────────────────────────────── */
interface CampaignWizardProps {
  draftExists?: boolean
}

export const CampaignWizard: React.FC<CampaignWizardProps> = ({ draftExists = false }) => {
  const router = useRouter()
  const {
    currentStep,
    formData,
    errors,
    isSubmitting,
    draftSaved,
    setCurrentStep,
    updateFormData,
    setImage,
    setFundraisingData,
    setSharingData,
    setPrayerConfig,
    setBoostData,
    setErrors,
    setIsSubmitting,
    saveDraft,
    loadDraft,
    clearDraft,
    resetWizard,
    getDraftExists,
  } = useWizardStore()

  const step4ReviewRef = useRef<Step4ReviewHandle>(null)
  const createCampaignMutation = useCreateCampaign()
  const [termsAccepted, setTermsAccepted] = React.useState(false)
  const [campaignCreated, setCampaignCreated] = React.useState<any>(null)
  const [draftDismissed, setDraftDismissed] = React.useState(false)

  const isPaidBoost = formData.boostData.selectedTier && formData.boostData.selectedTier !== 'free'
  const isActivationStep = (currentStep === 8 && !isPaidBoost) || currentStep === 9

  /* Jump back to the top of the page whenever the step changes — otherwise the
     long form leaves the viewport scrolled down, so Next/Back appears to scroll
     the user further down instead of to the new step's heading. */
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentStep])

  /* Total visible steps (excl. activation) */
  const totalSteps = isPaidBoost ? 8 : 7

  /* Progress percentage */
  const progressPct = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100)

  const handleActivationCompleted = useCallback(() => {
    clearDraft()
    resetWizard()
  }, [clearDraft, resetWizard])

  /* ── Validation ── */
  const validateStep = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.category) newErrors.category = 'Please select a category'
    } else if (currentStep === 2) {
      if (!formData.campaignType) newErrors.campaignType = 'Please select a campaign type'
    } else if (currentStep === 3) {
      if (!formData.title.trim() || formData.title.length < 5)
        newErrors.title = 'Title must be at least 5 characters'
      if (!formData.description.trim() || formData.description.length < 20)
        newErrors.description = 'Description must be at least 20 characters'
    } else if (currentStep === 4) {
      if (formData.campaignType === 'fundraising') {
        const fd = formData.fundraisingData
        if (!fd.goalAmount || fd.goalAmount < 1) newErrors.goalAmount = 'Goal amount must be at least $1'
        if (!fd.duration || fd.duration < 7 || fd.duration > 90)
          newErrors.duration = 'Duration must be between 7 and 90 days'
        if (!fd.paymentMethods || fd.paymentMethods.length === 0)
          newErrors.paymentMethods = 'Add at least one payment method'
      } else if (formData.campaignType === 'sharing') {
        const sd = formData.sharingData
        if (!sd.meterType) newErrors.meterType = 'Select a sharing meter type'
        if (!sd.budget || sd.budget < 10) newErrors.budget = 'Budget must be at least $10'
        if (!sd.rewardPerShare || sd.rewardPerShare < 0.1)
          newErrors.rewardPerShare = 'Reward per share must be at least $0.10'
        if (!sd.platforms || sd.platforms.length === 0)
          newErrors.platforms = 'Select at least one platform'
        // Phase A (trust-based): creator must accept paying sharers directly
        // before Share-to-Earn activates.
        if (!sd.payoutConsent)
          newErrors.payoutConsent = 'You must agree to pay sharers directly to enable Share-to-Earn'
        // SU-1: a fundraising goal is optional, but if set it must clear the $5
        // floor (matches backend SF-3) so the donor sees the error before submit.
        if (sd.fundraisingGoal && sd.fundraisingGoal > 0 && sd.fundraisingGoal < 5)
          newErrors.fundraisingGoal = 'Fundraising goal must be at least $5.00 (or leave blank for virality-only)'
        // If donations are enabled (a fundraising goal is set), real payment
        // methods are required so donors can actually pay.
        if (sd.fundraisingGoal && sd.fundraisingGoal >= 5 && (!sd.paymentMethods || sd.paymentMethods.length === 0))
          newErrors.paymentMethods = 'Add at least one payment method so donors can support your goal'
      }
    } else if (currentStep === 6) {
      const isDetailsView = step4ReviewRef.current?.view === 'details'
      if (isDetailsView && !termsAccepted) {
        newErrors.terms = 'You must accept the terms and conditions'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [currentStep, formData, termsAccepted, setErrors])

  /* ── Submit ── */
  const handleSubmit = useCallback(async () => {
    if (!validateStep()) return
    setIsSubmitting(true)
    try {
      const campaignData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        campaignType: formData.campaignType,
      }
      if (formData.campaignType === 'fundraising') {
        campaignData.fundraisingData = formData.fundraisingData
      } else {
        campaignData.sharingData = formData.sharingData
      }
      if (formData.prayerConfig.enabled) {
        campaignData.prayerConfig = formData.prayerConfig
      }
      const result = await createCampaignMutation.mutateAsync({
        data: campaignData,
        imageFile: formData.image || undefined,
      })
      setCampaignCreated(result)
      setCurrentStep(8)
      setIsSubmitting(false)
    } catch (error: any) {
      console.error('Campaign creation failed:', error)
      toast.error(error.response?.data?.message || 'Failed to create campaign')
      setIsSubmitting(false)
    }
  }, [validateStep, formData, createCampaignMutation, setIsSubmitting, setCurrentStep])

  /* ── Navigation ── */
  const handleNext = useCallback(() => {
    if (!validateStep()) return

    if (currentStep === 6) {
      if (step4ReviewRef.current?.handleNextAction?.()) {
        saveDraft()
        setCurrentStep(currentStep + 1)
      }
      return
    }
    if (currentStep === 7) {
      handleSubmit()
    } else {
      const maxSteps = isPaidBoost ? 8 : 7
      if (currentStep < maxSteps) {
        saveDraft()
        setCurrentStep(currentStep + 1)
      }
    }
  }, [currentStep, validateStep, saveDraft, setCurrentStep, isPaidBoost, handleSubmit])

  const handleBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }, [currentStep, setCurrentStep])

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      const newErrors = { ...errors }
      delete newErrors[field]
      if (field === 'sharingData') {
        delete newErrors.meterType
        delete newErrors.budget
        delete newErrors.rewardPerShare
        delete newErrors.payoutConsent
        delete newErrors.platforms
        delete newErrors.fundraisingGoal
        delete newErrors.paymentMethods
        setErrors(newErrors)
        setSharingData({ ...formData.sharingData, ...value })
      } else if (field === 'fundraisingData') {
        delete newErrors.goalAmount
        delete newErrors.duration
        delete newErrors.paymentMethods
        setErrors(newErrors)
        setFundraisingData({ ...formData.fundraisingData, ...value })
      } else {
        setErrors(newErrors)
        updateFormData({ [field]: value })
      }
    },
    [errors, setErrors, updateFormData, setFundraisingData, setSharingData, formData]
  )

  const handleLoadDraft = useCallback(() => {
    if (loadDraft()) toast.info('Draft loaded successfully')
  }, [loadDraft])

  const handleDiscardDraft = useCallback(() => {
    if (confirm('Are you sure you want to discard your draft?')) {
      clearDraft()
      resetWizard()
      toast.info('Draft discarded')
    }
  }, [clearDraft, resetWizard])

  const handleBoostPaymentSuccess = useCallback(() => {
    setCurrentStep(9)
    setIsSubmitting(false)
  }, [setCurrentStep, setIsSubmitting])

  const handleBoostSkip = useCallback(() => {
    setBoostData({ selectedTier: null, skipBoost: true })
    setCurrentStep(currentStep + 1)
  }, [setBoostData, setCurrentStep, currentStep])

  /* ── Sidebar step state helper ── */
  const getStepState = (step: number): 'done' | 'active' | 'upcoming' => {
    if (step < currentStep) return 'done'
    if (step === currentStep) return 'active'
    return 'upcoming'
  }

  /* ── Visible sidebar steps (hide payment/activate) ── */
  const sidebarSteps = STEP_LABELS.slice(0, 7) // steps 1–7 visible

  const showDraftBanner =
    draftExists && getDraftExists() && currentStep === 1 && !draftDismissed

  return (
    <Shell>
      {/* ── Top bar ── */}
      <TopBar>
        <BackBtn onClick={() => router.back()}>
          <ChevronLeft size={15} />
          Dashboard
        </BackBtn>
        <TopSep>/</TopSep>
        <PageHeading>Create Campaign</PageHeading>
      </TopBar>

      {/* ── Sidebar (desktop only) ── */}
      <Sidebar>
        <SideLabel>Steps</SideLabel>
        {sidebarSteps.map((label, idx) => {
          const step = idx + 1
          const state = getStepState(step)
          return (
            <React.Fragment key={step}>
              {idx > 0 && <StepConnector />}
              <StepItem state={state}>
                <StepDot state={state}>
                  {state === 'done' ? '✓' : step}
                </StepDot>
                <StepText state={state}>{label}</StepText>
              </StepItem>
            </React.Fragment>
          )
        })}
      </Sidebar>

      {/* ── Mobile step strip ── */}
      <MobileStrip>
        {sidebarSteps.map((_, idx) => {
          const step = idx + 1
          const state = getStepState(step)
          return (
            <React.Fragment key={step}>
              {idx > 0 && <MobileStepLine done={step <= currentStep} />}
              <MobileStepDot state={state}>
                {state === 'done' ? '✓' : step}
              </MobileStepDot>
            </React.Fragment>
          )
        })}
      </MobileStrip>
      {!isActivationStep && (
        <MobileStepLabel>
          Step {currentStep} of {totalSteps} — {STEP_LABELS[currentStep - 1]}
        </MobileStepLabel>
      )}

      {/* ── Main content ── */}
      <Main>
        {/* Draft banner */}
        {showDraftBanner && (
          <DraftBanner>
            <DraftIcon>
              <FileText size={16} />
            </DraftIcon>
            <DraftBody>
              <DraftTitle>You have a saved draft</DraftTitle>
              <DraftActions>
                <DraftBtn onClick={handleLoadDraft}>Load Draft</DraftBtn>
                <DraftBtn variant="ghost" onClick={handleDiscardDraft}>
                  <Trash2 size={12} />
                  Discard
                </DraftBtn>
              </DraftActions>
            </DraftBody>
            <DraftClose onClick={() => setDraftDismissed(true)}>
              <X size={14} />
            </DraftClose>
          </DraftBanner>
        )}

        <Card>
          {/* Progress bar + step label (inside card, hidden on activation) */}
          {!isActivationStep && (
            <>
              <ProgressWrap>
                <ProgressFill pct={progressPct} />
              </ProgressWrap>
              <CardStepLabel>
                Step {currentStep} of {totalSteps}
              </CardStepLabel>
              <CardStepTitle>{STEP_TITLES[currentStep]}</CardStepTitle>
            </>
          )}

          {/* ── Step content ── */}
          {currentStep === 1 && (
            <Step1TypeSelection
              selectedCategory={formData.category}
              onCategorySelect={(categoryId) => handleInputChange('category', categoryId)}
              onCategoryClear={() => handleInputChange('category', '')}
            />
          )}

          {currentStep === 2 && (
            <Step1aTypeSelection
              selectedType={formData.campaignType}
              onTypeSelect={(type) => handleInputChange('campaignType', type)}
            />
          )}

          {currentStep === 3 && (
            <Step2BasicInfo
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
              onImageSelect={setImage}
            />
          )}

          {currentStep === 4 && formData.campaignType && (
            <Step3GoalsBudget
              campaignType={formData.campaignType}
              formData={formData}
              errors={errors}
              onChange={handleInputChange}
            />
          )}

          {currentStep === 5 && (
            <Step5PrayerConfiguration
              currentData={formData.prayerConfig}
              onNext={(config) => {
                setPrayerConfig(config)
                saveDraft()
                setCurrentStep(6)
              }}
              onBack={handleBack}
              isLoading={isSubmitting}
            />
          )}

          {currentStep === 6 && (
            <Step4Review
              ref={step4ReviewRef}
              formData={formData}
              campaignType={formData.campaignType!}
              termsAccepted={termsAccepted}
              onTermsChange={setTermsAccepted}
            />
          )}

          {currentStep === 7 && (
            <Step5BoostSelection
              selectedTier={formData.boostData.selectedTier}
              onTierSelect={(tier) => setBoostData({ selectedTier: tier as any })}
              onSkip={handleBoostSkip}
            />
          )}

          {currentStep === 8 && campaignCreated && (
            isPaidBoost ? (
              <Step6BoostPayment
                campaignId={campaignCreated.id}
                campaignTitle={campaignCreated.title}
                boostTier={formData.boostData.selectedTier || 'free'}
                onSuccess={handleBoostPaymentSuccess}
                onCancel={() => {
                  clearDraft()
                  resetWizard()
                  router.push(`/campaigns/${campaignCreated.id}`)
                }}
                isProcessing={isSubmitting}
              />
            ) : (
              <Step7ActivateCampaign
                campaignId={campaignCreated.id}
                campaignTitle={campaignCreated.title || formData.title}
                campaignType={campaignCreated.campaign_type || formData.campaignType || 'fundraising'}
                onCompleted={handleActivationCompleted}
              />
            )
          )}

          {currentStep === 9 && campaignCreated && (
            <Step7ActivateCampaign
              campaignId={campaignCreated.id}
              campaignTitle={campaignCreated.title || formData.title}
              campaignType={campaignCreated.campaign_type || formData.campaignType || 'fundraising'}
              onCompleted={handleActivationCompleted}
            />
          )}

          {/* ── Actions ── */}
          {!isActivationStep && currentStep !== 5 && (
            <WizardActions
              currentStep={currentStep}
              totalSteps={isPaidBoost ? 8 : 7}
              onBack={handleBack}
              onNext={handleNext}
              onSubmit={currentStep === 8 ? handleBoostPaymentSuccess : handleNext}
              isLoading={isSubmitting || createCampaignMutation.isPending}
              canProceed={true}
            />
          )}
        </Card>
      </Main>
    </Shell>
  )
}