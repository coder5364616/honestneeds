'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs'
import {
  AIPageShell,
  CampaignWriter,
  CampaignAdvisor,
  MentorCoach,
  QuestBoard,
  TeamBuilder,
} from '@/features/ai'

/**
 * Creator AI Assistant hub.
 * Surfaces the non-campaign-specific creator AI tools (AI-01 advisor,
 * AI-02 writer, AI-10 coach, AI-07 quests, AI-08 team builder). Per-campaign
 * tools (optimizer/viral score) live at /ai/[campaignId].
 *
 * Gated by the (creator) layout ProtectedRoute (creator/admin).
 */
export default function CreatorAIPage() {
  return (
    <AIPageShell
      title="AI Assistant"
      subtitle="Smart tools to help you write, grow, and run your campaigns."
    >
      <Tabs defaultValue="writer">
        <TabsList>
          <TabsTrigger value="writer">Writer</TabsTrigger>
          <TabsTrigger value="advisor">Advisor</TabsTrigger>
          <TabsTrigger value="coach">Coach</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="team">Team Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="writer">
          <CampaignWriter />
        </TabsContent>
        <TabsContent value="advisor">
          <CampaignAdvisor />
        </TabsContent>
        <TabsContent value="coach">
          <MentorCoach />
        </TabsContent>
        <TabsContent value="quests">
          <QuestBoard />
        </TabsContent>
        <TabsContent value="team">
          <TeamBuilder />
        </TabsContent>
      </Tabs>
    </AIPageShell>
  )
}
