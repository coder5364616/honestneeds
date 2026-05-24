'use client';

import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiPlay, FiStar } from 'react-icons/fi';
import Container, { Section } from '../ui/Container';
import Avatar from '../ui/Avatar';

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
`;

const TestimonialsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme?.spacing?.xl || '24px'};
  margin-bottom: ${({ theme }) => theme?.spacing?.['3xl'] || '48px'};

  @media (min-width: ${({ theme }) => theme?.breakpoints?.tablet || '1024px'}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const TestimonialCard = styled(motion.div)`
  background-color: ${({ theme }) => theme?.colors?.surface || '#FFFFFF'};
  border-radius: ${({ theme }) => theme?.radii?.large || '20px'};
  padding: ${({ theme }) => theme?.spacing?.xl || '24px'};
  box-shadow: ${({ theme }) => theme?.shadows?.elevation2 || '0 4px 12px rgba(0,0,0,0.1)'};
  position: relative;
`;

const QuoteIcon = styled.div`
  position: absolute;
  top: ${({ theme }) => theme?.spacing?.lg || '16px'};
  right: ${({ theme }) => theme?.spacing?.lg || '16px'};
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(244, 63, 94, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme?.colors?.secondary || '#F43F5E'};
  }
`;

const TestimonialText = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
  line-height: 1.7;
  margin-bottom: ${({ theme }) => theme?.spacing?.lg || '16px'};
  font-style: italic;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme?.spacing?.md || '12px'};
`;

const AuthorInfo = styled.div``

const AuthorName = styled.div`
  font-weight: ${({ theme }) => theme?.typography?.weights?.semibold || '600'};
  color: ${({ theme }) => theme?.colors?.text || '#0F172A'};
`;

const AuthorLocation = styled.div`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: ${({ theme }) => theme?.colors?.muted || '#64748B'};
`;

const Rating = styled.div`
  display: flex;
  gap: ${({ theme }) => theme?.spacing?.xs || '4px'};
  margin-top: ${({ theme }) => theme?.spacing?.xs || '4px'};

  svg {
    width: 14px;
    height: 14px;
    color: ${({ theme }) => theme?.colors?.accent || '#F59E0B'};
  }
`;

const VideoSection = styled(motion.div)`
  background: linear-gradient(135deg, #6366F1 0%, #4338CA 100%);
  border-radius: ${({ theme }) => theme?.radii?.large || '20px'};
  padding: ${({ theme }) => theme?.spacing?.['3xl'] || '40px'};
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const VideoContent = styled.div`
  position: relative;
  z-index: 1;
`;

const VideoTitle = styled.h3`
  font-size: ${({ theme }) => theme?.typography?.sizes?.h3?.size || '24px'};
  font-weight: ${({ theme }) => theme?.typography?.weights?.bold || 'bold'};
  color: white;
  margin-bottom: ${({ theme }) => theme?.spacing?.md || '12px'};
`;

const VideoDescription = styled.p`
  font-size: ${({ theme }) => theme?.typography?.sizes?.body?.size || '16px'};
  color: rgba(255, 255, 255, 0.9);
  max-width: 500px;
  margin: 0 auto ${({ theme }) => theme?.spacing?.xl || '24px'};
`;

const PlayButton = styled(motion.button)`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme?.colors?.primary || '#6366F1'};
    margin-left: 4px;
  }
`;

const VideoDuration = styled.div`
  font-size: ${({ theme }) => theme?.typography?.sizes?.small?.size || '14px'};
  color: rgba(255, 255, 255, 0.8);
  margin-top: ${({ theme }) => theme?.spacing?.md || '12px'};
`;

const testimonials = [
  {
    text: "HonestNeed helped us pay rent for two weeks — strangers showed up when we needed them most. The community support was overwhelming.",
    name: "Sarah M.",
    location: "Modesto, CA",
    rating: 5,
    avatar: '/avatar-sarah.jpg',
  },
  {
    text: "I raised $800 for school supplies in 48 hours. The share rewards feature made my students' project possible. Incredible platform!",
    name: "Tariq S.",
    location: "Sacramento, CA",
    rating: 5,
    avatar: '/avatar-tariq.jpg',
  },
  {
    text: "We found volunteers to renovate a shelter — the locality filters are brilliant. Connecting with local people made all the difference.",
    name: "Mike R.",
    location: "Fresno, CA",
    rating: 5,
    avatar: '/avatar-mike.jpg',
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

export default function Testimonials() {
  return (
    <Section $bgColor="bg">
      <Container>
        <SectionHeader>
          <SectionTitle>Success Stories</SectionTitle>
          <SectionSubtitle>
            Real people, real impact. See how HonestNeed is changing lives.
          </SectionSubtitle>
        </SectionHeader>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          <TestimonialsGrid>
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} variants={itemVariants}>
                <QuoteIcon>
                  <FiMessageCircle />
                </QuoteIcon>
                <TestimonialText>&quot;{testimonial.text}&quot;</TestimonialText>
                <TestimonialAuthor>
                  <Avatar src={testimonial.avatar} name={testimonial.name} size="medium" />
                  <AuthorInfo>
                    <AuthorName>{testimonial.name}</AuthorName>
                    <AuthorLocation>{testimonial.location}</AuthorLocation>
                    <Rating>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FiStar key={i} fill="currentColor" />
                      ))}
                    </Rating>
                  </AuthorInfo>
                </TestimonialAuthor>
              </TestimonialCard>
            ))}
          </TestimonialsGrid>
        </motion.div>

        {/* ================================================
            UPDATED SECTION: Mission Video — Success Stories
            Replaces: "Watch Sarah's Story" placeholder
            Video: mission-video.mp4
        ================================================ */}
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          background: '#000'
        }}>
          <div style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 ratio */ }}>
            <video
              src="/videos/mission-video.mp4"
              controls
              playsInline
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Video caption below player */}
        <p style={{
          textAlign: 'center',
          marginTop: '16px',
          fontSize: '0.9rem',
          opacity: 0.7,
          fontStyle: 'italic'
        }}>
          Real communities. Real impact. Real kindness — powered by Honest Need.
        </p>
      </Container>
    </Section>
  );
}
