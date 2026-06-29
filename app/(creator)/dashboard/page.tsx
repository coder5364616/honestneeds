'use client'

import React, { useState, useEffect, useMemo } from 'react'
import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { useRouter } from 'next/navigation'
import {
  DollarSign, Users, TrendingUp, Target, LayoutDashboard,
  Search, Bell, Plus, MoreHorizontal, Pause, Play, Trash2,
  Eye, BarChart2, ChevronRight, CheckSquare, Square,
  X, Zap, ArrowUpRight, ArrowDownRight,
  Menu, ChevronDown, Settings, LogOut, HelpCircle,
  Wallet, Share2, Heart, Activity, Trophy,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuthHydration } from '@/hooks/useAuthHydration'
import { DashboardProvider, useDashboardContext } from './context/DashboardContext'
import { useDashboardData, useDashboardMetrics } from './hooks/useDashboardData'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import {
  usePauseCampaign,
  useUnpauseCampaign,
  useDeleteCampaign,
} from '@/api/hooks/useCampaigns'
import {
  useBatchPauseCampaigns,
  useBatchCompleteCampaigns,
  useBatchDeleteCampaigns,
} from '@/api/hooks/useBatchCampaigns'
import { PerformanceChart } from './components/PerformanceChart'
import { ActivityFeed } from './components/ActivityFeed'
import { HealthScore } from './components/HealthScore'
import { SmartConfirmation, useUndoableAction } from './components/SmartConfirmation'
import { DonationsAwaitingConfirmation } from './components/DonationsAwaitingConfirmation'
import { useToast } from '@/hooks/useToast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActivityRecord {
  id: string
  type: 'donation' | 'campaign_activated' | 'campaign_created'
  title: string
  description: string
  timestamp: string
  campaignTitle: string
  amount?: number
}

interface TimeSeriesDataPoint {
  date: string
  revenue: number
  donorCount: number
}

// ─── Fonts & Global ───────────────────────────────────────────────────────────

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; -webkit-font-smoothing: antialiased; }
`

// ─── Design Tokens ────────────────────────────────────────────────────────────

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

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`

const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-16px); }
  to   { opacity: 1; transform: translateX(0); }
`

const countUp = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
`

const shimmer = keyframes`
  0%   { background-position: -600px 0; }
  100% { background-position: 600px 0; }
`

const barGrow = keyframes`
  from { width: 0%; }
  to   { width: var(--bar-w); }
`

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
`

// ─── Shell Layout ─────────────────────────────────────────────────────────────

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${tk.canvas};
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
`

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = styled.aside<{ $open: boolean }>`
  width: 240px;
  flex-shrink: 0;
  background: ${tk.ink};
  display: flex;
  flex-direction: column;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 200;
  transition: transform 240ms cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 1024px) {
    transform: ${p => p.$open ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${p => p.$open ? '4px 0 32px rgba(0,0,0,0.4)' : 'none'};
  }
`

const SidebarOverlay = styled.div<{ $visible: boolean }>`
  display: none;
  @media (max-width: 1024px) {
    display: ${p => p.$visible ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 190;
    backdrop-filter: blur(2px);
  }
`

const SidebarLogo = styled.div`
  padding: 1.5rem 1.25rem 1.25rem;
  border-bottom: 1px solid ${tk.inkBorder};
  display: flex;
  align-items: center;
  gap: 10px;
`

const LogoMark = styled.div`
  width: 32px;
  height: 32px;
  background: ${tk.amber};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 0.875rem;
  color: ${tk.ink};
  flex-shrink: 0;
`

const LogoName = styled.span`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.white};
  letter-spacing: -0.3px;
`

const SidebarNav = styled.nav`
  flex: 1;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
`

const NavLabel = styled.span`
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${tk.inkBorder};
  padding: 0 0.5rem;
  margin-bottom: 4px;
  margin-top: 1rem;
  display: block;
  &:first-child { margin-top: 0; }
`

const NavItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  border: none;
  background: ${p => p.$active ? tk.inkMid : 'transparent'};
  color: ${p => p.$active ? tk.white : tk.muted};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: ${p => p.$active ? '500' : '400'};
  cursor: pointer;
  text-align: left;
  transition: background 140ms, color 140ms;
  position: relative;

  &:hover {
    background: ${tk.inkLight};
    color: ${tk.white};
  }

  svg { flex-shrink: 0; }

  ${p => p.$active && `
    &::before {
      content: '';
      position: absolute;
      left: 0; top: 8px; bottom: 8px;
      width: 3px;
      background: ${tk.amber};
      border-radius: 0 3px 3px 0;
    }
  `}
`

const NavBadge = styled.span`
  margin-left: auto;
  background: ${tk.amber};
  color: ${tk.ink};
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 100px;
  min-width: 20px;
  text-align: center;
`

const SidebarFooter = styled.div`
  padding: 1rem 0.75rem;
  border-top: 1px solid ${tk.inkBorder};
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const UserBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0.625rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 140ms;
  &:hover { background: ${tk.inkLight}; }
`

const UserAvatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: ${tk.amberMid};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.75rem;
  color: ${tk.ink};
  flex-shrink: 0;
`

const UserName = styled.span`
  font-size: 0.82rem;
  font-weight: 500;
  color: ${tk.white};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

// ─── Main Content Area ────────────────────────────────────────────────────────

const Main = styled.main`
  flex: 1;
  margin-left: 240px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  @media (max-width: 1024px) {
    margin-left: 0;
  }
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

const MenuBtn = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: ${tk.body};
  padding: 6px;
  border-radius: 8px;
  transition: background 140ms;
  &:hover { background: ${tk.canvasDeep}; }
  flex-shrink: 0;

  @media (max-width: 1024px) { display: flex; align-items: center; }
`

const SearchBar = styled.div`
  flex: 1;
  max-width: 400px;
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
    padding: 0.5rem 0.875rem 0.5rem 2rem;
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

const TopBarActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

const IconBtn = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: ${p => p.$primary ? 'auto' : '36px'};
  height: 36px;
  padding: ${p => p.$primary ? '0 0.875rem' : '0'};
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
  position: relative;

  &:hover {
    background: ${p => p.$primary ? '#0D4A8C' : tk.canvasDeep};
    border-color: ${p => p.$primary ? 'transparent' : tk.border};
  }
`

const NotifDot = styled.span`
  position: absolute;
  top: 7px;
  right: 7px;
  width: 7px;
  height: 7px;
  background: ${tk.amber};
  border-radius: 50%;
  border: 1.5px solid ${tk.canvas};
`

// ─── Page Body ────────────────────────────────────────────────────────────────

const PageBody = styled.div`
  padding: clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 2rem);
  flex: 1;
`

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = styled.div`
  margin-bottom: 2rem;
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

const KPITrend = styled.div<{ $up: boolean }>`
  display: flex;
  align-items: center;
  gap: 3px;
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: ${p => p.$up ? tk.green : tk.red};
  background: ${p => p.$up ? tk.greenLight : tk.redLight};
  padding: 3px 8px;
  border-radius: 100px;
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

const KPISub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 3px;
`

// ─── Section Heading ──────────────────────────────────────────────────────────

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 2rem 0 1rem;
  flex-wrap: wrap;
`

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
`

const SectionAction = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  color: ${tk.blue};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 140ms;
  &:hover { background: ${tk.blueLight}; }
`

// Primary CTA into the full /analytics report — lives on the right of the
// "Performance Analytics" section header and wraps cleanly under the title on
// small screens (SectionHead is flex + wrap).
const ViewAnalyticsBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: ${tk.blue};
  color: ${tk.white};
  border: none;
  border-radius: 10px;
  padding: 0.5rem 0.95rem;
  font-family: 'Syne', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: -0.2px;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(26, 95, 168, 0.18);
  transition: background 140ms, transform 120ms, box-shadow 140ms;

  &:hover {
    background: #0D4A8C;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(26, 95, 168, 0.28);
  }
  &:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(26, 95, 168, 0.18); }

  svg { flex-shrink: 0; }

  @media (max-width: 480px) { width: 100%; justify-content: center; }
`

// ─── Two-Col Grid ─────────────────────────────────────────────────────────────

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

// ─── Card Shell ───────────────────────────────────────────────────────────────

const Card = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 60}ms;
  transition: border-color 200ms, box-shadow 200ms;
  
  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 2px 8px rgba(26, 95, 168, 0.08);
  }
`

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1.125rem;
`

const CardTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
`

// ─── Batch Operations Bar ─────────────────────────────────────────────────────

const BatchBar = styled.div<{ $visible: boolean }>`
  display: ${p => p.$visible ? 'flex' : 'none'};
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  background: ${tk.ink};
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  animation: ${fadeUp} 0.25s ease both;
`

const BatchInfo = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  color: ${tk.white};
  margin-right: auto;
`

const BatchBtn = styled.button<{ $variant?: 'danger' | 'amber' | 'ghost' }>`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0.425rem 0.875rem;
  border-radius: 8px;
  border: 1px solid ${p => ({
    danger: 'rgba(192,57,43,0.4)',
    amber:  'rgba(212,135,10,0.4)',
    ghost:  tk.inkBorder,
  }[p.$variant || 'ghost'])};
  background: ${p => ({
    danger: 'rgba(192,57,43,0.15)',
    amber:  'rgba(212,135,10,0.15)',
    ghost:  'transparent',
  }[p.$variant || 'ghost'])};
  color: ${p => ({
    danger: '#E57373',
    amber:  tk.amberMid,
    ghost:  tk.muted,
  }[p.$variant || 'ghost'])};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 140ms;
  white-space: nowrap;
  min-height: 32px;

  &:hover {
    background: ${p => ({
      danger: 'rgba(192,57,43,0.25)',
      amber:  'rgba(212,135,10,0.25)',
      ghost:  tk.inkLight,
    }[p.$variant || 'ghost'])};
  }

  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

// ─── Campaign Grid ────────────────────────────────────────────────────────────

const CampaignGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`

const CampaignCard = styled.div<{ $selected?: boolean; $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${p => p.$selected ? tk.amber : tk.border};
  border-radius: 14px;
  padding: 1.125rem;
  cursor: pointer;
  transition: border-color 140ms, box-shadow 140ms, transform 120ms;
  animation: ${fadeUp} 0.4s ease both;
  animation-delay: ${p => (p.$delay || 0) * 50}ms;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: ${p => p.$selected ? tk.amber : tk.canvasDeep};
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }

  ${p => p.$selected && `
    box-shadow: 0 0 0 3px rgba(212,135,10,0.15);
  `}
`

const CardSelCheck = styled.div<{ $checked: boolean }>`
  position: absolute;
  top: 10px;
  right: 10px;
  color: ${p => p.$checked ? tk.amber : tk.muted};
  opacity: ${p => p.$checked ? 1 : 0};
  transition: opacity 140ms;

  ${CampaignCard}:hover & { opacity: 1; }
`

const CampaignCardTitle = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${tk.heading};
  margin-bottom: 4px;
  padding-right: 24px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CampaignCardMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
  flex-wrap: wrap;
`

const StatusPill = styled.span<{ $status: string }>`
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  ${p => {
    const map: Record<string, string> = {
      active:    `background:${tk.greenLight};color:${tk.green};`,
      paused:    `background:${tk.amberLight};color:${tk.amberDark};`,
      completed: `background:${tk.blueLight};color:${tk.blue};`,
      draft:     `background:${tk.canvasDeep};color:${tk.muted};`,
    }
    return map[p.$status] || map.draft
  }}
`

const TypePill = styled.span`
  font-size: 0.68rem;
  color: ${tk.muted};
  background: ${tk.canvasDeep};
  padding: 2px 7px;
  border-radius: 100px;
  text-transform: capitalize;
`

const ProgressRow = styled.div`
  margin-bottom: 0.625rem;
`

const ProgressLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`

const ProgressRaised = styled.span`
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${tk.heading};
`

const ProgressGoal = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  color: ${tk.muted};
`

const ProgressTrack = styled.div`
  height: 5px;
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
  background: ${p => p.$status === 'completed' ? tk.green : tk.amber};
`

const CardStats = styled.div`
  display: flex;
  gap: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid ${tk.canvasDeep};
`

const CardStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
`

const CardStatVal = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.82rem;
  font-weight: 500;
  color: ${tk.heading};
`

const CardStatKey = styled.span`
  font-size: 0.68rem;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const CardActions = styled.div`
  display: flex;
  gap: 0.375rem;
  margin-top: 0.75rem;
  padding-top: 0.625rem;
  border-top: 1px solid ${tk.canvasDeep};
  opacity: 0;
  transition: opacity 140ms;

  ${CampaignCard}:hover & { opacity: 1; }

  @media (hover: none) { opacity: 1; }
`

const ActionBtn = styled.button<{ $danger?: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0.4rem;
  border-radius: 7px;
  border: 1px solid ${p => p.$danger ? 'rgba(192,57,43,0.25)' : tk.border};
  background: transparent;
  color: ${p => p.$danger ? tk.red : tk.muted};
  font-size: 0.72rem;
  font-weight: 500;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 120ms, border-color 120ms, color 120ms;
  min-height: 32px;

  &:hover {
    background: ${p => p.$danger ? tk.redLight : tk.canvasDeep};
    color: ${p => p.$danger ? tk.red : tk.heading};
    border-color: ${p => p.$danger ? 'rgba(192,57,43,0.4)' : tk.border};
  }
`

// ─── Empty / Error States ────────────────────────────────────────────────────

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: ${tk.white};
  border: 1.5px dashed ${tk.border};
  border-radius: 16px;
`

const EmptyIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const SkeletonLine = styled.div<{ $w?: string; $h?: string }>`
  width: ${p => p.$w || '100%'};
  height: ${p => p.$h || '12px'};
  background: linear-gradient(90deg, ${tk.canvasDeep} 25%, ${tk.border} 50%, ${tk.canvasDeep} 75%);
  background-size: 600px 100%;
  animation: ${shimmer} 1.5s infinite linear;
  border-radius: 100px;
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
  flex-shrink: 0;
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

// ─── Mobile Bottom Tab Bar ────────────────────────────────────────────────────

const MobileTabBar = styled.nav`
  display: none;
  @media (max-width: 1024px) {
    display: flex;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    background: ${tk.ink};
    border-top: 1px solid ${tk.inkBorder};
    padding: 0 0 env(safe-area-inset-bottom);
    z-index: 150;
  }
`

const MobileTabBtn = styled.button<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0.625rem 0;
  border: none;
  background: none;
  color: ${p => p.$active ? tk.amber : tk.muted};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.6rem;
  cursor: pointer;
  transition: color 140ms;
`

const MobileBottomPad = styled.div`
  display: none;
  @media (max-width: 1024px) { display: block; height: 72px; }
`

// ─── Quick Actions ────────────────────────────────────────────────────────────

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 0.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 480px) { gap: 0.75rem; }
`

const QuickCard = styled.button<{ $delay?: number }>`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  text-align: left;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1rem 1.125rem;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 70}ms;
  transition: border-color 160ms, box-shadow 160ms, transform 120ms;

  &:hover {
    border-color: ${tk.blue};
    box-shadow: 0 4px 16px rgba(26, 95, 168, 0.10);
    transform: translateY(-1px);
  }
`

const QuickIcon = styled.div<{ $color: 'amber' | 'green' | 'blue' | 'red' }>`
  width: 40px;
  height: 40px;
  border-radius: 11px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${p => ({ amber: tk.amberLight, green: tk.greenLight, blue: tk.blueLight, red: tk.redLight }[p.$color])};
  color: ${p => ({ amber: tk.amber, green: tk.green, blue: tk.blue, red: tk.red }[p.$color])};
`

const QuickText = styled.div`
  min-width: 0;
`

const QuickTitle = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: ${tk.heading};
  line-height: 1.2;
`

const QuickSub = styled.div`
  font-size: 0.72rem;
  color: ${tk.muted};
  margin-top: 2px;
`

// ─── Secondary Stat Tiles ─────────────────────────────────────────────────────

const StatTiles = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
`

const StatTile = styled.div<{ $delay?: number }>`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1rem 1.125rem;
  animation: ${fadeUp} 0.5s ease both;
  animation-delay: ${p => (p.$delay || 0) * 70}ms;
`

const StatTileTop = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  color: ${tk.muted};
  margin-bottom: 0.625rem;
`

const StatTileLabel = styled.span`
  font-size: 0.72rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const StatTileVal = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;
`

const StatTileSub = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.67rem;
  color: ${tk.muted};
  margin-top: 5px;
`

// ─── Goal Progress Bar ────────────────────────────────────────────────────────

const GoalWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
`

const GoalTop = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`

const GoalRaised = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: ${tk.heading};
  line-height: 1;

  span {
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    font-weight: 400;
    color: ${tk.muted};
    margin-left: 6px;
  }
`

const GoalPct = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 0.85rem;
  font-weight: 500;
  color: ${tk.green};
  background: ${tk.greenLight};
  padding: 4px 12px;
  border-radius: 100px;
`

const GoalTrack = styled.div`
  height: 10px;
  background: ${tk.canvasDeep};
  border-radius: 100px;
  overflow: hidden;
`

const GoalFill = styled.div<{ $pct: number }>`
  height: 100%;
  --bar-w: ${p => Math.min(p.$pct, 100)}%;
  width: var(--bar-w);
  border-radius: 100px;
  background: linear-gradient(90deg, ${tk.amber}, ${tk.amberMid});
  animation: ${barGrow} 1.1s cubic-bezier(0.22,1,0.36,1) both;
  animation-delay: 0.2s;
`

const GoalMeta = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
`

const GoalMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  b {
    font-family: 'DM Mono', monospace;
    font-size: 0.9rem;
    color: ${tk.heading};
    font-weight: 500;
  }
  span {
    font-size: 0.7rem;
    color: ${tk.muted};
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }
`

// ─── Top Performers ───────────────────────────────────────────────────────────

const RankList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const RankRow = styled.button`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 0.625rem 0.5rem;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background 140ms, border-color 140ms;

  &:hover {
    background: ${tk.canvas};
    border-color: ${tk.border};
  }
`

const RankNum = styled.div<{ $top?: boolean }>`
  width: 26px;
  height: 26px;
  flex-shrink: 0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 0.78rem;
  background: ${p => p.$top ? tk.amber : tk.canvasDeep};
  color: ${p => p.$top ? tk.ink : tk.muted};
`

const RankBody = styled.div`
  flex: 1;
  min-width: 0;
`

const RankTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${tk.heading};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RankBar = styled.div`
  height: 4px;
  background: ${tk.canvasDeep};
  border-radius: 100px;
  overflow: hidden;
  margin-top: 5px;
`

const RankBarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${p => Math.min(p.$pct, 100)}%;
  border-radius: 100px;
  background: ${tk.amber};
`

const RankStat = styled.div`
  text-align: right;
  flex-shrink: 0;

  b {
    display: block;
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    font-weight: 500;
    color: ${tk.heading};
  }
  span {
    font-size: 0.68rem;
    color: ${tk.muted};
  }
`

// ─── Inner Dashboard ─────────────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const isHydrated = useAuthHydration()
  const { showToast } = useToast()
  const { filters, updateFilter } = useDashboardContext()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'analytics'>('overview')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { lastAction, undo, dismiss } = useUndoableAction()
  const [mockTimeSeriesData, setMockTimeSeriesData] = useState<TimeSeriesDataPoint[]>([])
  const [mockActivities, setMockActivities] = useState<ActivityRecord[]>([])

  const { campaigns, stats, totalCount, isLoading, refetch } = useDashboardData(
    filters.status, 1, searchQuery
  )

  // Real performance metrics (time-series, totals, recent activity) from the backend
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics()

  const { mutate: pauseCampaign }  = usePauseCampaign()
  const { mutate: resumeCampaign } = useUnpauseCampaign()
  const { mutate: deleteCampaign } = useDeleteCampaign()
  const { mutate: batchPause,    isPending: batchPausePending }    = useBatchPauseCampaigns()
  const { mutate: batchComplete, isPending: batchCompletePending } = useBatchCompleteCampaigns()
  const { mutate: batchDelete,   isPending: batchDeletePending }   = useBatchDeleteCampaigns()

  const isBatchLoading = batchPausePending || batchCompletePending || batchDeletePending

  useEffect(() => {
    // Wait until the auth store has hydrated from localStorage before deciding
    // to redirect — otherwise a logged-in user gets bounced on a hard load.
    if (isHydrated && !user) router.push('/login')
  }, [isHydrated, user, router])

  // Map real backend time-series ({ date, value (USD), donorCount }) into the
  // shape the PerformanceChart expects. No fabricated/random values.
  useEffect(() => {
    const series = (metrics?.timeSeries || []).map((d: any) => ({
      date: d.date,
      revenue: d.value || 0,          // already in dollars from the backend
      donorCount: d.donorCount || 0,  // cumulative donors to date
    }))
    setMockTimeSeriesData(series)
  }, [metrics])

  // Real recent activity from the backend (most recent donations)
  const memoizedActivities = useMemo(() =>
    (metrics?.recentActivity || []).map((a: any) => ({
      id: a.id,
      type: a.type || 'donation',
      title: a.title || 'New Donation',
      description: `${a.campaignTitle} received a donation`,
      timestamp: a.timestamp,
      campaignTitle: a.campaignTitle,
      amount: a.amount,
    })),
  [metrics])

  useEffect(() => { setMockActivities(memoizedActivities) }, [memoizedActivities])

  useKeyboardShortcuts([
    { key: 'Escape', handler: () => setSelectedIds([]), description: 'Clear selection' },
    { key: 'e', handler: () => {
      if (selectedIds.length === 1) {
        const c = campaigns.find(c => c._id === selectedIds[0])
        if (c?.status === 'draft') router.push(`/dashboard/campaigns/${selectedIds[0]}/edit`)
      }
    }, description: 'Edit selected draft' },
  ], !isLoading)

  const fmtMoney = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`

  const filteredCampaigns = useMemo(() =>
    campaigns.filter(c => statusFilter === 'all' || c.status === statusFilter),
  [campaigns, statusFilter])

  const selectedCampaign = campaigns[0]

  // Aggregate fundraising progress across every campaign (all values in cents)
  const goalSummary = useMemo(() => {
    const raised = campaigns.reduce((s, c) => s + (c.raised || 0), 0)
    const goal = campaigns.reduce((s, c) => s + (c.goal || 0), 0)
    const funded = campaigns.filter(c => c.goal > 0 && c.raised >= c.goal).length
    return {
      raised,
      goal,
      pct: goal > 0 ? (raised / goal) * 100 : 0,
      funded,
      remaining: Math.max(0, goal - raised),
    }
  }, [campaigns])

  // Top performing campaigns by amount raised
  const topCampaigns = useMemo(() =>
    [...campaigns]
      .sort((a, b) => (b.raised || 0) - (a.raised || 0))
      .slice(0, 5),
  [campaigns])

  const handlePause = (id: string) => pauseCampaign(id, {
    onSuccess: () => { showToast({ type: 'success', message: 'Campaign paused' }); refetch() },
    onError: () => showToast({ type: 'error', message: 'Failed to pause campaign' }),
  })

  const handleResume = (id: string) => resumeCampaign(id, {
    onSuccess: () => { showToast({ type: 'success', message: 'Campaign resumed' }); refetch() },
    onError: () => showToast({ type: 'error', message: 'Failed to resume campaign' }),
  })

  const handleDelete = (id: string) => deleteCampaign(id, {
    onSuccess: () => { showToast({ type: 'success', message: 'Campaign deleted' }); refetch() },
    onError: () => showToast({ type: 'error', message: 'Failed to delete campaign' }),
  })

  const handleBatchPause = (ids: string[]) => batchPause(ids, {
    onSuccess: () => { showToast({ type: 'success', message: `${ids.length} campaigns paused` }); setSelectedIds([]); refetch() },
    onError: () => showToast({ type: 'error', message: 'Batch pause failed' }),
  })

  const handleBatchDelete = (ids: string[]) => batchDelete(ids, {
    onSuccess: () => { showToast({ type: 'success', message: `${ids.length} campaigns deleted` }); setSelectedIds([]); refetch() },
    onError: () => showToast({ type: 'error', message: 'Batch delete failed' }),
  })

  const toggleSelect = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  // Until hydration completes we don't yet know if the user is authenticated.
  // Render a loader (never a bare white screen) while hydrating, or while the
  // redirect above is navigating an unauthenticated visitor to /login.
  if (!isHydrated || !user) {
    return (
      <>
        <GlobalStyle />
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            background: tk.canvas,
            fontFamily: "'DM Sans', sans-serif",
            color: tk.muted,
          }}
        >
          <SkeletonLine $w="160px" $h="14px" />
          <span style={{ fontSize: '0.8rem' }}>Loading your dashboard…</span>
        </div>
      </>
    )
  }

  const kpis = [
    {
      label: 'Total Raised',
      value: fmtMoney(stats.totalRaised || 0),
      sub: `${stats.totalCampaigns} campaigns`,
      icon: <DollarSign size={16} />,
      color: 'amber' as const,
      trend: { up: true, pct: 18 },
    },
    {
      label: 'Active Campaigns',
      value: String(stats.totalActiveCampaigns || 0),
      sub: `of ${stats.totalCampaigns} total`,
      icon: <Zap size={16} />,
      color: 'green' as const,
      trend: { up: true, pct: 5 },
    },
    {
      label: 'Total Supporters',
      value: (stats.totalDonors || 0).toLocaleString(),
      sub: 'all campaigns',
      icon: <Users size={16} />,
      color: 'blue' as const,
      trend: { up: true, pct: 32 },
    },
    {
      label: 'Success Rate',
      value: `${Math.round(stats.successRate || 0)}%`,
      sub: 'goal completion',
      icon: <Target size={16} />,
      color: 'green' as const,
      trend: { up: (stats.successRate || 0) > 50, pct: 4 },
    },
  ]

  return (
    <>
      <GlobalStyle />
      <Shell>

        {/* ── Main ── */}
        <Main>
          {/* Top Bar */}
          <TopBar>
            <TopBarActions>
              <IconBtn $primary onClick={() => router.push('/campaigns/new')}>
                <Plus size={15} />
                New Campaign
              </IconBtn>
            </TopBarActions>
          </TopBar>

          {/* Page Body */}
          <PageBody>
            {/* Page Header */}
            <PageHeader>
              <Greeting>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Greeting>
              <PageTitle>
                Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
              </PageTitle>
            </PageHeader>

            {/* ── Donations Awaiting Confirmation (CF-1) ── */}
            <DonationsAwaitingConfirmation
              campaigns={campaigns.map(c => ({ _id: c._id, title: c.title }))}
            />

            {/* ── KPI Strip ── */}
            <KPIStrip>
              {isLoading
                ? [...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} style={{ animationDelay: `${i * 60}ms` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <SkeletonLine $w="34px" $h="34px" style={{ borderRadius: 10 }} />
                        <SkeletonLine $w="50px" $h="22px" style={{ borderRadius: 100 }} />
                      </div>
                      <SkeletonLine $w="60%" $h="28px" style={{ marginTop: 4 }} />
                      <SkeletonLine $w="80%" $h="12px" />
                    </SkeletonCard>
                  ))
                : kpis.map((kpi, i) => (
                    <KPICard key={kpi.label} $delay={i}>
                      <KPITop>
                        <KPIIcon $color={kpi.color}>{kpi.icon}</KPIIcon>
                        <KPITrend $up={kpi.trend.up}>
                          {kpi.trend.up
                            ? <ArrowUpRight size={11} />
                            : <ArrowDownRight size={11} />
                          }
                          {kpi.trend.pct}%
                        </KPITrend>
                      </KPITop>
                      <KPIValue>{kpi.value}</KPIValue>
                      <KPILabel>{kpi.label}</KPILabel>
                      <KPISub>{kpi.sub}</KPISub>
                    </KPICard>
                  ))
              }
            </KPIStrip>

            {/* ── Quick Actions ── */}
            <SectionHead>
              <SectionH>Quick Actions</SectionH>
            </SectionHead>

            <QuickGrid>
              <QuickCard $delay={0} onClick={() => router.push('/campaigns/new')}>
                <QuickIcon $color="amber"><Plus size={20} /></QuickIcon>
                <QuickText>
                  <QuickTitle>New Campaign</QuickTitle>
                  <QuickSub>Start raising funds</QuickSub>
                </QuickText>
              </QuickCard>
              <QuickCard $delay={1} onClick={() => router.push('/sharers-payouts')}>
                <QuickIcon $color="green"><Wallet size={20} /></QuickIcon>
                <QuickText>
                  <QuickTitle>Pay Sharers</QuickTitle>
                  <QuickSub>Settle share-reward claims</QuickSub>
                </QuickText>
              </QuickCard>
              <QuickCard $delay={2} onClick={() => router.push('/dashboard/donations')}>
                <QuickIcon $color="blue"><Heart size={20} /></QuickIcon>
                <QuickText>
                  <QuickTitle>Donations</QuickTitle>
                  <QuickSub>See who supported you</QuickSub>
                </QuickText>
              </QuickCard>
              <QuickCard $delay={3} onClick={() => router.push('/dashboard/share-rewards')}>
                <QuickIcon $color="red"><Share2 size={20} /></QuickIcon>
                <QuickText>
                  <QuickTitle>Share Rewards</QuickTitle>
                  <QuickSub>Grow reach & earn</QuickSub>
                </QuickText>
              </QuickCard>
            </QuickGrid>

            {/* ── Fundraising Goal Progress ── */}
            <SectionHead>
              <SectionH>
                Fundraising Progress
                <span>across all campaigns</span>
              </SectionH>
            </SectionHead>

            <Card $delay={4} style={{ marginBottom: '1.5rem' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <SkeletonLine $w="40%" $h="28px" />
                  <SkeletonLine $h="10px" />
                  <SkeletonLine $w="70%" $h="12px" />
                </div>
              ) : goalSummary.goal > 0 ? (
                <GoalWrap>
                  <GoalTop>
                    <GoalRaised>
                      {fmtMoney(goalSummary.raised)}
                      <span>raised of {fmtMoney(goalSummary.goal)} goal</span>
                    </GoalRaised>
                    <GoalPct>{goalSummary.pct.toFixed(1)}% funded</GoalPct>
                  </GoalTop>
                  <GoalTrack>
                    <GoalFill $pct={goalSummary.pct} />
                  </GoalTrack>
                  <GoalMeta>
                    <GoalMetaItem>
                      <b>{fmtMoney(goalSummary.remaining)}</b>
                      <span>Remaining</span>
                    </GoalMetaItem>
                    <GoalMetaItem>
                      <b>{goalSummary.funded}</b>
                      <span>Goals Reached</span>
                    </GoalMetaItem>
                    <GoalMetaItem>
                      <b>{stats.totalDonors.toLocaleString()}</b>
                      <span>Supporters</span>
                    </GoalMetaItem>
                    <GoalMetaItem>
                      <b>{stats.totalCampaigns}</b>
                      <span>Campaigns</span>
                    </GoalMetaItem>
                  </GoalMeta>
                </GoalWrap>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: tk.muted }}>
                  <Target size={28} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Set a goal on a campaign to track your overall progress
                  </p>
                </div>
              )}
            </Card>

            {/* ── Analytics Row ── */}
            <SectionHead>
              <SectionH>Performance Analytics<span>across all campaigns</span></SectionH>
              <ViewAnalyticsBtn onClick={() => router.push('/analytics')}>
                <BarChart2 size={15} />
                View Analytics
                <ArrowUpRight size={14} />
              </ViewAnalyticsBtn>
            </SectionHead>

            <Card $delay={4} style={{ marginBottom: '1.5rem' }}>
              {metricsLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: tk.muted }}>
                  <BarChart2 size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Loading performance data…</p>
                </div>
              ) : mockTimeSeriesData.length > 0 ? (
                <PerformanceChart
                  data={mockTimeSeriesData}
                  goal={(campaigns[0]?.goal || 0) / 100}
                  chartType="area"
                />
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: tk.muted }}>
                  <BarChart2 size={32} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Activate a campaign to see performance data
                  </p>
                </div>
              )}
            </Card>

            {/* ── Period Snapshot ── */}
            <SectionHead>
              <SectionH>
                30-Day Snapshot
                <span>last 30 days</span>
              </SectionH>
            </SectionHead>

            <StatTiles>
              <StatTile $delay={0}>
                <StatTileTop>
                  <DollarSign size={14} />
                  <StatTileLabel>Raised</StatTileLabel>
                </StatTileTop>
                <StatTileVal>
                  ${(metrics?.totalDonations || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </StatTileVal>
                <StatTileSub>{metrics?.donorCount || 0} donations</StatTileSub>
              </StatTile>
              <StatTile $delay={1}>
                <StatTileTop>
                  <Activity size={14} />
                  <StatTileLabel>Daily Avg</StatTileLabel>
                </StatTileTop>
                <StatTileVal>
                  ${(metrics?.dailyAverage || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </StatTileVal>
                <StatTileSub>per active day</StatTileSub>
              </StatTile>
              <StatTile $delay={2}>
                <StatTileTop>
                  <TrendingUp size={14} />
                  <StatTileLabel>Peak Day</StatTileLabel>
                </StatTileTop>
                <StatTileVal>
                  ${(metrics?.peakDay || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </StatTileVal>
                <StatTileSub>best single day</StatTileSub>
              </StatTile>
              <StatTile $delay={3}>
                <StatTileTop>
                  <Share2 size={14} />
                  <StatTileLabel>Shares</StatTileLabel>
                </StatTileTop>
                <StatTileVal>{(metrics?.totalShares || 0).toLocaleString()}</StatTileVal>
                <StatTileSub>paid share rewards</StatTileSub>
              </StatTile>
            </StatTiles>

            {/* ── Insights Row ── */}
            <SectionHead>
              <SectionH>Campaign Insights</SectionH>
            </SectionHead>

            <TwoCol>
              <Card $delay={5}>
                <CardHead>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHead>
                <ActivityFeed activities={mockActivities} limit={5} isLoading={metricsLoading} />
              </Card>

              {selectedCampaign && (
                <Card $delay={6}>
                  <CardHead>
                    <CardTitle>Health Score</CardTitle>
                    <TypePill style={{ fontSize: '0.72rem' }}>{selectedCampaign.title}</TypePill>
                  </CardHead>
                  <HealthScore
                    campaign={{
                      // raised/goal are stored in cents on the campaign; HealthScore
                      // works in dollars (its display and the $50 avg-donation
                      // threshold both assume dollars), so convert here.
                      raised:      (selectedCampaign.raised || 0) / 100,
                      goal:        (selectedCampaign.goal || 0) / 100,
                      donor_count: selectedCampaign.donor_count || 0,
                      status:      selectedCampaign.status,
                      created_at:  selectedCampaign.created_at,
                      updated_at:  selectedCampaign.updated_at,
                    }}
                    showBreakdown
                    size="medium"
                  />
                </Card>
              )}
            </TwoCol>

            {/* ── Top Performers ── */}
            <SectionHead>
              <SectionH>
                <Trophy size={16} style={{ color: tk.amber }} />
                Top Performing Campaigns
              </SectionH>
            </SectionHead>

            <Card $delay={7} style={{ marginBottom: '1.5rem' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[...Array(3)].map((_, i) => (
                    <SkeletonLine key={i} $h="20px" />
                  ))}
                </div>
              ) : topCampaigns.length > 0 ? (
                <RankList>
                  {topCampaigns.map((c, i) => {
                    const pct = c.goal > 0 ? (c.raised / c.goal) * 100 : 0
                    return (
                      <RankRow key={c._id} onClick={() => router.push(`/campaigns/${c._id}`)}>
                        <RankNum $top={i === 0}>{i + 1}</RankNum>
                        <RankBody>
                          <RankTitle>{c.title}</RankTitle>
                          <RankBar>
                            <RankBarFill $pct={pct} />
                          </RankBar>
                        </RankBody>
                        <RankStat>
                          <b>{fmtMoney(c.raised || 0)}</b>
                          <span>{c.donor_count || 0} donors</span>
                        </RankStat>
                      </RankRow>
                    )
                  })}
                </RankList>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: tk.muted }}>
                  <Trophy size={28} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    Your best campaigns will appear here once you start raising
                  </p>
                </div>
              )}
            </Card>

            {/* ── Campaigns Grid ── */}
            <SectionHead>
              <SectionH>
                All Campaigns
                {selectedIds.length > 0 && (
                  <span>({selectedIds.length} selected)</span>
                )}
              </SectionH>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterTabs>
                  {['all', 'active', 'draft', 'paused', 'completed'].map(s => (
                    <FilterTab
                      key={s}
                      $active={statusFilter === s}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </FilterTab>
                  ))}
                </FilterTabs>
                <IconBtn $primary onClick={() => router.push('/campaigns/new')}>
                  <Plus size={14} /> New
                </IconBtn>
              </div>
            </SectionHead>

            {/* Batch Bar */}
            <BatchBar $visible={selectedIds.length > 0}>
              <BatchInfo>{selectedIds.length} campaign{selectedIds.length > 1 ? 's' : ''} selected</BatchInfo>
              <BatchBtn $variant="amber" onClick={() => handleBatchPause(selectedIds)} disabled={isBatchLoading}>
                <Pause size={12} /> Pause
              </BatchBtn>
              <BatchBtn $variant="danger" onClick={() => handleBatchDelete(selectedIds)} disabled={isBatchLoading}>
                <Trash2 size={12} /> Delete
              </BatchBtn>
              <BatchBtn onClick={() => setSelectedIds([])}>
                <X size={12} /> Clear
              </BatchBtn>
            </BatchBar>

            <CampaignGrid>
              {isLoading
                ? [...Array(6)].map((_, i) => (
                    <SkeletonCard key={i} style={{ animationDelay: `${i * 40}ms`, minHeight: 200 }}>
                      <SkeletonLine $w="60%" $h="14px" />
                      <SkeletonLine $w="40%" $h="10px" />
                      <SkeletonLine $h="5px" style={{ marginTop: 8 }} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <SkeletonLine $w="33%" $h="10px" />
                        <SkeletonLine $w="33%" $h="10px" />
                      </div>
                    </SkeletonCard>
                  ))
                : filteredCampaigns.length === 0
                ? (
                    <EmptyState>
                      <EmptyIcon>📭</EmptyIcon>
                      <EmptyTitle>
                        {searchQuery
                          ? `No results for "${searchQuery}"`
                          : statusFilter !== 'all'
                          ? `No ${statusFilter} campaigns`
                          : 'No campaigns yet'}
                      </EmptyTitle>
                      <EmptyBody>
                        {searchQuery
                          ? 'Try a different search term.'
                          : 'Create your first campaign to get started.'}
                      </EmptyBody>
                      {!searchQuery && (
                        <CreateBtn onClick={() => router.push('/campaigns/new')}>
                          <Plus size={15} /> Create Campaign
                        </CreateBtn>
                      )}
                    </EmptyState>
                  )
                : filteredCampaigns.map((campaign, idx) => {
                    const pct = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0
                    // SF-1: Share-to-Earn reach meter (shares, never dollars).
                    const reach = campaign.reach_goal
                    const hasReach = !!reach && (reach.target_shares || 0) > 0
                    const reachPct = hasReach ? Math.min(100, (reach!.current_shares / reach!.target_shares) * 100) : 0
                    const showReachAsPrimary = hasReach && campaign.goal === 0
                    const isSelected = selectedIds.includes(campaign._id)
                    return (
                      <CampaignCard
                        key={campaign._id}
                        $selected={isSelected}
                        $delay={idx}
                        onClick={() => toggleSelect(campaign._id)}
                      >
                        <CardSelCheck $checked={isSelected}>
                          {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                        </CardSelCheck>

                        <CampaignCardTitle>{campaign.title}</CampaignCardTitle>

                        <CampaignCardMeta>
                          <StatusPill $status={campaign.status}>{campaign.status}</StatusPill>
                          {campaign.campaign_type && (
                            <TypePill>{campaign.campaign_type}</TypePill>
                          )}
                        </CampaignCardMeta>

                        {campaign.goal > 0 && (
                          <ProgressRow>
                            <ProgressLabels>
                              <ProgressRaised>{fmtMoney(campaign.raised || 0)}</ProgressRaised>
                              <ProgressGoal>of {fmtMoney(campaign.goal)}</ProgressGoal>
                            </ProgressLabels>
                            <ProgressTrack>
                              <ProgressFill $pct={pct} $status={campaign.status} />
                            </ProgressTrack>
                          </ProgressRow>
                        )}

                        {/* SF-1: separate reach meter (shares) for Share-to-Earn campaigns */}
                        {hasReach && (
                          <ProgressRow>
                            <ProgressLabels>
                              <ProgressRaised>{(reach!.current_shares || 0).toLocaleString()} shares</ProgressRaised>
                              <ProgressGoal>of {reach!.target_shares.toLocaleString()}</ProgressGoal>
                            </ProgressLabels>
                            <ProgressTrack>
                              <ProgressFill $pct={reachPct} $status={campaign.status} />
                            </ProgressTrack>
                          </ProgressRow>
                        )}

                        <CardStats>
                          <CardStat>
                            <CardStatVal>{campaign.donor_count || 0}</CardStatVal>
                            <CardStatKey>Donors</CardStatKey>
                          </CardStat>
                          <CardStat>
                            <CardStatVal>{(showReachAsPrimary ? reachPct : pct).toFixed(0)}%</CardStatVal>
                            <CardStatKey>{showReachAsPrimary ? 'Reach' : 'Funded'}</CardStatKey>
                          </CardStat>
                          {campaign.end_date && (
                            <CardStat>
                              <CardStatVal>
                                {Math.max(0, Math.ceil(
                                  (new Date(campaign.end_date).getTime() - Date.now()) / 86400000
                                ))}d
                              </CardStatVal>
                              <CardStatKey>Left</CardStatKey>
                            </CardStat>
                          )}
                        </CardStats>

                        <CardActions onClick={e => e.stopPropagation()}>
                          <ActionBtn onClick={() => router.push(`/campaigns/${campaign._id}`)}>
                            <Eye size={12} /> View
                          </ActionBtn>
                          <ActionBtn onClick={() => router.push(`/campaigns/${campaign._id}/analytics`)}>
                            <BarChart2 size={12} /> Stats
                          </ActionBtn>
                          {campaign.status === 'active'
                            ? <ActionBtn onClick={() => handlePause(campaign._id)}>
                                <Pause size={12} /> Pause
                              </ActionBtn>
                            : campaign.status === 'paused'
                            ? <ActionBtn onClick={() => handleResume(campaign._id)}>
                                <Play size={12} /> Resume
                              </ActionBtn>
                            : null
                          }
                          <ActionBtn $danger onClick={() => handleDelete(campaign._id)}>
                            <Trash2 size={12} />
                          </ActionBtn>
                        </CardActions>
                      </CampaignCard>
                    )
                  })
              }
            </CampaignGrid>

            {/* <MobileBottomPad /> */}
          </PageBody>

          {/* Smart Confirmation */}
          <SmartConfirmation
            action={lastAction}
            onUndo={undo}
            onDismiss={dismiss}
            undoTimeout={5000}
          />
        </Main>

        {/* ── Mobile Tab Bar ── */}
        {/* <MobileTabBar>
          <MobileTabBtn $active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={20} /> Overview
          </MobileTabBtn>
          <MobileTabBtn $active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')}>
            <TrendingUp size={20} /> Campaigns
          </MobileTabBtn>
          <MobileTabBtn onClick={() => router.push('/campaigns/new')}>
            <Plus size={20} /> New
          </MobileTabBtn>
          <MobileTabBtn $active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={20} /> Analytics
          </MobileTabBtn>
          <MobileTabBtn onClick={() => setSidebarOpen(true)}>
            <Menu size={20} /> Menu
          </MobileTabBtn>
        </MobileTabBar> */}
      </Shell>
    </>
  )
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  )
}

