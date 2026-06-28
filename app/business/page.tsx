'use client'

/**
 * BU-02 Business Directory
 * Public, filterable listing of active business profiles.
 */

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Page, Hero, HeroTitle, HeroSubtitle, Container, Grid, Row, Input, Select, Button, Empty, Muted } from '@/features/business/ui'
import BusinessCard from '@/features/business/components/BusinessCard'
import { useBusinessDirectory } from '@/api/hooks/useBusiness'
import { BUSINESS_INDUSTRIES, type BusinessIndustry, type DirectoryParams } from '@/types/business'
import { humanize } from '@/features/business/ui'

export default function BusinessDirectoryPage() {
  const [draft, setDraft] = useState('')
  const [params, setParams] = useState<DirectoryParams>({ page: 1, limit: 12 })

  const { data, isLoading, isError } = useBusinessDirectory(params)

  const update = (patch: Partial<DirectoryParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  return (
    <Page>
      <Hero>
        <HeroTitle>Business Directory</HeroTitle>
        <HeroSubtitle>Discover businesses giving back through HonestNeed.</HeroSubtitle>
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
            <Input
              placeholder="Search businesses…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Button type="submit">
              <Search size={16} /> Search
            </Button>
          </form>

          <Select
            value={params.industry ?? ''}
            onChange={(e) => update({ industry: (e.target.value || undefined) as BusinessIndustry | undefined })}
          >
            <option value="">All industries</option>
            {BUSINESS_INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {humanize(i)}
              </option>
            ))}
          </Select>

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
            <input
              type="checkbox"
              checked={!!params.verified}
              onChange={(e) => update({ verified: e.target.checked || undefined })}
            />
            Verified only
          </label>
        </Row>

        {isLoading && <Muted>Loading businesses…</Muted>}
        {isError && <Muted>Could not load the directory. Please try again.</Muted>}

        {data && data.businesses.length === 0 && (
          <Empty>No businesses match your filters yet.</Empty>
        )}

        {data && data.businesses.length > 0 && (
          <>
            <Grid>
              {data.businesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </Grid>

            <Row $gap={3} style={{ justifyContent: 'center', marginTop: 32 }}>
              <Button
                $variant="outline"
                disabled={(params.page ?? 1) <= 1}
                onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              >
                Previous
              </Button>
              <Muted>
                Page {data.pagination.page} of {Math.max(1, data.pagination.totalPages)}
              </Muted>
              <Button
                $variant="outline"
                disabled={(params.page ?? 1) >= data.pagination.totalPages}
                onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
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
