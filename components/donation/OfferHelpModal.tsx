'use client'

import { useState, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import styled from 'styled-components'
import { Modal } from '@/components/Modal'
import { useCreateVolunteerOffer } from '@/api/hooks/useVolunteer'
import { volunteerOfferSchema, type VolunteerOfferFormData } from '@/utils/validationSchemas'
import {
  Plus,
  Trash2,
  HandHeart,
  Sparkles,
  Calendar,
  Wrench,
  Heart,
} from 'lucide-react'

/**
 * OfferHelpModal — volunteer "Offer to Help" form.
 *
 * Restyled onto the dashboard design system (warm amber / ink / canvas,
 * Syne + DM Sans + DM Mono) so it matches the campaign detail page and
 * /dashboard. The react-hook-form field names, zod schema and submission
 * payload are unchanged — only the presentation + UX copy were reworked.
 */

interface OfferHelpModalProps {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  campaignTitle: string
}

// ─── Tokens (mirror dashboard `tk`) ─────────────────────────────────────────────
const tk = {
  ink: '#18171A',
  canvas: '#F7F5F1',
  canvasDeep: '#EEEBe5',
  border: '#E2DDD6',
  white: '#FFFFFF',
  muted: '#8C8790',
  body: '#4A4750',
  heading: '#18171A',
  amber: '#D4870A',
  amberLight: '#FBF3E0',
  amberDark: '#A8680A',
  green: '#1A7A4A',
  red: '#C0392B',
  blue: '#1A5FA8',
  blueLight: '#E8F0FB',
}

const Shell = styled.div`
  font-family: 'DM Sans', sans-serif;
  color: ${tk.body};
  min-width: min(520px, 86vw);
  max-width: 100%;

  @media (max-width: 640px) {
    min-width: auto;
    width: 100%;
  }
`

// ─── Intro banner ───────────────────────────────────────────────────────────────
const Intro = styled.div`
  display: flex;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  background: linear-gradient(135deg, ${tk.amberLight}, ${tk.white});
  border: 1px solid ${tk.border};
  border-left: 3px solid ${tk.amber};
  border-radius: 12px;
  margin-bottom: 1.5rem;
`

const IntroIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: ${tk.amber};
  color: ${tk.white};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const IntroText = styled.div`
  font-size: 0.85rem;
  line-height: 1.5;
  color: ${tk.body};

  strong {
    display: block;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    color: ${tk.heading};
    font-size: 0.95rem;
    margin-bottom: 2px;
    word-break: break-word;
  }
`

// ─── Section ────────────────────────────────────────────────────────────────────
const Section = styled.section`
  margin-bottom: 1.5rem;

  &:last-of-type {
    margin-bottom: 0;
  }
`

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.875rem;

  span {
    font-family: 'Syne', sans-serif;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: ${tk.muted};
    white-space: nowrap;
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${tk.border};
  }

  svg {
    color: ${tk.amber};
    flex-shrink: 0;
  }
`

const Field = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }

  label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
    font-size: 0.82rem;
    font-weight: 500;
    color: ${tk.heading};

    .req {
      color: ${tk.red};
    }
    .count {
      font-family: 'DM Mono', monospace;
      font-size: 0.68rem;
      color: ${tk.muted};
      font-weight: 400;
    }
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.7rem 0.8rem;
    border: 1px solid ${tk.border};
    border-radius: 10px;
    font-size: 0.9rem;
    font-family: inherit;
    color: ${tk.ink};
    background: ${tk.white};
    transition: border-color 0.15s, box-shadow 0.15s;
    box-sizing: border-box;

    &::placeholder {
      color: ${tk.muted};
    }

    &:focus {
      outline: none;
      border-color: ${tk.amber};
      box-shadow: 0 0 0 3px ${tk.amberLight};
    }

    &:disabled {
      background: ${tk.canvasDeep};
      color: ${tk.muted};
      cursor: not-allowed;
    }

    &.error {
      border-color: ${tk.red};
      &:focus {
        box-shadow: 0 0 0 3px rgba(192, 57, 43, 0.12);
      }
    }
  }

  textarea {
    resize: vertical;
    min-height: 96px;
    line-height: 1.55;
  }
`

const Hint = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: ${tk.muted};
  line-height: 1.4;
`

const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.3rem;
  color: ${tk.red};
  font-size: 0.78rem;
  word-break: break-word;
`

// ─── Skills ─────────────────────────────────────────────────────────────────────
const SkillsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`

const SkillItem = styled.div`
  display: grid;
  grid-template-columns: 1fr 92px 40px;
  gap: 0.5rem;
  align-items: start;

  @media (max-width: 480px) {
    grid-template-columns: 1fr 72px 38px;
    gap: 0.375rem;
  }
`

const IconBtn = styled.button`
  width: 40px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.red};
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: #FBE9E7;
    border-color: ${tk.red};
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`

const AddSkillButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.65rem;
  background: ${tk.amberLight};
  border: 1.5px dashed ${tk.amber};
  border-radius: 10px;
  color: ${tk.amberDark};
  cursor: pointer;
  font-weight: 600;
  font-size: 0.82rem;
  font-family: 'Syne', sans-serif;
  transition: background 0.15s;

  &:hover {
    background: #f6e6c8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

// ─── Availability grid ──────────────────────────────────────────────────────────
const Grid3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.625rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`

// ─── Footer ─────────────────────────────────────────────────────────────────────
const Footer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid ${tk.border};

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`

const GhostBtn = styled.button`
  padding: 0.7rem 1.25rem;
  border-radius: 10px;
  border: 1px solid ${tk.border};
  background: ${tk.white};
  color: ${tk.body};
  font-family: 'Syne', sans-serif;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: ${tk.canvas};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border-radius: 10px;
  border: none;
  background: ${tk.amber};
  color: ${tk.white};
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;

  &:hover {
    background: ${tk.amberDark};
  }
  &:active {
    transform: scale(0.98);
  }
  &:disabled {
    background: ${tk.muted};
    cursor: not-allowed;
  }
`

const OFFER_TYPES = [
  { value: 'community_support', label: 'Community Support' },
  { value: 'direct_assistance', label: 'Direct Assistance' },
  { value: 'fundraising', label: 'Fundraising Help' },
  { value: 'other', label: 'Other' },
]

export function OfferHelpModal({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
}: OfferHelpModalProps) {
  const { mutate: createOffer, isPending } = useCreateVolunteerOffer()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<VolunteerOfferFormData>({
    resolver: zodResolver(volunteerOfferSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      description: '',
      offerType: 'community_support',
      skillsOffered: [{ name: '', yearsOfExperience: 0 }],
      availability: { startDate: '', endDate: '', hoursPerWeek: 5 },
      estimatedHours: 20,
      experienceLevel: 'beginner',
      contactDetails: { email: '', phone: '' },
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'skillsOffered' })
  const descLen = (watch('description') || '').length

  const onSubmit = useCallback(
    async (data: VolunteerOfferFormData) => {
      setIsSubmitting(true)
      try {
        const typedData = data as Required<typeof data>
        const startDateISO = new Date(typedData.availability.startDate).toISOString()
        const endDateISO = new Date(typedData.availability.endDate).toISOString()

        createOffer(
          {
            campaignId,
            offerType: typedData.offerType,
            title: typedData.title,
            description: typedData.description,
            skills: typedData.skillsOffered.map((s) => s.name),
            availabilityStartDate: startDateISO,
            availabilityEndDate: endDateISO,
            hoursPerWeek: Number(typedData.availability.hoursPerWeek),
            estimatedHours: Number(typedData.estimatedHours),
            experienceLevel: typedData.experienceLevel,
            contactEmail: typedData.contactDetails.email,
            contactPhone: typedData.contactDetails.phone,
          },
          {
            onSuccess: () => {
              reset()
              onClose()
            },
            onError: () => {},
          }
        )
      } finally {
        setIsSubmitting(false)
      }
    },
    [campaignId, createOffer, onClose, reset]
  )

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }, [isSubmitting, onClose, reset])

  const disabled = isSubmitting || isPending

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Offer to Help">
      <Shell>
        <Intro>
          <IntroIcon>
            <HandHeart size={20} />
          </IntroIcon>
          <IntroText>
            <strong>{campaignTitle}</strong>
            Share your skills and availability. The campaign creator reviews every
            offer and reaches out if it&rsquo;s a fit.
          </IntroText>
        </Intro>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* ── What you're offering ── */}
          <Section>
            <SectionHead>
              <Sparkles size={14} />
              <span>What You&rsquo;re Offering</span>
            </SectionHead>

            <Field>
              <label>
                <span>
                  Headline <span className="req">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Carpentry & construction, meal prep, tutoring…"
                {...register('title')}
                className={errors.title ? 'error' : ''}
                disabled={disabled}
              />
              {errors.title && <ErrorMessage>{String(errors.title.message)}</ErrorMessage>}
            </Field>

            <Field>
              <label>
                <span>
                  Details <span className="req">*</span>
                </span>
                <span className="count">{descLen}/1000</span>
              </label>
              <textarea
                placeholder="Describe your experience, the tasks you can take on, and any special knowledge…"
                {...register('description')}
                className={errors.description ? 'error' : ''}
                disabled={disabled}
                maxLength={1000}
              />
              {errors.description && (
                <ErrorMessage>{String(errors.description.message)}</ErrorMessage>
              )}
            </Field>

            <Grid3 style={{ gridTemplateColumns: '1fr 1fr' }}>
              <Field>
                <label>
                  <span>
                    Type of help <span className="req">*</span>
                  </span>
                </label>
                <select
                  {...register('offerType')}
                  className={errors.offerType ? 'error' : ''}
                  disabled={disabled}
                >
                  {OFFER_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.offerType && (
                  <ErrorMessage>{String(errors.offerType.message)}</ErrorMessage>
                )}
              </Field>

              <Field>
                <label>
                  <span>
                    Experience level <span className="req">*</span>
                  </span>
                </label>
                <select
                  {...register('experienceLevel')}
                  className={errors.experienceLevel ? 'error' : ''}
                  disabled={disabled}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
                {errors.experienceLevel && (
                  <ErrorMessage>{String(errors.experienceLevel.message)}</ErrorMessage>
                )}
              </Field>
            </Grid3>
          </Section>

          {/* ── Skills ── */}
          <Section>
            <SectionHead>
              <Wrench size={14} />
              <span>Skills &amp; Experience</span>
            </SectionHead>

            <SkillsContainer>
              {fields.map((field, index) => (
                <SkillItem key={field.id}>
                  <div>
                    <input
                      type="text"
                      placeholder="Skill (e.g. carpentry, cooking)"
                      {...register(`skillsOffered.${index}.name`)}
                      className={errors.skillsOffered?.[index]?.name ? 'error' : ''}
                      disabled={disabled}
                    />
                    {errors.skillsOffered?.[index]?.name && (
                      <ErrorMessage>
                        {String(errors.skillsOffered[index]?.name?.message)}
                      </ErrorMessage>
                    )}
                  </div>
                  <input
                    type="number"
                    placeholder="Yrs"
                    min="0"
                    max="70"
                    {...register(`skillsOffered.${index}.yearsOfExperience`)}
                    disabled={disabled}
                  />
                  <IconBtn
                    type="button"
                    onClick={() => remove(index)}
                    disabled={disabled || fields.length <= 1}
                    aria-label="Remove skill"
                  >
                    <Trash2 size={16} />
                  </IconBtn>
                </SkillItem>
              ))}

              <AddSkillButton
                type="button"
                onClick={() => append({ name: '', yearsOfExperience: 0 })}
                disabled={disabled || fields.length >= 10}
              >
                <Plus size={16} />
                Add another skill
              </AddSkillButton>
            </SkillsContainer>
            {errors.skillsOffered && !Array.isArray(errors.skillsOffered) && (
              <ErrorMessage>{String(errors.skillsOffered.message)}</ErrorMessage>
            )}
          </Section>

          {/* ── Availability ── */}
          <Section>
            <SectionHead>
              <Calendar size={14} />
              <span>Availability</span>
            </SectionHead>

            <Grid3>
              <Field>
                <label>
                  <span>
                    Start <span className="req">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  {...register('availability.startDate')}
                  className={errors.availability?.startDate ? 'error' : ''}
                  disabled={disabled}
                />
                {errors.availability?.startDate && (
                  <ErrorMessage>{String(errors.availability.startDate.message)}</ErrorMessage>
                )}
              </Field>
              <Field>
                <label>
                  <span>
                    End <span className="req">*</span>
                  </span>
                </label>
                <input
                  type="date"
                  {...register('availability.endDate')}
                  className={errors.availability?.endDate ? 'error' : ''}
                  disabled={disabled}
                />
                {errors.availability?.endDate && (
                  <ErrorMessage>{String(errors.availability.endDate.message)}</ErrorMessage>
                )}
              </Field>
              <Field>
                <label>
                  <span>
                    Hours/week <span className="req">*</span>
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="5"
                  min="1"
                  max="168"
                  {...register('availability.hoursPerWeek')}
                  className={errors.availability?.hoursPerWeek ? 'error' : ''}
                  disabled={disabled}
                />
                {errors.availability?.hoursPerWeek?.message && (
                  <ErrorMessage>{String(errors.availability.hoursPerWeek.message)}</ErrorMessage>
                )}
              </Field>
            </Grid3>

            <Field style={{ marginTop: '1rem' }}>
              <label>
                <span>
                  Total hours you can contribute <span className="req">*</span>
                </span>
              </label>
              <input
                type="number"
                placeholder="20"
                min="0.5"
                max="500"
                step="0.5"
                {...register('estimatedHours')}
                className={errors.estimatedHours ? 'error' : ''}
                disabled={disabled}
              />
              <Hint>A rough estimate across the whole campaign — you can adjust later.</Hint>
              {errors.estimatedHours && (
                <ErrorMessage>{String(errors.estimatedHours.message)}</ErrorMessage>
              )}
            </Field>
          </Section>

          {/* ── Contact ── */}
          <Section>
            <SectionHead>
              <Heart size={14} />
              <span>How To Reach You</span>
            </SectionHead>

            <Grid3 style={{ gridTemplateColumns: '1fr 1fr' }}>
              <Field>
                <label>
                  <span>
                    Email <span className="req">*</span>
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register('contactDetails.email')}
                  className={errors.contactDetails?.email ? 'error' : ''}
                  disabled={disabled}
                />
                {errors.contactDetails?.email && (
                  <ErrorMessage>{String(errors.contactDetails.email.message)}</ErrorMessage>
                )}
              </Field>
              <Field>
                <label>
                  <span>
                    Phone <span className="req">*</span>
                  </span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('contactDetails.phone')}
                  className={errors.contactDetails?.phone ? 'error' : ''}
                  disabled={disabled}
                />
                {errors.contactDetails?.phone && (
                  <ErrorMessage>{String(errors.contactDetails.phone.message)}</ErrorMessage>
                )}
              </Field>
            </Grid3>
            <Hint style={{ marginTop: '0.5rem' }}>
              Your contact details are only shared with the creator if they accept your offer.
            </Hint>
          </Section>

          <Footer>
            <GhostBtn type="button" onClick={handleClose} disabled={disabled}>
              Cancel
            </GhostBtn>
            <PrimaryBtn type="submit" disabled={!isValid || disabled}>
              <HandHeart size={16} />
              {disabled ? 'Submitting…' : 'Submit Offer'}
            </PrimaryBtn>
          </Footer>
        </form>
      </Shell>
    </Modal>
  )
}
