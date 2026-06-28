'use client'

import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { AlertCircle, Info } from 'lucide-react'

interface ShareBudgetSetupProps {
  budget: number
  rewardPerShare: number
  onChange: (field: string, value: number) => void
  errors: Record<string, string>
  isOptional?: boolean
  title?: string
}

const Container = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
  border: 2px solid #bfdbfe;
  border-radius: 12px;
  padding: 2rem;
  margin-top: 2rem;

  @media (max-width: 640px) {
    padding: 1.5rem;
  }
`

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e40af;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    flex-shrink: 0;
  }
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
`

const OptionalBadge = styled.span`
  display: inline-block;
  background-color: #fef08a;
  color: #b45309;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.5rem;
`

const InfoBox = styled.div`
  background-color: white;
  border-left: 4px solid #3b82f6;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #1e40af;
  line-height: 1.6;

  svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

const Label = styled.label`
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: #ef4444;
  }
`

const InputWithSlider = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }

  input[type='range'] {
    flex: 1;
    height: 6px;
    cursor: pointer;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    background: linear-gradient(to right, #93c5fd 0%, #93c5fd var(--value), #e2e8f0 var(--value), #e2e8f0 100%);

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: #2563eb;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      &:active {
        transform: scale(1.1);
      }
    }

    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: #2563eb;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }
    }
  }

  input[type='number'] {
    width: 140px;
    padding: 0.75rem;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
    color: #1e293b;
    background-color: white;
    transition: all 0.2s ease;

    &:hover {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    @media (max-width: 640px) {
      width: 100%;
    }
  }
`

const DisplayValue = styled.div`
  font-size: 0.875rem;
  color: #475569;
  font-weight: 500;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  text-align: center;
`

const ErrorBox = styled.div`
  background-color: #fee2e2;
  border-left: 4px solid #ef4444;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  gap: 0.75rem;
  color: #dc2626;
  font-size: 0.875rem;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
`

const CalculationBox = styled.div`
  background-color: white;
  border: 2px solid #dbeafe;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
`

const CalculationRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  font-size: 0.95rem;

  &:first-child {
    border-bottom: 2px solid #f1f5f9;
    margin-bottom: 0.75rem;
    padding-bottom: 1rem;
  }

  &:last-child {
    font-weight: 700;
    color: #0f172a;
    font-size: 1.1rem;
    border-top: 2px solid #f1f5f9;
    padding-top: 1rem;
    margin-top: 0.75rem;
  }
`

const CalculationLabel = styled.span`
  color: #475569;
`

const CalculationValue = styled.span`
  color: #1e293b;
  font-weight: 600;
`

/**
 * ShareBudgetSetupSection
 * Production-ready component for setting up paid sharing in campaigns
 * Allows creators to allocate budget and set reward per share
 */
export const ShareBudgetSetupSection: React.FC<ShareBudgetSetupProps> = ({
  budget = 0,
  rewardPerShare = 0,
  onChange,
  errors = {},
  isOptional = true,
  title = 'Paid Sharing Setup',
}) => {
  const [showCalculation, setShowCalculation] = useState(true)

  const handleBudgetChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.currentTarget.value) || 0
      onChange('budget', Math.max(0, Math.min(1000000, value)))
    },
    [onChange]
  )

  const handleRewardChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.currentTarget.value) || 0
      onChange('rewardPerShare', Math.max(0.1, Math.min(100, value)))
    },
    [onChange]
  )

  const maxShares = budget > 0 && rewardPerShare > 0 ? Math.floor(budget / rewardPerShare) : 0
  // Trust-based model: no platform fee — the full budget is the reward pool.
  const platformFee = 0
  const creatorReceives = budget > 0 ? budget : 0

  return (
    <Container>
      <HeaderSection>
        <Title>
          💰 {title}
        </Title>
        <Subtitle>
          Allow supporters to earn rewards by sharing your campaign. Set your budget and reward amount.
        </Subtitle>
        {isOptional && <OptionalBadge>Optional</OptionalBadge>}
      </HeaderSection>

      <InfoBox>
        <Info size={18} />
        <span>
          <strong>How it works:</strong> You allocate a budget for paid sharing. Supporters share your campaign and earn a reward per share. Once the budget is used up, sharing becomes free.
        </span>
      </InfoBox>

      <FormGrid>
        <FormField>
          <Label>
            Total Budget
            <span>$</span>
          </Label>
          <InputWithSlider>
            <input
              type="range"
              min="0"
              max="1000000"
              value={budget}
              onChange={handleBudgetChange}
              style={{ '--value': `${(budget / 1000000) * 100}%` } as React.CSSProperties}
              title="Drag to set share budget"
            />
            <input
              type="number"
              value={budget || ''}
              onChange={handleBudgetChange}
              min="0"
              max="1000000"
              step="10"
              placeholder="$0"
            />
          </InputWithSlider>
          {errors.budget && (
            <ErrorBox>
              <AlertCircle size={16} />
              <span>{errors.budget}</span>
            </ErrorBox>
          )}
          <DisplayValue>
            {budget > 0 ? `$${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not set'}
          </DisplayValue>
        </FormField>

        <FormField>
          <Label>
            Reward Per Share
            <span>$</span>
          </Label>
          <InputWithSlider>
            <input
              type="range"
              min="0.1"
              max="100"
              step="0.1"
              value={rewardPerShare}
              onChange={handleRewardChange}
              style={{ '--value': `${(rewardPerShare / 100) * 100}%` } as React.CSSProperties}
              title="Drag to set reward amount"
            />
            <input
              type="number"
              value={rewardPerShare || ''}
              onChange={handleRewardChange}
              min="0.1"
              max="100"
              step="0.1"
              placeholder="$0.00"
            />
          </InputWithSlider>
          {errors.rewardPerShare && (
            <ErrorBox>
              <AlertCircle size={16} />
              <span>{errors.rewardPerShare}</span>
            </ErrorBox>
          )}
          <DisplayValue>
            {rewardPerShare > 0 ? `$${rewardPerShare.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Not set'}
          </DisplayValue>
        </FormField>
      </FormGrid>

      {(budget > 0 || rewardPerShare > 0) && (
        <CalculationBox>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <strong style={{ color: '#0f172a' }}>Budget Breakdown</strong>
            <button
              type="button"
              onClick={() => setShowCalculation(!showCalculation)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              {showCalculation ? 'Hide' : 'Show'}
            </button>
          </div>

          {showCalculation && (
            <>
              <CalculationRow>
                <CalculationLabel>Budget Allocated</CalculationLabel>
                <CalculationValue>
                  ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CalculationValue>
              </CalculationRow>

              <CalculationRow>
                <CalculationLabel>HonestNeed Platform Fee</CalculationLabel>
                <CalculationValue style={{ color: '#10b981' }}>
                  $0.00 (no fee)
                </CalculationValue>
              </CalculationRow>

              <CalculationRow>
                <CalculationLabel>Your Reward Pool</CalculationLabel>
                <CalculationValue style={{ color: '#10b981' }}>
                  ${creatorReceives.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CalculationValue>
              </CalculationRow>

              <CalculationRow>
                <CalculationLabel>Max Shares Players Can Earn</CalculationLabel>
                <CalculationValue>
                  {maxShares} shares
                </CalculationValue>
              </CalculationRow>
            </>
          )}
        </CalculationBox>
      )}

      <InfoBox style={{ marginTop: '1.5rem', backgroundColor: '#f0fdf4', borderLeftColor: '#10b981', color: '#166534' }}>
        <Info size={18} />
        <span>
          <strong>Tip:</strong> Start with a smaller budget (e.g., $50) to test the feature, then top it up anytime — instant and fee-free. You pay sharers directly when they request a payout.
        </span>
      </InfoBox>
    </Container>
  )
}
