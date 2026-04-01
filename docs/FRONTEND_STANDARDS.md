# Frontend Standards — YPS Academy

> Reference this before writing any new Angular component or service.

---

## Stack

- **Angular 20** — standalone components, signals, new control flow
- **Angular Material** — the ONLY UI component library; no third-party UI libs
- **SCSS** — component styles minimal (< 20 lines); shared styles in `src/styles/`

---

## Component Rules

```typescript
// ✅ Correct component shell
@Component({
  selector: 'app-example',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatCardModule, ...],
  templateUrl: './example.component.html',
  styleUrl: './example.component.scss',
})
export class ExampleComponent {
  private service = inject(ExampleService);  // inject(), never constructor

  // I/O via signals
  data = input<Item[]>();
  selected = output<Item>();

  // State as signals
  items = signal<Item[]>([]);
  isLoading = signal(false);
  filtered = computed(() => this.items().filter(i => i.active));
}
```

- No business logic in components — delegate to services
- No `subscribe()` in components — use `toSignal()` or `async` pipe
- No `*ngIf` / `*ngFor` — use `@if`, `@for`, `@switch`, `@defer`

---

## Typography — Use These Everywhere, No Exceptions

| Element | Class / Style | Size |
|---------|--------------|------|
| Page title (h1) | `class="page-title"` | `1.75rem`, `font-weight: 600` |
| Section heading (h2) | `class="section-title"` | `1.25rem`, `font-weight: 600` |
| Card / panel title (h3) | `class="card-title"` | `1rem`, `font-weight: 600` |
| Body text | default | `0.875rem` |
| Caption / label | `class="caption"` | `0.75rem` |
| Table header | `class="table-header"` | `0.75rem`, uppercase, `font-weight: 600` |

These classes are defined in `src/styles/_utilities.scss`. Never set `font-size` inline.

---

## Dark & Light Mode

The app uses CSS custom properties toggled by Angular Material's theme classes (`light-theme` / `dark-theme`). Both themes are defined in `src/styles/_theme.scss`.

**Always use these CSS variables — never hard-code colors:**

| Variable | Use for |
|----------|---------|
| `var(--primary-color)` | Brand primary actions |
| `var(--accent-color)` | Secondary actions, highlights |
| `var(--background-primary)` | Page / card backgrounds |
| `var(--background-secondary)` | Sidebar, toolbar |
| `var(--background-tertiary)` | Chips, tags, subtle fills |
| `var(--text-primary)` | Main body text |
| `var(--text-secondary)` | Captions, labels, placeholders |
| `var(--divider-color)` | Borders, separators |
| `var(--success-color)` | Success states |
| `var(--warn-color)` | Errors, warnings |

```scss
// ✅ Correct
.card { background: var(--background-primary); color: var(--text-primary); }

// ❌ Wrong
.card { background: #ffffff; color: #212121; }
```

---

## Angular Material Usage

| Need | Component |
|------|-----------|
| Forms | `MatFormField` + `MatInput` / `MatSelect` / `MatDatepicker` |
| Buttons | `MatButton` (`mat-button`, `mat-raised-button`, `mat-icon-button`) |
| Tables | `MatTable` + `MatPaginator` + `MatSort` |
| Dialogs | `MatDialog` (use shared `ConfirmDialogComponent` for destructive actions) |
| Feedback | `MatSnackBar` via `NotificationService` — never `alert()` |
| Loading | `MatProgressSpinner` (full-page) or `MatProgressBar` (inline) |
| Navigation | `MatSidenav`, `MatToolbar`, `MatMenu` |
| Data display | `MatCard`, `MatChip`, `MatBadge`, `MatTooltip` |
| Icons | `MatIcon` — use Material Symbols only |

---

## SCSS Rules

```scss
// ✅ Component SCSS — max ~20 lines, layout only
:host {
  display: block;
  padding: $spacing-md;          // from _variables.scss
}

.actions { display: flex; gap: $spacing-sm; justify-content: flex-end; }
```

- All reusable layout patterns → `src/styles/_utilities.scss`
- Design tokens (sizes, spacing) → `src/styles/_variables.scss`
- Theme overrides → `src/styles/_theme.scss`
- No `style=""` attributes in HTML
- No magic numbers — always use a variable or CSS custom property

---

## Services

```typescript
// ✅ Correct service pattern
@Injectable({ providedIn: 'root' })
export class FeatureService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/features`;

  getAll(): Observable<Feature[]> {
    return this.http.get<ApiResponse<Feature[]>>(this.base).pipe(
      map(r => r.data)
    );
  }
}
```

- `HttpClient` only inside services — never in components
- Return typed `Observable<T>` from every public method
- Feature services → `features/<feature>/services/`
- Shared services → `shared/services/`

---

## Routing

```typescript
// ✅ Always lazy-load, always add breadcrumb title
{
  path: 'students',
  loadComponent: () => import('./student-list.component').then(m => m.StudentListComponent),
  data: { title: 'Students' },  // required for breadcrumb
},
```

- Every route inside `MainLayout` must have `data: { title: '...' }`
- All feature routes lazy-loaded
- Route files: `<feature>.routes.ts` inside the feature folder

---

## Anti-Patterns — Never Do

- No `*ngIf` / `*ngFor` — use new control flow
- No constructor injection — use `inject()`
- No `subscribe()` in components
- No hard-coded hex colors or px font sizes in component SCSS
- No third-party UI libraries (Bootstrap, Tailwind, PrimeNG, etc.)
- No `alert()` / `confirm()` — use `MatSnackBar` / `MatDialog`
- No `console.log` in final code
- No inline `style=""` in HTML templates
