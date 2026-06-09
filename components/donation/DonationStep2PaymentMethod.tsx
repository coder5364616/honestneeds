'use client'

import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { AlertCircle } from 'lucide-react'
import { PaymentDirectory } from '@/components/campaign/PaymentDirectory'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Step2PaymentMethodProps {
  paymentMethods: Array<{ type: string; [key: string]: any }>
  creatorName: string
  amount: number
  onNext: (selectedMethod: any) => void
  isLoading?: boolean
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
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

// ─── Amount Hero Card ─────────────────────────────────────────────────────────

const AmountCard = styled.div`
  position: relative;
  border-radius: 20px;
  padding: 20px 20px 18px;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border: 1.5px solid rgba(255,255,255,0.08);
  box-shadow: 0 12px 40px rgba(15,23,42,0.18), 0 2px 8px rgba(15,23,42,0.10);
  margin-bottom: 20px;
  overflow: hidden;

  /* Ambient glow */
  &::before {
    content: '';
    position: absolute;
    top: -30px; left: 50%;
    transform: translateX(-50%);
    width: 200px; height: 80px;
    background: linear-gradient(90deg, rgba(245,158,11,0.4), rgba(239,68,68,0.30));
    filter: blur(28px);
    z-index: 0;
  }
`

const AmountCardInner = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`

const AmountLeft = styled.div``

const AmountLabel = styled.p`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.5);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0 0 4px;
`

const AmountValue = styled.p`
  font-family: 'Nunito', sans-serif;
  font-size: clamp(28px, 7vw, 40px);
  font-weight: 900;
  color: #FFFFFF;
  margin: 0;
  line-height: 1;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #FDE68A 0%, #FBBF24 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const AmountRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
`

const AmountMeta = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.45);
  margin: 0;
  line-height: 1.4;
`

const AmountNetValue = styled.p`
  font-size: 15px;
  font-weight: 800;
  color: rgba(255,255,255,0.85);
  margin: 0;
`

// ─── Security Note ────────────────────────────────────────────────────────────

const SecurityNote = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  background: rgba(56,189,248,0.07);
  border: 1.5px solid rgba(56,189,248,0.20);
  border-radius: 14px;
  margin-bottom: 24px;
  font-size: 13px;
  color: #0C4A6E;
  line-height: 1.55;
  font-weight: 500;

  svg { flex-shrink: 0; color: #0EA5E9; margin-top: 1px; width: 16px; height: 16px; }

  strong { font-weight: 700; color: #0369A1; }
`

// ─── Payment Directory Wrapper ────────────────────────────────────────────────

const DirectoryWrapper = styled.div`
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid #E2E8F0;
  background: #FFFFFF;
  box-shadow: 0 2px 12px rgba(15,23,42,0.06);
  margin-bottom: 20px;
`

// ─── Continue Button ──────────────────────────────────────────────────────────

const ContinueBtn = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  font-family: 'Nunito', sans-serif;
  font-size: 15px;
  font-weight: 800;
  border: none;
  border-radius: 14px;
  cursor: ${({ $active }) => $active ? 'pointer' : 'not-allowed'};
  letter-spacing: 0.01em;
  transition: box-shadow 0.2s ease, transform 0.15s ease, opacity 0.2s ease;

  background: ${({ $active }) => $active
    ? 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)'
    : '#F1F5F9'};
  color: ${({ $active }) => $active ? '#FFFFFF' : '#94A3B8'};
  box-shadow: ${({ $active }) => $active
    ? '0 4px 20px rgba(239,68,68,0.28)'
    : 'none'};

  &:hover:not(:disabled) {
    box-shadow: ${({ $active }) => $active ? '0 6px 26px rgba(239,68,68,0.38)' : 'none'};
    transform: ${({ $active }) => $active ? 'translateY(-1px)' : 'none'};
  }

  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { cursor: not-allowed; }

  &:focus-visible {
    outline: 2px solid #F59E0B;
    outline-offset: 2px;
  }

  .check { font-size: 14px; }
`

// ─── Component ────────────────────────────────────────────────────────────────

export function DonationStep2PaymentMethod({
  paymentMethods,
  creatorName,
  amount,
  onNext,
  isLoading = false,
}: Step2PaymentMethodProps) {
  const [selectedMethod, setSelectedMethod] = useState<any | null>(null)

  const safeAmount = typeof amount === 'number' ? amount : 0
  const fee = Number((safeAmount * 0.2).toFixed(2))
  const net = Number((safeAmount - fee).toFixed(2))

  const handleMethodSelect = (method: any) => {
    setSelectedMethod(method)
    onNext(method)
  }

  return (
    <Container>
      <StepEyebrow>Step 2 of 3 · Payment</StepEyebrow>
      <Title>Choose how to send your gift</Title>
      <Subtitle>
        Pick {creatorName}'s preferred payment method below and follow the instructions
        to complete your transfer outside the app.
      </Subtitle>

      {/* Amount hero */}
      <AmountCard>
        <AmountCardInner>
          <AmountLeft>
            <AmountLabel>You're sending</AmountLabel>
            <AmountValue>${safeAmount.toFixed(2)}</AmountValue>
          </AmountLeft>
          <AmountRight>
            <AmountMeta>Platform fee (20%)</AmountMeta>
            <AmountNetValue>−${fee.toFixed(2)}</AmountNetValue>
            <AmountMeta style={{ marginTop: 4 }}>Creator receives</AmountMeta>
            <AmountNetValue style={{ color: '#86EFAC' }}>${net.toFixed(2)}</AmountNetValue>
          </AmountRight>
        </AmountCardInner>
      </AmountCard>

      {/* Security note */}
      <SecurityNote>
        <AlertCircle />
        <div>
          <strong>Direct & transparent:</strong> You send payment directly to {creatorName} outside our app.
          Once sent, return here and confirm so {creatorName} knows to expect it.
        </div>
      </SecurityNote>

      {/* Payment directory */}
      <DirectoryWrapper>
        <PaymentDirectory
          paymentMethods={paymentMethods}
          creatorName={creatorName}
          onMethodSelect={handleMethodSelect}
        />
      </DirectoryWrapper>

      {/* Continue button */}
      <ContinueBtn
        type="button"
        $active={!!selectedMethod && !isLoading}
        disabled={isLoading || !selectedMethod}
        aria-label="Continue to confirmation"
      >
        {isLoading
          ? 'Loading…'
          : selectedMethod
            ? <><span className="check">✓</span> Payment Method Selected — Continue</>
            : 'Select a payment method above'
        }
      </ContinueBtn>
    </Container>
  )
}