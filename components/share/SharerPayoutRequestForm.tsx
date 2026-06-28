/**
 * SharerPayoutRequestForm.tsx
 * Form component for sharers to request payout of verified earnings
 * Handles amount input, payout method selection, and account details
 */

'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { tk } from '@/styles/dashboardTokens'
import { useCreatePayoutRequest } from '@/api/hooks/useSharerPayoutRequest'
import { useRewardsAvailableBalance } from '@/api/hooks/useSharerRewards'
import { LoadingSpinner } from '@/components/LoadingSpinner'

const FormContainer = styled.div`
  background-color: white;
  border: 1px solid ${tk.border};
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 600px;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`

const FormTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 1.5rem 0;
`

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`

const Label = styled.label`
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${tk.heading};
  margin-bottom: 0.5rem;
`

const Required = styled.span`
  color: ${tk.red};
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${tk.border};
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${tk.blue};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background-color: ${tk.canvas};
    cursor: not-allowed;
  }
`

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${tk.border};
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${tk.blue};
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:disabled {
    background-color: ${tk.canvas};
    cursor: not-allowed;
  }
`

const HelperText = styled.span`
  display: block;
  font-size: 0.8rem;
  color: ${tk.muted};
  margin-top: 0.375rem;
`

const ErrorText = styled.span`
  display: block;
  font-size: 0.8rem;
  color: ${tk.red};
  margin-top: 0.375rem;
`

const AvailableBalance = styled.div`
  background-color: ${tk.greenLight};
  border: 1px solid ${tk.greenLight};
  border-radius: 6px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: ${tk.green};
`

const BankDetailsSection = styled.div`
  background-color: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`

const BankDetailsTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${tk.heading};
  margin: 0 0 0.75rem 0;
`

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const SubmitButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background: ${tk.ink};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  &:disabled {
    background: ${tk.border};
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem 1.5rem;
  background-color: white;
  color: ${tk.muted};
  border: 1px solid ${tk.border};
  border-radius: 6px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${tk.canvas};
    border-color: ${tk.muted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`

const SuccessMessage = styled.div`
  background-color: ${tk.greenLight};
  border: 1px solid ${tk.greenLight};
  color: ${tk.green};
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-weight: 500;
`

interface SharerPayoutRequestFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const SharerPayoutRequestForm: React.FC<SharerPayoutRequestFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { data: availableBalance, isLoading: loadingBalance } = useRewardsAvailableBalance()
  const { mutate: createPayoutRequest, isLoading: isSubmitting, error, isError } = useCreatePayoutRequest()

  const [formData, setFormData] = useState({
    amount: '',
    payoutMethod: 'bank_transfer',
    accountNumber: '',
    routingNumber: '',
    paypalEmail: '',
  })

  const [successMessage, setSuccessMessage] = useState('')

  const availableCents = availableBalance?.totalCents || 0
  const availableDollars = (availableCents / 100).toFixed(2)
  const minPayout = 1000 // $10
  const canRequestPayout = availableCents >= minPayout

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers and one decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setFormData({ ...formData, amount: value })
    }
  }

  const handlePayoutMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, payoutMethod: e.target.value as any })
  }

  const handleBankDetailsChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'accountNumber' | 'routingNumber'
  ) => {
    const value = e.target.value
    if (/^\d*$/.test(value)) {
      setFormData({ ...formData, [field]: value })
    }
  }

  const handlePaypalEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, paypalEmail: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const amountCents = Math.round(parseFloat(formData.amount) * 100)

    if (!amountCents || amountCents < 1000) {
      return
    }

    if (amountCents > availableCents) {
      return
    }

    const payload: any = {
      amountCents,
      payoutMethod: formData.payoutMethod,
    }

    if (formData.payoutMethod === 'bank_transfer') {
      payload.accountDetails = {
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber,
      }
    } else if (formData.payoutMethod === 'paypal') {
      payload.accountDetails = {
        paypalEmail: formData.paypalEmail,
      }
    }

    createPayoutRequest(payload, {
      onSuccess: () => {
        setSuccessMessage(`Payout request of $${(amountCents / 100).toFixed(2)} submitted successfully!`)
        setFormData({
          amount: '',
          payoutMethod: 'bank_transfer',
          accountNumber: '',
          routingNumber: '',
          paypalEmail: '',
        })
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      },
    })
  }

  if (loadingBalance) {
    return (
      <FormContainer>
        <LoadingSpinner />
      </FormContainer>
    )
  }

  if (successMessage) {
    return (
      <FormContainer>
        <SuccessMessage>{successMessage}</SuccessMessage>
      </FormContainer>
    )
  }

  return (
    <FormContainer>
      <FormTitle>Request Payout</FormTitle>

      <AvailableBalance>
        💰 Available Balance: <strong>${availableDollars}</strong> ({availableBalance?.count || 0} verified rewards)
      </AvailableBalance>

      <form onSubmit={handleSubmit}>
        {isError && (
          <ErrorText style={{ marginBottom: '1rem', display: 'block' }}>
            {(error as any)?.response?.data?.message || 'Failed to create payout request. Please try again.'}
          </ErrorText>
        )}

        <FormGroup>
          <Label>
            Payout Amount <Required>*</Required>
          </Label>
          <Input
            type="text"
            placeholder="10.00"
            value={formData.amount}
            onChange={handleAmountChange}
            disabled={isSubmitting || !canRequestPayout}
            required
          />
          <HelperText>
            Minimum: $10.00 | Maximum: ${availableDollars}
          </HelperText>
          {formData.amount &&
            parseFloat(formData.amount) < 10 && (
              <ErrorText>Amount must be at least $10.00</ErrorText>
            )}
          {formData.amount &&
            parseFloat(formData.amount) > parseFloat(availableDollars) && (
              <ErrorText>Amount exceeds available balance</ErrorText>
            )}
        </FormGroup>

        <FormGroup>
          <Label>
            Payout Method <Required>*</Required>
          </Label>
          <Select
            value={formData.payoutMethod}
            onChange={handlePayoutMethodChange}
            disabled={isSubmitting || !canRequestPayout}
            required
          >
            <option value="bank_transfer">Bank Transfer (ACH)</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
          </Select>
          <HelperText>Select how you'd like to receive your earnings</HelperText>
        </FormGroup>

        {formData.payoutMethod === 'bank_transfer' && (
          <BankDetailsSection>
            <BankDetailsTitle>Bank Account Details</BankDetailsTitle>
            <TwoColumnGrid>
              <FormGroup>
                <Label>
                  Account Number <Required>*</Required>
                </Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formData.accountNumber}
                  onChange={e => handleBankDetailsChange(e, 'accountNumber')}
                  maxLength="17"
                  disabled={isSubmitting}
                  required
                />
                <HelperText>8-17 digits</HelperText>
              </FormGroup>
              <FormGroup>
                <Label>
                  Routing Number <Required>*</Required>
                </Label>
                <Input
                  type="password"
                  placeholder="•••••••••"
                  value={formData.routingNumber}
                  onChange={e => handleBankDetailsChange(e, 'routingNumber')}
                  maxLength="9"
                  disabled={isSubmitting}
                  required
                />
                <HelperText>9 digits</HelperText>
              </FormGroup>
            </TwoColumnGrid>
          </BankDetailsSection>
        )}

        {formData.payoutMethod === 'paypal' && (
          <BankDetailsSection>
            <BankDetailsTitle>PayPal Account</BankDetailsTitle>
            <FormGroup>
              <Label>
                PayPal Email <Required>*</Required>
              </Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.paypalEmail}
                onChange={handlePaypalEmailChange}
                disabled={isSubmitting}
                required
              />
              <HelperText>Associated with your PayPal account</HelperText>
            </FormGroup>
          </BankDetailsSection>
        )}

        <ButtonContainer>
          <SubmitButton
            type="submit"
            disabled={
              isSubmitting ||
              !canRequestPayout ||
              !formData.amount ||
              parseFloat(formData.amount) < 10 ||
              parseFloat(formData.amount) > parseFloat(availableDollars)
            }
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner />
                Submitting...
              </>
            ) : (
              '💳 Submit Payout Request'
            )}
          </SubmitButton>
          {onCancel && (
            <CancelButton type="button" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </CancelButton>
          )}
        </ButtonContainer>
      </form>

      <HelperText style={{ marginTop: '1rem', display: 'block', fontSize: '0.85rem' }}>
        ℹ️ Payouts are processed within 1-3 business days. Your earnings are protected by our fraud detection system.
      </HelperText>
    </FormContainer>
  )
}
