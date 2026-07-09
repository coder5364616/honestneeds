'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import styled, { keyframes, css } from 'styled-components'
import {
  Trash2, Plus, AlertCircle, ChevronDown,
  Building2, Bitcoin, Wallet, Mail, Lock, Info,
  CheckCircle2, DollarSign, AtSign
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentMethod {
  type: string
  username?: string
  email?: string
  cashtag?: string
  routingNumber?: string
  accountNumber?: string
  cryptoType?: string
  walletAddress?: string
  details?: string
}

interface PaymentMethodsManagerProps {
  methods: PaymentMethod[]
  onChange: (methods: PaymentMethod[]) => void
  maxMethods?: number
  error?: string
  helperText?: string
  title?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_TYPES = [
  { id: 'venmo',         name: 'Venmo' },
  { id: 'paypal',        name: 'PayPal' },
  { id: 'cashapp',       name: 'Cash App' },
  { id: 'bank_transfer', name: 'Bank Transfer' },
  { id: 'crypto',        name: 'Crypto' },
  { id: 'other',         name: 'Other' },
]

const CRYPTO_TYPES = [
  { id: 'btc',   name: 'Bitcoin',  symbol: 'BTC' },
  { id: 'eth',   name: 'Ethereum', symbol: 'ETH' },
  { id: 'usdc',  name: 'USD Coin', symbol: 'USDC' },
  { id: 'sol',   name: 'Solana',   symbol: 'SOL' },
  { id: 'matic', name: 'Polygon',  symbol: 'MATIC' },
]

const TYPE_META: Record<string, { accent: string; bg: string; iconBg: string }> = {
  venmo:   { accent: '#0F6E56', bg: '#E1F5EE', iconBg: '#9FE1CB' },
  paypal:  { accent: '#185FA5', bg: '#E6F1FB', iconBg: '#B5D4F4' },
  cashapp: { accent: '#3B6D11', bg: '#EAF3DE', iconBg: '#C0DD97' },
  bank_transfer: { accent: '#5F5E5A', bg: '#F1EFE8', iconBg: '#D3D1C7' },
  crypto:  { accent: '#854F0B', bg: '#FAEEDA', iconBg: '#FAC775' },
  other:   { accent: '#993C1D', bg: '#FAECE7', iconBg: '#F5C4B3' },
}

// ─── Animations ───────────────────────────────────────────────────────────────

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

// ─── Styled Components ────────────────────────────────────────────────────────

const Shell = styled.div`
  font-family: 'DM Sans', system-ui, sans-serif;
  max-width: 640px;
  width: 100%;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
`

const HeaderLeft = styled.div``

const Title = styled.h3`
  font-family: 'Syne', 'DM Sans', system-ui, sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
  margin: 0 0 0.25rem;
  line-height: 1.2;
`

const Subtitle = styled.p`
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
`

const CounterPill = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  background: #FAEEDA;
  border: 0.5px solid #FAC775;
  border-radius: 20px;
  padding: 0.3rem 0.75rem;
  flex-shrink: 0;
  animation: ${fadeIn} 0.2s ease;
`

const CounterNum = styled.span`
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #854F0B;
`

const CounterLabel = styled.span`
  font-size: 0.75rem;
  color: #BA7517;
`

const ErrorBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #FCEBEB;
  border: 0.5px solid #F7C1C1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.8125rem;
  color: #A32D2D;
  animation: ${slideDown} 0.2s ease;

  svg { flex-shrink: 0; margin-top: 1px; }
`

const MethodList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

const MethodCard = styled.div<{ $accent: string }>`
  background: #ffffff;
  border: 1px solid ${({ $accent }) => $accent}40;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  animation: ${slideDown} 0.22s ease;

  &:hover {
    border-color: ${({ $accent }) => $accent}80;
    box-shadow: 0 2px 8px ${({ $accent }) => $accent}15;
  }
`

const CardHeader = styled.div<{ $bg: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: ${({ $bg }) => $bg};
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
  gap: 0.75rem;
`

const TypeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
`

const TypeIconBox = styled.div<{ $accent: string; $iconBg: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $iconBg }) => $iconBg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ $accent }) => $accent};
`

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  position: relative;
`

const TypeSelect = styled.select`
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0f172a;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  flex: 1;
  min-width: 0;

  &:focus { text-decoration: underline; }
`

const ChevronIcon = styled(ChevronDown)`
  flex-shrink: 0;
  color: #94a3b8;
  pointer-events: none;
`

const RemoveButton = styled.button`
  background: none;
  border: 0.5px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  color: #64748b;
  padding: 0.375rem 0.625rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-weight: 500;
  transition: all 0.15s;
  flex-shrink: 0;
  white-space: nowrap;

  &:hover {
    background: #FCEBEB;
    border-color: #F7C1C1;
    color: #A32D2D;
  }

  &:focus-visible {
    outline: 2px solid #A32D2D;
    outline-offset: 2px;
  }
`

const CardBody = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

const FieldLabel = styled.label`
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #64748b;
`

const FieldInner = styled.div<{ $focused?: boolean }>`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 0.5px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;

  ${({ $focused }) => $focused && css`
    border-color: #1D9E75;
    border-width: 1px;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.1);
  `}

  &:focus-within {
    border-color: #1D9E75;
    border-width: 1px;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(29, 158, 117, 0.1);
  }
`

const FieldPrefix = styled.span`
  padding: 0 0.625rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #64748b;
  border-right: 0.5px solid #e2e8f0;
  background: #f1f5f9;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
  font-family: 'Syne', system-ui, sans-serif;
`

const FieldIconPrefix = styled.div`
  padding: 0 0.625rem;
  border-right: 0.5px solid #e2e8f0;
  background: #f1f5f9;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
  color: #64748b;
`

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0.625rem 0.75rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9375rem;
  color: #0f172a;
  outline: none;

  &::placeholder { color: #cbd5e1; }
`

const MonoInput = styled(Input)`
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 0.8125rem;
  letter-spacing: 0.02em;
`

const StyledSelect = styled.select`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0.625rem 2.25rem 0.625rem 0.75rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9375rem;
  color: #0f172a;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
`

const Textarea = styled.textarea`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0.625rem 0.75rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9375rem;
  color: #0f172a;
  outline: none;
  resize: vertical;
  min-height: 88px;
  line-height: 1.6;
  width: 100%;
`

const Hint = styled.p`
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: flex-start;
  gap: 5px;
  line-height: 1.5;
  margin: 0;

  svg { flex-shrink: 0; margin-top: 1px; }
`

const AddZone = styled.button`
  width: 100%;
  border: 1.5px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1D9E75;
    background: #E1F5EE;
  }

  &:hover .add-icon {
    background: #1D9E75;
    color: #ffffff;
  }

  &:hover .add-label {
    color: #0F6E56;
  }

  &:focus-visible {
    outline: 2px solid #1D9E75;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const AddIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e2e8f0;
  border: 0.5px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  transition: all 0.2s;
  margin-bottom: 0.125rem;
`

const AddLabel = styled.span`
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  transition: color 0.2s;
`

const AddSub = styled.span`
  font-size: 0.75rem;
  color: #94a3b8;
`

const MaxBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0.75rem 1rem;
  background: #E1F5EE;
  border: 0.5px solid #9FE1CB;
  border-radius: 8px;
  font-size: 0.8125rem;
  color: #085041;
  font-weight: 500;
  animation: ${fadeIn} 0.2s ease;
`

// ─── TypeIcon ─────────────────────────────────────────────────────────────────

function TypeIcon({ type }: { type: string }) {
  const size = 15
  switch (type) {
    case 'venmo':   return <Wallet size={size} />
    case 'paypal':  return <Mail size={size} />
    case 'cashapp': return <DollarSign size={size} />
    case 'bank_transfer': return <Building2 size={size} />
    case 'crypto':  return <Bitcoin size={size} />
    default:        return <AtSign size={size} />
  }
}

// ─── PaymentMethodFields ──────────────────────────────────────────────────────

interface FieldsProps {
  method: PaymentMethod
  index: number
  onUpdate: (index: number, updates: Partial<PaymentMethod>) => void
}

const PaymentMethodFields: React.FC<FieldsProps> = ({ method, index, onUpdate }) => {
  switch (method.type) {
    case 'venmo':
      return (
        <Field>
          <FieldLabel htmlFor={`venmo-${index}`}>Username</FieldLabel>
          <FieldInner>
            <FieldPrefix>@</FieldPrefix>
            <Input
              id={`venmo-${index}`}
              type="text"
              value={method.username ?? ''}
              onChange={(e) => onUpdate(index, { username: e.target.value })}
              placeholder="your_username"
            />
          </FieldInner>
          <Hint>
            <Info size={12} />
            Find your username in the Venmo app under your profile.
          </Hint>
        </Field>
      )

    case 'paypal':
      return (
        <Field>
          <FieldLabel htmlFor={`paypal-${index}`}>PayPal Email</FieldLabel>
          <FieldInner>
            <FieldIconPrefix><Mail size={15} /></FieldIconPrefix>
            <Input
              id={`paypal-${index}`}
              type="email"
              value={method.email ?? ''}
              onChange={(e) => onUpdate(index, { email: e.target.value })}
              placeholder="you@email.com"
            />
          </FieldInner>
        </Field>
      )

    case 'cashapp':
      return (
        <Field>
          <FieldLabel htmlFor={`cashapp-${index}`}>$Cashtag</FieldLabel>
          <FieldInner>
            <FieldPrefix>$</FieldPrefix>
            <Input
              id={`cashapp-${index}`}
              type="text"
              value={method.cashtag ?? ''}
              onChange={(e) => onUpdate(index, { cashtag: e.target.value })}
              placeholder="yourcashtag"
            />
          </FieldInner>
        </Field>
      )

    case 'bank_transfer':
      return (
        <>
          <FieldGrid>
            <Field>
              <FieldLabel htmlFor={`bank-route-${index}`}>Routing number</FieldLabel>
              <FieldInner>
                <Input
                  id={`bank-route-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={method.routingNumber ?? ''}
                  onChange={(e) => onUpdate(index, { routingNumber: e.target.value })}
                  placeholder="9 digits"
                />
              </FieldInner>
            </Field>
            <Field>
              <FieldLabel htmlFor={`bank-acc-${index}`}>Account number</FieldLabel>
              <FieldInner>
                <Input
                  id={`bank-acc-${index}`}
                  type="text"
                  inputMode="numeric"
                  value={method.accountNumber ?? ''}
                  onChange={(e) => onUpdate(index, { accountNumber: e.target.value })}
                  placeholder="Your account #"
                />
              </FieldInner>
            </Field>
          </FieldGrid>
          <Hint>
            <Lock size={12} />
            Your banking details are encrypted and never shared publicly.
          </Hint>
        </>
      )

    case 'crypto':
      return (
        <>
          <Field>
            <FieldLabel htmlFor={`crypto-type-${index}`}>Cryptocurrency</FieldLabel>
            <FieldInner>
              <FieldIconPrefix><Bitcoin size={15} /></FieldIconPrefix>
              <StyledSelect
                id={`crypto-type-${index}`}
                value={method.cryptoType ?? ''}
                onChange={(e) => onUpdate(index, { cryptoType: e.target.value })}
              >
                <option value="">Select a coin…</option>
                {CRYPTO_TYPES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </StyledSelect>
            </FieldInner>
          </Field>
          <Field>
            <FieldLabel htmlFor={`crypto-addr-${index}`}>Wallet address</FieldLabel>
            <FieldInner>
              <MonoInput
                id={`crypto-addr-${index}`}
                type="text"
                value={method.walletAddress ?? ''}
                onChange={(e) => onUpdate(index, { walletAddress: e.target.value })}
                placeholder="0x… or your address"
              />
            </FieldInner>
          </Field>
        </>
      )

    case 'other':
      return (
        <Field>
          <FieldLabel htmlFor={`other-${index}`}>Payment instructions</FieldLabel>
          <FieldInner style={{ alignItems: 'flex-start' }}>
            <Textarea
              id={`other-${index}`}
              value={method.details ?? ''}
              onChange={(e) => onUpdate(index, { details: e.target.value })}
              placeholder="Describe how supporters should pay you — include any relevant links, handles, or steps…"
            />
          </FieldInner>
        </Field>
      )

    default:
      return null
  }
}

// ─── PaymentMethodsManager ────────────────────────────────────────────────────

export const PaymentMethodsManager: React.FC<PaymentMethodsManagerProps> = ({
  methods = [],
  onChange,
  maxMethods = 6,
  error,
  helperText,
  title = 'Payment Methods',
}) => {
  const canAddMore = methods.length < maxMethods
  const newCardRef = useRef<HTMLDivElement | null>(null)

  const handleAdd = useCallback(() => {
    if (canAddMore) {
      onChange([...methods, { type: 'venmo', username: '' }])
    }
  }, [methods, onChange, canAddMore])

  const handleRemove = useCallback(
    (index: number) => {
      onChange(methods.filter((_, i) => i !== index))
    },
    [methods, onChange]
  )

  const handleUpdate = useCallback(
    (index: number, updates: Partial<PaymentMethod>) => {
      const updated = [...methods]
      updated[index] = { ...updated[index], ...updates }
      onChange(updated)
    },
    [methods, onChange]
  )

  const handleTypeChange = useCallback(
    (index: number, newType: string) => {
      const updated = [...methods]
      updated[index] = { type: newType }
      onChange(updated)
    },
    [methods, onChange]
  )

  // Scroll new card into view
  useEffect(() => {
    if (newCardRef.current) {
      newCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      newCardRef.current = null
    }
  })

  return (
    <Shell>
      {/* Header */}
      <Header>
        <HeaderLeft>
          <Title>{title}</Title>
          <Subtitle>
            {helperText ?? 'How should supporters send you money?'}
          </Subtitle>
        </HeaderLeft>
        {methods.length > 0 && (
          <CounterPill aria-label={`${methods.length} of ${maxMethods} methods added`}>
            <CounterNum>{methods.length}</CounterNum>
            <CounterLabel>/ {maxMethods}</CounterLabel>
          </CounterPill>
        )}
      </Header>

      {/* Error */}
      {error && (
        <ErrorBanner role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </ErrorBanner>
      )}

      {/* Method cards */}
      {methods.length > 0 && (
        <MethodList>
          {methods.map((method, index) => {
            const meta = TYPE_META[method.type] ?? TYPE_META.other
            const isLast = index === methods.length - 1

            return (
              <MethodCard
                key={index}
                $accent={meta.accent}
                ref={isLast ? (el) => { newCardRef.current = el } : undefined}
              >
                <CardHeader $bg={meta.bg}>
                  <TypeRow>
                    <TypeIconBox $accent={meta.accent} $iconBg={meta.iconBg} aria-hidden="true">
                      <TypeIcon type={method.type} />
                    </TypeIconBox>
                    <SelectWrapper>
                      <TypeSelect
                        value={method.type}
                        onChange={(e) => handleTypeChange(index, e.target.value)}
                        aria-label="Payment method type"
                      >
                        {PAYMENT_METHOD_TYPES.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </TypeSelect>
                      <ChevronIcon size={13} aria-hidden="true" />
                    </SelectWrapper>
                  </TypeRow>

                  <RemoveButton
                    type="button"
                    onClick={() => handleRemove(index)}
                    aria-label={`Remove ${PAYMENT_METHOD_TYPES.find(t => t.id === method.type)?.name ?? 'payment'} method`}
                  >
                    <Trash2 size={13} />
                    Remove
                  </RemoveButton>
                </CardHeader>

                <CardBody>
                  <PaymentMethodFields
                    method={method}
                    index={index}
                    onUpdate={handleUpdate}
                  />
                </CardBody>
              </MethodCard>
            )
          })}
        </MethodList>
      )}

      {/* Add zone */}
      {canAddMore ? (
        <AddZone
          type="button"
          onClick={handleAdd}
          aria-label={`Add payment method (${methods.length} of ${maxMethods} used)`}
        >
          <AddIcon className="add-icon">
            <Plus size={18} />
          </AddIcon>
          <AddLabel className="add-label">Add Payment Method</AddLabel>
          <AddSub>Venmo, PayPal, Bank, Crypto &amp; more</AddSub>
        </AddZone>
      ) : (
        <MaxBadge role="status">
          <CheckCircle2 size={16} color="#1D9E75" />
          All {maxMethods} payment methods added — you&apos;re all set
        </MaxBadge>
      )}
    </Shell>
  )
}

export default PaymentMethodsManager