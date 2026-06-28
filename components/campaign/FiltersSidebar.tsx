'use client'

import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { ChevronDown, X, MapPin, Map, Globe, Zap, RotateCcw } from 'lucide-react'
import { CampaignFilters } from '@/store/filterStore'
import { tk } from '@/styles/dashboardTokens'

interface FiltersSidebarProps {
  filters: CampaignFilters
  needTypes: Array<{ id: string; name: string; count: number }>
  onFiltersChange: (filters: CampaignFilters) => void
  onReset: () => void
  isOpen?: boolean
  onClose?: () => void
  mobile?: boolean
}

// ─── Animations ──────────────────────────────────────────────────────────────
const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

// ─── Mobile overlay ───────────────────────────────────────────────────────────
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
  animation: ${fadeIn} 200ms ease;
  backdrop-filter: blur(2px);
`

const Drawer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: min(340px, 90vw);
  background: ${tk.white};
  z-index: 201;
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', sans-serif;
  animation: ${slideIn} 280ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.12);
`

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid ${tk.border};
  flex-shrink: 0;
`

const DrawerTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  letter-spacing: -0.3px;
`

const CloseBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.muted};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 180ms, color 180ms;

  &:hover { background: ${tk.canvasDeep}; color: ${tk.heading}; }
`

const DrawerScroll = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: ${tk.border}; border-radius: 999px; }
`

const DrawerFooter = styled.div`
  padding: 14px 20px;
  border-top: 1px solid ${tk.border};
  flex-shrink: 0;
`

// ─── Sidebar container (desktop) ──────────────────────────────────────────────
const Sidebar = styled.div`
  background: ${tk.white};
  border-radius: 14px;
  border: 1px solid ${tk.border};
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
`

const SidebarHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 14px;
  border-bottom: 1px solid ${tk.border};
`

const SidebarTitle = styled.h2`
  font-family: 'Syne', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  letter-spacing: -0.3px;
`

// ─── Section ──────────────────────────────────────────────────────────────────
const Section = styled.div`
  border-bottom: 1px solid ${tk.canvasDeep};

  &:last-child { border-bottom: none; }
`

const SectionToggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 18px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;

  &:hover { background: ${tk.canvas}; }
`

const SectionLabel = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  color: ${tk.body};
  letter-spacing: 1px;
  text-transform: uppercase;
`

const ChevronIcon = styled(ChevronDown)<{ $open: boolean }>`
  color: ${tk.muted};
  transition: transform 200ms;
  transform: ${p => p.$open ? 'rotate(0deg)' : 'rotate(-90deg)'};
  flex-shrink: 0;
`

const SectionContent = styled.div<{ $visible: boolean }>`
  display: ${p => p.$visible ? 'flex' : 'none'};
  flex-direction: column;
  gap: 2px;
  padding: 4px 18px 14px;
`

// ─── Checkbox / Radio option ───────────────────────────────────────────────────
const OptionLabel = styled.label<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  border-radius: 9px;
  cursor: pointer;
  font-size: 0.83rem;
  color: ${tk.body};
  background: ${p => p.$selected ? tk.amberLight : 'transparent'};
  transition: background 150ms;

  &:hover { background: ${p => p.$selected ? tk.amberLight : tk.canvas}; }

  input { display: none; }
`

const OptionDot = styled.span<{ $selected: boolean; $type?: 'radio' | 'check' }>`
  width: 16px;
  height: 16px;
  border-radius: ${p => p.$type === 'radio' ? '50%' : '5px'};
  border: 1.5px solid ${p => p.$selected ? tk.amber : tk.border};
  background: ${p => p.$selected ? tk.amber : tk.white};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms;

  &::after {
    content: '';
    display: ${p => p.$selected ? 'block' : 'none'};
    width: ${p => p.$type === 'radio' ? '6px' : '9px'};
    height: ${p => p.$type === 'radio' ? '6px' : '7px'};
    border-radius: ${p => p.$type === 'radio' ? '50%' : '0'};
    background: ${p => p.$type === 'radio' ? 'white' : 'transparent'};
    border-bottom: ${p => p.$type !== 'radio' ? '2px solid white' : 'none'};
    border-right: ${p => p.$type !== 'radio' ? '2px solid white' : 'none'};
    transform: ${p => p.$type !== 'radio' ? 'rotate(45deg) translate(-1px, -1px)' : 'none'};
  }
`

const OptionText = styled.span`
  flex: 1;
  font-weight: 500;
`

const OptionCount = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: ${tk.muted};
  background: ${tk.canvasDeep};
  padding: 1px 7px;
  border-radius: 999px;
`

// ─── Show more ────────────────────────────────────────────────────────────────
const ShowMore = styled.button`
  font-size: 0.78rem;
  color: ${tk.blue};
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  padding: 2px 10px;
  margin-top: 2px;
  align-self: flex-start;

  &:hover { color: ${tk.amber}; }
`

// ─── Text input ───────────────────────────────────────────────────────────────
const TextInput = styled.input`
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 9px;
  border: 1.5px solid ${tk.border};
  font-family: 'DM Sans', sans-serif;
  font-size: 0.83rem;
  color: ${tk.heading};
  background: ${tk.white};
  outline: none;
  box-sizing: border-box;
  transition: border-color 200ms, box-shadow 200ms;

  &:focus {
    border-color: ${tk.amber};
    box-shadow: 0 0 0 3px rgba(212, 135, 10, 0.12);
  }

  &::placeholder { color: ${tk.muted}; }
`

const InputLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${tk.muted};
  margin-bottom: 6px;
  display: block;
`

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

// ─── Reset button ─────────────────────────────────────────────────────────────
const ResetBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 38px;
  border-radius: 10px;
  border: 1.5px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.body};
  font-family: 'Syne', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 180ms;

  &:hover { border-color: ${tk.blue}; color: ${tk.blue}; background: ${tk.canvas}; }
`

// ─── Apply button (mobile) ────────────────────────────────────────────────────
const ApplyBtn = styled.button`
  width: 100%;
  height: 44px;
  border-radius: 12px;
  border: none;
  background: ${tk.ink};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 180ms;

  &:hover { background: ${tk.inkLight}; }
`

// ─── Scope icons ──────────────────────────────────────────────────────────────
const scopeOptions = [
  { value: 'all', label: 'All Scopes', icon: null },
  { value: 'local', label: 'Local', icon: <MapPin size={13} /> },
  { value: 'regional', label: 'Regional', icon: <Map size={13} /> },
  { value: 'national', label: 'National', icon: <Globe size={13} /> },
  { value: 'global', label: 'Global', icon: <Zap size={13} /> },
]

const statusOptions = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'paused', label: 'Paused' },
]

const sortOptions = [
  { value: 'trending', label: 'Trending' },
  { value: 'newest', label: 'Newest First' },
  { value: 'raised', label: 'Most Raised' },
  { value: 'goalAsc', label: 'Goal: Low → High' },
  { value: 'goalDesc', label: 'Goal: High → Low' },
]

const MAX_VISIBLE = 6

// ─── Inner content ────────────────────────────────────────────────────────────
function FiltersContent({
  filters,
  needTypes,
  onFiltersChange,
  onReset,
  onClose,
  mobile = false,
}: FiltersSidebarProps) {
  const [sections, setSections] = useState({
    needType: true,
    scope: false,
    location: false,
    goal: false,
    status: true,
    sort: true,
  })
  const [showAllTypes, setShowAllTypes] = useState(false)

  const toggle = (key: keyof typeof sections) =>
    setSections(p => ({ ...p, [key]: !p[key] }))

  const update = (patch: Partial<CampaignFilters>) =>
    onFiltersChange({ ...filters, ...patch, page: 1 })

  // Alphabetize need types A→Z, keeping the catch-all 'Other' pinned to the end.
  const sortedTypes = [...needTypes].sort((a, b) => {
    const aOther = a.id === 'other'
    const bOther = b.id === 'other'
    if (aOther !== bOther) return aOther ? 1 : -1
    return (a.name ?? '').localeCompare(b.name ?? '')
  })

  const visibleTypes = showAllTypes ? sortedTypes : sortedTypes.slice(0, MAX_VISIBLE)

  return (
    <>
      {/* Need Type */}
      {needTypes.length > 0 && (
        <Section>
          <SectionToggle onClick={() => toggle('needType')}>
            <SectionLabel>Category</SectionLabel>
            <ChevronIcon size={14} $open={sections.needType} />
          </SectionToggle>
          <SectionContent $visible={sections.needType}>
            {visibleTypes.map(nt => {
              const sel = filters.needTypes.includes(nt.id)
              return (
                <OptionLabel key={nt.id} $selected={sel}>
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => {
                      const next = sel
                        ? filters.needTypes.filter(t => t !== nt.id)
                        : [...filters.needTypes, nt.id]
                      update({ needTypes: next })
                    }}
                  />
                  <OptionDot $selected={sel} $type="check" />
                  <OptionText>{nt.name}</OptionText>
                  <OptionCount>{nt.count}</OptionCount>
                </OptionLabel>
              )
            })}
            {needTypes.length > MAX_VISIBLE && (
              <ShowMore onClick={() => setShowAllTypes(p => !p)}>
                {showAllTypes ? '↑ Show less' : `+ ${needTypes.length - MAX_VISIBLE} more`}
              </ShowMore>
            )}
          </SectionContent>
        </Section>
      )}

      {/* Status */}
      <Section>
        <SectionToggle onClick={() => toggle('status')}>
          <SectionLabel>Status</SectionLabel>
          <ChevronIcon size={14} $open={sections.status} />
        </SectionToggle>
        <SectionContent $visible={sections.status}>
          {statusOptions.map(opt => {
            const sel = (filters.status || 'all') === opt.value
            return (
              <OptionLabel key={opt.value} $selected={sel}>
                <input type="radio" checked={sel} onChange={() => update({ status: opt.value as any })} />
                <OptionDot $selected={sel} $type="radio" />
                <OptionText>{opt.label}</OptionText>
              </OptionLabel>
            )
          })}
        </SectionContent>
      </Section>

      {/* Sort */}
      <Section>
        <SectionToggle onClick={() => toggle('sort')}>
          <SectionLabel>Sort by</SectionLabel>
          <ChevronIcon size={14} $open={sections.sort} />
        </SectionToggle>
        <SectionContent $visible={sections.sort}>
          {sortOptions.map(opt => {
            const sel = (filters.sortBy || 'trending') === opt.value
            return (
              <OptionLabel key={opt.value} $selected={sel}>
                <input type="radio" checked={sel} onChange={() => update({ sortBy: opt.value as any })} />
                <OptionDot $selected={sel} $type="radio" />
                <OptionText>{opt.label}</OptionText>
              </OptionLabel>
            )
          })}
        </SectionContent>
      </Section>

      {/* Geographic Scope */}
      <Section>
        <SectionToggle onClick={() => toggle('scope')}>
          <SectionLabel>Scope</SectionLabel>
          <ChevronIcon size={14} $open={sections.scope} />
        </SectionToggle>
        <SectionContent $visible={sections.scope}>
          {scopeOptions.map(opt => {
            const sel = (filters.geographicScope || 'all') === opt.value
            return (
              <OptionLabel key={opt.value} $selected={sel}>
                <input type="radio" checked={sel} onChange={() => update({ geographicScope: opt.value as any })} />
                <OptionDot $selected={sel} $type="radio" />
                <OptionText style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {opt.icon} {opt.label}
                </OptionText>
              </OptionLabel>
            )
          })}
        </SectionContent>
      </Section>

      {/* Location */}
      <Section>
        <SectionToggle onClick={() => toggle('location')}>
          <SectionLabel>Location</SectionLabel>
          <ChevronIcon size={14} $open={sections.location} />
        </SectionToggle>
        <SectionContent $visible={sections.location}>
          <InputGroup>
            <div>
              <InputLabel>City or region</InputLabel>
              <TextInput
                placeholder="e.g. New York"
                value={filters.location || ''}
                onChange={e => update({ location: e.target.value || undefined })}
              />
            </div>
            {filters.location && (
              <div>
                <InputLabel>Radius: {filters.locationRadius || 25} km</InputLabel>
                <input
                  type="range"
                  min={5}
                  max={200}
                  step={5}
                  value={filters.locationRadius || 25}
                  onChange={e => update({ locationRadius: parseInt(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            )}
          </InputGroup>
        </SectionContent>
      </Section>

      {/* Goal Range */}
      <Section>
        <SectionToggle onClick={() => toggle('goal')}>
          <SectionLabel>Goal Range</SectionLabel>
          <ChevronIcon size={14} $open={sections.goal} />
        </SectionToggle>
        <SectionContent $visible={sections.goal}>
          <InputGroup>
            <div>
              <InputLabel>Min ($)</InputLabel>
              <TextInput
                type="number"
                placeholder="0"
                value={filters.minGoal ? filters.minGoal / 100 : ''}
                onChange={e => update({ minGoal: e.target.value ? parseInt(e.target.value) * 100 : undefined })}
              />
            </div>
            <div>
              <InputLabel>Max ($)</InputLabel>
              <TextInput
                type="number"
                placeholder="Any"
                value={filters.maxGoal && filters.maxGoal < 9999999 * 100 ? filters.maxGoal / 100 : ''}
                onChange={e => update({ maxGoal: e.target.value ? parseInt(e.target.value) * 100 : undefined })}
              />
            </div>
          </InputGroup>
        </SectionContent>
      </Section>
    </>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export function FiltersSidebar(props: FiltersSidebarProps) {
  const { mobile, isOpen, onClose, onReset } = props

  if (mobile) {
    if (!isOpen) return null
    return (
      <>
        <Backdrop onClick={onClose} />
        <Drawer>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
            <CloseBtn onClick={onClose} aria-label="Close filters">
              <X size={16} />
            </CloseBtn>
          </DrawerHeader>
          <DrawerScroll>
            <FiltersContent {...props} />
          </DrawerScroll>
          <DrawerFooter>
            <div style={{ display: 'flex', gap: 8 }}>
              <ResetBtn onClick={onReset} style={{ flex: 1 }}>
                <RotateCcw size={13} /> Reset
              </ResetBtn>
              <ApplyBtn onClick={onClose} style={{ flex: 2 }}>
                Apply Filters
              </ApplyBtn>
            </div>
          </DrawerFooter>
        </Drawer>
      </>
    )
  }

  return (
    <Sidebar>
      <SidebarHead>
        <SidebarTitle>Filters</SidebarTitle>
        <ResetBtn onClick={onReset} style={{ width: 'auto', padding: '0 12px', fontSize: '0.75rem' }}>
          <RotateCcw size={12} /> Reset
        </ResetBtn>
      </SidebarHead>
      <FiltersContent {...props} />
    </Sidebar>
  )
}