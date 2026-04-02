# PWA Implementation Checklist

Date: 2026-04-02

## Decision
Use a PWA-first approach for YPS Academy Web.

Why this is the right first step:
- The frontend is already a standard Angular 20 web application.
- The current UI is Angular Material and desktop/admin-portal oriented.
- PWA adds installability, caching, and notification readiness with lower risk than Ionic.
- Ionic would introduce a larger UI/navigation shift and is better treated as a later step only if native app packaging becomes a hard requirement.

## Goal
Make the existing Angular app installable and mobile-friendlier without changing the current business flows.

Primary outcomes:
- Installable app experience on desktop and mobile.
- Better repeat-load performance through caching.
- Stable shell experience during flaky connectivity.
- Foundation for future push notifications.

## Non-Goals
- Full offline chat messaging.
- Native mobile-only UX rewrite.
- App-store packaging in the first phase.
- Ionic migration in the first phase.

## Current Verified Baseline
These points are already verified and do not need to be re-audited from scratch unless the architecture changes.

- [x] Frontend is Angular 20 application-based setup.
- [x] Frontend uses Angular Material as the primary UI system.
- [x] Routing is already role-aware for admin, faculty, and student.
- [x] Chat room feature exists and is role-aware.
- [x] Student classroom detail can be rendered as chat-only.
- [x] Frontend build works in production mode.
- [x] Backend compile check works.
- [x] Angular PWA foundation is now wired into the frontend build.

Resume rule for future work:
- Use this file as the source of truth for PWA rollout status.
- Update checklist items here immediately after each implementation step.
- Do not re-check the whole codebase unless a checklist assumption becomes invalid.

## Current Constraints
- The app is role-heavy: admin, faculty, student.
- Realtime chat depends on Socket.io and backend connectivity.
- Some pages are data-dense and depend on live API responses.
- Attachments in chat currently use DataURL flow, which is not ideal for offline-heavy usage.

## Expected Challenges

### 1. Realtime Chat and Offline Behavior
Challenge:
Chat uses live Socket.io communication, which does not translate directly into offline messaging support.

Implication:
- PWA can cache the shell and previous message history fetches.
- It will not make chat send/receive work offline automatically.

Mitigation:
- Keep chat online-only in first release.
- Show clear connection state in the future if needed.

### 2. Role-Based Entry Points
Challenge:
Different users land in different parts of the app.

Implication:
- Installability is easy.
- Cached navigation and post-login flow must remain role-aware.

Mitigation:
- Preserve existing guards and role-based redirects.
- Test student, faculty, and admin separately.

### 3. Cache Invalidation
Challenge:
This app has frequent data changes across classrooms, fees, marks, chat, and profiles.

Implication:
- Over-aggressive caching can show stale data.

Mitigation:
- Cache app shell aggressively.
- Use conservative runtime caching for API GET endpoints.
- Do not cache mutation endpoints.

### 4. Attachments and Storage
Challenge:
Chat attachments currently use client-side DataURL handling.

Implication:
- Not good for large-file offline behavior.

Mitigation:
- Keep current upload guardrails.
- Treat attachment storage redesign as a separate follow-up track.

## Implementation Strategy

### Phase 1. PWA Foundation

Checklist:
- [x] Add Angular service worker support.
- [x] Add web app manifest.
- [x] Define icons, app name, theme color, background color.
- [x] Configure installable app metadata.

Expected output:
- User can install the app from supported browsers.

### Phase 2. Safe Caching

Checklist:
- [x] Cache app shell assets.
- [x] Cache static files and route bundles.
- [x] Add limited runtime caching for safe GET requests.
- [x] Avoid caching chat write actions and authenticated mutations.

Expected output:
- Faster reloads and resilient app shell.

### Phase 3. Mobile Experience Hardening

Checklist:
- [ ] Validate responsive layout for main nav, sidebar, chat, forms, and dashboards.
- [ ] Improve install prompt UX if needed.
- [ ] Test viewport behavior on Android and iPhone browsers.

Expected output:
- Better mobile usability without changing the overall app architecture.

### Phase 4. Notification Foundation

Checklist:
- [ ] Prepare architecture for push notifications.
- [ ] Decide whether notifications are needed for chat, fees, marks, or announcements.
- [ ] Defer actual push implementation unless explicitly prioritized.

Expected output:
- PWA-ready structure for future notifications.

## Master TODO Checklist

### Must Do First
- [x] Add Angular PWA/service worker support.
- [x] Generate and configure `manifest.webmanifest`.
- [x] Add app icons for install surfaces.
- [x] Configure production service-worker caching rules.
- [ ] Test installability on Chrome desktop and Android Chrome.

### Must Validate Before Release
- [ ] Verify admin login flow after app install.
- [ ] Verify faculty login flow after app install.
- [ ] Verify student login flow after app install.
- [ ] Verify breadcrumb and role-based home navigation after app install.
- [ ] Verify chat room access still works for all roles.
- [ ] Verify fresh deploy invalidates old cached assets correctly.

### Good Next Steps
- [ ] Add graceful offline screen/message for unavailable live data.
- [ ] Add connection-state handling for chat.
- [ ] Add notification strategy document.
- [ ] Rework chat attachment upload to server/object storage.

## Implementation Order
- [x] Step 1: Enable Angular PWA support in frontend.
- [x] Step 2: Add manifest, icons, and install metadata.
- [x] Step 3: Configure service worker caching policy.
- [x] Step 4: Build and validate installability.
- [ ] Step 5: Run role-based QA for admin/faculty/student.
- [ ] Step 6: Validate chat behavior with cached shell and live backend.
- [ ] Step 7: Validate deploy/update cache invalidation behavior.
- [ ] Step 8: Record final limitations and rollout notes.

## Step-by-Step Execution Plan

1. Add Angular PWA support to the existing frontend project.
2. Configure manifest, theme colors, app name, and install icons.
3. Create conservative service-worker caching rules.
4. Build and test install flow on desktop and mobile browser.
5. Test all three roles end-to-end after installation.
6. Validate chat behavior with cached shell and live backend.
7. Review stale-cache behavior during a fresh deployment.
8. Document known limitations before production rollout.

## Execution Notes
- Keep all new PWA work inside the existing Angular app.
- Do not introduce Ionic in this implementation track.
- Do not rewrite routing, layout, or role flows just for PWA.
- Prefer incremental rollout with validation after each completed step.
- After each implementation session, update this file first.
- Current status: service worker, manifest, icons, and conservative production caching are implemented.
- Current status: production build generates `ngsw.json`, `ngsw-worker.js`, and `manifest.webmanifest` successfully.
- Remaining validation: browser install prompt checks and role-based post-install QA are still pending.

## Technical Notes
- Preferred path: Angular PWA using Angular service worker.
- Do not introduce Ionic UI components in this phase.
- Do not rewrite navigation/layout for mobile-app conventions in this phase.
- Keep Angular Material as the UI system.

## Risks If We Skip Planning
- Stale authenticated screens due to bad caching.
- Broken role redirects after installation.
- Users assuming chat works offline when it does not.
- Hard-to-debug production issues after deploy due to cached assets.

## Rollout Recommendation
Proceed with PWA implementation in phased rollout.

Recommendation:
- Phase 1 and Phase 2 can be implemented now.
- Phase 3 should be validated during QA.
- Phase 4 should stay optional unless notifications become a product requirement.

## Future Decision Point: Ionic
Revisit Ionic only if one or more of these become mandatory:
- Android/iOS store deployment.
- Device-native integrations beyond browser APIs.
- Mobile-first redesign of navigation and user flows.
- Offline-first workflows requiring more native app behavior.