'use client'

import styled from 'styled-components'
import { Share2, MousePointerClick, Heart, Gift } from 'lucide-react'

/**
 * ConversionFunnel (SA-3)
 * Creator-facing "is sharing working?" funnel:
 *   shares → clicks → donations → rewards
 * with stage counts and step-to-step conversion rates. Fed by the campaign's
 * virality + share_config data (no extra fetch).
 */

interface ConversionFunnelProps {
  shares?: number
  clicks?: number
  donations?: number
  rewardsPaidCents?: number
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
const Stage = styled.div<{ $color: string; $pct: number }>`
  position: relative;
  border-radius: 12px;
  border: 1.5px solid ${({ $color }) => $color}33;
  background: ${({ $color }) => $color}0d;
  padding: 14px 16px;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    width: ${({ $pct }) => Math.max(4, Math.min(100, $pct))}%;
    background: ${({ $color }) => $color}1a;
    transition: width 0.5s ease;
  }
`
const Row = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`
const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`
const IconWrap = styled.div<{ $color: string }>`
  width: 34px;
  height: 34px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color}1f;
  color: ${({ $color }) => $color};
`
const Label = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
`
const Sub = styled.div`
  font-size: 0.74rem;
  color: #64748b;
`
const Value = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: #0f172a;
`
const StepRate = styled.div`
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  padding: 1px 0;
`

function rate(n: number, d: number): string {
  if (!d || d <= 0) return '—'
  return `${Math.min(100, (n / d) * 100).toFixed(1)}%`
}

export function ConversionFunnel({
  shares = 0,
  clicks = 0,
  donations = 0,
  rewardsPaidCents = 0,
}: ConversionFunnelProps) {
  const top = Math.max(shares, 1)
  const stages = [
    { key: 's', color: '#6366f1', icon: <Share2 size={17} />, label: 'Shares', value: shares.toLocaleString(), sub: 'links created' },
    { key: 'c', color: '#0ea5e9', icon: <MousePointerClick size={17} />, label: 'Clicks', value: clicks.toLocaleString(), sub: `${rate(clicks, shares)} of shares` },
    { key: 'd', color: '#16a34a', icon: <Heart size={17} />, label: 'Donations', value: donations.toLocaleString(), sub: `${rate(donations, clicks)} of clicks` },
    { key: 'r', color: '#d97706', icon: <Gift size={17} />, label: 'Rewards paid', value: `$${(rewardsPaidCents / 100).toFixed(2)}`, sub: `${donations.toLocaleString()} earning conversions` },
  ]

  const widthFor = (i: number) => {
    const counts = [shares, clicks, donations, donations]
    return (counts[i] / top) * 100
  }

  return (
    <Wrap>
      {stages.map((st, i) => (
        <div key={st.key}>
          <Stage $color={st.color} $pct={widthFor(i)}>
            <Row>
              <Left>
                <IconWrap $color={st.color}>{st.icon}</IconWrap>
                <div>
                  <Label>{st.label}</Label>
                  <Sub>{st.sub}</Sub>
                </div>
              </Left>
              <Value>{st.value}</Value>
            </Row>
          </Stage>
          {i < stages.length - 1 && (
            <StepRate>
              ↓ {i === 0 ? rate(clicks, shares) : i === 1 ? rate(donations, clicks) : rate(donations, donations)}
            </StepRate>
          )}
        </div>
      ))}
    </Wrap>
  )
}
