'use client'

import { Suspense } from 'react'
import styled from 'styled-components'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProfileDashboard } from '@/features/profile'
import { DashboardSkeleton } from '@/features/profile/components/shared'
import { ProfileGlobalStyle } from '@/features/profile/theme'

/**
 * /profile — the authenticated user's 7-tab profile dashboard.
 * Suspense boundary is required because ProfileDashboard reads useSearchParams
 * (active tab is mirrored to ?tab=).
 */
const Canvas = styled.div`
  min-height: 100vh;
  background: #f7f5f1;
`

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileGlobalStyle />
      <Canvas className="hn-dash">
        <Suspense fallback={<div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 16px' }}><DashboardSkeleton /></div>}>
          <ProfileDashboard />
        </Suspense>
      </Canvas>
    </ProtectedRoute>
  )
}
