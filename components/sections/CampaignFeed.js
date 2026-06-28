'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion } from 'framer-motion';
import {
  FiHeart, FiMapPin, FiClock,
  FiArrowRight, FiZap, FiStar, FiGift, FiLoader
} from 'react-icons/fi';
import { useCampaigns } from '@/api/hooks/useCampaigns';

// ─── Brand Tokens (from HonestNeed logo) ────────────────────────────────────
// Gold:       #F5C518   Orange:   #FF8C00
// Sky Blue:   #29ABE2   Navy:     #1A2A5E
// Green:      #2E8B2E   Pink:     #E83E8C
// Red-dark:   #CC2222   Cream:    #FFFBF0

// ─── Keyframes ───────────────────────────────────────────────────────────────
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(245,197,24,0.5); }
  50%       { box-shadow: 0 0 0 8px rgba(245,197,24,0); }
`;

const floatBadge = keyframes`
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50%       { transform: translateY(-3px) rotate(1deg); }
`;

const scanLine = keyframes`
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;

// ─── Section ─────────────────────────────────────────────────────────────────
const Section = styled.section`
  position: relative;
  padding: 72px 16px 88px;
  background: #FFFBF0;
  font-family: 'Nunito', 'Poppins', system-ui, sans-serif;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, #F5C518, #FF8C00, #29ABE2, #E83E8C, #2E8B2E);
  }
`;

const BgBlob = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.06;
  &.blob1 {
    width: 600px; height: 600px;
    background: #F5C518;
    top: -200px; left: -200px;
  }
  &.blob2 {
    width: 500px; height: 500px;
    background: #29ABE2;
    bottom: -150px; right: -150px;
  }
`;

const Container = styled.div`
  max-width: 1160px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

// ─── Header ───────────────────────────────────────────────────────────────────
const HeaderRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
`;

const TitleGroup = styled.div``;

const EyebrowTag = styled(motion.div)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #1A2A5E;
  border-radius: 9999px;
  padding: 5px 14px;
  font-size: 11px;
  font-weight: 800;
  color: #F5C518;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 12px;

  svg { width: 12px; height: 12px; }
`;

const SectionTitle = styled(motion.h2)`
  font-size: clamp(26px, 4vw, 42px);
  font-weight: 900;
  color: #1A2A5E;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 8px;

  em {
    font-style: normal;
    background: linear-gradient(90deg, #F5C518 0%, #FF8C00 50%, #F5C518 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: ${shimmer} 3.5s linear infinite;
  }
`;

const SectionSubtitle = styled(motion.p)`
  font-size: 15px;
  color: #64748B;
  line-height: 1.6;
  max-width: 480px;
`;

const LiveIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(46, 139, 46, 0.1);
  border: 1px solid rgba(46, 139, 46, 0.3);
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #2E8B2E;
  white-space: nowrap;

  span.dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #2E8B2E;
    animation: ${pulseGlow} 2s ease-in-out infinite;
    display: inline-block;
  }
`;

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
const FilterRow = styled(motion.div)`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 32px;
`;

const FilterTab = styled.button`
  padding: 8px 18px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  border: 1.5px solid ${({ active }) => active ? '#1A2A5E' : 'rgba(26,42,94,0.15)'};
  background: ${({ active }) => active ? '#1A2A5E' : 'transparent'};
  color: ${({ active }) => active ? '#F5C518' : '#64748B'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1A2A5E;
    color: #1A2A5E;
    background: rgba(26,42,94,0.06);
  }
`;

// ─── Grid ─────────────────────────────────────────────────────────────────────
// CRITICAL: 2 columns on mobile, 3 on tablet, 3–4 on desktop
const CampaignGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);   /* 2-col on mobile — MANDATORY */
  gap: clamp(10px, 2vw, 20px);

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (min-width: 1100px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

// ─── Card ─────────────────────────────────────────────────────────────────────
const Card = styled(motion.article)`
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  border: 1.5px solid rgba(26,42,94,0.08);
  display: flex;
  flex-direction: column;
  height: 100%;
  cursor: pointer;
  transition: border-color 0.25s;
  position: relative;

  &:hover {
    border-color: rgba(245,197,24,0.5);
  }

  ${({ boosted }) => boosted && css`
    border-color: rgba(245,197,24,0.4);
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 20px;
      box-shadow: 0 0 0 2px rgba(245,197,24,0.3);
      pointer-events: none;
    }
  `}
`;

const CardImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: linear-gradient(135deg, #F8FAFC, #E8EEF8);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const CardTop = styled.div`
  position: relative;
  background: ${({ color }) => color || '#F8FAFC'};
  padding: clamp(12px, 2.5vw, 16px) clamp(12px, 2.5vw, 20px) clamp(10px, 2.5vw, 16px);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

// Creator info
const CreatorInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

const CreatorName = styled.span`
  font-size: clamp(12px, 2.2vw, 14px);
  font-weight: 800;
  color: #1A2A5E;
`;

const CreatorLabel = styled.span`
  font-size: clamp(10px, 1.8vw, 11px);
  color: #94A3B8;
  font-weight: 600;
`;

const BadgesCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
`;

const BoostedBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #F5C518, #FF8C00);
  color: #1A1A3E;
  font-size: clamp(9px, 1.8vw, 11px);
  font-weight: 900;
  padding: 3px 8px;
  border-radius: 9999px;
  letter-spacing: 0.04em;
  animation: ${floatBadge} 3s ease-in-out infinite;
  white-space: nowrap;

  svg { width: 10px; height: 10px; }
`;

const RewardBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${({ isMoney }) => isMoney
    ? 'rgba(46,139,46,0.12)'
    : 'rgba(232,62,140,0.1)'};
  color: ${({ isMoney }) => isMoney ? '#2E8B2E' : '#E83E8C'};
  border: 1px solid ${({ isMoney }) => isMoney
    ? 'rgba(46,139,46,0.3)'
    : 'rgba(232,62,140,0.25)'};
  font-size: clamp(9px, 1.8vw, 11px);
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 9999px;
  white-space: nowrap;

  svg { width: 10px; height: 10px; }
`;

// ─── Card Body ────────────────────────────────────────────────────────────────
const CardBody = styled.div`
  padding: clamp(12px, 2.5vw, 18px) clamp(12px, 2.5vw, 20px) clamp(14px, 2.5vw, 20px);
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
`;

const CardTitle = styled.h4`
  font-size: clamp(13px, 2.5vw, 16px);
  font-weight: 800;
  color: #1A2A5E;
  line-height: 1.3;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
`;

const MetaChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: clamp(10px, 2vw, 12px);
  color: #94A3B8;
  font-weight: 600;

  svg { width: 11px; height: 11px; flex-shrink: 0; }
`;

const Divider = styled.div`
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #CBD5E1;
  flex-shrink: 0;
`;

// Scan shimmer on hover
const ScanShimmer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.2s;

  article:hover & { opacity: 1; }

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 40px; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: ${scanLine} 0.7s linear;
    animation-play-state: paused;
  }

  article:hover &::after {
    animation-play-state: running;
  }
`;

// ─── Actions ──────────────────────────────────────────────────────────────────
const CardActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: auto;
  padding-top: 4px;
`;

const ActionBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: clamp(7px, 1.5vw, 10px) 6px;
  border-radius: 10px;
  font-family: inherit;
  font-size: clamp(11px, 2vw, 13px);
  font-weight: 800;
  cursor: pointer;
  transition: all 0.18s;
  border: 1.5px solid transparent;

  svg { width: 13px; height: 13px; flex-shrink: 0; }

  ${({ primary }) => primary ? css`
    background: #1A2A5E;
    color: #F5C518;
    &:hover {
      background: #243a82;
      box-shadow: 0 4px 16px rgba(26,42,94,0.3);
      transform: translateY(-1px);
    }
    &:active { transform: translateY(0); }
  ` : css`
    background: transparent;
    color: #64748B;
    border-color: rgba(26,42,94,0.15);
    &:hover {
      border-color: #29ABE2;
      color: #29ABE2;
      background: rgba(41,171,226,0.06);
    }
  `}
`;

// ─── View All ────────────────────────────────────────────────────────────────
const ViewAllWrap = styled.div`
  text-align: center;
  margin-top: 48px;
`;

const ViewAllBtn = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #1A2A5E 0%, #243a82 100%);
  color: #F5C518;
  font-family: inherit;
  font-size: 15px;
  font-weight: 900;
  padding: 14px 36px;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  box-shadow: 0 8px 28px rgba(26,42,94,0.25);
  letter-spacing: 0.01em;

  svg { width: 17px; height: 17px; }

  &:hover {
    box-shadow: 0 12px 36px rgba(26,42,94,0.4);
  }
`;

// ─── Avatar color palette per initials ───────────────────────────────────────
const AVATAR_PALETTES = [
  { bg: 'linear-gradient(135deg,#F5C518,#FF8C00)', text: '#1A2A5E' },
  { bg: 'linear-gradient(135deg,#29ABE2,#1E90FF)', text: '#fff'     },
  { bg: 'linear-gradient(135deg,#E83E8C,#CC2222)', text: '#fff'     },
  { bg: 'linear-gradient(135deg,#2E8B2E,#3AAA3A)', text: '#fff'     },
  { bg: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', text: '#fff'     },
  { bg: 'linear-gradient(135deg,#FF8C00,#E83E8C)', text: '#fff'     },
];

const CARD_TOP_COLORS = [
  '#FFF9E6', '#EBF8FF', '#FFF0F7', '#F0FFF0', '#F5F3FF', '#FFF4EB',
];

// ─── Data helpers ────────────────────────────────────────────────────────────
// Real campaigns come from the public GET /campaigns endpoint via useCampaigns.
// These helpers shape the raw API record into what the card UI expects.

const FILTERS = ['All', 'Boosted 🔥', 'New Today', 'With Rewards', 'Near Me'];

// Format a backend location (string OR { city, state, address } object) → label
function formatLocation(loc) {
  if (!loc) return 'Community';
  if (typeof loc === 'string') return loc;
  const parts = [loc.city, loc.state].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return loc.address || loc.country || 'Community';
}

// Relative "time ago" from an ISO date string
function timeAgo(dateStr) {
  if (!dateStr) return 'Just now';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  if (Number.isNaN(diffMs)) return 'Just now';
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// Reward label for share-to-earn campaigns (otherwise null = no reward badge)
function deriveReward(c) {
  const isSharing = c.campaign_type === 'sharing';
  const perShare = c.share_config?.amount_per_share;
  if (isSharing && perShare > 0) return `$${(perShare / 100).toFixed(0)} reward per share`;
  if (isSharing) return 'Share to earn';
  return null;
}

// Normalize a raw API campaign into the card view-model
function toCardModel(c) {
  return {
    id: c.id || c._id,
    title: c.title,
    location: formatLocation(c.location),
    time: timeAgo(c.created_at),
    reward: deriveReward(c),
    image: c.image_url || c.image?.url || null,
    creator: c.creator_name || 'Campaign Creator',
    boosted: !!c.is_boosted,
    createdAt: c.created_at,
    scope: c.geographic_scope,
  };
}

function matchesFilter(c, filter) {
  switch (filter) {
    case 'Boosted 🔥':
      return c.boosted;
    case 'New Today':
      return c.createdAt && Date.now() - new Date(c.createdAt).getTime() < 24 * 60 * 60 * 1000;
    case 'With Rewards':
      return !!c.reward;
    case 'Near Me':
      return c.scope === 'local';
    default:
      return true;
  }
}

// ─── Loading / Empty states ───────────────────────────────────────────────────
const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const StateWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px 16px;
  text-align: center;
  color: #64748B;

  svg.spin { animation: ${spin} 0.9s linear infinite; color: #1A2A5E; }
`;

const StateTitle = styled.p`
  font-size: 16px;
  font-weight: 800;
  color: #1A2A5E;
  margin: 0;
`;

const StateText = styled.p`
  font-size: 14px;
  color: #64748B;
  margin: 0;
  max-width: 360px;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F5C518 0%, #FF8C00 100%);
  color: #fff;
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 900;
`;

// ─── Animation Variants ───────────────────────────────────────────────────────
const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden:   { opacity: 0, y: 28, scale: 0.97 },
  visible:  { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CampaignFeed() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');

  // Public endpoint — resolves for logged-out visitors too (see lib/api.ts).
  const { data, isLoading, isError } = useCampaigns(1, 12, {
    status: 'active',
    sortBy: 'trending',
  });

  const allCampaigns = useMemo(
    () => (data?.campaigns ?? []).map(toCardModel),
    [data]
  );

  const visible = useMemo(
    () => allCampaigns.filter((c) => matchesFilter(c, activeFilter)).slice(0, 6),
    [allCampaigns, activeFilter]
  );

  const liveCount = data?.total ?? allCampaigns.length;

  // Viewing a campaign is public — the card and its button both open the detail page.
  const goToCampaign = (id) => router.push(`/campaigns/${id}`);

  const handleCardClick = (id) => goToCampaign(id);

  const handleViewDetails = (e, id) => {
    e.stopPropagation();
    goToCampaign(id);
  };

  const handleViewAllCampaigns = () => router.push('/campaigns');

  const isMoneyReward = (reward) => !!reward && reward.startsWith('$');

  return (
    <Section id="campaigns">
      <BgBlob className="blob1" />
      <BgBlob className="blob2" />

      <Container>
        {/* ── Header ── */}
        <HeaderRow>
          <TitleGroup>
            <EyebrowTag
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <FiStar /> Active Campaigns
            </EyebrowTag>

            <SectionTitle
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              Real People,{' '}<em>Real Needs</em>
            </SectionTitle>

            <SectionSubtitle
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.16 }}
            >
              Browse genuine campaigns from your community. Support directly or share to earn rewards.
            </SectionSubtitle>
          </TitleGroup>

          <LiveIndicator>
            <span className="dot" />
            {liveCount} live campaign{liveCount === 1 ? '' : 's'}
          </LiveIndicator>
        </HeaderRow>

        {/* ── Filter Tabs ── */}
        <FilterRow
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {FILTERS.map(f => (
            <FilterTab
              key={f}
              active={activeFilter === f}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </FilterTab>
          ))}
        </FilterRow>

        {/* ── Grid / states ── */}
        {isLoading ? (
          <StateWrap>
            <FiLoader size={28} className="spin" />
            <StateText>Loading live campaigns…</StateText>
          </StateWrap>
        ) : isError ? (
          <StateWrap>
            <StateTitle>Couldn&apos;t load campaigns</StateTitle>
            <StateText>Please refresh the page or try again in a moment.</StateText>
          </StateWrap>
        ) : visible.length === 0 ? (
          <StateWrap>
            <StateTitle>No campaigns to show yet</StateTitle>
            <StateText>
              {activeFilter === 'All'
                ? 'Be the first to start a campaign and rally your community.'
                : `No campaigns match “${activeFilter}” right now. Try another filter.`}
            </StateText>
          </StateWrap>
        ) : (
          <CampaignGrid
            variants={gridVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {visible.map((campaign, i) => {
              const topColor  = CARD_TOP_COLORS[i % CARD_TOP_COLORS.length];
              const isMoney   = isMoneyReward(campaign.reward);
              const initial   = (campaign.creator || '?').trim().charAt(0).toUpperCase();

              return (
                <Card
                  key={campaign.id}
                  boosted={campaign.boosted}
                  variants={cardVariants}
                  whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(26,42,94,0.14)', transition: { duration: 0.22 } }}
                  onClick={() => handleCardClick(campaign.id)}
                  aria-label={`Campaign: ${campaign.title}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCardClick(campaign.id)}
                >
                  <ScanShimmer aria-hidden="true" />

                  <CardImageContainer>
                    {campaign.image ? (
                      <img src={campaign.image} alt={campaign.title} />
                    ) : (
                      <ImagePlaceholder aria-hidden="true">{initial}</ImagePlaceholder>
                    )}
                  </CardImageContainer>

                  <CardTop color={topColor}>
                    <TopRow>
                      <CreatorInfo>
                        <CreatorName>{campaign.creator}</CreatorName>
                        <CreatorLabel>Campaign Creator</CreatorLabel>
                      </CreatorInfo>

                      <BadgesCol>
                        {campaign.boosted && (
                          <BoostedBadge aria-label="Boosted campaign">
                            <FiZap /> Boosted
                          </BoostedBadge>
                        )}
                        {campaign.reward && (
                          <RewardBadge isMoney={isMoney} aria-label={`Reward: ${campaign.reward}`}>
                            {isMoney ? <FiGift /> : <FiHeart />}
                            {campaign.reward}
                          </RewardBadge>
                        )}
                      </BadgesCol>
                    </TopRow>
                  </CardTop>

                  <CardBody>
                    <CardTitle>{campaign.title}</CardTitle>

                    <MetaRow>
                      <MetaChip aria-label={`Location: ${campaign.location}`}>
                        <FiMapPin />
                        {campaign.location}
                      </MetaChip>
                      <Divider />
                      <MetaChip aria-label={`Posted: ${campaign.time}`}>
                        <FiClock />
                        {campaign.time}
                      </MetaChip>
                    </MetaRow>

                    <CardActions>
                      <ActionBtn
                        primary
                        onClick={(e) => handleViewDetails(e, campaign.id)}
                        aria-label={`View details: ${campaign.title}`}
                      >
                        View Details <FiArrowRight />
                      </ActionBtn>
                    </CardActions>
                  </CardBody>
                </Card>
              );
            })}
          </CampaignGrid>
        )}

        {/* ── View All ── */}
        <ViewAllWrap>
          <ViewAllBtn
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleViewAllCampaigns}
            aria-label="View all campaigns"
          >
            View All Campaigns <FiArrowRight />
          </ViewAllBtn>
        </ViewAllWrap>
      </Container>
    </Section>
  );
}