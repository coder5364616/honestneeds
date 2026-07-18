'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import {
  FiShare2, FiHeart, FiMapPin, FiClock,
  FiTrendingUp, FiShield, FiZap, FiUsers,
  FiAward, FiGift, FiCheckCircle
} from 'react-icons/fi';

// ─── Brand Tokens ────────────────────────────────────────────────────────────
// Gold:      #F5C518   Orange:  #FF8C00
// Sky Blue:  #29ABE2   Navy:    #1A2A5E
// Green:     #2E8B2E   Pink:    #E83E8C
// Cream:     #FFFBF0   Muted:   #64748B

// ─── Keyframes ───────────────────────────────────────────────────────────────
const shimmer = keyframes`
  0%   { background-position: -300% center; }
  100% { background-position:  300% center; }
`;

const badgePulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,197,24,0.55); }
  50%       { box-shadow: 0 0 0 10px rgba(245,197,24,0); }
`;

const urgencyBlink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
`;

const floatUp = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
`;

const progressFill = keyframes`
  from { width: 0%; }
  to   { width: 72%; }
`;

const rotateSlow = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

// ─── Section Wrapper ─────────────────────────────────────────────────────────
const Section = styled.section`
  position: relative;
  padding: 80px 16px 96px;
  background: linear-gradient(160deg, #0d1b3e 0%, #1a2a5e 45%, #0f2855 100%);
  font-family: 'Nunito', 'Poppins', system-ui, sans-serif;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 20% 50%, rgba(41,171,226,0.13) 0%, transparent 65%),
      radial-gradient(ellipse 50% 40% at 80% 20%, rgba(245,197,24,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 40% 35% at 85% 80%, rgba(232,62,140,0.08) 0%, transparent 55%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #F5C518, #FF8C00, #29ABE2, #E83E8C, #2E8B2E);
  }
`;

const Container = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

// ─── Section Eyebrow ─────────────────────────────────────────────────────────
const EyebrowRow = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
`;

const EyebrowPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 197, 24, 0.15);
  border: 1px solid rgba(245, 197, 24, 0.35);
  border-radius: 9999px;
  padding: 7px 18px;
  font-size: 12px;
  font-weight: 800;
  color: #F5C518;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  svg { width: 14px; height: 14px; }
`;

const VerifiedPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(46, 139, 46, 0.15);
  border: 1px solid rgba(46, 139, 46, 0.35);
  border-radius: 9999px;
  padding: 7px 16px;
  font-size: 12px;
  font-weight: 800;
  color: #4ADE80;
  letter-spacing: 0.06em;

  svg { width: 13px; height: 13px; }
`;

// ─── Main Card ───────────────────────────────────────────────────────────────
const FeaturedCard = styled(motion.div)`
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,197,24,0.08);
  display: grid;
  grid-template-columns: 1fr;

  @media (min-width: 900px) {
    grid-template-columns: 1.15fr 1fr;
  }
`;

// ─── Left: Media Panel ───────────────────────────────────────────────────────
const MediaPanel = styled.div`
  position: relative;
  min-height: 280px;
  background: linear-gradient(135deg, #1a3a6e 0%, #0d2244 50%, #162040 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  @media (min-width: 900px) {
    min-height: 520px;
  }
`;

// Campaign image display
const CampaignImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const GradientOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(13,27,62,0.1) 0%,
    transparent 30%,
    transparent 60%,
    rgba(13,27,62,0.85) 100%
  );

  @media (min-width: 900px) {
    background: linear-gradient(
      to right,
      transparent 60%,
      rgba(13,27,62,0.6) 100%
    );
  }
`;

const MediaBottomContent = styled.div`
  position: absolute;
  bottom: 24px;
  left: 24px;
  right: 24px;

  @media (min-width: 900px) {
    bottom: 32px;
    left: 32px;
    right: auto;
    max-width: 320px;
  }
`;

const CampaignCategory = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(41, 171, 226, 0.2);
  border: 1px solid rgba(41, 171, 226, 0.4);
  border-radius: 9999px;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 800;
  color: #29ABE2;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const BoostedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #F5C518, #FF8C00);
  color: #1A2A5E;
  font-size: 12px;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 9999px;
  letter-spacing: 0.05em;
  animation: ${badgePulse} 2.5s ease-in-out infinite;

  svg { width: 13px; height: 13px; }
`;

// ─── Right: Content Panel ─────────────────────────────────────────────────────
const ContentPanel = styled(motion.div)`
  padding: clamp(24px, 4vw, 44px);
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: center;
`;

const CreatorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AvatarRing = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #29ABE2, #1E90FF);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 900;
  color: #fff;
  border: 3px solid rgba(255,255,255,0.15);
  flex-shrink: 0;
`;

const CreatorInfo = styled.div``;

const CreatorName = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: rgba(255,255,255,0.9);
`;

const CreatorMeta = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 3px;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255,255,255,0.5);
  font-weight: 600;

  svg { width: 12px; height: 12px; }
`;

const UrgencyChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 800;
  color: #F87171;
  animation: ${urgencyBlink} 2s ease-in-out infinite;

  svg { width: 12px; height: 12px; }
`;

const CampaignTitle = styled.h2`
  font-size: clamp(22px, 3.5vw, 34px);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.2;
  letter-spacing: -0.02em;
  margin: 0;

  span.highlight {
    background: linear-gradient(90deg, #F5C518 0%, #FF8C00 50%, #F5C518 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 4s linear infinite;
  }
`;

const StoryText = styled.p`
  font-size: 15px;
  color: rgba(255,255,255,0.6);
  line-height: 1.75;
  margin: 0;
`;

// ─── Progress Block ───────────────────────────────────────────────────────────
const ProgressBlock = styled.div`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 18px;
  padding: 20px 22px;
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const RaisedAmount = styled.div`
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 900;
  color: #F5C518;
  font-family: 'Nunito', sans-serif;
  letter-spacing: -0.02em;
`;

const GoalLabel = styled.div`
  font-size: 13px;
  color: rgba(255,255,255,0.45);
  font-weight: 700;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 10px;
  background: rgba(255,255,255,0.08);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, #F5C518, #FF8C00, #F5C518);
  background-size: 200% auto;
  animation: ${shimmer} 3s linear infinite;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #FF8C00;
    box-shadow: 0 0 0 3px rgba(255,140,0,0.35);
  }
`;

const PercentLabel = styled.div`
  text-align: right;
  font-size: 12px;
  font-weight: 800;
  color: #FF8C00;
  margin-top: 8px;
`;

// ─── Stats Row ────────────────────────────────────────────────────────────────
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 14px;
`;

const StatTile = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  padding: 12px 10px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: clamp(16px, 2.5vw, 22px);
  font-weight: 900;
  color: #ffffff;
  font-family: 'Nunito', sans-serif;
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.07em;
`;

// ─── Reward Strip ─────────────────────────────────────────────────────────────
const RewardStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(46,139,46,0.12);
  border: 1px solid rgba(46,139,46,0.3);
  border-radius: 12px;
  padding: 10px 16px;
`;

const RewardIcon = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2E8B2E, #3AAA3A);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  svg { width: 16px; height: 16px; color: #fff; }
`;

const RewardText = styled.div``;

const RewardTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: #4ADE80;
`;

const RewardSub = styled.div`
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  font-weight: 600;
`;

// ─── Actions ──────────────────────────────────────────────────────────────────
const ActionRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const SupportBtn = styled(motion.button)`
  flex: 1;
  min-width: 130px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 24px;
  border-radius: 9999px;
  font-family: 'Nunito', inherit;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  border: none;
  background: linear-gradient(135deg, #F5C518, #FF8C00);
  color: #1A2A5E;
  box-shadow: 0 8px 28px rgba(245,197,24,0.35);
  letter-spacing: 0.01em;

  svg { width: 17px; height: 17px; }

  &:hover { box-shadow: 0 12px 36px rgba(245,197,24,0.5); }
`;

const ShareBtn = styled(motion.button)`
  flex: 1;
  min-width: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px 24px;
  border-radius: 9999px;
  font-family: 'Nunito', inherit;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  background: transparent;
  color: rgba(255,255,255,0.85);
  border: 1.5px solid rgba(255,255,255,0.2);
  letter-spacing: 0.01em;

  svg { width: 17px; height: 17px; }

  &:hover {
    border-color: #29ABE2;
    color: #29ABE2;
    background: rgba(41,171,226,0.08);
  }
`;

const TrustRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const TrustItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  font-weight: 700;

  svg { width: 12px; height: 12px; color: #4ADE80; }
`;

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return [count, ref];
}

// ─── Data helpers ─────────────────────────────────────────────────────────────

// Amounts arrive in cents from the API.
const centsToDollars = (cents) => Math.max(0, Math.round((Number(cents) || 0) / 100));

const formatNeedType = (needType) =>
  (needType || 'Community Need')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const titleInitials = (title) => {
  const words = (title || '').trim().split(/\s+/).filter(Boolean);
  const letters = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('');
  return letters || 'HN';
};

const daysLeftOf = (endDate) => {
  if (!endDate) return null;
  const diff = new Date(endDate).getTime() - Date.now();
  if (Number.isNaN(diff)) return null;
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};

const locationLabel = (location) => {
  if (!location) return null;
  const cityState = [location.city, location.state].filter(Boolean).join(', ');
  return cityState || location.address || location.country || null;
};

/**
 * Pick the campaign to feature from the public active list:
 * an actively boosted campaign first, otherwise the most recently created.
 */
function pickFeaturedCampaign(campaigns) {
  const active = (campaigns || []).filter((c) => c && c.status === 'active');
  if (active.length === 0) return null;
  const boosted = active
    .filter((c) => c.is_boosted)
    .sort((a, b) => (b.boost_weight || 0) - (a.boost_weight || 0));
  if (boosted.length > 0) return boosted[0];
  return [...active].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  )[0];
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FeaturedCampaign() {
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'ready' | 'empty'

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { apiClient } = await import('@/lib/api');
        const res = await apiClient.get('/campaigns', {
          params: { status: 'active', limit: 12 },
          skipRetry: true,
        });
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : res.data?.data?.campaigns || [];
        const picked = pickFeaturedCampaign(list);
        if (cancelled) return;
        if (picked) {
          setCampaign(picked);
          setLoadState('ready');
        } else {
          setLoadState('empty');
        }
      } catch {
        if (!cancelled) setLoadState('empty');
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const goalDollars = centsToDollars(
    campaign?.goal_amount ?? campaign?.goals?.find((g) => g.goal_type === 'fundraising')?.target_amount
  );
  const raisedDollars = centsToDollars(
    campaign?.raised_amount ?? campaign?.total_donation_amount
  );
  const supportersCount = campaign?.total_donors || campaign?.metrics?.total_donations || 0;
  const remainingDollars = Math.max(0, goalDollars - raisedDollars);
  const pct = goalDollars > 0 ? Math.min(100, Math.round((raisedDollars / goalDollars) * 100)) : 0;
  const daysLeft = daysLeftOf(campaign?.end_date);
  const locLabel = locationLabel(campaign?.location);
  const shareRewardDollars =
    campaign?.share_config?.is_paid_sharing_active
      ? centsToDollars(campaign.share_config.amount_per_share)
      : 0;
  const campaignHref = campaign ? `/campaigns/${campaign._id || campaign.campaign_id}` : '/campaigns';

  const [supporters, supportersRef] = useCounter(supportersCount, 1200);
  const [raised, raisedRef] = useCounter(raisedDollars, 1400);
  const cardRef = useRef(null);
  const cardInView = useInView(cardRef, { once: true });

  const handleSupport = () => router.push(campaignHref);
  const handleShare   = () => router.push(campaignHref);

  // Never show placeholder content: hide the section until a real campaign is
  // available, and hide it entirely if none exists or the API is unreachable.
  if (loadState !== 'ready' || !campaign) return null;

  return (
    <Section>
      <Container>
        {/* ── Eyebrow Row ── */}
        <EyebrowRow
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <EyebrowPill>
            <FiTrendingUp /> Featured Campaign
          </EyebrowPill>
          <VerifiedPill>
            <FiCheckCircle /> Verified & Trusted
          </VerifiedPill>
        </EyebrowRow>

        {/* ── Main Card ── */}
        <FeaturedCard
          ref={cardRef}
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* ── Left: Campaign Image ── */}
          <MediaPanel>
            {campaign.image_url && (
              <CampaignImage src={campaign.image_url} alt={campaign.title} />
            )}
            <GradientOverlay />

            <MediaBottomContent>
              <CampaignCategory>
                <FiUsers /> {formatNeedType(campaign.need_type)}
              </CampaignCategory>
              {campaign.is_boosted && (
                <div>
                  <BoostedBadge>
                    <FiZap /> Boosted Campaign
                  </BoostedBadge>
                </div>
              )}
            </MediaBottomContent>
          </MediaPanel>

          {/* ── Right: Content ── */}
          <ContentPanel
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Creator */}
            <CreatorRow>
              <AvatarRing>{titleInitials(campaign.title)}</AvatarRing>
              <CreatorInfo>
                <CreatorName>Verified Creator</CreatorName>
                <CreatorMeta>
                  {locLabel && <MetaChip><FiMapPin /> {locLabel}</MetaChip>}
                  {daysLeft !== null && (
                    <UrgencyChip><FiClock /> {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left</UrgencyChip>
                  )}
                </CreatorMeta>
              </CreatorInfo>
            </CreatorRow>

            {/* Title */}
            <CampaignTitle>
              <span className="highlight">{campaign.title}</span>
            </CampaignTitle>

            {/* Story */}
            <StoryText>
              {(campaign.description || '').length > 220
                ? `${campaign.description.slice(0, 220).trimEnd()}…`
                : campaign.description}
            </StoryText>

            {/* Progress */}
            <ProgressBlock>
              <ProgressHeader>
                <div>
                  <RaisedAmount ref={raisedRef}>${raised.toLocaleString()}</RaisedAmount>
                  <GoalLabel>raised of ${goalDollars.toLocaleString()} goal</GoalLabel>
                </div>
              </ProgressHeader>
              <ProgressTrack>
                <ProgressFill
                  initial={{ width: '0%' }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
              </ProgressTrack>
              <PercentLabel>{pct}% funded</PercentLabel>

              <StatsRow>
                <StatTile>
                  <StatValue ref={supportersRef}>{supporters}</StatValue>
                  <StatLabel>Supporters</StatLabel>
                </StatTile>
                <StatTile>
                  <StatValue>${remainingDollars.toLocaleString()}</StatValue>
                  <StatLabel>Remaining</StatLabel>
                </StatTile>
                <StatTile>
                  <StatValue>{daysLeft !== null ? `${daysLeft} days` : '—'}</StatValue>
                  <StatLabel>Left</StatLabel>
                </StatTile>
              </StatsRow>
            </ProgressBlock>

            {/* Reward strip */}
            <RewardStrip>
              <RewardIcon><FiGift /></RewardIcon>
              <RewardText>
                {shareRewardDollars > 0 ? (
                  <>
                    <RewardTitle>Earn ${shareRewardDollars} per successful share</RewardTitle>
                    <RewardSub>Share this campaign and earn when someone donates through your link</RewardSub>
                  </>
                ) : (
                  <>
                    <RewardTitle>Every share counts</RewardTitle>
                    <RewardSub>Share this campaign to help it reach more people who can support it</RewardSub>
                  </>
                )}
              </RewardText>
            </RewardStrip>

            {/* Actions */}
            <ActionRow>
              <SupportBtn
                onClick={handleSupport}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Support this campaign"
              >
                <FiHeart /> Support Now
              </SupportBtn>
              <ShareBtn
                onClick={handleShare}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                aria-label="Share this campaign"
              >
                <FiShare2 /> Share & Earn
              </ShareBtn>
            </ActionRow>

            {/* Trust indicators */}
            <TrustRow>
              <TrustItem><FiCheckCircle /> Verified Campaign</TrustItem>
              <TrustItem><FiShield /> Secure Payments</TrustItem>
              <TrustItem><FiAward /> Honor System</TrustItem>
            </TrustRow>
          </ContentPanel>
        </FeaturedCard>
      </Container>
    </Section>
  );
}