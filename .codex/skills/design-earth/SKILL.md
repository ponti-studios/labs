# Earth Intelligence Dashboard — Design System

## Purpose

Use this skill when designing or restyling any part of `apps/earth`.

This is a strict visual and interaction system for a high-credibility Earth intelligence console with a light-first, paper-like interface layered over a dark globe.

Agents using this skill must optimize for:

- editorial intelligence aesthetics over generic dashboard styling
- cream and paper surfaces with soft-black lines and text
- edge-attached system framing instead of floating app cards
- icon-led controls instead of emoji-led controls
- strong, standardized motion across all surfaces

If a proposed design feels like premium glassware, a generic SaaS dashboard, or a colorful sci-fi HUD, it is wrong.

## Non-Negotiables

Always follow these rules:

1. The globe is the product. UI frames it.
2. The UI is light-first and paper-like, not glossy, translucent, or liquid-glass.
3. Major controls attach to screen edges: top bar, side rail, edge drawer, bottom sheet.
4. Use icons, never emojis, for system navigation and actions.
5. Use soft-black typography and linework instead of hard pure black.
6. Use muted accents only where meaning exists: live, warning, critical, selected.
7. Motion must be standardized across components. One animation language, not per-component improvisation.
8. The drawer and nav can animate strongly, but motion must stay authored and deliberate, not playful.
9. Avoid decorative gradients unless they are subtle and paper-like.
10. Avoid glassmorphism, frosted panels, neon accents, and playful bounce.

## Canonical Layout

Default Earth layout should converge on this structure unless the task explicitly requires otherwise:

- `Top command bar`
  - fixed to top edge
  - contains `ponti.earth`, global state, theme control, utilities
- `Left mode rail`
  - primary navigation between `Intel`, `COVID`, `Satellites`, `Locations`
  - compact and vertical on desktop
- `Right contextual drawer`
  - active information panel
  - contains filters, summaries, active feed state, and actions
- `Mobile tactical sheet`
  - bottom-attached summary bar when collapsed
  - expands into a bottom sheet
  - never covers the full screen by default

Do not default to:

- centered modals as primary navigation
- one giant floating card with internal tabs
- glass overlays detached from the frame

## Visual Direction

### Core Mood

Think:

- field dossier table
- printed intelligence report
- editorial surveillance console

Not:

- Apple liquid glass
- fintech analytics dashboard
- playful futuristic cockpit

### Color Tokens

Use these tokens as the source of truth.

#### Core Surfaces

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-app` | `#ebe6dc` | App frame background |
| `--bg-panel-0` | `#f6f0e4` | Primary paper surface |
| `--bg-panel-1` | `#efe7d8` | Nested section surface |
| `--bg-panel-2` | `#e5dccb` | Hover and active secondary surface |
| `--bg-elevated` | `#fbf7ef` | Dropdowns and elevated menus |
| `--bg-globe` | `#0a0a0a` | Cesium sky/space color |

#### Text

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#161514` | Headings and primary content |
| `--text-secondary` | `#43403c` | Body text |
| `--text-muted` | `#76706a` | Labels, timestamps, metadata |
| `--text-ghost` | `#aaa39a` | Disabled or tertiary text |
| `--text-on-dark` | `#f5f1e8` | Text over dark globe overlays |

#### Semantic

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-active` | `#1f1d1b` | Selected state |
| `--status-live` | `#5d7f61` | Live/tracking |
| `--status-warning` | `#9a7a46` | Moderate alerts |
| `--status-critical` | `#985252` | Severe alerts |
| `--status-info` | `#6f8091` | Informational/system |

#### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border-subtle` | `rgba(22,21,20,0.08)` | Dividers |
| `--border-default` | `rgba(22,21,20,0.14)` | Panel edges |
| `--border-strong` | `rgba(22,21,20,0.22)` | Focus and selected |
| `--border-accent` | `rgba(22,21,20,0.30)` | Active nav and selected controls |

### Feed Accent Mapping

Feed accents must stay muted and editorial, never neon:

```text
Battles:                    #b05a4a
Violence against civilians: #bb8450
Riots:                      #b49545
Protests:                   #6b876a
Strategic developments:     #6b8190
Economic / macro:           #7a8464
Mobility / aircraft:        #818079
Cyber:                      #7d7081
```

## Typography

### Fonts

| Token | Value | Usage |
|-------|-------|-------|
| `--font-body` | `"Geist", sans-serif` | UI and body text |
| `--font-mono` | `"Geist Mono", monospace` | Labels, coordinates, data values |

### Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--text-xs` | `11px` | Mono labels, metadata |
| `--text-sm` | `12px` | Secondary values |
| `--text-base` | `13px` | Body text |
| `--text-md` | `14px` | Card titles, controls |
| `--text-lg` | `16px` | Section headers |
| `--text-xl` | `20px` | Top-level drawer and nav titles |

### Typographic Patterns

Use these patterns consistently:

- Labels: `Geist Mono`, `11px`, uppercase, `0.06em` letter spacing, muted color
- Body: `Geist`, `13px`, regular, secondary color
- Values: `Geist Mono` where possible, tabular numerals, primary color
- Headers: `Geist`, `16px`, semibold, tight tracking

Do not use:

- serif fonts
- oversized hero typography
- mixed expressive type treatments

## Spacing and Shape

### Spacing Tokens

| Token | Value |
|-------|-------|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |

### Radii

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Small controls |
| `--radius-md` | `6px` | Buttons and inputs |
| `--radius-lg` | `8px` | Sections and rows |
| `--radius-xl` | `10px` | Large drawer containers |
| `--radius-full` | `9999px` | Pills only |

Use tighter radii than a consumer app. Surfaces should feel drafted and composed, not soft.

## Surface Rules

Preferred panel recipe:

```css
.panel {
  background: #f6f0e4;
  border: 1px solid rgba(22,21,20,0.14);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(22,21,20,0.08);
}
```

Nested section recipe:

```css
.section {
  background: #efe7d8;
  border: 1px solid rgba(22,21,20,0.08);
  border-radius: 8px;
}
```

Important:

- avoid `backdrop-filter`
- avoid glassy translucency
- avoid strong blur
- use subtle shadow and linework to create depth

## Components

### Top Command Bar

Must be:

- fixed
- thin
- horizontally organized
- paper-like, not glossy
- the canonical home for `ponti.earth` and the theme picker

Should not contain:

- stacked marketing copy
- hero branding blocks
- decorative badges without meaning

### Mode Rail

Desktop navigation should prefer a left rail.

Rules:

- vertical stack
- compact icon + label controls
- selected item gets stronger border and darker paper surface
- use icons instead of emoji

Mobile may convert this to:

- one horizontal snapping row, or
- segmented rail inside the bottom sheet

### Context Drawer

The active information panel should be:

- attached to an edge
- internally scrollable
- organized as stacked paper sections
- capable of dense rows and metric blocks

Preferred section anatomy:

- mono label
- terse title
- summary line
- compact controls, rows, or metrics

### Buttons

Primary:

```css
.btn-primary {
  background: #1f1d1b;
  color: #f6f0e4;
  border: 1px solid #1f1d1b;
  border-radius: 6px;
  padding: 8px 14px;
}
```

Secondary:

```css
.btn-secondary {
  background: #efe7d8;
  color: #161514;
  border: 1px solid rgba(22,21,20,0.14);
  border-radius: 6px;
  padding: 8px 14px;
}
```

Ghost:

```css
.btn-ghost {
  background: transparent;
  color: #43403c;
  border: 1px solid transparent;
}
```

### Inputs

```css
.input {
  background: #fbf7ef;
  color: #161514;
  border: 1px solid rgba(22,21,20,0.14);
  border-radius: 6px;
  padding: 8px 12px;
}
```

### Icons

Rules:

- use icons for navigation, theme controls, and action affordances
- use a consistent icon family per screen
- size icons conservatively
- do not mix icons and emoji

## Motion System

### Core Principle

Motion should be visible, standardized, and authored.

It should feel cinematic and precise, not casual or playful.

### Allowed Motion

- page-load enter choreography
- coordinated row and section reveals
- directional drawer motion
- FLIP-based layout transitions
- standardized opacity + transform combinations
- measured height transitions for accordions and sheets

### Disallowed Motion

- random per-component easing choices
- playful bounce on primary containers
- long, floaty transitions
- animation on blur, heavy shadow, or paint-heavy properties

### Timing

Use these defaults:

- micro interaction: `120ms–160ms`
- row reveal or control transition: `160ms–220ms`
- section reveal: `220ms–300ms`
- drawer or sheet open/close: `260ms–360ms`
- page load entrance: `420ms–700ms`

### Easing

Preferred:

- `power2.out`
- `power3.out`
- `expo.out` sparingly

If using GSAP:

- use `Flip` for layout changes
- use timelines for page-load choreography
- use one shared easing language across all surfaces

Do not use `back.out` or theatrical bounce unless the user explicitly requests it.

## Globe Visualization

The globe remains dark, but the UI becomes paper-light.

### Marker Rules

- conflict and intel markers use muted editorial accents
- labels on the globe stay white or light cream with dark outline for legibility
- COVID may use cream or white intensity scaling
- satellites stay precise and minimal

### Wireframe Globe Theme

The theme picker should eventually include a custom Earth theme named something like `wireframe-paper`.

This theme should look like:

- cream landmass and built surface base
- black or soft-black linework
- visible country borders
- architectural / urban line detail where possible
- drafting-table or printed-atlas energy

Target token direction:

```text
land / panel cream:      #f1eadc
linework soft black:     #1a1816
border cream shadow:     #d8cfbf
urban line tint:         #6a655f
```

Theme behavior:

- works as a first-class theme picker option
- still preserves marker legibility
- should feel custom to `ponti.earth`, not like a stock basemap

## Implementation Guidance

When updating Earth UI:

1. Start by enforcing layout structure before styling.
2. Reuse shared panel primitives instead of inventing new card variants.
3. Keep nav, drawer, and mobile sheet behavior consistent across tabs.
4. Prefer rows, lists, and compact metric blocks over tall cards.
5. Use icons, not emoji.
6. Verify the motion system feels consistent across nav, drawer, rows, and overlays.
7. Check the full composition against the globe at desktop and mobile sizes.

### Recommended File Structure

```text
src/lib/components/panel/
  PanelShell.svelte
  PanelSection.svelte
  PanelMetric.svelte
  panel.css

src/lib/components/navigation/
  TopNav.svelte
  ModeRail.svelte
```

## Hard Rejections

Reject any design that introduces:

- liquid glass as the primary Earth surface language
- emoji-based controls
- purple gradients
- oversized rounded SaaS cards
- random motion language per component
- glossy translucent overlays detached from the frame
- top-level hero branding inside the drawer

## Agent Checklist

Before finalizing any Earth design work, verify:

- Is the globe still visually primary?
- Is the UI paper-like and light-first?
- Are lines and typography soft-black rather than harsh black?
- Are icons used instead of emoji?
- Is the layout edge-attached and disciplined?
- Is the motion system consistent across all surfaces?
- Does the custom wireframe-paper globe theme still have room in the system?

If any answer is “no”, redesign before shipping.
