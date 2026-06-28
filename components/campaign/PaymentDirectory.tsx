'use client'

import styled from 'styled-components'
import { Copy, Check, QrCode, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { tk } from '@/styles/dashboardTokens'

interface PaymentMethod {
  type: string
  [key: string]: any
}

interface PaymentDirectoryProps {
  paymentMethods: PaymentMethod[]
  creatorName: string
  onMethodSelect?: (method: PaymentMethod) => void
}

const Container = styled.div`
  background-color: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 2rem;
  margin: 2rem 0;
  width: 100%;
  box-sizing: border-box;
  font-family: 'DM Sans', sans-serif;

  @media (max-width: 640px) {
    padding: 1.5rem 1rem;
    margin: 1.75rem 0;
  }

  @media (max-width: 480px) {
    padding: 1.25rem 0.875rem;
    margin: 1.5rem 0;
  }
`

const Title = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 1.5rem 0;
  letter-spacing: -0.3px;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin: 0 0 1rem 0;
  }
`

const Subtitle = styled.p`
  font-size: 0.9rem;
  color: ${tk.muted};
  margin: 0 0 2rem 0;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin: 0 0 1.5rem 0;
  }
`

const MethodsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
`

const MethodCard = styled.div`
  background-color: white;
  border: 2px solid ${tk.border};
  border-radius: 0.5rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (max-width: 480px) {
    padding: 1rem;
  }

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
  }
`

const MethodHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`

const MethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  background-color: ${tk.blueLight};
  border-radius: 0.5rem;
  color: ${tk.blue};
`

const MethodName = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`

const MethodInfo = styled.div`
  background-color: ${tk.canvasDeep};
  border: 1px solid ${tk.border};
  border-radius: 0.375rem;
  padding: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`

const InfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.5rem;
`

const InfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${tk.heading};
  word-break: break-word;
  overflow-wrap: break-word;
  min-width: 0;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`

const CopyButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  background-color: transparent;
  border: 1px solid ${tk.border};
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8rem;
  color: ${tk.blue};
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  flex-shrink: 0;
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 0.3rem 0.4rem;
    font-size: 0.75rem;
    gap: 0.25rem;
  }

  &:hover {
    background-color: ${tk.blueLight};
    border-color: ${tk.blue};
  }

  &.copied {
    background-color: ${tk.greenLight};
    border-color: ${tk.green};
    color: ${tk.green};
  }
`

const QRSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px solid ${tk.border};
  border-radius: 0.375rem;
  padding: 1rem;
  margin: 1rem 0;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  overflow: hidden;
`

const QRCode = styled.img`
  max-width: 120px;
  height: auto;
`

const Instructions = styled.div`
  font-size: 0.85rem;
  color: ${tk.muted};
  line-height: 1.6;
  margin: 1rem 0 0 0;
  padding: 0.75rem;
  background-color: ${tk.blueLight};
  border-left: 3px solid ${tk.blue};
  border-radius: 0.25rem;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.6rem;
    margin: 0.75rem 0 0 0;
  }
`

const InstructionTitle = styled.strong`
  display: block;
  color: ${tk.blue};
  margin-bottom: 0.5rem;
`

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`

const ActionButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 0.5rem 0.75rem;
  background-color: ${tk.blue};
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 480px) {
    padding: 0.5rem 0.5rem;
    font-size: 0.8rem;
    min-width: 100px;
  }

  &:hover {
    background-color: #0D4A8C;
  }

  &:disabled {
    background-color: ${tk.border};
    cursor: not-allowed;
  }
`

/* Helper function to get payment method icon and details */
interface PaymentMethodExtended extends PaymentMethod {
  username?: string
  email?: string
  cashtag?: string
  routingNumber?: string
  accountNumber?: string
  walletAddress?: string
  details?: string
}

function getPaymentMethodDetails(method: PaymentMethodExtended): {
  displayValue: string
  qrValue?: string
  instructions: string
} {
  switch (method.type) {
    case 'venmo':
      return {
        displayValue: `@${method.username || 'username'}`,
        qrValue: `https://venmo.com/${method.username || 'username'}`,
        instructions:
          '1. Open Venmo app\n2. Search for this username or scan the QR code\n3. Send your donation\n4. Return here and click "Mark as Paid"',
      }
    case 'paypal':
      return {
        displayValue: method.email || 'email@example.com',
        instructions:
          '1. Open PayPal app or website\n2. Click "Send Money"\n3. Enter this email address\n4. Send your donation\n5. Return here and click "Mark as Paid"',
      }
    case 'cashapp':
      return {
        displayValue: `${method.cashtag || '$cashtag'}`,
        qrValue: `https://cash.app/${method.cashtag || 'cashtag'}`,
        instructions:
          '1. Open Cash App\n2. Search for this $cashtag or scan the QR code\n3. Send your donation\n4. Return here and click "Mark as Paid"',
      }
    case 'bank':
      return {
        displayValue: `•••• ${(method.accountNumber || '0000')?.slice(-4)}`,
        instructions: `1. Use your bank's transfer app\n2. Enter routing #: ${method.routingNumber || '000000000'}\n3. Enter account #: ${method.accountNumber || '••••••••'}\n4. Send your donation\n5. Return here and click "Mark as Paid"`,
      }
    case 'crypto':
      return {
        displayValue: `${(method.walletAddress || '0x...')?.slice(0, 10)}...${(method.walletAddress || '0x...')?.slice(-6)}`,
        instructions:
          `1. Open your crypto wallet\n2. Scan the QR or copy the address\n3. Send payment to this address\n4. Return here and click "Mark as Paid"`,
      }
    case 'other':
      return {
        displayValue: 'Custom method',
        instructions: `1. ${method.details || 'See payment details'}\n2. After sending payment, return to mark it complete`,
      }
    default:
      return {
        displayValue: 'Unknown',
        instructions: 'Contact creator for details',
      }
  }
}

function getMethodIcon(type: string): React.ReactNode {
  const iconProps = { size: 20 }
  switch (type) {
    case 'venmo':
      return '💙'
    case 'paypal':
      return '🅿️'
    case 'cashapp':
      return '💵'
    case 'bank':
      return '🏦'
    case 'crypto':
      return '₿'
    case 'other':
      return '✉️'
    default:
      return '💳'
  }
}

export function PaymentDirectory({
  paymentMethods,
  creatorName,
  onMethodSelect,
}: PaymentDirectoryProps) {
  const [copiedMethod, setCopiedMethod] = useState<string | null>(null)

  const handleCopy = (text: string, methodType: string) => {
    navigator.clipboard.writeText(text)
    setCopiedMethod(`${methodType}-copy`)
    setTimeout(() => setCopiedMethod(null), 2000)
  }

  if (!paymentMethods || paymentMethods.length === 0) {
    return (
      <Container>
        <Title>Payment Methods</Title>
        <Subtitle>No payment methods available for this campaign.</Subtitle>
      </Container>
    )
  }

  return (
    <Container>
      <Title>💰 How to Support This Campaign</Title>
      <Subtitle>
        {creatorName} accepts the following payment methods. Send your support directly via the platform of your choice,
        then return here to mark your payment complete.
      </Subtitle>

      <MethodsGrid>
        {paymentMethods.map((method, index) => {
          const details = getPaymentMethodDetails(method as PaymentMethodExtended)
          const isVenmoOrCashapp = method.type === 'venmo' || method.type === 'cashapp'

          return (
            <MethodCard key={index}>
              <MethodHeader>
                <MethodIcon>{getMethodIcon(method.type)}</MethodIcon>
                <MethodName>{method.type.charAt(0).toUpperCase() + method.type.slice(1)}</MethodName>
              </MethodHeader>

              <MethodInfo>
                <InfoLabel>{method.type} Address / ID</InfoLabel>
                <InfoValue>
                  {details.displayValue}
                  <CopyButton
                    type="button"
                    className={copiedMethod === `${method.type}-copy` ? 'copied' : ''}
                    onClick={() => handleCopy(details.displayValue, method.type)}
                    title="Copy to clipboard"
                  >
                    {copiedMethod === `${method.type}-copy` ? (
                      <>
                        <Check size={14} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy
                      </>
                    )}
                  </CopyButton>
                </InfoValue>
              </MethodInfo>

              {isVenmoOrCashapp && details.qrValue && (
                <QRSection>
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(details.qrValue)}`}
                      alt={`${method.type} QR Code`}
                      style={{ maxWidth: '120px' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: tk.muted, marginTop: '0.5rem' }}>
                      Scan or tap
                    </div>
                  </div>
                </QRSection>
              )}

              <Instructions>
                <InstructionTitle>How to send:</InstructionTitle>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', lineHeight: 1.5 }}>
                  {details.instructions}
                </div>
              </Instructions>

              <ActionButtons>
                <ActionButton
                  onClick={() => onMethodSelect?.(method)}
                  title={`Open ${method.type} to send payment`}
                >
                  <ExternalLink size={16} />
                  Send Now
                </ActionButton>
              </ActionButtons>
            </MethodCard>
          )
        })}
      </MethodsGrid>
    </Container>
  )
}
