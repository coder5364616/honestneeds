'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import { Heart, MessageCircle, Flag, Trash2, Edit2, Send, CornerDownRight, Crown } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import {
  useCampaignComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
  useToggleCommentLike,
  useReportComment,
  useCommentReplies,
} from '@/api/hooks/useCampaignComments'
import {
  CampaignComment,
  ENCOURAGEMENT_OPTIONS,
  EncouragementKey,
} from '@/api/services/campaignCommentService'

// ─── Styled ──────────────────────────────────────────────────────────────────
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Count = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 100px;
`

const EncouragementBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const EncChip = styled.button<{ $disabled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 12px;
  border-radius: 100px;
  cursor: ${(p) => (p.$disabled ? 'not-allowed' : 'pointer')};
  opacity: ${(p) => (p.$disabled ? 0.5 : 1)};
  transition: all 0.15s ease;
  &:hover {
    border-color: #c4622d;
    background: #faeae1;
  }
`

const Composer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
`

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  min-height: 70px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #c4622d;
    box-shadow: 0 0 0 3px rgba(196, 98, 45, 0.12);
  }
`

const ComposerRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const SmallNote = styled.span`
  font-size: 12px;
  color: #9ca3af;
`

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4b5563;
  cursor: pointer;
`

const PostBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #c4622d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 16px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  &:hover { background: #9e4a1e; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Item = styled.div<{ $isReply?: boolean }>`
  display: flex;
  gap: 12px;
  padding: ${(p) => (p.$isReply ? '10px 0 0 0' : '0')};
`

const Avatar = styled.div<{ $url?: string }>`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => (p.$url ? `url(${p.$url}) center/cover` : 'linear-gradient(135deg,#C4622D,#9E4A1E)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
`

const Body = styled.div`
  flex: 1;
  min-width: 0;
`

const Bubble = styled.div`
  background: #fff;
  border: 1px solid #eceae5;
  border-radius: 12px;
  padding: 10px 14px;
`

const NameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
`

const Name = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #111827;
`

const CreatorTag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9e4a1e;
  background: #faeae1;
  padding: 1px 7px;
  border-radius: 100px;
`

const Time = styled.span`
  font-size: 12px;
  color: #9ca3af;
`

const Text = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  margin: 4px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
`

const EncBadge = styled.div`
  font-size: 14px;
  color: #4b5563;
  font-weight: 600;
  margin-top: 2px;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 6px 0 0 4px;
`

const ActionBtn = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
  color: ${(p) => (p.$active ? '#c4622d' : '#6b7280')};
  transition: color 0.15s ease;
  &:hover { color: #c4622d; }
  &:disabled { cursor: not-allowed; opacity: 0.6; }
`

const EmptyState = styled.div`
  padding: 32px 20px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 12px;
  font-size: 14px;
`

const initials = (name?: string) =>
  (name || 'A').trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

const timeAgo = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

interface CommentItemProps {
  campaignId: string
  comment: CampaignComment
  currentUserId?: string
  isCampaignCreator?: boolean
  onReply: (parentId: string) => void
}

const CommentItem: React.FC<CommentItemProps> = ({
  campaignId,
  comment,
  currentUserId,
  isCampaignCreator,
  onReply,
}) => {
  const [showReplies, setShowReplies] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.content || '')

  const { data: replies, isLoading: repliesLoading } = useCommentReplies(
    campaignId,
    comment._id,
    showReplies
  )
  const toggleLike = useToggleCommentLike(campaignId)
  const reportComment = useReportComment(campaignId)
  const deleteComment = useDeleteComment(campaignId)
  const updateComment = useUpdateComment(campaignId)

  const canModify = currentUserId && comment.user_id === currentUserId
  const canDelete = canModify || isCampaignCreator
  const encOption = comment.encouragement_key
    ? ENCOURAGEMENT_OPTIONS.find((o) => o.key === comment.encouragement_key)
    : null

  const handleSaveEdit = async () => {
    if (!editText.trim()) return
    await updateComment.mutateAsync({ commentId: comment._id, content: editText.trim() })
    setEditing(false)
  }

  return (
    <Item>
      <Avatar $url={comment.author_avatar_url}>{!comment.author_avatar_url && initials(comment.author_name)}</Avatar>
      <Body>
        <Bubble>
          <NameRow>
            <Name>{comment.author_name}</Name>
            {comment.is_creator && (
              <CreatorTag>
                <Crown size={10} /> Creator
              </CreatorTag>
            )}
            <Time>· {timeAgo(comment.created_at)}</Time>
          </NameRow>

          {encOption && <EncBadge>{encOption.emoji} {encOption.label}</EncBadge>}

          {editing ? (
            <div style={{ marginTop: 6 }}>
              <Textarea value={editText} maxLength={2000} onChange={(e) => setEditText(e.target.value)} />
              <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                <PostBtn onClick={handleSaveEdit} disabled={updateComment.isPending}>
                  Save
                </PostBtn>
                <ActionBtn onClick={() => { setEditing(false); setEditText(comment.content || '') }}>
                  Cancel
                </ActionBtn>
              </div>
            </div>
          ) : (
            comment.content && <Text>{comment.content}</Text>
          )}
        </Bubble>

        <Actions>
          <ActionBtn
            $active={comment.liked_by_me}
            onClick={() => currentUserId && toggleLike.mutate(comment._id)}
            disabled={!currentUserId || toggleLike.isPending}
            title={currentUserId ? 'Like' : 'Log in to like'}
          >
            <Heart size={14} fill={comment.liked_by_me ? '#c4622d' : 'none'} />
            {comment.like_count > 0 ? comment.like_count : 'Like'}
          </ActionBtn>

          {!comment.parent_id && (
            <ActionBtn onClick={() => onReply(comment._id)}>
              <MessageCircle size={14} />
              Reply
            </ActionBtn>
          )}

          {!comment.parent_id && comment.reply_count > 0 && (
            <ActionBtn onClick={() => setShowReplies((s) => !s)}>
              <CornerDownRight size={14} />
              {showReplies ? 'Hide' : `${comment.reply_count} ${comment.reply_count === 1 ? 'reply' : 'replies'}`}
            </ActionBtn>
          )}

          {canModify && comment.comment_type === 'comment' && (
            <ActionBtn onClick={() => setEditing(true)}>
              <Edit2 size={13} />
              Edit
            </ActionBtn>
          )}

          {canDelete && (
            <ActionBtn onClick={() => {
              if (confirm('Delete this comment?')) deleteComment.mutate(comment._id)
            }}>
              <Trash2 size={13} />
              Delete
            </ActionBtn>
          )}

          {currentUserId && !canModify && (
            <ActionBtn onClick={() => reportComment.mutate(comment._id)} disabled={reportComment.isPending}>
              <Flag size={13} />
              Report
            </ActionBtn>
          )}
        </Actions>

        {showReplies && (
          <div style={{ marginLeft: 8, marginTop: 6, borderLeft: '2px solid #f0eee9', paddingLeft: 12 }}>
            {repliesLoading ? (
              <LoadingSpinner />
            ) : (
              (replies || []).map((reply) => (
                <CommentItem
                  key={reply._id}
                  campaignId={campaignId}
                  comment={reply}
                  currentUserId={currentUserId}
                  isCampaignCreator={isCampaignCreator}
                  onReply={onReply}
                />
              ))
            )}
          </div>
        )}
      </Body>
    </Item>
  )
}

interface CampaignCommentsProps {
  campaignId: string
  isCreator?: boolean
}

/**
 * CA-15 — Campaign Comments & Encouragement
 * Public comment thread with quick encouragement reactions, replies, likes,
 * editing, deletion and reporting.
 */
export const CampaignComments: React.FC<CampaignCommentsProps> = ({ campaignId, isCreator = false }) => {
  const { user } = useAuthStore()
  const [text, setText] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const { data, isLoading } = useCampaignComments(campaignId, { sort: 'newest' })
  const createComment = useCreateComment(campaignId)

  const comments = data?.comments || []
  const total = data?.pagination?.total ?? comments.length

  const handlePost = async () => {
    if (!user) return
    if (!text.trim()) return
    await createComment.mutateAsync({
      content: text.trim(),
      is_anonymous: isAnonymous,
      parent_id: replyTo,
    })
    setText('')
    setReplyTo(null)
  }

  const handleEncouragement = async (key: EncouragementKey) => {
    if (!user) return
    await createComment.mutateAsync({ comment_type: 'encouragement', encouragement_key: key })
  }

  return (
    <Container>
      <Header>
        <Title>
          <MessageCircle size={20} /> Comments &amp; Encouragement
        </Title>
        <Count>{total}</Count>
      </Header>

      {user ? (
        <>
          <EncouragementBar>
            {ENCOURAGEMENT_OPTIONS.map((opt) => (
              <EncChip
                key={opt.key}
                onClick={() => handleEncouragement(opt.key)}
                disabled={createComment.isPending}
                $disabled={createComment.isPending}
              >
                <span>{opt.emoji}</span>
                {opt.label}
              </EncChip>
            ))}
          </EncouragementBar>

          <Composer>
            <Textarea
              placeholder={replyTo ? 'Write a reply…' : 'Share words of support or ask a question…'}
              value={text}
              maxLength={2000}
              onChange={(e) => setText(e.target.value)}
            />
            <ComposerRow>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                Post anonymously
              </CheckboxLabel>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {replyTo && (
                  <ActionBtn onClick={() => setReplyTo(null)}>Cancel reply</ActionBtn>
                )}
                <SmallNote>{text.length}/2000</SmallNote>
                <PostBtn onClick={handlePost} disabled={!text.trim() || createComment.isPending}>
                  <Send size={14} />
                  {createComment.isPending ? 'Posting…' : replyTo ? 'Reply' : 'Post'}
                </PostBtn>
              </div>
            </ComposerRow>
          </Composer>
        </>
      ) : (
        <EmptyState>Log in to leave a comment or send encouragement.</EmptyState>
      )}

      {isLoading ? (
        <LoadingSpinner />
      ) : comments.length > 0 ? (
        <List>
          {comments.map((c) => (
            <CommentItem
              key={c._id}
              campaignId={campaignId}
              comment={c}
              currentUserId={user?.id}
              isCampaignCreator={isCreator}
              onReply={(parentId) => {
                setReplyTo(parentId)
                if (typeof window !== 'undefined') window.scrollBy({ top: 0 })
              }}
            />
          ))}
        </List>
      ) : (
        <EmptyState>No comments yet. Be the first to send encouragement! 💛</EmptyState>
      )}
    </Container>
  )
}

export default CampaignComments
