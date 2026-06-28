'use client'

/**
 * ProfileSetupWizard
 *
 * Multi-step profile setup that doubles as onboarding (/profile/setup) and the
 * "Edit profile" experience. Each step persists its own slice via
 * useUpdateProfile so the completion meter updates live and progress survives
 * drop-off. Prefilled from useProfileDashboard.
 *
 * Steps: Identity â†’ Photo â†’ Location â†’ Story (creators) â†’ Review
 *
 * Hooks consumed: useUpdateProfile, useUploadAvatar, useUsernameAvailability.
 */

import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import {
  User, Image as ImageIcon, MapPin, BookOpen, CheckCircle2,
  Check, X, Loader2, ArrowRight, ArrowLeft, Camera, Plus, Heart,
} from 'lucide-react'
import { honestNeed } from '@/features/profile/theme'
import { useProfileDashboard, useUpdateProfile, useUploadAvatar, useUsernameAvailability } from '@/api/hooks/useProfile'
import type { ProfileUpdatePayload } from '@/types/profile'
import { CAUSES } from '@/lib/causes'
import { DashboardSkeleton } from './shared'

// â”€â”€ Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const schema = z.object({
  first_name: z.string().trim().min(1, 'First name is required').max(60),
  last_name: z.string().trim().min(1, 'Last name is required').max(60),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9_.]{3,30}$/i, '3-30 chars: letters, numbers, _ or .'),
  bio: z.string().trim().max(2000).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.string().trim().max(100).optional().or(z.literal('')),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  personal_story: z.string().trim().max(5000).optional().or(z.literal('')),
  why_joined: z.string().trim().max(2000).optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

type StepKey = 'identity' | 'photo' | 'interests' | 'location' | 'story' | 'review'

export function ProfileSetupWizard() {
  const router = useRouter()
  const { data, isLoading } = useProfileDashboard()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar(data?.identity.id ?? '')

  const isCreator = data?.identity.role === 'creator' || data?.identity.role === 'admin'
  const STEPS = useMemo<{ key: StepKey; label: string; icon: React.ReactNode }[]>(
    () => [
      { key: 'identity', label: 'About you', icon: <User size={16} /> },
      { key: 'photo', label: 'Photo', icon: <ImageIcon size={16} /> },
      { key: 'interests', label: 'Interests', icon: <Heart size={16} /> },
      { key: 'location', label: 'Location', icon: <MapPin size={16} /> },
      ...(isCreator ? [{ key: 'story' as StepKey, label: 'Your story', icon: <BookOpen size={16} /> }] : []),
      { key: 'review', label: 'Review', icon: <CheckCircle2 size={16} /> },
    ],
    [isCreator]
  )

  const [stepIdx, setStepIdx] = useState(0)
  const step = STEPS[stepIdx]?.key
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [areas, setAreas] = useState<string[]>([])
  const [areaInput, setAreaInput] = useState('')
  const [interests, setInterests] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      first_name: '', last_name: '', username: '', bio: '',
      city: '', state: '', country: '', personal_story: '', why_joined: '',
    },
  })

  // Prefill once dashboard loads
  useEffect(() => {
    if (!data) return
    const id = data.identity
    reset({
      first_name: id.first_name ?? '',
      last_name: id.last_name ?? '',
      username: id.username ?? '',
      bio: id.bio ?? '',
      city: id.location?.city ?? '',
      state: id.location?.state ?? '',
      country: id.location?.country ?? '',
      personal_story: data.creator_profile?.personal_story ?? '',
      why_joined: data.creator_profile?.why_joined ?? '',
    })
    setAreas(data.creator_profile?.areas_of_need ?? [])
    setInterests(id.interests ?? [])
    setAvatarPreview(id.avatar_url ?? null)
  }, [data, reset])

  function toggleInterest(code: string) {
    setInterests((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  // â”€â”€ Username availability (debounced) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const usernameValue = watch('username')
  const [debounced, setDebounced] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebounced((usernameValue || '').toLowerCase()), 400)
    return () => clearTimeout(t)
  }, [usernameValue])

  const isOwnUsername = !!data?.identity.username && debounced === data.identity.username
  const usernameCheck = useUsernameAvailability(
    debounced,
    /^[a-z0-9_.]{3,30}$/.test(debounced) && !isOwnUsername
  )
  const usernameTaken = usernameCheck.data && !usernameCheck.data.available && !isOwnUsername

  // â”€â”€ Per-step persistence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async function persistStep(key: StepKey): Promise<boolean> {
    const v = getValues()
    let payload: ProfileUpdatePayload | null = null

    if (key === 'identity') {
      payload = { first_name: v.first_name, last_name: v.last_name, username: v.username, bio: v.bio || '' }
    } else if (key === 'interests') {
      payload = { interests }
    } else if (key === 'location') {
      payload = { location: { city: v.city, state: v.state, country: v.country } }
    } else if (key === 'story') {
      payload = { creator_profile: { personal_story: v.personal_story || '', why_joined: v.why_joined || '', areas_of_need: areas } }
    }
    if (!payload) return true // photo step persists via upload; review has nothing to save

    try {
      await updateProfile.mutateAsync(payload)
      return true
    } catch {
      return false // interceptor shows the toast
    }
  }

  const fieldsForStep: Record<StepKey, (keyof FormData)[]> = {
    identity: ['first_name', 'last_name', 'username', 'bio'],
    photo: [],
    interests: [],
    location: ['city', 'state', 'country'],
    story: ['personal_story', 'why_joined'],
    review: [],
  }

  async function handleNext() {
    const valid = await trigger(fieldsForStep[step])
    if (!valid) return
    if (step === 'identity' && usernameTaken) {
      toast.error('That username is taken')
      return
    }
    const ok = await persistStep(step)
    if (!ok) return
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1))
  }

  function handleBack() {
    setStepIdx((i) => Math.max(i - 1, 0))
  }

  const onFinish = handleSubmit(async () => {
    // Final safety persist of identity + interests + location (+story), then route.
    await persistStep('identity')
    await persistStep('interests')
    await persistStep('location')
    if (isCreator) await persistStep('story')
    toast.success('Profile saved! ðŸŽ‰')
    router.push('/profile')
  })

  async function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    try {
      const res = await uploadAvatar.mutateAsync(file)
      setAvatarPreview(res.avatar_url)
      toast.success('Photo updated')
    } catch {
      setAvatarPreview(data?.identity.avatar_url ?? null)
    }
  }

  function addArea() {
    const a = areaInput.trim()
    if (a && !areas.includes(a) && areas.length < 20) {
      setAreas((prev) => [...prev, a])
      setAreaInput('')
    }
  }

  if (isLoading || !data) {
    return <Page><DashboardSkeleton /></Page>
  }

  const progressPct = Math.round(((stepIdx + 1) / STEPS.length) * 100)
  const initials = `${watch('first_name')?.[0] ?? ''}${watch('last_name')?.[0] ?? ''}`.toUpperCase() || '?'

  return (
    <Page>
      <Card>
        <RainbowEdge />
        <Body>
          <Heading>Complete your profile</Heading>
          <Sub>A complete, verified profile earns more trust â€” and more support.</Sub>

          {/* Stepper rail */}
          <Rail>
            {STEPS.map((s, i) => (
              <RailItem key={s.key} $active={i === stepIdx} $done={i < stepIdx}>
                <RailDot $active={i === stepIdx} $done={i < stepIdx}>
                  {i < stepIdx ? <Check size={13} strokeWidth={3} /> : s.icon}
                </RailDot>
                <RailLabel $active={i === stepIdx}>{s.label}</RailLabel>
              </RailItem>
            ))}
          </Rail>
          <ProgressTrack><ProgressFill style={{ width: `${progressPct}%` }} /></ProgressTrack>

          <AnimatePresence mode="wait">
            <StepBody
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'identity' && (
                <Fields>
                  <Two>
                    <Field>
                      <Label>First name</Label>
                      <Input {...register('first_name')} placeholder="Jane" $err={!!errors.first_name} />
                      {errors.first_name && <Err>{errors.first_name.message}</Err>}
                    </Field>
                    <Field>
                      <Label>Last name</Label>
                      <Input {...register('last_name')} placeholder="Doe" $err={!!errors.last_name} />
                      {errors.last_name && <Err>{errors.last_name.message}</Err>}
                    </Field>
                  </Two>
                  <Field>
                    <Label>Username</Label>
                    <UsernameWrap>
                      <At>@</At>
                      <Input
                        {...register('username')}
                        placeholder="janedoe"
                        $err={!!errors.username || !!usernameTaken}
                        style={{ paddingLeft: 28 }}
                        autoCapitalize="none"
                      />
                      <UsernameStatus>
                        {usernameCheck.isFetching && <Loader2 size={16} className="spin" />}
                        {!usernameCheck.isFetching && debounced.length >= 3 && (
                          isOwnUsername || usernameCheck.data?.available
                            ? <Check size={16} color={honestNeed.colors.success} />
                            : usernameTaken ? <X size={16} color={honestNeed.colors.error} /> : null
                        )}
                      </UsernameStatus>
                    </UsernameWrap>
                    {errors.username && <Err>{errors.username.message}</Err>}
                    {!errors.username && usernameTaken && <Err>That username is taken</Err>}
                  </Field>
                  <Field>
                    <Label>Short bio</Label>
                    <Textarea {...register('bio')} rows={3} placeholder="Tell the community a little about yourselfâ€¦" />
                    <Hint>{(watch('bio')?.length ?? 0)}/2000 Â· aim for 20+ characters</Hint>
                  </Field>
                </Fields>
              )}

              {step === 'photo' && (
                <PhotoStep>
                  <AvatarBig>
                    {avatarPreview ? <AvatarImg src={avatarPreview} alt="avatar" /> : <AvatarInitials>{initials}</AvatarInitials>}
                    <UploadLabel>
                      <Camera size={16} />
                      <input type="file" accept="image/*" hidden onChange={handleAvatarSelect} />
                    </UploadLabel>
                  </AvatarBig>
                  <PhotoCopy>
                    {uploadAvatar.isPending ? 'Uploadingâ€¦' : 'Add a clear photo of your face. Profiles with photos get more support.'}
                  </PhotoCopy>
                </PhotoStep>
              )}

              {step === 'interests' && (
                <InterestsStep>
                  <InterestsIntro>
                    Pick the causes you care about. We&apos;ll surface campaigns
                    that match â€” so your first contribution means the most.
                  </InterestsIntro>
                  <InterestGrid>
                    {CAUSES.map((c) => {
                      const selected = interests.includes(c.code)
                      return (
                        <InterestChip
                          key={c.code}
                          type="button"
                          $selected={selected}
                          onClick={() => toggleInterest(c.code)}
                          aria-pressed={selected}
                        >
                          <InterestEmoji>{c.icon}</InterestEmoji>
                          {c.label}
                          {selected && <Check size={15} strokeWidth={3} />}
                        </InterestChip>
                      )
                    })}
                  </InterestGrid>
                  <Hint>{interests.length} selected Â· optional, but recommended</Hint>
                </InterestsStep>
              )}

              {step === 'location' && (
                <Fields>
                  <Field>
                    <Label>City</Label>
                    <Input {...register('city')} placeholder="Austin" />
                  </Field>
                  <Two>
                    <Field>
                      <Label>State / Region</Label>
                      <Input {...register('state')} placeholder="Texas" />
                    </Field>
                    <Field>
                      <Label>Country</Label>
                      <Input {...register('country')} placeholder="United States" />
                    </Field>
                  </Two>
                </Fields>
              )}

              {step === 'story' && (
                <Fields>
                  <Field>
                    <Label>Your story</Label>
                    <Textarea {...register('personal_story')} rows={4} placeholder="What brought you to HonestNeed?" />
                  </Field>
                  <Field>
                    <Label>Why I joined</Label>
                    <Textarea {...register('why_joined')} rows={2} placeholder="Share your mission in a sentence or two." />
                  </Field>
                  <Field>
                    <Label>Areas of need</Label>
                    <ChipInputRow>
                      <Input
                        value={areaInput}
                        onChange={(e) => setAreaInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addArea() } }}
                        placeholder="e.g. Medical, Housing, Education"
                      />
                      <AddChipBtn type="button" onClick={addArea}><Plus size={16} /></AddChipBtn>
                    </ChipInputRow>
                    <Chips>
                      {areas.map((a) => (
                        <Chip key={a}>
                          {a}
                          <ChipX type="button" onClick={() => setAreas((p) => p.filter((x) => x !== a))}><X size={12} /></ChipX>
                        </Chip>
                      ))}
                    </Chips>
                  </Field>
                </Fields>
              )}

              {step === 'review' && (
                <ReviewStep>
                  <ReviewRing>
                    <RingBig percent={data.completion.percent} />
                  </ReviewRing>
                  <ReviewTitle>You&apos;re {data.completion.percent}% complete</ReviewTitle>
                  <ReviewCopy>
                    {data.completion.percent >= 100
                      ? 'Your profile is fully complete â€” amazing!'
                      : 'Finish the remaining items below to maximize trust.'}
                  </ReviewCopy>
                  <ReviewList>
                    {data.completion.checklist.filter((c) => !c.done).map((c) => (
                      <ReviewItem key={c.key}>
                        <X size={14} color={honestNeed.colors.muted} />
                        {c.key.replace(/_/g, ' ')}
                        <Weight>+{c.weight}%</Weight>
                      </ReviewItem>
                    ))}
                  </ReviewList>
                </ReviewStep>
              )}
            </StepBody>
          </AnimatePresence>

          <Footer>
            {stepIdx > 0 ? (
              <BackBtn type="button" onClick={handleBack}><ArrowLeft size={16} /> Back</BackBtn>
            ) : (
              <SkipBtn type="button" onClick={() => router.push('/profile')}>Skip for now</SkipBtn>
            )}
            {step === 'review' ? (
              <NextBtn type="button" onClick={onFinish} disabled={updateProfile.isPending}>
                Finish <CheckCircle2 size={16} />
              </NextBtn>
            ) : (
              <NextBtn type="button" onClick={handleNext} disabled={updateProfile.isPending || (step === 'identity' && !!usernameTaken)}>
                {updateProfile.isPending ? 'Savingâ€¦' : 'Continue'} <ArrowRight size={16} />
              </NextBtn>
            )}
          </Footer>
        </Body>
      </Card>
    </Page>
  )
}

function RingBig({ percent }: { percent: number }) {
  const R = 46
  const C = 2 * Math.PI * R
  return (
    <svg width={112} height={112} viewBox="0 0 112 112" aria-label={`${percent}% complete`}>
      <defs>
        <linearGradient id="hn-setup-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={honestNeed.colors.primary} />
          <stop offset="100%" stopColor={honestNeed.colors.success} />
        </linearGradient>
      </defs>
      <circle cx={56} cy={56} r={R} fill="none" stroke={honestNeed.colors.border} strokeWidth={10} />
      <motion.circle
        cx={56} cy={56} r={R} fill="none" stroke="url(#hn-setup-ring)" strokeWidth={10} strokeLinecap="round"
        strokeDasharray={C}
        initial={{ strokeDashoffset: C }}
        animate={{ strokeDashoffset: C - (C * Math.max(0, Math.min(100, percent))) / 100 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        transform="rotate(-90 56 56)"
      />
      <text x="56" y="62" textAnchor="middle" fontSize="22" fontWeight="800" fill={honestNeed.colors.text}>{percent}%</text>
    </svg>
  )
}

// â”€â”€ styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Page = styled.div`
  max-width: 640px;
  margin: 0 auto;
  padding: 28px 16px 64px;
`
const Card = styled.div`
  background: ${honestNeed.colors.surface};
  border: 1px solid ${honestNeed.colors.border};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(16, 36, 58, 0.08);
`
const RainbowEdge = styled.div`
  height: 6px;
  background: ${honestNeed.gradients.rainbow};
`
const Body = styled.div`
  padding: 24px;
`
const Heading = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
`
const Sub = styled.p`
  margin: 4px 0 20px;
  font-size: 0.9rem;
  color: ${honestNeed.colors.mutedText};
`
const Rail = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 10px;
`
const RailItem = styled.div<{ $active: boolean; $done: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
`
const RailDot = styled.div<{ $active: boolean; $done: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: ${({ $active, $done }) => ($active || $done ? '#fff' : honestNeed.colors.muted)};
  background: ${({ $active, $done }) =>
    $done ? honestNeed.colors.success : $active ? honestNeed.colors.primary : honestNeed.colors.disabled};
  transition: all 200ms ease;
`
const RailLabel = styled.span<{ $active: boolean }>`
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
  color: ${({ $active }) => ($active ? honestNeed.colors.text : honestNeed.colors.muted)};
  @media (max-width: 480px) { display: none; }
`
const ProgressTrack = styled.div`
  height: 6px;
  border-radius: 999px;
  background: ${honestNeed.colors.disabled};
  overflow: hidden;
  margin-bottom: 22px;
`
const ProgressFill = styled.div`
  height: 100%;
  border-radius: 999px;
  background: ${honestNeed.gradients.sky};
  transition: width 300ms ease;
`
const StepBody = styled(motion.div)`
  min-height: 230px;
`
const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`
const Two = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`
const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`
const Label = styled.label`
  font-size: 0.83rem;
  font-weight: 700;
  color: ${honestNeed.colors.text};
`
const inputStyles = `
  width: 100%;
  padding: 11px 14px;
  font-size: 0.95rem;
  border-radius: 11px;
  border: 1.5px solid ${honestNeed.colors.border};
  background: ${honestNeed.colors.surface};
  color: ${honestNeed.colors.text};
  &:focus { outline: none; border-color: ${honestNeed.colors.primary}; box-shadow: 0 0 0 3px rgba(28,155,216,0.16); }
  &::placeholder { color: ${honestNeed.colors.muted}; }
`
const Input = styled.input<{ $err?: boolean }>`
  ${inputStyles}
  border-color: ${({ $err }) => ($err ? honestNeed.colors.error : honestNeed.colors.border)};
`
const Textarea = styled.textarea`
  ${inputStyles}
  resize: vertical;
`
const Err = styled.span`
  font-size: 0.76rem;
  color: ${honestNeed.colors.error};
  font-weight: 600;
`
const Hint = styled.span`
  font-size: 0.74rem;
  color: ${honestNeed.colors.muted};
`
const UsernameWrap = styled.div`
  position: relative;
`
const At = styled.span`
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: ${honestNeed.colors.muted};
  font-weight: 700;
`
const UsernameStatus = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  .spin { animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`
const PhotoStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
`
const AvatarBig = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
`
const AvatarImg = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid ${honestNeed.colors.border};
`
const AvatarInitials = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  font-weight: 800;
  color: #fff;
  background: ${honestNeed.gradients.sky};
`
const UploadLabel = styled.label`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: ${honestNeed.colors.primary};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid ${honestNeed.colors.surface};
`
const PhotoCopy = styled.p`
  margin: 0;
  text-align: center;
  font-size: 0.88rem;
  color: ${honestNeed.colors.mutedText};
  max-width: 340px;
`
const InterestsStep = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 0;
`
const InterestsIntro = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${honestNeed.colors.mutedText};
`
const InterestGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`
const InterestChip = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  transition: all 150ms ease;
  color: ${({ $selected }) => ($selected ? honestNeed.colors.primaryDark : honestNeed.colors.text)};
  background: ${({ $selected }) => ($selected ? honestNeed.colors.primaryBg : honestNeed.colors.surface)};
  border: 1.5px solid ${({ $selected }) => ($selected ? honestNeed.colors.primary : honestNeed.colors.border)};
  & > svg:last-child { margin-left: auto; color: ${honestNeed.colors.primary}; }
  &:hover { border-color: ${honestNeed.colors.primary}; }
`
const InterestEmoji = styled.span`
  font-size: 1.1rem;
  line-height: 1;
`
const ChipInputRow = styled.div`
  display: flex;
  gap: 8px;
`
const AddChipBtn = styled.button`
  flex-shrink: 0;
  width: 44px;
  border-radius: 11px;
  border: none;
  background: ${honestNeed.colors.primary};
  color: #fff;
  cursor: pointer;
`
const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
`
const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: ${honestNeed.colors.primaryBg};
  color: ${honestNeed.colors.primaryDark};
  font-size: 0.8rem;
  font-weight: 600;
`
const ChipX = styled.button`
  display: inline-flex;
  border: none;
  background: none;
  cursor: pointer;
  color: ${honestNeed.colors.primaryDark};
  padding: 0;
`
const ReviewStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 8px 0;
`
const ReviewRing = styled.div``
const ReviewTitle = styled.h3`
  margin: 8px 0 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: ${honestNeed.colors.text};
`
const ReviewCopy = styled.p`
  margin: 0 0 8px;
  font-size: 0.88rem;
  color: ${honestNeed.colors.mutedText};
`
const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 320px;
`
const ReviewItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: ${honestNeed.colors.surfaceAlt};
  font-size: 0.85rem;
  text-transform: capitalize;
  color: ${honestNeed.colors.text};
`
const Weight = styled.span`
  margin-left: auto;
  font-size: 0.72rem;
  font-weight: 700;
  color: ${honestNeed.colors.accentDark};
`
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
`
const NextBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 22px;
  border-radius: 999px;
  border: none;
  background: ${honestNeed.gradients.sky};
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
  &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(28,155,216,0.3); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`
const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 11px 18px;
  border-radius: 999px;
  border: 1px solid ${honestNeed.colors.border};
  background: ${honestNeed.colors.surface};
  color: ${honestNeed.colors.mutedText};
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
`
const SkipBtn = styled.button`
  padding: 11px 4px;
  border: none;
  background: none;
  color: ${honestNeed.colors.muted};
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { color: ${honestNeed.colors.text}; }
`

export default ProfileSetupWizard
