'use client'

import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { AlertCircle } from 'lucide-react'
import { PaymentDirectory } from '@/components/campaign/PaymentDirectory'
import { DONATION_FEE_RATE, DONATION_FEE_PERCENT } from '@/utils/validationSchemas'
import { tk } from '@/styles/dashboardTokens'

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
  margin: 0 0 24px;
  line-height: 1.65;
  font-weight: 400;
`

// ─── Amount Hero Card ─────────────────────────────────────────────────────────

const AmountCard = styled.div`
  position: relative;
  border-radius: 14px;
  padding: 20px 20px 18px;
  background: ${tk.ink};
  border: 1px solid ${tk.inkBorder};
  margin-bottom: 20px;
  overflow: hidden;
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
  font-family: 'Syne', sans-serif;
  font-size: clamp(28px, 7vw, 40px);
  font-weight: 800;
  color: ${tk.amberMid};
  margin: 0;
  line-height: 1;
  letter-spacing: -0.5px;
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
  background: ${tk.blueLight};
  border: 1px solid rgba(26,95,168,0.20);
  border-radius: 14px;
  margin-bottom: 24px;
  font-size: 13px;
  color: ${tk.blue};
  line-height: 1.55;
  font-weight: 500;

  svg { flex-shrink: 0; color: ${tk.blue}; margin-top: 1px; width: 16px; height: 16px; }

  strong { font-weight: 700; color: ${tk.blue}; }
`

// ─── Payment Directory Wrapper ────────────────────────────────────────────────

const DirectoryWrapper = styled.div`
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${tk.border};
  background: ${tk.white};
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
  font-family: 'Syne', sans-serif;
  font-size: 15px;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  cursor: ${({ $active }) => $active ? 'pointer' : 'not-allowed'};
  letter-spacing: 0.01em;
  transition: background 0.2s ease, transform 0.15s ease, opacity 0.2s ease;

  background: ${({ $active }) => $active ? tk.ink : tk.canvasDeep};
  color: ${({ $active }) => $active ? tk.white : tk.muted};

  &:hover:not(:disabled) {
    background: ${({ $active }) => $active ? tk.inkLight : tk.canvasDeep};
    transform: ${({ $active }) => $active ? 'translateY(-1px)' : 'none'};
  }

  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { cursor: not-allowed; }

  &:focus-visible {
    outline: 2px solid ${tk.amber};
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
  const fee = Number((safeAmount * DONATION_FEE_RATE).toFixed(2))
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
            <AmountMeta>Platform fee ({DONATION_FEE_PERCENT}%)</AmountMeta>
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