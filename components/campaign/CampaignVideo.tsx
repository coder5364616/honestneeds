'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Video, Trash2, Edit2, Play } from 'lucide-react'
import {
  useSetCampaignVideo,
  useRemoveCampaignVideo,
} from '@/api/hooks/useCampaignEngagement'
import { CampaignVideo as CampaignVideoData } from '@/api/services/campaignEngagementService'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const CreatorActions = styled.div`
  display: flex;
  gap: 8px;
`

const MiniBtn = styled.button<{ $danger?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: ${(p) => (p.$danger ? '#ef4444' : '#4b5563')};
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover { border-color: ${(p) => (p.$danger ? '#ef4444' : '#c4622d')}; color: ${(p) => (p.$danger ? '#ef4444' : '#c4622d')}; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const Frame = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  iframe, video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  &:focus { outline: none; border-color: #c4622d; box-shadow: 0 0 0 3px rgba(196,98,45,0.12); }
`

const Hint = styled.span`
  font-size: 12px;
  color: #9ca3af;
`

const SaveBtn = styled.button`
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #c4622d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #9e4a1e; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const EmptyPrompt = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 20px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
`

interface CampaignVideoProps {
  campaignId: string
  video?: CampaignVideoData | null
  isCreator?: boolean
}

/**
 * CA-17 — Campaign Video Upload / Embed
 * Renders the campaign video (YouTube/Vimeo/Cloudinary/direct) and lets the
 * creator set or remove it by pasting a video URL.
 */
export const CampaignVideo: React.FC<CampaignVideoProps> = ({ campaignId, video, isCreator = false }) => {
  const [editing, setEditing] = useState(false)
  const [url, setUrl] = useState('')

  const setVideo = useSetCampaignVideo(campaignId)
  const removeVideo = useRemoveCampaignVideo(campaignId)

  const hasVideo = !!video?.embed_url

  // Hide entirely for non-creators when there is no video to show
  if (!hasVideo && !isCreator) return null

  const handleSave = async () => {
    if (!url.trim()) return
    await setVideo.mutateAsync({ url: url.trim() })
    setUrl('')
    setEditing(false)
  }

  const renderPlayer = () => {
    if (!video) return null
    const isFile = video.provider === 'cloudinary' || video.provider === 'other'
    return (
      <Frame>
        {isFile ? (
          <video src={video.embed_url} controls poster={video.thumbnail_url} />
        ) : (
          <iframe
            src={video.embed_url}
            title="Campaign video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </Frame>
    )
  }

  return (
    <Container>
      <Header>
        <Title>
          <Video size={20} /> Campaign Video
        </Title>
        {isCreator && hasVideo && !editing && (
          <CreatorActions>
            <MiniBtn onClick={() => setEditing(true)}>
              <Edit2 size={13} /> Replace
            </MiniBtn>
            <MiniBtn
              $danger
              onClick={() => {
                if (confirm('Remove the campaign video?')) removeVideo.mutate()
              }}
              disabled={removeVideo.isPending}
            >
              <Trash2 size={13} /> Remove
            </MiniBtn>
          </CreatorActions>
        )}
      </Header>

      {hasVideo && !editing && renderPlayer()}

      {isCreator && (editing || !hasVideo) && (
        <Form>
          <Input
            type="url"
            placeholder="Paste a YouTube, Vimeo, or video file URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Hint>Supports YouTube, Vimeo, Cloudinary and direct .mp4/.webm links.</Hint>
          <div style={{ display: 'flex', gap: 8 }}>
            <SaveBtn onClick={handleSave} disabled={!url.trim() || setVideo.isPending}>
              <Play size={14} />
              {setVideo.isPending ? 'Saving…' : 'Save Video'}
            </SaveBtn>
            {editing && hasVideo && (
              <MiniBtn onClick={() => { setEditing(false); setUrl('') }}>Cancel</MiniBtn>
            )}
          </div>
        </Form>
      )}

      {!hasVideo && !isCreator && (
        <EmptyPrompt>
          <Video size={28} />
          No video yet.
        </EmptyPrompt>
      )}
    </Container>
  )
}

export default CampaignVideo
