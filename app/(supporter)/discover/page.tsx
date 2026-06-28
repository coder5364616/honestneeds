'use client'

import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs'
import {
  AIPageShell,
  RecommendedCampaigns,
  DonorCauseMatches,
  VolunteerMatches,
} from '@/features/ai'

/**
 * Supporter discovery hub powered by AI matchmaking:
 *  - AI-06 personalized campaign recommendations
 *  - AI-12 donor ↔ cause matchmaking
 *  - AI-09 volunteer ↔ project matching
 */
export default function DiscoverPage() {
  return (
    <AIPageShell
      title="Discover"
      subtitle="Personalized campaigns, causes, and volunteer opportunities picked for you."
    >
      <Tabs defaultValue="foryou">
        <TabsList>
          <TabsTrigger value="foryou">For You</TabsTrigger>
          <TabsTrigger value="causes">Causes</TabsTrigger>
          <TabsTrigger value="volunteer">Volunteer</TabsTrigger>
        </TabsList>

        <TabsContent value="foryou">
          <RecommendedCampaigns />
        </TabsContent>
        <TabsContent value="causes">
          <DonorCauseMatches />
        </TabsContent>
        <TabsContent value="volunteer">
          <VolunteerMatches />
        </TabsContent>
      </Tabs>
    </AIPageShell>
  )
}
