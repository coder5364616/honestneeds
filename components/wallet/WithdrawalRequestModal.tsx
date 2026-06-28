/**
 * Withdrawal Request Modal
 * Allows users to initiate withdrawal requests
 *
 * Styled to match the /dashboard design system (Syne / DM Sans / DM Mono,
 * warm-amber + ink token palette) — same tokens used on the My Shares page
 * that opens this modal.
 */

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { X, AlertCircle, Loader, DollarSign, Wallet } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useRequestWithdrawal } from '@/api/hooks/useWallet'
import { usePaymentMethods } from '@/api/hooks/usePaymentMethods'
import { Modal } from '@/components/Modal'

// ─── Design Tokens (mirrors /dashboard and /shares) ───────────────────────────

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  inkBorder:   '#3D3A44',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
}

const GlobalFont = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
`

const ModalContent = styled.div`
  padding: 1.75rem 2rem 2rem;
  max-width: 520px;
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid ${tk.border};
`

const HeaderText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
`

const TitleIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${tk.amberLight};
  color: ${tk.amber};
`

const Title = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0;
  line-height: 1.2;
`

const Subtitle = styled.p`
  font-size: 0.8rem;
  color: ${tk.muted};
  margin: 2px 0 0;
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${tk.muted};
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background 140ms, color 140ms;

  &:hover {
    background: ${tk.canvasDeep};
    color: ${tk.ink};
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.375rem;
`

const Label = styled.label`
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${tk.heading};
  margin-bottom: 0.5rem;

  .required {
    color: ${tk.red};
    margin-left: 3px;
  }
`

const baseFieldStyles = `
  width: 100%;
  font-family: 'DM Sans', sans-serif;
  padding: 0.7rem 0.9rem;
  border: 1.5px solid ${tk.border};
  border-radius: 10px;
  font-size: 0.9rem;
  background: ${tk.white};
  color: ${tk.heading};
  transition: border-color 140ms, box-shadow 140ms;

  &:focus {
    outline: none;
    border-color: ${tk.amber};
    box-shadow: 0 0 0 3px ${tk.amberLight};
  }

  &::placeholder {
    color: ${tk.muted};
  }

  &:disabled {
    background: ${tk.canvasDeep};
    color: ${tk.muted};
    cursor: not-allowed;
  }
`

const AmountInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const CurrencySymbol = styled.span`
  position: absolute;
  left: 0.9rem;
  color: ${tk.muted};
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  font-size: 1rem;
  pointer-events: none;
`

const AmountInputField = styled.input`
  ${baseFieldStyles}
  padding-left: 2.25rem;
  font-family: 'DM Mono', monospace;
  font-size: 1rem;
`

const PaymentMethodSelect = styled.select`
  ${baseFieldStyles}
  cursor: pointer;
`

const CampaignSelect = styled.select`
  ${baseFieldStyles}
  cursor: pointer;
`

const Textarea = styled.textarea`
  ${baseFieldStyles}
  min-height: 80px;
  resize: vertical;
`

const HelpText = styled.div<{ $tone?: 'muted' | 'warning' | 'error' }>`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: ${(p) => (p.$tone === 'warning' ? tk.amberDark : p.$tone === 'error' ? tk.red : tk.muted)};
`

const InfoBox = styled.div<{ $type: 'info' | 'warning' | 'success' | 'danger' }>`
  display: flex;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  border: 1px solid;
  font-family: 'DM Sans', sans-serif;

  ${(p) => {
    switch (p.$type) {
      case 'info':
        return `background: ${tk.blueLight}; border-color: ${tk.blue}55; color: ${tk.blue};`
      case 'warning':
        return `background: ${tk.amberLight}; border-color: ${tk.amber}55; color: ${tk.amberDark};`
      case 'success':
        return `background: ${tk.greenLight}; border-color: ${tk.green}55; color: ${tk.green};`
      case 'danger':
        return `background: ${tk.redLight}; border-color: ${tk.red}55; color: ${tk.red};`
    }
  }}

  svg {
    width: 1.1rem;
    height: 1.1rem;
    flex-shrink: 0;
    margin-top: 1px;
  }

  strong {
    display: block;
    margin-bottom: 2px;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    color: ${tk.heading};
  }
`

const BalanceCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 12px;
  padding: 1rem 1.125rem;
`

const BalanceLabel = styled.div`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const BalanceValue = styled.div<{ $empty?: boolean }>`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${(p) => (p.$empty ? tk.muted : tk.green)};
  margin-top: 2px;
`

const BalanceEmpty = styled.span`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${tk.muted};
`

const BalanceIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${tk.greenLight};
  color: ${tk.green};
`

const CampaignBalanceBox = styled.div`
  background: ${tk.greenLight};
  border: 1px solid ${tk.green}40;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  margin-top: 0.75rem;
  font-size: 0.85rem;

  .label {
    color: ${tk.green};
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .amount {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: ${tk.green};
    margin-top: 2px;
  }

  .details {
    margin-top: 0.7rem;
    padding-top: 0.7rem;
    border-top: 1px solid ${tk.green}30;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: ${tk.body};

    div {
      display: flex;
      justify-content: space-between;
    }

    .value {
      font-family: 'DM Mono', monospace;
      font-weight: 500;
      color: ${tk.heading};
    }
  }
`

const FeeBreakdown = styled.div`
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  font-size: 0.85rem;
`

const FeeRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  &.total {
    font-weight: 700;
    color: ${tk.heading};
    border-top: 1px solid ${tk.border};
    padding-top: 0.65rem;
    margin-top: 0.15rem;
    font-family: 'Syne', sans-serif;
  }

  .label {
    color: ${tk.muted};
  }

  .value {
    color: ${tk.heading};
    font-family: 'DM Mono', monospace;
    font-weight: 500;
  }
`

const LimitInfo = styled.div`
  background: ${tk.amberLight};
  border: 1px solid ${tk.amber}40;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font-size: 0.82rem;
  color: ${tk.amberDark};

  strong {
    display: block;
    margin-bottom: 0.4rem;
    font-family: 'Syne', sans-serif;
    color: ${tk.heading};
  }

  ul {
    margin: 0;
    padding-left: 1.1rem;
  }

  li {
    margin-bottom: 0.2rem;
  }
`

const AgreementLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  cursor: pointer;
  font-size: 0.82rem;
  color: ${tk.muted};

  input {
    margin-top: 3px;
    cursor: pointer;
    accent-color: ${tk.amber};
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
`

const GhostBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: ${tk.white};
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.7rem 1.1rem;
  cursor: pointer;
  transition: background 140ms, border-color 140ms;

  &:hover:not(:disabled) {
    background: ${tk.canvasDeep};
    border-color: ${tk.amber};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PrimaryBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1.1rem;
  cursor: pointer;
  transition: background 140ms, transform 120ms;

  &:hover:not(:disabled) {
    background: ${tk.inkLight};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`

const spin = `
  @keyframes withdrawal-spin {
    to { transform: rotate(360deg); }
  }
`

const SpinIcon = styled(Loader)`
  ${spin}
  animation: withdrawal-spin 1s linear infinite;
`

export interface WithdrawalRequestModalProps {
  availableBalance: number // in cents
  onClose: () => void
  onSuccess: () => void
}

/**
 * Withdrawal Request Modal Component
 */
export const WithdrawalRequestModal: React.FC<WithdrawalRequestModalProps> = ({
  availableBalance,
  onClose,
  onSuccess
}) => {
  const [amount, setAmount] = useState('')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState('')

  // Fetch campaigns with per-campaign balance
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [campaignsError, setCampaignsError] = useState<string | null>(null)

  const { data: paymentMethods = [], isLoading: methodsLoading, error: methodsError } = usePaymentMethods()
  const { mutate: requestWithdrawal, isPending: isRequesting, error } = useRequestWithdrawal()

  // Fetch campaigns on mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      setCampaignsLoading(true)
      try {
        const { data } = await apiClient.get('/wallet/earning-campaigns')
        setCampaigns(data.campaigns || [])
      } catch (err) {
        setCampaignsError('Failed to load campaigns')
      } finally {
        setCampaignsLoading(false)
      }
    }
    fetchCampaigns()
  }, [])

  const amountCents = Math.round(parseFloat(amount || '0') * 100)
  const minimumWithdrawal = 500 // $5

  // Get selected campaign data
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId || c._id === selectedCampaignId)
  const campaignAvailableCents = selectedCampaign?.available_cents || 0

  // Calculate fees based on payment method
  const feePercentage = useMemo(() => {
    const methods = Array.isArray(paymentMethods) ? paymentMethods : []
    const method = methods.find((m) => m.id === selectedPaymentMethod)
    if (!method) return 0.02 // Default 2%

    switch (method.type) {
      case 'paypal':
        return 0.029 // 2.9%
      case 'bank':
        return 0.01 // 1%
      case 'wise':
        return 0.01 // 1%
      case 'venmo':
      case 'cashapp':
        return 0.02 // 2%
      case 'crypto':
        return 0.015 // 1.5%
      default:
        return 0.02
    }
  }, [selectedPaymentMethod, paymentMethods])

  const feeCents = Math.round(amountCents * feePercentage)
  const netPayoutCents = amountCents - feeCents

  const isValidAmount = amountCents >= minimumWithdrawal && amountCents <= campaignAvailableCents
  const canSubmit = isValidAmount && selectedPaymentMethod && selectedCampaignId && agreedToTerms && !isRequesting

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) return

    requestWithdrawal(
      {
        amount_cents: amountCents,
        payment_method_id: selectedPaymentMethod,
        campaign_id: selectedCampaignId,
        notes: notes || undefined
      },
      {
        onSuccess: () => {
          onSuccess()
        }
      }
    )
  }

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })
  }

  const formatProcessingTime = (methodType?: string) => {
    switch (methodType) {
      case 'paypal':
        return '1-2 business days'
      case 'bank':
        return '3-5 business days'
      case 'wise':
        return '1-2 business days'
      case 'venmo':
      case 'cashapp':
        return 'instant'
      case 'crypto':
        return '10-30 minutes'
      default:
        return 'varies'
    }
  }

  const selectedMethod = Array.isArray(paymentMethods) ? paymentMethods.find((m) => m.id === selectedPaymentMethod) : undefined

  return (
    <Modal isOpen={true} onClose={onClose}>
      <GlobalFont />
      <ModalContent>
        <Header>
          <HeaderText>
            <TitleIcon>
              <Wallet size={18} />
            </TitleIcon>
            <div>
              <Title>Request Payout</Title>
              <Subtitle>Withdraw your share-to-earn rewards</Subtitle>
            </div>
          </HeaderText>
          <CloseButton onClick={onClose}>
            <X />
          </CloseButton>
        </Header>

        {error && (
          <InfoBox $type="danger" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle />
            <div>
              <strong>Request Failed</strong>
              {typeof error === 'string' ? error : 'Please try again'}
            </div>
          </InfoBox>
        )}

        <BalanceCard style={{ marginBottom: '1.5rem' }}>
          <div>
            <BalanceLabel>Campaign Balance</BalanceLabel>
            {!selectedCampaignId ? (
              <BalanceEmpty>Select a campaign to see balance</BalanceEmpty>
            ) : (
              <BalanceValue>{formatCurrency(campaignAvailableCents)}</BalanceValue>
            )}
          </div>
          <BalanceIcon>
            <DollarSign size={18} />
          </BalanceIcon>
        </BalanceCard>

        <Form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div>
            <Label>
              Withdrawal Amount<span className="required">*</span>
            </Label>
            <AmountInputWrapper>
              <CurrencySymbol>$</CurrencySymbol>
              <AmountInputField
                type="number"
                step="0.01"
                min="5"
                max={selectedCampaignId ? (campaignAvailableCents / 100).toFixed(2) : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isRequesting || !selectedCampaignId}
              />
            </AmountInputWrapper>
            {!selectedCampaignId && (
              <HelpText $tone="warning">Select a campaign first</HelpText>
            )}
            {selectedCampaignId && amountCents > 0 && (
              <>
                {amountCents < minimumWithdrawal && (
                  <HelpText>Minimum withdrawal is {formatCurrency(minimumWithdrawal)}</HelpText>
                )}
                {amountCents > campaignAvailableCents && (
                  <HelpText $tone="warning">
                    Amount exceeds available balance in this campaign by {formatCurrency(amountCents - campaignAvailableCents)}
                  </HelpText>
                )}
              </>
            )}
          </div>

          {/* Payment Method Select */}
          <div>
            <Label>
              Pay To<span className="required">*</span>
            </Label>
            {methodsLoading && (
              <HelpText>Loading payment methods...</HelpText>
            )}
            {!methodsLoading && (!paymentMethods || paymentMethods.length === 0) && (
              <InfoBox $type="warning">
                <AlertCircle />
                <div>
                  <strong>No Payment Methods</strong>
                  Add a payment method first to request a withdrawal.
                </div>
              </InfoBox>
            )}
            {!methodsLoading && paymentMethods && paymentMethods.length > 0 && (
              <>
                <PaymentMethodSelect
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  disabled={isRequesting}
                >
                  <option value="">Select a payment method...</option>
                  {Array.isArray(paymentMethods) ? paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.displayName} ({method.type})
                    </option>
                  )) : null}
                </PaymentMethodSelect>

                {selectedPaymentMethod && selectedMethod && (
                  <HelpText>Processing time: {formatProcessingTime(selectedMethod.type)}</HelpText>
                )}
              </>
            )}
          </div>

          {/* Campaign Selection (Required) */}
          <div>
            <Label>
              Select Campaign<span className="required">*</span>
            </Label>
            {campaignsLoading && (
              <HelpText>
                <SpinIcon size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                Loading campaigns...
              </HelpText>
            )}
            {!campaignsLoading && campaignsError && (
              <InfoBox $type="danger">
                <AlertCircle />
                <div>{campaignsError}</div>
              </InfoBox>
            )}
            {!campaignsLoading && (!campaigns || campaigns.length === 0) && (
              <InfoBox $type="info">
                <AlertCircle />
                <div>No campaigns found with available balance to withdraw from.</div>
              </InfoBox>
            )}
            {!campaignsLoading && campaigns && campaigns.length > 0 && (
              <>
                <CampaignSelect
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  disabled={isRequesting}
                >
                  <option value="">Select a campaign...</option>
                  {campaigns
                    .filter(c => c.available_cents > 0)
                    .map((campaign) => (
                      <option key={campaign.id || campaign._id} value={campaign.id || campaign._id}>
                        {campaign.title} - {formatCurrency(campaign.available_cents)} available
                      </option>
                    ))}
                </CampaignSelect>

                {selectedCampaign && (
                  <CampaignBalanceBox>
                    <div className="label">Campaign Balance</div>
                    <div className="amount">{formatCurrency(selectedCampaign.available_cents)}</div>
                    <div className="details">
                      <div>
                        <span>Earned:</span>
                        <span className="value">{formatCurrency(selectedCampaign.earned_cents)}</span>
                      </div>
                      <div>
                        <span>Withdrawn:</span>
                        <span className="value">{formatCurrency(selectedCampaign.withdrawn_cents)}</span>
                      </div>
                      {selectedCampaign.reserved_cents > 0 && (
                        <div>
                          <span>Reserved:</span>
                          <span className="value">{formatCurrency(selectedCampaign.reserved_cents)}</span>
                        </div>
                      )}
                    </div>
                  </CampaignBalanceBox>
                )}
              </>
            )}
          </div>

          {/* Fee Breakdown */}
          {amountCents > 0 && isValidAmount && (
            <FeeBreakdown>
              <FeeRow>
                <span className="label">Withdrawal Amount:</span>
                <span className="value">{formatCurrency(amountCents)}</span>
              </FeeRow>
              <FeeRow>
                <span className="label">Processing Fee ({(feePercentage * 100).toFixed(1)}%):</span>
                <span className="value">-{formatCurrency(feeCents)}</span>
              </FeeRow>
              <FeeRow className="total">
                <span>You will receive:</span>
                <span>{formatCurrency(netPayoutCents)}</span>
              </FeeRow>
            </FeeBreakdown>
          )}

          {/* Notes Input */}
          <div>
            <Label>Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this withdrawal..."
              disabled={isRequesting}
            />
          </div>

          {/* Terms Agreement */}
          <AgreementLabel>
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              disabled={isRequesting}
            />
            <span>
              I agree that this withdrawal will be processed according to the payout schedule and payment terms. Funds
              may take 1-5 business days to arrive depending on the payment method.
            </span>
          </AgreementLabel>

          {/* Limits Info */}
          <LimitInfo>
            <strong>Withdrawal Limits</strong>
            <ul>
              <li>Daily maximum: $500</li>
              <li>Monthly maximum: $5,000</li>
              <li>Minimum withdrawal: $5</li>
            </ul>
          </LimitInfo>

          {/* Action Buttons */}
          <ButtonGroup>
            <GhostBtn type="button" onClick={onClose} disabled={isRequesting}>
              Cancel
            </GhostBtn>
            <PrimaryBtn
              type="submit"
              disabled={!canSubmit}
              title={(() => {
                if (!selectedCampaignId) return 'Select a campaign to withdraw from'
                if (!amountCents) return `Enter an amount between $5 and ${formatCurrency(campaignAvailableCents)}`
                if (!isValidAmount) return `Amount must be between $5 and ${formatCurrency(campaignAvailableCents)}`
                if (!selectedPaymentMethod) return 'Select a payment method'
                if (!agreedToTerms) return 'Check the agreement to proceed'
                return 'Ready to request payout'
              })()}
            >
              {isRequesting ? (
                <>
                  <SpinIcon size={16} />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign size={16} />
                  Request {formatCurrency(amountCents)}
                </>
              )}
            </PrimaryBtn>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </Modal>
  )
}

export default WithdrawalRequestModal
