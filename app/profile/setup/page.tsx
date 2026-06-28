'use client'

import styled from 'styled-components'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { ProfileSetupWizard } from '@/features/profile'
import { ProfileGlobalStyle } from '@/features/profile/theme'

/**
 * /profile/setup — onboarding + edit wizard for the basic profile fields.
 */
const Canvas = styled.div`
  min-height: 100vh;
  background: #f7f5f1;
`

export default function ProfileSetupPage() {
  return (
    <ProtectedRoute>
      <ProfileGlobalStyle />
      <Canvas className="hn-dash">
        <ProfileSetupWizard />
      </Canvas>
    </ProtectedRoute>
  )
}
