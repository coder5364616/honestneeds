'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import styled, { keyframes, css } from 'styled-components'
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
  SlidersHorizontal,
  X,
  ImageOff,
} from 'lucide-react'
import { useCampaigns, useDeleteCampaign, usePublishCampaign, usePauseCampaign } from '@/api/hooks/useCampaigns'
import { useAuthStore } from '@/store/authStore'

// ─── Brand tokens ────────────────────────────────────────────────────────────

const B = {
  navy:    '#1A1A4E',
  navyMid: '#252566',
  blue:    '#29B6F6',
  yellow:  '#FFD600',
  red:     '#E53935',
  green:   '#43A047',
  purple:  '#7C3AED',
  amber:   '#F59E0B',
  // Status
  statusActive:    '#43A047',
  statusDraft:     '#94A3B8',
  statusPaused:    '#F59E0B',
  statusCompleted: '#29B6F6',
  statusRejected:  '#E53935',
  // UI
  bg:       '#F4F6FB',
  card:     '#FFFFFF',
  border:   '#E4E8F2',
  text:     '#0F1123',
  muted:    '#64748B',
  light:    '#94A3B8',
  // Tints
  blueT:   'rgba(41,182,246,0.1)',
  yellowT: 'rgba(255,214,0,0.12)',
  greenT:  'rgba(67,160,71,0.1)',
  redT:    'rgba(229,57,53,0.1)',
  navyT:   'rgba(26,26,78,0.06)',
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  draft:     { color: B.statusDraft,     bg: 'rgba(148,163,184,0.12)', label: 'Draft' },
  active:    { color: B.statusActive,    bg: 'rgba(67,160,71,0.12)',   label: 'Active' },
  paused:    { color: B.statusPaused,    bg: 'rgba(245,158,11,0.12)',  label: 'Paused' },
  completed: { color: B.statusCompleted, bg: 'rgba(41,182,246,0.12)',  label: 'Completed' },
  rejected:  { color: B.statusRejected,  bg: 'rgba(229,57,53,0.12)',   label: 'Rejected' },
}

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

const skeletonPulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
`

// ─── Page shell ───────────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: ${B.bg};
  font-family: 'DM Sans', 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
`

// ─── Header band ─────────────────────────────────────────────────────────────

const HeaderBand = styled.div`
  background: ${B.navy};
  padding: 28px 20px 32px;

  @media (min-width: 640px) {
    padding: 32px 32px 40px;
  }

  @media (min-width: 1024px) {
    padding: 36px 48px 44px;
  }
`

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const HeaderLeft = styled.div``

const Eyebrow = styled.p`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${B.yellow};
  margin: 0 0 6px;
`

const PageTitle = styled.h1`
  font-size: clamp(1.5rem, 4vw, 2.1rem);
  font-weight: 800;
  color: #fff;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.15;
`

const PageSubtitle = styled.p`
  font-size: 13.5px;
  color: rgba(255,255,255,0.55);
  margin: 6px 0 0;
`

const CreateBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 20px;
  background: ${B.yellow};
  color: ${B.navy};
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: -0.01em;
  transition: all 180ms ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #FFE033;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(255,214,0,0.4);
  }

  &:active {
    transform: translateY(0);
  }
`

// ─── Stats strip (overlaps header band bottom) ────────────────────────────────

const StatsWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 10;
  transform: translateY(-24px);

  @media (min-width: 640px) {
    padding: 0 32px;
  }

  @media (min-width: 1024px) {
    padding: 0 48px;
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;

  @media (min-width: 500px) {
    grid-template-columns: repeat(4, 1fr);
  }
`

const StatCard = styled.div<{ $accent: string; $delay: number }>`
  background: ${B.card};
  border: 1px solid ${B.border};
  border-radius: 14px;
  padding: 16px 14px;
  box-shadow: 0 2px 12px rgba(26,26,78,0.07);
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${p => p.$delay}ms;
  transition: box-shadow 200ms ease, transform 200ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(26,26,78,0.1);
  }
`

const StatIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: ${p => p.$color}18;
  color: ${p => p.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`

const StatValue = styled.p`
  font-size: clamp(1.4rem, 4vw, 1.8rem);
  font-weight: 800;
  color: ${B.text};
  margin: 0 0 2px;
  letter-spacing: -0.04em;
  line-height: 1;
`

const StatLabel = styled.p`
  font-size: 11px;
  font-weight: 600;
  color: ${B.light};
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0;
`

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const ToolbarWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 20px;

  @media (min-width: 640px) {
    padding: 0 32px 24px;
  }

  @media (min-width: 1024px) {
    padding: 0 48px 24px;
  }
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const SearchWrap = styled.div`
  flex: 1;
  min-width: 220px;
  position: relative;

  svg {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: ${B.light};
    pointer-events: none;
  }
`

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 12px 10px 38px;
  background: ${B.card};
  border: 1px solid ${B.border};
  border-radius: 10px;
  font-size: 13.5px;
  color: ${B.text};
  transition: border-color 150ms ease, box-shadow 150ms ease;
  font-family: inherit;

  &::placeholder { color: ${B.light}; }

  &:focus {
    outline: none;
    border-color: ${B.blue};
    box-shadow: 0 0 0 3px rgba(41,182,246,0.14);
  }
`

const FilterPills = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
`

const FilterPill = styled.button<{ $active: boolean; $color?: string }>`
  padding: 7px 13px;
  border-radius: 99px;
  border: 1.5px solid ${p => p.$active ? (p.$color || B.navy) : B.border};
  background: ${p => p.$active ? (p.$color || B.navy) + '14' : B.card};
  color: ${p => p.$active ? (p.$color || B.navy) : B.muted};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
  white-space: nowrap;

  &:hover {
    border-color: ${p => p.$color || B.navy};
    color: ${p => p.$color || B.navy};
    background: ${p => (p.$color || B.navy) + '10'};
  }
`

const ViewToggle = styled.div`
  display: flex;
  background: ${B.card};
  border: 1px solid ${B.border};
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
  flex-shrink: 0;
`

const ViewBtn = styled.button<{ $active: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
  background: ${p => p.$active ? B.navy : 'transparent'};
  color: ${p => p.$active ? '#fff' : B.light};

  &:hover:not([aria-pressed="true"]) {
    background: ${B.navyT};
    color: ${B.navy};
  }
`

// ─── Main content ─────────────────────────────────────────────────────────────

const ContentWrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 60px;

  @media (min-width: 640px) {
    padding: 0 32px 60px;
  }

  @media (min-width: 1024px) {
    padding: 0 48px 60px;
  }
`

// ─── Campaign Grid / List ─────────────────────────────────────────────────────

const CampaignGrid = styled.div<{ $view: 'grid' | 'list' }>`
  display: grid;
  gap: 14px;

  ${p => p.$view === 'grid' && css`
    grid-template-columns: 1fr;

    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  `}

  ${p => p.$view === 'list' && css`
    grid-template-columns: 1fr;
  `}
`

// ─── Campaign Card ────────────────────────────────────────────────────────────

const Card = styled.div<{ $statusColor: string; $view: 'grid' | 'list'; $delay: number }>`
  background: ${B.card};
  border: 1px solid ${B.border};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${p => p.$delay}ms;
  transition: box-shadow 200ms ease, transform 200ms ease, border-color 200ms ease;

  /* Signature: status strip on left */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 4px;
    background: ${p => p.$statusColor};
    border-radius: 16px 0 0 16px;
  }

  &:hover {
    box-shadow: 0 8px 28px rgba(26,26,78,0.1);
    transform: translateY(-2px);
    border-color: ${p => p.$statusColor}44;
  }

  ${p => p.$view === 'list' && css`
    display: flex;
    align-items: stretch;
  `}
`

const CardImageWrap = styled.div<{ $view: 'grid' | 'list' }>`
  ${p => p.$view === 'grid' && css`
    height: 170px;
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

  background: linear-gradient(135deg, #EEF1FB 0%, #E4E8F4 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${B.light};
`

const CardImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const CardBody = styled.div<{ $view: 'grid' | 'list' }>`
  padding: 16px 16px 16px 20px;

  ${p => p.$view === 'list' && css`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 16px;
    min-width: 0;

    @media (max-width: 640px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  `}
`

const CardMain = styled.div<{ $view: 'grid' | 'list' }>`
  ${p => p.$view === 'list' && css`
    flex: 1;
    min-width: 0;
  `}
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`

const StatusPill = styled.span<{ $color: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 99px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${p => p.$color};
  background: ${p => p.$bg};

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${p => p.$color};
    flex-shrink: 0;
  }
`

const TypePill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 99px;
  font-size: 10.5px;
  font-weight: 600;
  background: ${B.navyT};
  color: ${B.navy};
`

const CardTitle = styled.h3`
  font-size: 14.5px;
  font-weight: 700;
  color: ${B.text};
  margin: 0 0 5px;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
`

const CardDesc = styled.p`
  font-size: 12.5px;
  color: ${B.muted};
  margin: 0 0 12px;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

// ─── Progress bar ─────────────────────────────────────────────────────────────

const ProgressSection = styled.div`
  margin-bottom: 12px;
`

const ProgressMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`

const ProgressLabel = styled.span`
  font-size: 11px;
  color: ${B.muted};
  font-weight: 500;
`

const ProgressPct = styled.span`
  font-size: 11px;
  font-weight: 700;
  color: ${B.text};
`

const ProgressTrack = styled.div`
  height: 5px;
  border-radius: 99px;
  background: ${B.border};
  overflow: hidden;
`

const ProgressFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${p => Math.min(p.$pct, 100)}%;
  border-radius: 99px;
  background: ${p => p.$color};
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
`

const MetricRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: ${B.bg};
  border-radius: 10px;
`

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: ${B.light};
  text-transform: uppercase;
  letter-spacing: 0.07em;
`

const MetricValue = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: ${B.text};
`

// ─── Card actions ─────────────────────────────────────────────────────────────

const CardActions = styled.div`
  display: flex;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid ${B.border};
  flex-wrap: wrap;
`

const ActionBtn = styled.button<{ $variant: 'default' | 'green' | 'amber' | 'danger' | 'blue' }>`
  flex: 1;
  min-width: 60px;
  padding: 7px 10px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 150ms ease;
  border: 1.5px solid;
  white-space: nowrap;

  ${p => p.$variant === 'default' && css`
    border-color: ${B.border};
    background: transparent;
    color: ${B.muted};
    &:hover { border-color: ${B.navy}; color: ${B.navy}; background: ${B.navyT}; }
  `}
  ${p => p.$variant === 'green' && css`
    border-color: ${B.green}33;
    background: ${B.greenT};
    color: ${B.green};
    &:hover { background: ${B.green}20; border-color: ${B.green}66; }
  `}
  ${p => p.$variant === 'amber' && css`
    border-color: rgba(245,158,11,0.3);
    background: rgba(245,158,11,0.1);
    color: ${B.amber};
    &:hover { background: rgba(245,158,11,0.18); }
  `}
  ${p => p.$variant === 'danger' && css`
    border-color: ${B.red}33;
    background: ${B.redT};
    color: ${B.red};
    &:hover { background: ${B.red}20; border-color: ${B.red}66; }
  `}
  ${p => p.$variant === 'blue' && css`
    border-color: ${B.blue}33;
    background: ${B.blueT};
    color: #0284C7;
    &:hover { background: rgba(41,182,246,0.16); }
  `}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    pointer-events: none;
  }
`

// ─── List view side actions ───────────────────────────────────────────────────

const ListActions = styled.div`
  display: flex;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 100%;
  }
`

// ─── Empty state ──────────────────────────────────────────────────────────────

const EmptyWrap = styled.div`
  text-align: center;
  padding: 64px 24px;
  background: ${B.card};
  border: 1.5px dashed ${B.border};
  border-radius: 20px;
  animation: ${fadeUp} 0.4s ease both;
`

const EmptyIllustration = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: ${B.navyT};
  color: ${B.navy};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
`

const EmptyTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${B.text};
  margin: 0 0 6px;
`

const EmptyText = styled.p`
  font-size: 13.5px;
  color: ${B.muted};
  margin: 0 0 24px;
  line-height: 1.6;
`

// ─── Loading spinner ──────────────────────────────────────────────────────────

const SpinnerWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  gap: 14px;
  color: ${B.muted};
  font-size: 13.5px;
  font-weight: 500;
`

const Spinner = styled(Loader2)`
  color: ${B.navy};
  animation: ${spin} 0.8s linear infinite;
`

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonCard = styled.div`
  background: ${B.card};
  border: 1px solid ${B.border};
  border-radius: 16px;
  overflow: hidden;
  animation: ${skeletonPulse} 1.6s ease infinite;
`

const SkeletonBlock = styled.div<{ $h: number; $w?: string; $r?: number }>`
  height: ${p => p.$h}px;
  width: ${p => p.$w || '100%'};
  border-radius: ${p => p.$r ?? 6}px;
  background: ${B.border};
`

// ─── Pagination ───────────────────────────────────────────────────────────────

const PaginationWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
`

const PageBtn = styled.button<{ $active?: boolean }>`
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 9px;
  border: 1.5px solid ${p => p.$active ? B.navy : B.border};
  background: ${p => p.$active ? B.navy : B.card};
  color: ${p => p.$active ? '#fff' : B.muted};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 150ms ease;

  &:hover:not(:disabled) {
    border-color: ${B.navy};
    color: ${B.navy};
    background: ${B.navyT};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const PageInfo = styled.span`
  font-size: 12.5px;
  color: ${B.muted};
  font-weight: 500;
`

// ─── Result count ─────────────────────────────────────────────────────────────

const ResultMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
`

const ResultCount = styled.p`
  font-size: 12.5px;
  color: ${B.muted};
  margin: 0;
  font-weight: 500;
`

// ─── Type filter ─────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'draft' | 'active' | 'paused' | 'completed' | 'rejected'

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreatorCampaignsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage]               = useState(1)
  const [view, setView]               = useState<'grid' | 'list'>('grid')

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

  const STATUS_FILTERS: { value: StatusFilter; label: string; color: string }[] = [
    { value: 'all',       label: 'All',       color: B.navy },
    { value: 'active',    label: 'Active',    color: B.green },
    { value: 'draft',     label: 'Draft',     color: B.statusDraft },
    { value: 'paused',    label: 'Paused',    color: B.amber },
    { value: 'completed', label: 'Completed', color: B.blue },
    { value: 'rejected',  label: 'Rejected',  color: B.red },
  ]

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Page>
        <HeaderBand>
          <HeaderInner>
            <HeaderLeft>
              <Eyebrow>Creator Studio</Eyebrow>
              <PageTitle>My Campaigns</PageTitle>
            </HeaderLeft>
          </HeaderInner>
        </HeaderBand>
        <StatsWrap>
          <StatsGrid>
            {[0,1,2,3].map(i => (
              <SkeletonCard key={i} style={{ padding: 16 }}>
                <SkeletonBlock $h={32} $w="32px" $r={9} style={{ marginBottom: 10 }} />
                <SkeletonBlock $h={28} $w="50%" $r={6} style={{ marginBottom: 6 }} />
                <SkeletonBlock $h={12} $w="70%" $r={4} />
              </SkeletonCard>
            ))}
          </StatsGrid>
        </StatsWrap>
        <ContentWrap>
          <SpinnerWrap>
            <Spinner size={28} />
            Loading your campaigns…
          </SpinnerWrap>
        </ContentWrap>
      </Page>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <Page>
        <HeaderBand>
          <HeaderInner>
            <HeaderLeft>
              <Eyebrow>Creator Studio</Eyebrow>
              <PageTitle>My Campaigns</PageTitle>
            </HeaderLeft>
          </HeaderInner>
        </HeaderBand>
        <ContentWrap style={{ paddingTop: 40 }}>
          <EmptyWrap>
            <EmptyIllustration style={{ background: B.redT, color: B.red }}>
              <AlertCircle size={28} />
            </EmptyIllustration>
            <EmptyTitle>Couldn't load campaigns</EmptyTitle>
            <EmptyText>Something went wrong. Try refreshing the page.</EmptyText>
            <CreateBtn onClick={() => refetch()} style={{ display: 'inline-flex' }}>
              Try again
            </CreateBtn>
          </EmptyWrap>
        </ContentWrap>
      </Page>
    )
  }

  // ── Main ─────────────────────────────────────────────────────────────────

  return (
    <Page>
      {/* Header */}
      <HeaderBand>
        <HeaderInner>
          <HeaderLeft>
            <Eyebrow>Creator Studio</Eyebrow>
            <PageTitle>My Campaigns</PageTitle>
            <PageSubtitle>
              {stats.total} campaign{stats.total !== 1 ? 's' : ''} · {stats.active} active
            </PageSubtitle>
          </HeaderLeft>
          <CreateBtn onClick={() => router.push('/campaigns/new')}>
            <Plus size={16} />
            New Campaign
          </CreateBtn>
        </HeaderInner>
      </HeaderBand>

      {/* Stats strip */}
      <StatsWrap>
        <StatsGrid>
          <StatCard $accent={B.navy} $delay={0}>
            <StatIcon $color={B.navy}><Target size={16} /></StatIcon>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatCard>
          <StatCard $accent={B.green} $delay={60}>
            <StatIcon $color={B.green}><TrendingUp size={16} /></StatIcon>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>Active</StatLabel>
          </StatCard>
          <StatCard $accent={B.statusDraft} $delay={120}>
            <StatIcon $color={B.statusDraft}><FileText size={16} /></StatIcon>
            <StatValue>{stats.draft}</StatValue>
            <StatLabel>Drafts</StatLabel>
          </StatCard>
          <StatCard $accent={B.blue} $delay={180}>
            <StatIcon $color={B.blue}><CheckCheck size={16} /></StatIcon>
            <StatValue>{stats.completed}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatCard>
        </StatsGrid>
      </StatsWrap>

      {/* Toolbar */}
      <ToolbarWrap>
        <Toolbar>
          <SearchWrap>
            <Search size={15} />
            <SearchInput
              type="text"
              placeholder="Search by title or description…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </SearchWrap>

          <ViewToggle>
            <ViewBtn $active={view === 'grid'} onClick={() => setView('grid')} title="Grid view" aria-pressed={view === 'grid'}>
              <LayoutGrid size={15} />
            </ViewBtn>
            <ViewBtn $active={view === 'list'} onClick={() => setView('list')} title="List view" aria-pressed={view === 'list'}>
              <List size={15} />
            </ViewBtn>
          </ViewToggle>
        </Toolbar>

        {/* Status filter pills */}
        <FilterPills style={{ marginTop: 10 }}>
          {STATUS_FILTERS.map(f => (
            <FilterPill
              key={f.value}
              $active={statusFilter === f.value}
              $color={f.color}
              onClick={() => { setStatusFilter(f.value); setPage(1) }}
            >
              {f.label}
              {f.value !== 'all' && campaignsData?.campaigns && (
                <span style={{ opacity: 0.65 }}>
                  {' '}({campaignsData.campaigns.filter(c => c.status === f.value).length})
                </span>
              )}
            </FilterPill>
          ))}
        </FilterPills>
      </ToolbarWrap>

      {/* Content */}
      <ContentWrap>
        {filtered.length === 0 ? (
          <EmptyWrap>
            <EmptyIllustration>
              <FileText size={28} />
            </EmptyIllustration>
            <EmptyTitle>
              {search || statusFilter !== 'all' ? 'No campaigns match' : 'No campaigns yet'}
            </EmptyTitle>
            <EmptyText>
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search or clearing the filter.'
                : 'Create your first campaign and start raising funds from your community.'}
            </EmptyText>
            {!search && statusFilter === 'all' && (
              <CreateBtn onClick={() => router.push('/campaigns/new')} style={{ display: 'inline-flex' }}>
                <Plus size={15} />
                Create your first campaign
              </CreateBtn>
            )}
            {(search || statusFilter !== 'all') && (
              <CreateBtn
                onClick={() => { setSearch(''); setStatusFilter('all') }}
                style={{ display: 'inline-flex', background: B.navyT, color: B.navy, boxShadow: 'none' }}
              >
                <X size={14} />
                Clear filters
              </CreateBtn>
            )}
          </EmptyWrap>
        ) : (
          <>
            <ResultMeta>
              <ResultCount>
                {filtered.length} campaign{filtered.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' && ` · ${STATUS_CONFIG[statusFilter]?.label}`}
                {search && ` matching "${search}"`}
              </ResultCount>
            </ResultMeta>

            <CampaignGrid $view={view}>
              {filtered.map((campaign, idx) => {
                const sc = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft
                const goal = campaign.goals?.[0]
                const raised = goal ? (goal.current_amount || 0) / 100 : 0
                const target = goal ? (goal.target_amount || 0) / 100 : 0
                const pct = target > 0 ? Math.round((raised / target) * 100) : 0
                const isFundraising = campaign.campaign_type === 'fundraising'

                return (
                  <Card
                    key={campaign._id}
                    $statusColor={sc.color}
                    $view={view}
                    $delay={Math.min(idx * 40, 300)}
                  >
                    {view === 'grid' && (
                      <CardImageWrap $view="grid">
                        {campaign.image_url
                          ? <CardImg src={campaign.image_url} alt={campaign.title} />
                          : <ImageOff size={28} />
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
                        <CardTop>
                          <StatusPill $color={sc.color} $bg={sc.bg}>
                            {sc.label}
                          </StatusPill>
                          <TypePill>
                            {isFundraising ? 'Fundraising' : 'Sharing'}
                          </TypePill>
                        </CardTop>

                        <CardTitle>{campaign.title}</CardTitle>

                        {view === 'grid' && (
                          <CardDesc>{campaign.description}</CardDesc>
                        )}

                        {isFundraising && goal && (
                          view === 'grid' ? (
                            <>
                              <ProgressSection>
                                <ProgressMeta>
                                  <ProgressLabel>${raised.toLocaleString()} raised</ProgressLabel>
                                  <ProgressPct>{pct}%</ProgressPct>
                                </ProgressMeta>
                                <ProgressTrack>
                                  <ProgressFill $pct={pct} $color={sc.color} />
                                </ProgressTrack>
                                <ProgressMeta style={{ marginTop: 4 }}>
                                  <ProgressLabel>of ${target.toLocaleString()} goal</ProgressLabel>
                                </ProgressMeta>
                              </ProgressSection>
                            </>
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
                            <ActionBtn $variant="danger" onClick={() => handleDelete(campaign._id)}>
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
      </ContentWrap>
    </Page>
  )
}