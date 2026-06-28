'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheck, FiInfo, FiArrowRight } from 'react-icons/fi';
import Container, { Section } from '../ui/Container';
import Button from '../ui/Button';

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '48px'};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h2?.size || '32px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || 'bold'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '12px'};
`;

const SectionSubtitle = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  max-width: 600px;
  margin: 0 auto;
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
  max-width: 760px;
  margin: 0 auto ${({ theme }) => theme?.spacing?.['3xl'] || '48px'};
  align-items: stretch;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const PricingCard = styled(motion.div)`
  background-color: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border-radius: ${({ theme }) => theme?.radii?.large || '20px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'};
  box-shadow: ${({ theme }) => theme?.shadows?.elevation2 || '0 4px 12px rgba(0,0,0,0.1)'};
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;

  ${({ featured, theme }) => featured && `
    border: 2px solid ${theme?.colors?.primary || '#6366F1'};
    box-shadow: 0 12px 32px rgba(99,102,241,0.18);
  `}
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: ${({ theme }) => theme?.spacing?.xs || '4px'} ${({ theme }) => theme?.spacing?.lg || '16px'};
  background: linear-gradient(135deg, ${({ theme }) => theme?.colors?.primary || '#6366F1'} 0%, ${({ theme }) => theme?.colors?.secondary || '#F43F5E'} 100%);
  color: white;
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  border-radius: ${({ theme }) => theme?.radii?.pill || '9999px'};
`;

const PlanName = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '20px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || 'bold'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '8px'};
  text-align: center;
`;

const PlanPrice = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '16px'};
`;

const PriceAmount = styled.span`
  font-family: ${({ theme }) => theme?.typography?.headingFont || 'Inter, sans-serif'};
  font-size: 48px;
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || 'bold'};
  color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
`;

const PricePeriod = styled.span`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
`;

const PlanDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  text-align: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '16px'};
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 ${({ theme }) => theme?.spacing?.xl || '24px'} 0;
  flex: 1;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '8px'};
  padding: ${({ theme }) => theme?.spacing?.sm || '8px'} 0;
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};

  svg {
    width: 18px;
    height: 18px;
    color: ${({ theme }) => theme?.colors?.success || '#10B981'};
    flex-shrink: 0;
  }

  ${({ disabled, theme }) => disabled && `
    color: ${theme?.colors?.muted || '#64748B'};
    text-decoration: line-through;

    svg {
      color: ${theme?.colors?.border || '#E2E8F0'};
    }
  `}
`;

const FeeBreakdown = styled.div`
  background-color: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border-radius: ${({ theme }) => theme?.radii?.large || '20px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'};
  box-shadow: ${({ theme }) => theme?.shadows?.elevation2 || '0 4px 12px rgba(0,0,0,0.1)'};
`;

const BreakdownTitle = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '20px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '16px'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '8px'};

  svg {
    color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  }
`;

const BreakdownGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.lg || '16px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme?.spacing?.md || '12px'} 0;
  border-bottom: 1px solid ${({ theme }) => theme?.colors?.border || '#E2E8F0'};

  &:last-child {
    border-bottom: none;
  }
`;

const BreakdownLabel = styled.span`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
`;

const BreakdownValue = styled.span`
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};

  ${({ highlight, theme }) => highlight && `
    color: ${theme?.colors?.primary || '#6366F1'};
  `}
`;

const Note = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme?.spacing?.md || '12px'};
  padding: ${({ theme }) => theme?.spacing?.md || '12px'};
  background-color: ${({ theme }) => theme?.colors?.bg || '#F8FAFC'};
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  margin-top: ${({ theme }) => theme?.spacing?.lg || '16px'};

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
    flex-shrink: 0;
    margin-top: 2px;
  }
`;

const NoteText = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  margin-bottom: 0;
  line-height: 1.5;
`;

const plans = [
  {
    name: 'Free Campaign',
    price: 0,
    period: '/forever',
    badge: 'Always Free',
    description: 'Start a campaign in minutes — no card required. 100% of donations go straight to you.',
    features: [
      { text: 'Create & publish a campaign', included: true },
      { text: 'Campaign listing & discovery', included: true },
      { text: 'Share-to-earn rewards', included: true },
      { text: 'Real-time progress analytics', included: true },
      { text: '100% of donations to recipient', included: true },
    ],
    cta: 'Start for Free',
    featured: true,
  },
  {
    name: 'Standard Campaign',
    price: 19.99,
    period: '/campaign',
    badge: 'Premium',
    description: 'Everything in Free, plus extra reach when you want your need seen by more people.',
    features: [
      { text: 'Everything in Free', included: true },
      { text: 'Featured placement & visibility boost', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Enhanced campaign analytics', included: true },
      { text: 'Boost options from $5', included: true },
    ],
    cta: 'Get Started',
    featured: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.2, 0.9, 0.2, 1],
    },
  },
};

export default function Pricing() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push('/login');
  };

  return (
    <Section id="pricing">
      <Container>
        <SectionHeader>
          <SectionTitle>Pricing & Fees</SectionTitle>
          <SectionSubtitle>
            Transparent pricing. No hidden fees on donations.
          </SectionSubtitle>
        </SectionHeader>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <PricingGrid>
            {plans.map((plan) => (
              <PricingCard key={plan.name} featured={plan.featured} variants={itemVariants}>
                {plan.badge && <FeaturedBadge>{plan.badge}</FeaturedBadge>}
                <PlanName>{plan.name}</PlanName>
                <PlanPrice>
                  <PriceAmount>${plan.price}</PriceAmount>
                  <PricePeriod>{plan.period || '/campaign'}</PricePeriod>
                </PlanPrice>
                <PlanDescription>{plan.description}</PlanDescription>
                <FeaturesList>
                  {plan.features.map((feature) => (
                    <FeatureItem key={feature.text} disabled={!feature.included}>
                      <FiCheck />
                      {feature.text}
                    </FeatureItem>
                  ))}
                </FeaturesList>
                <Button
                  variant={plan.featured ? 'primary' : 'secondary'}
                  size="large"
                  style={{ width: '100%' }}
                  onClick={handleGetStarted}
                >
                  {plan.cta || 'Get Started'}
                </Button>
              </PricingCard>
            ))}
          </PricingGrid>
        </motion.div>

        <FeeBreakdown>
          <BreakdownTitle>
            <FiInfo />
            Fee Breakdown
          </BreakdownTitle>
          <BreakdownGrid>
            <div>
              <BreakdownItem>
                <BreakdownLabel>Campaign Creation</BreakdownLabel>
                <BreakdownValue highlight>Free</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Premium Listing</BreakdownLabel>
                <BreakdownValue>$19.99 (optional)</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Boost Pricing</BreakdownLabel>
                <BreakdownValue>From $5</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Platform Commission</BreakdownLabel>
                <BreakdownValue highlight>20%</BreakdownValue>
              </BreakdownItem>
            </div>
            <div>
              <BreakdownItem>
                <BreakdownLabel>Share Rewards</BreakdownLabel>
                <BreakdownValue>Set by creator</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Payment Processing</BreakdownLabel>
                <BreakdownValue>Via Stripe/PayPal</BreakdownValue>
              </BreakdownItem>
              <BreakdownItem>
                <BreakdownLabel>Donations</BreakdownLabel>
                <BreakdownValue highlight>100% to recipient</BreakdownValue>
              </BreakdownItem>
            </div>
          </BreakdownGrid>
          <Note>
            <FiInfo />
            <NoteText>
              Creating a campaign is free. HonestNeed does not process P2P donations — we
              collect platform fees only for optional premium listings, boosts, and share
              reward transactions. All donations go directly from donors to recipients.
            </NoteText>
          </Note>
        </FeeBreakdown>
      </Container>
    </Section>
  );
}
