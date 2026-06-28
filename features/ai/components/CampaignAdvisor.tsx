'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { MessageCircle, Send, Lightbulb } from 'lucide-react'
import { Button } from '@/components/Button'
import { useAdvise } from '@/api/hooks/useAI'
import {
  AICard,
  AICardTitle,
  AICardSubtitle,
  AITextArea,
  AIBadge,
  AISkeleton,
  AIEmptyState,
} from './shared'

/**
 * AI-01 — AI Responder / Campaign Advisor
 * A Q&A panel where a creator asks how to improve or run their campaign and
 * gets grounded advice plus concrete next steps.
 */

const Row = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
`

const Answer = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: #faf5ff;
  border: 1px solid #ede9fe;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #1f2937;
  white-space: pre-wrap;
`

const SuggestionList = styled.ul`
  margin: 14px 0 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SuggestionItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
`

export function CampaignAdvisor({ campaignId }: { campaignId?: string }) {
  const [question, setQuestion] = useState('')
  const advise = useAdvise()
  const result = advise.data

  const handleAsk = () => {
    if (!question.trim()) return
    advise.mutate({ question: question.trim(), campaignId })
  }

  return (
    <AICard>
      <AICardTitle>
        <MessageCircle size={20} color="#7c3aed" /> Campaign Advisor <AIBadge />
      </AICardTitle>
      <AICardSubtitle>
        Ask anything about running or improving your campaign — fundraising strategy, sharing,
        updates, or your story.
      </AICardSubtitle>

      <AITextArea
        placeholder="e.g. How can I get more shares in my first week?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        maxLength={2000}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleAsk()
        }}
      />
      <Row>
        <Button
          variant="primary"
          size="md"
          onClick={handleAsk}
          disabled={advise.isPending || !question.trim()}
        >
          <Send size={16} style={{ marginRight: 6 }} />
          {advise.isPending ? 'Thinking…' : 'Ask Advisor'}
        </Button>
      </Row>

      {advise.isPending && (
        <div style={{ marginTop: 20 }}>
          <AISkeleton $h={14} />
          <AISkeleton $h={14} />
          <AISkeleton $h={14} />
        </div>
      )}

      {advise.isError && !advise.isPending && (
        <div style={{ marginTop: 16 }}>
          <AIEmptyState message="Couldn't reach the advisor. Please try again in a moment." />
        </div>
      )}

      {result && !advise.isPending && (
        <>
          <Answer>{result.answer}</Answer>
          {result.suggestions.length > 0 && (
            <SuggestionList>
              {result.suggestions.map((s, i) => (
                <SuggestionItem key={i}>
                  <Lightbulb size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>{s}</span>
                </SuggestionItem>
              ))}
            </SuggestionList>
          )}
        </>
      )}
    </AICard>
  )
}
