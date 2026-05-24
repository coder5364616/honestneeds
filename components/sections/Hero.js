'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiPlay, FiArrowRight, FiUsers, FiHeart, FiShare2 } from 'react-icons/fi';
import Button from '../ui/Button';
import Container from '../ui/Container';

const HeroSection = styled.section`
  padding: ${({ theme }) => theme?.spacing?.['4xl'] || '48px'} 0;
  background: linear-gradient(135deg, ${({ theme }) => theme?.colors?.bg || '#F8FAFC'} 0%, #FFFFFF 100%);
  overflow: hidden;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    padding: ${({ theme }) => theme?.spacing?.['6xl'] || '80px'} 0;
  }
`;

const HeroContainer = styled(Container)`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};
  align-items: center;

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
`;

const Headline = styled(motion.h1)`
  font-size: clamp(32px, 5vw, 48px);
  line-height: 1.1;
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || '700'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};

  span {
    color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  }
`;

const Subhead = styled(motion.p)`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h4?.size || '20px'};
  line-height: 1.5;
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  max-width: 480px;
`;

const CTAGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme?.spacing?.md || '12px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.mobile || '640px'}) {
    flex-direction: row;
    align-items: center;
  }
`;

const TrustCopy = styled(motion.p)`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.xs || '4px'};

  svg {
    color: ${({ theme }) => theme?.colors?.success || '#10B981'};
  }
`;

const HeroVisual = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IllustrationContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  aspect-ratio: 1;
`;

const CommunityCircle = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterIcon = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${({ theme }) => theme?.colors?.primary || '#6366F1'} 0%, ${({ theme }) => theme?.colors?.secondary || '#F43F5E'} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme?.shadows?.elevation3 || '0 18px 50px rgba(15, 23, 42, 0.12)'};

  svg {
    width: 56px;
    height: 56px;
    color: white;
  }
`;

const OrbitingElement = styled(motion.div)`
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  box-shadow: ${({ theme }) => theme?.shadows?.elevation2 || '0 6px 18px rgba(15, 23, 42, 0.08)'};
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 28px;
    height: 28px;
    color: ${({ color }) => color};
  }
`;

const DemoButton = styled(motion.button)`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.sm || '8px'};
  padding: ${({ theme }) => theme?.spacing?.md || '12px'} ${({ theme }) => theme?.spacing?.xl || '24px'};
  background-color: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border-radius: ${({ theme }) => theme?.radii?.pill || '9999px'};
  box-shadow: ${({ theme }) => theme?.shadows?.elevation2 || '0 6px 18px rgba(15, 23, 42, 0.08)'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  transition: all ${({ theme }) => theme?.transitions?.fast || '140ms cubic-bezier(0.2, 0.9, 0.2, 1)'};

  &:hover {
    box-shadow: ${({ theme }) => theme?.shadows?.elevation3 || '0 18px 50px rgba(15, 23, 42, 0.12)'};
    transform: translateX(-50%) translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
  }
`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
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

export default function Hero() {
  const router = useRouter();

  const handleStartCampaign = () => {
    router.push('/login');
  };

  const handleViewSponsorships = () => {
    router.push('/sponsorships');
  };

  return (
    <HeroSection>
      <HeroContainer>
        <HeroContent>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Headline variants={itemVariants}>
              Help a Neighbor.<br />
              <span>Change a Life.</span>
            </Headline>

            <Subhead variants={itemVariants}>
              Create a need, share it with your community, and let people help — directly.
            </Subhead>

            <CTAGroup variants={itemVariants}>
              <Button size="large" icon={FiHeart} onClick={handleStartCampaign}>
                Start a Campaign — $19.99
              </Button>
              <Button variant="ghost" icon={FiArrowRight} onClick={handleViewSponsorships}>
                View Sponsorships
              </Button>
            </CTAGroup>

            <TrustCopy variants={itemVariants}>
              <FiHeart size={14} />
              Person-to-person payments — HonestNeed displays payment options; funds move directly.
            </TrustCopy>
          </motion.div>
        </HeroContent>

        <HeroVisual
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <IllustrationContainer>
            <CommunityCircle
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              <CenterIcon>
                <FiHeart />
              </CenterIcon>
            </CommunityCircle>

            <OrbitingElement
              style={{ top: '10%', left: '10%' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <FiUsers color="#E11D48" />
            </OrbitingElement>

            <OrbitingElement
              style={{ top: '10%', right: '10%' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <FiShare2 color="#6366F1" />
            </OrbitingElement>

            <OrbitingElement
              style={{ bottom: '20%', left: '5%' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
            >
              <FiHeart color="#F59E0B" />
            </OrbitingElement>

            <OrbitingElement
              style={{ bottom: '20%', right: '5%' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <FiHeart color="#10B981" />
            </OrbitingElement>

            <DemoButton
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlay />
              Play 60s demo
            </DemoButton>
          </IllustrationContainer>
        </HeroVisual>
      </HeroContainer>
    </HeroSection>
  );
}
