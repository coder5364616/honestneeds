'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styled from 'styled-components'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, TRANSITIONS, MEDIA_QUERIES } from '@/styles/tokens'
import { SPONSORSHIP_TIERS } from '@/lib/sponsorshipTiers'
import TierCard from '@/components/sponsorships/TierCard'
import SponsorWallGrid from '@/components/sponsorships/SponsorWallGrid'
import apiClient from '@/lib/api'
import { Heart, Users, TrendingUp, ChevronDown, ChevronUp, Shield, ArrowLeft } from 'lucide-react'

/* ───── Page Container ───── */

const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
`

/* ───── Hero Section ───── */

const HeroSection = styled.section`
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%);
  padding: ${SPACING[16]} ${SPACING[4]};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 60%),
                radial-gradient(circle at 70% 80%, rgba(244, 63, 94, 0.15) 0%, transparent 50%);
  }
`

const BackButton = styled.button`
  position: absolute;
  top: ${SPACING[5]};
  left: ${SPACING[5]};
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  padding: 8px 16px;
  border-radius: ${BORDER_RADIUS.FULL};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  border: 1px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: background ${TRANSITIONS.BASE};

  &:hover {
    background: rgba(255, 255, 255, 0.22);
  }
`

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
`

const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: ${COLORS.ACCENT_LIGHT};
  padding: 6px 18px;
  border-radius: ${BORDER_RADIUS.FULL};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  margin-bottom: ${SPACING[5]};
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const HeroTitle = styled.h1`
  font-size: ${TYPOGRAPHY.SIZE_4XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_EXTRABOLD};
  color: white;
  margin: 0 0 ${SPACING[4]} 0;
  line-height: ${TYPOGRAPHY.LINE_HEIGHT_TIGHT};

  ${MEDIA_QUERIES.DOWN_SM} {
    font-size: ${TYPOGRAPHY.SIZE_2XL};
  }
`

const HeroAccent = styled.span`
  background: linear-gradient(90deg, ${COLORS.ACCENT_LIGHT}, ${COLORS.ACCENT});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`

const HeroSubtitle = styled.p`
  font-size: ${TYPOGRAPHY.SIZE_LG};
  color: rgba(255, 255, 255, 0.8);
  max-width: 600px;
  margin: 0 auto ${SPACING[6]} auto;
  line-height: ${TYPOGRAPHY.LINE_HEIGHT_RELAXED};
`

const HeroStats = styled.div`
  display: flex;
  justify-content: center;
  gap: ${SPACING[8]};
  flex-wrap: wrap;
`

const StatItem = styled.div`
  text-align: center;
`

const StatValue = styled.div`
  font-size: ${TYPOGRAPHY.SIZE_2XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_EXTRABOLD};
  color: white;
`

const StatLabel = styled.div`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
`

/* ───── Tier Grid Section ───── */

const Section = styled.section`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${SPACING[12]} ${SPACING[4]};

  ${MEDIA_QUERIES.DOWN_SM} {
    padding: ${SPACING[8]} ${SPACING[4]};
  }
`

const SectionTitle = styled.h2`
  font-size: ${TYPOGRAPHY.SIZE_2XL};
  font-weight: ${TYPOGRAPHY.WEIGHT_BOLD};
  color: ${COLORS.TEXT};
  text-align: center;
  margin: 0 0 ${SPACING[2]} 0;
`

const SectionSubtitle = styled.p`
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  color: ${COLORS.MUTED_TEXT};
  text-align: center;
  max-width: 600px;
  margin: 0 auto ${SPACING[8]} auto;
`

const TierGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${SPACING[5]};

  ${MEDIA_QUERIES.DOWN_SM} {
    grid-template-columns: 1fr;
  }
`

const SectionDivider = styled.div`
  text-align: center;
  padding: ${SPACING[3]} 0;
  margin-top: ${SPACING[6]};
`

const DividerLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${SPACING[2]};
  background: ${COLORS.PRIMARY_BG};
  color: ${COLORS.PRIMARY_DARK};
  padding: ${SPACING[2]} ${SPACING[4]};
  border-radius: ${BORDER_RADIUS.FULL};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
`

/* ───── Mission Section ───── */

const MissionSection = styled.section`
  background: ${COLORS.BG};
  padding: ${SPACING[12]} ${SPACING[4]};
`

const MissionContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`

const MissionVideo = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  background: linear-gradient(135deg, #1e1b4b, #312e81);
  border-radius: ${BORDER_RADIUS.XL};
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: ${TYPOGRAPHY.SIZE_LG};
  margin-top: ${SPACING[6]};
  border: 1px solid ${COLORS.BORDER};
`

/* ───── Sponsor Wall Preview ───── */

const WallSection = styled.section`
  max-width: 1100px;
  margin: 0 auto;
  padding: ${SPACING[12]} ${SPACING[4]};
`

/* ───── FAQ Section ───── */

const FAQSection = styled.section`
  background: ${COLORS.BG};
  padding: ${SPACING[12]} ${SPACING[4]};
`

const FAQContainer = styled.div`
  max-width: 700px;
  margin: 0 auto;
`

const FAQItem = styled.div`
  background: ${COLORS.SURFACE};
  border: 1px solid ${COLORS.BORDER};
  border-radius: ${BORDER_RADIUS.LG};
  margin-bottom: ${SPACING[3]};
  overflow: hidden;
  transition: all ${TRANSITIONS.BASE};

  &:hover {
    border-color: ${COLORS.PRIMARY_LIGHT};
  }
`

const FAQQuestion = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${SPACING[4]} ${SPACING[5]};
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: ${TYPOGRAPHY.SIZE_BASE};
  font-weight: ${TYPOGRAPHY.WEIGHT_SEMIBOLD};
  color: ${COLORS.TEXT};

  svg { color: ${COLORS.MUTED}; flex-shrink: 0; }
`

const FAQAnswer = styled.div`
  padding: 0 ${SPACING[5]} ${SPACING[4]};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${COLORS.MUTED_TEXT};
  line-height: ${TYPOGRAPHY.LINE_HEIGHT_RELAXED};
`

const FAQ_DATA = [
  {
    q: "What happens after I sponsor?",
    a: "After checkout, you will complete a short onboarding questionnaire. Once submitted, your sponsor profile goes live on our public Sponsor Wall and you begin receiving all tier benefits.",
  },
  {
    q: "How is the 20% platform fee used?",
    a: "The platform fee covers Honest Need operational costs — server hosting, development, marketing, and community support — so we can keep helping people in need.",
  },
  {
    q: "Can I upgrade my sponsorship tier later?",
    a: "Yes! Contact us anytime and we will help you upgrade to a higher tier. You only pay the difference.",
  },
  {
    q: "Are sponsorships tax-deductible?",
    a: "Sponsorships are treated as business promotion expenses, not charitable donations. Please consult your tax advisor for specifics.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept PayPal, Venmo, Cash App, Zelle, and Chime. Payment details are shown during checkout.",
  },
]

/* ───── Page Component ───── */

export default function SponsorshipsPage() {
  const router = useRouter()
  const [sponsors, setSponsors] = useState([])
  const [openFAQ, setOpenFAQ] = useState(null)

  useEffect(() => {
    apiClient
      .get('/sponsorships/public')
      .then((res) => {
        if (res.data?.success) setSponsors(res.data.data || [])
      })
      .catch(() => {})
  }, [])

  const individualTiers = SPONSORSHIP_TIERS.filter((t) => t.price < 5000)
  const orgTiers = SPONSORSHIP_TIERS.filter((t) => t.price >= 5000)

  return (
    <PageWrapper>
      {/* ── Hero ── */}
      <HeroSection>
        <BackButton onClick={() => router.back()}>
          <ArrowLeft size={15} /> Back
        </BackButton>
        <HeroContent>
          <HeroBadge><Heart size={14} /> Founding Sponsor Program</HeroBadge>
          <HeroTitle>
            Become a <HeroAccent>Founding Sponsor</HeroAccent> of Honest Need
          </HeroTitle>
          <HeroSubtitle>
            Join a movement that sees good and does good. Your sponsorship directly funds community
            campaigns, empowers creators, and builds transparent support systems.
          </HeroSubtitle>
          <HeroStats>
            <StatItem>
              <StatValue>10.3K+</StatValue>
              <StatLabel>TikTok Followers</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>$0</StatValue>
              <StatLabel>VC Funding — Community Built</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>100%</StatValue>
              <StatLabel>Transparent Platform</StatLabel>
            </StatItem>
          </HeroStats>
        </HeroContent>
      </HeroSection>

      {/* ── Individual Tiers ── */}
      <Section id="sponsorship-tiers">
        <SectionTitle>Choose Your Sponsorship Tier</SectionTitle>
        <SectionSubtitle>
          Every tier makes an impact. Select the level that matches your commitment to community.
        </SectionSubtitle>
        <TierGrid>
          {individualTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </TierGrid>

        {/* ── Organization Tiers ── */}
        <SectionDivider>
          <DividerLabel>
            <Shield size={16} /> Organization & Enterprise Tiers
          </DividerLabel>
        </SectionDivider>
      </Section>

      <Section style={{ paddingTop: 0 }}>
        <SectionSubtitle>
          Multi-year marketing partnerships for businesses that want lasting community impact.
        </SectionSubtitle>
        <TierGrid>
          {orgTiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} />
          ))}
        </TierGrid>
      </Section>

      {/* ================================================
          NEW SECTION: Community Impact Video
          Page: /sponsorships
          Placement: After tier cards, before FAQ/footer
          Video: mission-video.mp4
      ================================================ */}
      <section style={{
        padding: '80px 24px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
        textAlign: 'center'
      }}>
        {/* Section Header */}
        <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '12px' }}>
          See the Community You&apos;ll Be Sponsoring
        </h2>
        <p style={{
          fontSize: '1.1rem',
          opacity: 0.75,
          maxWidth: '600px',
          margin: '0 auto 16px'
        }}>
          This is what your sponsorship makes possible — real neighborhoods,
          real families, real change.
        </p>
        <p style={{
          fontSize: '1rem',
          opacity: 0.65,
          maxWidth: '680px',
          margin: '0 auto 40px',
          lineHeight: '1.7'
        }}>
          When you become a founding sponsor of Honest Need, your brand doesn&apos;t
          just get placement — it gets purpose. Watch how we&apos;re already showing up
          in communities, running giveaways, and creating moments that people will
          never forget.
        </p>

        {/* Video Player */}
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 40px',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          background: '#000'
        }}>
          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
            <video
              src="https://res.cloudinary.com/dctvil2gu/video/upload/v1779616053/modified-video_lotu6r.mp4"
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

        {/* Post-Video CTA */}
        <p style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          marginBottom: '20px',
          opacity: 0.9
        }}>
          Ready to put your brand at the heart of this movement?
        </p>
        <a
          href="#sponsorship-tiers"
          style={{
            display: 'inline-block',
            padding: '16px 36px',
            borderRadius: '9999px',
            fontWeight: '700',
            fontSize: '1rem',
            textDecoration: 'none',
            background: 'linear-gradient(135deg, #10B981, #3B82F6)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(16,185,129,0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          Become a Founding Sponsor Today →
        </a>
      </section>

      {/* ── Mission Video ── */}
      <MissionSection>
        <MissionContent>
          <SectionTitle>Our Mission</SectionTitle>
          <SectionSubtitle>
            &quot;See Good. Do Good. Together We Win.&quot; — Honest Need is a faith-based, community-driven
            platform built on transparency and mutual support.
          </SectionSubtitle>
          <MissionVideo>
            <video
              width="100%"
              style={{ borderRadius: '16px' }}
              controls
            >
              <track kind="captions" />
              Your browser does not support the video tag.
            </video>
          </MissionVideo>
        </MissionContent>
      </MissionSection>

      {/* ── Existing Sponsors ── */}
      <WallSection>
        <SectionTitle>Our Founding Sponsors</SectionTitle>
        <SectionSubtitle>
          These businesses and individuals believe in community.
        </SectionSubtitle>
        <SponsorWallGrid sponsors={sponsors} />
      </WallSection>

      {/* ── FAQ ── */}
      <FAQSection>
        <FAQContainer>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <SectionSubtitle>Everything you need to know about sponsoring Honest Need.</SectionSubtitle>
          {FAQ_DATA.map((item, i) => (
            <FAQItem key={i}>
              <FAQQuestion onClick={() => setOpenFAQ(openFAQ === i ? null : i)}>
                {item.q}
                {openFAQ === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </FAQQuestion>
              {openFAQ === i && <FAQAnswer>{item.a}</FAQAnswer>}
            </FAQItem>
          ))}
        </FAQContainer>
      </FAQSection>
    </PageWrapper>
  )
}
