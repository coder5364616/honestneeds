'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styled, { keyframes, css } from 'styled-components'
import { Upload, X, FileText, CheckCircle } from 'lucide-react'
import {
  donationConfirmationSchema,
  type DonationConfirmationFormData,
  currencyUtils,
  type DonationPaymentMethod,
} from '@/utils/validationSchemas'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step3ConfirmationProps {
  amount: number
  paymentMethod: DonationPaymentMethod
  campaignTitle: string
  onSubmit: (data: DonationConfirmationFormData) => void
  isLoading?: boolean
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const checkPop = keyframes`
  0%   { transform: scale(0.8); opacity: 0; }
  60%  { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
`

// ─── Layout ───────────────────────────────────────────────────────────────────

const Container = styled.div`
  width: 100%;
  animation: ${fadeUp} 0.4s ease forwards;
`

// ─── Header ───────────────────────────────────────────────────────────────────

const StepEyebrow = styled.p`
  font-size: 11.5px;
  font-weight: 800;
  color: #F59E0B;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 0 0 10px;
`

const Title = styled.h2`
  font-family: 'Nunito', 'Poppins', sans-serif;
  font-size: clamp(20px, 4vw, 26px);
  font-weight: 800;
  color: #0F172A;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
  line-height: 1.2;
`

const Subtitle = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0 0 24px;
  line-height: 1.65;
  font-weight: 500;
`

// ─── Summary Card ─────────────────────────────────────────────────────────────

const SummaryCard = styled.div`
  border-radius: 18px;
  overflow: hidden;
  border: 1.5px solid #E2E8F0;
  background: #FFFFFF;
  box-shadow: 0 2px 12px rgba(15,23,42,0.06);
  margin-bottom: 20px;
`

const SummaryHeader = styled.div`
  padding: 12px 18px;
  background: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);
  display: flex;
  align-items: center;
  gap: 8px;
`

const SummaryHeaderText = styled.p`
  font-size: 12px;
  font-weight: 800;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0;
`

const SummaryBody = styled.div`
  padding: 4px 0;
`

const SummaryRow = styled.div<{ $highlight?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  border-bottom: 1px solid #F8FAFC;

  &:last-child { border-bottom: none; }

  ${({ $highlight }) => $highlight && css`
    background: rgba(245,158,11,0.04);
  `}
`

const SummaryLabel = styled.span`
  font-size: 13.5px;
  color: #64748B;
  font-weight: 500;
`

const SummaryValue = styled.span<{ $bold?: boolean; $green?: boolean; $accent?: boolean }>`
  font-size: 13.5px;
  font-weight: ${({ $bold }) => $bold ? 800 : 600};
  color: ${({ $green, $accent }) =>
    $green ? '#16A34A' :
    $accent ? '#0F172A' :
    '#334155'};
  text-align: right;
  max-width: 60%;
  word-break: break-word;
`

const SummaryDivider = styled.div`
  height: 1px;
  background: #E2E8F0;
  margin: 0 18px;
`

const CreatorReceivesRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: rgba(34,197,94,0.05);
  border-top: 1.5px solid rgba(34,197,94,0.15);
`

const CreatorLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  font-weight: 700;
  color: #15803D;
`

const CreatorValue = styled.span`
  font-size: 18px;
  font-weight: 900;
  font-family: 'Nunito', sans-serif;
  color: #15803D;
`

// ─── Instructions ─────────────────────────────────────────────────────────────

const InstructionsBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(239,68,68,0.05) 100%);
  border: 1.5px solid rgba(245,158,11,0.22);
  border-radius: 14px;
  margin-bottom: 20px;
  font-size: 13.5px;
  color: #92400E;
  line-height: 1.6;
  font-weight: 500;
`

const InstructionsDot = styled.div`
  width: 22px; height: 22px; min-width: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #F59E0B, #EF4444);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 800;
  flex-shrink: 0;
  margin-top: 1px;
`

// ─── File Upload ──────────────────────────────────────────────────────────────

const FormGroup = styled.div`
  margin-bottom: 18px;
`

const FieldLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
  letter-spacing: 0.01em;

  .optional {
    font-size: 11.5px;
    font-weight: 500;
    color: #94A3B8;
    margin-left: 6px;
  }
`

const HiddenInput = styled.input`
  display: none;
`

const UploadZone = styled.div<{ $dragging: boolean; $hasFile: boolean }>`
  border: 2px dashed ${({ $dragging, $hasFile }) =>
    $dragging ? '#F59E0B' : $hasFile ? '#22C55E' : '#CBD5E1'};
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $dragging, $hasFile }) =>
    $dragging ? 'rgba(245,158,11,0.05)' :
    $hasFile ? 'rgba(34,197,94,0.04)' :
    '#FAFAFA'};

  &:hover {
    border-color: #F59E0B;
    background: rgba(245,158,11,0.04);
  }

  &:focus-visible { outline: 2px solid #F59E0B; outline-offset: 2px; }
`

const UploadIconWrap = styled.div`
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08));
  border: 1.5px solid rgba(245,158,11,0.2);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;

  svg { color: #F59E0B; width: 20px; height: 20px; }
`

const UploadTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin: 0 0 4px;
`

const UploadHint = styled.p`
  font-size: 12px;
  color: #94A3B8;
  font-weight: 500;
  margin: 0;
`

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(34,197,94,0.07);
  border: 1.5px solid rgba(34,197,94,0.2);
  border-radius: 12px;
  margin-bottom: 10px;
`

const FileIconWrap = styled.div`
  width: 36px; height: 36px;
  border-radius: 9px;
  background: rgba(34,197,94,0.12);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;

  svg { color: #22C55E; width: 16px; height: 16px; }
`

const FileName = styled.span`
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  color: #0F172A;
  word-break: break-all;
  line-height: 1.3;
`

const RemoveBtn = styled.button`
  background: none; border: none;
  color: #EF4444; cursor: pointer;
  width: 28px; height: 28px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease;

  &:hover { background: rgba(239,68,68,0.08); }
  svg { width: 14px; height: 14px; }
`

// ─── Warning ──────────────────────────────────────────────────────────────────

const WarningBox = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px 14px;
  background: rgba(251,191,36,0.08);
  border: 1.5px solid rgba(251,191,36,0.28);
  border-radius: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #78350F;
  line-height: 1.55;
  font-weight: 500;

  .warn-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
`

// ─── Confirmation Checkbox ────────────────────────────────────────────────────

const CheckboxWrap = styled.div<{ $checked: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  border: 2px solid ${({ $checked }) => $checked ? 'rgba(34,197,94,0.35)' : '#E2E8F0'};
  background: ${({ $checked }) => $checked ? 'rgba(34,197,94,0.04)' : '#FAFAFA'};
  margin-bottom: 16px;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
  user-select: none;
`

const CustomCheckbox = styled.div<{ $checked: boolean }>`
  width: 22px; height: 22px; min-width: 22px;
  border-radius: 7px;
  border: 2px solid ${({ $checked }) => $checked ? '#22C55E' : '#CBD5E1'};
  background: ${({ $checked }) => $checked
    ? 'linear-gradient(135deg, #22C55E, #16A34A)'
    : '#FFFFFF'};
  display: flex; align-items: center; justify-content: center;
  transition: all 0.18s ease;
  flex-shrink: 0;
  margin-top: 1px;

  svg {
    width: 12px; height: 12px; color: white;
    opacity: ${({ $checked }) => $checked ? 1 : 0};
    animation: ${({ $checked }) => $checked ? css`${checkPop} 0.25s ease forwards` : 'none'};
  }
`

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

const CheckboxText = styled.div`
  flex: 1;

  .check-title {
    font-size: 14px;
    font-weight: 700;
    color: #0F172A;
    margin-bottom: 3px;
    display: block;
  }

  .check-sub {
    font-size: 12.5px;
    color: #64748B;
    font-weight: 500;
    line-height: 1.5;
  }
`

// ─── Error ────────────────────────────────────────────────────────────────────

const ErrorMsg = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #EF4444;
  font-size: 12.5px;
  font-weight: 600;
  margin-top: 6px;

  &::before { content: '⚠'; font-size: 11px; }
`

// ─── Submit Button ────────────────────────────────────────────────────────────

const SubmitBtn = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 16px;
  font-weight: 800;
  border: none;
  border-radius: 14px;
  letter-spacing: 0.01em;
  cursor: ${({ $active }) => $active ? 'pointer' : 'not-allowed'};
  transition: box-shadow 0.2s ease, transform 0.15s ease, opacity 0.2s ease;

  background: ${({ $active }) =>
    $active ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' : '#F1F5F9'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#94A3B8'};
  box-shadow: ${({ $active }) =>
    $active ? '0 4px 20px rgba(239,68,68,0.30)' : 'none'};

  &:hover:not(:disabled) {
    box-shadow: 0 6px 28px rgba(239,68,68,0.40);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { cursor: not-allowed; }

  &:focus-visible { outline: 2px solid #F59E0B; outline-offset: 2px; }

  .spinner {
    width: 16px; height: 16px;
    border: 2.5px solid rgba(255,255,255,0.35);
    border-top-color: white;
    border-radius: 50%;
    animation: ${spin} 0.7s linear infinite;
    flex-shrink: 0;
  }
`

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatPaymentMethodDisplay = (method: DonationPaymentMethod): string => {
  if (!method?.type) return 'Payment Method'
  switch (method.type) {
    case 'venmo':    return `Venmo: ${method.username || method.venmo_handle || 'Account'}`
    case 'paypal':   return `PayPal: ${method.email || 'Account'}`
    case 'cashapp':  return `Cash App: ${method.cashtag || method.cash_app_handle || 'Account'}`
    case 'bank':     return `Bank Transfer (Routing: ${method.routingNumber || method.routing_number || '****'})`
    case 'crypto':   return `${(method.cryptoType || method.crypto_type || 'Crypto').toUpperCase()} Wallet`
    case 'other':    return `Other: ${method.details || 'Payment Method'}`
    default:         return `${method.type}: Payment Method`
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DonationStep3Confirmation({
  amount,
  paymentMethod,
  campaignTitle,
  onSubmit,
  isLoading = false,
}: Step3ConfirmationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const { register, watch, setValue, handleSubmit, formState: { errors } } =
    useForm<DonationConfirmationFormData>({
      resolver: zodResolver(donationConfirmationSchema),
      mode: 'onChange',
    })

  const screenshotProof  = watch('screenshotProof')
  const agreePaymentSent = watch('agreePaymentSent')

  const feeInfo = currencyUtils.calculateFee(amount)
  const fmt = (dollars: number) => currencyUtils.formatCurrency(dollars * 100)

  const handleFileSelect = (file: File | null) => {
    if (file && file.size <= 5 * 1024 * 1024) {
      setValue('screenshotProof', file, { shouldValidate: true })
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  return (
    <Container as="form" onSubmit={handleSubmit(onSubmit)}>
      <StepEyebrow>Step 3 of 3 · Confirm</StepEyebrow>
      <Title>Almost there — confirm your donation</Title>
      <Subtitle>
        Review the details below, upload proof if you have it, then confirm you've sent the payment.
      </Subtitle>

      {/* Summary card */}
      <SummaryCard>
        <SummaryHeader>
          <SummaryHeaderText>Donation summary</SummaryHeaderText>
        </SummaryHeader>
        <SummaryBody>
          <SummaryRow>
            <SummaryLabel>Campaign</SummaryLabel>
            <SummaryValue $bold $accent>{campaignTitle}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Your donation</SummaryLabel>
            <SummaryValue $bold>{fmt(feeInfo.gross)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Platform fee (20%)</SummaryLabel>
            <SummaryValue>−{fmt(feeInfo.fee)}</SummaryValue>
          </SummaryRow>
          <SummaryRow>
            <SummaryLabel>Payment method</SummaryLabel>
            <SummaryValue>{formatPaymentMethodDisplay(paymentMethod)}</SummaryValue>
          </SummaryRow>
        </SummaryBody>
        <CreatorReceivesRow>
          <CreatorLabel>
            <CheckCircle size={15} />
            Creator receives
          </CreatorLabel>
          <CreatorValue>{fmt(feeInfo.net)}</CreatorValue>
        </CreatorReceivesRow>
      </SummaryCard>

      {/* Instructions */}
      <InstructionsBox>
        <InstructionsDot>→</InstructionsDot>
        <div>
          <strong>Next:</strong> Send {fmt(feeInfo.gross)} to the payment method shown above.
          Then upload a screenshot as proof (optional but recommended) and check the confirmation box below.
        </div>
      </InstructionsBox>

      {/* File Upload */}
      <FormGroup>
        <FieldLabel>
          Payment screenshot
          <span className="optional">(optional but recommended)</span>
        </FieldLabel>

        <UploadZone
          $dragging={isDragging}
          $hasFile={!!screenshotProof}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          tabIndex={0}
          role="button"
          aria-label="Upload payment proof screenshot"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click() }}
        >
          {screenshotProof ? (
            <FilePreview onClick={(e) => e.stopPropagation()}>
              <FileIconWrap><FileText /></FileIconWrap>
              <FileName>{screenshotProof.name}</FileName>
              <RemoveBtn
                type="button"
                onClick={(e) => { e.stopPropagation(); setValue('screenshotProof', undefined) }}
                aria-label="Remove file"
              >
                <X />
              </RemoveBtn>
            </FilePreview>
          ) : (
            <>
              <UploadIconWrap><Upload /></UploadIconWrap>
              <UploadTitle>Drag your screenshot here, or click to browse</UploadTitle>
              <UploadHint>JPEG, PNG or WebP · Max 5 MB</UploadHint>
            </>
          )}
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            disabled={isLoading}
            aria-describedby="file-error"
          />
        </UploadZone>

        {errors.screenshotProof && (
          <ErrorMsg id="file-error" role="alert">{errors.screenshotProof.message as string}</ErrorMsg>
        )}
      </FormGroup>

      {/* Warning */}
      <WarningBox>
        <span className="warn-icon">⚠️</span>
        <div>
          <strong>Keep your receipt:</strong> Save a record of your transaction. The creator will follow up
          if they need more information.
        </div>
      </WarningBox>

      {/* Confirmation checkbox */}
      <CheckboxWrap
        $checked={!!agreePaymentSent}
        onClick={() => setValue('agreePaymentSent', !agreePaymentSent, { shouldValidate: true })}
      >
        <CustomCheckbox $checked={!!agreePaymentSent}>
          <CheckCircle />
        </CustomCheckbox>
        <CheckboxText>
          <span className="check-title">I have sent the payment</span>
          <span className="check-sub">
            to the payment method shown above. I understand the creator will review and process my donation.
          </span>
        </CheckboxText>
        <HiddenCheckbox
          id="agree-payment-sent"
          type="checkbox"
          disabled={isLoading}
          {...register('agreePaymentSent')}
          aria-describedby={errors.agreePaymentSent ? 'agree-error' : undefined}
          onClick={(e) => e.stopPropagation()}
        />
      </CheckboxWrap>

      {errors.agreePaymentSent && (
        <ErrorMsg id="agree-error" role="alert" style={{ marginBottom: 14 }}>
          {errors.agreePaymentSent.message as string}
        </ErrorMsg>
      )}

      {/* Submit */}
      <SubmitBtn
        type="submit"
        $active={!!agreePaymentSent && !isLoading}
        disabled={isLoading || !agreePaymentSent}
        aria-label="Confirm and submit donation"
      >
        {isLoading
          ? <><div className="spinner" />Processing…</>
          : agreePaymentSent
            ? '🎉 Confirm Donation'
            : 'Check the box above to continue'
        }
      </SubmitBtn>
    </Container>
  )
}