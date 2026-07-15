# Future Features — Chat & Notification System

Features deferred from v1 build. Add these incrementally as the system matures.

---

## v1.1 — Quick Wins

### Online Status (Green Dot)
- **What**: Show green/gray dot next to user name in chat sidebar
- **How**: Add `last_active_at` timestamp to `users` table. Frontend polls `/api/users/presence` every 30s. User is "online" if `last_active_at` > 30s ago.
- **Effort**: 2-3 hours
- **Files**: `User` model, presence endpoint, sidebar component

### Browser Notifications
- **What**: Desktop push notifications when user receives a new message while tab is in background
- **How**: Use `Notification` API. Request permission on login. Show notification with sender name + message preview. Click notification opens chat sidebar.
- **Effort**: 3-4 hours
- **Files**: New `useBrowserNotifications` hook, `ChatController` (send push on new message)

### Notification Sounds
- **What**: Play a sound when new message arrives
- **How**: Store a `.mp3` file in `public/sounds/`. Play via `new Audio('/sounds/message.mp3').play()` on incoming message.
- **Effort**: 1 hour
- **Files**: New sound file, message polling hook

### Message Pinning
- **What**: Managers+ can pin important messages to the top of a conversation
- **How**: Add `is_pinned` boolean + `pinned_at` timestamp to `messages` table. Add "Pin" action in message context menu. Show pinned messages in a collapsible banner at top of conversation.
- **Effort**: 3-4 hours
- **Files**: Migration, `Message` model update, chat sidebar component

---

## v1.2 — Enhanced UX

### Typing Indicators
- **What**: Show "User is typing..." when someone is composing a message
- **How**: Frontend sends POST `/api/chat/conversations/{id}/typing` on keypress (debounced 2s). Backend stores `typing_until` timestamp in cache. Other users poll and see typing status.
- **Effort**: 4-5 hours
- **Cache key**: `chat.typing.{conversation_id}.{user_id}` (TTL 5s)

### Message Threading / Replies
- **What**: Reply to a specific message (like Slack threads)
- **How**: Add `parent_id` nullable FK to `messages` table (self-referential). Add "Reply" action in message context menu. Show thread count in message footer. Click opens thread panel.
- **Effort**: 6-8 hours
- **Files**: Migration, `Message` model, new `ThreadPanel` component

### Message Reactions
- **What**: React to messages with emoji (👍, ❤️, 😂, etc.)
- **How**: Create `message_reactions` table (message_id, user_id, emoji). Add emoji picker on message hover. Show reaction counts below message.
- **Effort**: 5-6 hours
- **Files**: Migration, new `MessageReaction` model, emoji picker component

### Read Receipts Enhanced (Who Read)
- **What**: Show list of users who read a message (not just "seen" checkmark)
- **How**: Create `message_reads` table (message_id, user_id, read_at). On conversation open, mark all messages as read. Show "Seen by 3 users" with hover tooltip listing names.
- **Effort**: 4-5 hours
- **Files**: Migration, new `MessageRead` model, message component update

---

## v2.0 — Power Features

### Voice Messages
- **What**: Record and send voice notes (like WhatsApp)
- **How**: Use `MediaRecorder` API in browser. Record audio as `.webm`. Upload to `storage/app/private/chat/voice/`. Play inline with HTML5 audio player.
- **Effort**: 8-10 hours
- **Dependencies**: Browser MediaRecorder support, audio playback component

### Message Search Improvements
- **What**: Search by sender, date range, file type, within specific conversation
- **How**: Add filters to search endpoint. `?sender=123&date_from=2026-01-01&has_attachment=true`. UI: expandable filter bar above search results.
- **Effort**: 6-8 hours

### Chat Export
- **What**: Export conversation history as PDF or CSV
- **How**: New endpoint `/api/chat/conversations/{id}/export?format=pdf`. Use `barryvdh/laravel-dompdf` for PDF. Include messages, timestamps, sender names, attachments.
- **Effort**: 5-6 hours
- **Dependencies**: `barryvdh/laravel-dompdf` package

### Scheduled Messages
- **What**: Send a message at a future time
- **How**: Add `scheduled_at` nullable timestamp to `messages` table. Messages with `scheduled_at` are stored but not delivered until time arrives. Queue a job to send at scheduled time.
- **Effort**: 4-5 hours
- **Files**: Migration, new `SendScheduledMessage` job

### Message Forwarding
- **What**: Forward a message to another conversation
- **How**: Add "Forward" action in message context menu. Show conversation picker modal. Copy message content + attachments to new conversation.
- **Effort**: 3-4 hours

### Pinned Conversations
- **What**: Pin a conversation to the top of the sidebar
- **How**: Add `is_pinned` boolean to `conversation_participants` table. Add pin/unpin action in conversation context menu. Sort pinned conversations first.
- **Effort**: 2-3 hours

---

## v3.0 — Advanced

### Video/Voice Calls
- **What**: 1:1 and group video calls within the app
- **How**: WebRTC via `simple-peer` or `peerjs`. Signaling server via Laravel Reverb (would need to add WebSockets at this point). TURN server for NAT traversal.
- **Effort**: 20-30 hours
- **Dependencies**: WebSockets (Reverb), TURN server

### End-to-End Encryption
- **What**: Messages encrypted on client, server can't read them
- **How**: Use `libsodium` via `@stablelib/x25519` for key exchange. Each conversation has a shared key. Messages encrypted before send, decrypted on receive.
- **Effort**: 15-20 hours
- **Note**: Breaks server-side search. Trade-off between privacy and functionality.

### AI Chatbot
- **What**: Bot that answers ERP questions ("What's the status of PO #123?")
- **How**: Integrate OpenAI/Claude API. On "@bot" mention or "/ask" command, parse question, query ERP data, return formatted answer.
- **Effort**: 10-15 hours
- **Dependencies**: OpenAI API key, prompt engineering for ERP context

### Chat Analytics
- **What**: Dashboard showing message volume, response times, active conversations
- **How**: Create `chat_analytics` table. Aggregate data nightly via scheduled job. Show charts (Recharts) in admin panel.
- **Effort**: 8-10 hours

---

## Technical Debt to Address

### During v1 Build
- [ ] Add `indexes` on `messages.conversation_id`, `messages.created_at`, `conversation_participants.user_id`
- [ ] Add `composite index` on `(conversation_id, created_at)` for message loading
- [ ] Consider `cursor-based pagination` for message history (offset pagination gets slow with large conversations)

### Before v2
- [ ] Add `Redis` for caching (typing indicators, online status, unread counts)
- [ ] Add `database connection pooling` if switching to MySQL
- [ ] Add `rate limiting` on message send endpoint (prevent spam)
- [ ] Add `message length limit` (prevent abuse — suggest 10,000 chars max)

---

## Database Schema Reference (v1)

```sql
-- Core tables (built in v1)
conversations          -- id, type (dm/group), name, created_by, created_at, updated_at
conversation_participants -- id, conversation_id, user_id, role (admin/member), last_read_at, created_at
messages               -- id, conversation_id, user_id, content, type (text/file/system), parent_id, read_at, created_at, updated_at
message_attachments    -- id, message_id, file_name, file_path, file_size, mime_type, created_at
user_notification_preferences -- id, user_id, preferences (JSON), created_at, updated_at

-- Future tables (v1.1+)
message_reactions      -- id, message_id, user_id, emoji, created_at
message_reads          -- id, message_id, user_id, read_at
```

---

## Priority Order

| Version | Features | Timeline |
|---------|----------|----------|
| **v1** | Chat (DM + groups), Notifications, Search, Read receipts, Files | Now |
| **v1.1** | Online status, Browser notifications, Sound, Pinning | +1 week |
| **v1.2** | Typing indicators, Threading, Reactions, Enhanced read receipts | +2 weeks |
| **v2** | Voice messages, Export, Scheduled messages, Forwarding | +1 month |
| **v3** | Video calls, E2E encryption, AI bot, Analytics | +3 months |
