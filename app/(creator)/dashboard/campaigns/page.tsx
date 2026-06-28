'use client'

import React, { useState, useMemo } from 'react'
import styled, { keyframes, css, createGlobalStyle } from 'styled-components'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Search,
  BarChart2,
  Edit2,
  Trash2,
  Play,
  Pause,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
  FileText,
  CheckCheck,
  X,
  ImageOff,
} from 'lucide-react'
import { useCampaigns, useDeleteCampaign, usePublishCampaign, usePauseCampaign } from '@/api/hooks/useCampaigns'
import { useAuthStore } from '@/store/authStore'

// ─── Fonts & Global ───────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; -webkit-font-smoothing: antialiased; }
`

// ─── Design Tokens (shared with /dashboard) ───────────────────────────────────

const tk = {
  // Core palette
  ink:         '#18171A',
  inkLight:    '#242228',
  inkMid:      '#302E35',
  inkBorder:   '#3D3A44',
  // Canvas
  canvas:      '#F7F5F1',
  canvasDeep:  '#EEEBe5',
  border:      '#E2DDD6',
  // Type
  white:       '#FFFFFF',
  offWhite:    '#F0EDE8',
  muted:       '#8C8790',
  body:        '#4A4750',
  heading:     '#18171A',
  // Accent — warm amber
  amber:       '#D4870A',
  amberLight:  '#FBF3E0',
  amberMid:    '#F5C961',
  amberDark:   '#A8680A',
  // Status
  green:       '#1A7A4A',
  greenLight:  '#E8F5EE',
  red:         '#C0392B',
  redLight:    '#FBE9E7',
  blue:        '#1A5FA8',
  blueLight:   '#E8F0FB',
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft:     { color: tk.muted,     bg: tk.canvasDeep,  label: 'Draft' },
  active:    { color: tk.green,     bg: tk.greenLight,  label: 'Active' },
  paused:    { color: tk.amberDark, bg: tk.amberLight,  label: 'Paused' },
  completed: { color: tk.blue,      bg: tk.blueLight,   label: 'Completed' },
  rejected:  { color: tk.red,       bg: tk.redLight,    label: 'Rejected' },
}

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const countUp = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`

const barGrow = keyframes`
  from { width: 0%; }
  to   { width: var(--bar-w); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`

// ─── Page shell ───────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  display: flex;
  flex-direction: column;
`

// ─── Top Bar ──────────────────────────────────────────────────────────────────

const TopBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(247, 245, 241, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid ${tk.blue};
  padding: 0 clamp(1rem, 3vw, 2rem);
  height: 60px;
  display: flex;
  align-items: center;
  gap: 1rem;
`

const IconBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 0.875rem;
  border-radius: 10px;
  border: 1px solid ${p => p.$primary ? 'transparent' : tk.border};
  background: ${p => p.$primary ? tk.blue : tk.white};
  color: ${p => p.$primary ? tk.white : tk.body};
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;

  &:hover {
    background: ${p => p.$primary ? '#0D4A8C' : tk.canvasDeep};
  }
`

const TopBarActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

// ─── Page Body ────────────────────────────────────────────────────────────────

const PageBody = styled.div`
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem) 4rem;
  flex: 1;
`

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  margin-bottom: 1.75rem;
  animation: ${fadeUp} 0.4s ease both;
`

const Greeting = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 400;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
`

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
`

const PageSub = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  color: ${tk.muted};
  margin: 8px 0 0;
`

// ─── KPI Strip ────────────────────────────────────────────────────────────────

const KPIStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
`

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
`

const KPITop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.875rem;
`

const KPIIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' | 'red' }>`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => ({
    amber: tk.amberLight,
    green: tk.greenLight,
    blue:  tk.blueLight,
    red:   tk.redLight,
  }[p.$color])};
  color: ${p => ({
    amber: tk.amber,
    green: tk.green,
    blue:  tk.blue,
    red:   tk.red,
  }[p.$color])};
`

const KPIValue = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: clamp(1.4rem, 2.5vw, 1.875rem);
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
  margin-bottom: 5px;
  animation: ${countUp} 0.6s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const KPILabel = styled.div`
  font-size: 0.75rem;
  color: ${tk.muted};
  font-weight: 400;
`

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`

const SearchBar = styled.div`
  flex: 1;
  min-width: 220px;
  position: relative;

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: ${tk.muted};
    pointer-events: none;
    width: 16px;
    height: 16px;
  }

  input {
    width: 100%;
    background: ${tk.canvasDeep};
    border: 1px solid ${tk.border};
    border-radius: 10px;
    padding: 0.55rem 0.875rem 0.55rem 2rem;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.875rem;
    color: ${tk.heading};
    outline: none;
    transition: border-color 140ms, background 140ms;

    &::placeholder { color: ${tk.muted}; }
    &:focus {
      border-color: ${tk.amber};
      background: ${tk.white};
    }
  }
`

const ViewToggle = styled.div`
  display: flex;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
  gap: 2px;
  flex-shrink: 0;
`

const ViewBtn = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 30px;
  border-radius: 7px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 140ms;
  background: ${p => p.$active ? tk.white : 'transparent'};
  color: ${p => p.$active ? tk.heading : tk.muted};
  box-shadow: ${p => p.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};

  &:hover { color: ${tk.heading}; }
`

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const FilterTabs = styled.div`
  display: flex;
  gap: 4px;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  padding: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  margin-bottom: 1.25rem;
`

const FilterTab = styled.button<{ $active?: boolean }>`
  padding: 0.4rem 0.875rem;
  border-radius: 7px;
  border: none;
  background: ${p => p.$active ? tk.white : 'transparent'};
  color: ${p => p.$active ? tk.heading : tk.muted};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: ${p => p.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  box-shadow: ${p => p.$active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'};

  &:hover { color: ${tk.heading}; }
`

// ─── Result count ─────────────────────────────────────────────────────────────

const ResultCount = styled.p`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: ${tk.muted};
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

// ─── Campaign Grid / List ─────────────────────────────────────────────────────

const CampaignGrid = styled.div<{ $view: 'grid' | 'list' }>`
  display: grid;
  gap: 1rem;

  ${p => p.$view === 'grid' && css`
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  `}

  ${p => p.$view === 'list' && css`
    grid-template-columns: 1fr;
  `}
`

// ─── Campaign Card ────────────────────────────────────────────────────────────

const Card = styled.div<{ $view: 'grid' | 'list'; $delay: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${p => p.$delay}ms;
  transition: border-color 140ms, box-shadow 140ms, transform 120ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
    transform: translateY(-1px);
  }

  ${p => p.$view === 'list' && css`
    display: flex;
    align-items: stretch;
  `}
`

const CardImageWrap = styled.div<{ $view: 'grid' | 'list' }>`
  ${p => p.$view === 'grid' && css`
    height: 160px;
    width: 100%;
  `}
  ${p => p.$view === 'list' && css`
    width: 120px;
    min-height: 100px;
    flex-shrink: 0;

    @media (max-width: 480px) {
      display: none;
    }
  `}

  background: linear-gradient(135deg, ${tk.canvasDeep} 0%, ${tk.border} 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tk.muted};
`

const CardImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const CardBody = styled.div<{ $view: 'grid' | 'list' }>`
  padding: 1.125rem;

  ${p => p.$view === 'list' && css`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 1.25rem;
    min-width: 0;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.875rem;
    }
  `}
`

const CardMain = styled.div<{ $view: 'grid' | 'list' }>`
  ${p => p.$view === 'list' && css`
    flex: 1;
    min-width: 0;
  `}
`

const CardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.625rem;
  flex-wrap: wrap;
`

const StatusPill = styled.span<{ $color: string; $bg: string }>`
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: ${p => p.$color};
  background: ${p => p.$bg};
`

const TypePill = styled.span`
  font-size: 0.68rem;
  color: ${tk.muted};
  background: ${tk.canvasDeep};
  padding: 2px 7px;
  border-radius: 100px;
  text-transform: capitalize;
`

const CardTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 5px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const CardDesc = styled.p`
  font-size: 0.8rem;
  color: ${tk.body};
  margin: 0 0 0.875rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressRow = styled.div`
  margin-bottom: 0.75rem;
`

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
`

const ProgressRaised = styled.span`
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${tk.heading};
`

const ProgressPct = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${tk.green};
  background: ${tk.greenLight};
  padding: 2px 8px;
  border-radius: 100px;
`

const ProgressGoal = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  color: ${tk.muted};
`

const ProgressTrack = styled.div`
  height: 6px;
  background: ${tk.canvasDeep};
  border-radius: 100px;
  overflow: hidden;
`

const ProgressFill = styled.div<{ $pct: number; $status: string }>`
  height: 100%;
  --bar-w: ${p => Math.min(p.$pct, 100)}%;
  width: var(--bar-w);
  border-radius: 100px;
  animation: ${barGrow} 1s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.3s;
  background: ${p => p.$status === 'completed'
    ? tk.green
    : `linear-gradient(90deg, ${tk.amber}, ${tk.amberMid})`};
`

const GoalLine = styled.div`
  margin-top: 6px;
`

// ─── List-view metrics ────────────────────────────────────────────────────────

const MetricRow = styled.div`
  display: flex;
  gap: 1.25rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${tk.canvasDeep};
`

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const MetricLabel = styled.span`
  font-size: 0.68rem;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const MetricValue = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${tk.heading};
`

// ─── Card actions ─────────────────────────────────────────────────────────────

const CardActions = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-top: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${tk.canvasDeep};
  flex-wrap: wrap;
`

const ListActions = styled.div`
  display: flex;
  gap: 0.375rem;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 100%;
  }
`

const ActionBtn = styled.button<{ $variant: 'default' | 'green' | 'amber' | 'danger' | 'blue' }>`
  flex: 1;
  min-width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0.45rem;
  border-radius: 7px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 120ms, border-color 120ms, color 120ms;
  min-height: 32px;
  white-space: nowrap;
  border: 1px solid;

  ${p => p.$variant === 'default' && css`
    border-color: ${tk.border};
    background: transparent;
    color: ${tk.muted};
    &:hover { background: ${tk.canvasDeep}; color: ${tk.heading}; }
  `}
  ${p => p.$variant === 'blue' && css`
    border-color: ${tk.border};
    background: transparent;
    color: ${tk.blue};
    &:hover { background: ${tk.blueLight}; border-color: rgba(26,95,168,0.3); }
  `}
  ${p => p.$variant === 'green' && css`
    border-color: rgba(26,122,74,0.3);
    background: ${tk.greenLight};
    color: ${tk.green};
    &:hover { background: rgba(26,122,74,0.16); }
  `}
  ${p => p.$variant === 'amber' && css`
    border-color: rgba(212,135,10,0.3);
    background: ${tk.amberLight};
    color: ${tk.amberDark};
    &:hover { background: rgba(212,135,10,0.18); }
  `}
  ${p => p.$variant === 'danger' && css`
    border-color: rgba(192,57,43,0.25);
    background: transparent;
    color: ${tk.red};
    &:hover { background: ${tk.redLight}; border-color: rgba(192,57,43,0.4); }
  `}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }
`

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: ${tk.white};
  border: 1.5px dashed ${tk.border};
  border-radius: 16px;
  animation: ${fadeUp} 0.4s ease both;
`

const EmptyIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${tk.canvasDeep};
  color: ${tk.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
`

const EmptyTitle = styled.p`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 0.375rem;
`

const EmptyBody = styled.p`
  font-size: 0.85rem;
  color: ${tk.muted};
  margin: 0 0 1.25rem;
  line-height: 1.6;
`

const CreateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  border: none;
  border-radius: 10px;
  padding: 0.65rem 1.25rem;
  cursor: pointer;
  transition: background 140ms;
  &:hover { background: ${tk.inkLight}; }
`

// ─── Loading ──────────────────────────────────────────────────────────────────

const SpinnerWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 1.5rem;
  gap: 0.875rem;
  color: ${tk.muted};
  font-size: 0.85rem;
`

const Spinner = styled(Loader2)`
  color: ${tk.amber};
  animation: ${spin} 0.8s linear infinite;
`

const SkeletonCard = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SkeletonLine = styled.div<{ $w?: string; $h?: string; $r?: number }>`
  width: ${p => p.$w || '100%'};
  height: ${p => p.$h || '12px'};
  background: linear-gradient(90deg, ${tk.canvasDeep} 25%, ${tk.border} 50%, ${tk.canvasDeep} 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: ${p => p.$r ?? 100}px;
`

// ─── Pagination ───────────────────────────────────────────────────────────────

const PaginationWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 2rem;
`

const PageBtn = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 9px;
  border: 1px solid ${p => p.$active ? tk.ink : tk.border};
  background: ${p => p.$active ? tk.ink : tk.white};
  color: ${p => p.$active ? tk.white : tk.body};
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 140ms;

  &:hover:not(:disabled) {
    border-color: ${tk.ink};
    background: ${p => p.$active ? tk.ink : tk.canvasDeep};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const PageInfo = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem;
  color: ${tk.muted};
`

// ─── Type filter ─────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'draft' | 'active' | 'paused' | 'completed' | 'rejected'

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreatorCampaignsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage]                 = useState(1)
  const [view, setView]                 = useState<'grid' | 'list'>('grid')

  const { data: campaignsData, isLoading, error, refetch } = useCampaigns(page, 12, { userId: user?.id })
  const deleteMutation  = useDeleteCampaign()
  const publishMutation = usePublishCampaign()
  const pauseMutation   = usePauseCampaign()

  // Filtered campaigns
  const filtered = useMemo(() => {
    if (!campaignsData?.campaigns) return []
    return campaignsData.campaigns.filter(c => {
      const matchesSearch = !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaignsData?.campaigns, search, statusFilter])

  // Stats
  const stats = useMemo(() => {
    const all = campaignsData?.campaigns || []
    return {
      total:     all.length,
      active:    all.filter(c => c.status === 'active').length,
      draft:     all.filter(c => c.status === 'draft').length,
      completed: all.filter(c => c.status === 'completed').length,
    }
  }, [campaignsData?.campaigns])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this campaign? This cannot be undone.')) return
    try { await deleteMutation.mutateAsync(id); refetch() } catch {}
  }
  const handleActivate = async (id: string) => {
    try { await publishMutation.mutateAsync(id); refetch() } catch {}
  }
  const handlePause = async (id: string) => {
    try { await pauseMutation.mutateAsync(id); refetch() } catch {}
  }

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: 'all',       label: 'All' },
    { value: 'active',    label: 'Active' },
    { value: 'draft',     label: 'Draft' },
    { value: 'paused',    label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected',  label: 'Rejected' },
  ]

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <GlobalStyle />
        <Page>
          <TopBar>
            <TopBarActions>
              <IconBtn $primary onClick={() => router.push('/campaigns/new')}>
                <Plus size={15} />
                New Campaign
              </IconBtn>
            </TopBarActions>
          </TopBar>
          <PageBody>
            <PageHeader>
              <Greeting>Creator Studio</Greeting>
              <PageTitle>My Campaigns</PageTitle>
            </PageHeader>
            <KPIStrip>
              {[0,1,2,3].map(i => (
                <SkeletonCard key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <SkeletonLine $w="34px" $h="34px" $r={10} />
                  </div>
                  <SkeletonLine $w="50%" $h="28px" style={{ marginTop: 8 }} />
                  <SkeletonLine $w="70%" $h="12px" />
                </SkeletonCard>
              ))}
            </KPIStrip>
            <SpinnerWrap>
              <Spinner size={26} />
              Loading your campaigns…
            </SpinnerWrap>
          </PageBody>
        </Page>
      </>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <>
        <GlobalStyle />
        <Page>
          <TopBar>
            <TopBarActions>
              <IconBtn $primary onClick={() => router.push('/campaigns/new')}>
                <Plus size={15} />
                New Campaign
              </IconBtn>
            </TopBarActions>
          </TopBar>
          <PageBody>
            <PageHeader>
              <Greeting>Creator Studio</Greeting>
              <PageTitle>My Campaigns</PageTitle>
            </PageHeader>
            <EmptyState>
              <EmptyIcon style={{ background: tk.redLight, color: tk.red }}>
                <AlertCircle size={26} />
              </EmptyIcon>
              <EmptyTitle>Couldn't load campaigns</EmptyTitle>
              <EmptyBody>Something went wrong. Try refreshing the page.</EmptyBody>
              <CreateBtn onClick={() => refetch()}>Try again</CreateBtn>
            </EmptyState>
          </PageBody>
        </Page>
      </>
    )
  }

  // ── Main ─────────────────────────────────────────────────────────────────

  return (
    <>
      <GlobalStyle />
      <Page>
        {/* Top Bar */}
        <TopBar>
          <TopBarActions>
            <IconBtn $primary onClick={() => router.push('/campaigns/new')}>
              <Plus size={15} />
              New Campaign
            </IconBtn>
          </TopBarActions>
        </TopBar>

        <PageBody>
          {/* Header */}
          <PageHeader>
            <Greeting>Creator Studio</Greeting>
            <PageTitle>My Campaigns</PageTitle>
            <PageSub>
              {stats.total} campaign{stats.total !== 1 ? 's' : ''} · {stats.active} active
            </PageSub>
          </PageHeader>

          {/* KPI strip */}
          <KPIStrip>
            <KPICard $delay={0}>
              <KPITop>
                <KPIIcon $color="blue"><Target size={16} /></KPIIcon>
              </KPITop>
              <KPIValue>{stats.total}</KPIValue>
              <KPILabel>Total</KPILabel>
            </KPICard>
            <KPICard $delay={1}>
              <KPITop>
                <KPIIcon $color="green"><TrendingUp size={16} /></KPIIcon>
              </KPITop>
              <KPIValue>{stats.active}</KPIValue>
              <KPILabel>Active</KPILabel>
            </KPICard>
            <KPICard $delay={2}>
              <KPITop>
                <KPIIcon $color="amber"><FileText size={16} /></KPIIcon>
              </KPITop>
              <KPIValue>{stats.draft}</KPIValue>
              <KPILabel>Drafts</KPILabel>
            </KPICard>
            <KPICard $delay={3}>
              <KPITop>
                <KPIIcon $color="blue"><CheckCheck size={16} /></KPIIcon>
              </KPITop>
              <KPIValue>{stats.completed}</KPIValue>
              <KPILabel>Completed</KPILabel>
            </KPICard>
          </KPIStrip>

          {/* Toolbar */}
          <Toolbar>
            <SearchBar>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by title or description…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </SearchBar>

            <ViewToggle>
              <ViewBtn $active={view === 'grid'} onClick={() => setView('grid')} title="Grid view" aria-pressed={view === 'grid'}>
                <LayoutGrid size={15} />
              </ViewBtn>
              <ViewBtn $active={view === 'list'} onClick={() => setView('list')} title="List view" aria-pressed={view === 'list'}>
                <List size={15} />
              </ViewBtn>
            </ViewToggle>
          </Toolbar>

          {/* Status filter tabs */}
          <FilterTabs>
            {STATUS_FILTERS.map(f => (
              <FilterTab
                key={f.value}
                $active={statusFilter === f.value}
                onClick={() => { setStatusFilter(f.value); setPage(1) }}
              >
                {f.label}
                {f.value !== 'all' && campaignsData?.campaigns && (
                  <span style={{ opacity: 0.6 }}>
                    {' '}({campaignsData.campaigns.filter(c => c.status === f.value).length})
                  </span>
                )}
              </FilterTab>
            ))}
          </FilterTabs>

          {/* Content */}
          {filtered.length === 0 ? (
            <EmptyState>
              <EmptyIcon>
                <FileText size={26} />
              </EmptyIcon>
              <EmptyTitle>
                {search || statusFilter !== 'all' ? 'No campaigns match' : 'No campaigns yet'}
              </EmptyTitle>
              <EmptyBody>
                {search || statusFilter !== 'all'
                  ? 'Try adjusting your search or clearing the filter.'
                  : 'Create your first campaign and start raising funds from your community.'}
              </EmptyBody>
              {!search && statusFilter === 'all' && (
                <CreateBtn onClick={() => router.push('/campaigns/new')}>
                  <Plus size={15} />
                  Create your first campaign
                </CreateBtn>
              )}
              {(search || statusFilter !== 'all') && (
                <CreateBtn
                  onClick={() => { setSearch(''); setStatusFilter('all') }}
                  style={{ background: tk.canvasDeep, color: tk.heading }}
                >
                  <X size={14} />
                  Clear filters
                </CreateBtn>
              )}
            </EmptyState>
          ) : (
            <>
              <ResultCount>
                {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' && ` · ${STATUS_CONFIG[statusFilter]?.label}`}
                {search && ` matching "${search}"`}
              </ResultCount>

              <CampaignGrid $view={view}>
                {filtered.map((campaign, idx) => {
                  const sc = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft
                  // SR-1: the $ meter uses the FUNDRAISING goal + canonical raised,
                  // never goals[0] (which could be a sharing_reach share-count).
                  const goal =
                    campaign.goals?.find((g: any) => g.goal_type === 'fundraising') || null
                  const goalAmountCents =
                    (campaign as any).goal_amount ?? goal?.target_amount ?? 0
                  const raisedCents =
                    (campaign as any).raised_amount ?? (campaign as any).total_donation_amount ?? (goal?.current_amount || 0)
                  const raised = raisedCents / 100
                  const target = goalAmountCents / 100
                  const pct = target > 0 ? Math.round((raised / target) * 100) : 0
                  const isFundraising = campaign.campaign_type === 'fundraising'

                  return (
                    <Card
                      key={campaign._id}
                      $view={view}
                      $delay={Math.min(idx * 40, 300)}
                    >
                      {view === 'grid' && (
                        <CardImageWrap $view="grid">
                          {campaign.image_url
                            ? <CardImg src={campaign.image_url} alt={campaign.title} />
                            : <ImageOff size={26} />
                          }
                        </CardImageWrap>
                      )}

                      <CardBody $view={view}>
                        {view === 'list' && (
                          <CardImageWrap $view="list">
                            {campaign.image_url
                              ? <CardImg src={campaign.image_url} alt={campaign.title} />
                              : <ImageOff size={20} />
                            }
                          </CardImageWrap>
                        )}

                        <CardMain $view={view}>
                          <CardMeta>
                            <StatusPill $color={sc.color} $bg={sc.bg}>
                              {sc.label}
                            </StatusPill>
                            <TypePill>
                              {isFundraising ? 'Fundraising' : 'Sharing'}
                            </TypePill>
                          </CardMeta>

                          <CardTitle>{campaign.title}</CardTitle>

                          {view === 'grid' && (
                            <CardDesc>{campaign.description}</CardDesc>
                          )}

                          {isFundraising && goal && (
                            view === 'grid' ? (
                              <ProgressRow>
                                <ProgressLabels>
                                  <ProgressRaised>${raised.toLocaleString()}</ProgressRaised>
                                  <ProgressPct>{pct}%</ProgressPct>
                                </ProgressLabels>
                                <ProgressTrack>
                                  <ProgressFill $pct={pct} $status={campaign.status} />
                                </ProgressTrack>
                                <GoalLine>
                                  <ProgressGoal>of ${target.toLocaleString()} goal</ProgressGoal>
                                </GoalLine>
                              </ProgressRow>
                            ) : (
                              <MetricRow>
                                <MetricItem>
                                  <MetricLabel>Raised</MetricLabel>
                                  <MetricValue>${raised.toLocaleString()}</MetricValue>
                                </MetricItem>
                                <MetricItem>
                                  <MetricLabel>Goal</MetricLabel>
                                  <MetricValue>${target.toLocaleString()}</MetricValue>
                                </MetricItem>
                                <MetricItem>
                                  <MetricLabel>Progress</MetricLabel>
                                  <MetricValue>{pct}%</MetricValue>
                                </MetricItem>
                              </MetricRow>
                            )
                          )}

                          {view === 'grid' ? (
                            <CardActions>
                              <ActionBtn $variant="default" onClick={() => router.push(`/dashboard/campaigns/${campaign._id}/edit`)}>
                                <Edit2 size={12} />
                                Edit
                              </ActionBtn>

                              <ActionBtn
                                $variant="blue"
                                onClick={() => router.push(`/campaigns/${campaign._id}/analytics`)}
                              >
                                <BarChart2 size={12} />
                                Stats
                              </ActionBtn>

                              {campaign.status === 'draft' && (
                                <ActionBtn
                                  $variant="green"
                                  onClick={() => handleActivate(campaign._id)}
                                  disabled={publishMutation.isPending}
                                >
                                  <Play size={12} />
                                  Publish
                                </ActionBtn>
                              )}

                              {campaign.status === 'active' && (
                                <ActionBtn
                                  $variant="amber"
                                  onClick={() => handlePause(campaign._id)}
                                  disabled={pauseMutation.isPending}
                                >
                                  <Pause size={12} />
                                  Pause
                                </ActionBtn>
                              )}

                              {campaign.status === 'paused' && (
                                <ActionBtn
                                  $variant="green"
                                  onClick={() => handleActivate(campaign._id)}
                                  disabled={publishMutation.isPending}
                                >
                                  <Play size={12} />
                                  Resume
                                </ActionBtn>
                              )}

                              <ActionBtn
                                $variant="danger"
                                onClick={() => handleDelete(campaign._id)}
                                disabled={deleteMutation.isPending}
                                style={{ flex: '0 0 auto', minWidth: 36 }}
                              >
                                <Trash2 size={12} />
                              </ActionBtn>
                            </CardActions>
                          ) : (
                            <ListActions>
                              <ActionBtn $variant="default" onClick={() => router.push(`/dashboard/campaigns/${campaign._id}/edit`)}>
                                <Edit2 size={12} />
                                Edit
                              </ActionBtn>
                              <ActionBtn $variant="blue" onClick={() => router.push(`/campaigns/${campaign._id}/analytics`)}>
                                <BarChart2 size={12} />
                                Stats
                              </ActionBtn>
                              {campaign.status === 'draft' && (
                                <ActionBtn $variant="green" onClick={() => handleActivate(campaign._id)}>
                                  <Play size={12} /> Publish
                                </ActionBtn>
                              )}
                              {campaign.status === 'active' && (
                                <ActionBtn $variant="amber" onClick={() => handlePause(campaign._id)}>
                                  <Pause size={12} /> Pause
                                </ActionBtn>
                              )}
                              {campaign.status === 'paused' && (
                                <ActionBtn $variant="green" onClick={() => handleActivate(campaign._id)}>
                                  <Play size={12} /> Resume
                                </ActionBtn>
                              )}
                              <ActionBtn $variant="danger" onClick={() => handleDelete(campaign._id)} style={{ flex: '0 0 auto', minWidth: 36 }}>
                                <Trash2 size={12} />
                              </ActionBtn>
                            </ListActions>
                          )}
                        </CardMain>
                      </CardBody>
                    </Card>
                  )
                })}
              </CampaignGrid>

              {/* Pagination */}
              {campaignsData?.pagination && campaignsData.pagination.totalPages > 1 && (
                <PaginationWrap>
                  <PageBtn
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </PageBtn>

                  {Array.from({ length: campaignsData.pagination.totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === campaignsData.pagination.totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | '…')[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '…'
                        ? <PageInfo key={`ellipsis-${i}`}>…</PageInfo>
                        : <PageBtn key={p} $active={p === page} onClick={() => setPage(p as number)}>{p}</PageBtn>
                    )
                  }

                  <PageBtn
                    disabled={page === campaignsData.pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                    <ChevronRight size={14} />
                  </PageBtn>
                </PaginationWrap>
              )}
            </>
          )}
        </PageBody>
      </Page>
    </>
  )
}
