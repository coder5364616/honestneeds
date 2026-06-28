'use client';

import { Fragment } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiSmartphone, FiHeart, FiCheck, FiShield, FiLock, FiArrowRight } from 'react-icons/fi';
import Container, { Section } from '../ui/Container';

// ─── Keyframes ────────────────────────────────────────────────────────────────

const pulseRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  70%  { transform: scale(1.35); opacity: 0;   }
  100% { transform: scale(1.35); opacity: 0;   }
`;

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '48px'};
`;

const EyebrowLabel = styled.span`
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 999px;
  padding: 4px 14px;
  margin-bottom: 14px;
`;

const SectionTitle = styled.h2`
  font-size: clamp(26px, 4vw, 36px);
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '8px'};
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const SectionSubtitle = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.65;
`;

// ─── Flow Diagram ─────────────────────────────────────────────────────────────

/**
 * KEY FIX: flex-direction is row by default (mobile-first).
 * We use flex: 1 on each FlowStep so they share the width evenly,
 * and min-width: 0 prevents overflow on narrow screens.
 * Arrows are hidden on mobile, shown from 480px upward.
 */
const FlowDiagram = styled.div`
  display: flex;
  flex-direction: row;           /* ← horizontal on ALL screen sizes */
  align-items: center;
  justify-content: center;
  gap: 0;                        /* gaps handled by Arrow spacer */
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '48px'};
  padding: 0 4px;
`;

const FlowStep = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
  flex: 1;
  min-width: 0;                  /* prevent overflow */
  max-width: 140px;

  @media (min-width: 480px) {
    max-width: 160px;
    gap: 12px;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
  flex-shrink: 0;

  @media (min-width: 480px) {
    width: 72px;
    height: 72px;
  }

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    width: 84px;
    height: 84px;
  }
`;

const PulseRingBase = styled.span`
  position: absolute;
  inset: 0;
  border-radius: 50%;
  animation: ${pulseRing} 2.8s ease-out infinite;
  animation-delay: ${({ $delay }) => $delay || '0s'};

  background-color: ${({ $color }) => {
    switch ($color) {
      case 'primary':   return 'rgba(99, 102, 241, 0.25)';
      case 'secondary': return 'rgba(167, 139, 250, 0.25)';
      case 'success':   return 'rgba(16, 185, 129, 0.25)';
      default:          return 'rgba(100,100,100,0.15)';
    }
  }};
`;

const StepIcon = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s ease;

  background: ${({ $color }) => {
    switch ($color) {
      case 'primary':   return 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0.06) 100%)';
      case 'secondary': return 'linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(167,139,250,0.06) 100%)';
      case 'success':   return 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.06) 100%)';
      default:          return '#F8FAFC';
    }
  }};

  border: 1.5px solid ${({ $color }) => {
    switch ($color) {
      case 'primary':   return 'rgba(99,102,241,0.22)';
      case 'secondary': return 'rgba(167,139,250,0.22)';
      case 'success':   return 'rgba(16,185,129,0.22)';
      default:          return '#E2E8F0';
    }
  }};

  box-shadow: ${({ $color }) => {
    switch ($color) {
      case 'primary':   return '0 4px 16px rgba(99,102,241,0.15)';
      case 'secondary': return '0 4px 16px rgba(167,139,250,0.15)';
      case 'success':   return '0 4px 16px rgba(16,185,129,0.15)';
      default:          return '0 2px 8px rgba(0,0,0,0.06)';
    }
  }};

  &:hover {
    transform: translateY(-3px) scale(1.04);
  }

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme, $color }) => {
      switch ($color) {
        case 'primary':   return theme?.colors?.primary   || '#6366F1';
        case 'secondary': return theme?.colors?.secondary || '#A78BFA';
        case 'success':   return theme?.colors?.success   || '#10B981';
        default:          return theme?.colors?.muted     || '#64748B';
      }
    }};

    @media (min-width: 480px) {
      width: 28px;
      height: 28px;
    }

    @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
      width: 34px;
      height: 34px;
    }
  }
`;

const StepLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.01em;
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  line-height: 1.3;

  @media (min-width: 360px) {
    font-size: 12px;
  }

  @media (min-width: 480px) {
    font-size: 14px;
  }

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    font-size: 15px;
  }
`;

const StepSubLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme?.colors?.muted || '#94A3B8'};
  display: none;

  @media (min-width: 400px) {
    display: block;
  }
`;

/**
 * Arrow connector between flow steps.
 * Visible at all widths — just scales with the viewport.
 * Flex-shrink: 0 keeps it from collapsing.
 */
const ArrowConnector = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;

  @media (min-width: 480px) {
    width: 36px;
  }

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    width: 56px;
  }

  svg {
    width: 16px;
    height: 16px;
    color: ${({ theme }) => theme?.colors?.border || '#CBD5E1'};
    flex-shrink: 0;

    @media (min-width: 480px) {
      width: 20px;
      height: 20px;
    }
  }
`;

// ─── Feature Cards ────────────────────────────────────────────────────────────

const FeaturesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.lg || '20px'};

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled(motion.div)`
  background: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border-radius: ${({ theme }) => theme?.radii?.medium || '14px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'};
  box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
  border: 1px solid rgba(226, 232, 240, 0.7);
  text-align: center;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }
`;

const FeatureIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: ${({ theme }) => theme?.colors?.bg || '#F8FAFC'};
  border: 1px solid rgba(99, 102, 241, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme?.spacing?.md || '12px'};

  svg {
    width: 22px;
    height: 22px;
    color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  }
`;

const FeatureTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: 6px;
  letter-spacing: -0.01em;
`;

const FeatureDescription = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  line-height: 1.65;
  margin-bottom: 0;
`;

// ─── Safety Note ──────────────────────────────────────────────────────────────

const SafetyNote = styled(motion.div)`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(16, 185, 129, 0.03) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  padding: ${({ theme }) => theme?.spacing?.lg || '16px'} ${({ theme }) => theme?.spacing?.xl || '20px'};
  margin-top: ${({ theme }) => theme?.spacing?.['2xl'] || '32px'};
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme?.spacing?.md || '12px'};

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme?.colors?.success || '#10B981'};
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const SafetyText = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme?.colors?.text || '#374151'};
  margin-bottom: 0;
  line-height: 1.65;

  strong {
    color: ${({ theme }) => theme?.colors?.success || '#059669'};
    font-weight: 700;
  }
`;

const Disclaimer = styled.p`
  margin: 24px auto 0;
  font-size: 12px;
  color: ${({ theme }) => theme?.colors?.muted || '#94A3B8'};
  text-align: center;
  line-height: 1.7;
  max-width: 680px;
  opacity: 0.8;
`;

// ─── Data ─────────────────────────────────────────────────────────────────────

const flowSteps = [
  { icon: FiUser,       label: 'You',          sub: 'Supporter',  color: 'primary',   pulseDelay: '0s'    },
  { icon: FiSmartphone, label: 'Payment App',  sub: 'Direct send', color: 'secondary', pulseDelay: '0.9s' },
  { icon: FiHeart,      label: 'Recipient',    sub: 'In full',    color: 'success',   pulseDelay: '1.8s'  },
];

const features = [
  {
    icon: FiCheck,
    title: 'Direct Transfer',
    description: 'Funds move directly from you to the recipient through trusted payment apps — no detours.',
  },
  {
    icon: FiShield,
    title: 'No Middleman',
    description: 'HonestNeed only displays payment options. We never hold or touch your money.',
  },
  {
    icon: FiLock,
    title: 'Secure & Private',
    description: 'Your payment info stays with you. Share only what you choose with whom you trust.',
  },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.2, 0.9, 0.2, 1] },
  },
};

const stepVariants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.18, duration: 0.5, ease: [0.2, 0.9, 0.2, 1] },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HowPaymentsWork() {
  return (
    <Section $bgColor="bg">
      <Container>

        {/* Header */}
        <SectionHeader>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <EyebrowLabel>Transparent by Design</EyebrowLabel>
            <SectionTitle>How Payments Work</SectionTitle>
            <SectionSubtitle>
              Simple, direct, and transparent. No hidden fees on donations — 
              every cent goes straight to the person who needs it.
            </SectionSubtitle>
          </motion.div>
        </SectionHeader>

        {/* Flow Diagram — always horizontal */}
        <FlowDiagram>
          {flowSteps.map((step, index) => (
            <Fragment key={step.label}>
              <FlowStep
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stepVariants}
              >
                <IconWrapper>
                  <PulseRingBase $color={step.color} $delay={step.pulseDelay} />
                  <StepIcon $color={step.color}>
                    <step.icon />
                  </StepIcon>
                </IconWrapper>
                <StepLabel>{step.label}</StepLabel>
                <StepSubLabel>{step.sub}</StepSubLabel>
              </FlowStep>

              {/* Arrow between steps (not after last) */}
              {index < flowSteps.length - 1 && (
                <ArrowConnector>
                  <FiArrowRight />
                </ArrowConnector>
              )}
            </Fragment>
          ))}
        </FlowDiagram>

        {/* Feature Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <FeaturesGrid>
            {features.map((feature) => (
              <FeatureCard key={feature.title} variants={itemVariants}>
                <FeatureIcon>
                  <feature.icon />
                </FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            ))}
          </FeaturesGrid>
        </motion.div>

        {/* Safety Note */}
        <SafetyNote
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <FiShield />
          <SafetyText>
            <strong>Safety Tip:</strong> Always verify recipient details before sending money.
            HonestNeed displays payment options, but the transfer happens directly between
            you and the recipient.
          </SafetyText>
        </SafetyNote>

        {/* Legal Disclaimer */}
        <Disclaimer>
          Honest Need is a payment directory platform. Campaign creation fees are processed
          securely via Stripe. All peer-to-peer donations are sent directly from supporter
          to recipient through their chosen payment application (PayPal, Venmo, Cash App,
          Zelle, or Chime). Honest Need does not hold, process, or have access to
          peer-to-peer donation funds.
        </Disclaimer>

      </Container>
    </Section>
  );
}