'use client'

import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import styled, { keyframes, css } from 'styled-components'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
}

interface WizardActionsProps {
  currentStep: number
  totalSteps: number
  canGoBack?: boolean
  canContinue?: boolean
  onBack?: () => void
  onNext?: () => void
  onPublish?: () => void
  isSubmitting?: boolean
  publishLabel?: string
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const checkPop = keyframes`
  0%   { transform: scale(0.7) rotate(-10deg); opacity: 0; }
  60%  { transform: scale(1.15) rotate(3deg); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`

const dotPulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(245,158,11,0); }
`

const connectorFill = keyframes`
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
`

// ─── Step Indicator ───────────────────────────────────────────────────────────

const StepContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 28px;

  @media (max-width: 640px) {
    margin-bottom: 24px;
  }
`

const StepItem = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; /* allow flex children to shrink */
`

// State: 'done' | 'active' | 'idle'
const StepDot = styled.div<{ $state: 'done' | 'active' | 'idle' }>`
  position: relative;
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Nunito', sans-serif;
  font-size: 13px;
  font-weight: 800;
  transition: all 0.3s cubic-bezier(0.2, 0.9, 0.2, 1);
  flex-shrink: 0;

  ${({ $state }) => $state === 'done' && css`
    background: linear-gradient(135deg, #22C55E, #16A34A);
    color: white;
    box-shadow: 0 3px 10px rgba(34,197,94,0.35);

    svg {
      width: 16px; height: 16px;
      animation: ${checkPop} 0.3s cubic-bezier(0.2, 0.9, 0.2, 1) forwards;
    }
  `}

  ${({ $state }) => $state === 'active' && css`
    background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
    color: white;
    box-shadow: 0 3px 14px rgba(245,158,11,0.38);
    animation: ${dotPulse} 2s ease-in-out infinite;
  `}

  ${({ $state }) => $state === 'idle' && css`
    background: #F8FAFC;
    color: #94A3B8;
    border: 2px solid #E2E8F0;
    box-shadow: none;
  `}

  @media (max-width: 640px) {
    width: 30px;
    height: 30px;
    min-width: 30px;
    font-size: 12px;

    svg { width: 13px; height: 13px; }
  }
`

const StepLabelWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  min-width: 0;
  flex-shrink: 1;

  /* Hide label text on very small screens — dot + connector is enough */
  @media (max-width: 380px) {
    display: none;
  }
`

const StepLabel = styled.span<{ $active: boolean; $done: boolean }>`
  font-size: 11.5px;
  font-weight: ${({ $active, $done }) => ($active || $done) ? 700 : 500};
  color: ${({ $active, $done }) =>
    $active ? '#0F172A' :
    $done   ? '#16A34A' :
              '#94A3B8'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.01em;
  line-height: 1.2;

  @media (max-width: 640px) {
    font-size: 10.5px;
  }
`

const StepSubLabel = styled.span<{ $active: boolean }>`
  font-size: 10px;
  font-weight: 500;
  color: ${({ $active }) => $active ? '#F59E0B' : '#CBD5E1'};
  letter-spacing: 0.02em;
  margin-top: 1px;
`

const Connector = styled.div<{ $done: boolean }>`
  flex: 1;
  height: 2px;
  margin: 0 8px;
  border-radius: 999px;
  background: #EEF2F7;
  position: relative;
  overflow: hidden;
  flex-shrink: 1;
  min-width: 12px;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: linear-gradient(90deg, #22C55E, #16A34A);
    transform: scaleX(${({ $done }) => $done ? 1 : 0});
    transform-origin: left;
    transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.2, 1);
  }
`

// ─── StepIndicator Component ──────────────────────────────────────────────────

const STEP_LABELS = ['Amount', 'Payment', 'Confirm']
const STEP_SUB    = ['Set amount', 'Choose method', 'Send & confirm']

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1)

  const getState = (step: number): 'done' | 'active' | 'idle' =>
    step < currentStep ? 'done' : step === currentStep ? 'active' : 'idle'

  return (
    <StepContainer
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      {steps.map((step, index) => {
        const state = getState(step)
        return (
          <StepItem key={step}>
            <StepDot $state={state} aria-hidden="true">
              {state === 'done' ? <CheckCircle /> : step}
            </StepDot>

            <StepLabelWrap>
              <StepLabel $active={state === 'active'} $done={state === 'done'}>
                {STEP_LABELS[index] ?? `Step ${step}`}
              </StepLabel>
              <StepSubLabel $active={state === 'active'}>
                {STEP_SUB[index]}
              </StepSubLabel>
            </StepLabelWrap>

            {index < steps.length - 1 && (
              <Connector $done={step < currentStep} aria-hidden="true" />
            )}
          </StepItem>
        )
      })}
    </StepContainer>
  )
}

// ─── Wizard Actions ───────────────────────────────────────────────────────────

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;

  /* Mobile: Next is full-width on top; Back is a compact ghost below */
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
    margin-top: 24px;
  }
`

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  background: transparent;
  border: 1.5px solid #CBD5E1;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;
  letter-spacing: 0.01em;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: #94A3B8;
    color: #334155;
    background: rgba(15,23,42,0.03);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid #F59E0B;
    outline-offset: 2px;
  }

  svg { width: 15px; height: 15px; flex-shrink: 0; }

  /* On mobile — full width, sits below the primary */
  @media (max-width: 640px) {
    width: 100%;
    justify-content: center;
    order: 2; /* visually below Next */
    padding: 11px 16px;
  }
`

const NextBtn = styled.button<{ $isSubmitting?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 28px;
  font-family: 'Nunito', sans-serif;
  font-size: 15px;
  font-weight: 800;
  color: white;
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: box-shadow 0.2s ease, transform 0.15s ease;
  letter-spacing: 0.01em;
  white-space: nowrap;
  box-shadow: 0 4px 18px rgba(239,68,68,0.28);

  &:hover:not(:disabled) {
    box-shadow: 0 6px 24px rgba(239,68,68,0.38);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 3px 12px rgba(239,68,68,0.22);
  }

  &:disabled {
    background: #F1F5F9;
    color: #94A3B8;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }

  &:focus-visible {
    outline: 2px solid #F59E0B;
    outline-offset: 2px;
  }

  /* Loading spinner */
  .spinner {
    width: 15px;
    height: 15px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite;
    flex-shrink: 0;
  }

  svg { width: 15px; height: 15px; flex-shrink: 0; }

  /* Mobile — full width, primary action on top */
  @media (max-width: 640px) {
    width: 100%;
    order: 1;
    padding: 15px 20px;
    font-size: 16px;
  }
`

// ─── WizardActions Component ──────────────────────────────────────────────────

export function WizardActions({
  currentStep,
  totalSteps,
  canGoBack = true,
  canContinue = true,
  onBack,
  onNext,
  onPublish,
  isSubmitting = false,
  publishLabel = 'Confirm Donation',
}: WizardActionsProps) {
  const isLastStep  = currentStep === totalSteps
  const isFirstStep = currentStep === 1

  const nextDisabled = !canContinue || isSubmitting
  const backDisabled = isFirstStep || !canGoBack || isSubmitting

  return (
    <ActionsContainer>
      <BackBtn
        type="button"
        onClick={onBack}
        disabled={backDisabled}
        aria-label="Go to previous step"
      >
        <ArrowLeft />
        Back
      </BackBtn>

      {!isLastStep ? (
        <NextBtn
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          $isSubmitting={isSubmitting}
          aria-label={`Go to step ${currentStep + 1}`}
        >
          {isSubmitting
            ? <><div className="spinner" />Loading…</>
            : <>Continue <ArrowRight /></>
          }
        </NextBtn>
      ) : (
        <NextBtn
          type="button"
          onClick={onPublish}
          disabled={nextDisabled}
          $isSubmitting={isSubmitting}
          aria-label="Confirm and submit donation"
        >
          {isSubmitting
            ? <><div className="spinner" />Processing…</>
            : <>🎉 {publishLabel}</>
          }
        </NextBtn>
      )}
    </ActionsContainer>
  )
}