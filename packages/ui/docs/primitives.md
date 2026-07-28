# Primitives

The component set defined in `@ponti-studios/ui`. Each entry is a contract:
the variants, sizes, and states listed are the only ones that exist. A new
prop value not on this list is a new component, not a variant, and needs a
documented behavioral need before it ships.

Route files compose primitives. They do not invent new visual patterns, new
elevation levels, or new color values inline.

---

## Primitives

### Button

- **Variants:** `default` (filled `--primary`, `--primary-foreground` label), `secondary` (filled `--card`, `--text-primary` label), `destructive` (filled `--destructive`, `--destructive-foreground` label), `outline` (transparent, `--border-default` border, `--text-primary` label), `ghost` (transparent, no border, `--text-primary` label), `link` (transparent, `--primary` text, underline on hover).
- **Sizes:** `sm` (min-h-8, `--text-xs`), `md` (min-h-9, `--text-sm`), `lg` (min-h-10, `--text-base`), `icon` (square, size-9).
- **Shape:** `--radius-md` on every variant, including `outline`. `icon` size is square.
- **States:** default, pressed, `disabled` (reduced opacity, `cursor-not-allowed`), `aria-busy` (loading spinner overlaid, label hidden, width preserved), `focus-visible` (ring-2 with `--focus-ring`).
- **Default type:** `type="button"`. Never defaults to submit.
- Picking a variant is a hierarchy decision: `default` for the one action the screen wants done, `secondary` or `outline` for a real but lesser action, `ghost` only when the action's location is already obvious from context, `link` for navigation that must read as a link rather than a button.

### Badge

- **Variants:** `default` (`--primary` fill), `secondary` (`--card` fill, `--text-secondary` label), `destructive`, `outline`, `ghost`, `link`, `ref` (mono font, `--tertiary`, for reference IDs).
- **Size:** single default size (`--text-xs`, px-1.5, py-px). No small/large variants.
- **Shape:** `--radius-sm`.
- **States:** default, `aria-invalid` (destructive border + ring).
- **Motion:** `state-settle` transition (120ms ease-out).

### StatusBadge

Config-driven badge. Maps a status value to `{ label, variant, icon }`.
Falls back gracefully when the status is null or undefined.

### Label

- **Style:** `--text-sm`, `font-medium`, `leading-none`, `--text-primary`.
- **States:** `peer-disabled` (reduced opacity, `cursor-not-allowed`).

### Avatar

- **Subcomponents:** `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarGroup`, `AvatarGroupCount`.
- **Sizes:** `sm` (size-6), `default` (size-6), `lg` (size-10).
- **Shape:** `--radius-full`.
- **States:** Optional `statusBadge` dot (primary fill, ring-2 `--background`).

### Card

- **Subcomponents:** `Card` (root container), `CardHeader` (border-b, px-4 py-3), `CardTitle`, `CardDescription` (`--text-secondary`, `--text-sm`), `CardAction` (grid column 2), `CardContent` (p-4), `CardFooter` (border-t, px-4 py-3).
- **Shape:** `--radius-xl`, `--border-default` border, `--card` background.
- A Card groups related content that benefits from visual containment — metrics, summaries, grouped settings. It is not a default wrapper for every section of content.

### SectionIntro

- **Slots:** `eyebrow` (`--text-xs` uppercase, `tracking-wide`, `font-medium`), `title` (`.display-2` or `--text-2xl`, `font-semibold`, `tracking-tight`), `description` (`--text-secondary`), `actions`.
- Introduces a screen or major section. One per screen when used.

---

## Forms

### Input

- **Sizes:** single default (h-9, `--text-base md:text-sm`).
- **Shape:** `--radius-md`, `--border-default` border, `--background` fill. Input is always a bordered box — a bottom hairline alone does not read as a typeable field.
- **States:** default, `disabled` (reduced opacity, `cursor-not-allowed`), `aria-invalid` (destructive border + ring), `focus-visible` (ring-2 `--focus-ring`).
- **Contract:** accepts native HTML input types. Placeholder describes expected input; error state shows an inline message via the `Field` wrapper.

### Textarea

- Same states as Input. `min-h-16`, `--radius-md`, `--border-default` border, transparent background, `field-sizing-content`. Grows to fit content.

### Field (form field wrapper)

- **Props:** `label`, `helpText`, `error`, `required`, `children`, `id`.
- **Behavior:** auto-generates `id`, wires `aria-describedby` for help text and errors, injects `aria-invalid` into child when in error state. Required fields show an asterisk after the label.
- Error text renders in `--text-destructive`.

### TextField

- **Props:** `label`, `helpText`, `error`, `disabled`, `type` (`text` | `email` | `password` | `search`).
- When no label, helpText, or error is provided, renders bare `Input`. Otherwise wraps in `Field`.

### Select

- **Subcomponents:** `SelectTrigger` (button with `SelectValue`), `SelectContent` (popover with items), `SelectGroup`, `SelectLabel`, `SelectItem`, `SelectScrollUpButton`, `SelectScrollDownButton`.
- **Trigger sizes:** `sm` (h-8), `default` (h-9).
- **Shape:** trigger `--radius-md`, content `--radius-md`, `--border-default` border, `--popover` background.
- **States:** default, `disabled`, `aria-invalid`, `data-placeholder` (muted text), `data-highlighted` (item hover), `data-disabled` (item).
- Content opens with animate-in/out (fade + zoom, 150ms).

### Switch

- **Sizes:** `sm` (h-3.5, w-6), `default` (h-4, w-8).
- **Shape:** `--radius-full` track. Thumb gets `--shadow-xs`.
- **States:** default, `data-checked` (`--primary` fill), `data-unchecked` (`--border-default` fill), `disabled`, `focus-visible`.
- **Motion:** `transition-all` on thumb.

### Slider

- **Shape:** `h-2`, `--radius-full` track. Thumb: `h-6 w-6`, `--radius-full`, `--shadow-sm` + `ring-1 ring-black/5`.
- **States:** default, `disabled`, `focus-visible` (thumb ring-2).

### RadioGroup

- **Subcomponents:** `RadioGroup`, `RadioGroupItem`.
- **Shape:** item: `aspect-square h-6 w-6`, `--radius-full`, `--border-default` border. Indicator: filled circle with `--primary`.
- **States:** default, `disabled`, `focus-visible`.

### Stepper

- **Props:** `value`, `min`, `max`, `step`, `onChange`, `format`, `disabled`.
- **Uses:** ghost Button variants, `--border-default` border, `--muted` background, `--radius-lg`.

### Calendar

- react-day-picker wrapper. `--radius-md`, `p-4`. Day buttons: `size-6`, `--radius-md`, `--text-sm`.
- **States:** `selected`, `today`, `outside`, `disabled`, `range_start`, `range_middle`, `range_end`.

### DatePicker

- Trigger variant: any Button variant (default `outline`).
- **Alignment:** `start` | `center` | `end`.
- **Props:** `value`, `onSelect`, `placeholder`, `label`, `dateFormat`.

### DropZone

- **States:** default (dashed `--border-default` border, `--muted` background), `dragActive` (`--primary` border, `--primary` background at 5% opacity), `isImporting` (pointer-events-none).

### EntitySelect, DateMonthSelect, GroupBySelect, PasskeyManagement

Utility form controls. See `@ponti-studios/ui` source for full contracts.
Do not build a custom version when the package already exports one.

---

## Feedback

### Alert

- **Variants:** `default` (`--card` background), `destructive` (`--border-default` border with destructive opacity, `--text-destructive` text).
- **Subcomponents:** `Alert` (role="alert"), `AlertTitle` (font-medium), `AlertDescription` (`--text-secondary`).
- **Shape:** `--radius-md`, `--border-default` border, px-4 py-3.

### Spinner

- **Sizes:** `sm` (size-4), `md` (size-5), `lg` (size-8), `xl` (size-12).
- **Layout:** `inline` or `centered` (flex w-full py-12).
- **Contract:** `role="status"`, accessible label required. Used for action loading, never content loading. `motion-safe` only — spins only when the user has not requested reduced motion.

### Skeleton

- **Style:** `--muted` fill, `--animate-pulse`, `--radius-md`. Generic placeholder for loading content.
- **Contract:** mirrors the dimensions of the content it precedes. Used for content loading, never action loading.

### Progress

- **Track:** `--primary` at 20% opacity, `h-2`, `--radius-full`.
- **Indicator:** `--primary` fill, `h-full`, `transition-all`. Value-driven (0–100).

### ProgressBar

- Standalone linear bar. `h-[2px]`, `--warning` border. Width maps to progress value.

### EmptyState

- **Variants:** `default` (`--card` background, `--border-default` border), `dashed` (dashed border), `quiet` (`--background`), `search` (`--muted` background, dashed border).
- **Sizes:** `md` (min-h-64), `lg` (min-h-80, px-6 py-10).
- **Layouts:** `centered` (flex-col, text-center) or `inline`.
- **Slots:** `icon`, `title`, `description`, `action`, `children`.
- States what is absent and what to do next.

### FileUploadStatus, FileUploadStatusBadge, UpdateGuard

See `@ponti-studios/ui` source. Do not rebuild uploaded file status tracking
or service-worker lifecycle UI when the package provides them.

---

## Overlays

### Dialog

- **Subcomponents:** `DialogTrigger`, `DialogContent` (`max-w-[30rem]`, `--radius-lg`, `--popover` background, p-4 sm:p-6), `DialogOverlay` (`--overlay-scrim` at 80%, fixed inset-0, `--z-index-50`), `DialogHeader`, `DialogFooter`, `DialogTitle` (`--text-lg`, `font-semibold`, `tracking-tight`), `DialogDescription` (`--text-secondary`, `--text-sm`).
- **Animation:** open/close with fade + zoom (`.animate-in`/`.animate-out`).
- **Contract:** confirmation content; substantial content gets a screen. Never nests another overlay.
- **Accessibility:** `role="dialog"`, `aria-modal`, focus trap, escape dismiss.

### AlertDialog

- **Subcomponents:** `AlertDialogTrigger`, `AlertDialogContent` (`max-w-lg`, bottom sheet on mobile with `--radius-t-xl`, centered dialog on desktop with `--radius-xl`), `AlertDialogOverlay`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction` (default Button), `AlertDialogCancel` (outline Button).
- **Contract:** destructive confirmations and irreversible actions. The action button names the result; the cancel button is always present.
- **Accessibility:** `role="alertdialog"`, `aria-modal`, focus trap.

### Sheet

- **Subcomponents:** `SheetTrigger`, `SheetContent` (`--background`, bottom sheet on mobile with `--radius-t-xl` and `max-h-[90dvh]`, right panel on desktop with `md:max-w-sm` and `md:--radius-l-xl`), `SheetOverlay`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`.
- **Safe area:** `pb-[max(1rem,env(safe-area-inset-bottom))]`.
- **Contract:** content that benefits from the sheet gesture model — settings panels, detail views, filters. Never nests another sheet or dialog.

### Popover

- **Subcomponents:** `PopoverTrigger`, `PopoverContent` (`w-72`, `--radius-md`, `--border-default` border, p-4, `--popover` background), `PopoverAnchor`.
- **Alignment:** `align` (`start` | `center` | `end`), `side` (`top` | `right` | `bottom` | `left`), `sideOffset` (default 4), `avoidCollisions`.
- **Animation:** open/close via `data-open:animate-in` / `data-closed:animate-out`.

### DropdownMenu

- **Subcomponents:** `DropdownMenuTrigger`, `DropdownMenuContent` (`min-w-[8rem]`, `--radius-md`, `--border-default` border, p-1, `--popover` background), `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator` (`h-px`, `--border-default`), `DropdownMenuShortcut`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` (`--shadow-lg`).
- **Item variants:** `default`, `destructive`.
- **States:** `data-highlighted`, `data-disabled`, `data-open` (sub-trigger).
- **Animation:** open/close via animate-in/out.

### Command (combobox)

- **Subcomponents:** `CommandInput`, `CommandList` (max-h-75, scrollable), `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandListLoading`.
- **Shape:** `--popover` background, `--radius-md`. Items get `data-highlighted` and `data-disabled`.
- Used for search-and-select patterns with typed filtering.

---

## Navigation

### Tabs

- **Subcomponents:** `TabsList` (`--muted` background, `--radius-full`, `--border-default` border, p-1, gap-1), `TabsTrigger` (`--radius-full`, `data-active` gets `--background` fill + `--border-default` border), `TabsContent` (mt-2, `--radius-md`).
- Used for a small set of mutually exclusive views of the same content — not a substitute for a screen's worth of navigation.

### PaginationControls

- **Props:** `currentPage` (zero-indexed), `totalPages`, `onPageChange`.
- Single page: renders nothing. Multiple pages: Previous/Next with page counter. Uses outline Button, size `sm`, dashed border.

### RouteLink

Polymorphic link component. Accepts an `as` prop for the router's link
component. Fires `onNavigate` callback before click.

### AppNavigation

- **Props:** `brand`, `brandHref`, `links[]`, `cta`, `endContent`, `activeHref`.
- **Layout:** `sticky top-0`, `--background` at 95% opacity, `backdrop-blur`, `--border-default` border-bottom. Mobile: Sheet-based hamburger menu.
- Active link detection: exact match or prefix match.

---

## Data Display

### Table

- **Subcomponents:** `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead` (`--text-secondary`, h-9, `--text-xs`, `font-medium`), `TableCell` (px-3 py-2.5), `TableCaption`.
- **States:** `data-[state=selected]` on rows (`--muted` background).
- **Footer:** `--muted` background, `font-medium`.

### MetricCard

- **Props:** `label`, `value`, `change`.
- Uses `.ui-flat-card`, `.ui-data-label`, `.ui-data-value` utility classes.

### FilterChip

- **Props:** `label`, `onRemove`, optional `onClick` for edit.
- **Shape:** `--card` background, `--text-primary` label, `--radius-full`, `--border-default` border, `--text-sm`, `font-medium`.
- Remove button: `--text-secondary` default, `--text-primary` on hover.
- Restricted to compact status, filter, and tag use — not a substitute for a button or a card.

### Accordion

- **Subcomponents:** `AccordionItem` (`mb-2`, `--radius-md`, `--border-default` border), `AccordionTrigger` (flex, `font-semibold`, chevron rotates 180deg on open), `AccordionContent` (height-expand animation).
- **Type:** `single` or `multiple`.
- Chevron transition: `--duration-200`.

### SortControls / SortRow

- Sort directions: `asc`, `desc`. Uses DropdownMenu for container, Select for field/direction pickers.

---

## Layout

### ScrollArea

- **Props:** `orientation` (`horizontal` | `vertical`), `snap` (`start` | `center` | `none`).
- Scrollbar hidden by default. Optional CSS snap points.

### SurfacePanel

- **Shape:** `--border-default` border, `--card` background, `--radius-3xl`, p-5.
- **Polymorphic:** `as` prop for element type.
- Used for large, visually distinct content regions that benefit from a
  container. Not a default wrapper for every section.

---

## Component rules

- Existing `@ponti-studios/ui` components are used before a custom one is
  proposed. A new component requires a behavior none of the existing
  primitives can express — documented in the PR description.
- Route files compose primitives; they do not invent design systems.
- Hardcoded colors, radii, spacing values, font sizes, or durations in
  screen code are prohibited — every value must resolve to a token from
  Foundations.
- Web components that depend on the DOM (Table, DropdownMenu, PaginationControls,
  Command, etc.) do not render on native. Use the native-equivalent primitives
  or build a designated native adapter in `apps/omiro`.
