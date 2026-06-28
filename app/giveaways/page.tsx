'use client'

/**
 * BU-07 Product/Service Giveaways browsing + enter (user side).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { Page, Hero, HeroTitle, HeroSubtitle, Container, Grid, Row, Select, Button, Empty, Muted, humanize } from '@/features/dashboardUI'
import GiveawayCard from '@/features/business/components/GiveawayCard'
import { useGiveawayBrowse, useEnterGiveaway } from '@/api/hooks/useBusiness'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { GIVEAWAY_TYPES, type GiveawayType } from '@/types/business'

export default function GiveawaysPage() {
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, limit: 12 })

  const { data, isLoading, isError } = useGiveawayBrowse(params)
  const enter = useEnterGiveaway()

  const update = (patch: Record<string, unknown>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  const handleEnter = async (id: string) => {
    if (!isAuthed) {
      router.push('/login')
      return
    }
    try {
      await enter.mutateAsync(id)
      toast.success("You're entered! Good luck 🍀")
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Page>
      <Hero>
        <HeroTitle>Giveaways</HeroTitle>
        <HeroSubtitle>Win products and services donated by businesses on HonestNeed.</HeroSubtitle>
      </Hero>

      <Container>
        <Row $gap={3} $wrap style={{ marginBottom: 24, justifyContent: 'flex-end' }}>
          <Select
            value={(params.type as string) ?? ''}
            onChange={(e) => update({ type: (e.target.value || undefined) as GiveawayType | undefined })}
          >
            <option value="">All types</option>
            {GIVEAWAY_TYPES.map((t) => (
              <option key={t} value={t}>
                {humanize(t)}
              </option>
            ))}
          </Select>
        </Row>

        {isLoading && <Muted>Loading giveaways…</Muted>}
        {isError && <Muted>Could not load giveaways.</Muted>}
        {data && data.giveaways.length === 0 && <Empty>No active giveaways right now. Check back soon!</Empty>}

        {data && data.giveaways.length > 0 && (
          <>
            <Grid>
              {data.giveaways.map((g) => (
                <GiveawayCard
                  key={g.id}
                  giveaway={g}
                  onEnter={handleEnter}
                  entering={enter.isPending && enter.variables === g.id}
                />
              ))}
            </Grid>

            <Row $gap={3} style={{ justifyContent: 'center', marginTop: 32 }}>
              <Button
                $variant="outline"
                disabled={(params.page as number) <= 1}
                onClick={() => setParams((p) => ({ ...p, page: (p.page as number) - 1 }))}
              >
                Previous
              </Button>
              <Muted>
                Page {data.pagination.page} of {Math.max(1, data.pagination.totalPages)}
              </Muted>
              <Button
                $variant="outline"
                disabled={(params.page as number) >= data.pagination.totalPages}
                onClick={() => setParams((p) => ({ ...p, page: (p.page as number) + 1 }))}
              >
                Next
              </Button>
            </Row>
          </>
        )}
      </Container>
    </Page>
  )
}
