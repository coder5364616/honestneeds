'use client'

import React, { useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Star, CreditCard, Building2, Smartphone, Copy, Check, Plus, Pencil, Trash2, Shield } from 'lucide-react'
import { PaymentMethod, PaymentMethodType } from './AddPaymentMethodForm'
import Button from '@/components/ui/Button'

// ─── Design Tokens (shared with /dashboard) ──────────────────────────────────
const BRAND = {
  yellow:      '#D4870A',
  yellowLight: '#FBF3E0',
  yellowDark:  '#A8680A',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
  blueDark:    '#0D4A8C',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  navy:        '#18171A',
  pink:        '#C0392B',
  pinkLight:   '#FBE9E7',
  surface:     '#EEEBe5',
  border:      '#E2DDD6',
  text:        '#18171A',
  textMuted:   '#8C8790',
  white:       '#FFFFFF',
}

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,192,0,0.3); }
  50%       { box-shadow: 0 0 0 6px rgba(245,192,0,0); }
`

// ─── Layout ──────────────────────────────────────────────────────────────────
const Container = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  animation: ${fadeIn} 0.3s ease;
`

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const SectionTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${BRAND.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span.count {
    font-family: 'DM Mono', monospace;
    background: ${BRAND.blueLight};
    color: ${BRAND.blue};
    font-size: 0.7rem;
    font-weight: 500;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
  }
`

// ─── Add Button ───────────────────────────────────────────────────────────────
const AddBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: ${BRAND.navy};
  color: ${BRAND.white};
  border: none;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.15s ease;
  white-space: nowrap;

  svg { width: 16px; height: 16px; }

  &:hover:not(:disabled) {
    background: #242228;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) { transform: translateY(0); }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 0.75rem;
  }
`

// ─── Grid ─────────────────────────────────────────────────────────────────────
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(288px, 1fr));
  gap: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

// ─── Method Card ─────────────────────────────────────────────────────────────
const Card = styled.article<{ $isPrimary: boolean }>`
  position: relative;
  background: ${BRAND.white};
  border: 1px solid ${p => p.$isPrimary ? BRAND.yellow : BRAND.border};
  border-radius: 14px;
  padding: 1.25rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  overflow: visible;

  ${p => p.$isPrimary && css`
    animation: ${pulse} 2.5s ease-in-out;
  `}

  &:hover {
    border-color: ${p => p.$isPrimary ? BRAND.yellow : BRAND.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
  }
`

const PrimaryBadge = styled.div`
  position: absolute;
  top: -11px;
  left: 1.25rem;
  background: ${BRAND.yellow};
  color: ${BRAND.navy};
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  box-shadow: 0 2px 6px rgba(245,192,0,0.35);

  svg { width: 10px; height: 10px; }
`

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  margin-bottom: 1rem;
`

const IconWrap = styled.div<{ $type: PaymentMethodType }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  background: ${p => ({
    stripe:        BRAND.blueLight,
    bank_transfer: BRAND.greenLight,
    mobile_money:  BRAND.pinkLight,
  }[p.$type] ?? BRAND.surface)};

  color: ${p => ({
    stripe:        BRAND.blue,
    bank_transfer: BRAND.green,
    mobile_money:  BRAND.pink,
  }[p.$type] ?? BRAND.textMuted)};

  svg { width: 22px; height: 22px; }
`

const CardMeta = styled.div`
  flex: 1;
  min-width: 0;
`

const CardTitle = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${BRAND.text};
  margin: 0 0 0.2rem;
`

const CardSub = styled.p`
  font-size: 0.78rem;
  color: ${BRAND.textMuted};
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

// ─── Detail chip ──────────────────────────────────────────────────────────────
const DetailChip = styled.div`
  background: ${BRAND.surface};
  border: 1px solid ${BRAND.border};
  border-radius: 10px;
  padding: 0.625rem 0.875rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

const DetailInner = styled.div``

const DetailLabel = styled.p`
  font-size: 0.7rem;
  color: ${BRAND.textMuted};
  margin: 0 0 0.15rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
`

const DetailValue = styled.p`
  font-size: 0.85rem;
  color: ${BRAND.text};
  margin: 0;
  font-family: 'DM Mono', monospace;
  font-weight: 500;
`

const CopyBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${BRAND.textMuted};
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.15s, background 0.15s;

  svg { width: 15px; height: 15px; }

  &:hover { color: ${BRAND.blue}; background: ${BRAND.blueLight}; }
`

// ─── Card Actions ─────────────────────────────────────────────────────────────
const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

const ActionBtn = styled.button<{ $variant?: 'danger' | 'primary' | 'ghost' }>`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.75rem;
  border-radius: 9px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid transparent;
  transition: all 0.15s ease;

  svg { width: 14px; height: 14px; }

  ${p => p.$variant === 'danger' ? css`
    background: ${BRAND.pinkLight};
    color: ${BRAND.pink};
    border-color: transparent;
    &:hover { background: #fbd0e5; border-color: ${BRAND.pink}; }
  ` : p.$variant === 'primary' ? css`
    background: ${BRAND.blueLight};
    color: ${BRAND.blue};
    border-color: transparent;
    &:hover { background: #c8ecf9; border-color: ${BRAND.blue}; }
  ` : css`
    background: ${BRAND.yellowLight};
    color: ${BRAND.yellowDark};
    border-color: transparent;
    &:hover { background: #faebb0; border-color: ${BRAND.yellow}; }
  `}
`

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyWrap = styled.div`
  text-align: center;
  padding: 3.5rem 1.5rem;
  border: 1.5px dashed ${BRAND.border};
  border-radius: 16px;
  background: ${BRAND.white};
`

const EmptyIconRing = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${BRAND.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: ${BRAND.textMuted};

  svg { width: 26px; height: 26px; }
`

const EmptyTitle = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${BRAND.text};
  margin: 0 0 0.35rem;
`

const EmptyText = styled.p`
  font-size: 0.875rem;
  color: ${BRAND.textMuted};
  margin: 0 0 1.5rem;
  line-height: 1.55;
`

// ─── Security Note ────────────────────────────────────────────────────────────
const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${BRAND.greenLight};
  border-radius: 10px;
  margin-top: 0.25rem;

  svg { width: 16px; height: 16px; color: ${BRAND.green}; flex-shrink: 0; }

  p {
    font-size: 0.78rem;
    color: ${BRAND.green};
    margin: 0;
    font-weight: 500;
    line-height: 1.45;
  }
`

// ─── Type maps ────────────────────────────────────────────────────────────────
const methodLabels: Record<PaymentMethodType, string> = {
  stripe:        'Credit / Debit Card',
  bank_transfer: 'Bank Transfer',
  mobile_money:  'Mobile Money',
}

const MethodIcon: React.FC<{ type: PaymentMethodType }> = ({ type }) => {
  const icons = {
    stripe:        <CreditCard />,
    bank_transfer: <Building2 />,
    mobile_money:  <Smartphone />,
  }
  return <IconWrap $type={type}>{icons[type] ?? <CreditCard />}</IconWrap>
}

const getDetail = (m: PaymentMethod) => {
  switch (m.type) {
    case 'stripe':
      return { label: 'Card number', value: m.card_last_four ? `•••• •••• •••• ${m.card_last_four}` : '••••' }
    case 'bank_transfer':
      return { label: 'Account holder', value: m.bank_account?.account_holder || 'Bank Account' }
    case 'mobile_money':
      return { label: 'Mobile number', value: m.mobile_number || '•••• ••••' }
    default:
      return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
interface PaymentMethodManagerProps {
  methods: PaymentMethod[]
  onAdd: () => void
  onEdit: (method: PaymentMethod) => void
  onDelete: (methodId: string) => void
  onSetPrimary: (methodId: string) => void
  isLoading?: boolean
}

export const PaymentMethodManager: React.FC<PaymentMethodManagerProps> = ({
  methods,
  onAdd,
  onEdit,
  onDelete,
  onSetPrimary,
  isLoading = false,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const methodsList = Array.isArray(methods) ? methods : []

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (methodsList.length === 0) {
    return (
      <Container>
        <EmptyWrap>
          <EmptyIconRing><CreditCard /></EmptyIconRing>
          <EmptyTitle>No payout methods yet</EmptyTitle>
          <EmptyText>
            Add a card, bank account, or mobile money number to<br />
            start receiving payouts from your campaigns.
          </EmptyText>
          <AddBtn onClick={onAdd} disabled={isLoading}>
            <Plus /> Add payout method
          </AddBtn>
        </EmptyWrap>

        <SecurityNote>
          <Shield />
          <p>Your payment details are encrypted end-to-end and never shared with third parties.</p>
        </SecurityNote>
      </Container>
    )
  }

  const primaryMethod = methodsList.find(m => m.isPrimary)

  return (
    <Container>
      <SectionHeader>
        <SectionTitle>
          Payout methods
          <span className="count">{methodsList.length}</span>
        </SectionTitle>
        <AddBtn onClick={onAdd} disabled={isLoading}>
          <Plus /> Add payout method
        </AddBtn>
      </SectionHeader>

      <Grid>
        {methodsList.map((method, index) => {
          const detail    = getDetail(method)
          const methodId  = method.id || `method-${index}`
          const isPrimary = method.isPrimary || methodId === primaryMethod?.id

          return (
            <Card key={methodId} $isPrimary={isPrimary}>
              {isPrimary && (
                <PrimaryBadge>
                  <Star /> Primary
                </PrimaryBadge>
              )}

              <CardTop>
                <MethodIcon type={method.type} />
                <CardMeta>
                  <CardTitle>{methodLabels[method.type] || 'Payment method'}</CardTitle>
                  <CardSub>{method.displayName || methodLabels[method.type]}</CardSub>
                </CardMeta>
              </CardTop>

              {detail && (
                <DetailChip>
                  <DetailInner>
                    <DetailLabel>{detail.label}</DetailLabel>
                    <DetailValue>{detail.value}</DetailValue>
                  </DetailInner>
                  <CopyBtn
                    onClick={() => handleCopy(detail.value, methodId)}
                    title="Copy to clipboard"
                    aria-label="Copy value"
                  >
                    {copiedId === methodId ? <Check /> : <Copy />}
                  </CopyBtn>
                </DetailChip>
              )}

              <CardActions>
                {!isPrimary && (
                  <ActionBtn $variant="ghost" onClick={() => onSetPrimary(methodId)}>
                    <Star /> Set primary
                  </ActionBtn>
                )}
                <ActionBtn $variant="primary" onClick={() => onEdit(method)}>
                  <Pencil /> Edit
                </ActionBtn>
                <ActionBtn $variant="danger" onClick={() => onDelete(methodId)}>
                  <Trash2 /> Remove
                </ActionBtn>
              </CardActions>
            </Card>
          )
        })}
      </Grid>

      <SecurityNote>
        <Shield />
        <p>All payment information is encrypted and secured. Your data is never shared with third parties.</p>
      </SecurityNote>
    </Container>
  )
}