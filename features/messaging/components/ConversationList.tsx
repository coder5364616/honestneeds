'use client'

import React from 'react'
import styled from 'styled-components'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Search } from 'lucide-react'
import { tk, font } from './tokens'
import type { Conversation, ConversationContext } from '@/types/messaging'

/**
 * ConversationList — left pane of the Messaging Center.
 * Presentational: receives conversations + selection callbacks.
 * Styled to match the Creator Dashboard design system.
 */

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${tk.white};
  border-right: 1px solid ${tk.border};
  font-family: ${font.body};
`

const Header = styled.div`
  padding: 1rem 1.125rem;
  border-bottom: 1px solid ${tk.border};
`

const Title = styled.h2`
  margin: 0 0 0.75rem 0;
  font-family: ${font.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${tk.heading};
`

const SearchBox = styled.div`
  position: relative;
  svg {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: ${tk.muted};
    width: 16px;
    height: 16px;
  }
`

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0.875rem 0.5rem 2rem;
  border: 1px solid ${tk.border};
  border-radius: 10px;
  font-family: ${font.body};
  font-size: 0.875rem;
  color: ${tk.heading};
  background: ${tk.canvasDeep};
  transition: border-color 140ms, background 140ms;
  &::placeholder { color: ${tk.muted}; }
  &:focus {
    outline: none;
    border-color: ${tk.amber};
    background: ${tk.white};
  }
`

const Filters = styled.div`
  display: flex;
  gap: 4px;
  margin: 0.75rem 1.125rem;
  padding: 4px;
  background: ${tk.canvasDeep};
  border-radius: 10px;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`

const Chip = styled.button<{ $active: boolean }>`
  flex: 0 0 auto;
  padding: 0.4rem 0.875rem;
  border-radius: 7px;
  border: none;
  font-family: ${font.body};
  font-size: 0.8rem;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  cursor: pointer;
  white-space: nowrap;
  background: ${({ $active }) => ($active ? tk.white : 'transparent')};
  color: ${({ $active }) => ($active ? tk.heading : tk.muted)};
  box-shadow: ${({ $active }) => ($active ? '0 1px 4px rgba(0,0,0,0.08)' : 'none')};
  transition: all 140ms ease;
  &:hover { color: ${tk.heading}; }
`

const ScrollArea = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
`

const Item = styled.li<{ $active: boolean; $unread: boolean }>`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1.125rem;
  cursor: pointer;
  border-bottom: 1px solid ${tk.canvasDeep};
  background: ${({ $active }) => ($active ? tk.amberLight : 'transparent')};
  border-left: 3px solid ${({ $active }) => ($active ? tk.amber : 'transparent')};
  transition: background 140ms ease;
  &:hover {
    background: ${({ $active }) => ($active ? tk.amberLight : tk.canvas)};
  }
`

const AvatarCircle = styled.div`
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: ${tk.amberMid};
  color: ${tk.ink};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${font.heading};
  font-weight: 700;
  font-size: 0.85rem;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
`

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
`

const Name = styled.span<{ $unread: boolean }>`
  font-size: 0.875rem;
  font-weight: ${({ $unread }) => ($unread ? 700 : 500)};
  color: ${tk.heading};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Time = styled.span`
  flex: 0 0 auto;
  font-family: ${font.mono};
  font-size: 0.68rem;
  color: ${tk.muted};
`

const Preview = styled.p<{ $unread: boolean }>`
  margin: 2px 0 0 0;
  font-size: 0.82rem;
  color: ${({ $unread }) => ($unread ? tk.body : tk.muted)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ContextTag = styled.span`
  display: inline-block;
  margin-top: 5px;
  font-family: ${font.mono};
  font-size: 0.62rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${tk.blue};
  background: ${tk.blueLight};
  border-radius: 100px;
  padding: 2px 8px;
`

const UnreadDot = styled.span`
  flex: 0 0 auto;
  align-self: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 100px;
  background: ${tk.amber};
  color: ${tk.ink};
  font-family: ${font.mono};
  font-size: 0.65rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  text-align: center;
  color: ${tk.muted};
  svg { color: ${tk.border}; }
`

const SkeletonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1.125rem;
  border-bottom: 1px solid ${tk.canvasDeep};
`
const Shimmer = styled.div<{ $w?: string; $h?: string; $round?: boolean }>`
  width: ${({ $w }) => $w ?? '100%'};
  height: ${({ $h }) => $h ?? '12px'};
  border-radius: ${({ $round }) => ($round ? '50%' : '100px')};
  background: linear-gradient(90deg, ${tk.canvasDeep} 25%, ${tk.border} 50%, ${tk.canvasDeep} 75%);
  background-size: 200% 100%;
  animation: sh 1.4s ease-in-out infinite;
  @keyframes sh { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
`

const CONTEXT_LABELS: Record<ConversationContext, string> = {
  direct: 'Direct',
  campaign: 'Campaign',
  volunteer: 'Volunteer',
  sponsor: 'Sponsor',
}

const FILTERS: { key: 'all' | ConversationContext; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'campaign', label: 'Campaign' },
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'volunteer', label: 'Volunteer' },
  { key: 'direct', label: 'Direct' },
]

function initials(name?: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface Props {
  conversations: Conversation[]
  activeId?: string
  isLoading: boolean
  search: string
  onSearch: (v: string) => void
  filter: 'all' | ConversationContext
  onFilter: (f: 'all' | ConversationContext) => void
  onSelect: (c: Conversation) => void
}

export function ConversationList({
  conversations,
  activeId,
  isLoading,
  search,
  onSearch,
  filter,
  onFilter,
  onSelect,
}: Props) {
  return (
    <Wrap>
      <Header>
        <Title>Messages</Title>
        <SearchBox>
          <Search size={16} />
          <SearchInput
            placeholder="Search conversations"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search conversations"
          />
        </SearchBox>
      </Header>

      <Filters role="tablist" aria-label="Filter conversations">
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            $active={filter === f.key}
            onClick={() => onFilter(f.key)}
          >
            {f.label}
          </Chip>
        ))}
      </Filters>

      <ScrollArea role="list">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonRow key={i}>
              <Shimmer $w="44px" $h="44px" $round />
              <div style={{ flex: 1 }}>
                <Shimmer $w="55%" $h="13px" />
                <div style={{ height: 8 }} />
                <Shimmer $w="85%" $h="11px" />
              </div>
            </SkeletonRow>
          ))
        ) : conversations.length === 0 ? (
          <Empty>
            <MessageSquare size={48} />
            <div>
              <strong style={{ color: tk.heading, fontFamily: font.heading }}>No conversations yet</strong>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>
                Messages from supporters, sponsors, and volunteers appear here.
              </p>
            </div>
          </Empty>
        ) : (
          conversations.map((c) => {
            const unread = c.unread_count > 0
            const name = c.other_participant?.display_name || 'Unknown'
            return (
              <Item
                key={c.conversation_id}
                role="listitem"
                $active={activeId === c.conversation_id}
                $unread={unread}
                onClick={() => onSelect(c)}
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelect(c)}
              >
                <AvatarCircle>
                  {c.other_participant?.avatar_url ? (
                    <img src={c.other_participant.avatar_url} alt={name} />
                  ) : (
                    initials(name)
                  )}
                </AvatarCircle>
                <ItemBody>
                  <Row>
                    <Name $unread={unread}>{name}</Name>
                    {c.last_message?.sent_at && (
                      <Time>
                        {formatDistanceToNow(new Date(c.last_message.sent_at), {
                          addSuffix: false,
                        })}
                      </Time>
                    )}
                  </Row>
                  <Preview $unread={unread}>
                    {c.last_message?.is_system && '• '}
                    {c.last_message?.body || 'No messages yet'}
                  </Preview>
                  {c.context_type !== 'direct' && (
                    <ContextTag>
                      {CONTEXT_LABELS[c.context_type]}
                      {c.campaign?.title ? ` · ${c.campaign.title}` : ''}
                    </ContextTag>
                  )}
                </ItemBody>
                {unread && <UnreadDot>{c.unread_count > 99 ? '99+' : c.unread_count}</UnreadDot>}
              </Item>
            )
          })
        )}
      </ScrollArea>
    </Wrap>
  )
}
