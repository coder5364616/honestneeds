'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { AlertCircle, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/Card'
import FormField from '@/components/FormField'
import { Modal } from '@/components/Modal'
import { apiClient } from '@/lib/api'

interface ShareAppealProps {
  shareId: string
  campaignTitle: string
  rejectionReason: string
  onAppealSubmitted?: () => void
}

const Container = styled.div`
  max-width: 600px;
  margin: 2rem auto;
  padding: 1rem;
`

const Header = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
`

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
`

const WarningBox = styled(Card)`
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
`

const WarningIcon = styled.div`
  flex-shrink: 0;
  color: #f59e0b;
  font-size: 1.5rem;
`

const WarningContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const WarningTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #92400e;
  margin: 0;
`

const WarningText = styled.p`
  font-size: 0.875rem;
  color: #78350f;
  margin: 0;
  line-height: 1.5;
`

const ReasonBox = styled(Card)`
  background: #f3f4f6;
  border-left: 4px solid #ef4444;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`

const ReasonLabel = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin: 0 0 0.75rem 0;
`

const ReasonText = styled.p`
  color: #1f2937;
  line-height: 1.6;
  margin: 0;
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
  color: #0f172a;
  font-size: 0.95rem;
`

const Textarea = styled.textarea`
  min-height: 120px;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`

const CharCount = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  text-align: right;
`

const ButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const SuccessModal = styled.div`
  padding: 2rem;
  text-align: center;
`

const SuccessIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`

const SuccessTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.5rem 0;
`

const SuccessText = styled.p`
  color: #64748b;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
`

export const ShareAppeal: React.FC<ShareAppealProps> = ({
  shareId,
  campaignTitle,
  rejectionReason,
  onAppealSubmitted,
}) => {
  const [appealReason, setAppealReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!appealReason.trim()) {
      setError('Please provide a reason for your appeal')
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.post(
        `/shares/${shareId}/appeal`,
        { appealReason }
      )

      if (response.data.success) {
        setSubmitted(true)
        onAppealSubmitted?.()
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit appeal')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <Container>
        <SuccessModal>
          <SuccessIcon>✅</SuccessIcon>
          <SuccessTitle>Appeal Submitted!</SuccessTitle>
          <SuccessText>
            Thank you for submitting your appeal. Our team will review it within 2-3 business days and contact you via email.
          </SuccessText>
          <Button onClick={() => window.location.href = '/app/shares'}>
            Return to My Shares
          </Button>
        </SuccessModal>
      </Container>
    )
  }

  return (
    <Container>
      <Header>
        <Title>Appeal Share Decision</Title>
        <Subtitle>Help us understand why you believe this share should be approved</Subtitle>
      </Header>

      <WarningBox>
        <WarningIcon>⚠️</WarningIcon>
        <WarningContent>
          <WarningTitle>What happens next?</WarningTitle>
          <WarningText>
            When you submit an appeal, our admin team will review your response and the original reason for rejection. We'll email you our final decision within 2-3 business days.
          </WarningText>
        </WarningContent>
      </WarningBox>

      <ReasonBox>
        <ReasonLabel>Original Rejection Reason</ReasonLabel>
        <ReasonText>{rejectionReason}</ReasonText>
      </ReasonBox>

      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="campaign">Campaign</Label>
          <div style={{
            padding: '0.75rem',
            background: '#f3f4f6',
            borderRadius: '8px',
            color: '#1f2937'
          }}>
            {campaignTitle}
          </div>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="appeal">Appeal Reason</Label>
          <Textarea
            id="appeal"
            value={appealReason}
            onChange={(e) => {
              setAppealReason(e.target.value)
              setError(null)
            }}
            placeholder="Explain why you believe this share should be approved. Please be specific about any issues with the original rejection reason or provide additional context..."
            maxLength={1000}
            disabled={loading}
          />
          <CharCount>
            {appealReason.length} / 1000 characters
          </CharCount>
        </FormGroup>

        {error && (
          <div style={{
            padding: '1rem',
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#7F1D1D',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start'
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        <ButtonGroup>
          <Button
            type="submit"
            disabled={loading || !appealReason.trim()}
            style={{
              background: appealReason.trim() && !loading ? '#3b82f6' : '#cbd5e1',
              color: 'white'
            }}
          >
            <Send size={16} style={{ marginRight: '0.5rem' }} />
            {loading ? 'Submitting...' : 'Submit Appeal'}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => window.history.back()}
            disabled={loading}
          >
            Cancel
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  )
}

export default ShareAppeal
