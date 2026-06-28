'use client'

/**
 * BU-06 Volunteer Opportunity browsing + apply (volunteer side).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Page, Hero, HeroTitle, HeroSubtitle, Container, Grid, Row, Input, Select, Button, Empty, Muted, humanize } from '@/features/business/ui'
import OpportunityCard from '@/features/business/components/OpportunityCard'
import { useOpportunityBrowse } from '@/api/hooks/useBusiness'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { OPPORTUNITY_CATEGORIES, type OpportunityCategory } from '@/types/business'

export default function OpportunitiesPage() {
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const [draft, setDraft] = useState('')
  const [params, setParams] = useState<Record<string, unknown>>({ page: 1, limit: 12 })

  const { data, isLoading, isError } = useOpportunityBrowse(params)

  const update = (patch: Record<string, unknown>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  // Route to the category-specific application form (login-gated).
  const handleApply = (id: string) => {
    router.push(isAuthed ? `/opportunities/${id}/apply` : `/login?redirect=/opportunities/${id}/apply`)
  }

  return (
    <Page>
      <Hero>
        <HeroTitle>Volunteer Opportunities</HeroTitle>
        <HeroSubtitle>Lend your time and skills to businesses making an impact.</HeroSubtitle>
      </Hero>

      <Container>
        <Row $gap={3} $wrap style={{ marginBottom: 24 }}>
          <form
            style={{ display: 'flex', gap: 8, flex: 1, minWidth: 240 }}
            onSubmit={(e) => {
              e.preventDefault()
              update({ q: draft.trim() || undefined })
            }}
          >
            <Input placeholder="Search opportunities…" value={draft} onChange={(e) => setDraft(e.target.value)} />
            <Button type="submit">
              <Search size={16} /> Search
            </Button>
          </form>

          <Select
            value={(params.category as string) ?? ''}
            onChange={(e) => update({ category: (e.target.value || undefined) as OpportunityCategory | undefined })}
          >
            <option value="">All categories</option>
            {OPPORTUNITY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {humanize(c)}
              </option>
            ))}
          </Select>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input type="checkbox" checked={!!params.is_remote} onChange={(e) => update({ is_remote: e.target.checked || undefined })} />
            Remote only
          </label>
        </Row>

        {isLoading && <Muted>Loading opportunities…</Muted>}
        {isError && <Muted>Could not load opportunities.</Muted>}
        {data && data.opportunities.length === 0 && <Empty>No open opportunities right now. Check back soon!</Empty>}

        {data && data.opportunities.length > 0 && (
          <>
            <Grid>
              {data.opportunities.map((o) => (
                <OpportunityCard key={o.id} opportunity={o} onApply={handleApply} />
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
