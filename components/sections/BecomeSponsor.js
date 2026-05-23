/* ============================================
    NEW SECTION: Become a Founding Sponsor
    Added: 2026-05-23 | Author: Honest Need Dev
============================================ */

'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { Check, Star, Shield, Users, Globe } from 'lucide-react';
import Container, { Section } from '../ui/Container';

const SectionHeader = styled.div`
  text-align: center;
  max-width: 800px;
  margin: 0 auto ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h2?.size || '32px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '12px'};
`;

const SectionSubtitle = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '16px'};
`;

const BodyText = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  line-height: 1.6;
  max-width: 700px;
  margin: 0 auto;
`;

const TiersGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};
  align-items: stretch;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TierCard = styled(motion.div)`
  position: relative;
  background: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border: 2px solid ${({ $popular, theme }) => ($popular ? theme?.colors?.accent || '#F59E0B' : theme?.colors?.border || '#E2E8F0')};
  border-radius: ${({ theme }) => theme?.radii?.large || '20px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'};
  display: flex;
  flex-direction: column;
  transition: all 200ms cubic-bezier(0.2, 0.9, 0.2, 1);
  overflow: hidden;
  box-shadow: ${({ theme }) => theme?.shadows?.elevation1 || '0 4px 6px rgba(0,0,0,0.05)'};

  ${({ $popular, theme }) =>
    $popular &&
    css`
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.15), ${theme?.shadows?.elevation2 || '0 6px 18px rgba(0,0,0,0.08)'};
      transform: scale(1.02);
      
      @media (min-width: 1024px) {
        transform: translateY(-8px) scale(1.02);
      }
    `}

  &:hover {
    transform: translateY(-8px) ${({ $popular }) => ($popular ? 'scale(1.03)' : '')};
    box-shadow: ${({ theme }) => theme?.shadows?.elevation3 || '0 18px 50px rgba(15, 23, 42, 0.12)'};
    border-color: ${({ $accentColor }) => $accentColor};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme?.colors?.accent || '#F59E0B'} 0%, ${({ theme }) => theme?.colors?.accentDark || '#D97706'} 100%);
  color: white;
  padding: 6px 16px;
  font-size: ${({ theme }) => theme?.typography?.sizes?.xs?.size || '12px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  border-radius: 0 0 0 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TierIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '8px'};
`;

const TierName = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '20px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: 4px;
`;

const HighlightBadge = styled.span`
  display: inline-block;
  background-color: ${({ $accentColor }) => `${$accentColor}1A`};
  color: ${({ $accentColor }) => $accentColor};
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: ${({ theme }) => theme?.typography?.sizes?.xs?.size || '12px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '16px'};
  align-self: flex-start;
  border: 1px solid ${({ $accentColor }) => `${$accentColor}33`};
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '16px'};
`;

const PriceVal = styled.span`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h2?.size || '32px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.extrabold || '800'};
  color: ${({ $accentColor }) => $accentColor};
`;

const PriceSuffix = styled.span`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
`;

const PerksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 ${({ theme }) => theme?.spacing?.xl || '24px'} 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`;

const PerkItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  line-height: 1.4;

  svg {
    flex-shrink: 0;
    color: ${({ theme }) => theme?.colors?.success || '#10B981'};
    margin-top: 2px;
  }
`;

const CardCTA = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${({ theme }) => theme?.spacing?.md || '12px'} ${({ theme }) => theme?.spacing?.lg || '16px'};
  background: ${({ $popular, $accentColor, theme }) =>
    $popular
      ? `linear-gradient(135deg, ${theme?.colors?.accent || '#F59E0B'} 0%, ${theme?.colors?.accentDark || '#D97706'} 100%)`
      : $accentColor};
  color: white;
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  transition: all 150ms ease-in-out;
  text-align: center;

  &:hover {
    opacity: 0.95;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  }
`;

const CTAWrap = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.xl || '24px'};
`;

const MainCTA = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme?.spacing?.lg || '16px'} ${({ theme }) => theme?.spacing?.['2xl'] || '32px'};
  background-color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  color: white;
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '18px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  transition: all 200ms ease;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);

  &:hover {
    background-color: ${({ theme }) => theme?.colors?.primaryDark || '#4f46e5'};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    text-decoration: none;
  }
`;

const TrustSignalsRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
  flex-wrap: wrap;
  border-top: 1px solid ${({ theme }) => theme?.colors?.border || '#E2E8F0'};
  padding-top: ${({ theme }) => theme?.spacing?.xl || '24px'};
  max-width: 800px;
  margin: 0 auto;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.medium || '500'};
`;

const FEATURED_TIERS = [
  {
    id: "silver_sponsor_org",
    name: "Silver Sponsorship",
    price: "$5,000",
    highlight: "1-Year Marketing Partnership",
    perks: ["Social media recognition", "Platform logo placement", "Press mention"],
    color: "#0F172A", // Silver Org Color from lib/sponsorshipTiers.js
    icon: "🌐"
  },
  {
    id: "gold_sponsor_org",
    name: "Gold Sponsorship",
    price: "$10,000",
    highlight: "3-Year Marketing Partnership",
    popular: true,
    perks: ["All Silver perks", "Homepage banner", "VIP partnership call"],
    color: "#7C2D12", // Gold Org Color from lib/sponsorshipTiers.js
    icon: "👑"
  },
  {
    id: "platinum_national",
    name: "Platinum / National",
    price: "$20,000",
    highlight: "7-Year National Partnership",
    perks: ["All Gold perks", "Permanent homepage banner", "Press & media features"],
    color: "#1E1B4B", // Platinum Org Color from lib/sponsorshipTiers.js
    icon: "🌟"
  }
];

export default function BecomeSponsor() {
  return (
    <Section id="become-sponsor" $bgColor="surface">
      <Container>
        <SectionHeader>
          <SectionTitle>Partner With Us — Become a Founding Sponsor</SectionTitle>
          <SectionSubtitle>
            Your business or brand can do more than advertise — it can help change lives.
          </SectionSubtitle>
          <BodyText>
            Honest Need is actively growing its community impact through founding sponsorships. By partnering with us, your business receives real marketing visibility — on our platform, across our social media, and in our community outreach — while directly funding the giveaways, support campaigns, and blessing initiatives that change lives in real neighborhoods.
          </BodyText>
        </SectionHeader>

        <TiersGrid>
          {FEATURED_TIERS.map((tier) => (
            <TierCard 
              key={tier.id} 
              $popular={tier.popular} 
              $accentColor={tier.color}
            >
              {tier.popular && (
                <PopularBadge>
                  <Star size={12} fill="white" /> Most Popular
                </PopularBadge>
              )}
              <TierIcon>{tier.icon}</TierIcon>
              <TierName>{tier.name}</TierName>
              <HighlightBadge $accentColor={tier.color}>{tier.highlight}</HighlightBadge>
              <PriceRow>
                <PriceVal $accentColor={tier.color}>{tier.price}</PriceVal>
                <PriceSuffix>/partnership</PriceSuffix>
              </PriceRow>
              <PerksList>
                {tier.perks.map((perk, idx) => (
                  <PerkItem key={idx}>
                    <Check size={16} />
                    <span>{perk}</span>
                  </PerkItem>
                ))}
              </PerksList>
              <CardCTA href={`/sponsorships/checkout/${tier.id}`} $popular={tier.popular} $accentColor={tier.color}>
                Become a Sponsor
              </CardCTA>
            </TierCard>
          ))}
        </TiersGrid>

        <CTAWrap>
          <MainCTA href="/sponsorships">
            View All Sponsorship Tiers →
          </MainCTA>
        </CTAWrap>

        <TrustSignalsRow>
          <TrustItem>
            <Users size={16} />
            <span>🏆 10.3K+ TikTok Followers</span>
          </TrustItem>
          <TrustItem>
            <Globe size={16} />
            <span>🌍 Community-Driven Platform</span>
          </TrustItem>
          <TrustItem>
            <Shield size={16} />
            <span>🤝 Founding Sponsor Slots Available</span>
          </TrustItem>
        </TrustSignalsRow>
      </Container>
    </Section>
  );
}
