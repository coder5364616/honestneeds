'use client'

import styled from 'styled-components'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { BOOST_TIERS } from '@/utils/boostValidationSchemas'
import { useCreateCheckoutSession, useGetSessionStatus } from '@/api/hooks/useBoosts'
import BoostTierCard from './BoostTierCard'
import Button from '@/components/ui/Button'

interface BoostCheckoutProps {
  campaignId: string
  campaignTitle: string
  onSuccess?: (boostId: string) => void
  onCancel?: () => void
}

// Styled Components
const Container = styled.div`
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;

  @media (min-width: 640px) {
    padding: 2rem;
  }
`

const Header = styled.div`
  margin-bottom: 2rem;
`

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;

  @media (min-width: 640px) {
    font-size: 2.25rem;
  }
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;

  span {
    font-weight: 600;
    color: #111827;
  }
`

const Section = styled.div`
  margin-bottom: 2rem;
`

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1.5rem;
`

const TiersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
`

const SummaryCard = styled.div`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid #e5e7eb;
`

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const SummaryItem = styled.div`
  p {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  strong {
    font-size: 1.125rem;
    font-weight: 700;
    color: #111827;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #d1d5db;
  background-color: white;
  color: #111827;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ContinueButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: linear-gradient(90deg, #2563eb 0%, #9333ea 100%);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  transition: all 200ms ease;

  &:hover:not(:disabled) {
    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ProcessingIndicator = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #dbeafe;
  border-radius: 0.375rem;

  p {
    font-size: 0.875rem;
    color: #1e40af;
  }
`

/**
 * BoostCheckout Component
 * Handles the complete boost purchase flow
 * Integrated with Next.js frontend
 */
export const BoostCheckout: React.FC<BoostCheckoutProps> = ({
  campaignId,
  campaignTitle,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter()
  const [selectedTier, setSelectedTier] = useState<keyof typeof BOOST_TIERS | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)

  const createCheckoutMutation = useCreateCheckoutSession()
  const { data: sessionStatus } = useGetSessionStatus(sessionId)

  // Poll for session status
  useEffect(() => {
    if (sessionStatus?.payment_status === 'paid') {
      setIsProcessing(false)
      if (sessionStatus.boost_id) {
        toast.success('Boost activated successfully!')
        onSuccess?.(sessionStatus.boost_id)
      }
    }
  }, [sessionStatus, onSuccess])

  const handleSelectTier = (tier: keyof typeof BOOST_TIERS) => {
    setSelectedTier(tier)
  }

  const handleProceedToCheckout = async () => {
    if (!selectedTier) {
      toast.error('Please select a tier')
      return
    }

    // If free tier, process immediately
    if (selectedTier === 'free') {
      setIsProcessing(true)
      try {
        const result = await createCheckoutMutation.mutateAsync({
          campaign_id: campaignId,
          tier: selectedTier,
        })

        if (result.boost_id) {
          toast.success('Free boost activated!')
          onSuccess?.(result.boost_id)
        }
      } catch (error) {
        toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to activate boost'}`)
      } finally {
        setIsProcessing(false)
      }
      return
    }

    // For paid tiers, create checkout session
    setIsProcessing(true)
    try {
      const result = await createCheckoutMutation.mutateAsync({
        campaign_id: campaignId,
        tier: selectedTier,
      })

      if (result.checkout_url) {
        // Store session ID for polling
        setSessionId(result.checkout_session_id)
        // Redirect to Stripe checkout
        window.location.href = result.checkout_url
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Failed to create checkout session'}`)
      setIsProcessing(false)
    }
  }

  return (
    <Container>
      <Header>
        <Title>Boost Your Campaign</Title>
        <Subtitle>
          Increase visibility for <span>{campaignTitle}</span>
        </Subtitle>
      </Header>

      {/* Tier Selection */}
      <Section>
        <SectionTitle>Select a Boost Tier</SectionTitle>
        <TiersGrid>
          {(Object.keys(BOOST_TIERS) as Array<keyof typeof BOOST_TIERS>).map((tier) => (
            <BoostTierCard
              key={tier}
              tier={tier}
              isSelected={selectedTier === tier}
              onSelect={handleSelectTier}
              disabled={isProcessing}
            />
          ))}
        </TiersGrid>
      </Section>

      {/* Selected Tier Details */}
      {selectedTier && (
        <SummaryCard>
          <h3 style={{ marginBottom: '1rem', fontWeight: 600 }}>Boost Summary</h3>
          <SummaryGrid>
            <SummaryItem>
              <p>Tier</p>
              <strong>{BOOST_TIERS[selectedTier].name}</strong>
            </SummaryItem>
            <SummaryItem>
              <p>Price</p>
              <strong>${BOOST_TIERS[selectedTier].price.toFixed(2)}</strong>
            </SummaryItem>
            <SummaryItem>
              <p>Visibility</p>
              <strong>{BOOST_TIERS[selectedTier].visibility_weight}x</strong>
            </SummaryItem>
            <SummaryItem>
              <p>Duration</p>
              <strong>{BOOST_TIERS[selectedTier].duration_days} days</strong>
            </SummaryItem>
          </SummaryGrid>
        </SummaryCard>
      )}

      {/* Action Buttons */}
      <ActionButtons>
        <CancelButton onClick={onCancel} disabled={isProcessing}>
          Cancel
        </CancelButton>
        <ContinueButton onClick={handleProceedToCheckout} disabled={!selectedTier || isProcessing}>
          {isProcessing ? 'Processing...' : 'Continue to Payment'}
        </ContinueButton>
      </ActionButtons>

      {/* Loading Indicator */}
      {isProcessing && (
        <ProcessingIndicator>
          <p>Processing your boost purchase...</p>
        </ProcessingIndicator>
      )}
    </Container>
  )
}

export default BoostCheckout
