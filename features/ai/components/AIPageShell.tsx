'use client'

import React from 'react'
import styled from 'styled-components'
import { Sparkles } from 'lucide-react'
import { useAIStatus } from '@/api/hooks/useAI'
import { AIUnavailableNotice } from './shared'

/**
 * Shared page chrome for AI route pages: a max-width container, a gradient
 * header, and an automatic "limited mode" banner driven by GET /api/ai/status.
 */

const Container = styled.div`
  max-width: 920px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 20px 64px;
  min-height: 100vh;
  background: #f7f5f1;
  overflow-x: hidden;

  @media (max-width: 640px) {
    padding: 20px 16px 48px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`

const IconBadge = styled.div`
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  margin: 0;
`

const Subtitle = styled.p`
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 24px 0;
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
`

export function AIPageShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  const { data: status } = useAIStatus()
  const limited = status && !status.enabled

  return (
    <Container>
      <Header>
        <IconBadge>
          <Sparkles size={24} color="#fff" />
        </IconBadge>
        <div>
          <Title>{title}</Title>
        </div>
      </Header>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}

      {limited && (
        <div style={{ marginBottom: 20 }}>
          <AIUnavailableNotice />
        </div>
      )}

      <Stack>{children}</Stack>
    </Container>
  )
}
