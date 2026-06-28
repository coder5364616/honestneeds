'use client'

import React, { useState, useMemo } from 'react'
import styled from 'styled-components'
import { X, AlertCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ShareBudgetReloadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { amount: number; paymentMethodId: string }) => Promise<void>
  currentBudget: number // in cents
  creatorName: string
  campaignTitle: string
}

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${(props) => (props.isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: color 0.2s ease;

  &:hover {
    color: #0f172a;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`

const Body = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const InfoSection = styled.div`
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 1rem;
`

const InfoTitle = styled.p`
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
`

const InfoText = styled.p`
  color: #15803d;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f172a;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #cbd5e1;
  }
`

const FeeCalculationBox = styled.div`
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 1rem;
`

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;

  &:last-child {
    margin-bottom: 0;
    padding-top: 0.75rem;
    border-top: 2px solid #fcd34d;
    font-weight: 700;
    color: #92400e;
  }
`

const FeeLabel = styled.span`
  color: #78350f;
`

const FeeAmount = styled.span`
  color: #92400e;
  font-weight: 600;
`

const WarningBox = styled.div`
  display: flex;
  gap: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  color: #991b1b;
  font-size: 0.875rem;
  line-height: 1.5;
`

const WarningIcon = styled.div`
  flex-shrink: 0;
  margin-top: 0.125rem;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`

const FooterActions = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
  border-radius: 0 0 16px 16px;
`

const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * ShareBudgetReloadModal Component
 * Production-ready modal for topping up the share reward budget.
 * Trust-based model (2026-06-22): top-ups are INSTANT and FEE-FREE — the full
 * amount is added to the reward pool and paid sharing re-activates immediately.
 */
export const ShareBudgetReloadModal: React.FC<ShareBudgetReloadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentBudget,
  creatorName,
  campaignTitle,
}) => {
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const amountInCents = useMemo(() => {
    try {
      return Math.round(parseFloat(amount) * 100) || 0
    } catch {
      return 0
    }
  }, [amount])

  // Trust-based: no platform fee — the full amount funds the reward pool.
  const creatorReceives = amountInCents

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setAmount(value)
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (!amount || amountInCents === 0) {
      setError('Please enter an amount to reload')
      return
    }

    if (amountInCents < 1000) {
      // Minimum $10
      setError('Minimum reload amount is $10')
      return
    }

    if (amountInCents > 100000000) {
      // Maximum $1M
      setError('Maximum reload amount is $1,000,000')
      return
    }

    try {
      setIsSubmitting(true)
      await onSubmit({
        amount: amountInCents,
        paymentMethodId: 'default', // Use default payment method or let backend decide
      })
      setAmount('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to reload budget. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Overlay isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>💅 Reload Share Budget</Title>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        <Body>
          {/* Current Budget Info */}
          <InfoSection>
            <InfoTitle>Campaign: {campaignTitle}</InfoTitle>
            <InfoText>Creator: {creatorName}</InfoText>
            <InfoText style={{ marginTop: '0.5rem' }}>
              Current budget: <strong>{formatCurrency(currentBudget)}</strong>
            </InfoText>
          </InfoSection>

          {/* Amount Input */}
          <FormGroup>
            <Label htmlFor="reloadAmount">Reload Amount</Label>
            <Input
              id="reloadAmount"
              type="text"
              placeholder="Enter amount (e.g., 50.00)"
              value={amount}
              onChange={handleAmountChange}
              disabled={isSubmitting}
              autoFocus
            />
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Minimum: $10 | Maximum: $1,000,000
            </span>
          </FormGroup>

          {/* Top-up Summary (no fee) */}
          {amountInCents > 0 && (
            <FeeCalculationBox>
              <FeeRow>
                <FeeLabel>Top-up Amount:</FeeLabel>
                <FeeAmount>{formatCurrency(amountInCents)}</FeeAmount>
              </FeeRow>
              <FeeRow>
                <FeeLabel>📊 Platform Fee:</FeeLabel>
                <FeeAmount style={{ color: '#059669' }}>$0.00</FeeAmount>
              </FeeRow>
              <FeeRow>
                <FeeLabel>Added to Reward Pool:</FeeLabel>
                <FeeAmount>{formatCurrency(creatorReceives)}</FeeAmount>
              </FeeRow>
            </FeeCalculationBox>
          )}

          {/* Note */}
          <WarningBox>
            <WarningIcon>
              <AlertCircle />
            </WarningIcon>
            <div>
              <strong>Note:</strong> Top-ups are <strong>instant and fee-free</strong> — the full
              amount is added to your reward pool and paid sharing re-activates right away. You pay
              sharers directly when they request a payout.
            </div>
          </WarningBox>

          {/* Error */}
          {error && (
            <div
              style={{
                backgroundColor: '#fee2e2',
                color: '#991b1b',
                padding: '0.75rem',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            >
              ❌ {error}
            </div>
          )}
        </Body>

        <FooterActions>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || amountInCents === 0}
          >
            {isSubmitting ? 'Processing...' : 'Reload Budget'}
          </Button>
        </FooterActions>
      </ModalContent>
    </Overlay>
  )
}
