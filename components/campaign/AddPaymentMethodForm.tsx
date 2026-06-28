'use client'

import React, { useState } from 'react'
import styled, { css, keyframes } from 'styled-components'
import {
  CreditCard, Building2, Smartphone,
  AlertCircle, ShieldCheck, ChevronDown, Star
} from 'lucide-react'

// ─── Design Tokens (shared with /dashboard) ──────────────────────────────────
const B = {
  yellow:      '#D4870A',
  yellowLight: '#FBF3E0',
  yellowMid:   '#F5C961',
  yellowDark:  '#A8680A',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
  blueDark:    '#0D4A8C',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  greenDark:   '#0F5132',
  navy:        '#18171A',
  pink:        '#C0392B',
  pinkLight:   '#FBE9E7',
  surface:     '#F7F5F1',
  border:      '#E2DDD6',
  borderFocus: '#1A5FA8',
  white:       '#FFFFFF',
  text:        '#18171A',
  textMuted:   '#8C8790',
  textLight:   '#A8A2AC',
  error:       '#C0392B',
  errorLight:  '#FBE9E7',
  errorBorder: '#E8A89F',
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type PaymentMethodType = 'stripe' | 'bank_transfer' | 'mobile_money'

export interface PaymentMethod {
  id?: string
  type: PaymentMethodType
  provider?: 'stripe' | 'plaid' | 'twilio' | 'manual'
  displayName?: string
  isPrimary?: boolean
  status?: string
  verificationStatus?: string
  stripe_token?: string
  card_brand?: 'visa' | 'mastercard' | 'amex' | 'discover'
  card_last_four?: string
  cardLastFour?: string
  card_expiry_month?: number
  card_expiry_year?: number
  bank_account_last_four?: string
  bankAccountLastFour?: string
  bank_account_holder?: string
  bankAccountHolder?: string
  bank_name?: string
  bankName?: string
  bank_account_type?: 'checking' | 'savings'
  bankAccountType?: 'checking' | 'savings'
  bank_account?: {
    account_holder: string
    account_number: string
    routing_number?: string
    bank_name?: string
    account_type?: 'checking' | 'savings'
  }
  mobile_number?: string
  mobileNumber?: string
  mobile_provider?: string
  mobileProvider?: string
}

interface AddPaymentMethodFormProps {
  onSubmit: (method: PaymentMethod) => void
  onCancel?: () => void
  isLoading?: boolean
  initialMethod?: PaymentMethod
  isEditing?: boolean
}

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ─── Form Shell ───────────────────────────────────────────────────────────────
const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

// ─── Type Selector ────────────────────────────────────────────────────────────
const TypeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.625rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
`

const TypeBtn = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  border-radius: 14px;
  border: 2px solid ${p => p.$active ? B.blue : B.border};
  background: ${p => p.$active ? B.blueLight : B.white};
  cursor: pointer;
  transition: all 0.18s ease;
  text-align: center;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${B.blue};
    background: ${B.blueLight};
  }

  &:active { transform: scale(0.97); }

  @media (max-width: 480px) {
    flex-direction: row;
    padding: 0.875rem 1rem;
    text-align: left;
  }
`

const TypeIconWrap = styled.div<{ $type: PaymentMethodType; $active: boolean }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.18s;

  background: ${p => p.$active
    ? ({ stripe: B.blue, bank_transfer: B.green, mobile_money: B.pink }[p.$type])
    : ({ stripe: B.blueLight, bank_transfer: B.greenLight, mobile_money: B.pinkLight }[p.$type])
  };
  color: ${p => p.$active
    ? B.white
    : ({ stripe: B.blue, bank_transfer: B.green, mobile_money: B.pink }[p.$type])
  };

  svg { width: 20px; height: 20px; }
`

const TypeLabel = styled.span<{ $active: boolean }>`
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  color: ${p => p.$active ? B.blueDark : B.text};
  line-height: 1.3;

  @media (max-width: 480px) { font-size: 0.875rem; }
`

const TypeDesc = styled.span`
  font-size: 0.7rem;
  color: ${B.textLight};
  @media (max-width: 480px) { display: none; }
`

const ActiveDot = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${B.blue};
`

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${B.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin: 0 0 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${B.border};
`

// ─── Field Group ──────────────────────────────────────────────────────────────
const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

const Label = styled.label`
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${B.text};
  display: flex;
  align-items: center;
  gap: 0.3rem;

  span.req { color: ${B.error}; }
`

const inputBase = css`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid ${B.border};
  border-radius: 10px;
  font-size: 0.925rem;
  color: ${B.text};
  background: ${B.white};
  transition: border-color 0.18s, box-shadow 0.18s;
  outline: none;
  font-family: inherit;
  appearance: none;

  &::placeholder { color: ${B.textLight}; }

  &:hover:not(:disabled) { border-color: #C9C3BB; }

  &:focus {
    border-color: ${B.blue};
    box-shadow: 0 0 0 3px rgba(26,95,168,0.15);
  }

  &:disabled {
    background: ${B.surface};
    color: ${B.textMuted};
    cursor: not-allowed;
  }
`

const Input = styled.input<{ $hasError?: boolean }>`
  ${inputBase}
  ${p => p.$hasError && css`
    border-color: ${B.error};
    &:focus { box-shadow: 0 0 0 3px rgba(192,57,43,0.12); }
  `}
`

const SelectWrap = styled.div`
  position: relative;

  svg.chevron {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: ${B.textMuted};
    pointer-events: none;
  }
`

const Select = styled.select<{ $hasError?: boolean }>`
  ${inputBase}
  padding-right: 2.5rem;
  cursor: pointer;
  ${p => p.$hasError && css`border-color: ${B.error};`}
`

const HelpText = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  color: ${B.textLight};
  margin: 0;
  line-height: 1.4;
`

const ErrorText = styled.p`
  font-size: 0.75rem;
  color: ${B.error};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  animation: ${fadeIn} 0.2s ease;

  svg { width: 13px; height: 13px; flex-shrink: 0; }
`

// ─── Grid Row ─────────────────────────────────────────────────────────────────
const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;

  @media (max-width: 560px) { grid-template-columns: 1fr; }
`

// ─── Info Banner ──────────────────────────────────────────────────────────────
const Banner = styled.div<{ $variant: 'info' | 'warning' | 'security' }>`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  animation: ${fadeIn} 0.25s ease;

  svg { width: 17px; height: 17px; flex-shrink: 0; margin-top: 1px; }

  ${p => p.$variant === 'info' && css`
    background: ${B.blueLight};
    border: 1px solid rgba(41,171,226,0.3);
    color: ${B.blueDark};
    svg { color: ${B.blue}; }
  `}
  ${p => p.$variant === 'warning' && css`
    background: ${B.yellowLight};
    border: 1px solid rgba(245,192,0,0.4);
    color: ${B.yellowDark};
    svg { color: ${B.yellow}; }
  `}
  ${p => p.$variant === 'security' && css`
    background: ${B.greenLight};
    border: 1px solid rgba(46,139,26,0.25);
    color: ${B.greenDark};
    svg { color: ${B.green}; }
  `}
`

const BannerText = styled.div`
  font-size: 0.82rem;
  line-height: 1.5;
  font-weight: 500;
  strong { font-weight: 700; }
`

// ─── Checkbox row ─────────────────────────────────────────────────────────────
const CheckRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  padding: 1rem;
  background: ${B.yellowLight};
  border: 1.5px solid ${B.yellow};
  border-radius: 12px;
  transition: background 0.15s;

  &:hover { background: ${B.yellowMid}; }
`

const CheckBox = styled.input`
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  accent-color: ${B.yellow};
  cursor: pointer;
`

const CheckMeta = styled.div``

const CheckTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${B.navy};
  margin: 0 0 0.15rem;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  svg { width: 14px; height: 14px; color: ${B.yellow}; }
`

const CheckSub = styled.p`
  font-size: 0.75rem;
  color: ${B.yellowDark};
  margin: 0;
  line-height: 1.4;
`

// ─── Actions ──────────────────────────────────────────────────────────────────
const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;

  @media (max-width: 480px) { flex-direction: column-reverse; }
`

const CancelBtn = styled.button`
  flex: 1;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  border: 1.5px solid ${B.border};
  background: ${B.white};
  color: ${B.textMuted};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;

  &:hover { border-color: #b0c4d8; color: ${B.text}; background: ${B.surface}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const SubmitBtn = styled.button`
  flex: 2;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: ${B.navy};
  color: ${B.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s, transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  &:hover:not(:disabled) { background: #242228; transform: translateY(-1px); }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { background: ${B.border}; color: ${B.textMuted}; cursor: not-allowed; }
`

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: ${B.white};
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.7s linear infinite;
  @keyframes spin { to { transform: rotate(360deg); } }
`

// ─── Config data ──────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  stripe:        { label: 'Card',         desc: 'Visa, Mastercard, Amex', Icon: CreditCard },
  bank_transfer: { label: 'Bank transfer', desc: 'Direct bank account',    Icon: Building2  },
  mobile_money:  { label: 'Mobile money', desc: 'Mobile wallet',           Icon: Smartphone },
} as const

// ─── Component ────────────────────────────────────────────────────────────────
export const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  initialMethod,
  isEditing = false,
}) => {
  const [selectedType, setSelectedType] = useState<PaymentMethodType>(
    initialMethod?.type || 'bank_transfer'
  )
  const [formData, setFormData] = useState<PaymentMethod>(() => {
    const base = initialMethod || { type: 'bank_transfer' as PaymentMethodType }
    if (base.type === 'bank_transfer' && !base.bank_account) {
      return {
        ...base,
        bank_account: { account_holder: '', account_number: '', routing_number: '', bank_name: '', account_type: 'checking' },
      }
    }
    return base
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const setField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const setBankField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bank_account: { ...prev.bank_account, [field]: value } as any,
    }))
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n })
  }

  const handleTypeChange = (type: PaymentMethodType) => {
    setSelectedType(type)
    setErrors({})
    setFormData(prev => {
      const next = { ...prev, type }
      if (type === 'bank_transfer' && !next.bank_account) {
        next.bank_account = { account_holder: '', account_number: '', routing_number: '', bank_name: '', account_type: 'checking' }
      }
      return next
    })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (selectedType === 'bank_transfer') {
      if (!formData.bank_account?.account_holder?.trim()) e.account_holder = 'Account holder name is required'
      if (!formData.bank_account?.account_number?.trim())  e.account_number = 'Account number is required'
      else if (!/^\d{1,17}$/.test(formData.bank_account.account_number)) e.account_number = 'Account number must be 1–17 digits'
      if (!formData.bank_account?.routing_number?.trim())  e.routing_number = 'Routing number is required'
      else if (!/^\d{9}$/.test(formData.bank_account.routing_number))    e.routing_number = 'Must be exactly 9 digits'
    }
    if (selectedType === 'mobile_money') {
      if (!formData.mobile_number?.trim()) e.mobile_number = 'Mobile number is required'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => { if (validate()) onSubmit({ ...formData, type: selectedType }) }

  return (
    <Form>

      {/* ── Type selector ── */}
      <div>
        <SectionLabel>Select method type</SectionLabel>
        <TypeGrid>
          {(Object.entries(TYPE_CONFIG) as [PaymentMethodType, typeof TYPE_CONFIG[PaymentMethodType]][]).map(([type, cfg]) => {
            const active = selectedType === type
            return (
              <TypeBtn key={type} $active={active} onClick={() => handleTypeChange(type)} type="button" aria-pressed={active}>
                {active && <ActiveDot />}
                <TypeIconWrap $type={type} $active={active}>
                  <cfg.Icon />
                </TypeIconWrap>
                <div>
                  <TypeLabel $active={active}>{cfg.label}</TypeLabel>
                  <br />
                  <TypeDesc>{cfg.desc}</TypeDesc>
                </div>
              </TypeBtn>
            )
          })}
        </TypeGrid>
      </div>

      {/* ── Stripe (coming soon) ── */}
      {selectedType === 'stripe' && (
        <Banner $variant="info">
          <AlertCircle />
          <BannerText>
            <strong>Card payments coming soon.</strong> Stripe integration is in progress.
            Please use Bank Transfer or Mobile Money for now.
          </BannerText>
        </Banner>
      )}

      {/* ── Bank Transfer fields ── */}
      {selectedType === 'bank_transfer' && (
        <>
          <div>
            <SectionLabel>Account details</SectionLabel>

            <FieldGroup style={{ marginBottom: '0.875rem' }}>
              <Label htmlFor="accountHolder">
                Account holder name <span className="req">*</span>
              </Label>
              <Input
                id="accountHolder"
                type="text"
                placeholder="Your full legal name"
                value={formData.bank_account?.account_holder || ''}
                onChange={e => setBankField('account_holder', e.target.value)}
                $hasError={!!errors.account_holder}
                disabled={isLoading}
                autoComplete="name"
              />
              {errors.account_holder
                ? <ErrorText><AlertCircle />{errors.account_holder}</ErrorText>
                : <HelpText>As it appears on your bank account</HelpText>
              }
            </FieldGroup>

            <GridRow>
              <FieldGroup>
                <Label htmlFor="routingNumber">
                  Routing number <span className="req">*</span>
                </Label>
                <Input
                  id="routingNumber"
                  type="text"
                  inputMode="numeric"
                  placeholder="123456789"
                  maxLength={9}
                  value={formData.bank_account?.routing_number || ''}
                  onChange={e => setBankField('routing_number', e.target.value.replace(/\D/g, '').slice(0, 9))}
                  $hasError={!!errors.routing_number}
                  disabled={isLoading}
                />
                {errors.routing_number
                  ? <ErrorText><AlertCircle />{errors.routing_number}</ErrorText>
                  : <HelpText>Exactly 9 digits</HelpText>
                }
              </FieldGroup>

              <FieldGroup>
                <Label htmlFor="accountNumber">
                  Account number <span className="req">*</span>
                </Label>
                <Input
                  id="accountNumber"
                  type="password"
                  inputMode="numeric"
                  placeholder="••••••••••"
                  maxLength={17}
                  value={formData.bank_account?.account_number || ''}
                  onChange={e => setBankField('account_number', e.target.value.replace(/\D/g, '').slice(0, 17))}
                  $hasError={!!errors.account_number}
                  disabled={isLoading}
                  autoComplete="off"
                />
                {errors.account_number
                  ? <ErrorText><AlertCircle />{errors.account_number}</ErrorText>
                  : <HelpText>Encrypted — never visible to others</HelpText>
                }
              </FieldGroup>
            </GridRow>
          </div>

          <GridRow>
            <FieldGroup>
              <Label htmlFor="bankName">Bank name</Label>
              <Input
                id="bankName"
                type="text"
                placeholder="e.g., Chase, GTBank"
                value={formData.bank_account?.bank_name || ''}
                onChange={e => setBankField('bank_name', e.target.value)}
                disabled={isLoading}
              />
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="accountType">Account type</Label>
              <SelectWrap>
                <Select
                  id="accountType"
                  value={formData.bank_account?.account_type || 'checking'}
                  onChange={e => setBankField('account_type', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </Select>
                <ChevronDown className="chevron" aria-hidden="true" />
              </SelectWrap>
            </FieldGroup>
          </GridRow>

          <Banner $variant="security">
            <ShieldCheck />
            <BannerText>
              <strong>Your details are safe.</strong> Your account and routing numbers are
              encrypted at rest (AES-256-GCM) and only ever shown to the campaign creator who
              pays you — never to other supporters.
            </BannerText>
          </Banner>
        </>
      )}

      {/* ── Mobile Money fields ── */}
      {selectedType === 'mobile_money' && (
        <>
          <div>
            <SectionLabel>Mobile wallet details</SectionLabel>

            <FieldGroup style={{ marginBottom: '0.875rem' }}>
              <Label htmlFor="mobileNumber">
                Mobile number <span className="req">*</span>
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="+234 800 000 0000"
                value={formData.mobile_number || ''}
                onChange={e => setField('mobile_number', e.target.value)}
                $hasError={!!errors.mobile_number}
                disabled={isLoading}
                autoComplete="tel"
              />
              {errors.mobile_number
                ? <ErrorText><AlertCircle />{errors.mobile_number}</ErrorText>
                : <HelpText>Include country code, e.g. +234 for Nigeria</HelpText>
              }
            </FieldGroup>

            <FieldGroup>
              <Label htmlFor="mobileProvider">Mobile money provider</Label>
              <SelectWrap>
                <Select
                  id="mobileProvider"
                  value={formData.mobile_provider || ''}
                  onChange={e => setField('mobile_provider', e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select a provider…</option>
                  <option value="mpesa">M-Pesa (Kenya)</option>
                  <option value="mtn">MTN Mobile Money (Africa)</option>
                  <option value="airtel">Airtel Money (Africa)</option>
                  <option value="vodafone">Vodafone Cash (Ghana)</option>
                  <option value="opay">OPay (Nigeria)</option>
                  <option value="palmpay">PalmPay (Nigeria)</option>
                  <option value="other">Other</option>
                </Select>
                <ChevronDown className="chevron" aria-hidden="true" />
              </SelectWrap>
            </FieldGroup>
          </div>

          <Banner $variant="security">
            <ShieldCheck />
            <BannerText>
              <strong>Used only for payouts.</strong> Your mobile wallet details are stored
              securely and shared only with the campaign creator who pays you.
            </BannerText>
          </Banner>
        </>
      )}

      {/* ── Primary checkbox ── */}
      <CheckRow>
        <CheckBox
          type="checkbox"
          checked={formData.isPrimary || false}
          onChange={e => setField('isPrimary', e.target.checked)}
          disabled={isLoading}
          id="setPrimary"
        />
        <CheckMeta>
          <CheckTitle htmlFor="setPrimary" as="label">
            <Star /> Set as primary method
          </CheckTitle>
          <CheckSub>
            We&apos;ll preselect this method when you request a payout. You can change it anytime.
          </CheckSub>
        </CheckMeta>
      </CheckRow>

      {/* ── Actions ── */}
      <Actions>
        {onCancel && (
          <CancelBtn type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </CancelBtn>
        )}
        <SubmitBtn type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? <><Spinner /> Saving…</> : isEditing ? 'Save changes' : 'Add payout method'}
        </SubmitBtn>
      </Actions>

    </Form>
  )
}