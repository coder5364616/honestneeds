'use client'

/** AN-05 — Business Impact Analytics. Resolves the owner's business profile. */

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useOwnBusinessProfile } from '@/api/hooks/useBusiness'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useAuthHydration } from '@/hooks/useAuthHydration'
import { BusinessImpact } from '@/features/analytics'
import { Page, Container, Empty, Spinner } from '@/features/analytics/ui'

export default function BusinessImpactPage() {
  const hydrated = useAuthHydration()
  const isAuthed = useIsAuthenticated()
  const { data: profile, isLoading } = useOwnBusinessProfile(hydrated && isAuthed)

  return (
    <ProtectedRoute>
      <Page>
        <Container>
          {isLoading && <Spinner />}
          {!isLoading && !profile && (
            <Empty>You don’t have a business profile yet. Create one to see impact analytics.</Empty>
          )}
          {profile && <BusinessImpact businessId={profile.id} />}
        </Container>
      </Page>
    </ProtectedRoute>
  )
}
