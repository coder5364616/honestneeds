'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { MapPin, Loader2, X } from 'lucide-react'

/**
 * LocationAutocomplete
 * ---------------------------------------------------------------------------
 * A free, key-less location search box backed by OpenStreetMap's Nominatim
 * geocoder. Surfaces City / State / Zip / Country suggestions as the user
 * types and returns a clean, comma-separated location string on select.
 *
 * Returns the formatted label via `onChange`. When the caller also passes
 * `onSelectDetails`, the structured address parts (city/state/zip/country and
 * lat/lng) are forwarded too, so callers that store structured location can
 * use them.
 */

const t = {
  indigo: '#4F46E5', indigoLight: '#EEF2FF',
  slate900: '#0F172A', slate700: '#334155', slate400: '#94A3B8',
  slate200: '#E2E8F0', white: '#fff', red: '#EF4444',
  rs: '8px', tr: '0.18s cubic-bezier(.4,0,.2,1)',
}

const fadeIn = keyframes`from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}`

const Wrap = styled.div`position:relative;width:100%`

const InputRow = styled.div<{ $error?: boolean; $focus: boolean }>`
  display:flex;align-items:center;gap:8px;width:100%;
  padding:0 10px;
  border:1.5px solid ${({ $error, $focus }) => ($error ? t.red : $focus ? t.indigo : t.slate200)};
  border-radius:${t.rs};background:${t.white};
  box-shadow:${({ $focus }) => ($focus ? '0 0 0 3px rgba(79,70,229,.12)' : 'none')};
  transition:border-color ${t.tr},box-shadow ${t.tr};
  svg.pin{color:${t.slate400};flex-shrink:0}
`

const Input = styled.input`
  flex:1;min-width:0;border:none;outline:none;background:transparent;
  padding:10px 0;font-family:inherit;font-size:0.875rem;color:${t.slate900};
  &::placeholder{color:${t.slate400}}
`

const ClearBtn = styled.button`
  display:flex;align-items:center;justify-content:center;
  border:none;background:none;cursor:pointer;color:${t.slate400};padding:2px;
  border-radius:6px;flex-shrink:0;
  &:hover{color:${t.slate700}}
`

const spin = keyframes`to{transform:rotate(360deg)}`
const Spinner = styled(Loader2)`animation:${spin} .8s linear infinite;color:${t.indigo};flex-shrink:0`

const Dropdown = styled.ul`
  position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:40;
  list-style:none;margin:0;padding:4px;
  background:${t.white};border:1.5px solid ${t.slate200};border-radius:${t.rs};
  box-shadow:0 12px 28px rgba(15,23,42,.12);
  max-height:240px;overflow-y:auto;
  animation:${fadeIn} 0.14s ease both;
`

const Item = styled.li<{ $active: boolean }>`
  display:flex;align-items:flex-start;gap:8px;
  padding:9px 10px;border-radius:6px;cursor:pointer;
  background:${({ $active }) => ($active ? t.indigoLight : 'transparent')};
  svg{color:${t.indigo};flex-shrink:0;margin-top:2px}
  &:hover{background:${t.indigoLight}}
`

const ItemText = styled.div`
  display:flex;flex-direction:column;gap:1px;min-width:0;
  .primary{font-size:0.83rem;font-weight:500;color:${t.slate900};line-height:1.3}
  .secondary{font-size:0.74rem;color:${t.slate400};line-height:1.3;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
`

const EmptyNote = styled.li`
  padding:10px;font-size:0.8rem;color:${t.slate400};text-align:center;list-style:none;
`

interface NominatimAddress {
  city?: string; town?: string; village?: string; hamlet?: string; municipality?: string
  state?: string; region?: string
  postcode?: string
  country?: string
  county?: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: NominatimAddress
}

export interface LocationDetails {
  label: string
  city?: string
  state?: string
  zip?: string
  country?: string
  latitude?: number
  longitude?: number
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectDetails?: (details: LocationDetails) => void
  error?: boolean
  placeholder?: string
  id?: string
}

function buildLabel(a: NominatimAddress): string {
  const city = a.city || a.town || a.village || a.hamlet || a.municipality || a.county
  const parts = [city, a.state || a.region, a.postcode, a.country].filter(Boolean)
  return parts.join(', ')
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value, onChange, onSelectDetails, error, placeholder = 'City, State, Zip or Country', id,
}) => {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const [searched, setSearched] = useState(false)

  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const justSelectedRef = useRef(false)

  // Keep local query in sync if the parent value changes externally.
  useEffect(() => { setQuery(value) }, [value])

  // Close on outside click.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setLoading(true)
    try {
      const url =
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&` +
        `q=${encodeURIComponent(q)}`
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      })
      if (!res.ok) throw new Error('geocode failed')
      const data: NominatimResult[] = await res.json()
      setResults(data)
      setSearched(true)
      setOpen(true)
      setActiveIdx(-1)
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        setResults([])
        setSearched(true)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (next: string) => {
    setQuery(next)
    onChange(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (justSelectedRef.current) { justSelectedRef.current = false; return }
    if (next.trim().length < 3) {
      setResults([])
      setOpen(false)
      setSearched(false)
      return
    }
    debounceRef.current = setTimeout(() => runSearch(next.trim()), 350)
  }

  const select = (r: NominatimResult) => {
    const label = buildLabel(r.address) || r.display_name
    justSelectedRef.current = true
    setQuery(label)
    onChange(label)
    onSelectDetails?.({
      label,
      city: r.address.city || r.address.town || r.address.village || r.address.hamlet || r.address.municipality || r.address.county,
      state: r.address.state || r.address.region,
      zip: r.address.postcode,
      country: r.address.country,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
    })
    setOpen(false)
    setResults([])
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      select(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const clear = () => {
    setQuery('')
    onChange('')
    setResults([])
    setOpen(false)
    setSearched(false)
  }

  return (
    <Wrap ref={wrapRef}>
      <InputRow $error={error} $focus={focused}>
        <MapPin className="pin" size={16} />
        <Input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { setFocused(true); if (results.length) setOpen(true) }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
        />
        {loading && <Spinner size={15} />}
        {!loading && query && (
          <ClearBtn type="button" aria-label="Clear location" onClick={clear}>
            <X size={14} />
          </ClearBtn>
        )}
      </InputRow>

      {open && (
        <Dropdown role="listbox">
          {results.length > 0 ? (
            results.map((r, i) => {
              const label = buildLabel(r.address) || r.display_name
              return (
                <Item
                  key={r.place_id}
                  role="option"
                  aria-selected={i === activeIdx}
                  $active={i === activeIdx}
                  onMouseDown={(e) => { e.preventDefault(); select(r) }}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <MapPin size={14} />
                  <ItemText>
                    <span className="primary">{label}</span>
                    <span className="secondary">{r.display_name}</span>
                  </ItemText>
                </Item>
              )
            })
          ) : searched && !loading ? (
            <EmptyNote>No matches — you can type your location manually.</EmptyNote>
          ) : null}
        </Dropdown>
      )}
    </Wrap>
  )
}
