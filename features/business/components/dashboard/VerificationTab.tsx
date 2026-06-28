'use client'

/**
 * BU-05 Business verification submission. Upload documents (reusing the
 * /business/upload endpoint), tag each with a type, then submit for review.
 */

import { useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { Upload, BadgeCheck, Trash2 } from 'lucide-react'
import { Card, Field, Label, Input, Select, Button, Row, Muted, Badge, humanize, statusTone } from '@/features/business/ui'
import { useSubmitBusinessVerification, useUploadBusinessAsset } from '@/api/hooks/useBusiness'
import {
  BUSINESS_DOCUMENT_TYPES,
  type BusinessDocumentType,
  type BusinessVerificationDocInput,
  type OwnBusinessProfile,
} from '@/types/business'

export default function VerificationTab({ profile }: { profile: OwnBusinessProfile }) {
  const [legalName, setLegalName] = useState(profile.business_name)
  const [registration, setRegistration] = useState('')
  const [taxId, setTaxId] = useState('')
  const [docType, setDocType] = useState<BusinessDocumentType>('business_registration')
  const [docs, setDocs] = useState<BusinessVerificationDocInput[]>([])
  const fileInput = useRef<HTMLInputElement>(null)

  const upload = useUploadBusinessAsset()
  const submit = useSubmitBusinessVerification()

  const status = profile.verification_status
  const alreadyVerified = status === 'verified'
  const pending = status === 'pending'

  const addDoc = async (file: File) => {
    try {
      const ref = await upload.mutateAsync(file)
      setDocs((d) => [...d, { document_type: docType, url: ref.url, public_id: ref.public_id }])
      toast.success('Document uploaded')
    } catch {
      /* handled by api client */
    }
  }

  const handleSubmit = async () => {
    if (legalName.trim().length < 2) {
      toast.error('Legal business name is required')
      return
    }
    if (docs.length === 0) {
      toast.error('Upload at least one document')
      return
    }
    try {
      await submit.mutateAsync({
        legal_business_name: legalName.trim(),
        registration_number: registration || undefined,
        tax_id: taxId || undefined,
        documents: docs,
      })
      toast.success('Submitted for review!')
      setDocs([])
    } catch {
      /* handled by api client */
    }
  }

  return (
    <Card>
      <Row $gap={2} style={{ marginBottom: 12 }}>
        <BadgeCheck size={20} color={alreadyVerified ? '#10B981' : '#94A3B8'} />
        <h3 style={{ margin: 0 }}>Business Verification</h3>
        <Badge $tone={statusTone(status)}>{humanize(status)}</Badge>
      </Row>

      {alreadyVerified && <Muted>Your business is verified ✓ — the badge now appears on your profile and listings.</Muted>}
      {pending && <Muted>Your submission is in review. We&apos;ll update your badge once a reviewer decides.</Muted>}

      {!alreadyVerified && !pending && (
        <>
          <Muted style={{ marginBottom: 16 }}>
            Submit official documents (business registration, tax certificate, proof of address) to earn the verified
            badge. Documents are stored privately and only seen by reviewers.
          </Muted>

          <Field>
            <Label>Legal business name *</Label>
            <Input value={legalName} onChange={(e) => setLegalName(e.target.value)} />
          </Field>

          <Row $gap={4} $wrap>
            <Field style={{ flex: 1, minWidth: 200 }}>
              <Label>Registration number</Label>
              <Input value={registration} onChange={(e) => setRegistration(e.target.value)} />
            </Field>
            <Field style={{ flex: 1, minWidth: 200 }}>
              <Label>Tax ID</Label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </Field>
          </Row>

          <Field>
            <Label>Add document</Label>
            <Row $gap={3} $wrap>
              <Select value={docType} onChange={(e) => setDocType(e.target.value as BusinessDocumentType)}>
                {BUSINESS_DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {humanize(t)}
                  </option>
                ))}
              </Select>
              <input
                ref={fileInput}
                type="file"
                accept="image/*,application/pdf"
                hidden
                onChange={(e) => e.target.files?.[0] && addDoc(e.target.files[0])}
              />
              <Button $variant="outline" type="button" onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
                <Upload size={15} /> {upload.isPending ? 'Uploading…' : 'Upload'}
              </Button>
            </Row>
          </Field>

          {docs.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {docs.map((d, i) => (
                <Row key={i} $gap={2} style={{ justifyContent: 'space-between', padding: '6px 0' }}>
                  <Muted>
                    {humanize(d.document_type)} — uploaded ✓
                  </Muted>
                  <Button $variant="ghost" type="button" onClick={() => setDocs((arr) => arr.filter((_, j) => j !== i))}>
                    <Trash2 size={14} />
                  </Button>
                </Row>
              ))}
            </div>
          )}

          <Button onClick={handleSubmit} disabled={submit.isPending}>
            {submit.isPending ? 'Submitting…' : 'Submit for verification'}
          </Button>
        </>
      )}
    </Card>
  )
}
