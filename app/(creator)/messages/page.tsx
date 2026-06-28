'use client'

import { Suspense } from 'react'
import styled, { createGlobalStyle } from 'styled-components'
import { MessagingCenter } from '@/features/messaging'
import { tk, font } from '@/features/messaging/components/tokens'

/**
 * Creator Messaging Center route.
 * Wrapped under (creator) layout's ProtectedRoute (creator/admin).
 * Design system mirrors the Creator Dashboard (ink + amber/blue, Syne/DM Sans).
 */

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
`

// Full-width canvas matching the Creator Dashboard background (#F7F5F1)
const Canvas = styled.div`
  background: ${tk.canvas};
  min-height: 100vh;
  font-family: ${font.body};
  color: ${tk.body};
`

const Inner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: clamp(1.25rem, 3vw, 2rem);
  @media (max-width: 767px) {
    padding: 0.75rem;
  }
`

const Heading = styled.div`
  margin-bottom: 1.5rem;
`
const Greeting = styled.div`
  font-family: ${font.mono};
  font-size: 0.72rem;
  font-weight: 400;
  color: ${tk.muted};
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 4px;
`
const H1 = styled.h1`
  margin: 0;
  font-family: ${font.heading};
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, ${tk.heading} 0%, ${tk.blue} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`
const Sub = styled.p`
  margin: 0.375rem 0 0;
  color: ${tk.muted};
  font-size: 0.875rem;
`

export default function MessagesPage() {
  return (
    <>
      <GlobalStyle />
      <Canvas>
        <Inner>
          <Heading>
            <Greeting>Inbox</Greeting>
            <H1>Messages</H1>
            <Sub>Connect with supporters, sponsors, and volunteers in one place.</Sub>
          </Heading>
          <Suspense
            fallback={
              <div style={{ padding: '1.5rem', color: tk.muted }}>Loading…</div>
            }
          >
            <MessagingCenter />
          </Suspense>
        </Inner>
      </Canvas>
    </>
  )
}
