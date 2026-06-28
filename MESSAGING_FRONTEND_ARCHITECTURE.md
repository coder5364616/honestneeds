# HonestNeed — Messaging & Notifications Frontend Architecture

**Audience:** Frontend team, product, QA
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · styled-components 6 · @tanstack/react-query 5 · Framer Motion 12 · Zustand 5 · socket-style realtime over raw `ws`
**Design system source of truth:** `lib/theme.ts` (Indigo `#6366F1` primary, serif type scale, 4px spacing grid)
**Backend source of truth:** `honestneed-backend` (`src/routes/messageRoutes.js`, `src/routes/notificationRoutes.js`, `src/websocket/NotificationService.js`)

---

## 1. Backend Analysis Report

### 1.1 Direct Messaging API (MS-01 / MS-07 / MS-08) — **fully implemented**

Mounted at `/api/messages`, all routes require `authMiddleware` (Bearer JWT). One 1:1 thread per participant-pair **per context** (`context_type` ∈ `direct | campaign | volunteer | sponsor`). This single system serves supporter↔creator (MS-01), volunteer coordination (MS-07), and sponsor (MS-08) by switching `context_type`.

| Method | Endpoint | Purpose | Response |
|--------|----------|---------|----------|
| POST | `/api/messages/conversations` | Start/get thread (+ optional first message) | `{ conversation, sent_message }` |
| GET | `/api/messages/conversations` | List my conversations | `data[]` + `pagination` |
| GET | `/api/messages/conversations/:id` | Conversation detail | shaped conversation |
| GET | `/api/messages/conversations/:id/messages` | List messages (newest-first) | `data[]` + `pagination` |
| POST | `/api/messages/conversations/:id/messages` | Send message | created message |
| PATCH | `/api/messages/conversations/:id/read` | Mark read | `{ marked }` |
| PATCH | `/api/messages/conversations/:id/archive` | Archive/unarchive `{archived}` | `{ archived }` |
| PATCH | `/api/messages/conversations/:id/mute` | Mute/unmute `{muted}` | `{ muted }` |
| PATCH | `/api/messages/conversations/:id/block` | Block/unblock `{blocked}` | `{ blocked, conversation_status }` |
| DELETE | `/api/messages/conversations/:id` | Soft-delete thread for me | `{ deleted }` |
| PATCH | `/api/messages/messages/:messageId` | Edit message `{body}` | updated message |
| DELETE | `/api/messages/messages/:messageId?scope=everyone` | Delete message | `{ deleted, scope }` |
| GET | `/api/messages/unread-count` | Global unread total | `{ unread_count }` |

**Envelope:** every response is `{ success, message?, data, pagination? }` or `{ success:false, error:{ code, message, details? } }` — identical to existing services, so `apiClient` + `response.data.data` extraction applies unchanged.

**Conversation shape (per-user "shaped" object):**
```
id, conversation_id, context_type, campaign (populated {title} | null),
subject, status, other_participant ({_id, display_name, avatar_url, role}),
last_message ({body, sender_id, sent_at, is_system}),
message_count, unread_count, archived, muted, is_blocked, created_at, updated_at
```
**Message shape:** `message_id, conversation_id, sender_id, recipient_id, body, attachments[], is_system, delivered, read, read_at, edited, edited_at, created_at`.

**Server-side semantics already handled (do not reimplement client-side):** per-participant unread counters, read-receipt stamping, soft-delete/restore on new message, block gating, pair-key dedupe.

### 1.2 Notification API (MS-03) — **partial**

Mounted at `/api/notifications` (all auth-protected):

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/preferences` | Returns **hardcoded defaults** (not yet persisted) |
| POST | `/preferences` | Accepts `{preferences}` but **does not persist** (TODO in code) |
| GET | `/activity?limit&offset&filter` | Feed via `ActivityFeedService` + `unreadCount` |
| POST | `/activity/:id/read` | Mark one read |
| POST | `/activity/read-all` | Mark all read |
| POST | `/activity/:id/archive` | Archive |
| GET | `/unread-count` | Unread notifications |
| GET | `/settings` | Activity filters |

There is also a richer `Notification` Mongoose model (in-app, typed: `donation_received`, `goal_reached`, `new_message`, …) with TTL + delivery-channel tracking, but **it is not yet exposed through a clean paginated list endpoint** — the routes use `ActivityFeedService`. See Gap Analysis.

### 1.3 Real-time architecture — **functional but mismatched with current client**

- Backend runs a **raw `ws` server** (not socket.io) via `src/websocket/NotificationService.js` at **path `/api/notifications`**, authenticated by a **query param `?token=<value>`**, where the value is currently used **directly as the userId** (`url.searchParams.get('token')`).
- Server pushes JSON frames `{ type, data, timestamp }`. Messaging emits:
  - `new_message` → `{ conversation_id, message_id, sender_id, sender_name, body, attachments, is_system, context_type, campaign_id, created_at }`
  - `messages_read` → `{ conversation_id, read_by, read_at }`
  - plus existing `donation_received`, `milestone_reached`, etc.
- Offline users get a **server-side queue** (replayed on connect).
- **The existing `hooks/useWebSocket.ts` uses `socket.io-client`** pointed at the API root — this will **not** connect to the raw `ws` server. This is the single most important integration gap (see §2).

### 1.4 Campaign Updates (MS-02) — **implemented**
`/api/campaigns/:id/updates` CRUD exists; frontend `campaignUpdateService.ts` + `useCampaignUpdates.ts` already consume it. What's missing is the **notification fan-out + supporter subscription UI**, not the data layer.

### 1.5 Email (MS-04) — **backend-only**
`emailService.sendNewMessageEmail`, donation/welcome/reset emails exist. Frontend scope = a **preferences toggle** only (no rendering surface).

### 1.6 Need Now (MS-06) — **not implemented in backend**
No models/routes exist. Frontend = **design spec only**; do not build live integration until backend ships `/api/need-now/*`.

---

## 2. Gap Analysis

| # | Gap | Severity | Resolution |
|---|-----|----------|-----------|
| G1 | Client uses `socket.io-client`; server is raw `ws` at `/api/notifications?token=` | **Blocker** for realtime | Add `hooks/useMessagingSocket.ts` (native `WebSocket`). **Backend fix required:** verify JWT from the query param and derive `userId` instead of trusting it raw (security). Ship hook to send JWT; coordinate the 1-line backend change. |
| G2 | `/notifications/preferences` not persisted | High | Backend: persist to `NotificationPreferences` model (exists). Frontend builds against the contract regardless. |
| G3 | No paginated list of `Notification` documents (only `ActivityFeedService` feed) | Medium | Prefer `/activity` for the dropdown now; request `GET /api/notifications/list` for typed message/donation notifications. Frontend abstracts both behind `notificationService`. |
| G4 | No typing-indicator transport | Low (P2) | Add lightweight `typing` ws frame later; UI built to accept it, degrades gracefully. |
| G5 | No Web Push (VAPID/service worker) for MS-05 | Medium (P1) | Phase 3: add `public/sw.js` + push subscription endpoint. Until then use in-tab `Notification` API (already pattern in `useWebSocket.ts`). |
| G6 | No "find user to message" / recipient discovery endpoint | Medium | Conversations are started from context (campaign page → creator, sponsor inquiry → campaign owner). No global user search needed for v1; revisit for admin. |
| G7 | Need Now backend absent (MS-06) | N/A | Design-only; gate the route behind a feature flag. |

**Already supported by backend (build UI now):** full conversation/message lifecycle, unread counts, archive/mute/block, read receipts, real-time message + read events, campaign updates.

---

## 3. UX Audit (current dashboard)

- **Strengths to inherit:** consistent card system (`components/ui/Card.tsx`), Skeleton primitive, toast via `react-toastify`, React Query key-factory convention, `ProtectedRoute` role gating, Framer Motion available.
- **Hook already anticipated:** `DashboardHeader` exposes `unreadCount` + `onNotificationsClick` ("Phase 4: Notifications") — wire the bell here.
- **Inconsistencies to avoid:** mixed `.js`/`.tsx` UI primitives (`Button.js` vs `Button.tsx`). **Decision:** new messaging code is **100% `.tsx`**, imports the typed primitives (`Card.tsx`, `Skeleton.tsx`, `Badge.tsx`, `Avatar` via thin wrapper).
- **Gap:** no global persistent app shell with a top bar across all dashboards → place the bell in `DashboardHeader` + a floating launcher consistent with the existing `BackgroundMusicPlayer` (bottom-docked) per the platform's "AI Responder next to music player" pattern.

---

## 4. User Flow Diagrams

**4.1 Supporter → Creator (MS-01)**
```
Campaign page  ──"Message creator"──▶  startConversation({recipient_id: creatorId, context_type:'campaign', campaign_id})
      │                                          │ 201 created (or 200 existing)
      ▼                                          ▼
 Composer opens in Messaging Center  ◀── optimistic thread inserted ── route /creator/messages?c=<conversation_id>
      │ send                                     │
      ▼                                          ▼
 optimistic message (status: sending) ──POST──▶ server ──ws:new_message──▶ creator's open clients + unread badge
```

**4.2 Receive while elsewhere**
```
ws frame new_message ─▶ useMessagingSocket ─▶ qc.setQueryData(conversations) bump + qc.invalidate(unreadCount)
                                            └▶ toast + (optional) Notification API + sound
```

**4.3 Read receipt**
```
Open thread ─▶ markRead mutation ─▶ unread→0 (optimistic) ─▶ ws messages_read ─▶ sender sees ✓✓
```

**4.4 Sponsor inquiry (MS-08)** — same as 4.1 with `context_type:'sponsor'` initiated from a campaign's "Sponsor this campaign" CTA.
**4.5 Volunteer coordination (MS-07)** — initiated from an accepted Volunteer Offer with `context_type:'volunteer'`, `campaign_id`.

---

## 5. Information Architecture

```
/(creator)/messages                 Messaging Center (list + thread, responsive master-detail)
/(creator)/messages/[conversationId] Deep-link to a thread (same screen, detail focused on mobile)
/(creator)/notifications            Full notifications page (filters, grouping, mark-all)
Global: NotificationBell (in DashboardHeader)      → dropdown panel
Global: MessagesLauncher (bottom-docked, optional) → quick inbox peek
```
Supporter/sponsor/volunteer access the **same** Messaging Center under their route groups via a shared feature module (`features/messaging`), so there is one implementation, many entry points.

---

## 6. Messaging System Design

**Layout — desktop (≥1024px): master-detail**
```
┌───────────────────────────────────────────────────────────┐
│ Messages                              [search]  [filter ▾]  │
├──────────────┬────────────────────────────────────────────┤
│ Conversation │  ◀ Ada Lovelace · Campaign: Clean Water     │
│ list (360px) │     online ·  ⋮ (mute/block/archive)        │
│  • item      ├────────────────────────────────────────────┤
│  • item●(2)  │   [day divider]                             │
│  • item      │   ░ incoming bubble                         │
│  ...         │            outgoing bubble ✓✓ ░             │
│              │   [typing…]                                 │
│              ├────────────────────────────────────────────┤
│              │  [＋] [ message…                 ] [Send ➤] │
└──────────────┴────────────────────────────────────────────┘
```
**Mobile (<768px):** single column. List view → tap → thread view (slide-in, Framer Motion `x: 100%→0`). Back chevron returns. Composer pinned with `dvh` + safe-area insets.

**Bubbles:** outgoing `colors.primary` bg / white text, radius `borderRadius.xl` with tail corner squared; incoming `#F1F5F9`/`colors.text`. Status ticks: `sending`(clock)→`sent`(✓)→`read`(✓✓ in primary). Edited → "· edited". Attachments render image grid or file chip. System messages = centered pill, muted.

**States:** Skeleton list (6 shimmer rows) + thread skeleton; empty ("No conversations yet" illustration + "Messages from supporters appear here"); error (retry button); offline banner when ws drops.

---

## 7. Notification System Design

**Bell** in `DashboardHeader`: icon + count badge (`99+` cap, `colors.secondary`). Click → **dropdown panel** (Framer Motion scale/opacity, focus-trapped):
```
Notifications                       [Mark all read]
─────────────────────────────────────────────────
Today
 💬  New message from Ada            · 2m   ●
 💰  $50 donation to Clean Water     · 1h
Earlier
 🎯  Goal 80% reached                · 2d
─────────────────────────────────────────────────
              View all notifications →
```
Rows: emoji/icon (from `Notification.icon_emoji`/`color`), title, body (1 line clamp), relative time (`date-fns`), unread dot. Click → `action_url` route + mark read. Grouping by day; filter chips (All / Messages / Donations / Campaigns / System). Settings gear → preferences (channels: in-app, email, push; quiet hours; per-type toggles) consuming `/preferences`.

---

## 8. Mobile Experience Design
- Master-detail collapses to stack; thread is a full-screen route on `<768px`.
- Composer uses `100dvh`, `env(safe-area-inset-bottom)`, auto-grow textarea (max 5 lines), no layout jump on keyboard.
- Touch targets ≥44px; swipe-left on a conversation row → quick actions (archive/mute).
- Bell dropdown becomes a bottom sheet on mobile.
- Virtualized lists for long threads (windowing) to keep 60fps.

## 9. Desktop Experience Design
- Persistent two-pane; thread retains scroll position per conversation.
- Keyboard: `↑/↓` move selection, `Enter` open, `Esc` close panels, `Cmd/Ctrl+Enter` send, `e` edit own last message.
- Hover affordances (timestamp reveal, message action menu). Multi-tab sync via React Query cache + ws.

---

## 10. Component Architecture

```
features/messaging/
  components/
    MessagingCenter.tsx          // orchestrator (responsive master-detail)
    ConversationList.tsx
    ConversationListItem.tsx
    ConversationSearch.tsx
    ConversationFilters.tsx      // context_type + unread/archived
    MessageThread.tsx            // header + virtualized messages + composer
    MessageThreadHeader.tsx      // avatar, presence, ⋮ menu
    MessageBubble.tsx
    MessageGroup.tsx             // groups consecutive same-sender
    MessageComposer.tsx          // textarea, attachments, optimistic send
    TypingIndicator.tsx
    ReadReceipt.tsx
    AttachmentPreview.tsx
    EmptyState.tsx / ThreadSkeleton.tsx / ConversationSkeleton.tsx
  index.ts

features/notifications/
  components/
    NotificationBell.tsx
    NotificationDropdown.tsx
    NotificationItem.tsx
    NotificationGroup.tsx
    NotificationFilters.tsx
    NotificationSettings.tsx
    NotificationsPage.tsx
  index.ts
```
All leaf components are presentational + typed props; data flows from hooks at the screen level. Reuse `components/ui/{Card,Badge,Skeleton}.tsx` and `lib/theme.ts` tokens (no hardcoded colors).

---

## 11. API Integration Plan

- **Client:** reuse `apiClient` from `@/lib/api` (auth header, retry, 401 handling already done).
- **Services:** `api/services/messagingService.ts`, `api/services/notificationService.ts` — thin, typed, return `response.data.data`, mirror the response envelope. (Implemented in this PR.)
- **Realtime:** `hooks/useMessagingSocket.ts` (native `WebSocket` to `${WS_BASE}/api/notifications?token=<jwt>`), reconnect w/ backoff, routes frames into React Query cache. (Implemented.)
- **Env:** add `NEXT_PUBLIC_WS_URL` (e.g. `wss://api.honestneed.com`); fall back to deriving from `NEXT_PUBLIC_API_URL`.

---

## 12. Folder Structure (additions)

```
api/services/messagingService.ts        ✅ implemented
api/services/notificationService.ts     ✅ implemented
api/hooks/useMessaging.ts               ✅ implemented
api/hooks/useNotifications.ts           ✅ implemented
hooks/useMessagingSocket.ts             ✅ implemented (realtime gap fix)
types/messaging.ts                      ✅ implemented
features/messaging/**                    ▶ implemented: core (Center/List/Thread/Composer/Bubble/states)
features/notifications/**                ▶ implemented: Bell + Dropdown + Item
app/(creator)/messages/page.tsx          ✅ implemented
app/(creator)/messages/[conversationId]/page.tsx   (thin wrapper → MessagingCenter)
app/(creator)/notifications/page.tsx     ▶ spec (reuses NotificationsPage)
```

---

## 13. React Query Strategy

**Key factories** (mirrors existing convention):
```ts
messageKeys = {
  all: ['messages'],
  conversations: (f) => ['messages','conversations', f ?? {}],
  conversation: (id) => ['messages','conversation', id],
  thread: (id) => ['messages','thread', id],       // useInfiniteQuery
  unread: () => ['messages','unread-count'],
}
notificationKeys = {
  all: ['notifications'],
  list: (f) => ['notifications','list', f ?? {}],
  unread: () => ['notifications','unread-count'],
  preferences: () => ['notifications','preferences'],
}
```
- **Conversation list:** `useQuery`, `staleTime 30s`, kept fresh by ws bumps.
- **Thread:** `useInfiniteQuery` (newest-first pages, `getNextPageParam` from `pagination.hasMore` → page+1); render reversed.
- **Send:** `useMutation` with **optimistic** message (temp `message_id`, status `sending`), `onError` rollback + toast, `onSettled` invalidate thread + unread + conversations.
- **Mark read:** optimistic `unread_count→0` on the cached conversation; invalidate global unread.
- **Realtime reconciliation:** ws `new_message` → `setQueryData(thread)` append if active, always `setQueryData(conversations)` (move to top, bump unread) + `invalidateQueries(unread)`. Dedupe by `message_id`.
- **Unread badge:** `useQuery(unread)` `staleTime 0`, refetch on focus, plus ws-driven invalidation.

## 14. State Management Plan

- **Server state:** React Query (single source for conversations/messages/notifications).
- **Ephemeral UI state:** local `useState`/`useReducer` (composer draft, selected conversation on desktop, panel open).
- **Cross-cutting tiny global:** Zustand slice `messagingUiStore` (active conversationId for desktop sync, drafts map keyed by conversationId, socket connection status) — consistent with existing `store/*`.
- **No Redux.** Drafts persisted to `sessionStorage` so refresh keeps in-progress text.

## 15. Accessibility Plan
- Semantic roles: conversation list `role="list"`; thread `role="log"` `aria-live="polite"` so SR announces incoming messages; composer `<form>` + labelled textarea.
- Full keyboard model (see §9); visible focus rings (`outline` using `colors.primary`).
- Dropdown/menus: focus trap, `Esc` to close, `aria-expanded`, return focus to trigger.
- Color contrast ≥ WCAG AA (primary on white passes for text ≥ 16px; ticks use icon + color, never color alone).
- `prefers-reduced-motion` → disable slide/scale animations.
- Unread conveyed by dot **and** text ("2 unread"), not color only.

## 16. Animation & Interaction Specifications (Framer Motion)
- **Message in:** `initial {opacity:0, y:8, scale:0.98}` → `animate {opacity:1,y:0,scale:1}`, `duration 0.18 ease-out`. Layout via `layout` prop for smooth list shift.
- **Thread switch (mobile):** slide `x: '100%'→0`, spring `stiffness 300 damping 30`.
- **Dropdown:** `opacity/scale 0.96→1`, `transformOrigin top right`, `0.15s`.
- **Unread badge:** pop `scale 0→1.15→1` spring on increment.
- **Typing dots:** staggered keyframe loop.
- **Optimistic bubble:** 60% opacity until `sent`, then settle to 100%.
- All gated by `useReducedMotion()`.

## 17. Production-Ready Implementation Roadmap

**Phase 0 — Foundation (this PR):** types, `messagingService`, `notificationService`, `useMessaging`, `useNotifications`, `useMessagingSocket`, env var. *Exit:* hooks compile & resolve real endpoints.

**Phase 1 — Messaging Center (this PR core):** `MessagingCenter`, `ConversationList(+Item/Skeleton/Empty)`, `MessageThread(+Header)`, `MessageBubble`, `MessageComposer`, route `/(creator)/messages`. Realtime new_message + optimistic send. *Exit:* two users converse in real time.

**Phase 2 — Notifications:** `NotificationBell` in `DashboardHeader`, `NotificationDropdown`, `NotificationsPage`, preferences. *Exit:* badge live-updates from ws; mark-all works.

**Phase 3 — Cross-context entry points:** "Message creator" CTA on campaign pages (MS-01), sponsor CTA (MS-08), volunteer-offer CTA (MS-07). Read receipts, archive/mute/block menus, edit/delete.

**Phase 4 — Polish & P1/P2:** Web Push (VAPID + `sw.js`), typing indicators, attachment upload pipeline, virtualization, Need Now UI (behind flag once backend ships).

**Backend coordination tickets:** (a) verify JWT in ws handshake → derive userId [G1, security]; (b) persist notification preferences [G2]; (c) typed notification list endpoint [G3]; (d) Need Now APIs [G7].

---
*Implemented artifacts accompany this document (Phase 0 + Phase 1 core + Notification Bell/Dropdown). Remaining phases are specified above and reuse the same primitives.*
