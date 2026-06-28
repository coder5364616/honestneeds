import { redirect } from 'next/navigation'

/**
 * Legacy/compat redirect: the messaging center opens a conversation via the
 * `?c=` query param (`/messages?c=<id>`), not a path segment. Some links —
 * notably older `new_message` notifications — point at `/messages/<id>`.
 * Forward them so they don't 404.
 */
export default async function MessageConversationRedirect({
  params,
}: {
  params: Promise<{ conversationId: string }>
}) {
  const { conversationId } = await params
  redirect(`/messages?c=${encodeURIComponent(conversationId)}`)
}
