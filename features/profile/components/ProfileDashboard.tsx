'use client'

/**
 * ProfileDashboard â€” the 7-tab profile shell.
 *
 * Tabs: Overview Â· Campaigns Â· Support Activity Â· Messages Â· Rewards Â·
 * Verification Â· Settings. The active tab is mirrored to the URL (?tab=) so it
 * is shareable, back-button friendly, and deep-linkable (e.g. nudges route to
 * ?tab=verification). Data comes from useProfileDashboard().
 */

import React, { useCallback } from 'react'
import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard, Rocket, HeartHandshake, MessageCircle, Gift, ShieldCheck, Settings as SettingsIcon, AlertCircle,
} from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import { useProfileDashboard } from '@/api/hooks/useProfile'
import { useUnreadMessageCount } from '@/api/hooks/useMessaging'
import { DashboardSkeleton } from './shared'
import ProfileHeader from './ProfileHeader'
import OverviewTab from './tabs/OverviewTab'
import CampaignsTab from './tabs/CampaignsTab'
import SupportActivityTab from './tabs/SupportActivityTab'
import MessagesTab from './tabs/MessagesTab'
import RewardsTab from './tabs/RewardsTab'
import VerificationTab from './tabs/VerificationTab'
import SettingsTab from './tabs/SettingsTab'

type TabKey =
  | 'overview' | 'campaigns' | 'support' | 'messages' | 'rewards' | 'verification' | 'settings'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
  { key: 'campaigns', label: 'Campaigns', icon: <Rocket size={17} /> },
  { key: 'support', label: 'Support Activity', icon: <HeartHandshake size={17} /> },
  { key: 'messages', label: 'Messages', icon: <MessageCircle size={17} /> },
  { key: 'rewards', label: 'Rewards', icon: <Gift size={17} /> },
  { key: 'verification', label: 'Verification', icon: <ShieldCheck size={17} /> },
  { key: 'settings', label: 'Settings', icon: <SettingsIcon size={17} /> },
]

const VERIFICATION_KEYS = ['email_verified', 'phone_verified', 'identity_verified']

export function ProfileDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data, isLoading, isError, refetch } = useProfileDashboard()
  const { data: unread = 0 } = useUnreadMessageCount()

  const rawTab = searchParams.get('tab') as TabKey | null
  const active: TabKey = TABS.some((t) => t.key === rawTab) ? (rawTab as TabKey) : 'overview'

  const setTab = useCallback(
    (tab: TabKey) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', tab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams]
  )

  const handleItemAction = useCallback(
    (key: string) => {
      // Verification items resolve on the Verification tab; all other
      // completion items (name, username, avatar, bio, location) are edited
      // in the setup wizard.
      if (VERIFICATION_KEYS.includes(key)) {
        setTab('verification')
      } else {
        router.push('/profile/setup')
      }
    },
    [setTab, router]
  )

  return (
    <Page>
      {isLoading && <DashboardSkeleton />}

      {isError && (
        <ErrorState>
          <AlertCircle size={32} color={honestNeed.colors.error} />
          <h3>We couldn&apos;t load your profile</h3>
          <RetryBtn onClick={() => refetch()}>Try again</RetryBtn>
        </ErrorState>
      )}

      {data && (
        <>
          <ProfileHeader data={data} onEdit={() => router.push('/profile/setup')} />

          <TabBar role="tablist" aria-label="Profile sections">
            {TABS.map((t) => {
              const isActive = t.key === active
              return (
                <Tab
                  key={t.key}
                  role="tab"
                  aria-selected={isActive}
                  $active={isActive}
                  onClick={() => setTab(t.key)}
                >
                  <span className="icon">{t.icon}</span>
                  <span className="label">{t.label}</span>
                  {t.key === 'messages' && unread > 0 && <Dot>{unread > 9 ? '9+' : unread}</Dot>}
                  {isActive && <Underline layoutId="profile-tab-underline" />}
                </Tab>
              )
            })}
          </TabBar>

          <AnimatePresence mode="wait">
            <Panel
              key={active}
              role="tabpanel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {active === 'overview' && (
                <OverviewTab data={data} onNavigate={(t) => setTab(t as TabKey)} onItemAction={handleItemAction} />
              )}
              {active === 'campaigns' && <CampaignsTab data={data} />}
              {active === 'support' && <SupportActivityTab data={data} />}
              {active === 'messages' && <MessagesTab />}
              {active === 'rewards' && <RewardsTab data={data} />}
              {active === 'verification' && <VerificationTab data={data} />}
              {active === 'settings' && <SettingsTab data={data} />}
            </Panel>
          </AnimatePresence>
        </>
      )}
    </Page>
  )
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 20px 16px 64px;
`
const TabBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 5px;
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 14px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`
const Tab = styled.button<{ $active: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 14px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  color: ${({ $active }) => ($active ? honestNeed.colors.primary : honestNeed.colors.mutedText)};
  transition: color 150ms ease, background 150ms ease;
  &:hover { color: ${honestNeed.colors.primary}; background: ${honestNeed.colors.primaryBg}; }
  .label { @media (max-width: 639px) { display: none; } }
  .icon { display: inline-flex; }
`
const Underline = styled(motion.span)`
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 3px;
  height: 3px;
  border-radius: 999px;
  background: ${honestNeed.gradients.sky};
`
const Dot = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: ${honestNeed.colors.love};
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
`
const Panel = styled(motion.div)`
  width: 100%;
`
const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 20px;
  text-align: center;
  h3 { margin: 0; color: ${honestNeed.colors.text}; }
`
const RetryBtn = styled.button`
  margin-top: 6px;
  padding: 9px 20px;
  border-radius: 999px;
  border: none;
  background: ${honestNeed.colors.primary};
  color: #fff;
  font-weight: 700;
  cursor: pointer;
`

export default ProfileDashboard
