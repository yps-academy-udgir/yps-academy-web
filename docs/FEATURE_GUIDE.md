# Adding a New Feature — YPS Academy

> Keep this short. Follow the checklist. Don't skip layers.

---

## Backend

### Folder
```
backend/src/modules/<feature>/
├── dto/<feature>.dto.ts        ← Zod schemas + inferred types
├── <feature>.repository.ts    ← Mongoose queries only
├── <feature>.service.ts       ← Business logic
├── <feature>.controller.ts    ← HTTP handlers
└── <feature>.routes.ts        ← Express router
```

### Steps
1. **Model** — add `src/models/<feature>.model.ts` if a new collection is needed
2. **DTO** — define Zod schemas (use Zod v4 `error:` syntax, not `errorMap:`)
3. **Repository** — Mongoose queries, no logic
4. **Service** — business logic; throw `serviceError(message, statusCode)` for HTTP errors
5. **Controller** — call service, respond via `sendSuccess` / `sendError` / `sendPaginated`
6. **Routes** — apply `verifyToken` + `validate(schema)` middleware
7. **Register** — add `router.use('/<feature>s', featureRoutes)` in `src/routes/index.ts`

### Checklist
- [ ] Zod v4 `error:` syntax used
- [ ] Repository has zero business logic
- [ ] Service uses `serviceError` for 4xx responses
- [ ] Controller uses `response.util.ts` helpers only
- [ ] Route registered in `src/routes/index.ts`
- [ ] `npx tsc --noEmit` passes with zero errors

---

## Frontend

### Folder
```
frontend/src/app/features/<feature>/
├── components/
│   ├── <feature>-list/
│   │   ├── <feature>-list.component.ts
│   │   ├── <feature>-list.component.html
│   │   └── <feature>-list.component.scss
│   └── <feature>-form/
│       ├── <feature>-form.component.ts
│       ├── <feature>-form.component.html
│       └── <feature>-form.component.scss
├── services/
│   └── <feature>.service.ts
├── models/
│   └── <feature>.model.ts
└── <feature>.routes.ts
```

### Steps
1. **Model** — TS interface in `models/<feature>.model.ts`
2. **Service** — `HttpClient` calls, return typed `Observable<T>`
3. **Components** — standalone, `OnPush`, use `inject()` and signals
4. **Routes** — lazy-loaded, add `data: { title: '...' }` for breadcrumbs
5. **Register** — add lazy route in `app.routes.ts` under the `MainLayout` parent

### Checklist
- [ ] Standalone component, `OnPush` change detection
- [ ] `inject()` used (no constructor injection)
- [ ] New control flow: `@if`, `@for`, `@switch` (no `*ngIf` / `*ngFor`)
- [ ] State via `signal()` / `computed()` / `toSignal()`
- [ ] No `subscribe()` in components
- [ ] Only Angular Material UI components used
- [ ] SCSS under 20 lines — reuse `_utilities.scss` classes
- [ ] No hard-coded colors or sizes — use CSS variables / `_variables.scss`
- [ ] Route has `data: { title: '...' }` for breadcrumb
- [ ] Route lazy-loaded inside `MainLayout`

---

## API URL Convention

| Resource | Backend prefix | Frontend service method |
|----------|---------------|------------------------|
| List | `GET /api/<feature>s` | `getAll()` |
| Single | `GET /api/<feature>s/:id` | `getById(id)` |
| Create | `POST /api/<feature>s` | `create(data)` |
| Update | `PUT /api/<feature>s/:id` | `update(id, data)` |
| Delete | `DELETE /api/<feature>s/:id` | `delete(id)` |
