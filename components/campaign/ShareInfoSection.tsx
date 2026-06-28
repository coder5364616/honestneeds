'use client'

import styled from 'styled-components'
import { DollarSign, Target, Repeat } from 'lucide-react'

interface ShareInfoSectionProps {
  share_config?: {
    amount_per_share?: number
    total_budget?: number
    share_channels?: string[]
    current_budget_remaining?: number
    is_paid_sharing_active?: boolean
  }
}

// ─── Design Tokens (mirrors /dashboard) ───────────────────────────────────────
const tk = {
  white:      '#FFFFFF',
  canvas:     '#F7F5F1',
  canvasDeep: '#EEEBE5',
  border:     '#E2DDD6',
  muted:      '#8C8790',
  body:       '#4A4750',
  heading:    '#18171A',
  amber:      '#D4870A',
  amberLight: '#FBF3E0',
  green:      '#1A7A4A',
  greenLight: '#E8F5EE',
  blue:       '#1A5FA8',
  blueLight:  '#E8F0FB',
}

const Card = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'DM Sans', sans-serif;

  @media (min-width: 640px) {
    padding: 1.75rem;
    margin-bottom: 2rem;
  }
`

const Title = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0 0 1.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.3px;

  @media (min-width: 640px) {
    font-size: 1.125rem;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`

const StatTile = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.125rem 1.25rem;
  transition: border-color 180ms, box-shadow 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
  }
`

const StatTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 0.875rem;
`

const StatIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => ({ amber: tk.amberLight, green: tk.greenLight, blue: tk.blueLight }[p.$color])};
  color: ${p => ({ amber: tk.amber, green: tk.green, blue: tk.blue }[p.$color])};
`

const StatLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const StatValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

const HowItWorks = styled.div`
  background: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 12px;
  padding: 1.125rem 1.25rem;
`

const HowTitle = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 0.75rem 0;
`

const StepList = styled.ul`
  margin: 0;
  padding: 0 0 0 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    font-size: 0.85rem;
    color: ${tk.body};
    line-height: 1.5;
  }

  strong {
    font-weight: 600;
    color: ${tk.heading};
  }
`

export function ShareInfoSection({ share_config }: ShareInfoSectionProps) {
  if (!share_config) return null

  const rewardPerShare = share_config.amount_per_share
    ? (share_config.amount_per_share / 100).toFixed(2)
    : '0.50'

  const totalBudget = share_config.total_budget
    ? (share_config.total_budget / 100).toFixed(2)
    : '0.00'

  const shareCount = Math.floor((parseFloat(totalBudget) * 100) / parseFloat(rewardPerShare))

  return (
    <Card>
      <Title>
        💰 Get Paid to Share
      </Title>

      <StatsGrid>
        <StatTile>
          <StatTop>
            <StatIcon $color="amber"><DollarSign size={18} /></StatIcon>
            <StatLabel>Earn per Share</StatLabel>
          </StatTop>
          <StatValue>${rewardPerShare}</StatValue>
        </StatTile>

        <StatTile>
          <StatTop>
            <StatIcon $color="green"><Target size={18} /></StatIcon>
            <StatLabel>Total Budget</StatLabel>
          </StatTop>
          <StatValue>${totalBudget}</StatValue>
        </StatTile>

        <StatTile>
          <StatTop>
            <StatIcon $color="blue"><Repeat size={18} /></StatIcon>
            <StatLabel>Shares Available</StatLabel>
          </StatTop>
          <StatValue>{shareCount.toLocaleString()}</StatValue>
        </StatTile>
      </StatsGrid>

      <HowItWorks>
        <HowTitle>How it works</HowTitle>
        <StepList>
          <li>Click "Share to Earn" to create your unique referral link</li>
          <li>Share the link on social media (Twitter, Facebook, LinkedIn, etc.)</li>
          <li>When someone clicks your link and donates, you earn <strong>${rewardPerShare}</strong></li>
          <li>Your earnings are held for 30 days to prevent fraud, then you can withdraw</li>
          <li>No limit on earnings - share with as many people as you want!</li>
        </StepList>
      </HowItWorks>
    </Card>
  )
}
