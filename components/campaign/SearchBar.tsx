'use client'

import { useEffect, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import styled, { keyframes } from 'styled-components'
import { tk } from '@/styles/dashboardTokens'

interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  debounceMs?: number
  /** Optional: show a filter count pill when filters are active */
  activeFilterCount?: number
  onFilterClick?: () => void
}

// ─── Animations ──────────────────────────────────────────────────────────────
const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
`

// ─── Wrapper ──────────────────────────────────────────────────────────────────
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

// ─── Input shell ──────────────────────────────────────────────────────────────
const Shell = styled.div<{ $focused: boolean }>`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: ${tk.white};
  border-radius: 14px;
  border: 1.5px solid ${p => p.$focused ? tk.amber : tk.border};
  box-shadow: ${p => p.$focused
    ? `0 0 0 3px rgba(212,135,10,0.12), 0 1px 4px rgba(0,0,0,0.06)`
    : '0 1px 3px rgba(0,0,0,0.04)'};
  transition: border-color 200ms, box-shadow 200ms;
  overflow: hidden;
`

// ─── Icon left ────────────────────────────────────────────────────────────────
const SearchIconWrap = styled.div<{ $focused: boolean }>`
  position: absolute;
  left: 14px;
  display: flex;
  align-items: center;
  pointer-events: none;
  color: ${p => p.$focused ? tk.amber : tk.muted};
  transition: color 200ms;
`

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 44px 0 44px;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: ${tk.heading};
  outline: none;

  &::placeholder {
    color: ${tk.muted};
    font-weight: 400;
  }

  @media (min-width: 640px) {
    height: 52px;
    font-size: 0.95rem;
  }
`

// ─── Clear button ────────────────────────────────────────────────────────────
const ClearBtn = styled.button`
  position: absolute;
  right: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: ${tk.canvasDeep};
  color: ${tk.muted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 180ms, color 180ms;
  animation: ${fadeIn} 150ms ease;
  flex-shrink: 0;

  &:hover { background: ${tk.border}; color: ${tk.heading}; }
`

// ─── Filter button ────────────────────────────────────────────────────────────
const FilterBtn = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 48px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1.5px solid ${p => p.$active ? tk.blue : tk.border};
  background: ${p => p.$active ? tk.blueLight : tk.white};
  color: ${p => p.$active ? tk.blue : tk.body};
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 180ms;
  white-space: nowrap;

  &:hover {
    border-color: ${tk.blue};
    background: ${tk.blueLight};
    color: ${tk.blue};
  }

  @media (min-width: 640px) {
    height: 52px;
  }
`

const FilterCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: ${tk.blue};
  color: ${tk.white};
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  font-weight: 500;
`

// ─── Component ─────────────────────────────────────────────────────────────────
export function SearchBar({
  onSearch,
  placeholder = 'Search campaigns…',
  debounceMs = 300,
  activeFilterCount = 0,
  onFilterClick,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => onSearch(value), debounceMs)
    return () => clearTimeout(t)
  }, [value, debounceMs, onSearch])

  return (
    <Wrapper>
      <Shell $focused={focused}>
        <SearchIconWrap $focused={focused}>
          <Search size={18} strokeWidth={2.2} />
        </SearchIconWrap>

        <Input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Search campaigns"
        />

        {value && (
          <ClearBtn onClick={() => setValue('')} aria-label="Clear search">
            <X size={13} strokeWidth={2.5} />
          </ClearBtn>
        )}
      </Shell>

      {onFilterClick && (
        <FilterBtn
          $active={activeFilterCount > 0}
          onClick={onFilterClick}
          aria-label={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount} active)` : ''}`}
        >
          <SlidersHorizontal size={16} />
          <span className="hide-xs">Filters</span>
          {activeFilterCount > 0 && <FilterCount>{activeFilterCount}</FilterCount>}
        </FilterBtn>
      )}
    </Wrapper>
  )
}