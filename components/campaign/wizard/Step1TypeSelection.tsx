'use client'

import React, { useState, useMemo } from 'react'
import styled, { keyframes } from 'styled-components'

// ── tokens (import from shared tokens file in real project) ──
const tokens = {
  indigo: '#4F46E5',
  indigoLight: '#EEF2FF',
  indigoMid: '#818CF8',
  slate900: '#0F172A',
  slate600: '#475569',
  slate400: '#94A3B8',
  white: '#ffffff',
  border: '#E2E8F0',
  radius: '16px',
  radiusSm: '10px',
  transition: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`

// ── Shared from Step1a ─────────────────────────────────────
const EyebrowLabel = styled.div`...` // same as above
const PageTitle = styled.h1`...`     // same as above
const PageSubtitle = styled.p`...`   // same as above
const Header = styled.div`
  margin-bottom: 2.5rem;
  animation: ${fadeUp} 0.4s ease both;
`

// ── Search ─────────────────────────────────────────────────
const SearchWrap = styled.div`
  position: relative;
  margin-bottom: 1.25rem;
  animation: ${fadeUp} 0.4s 0.05s ease both;

  svg {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: ${tokens.slate400};
    width: 18px;
    height: 18px;
    pointer-events: none;
  }
`

const SearchInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 1rem 0 2.75rem;
  border: 1.5px solid ${tokens.border};
  border-radius: ${tokens.radiusSm};
  font-family: inherit;
  font-size: 0.9rem;
  color: ${tokens.slate900};
  background: ${tokens.white};
  outline: none;
  transition: border-color ${tokens.transition}, box-shadow ${tokens.transition};

  &::placeholder { color: ${tokens.slate400}; }

  &:focus {
    border-color: ${tokens.indigo};
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
  }
`

// ── Filter pills ───────────────────────────────────────────
const PillRow = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
  margin-bottom: 1.25rem;
  scrollbar-width: none;
  animation: ${fadeUp} 0.4s 0.1s ease both;
  &::-webkit-scrollbar { display: none; }
`

const Pill = styled.button<{ $active: boolean }>`
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1.5px solid ${({ $active }) => ($active ? tokens.indigo : tokens.border)};
  background: ${({ $active }) => ($active ? tokens.indigoLight : tokens.white)};
  font-size: 0.8rem;
  font-weight: 500;
  color: ${({ $active }) => ($active ? tokens.indigo : tokens.slate600)};
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  transition: all ${tokens.transition};

  &:hover {
    border-color: ${tokens.indigoMid};
    color: ${tokens.indigo};
    background: ${tokens.indigoLight};
  }
  &:focus-visible { box-shadow: 0 0 0 3px rgba(79,70,229,0.25); }
`

// ── Category grid ──────────────────────────────────────────
const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  animation: ${fadeUp} 0.4s 0.15s ease both;

  @media (max-width: 400px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const CatCard = styled.button<{ $selected: boolean }>`
  background: ${({ $selected }) => ($selected ? tokens.indigoLight : tokens.white)};
  border: 1.5px solid ${({ $selected }) => ($selected ? tokens.indigo : tokens.border)};
  border-radius: ${tokens.radiusSm};
  padding: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: left;
  outline: none;
  transition: all ${tokens.transition};

  &:hover {
    border-color: ${tokens.indigoMid};
    box-shadow: 0 4px 16px rgba(79,70,229,0.08);
    transform: translateY(-1px);
  }
  &:focus-visible { box-shadow: 0 0 0 3px rgba(79,70,229,0.25); }
`

const CatEmoji = styled.div`font-size: 1.4rem; line-height: 1;`
const CatName = styled.div`font-size: 0.8rem; font-weight: 500; color: ${tokens.slate900}; line-height: 1.3;`
const CatCount = styled.div`font-size: 0.7rem; color: ${tokens.slate400};`

// ── Data ───────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'medical',     name: 'Medical & Health',   emoji: '🏥', count: 18, filter: 'health' },
  { id: 'education',   name: 'Education',           emoji: '🎓', count: 14, filter: 'education' },
  { id: 'environment', name: 'Environment',         emoji: '🌿', count: 12, filter: 'environment' },
  { id: 'community',   name: 'Community',           emoji: '🤝', count: 16, filter: 'community' },
  { id: 'arts',        name: 'Arts & Culture',      emoji: '🎨', count: 11, filter: 'arts' },
  { id: 'sports',      name: 'Sports & Athletics',  emoji: '⚽', count: 9,  filter: 'sports' },
  { id: 'tech',        name: 'Technology',          emoji: '💻', count: 7,  filter: 'tech' },
  { id: 'animals',     name: 'Animals & Pets',      emoji: '🐾', count: 8,  filter: 'community' },
  { id: 'disaster',    name: 'Disaster Relief',     emoji: '🆘', count: 6,  filter: 'community' },
  { id: 'memorial',    name: 'Memorial & Funeral',  emoji: '🕊️', count: 5, filter: 'community' },
  { id: 'startup',     name: 'Business & Startup',  emoji: '🚀', count: 10, filter: 'tech' },
  { id: 'faith',       name: 'Faith & Church',      emoji: '⛪', count: 7,  filter: 'community' },
  { id: 'music',       name: 'Music',               emoji: '🎵', count: 8,  filter: 'arts' },
  { id: 'film',        name: 'Film & Video',        emoji: '🎬', count: 6,  filter: 'arts' },
  { id: 'research',    name: 'Research',            emoji: '🔬', count: 5,  filter: 'education' },
  { id: 'youth',       name: 'Youth & Children',    emoji: '👧', count: 9,  filter: 'community' },
] as const

// Catch-all option — always offered, regardless of the active area filter.
const OTHER_CATEGORY = { id: 'other', name: 'Other', emoji: '✨', count: 0, filter: 'all' } as const

type CategoryId = (typeof CATEGORIES)[number]['id']

const FILTERS = [
  { label: 'All',         value: 'all' },
  { label: 'Community',   value: 'community' },
  { label: 'Health',      value: 'health' },
  { label: 'Education',   value: 'education' },
  { label: 'Environment', value: 'environment' },
  { label: 'Arts',        value: 'arts' },
  { label: 'Sports',      value: 'sports' },
  { label: 'Technology',  value: 'tech' },
]

// ── Component ──────────────────────────────────────────────
interface Step1TypeSelectionProps {
  selectedCategory: string | null
  onCategorySelect: (categoryId: string, categoryName: string) => void
  onCategoryClear?: () => void
}

export const Step1TypeSelection: React.FC<Step1TypeSelectionProps> = ({
  selectedCategory,
  onCategorySelect,
  onCategoryClear,
}) => {
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  // Alphabetize once so the grid is always in A→Z order.
  const sortedCategories = useMemo(
    () => [...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  )

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = sortedCategories.filter(c => {
      const matchFilter = activeFilter === 'all' || c.filter === activeFilter
      const matchSearch = c.name.toLowerCase().includes(q)
      return matchFilter && matchSearch
    })
    // 'Other' is a catch-all: always appended (last) when it matches the search.
    if (OTHER_CATEGORY.name.toLowerCase().includes(q)) list.push(OTHER_CATEGORY)
    return list
  }, [search, activeFilter, sortedCategories])

  return (
    <div role="region" aria-label="Category selection">
      <Header>
        <EyebrowLabel>Category</EyebrowLabel>
        <PageTitle>What's your campaign about?</PageTitle>
        <PageSubtitle>
          Select the category that best describes your initiative.
          Search or browse 100+ options below.
        </PageSubtitle>
      </Header>

      <SearchWrap>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <SearchInput
          type="search"
          placeholder="Search categories…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search categories"
        />
      </SearchWrap>

      <PillRow role="group" aria-label="Filter by area">
        {FILTERS.map(f => (
          <Pill
            key={f.value}
            type="button"
            $active={activeFilter === f.value}
            onClick={() => setActiveFilter(f.value)}
            aria-pressed={activeFilter === f.value}
          >
            {f.label}
          </Pill>
        ))}
      </PillRow>

      <CategoryGrid role="listbox" aria-label="Select a category">
        {visible.map(c => (
          <CatCard
            key={c.id}
            type="button"
            role="option"
            $selected={selectedCategory === c.id}
            aria-selected={selectedCategory === c.id}
            onClick={() => onCategorySelect(c.id, c.name)}
          >
            <CatEmoji aria-hidden="true">{c.emoji}</CatEmoji>
            <CatName>{c.name}</CatName>
            <CatCount>{c.id === 'other' ? 'Something else' : `${c.count} campaigns`}</CatCount>
          </CatCard>
        ))}
      </CategoryGrid>
    </div>
  )
}