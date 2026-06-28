'use client'

import React from 'react'
import styled from 'styled-components'
import { Plus, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useDashboardContext } from '../context/DashboardContext'
import { NotificationBell } from '@/features/notifications'

/**
 * Dashboard Header Component
 * Contains title, search, filters, view toggle, notifications, and create button
 */

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onSearchChange?: (query: string) => void
  searchValue?: string
  campaignCount?: number
  // Phase 4: Notifications
  unreadCount?: number
  onNotificationsClick?: () => void
}

const Header = styled.div`
  margin-bottom: 32px;
`

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const TitleSection = styled.div`
  flex: 1;
`

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
`

const PageSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`

const ControlsRow = styled.div`
  display: none; /* Removed search and filters section */
`

const SearchContainer = styled.div`
  flex: 1;
  min-width: 250px;
  position: relative;

  @media (max-width: 768px) {
    min-width: unset;
  }
`

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  display: flex;
  align-items: center;
`

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;

    button {
      flex: 1;
    }
  }
`

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(props) => (props.$variant === 'primary' ? '#3b82f6' : 'white')};
  color: ${(props) => (props.$variant === 'primary' ? 'white' : '#374151')};
  border: ${(props) => (props.$variant === 'primary' ? 'none' : '1px solid #d1d5db')};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;

  &:hover {
    ${(props) =>
      props.$variant === 'primary'
        ? 'background: #2563eb;'
        : 'background: #f3f4f6; border-color: #9ca3af;'}
  }

  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`

const NotificationBadge = styled.span`
  display: none; /* Removed */
`

const FilterIndicator = styled.span<{ $active: boolean }>`
  display: none; /* Removed */
`

const FilterChips = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  padding: 12px 0;
`

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  font-size: 12px;
  color: #0c4a6e;
  font-weight: 500;

  button {
    background: none;
    border: none;
    color: #0c4a6e;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    display: flex;
    align-items: center;

    &:hover {
      opacity: 0.7;
    }
  }
`

/**
 * Dashboard Header Component
 */
export function DashboardHeader({
  title = 'Dashboard',
  subtitle = 'Manage and grow your campaigns',
  searchValue = '',
  onSearchChange,
  campaignCount,
  unreadCount = 0,
  onNotificationsClick,
}: DashboardHeaderProps) {
  const { filters, setViewMode, viewMode } = useDashboardContext()
  
  // Compute active filters from filters object
  const activeFilters = React.useMemo(() => {
    const active: string[] = []
    if (filters.status && filters.status.length > 0) {
      active.push(`Status: ${filters.status.join(', ')}`)
    }
    if (filters.type && filters.type.length > 0) {
      active.push(`Type: ${filters.type.join(', ')}`)
    }
    if (filters.searchQuery) {
      active.push(`Search: ${filters.searchQuery}`)
    }
    if (filters.sortBy) {
      active.push(`Sort: ${filters.sortBy}`)
    }
    return active
  }, [filters])

  return (
    <Header>
      <TopRow>
        <TitleSection>
          <PageTitle>{title}</PageTitle>
          <PageSubtitle>
            {subtitle}
            {campaignCount !== undefined && (
              <> • {campaignCount} campaign{campaignCount !== 1 ? 's' : ''}</>
            )}
          </PageSubtitle>
        </TitleSection>

        <ButtonGroup>
          <Link href="/messages" style={{ textDecoration: 'none' }} aria-label="Messages">
            <Button $variant="secondary">
              <MessageSquare size={16} />
            </Button>
          </Link>
          <NotificationBell />
          <Link href="/campaigns/new" style={{ textDecoration: 'none' }}>
            <Button $variant="primary">
              <Plus size={16} />
              Create Campaign
            </Button>
          </Link>
        </ButtonGroup>
      </TopRow>

      {/* Search, Filters, and Sort removed */}
    </Header>
  )
}
