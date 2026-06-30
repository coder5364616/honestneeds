'use client'

import React, { useState } from 'react'
import styled, { keyframes, css } from 'styled-components'
import {
  HandHeart, MessageSquare, Mic, Video,
  Globe, Hash, UserX, ShieldCheck,
  ChevronRight, ChevronLeft, Target, Loader2
} from 'lucide-react'

// ─── Animations ───────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`

const expandDown = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`

const spin = keyframes`
  to { transform: rotate(360deg); }
`

// ─── Shell ────────────────────────────────────────────────────────────────────

const Shell = styled.div`
  font-family: 'DM Sans', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: clip;
  animation: ${fadeUp} 0.3s ease;

  *, *::before, *::after { box-sizing: border-box; }

  @media (max-width: 480px) {
    gap: 1rem;
  }
`

// ─── Enable toggle card ───────────────────────────────────────────────────────

const EnableCard = styled.div<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem;
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid ${({ $enabled }) => $enabled ? '#9FE1CB' : '#e2e8f0'};
  box-shadow: ${({ $enabled }) => $enabled ? '0 0 0 3px rgba(29,158,117,0.08)' : 'none'};
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
  width: 100%;

  &:hover {
    border-color: #9FE1CB;
  }

  @media (max-width: 480px) {
    padding: 1rem;
    gap: 0.75rem;
  }
`

const EnableLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
  min-width: 0;
`

const EnableIconWrap = styled.div<{ $enabled: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  background: ${({ $enabled }) => $enabled ? '#E1F5EE' : '#f1f5f9'};
  color: ${({ $enabled }) => $enabled ? '#0F6E56' : '#94a3b8'};
`

const EnableText = styled.div`
  min-width: 0;
`

const EnableTitle = styled.p`
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.125rem;
  overflow-wrap: anywhere;
`

const EnableSub = styled.p`
  font-size: 0.8125rem;
  color: #64748b;
  margin: 0;
  overflow-wrap: anywhere;
`

// ─── Toggle switch ────────────────────────────────────────────────────────────

const ToggleTrack = styled.div<{ $on: boolean }>`
  width: 46px;
  height: 26px;
  border-radius: 13px;
  flex-shrink: 0;
  position: relative;
  transition: background 0.2s;
  background: ${({ $on }) => $on ? '#1D9E75' : '#e2e8f0'};
`

const ToggleThumb = styled.div<{ $on: boolean }>`
  position: absolute;
  top: 3px;
  left: ${({ $on }) => $on ? '23px' : '3px'};
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  transition: left 0.2s;
`

// ─── Section block ────────────────────────────────────────────────────────────

const SectionBlock = styled.div`
  background: #ffffff;
  border: 0.5px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  width: 100%;
  animation: ${expandDown} 0.22s ease;
`

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 1.125rem;
  border-bottom: 0.5px solid #f1f5f9;
  background: #fafbfc;

  span {
    font-family: 'Syne', system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.01em;
  }

  svg { color: #64748b; }
`

const SectionBody = styled.div`
  padding: 1rem 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;

  @media (max-width: 480px) {
    padding: 0.875rem 0.875rem;
  }
`

// ─── Text fields ──────────────────────────────────────────────────────────────

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`

const FieldLabel = styled.label`
  font-size: 0.6875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
`

const FieldInner = styled.div`
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 0.5px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;

  &:focus-within {
    border-color: #1D9E75;
    border-width: 1px;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(29,158,117,0.08);
  }
`

const StyledInput = styled.input`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0.625rem 0.75rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9375rem;
  color: #0f172a;
  outline: none;

  &::placeholder { color: #cbd5e1; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const StyledTextarea = styled.textarea`
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  padding: 0.625rem 0.75rem;
  font-family: 'DM Sans', system-ui, sans-serif;
  font-size: 0.9375rem;
  color: #0f172a;
  outline: none;
  resize: vertical;
  min-height: 80px;
  line-height: 1.6;
  width: 100%;

  &::placeholder { color: #cbd5e1; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

const FieldSuffix = styled.span`
  padding: 0 0.75rem;
  font-size: 0.8125rem;
  color: #94a3b8;
  border-left: 0.5px solid #e2e8f0;
  background: #f1f5f9;
  height: 100%;
  display: flex;
  align-items: center;
  align-self: stretch;
  white-space: nowrap;
`

const CharCount = styled.span`
  font-size: 0.6875rem;
  color: #94a3b8;
  text-align: right;
  display: block;
`

// ─── Toggle row (for checkboxes) ──────────────────────────────────────────────

const ToggleRow = styled.label<{ $disabled?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 0.5px solid #f8fafc;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};

  &:last-child { border-bottom: none; }

  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`

const ToggleRowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex: 1;
  min-width: 0;
`

const ToggleRowIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 7px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #64748b;
`

const ToggleRowText = styled.div`
  min-width: 0;
`

const ToggleRowTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 500;
  color: #0f172a;
  margin: 0;
  overflow-wrap: anywhere;
`

const ToggleRowSub = styled.p`
  font-size: 0.75rem;
  color: #94a3b8;
  margin: 0;
  margin-top: 1px;
  overflow-wrap: anywhere;
`

const HiddenCheckbox = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: 0;
  padding: 0;
  border: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
`

// ─── Submit button ────────────────────────────────────────────────────────────

const SubmitBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: #0F6E56;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  margin-top: 0.25rem;

  &:hover:not(:disabled) { background: #085041; }
  &:active:not(:disabled) { transform: scale(0.99); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #1D9E75; outline-offset: 2px; }

  svg.spin { animation: ${spin} 0.8s linear infinite; }

  @media (max-width: 480px) {
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 0.875rem;
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;

  ${SubmitBtn} { margin-top: 0; }

  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  background: #ffffff;
  color: #0F6E56;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-family: 'Syne', system-ui, sans-serif;
  font-size: 0.9375rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  white-space: nowrap;

  &:hover:not(:disabled) { background: #f3f4f6; }
  &:active:not(:disabled) { transform: scale(0.99); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
  &:focus-visible { outline: 2px solid #1D9E75; outline-offset: 2px; }

  @media (max-width: 480px) {
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 0.875rem;
  }
`

// ─── Toggle component ─────────────────────────────────────────────────────────

interface ToggleSwitchProps {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
  label: string
  sub?: string
  icon: React.ReactNode
}

function ToggleSwitch({ id, checked, onChange, disabled, label, sub, icon }: ToggleSwitchProps) {
  return (
    <ToggleRow htmlFor={id} $disabled={disabled}>
      <HiddenCheckbox
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <ToggleRowLeft>
        <ToggleRowIcon aria-hidden="true">{icon}</ToggleRowIcon>
        <ToggleRowText>
          <ToggleRowTitle>{label}</ToggleRowTitle>
          {sub && <ToggleRowSub>{sub}</ToggleRowSub>}
        </ToggleRowText>
      </ToggleRowLeft>
      <ToggleTrack $on={checked} aria-hidden="true">
        <ToggleThumb $on={checked} />
      </ToggleTrack>
    </ToggleRow>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface CampaignPrayerConfig {
  enabled?: boolean
  title?: string
  description?: string
  prayer_goal?: number
  settings?: {
    allow_text_prayers?: boolean
    allow_voice_prayers?: boolean
    allow_video_prayers?: boolean
    prayers_public?: boolean
    show_prayer_count?: boolean
    anonymous_prayers?: boolean
    require_approval?: boolean
  }
}

interface Step5Props {
  currentData?: Partial<CampaignPrayerConfig>
  onNext: (config: Partial<CampaignPrayerConfig>) => void
  onBack?: () => void
  isLoading?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

const Step5PrayerConfiguration: React.FC<Step5Props> = ({
  currentData = {},
  onNext,
  onBack,
  isLoading = false,
}) => {
  const s = currentData?.settings ?? {}

  const [enabled, setEnabled]               = useState(currentData.enabled ?? false)
  const [title, setTitle]                   = useState(currentData.title ?? 'Prayer Support')
  const [description, setDescription]       = useState(currentData.description ?? 'Join us in prayer for this campaign')
  const [prayerGoal, setPrayerGoal]         = useState(currentData.prayer_goal ?? 100)
  const [allowText, setAllowText]           = useState(s.allow_text_prayers ?? true)
  const [allowVoice, setAllowVoice]         = useState(s.allow_voice_prayers ?? true)
  const [allowVideo, setAllowVideo]         = useState(s.allow_video_prayers ?? true)
  const [isPublic, setIsPublic]             = useState(s.prayers_public ?? true)
  const [showCount, setShowCount]           = useState(s.show_prayer_count ?? true)
  const [allowAnon, setAllowAnon]           = useState(s.anonymous_prayers ?? true)
  const [requireApproval, setRequireApproval] = useState(s.require_approval ?? false)

  const handleSubmit = () => {
    onNext({
      enabled,
      title: enabled ? title : undefined,
      description: enabled ? description : undefined,
      prayer_goal: enabled ? prayerGoal : undefined,
      settings: {
        allow_text_prayers: allowText,
        allow_voice_prayers: allowVoice,
        allow_video_prayers: allowVideo,
        prayers_public: isPublic,
        show_prayer_count: showCount,
        anonymous_prayers: allowAnon,
        require_approval: requireApproval,
      },
    })
  }

  return (
    <Shell>

      {/* Enable toggle */}
      <EnableCard
        $enabled={enabled}
        onClick={() => setEnabled((v) => !v)}
        role="switch"
        aria-checked={enabled}
        tabIndex={0}
        onKeyDown={(e) => e.key === ' ' && setEnabled((v) => !v)}
      >
        <EnableLeft>
          <EnableIconWrap $enabled={enabled} aria-hidden="true">
            <HandHeart size={20} />
          </EnableIconWrap>
          <EnableText>
            <EnableTitle>Prayer Support</EnableTitle>
            <EnableSub>Let supporters send prayers for your campaign</EnableSub>
          </EnableText>
        </EnableLeft>
        <ToggleTrack $on={enabled} aria-hidden="true">
          <ToggleThumb $on={enabled} />
        </ToggleTrack>
      </EnableCard>

      {/* Expanded config */}
      {enabled && (
        <>
          {/* Basic info */}
          <SectionBlock>
            <SectionHead>
              <HandHeart size={14} />
              <span>Prayer Section Info</span>
            </SectionHead>
            <SectionBody>
              <Field>
                <FieldLabel htmlFor="prayer-title">Section Title</FieldLabel>
                <FieldInner>
                  <StyledInput
                    id="prayer-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isLoading}
                    maxLength={100}
                    placeholder="Prayer Support"
                  />
                  <FieldSuffix>{title.length}/100</FieldSuffix>
                </FieldInner>
              </Field>

              <Field>
                <FieldLabel htmlFor="prayer-desc">Description</FieldLabel>
                <FieldInner style={{ alignItems: 'flex-start' }}>
                  <StyledTextarea
                    id="prayer-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    maxLength={500}
                    placeholder="Invite your supporters to pray…"
                  />
                </FieldInner>
                <CharCount>{description.length}/500</CharCount>
              </Field>

              <Field>
                <FieldLabel htmlFor="prayer-goal">Prayer Goal</FieldLabel>
                <FieldInner>
                  <StyledInput
                    id="prayer-goal"
                    type="number"
                    value={prayerGoal}
                    onChange={(e) =>
                      setPrayerGoal(Math.max(1, Math.min(10000, parseInt(e.target.value) || 1)))
                    }
                    disabled={isLoading}
                    min={1}
                    max={10000}
                  />
                  <FieldSuffix>prayers</FieldSuffix>
                </FieldInner>
              </Field>
            </SectionBody>
          </SectionBlock>

          {/* Prayer types */}
          <SectionBlock>
            <SectionHead>
              <MessageSquare size={14} />
              <span>Allowed Prayer Types</span>
            </SectionHead>
            <SectionBody>
              <ToggleSwitch
                id="allow-text"
                checked={allowText}
                onChange={setAllowText}
                disabled={isLoading}
                label="Text Prayers"
                sub="Written messages from supporters"
                icon={<MessageSquare size={14} />}
              />
              <ToggleSwitch
                id="allow-voice"
                checked={allowVoice}
                onChange={setAllowVoice}
                disabled={isLoading}
                label="Voice Prayers"
                sub="Audio recordings from supporters"
                icon={<Mic size={14} />}
              />
              <ToggleSwitch
                id="allow-video"
                checked={allowVideo}
                onChange={setAllowVideo}
                disabled={isLoading}
                label="Video Prayers"
                sub="Video messages from supporters"
                icon={<Video size={14} />}
              />
            </SectionBody>
          </SectionBlock>

          {/* Settings */}
          <SectionBlock>
            <SectionHead>
              <ShieldCheck size={14} />
              <span>Privacy &amp; Visibility</span>
            </SectionHead>
            <SectionBody>
              <ToggleSwitch
                id="prayers-public"
                checked={isPublic}
                onChange={setIsPublic}
                disabled={isLoading}
                label="Public Prayers"
                sub="Prayers visible to all visitors"
                icon={<Globe size={14} />}
              />
              <ToggleSwitch
                id="show-count"
                checked={showCount}
                onChange={setShowCount}
                disabled={isLoading}
                label="Show Prayer Count"
                sub="Display total number of prayers received"
                icon={<Hash size={14} />}
              />
              <ToggleSwitch
                id="allow-anon"
                checked={allowAnon}
                onChange={setAllowAnon}
                disabled={isLoading}
                label="Anonymous Prayers"
                sub="Supporters can pray without showing their name"
                icon={<UserX size={14} />}
              />
              <ToggleSwitch
                id="require-approval"
                checked={requireApproval}
                onChange={setRequireApproval}
                disabled={isLoading}
                label="Require Approval"
                sub="Review prayers before they appear publicly"
                icon={<ShieldCheck size={14} />}
              />
            </SectionBody>
          </SectionBlock>
        </>
      )}

      <Actions>
        {onBack && (
          <BackBtn type="button" onClick={onBack} disabled={isLoading}>
            <ChevronLeft size={16} aria-hidden="true" />
            Back
          </BackBtn>
        )}
        <SubmitBtn type="button" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 size={16} className="spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            <>
              Continue
              <ChevronRight size={16} aria-hidden="true" />
            </>
          )}
        </SubmitBtn>
      </Actions>
    </Shell>
  )
}

export default Step5PrayerConfiguration