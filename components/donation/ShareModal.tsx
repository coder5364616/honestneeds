'use client'

import styled from 'styled-components'
import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { useRecordShare, useCampaignShareStats } from '@/api/hooks/useShares'
import { useQueryClient } from '@tanstack/react-query'
import { shareLimitKeys } from '@/api/hooks/useShareLimit'
import { ShareLimitNotice } from '@/components/share/ShareLimitNotice'
import { toast } from 'react-toastify'
import { tk } from '@/styles/dashboardTokens'

interface ShareModalProps {
  campaignId: string
  campaignTitle: string
  isOpen: boolean
  onClose: () => void
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 500px;
  font-family: 'DM Sans', sans-serif;
`

const SectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const SectionTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0;
  letter-spacing: -0.3px;
`

const ReferralBox = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 1rem;
  background-color: ${tk.blueLight};
  border: 1px solid ${tk.border};
  border-radius: 8px;
`

const ReferralLink = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${tk.border};
  border-radius: 6px;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  color: ${tk.heading};
  background-color: white;

  &:focus {
    outline: none;
    border-color: ${tk.blue};
    box-shadow: 0 0 0 3px rgba(26, 95, 168, 0.12);
  }
`

const CopyButton = styled.button`
  padding: 0.75rem 1.25rem;
  background-color: ${tk.blue};
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: #0D4A8C;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    padding: 0.625rem 1rem;
    font-size: 0.85rem;
  }
`

const QRCodeContainer = styled.div`
  padding: 1.5rem;
  background-color: ${tk.canvas};
  border: 2px solid ${tk.border};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`

const QRCodeImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 2px solid ${tk.border};

  @media (max-width: 640px) {
    width: 160px;
    height: 160px;
  }
`

const QRCodePlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background-color: ${tk.border};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: ${tk.muted};
  text-align: center;
  padding: 1rem;

  @media (max-width: 640px) {
    width: 160px;
    height: 160px;
  }
`

const DownloadButton = styled.button`
  padding: 0.625rem 1.25rem;
  background-color: white;
  color: ${tk.blue};
  border: 2px solid ${tk.blue};
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${tk.blueLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
`

const SocialButtonsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(3, 1fr);
  }
`

const SocialButton = styled.button<{ platform: string }>`
  aspect-ratio: 1;
  padding: 0.75rem;
  background-color: ${tk.canvas};
  border: 2px solid ${tk.border};
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: ${tk.heading};

  &:hover {
    border-color: ${tk.blue};
    background-color: ${tk.blueLight};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
`

const SocialIcon = styled.svg`
  width: 1.5rem;
  height: 1.5rem;
  fill: currentColor;

  @media (max-width: 640px) {
    width: 1.25rem;
    height: 1.25rem;
  }
`

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background-color: ${tk.blueLight};
  border-radius: 8px;
`

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`

const StatLabel = styled.span`
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: ${tk.muted};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`

const StatValue = styled.span`
  font-family: 'Syne', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
  color: ${tk.heading};
`

interface SocialShareConfig {
  id: 'facebook' | 'twitter' | 'linkedin' | 'email' | 'whatsapp' | 'link'
  label: string
  icon: (props: any) => React.ReactNode
  action: (url: string, title: string) => void
}

const socialConfigs: SocialShareConfig[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    action: (url, title) => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        '_blank',
        'width=600,height=400'
      )
    },
  },
  {
    id: 'twitter',
    label: 'Twitter',
    icon: TwitterIcon,
    action: (url, title) => {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
        '_blank',
        'width=600,height=400'
      )
    },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedInIcon,
    action: (url, title) => {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
        '_blank',
        'width=600,height=400'
      )
    },
  },
  {
    id: 'email',
    label: 'Email',
    icon: EmailIcon,
    action: (url, title) => {
      window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    },
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: WhatsAppIcon,
    action: (url, title) => {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
        '_blank'
      )
    },
  },
]

export function ShareModal({
  campaignId,
  campaignTitle,
  isOpen,
  onClose,
}: ShareModalProps) {
  const [referralUrl, setReferralUrl] = useState('')
  const [shareId, setShareId] = useState<string | null>(null)
  const { mutate: recordShare, isPending: isRecording } = useRecordShare()
  const { data: shareStats } = useCampaignShareStats(campaignId)
  const queryClient = useQueryClient()

  // Refresh the daily tip-eligibility notice after each recorded share.
  const refreshEligibility = () =>
    queryClient.invalidateQueries({ queryKey: shareLimitKeys.eligibility(campaignId) })

  // Generate referral URL when modal opens
  useEffect(() => {
    if (isOpen && !shareId) {
      // Record initial share (will get shareId + referralCode from backend)
      recordShare(
        { campaignId, channel: 'link' },
        {
          onSuccess: (data: any) => {
            setShareId(data.shareId)
            // Backend returns referralCode as "?ref=<code>". Build a full campaign
            // deep-link so the copied/shared URL renders the campaign's Open Graph
            // preview (image + title) on Facebook etc. and attributes the referral.
            const base =
              process.env.NEXT_PUBLIC_SITE_URL ||
              (typeof window !== 'undefined' ? window.location.origin : '')
            const ref = data.referralCode || ''
            setReferralUrl(`${base}/campaigns/${campaignId}${ref}`)
          },
        }
      )
    }
  }, [isOpen, shareId, campaignId, recordShare])

  const handleCopyLink = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl).then(() => {
        toast.success('Link copied to clipboard!')
      })
    }
  }

  const handleDownloadQR = () => {
    if (shareStats?.qrCodeUrl) {
      const link = document.createElement('a')
      link.href = shareStats.qrCodeUrl
      link.download = `qr-code-${campaignId}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleSocialShare = (socialConfig: SocialShareConfig) => {
    if (referralUrl) {
      // Record the share
      recordShare(
        { campaignId, channel: socialConfig.id },
        {
          onSuccess: (data: any) => {
            // Surface the daily-limit outcome (tip-eligible vs free share).
            toast[data?.rewardEligible === false ? 'info' : 'success'](
              data?.message || `Shared to ${socialConfig.label}!`
            )
            refreshEligibility()
            socialConfig.action(referralUrl, campaignTitle)
          },
        }
      )
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${campaignTitle}"`}>
      <ModalContent>
        {/* Daily tip-eligibility + "request another share" flow */}
        <ShareLimitNotice campaignId={campaignId} />

        {/* Referral Link Section */}
        <SectionContainer>
          <SectionTitle>Share Link</SectionTitle>
          <ReferralBox>
            <ReferralLink
              type="text"
              value={referralUrl || 'Generating...'}
              readOnly
              onClick={(e) => {
                const input = e.target as HTMLInputElement
                input.select()
              }}
            />
            <CopyButton onClick={handleCopyLink} disabled={!referralUrl}>
              Copy
            </CopyButton>
          </ReferralBox>
        </SectionContainer>

        {/* QR Code Section */}
        <SectionContainer>
          <SectionTitle>QR Code</SectionTitle>
          <QRCodeContainer>
            {shareStats?.qrCodeUrl ? (
              <>
                <QRCodeImage src={shareStats.qrCodeUrl} alt="QR Code" />
                <DownloadButton onClick={handleDownloadQR}>
                  Download QR Code
                </DownloadButton>
              </>
            ) : (
              <QRCodePlaceholder>Loading QR code...</QRCodePlaceholder>
            )}
          </QRCodeContainer>
        </SectionContainer>

        {/* Social Share Section */}
        <SectionContainer>
          <SectionTitle>Share On Social</SectionTitle>
          <SocialButtonsContainer>
            {socialConfigs.map(config => (
              <SocialButton
                key={config.id}
                platform={config.id}
                onClick={() => handleSocialShare(config)}
                disabled={isRecording || !referralUrl}
                title={config.label}
              >
                <SocialIcon as={config.icon} />
                <span>{config.label}</span>
              </SocialButton>
            ))}
          </SocialButtonsContainer>
        </SectionContainer>

        {/* Stats Section */}
        {shareStats && (
          <SectionContainer>
            <SectionTitle>Share Stats</SectionTitle>
            <StatsContainer>
              <StatItem>
                <StatLabel>Total Shares</StatLabel>
                <StatValue>{shareStats.totalShares}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Referrals</StatLabel>
                <StatValue>{shareStats.totalReferrals}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Conversions</StatLabel>
                <StatValue>{shareStats.totalConversions}</StatValue>
              </StatItem>
            </StatsContainer>
          </SectionContainer>
        )}
      </ModalContent>
    </Modal>
  )
}

// Social Media Icons
function FacebookIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333H16V2.169c-.585-.089-1.308-.169-2.227-.169-2.753 0-4.773 1.653-4.773 4.692V8z" />
    </svg>
  )
}

function TwitterIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7s1.1 5.2-5.2 7.4" />
    </svg>
  )
}

function LinkedInIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function EmailIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="m22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WhatsAppIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.99 1.526.996.996 0 00-.184 1.557l1.09 1.543a.99.99 0 001.537.081 5.894 5.894 0 018.34.011.99.99 0 001.534-.084l1.095-1.548a.996.996 0 00-.188-1.555 9.866 9.866 0 00-5.234-1.532z" />
    </svg>
  )
}
