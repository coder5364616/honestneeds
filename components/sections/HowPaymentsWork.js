'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiUser, FiSmartphone, FiHeart, FiCheck, FiShield, FiLock } from 'react-icons/fi';
import Container, { Section } from '../ui/Container';

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};
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
  max-width: 600px;
  margin: 0 auto;
`;

const FlowDiagram = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    flex-direction: row;
    justify-content: center;
  }
`;

const FlowStep = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme?.spacing?.md || '12px'};
`;

const StepIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme, $color }) => {
    switch ($color) {
      case 'primary': return 'rgba(99, 102, 241, 0.1)';
      case 'secondary': return 'rgba(167, 139, 250, 0.1)';
      case 'success': return 'rgba(16, 185, 129, 0.1)';
      default: return theme?.colors?.bg || '#F8FAFC';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 36px;
    height: 36px;
    color: ${({ theme, $color }) => {
      switch ($color) {
        case 'primary': return theme?.colors?.primary || '#6366F1';
        case 'secondary': return theme?.colors?.secondary || '#A78BFA';
        case 'success': return theme?.colors?.success || '#10B981';
        default: return theme?.colors?.muted || '#64748B';
      }
    }};
  }
`;

const StepLabel = styled.div`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
`;

const Arrow = styled.div`
  display: none;
  color: ${({ theme }) => theme?.colors?.border || '#E2E8F0'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    display: block;
  }

  svg {
    width: 32px;
    height: 32px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled(motion.div)`
  background-color: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'};
  box-shadow: ${({ theme }) => theme?.shadows?.elevation1 || '0 1px 3px rgba(0,0,0,0.1)'};
  text-align: center;
`;

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme?.colors?.bg || '#F8FAFC'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => theme?.spacing?.md || '12px'};

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  }
`;

const FeatureTitle = styled.h4`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '18px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: ${({ theme }) => theme?.spacing?.sm || '8px'};
`;

const FeatureDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  line-height: 1.6;
  margin-bottom: 0;
`;

const SafetyNote = styled.div`
  background-color: rgba(16, 185, 129, 0.08);
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  padding: ${({ theme }) => theme?.spacing?.lg || '16px'};
  margin-top: ${({ theme }) => theme?.spacing?.['2xl'] || '32px'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.md || '12px'};

  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme?.colors?.success || '#10B981'};
    flex-shrink: 0;
  }
`;

const SafetyText = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  margin-bottom: 0;

  strong {
    color: ${({ theme }) => theme?.colors?.success || '#10B981'};
  }
`;

const flowSteps = [
  { icon: FiUser, label: 'You', color: 'primary' },
  { icon: FiSmartphone, label: 'Payment App', color: 'secondary' },
  { icon: FiHeart, label: 'Recipient', color: 'success' },
];

const features = [
  {
    icon: FiCheck,
    title: 'Direct Transfer',
    description: 'Funds move directly from donor to recipient through trusted payment apps.',
  },
  {
    icon: FiShield,
    title: 'No Middleman',
    description: 'HonestNeed only displays payment options. We never hold your money.',
  },
  {
    icon: FiLock,
    title: 'Secure & Private',
    description: 'Your payment information stays with you. Share only what you choose.',
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

export default function HowPaymentsWork() {
  return (
    <Section $bgColor="bg">
      <Container>
        <SectionHeader>
          <SectionTitle>How Payments Work</SectionTitle>
          <SectionSubtitle>
            Simple, direct, and transparent. No hidden fees on donations.
          </SectionSubtitle>
        </SectionHeader>

        <FlowDiagram>
          {flowSteps.map((step, index) => (
            <FlowStep
              key={step.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <StepIcon $color={step.color}>
                <step.icon />
              </StepIcon>
              <StepLabel>{step.label}</StepLabel>
            </FlowStep>
          ))}
        </FlowDiagram>

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

        <SafetyNote>
          <FiShield />
          <SafetyText>
            <strong>Safety Tip:</strong> Always verify recipient details before sending money. 
            HonestNeed displays payment options, but the transfer happens directly between you and the recipient.
          </SafetyText>
        </SafetyNote>

        <div style={{
          marginTop: '24px',
          fontSize: '0.85rem',
          opacity: 0.65,
          textAlign: 'center',
          lineHeight: '1.6',
          maxWidth: '720px',
          margin: '24px auto 0',
          color: '#475569'
        }}>
          Honest Need is a payment directory platform. Campaign creation fees are 
          processed securely via Stripe. All peer-to-peer donations are sent directly 
          from supporter to recipient through their chosen payment application 
          (PayPal, Venmo, Cash App, Zelle, or Chime). Honest Need does not hold, 
          process, or have access to peer-to-peer donation funds.
        </div>
      </Container>
    </Section>
  );
}
