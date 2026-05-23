/* ============================================
    NEW SECTION: 4 Support Meters
    Added: 2026-05-23 | Author: Honest Need Dev
============================================ */

'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Container, { Section } from '../ui/Container';
import Button from '../ui/Button';

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

const MetersGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MeterCard = styled(motion.div)`
  background-color: #1E293B; /* Subtle dark background */
  border-radius: ${({ theme }) => theme?.radii?.medium || '12px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'};
  border-left: 6px solid ${({ $accentColor }) => $accentColor};
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => theme?.spacing?.md || '16px'};
  transition: all 200ms cubic-bezier(0.2, 0.9, 0.2, 1);
  min-height: 220px;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
  }
`;

const CardTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const EmojiContainer = styled.span`
  font-size: 2.25rem;
  line-height: 1;
`;

const StatBadge = styled.span`
  font-size: ${({ theme }) => theme?.typography?.sizes?.xs?.size || '12px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: ${({ $accentColor }) => $accentColor};
  background-color: ${({ $accentColor }) => `${$accentColor}1C`}; /* 11% opacity */
  padding: 6px 14px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid ${({ $accentColor }) => `${$accentColor}33`};
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MeterLabel = styled.span`
  font-size: ${({ theme }) => theme?.typography?.sizes?.xs?.size || '12px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ $accentColor }) => $accentColor};
  text-transform: uppercase;
  letter-spacing: 0.075em;
`;

const Headline = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '20px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: #F8FAFC;
  margin: 0;
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: #94A3B8;
  line-height: 1.6;
  margin: 0;
`;

const CTAWrap = styled.div`
  text-align: center;
`;

const SUPPORT_METERS = [
  {
    id: "money",
    emoji: "💰",
    label: "Money Meter",
    headline: "Financial Support",
    description: "Direct financial donations to help individuals, families, businesses, ministries, or causes cover urgent needs — from medical bills and rent to business startup costs.",
    color: "#10B981",
    exampleStat: "$120K+ raised"
  },
  {
    id: "helping_hands",
    emoji: "🛠️",
    label: "Helping Hands Meter",
    headline: "Volunteer Support",
    description: "Connect with volunteers who can physically help — moving assistance, home repairs, yard work, event setup, childcare, elderly care, and more.",
    color: "#F59E0B",
    exampleStat: "8.4K+ supporters"
  },
  {
    id: "customers",
    emoji: "📈",
    label: "Customers Meter",
    headline: "Business Growth Support",
    description: "Help small businesses and service providers gain new customers, referrals, and community visibility. Support a local business by becoming their next loyal customer.",
    color: "#3B82F6",
    exampleStat: "1.2K+ campaigns"
  },
  {
    id: "prayer",
    emoji: "🙏",
    label: "Prayer Meter",
    headline: "Prayer & Encouragement",
    description: "Sometimes people need more than money — they need hope. Send prayers, words of encouragement, and spiritual support to those going through difficult seasons.",
    color: "#8B5CF6",
    exampleStat: "Community-powered"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.2, 0.9, 0.2, 1] }
  }
};

export default function FourWaysHelp() {
  const router = useRouter();

  const handleStartCampaign = () => {
    router.push('/campaigns/new');
  };

  return (
    <Section id="four-ways-help" $bgColor="bg">
      <Container>
        <SectionHeader>
          <SectionTitle>Four Ways Your Community Can Help</SectionTitle>
          <SectionSubtitle>
            Real needs come in many forms. Honest Need supports all of them.
          </SectionSubtitle>
        </SectionHeader>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <MetersGrid>
            {SUPPORT_METERS.map((meter) => (
              <MeterCard 
                key={meter.id} 
                $accentColor={meter.color}
                variants={itemVariants}
              >
                <CardTop>
                  <EmojiContainer aria-label={meter.label}>{meter.emoji}</EmojiContainer>
                  <StatBadge $accentColor={meter.color}>{meter.exampleStat}</StatBadge>
                </CardTop>
                <CardContent>
                  <MeterLabel $accentColor={meter.color}>{meter.label}</MeterLabel>
                  <Headline>{meter.headline}</Headline>
                  <Description>{meter.description}</Description>
                </CardContent>
              </MeterCard>
            ))}
          </MetersGrid>
        </motion.div>

        <CTAWrap>
          <Button size="large" onClick={handleStartCampaign}>
            Start a Campaign — $19.99
          </Button>
        </CTAWrap>
      </Container>
    </Section>
  );
}
