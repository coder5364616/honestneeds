'use client'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { useCheckWinner, useClaimPrize, useCurrentSweepstakes } from '@/api/hooks/useSimpleSweepstakes'
import { useAuthStore } from '@/store/authStore'
import { DashboardFonts } from '@/features/dashboardUI'
import Button from '@/components/ui/Button'

// Styled Components — mapped to the creator dashboard design system
const PageContainer = styled.div`
  min-height: 100vh;
  background: #F7F5F1;
  font-family: 'DM Sans', sans-serif;
  padding: 2rem 1rem;
`

const Content = styled.div`
  max-width: 600px;
  margin: 0 auto;
`

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #1A5FA8;
  text-decoration: none;
  margin-bottom: 2rem;
  font-weight: 500;
  transition: opacity 200ms;

  &:hover {
    opacity: 0.75;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`

const Card = styled.div`
  background: #FFFFFF;
  border: 1px solid #E2DDD6;
  border-radius: 14px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(26, 95, 168, 0.06);
  margin-bottom: 1.5rem;
`

const Title = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: #18171A;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.5px;
`

const Subtitle = styled.p`
  color: #8C8790;
  font-size: 1rem;
  margin-bottom: 2rem;
`

const PrizeInfo = styled.div`
  background: linear-gradient(135deg, #D4870A 0%, #F5C961 100%);
  color: #18171A;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 2rem;

  .prize-label {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .prize-amount {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const Label = styled.label`
  font-weight: 600;
  color: #111827;
  font-size: 0.95rem;
`

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 200ms;

  &:focus {
    outline: none;
    border-color: #D4870A;
    box-shadow: 0 0 0 3px #FBF3E0;
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
  }
`

const HelperText = styled.p`
  font-size: 0.85rem;
  color: #6b7280;
  margin-top: 0.25rem;
`

const StatusMessage = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1.5rem;

  &.success {
    background: #f0fdf4;
    border: 2px solid #86efac;
    color: #166534;

    svg {
      color: #22c55e;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }
  }

  &.error {
    background: #fef2f2;
    border: 2px solid #fecaca;
    color: #991b1b;

    svg {
      color: #dc2626;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }
  }

  &.info {
    background: #E8F0FB;
    border: 2px solid #1A5FA8;
    color: #0c4a6e;

    svg {
      color: #1A5FA8;
      flex-shrink: 0;
      margin-top: 0.25rem;
    }
  }
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  button {
    flex: 1;
    min-height: 44px;
    font-size: 1rem;
  }
`

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`

export default function ClaimPrizePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const sweepstakesId = params.id as string

  const [formData, setFormData] = useState({
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
  })

  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: sweepstakesResponse } = useCurrentSweepstakes()
  const { data: winnerResponse, isLoading: isLoadingWinner } = useCheckWinner(sweepstakesId)
  const { mutate: claimPrize, isPending: isClaimingPrize } = useClaimPrize()

  const sweepstakes = sweepstakesResponse?.data
  const winnerData = winnerResponse?.data

  // Check if user can claim
  const isWinner = winnerData?.winner === true
  const canClaim = winnerData?.canClaim === true

  useEffect(() => {
    if (!user) {
      toast.error('❌ Please log in to claim your prize')
      router.push(`/login?redirect=/sweepstakes/${sweepstakesId}/claim`)
    }
  }, [user, sweepstakesId, router])

  useEffect(() => {
    if (!isLoadingWinner && !isWinner) {
      toast.error('❌ You are not a winner of this drawing')
      router.push('/sweepstakes')
    }
  }, [isLoadingWinner, isWinner, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!agreedToTerms) {
      toast.error('❌ You must agree to the terms')
      return
    }

    if (!formData.accountName || !formData.accountNumber || !formData.routingNumber || !formData.bankName) {
      toast.error('❌ Please fill in all required fields')
      return
    }

    // Validate account number length (typically 8-17 digits)
    if (!/^\d{8,17}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
      toast.error('❌ Please enter a valid account number (8-17 digits)')
      return
    }

    // Validate routing number (9 digits)
    if (!/^\d{9}$/.test(formData.routingNumber.replace(/\s/g, ''))) {
      toast.error('❌ Please enter a valid routing number (9 digits)')
      return
    }

    setIsSubmitting(true)

    claimPrize(
      {
        sweepstakesId,
        paymentDetails: {
          accountName: formData.accountName,
          accountNumber: formData.accountNumber.replace(/\s/g, ''),
          routingNumber: formData.routingNumber.replace(/\s/g, ''),
          bankName: formData.bankName,
          paymentMethod: 'bank_transfer',
        },
      },
      {
        onSuccess: () => {
          setIsSubmitting(false)
          toast.success('✅ Prize claim submitted successfully!')
          setTimeout(() => {
            router.push('/sweepstakes')
          }, 1500)
        },
        onError: () => {
          setIsSubmitting(false)
        },
      }
    )
  }

  if (isLoadingWinner) {
    return (
      <PageContainer>
        <DashboardFonts />
        <Content>
          <Card style={{ textAlign: 'center' }}>
            <p style={{ color: '#6b7280' }}>Loading...</p>
          </Card>
        </Content>
      </PageContainer>
    )
  }

  if (!isWinner || !canClaim) {
    return (
      <PageContainer>
        <DashboardFonts />
        <Content>
          <BackButton href="/sweepstakes">
            <ArrowLeft />
            Back to Sweepstakes
          </BackButton>

          <Card>
            <StatusMessage className="error">
              <AlertCircle size={24} />
              <div>
                <strong>Cannot Claim Prize</strong>
                <p style={{ marginTop: '0.5rem' }}>
                  {!isWinner ? 'You are not a winner of this drawing.' : 'The claim period has expired.'}
                </p>
              </div>
            </StatusMessage>
          </Card>
        </Content>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <DashboardFonts />
      <Content>
        <BackButton href="/sweepstakes">
          <ArrowLeft />
          Back to Sweepstakes
        </BackButton>

        <Card>
          <Title>
            <span>🎉</span>
            Claim Your Prize
          </Title>
          <Subtitle>Congratulations! You have won the sweepstakes. Please provide your banking information to claim your prize.</Subtitle>

          {sweepstakes && (
            <PrizeInfo>
              <div className="prize-label">Prize Amount</div>
              <div className="prize-amount">${sweepstakes.prizeAmountDollars}</div>
            </PrizeInfo>
          )}

          <StatusMessage className="info">
            <AlertCircle size={20} />
            <p>
              Your bank details will be securely encrypted and used only for prize payment. We never share your
              information.
            </p>
          </StatusMessage>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="accountName">Account Holder Name *</Label>
              <Input
                id="accountName"
                type="text"
                name="accountName"
                placeholder="John Doe"
                value={formData.accountName}
                onChange={handleInputChange}
                disabled={isSubmitting || isClaimingPrize}
                required
              />
              <HelperText>Full name associated with the bank account</HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="bankName">Bank Name *</Label>
              <Input
                id="bankName"
                type="text"
                name="bankName"
                placeholder="Bank of America"
                value={formData.bankName}
                onChange={handleInputChange}
                disabled={isSubmitting || isClaimingPrize}
                required
              />
              <HelperText>Name of your bank or financial institution</HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="routingNumber">Routing Number *</Label>
              <Input
                id="routingNumber"
                type="text"
                name="routingNumber"
                placeholder="123456789"
                value={formData.routingNumber}
                onChange={handleInputChange}
                disabled={isSubmitting || isClaimingPrize}
                maxLength="11"
                required
              />
              <HelperText>9-digit routing number (find it on your checks or bank website)</HelperText>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                type="password"
                name="accountNumber"
                placeholder="••••••••••••••••"
                value={formData.accountNumber}
                onChange={handleInputChange}
                disabled={isSubmitting || isClaimingPrize}
                required
              />
              <HelperText>Your bank account number (8-17 digits, hidden for security)</HelperText>
            </FormGroup>

            <div style={{ padding: '1rem', background: '#f3f4f6', borderRadius: '0.5rem', marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isSubmitting || isClaimingPrize}
                  style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                />
                <span style={{ color: '#374151', fontSize: '0.95rem' }}>
                  I confirm that the banking information provided is accurate and authorize the prize transfer to
                  this account. I understand that fraudulent information may result in claim denial.
                </span>
              </label>
            </div>

            <ButtonGroup>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/sweepstakes')}
                disabled={isSubmitting || isClaimingPrize}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting || isClaimingPrize || !agreedToTerms}>
                {isSubmitting || isClaimingPrize ? (
                  <>
                    <LoadingSpinner />
                    Claiming...
                  </>
                ) : (
                  '💰 Claim Prize'
                )}
              </Button>
            </ButtonGroup>
          </Form>
        </Card>

        <Card style={{ background: '#f9fafb' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#111827' }}>
            ⏰ Important Dates
          </h3>
          {sweepstakes && (
            <div style={{ color: '#6b7280', lineHeight: 1.8 }}>
              <p>
                <strong style={{ color: '#111827' }}>Claim Deadline:</strong>{' '}
                {new Date(sweepstakes.claimDeadline).toLocaleDateString()} at 11:59 PM
              </p>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.8 }}>
                If you don't claim your prize by the deadline, your claim will expire and the prize will be
                forfeited.
              </p>
            </div>
          )}
        </Card>
      </Content>
    </PageContainer>
  )
}
