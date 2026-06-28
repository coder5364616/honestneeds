'use client'

/**
 * BU-01 owner profile tab.
 *
 *  - No profile yet  → the create form (onboarding).
 *  - Profile exists  → a read-only Overview of the business (banner, logo,
 *    details, stats) with an "Edit profile" button and a "View public page"
 *    link. Editing swaps in the same form; Cancel/Save returns to the overview.
 *
 * Logo/banner uploads go through the /business/upload endpoint before the
 * profile itself is persisted.
 */

import { useState, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { Upload, Pencil, ExternalLink, Globe, Mail, Phone, MapPin } from 'lucide-react'
import { Badge, humanize, statusTone, formatCents, formatDate } from '@/features/business/ui'
import {
  useCreateBusinessProfile,
  useUpdateBusinessProfile,
  useUploadBusinessAsset,
} from '@/api/hooks/useBusiness'
import { BUSINESS_INDUSTRIES, type BusinessIndustry, type OwnBusinessProfile } from '@/types/business'

// ─── Design Tokens (mirrors /dashboard) ───────────────────────────────────────

const tk = {
  ink:        '#18171A',
  inkLight:   '#242228',
  canvas:     '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border:     '#E2DDD6',
  white:      '#FFFFFF',
  muted:      '#8C8790',
  body:       '#4A4750',
  heading:    '#18171A',
  amber:      '#D4870A',
  blue:       '#1A5FA8',
}

const Card = styled.div`
  background: ${tk.white};
  border: 1px solid ${tk.border};
  border-radius: 14px;
  padding: 1.5rem;
  font-family: 'DM Sans', sans-serif;
`

const FormTitle = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${tk.heading};
  margin: 0 0 1.25rem 0;
`

const Field = styled.div`
  margin-bottom: 1rem;
`

const Label = styled.label`
  display: block;
  font-size: 0.78rem;
  font-weight: 500;
  color: ${tk.heading};
  margin-bottom: 0.375rem;
`

const fieldCss = `
  width: 100%;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.6rem 0.75rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  color: ${tk.heading};
  background: ${tk.canvas};
  outline: none;
  transition: border-color 140ms, background 140ms;
  &:focus { border-color: ${tk.amber}; background: ${tk.white}; }
`

const Input = styled.input`${fieldCss}`

const Textarea = styled.textarea`
  ${fieldCss}
  font-family: inherit;
  resize: vertical;
  min-height: 96px;
`

const Select = styled.select`
  ${fieldCss}
  cursor: pointer;
`

const Row = styled.div<{ $gap?: number; $wrap?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${(p) => (p.$gap ?? 3) * 0.25}rem;
  flex-wrap: ${(p) => (p.$wrap ? 'wrap' : 'nowrap')};
`

const Muted = styled.p`
  color: ${tk.muted};
  font-size: 0.78rem;
  margin: 0;
`

const Button = styled.button<{ $variant?: 'primary' | 'outline' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-family: 'Syne', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 140ms, border-color 140ms;
  border: 1px solid transparent;
  text-decoration: none;

  ${(p) =>
    p.$variant === 'outline'
      ? `background: ${tk.white}; color: ${tk.body}; border-color: ${tk.border};
         &:hover:not(:disabled) { background: ${tk.canvasDeep}; }`
      : `background: ${tk.ink}; color: ${tk.white};
         &:hover:not(:disabled) { background: ${tk.inkLight}; }`}

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`

// ─── Overview-only styled bits ────────────────────────────────────────────────

const Banner = styled.div<{ $src?: string }>`
  height: 160px;
  border-radius: 12px;
  margin-bottom: -44px;
  background: ${(p) =>
    p.$src ? `center / cover no-repeat url(${p.$src})` : `linear-gradient(135deg, ${tk.canvasDeep}, ${tk.border})`};
  border: 1px solid ${tk.border};
`

const Logo = styled.div<{ $src?: string }>`
  width: 88px;
  height: 88px;
  border-radius: 14px;
  border: 3px solid ${tk.white};
  background: ${(p) =>
    p.$src ? `center / cover no-repeat url(${p.$src})` : `linear-gradient(135deg, ${tk.amber}, ${tk.blue})`};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 1.75rem;
`

const HeadName = styled.h3`
  font-family: 'Syne', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: ${tk.heading};
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const Tagline = styled.p`
  color: ${tk.body};
  font-size: 0.92rem;
  margin: 4px 0 0 0;
`

const SectionLabel = styled.h4`
  font-family: 'Syne', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${tk.muted};
  margin: 1.5rem 0 0.75rem 0;
`

const Body = styled.p`
  color: ${tk.body};
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.75rem 1.5rem;
`

const Detail = styled.div`
  font-size: 0.88rem;
`

const DetailKey = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${tk.muted};
  margin-bottom: 2px;
`

const DetailVal = styled.div`
  color: ${tk.heading};
  word-break: break-word;
`

const LinkVal = styled.a`
  color: ${tk.blue};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
`

const Stat = styled.div`
  background: ${tk.canvas};
  border: 1px solid ${tk.border};
  border-radius: 10px;
  padding: 0.85rem 1rem;
`

const StatNum = styled.div`
  font-family: 'Syne', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: ${tk.heading};
`

const StatLabel = styled.div`
  font-size: 0.74rem;
  color: ${tk.muted};
  margin-top: 2px;
`

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  business_name: string
  tagline: string
  description: string
  industry: BusinessIndustry
  website_url: string
  contact_email: string
  contact_phone: string
  mission_statement: string
  logo_url: string
  banner_url: string
  city: string
  state: string
  country: string
}

function initial(profile: OwnBusinessProfile | null): FormState {
  return {
    business_name: profile?.business_name ?? '',
    tagline: profile?.tagline ?? '',
    description: profile?.description ?? '',
    industry: profile?.industry ?? 'other',
    website_url: profile?.website_url ?? '',
    contact_email: profile?.contact_email ?? '',
    contact_phone: profile?.contact_phone ?? '',
    mission_statement: profile?.mission_statement ?? '',
    logo_url: profile?.logo_url ?? '',
    banner_url: profile?.banner_url ?? '',
    city: profile?.location?.city ?? '',
    state: profile?.location?.state ?? '',
    country: profile?.location?.country ?? '',
  }
}

// ─── Overview (read-only) ─────────────────────────────────────────────────────

function Overview({ profile, onEdit }: { profile: OwnBusinessProfile; onEdit: () => void }) {
  const { location } = profile
  const place = [location?.city, location?.state, location?.country].filter(Boolean).join(', ')
  const publicHref = `/business/${profile.slug || profile.id}`
  const initialChar = profile.business_name?.trim().charAt(0).toUpperCase() || 'B'

  return (
    <Card>
      <Banner $src={profile.banner_url || undefined} />

      <Row $gap={4} style={{ alignItems: 'flex-end', padding: '0 4px' }}>
        <Logo $src={profile.logo_url || undefined}>{!profile.logo_url && initialChar}</Logo>
        <div style={{ flex: 1, paddingBottom: 6 }}>
          <HeadName>
            {profile.business_name}
            <Badge $tone={statusTone(profile.verification_status)}>{humanize(profile.verification_status)}</Badge>
          </HeadName>
          {profile.tagline && <Tagline>{profile.tagline}</Tagline>}
        </div>
      </Row>

      <Row $gap={3} $wrap style={{ marginTop: 16 }}>
        <Button $variant="outline" type="button" onClick={onEdit}>
          <Pencil size={15} /> Edit profile
        </Button>
        <Button as={Link} href={publicHref} target="_blank" rel="noopener noreferrer" $variant="outline">
          <ExternalLink size={15} /> View public page
        </Button>
      </Row>

      {profile.description && (
        <>
          <SectionLabel>About</SectionLabel>
          <Body>{profile.description}</Body>
        </>
      )}

      {profile.mission_statement && (
        <>
          <SectionLabel>Mission</SectionLabel>
          <Body>{profile.mission_statement}</Body>
        </>
      )}

      <SectionLabel>Details</SectionLabel>
      <Grid>
        <Detail>
          <DetailKey>Industry</DetailKey>
          <DetailVal>{humanize(profile.industry) || '—'}</DetailVal>
        </Detail>
        <Detail>
          <DetailKey>
            <MapPin size={12} /> Location
          </DetailKey>
          <DetailVal>{place || '—'}</DetailVal>
        </Detail>
        <Detail>
          <DetailKey>
            <Globe size={12} /> Website
          </DetailKey>
          <DetailVal>
            {profile.website_url ? (
              <LinkVal href={profile.website_url} target="_blank" rel="noopener noreferrer">
                {profile.website_url}
              </LinkVal>
            ) : (
              '—'
            )}
          </DetailVal>
        </Detail>
        <Detail>
          <DetailKey>
            <Mail size={12} /> Contact email
          </DetailKey>
          <DetailVal>{profile.contact_email || '—'}</DetailVal>
        </Detail>
        <Detail>
          <DetailKey>
            <Phone size={12} /> Contact phone
          </DetailKey>
          <DetailVal>{profile.contact_phone || '—'}</DetailVal>
        </Detail>
        <Detail>
          <DetailKey>Member since</DetailKey>
          <DetailVal>{formatDate(profile.created_at)}</DetailVal>
        </Detail>
      </Grid>

      <SectionLabel>Impact at a glance</SectionLabel>
      <StatGrid>
        <Stat>
          <StatNum>{formatCents(profile.stats?.total_sponsored_cents)}</StatNum>
          <StatLabel>Total sponsored</StatLabel>
        </Stat>
        <Stat>
          <StatNum>{profile.stats?.sponsorships_count ?? 0}</StatNum>
          <StatLabel>Sponsorships</StatLabel>
        </Stat>
        <Stat>
          <StatNum>{profile.stats?.opportunities_posted ?? 0}</StatNum>
          <StatLabel>Opportunities</StatLabel>
        </Stat>
        <Stat>
          <StatNum>{profile.stats?.giveaways_count ?? 0}</StatNum>
          <StatLabel>Giveaways</StatLabel>
        </Stat>
      </StatGrid>
    </Card>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileTab({
  profile,
  onCreated,
}: {
  profile: OwnBusinessProfile | null
  /** Called after a brand-new profile is created, so the host can advance the
   *  onboarding flow (e.g. move the user to the Verification step). */
  onCreated?: () => void
}) {
  const isEdit = !!profile
  // Existing profile → start on the overview; no profile → straight to the form.
  const [mode, setMode] = useState<'overview' | 'form'>(profile ? 'overview' : 'form')
  const [form, setForm] = useState<FormState>(initial(profile))
  const logoInput = useRef<HTMLInputElement>(null)
  const bannerInput = useRef<HTMLInputElement>(null)

  const create = useCreateBusinessProfile()
  const update = useUpdateBusinessProfile()
  const upload = useUploadBusinessAsset()
  const saving = create.isPending || update.isPending

  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }))

  if (profile && mode === 'overview') {
    return <Overview profile={profile} onEdit={() => setMode('form')} />
  }

  const handleUpload = async (file: File, target: 'logo_url' | 'banner_url') => {
    try {
      const ref = await upload.mutateAsync(file)
      set(target, ref.url)
      toast.success('Image uploaded')
    } catch {
      /* handled by api client */
    }
  }

  const cancelEdit = () => {
    setForm(initial(profile))
    setMode('overview')
  }

  const submit = async () => {
    if (form.business_name.trim().length < 2) {
      toast.error('Business name is required (min 2 characters)')
      return
    }
    const payload = {
      business_name: form.business_name.trim(),
      tagline: form.tagline,
      description: form.description,
      industry: form.industry,
      website_url: form.website_url,
      contact_email: form.contact_email,
      contact_phone: form.contact_phone,
      mission_statement: form.mission_statement,
      logo_url: form.logo_url,
      banner_url: form.banner_url,
      location: { city: form.city, state: form.state, country: form.country },
    }
    try {
      if (isEdit) {
        await update.mutateAsync(payload)
        toast.success('Profile updated')
        setMode('overview')
      } else {
        await create.mutateAsync(payload)
        toast.success('Business profile created! Next: get verified.')
        onCreated?.()
      }
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Card>
      <FormTitle>{isEdit ? 'Edit business profile' : 'Create your business profile'}</FormTitle>

      <Field>
        <Label>Business name *</Label>
        <Input value={form.business_name} onChange={(e) => set('business_name', e.target.value)} />
      </Field>

      <Field>
        <Label>Tagline</Label>
        <Input value={form.tagline} maxLength={160} onChange={(e) => set('tagline', e.target.value)} />
      </Field>

      <Field>
        <Label>Description</Label>
        <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} />
      </Field>

      <Row $gap={4} $wrap>
        <Field style={{ flex: 1, minWidth: 200 }}>
          <Label>Industry</Label>
          <Select
            value={form.industry}
            onChange={(e) => set('industry', e.target.value as BusinessIndustry)}
            style={{ width: '100%' }}
          >
            {BUSINESS_INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {humanize(i)}
              </option>
            ))}
          </Select>
        </Field>
        <Field style={{ flex: 1, minWidth: 200 }}>
          <Label>Website</Label>
          <Input value={form.website_url} onChange={(e) => set('website_url', e.target.value)} placeholder="https://" />
        </Field>
      </Row>

      <Row $gap={4} $wrap>
        <Field style={{ flex: 1, minWidth: 160 }}>
          <Label>City</Label>
          <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
        </Field>
        <Field style={{ flex: 1, minWidth: 160 }}>
          <Label>State</Label>
          <Input value={form.state} onChange={(e) => set('state', e.target.value)} />
        </Field>
        <Field style={{ flex: 1, minWidth: 160 }}>
          <Label>Country</Label>
          <Input value={form.country} onChange={(e) => set('country', e.target.value)} />
        </Field>
      </Row>

      <Row $gap={4} $wrap>
        <Field style={{ flex: 1, minWidth: 200 }}>
          <Label>Contact email</Label>
          <Input value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
        </Field>
        <Field style={{ flex: 1, minWidth: 200 }}>
          <Label>Contact phone</Label>
          <Input value={form.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} />
        </Field>
      </Row>

      <Field>
        <Label>Mission statement</Label>
        <Textarea value={form.mission_statement} onChange={(e) => set('mission_statement', e.target.value)} />
      </Field>

      <Row $gap={4} $wrap style={{ marginBottom: 16 }}>
        <div>
          <Label>Logo</Label>
          <input
            ref={logoInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'logo_url')}
          />
          <Button $variant="outline" type="button" onClick={() => logoInput.current?.click()} disabled={upload.isPending}>
            <Upload size={15} /> {form.logo_url ? 'Replace logo' : 'Upload logo'}
          </Button>
          {form.logo_url && <Muted style={{ marginTop: 6 }}>Logo set ✓</Muted>}
        </div>
        <div>
          <Label>Banner</Label>
          <input
            ref={bannerInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], 'banner_url')}
          />
          <Button $variant="outline" type="button" onClick={() => bannerInput.current?.click()} disabled={upload.isPending}>
            <Upload size={15} /> {form.banner_url ? 'Replace banner' : 'Upload banner'}
          </Button>
          {form.banner_url && <Muted style={{ marginTop: 6 }}>Banner set ✓</Muted>}
        </div>
      </Row>

      <Row $gap={3} $wrap>
        <Button onClick={submit} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create profile'}
        </Button>
        {isEdit && (
          <Button $variant="outline" type="button" onClick={cancelEdit} disabled={saving}>
            Cancel
          </Button>
        )}
      </Row>
    </Card>
  )
}
