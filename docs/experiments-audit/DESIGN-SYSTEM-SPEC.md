# Labyrinth Design System — Spec & Audit

*"Vercel-level design engineering across every experiment."*

---

## Part 1: Baseline Audit — What We Have

### 1.1 Strengths (keep and amplify)

**Color system.** We have a 75-token color system with two themes (Primer + Apple), each with light/dark mode. Token coverage is comprehensive: base, surface, elevated, text (primary/secondary/tertiary/disabled), border (default/faint/subtle/focus), emphasis (7 levels), interaction (hover/focus states), and 5 chart colors. This is more thorough than most teams ever build. The problem is **nothing uses it.**

**Motion tokens.** We have `durations` (enter: 150ms, exit: 120ms), `translateDistances` (6px enter, 4px exit), and `easingWeb` (enter: `cubic-bezier(0,0,0.2,1)`, exit: `cubic-bezier(0.4,0,1,1)`). These are correct Material-like values. We also have:
- `void-anim-*` CSS classes for Radix enter/exit
- sheet slider animations (360ms enter, 240ms exit with spring-like ease)
- Accordion animations (400ms, custom cubic-bezier)
- A `void-breezy-*` system (wave, stream, stagger)
- Reduced motion `@media` queries everywhere

**Typography.** Apple iOS scale (large-title through caption-2) plus a web-scale (xs through display). Font families set to system-native stacks. Letter-spacing tokens. This is solid.

**Compound components.** We have `CountUpTo` (animated number counting), `MetricCard` (label + value + change), `ParticleBackground` (canvas particle network that reads CSS variables). These are sophisticated. Experiments aren't using them.

**Chart colors.** `CHART_COLORS` and `CHART_CSS_VARS` constants exist. The COVID Analytics experiment ignores them entirely and uses Recharts defaults.

### 1.2 Weaknesses (must fix)

**No experiment shell.** Every experiment builds its own layout from scratch. Some use `h-[calc(100vh-150px)]`, some use `min-h-[calc(100dvh-6rem)]`, some use `h-screen`. No shared scroll container, no shared header, no shared footer. Experiments feel like separate websites.

**No control panel system.** Most experiments have a control panel — a card in the top-right with sliders and buttons. Every one is built from scratch with identical Tailwind classes (`bg-card absolute top-4 right-4 z-50 max-w-72 rounded-lg p-3`). This should be a `<ControlPanel>` component.

**No loading/empty/error state system.** Experiments that fetch data show a spinner. Experiments that don't fetch data skip loading entirely. No experiment has a skeleton screen, an empty state with meaningful illustration, or an error state with a retry action. The user experience degrades differently per experiment.

**No canvas/frame treatment.** Visual output experiments (Pixel Descent canvas, generated images, 3D scenes) sit raw against the page with no framing. A museum doesn't hang paintings without frames. Our visual experiments shouldn't either.

**No page transition system.** Navigating between experiments via the Playground page is a hard cut. No crossfade, no morph, no shared element transition. The view-transition API is available but disabled at the root level with no opt-in path.

**No responsive strategy for experiments.** Experiments use viewport-dependent sizing that breaks below 1024px. The Playground page itself is responsive; the experiments are not.

**Tokens exist, experiments ignore them.** The color system has `text-secondary`, `border-default`, `bg-surface`. The Calendar experiment uses `text-gray-500`, `border-gray-200`, `bg-gray-100`. Tokens are compile-time universal, hardcoded Tailwind classes are point-solutions that rot.

---

## Part 2: What "Vercel-Level" Means

Vercel's design engineering is not one thing. It's a set of disciplined patterns:

### 2.1 Typography as architecture
Text size is never arbitrary. Vercel sites use 3-4 sizes max per page: a display size, a body size, a label size. Weights are reserved for hierarchy — semibold for active nav, regular for body, bold for emphasis. Letter-spacing is `-0.025em` for headlines, `0` for body. Line-height is `1.2` for headings, `1.5-1.6` for paragraphs.

Our experiments violate this constantly:
- Calendar uses `text-xs`, `text-sm`, `text-[10px]`, `text-base`, `text-lg`, `text-xl` all on one page
- LLM Interface uses `text-xs`, `text-sm`, `font-semibold`, `font-bold` with no system
- Theatre Management uses `text-[10px]`, `text-xs`, `text-sm`, `text-lg`, `font-['Geist']`

**Rule:** Every experiment gets exactly 4 text styles: **display** (headline), **body** (content), **label** (metadata), **caption** (secondary metadata). No exceptions.

### 2.2 Spacing as breathing room
Vercel uses generous, consistent spacing. Sections have 80-120px of vertical space. Cards have 24px padding. Lists have 12-16px gaps. The eye needs room to parse hierarchy.

Our experiments cram content. Calendar uses `p-3` (12px) on cards. Control panels use `p-3` (12px). Glass uses `p-3`. Everything is 12px because nobody thought about it.

**Rule:** Content containers get `p-6` (24px). Compact UI (control panels) gets `p-4` (16px). Dense data (tables, lists) gets `p-3` (12px). Section gaps are `gap-8` (32px) minimum.

### 2.3 Motion as punctuation
Vercel animations are brief, purposeful, and rare. A button hover scales to 1.02. A card enters with a 6px lift and 150ms spring. A page transition crossfades in 200ms. Nothing animates for the sake of animating.

Our experiments either have no animation (Calendar, Tarot, LLM Interface — everything appears instantly) or outsized animation (Career Resume — 2500ms auto-advance, large spring movements). There's no middle ground.

**Rule:** Every experiment gets exactly these animations:
- **Page enter:** 150ms `void-enter` (opacity 0→1, translateY 6px→0)
- **Content stagger:** Children enter with 80ms delay between each, using `void-anim-breezy-stagger`
- **Hover feedback:** `scale-[1.01]` or `brightness-105` with 150ms transition
- **Number changes:** CountUpTo component (already built, unused)
- **Chart transitions:** Recharts animations enabled with 800ms duration

### 2.4 Surface as intentional layers
Vercel uses 2-3 surface levels: a background (page), a surface (card), and an elevated surface (modal, popover). Cards have subtle borders (`border-border` at 1px, not `border-gray-200` at 1px) and shadows only when elevated.

Our experiments use raw borders, hard shadows, and inconsistent elevation. The Calendar uses `shadow-2xl` on the phone container. The Glass control panel has no shadow. Cards in the Tarot reading have `border-l-2` accents.

**Rule:** Three surface levels only:
- **bg-background** — page background
- **bg-card** + `border border-border` — content cards
- **bg-card** + `shadow-lg` + `border border-border` — elevated panels (control panels, modals)

### 2.5 Color as communication
Vercel uses color sparingly. One accent color. Black/white for content. Gray for metadata. Color signals state (success=green, destructive=red) but never decorates.

Our experiments use color arbitrarily:
- Calendar uses gray-200, gray-100, gray-50, gray-500, gray-400, gray-800, gray-700, gray-300, gray-900 ALL on one page
- Glass uses raw red-500, green-500, blue-500 for channel indicators
- LLM Interface uses amber-100, blue-100, green-100 for block author badges

**Rule:** Three color roles per experiment:
- **Foreground** (`text-foreground`) — primary content
- **Muted** (`text-muted-foreground`) — metadata, labels, secondary content
- **Accent** (`text-accent` / `bg-accent`) — interactive elements, highlights, data emphasis
- **Semantic** (`text-success`, `text-destructive`, `text-warning`) — state indicators only

---

## Part 3: New Components We Need

### 3.1 `<ExperimentShell>`
Every experiment wraps in this. It provides:
- Consistent viewport sizing (`min-h-screen` with padding)
- Optional back-link to the Playground
- Experiment title + description header
- Content area with proper scroll containment
- Optional footer

```tsx
<ExperimentShell
  title="Glass"
  description="Drag the glass overlay to view chromatic aberration using SVG displacement maps."
  backTo="/projects"
>
  {/* experiment content */}
</ExperimentShell>
```

### 3.2 `<ControlPanel>`
Replaces every ad-hoc control card. Provides:
- Consistent positioning (top-right, bottom-left, or sidebar)
- Title + description
- Collapsible sections
- Proper backdrop blur + border
- Dark/light mode adaptive

```tsx
<ControlPanel title="Glass Effect" description="Drag to view chromatic aberration.">
  <ControlPanel.Section title="Displacement">
    {/* sliders */}
  </ControlPanel.Section>
</ControlPanel>
```

### 3.3 `<ExperimentFrame>`
Wraps visual output (canvas, 3D scene, generated image) in a gallery-style frame:
- Subtle shadow
- Optional dark surround
- Loading state within the frame
- Error state within the frame
- Caption/credit line below

```tsx
<ExperimentFrame loading={isLoading} error={error}>
  <canvas ref={canvasRef} />
</ExperimentFrame>
```

### 3.4 `<DataCard>` (extends existing `MetricCard`)
Our `MetricCard` exists but has no variants. We need:
- `variant="hero"` — large number (48px), prominent for primary KPI
- `variant="metric"` — medium number (28px), for supporting metrics
- `variant="compact"` — small number (20px), for lists/dashboards
- All variants support `trend` (up/down arrow), `sparkline` (mini chart), and `change` (delta)

### 3.5 Skeleton system
A set of skeleton components for loading states:
- `<SkeletonText lines={3} />` — text placeholder
- `<SkeletonCard />` — card placeholder
- `<SkeletonChart />` — chart placeholder
- `<SkeletonImage />` — image placeholder

### 3.6 Empty state system
A consistent empty state pattern:
```tsx
<EmptyState
  icon={<Sparkles />}
  title="Ready to Imagine"
  description="Configure your parameters on the left and hit generate."
  action={<Button>Generate Scene</Button>}
/>
```

### 3.7 Error state system
```tsx
<ErrorState
  title="Generation Failed"
  description="The API returned an unexpected response. This might be a temporary issue."
  onRetry={() => regenerate()}
/>
```

---

## Part 4: Experiment-Specific Design Assignments

Every experiment gets a **design identity** — not just "it uses the design system" but "it has a visual personality within the system."

### 4.1 Calendar → "Precision Time"
- **Mood:** Crisp, editorial, Swiss railway clock
- **Typography:** Tabular numbers for times, medium weight for event titles
- **Color:** Monochromatic + red for collisions, teal for "now"
- **Surface:** White card stack, subtle rule lines between hours
- **Motion:** Smooth scroll to "now" on load, gentle fade on event reorder

### 4.2 LLM Interface → "Code & Context"
- **Mood:** Developer tool, VS Code-esque, terminal-informed
- **Typography:** Monospace for content, system font for UI
- **Color:** Dark by default, syntax-inspired role colors (green=assistant, blue=user, amber=system)
- **Surface:** Dark panels with subtle borders, block indentation lines

### 4.3 Infinite Scroll → "Gallery in Motion"
- **Mood:** Luxury editorial, art direction piece
- **Typography:** Minimal — maybe just a collection title
- **Color:** Warm monochromatic or duo-tone, heavy use of the mask gradient
- **Surface:** Full-bleed images, no borders, no cards
- **Motion:** Different column speeds, smooth hover pause with scale

### 4.4 Glass → "Optics Lab"
- **Mood:** Precision instrument, scientific tool
- **Typography:** Clean, data-forward, numerical values aligned
- **Color:** Neutral + RGB channel accents (red/green/blue = physics, not decoration)
- **Surface:** Glass morphism for the control panel, dark surround for the image
- **Motion:** Inertial drag, smooth slider transitions

### 4.5 ThreeGL AI Explainer → "Data Center Visualization"
- **Mood:** Dark ops room, Bloomberg terminal meets sci-fi
- **Typography:** Monospace labels, data-forward numbers
- **Color:** Dark blue/black background, cyan-to-pink gradient for data flow
- **Surface:** Translucent glass control panel OVER the 3D scene
- **Motion:** Bloom pulses on layer activation, particle flow with trails, auto-orbit camera

### 4.6 Image Generation → "Creative Studio"
- **Mood:** Darkroom meets design tool, Lightroom/Figma hybrid
- **Typography:** Clean sans-serif, generous line-height
- **Color:** Dark sidebar, large bright preview area
- **Surface:** The image IS the interface — large preview, minimal chrome
- **Motion:** Smooth generation progress, image fade-in on completion

### 4.7 Theatre Management → "Financial Dashboard"
- **Mood:** Bloomberg Terminal, clean data density
- **Typography:** Tabular numbers everywhere, tight line-height for data
- **Color:** Green/amber/red for financial health, neutral for structure
- **Surface:** Flat cards with subtle borders, P&L as a proper financial statement
- **Motion:** Number count-up on slider changes, smooth chart transitions

### 4.8 Pixel Descent → "Gallery Installation"
- **Mood:** Museum piece, framed algorithmic art
- **Typography:** Gallery-style title + artist statement
- **Color:** Dark frame around the pixel canvas, warm 1930s palette within
- **Surface:** Deep matte black frame, the canvas is the hero
- **Motion:** Subtle canvas fade-in, smooth parameter transitions

### 4.9 Career Resume → "Keynote in a Browser"
- **Mood:** Product launch presentation, confident and minimal
- **Typography:** Bold display for headlines, clean body
- **Color:** Dark background, single accent color (yellow), white text
- **Surface:** Full-viewport slides, no chrome
- **Motion:** Spring text entrance, slide transitions, progress bar tracking

### 4.10 Tarot → "Digital Ritual"
- **Mood:** Mystical but modern, dark academia
- **Typography:** Serif for card names, sans-serif for readings
- **Color:** Dark gradient background, warm gold accent, card-appropriate tints
- **Surface:** Framed card with shadow, soft glow on keywords
- **Motion:** Card flip reveal on draw, gentle fade-in for reading panels

### 4.11 COVID Analytics → "Data Observatory"
- **Mood:** Scientific dashboard, observatory console
- **Typography:** Data-dense but readable, tabular numbers for stats
- **Color:** Brand-themed charts, semantic colors for trends (red=rising, green=falling)
- **Surface:** Clean white/dark cards, data-first layout
- **Motion:** Chart transitions on country switch, stat number count-up

---

## Part 5: Implementation Sequence

| Phase | Deliverable | Depends on |
|-------|-----------|------------|
| 1 | `<ExperimentShell>`, `<ControlPanel>`, `<ExperimentFrame>` | — |
| 2 | Skeleton system, EmptyState, ErrorState | Phase 1 |
| 3 | `<DataCard>` variants | Phase 1 |
| 4 | Calendar rewrite (uses Phase 1 + 2 + 3) | Phase 3 |
| 5 | LLM Interface rewrite (uses Phase 1 + 2) | Phase 2 |
| 6 | Infinite Scroll rewrite (uses Phase 1 + frame) | Phase 1 |
| 7 | Glass rewrite (uses Phase 1 + frame) | Phase 1 |
| 8 | ThreeGL AI Explainer polish (uses Phase 1 control panel) | Phase 1 |
| 9 | Image Generation rewrite (uses Phase 1 + 2 + 3) | Phase 3 |
| 10 | Theatre Management polish (uses Phase 3) | Phase 3 |
| 11 | Pixel Descent rewrite (uses Phase 1 + frame) | Phase 2 |
| 12 | Career Resume rewrite (uses Phase 1) | Phase 1 |
| 13 | Tarot polish (uses Phase 1 + 2) | Phase 2 |
| 14 | COVID Analytics polish (uses Phase 3 chart colors) | Phase 3 |

---

## Part 6: Non-Negotiables (the rules every experiment must follow)

1. **No hardcoded Tailwind grays.** `text-gray-500`, `border-gray-200`, `bg-gray-100` are forbidden. Use `text-muted-foreground`, `border-border`, `bg-muted`.

2. **No raw DOM manipulation.** No `e.currentTarget.style.opacity = "0.5"`. Use React state + className toggles.

3. **Every fetching experiment gets: skeleton → content || empty || error.** All three states, every time. No exception.

4. **Every visual output gets a frame.** 3D scenes, canvases, generated images all use `<ExperimentFrame>`.

5. **Every control panel uses `<ControlPanel>`.** No more ad-hoc `bg-card absolute top-4 right-4` cards.

6. **Every experiment wraps in `<ExperimentShell>`.** Consistent viewport, header, and navigation.

7. **Every data-display experiment uses `<DataCard>`.** No more raw divs for metric display.

8. **Charts use `CHART_COLORS`.** No default Recharts hex values.

9. **Motion uses the tokenized durations and easings.** 150ms enter, 120ms exit. `cubic-bezier(0,0,0.2,1)` for enter, `cubic-bezier(0.4,0,1,1)` for exit. Or use the `void-anim-*` CSS classes.

10. **4 text styles max per experiment.** display (headline), body (content), label (metadata), caption. No `text-[10px]` one-offs.
