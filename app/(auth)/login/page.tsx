'use client'

import styled, { keyframes, createGlobalStyle } from 'styled-components'
import { useState, useEffect } from 'react'
import { clearSessionArtifacts } from '@/lib/api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Eye, EyeOff, Loader, AlertCircle, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import { loginSchema } from '@/utils/validationSchemas'
import { useLogin } from '@/api/hooks/useAuth'

// ─── Brand Tokens ──────────────────────────────────────────────────────────────
// Extracted from HonestNeed identity: warm amber-gold as primary, deep teal as
// secondary, warm whites for backgrounds — trustworthy, human, community-focused.
const tokens = {
  amber:     '#255eb3',
  amberDk:   '#2972df',
  amberLt:   '#c3cfe9',
  amberGlow: 'rgba(255, 255, 255, 0.18)',
  teal:      '#0D9488',
  tealDk:    '#0F766E',
  tealLt:    'rgba(13, 148, 136, 0.08)',
  ink:       '#1C1917',
  inkMid:    '#808080',
  inkSoft:   '#979797',
  inkXsoft:  '#9c9c9c',
  surface:   '#ffffff',
  surfaceAlt:'#dddddd',
  border:    '#e2e2e2',
  errorRed:  '#DC2626',
  errorBg:   'rgba(255, 131, 131, 0.06)',
  successGreen:'#059669',
  successBg:  'rgba(5, 150, 105, 0.06)',
  white:     '#FFFFFF',
}

// ─── Keyframes ─────────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
`

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33%       { transform: translateY(-8px) rotate(1deg); }
  66%       { transform: translateY(4px) rotate(-1deg); }
`

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`

const spinAnim = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`

// ─── Layout ────────────────────────────────────────────────────────────────────
const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${tokens.surface};
  background-image:
    radial-gradient(ellipse 80% 50% at 10% 0%,   rgba(245,158,11,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 60% at 90% 100%,  rgba(13,148,136,0.08) 0%, transparent 60%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Ccircle cx='30' cy='30' r='1' fill='%23F59E0B' fill-opacity='0.08'/%3E%3C/svg%3E");
  padding: 2rem 1.25rem;
  position: relative;
  overflow: hidden;
`

// Decorative floating circles — warm amber/teal bubbles in background
const BubbleBase = styled.div`
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  animation: ${float} ease-in-out infinite;
`

const Bubble1 = styled(BubbleBase)`
  width: 320px; height: 320px;
  top: -80px; right: -80px;
  background: radial-gradient(circle at 40% 40%, rgba(245,158,11,0.15), rgba(245,158,11,0.02));
  animation-duration: 14s;
`

const Bubble2 = styled(BubbleBase)`
  width: 200px; height: 200px;
  bottom: -40px; left: -60px;
  background: radial-gradient(circle at 60% 60%, rgba(13,148,136,0.12), rgba(13,148,136,0.02));
  animation-duration: 18s;
  animation-delay: -6s;
`

const Bubble3 = styled(BubbleBase)`
  width: 120px; height: 120px;
  top: 45%; left: 5%;
  background: radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%);
  animation-duration: 22s;
  animation-delay: -10s;
`

const Wrap = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  animation: ${fadeUp} 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
`

// ─── Logo & Header ──────────────────────────────────────────────────────────────
const Header = styled.header`
  text-align: center;
  margin-bottom: 2.25rem;
  animation: ${fadeIn} 0.5s ease both;
`

const LogoWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`

const LogoImg = styled.div`
  position: relative;
  width: 160px;
  height: 80px;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.12));
  transition: transform 300ms ease, filter 300ms ease;

  &:hover {
    transform: scale(1.04);
    filter: drop-shadow(0 6px 18px rgba(0,0,0,0.18));
  }
`

const Title = styled.h1`
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: clamp(1.75rem, 5vw, 2.25rem);
  font-weight: 700;
  color: ${tokens.ink};
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
  line-height: 1.15;
`

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${tokens.inkSoft};
  font-weight: 400;
  margin: 0;
  line-height: 1.5;
`

// ─── Card ───────────────────────────────────────────────────────────────────────
const Card = styled.div`
  background: ${tokens.white};
  border-radius: 20px;
  padding: 2rem;
  border: 1.5px solid ${tokens.border};
  box-shadow:
    0 1px 3px rgba(0,0,0,0.04),
    0 8px 32px rgba(28,25,23,0.07),
    0 0 0 1px rgba(245,158,11,0.04) inset;
  animation: ${fadeUp} 0.6s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both;

  @media (min-width: 480px) {
    padding: 2.5rem;
  }
`

// ─── Form ────────────────────────────────────────────────────────────────────────
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`

const FieldRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${tokens.inkMid};
  letter-spacing: 0.01em;
`

const ForgotLink = styled(Link)`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${tokens.teal};
  text-decoration: none;
  transition: color 150ms;

  &:hover { color: ${tokens.tealDk}; text-decoration: underline; }
`

const InputBox = styled.div`
  position: relative;
`

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: ${tokens.ink};
  background: ${tokens.surface};
  border: 1.5px solid ${tokens.border};
  border-radius: 10px;
  transition: border-color 180ms, box-shadow 180ms, background 180ms;
  outline: none;
  box-sizing: border-box;

  &::placeholder { color: ${tokens.inkXsoft}; }

  &:hover:not(:disabled) {
    border-color: #D6D3D1;
    background: ${tokens.white};
  }

  &:focus {
    border-color: ${tokens.borderFocus};
    background: ${tokens.white};
    box-shadow: 0 0 0 3px ${tokens.amberGlow};
  }

  &[aria-invalid='true'] {
    border-color: ${tokens.errorRed};
    background: ${tokens.errorBg};
    &:focus { box-shadow: 0 0 0 3px rgba(220,38,38,0.12); }
  }

  &:disabled { opacity: 0.55; cursor: not-allowed; }
`

const PasswordInput = styled(Input)`
  padding-right: 3rem;
`

const EyeBtn = styled.button`
  position: absolute;
  right: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: ${tokens.inkXsoft};
  padding: 0.2rem;
  display: flex;
  align-items: center;
  transition: color 150ms;

  &:hover { color: ${tokens.inkMid}; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`

const ErrorMsg = styled.p`
  font-size: 0.8125rem;
  color: ${tokens.errorRed};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin: 0;
`

// ─── Submit Button ─────────────────────────────────────────────────────────────
const SubmitBtn = styled.button`
  width: 100%;
  padding: 0.875rem 1.5rem;
  margin-top: 0.5rem;
  border-radius: 11px;
  border: none;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  letter-spacing: 0.01em;
  position: relative;
  overflow: hidden;
  transition: transform 150ms, box-shadow 150ms, opacity 150ms;

  background: linear-gradient(135deg, ${tokens.amber} 0%, ${tokens.amberDk} 100%);
  color: white;
  box-shadow: 0 4px 16px ${tokens.amberGlow};

  /* Shimmer overlay */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 30%,
      rgba(255,255,255,0.25) 50%,
      transparent 70%
    );
    background-size: 200% 100%;
    opacity: 0;
    transition: opacity 200ms;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(245,158,11,0.35);
    &::before { opacity: 1; animation: ${shimmer} 0.8s linear; }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px ${tokens.amberGlow};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
  }

  svg.spin { animation: ${spinAnim} 1s linear infinite; }
`

const ArrowIcon = styled(ArrowRight)`
  transition: transform 200ms;
  ${SubmitBtn}:hover:not(:disabled) & { transform: translateX(3px); }
`

// ─── Divider ───────────────────────────────────────────────────────────────────
const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1.5rem 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${tokens.border};
  }

  span {
    font-size: 0.75rem;
    font-weight: 700;
    color: ${tokens.inkXsoft};
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
`

const SocialNote = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${tokens.inkSoft};
  margin: 0;
  padding: 0.625rem 1rem;
  background: ${tokens.surfaceAlt};
  border-radius: 8px;
  border: 1px dashed ${tokens.border};
`

// ─── Footer ────────────────────────────────────────────────────────────────────
const Footer = styled.footer`
  margin-top: 1.5rem;
  text-align: center;
  animation: ${fadeIn} 0.5s 0.15s ease both;
`

const FooterText = styled.p`
  font-size: 0.9375rem;
  color: ${tokens.inkSoft};
  margin: 0 0 0.75rem;
`

const FooterLink = styled(Link)`
  font-weight: 700;
  color: ${tokens.teal};
  text-decoration: none;
  transition: color 150ms;
  &:hover { color: ${tokens.tealDk}; text-decoration: underline; }
`

const SupportLink = styled(Link)`
  display: inline-block;
  font-size: 0.8125rem;
  color: ${tokens.inkXsoft};
  text-decoration: none;
  transition: color 150ms;
  &:hover { color: ${tokens.inkSoft}; }
`

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { mutate: login, isPending } = useLogin()

  // Arriving with ?expired=1 means the API rejected this browser's tokens
  // (e.g. rotated signing key). Purge every stale session artifact — cookies
  // included — so proxy.ts can't bounce the user back to a dead /dashboard
  // and the login form actually works.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.has('expired')) {
      clearSessionArtifacts()
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',
  })

  const email = watch('email')
  const password = watch('password')
  const hasErrors = Object.keys(errors).length > 0

  const onSubmit = (data) => {
    login({ email: data.email, password: data.password, staySignedIn: false })
  }

  return (
    <Page>
      <Bubble1 />
      <Bubble2 />
      <Bubble3 />

      <Wrap>
        <Header>
          <LogoWrapper>
            <LogoImg>
              <Image
                src="/1000019752.png"
                alt="HonestNeed — Get Your Needs Filled"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </LogoImg>
          </LogoWrapper>
          <Title>Welcome back</Title>
          <Subtitle>Sign in to continue making a difference</Subtitle>
        </Header>

          <Form onSubmit={handleSubmit(onSubmit)}>
            {/* Email */}
            <FieldGroup>
              <Label htmlFor="email">Email address</Label>
              <InputBox>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={isPending}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                />
              </InputBox>
              {errors.email && (
                <ErrorMsg id="email-error">
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {errors.email.message}
                </ErrorMsg>
              )}
            </FieldGroup>

            {/* Password */}
            <FieldGroup>
              <FieldRow>
                <Label htmlFor="password">Password</Label>
                <ForgotLink href="/forgot-password">Forgot password?</ForgotLink>
              </FieldRow>
              <InputBox>
                <PasswordInput
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  disabled={isPending}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  {...register('password')}
                />
                <EyeBtn
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isPending}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </EyeBtn>
              </InputBox>
              {errors.password && (
                <ErrorMsg id="password-error">
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  {errors.password.message}
                </ErrorMsg>
              )}
            </FieldGroup>

            {/* Submit */}
            <SubmitBtn
              type="submit"
              disabled={isPending || !email || !password || hasErrors}
            >
              {isPending ? (
                <>
                  <Loader size={18} className="spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowIcon size={18} />
                </>
              )}
            </SubmitBtn>
          </Form>

          <Divider><span>or</span></Divider>

          <SocialNote>Social login coming soon — check back!</SocialNote>
        

        <Footer>
          <FooterText>
            Don&apos;t have an account?{' '}
            <FooterLink href="/register">Create one free</FooterLink>
          </FooterText>
          <SupportLink href="/contact">Need help? Contact support</SupportLink>
        </Footer>
      </Wrap>
    </Page>
  )
}