'use client'

import { useState, useEffect, useRef } from 'react'
import styled, { keyframes, css } from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Gift,
  CalendarDays,
  Trophy,
  Clock3,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Ticket,
  Star,
  BadgeCheck,
  PartyPopper,
  HeartHandshake,
  Zap,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useCurrentSweepstakes, useCheckWinner } from '@/api/hooks/useSimpleSweepstakes'
import { useAuthStore } from '@/store/authStore'
import { DashboardFonts } from '@/features/dashboardUI'
import Button from '@/components/ui/Button'

// ─── Brand Tokens — mapped to the creator dashboard design system ─────────────

const B = {
  navy:    '#1A5FA8', // primary blue (buttons, dark accents)
  blue:    '#1A5FA8',
  yellow:  '#F5C961', // warm gold
  red:     '#C0392B',
  green:   '#1A7A4A',
  purple:  '#1A5FA8',
  // Tints
  blueT:   'rgba(26,95,168,0.10)',
  yellowT: 'rgba(245,201,97,0.18)',
  redT:    'rgba(192,57,43,0.10)',
  greenT:  'rgba(26,122,74,0.12)',
  purpleT: 'rgba(26,95,168,0.10)',
  navyT:   'rgba(26,95,168,0.06)',
  // Neutrals (dashboard canvas)
  bg:      '#F7F5F1',
  card:    '#FFFFFF',
  border:  '#E2DDD6',
  text:    '#18171A',
  muted:   '#8C8790',
  light:   '#8C8790',
}

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
`

const floatY = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-10px) rotate(2deg); }
  66%       { transform: translateY(-5px) rotate(-1deg); }
`

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`

const pulse = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,214,0,0.4); }
  50%       { box-shadow: 0 0 0 12px rgba(255,214,0,0); }
`

const confettiFall = keyframes`
  0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(120px) rotate(540deg); opacity: 0; }
`

const skeletonPulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`

// ─── Layout ──────────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: ${B.bg};
  font-family: 'DM Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
`

const HeroSection = styled.section`
  background: ${B.bg};
  border-bottom: 2px solid ${B.blue};
  position: relative;
  overflow: hidden;
  padding: 64px 20px 0;

  @media (min-width: 768px) {
    padding: 80px 40px 0;
  }
`

// Decorative confetti dots in hero
const Dot = styled.span<{ $c: string; $x: number; $y: number; $s: number; $d: number }>`
  position: absolute;
  width: ${p => p.$s}px;
  height: ${p => p.$s}px;
  border-radius: 50%;
  background: ${p => p.$c};
  top: ${p => p.$y}%;
  left: ${p => p.$x}%;
  opacity: 0.55;
  animation: ${floatY} ${p => p.$d}s ease-in-out infinite;
`

const HeroInner = styled.div`
  max-width: 680px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
`

const HeroEyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FBF3E0;
  border: 1px solid rgba(212,135,10,0.3);
  border-radius: 99px;
  padding: 6px 14px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  font-weight: 500;
  color: #A8680A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 24px;
`

const HeroTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: clamp(2rem, 7vw, 3.25rem);
  font-weight: 800;
  color: ${B.text};
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
  background: linear-gradient(135deg, ${B.text} 0%, ${B.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  span {
    background: linear-gradient(90deg, #D4870A, #F5C961);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`

const HeroSub = styled.p`
  font-size: clamp(0.95rem, 2.5vw, 1.1rem);
  color: #4A4750;
  margin: 0 0 40px;
  line-height: 1.65;
`

// Prize badge floats up from hero into the card below
const PrizePedestal = styled.div`
  position: relative;
  z-index: 10;
  margin: 0 auto;
  max-width: 440px;
  transform: translateY(50%);
`

const PrizeBadge = styled.div`
  background: ${B.yellow};
  border-radius: 24px;
  padding: 28px 32px 24px;
  text-align: center;
  box-shadow: 0 12px 48px rgba(255,214,0,0.35), 0 4px 16px rgba(0,0,0,0.12);
  animation: ${pulse} 2.8s ease-in-out infinite;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 60%);
    border-radius: inherit;
    pointer-events: none;
  }
`

const PrizeBadgeEyebrow = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${B.navy};
  opacity: 0.7;
  margin: 0 0 6px;
`

const PrizeAmount = styled.p`
  font-size: clamp(2.75rem, 10vw, 4.5rem);
  font-weight: 900;
  color: ${B.navy};
  margin: 0;
  line-height: 1;
  letter-spacing: -0.04em;
`

const PrizeDesc = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${B.navy};
  opacity: 0.75;
  margin: 8px 0 0;
`

// ─── Main Content ─────────────────────────────────────────────────────────────

const MainContent = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 0 16px 80px;

  @media (min-width: 640px) {
    padding: 0 24px 80px;
  }
`

const Spacer = styled.div<{ $h: number }>`
  height: ${p => p.$h}px;
`

// ─── Card ─────────────────────────────────────────────────────────────────────

const Card = styled.div<{ $delay?: number }>`
  background: ${B.card};
  border: 1px solid ${B.border};
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(26,26,78,0.06);
  animation: ${fadeUp} 0.45s ease both;
  animation-delay: ${p => p.$delay ?? 0}ms;

  @media (min-width: 640px) {
    padding: 28px 32px;
  }
`

const CardTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: ${B.text};
  margin: 0 0 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.02em;
`

// ─── Status Banner ────────────────────────────────────────────────────────────

const StatusBanner = styled.div<{ $variant: 'open' | 'winner' | 'lost' | 'info' | 'error' | 'waiting' }>`
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border: 1.5px solid;
  animation: ${fadeUp} 0.35s ease both;

  ${p => p.$variant === 'open' && css`
    background: ${B.greenT};
    border-color: ${B.green}44;
    color: #166534;
  `}
  ${p => p.$variant === 'winner' && css`
    background: linear-gradient(135deg, rgba(255,214,0,0.18) 0%, rgba(255,167,38,0.12) 100%);
    border-color: ${B.yellow};
    color: #78350f;
  `}
  ${p => p.$variant === 'lost' && css`
    background: ${B.navyT};
    border-color: ${B.border};
    color: ${B.muted};
  `}
  ${p => p.$variant === 'info' && css`
    background: ${B.blueT};
    border-color: ${B.blue}44;
    color: #075985;
  `}
  ${p => p.$variant === 'error' && css`
    background: ${B.redT};
    border-color: ${B.red}44;
    color: #991b1b;
  `}
  ${p => p.$variant === 'waiting' && css`
    background: ${B.purpleT};
    border-color: ${B.purple}44;
    color: #5b21b6;
  `}
`

const BannerIconWrap = styled.div`
  flex-shrink: 0;
  margin-top: 1px;
`

const BannerBody = styled.div``

const BannerTitle = styled.p`
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 4px;
  line-height: 1.3;
`

const BannerText = styled.p`
  font-size: 13.5px;
  margin: 0;
  line-height: 1.6;
  opacity: 0.85;
`

// ─── Timeline grid ────────────────────────────────────────────────────────────

const TimelineGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;

  @media (min-width: 500px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const TimelineTile = styled.div<{ $accent: string }>`
  background: ${B.bg};
  border: 1px solid ${B.border};
  border-radius: 14px;
  padding: 14px 12px;
  text-align: center;
  transition: border-color 180ms ease, box-shadow 180ms ease;

  &:hover {
    border-color: ${p => p.$accent}66;
    box-shadow: 0 4px 16px ${p => p.$accent}18;
  }
`

const TileIcon = styled.div<{ $accent: string }>`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${p => p.$accent}18;
  color: ${p => p.$accent};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 10px;
`

const TileLabel = styled.p`
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${B.light};
  margin: 0 0 5px;
`

const TileValue = styled.p`
  font-size: 13px;
  font-weight: 700;
  color: ${B.text};
  margin: 0;
  line-height: 1.3;
`

// ─── Description ─────────────────────────────────────────────────────────────

const Description = styled.p`
  font-size: 14.5px;
  color: ${B.muted};
  line-height: 1.75;
  margin: 0 0 20px;
`

// ─── How It Works ────────────────────────────────────────────────────────────

const RuleList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const RuleItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 13.5px;
  color: ${B.muted};
  line-height: 1.6;
`

const RuleNum = styled.span`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${B.blueT};
  color: ${B.blue};
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
`

// ─── CTA Button overrides ─────────────────────────────────────────────────────

const PrimaryBtn = styled.button`
  width: 100%;
  min-height: 54px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 200ms ease;
  background: ${B.navy};
  color: #fff;
  box-shadow: 0 4px 20px rgba(26,26,78,0.22);

  &:hover:not(:disabled) {
    background: #252566;
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(26,26,78,0.28);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const WinBtn = styled(PrimaryBtn)`
  background: linear-gradient(135deg, ${B.yellow} 0%, #FFA726 100%);
  color: ${B.navy};
  box-shadow: 0 4px 24px rgba(255,214,0,0.4);

  &:hover:not(:disabled) {
    box-shadow: 0 8px 32px rgba(255,214,0,0.5);
  }
`

const AuthRow = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`

const AuthBtn = styled.button<{ $variant: 'primary' | 'outline' }>`
  flex: 1;
  min-height: 50px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: all 180ms ease;

  ${p => p.$variant === 'primary' && css`
    background: ${B.navy};
    color: #fff;
    border: 2px solid ${B.navy};
    &:hover { background: #252566; }
  `}
  ${p => p.$variant === 'outline' && css`
    background: #fff;
    color: ${B.navy};
    border: 2px solid ${B.border};
    &:hover { border-color: ${B.navy}55; background: ${B.navyT}; }
  `}
`

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FaqItem = styled.div`
  border-bottom: 1px solid ${B.border};
  &:last-child { border-bottom: none; }
`

const FaqButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 16px 0;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  color: ${B.text};
  line-height: 1.4;

  &:hover { color: ${B.navy}; }
`

const FaqAnswer = styled.div<{ $open: boolean }>`
  max-height: ${p => p.$open ? '200px' : '0'};
  overflow: hidden;
  transition: max-height 300ms ease;
`

const FaqAnswerInner = styled.p`
  font-size: 13.5px;
  color: ${B.muted};
  line-height: 1.7;
  margin: 0 0 16px;
`

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonBlock = styled.div<{ $h?: number; $r?: number }>`
  height: ${p => p.$h ?? 24}px;
  border-radius: ${p => p.$r ?? 8}px;
  background: #EEEBe5;
  animation: ${skeletonPulse} 1.5s ease infinite;
`

// ─── Confetti (pure CSS decoration) ─────────────────────────────────────────

const ConfettiPiece = styled.span<{ $c: string; $x: number; $delay: number; $dur: number }>`
  position: absolute;
  top: -10px;
  left: ${p => p.$x}%;
  width: 8px;
  height: 8px;
  background: ${p => p.$c};
  border-radius: 2px;
  animation: ${confettiFall} ${p => p.$dur}s ${p => p.$delay}s linear infinite;
  pointer-events: none;
  z-index: 1;
`

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'How do I participate?',
    a: 'Simply have an active account — no extra steps needed. You\'re automatically entered into every drawing while your account is in good standing.',
  },
  {
    q: 'What makes me eligible?',
    a: 'You must be 18 or older and not located in Florida, New York, or Illinois. Your account must be active and in good standing at the time of the drawing.',
  },
  {
    q: 'How is the winner chosen?',
    a: 'Winners are selected randomly from all eligible participants using a cryptographically secure random selection. Every account has an equal chance.',
  },
  {
    q: 'How do I claim my prize?',
    a: 'If you win, a "Claim Your Prize" button will appear on this page. Click it and follow the steps to provide your payment details. Prizes are sent within 5–7 business days.',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function SweepstakesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: sweepstakesResponse, isLoading } = useCurrentSweepstakes()
  const [sweepstakesId, setSweepstakesId] = useState<string | null>(null)
  const { data: winnerResponse, isLoading: isLoadingWinner } = useCheckWinner(sweepstakesId)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    if (sweepstakesResponse?.data) setSweepstakesId(sweepstakesResponse.data.id)
  }, [sweepstakesResponse])

  const sweepstakes = sweepstakesResponse?.data
  const winnerData   = winnerResponse?.data
  const isDrawingOpen  = sweepstakes?.isDrawingOpen
  const hasBeenDrawn   = sweepstakes && !sweepstakes.isDrawingOpen && sweepstakes.status === 'completed'
  const isWinner       = winnerData?.winner === true
  const hasNotWon      = winnerData?.winner === false
  const drawnAndLoaded = hasBeenDrawn && !isLoadingWinner

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const handleClaim = () => {
    if (!user) {
      toast.error('Please sign in to claim your prize')
      router.push(`/login?redirect=/sweepstakes/${sweepstakesId}/claim`)
    } else if (sweepstakesId) {
      router.push(`/sweepstakes/${sweepstakesId}/claim`)
    }
  }

  // Confetti pieces config
  const confetti = [
    { c: B.yellow, x: 8,  delay: 0,   dur: 3.2 },
    { c: B.red,    x: 22, delay: 0.5, dur: 2.8 },
    { c: B.blue,   x: 38, delay: 1.1, dur: 3.5 },
    { c: B.green,  x: 55, delay: 0.3, dur: 2.6 },
    { c: B.yellow, x: 68, delay: 0.9, dur: 3.0 },
    { c: B.purple, x: 82, delay: 0.2, dur: 2.9 },
    { c: B.red,    x: 92, delay: 1.4, dur: 3.3 },
  ]

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Page>
        <DashboardFonts />
        <HeroSection style={{ paddingBottom: 120, minHeight: 280 }}>
          <HeroInner>
            <HeroEyebrow><Sparkles size={12} /> Monthly Sweepstakes</HeroEyebrow>
            <SkeletonBlock $h={48} $r={12} style={{ marginBottom: 12 }} />
            <SkeletonBlock $h={24} $r={8} style={{ width: '60%', margin: '0 auto' }} />
          </HeroInner>
        </HeroSection>
        <MainContent>
          <Spacer $h={60} />
          <Card>
            <SkeletonBlock $h={160} $r={14} style={{ marginBottom: 16 }} />
            <SkeletonBlock $h={24} style={{ marginBottom: 10, width: '70%' }} />
            <SkeletonBlock $h={24} style={{ width: '50%' }} />
          </Card>
        </MainContent>
      </Page>
    )
  }

  // ── No active sweepstakes ────────────────────────────────────────────────

  if (!sweepstakes) {
    return (
      <Page>
        <DashboardFonts />
        <HeroSection style={{ paddingBottom: 80 }}>
          <HeroInner>
            <HeroEyebrow><Sparkles size={12} /> Monthly Sweepstakes</HeroEyebrow>
            <HeroTitle>Win <span>Real Money</span> Every Month</HeroTitle>
            <HeroSub>Automatic entry for all members — no tickets, no hassle.</HeroSub>
          </HeroInner>
        </HeroSection>
        <MainContent>
          <Spacer $h={40} />
          <Card>
            <StatusBanner $variant="info">
              <BannerIconWrap><Clock3 size={18} /></BannerIconWrap>
              <BannerBody>
                <BannerTitle>No active drawing right now</BannerTitle>
                <BannerText>Our next monthly drawing is being prepared. Check back soon — you'll be entered automatically when it opens.</BannerText>
              </BannerBody>
            </StatusBanner>
          </Card>
        </MainContent>
      </Page>
    )
  }

  // ── Main page ────────────────────────────────────────────────────────────

  return (
    <Page>
      <DashboardFonts />
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <HeroSection>
        {confetti.map((c, i) => (
          <ConfettiPiece key={i} $c={c.c} $x={c.x} $delay={c.delay} $dur={c.dur} />
        ))}

        {/* Ambient blobs */}
        <Dot $c={B.blue}   $x={5}  $y={15} $s={80}  $d={4.5} />
        <Dot $c={B.yellow} $x={88} $y={10} $s={60}  $d={5.2} />
        <Dot $c={B.purple} $x={50} $y={60} $s={100} $d={6.0} />

        <HeroInner>
          <HeroEyebrow>
            <Sparkles size={12} />
            Monthly Sweepstakes
          </HeroEyebrow>
          <HeroTitle>
            Win <span>${sweepstakes.prizeAmountDollars}</span><br />
            This Month
          </HeroTitle>
          <HeroSub>
            {sweepstakes.prizeDescription}. Every active member is entered automatically.
          </HeroSub>
        </HeroInner>

        {/* Prize badge — overlaps hero/content boundary */}
        <PrizePedestal>
          <PrizeBadge>
            <PrizeBadgeEyebrow>🎁 Total Prize Pool</PrizeBadgeEyebrow>
            <PrizeAmount>${sweepstakes.prizeAmountDollars}</PrizeAmount>
            <PrizeDesc>{sweepstakes.prizeDescription}</PrizeDesc>
          </PrizeBadge>
        </PrizePedestal>
      </HeroSection>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <MainContent>

        {/* Space for the overlapping prize badge */}
        <Spacer $h={120} />

        {/* ── Status banners ──────────────────────────────────────────── */}
        {isDrawingOpen && (
          <StatusBanner $variant="open">
            <BannerIconWrap><CheckCircle2 size={18} /></BannerIconWrap>
            <BannerBody>
              <BannerTitle>Drawing is open — you're entered!</BannerTitle>
              <BannerText>All eligible members are automatically included. The winner will be selected on {fmt(sweepstakes.drawingDate)}.</BannerText>
            </BannerBody>
          </StatusBanner>
        )}

        {drawnAndLoaded && isWinner && (
          <StatusBanner $variant="winner">
            <BannerIconWrap><PartyPopper size={18} /></BannerIconWrap>
            <BannerBody>
              <BannerTitle>🎉 You won this drawing!</BannerTitle>
              <BannerText>Congratulations! Claim your ${sweepstakes.prizeAmountDollars} prize before the deadline.</BannerText>
            </BannerBody>
          </StatusBanner>
        )}

        {drawnAndLoaded && hasNotWon && (
          <StatusBanner $variant="lost">
            <BannerIconWrap><HeartHandshake size={18} /></BannerIconWrap>
            <BannerBody>
              <BannerTitle>Drawing complete — better luck next month!</BannerTitle>
              <BannerText>You're automatically entered in next month's drawing. Keep your account active to stay eligible.</BannerText>
            </BannerBody>
          </StatusBanner>
        )}

        {!user && (
          <StatusBanner $variant="error">
            <BannerIconWrap><AlertCircle size={18} /></BannerIconWrap>
            <BannerBody>
              <BannerTitle>Sign in to participate</BannerTitle>
              <BannerText>You need an account to be entered into the drawing. It takes less than a minute.</BannerText>
            </BannerBody>
          </StatusBanner>
        )}

        {/* ── Main card ──────────────────────────────────────────────── */}
        <Card $delay={80}>
          <CardTitle>
            <Gift size={17} color={B.navy} />
            {sweepstakes.title}
          </CardTitle>

          {/* Timeline tiles */}
          <TimelineGrid>
            <TimelineTile $accent={B.blue}>
              <TileIcon $accent={B.blue}><CalendarDays size={16} /></TileIcon>
              <TileLabel>Entry Period</TileLabel>
              <TileValue>
                {fmt(sweepstakes.entryStartDate)}<br />
                <span style={{ color: B.light, fontWeight: 500 }}>to {fmt(sweepstakes.entryEndDate)}</span>
              </TileValue>
            </TimelineTile>

            <TimelineTile $accent={B.purple}>
              <TileIcon $accent={B.purple}><Zap size={16} /></TileIcon>
              <TileLabel>Drawing Date</TileLabel>
              <TileValue>{fmt(sweepstakes.drawingDate)}</TileValue>
            </TimelineTile>

            <TimelineTile $accent={B.red}>
              <TileIcon $accent={B.red}><Clock3 size={16} /></TileIcon>
              <TileLabel>Claim By</TileLabel>
              <TileValue>{fmt(sweepstakes.claimDeadline)}</TileValue>
            </TimelineTile>

            <TimelineTile $accent={B.green}>
              <TileIcon $accent={B.green}><BadgeCheck size={16} /></TileIcon>
              <TileLabel>Status</TileLabel>
              <TileValue style={{ textTransform: 'capitalize' }}>{sweepstakes.status}</TileValue>
            </TimelineTile>
          </TimelineGrid>

          {/* Description */}
          <Description>{sweepstakes.description}</Description>

          {/* ── CTAs ──────────────────────────────────────────────────── */}
          {drawnAndLoaded && isWinner && (
            <WinBtn onClick={handleClaim}>
              <Trophy size={17} />
              Claim Your ${sweepstakes.prizeAmountDollars} Prize
            </WinBtn>
          )}

          {isDrawingOpen && (
            <PrimaryBtn disabled>
              <Clock3 size={16} />
              Waiting for Drawing — {fmt(sweepstakes.drawingDate)}
            </PrimaryBtn>
          )}

          {!user && (
            <AuthRow>
              <Link href={`/login?redirect=/sweepstakes/${sweepstakesId}`} style={{ flex: 1, textDecoration: 'none' }}>
                <AuthBtn $variant="primary" style={{ width: '100%' }}>
                  <LogIn size={15} />
                  Sign In
                </AuthBtn>
              </Link>
              <Link href="/register" style={{ flex: 1, textDecoration: 'none' }}>
                <AuthBtn $variant="outline" style={{ width: '100%' }}>
                  <UserPlus size={15} />
                  Create Account
                </AuthBtn>
              </Link>
            </AuthRow>
          )}
        </Card>

        {/* ── How It Works card ──────────────────────────────────────── */}
        <Card $delay={140}>
          <CardTitle>
            <Ticket size={17} color={B.blue} />
            How it works
          </CardTitle>
          <RuleList>
            {[
              'All members with an active account are automatically eligible — no action required.',
              'Must be 18+ years old and not located in Florida, New York, or Illinois.',
              'A winner is selected at random from all eligible participants on the drawing date.',
              'The winner has until the claim deadline to collect their prize via their chosen payment method.',
            ].map((rule, i) => (
              <RuleItem key={i}>
                <RuleNum>{i + 1}</RuleNum>
                {rule}
              </RuleItem>
            ))}
          </RuleList>
        </Card>

        {/* ── FAQ card ───────────────────────────────────────────────── */}
        <Card $delay={180}>
          <CardTitle>
            <Star size={17} color={B.yellow} />
            Questions & answers
          </CardTitle>

          {FAQS.map((faq, i) => (
            <FaqItem key={i}>
              <FaqButton onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                {faq.q}
                {openFaq === i
                  ? <ChevronUp size={15} style={{ color: B.muted, flexShrink: 0 }} />
                  : <ChevronDown size={15} style={{ color: B.muted, flexShrink: 0 }} />
                }
              </FaqButton>
              <FaqAnswer $open={openFaq === i}>
                <FaqAnswerInner>{faq.a}</FaqAnswerInner>
              </FaqAnswer>
            </FaqItem>
          ))}
        </Card>

      </MainContent>
    </Page>
  )
}