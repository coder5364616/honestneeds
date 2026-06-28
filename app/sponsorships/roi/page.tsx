'use client'

/** AN-06 — Sponsor ROI Analytics (self). */

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { SponsorROI } from '@/features/analytics'
import { Page, Container } from '@/features/analytics/ui'

export default function SponsorROIPage() {
  return (
    <ProtectedRoute>
      <Page>
        <Container>
          <SponsorROI />
        </Container>
      </Page>
    </ProtectedRoute>
  )
}
