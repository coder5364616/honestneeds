/**
 * ShareRewardsDashboard.tsx
 * Sharer dashboard to view earned rewards with 30-day hold countdown.
 *
 * Restyled to match the /dashboard design system (Syne / DM Sans / DM Mono,
 * warm-amber + ink token palette, styled-components). Pulls real data from the
 * backend via the configured apiClient (auth token + correct baseURL).
 *
 * Features:
 * - Total earned / available / pending KPI strip
 * - Verified rewards (available for payout) with multi-select
 * - Pending rewards (30-day hold) with live countdown
 * - Payout request modal
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import {
  AlertCircle, Clock, CheckCircle2, TrendingUp, Loader2,
  Wallet, Gift, X, BarChart3,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { SharerPayoutTimeline } from '@/components/wallet/SharerPayoutTimeline';
import { usePaymentMethods } from '@/api/hooks/usePaymentMethods';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Reward {
  _id: string;
  reward_id: string;
  campaign_id: string;
  campaign_name?: string;
  amount_cents: number;
  status: 'pending_verification' | 'verified' | 'available_for_payout';
  hold_until_date: string;
  hold_days_remaining: number;
  verified_at?: string;
  earned_at: string;
}

interface RewardsSummary {
  total_earned_cents: number;
  verified_cents: number;
  pending_cents: number;
  total_reward_count: number;
  verified_count: number;
  pending_count: number;
  can_request_payout: boolean;
  total_available_for_payout: number;
}

interface RewardsData {
  sharer_id: string;
  summary: RewardsSummary;
  rewards: Reward[];
  verified_rewards: Reward[];
  pending_rewards: Reward[];
}

const EMPTY_SUMMARY: RewardsSummary = {
  total_earned_cents: 0,
  verified_cents: 0,
  pending_cents: 0,
  total_reward_count: 0,
  verified_count: 0,
  pending_count: 0,
  can_request_payout: false,
  total_available_for_payout: 0,
};

const MIN_WITHDRAWAL_CENTS = 500; // $5 — unified with /wallet/withdrawals minimum, must match backend

// ─── Design Tokens (mirrors /dashboard) ───────────────────────────────────────

const tk = {
  ink:         '#18171A',
  inkLight:    '#242228',
  inkBorder:   '#3D3A44',
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  white:       '#FFFFFF',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
};

// ─── Fonts & Global ────────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
`;

// ─── Animations ─────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const countUp = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`;
const barGrow = keyframes`
  from { width: 0%; }
  to   { width: var(--bar-w); }
`;
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

// ─── Layout ───────────────────────────────────────────────────────────────────

const Page = styled.div`
  background: ${tk.canvas};
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`;

const Body = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
`;

const PageHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
  animation: ${fadeUp} 0.4s ease both;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
`;

const Greeting = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
`;

const PageTitle = styled.h1`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
`;

// ─── KPI Strip ──────────────────────────────────────────────────────────────

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { gap: 0.75rem; }
`;

const KPICard = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.25rem 1rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 80}ms;
  position: relative;
  overflow: hidden;
  transition: box-shadow 180ms, border-color 180ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.12);
  }
`;

const KPITop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.875rem;
`;

const KPIIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' | 'red' }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => ({ amber: tk.amberLight, green: tk.greenLight, blue: tk.blueLight, red: tk.redLight }[p.$color])};
  color: ${p => ({ amber: tk.amber, green: tk.green, blue: tk.blue, red: tk.red }[p.$color])};
`;

const KPIValue = styled.div<{ $color?: string }>`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${p => p.$color || tk.heading};
  line-height: 1;
  margin-bottom: 5px;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`;

const KPILabel = styled.div`
  font-size: 0.75rem;
  color: ${tk.muted};
`;

const KPISub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 3px;
`;

// ─── Section / Card ────────────────────────────────────────────────────────────

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem 0 1rem;
  flex-wrap: wrap;
`;

const SectionH = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    font-weight: 400;
    color: ${tk.muted};
  }
`;

const Card = styled.div<{ $accent?: 'amber' | 'green'; $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1.5rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 60}ms;
  ${p => p.$accent === 'amber' && `border-color: ${tk.amberMid};`}
  ${p => p.$accent === 'green' && `border-color: ${tk.green}33;`}
`;

// ─── Table ──────────────────────────────────────────────────────────────────

const TableWrap = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  padding: 0.625rem 0.75rem;
  text-align: left;
  font-family: 'DM Mono', monospace;
  font-size: 0.66rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${tk.muted};
  border-bottom: 1px solid ${tk.border};
  white-space: nowrap;
`;

const Tr = styled.tr`
  border-bottom: 1px solid ${tk.canvasDeep};
  transition: background 140ms;
  &:hover { background: ${tk.canvas}; }
  &:last-child { border-bottom: none; }
`;

const Td = styled.td`
  padding: 0.875rem 0.75rem;
  color: ${tk.body};
  vertical-align: middle;
`;

const CampaignName = styled.span`
  font-weight: 500;
  color: ${tk.heading};
`;

const Money = styled.span<{ $tone?: 'green' | 'amber' }>`
  font-family: 'DM Mono', monospace;
  font-weight: 500;
  color: ${p => p.$tone === 'green' ? tk.green : p.$tone === 'amber' ? tk.amberDark : tk.heading};
`;

const Pill = styled.span<{ $tone: 'green' | 'amber' }>`
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  background: ${p => p.$tone === 'green' ? tk.greenLight : tk.amberLight};
  color: ${p => p.$tone === 'green' ? tk.green : tk.amberDark};
`;

const Check = styled.input`
  width: 15px;
  height: 15px;
  accent-color: ${tk.amber};
  cursor: pointer;
`;

const CountdownCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 96px;
`;

const CountdownDays = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  font-weight: 500;
  color: ${tk.amberDark};
`;

const Track = styled.div`
  height: 5px;
  background: ${tk.canvasDeep};
  border-radius: 100px;
  overflow: hidden;
`;

const Fill = styled.div<{ $pct: number }>`
  height: 100%;
  --bar-w: ${p => Math.min(Math.max(p.$pct, 0), 100)}%;
  width: var(--bar-w);
  border-radius: 100px;
  background: linear-gradient(90deg, ${tk.amber}, ${tk.amberMid});
  animation: ${barGrow} 0.9s cubic-bezier(0.22,1,0.36,1) both;
`;

// ─── Payout footer ─────────────────────────────────────────────────────────────

const PayoutFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  border-top: 1px solid ${tk.border};
  margin-top: 1rem;
  padding-top: 1rem;
`;

const PayoutSummary = styled.div`
  font-size: 0.85rem;
  color: ${tk.body};
  b {
    font-family: 'DM Mono', monospace;
    color: ${tk.green};
    font-weight: 500;
  }
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  transition: background 140ms;
  &:hover:not(:disabled) { background: ${tk.inkLight}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const GhostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  color: ${tk.body};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  transition: background 140ms;
  &:hover { background: ${tk.canvasDeep}; }
`;

const HoldNote = styled.p`
  margin: 1rem 0 0;
  font-size: 0.78rem;
  color: ${tk.amberDark};
  display: flex;
  align-items: center;
  gap: 6px;
`;

// ─── States ───────────────────────────────────────────────────────────────────

const Centered = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 4rem 1rem;
  color: ${tk.muted};
  font-size: 0.9rem;
  svg { animation: ${spin} 0.9s linear infinite; }
`;

const ErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: ${tk.redLight};
  border: 1px solid rgba(192,57,43,0.2);
  border-radius: 10px;
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  color: ${tk.red};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${tk.white};
  border: 1.5px dashed ${tk.border};
  border-radius: 16px;
`;

const EmptyTitle = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 1rem 0 0.375rem;
`;

const EmptyBody = styled.p`
  font-size: 0.85rem;
  color: ${tk.muted};
  margin: 0;
`;

// ─── Modal ────────────────────────────────────────────────────────────────────

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(24,23,26,0.55);
  backdrop-filter: blur(3px);
  padding: 1rem;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${tk.white};
  border-radius: 16px;
  border: 1px solid ${tk.border};
  padding: 1.5rem;
  animation: ${fadeUp} 0.3s ease both;
`;

const ModalHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`;

const ModalTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${tk.muted};
  padding: 4px;
  border-radius: 6px;
  display: flex;
  &:hover { background: ${tk.canvasDeep}; color: ${tk.heading}; }
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const FieldLabel = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 500;
  color: ${tk.heading};
  margin-bottom: 0.375rem;
`;

const inputStyles = `
  width: 100%;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: ${tk.heading};
  background: ${tk.canvas};
  outline: none;
  transition: border-color 140ms, background 140ms;
  &:focus { border-color: ${tk.amber}; background: ${tk.white}; }
`;

const TextInput = styled.input`${inputStyles}`;
const Select = styled.select`${inputStyles} cursor: pointer;`;

const FieldHint = styled.p`
  margin: 0.375rem 0 0;
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  color: ${tk.muted};
`;

const ModalActions = styled.div`
  display: flex;
  gap: 0.625rem;
  margin-top: 1.25rem;
  & > * { flex: 1; }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);

// ─── Component ────────────────────────────────────────────────────────────────

export default function ShareRewardsDashboard() {
  const router = useRouter();
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [displayedCountdowns, setDisplayedCountdowns] = useState<Record<string, number>>({});

  const {
    data: rewardsData,
    isLoading,
    error,
    refetch,
  } = useQuery<RewardsData>({
    queryKey: ['sharer-rewards'],
    queryFn: async () => {
      const response = await apiClient.get('/sharer/rewards');
      return response.data.data;
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const payoutMutation = useMutation({
    mutationFn: async (data: { amount_cents: number; payment_method_id: string }) => {
      const response = await apiClient.post('/sharer/payout-requests', data);
      return response.data.data;
    },
    onSuccess: () => {
      setShowPayoutModal(false);
      setSelectedRewards([]);
      refetch();
      alert('Payment claim sent! Each campaign creator will pay you directly to your saved payout method.');
    },
    onError: (err: any) => {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    },
  });

  const verifiedRewards = useMemo(() => rewardsData?.verified_rewards || [], [rewardsData]);
  const pendingRewards = useMemo(() => rewardsData?.pending_rewards || [], [rewardsData]);
  const summary = rewardsData?.summary || EMPTY_SUMMARY;

  // Live 30-day-hold countdown
  useEffect(() => {
    if (!pendingRewards.length) return;
    const update = () => {
      const next: Record<string, number> = {};
      pendingRewards.forEach((r) => {
        const now = Date.now();
        const holdUntil = new Date(r.hold_until_date).getTime();
        next[r._id] = Math.max(0, Math.ceil((holdUntil - now) / (1000 * 60 * 60 * 24)));
      });
      setDisplayedCountdowns(next);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [pendingRewards]);

  const handleSelectReward = (id: string, checked: boolean) =>
    setSelectedRewards(prev => checked ? [...prev, id] : prev.filter(x => x !== id));

  const handleSelectAll = (checked: boolean) =>
    setSelectedRewards(checked ? verifiedRewards.map(r => r._id) : []);

  const totalSelected = useMemo(() =>
    selectedRewards.reduce((sum, id) => {
      const r = verifiedRewards.find(x => x._id === id);
      return sum + (r?.amount_cents || 0);
    }, 0),
  [selectedRewards, verifiedRewards]);

  if (isLoading) {
    return (
      <Page>
        <GlobalStyle />
        <Body>
          <Centered>
            <Loader2 size={24} />
            Loading your rewards…
          </Centered>
        </Body>
      </Page>
    );
  }

  return (
    <Page>
      <GlobalStyle />
      <Body>
        {/* Header */}
        <PageHeader>
          <div>
            <Greeting>Share to Earn</Greeting>
            <PageTitle>Share Rewards</PageTitle>
          </div>
          <HeaderActions>
            <GhostBtn onClick={() => router.push('/shares')}>
              <BarChart3 size={15} />
              View Share Analytics
            </GhostBtn>
          </HeaderActions>
        </PageHeader>

        {error && (
          <Card>
            <ErrorBanner>
              <AlertCircle size={18} />
              Couldn&apos;t load your rewards. Please try again.
            </ErrorBanner>
          </Card>
        )}

        {/* KPI Strip */}
        <KPIStrip>
          <KPICard $delay={0}>
            <KPITop>
              <KPIIcon $color="amber"><Gift size={16} /></KPIIcon>
            </KPITop>
            <KPIValue>{formatCurrency(summary.total_earned_cents)}</KPIValue>
            <KPILabel>Total Earned</KPILabel>
            <KPISub>{summary.total_reward_count} rewards</KPISub>
          </KPICard>

          <KPICard $delay={1}>
            <KPITop>
              <KPIIcon $color="green"><CheckCircle2 size={16} /></KPIIcon>
            </KPITop>
            <KPIValue $color={tk.green}>{formatCurrency(summary.verified_cents)}</KPIValue>
            <KPILabel>Available for Payout</KPILabel>
            <KPISub>{summary.verified_count} verified</KPISub>
          </KPICard>

          <KPICard $delay={2}>
            <KPITop>
              <KPIIcon $color="amber"><Clock size={16} /></KPIIcon>
            </KPITop>
            <KPIValue $color={tk.amberDark}>{formatCurrency(summary.pending_cents)}</KPIValue>
            <KPILabel>Owed</KPILabel>
            <KPISub>{summary.pending_count} awaiting payout</KPISub>
          </KPICard>

          <KPICard $delay={3}>
            <KPITop>
              <KPIIcon $color="blue"><TrendingUp size={16} /></KPIIcon>
            </KPITop>
            <KPIValue>{formatCurrency(summary.verified_cents + summary.pending_cents)}</KPIValue>
            <KPILabel>In Progress</KPILabel>
            <KPISub>verified + pending</KPISub>
          </KPICard>
        </KPIStrip>

        {/* Empty state */}
        {summary.total_reward_count === 0 ? (
          <EmptyState>
            <KPIIcon $color="amber" style={{ margin: '0 auto', width: 48, height: 48, borderRadius: 14 }}>
              <Gift size={24} />
            </KPIIcon>
            <EmptyTitle>No rewards yet</EmptyTitle>
            <EmptyBody>Share campaigns to earn rewards. Start sharing and earn from your network.</EmptyBody>
          </EmptyState>
        ) : (
          <>
            {/* Verified — available for payout */}
            {verifiedRewards.length > 0 && (
              <>
                <SectionHead>
                  <SectionH>
                    Available for Payout <span>{verifiedRewards.length} rewards</span>
                  </SectionH>
                </SectionHead>
                <Card $accent="green">
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <Th style={{ width: 32 }}>
                            <Check
                              type="checkbox"
                              checked={selectedRewards.length === verifiedRewards.length}
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                          </Th>
                          <Th>Campaign</Th>
                          <Th>Amount</Th>
                          <Th>Earned</Th>
                          <Th>Status</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {verifiedRewards.map((r) => (
                          <Tr key={r._id}>
                            <Td>
                              <Check
                                type="checkbox"
                                checked={selectedRewards.includes(r._id)}
                                onChange={(e) => handleSelectReward(r._id, e.target.checked)}
                              />
                            </Td>
                            <Td><CampaignName>{r.campaign_name || 'Campaign'}</CampaignName></Td>
                            <Td><Money $tone="green">{formatCurrency(r.amount_cents)}</Money></Td>
                            <Td>{new Date(r.earned_at).toLocaleDateString()}</Td>
                            <Td><Pill $tone="green">Verified</Pill></Td>
                          </Tr>
                        ))}
                      </tbody>
                    </Table>
                  </TableWrap>

                  <PayoutFooter>
                    <PayoutSummary>
                      Selected: <b>{formatCurrency(totalSelected)}</b> ({selectedRewards.length} reward{selectedRewards.length !== 1 ? 's' : ''})
                    </PayoutSummary>
                    <PrimaryBtn
                      onClick={() => setShowPayoutModal(true)}
                      disabled={selectedRewards.length === 0 || totalSelected < MIN_WITHDRAWAL_CENTS}
                      title={
                        selectedRewards.length === 0
                          ? 'Select at least one reward to request payment'
                          : totalSelected < MIN_WITHDRAWAL_CENTS
                          ? `Minimum payout is ${formatCurrency(MIN_WITHDRAWAL_CENTS)} — select more rewards to reach it`
                          : 'Ready to request payment'
                      }
                    >
                      <Wallet size={15} />
                      Request payment
                    </PrimaryBtn>
                  </PayoutFooter>
                  {selectedRewards.length > 0 && totalSelected < MIN_WITHDRAWAL_CENTS && (
                    <HoldNote>
                      <AlertCircle size={14} />
                      Minimum payout is {formatCurrency(MIN_WITHDRAWAL_CENTS)} — select{' '}
                      {formatCurrency(MIN_WITHDRAWAL_CENTS - totalSelected)} more in rewards to request a payout.
                    </HoldNote>
                  )}
                </Card>
              </>
            )}

            {/* Pending — 30-day hold */}
            {pendingRewards.length > 0 && (
              <>
                <SectionHead>
                  <SectionH>
                    Owed <span>{pendingRewards.length} rewards awaiting payout</span>
                  </SectionH>
                </SectionHead>
                <Card $accent="amber">
                  <TableWrap>
                    <Table>
                      <thead>
                        <tr>
                          <Th>Campaign</Th>
                          <Th>Amount</Th>
                          <Th>Earned</Th>
                          <Th>Days Remaining</Th>
                          <Th>Status</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingRewards.map((r) => {
                          const daysRemaining = displayedCountdowns[r._id] ?? r.hold_days_remaining;
                          const pct = ((30 - daysRemaining) / 30) * 100;
                          return (
                            <Tr key={r._id}>
                              <Td><CampaignName>{r.campaign_name || 'Campaign'}</CampaignName></Td>
                              <Td><Money $tone="amber">{formatCurrency(r.amount_cents)}</Money></Td>
                              <Td>{new Date(r.earned_at).toLocaleDateString()}</Td>
                              <Td>
                                <CountdownCell>
                                  <CountdownDays>{daysRemaining} days</CountdownDays>
                                  <Track><Fill $pct={pct} /></Track>
                                </CountdownCell>
                              </Td>
                              <Td><Pill $tone="amber">Owed</Pill></Td>
                            </Tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </TableWrap>
                  <HoldNote>
                    <Clock size={14} />
                    Rewards are owed as soon as a share converts. Request a payout anytime — the creator pays you directly.
                  </HoldNote>
                </Card>
              </>
            )}
          </>
        )}
        {/* F-3: per-campaign payout timeline (requested → paid → received) */}
        <SharerPayoutTimeline />
      </Body>

      {showPayoutModal && (
        <PayoutRequestModal
          availableCents={summary.verified_cents}
          selectedCount={selectedRewards.length}
          presetCents={totalSelected || summary.verified_cents}
          onClose={() => setShowPayoutModal(false)}
          onSubmit={(data) => payoutMutation.mutate(data)}
          isLoading={payoutMutation.isPending}
        />
      )}
    </Page>
  );
}

// ─── Payout Modal ──────────────────────────────────────────────────────────────

interface PayoutRequestModalProps {
  availableCents: number;
  selectedCount: number;
  presetCents: number;
  onClose: () => void;
  onSubmit: (data: { amount_cents: number; payment_method_id: string }) => void;
  isLoading: boolean;
}

function PayoutRequestModal({
  availableCents,
  selectedCount,
  presetCents,
  onClose,
  onSubmit,
  isLoading,
}: PayoutRequestModalProps) {
  const [amount, setAmount] = useState((presetCents / 100).toFixed(2));

  // C-1: payouts target a REAL saved payment method so the creator knows exactly
  // where to send the money. No saved method → the sharer must add one first.
  const { data: methods = [], isLoading: methodsLoading } = usePaymentMethods();

  // Only methods the backend can actually pay out to (matches PaymentMethod enum).
  const payable = useMemo(
    () => methods.filter((m) => ['bank_transfer', 'mobile_money', 'stripe'].includes(m.type as string)),
    [methods],
  );

  const [methodId, setMethodId] = useState('');
  useEffect(() => {
    if (!methodId && payable.length) {
      setMethodId((payable.find((m) => m.isPrimary)?.id || payable[0]?.id) ?? '');
    }
  }, [payable, methodId]);

  const amountCents = Math.round(parseFloat(amount || '0') * 100);
  const hasMethod = payable.length > 0;
  const isValid =
    amountCents >= MIN_WITHDRAWAL_CENTS &&
    amountCents <= availableCents &&
    !!methodId &&
    hasMethod;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <ModalHead>
          <ModalTitle>Request payment from creators</ModalTitle>
          <CloseBtn onClick={onClose}><X size={18} /></CloseBtn>
        </ModalHead>

        <Field>
          <FieldLabel>Amount to claim (USD)</FieldLabel>
          <TextInput
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={(MIN_WITHDRAWAL_CENTS / 100).toFixed(2)}
            max={(availableCents / 100).toFixed(2)}
            step="0.01"
          />
          <FieldHint>
            Available: {formatCurrency(availableCents)} · Min: {formatCurrency(MIN_WITHDRAWAL_CENTS)}
          </FieldHint>
        </Field>

        <Field>
          <FieldLabel>Where should creators pay you?</FieldLabel>
          {methodsLoading ? (
            <FieldHint>Loading your payout methods…</FieldHint>
          ) : hasMethod ? (
            <>
              <Select value={methodId} onChange={(e) => setMethodId(e.target.value)}>
                {payable.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.displayName || m.type}
                    {m.isPrimary ? ' (primary)' : ''}
                  </option>
                ))}
              </Select>
              <FieldHint>
                <a href="/settings" style={{ color: tk.blue, fontWeight: 600 }}>+ Add another payout method</a>
              </FieldHint>
            </>
          ) : (
            <FieldHint style={{ lineHeight: 1.5 }}>
              You don&apos;t have a payout method yet. Add a bank account or mobile money in{' '}
              <a href="/settings" style={{ color: tk.blue, fontWeight: 600 }}>Payment Settings</a>{' '}
              so creators know where to send your money.
            </FieldHint>
          )}
        </Field>

        {selectedCount > 0 && (
          <FieldHint>{selectedCount} reward{selectedCount !== 1 ? 's' : ''} selected</FieldHint>
        )}

        <FieldHint style={{ lineHeight: 1.5 }}>
          Your claim goes to each campaign&apos;s creator, who pays you directly to your
          selected method — HonestNeed never holds your money.
        </FieldHint>

        <ModalActions>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PrimaryBtn
            onClick={() => onSubmit({ amount_cents: amountCents, payment_method_id: methodId })}
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Sending…' : 'Send claim to creators'}
          </PrimaryBtn>
        </ModalActions>
      </Modal>
    </Overlay>
  );
}
