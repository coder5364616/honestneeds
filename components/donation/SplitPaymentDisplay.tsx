'use client'

import styled from 'styled-components'
import { QRCodeCanvas } from 'qrcode.react'
import { AlertCircle } from 'lucide-react'
import { type DonationPaymentMethod, DONATION_FEE_PERCENT } from '@/utils/validationSchemas'

interface SplitPaymentDisplayProps {
  creatorPaymentMethod: DonationPaymentMethod
  creatorAmount: number // in cents
  platformAmount: number // in cents
  totalAmount: number // in cents
  creatorName?: string
  campaignName?: string
  currency?: string
}

// ============================================================
// STYLED COMPONENTS
// ============================================================

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const PaymentBoxContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const PaymentBox = styled.div<{ isPrimary?: boolean }>`
  border: 2px solid ${(props) => (props.isPrimary ? '#10b981' : '#cbd5e1')};
  border-radius: 0.75rem;
  padding: 1.5rem;
  background-color: ${(props) => (props.isPrimary ? '#f0fdf4' : '#f8fafc')};
  position: relative;
  transition: all 0.2s ease;

  ${(props) =>
    props.isPrimary &&
    `
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  `}

  &:hover {
    border-color: ${(props) => (props.isPrimary ? '#059669' : '#94a3b8')};
  }
`

const Badge = styled.div<{ type: 'primary' | 'secondary' }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  
  ${(props) =>
    props.type === 'primary'
      ? 'background-color: #d1fae5; color: #065f46;'
      : 'background-color: #e2e8f0; color: #334155;'
  }
`

const BoxTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
`

const AmountDisplay = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 1rem;
  line-height: 1;
`

const MethodInfo = styled.div`
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`

const InfoLabel = styled.span`
  color: #64748b;
  font-weight: 500;
`

const InfoValue = styled.span`
  color: #0f172a;
  font-weight: 600;
  word-break: break-all;
  text-align: right;
  flex: 0 1 auto;
  margin-left: 0.75rem;
`

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`

const QRLabel = styled.p`
  font-size: 0.75rem;
  color: #64748b;
  margin: 0.5rem 0 0 0;
  text-align: center;
  font-weight: 500;
`

const Instructions = styled.div`
  font-size: 0.875rem;
  color: #475569;
  line-height: 1.6;
  padding: 0.75rem;
  background-color: #f1f5f9;
  border-left: 3px solid #6366f1;
  border-radius: 0.25rem;

  strong {
    display: block;
    margin-bottom: 0.25rem;
    color: #0f172a;
  }
`

const SummaryBox = styled(PaymentBox)`
  border: 2px solid #cbd5e1 !important;
  background-color: #f8fafc !important;
  margin-top: 1rem;
`

const WarningBox = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #92400e;
  line-height: 1.5;
`

const WarningIcon = styled(AlertCircle)`
  flex-shrink: 0;
  margin-top: 0.125rem;
`

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatCurrency = (cents: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

const getMethodDisplay = (method: DonationPaymentMethod) => {
  switch (method.type) {
    case 'venmo':
      return {
        display: 'Venmo',
        handle: `@${method.username}`,
        icon: '💳',
        qrData: `https://venmo.com/transfer?txn=pay&recipients=${method.username}`,
      }
    case 'paypal':
      return {
        display: 'PayPal',
        handle: method.email || 'N/A',
        icon: '💳',
        qrData: `https://paypal.me/${method.email?.split('@')[0]}`,
      }
    case 'cashapp':
      return {
        display: 'Cash App',
        handle: `$${method.cashtag}`,
        icon: '💳',
        qrData: `https://cash.app/${method.cashtag}`,
      }
    case 'bank':
      return {
        display: 'Bank Transfer',
        handle: `Routing: ${method.routingNumber}`,
        icon: '🏦',
        qrData: '',
      }
    default:
      return {
        display: 'Direct Payment',
        handle: method.details || 'Contact creator',
        icon: '💰',
        qrData: '',
      }
  }
}

const getPlatformPaymentDisplay = () => {
  return {
    display: 'PayPal',
    handle: 'payments@honestneed.com',
    icon: '💳',
    qrData: 'https://paypal.me/honestneed',
  }
}

// ============================================================
// COMPONENT
// ============================================================

/**
 * SplitPaymentDisplay Component
 * Displays split payment instructions with two-step payment breakdown
 * Shows creator payment (primary) and platform fee (secondary) with QR codes
 */
export function SplitPaymentDisplay({
  creatorPaymentMethod,
  creatorAmount,
  platformAmount,
  totalAmount,
  creatorName = 'Creator',
  campaignName = 'this campaign',
  currency = 'USD',
}: SplitPaymentDisplayProps) {
  const creatorMethod = getMethodDisplay(creatorPaymentMethod)
  const platformMethod = getPlatformPaymentDisplay()

  const creatorFormatted = formatCurrency(creatorAmount, currency)
  const platformFormatted = formatCurrency(platformAmount, currency)
  const totalFormatted = formatCurrency(totalAmount, currency)

  return (
    <Container>
      <SectionTitle>📍 Two-Step Payment Required</SectionTitle>

      <PaymentBoxContainer>
        {/* Creator Payment Box (Primary) */}
        <PaymentBox isPrimary>
          <Badge type="primary">Primary (Step 1)</Badge>
          <BoxTitle>
            {creatorMethod.icon} Send to Creator
          </BoxTitle>
          <AmountDisplay>{creatorFormatted}</AmountDisplay>

          <MethodInfo>
            <InfoRow>
              <InfoLabel>Method:</InfoLabel>
              <InfoValue>{creatorMethod.display}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Account:</InfoLabel>
              <InfoValue>{creatorMethod.handle}</InfoValue>
            </InfoRow>
          </MethodInfo>

          {creatorMethod.qrData && (
            <QRCodeContainer>
              <QRCodeCanvas
                value={creatorMethod.qrData}
                size={140}
                level="H"
                includeMargin={true}
                quietZone={10}
              />
              <QRLabel>Scan to open {creatorMethod.display}</QRLabel>
            </QRCodeContainer>
          )}

          <Instructions>
            <strong>How to send:</strong>
            Open {creatorMethod.display}, send exactly{' '}
            <strong>{creatorFormatted}</strong> to <strong>{creatorMethod.handle}</strong>. Add a note: "Donation for{' '}
            {campaignName}".
          </Instructions>
        </PaymentBox>

        {/* Platform Fee Box (Secondary) */}
        <PaymentBox>
          <Badge type="secondary">Secondary (Step 2)</Badge>
          <BoxTitle>{platformMethod.icon} Platform Fee</BoxTitle>
          <AmountDisplay>{platformFormatted}</AmountDisplay>

          <MethodInfo>
            <InfoRow>
              <InfoLabel>Method:</InfoLabel>
              <InfoValue>{platformMethod.display}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Account:</InfoLabel>
              <InfoValue>{platformMethod.handle}</InfoValue>
            </InfoRow>
          </MethodInfo>

          {platformMethod.qrData && (
            <QRCodeContainer>
              <QRCodeCanvas
                value={platformMethod.qrData}
                size={140}
                level="H"
                includeMargin={true}
                quietZone={10}
              />
              <QRLabel>Scan to open PayPal</QRLabel>
            </QRCodeContainer>
          )}

          <Instructions>
            <strong>How to send:</strong>
            Send <strong>{platformFormatted}</strong> to <strong>{platformMethod.handle}</strong> via PayPal. Add note:
            "Platform fee for {campaignName}".
          </Instructions>
        </PaymentBox>
      </PaymentBoxContainer>

      {/* Summary Box */}
      <SummaryBox>
        <BoxTitle>💡 Payment Summary</BoxTitle>
        <MethodInfo>
          <InfoRow>
            <InfoLabel>Total Donation:</InfoLabel>
            <InfoValue style={{ color: '#6366f1', fontWeight: 700, fontSize: '1rem' }}>
              {totalFormatted}
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>To Creator ({100 - DONATION_FEE_PERCENT}%):</InfoLabel>
            <InfoValue style={{ color: '#10b981' }}>{creatorFormatted}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Platform Fee ({DONATION_FEE_PERCENT}%):</InfoLabel>
            <InfoValue style={{ color: '#6366f1' }}>{platformFormatted}</InfoValue>
          </InfoRow>
        </MethodInfo>
      </SummaryBox>

      {/* Warning Box */}
      <WarningBox>
        <WarningIcon size={18} aria-hidden="true" />
        <span>
          <strong>⚠️ Important:</strong> You must complete <strong>BOTH</strong> payment steps. Each payment serves a
          different purpose: the creator receives their donation, and the platform fee ensures our service continues.
          Your donation is not complete until both payments are verified.
        </span>
      </WarningBox>
    </Container>
  )
}
