'use client'

import styled from 'styled-components'
import { Info } from 'lucide-react'
import { DONATION_FEE_PERCENT } from '@/utils/validationSchemas'
import { tk } from '@/styles/dashboardTokens'

interface FeeBreakdownProps {
  grossAmount: number
  platformFeePercentage?: number
}

const Container = styled.div`
  background-color: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  font-family: 'DM Sans', sans-serif;
`

const Title = styled.h3`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${tk.muted};
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${tk.border};

  &:last-of-type {
    border-bottom: none;
  }
`

const Label = styled.span`
  color: ${tk.body};
  font-size: 0.925rem;
  font-weight: 500;
`

const Value = styled.span<{ bold?: boolean }>`
  font-family: 'DM Mono', monospace;
  color: ${tk.heading};
  font-size: 0.925rem;
  font-weight: ${(props) => (props.bold ? 700 : 500)};
`

const TotalRow = styled(Row)`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid ${tk.border};

  ${Label} {
    font-weight: 700;
    color: ${tk.heading};
  }

  ${Value} {
    font-weight: 700;
    color: ${tk.amberDark};
    font-size: 1rem;
  }
`

const InfoBox = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: ${tk.blueLight};
  border-radius: 10px;
  border-left: 3px solid ${tk.blue};
`

const InfoIcon = styled(Info)`
  color: ${tk.blue};
  flex-shrink: 0;
  margin-top: 0.125rem;
`

const InfoText = styled.p`
  font-size: 0.8125rem;
  color: ${tk.blue};
  margin: 0;
  line-height: 1.4;
`

export function FeeBreakdown({ grossAmount, platformFeePercentage = DONATION_FEE_PERCENT }: FeeBreakdownProps) {
  const feeAmount = Number((grossAmount * (platformFeePercentage / 100)).toFixed(2))
  const netAmount = Number((grossAmount - feeAmount).toFixed(2))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Container>
      <Title>Fee Breakdown</Title>

      <Row>
        <Label>Your donation</Label>
        <Value>{formatCurrency(grossAmount)}</Value>
      </Row>

      <Row>
        <Label>Platform fee ({platformFeePercentage}%)</Label>
        <Value>{formatCurrency(feeAmount)}</Value>
      </Row>

      <TotalRow>
        <Label>Sender will pay</Label>
        <Value bold>{formatCurrency(grossAmount)}</Value>
      </TotalRow>

      <Row>
        <Label>Creator will receive</Label>
        <Value bold>{formatCurrency(netAmount)}</Value>
      </Row>

      <InfoBox>
        <InfoIcon size={16} aria-hidden="true" />
        <InfoText>
          Platform fees help us maintain infrastructure, process payments, and prevent fraud. We're committed to keeping
          fees low and transparent.
        </InfoText>
      </InfoBox>
    </Container>
  )
}
