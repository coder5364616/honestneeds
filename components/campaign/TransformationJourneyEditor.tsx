'use client'

import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useCampaign } from '@/api/hooks/useCampaigns'
import { campaignEngagementService, type JourneyEntry } from '@/api/services/campaignEngagementService'
import { useToast } from '@/hooks/useToast'
import { TransformationJourney } from '@/components/campaign/TransformationJourney'

/**
 * TransformationJourneyEditor (CA-20 / G-7, creator)
 * Lets a creator build the before/after/milestone journey: add entries, upload
 * an image per entry, write a caption, reorder/remove, and save. Closes the loop
 * with the public TransformationJourney display.
 */

const Card = styled.div`
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
`
const HelpText = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 1rem;
`
const EntryRow = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr auto;
  gap: 14px;
  align-items: start;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 12px;
  @media (max-width: 620px) { grid-template-columns: 1fr; }
`
const Thumb = styled.div<{ $src?: string | null }>`
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
  background: ${({ $src }) => ($src ? `url(${$src}) center/cover no-repeat` : '#f8fafc')};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.78rem;
  text-align: center;
  overflow: hidden;
  &:hover { border-color: #6366f1; }
`
const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const Select = styled.select`
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  width: 160px;
`
const TextArea = styled.textarea`
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 0.85rem;
  min-height: 60px;
  resize: vertical;
  font-family: inherit;
`
const Remove = styled.button`
  background: #fff;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  height: fit-content;
`
const Actions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
  flex-wrap: wrap;
`
const Btn = styled.button<{ $variant?: 'primary' | 'ghost' }>`
  padding: 9px 18px;
  border-radius: 9px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
  ${({ $variant }) =>
    $variant === 'ghost'
      ? 'background:#fff;color:#4f46e5;border-color:#c7d2fe;'
      : 'background:#6366f1;color:#fff;'}
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`
const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin: 1.5rem 0 0.75rem;
`

interface LocalEntry extends JourneyEntry {
  _uploading?: boolean
}

export function TransformationJourneyEditor({ campaignId }: { campaignId: string }) {
  const { data: campaign } = useCampaign(campaignId)
  const { showToast } = useToast()
  const [entries, setEntries] = useState<LocalEntry[]>([])
  const [saving, setSaving] = useState(false)
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    const j = (campaign as any)?.transformation_journey
    if (Array.isArray(j)) setEntries(j.map((e: JourneyEntry) => ({ ...e })))
  }, [campaign])

  const update = (i: number, patch: Partial<LocalEntry>) =>
    setEntries((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))

  const addEntry = () =>
    setEntries((prev) => [...prev, { type: 'before', image_url: '', caption: '', occurred_at: new Date().toISOString() }])

  const removeEntry = (i: number) => setEntries((prev) => prev.filter((_, idx) => idx !== i))

  const handleFile = async (i: number, file: File | null) => {
    if (!file) return
    update(i, { _uploading: true })
    try {
      const url = await campaignEngagementService.uploadJourneyImage(campaignId, file)
      update(i, { image_url: url, _uploading: false })
    } catch (e: any) {
      update(i, { _uploading: false })
      showToast({ message: e?.response?.data?.message || 'Image upload failed', type: 'error' })
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const clean: JourneyEntry[] = entries
        .filter((e) => e.image_url || e.caption)
        .map(({ _uploading, ...e }) => e)
      await campaignEngagementService.updateJourney(campaignId, clean)
      showToast({ message: 'Transformation journey saved.', type: 'success' })
    } catch (e: any) {
      showToast({ message: e?.response?.data?.message || 'Failed to save journey', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <HelpText>
        Tell your campaign&apos;s story with before / after / milestone moments. Add an image and a
        short caption for each — supporters see this on your campaign page.
      </HelpText>

      {entries.map((e, i) => (
        <EntryRow key={i}>
          <div>
            <Thumb
              $src={e.image_url}
              onClick={() => fileInputs.current[i]?.click()}
              role="button"
              aria-label="Upload image"
            >
              {e._uploading ? 'Uploading…' : e.image_url ? '' : 'Click to upload'}
            </Thumb>
            <input
              ref={(el) => { fileInputs.current[i] = el }}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(ev) => handleFile(i, ev.target.files?.[0] || null)}
            />
          </div>
          <Fields>
            <Select value={e.type} onChange={(ev) => update(i, { type: ev.target.value as JourneyEntry['type'] })}>
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="milestone">Milestone</option>
            </Select>
            <TextArea
              value={e.caption || ''}
              placeholder="What does this moment show?"
              maxLength={500}
              onChange={(ev) => update(i, { caption: ev.target.value })}
            />
          </Fields>
          <Remove type="button" onClick={() => removeEntry(i)}>Remove</Remove>
        </EntryRow>
      ))}

      <Actions>
        <Btn $variant="ghost" onClick={addEntry} disabled={entries.length >= 30}>
          + Add moment
        </Btn>
        <Btn onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save journey'}
        </Btn>
      </Actions>

      {entries.some((e) => e.image_url || e.caption) && (
        <>
          <SectionTitle>Preview</SectionTitle>
          <TransformationJourney journey={entries} />
        </>
      )}
    </Card>
  )
}
