# Website UI Theme Plan

## Objective

Create one unified visual system for the public website first, then extend the same system into the authenticated app. The system must:

- use a single warm brand palette for light mode
- provide a deliberate dark mode, not a simple color inversion
- move hardcoded colors, fonts, sizes, spacing, radii, shadows, and motion values into shared variables/tokens
- standardize gradients, buttons, surfaces, borders, and typography
- give the website a stronger identity before app-wide rollout

## Chosen Color Scheme

The selected light-mode scheme is a warm sunrise palette built from the four provided colors:

- Primary: `#FF5A5A` - coral red
- Secondary: `#FF8B5A` - warm orange
- Tertiary: `#FFA95A` - apricot
- Highlight: `#FFD45A` - amber gold

This palette works well for an education website because it feels energetic, optimistic, and approachable without looking childish. It is also strong enough for gradients, CTA buttons, section accents, and illustration overlays.

## Visual Direction

The website should feel:

- warm and high-energy
- premium but approachable
- modern with layered gradients instead of flat color blocks
- bright in light mode and cinematic in dark mode

Recommended brand gradient:

```css
linear-gradient(135deg, #FF5A5A 0%, #FF8B5A 34%, #FFA95A 68%, #FFD45A 100%)
```

Recommended accent gradient:

```css
linear-gradient(135deg, #FF8B5A 0%, #FFD45A 100%)
```

## Dark Mode Strategy

Dark mode should not reuse the same light surfaces with lower brightness. The correct approach is warm charcoal surfaces with slightly lifted brand accents so the palette still feels related to the website identity.

### Dark Surfaces

- Background primary: `#140F0E`
- Background secondary: `#1D1614`
- Background tertiary: `#2A211D`
- Background elevated: `#332823`
- Background hover: `rgba(255, 212, 90, 0.08)`

### Dark Text

- Text primary: `#FFF7F2`
- Text secondary: `#D7C6BD`
- Text tertiary: `#A89287`
- Text inverse: `#1B1412`

### Dark Brand Accents

- Primary dark accent: `#FF7A6B`
- Secondary dark accent: `#FF9F73`
- Tertiary dark accent: `#FFC36D`
- Highlight dark accent: `#FFE082`

Recommended dark hero gradient:

```css
linear-gradient(135deg, #5A1F1C 0%, #8A3D22 35%, #B05D20 68%, #D39A2F 100%)
```

Recommended dark CTA gradient:

```css
linear-gradient(135deg, #FF7A6B 0%, #FF9F73 50%, #FFC36D 100%)
```

## Token Architecture

All visual values should come from shared tokens. Components should consume tokens only, not literal hex values or one-off font sizes.

### 1. Brand Tokens

- `--color-brand-primary`
- `--color-brand-secondary`
- `--color-brand-tertiary`
- `--color-brand-highlight`
- `--color-brand-primary-soft`
- `--color-brand-secondary-soft`
- `--color-brand-gradient`
- `--color-brand-gradient-soft`
- `--color-brand-gradient-hero`

### 2. Surface Tokens

- `--surface-page`
- `--surface-section`
- `--surface-card`
- `--surface-card-elevated`
- `--surface-overlay`
- `--surface-hover`
- `--surface-inverse`

### 3. Text Tokens

- `--text-primary`
- `--text-secondary`
- `--text-tertiary`
- `--text-on-brand`
- `--text-on-dark`
- `--text-link`
- `--text-link-hover`

### 4. Border Tokens

- `--border-subtle`
- `--border-strong`
- `--border-brand`
- `--border-glow`

### 5. State Tokens

- `--state-success`
- `--state-warning`
- `--state-danger`
- `--state-info`

### 6. Typography Tokens

SCSS source tokens should define the font families, font scale, line heights, and weights. CSS custom properties should expose reusable runtime values.

Suggested type pairing:

- Display/headings: `"Sora", "Segoe UI", sans-serif`
- Body/UI: `"Manrope", "Segoe UI", sans-serif`
- Monospace: `"JetBrains Mono", monospace`

Required token groups:

- `--font-family-display`
- `--font-family-body`
- `--font-size-xs` to `--font-size-6xl`
- `--font-weight-medium`
- `--font-weight-semibold`
- `--font-weight-bold`
- `--line-height-tight`
- `--line-height-normal`
- `--line-height-relaxed`

### 7. Layout Tokens

- `--space-1` to `--space-10`
- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-xl`
- `--radius-pill`
- `--shadow-sm`
- `--shadow-md`
- `--shadow-lg`
- `--shadow-glow-brand`

### 8. Motion Tokens

- `--duration-fast`
- `--duration-normal`
- `--duration-slow`
- `--ease-standard`
- `--ease-emphasized`
- `--button-shimmer-duration`
- `--border-orbit-duration`

### 9. Responsive Tokens

- `--bp-sm` (mobile)
- `--bp-md` (tablet)
- `--bp-lg` (desktop)
- `--font-size-mobile-scale` (global type downscale factor)
- `--space-mobile-scale` (compact spacing factor)

## Component Styling Rules

### Backgrounds

- Page backgrounds should use layered surfaces, not plain white or plain black.
- Hero, CTA, and highlighted panels should use brand gradients.
- Cards should use solid surfaces with subtle brand-tinted borders or glow.

### Text

- Headings should use display typography tokens.
- Body text, helper text, captions, and labels must come from text tokens and font-size tokens.
- No component should define its own raw `font-size`, `font-family`, or `color` unless backed by a token.

### Buttons

Use three button tiers across the website:

- Primary button: filled warm gradient, strong contrast text, soft glow
- Secondary button: solid/tinted surface with warm border and hover lift
- Tertiary button: text or subtle outline button for low-emphasis actions

Recommended button effects:

- Gradient flow button: animate `background-position` left-to-right and back on hover/focus
- Orbit border button: use a conic-gradient border on a pseudo-element rotating continuously for premium CTAs
- Lift behavior: small upward movement with stronger shadow, never excessive bounce

Recommended motion guidance:

- always keep animations under control and optional for reduced-motion users
- continuous effects should be subtle and paused or softened on inactive secondary controls
- hover states should feel premium, not flashy

## Mobile-First Design Rules

Mobile behavior must be planned from the beginning, not patched at the end.

### Responsive Typography

- heading sizes should step down at mobile breakpoints using tokens, not ad-hoc values
- long hero titles and section headers should use tighter line-height and smaller max size on phones
- body text should reduce one token step on small screens where readability remains strong
- captions and helper text should stay legible and never drop below practical readability

Suggested responsive type rules:

- desktop: full display scale
- tablet: reduce major headings by one step
- mobile: reduce major headings by two steps and body by one step where needed

### Content Prioritization on Mobile

Some desktop-only decorative content should be hidden on mobile to reduce clutter.

Allowed to hide on mobile:

- repeated decorative headings or duplicate tagline lines
- long descriptive paragraphs under hero or section intros
- non-critical stat dividers and ornamental icons
- secondary CTA text labels that duplicate context

Do not hide on mobile:

- primary page heading intent
- primary CTA and essential navigation actions
- key trust content required for user decision (core stats, proof points, contact action)

### Mobile Layout Behavior

- stack multi-column sections into single-column flow on small screens
- reduce section paddings and card paddings using spacing tokens
- keep tap targets comfortably large and avoid dense button groups
- convert complex horizontal clusters into vertical grouped blocks

### Mobile Animation Behavior

- reduce animation intensity and duration on mobile
- disable continuous decorative animations for low-power or reduced-motion contexts
- keep only meaningful motion (state change, CTA feedback, section reveal)

## Documentation Governance

This document is the single source of truth for:

- theme rollout phases
- active TODOs by phase
- current status of each phase
- acceptance and sign-off criteria

Rule:

- no separate TODO tracking outside this document for theme work
- every implementation PR should update phase progress here

## Frontend Audit Findings (Material + Styling)

Deep scan summary of the current frontend:

- Angular Material theming is active via `mat.define-theme` and global component theme mixins.
- Theme classes (`light-theme` / `dark-theme`) are applied on body via `ThemeService`.
- Some components rely on Material system tokens (`--mat-sys-*`) while others rely on custom variables (`--background-*`, `--text-*`), creating a mixed token model.
- Website navbar currently overrides several `--mdc-*` button internals directly.
- A few app screens use `::ng-deep` for Material internals, which is a long-term maintenance risk.
- Existing animations are currently a mix of local keyframes and component-specific CSS animation rules.

Decision:

- keep Angular Material as the base system and build a controlled token bridge instead of replacing Material behavior
- centralize animation primitives and avoid ad-hoc animation styles per component

## Angular Material No-Clash Strategy

This section defines strict rules to ensure the custom theme system does not clash with Angular Material theming.

### Core Principle

- Material handles component internals
- custom tokens handle brand expression and layout primitives
- integration happens through a controlled bridge layer in theme files

### Theming Contract

1. Source of truth for Material components:
- Angular Material tokens generated by `mat.define-theme`

2. Source of truth for custom layout and website brand expression:
- custom CSS variables (`--surface-*`, `--text-*`, `--color-brand-*`, etc.)

3. Bridge rule:
- map brand/system variables in `_theme.scss` so custom tokens and Material tokens stay aligned

### Override Rules

Allowed:

- local, scoped component overrides for specific variants (for example website CTA button class)
- token-driven overrides via documented variables

Restricted:

- global `--mdc-*` overrides outside scoped classes
- broad overrides of `.mat-*` internal selectors
- new `::ng-deep` usage unless no stable API exists and it is documented with a migration note

### Material Component Styling Guidance

- use Material APIs and variants first (`mat-flat-button`, `mat-stroked-button`, form-field appearances)
- only layer brand styles on top using component wrapper classes
- avoid forcing typography on native Material internals unless required; style surrounding semantic wrappers instead

### Token Interop Rules

- if a component uses `--mat-sys-*`, avoid duplicate custom color assignment for the same concern
- if custom tokens are used, map them once in theme bridge and consume consistently
- remove hex fallback colors once token migration is complete (except hard requirements like exported print assets)

## Animation Architecture (Including External Library)

Animations are required, but they must be structured and accessible.

### External Library Decision

Approved library: `gsap` (with optional `ScrollTrigger` plugin)

Why this choice:

- robust timelines for hero and section choreography
- reliable scroll-triggered reveals for website sections
- clear imperative control for start/stop on route changes
- mature ecosystem and good performance when used selectively

### Animation Ownership Model

- keep micro-interactions (hover/focus/press) in CSS using motion tokens
- use GSAP for orchestrated timeline or scroll-based reveal animations
- do not mix multiple external animation libraries

### Motion Safety Rules

- all non-essential animation must honor `prefers-reduced-motion`
- continuous loops should be subtle and pause/soften off-screen or on low-priority elements
- avoid layout-jank animations (animate transform/opacity instead of layout properties)

### Material + Animation Compatibility Rules

- do not animate Material ripples, focus indicators, or internal control geometry
- avoid conflicting transitions on Material container internals where MDC already provides motion
- attach GSAP animations to wrapper elements (`.website-section`, `.hero-content`, card shells), not deep `.mat-*` internals

### Animation Zones by Surface

Website:

- hero entry sequence (headline, subtitle, CTA stagger)
- section reveal on scroll (small upward fade)
- stats/count highlights
- premium CTA effects (gradient flow / orbit border)

App:

- page-level entrance transitions (subtle)
- card/list stagger on dashboard screens (lightweight)
- state transitions (loading, empty, success) with restrained motion

### Animation Implementation TODOs

- [x] Add `gsap` dependency to frontend
- [ ] Create shared animation layer (`frontend/src/app/shared/animations/`)
- [x] Add reusable reveal directive or utility service for section entrance
- [x] Add reduced-motion guard utility and global toggle checks
- [ ] Document allowed animation presets (fade-up, stagger, scale-in, gradient-flow)

### Phase Status Board

Use this board as the canonical status tracker.

| Phase | Name | Scope | Status | Owner | Start | Target | Notes |
|---|---|---|---|---|---|---|---|
| P1 | Theme Foundation | Token system and base theme | Done | Copilot + Team | 2026-04-03 | 2026-04-03 | Tokens, app.scss, index.html all migrated |
| P2 | Shared Primitives | Buttons, cards, section primitives | Done | Copilot + Team | 2026-04-03 | 2026-04-03 | ws-btn-primary/secondary/orbit, hide/show utilities, gradient-text variants |
| P3 | Website Shell | Navbar, footer, shell layers | Done | Copilot + Team | 2026-04-03 | 2026-04-03 | Navbar + footer fully tokenised, SVG logo added to navbar and footer |
| P4 | Hero Section | Hero visuals, CTA behavior, stats | Done | Copilot + Team | 2026-04-03 | 2026-04-03 | Animated gradient title, gradient-flow CTA, animated stat numbers |
| P5 | Remaining Website Sections | All website section consistency | Done | Copilot + Team | 2026-04-03 | 2026-04-03 | All section h2 gradient-text, achievement values animated, brand tokens throughout |
| P6 | App Rollout | Authenticated app adoption | In Progress | Copilot + Team | 2026-04-03 | - | App header SVG logo, sidebar brand tokens, dashboard headings, pct-badge dark mode |
| P7 | Cleanup and Deletion | Remove dead styles, partialize SCSS | Planned | TBD | - | - | Runs in parallel after P2 |
| P8 | Motion System Rollout | GSAP + CSS tokenized animations | In Progress | Copilot + Team | 2026-04-03 | - | GSAP reveal system active; `gradient-orbit-outline` rolled out to website + app buttons |

Allowed status values:

- Planned
- In Progress
- Blocked
- In Review
- Done

### TODO Template Per Phase

Every phase should maintain its own checklist in this document.

Template:

```md
### Phase PX TODOs

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3
```

## Heading and Content Consistency Standard (Website + App)

The app currently uses mixed heading approaches (`mat-card-title`, local `.section-title`, local `.subsection-title`, and ad-hoc font sizes). This phase introduces a strict heading hierarchy to remove inconsistency.

### Standard Heading Classes

Introduce and enforce these shared classes:

- `.primary-heading` - page-level heading (h1 visual)
- `.secondary-heading` - section-level heading (h2 visual)
- `.tertiary-heading` - card/panel heading (h3 visual)
- `.quaternary-heading` - minor subsection heading (h4 visual)
- `.body-text`
- `.body-text-sm`
- `.caption-text`
- `.eyebrow-text`

### Semantic Usage Rule

- semantic HTML level remains contextual (`h1`..`h4`, `mat-card-title`, etc.)
- visual consistency comes from shared classes above
- no component-level heading font-size should bypass shared tokens

### Responsive Heading Rule

- `.primary-heading` scales down by two steps on mobile
- `.secondary-heading` scales down by one step on mobile
- `.tertiary-heading` and below can remain same or reduce one step where density is high

### App-Specific Consistency Targets

During app rollout, prioritize these inconsistent areas first:

- dashboards and list pages with mixed title styles
- form screens with local section-title variants
- detail/profile screens with duplicated subsection-title definitions
- report/receipt screens that use custom print-centric typography without token alignment

## SCSS Architecture and Partials Plan

To keep styles maintainable and avoid duplication, split global style concerns into partials.

### Proposed Partial Structure

- `frontend/src/styles/_tokens.scss` (optional alias layer if needed)
- `frontend/src/styles/_typography.scss`
- `frontend/src/styles/_motion.scss`
- `frontend/src/styles/_surfaces.scss`
- `frontend/src/styles/_buttons.scss`
- `frontend/src/styles/_responsive.scss`
- `frontend/src/styles/_website-primitives.scss`
- `frontend/src/styles/_app-primitives.scss`

Keep existing files (`_variables.scss`, `_theme.scss`, `_utilities.scss`) and refactor incrementally, not by one-shot replacement.

### Partialization Rules

- each partial should own one concern
- utility classes should not redefine tokens
- feature components should consume partial outputs and tokens, not duplicate style logic
- avoid introducing additional local utility classes when a shared primitive exists

## Unused Styles and Class Cleanup Strategy

Unused style removal is required to prevent future drift.

### Cleanup Scope

- dead utility classes in shared styles
- duplicated component classes that can be replaced by shared primitives
- stale website classes after section redesign
- obsolete fallback declarations no longer needed after token migration

### Safe Deletion Workflow

1. identify candidate classes/selectors
2. verify usage across templates and TS-generated class bindings
3. mark and batch-remove only verified unused selectors
4. run build and visual smoke test for website + app critical flows
5. log removed selectors in this document under Phase P7

### Phase P7 TODOs

- [x] Generate selector usage inventory for shared styles
- [x] Remove first verified unused selector batch from global/shared styles (`gradient-orbit-border`, `.ws-orbit-border`, `.ws-btn-orbit`)
- [ ] Refactor duplicated component selectors into shared primitives
- [ ] Delete stale fallback color/font declarations
- [ ] Final dead-style pass after P6 app rollout

## Website-First Rollout Plan

### Phase 1 - Theme Foundation

Scope:

- replace the current indigo/pink base palette in `frontend/src/styles/_variables.scss`
- redesign `frontend/src/styles/_theme.scss` around the new warm token system
- expose a clean light/dark CSS variable contract
- move global typography and surface styles out of `frontend/src/app/app.scss` into token-driven shared styles
- align `frontend/src/index.html` theme color with the new brand

Deliverables:

- brand palette tokens
- dark surface tokens
- typography tokens
- gradient tokens
- motion tokens
- cleaned global styles with no duplicate hardcoded palette

### Phase P1 TODOs

- [x] Finalize token naming map for brand, surface, text, border, motion, responsive groups
- [x] Replace current base palette with warm light + dark companion palette
- [x] Define heading scale tokens for desktop/tablet/mobile
- [x] Align global styles and index theme color to the new token contract
- [x] Remove duplicate global font/color declarations from app-level styles

### Phase 2 - Shared Website Primitives

Scope:

- create reusable website button classes
- create reusable section-shell and content-container utilities
- create shared badge, chip, and stat-card styles
- create a reusable gradient panel pattern
- create responsive utility classes for hide/show by breakpoint and text scale adjustments

Deliverables:

- `website-button--primary`
- `website-button--secondary`
- `website-button--tertiary`
- `website-button--orbit`
- `website-badge`
- `website-section`
- `website-card`

### Phase P2 TODOs

- [x] Add shared button variants with gradient flow and orbit-border options — `.ws-btn-primary`, `.ws-btn-secondary`, `.ws-btn-orbit`
- [x] Add shared heading classes (`primary-heading`, `secondary-heading`, `tertiary-heading`, `quaternary-heading`)
- [ ] Add section/container/card primitives with responsive behavior
- [x] Add hide/show utility classes for mobile content prioritization — `.hide-on-mobile`, `.hide-on-tablet`, `.show-on-mobile`, `.show-on-tablet`
- [x] Add reduced-motion handling for continuous animation classes
- [x] Add Material-safe wrapper classes for branded button variants (no global MDC override)
- [x] Add `.gradient-text` and `.gradient-text-animated` utilities with `prefers-reduced-motion` guard
- [x] Add `.ws-label` gradient border pill (pseudo-element mask technique)

### Phase 3 - Website Shell

Scope:

- navbar
- footer
- website shell background layers

Targets:

- fixed navbar should shift from transparent hero-overlay state to solid elevated surface cleanly
- logo and nav links should use tokenized contrast rules for both transparent and scrolled states
- footer should use branded dark surface treatment instead of neutral card styling

### Phase P3 TODOs

- [x] Refactor navbar to tokenized transparent/scrolled states — both transparent and scrolled fully brand-tokenised
- [x] Apply heading class standard in shell/nav/footer text areas
- [ ] Ensure mobile nav typography and spacing follow responsive tokens
- [x] Remove shell-level hardcoded style remnants — btn-admission now gradient-flow, logo uses brand tokens

### Phase 4 - Hero Section

Scope:

- hero overlay gradient
- hero badge
- hero typography
- hero CTA buttons
- hero stats
- slider dots

Targets:

- stronger branded gradient overlay
- premium CTA animation
- text contrast verified in both themes
- stat cards or dividers updated to tokenized surfaces and borders
- mobile-specific hero simplification (smaller heading scale and optional subtitle trimming)

### Phase P4 TODOs

- [x] Migrate hero title/subtitle/badge to shared heading/body classes
- [x] Replace hero color and overlay values with gradient/surface tokens
- [x] Implement CTA animation variants with reduced-motion fallback — gradient-flow on btn-primary
- [x] Hero title highlight span uses `.gradient-text-animated` (warm glow text-shadow preserved)
- [x] Hero stat numbers use animated gradient numbers
- [ ] Hide or trim non-critical hero description content on mobile
- [ ] Validate contrast and readability across light/dark/mobile

### Phase 5 - Remaining Website Sections

Scope:

- courses
- highlights
- testimonials
- admissions/contact CTA
- any landing-page sections under `features/website/components`

Targets:

- unify card styles and spacing
- remove section-specific hardcoded color values
- apply consistent hover states and shadows
- define per-section mobile content priorities (what to keep, collapse, or hide)

### Phase P5 TODOs

- [x] Standardize all section headings to `secondary-heading gradient-text` in all 6 section templates
- [x] Replace section-local cards/chips/buttons with shared primitives — course badge gradient, reviewer avatar gradient
- [x] Achievement values use `.gradient-text-animated` for live pulsing numbers
- [x] Faculty slider dots, testimonial stars, contact info icons all use brand tokens
- [ ] Remove section-level duplicate classes now covered by shared utilities
- [ ] Document mobile keep/hide decisions per section
- [ ] Complete final website visual consistency pass

### Phase 6 - App Rollout

After the website is stable, extend the same token system into the authenticated app.

First targets:

- app shell
- dashboard cards
- sidebar/header
- forms and tables
- report/receipt views that currently contain many hardcoded light-only values

### Phase P6 TODOs

- [x] SVG brand logo applied to app header — replaces `mat-icon school` in both desktop and mobile
- [x] Sidebar active state token-driven — uses `--color-brand-primary` and `--surface-overlay`
- [x] Main-layout sidenav/content surfaces use `--surface-section` / `--surface-page`
- [x] Apply `tertiary-heading` class to dashboard h1s — Main, Student, Faculty dashboards
- [x] Apply `tertiary-heading` to list toolbar h1 — Faculty List, Student List, Results List
- [x] `header-icon` colour changed from `--primary-color` alias to `--color-brand-primary`
- [x] `stat-chip` and dashboard card backgrounds tokenised with `--surface-card` / `--border-subtle`
- [x] `.pct-badge` dark-mode aware colour modifiers added (no more light-only hardcoded greens/oranges/reds)
- [x] `.panel-icon` uses `--color-brand-primary` directly
- [x] `.info-row` divider uses `--border-subtle`
- [x] Apply `gradient-orbit-outline` to app buttons via shared motion layer (`.app-container` scope)
- [x] Apply `tertiary-heading` to report page headers — `fee-receipt-page`, `student-marks-report-page`
- [x] Replace major feature `subsection-title` usages with shared heading classes (`quaternary-heading`) in student/faculty detail + profile views
- [x] Shared receipt components migrated: `section-title-row h3` now uses shared heading classes (`tertiary-heading`) in fee + faculty payment receipts
- [x] Shared receipt neutral hardcoded surfaces/text moved to token-backed values where runtime allows
- [x] Replace local `section-title` and `subsection-title` variants with shared heading classes
- [x] Migrate report/receipt styles to token-driven values where runtime allows
- [x] Mobile behavior refined for app report/receipt and fee-dashboard pages: stacked headers and full-width primary actions on <= 768px
- [x] Validate app mobile behavior: smaller typography and selective non-critical content hiding (fee-dashboard, my-marks, fee-defaulters, mark-attendance, report/receipt pages)
- [ ] Remove or isolate risky `::ng-deep` overrides into documented migration-safe wrappers

### Phase P8 TODOs

- [x] Install and configure GSAP in frontend build
- [x] Implement website hero timeline and section reveal presets
- [x] Implement CTA animation presets with reduced-motion fallback — gradient-flow implemented
- [x] Animated gradient text with `ws-gradient-shift` keyframe, `prefers-reduced-motion` guard
- [x] Add `gradient-orbit-outline` reusable mixin and global utility class in shared motion styles
- [x] Apply `gradient-orbit-outline` globally to website and app button surfaces with static border suppression
- [ ] Add app-safe motion presets for dashboards and page entries
- [ ] Validate no conflict with Angular Material interaction motion

## Hardcoded Value Remediation Plan

The current frontend already has theme support, but the codebase still contains many hardcoded values in:

- `frontend/src/app/app.scss`
- `frontend/src/styles/_utilities.scss`
- multiple shared printable/report components
- several feature component SCSS files

Remediation rules:

- colors move to theme CSS custom properties
- font families, sizes, line heights, spacing, radii, shadows, and durations move to variables/tokens
- no fallback hex values unless required for third-party integration boundaries
- inline style colors in templates should be replaced by token-backed classes or CSS variables sourced from TS configuration objects

## Implementation Order

Recommended execution order for actual code changes:

1. replace the palette and define final light/dark token names
2. clean global styles and typography tokens
3. build shared website button and section primitives
4. restyle navbar and footer
5. restyle hero and validate gradients/contrast
6. migrate remaining website sections
7. audit and migrate app screens after website sign-off

## Acceptance Criteria

The theme work for the website is complete when:

- the website light mode uses the selected warm palette consistently
- dark mode feels intentionally designed, not inverted
- buttons, backgrounds, text, borders, shadows, and spacing are token-driven
- no key website component relies on hardcoded font families or brand hex values
- hover, focus, and active states are consistent across navigation and CTAs
- hero, navbar, footer, and section cards visually belong to the same design system
- reduced-motion users are respected for continuous animations
- mobile layout is intentional: typography scales down, spacing compacts, and non-critical content is hidden where appropriate
- heading hierarchy is consistent across website and app (`primary-heading`, `secondary-heading`, etc.)
- documented unused style cleanup (P7) is completed and verified
- Material components remain visually aligned with theme tokens without unsafe global MDC clashes
- external animation layer is standardized (GSAP), accessible, and token-driven

## First Implementation Slice

The best first slice is:

1. token foundation in `frontend/src/styles/_variables.scss` and `frontend/src/styles/_theme.scss`
2. global cleanup in `frontend/src/styles.scss` and `frontend/src/app/app.scss`
3. website navbar, footer, and hero restyle using the new tokens

This gives visible improvement quickly while establishing the right architecture for the rest of the rollout.