'use client'

import React, { useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Zap, Leaf, Rocket, Check, Info, ChevronRight } from 'lucide-react'
import { BOOST_TIERS } from '@/utils/boostValidationSchemas'

// ─── Animations ────────────────────────────────────────────────────────────────

const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const summaryReveal = keyframes`
  from { opacity: 0; transform: translateY(6px); max-height: 0; }
  to   { opacity: 1; transform: translateY(0); max-height: 300px; }
`

// ─── Layout ────────────────────────────────────────────────────────────────────

const Wrap = styled.div`
  font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.25rem 0;
`

// ─── Header ───────────────────────────────────────────────────────────────────

const Header = styled.div`
  text-align: center;
  animation: ${fadeSlideUp} 0.4s ease both;
`

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #dbeafe;
  color: #1e40af;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 100px;
  margin-bottom: 0.875rem;

  svg { width: 12px; height: 12px; }
`

const Title = styled.h2`
  font-family: 'Syne', 'DM Sans', sans-serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 800;
  color: #0f172a;
  line-height: 1.15;
  margin: 0 0 0.4rem;

  @media (prefers-color-scheme: dark) { color: #151a1f; }
`

const Subtitle = styled.p`
  font-size: 0.925rem;
  color: #64748b;
  max-width: 400px;
  margin: 0 auto;
  line-height: 1.6;
`

// ─── Info banner ──────────────────────────────────────────────────────────────

const InfoBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff;
  border: 0.5px solid #e2e8f0;
  border-left: 3px solid #1d4ed8;
  border-radius: 8px;
  padding: 0.875rem 1rem;
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.55;
  animation: ${fadeSlideUp} 0.45s 0.05s ease both;

  svg { color: #1d4ed8; flex-shrink: 0; width: 16px; height: 16px; margin-top: 2px; }
  strong { color: #0f172a; font-weight: 500; }

  @media (prefers-color-scheme: dark) {
    background: #1e293b;
    border-color: #334155;
    border-left-color: #3b82f6;
    color: #94a3b8;
    strong { color: #e2e8f0; }
  }
`

// ─── Tiers grid ───────────────────────────────────────────────────────────────

const TiersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(185px, 1fr));
  gap: 1rem;
  animation: ${fadeSlideUp} 0.45s 0.1s ease both;

  @media (max-width: 500px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 340px) {
    grid-template-columns: 1fr;
  }
`

// ─── Tier card ────────────────────────────────────────────────────────────────

interface TierCardProps {
  $selected: boolean
  $popular: boolean
}

const TierCard = styled.button<TierCardProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  background: #dbeafe;
  border: 0.5px solid #93c5fd;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.18s, transform 0.15s, box-shadow 0.18s;
  outline: none;

  &:hover {
    border-color: #3b82f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(29,78,216,0.12);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px #60a5fa;
  }

  ${({ $popular }) => $popular && css`
    border-color: #1d4ed8;
  `}

  ${({ $selected }) => $selected && css`
    border: 2px solid #1d4ed8 !important;
    background: #dbeafe;
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(29,78,216,0.15);
  `}

  @media (prefers-color-scheme: dark) {
    background: #ffffff;
    border-color: #334155;

    ${({ $selected }) => $selected && css`
      background: #d1dcff;
      border-color: #3b82f6 !important;
    `}
  }
`

const PopularBadge = styled.span`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: #1d4ed8;
  color: #eff6ff;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 100px;
  white-space: nowrap;
`

interface IconWrapProps { $color: string; $bg: string }

const IconWrap = styled.div<IconWrapProps>`
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  flex-shrink: 0;

  svg { width: 18px; height: 18px; }
`

const TierName = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;

  @media (prefers-color-scheme: dark) { color: #3f5061; }
`

const TierPrice = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;

  span {
    font-size: 0.8rem;
    font-weight: 400;
    color: #111316;
    font-family: 'DM Sans', sans-serif;
  }

  @media (prefers-color-scheme: dark) { color: #1b2025; }
`

const Divider = styled.hr`
  border: none;
  border-top: 0.5px solid #e2e8f0;
  margin: 0;

  @media (prefers-color-scheme: dark) { border-color: #334155; }
`

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
`

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.78rem;
  color: #64748b;

  svg { width: 13px; height: 13px; color: #1d4ed8; flex-shrink: 0; }
`

interface SelectBtnProps { $selected: boolean }

const SelectBtn = styled.div<SelectBtnProps>`
  width: 100%;
  padding: 0.55rem;
  border-radius: 7px;
  border: 0.5px solid ${({ $selected }) => $selected ? '#1d4ed8' : '#cbd5e1'};
  background: ${({ $selected }) => $selected ? '#1d4ed8' : 'transparent'};
  color: ${({ $selected }) => $selected ? '#eff6ff' : '#64748b'};
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  pointer-events: none;
  transition: all 0.18s;
`

// ─── Selected summary ─────────────────────────────────────────────────────────

const SelectedSummary = styled.div`
  background: #f8fafc;
  border: 0.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  overflow: hidden;
  animation: ${summaryReveal} 0.3s ease both;

  @media (prefers-color-scheme: dark) {
    background: #f8fafc;
    border-color: #334155;
  }
`

const SummaryHead = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1d4ed8;
  margin-bottom: 1rem;

  svg { width: 16px; height: 16px; }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.75rem;
`

const StatItem = styled.div<{ $success?: boolean }>`
  background: #f7f7f7;
  border-radius: 8px;
  padding: 0.75rem;

  @media (prefers-color-scheme: dark) { background: #ebebeb; }
`

const StatLabel = styled.div`
  font-size: 0.72rem;
  color: #222831;
  margin-bottom: 3px;
`

const StatVal = styled.div<{ $success?: boolean }>`
  font-family: 'Syne', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ $success }) => $success ? '#15803d' : '#0f172a'};

  @media (prefers-color-scheme: dark) {
    color: ${({ $success }) => $success ? '#4ade80' : '#1a2229'};
  }
`

// ─── Skip section ─────────────────────────────────────────────────────────────

const SkipSection = styled.div`
  text-align: center;
  padding: 1.25rem 0 0.25rem;
  border-top: 0.5px dashed #cbd5e1;
`

const SkipBtn = styled.button`
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: color 0.15s;

  &:hover { color: #64748b; text-decoration: underline; }

  svg { width: 14px; height: 14px; }
`

// ─── Tier config ──────────────────────────────────────────────────────────────

const TIER_META = {
  free:  { icon: Leaf,   iconBg: '#f1f5f9', iconColor: '#64748b', features: ['Standard placement', '1× visibility', '30 days active'] },
  pro:   { icon: Rocket, iconBg: '#eff6ff', iconColor: '#1d4ed8', features: ['10× visibility', '30 days active', 'Featured placement', 'Priority support'], popular: true },
} as const

// ─── Component ────────────────────────────────────────────────────────────────

interface Step5BoostSelectionProps {
  selectedTier: string | null
  onTierSelect: (tier: string) => void
  onSkip: () => void
}

export const Step5BoostSelection: React.FC<Step5BoostSelectionProps> = ({
  selectedTier,
  onTierSelect,
  onSkip,
}) => {
  const selectedTierData = selectedTier
    ? BOOST_TIERS[selectedTier as keyof typeof BOOST_TIERS]
    : null

  return (
    <Wrap>
      <Header>
        <Eyebrow><Zap /> Optional add-on</Eyebrow>
        <Title>Supercharge your reach</Title>
        <Subtitle>
          Boosted campaigns surface more often in supporter feeds. Pick a tier that fits your goals.
        </Subtitle>
      </Header>

      <InfoBanner>
        <Info />
        <div>
          <strong>You can always boost later.</strong>{' '}
          Boosts activate the moment your campaign publishes and run for the full duration selected.
        </div>
      </InfoBanner>

      <TiersGrid>
        {(Object.keys(BOOST_TIERS) as Array<keyof typeof BOOST_TIERS>).map((tier) => {
          const tierData = BOOST_TIERS[tier]
          const meta = TIER_META[tier as keyof typeof TIER_META]
          if (!meta) return null
          const Icon = meta.icon
          const isSelected = selectedTier === tier
          const isPopular = 'popular' in meta && meta.popular

          return (
            <TierCard
              key={tier}
              $selected={isSelected}
              $popular={!!isPopular}
              onClick={() => onTierSelect(tier)}
              aria-pressed={isSelected}
              aria-label={`${tierData.name} boost tier, $${tierData.price}`}
            >
              {isPopular && <PopularBadge>Most popular</PopularBadge>}

              <IconWrap $bg={meta.iconBg} $color={meta.iconColor}>
                <Icon />
              </IconWrap>

              <div>
                <TierName>{tierData.name}</TierName>
                <TierPrice>
                  {tierData.price === 0 ? 'Free' : `$${tierData.price.toFixed(2)}`}
                  {tierData.price > 0 && <span> / one-time</span>}
                </TierPrice>
              </div>

              <Divider />

              <FeatureList>
                {meta.features.map((feat) => (
                  <FeatureItem key={feat}>
                    <Check /> {feat}
                  </FeatureItem>
                ))}
              </FeatureList>

              <SelectBtn $selected={isSelected}>
                {isSelected ? '✓ Selected' : 'Select'}
              </SelectBtn>
            </TierCard>
          )
        })}
      </TiersGrid>

      {selectedTierData && (
        <SelectedSummary>
          <SummaryHead>
            <Check /> Summary — {selectedTierData.name} tier
          </SummaryHead>
          <StatsGrid>
            <StatItem>
              <StatLabel>Price</StatLabel>
              <StatVal>
                {selectedTierData.price === 0 ? 'Free' : `$${selectedTierData.price.toFixed(2)}`}
              </StatVal>
            </StatItem>
            <StatItem>
              <StatLabel>Visibility</StatLabel>
              <StatVal>{selectedTierData.visibility_weight}×</StatVal>
            </StatItem>
            <StatItem>
              <StatLabel>Duration</StatLabel>
              <StatVal>
                {selectedTierData.duration_days ? `${selectedTierData.duration_days} days` : 'Ongoing'}
              </StatVal>
            </StatItem>
            <StatItem $success>
              <StatLabel>Status</StatLabel>
              <StatVal $success>✓ Ready</StatVal>
            </StatItem>
          </StatsGrid>
        </SelectedSummary>
      )}

      <SkipSection>
        <SkipBtn onClick={onSkip}>
          Skip boost and publish now <ChevronRight />
        </SkipBtn>
      </SkipSection>
    </Wrap>
  )
}

export default Step5BoostSelection