# Chat Room Production Readiness

Date: 2026-04-02

## Scope
This document covers production readiness for the classroom chat room feature:
- REST chat APIs
- Socket.io realtime messaging
- Role-based access (admin, faculty, student)
- Sidebar chat-room navigation
- Classroom-detail chat tab behavior

## Validation Summary

### Build and Compile Status
- Backend TypeScript check: PASS (`npx tsc --noEmit`)
- Frontend production build: PASS (`npx ng build`)

### Functional Status
- Student can access chat from sidebar Chat Rooms.
- Faculty can access chat from sidebar Chat Rooms.
- Admin can access and send messages in chat.
- Student classroom-detail page is chat-only (other tabs hidden for student role).
- Chat Rooms sidebar section is collapsible.
- Unread badge updates are wired.
- Frontend upload guardrails are enforced (max 5 files, max 10 MB each).

## Implemented Access Rules
- Admin: read + write chat access.
- Faculty: read + write chat access for assigned classrooms.
- Student: read + write chat access for enrolled classrooms.

## End-to-End Flow

### Sidebar and Navigation Flow
1. User logs in (admin/faculty/student).
2. Sidebar shows `Chat Rooms`.
3. Clicking a classroom routes to `/classrooms/management/:id?tab=chat`.
4. Classroom detail auto-opens the chat tab.
5. For students, only chat is visible on classroom detail (no extra classroom tabs).

### Message Send Flow
1. User composes message (text and optional attachments).
2. Frontend validates attachment limits (max 5 files, max 10 MB each).
3. Message is emitted through Socket.io (`message:send`).
4. Backend validates token and role.
5. Backend validates classroom membership for student/faculty; admin is allowed to send.
6. Message is persisted in MongoDB and sender is marked as read.
7. Backend broadcasts `message:new` to the classroom room.
8. All connected clients in that classroom update chat UI in real time.

### Message Read and Badge Flow
1. When messages are fetched/opened, unread messages are marked as read.
2. Backend emits/broadcasts read events.
3. Clients update read receipts and unread badge counters.
4. Badge counts are scoped to the classrooms visible to that role.

## Data and Persistence
- Messages are stored in MongoDB (`messages` collection).
- Each message stores sender identity, role, text, attachments metadata, read receipts, and timestamps.
- Read receipts are updated on read/visibility flow.

## Important Production Notes

### 1. Attachments (Current Behavior)
Current frontend uses `FileReader.readAsDataURL()` and sends attachment payloads directly.
- This is functional for small files but can increase payload size significantly.
- Frontend now blocks oversized uploads (more than 10 MB per file) and more than 5 files.
- Recommendation before heavy production usage:
  - Move to server-side file upload endpoint.
  - Store file in object storage (S3, GCS, etc.).
  - Send only file URL/metadata in chat message payload.

### 2. Read-Receipt Write Pattern
Current message-read marking loops through messages and performs per-message checks/updates.
- Works functionally.
- Can be optimized for high volume by batching updates.

### 3. Admin Unread Counts
Current behavior returns empty unread counts for admin (`{}`).
- This is intentional in current implementation.
- If required, add admin unread aggregation strategy and UX decision for badge semantics.

## Security and Authorization
- JWT is verified for REST and Socket connections.
- Chat routes use role-based guards.
- Membership checks are resolved correctly against Student/Faculty entity IDs.
- Admin write access is enabled on chat send endpoints and Socket flow.

## Pre-Production Checklist
- [x] Backend compile passes
- [x] Frontend production build passes
- [x] Student/faculty/admin role access verified in code
- [x] Sidebar direct chat navigation added
- [x] Student chat-only view implemented
- [x] Frontend upload limits implemented (5 files, 10 MB per file)
- [ ] Run end-to-end manual UAT with at least 3 users (admin + faculty + student)
- [ ] Load test Socket events under concurrent usage
- [ ] Decide attachment storage strategy for large files
- [ ] Add monitoring/logging dashboard for chat errors and socket disconnects

## Recommended Smoke Test (Post-Deploy)
1. Admin sends message in classroom A.
2. Student enrolled in classroom A receives realtime message and badge update.
3. Faculty assigned to classroom A receives realtime message.
4. Student refreshes page and sees message history persisted.
5. Student in classroom B does not receive classroom A messages.
6. Student cannot open classroom chat where not enrolled (403 expected).
7. Upload guardrails: >5 files or >10 MB file are blocked client-side.

## Rollout Recommendation
Go for production with controlled rollout, with one caution:
- If expected attachment size/volume is high, implement dedicated upload storage flow first.
