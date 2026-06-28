'use client'

/**
 * BU-06 Volunteer application form (volunteer side).
 *
 * The form is built dynamically from the opportunity's category via
 * getApplicationForm(): common fields + category-specific questions. On submit,
 * the reserved keys (contact_email/phone, message, relevant_skills) map onto the
 * VolunteerApplication columns and everything else is sent as
 * `application_answers` so the business owner sees exactly what they asked for.
 */

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { ArrowLeft, Send } from 'lucide-react'
import {
  Page,
  Container,
  Card,
  Field,
  Label,
  Input,
  Textarea,
  Select,
  Button,
  Muted,
  Empty,
  Badge,
  humanize,
} from '@/features/business/ui'
import { useOpportunity, useApplyToOpportunity } from '@/api/hooks/useBusiness'
import { useIsAuthenticated, useCurrentUser } from '@/hooks/useAuth'
import { getApplicationForm, isStandardKey, type FormField } from '@/features/business/applicationForms'
import type { ApplicationAnswer, ApplicationPayload } from '@/types/business'

type FieldValue = string | boolean

export default function OpportunityApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isAuthed = useIsAuthenticated()
  const user = useCurrentUser() as { email?: string; display_name?: string; name?: string } | null

  const { data: opportunity, isLoading, isError } = useOpportunity(id)
  const apply = useApplyToOpportunity()

  const fields = useMemo(() => getApplicationForm(opportunity?.category), [opportunity?.category])
  const [values, setValues] = useState<Record<string, FieldValue>>({})

  // Redirect unauthenticated users to login (preserving where to come back to).
  useEffect(() => {
    if (isAuthed === false) router.replace(`/login?redirect=/opportunities/${id}/apply`)
  }, [isAuthed, id, router])

  // Prefill the contact email from the signed-in user once.
  useEffect(() => {
    if (user?.email) setValues((v) => (v.contact_email ? v : { ...v, contact_email: user.email as string }))
  }, [user?.email])

  const setField = (key: string, value: FieldValue) => setValues((v) => ({ ...v, [key]: value }))

  if (isLoading) {
    return (
      <Page>
        <Container>
          <Muted>Loading application form…</Muted>
        </Container>
      </Page>
    )
  }

  if (isError || !opportunity) {
    return (
      <Page>
        <Container>
          <Empty>
            <h2>Opportunity not found</h2>
            <Link href="/opportunities">← Browse opportunities</Link>
          </Empty>
        </Container>
      </Page>
    )
  }

  const slotsLeft = Math.max(0, opportunity.slots_available - opportunity.slots_filled)
  if (opportunity.status !== 'open' || slotsLeft === 0) {
    return (
      <Page>
        <Container>
          <Empty>
            <h2>This opportunity isn’t accepting applications</h2>
            <p>It may be closed or fully filled.</p>
            <Link href={`/opportunities/${id}`}>← Back to opportunity</Link>
          </Empty>
        </Container>
      </Page>
    )
  }

  const validate = (): string | null => {
    for (const f of fields) {
      if (f.required) {
        const val = values[f.key]
        if (val === undefined || val === '' || (typeof val === 'string' && !val.trim())) {
          return `${f.label} is required`
        }
      }
    }
    const email = values.contact_email
    if (typeof email === 'string' && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid contact email'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      toast.error(err)
      return
    }

    const payload: ApplicationPayload = {}
    const answers: ApplicationAnswer[] = []

    for (const f of fields) {
      const raw = values[f.key]
      if (raw === undefined || raw === '') continue

      if (f.key === 'contact_email') payload.contact_email = String(raw)
      else if (f.key === 'contact_phone') payload.contact_phone = String(raw)
      else if (f.key === 'message') payload.message = String(raw)
      else if (f.key === 'relevant_skills') {
        payload.relevant_skills = String(raw)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      } else if (!isStandardKey(f.key)) {
        // Skip unchecked boolean fields — they add no signal.
        if (typeof raw === 'boolean' && !raw) continue
        const value: ApplicationAnswer['value'] =
          f.type === 'checkbox' ? Boolean(raw) : f.type === 'number' ? Number(raw) : String(raw)
        answers.push({ key: f.key, label: f.label, value })
      }
    }

    if (answers.length) payload.application_answers = answers

    try {
      await apply.mutateAsync({ opportunityId: id, payload })
      toast.success('Application submitted! The organiser will be in touch.')
      router.push('/volunteers')
    } catch {
      /* error toast handled by api client */
    }
  }

  return (
    <Page>
      <Container style={{ maxWidth: 760 }}>
        <Link
          href={`/opportunities/${id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1A5FA8', fontSize: 14, marginBottom: 20 }}
        >
          <ArrowLeft size={15} /> Back to opportunity
        </Link>

        <div style={{ marginBottom: 20 }}>
          <Badge $tone="info">{humanize(opportunity.category)}</Badge>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', margin: '10px 0 4px', color: '#18171A' }}>
            Apply: {opportunity.title}
          </h1>
          <Muted>
            {opportunity.business?.business_name
              ? `Volunteering with ${opportunity.business.business_name}.`
              : 'Tell the organiser why you’d be a great fit.'}
          </Muted>
        </div>

        <Card as="form" onSubmit={handleSubmit}>
          {fields.map((f) => (
            <FormControl key={f.key} field={f} value={values[f.key]} onChange={(val) => setField(f.key, val)} />
          ))}

          <Button type="submit" disabled={apply.isPending} style={{ marginTop: 8 }}>
            <Send size={15} /> {apply.isPending ? 'Submitting…' : 'Submit application'}
          </Button>
        </Card>
      </Container>
    </Page>
  )
}

// ─── Single field renderer ───────────────────────────────────────────────────

function FormControl({
  field,
  value,
  onChange,
}: {
  field: FormField
  value: FieldValue | undefined
  onChange: (value: FieldValue) => void
}) {
  if (field.type === 'checkbox') {
    return (
      <Field>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.9rem', color: '#4A4750' }}>
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: '#D4870A' }}
          />
          {field.label}
        </label>
        {field.helper && <Muted style={{ marginTop: 4 }}>{field.helper}</Muted>}
      </Field>
    )
  }

  return (
    <Field>
      <Label>
        {field.label}
        {field.required && <span style={{ color: '#C0392B' }}> *</span>}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
        />
      ) : field.type === 'select' ? (
        <Select value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} style={{ width: '100%' }}>
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      ) : (
        <Input
          type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'date' ? 'date' : 'text'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          maxLength={field.maxLength}
        />
      )}

      {field.helper && <Muted style={{ marginTop: 4 }}>{field.helper}</Muted>}
    </Field>
  )
}
