'use client'

import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { useSubmitPrayer } from '@/api/hooks/usePrayers'
import {
  AudioRecorder,
  VideoRecorder,
  formatDuration,
  createAudioUrl,
  createVideoUrl,
  revokeAudioUrl,
  revokeVideoUrl,
} from '@/lib/mediaRecorder'
import { SPACING, TYPOGRAPHY } from '@/styles/tokens'
import { tk } from '@/styles/dashboardTokens'

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[6]};
`

const TypeSelector = styled.div`
  display: flex;
  gap: ${SPACING[2]};
`

const TypeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: ${SPACING[3]} ${SPACING[4]};
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  background: ${(props) => (props.active ? tk.amber : tk.canvasDeep)};
  color: ${(props) => (props.active ? '#fff' : tk.ink)};
  border: 1px solid ${(props) => (props.active ? tk.amber : tk.border)};
  cursor: pointer;
  font-size: ${TYPOGRAPHY.SIZE_SM};

  &:hover {
    background: ${(props) => (props.active ? tk.amberDark : tk.border)};
  }

  span {
    font-size: 1.125rem;
    margin-right: ${SPACING[1]};
  }
`

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[4]};
`

const TapSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${SPACING[4]};
  padding: ${SPACING[8]} 0;
`

const TapDescription = styled.p`
  color: ${tk.muted};
  font-size: ${TYPOGRAPHY.SIZE_SM};
  margin: 0;
`

const TapButton = styled.button`
  width: 96px;
  height: 96px;
  border-radius: 9999px;
  background: ${tk.amber};
  color: white;
  border: none;
  cursor: pointer;
  font-size: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  transform: scale(1);

  &:hover:not(:disabled) {
    background: ${tk.amberDark};
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`

const TapMessage = styled.p`
  color: ${tk.muted};
  font-size: 0.875rem;
  margin: 0;
`



const TextArea = styled.textarea`
  width: 100%;
  height: 8rem;
  padding: ${SPACING[3]};
  border: 1px solid ${tk.border};
  border-radius: 0.5rem;
  background: ${tk.white};
  color: ${tk.ink};
  font-family: inherit;
  font-size: ${TYPOGRAPHY.SIZE_SM};
  resize: none;

  &::placeholder {
    color: ${tk.muted};
  }

  &:focus {
    outline: none;
    border-color: ${tk.amber};
    box-shadow: 0 0 0 2px rgba(212, 135, 10, 0.14);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const CharCounter = styled.div`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${tk.muted};
`

const RecordingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${SPACING[4]};
`

const RecordingIndicator = styled.div`
  text-align: center;
`

const RecordingIcon = styled.div`
  font-size: 1.875rem;
  margin-bottom: ${SPACING[2]};
  animation: bounce 1s infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-0.5rem);
    }
  }
`

const RecordingDuration = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${tk.amber};
`

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING[2]};
`

const PlaybackBox = styled.div`
  background: ${tk.canvas};
  border-radius: 0.5rem;
  padding: ${SPACING[4]};
  display: flex;
  flex-direction: column;
  gap: ${SPACING[2]};
`

const PlaybackLabel = styled.p`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  color: ${tk.muted};
  margin: 0;
`

const AudioPlayer = styled.audio`
  width: 100%;
`



const VideoElement = styled.video`
  width: 100%;
  border-radius: 0.5rem;
  max-height: 300px;
  background: black;
`

const VideoPlaceholder = styled.div`
  width: 100%;
  background: ${tk.canvas};
  border-radius: 0.5rem;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
`

const RecordingTimer = styled.div`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
  animation: pulse 1s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`

const VideoPlayer = styled.video`
  width: 100%;
  border-radius: 0.25rem;
`

const PrivacySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING[3]};
  padding: ${SPACING[4]} 0;
  border-top: 1px solid ${tk.border};
`

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${SPACING[3]};
  cursor: pointer;
`

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  accent-color: ${tk.amber};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const CheckboxText = styled.span`
  font-size: ${TYPOGRAPHY.SIZE_SM};
  font-weight: 500;
  color: ${tk.ink};
`

const NameInput = styled.input`
  width: 100%;
  padding: ${SPACING[2]} ${SPACING[3]};
  border: 1px solid ${tk.border};
  border-radius: 0.5rem;
  background: ${tk.white};
  color: ${tk.ink};
  font-size: ${TYPOGRAPHY.SIZE_SM};

  &::placeholder {
    color: ${tk.muted};
  }

  &:focus {
    outline: none;
    border-color: ${tk.amber};
    box-shadow: 0 0 0 2px rgba(212, 135, 10, 0.14);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: ${SPACING[3]};
  padding-top: ${SPACING[4]};
`

const ActionButtonFull = styled.div`
  flex: 1;
`

interface PrayerModalProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
  onSubmitted?: () => void
}

type PrayerType = 'tap' | 'text' | 'voice' | 'video'

/**
 * PrayerModal Component
 * Main modal for submitting prayers with 4 types:
 * - Tap: Quick one-tap prayer
 * - Text: Written prayer
 * - Voice: Audio prayer recording
 * - Video: Video prayer recording
 */
const PrayerModal: React.FC<PrayerModalProps> = ({
  campaignId,
  isOpen,
  onClose,
}) => {
  const [prayerType, setPrayerType] = useState<PrayerType>('tap')
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [supporterName, setSupporterName] = useState('')
  const [textContent, setTextContent] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const audioRecorderRef = useRef<AudioRecorder | null>(null)
  const videoRecorderRef = useRef<VideoRecorder | null>(null)
  const videoElementRef = useRef<HTMLVideoElement>(null)

  const { mutate: submitPrayer, isPending } = useSubmitPrayer()

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) revokeAudioUrl(audioUrl)
      if (videoUrl) revokeVideoUrl(videoUrl)
    }
  }, [audioUrl, videoUrl])

  // Handle quick tap prayer
  const handleTapPrayer = async () => {
    submitPrayer({
      campaignId,
      data: {
        type: 'tap',
        is_anonymous: true,
      },
    })
  }

  // Handle text prayer submission
  const handleSubmitText = () => {
    if (!textContent.trim()) return

    submitPrayer({
      campaignId,
      data: {
        type: 'text',
        text_content: textContent,
        is_anonymous: isAnonymous,
        supporter_name: !isAnonymous ? supporterName : undefined,
      },
    })

    resetForm()
    onClose()
  }

  // Handle voice prayer start
  const handleStartVoiceRecording = async () => {
    try {
      audioRecorderRef.current = new AudioRecorder({
        onProgress: (duration) => setRecordingDuration(duration),
        onError: (error) => console.error('Recording error:', error),
      })
      await audioRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  // Handle voice prayer stop
  const handleStopVoiceRecording = async () => {
    if (!audioRecorderRef.current) return

    try {
      const blob = await audioRecorderRef.current.stop()
      setAudioBlob(blob)
      const url = createAudioUrl(blob)
      setAudioUrl(url)
      setIsRecording(false)
      setRecordingDuration(0)
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  // Handle pause/resume voice recording
  const toggleVoicePause = () => {
    if (!audioRecorderRef.current) return

    if (isPaused) {
      audioRecorderRef.current.resume()
      setIsPaused(false)
    } else {
      audioRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  // Handle voice prayer submission
  const handleSubmitVoice = () => {
    if (!audioBlob) return

    submitPrayer({
      campaignId,
      data: {
        type: 'voice',
        audio_file: new File([audioBlob], 'prayer.webm', { type: audioBlob.type }),
        is_anonymous: isAnonymous,
        supporter_name: !isAnonymous ? supporterName : undefined,
      },
    })

    resetForm()
    onClose()
  }

  // Handle video prayer start
  const handleStartVideoRecording = async () => {
    try {
      videoRecorderRef.current = new VideoRecorder({
        onProgress: (duration) => setRecordingDuration(duration),
        onError: (error) => console.error('Recording error:', error),
      })
      await videoRecorderRef.current.start(videoElementRef.current || undefined)
      setIsRecording(true)
    } catch (error) {
      console.error('Failed to start recording:', error)
    }
  }

  // Handle video prayer stop
  const handleStopVideoRecording = async () => {
    if (!videoRecorderRef.current) return

    try {
      const blob = await videoRecorderRef.current.stop(videoElementRef.current || undefined)
      setVideoBlob(blob)
      const url = createVideoUrl(blob)
      setVideoUrl(url)
      setIsRecording(false)
      setRecordingDuration(0)
    } catch (error) {
      console.error('Failed to stop recording:', error)
    }
  }

  // Handle pause/resume video recording
  const toggleVideoPause = () => {
    if (!videoRecorderRef.current) return

    if (isPaused) {
      videoRecorderRef.current.resume()
      setIsPaused(false)
    } else {
      videoRecorderRef.current.pause()
      setIsPaused(true)
    }
  }

  // Handle video prayer submission
  const handleSubmitVideo = () => {
    if (!videoBlob) return

    submitPrayer({
      campaignId,
      data: {
        type: 'video',
        video_file: new File([videoBlob], 'prayer.webm', { type: videoBlob.type }),
        is_anonymous: isAnonymous,
        supporter_name: !isAnonymous ? supporterName : undefined,
      },
    })

    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTextContent('')
    setAudioBlob(null)
    setAudioUrl(null)
    setVideoBlob(null)
    setVideoUrl(null)
    setRecordingDuration(0)
    setIsRecording(false)
    setIsPaused(false)
    setSupporterName('')
    setIsAnonymous(true)
  }

  const resetFormAndClose = () => {
    setPrayerType('tap')
    resetForm()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setTimeout(resetFormAndClose, 300)
      }}
      title="Send Your Prayer"
    >
      <Container>
        {/* Prayer Type Selector */}
        <TypeSelector>
          <TypeButton
            active={prayerType === 'tap'}
            onClick={() => setPrayerType('tap')}
            title="Quick one-tap prayer"
          >
            <span>👆</span> Tap
          </TypeButton>

          <TypeButton
            active={prayerType === 'text'}
            onClick={() => setPrayerType('text')}
            title="Write a prayer"
          >
            <span>✍️</span> Text
          </TypeButton>

          <TypeButton
            active={prayerType === 'voice'}
            onClick={() => setPrayerType('voice')}
            title="Record voice prayer"
          >
            <span>🎙️</span> Voice
          </TypeButton>

          <TypeButton
            active={prayerType === 'video'}
            onClick={() => setPrayerType('video')}
            title="Record video prayer"
          >
            <span>🎥</span> Video
          </TypeButton>
        </TypeSelector>

        {/* TAP PRAYER */}
        {prayerType === 'tap' && (
          <TapSection>
            <TapDescription>Send a quick prayer in one tap</TapDescription>
            <TapButton
              onClick={handleTapPrayer}
              disabled={isPending}
              title="Send quick prayer"
            >
              🙏
            </TapButton>
            <TapMessage>Your quick prayer will be recorded</TapMessage>
          </TapSection>
        )}

        {/* TEXT PRAYER */}
        {prayerType === 'text' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING[4] }}>
            <TextArea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Write your prayer here... (up to 2000 characters)"
              disabled={isPending}
            />
            <CharCounter>{textContent.length} / 2000</CharCounter>
          </div>
        )}

        {/* VOICE PRAYER */}
        {prayerType === 'voice' && (
          <Section>
            {!audioUrl ? (
              <RecordingSection>
                {isRecording && (
                  <RecordingIndicator>
                    <RecordingIcon>🎙️</RecordingIcon>
                    <RecordingDuration>
                      {formatDuration(recordingDuration)}
                    </RecordingDuration>
                  </RecordingIndicator>
                )}

                <ButtonGroup>
                  {!isRecording ? (
                    <Button
                      onClick={handleStartVoiceRecording}
                      disabled={isPending}
                      variant="primary"
                      style={{ display: 'flex', gap: SPACING[2], alignItems: 'center' }}
                    >
                      <span>🎙️</span>
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={toggleVoicePause}
                        variant="secondary"
                        style={{ display: 'flex', gap: SPACING[2], alignItems: 'center' }}
                      >
                        {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                      </Button>
                      <Button
                        onClick={handleStopVoiceRecording}
                        variant="primary"
                        style={{
                          display: 'flex',
                          gap: SPACING[2],
                          alignItems: 'center',
                          backgroundColor: '#dc2626',
                        }}
                      >
                        <span>⏹️</span>
                        Stop
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </RecordingSection>
            ) : (
              <Section>
                <PlaybackBox>
                  <PlaybackLabel>
                    Your prayer recorded: {formatDuration(recordingDuration)}
                  </PlaybackLabel>
                  <AudioPlayer src={audioUrl} controls />
                </PlaybackBox>
                <Button
                  onClick={() => {
                    setAudioUrl(null)
                    setAudioBlob(null)
                    setRecordingDuration(0)
                  }}
                  variant="secondary"
                  style={{ width: '100%' }}
                >
                  Re-record
                </Button>
              </Section>
            )}
          </Section>
        )}

        {/* VIDEO PRAYER */}
        {prayerType === 'video' && (
          <Section>
            {!videoUrl ? (
              <RecordingSection>
                {isRecording ? (
                  <>
                    <VideoElement
                      ref={videoElementRef}
                      autoPlay
                      muted
                      style={{ maxHeight: '300px' }}
                    />
                    <RecordingTimer>● {formatDuration(recordingDuration)}</RecordingTimer>
                  </>
                ) : (
                  <VideoPlaceholder>🎥</VideoPlaceholder>
                )}

                <ButtonGroup>
                  {!isRecording ? (
                    <Button
                      onClick={handleStartVideoRecording}
                      disabled={isPending}
                      variant="primary"
                      style={{ display: 'flex', gap: SPACING[2], alignItems: 'center' }}
                    >
                      <span>🎥</span>
                      Start Recording
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={toggleVideoPause}
                        variant="secondary"
                        style={{ display: 'flex', gap: SPACING[2], alignItems: 'center' }}
                      >
                        {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                      </Button>
                      <Button
                        onClick={handleStopVideoRecording}
                        variant="primary"
                        style={{
                          display: 'flex',
                          gap: SPACING[2],
                          alignItems: 'center',
                          backgroundColor: '#dc2626',
                        }}
                      >
                        <span>⏹️</span>
                        Stop
                      </Button>
                    </>
                  )}
                </ButtonGroup>
              </RecordingSection>
            ) : (
              <Section>
                <PlaybackBox>
                  <PlaybackLabel>
                    Your prayer recorded: {formatDuration(recordingDuration)}
                  </PlaybackLabel>
                  <VideoPlayer src={videoUrl} controls />
                </PlaybackBox>
                <Button
                  onClick={() => {
                    setVideoUrl(null)
                    setVideoBlob(null)
                    setRecordingDuration(0)
                  }}
                  variant="secondary"
                  style={{ width: '100%' }}
                >
                  Re-record
                </Button>
              </Section>
            )}
          </Section>
        )}

        {/* Privacy Settings */}
        {prayerType !== 'tap' && (
          <PrivacySection>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                disabled={isPending}
              />
              <CheckboxText>Send as anonymous</CheckboxText>
            </CheckboxLabel>

            {!isAnonymous && (
              <NameInput
                type="text"
                value={supporterName}
                onChange={(e) => setSupporterName(e.target.value)}
                placeholder="Your name (optional)"
                disabled={isPending}
              />
            )}
          </PrivacySection>
        )}

        {/* Action Buttons */}
        <ActionButtons>
          <ActionButtonFull>
            <Button
              onClick={onClose}
              variant="secondary"
              disabled={isPending}
              style={{ width: '100%' }}
            >
              Cancel
            </Button>
          </ActionButtonFull>

          <ActionButtonFull>
            {prayerType === 'tap' ? (
              <Button
                onClick={handleTapPrayer}
                variant="primary"
                disabled={isPending}
                style={{ width: '100%' }}
              >
                {isPending ? 'Sending...' : 'Send Prayer'}
              </Button>
            ) : prayerType === 'text' ? (
              <Button
                onClick={handleSubmitText}
                variant="primary"
                disabled={isPending || !textContent.trim()}
                style={{ width: '100%' }}
              >
                {isPending ? 'Sending...' : 'Send Prayer'}
              </Button>
            ) : prayerType === 'voice' ? (
              <Button
                onClick={handleSubmitVoice}
                variant="primary"
                disabled={isPending || !audioUrl}
                style={{ width: '100%' }}
              >
                {isPending ? 'Sending...' : 'Send Prayer'}
              </Button>
            ) : (
              <Button
                onClick={handleSubmitVideo}
                variant="primary"
                disabled={isPending || !videoUrl}
                style={{ width: '100%' }}
              >
                {isPending ? 'Sending...' : 'Send Prayer'}
              </Button>
            )}
          </ActionButtonFull>
        </ActionButtons>
      </Container>
    </Modal>
  )
}

export default PrayerModal
