'use client'

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { tk, font } from './tokens'

/**
 * TypingIndicator — animated three-dot "typing…" bubble shown in a thread
 * when the other participant is composing.
 */

const blink = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 2px 1.125rem 0.5rem;
  background: ${tk.canvas};
`

const Bubble = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: ${tk.white};
  border: 1px solid ${tk.border};
  padding: 10px 14px;
  border-radius: 16px;
  border-bottom-left-radius: 6px;
`

const Dot = styled.span<{ $delay: string }>`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${tk.muted};
  animation: ${blink} 1.2s infinite ease-in-out;
  animation-delay: ${({ $delay }) => $delay};
`

const Label = styled.span`
  font-family: ${font.mono};
  font-size: 0.68rem;
  color: ${tk.muted};
`

export function TypingIndicator({ name }: { name?: string }) {
  return (
    <Row aria-live="polite">
      <Bubble>
        <Dot $delay="0s" />
        <Dot $delay="0.2s" />
        <Dot $delay="0.4s" />
      </Bubble>
      <Label>{name ? `${name} is typing…` : 'typing…'}</Label>
    </Row>
  )
}
