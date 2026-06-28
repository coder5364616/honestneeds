'use client'

import { useMemo, useRef, useImperativeHandle, forwardRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styled, { keyframes } from 'styled-components'
import { donationAmountSchema, type DonationAmountFormData, DONATION_FEE_PERCENT } from '@/utils/validationSchemas'
import { FeeBreakdown } from './FeeBreakdown'
import { tk } from '@/styles/dashboardTokens'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step1AmountProps {
  initialAmount?: number
  onNext: (amount: number) => void
  isLoading?: boolean
}

export interface Step1AmountRef {
  submitForm: () => void
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Layout ───────────────────────────────────────────────────────────────────

const Container = styled.div`
  width: 100%;
  animation: ${fadeUp} 0.4s ease forwards;
`

// ─── Header ───────────────────────────────────────────────────────────────────

const StepEyebrow = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${tk.amberDark};
  letter-spacing: 1px;
  text-transform: uppercase;
  margin: 0 0 10px;
`

const Title = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 800;
  color: ${tk.heading};
  margin: 0 0 8px;
  letter-spacing: -0.5px;
  line-height: 1.2;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: ${tk.muted};
  margin: 0 0 28px;
  line-height: 1.6;
  font-weight: 400;
`

// ─── Form ─────────────────────────────────────────────────────────────────────

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: ${tk.body};
  margin-bottom: 8px;
  letter-spacing: 0.01em;

  .req { color: ${tk.red}; margin-left: 3px; }
`

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const CurrencySymbol = styled.span`
  position: absolute;
  left: 16px;
  font-size: 20px;
  font-weight: 800;
  font-family: 'Syne', sans-serif;
  color: ${tk.heading};
  pointer-events: none;
  line-height: 1;
`

const AmountInput = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 16px 16px 16px 40px;
  font-size: 24px;
  font-weight: 800;
  font-family: 'Syne', sans-serif;
  color: ${tk.heading};
  border: 2px solid ${({ $error }) => $error ? tk.red : tk.border};
  border-radius: 14px;
  background: ${({ $error }) => $error ? tk.redLight : tk.canvas};
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  -moz-appearance: textfield;

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

  &:focus {
    outline: none;
    border-color: ${tk.amber};
    background: ${tk.white};
    box-shadow: 0 0 0 4px rgba(212,135,10,0.12);
  }

  &:disabled {
    background: ${tk.canvasDeep};
    color: ${tk.muted};
    cursor: not-allowed;
  }

  &::placeholder { color: ${tk.muted}; font-weight: 600; font-size: 20px; }
`

const ErrorMsg = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${tk.red};
  font-size: 12.5px;
  font-weight: 600;
  margin-top: 6px;

  &::before { content: '⚠'; font-size: 11px; }
`

// ─── Preset Grid ──────────────────────────────────────────────────────────────

const PresetLabel = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 16px 0 10px;
`

const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (min-width: 400px) {
    grid-template-columns: repeat(6, 1fr);
  }
`

const PresetBtn = styled.button<{ $selected?: boolean }>`
  position: relative;
  padding: 10px 6px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Syne', sans-serif;
  cursor: pointer;
  transition: all 0.18s cubic-bezier(0.2, 0.9, 0.2, 1);
  border: 2px solid ${({ $selected }) => $selected ? tk.amber : tk.border};
  background: ${({ $selected }) => $selected ? tk.amber : tk.white};
  color: ${({ $selected }) => $selected ? tk.white : tk.body};
  box-shadow: ${({ $selected }) => $selected
    ? '0 4px 14px rgba(212,135,10,0.25)'
    : '0 1px 3px rgba(0,0,0,0.05)'};

  &:hover:not(:disabled) {
    border-color: ${tk.amber};
    color: ${({ $selected }) => $selected ? tk.white : tk.amberDark};
    transform: translateY(-2px);
  }

  &:active:not(:disabled) { transform: translateY(0); }

  &:focus-visible {
    outline: 2px solid ${tk.amber};
    outline-offset: 2px;
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

// ─── Fee Card ─────────────────────────────────────────────────────────────────

const FeeCard = styled.div`
  margin-top: 20px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${tk.border};
  background: ${tk.white};
`

// ─── Info Box ─────────────────────────────────────────────────────────────────

const InfoBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: ${tk.amberLight};
  border: 1px solid rgba(212,135,10,0.2);
  border-radius: 14px;
  margin-top: 16px;
  font-size: 13px;
  color: ${tk.amberDark};
  line-height: 1.55;
  font-weight: 500;
`

const InfoDot = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  min-width: 22px;
  background: ${tk.amber};
  color: ${tk.white};
  border-radius: 50%;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
`

// ─── Component ────────────────────────────────────────────────────────────────

export const DonationStep1Amount = forwardRef<Step1AmountRef, Step1AmountProps>(
  function DonationStep1AmountComponent({ initialAmount = 25, onNext, isLoading = false }, ref) {
    const formRef = useRef<HTMLFormElement>(null)

    const { register, formState: { errors }, watch, setValue, handleSubmit } =
      useForm<DonationAmountFormData>({
        resolver: zodResolver(donationAmountSchema),
        defaultValues: { amount: initialAmount },
        mode: 'onChange',
      })

    useImperativeHandle(ref, () => ({
      submitForm: () => { formRef.current?.requestSubmit() },
    }), [])

    const amount = watch('amount')
    const presetAmounts = [10, 25, 50, 100, 250, 500]

    const onSubmit = (data: DonationAmountFormData) => onNext(data.amount)

    return (
      <Container as="form" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <StepEyebrow>Step 1 of 3 · Amount</StepEyebrow>
        <Title>How much would you like to give?</Title>
        <Subtitle>
          Pick an amount below or type your own. We show the exact fee before you continue — no surprises.
        </Subtitle>

        <FormGroup>
          <Label htmlFor="donation-amount">
            Donation Amount
            <span className="req" aria-label="required">*</span>
          </Label>

          <InputWrapper>
            <CurrencySymbol>$</CurrencySymbol>
            <AmountInput
              id="donation-amount"
              type="number"
              step="0.01"
              min="1"
              max="10000"
              placeholder="0.00"
              $error={!!errors.amount}
              disabled={isLoading}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
              {...register('amount', { valueAsNumber: true })}
            />
          </InputWrapper>

          {errors.amount && (
            <ErrorMsg id="amount-error" role="alert">{errors.amount.message}</ErrorMsg>
          )}

          <PresetLabel>Quick select</PresetLabel>
          <PresetGrid>
            {presetAmounts.map((preset) => (
              <PresetBtn
                key={preset}
                type="button"
                $selected={amount === preset}
                onClick={() => setValue('amount', preset, { shouldValidate: true })}
                disabled={isLoading}
                aria-pressed={amount === preset}
              >
                ${preset}
              </PresetBtn>
            ))}
          </PresetGrid>
        </FormGroup>

        {amount > 0 && (
          <FeeCard>
            <FeeBreakdown grossAmount={amount} />
          </FeeCard>
        )}

        <InfoBox>
          <InfoDot>i</InfoDot>
          <div>
            <strong>{DONATION_FEE_PERCENT}% platform fee</strong> — covers secure payments, fraud prevention, and platform operations.
            The remaining amount goes directly to the creator.
          </div>
        </InfoBox>

        <input type="submit" hidden aria-hidden="true" />
      </Container>
    )
  }
)