'use client'

import styled from 'styled-components'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { IdentityVerificationWizard } from '@/features/profile'
import { ProfileGlobalStyle } from '@/features/profile/theme'

/**
 * /verify/identity — ID+ government-ID + selfie verification wizard.
 * Top-level (outside the (app) marketing group) so it inherits only the root
 * layout: single header, no marketing footer.
 */
const Canvas = styled.div`
  min-height: 100vh;
  background: #f7f5f1;
`

export default function VerifyIdentityPage() {
  return (
    <ProtectedRoute>
      <ProfileGlobalStyle />
      <Canvas className="hn-dash">
        <IdentityVerificationWizard />
      </Canvas>
    </ProtectedRoute>
  )
}
