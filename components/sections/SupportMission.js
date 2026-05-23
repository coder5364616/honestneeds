/* ============================================
    NEW SECTION: Support Our Mission — Donate
    Added: 2026-05-23 | Author: Honest Need Dev
============================================ */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Gift, Video, ArrowUpRight } from 'lucide-react';
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
  font-weight: 500;
`;

const ExplanationText = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  line-height: 1.6;
  max-width: 750px;
  margin: 0 auto;
`;

const ImpactRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
  margin-bottom: ${({ theme }) => theme?.spacing?.['4xl'] || '48px'};
  margin-top: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ImpactCard = styled.div`
  background: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#E2E8F0'};
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  padding: ${({ theme }) => theme?.spacing?.lg || '20px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  box-shadow: ${({ theme }) => theme?.shadows?.elevation1 || '0 2px 4px rgba(0,0,0,0.02)'};
`;

const ImpactIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme?.colors?.primaryBG || '#E0E7FF'};
  color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const ImpactTitle = styled.h4`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin: 0;
`;

const ImpactDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  line-height: 1.5;
  margin: 0;
`;

const DonationGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.lg || '20px'};
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.mobile || '768px'}) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const DonationCard = styled(motion.div)`
  background: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border: 2px solid ${({ theme }) => theme?.colors?.border || '#E2E8F0'};
  border-radius: ${({ theme }) => theme?.radii?.medium || '16px'};
  padding: ${({ theme }) => theme?.spacing?.lg || '20px'};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  text-align: center;
  position: relative;
  transition: all 200ms cubic-bezier(0.2, 0.9, 0.2, 1);
  min-height: 200px;

  &:hover {
    border-color: ${({ $color }) => $color};
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme?.shadows?.elevation2 || '0 6px 18px rgba(0,0,0,0.06)'};
  }
`;

const CardIcon = styled.div`
  font-size: 2.25rem;
  margin-bottom: 2px;
`;

const PlatformName = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin: 0;
`;

const PlatformHandle = styled.span`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  font-weight: 500;
  word-break: break-all;
  background-color: ${({ theme }) => theme?.colors?.bg || '#F8FAFC'};
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme?.colors?.border || '#E2E8F0'};
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background-color: ${({ $copied, $color }) => ($copied ? '#10B981' : $color)};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 150ms ease;

  &:hover {
    opacity: 0.9;
  }
`;

const ActionLink = styled.a`
  width: 100%;
  padding: 8px 12px;
  background-color: ${({ $color }) => $color};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 150ms ease;

  &:hover {
    opacity: 0.9;
    color: white;
    text-decoration: none;
  }
`;

const CopiedTooltip = styled(motion.div)`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #0F172A;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 11px;
  white-space: nowrap;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  z-index: 10;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: 8px;
    height: 8px;
    background-color: #0F172A;
  }
`;

const Disclaimer = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.xs?.size || '12px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  text-align: center;
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme?.spacing?.xl || '24px'} auto;
  line-height: 1.5;
`;

const QuoteWrap = styled.div`
  text-align: center;
  background-color: #1E293B; /* Dark slate background */
  border-radius: ${({ theme }) => theme?.radii?.large || '16px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'} ${({ theme }) => theme?.spacing?.['2xl'] || '32px'};
  max-width: 750px;
  margin: 0 auto ${({ theme }) => theme?.spacing?.['3xl'] || '40px'} auto;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
`;

const QuoteText = styled.blockquote`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '18px'};
  color: #F1F5F9;
  font-style: italic;
  line-height: 1.6;
  margin: 0 0 12px 0;
`;

const QuoteAuthor = styled.cite`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: #A5B4FC;
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  font-style: normal;
`;

const BottomCTA = styled.div`
  text-align: center;
`;

const StartCampaignLink = styled(Link)`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 150ms ease;

  &:hover {
    color: ${({ theme }) => theme?.colors?.primaryDark || '#4f46e5'};
    text-decoration: underline;
  }
`;

const DONATION_METHODS = [
  {
    platform: "PayPal",
    handle: "jbowser727@gmail.com",
    icon: "💳",
    deepLink: "https://paypal.me/jbowser727",
    buttonText: "Send via PayPal",
    color: "#003087"
  },
  {
    platform: "Venmo",
    handle: "@HonestNeed",
    icon: "💜",
    deepLink: "https://venmo.com/HonestNeed",
    buttonText: "Send via Venmo",
    color: "#3D95CE"
  },
  {
    platform: "Cash App",
    handle: "$jbowser727",
    icon: "💚",
    deepLink: "https://cash.app/$jbowser727",
    buttonText: "Send via Cash App",
    color: "#00C244"
  },
  {
    platform: "Zelle",
    handle: "209-622-9391",
    icon: "⚡",
    deepLink: null,
    buttonText: "Copy Number",
    copyValue: "2096229391",
    color: "#6D1ED4"
  },
  {
    platform: "Chime",
    handle: "@HonestNeed",
    icon: "🟡",
    deepLink: null,
    buttonText: "Copy Handle",
    copyValue: "@HonestNeed",
    color: "#FAC31E"
  }
];

export default function SupportMission() {
  const [copiedMethod, setCopiedMethod] = useState(null);

  const handleCopy = (platform, value) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopiedMethod(platform);
        setTimeout(() => {
          setCopiedMethod(null);
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <Section id="support-mission" $bgColor="bg">
      <Container>
        <SectionHeader>
          <SectionTitle>Support Our Mission — Help Us Bless More Communities</SectionTitle>
          <SectionSubtitle>
            Your gift helps us create more giveaways, support more families, and spread more kindness — on camera and in real life.
          </SectionSubtitle>
          <ExplanationText>
            Every dollar donated to Honest Need's mission fund goes directly toward community giveaways, surprise blessings, family support events, and the outreach videos that inspire thousands of people to believe that kindness still exists. We are building a movement, one act of generosity at a time. When you give to our mission, you are not just donating — you are becoming part of the story.
          </ExplanationText>
        </SectionHeader>

        <ImpactRow>
          <ImpactCard>
            <ImpactIcon>🎁</ImpactIcon>
            <ImpactTitle>Fund Community Giveaways</ImpactTitle>
            <ImpactDescription>
              Your gift helps us surprise families with cash, meals, and resources they didn't expect.
            </ImpactDescription>
          </ImpactCard>

          <ImpactCard>
            <ImpactIcon>📹</ImpactIcon>
            <ImpactTitle>Power Our Outreach Videos</ImpactTitle>
            <ImpactDescription>
              We document real acts of kindness. Your support keeps the camera rolling and the stories coming.
            </ImpactDescription>
          </ImpactCard>

          <ImpactCard>
            <ImpactIcon>🤲</ImpactIcon>
            <ImpactTitle>Multiply Every Dollar</ImpactTitle>
            <ImpactDescription>
              Through platform fees and community partnerships, every $1 donated creates $3+ in community impact.
            </ImpactDescription>
          </ImpactCard>
        </ImpactRow>

        <DonationGrid>
          {DONATION_METHODS.map((method) => {
            const isCopied = copiedMethod === method.platform;
            
            return (
              <DonationCard key={method.platform} $color={method.color}>
                <CardIcon>{method.icon}</CardIcon>
                <PlatformName>{method.platform}</PlatformName>
                <PlatformHandle>{method.handle}</PlatformHandle>
                
                {method.deepLink ? (
                  <ActionLink 
                    href={method.deepLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    $color={method.color}
                  >
                    {method.buttonText}
                    <ArrowUpRight size={14} />
                  </ActionLink>
                ) : (
                  <div style={{ width: '100%', position: 'relative' }}>
                    <ActionButton 
                      onClick={() => handleCopy(method.platform, method.copyValue)}
                      $copied={isCopied}
                      $color={method.color}
                    >
                      {isCopied ? 'Copied! ✅' : method.buttonText}
                    </ActionButton>
                    
                    <AnimatePresence>
                      {isCopied && (
                        <CopiedTooltip
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                        >
                          Copied! Open your {method.platform} app and paste.
                        </CopiedTooltip>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </DonationCard>
            );
          })}
        </DonationGrid>

        <Disclaimer>
          *Honest Need is a for-profit platform. Donations to our mission fund support platform operations, outreach content, and community giveaways directly managed by Honest Need Inc.
        </Disclaimer>

        <QuoteWrap>
          <QuoteText>
            "No amount is too small. A $5 gift today can become part of a $500 community blessing tomorrow. Thank you for believing in this mission."
          </QuoteText>
          <QuoteAuthor>— James Scott Bowser, Founder</QuoteAuthor>
        </QuoteWrap>

        <BottomCTA>
          <StartCampaignLink href="/campaigns/new">
            Start Your Own Campaign →
          </StartCampaignLink>
        </BottomCTA>
      </Container>
    </Section>
  );
}
