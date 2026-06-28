'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import { Upload, X, MapPin, Map, Globe, Zap, Sparkles, Wand2, Loader2, Check, ChevronDown, Search } from 'lucide-react'
import { toast } from 'react-toastify'
import { CAMPAIGN_CATEGORY_OPTIONS, GEOGRAPHIC_SCOPES } from '@/utils/validationSchemas'
import { useDraftCampaign } from '@/api/hooks/useAI'
import { LocationAutocomplete } from '@/components/campaign/LocationAutocomplete'

// ── Tokens ────────────────────────────────────────────────────────────────────
const t = {
  indigo: '#4F46E5', indigoLight: '#EEF2FF', indigoMid: '#818CF8', indigoDark: '#4338CA',
  slate900: '#0F172A', slate700: '#334155', slate600: '#475569',
  slate400: '#94A3B8', slate200: '#E2E8F0', slate100: '#F1F5F9', slate50: '#F8FAFC',
  white: '#fff', red: '#EF4444', amber: '#D97706',
  r: '12px', rs: '8px', tr: '0.18s cubic-bezier(.4,0,.2,1)',
}

const fadeUp = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}`

// ── Layout ────────────────────────────────────────────────────────────────────
const FormStack = styled.div`display:flex;flex-direction:column;gap:1.25rem`
const FormRow = styled.div`
  display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.25rem;
  @media(max-width:560px){grid-template-columns:1fr}
`

// ── Section blocks ────────────────────────────────────────────────────────────
const SectionBlock = styled.div`
  background:${t.white};border:1.5px solid ${t.slate200};
  border-radius:${t.r};padding:1.5rem;
  /* No fill-mode: the keyframe's translateY(0) must NOT linger, or the
     retained transform creates a stacking context that traps the category
     dropdown's z-index and lets later sections paint over it. */
  animation:${fadeUp} 0.3s ease;
`
const BlockTitle = styled.h3`
  font-family:'Syne',sans-serif;font-size:0.95rem;font-weight:700;
  color:${t.slate900};margin:0 0 1rem;letter-spacing:-0.01em;
`

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = styled.div`display:flex;flex-direction:column;gap:0.4rem`
const FieldLabel = styled.label`
  font-size:0.8rem;font-weight:500;color:${t.slate700};
  display:flex;align-items:center;gap:4px;
  span.req{color:${t.red}}
`
const FieldHint = styled.span`font-size:0.75rem;color:${t.slate400}`
const FieldError = styled.div`font-size:0.75rem;color:${t.red}`
const CharCount = styled.span<{ $warn: boolean }>`
  font-size:0.72rem;
  color:${({ $warn }) => ($warn ? t.amber : t.slate400)};
  text-align:right;
`
const inputBase = css<{ $error?: boolean }>`
  width:100%;padding:10px 12px;
  border:1.5px solid ${({ $error }) => ($error ? t.red : t.slate200)};
  border-radius:${t.rs};font-family:inherit;font-size:0.875rem;
  color:${t.slate900};background:${t.white};outline:none;
  transition:border-color ${t.tr},box-shadow ${t.tr};
  &:focus{border-color:${t.indigo};box-shadow:0 0 0 3px rgba(79,70,229,.12)}
`
const Input = styled.input<{ $error?: boolean }>`${inputBase}`
const Textarea = styled.textarea<{ $error?: boolean }>`
  ${inputBase};resize:vertical;line-height:1.6;
`
const Select = styled.select<{ $error?: boolean }>`
  ${inputBase};
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center;padding-right:36px;
`

// ── Searchable category combobox ───────────────────────────────────────────────
const Combo = styled.div`position:relative`
const ComboBtn = styled.button<{ $error?: boolean; $placeholder?: boolean }>`
  ${inputBase};
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  text-align:left;cursor:pointer;
  color:${({ $placeholder }) => ($placeholder ? t.slate400 : t.slate900)};
`
const ComboPanel = styled.div`
  position:absolute;z-index:40;top:calc(100% + 4px);left:0;right:0;
  background:${t.white};border:1.5px solid ${t.slate200};border-radius:${t.rs};
  box-shadow:0 10px 30px rgba(15,23,42,.14);overflow:hidden;
  animation:${fadeUp} 0.15s ease both;
`
const ComboSearchWrap = styled.div`
  display:flex;align-items:center;gap:8px;padding:9px 11px;border-bottom:1px solid ${t.slate100};
  svg{color:${t.slate400};flex-shrink:0}
`
const ComboSearch = styled.input`
  border:none;outline:none;width:100%;font-family:inherit;font-size:0.85rem;
  color:${t.slate900};background:transparent;
  &::placeholder{color:${t.slate400}}
`
const ComboList = styled.ul`
  list-style:none;margin:0;padding:4px;max-height:240px;overflow-y:auto;
`
const ComboOption = styled.li<{ $sel?: boolean }>`
  padding:9px 10px;border-radius:6px;cursor:pointer;font-size:0.85rem;
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  color:${({ $sel }) => ($sel ? t.indigoDark : t.slate700)};
  background:${({ $sel }) => ($sel ? t.indigoLight : 'transparent')};
  font-weight:${({ $sel }) => ($sel ? 600 : 400)};
  transition:background ${t.tr};
  &:hover{background:${t.indigoLight};color:${t.indigoDark}}
`
const ComboEmpty = styled.li`
  padding:14px 10px;font-size:0.82rem;color:${t.slate400};text-align:center;
`

const CategorySelect: React.FC<{
  value: string
  error?: boolean
  onChange: (id: string) => void
}> = ({ value, error, onChange }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selected = CAMPAIGN_CATEGORY_OPTIONS.find((c) => c.id === value)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return CAMPAIGN_CATEGORY_OPTIONS
    return CAMPAIGN_CATEGORY_OPTIONS.filter((c) => c.name.toLowerCase().includes(q))
  }, [query])

  // Close when clicking outside the combobox.
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  // Reset the query and focus the search box each time the panel opens.
  useEffect(() => {
    if (!open) return
    setQuery('')
    const raf = requestAnimationFrame(() => searchRef.current?.focus())
    return () => cancelAnimationFrame(raf)
  }, [open])

  const handleSelect = (id: string) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <Combo ref={wrapRef}>
      <ComboBtn
        type="button" id="cat" $error={error} $placeholder={!selected}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox" aria-expanded={open} aria-invalid={error}
      >
        {selected ? selected.name : 'Select a category…'}
        <ChevronDown size={16} style={{ flexShrink: 0, color: t.slate400 }} />
      </ComboBtn>

      {open && (
        <ComboPanel>
          <ComboSearchWrap>
            <Search size={15} />
            <ComboSearch
              ref={searchRef} type="text" value={query}
              placeholder="Search categories…"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
            />
          </ComboSearchWrap>
          <ComboList role="listbox" aria-label="Category">
            {filtered.length === 0 ? (
              <ComboEmpty>No categories match “{query}”.</ComboEmpty>
            ) : (
              filtered.map((c) => (
                <ComboOption
                  key={c.id} role="option" $sel={c.id === value}
                  aria-selected={c.id === value}
                  onClick={() => handleSelect(c.id)}
                >
                  {c.name}
                  {c.id === value && <Check size={14} style={{ color: t.indigo, flexShrink: 0 }} />}
                </ComboOption>
              ))
            )}
          </ComboList>
        </ComboPanel>
      )}
    </Combo>
  )
}

// ── AI Campaign Writer ──────────────────────────────────────────────────────
const spin = keyframes`to{transform:rotate(360deg)}`

const AiBar = styled.div`
  display:flex;align-items:center;justify-content:space-between;gap:0.75rem;
  flex-wrap:wrap;margin-bottom:1rem;
`
const AiPitch = styled.p`
  font-size:0.78rem;color:${t.slate600};margin:0;line-height:1.45;
  display:flex;align-items:center;gap:6px;
  svg{color:${t.indigo};flex-shrink:0}
`
const AiToggleBtn = styled.button<{ $open?: boolean }>`
  display:inline-flex;align-items:center;gap:6px;flex-shrink:0;
  padding:8px 14px;border-radius:${t.rs};cursor:pointer;
  font-family:'Syne',sans-serif;font-size:0.8rem;font-weight:700;
  border:1.5px solid ${t.indigo};transition:all ${t.tr};
  background:${({ $open }) => ($open ? t.white : t.indigo)};
  color:${({ $open }) => ($open ? t.indigo : t.white)};
  &:hover{background:${({ $open }) => ($open ? t.indigoLight : t.indigoDark)}}
  &:focus-visible{box-shadow:0 0 0 3px rgba(79,70,229,.3)}
`
const AiPanel = styled.div`
  border:1.5px solid ${t.indigoMid};background:${t.indigoLight};
  border-radius:${t.r};padding:1.25rem;margin-bottom:1.25rem;
  animation:${fadeUp} 0.25s ease both;
  display:flex;flex-direction:column;gap:0.85rem;
`
const AiRow = styled.div`
  display:flex;gap:0.75rem;align-items:flex-end;flex-wrap:wrap;
`
const AiToneWrap = styled.div`display:flex;flex-direction:column;gap:0.35rem;min-width:140px`
const AiGenerateBtn = styled.button`
  display:inline-flex;align-items:center;gap:7px;
  padding:10px 18px;border:none;border-radius:${t.rs};
  background:${t.indigo};color:white;cursor:pointer;
  font-family:'Syne',sans-serif;font-size:0.83rem;font-weight:700;
  transition:all ${t.tr};white-space:nowrap;
  &:hover:not(:disabled){background:${t.indigoDark}}
  &:disabled{opacity:.55;cursor:not-allowed}
  svg.spin{animation:${spin} 0.8s linear infinite}
`
const AiResult = styled.div`
  display:flex;flex-direction:column;gap:0.85rem;
  border-top:1px dashed ${t.indigoMid};padding-top:0.85rem;
`
const AiResultLabel = styled.p`
  font-size:0.72rem;font-weight:700;letter-spacing:0.03em;text-transform:uppercase;
  color:${t.indigoDark};margin:0 0 0.4rem;
`
const TitleChips = styled.div`display:flex;flex-direction:column;gap:6px`
const TitleChip = styled.button`
  display:flex;align-items:center;justify-content:space-between;gap:10px;text-align:left;
  padding:9px 12px;border-radius:${t.rs};cursor:pointer;
  border:1.5px solid ${t.slate200};background:${t.white};
  font-family:inherit;font-size:0.83rem;color:${t.slate700};line-height:1.35;
  transition:all ${t.tr};
  &:hover{border-color:${t.indigo};background:${t.indigoLight};color:${t.indigoDark}}
  span.apply{display:inline-flex;align-items:center;gap:3px;font-size:0.72rem;font-weight:700;color:${t.indigo};flex-shrink:0}
`
const DescPreview = styled.div`
  background:${t.white};border:1.5px solid ${t.slate200};border-radius:${t.rs};
  padding:12px;font-size:0.82rem;line-height:1.55;color:${t.slate700};
  white-space:pre-wrap;max-height:180px;overflow-y:auto;
`
const ApplyDescBtn = styled.button`
  align-self:flex-start;display:inline-flex;align-items:center;gap:6px;margin-top:0.5rem;
  padding:8px 14px;border-radius:${t.rs};cursor:pointer;
  border:1.5px solid ${t.indigo};background:${t.white};color:${t.indigo};
  font-family:'Syne',sans-serif;font-size:0.8rem;font-weight:700;transition:all ${t.tr};
  &:hover{background:${t.indigoLight}}
`
const InlineSuggestBtn = styled.button`
  display:inline-flex;align-items:center;gap:4px;background:none;border:none;cursor:pointer;
  font-size:0.75rem;font-weight:600;color:${t.indigo};padding:0;transition:opacity ${t.tr};
  &:hover{opacity:.75}
  &:disabled{opacity:.5;cursor:not-allowed}
  svg.spin{animation:${spin} 0.8s linear infinite}
`

// ── Drop zone ─────────────────────────────────────────────────────────────────
const DropZone = styled.div<{ $active: boolean }>`
  border:2px dashed ${({ $active }) => ($active ? t.indigo : t.slate200)};
  border-radius:${t.r};padding:2rem 1.5rem;text-align:center;cursor:pointer;
  background:${({ $active }) => ($active ? t.indigoLight : t.slate50)};
  display:flex;flex-direction:column;align-items:center;gap:0.75rem;
  transition:all ${t.tr};
  &:hover{border-color:${t.indigo};background:${t.indigoLight}}
`
const DropZoneIcon = styled.div`
  width:44px;height:44px;border-radius:10px;
  background:${t.slate100};color:${t.slate400};
  display:flex;align-items:center;justify-content:center;
`
const DropZoneTitle = styled.p`font-weight:500;color:${t.slate700};font-size:0.875rem;margin:0`
const DropZoneSub = styled.p`font-size:0.775rem;color:${t.slate400};margin:0`
const ImagePreviewWrap = styled.div`
  position:relative;max-width:280px;border-radius:${t.rs};overflow:hidden;margin-top:0.75rem;
`
const ImagePreviewImg = styled.img`width:100%;display:block;max-height:200px;object-fit:cover`
const RemoveBtn = styled.button`
  position:absolute;top:6px;right:6px;
  background:rgba(0,0,0,.55);border:none;border-radius:6px;
  color:white;padding:5px 7px;cursor:pointer;
  display:flex;align-items:center;
  &:hover{background:rgba(0,0,0,.75)}
  &:focus-visible{outline:2px solid white;outline-offset:2px}
`

// ── Scope ─────────────────────────────────────────────────────────────────────
const ScopeGrid = styled.div`
  display:grid;grid-template-columns:repeat(4,1fr);gap:8px;
  @media(max-width:500px){grid-template-columns:repeat(2,1fr)}
`
const ScopeBtn = styled.button<{ $sel: boolean }>`
  padding:12px 8px;border-radius:${t.rs};cursor:pointer;
  display:flex;flex-direction:column;align-items:center;gap:6px;
  font-family:inherit;font-size:0.775rem;font-weight:500;text-align:center;line-height:1.3;
  border:1.5px solid ${({ $sel }) => ($sel ? t.indigo : t.slate200)};
  background:${({ $sel }) => ($sel ? t.indigoLight : t.white)};
  color:${({ $sel }) => ($sel ? t.indigo : t.slate600)};
  transition:all ${t.tr};
  &:hover{border-color:${t.indigoMid};background:${t.indigoLight};color:${t.indigo}}
  &:focus-visible{box-shadow:0 0 0 3px rgba(79,70,229,.25)}
`
const ScopeLabel = styled.span`font-weight:700;font-size:0.8rem`
const ScopeSub = styled.span<{ $sel: boolean }>`
  font-size:0.7rem;line-height:1.2;
  color:${({ $sel }) => ($sel ? t.indigoMid : t.slate400)};
`

// ── CTA ───────────────────────────────────────────────────────────────────────
const CtaRow = styled.div`display:flex;justify-content:flex-end;gap:10px;margin-top:1.5rem`
const BtnSecondary = styled.button`
  padding:10px 20px;border:1.5px solid ${t.slate200};border-radius:${t.rs};
  background:${t.white};font-family:inherit;font-size:0.875rem;font-weight:500;
  color:${t.slate700};cursor:pointer;transition:all ${t.tr};
  &:hover{border-color:${t.slate400}}
`
const BtnPrimary = styled.button`
  padding:10px 22px;border:none;border-radius:${t.rs};
  background:${t.indigo};font-family:'Syne',sans-serif;font-size:0.875rem;
  font-weight:700;color:white;cursor:pointer;
  display:flex;align-items:center;gap:6px;transition:all ${t.tr};
  &:hover{background:${t.indigoDark}}
  &:focus-visible{box-shadow:0 0 0 3px rgba(79,70,229,.35)}
`

// ── Component ─────────────────────────────────────────────────────────────────
const SCOPE_ICONS: Record<string, React.ReactNode> = {
  local: <MapPin size={18} />,
  regional: <Map size={18} />,
  national: <Globe size={18} />,
  global: <Zap size={18} />,
}

interface Step2BasicInfoProps {
  formData: {
    title: string
    description: string
    category: string
    location: string
    geographicScope: string | null
    scopeDescription: string
    imagePreview: string | null
  }
  errors: Record<string, string>
  onChange: (field: string, value: any) => void
  onImageSelect: (file: File | null, preview: string | null) => void
  onBack?: () => void
  onNext?: () => void
}

export const Step2BasicInfo: React.FC<Step2BasicInfoProps> = ({
  formData, errors, onChange, onImageSelect, onBack, onNext,
}) => {
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── AI Campaign Writer state ──────────────────────────────────────────────
  const draftCampaign = useDraftCampaign()
  const [aiOpen, setAiOpen] = useState(false)
  const [brief, setBrief] = useState('')
  const [tone, setTone] = useState('hopeful')
  const [titleOptions, setTitleOptions] = useState<string[]>([])
  const [draftDescription, setDraftDescription] = useState<string | null>(null)
  const [suggesting, setSuggesting] = useState(false)

  // Generate a full draft (title options + description) from the brief.
  const handleGenerateDraft = useCallback(async () => {
    if (brief.trim().length < 10) {
      toast.info('Add a sentence or two about your situation first.')
      return
    }
    try {
      const result = await draftCampaign.mutateAsync({
        brief: brief.trim(),
        need_type: formData.category || undefined,
        tone,
      })
      setTitleOptions(result.title_options || [])
      setDraftDescription(result.description || null)
      if (result.ai_unavailable) {
        toast.info('AI is offline right now — showing a basic draft from your brief.')
      }
    } catch {
      toast.error('Could not generate a draft. Please try again.')
    }
  }, [brief, tone, formData.category, draftCampaign])

  // "Suggest title" when the title is blank — seeds the brief from the description.
  const handleSuggestTitle = useCallback(async () => {
    const seed = formData.description.trim() || brief.trim()
    if (seed.length < 10) {
      toast.info('Write a short description first, then AI can suggest titles.')
      return
    }
    setSuggesting(true)
    try {
      const result = await draftCampaign.mutateAsync({
        brief: seed,
        need_type: formData.category || undefined,
        tone,
      })
      setTitleOptions(result.title_options || [])
      if (!result.title_options?.length) toast.info('No title suggestions came back — try again.')
    } catch {
      toast.error('Could not suggest a title. Please try again.')
    } finally {
      setSuggesting(false)
    }
  }, [formData.description, formData.category, brief, tone, draftCampaign])

  const applyTitle = useCallback((title: string) => {
    onChange('title', title)
    setTitleOptions([])
    toast.success('Title applied.')
  }, [onChange])

  const applyDescription = useCallback(() => {
    if (draftDescription) {
      onChange('description', draftDescription)
      toast.success('Description applied — feel free to edit it.')
    }
  }, [draftDescription, onChange])

  const isGenerating = draftCampaign.isPending && !suggesting

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024 || !['image/jpeg','image/png','image/webp'].includes(file.type)) return
    const reader = new FileReader()
    reader.onload = (e) => onImageSelect(file, e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation()
    setIsDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false)
    const f = e.dataTransfer.files[0]; if (f) processFile(f)
  }, [])

  const titleLen = formData.title.length
  const descLen = formData.description.length
  const scopeLen = formData.scopeDescription.length

  return (
    <FormStack>
      {/* Core details */}
      <SectionBlock>
        <BlockTitle>Core details</BlockTitle>

        {/* AI Campaign Writer */}
        <AiBar>
          <AiPitch>
            <Sparkles size={15} />
            Not sure where to start? Let AI draft your title and story.
          </AiPitch>
          <AiToggleBtn
            type="button" $open={aiOpen}
            onClick={() => setAiOpen((o) => !o)}
            aria-expanded={aiOpen}
          >
            <Wand2 size={15} />
            {aiOpen ? 'Hide AI Writer' : 'Write with AI'}
          </AiToggleBtn>
        </AiBar>

        {aiOpen && (
          <AiPanel>
            <Field>
              <FieldLabel htmlFor="ai-brief">Describe your situation</FieldLabel>
              <Textarea
                id="ai-brief" rows={3} maxLength={4000}
                value={brief}
                placeholder="E.g. 'My family lost our home in a fire last week and we need help covering a deposit and basics while we get back on our feet.'"
                onChange={(e) => setBrief(e.target.value)}
              />
              <FieldHint>A sentence or two is enough — AI writes the rest in your voice.</FieldHint>
            </Field>

            <AiRow>
              <AiToneWrap>
                <FieldLabel htmlFor="ai-tone">Tone</FieldLabel>
                <Select
                  id="ai-tone" value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="hopeful">Hopeful</option>
                  <option value="urgent">Urgent</option>
                  <option value="grateful">Grateful</option>
                  <option value="heartfelt">Heartfelt</option>
                  <option value="determined">Determined</option>
                </Select>
              </AiToneWrap>
              <AiGenerateBtn
                type="button"
                onClick={handleGenerateDraft}
                disabled={isGenerating || brief.trim().length < 10}
              >
                {isGenerating
                  ? <><Loader2 size={15} className="spin" /> Generating…</>
                  : <><Sparkles size={15} /> Generate draft</>}
              </AiGenerateBtn>
            </AiRow>

            {(titleOptions.length > 0 || draftDescription) && (
              <AiResult>
                {titleOptions.length > 0 && (
                  <div>
                    <AiResultLabel>Suggested titles — click to use</AiResultLabel>
                    <TitleChips>
                      {titleOptions.map((opt, i) => (
                        <TitleChip key={i} type="button" onClick={() => applyTitle(opt)}>
                          {opt}
                          <span className="apply"><Check size={12} /> Use</span>
                        </TitleChip>
                      ))}
                    </TitleChips>
                  </div>
                )}
                {draftDescription && (
                  <div>
                    <AiResultLabel>Suggested story</AiResultLabel>
                    <DescPreview>{draftDescription}</DescPreview>
                    <ApplyDescBtn type="button" onClick={applyDescription}>
                      <Check size={14} /> Use this description
                    </ApplyDescBtn>
                  </div>
                )}
              </AiResult>
            )}
          </AiPanel>
        )}

        <FormStack>
          <Field>
            <FieldLabel htmlFor="title">
              Campaign title <span className="req">*</span>
              {!formData.title.trim() && (
                <InlineSuggestBtn
                  type="button"
                  onClick={handleSuggestTitle}
                  disabled={suggesting}
                  style={{ marginLeft: 'auto' }}
                >
                  {suggesting
                    ? <><Loader2 size={12} className="spin" /> Suggesting…</>
                    : <><Sparkles size={12} /> Suggest title</>}
                </InlineSuggestBtn>
              )}
            </FieldLabel>
            <Input
              id="title" type="text" maxLength={200}
              value={formData.title} $error={!!errors.title}
              placeholder="Give your campaign a compelling title…"
              onChange={(e) => onChange('title', e.target.value)}
              aria-invalid={!!errors.title}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <FieldHint>Make it clear, specific, and emotive</FieldHint>
              <CharCount $warn={titleLen > 170}>{titleLen}/200</CharCount>
            </div>
            {errors.title && <FieldError>{errors.title}</FieldError>}

            {/* Inline title suggestions (when the AI Writer panel is collapsed) */}
            {!aiOpen && titleOptions.length > 0 && (
              <div style={{ marginTop: '0.5rem' }}>
                <AiResultLabel>AI title suggestions — click to use</AiResultLabel>
                <TitleChips>
                  {titleOptions.map((opt, i) => (
                    <TitleChip key={i} type="button" onClick={() => applyTitle(opt)}>
                      {opt}
                      <span className="apply"><Check size={12} /> Use</span>
                    </TitleChip>
                  ))}
                </TitleChips>
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel htmlFor="description">Description <span className="req">*</span></FieldLabel>
            <Textarea
              id="description" rows={7} maxLength={5000}
              value={formData.description} $error={!!errors.description}
              placeholder="Tell your story. What is this campaign about and why do you need support?…"
              onChange={(e) => onChange('description', e.target.value)}
              aria-invalid={!!errors.description}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <FieldHint>Be personal — donors connect with stories, not stats</FieldHint>
              <CharCount $warn={descLen > 4800}>{descLen}/5000</CharCount>
            </div>
            {errors.description && <FieldError>{errors.description}</FieldError>}
          </Field>
        </FormStack>
      </SectionBlock>

      {/* Category & location */}
      <SectionBlock>
        <BlockTitle>Category & location</BlockTitle>
        <FormRow>
          <Field>
            <FieldLabel htmlFor="cat">Category <span className="req">*</span></FieldLabel>
            <CategorySelect
              value={formData.category}
              error={!!errors.category}
              onChange={(id) => onChange('category', id)}
            />
            {errors.category && <FieldError>{errors.category}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="location">
              Location <span style={{ fontWeight: 300, color: t.slate400 }}>(optional)</span>
            </FieldLabel>
            <LocationAutocomplete
              id="location"
              value={formData.location}
              error={!!errors.location}
              placeholder="City, State, Zip or Country"
              onChange={(val) => onChange('location', val)}
            />
            <FieldHint>Start typing to search — helps local supporters find you</FieldHint>
            {errors.location && <FieldError>{errors.location}</FieldError>}
          </Field>
        </FormRow>
      </SectionBlock>

      {/* Geographic scope */}
      <SectionBlock>
        <BlockTitle>Geographic reach</BlockTitle>
        <ScopeGrid role="radiogroup" aria-label="Geographic scope">
          {GEOGRAPHIC_SCOPES.map((scope) => (
            <ScopeBtn
              key={scope.id} type="button"
              $sel={formData.geographicScope === scope.id}
              onClick={() => onChange('geographicScope', scope.id)}
              aria-pressed={formData.geographicScope === scope.id}
            >
              {SCOPE_ICONS[scope.id]}
              <ScopeLabel>{scope.label}</ScopeLabel>
              <ScopeSub $sel={formData.geographicScope === scope.id}>
                {scope.description}
              </ScopeSub>
            </ScopeBtn>
          ))}
        </ScopeGrid>

        <Field style={{ marginTop: '1rem' }}>
          <FieldLabel htmlFor="scope-desc">
            Scope details <span style={{ fontWeight: 300, color: t.slate400 }}>(optional)</span>
          </FieldLabel>
          <Textarea
            id="scope-desc" rows={2} maxLength={200}
            value={formData.scopeDescription}
            disabled={!formData.geographicScope}
            placeholder="E.g. 'Serving downtown Chicago and neighboring suburbs'"
            onChange={(e) => onChange('scopeDescription', e.target.value)}
            style={{ opacity: formData.geographicScope ? 1 : 0.5 }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <CharCount $warn={scopeLen > 180}>{scopeLen}/200</CharCount>
          </div>
          {errors.scopeDescription && <FieldError>{errors.scopeDescription}</FieldError>}
        </Field>
      </SectionBlock>

      {/* Image upload */}
      <SectionBlock>
        <BlockTitle>
          Campaign image{' '}
          <span style={{ fontWeight: 300, color: t.slate400, fontSize: '0.8rem' }}>(optional)</span>
        </BlockTitle>

        {!formData.imagePreview ? (
          <DropZone
            $active={isDragActive}
            onDragEnter={handleDrag} onDragLeave={handleDrag}
            onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button" tabIndex={0} aria-label="Upload campaign image"
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <DropZoneIcon><Upload size={20} /></DropZoneIcon>
            <div>
              <DropZoneTitle>Drag & drop your image here</DropZoneTitle>
              <DropZoneSub>or click to browse — max 10MB, JPEG / PNG / WebP</DropZoneSub>
            </div>
            <input
              ref={fileInputRef} type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f) }}
              aria-label="Upload campaign image"
            />
          </DropZone>
        ) : (
          <ImagePreviewWrap>
            <ImagePreviewImg src={formData.imagePreview} alt="Campaign preview" />
            <RemoveBtn
              type="button" aria-label="Remove image"
              onClick={() => { onImageSelect(null, null); if (fileInputRef.current) fileInputRef.current.value = '' }}
            >
              <X size={14} />
            </RemoveBtn>
          </ImagePreviewWrap>
        )}
      </SectionBlock>
    </FormStack>
  )
}