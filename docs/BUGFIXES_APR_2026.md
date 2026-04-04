# Bug Fixes — April 2026

## 1. `GET /api/classrooms/my` — 500 Internal Server Error (Student / Faculty)

**File:** `backend/src/modules/classroom/classroom.repository.ts` → `findByUser()`

**Root cause:**  
The method tried to look up the student/faculty MongoDB document using `userId` (a human-readable string like `26-YPS-STUD-JOHN-001`). If no matching document was found, it still built a Mongoose query with the raw string against the `enrolledStudents` / `facultyAssignments.facultyId` fields — which are `ObjectId` type. Mongoose threw a `CastError`, which has no `statusCode` property, so the controller's `handleError()` fell through to a 500.

**Fix:**  
Return `[]` immediately when the entity lookup fails instead of running a query with an invalid ObjectId string.

```typescript
// Before — caused CastError → 500
query.$or = [
  ...(entity?._id ? [{ enrolledStudents: entity._id }] : []),
  { enrolledStudents: userId as any },   // ❌ raw string cast to ObjectId
];

// After — safe early exit
if (!entity?._id) {
  return [];
}
query.enrolledStudents = entity._id;     // ✅ only when ObjectId is known
```

---

## 2. `GET /api/messages/unread-counts` — 500 Internal Server Error (Student / Faculty)

**File:** `backend/src/modules/chat/message.repository.ts` → `getUserClassrooms()`

**Root cause:**  
Identical pattern to bug #1. `getUserClassrooms()` had the same fallback query using the raw `userId` string against the `enrolledStudents` / `facultyAssignments.facultyId` ObjectId fields.

**Fix:**  
Same pattern — return `[]` immediately when entity is not found.

```typescript
// After
if (!entity?._id) {
  return [];
}
if (role === 'student') {
  query.enrolledStudents = entity._id;
} else {
  query['facultyAssignments.facultyId'] = entity._id;
}
```

---

## 3. Chat Messages Not Appearing in Real-time (Student View)

Two separate bugs caused incoming messages to only appear after a page refresh.

### 3a. Socket callbacks outside Angular zone

**File:** `frontend/src/app/shared/services/chat.service.ts`

**Root cause:**  
Socket.io callbacks are invoked outside Angular's `NgZone`. Because `ClassroomChatComponent` uses `ChangeDetectionStrategy.OnPush`, signal mutations made from outside the zone do not schedule a re-render. Messages were being appended to the signal correctly but the view wasn't updating.

**Fix:**  
Wrap all socket event callbacks in `ngZone.run()`.

```typescript
// Before
this.socketService.onMessageReceived((message: Message) => {
  // signal updates — but no re-render triggered in OnPush
});

// After
this.socketService.onMessageReceived((message: Message) => {
  this.ngZone.run(() => {     // ✅ runs inside zone → triggers change detection
    // signal updates
  });
});
```

### 3b. Race condition — `joinClassroom` called before socket connected

**File:** `frontend/src/app/core/services/socket.service.ts`

**Root cause:**  
`joinClassroom()` was called immediately after the HTTP `/messages` response returned (inside `loadClassroomMessages`). At that point the socket handshake was often still in progress. The old code silently returned if `!socket?.connected`, so the student never sent a `classroom:join` event and therefore never received `message:new` broadcasts from the server.

**Fix:**  
Track joined rooms in a `Set`. On every `connect` / `reconnect` event, re-emit `classroom:join` for all tracked rooms so the client always ends up in the right Socket.io room regardless of connection timing.

```typescript
private joinedRooms = new Set<string>();

joinClassroom(classroomId: string): void {
  this.joinedRooms.add(classroomId);   // register intent
  if (!this.socket?.connected) return; // will join on connect
  this.socket.emit('classroom:join', { classroomId });
}

// on socket 'connect':
this.joinedRooms.forEach(id => this.socket!.emit('classroom:join', { classroomId: id }));
```

---

## General Pattern to Avoid

Whenever querying MongoDB with a value that is typed as `ObjectId` in the schema, never pass a plain string that isn't a valid ObjectId. Always resolve to the actual `_id` first and short-circuit if the entity doesn't exist.
