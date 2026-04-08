# RedBadger - Maze Explorer Game

## Overview

RedBadger is a real-time maze exploration game where the player navigates a procedurally generated maze while dodging patrolling hazards to reach the exit portal. Built with React 19, TypeScript, and Framer Motion.

---

## 1. Concept & Vision

A minimalist geometric maze game that feels responsive and alive. The player controls a small robot navigating through claustrophobic corridors while deadly geometric hazards patrol their routes. The tension comes from timing movements through gaps in patrol patterns, not from pixel-perfect navigation. Success feels like threading a needle; failure feels sudden but fair.

**Core loop:** Enter maze → dodge hazards → reach exit → next level

---

## 2. Design Language

### Aesthetic Direction
Minimalist geometric with a dark, focused atmosphere. Think Monument Valley meets Hotline Miami's alertness. Clean shapes, high contrast interactive elements, subtle ambient motion.

### Color Palette
```
--bg-primary:      #0D0D0F       /* Deep charcoal, almost black */
--bg-secondary:    #1A1A1E       /* Slightly lighter for depth */
--grid-line:       #2A2A30       /* Subtle grid dots */
--wall:            #3D3D45       /* Solid maze walls */
--wall-highlight:  #4A4A55       /* Wall edge highlight */

--player:          #00D4FF       /* Cyan - the player robot */
--player-glow:     #00D4FF40    /* Player ambient glow */

--hazard-fast:     #FF3366       /* Triangles - fast hazards */
--hazard-slow:     #FF9500       /* Squares - slow hazards */

--exit:            #00FF88       /* Green pulsing exit portal */
--exit-glow:       #00FF8840     /* Exit ambient glow */

--text-primary:    #FFFFFF
--text-secondary:  #888899
--text-accent:     #00D4FF
```

### Typography
- **Headings:** JetBrains Mono (monospace, techy feel)
- **Body/UI:** Inter
- **Level numbers:** JetBrains Mono at large scale

### Spatial System
- Grid-based movement on a 15x15 cell base (scales with level)
- Each cell is 40px on desktop, responsive via container queries
- 4px gap between cells for grid visibility
- Walls occupy full cells; robot/hazards are 80% of cell size

### Motion Philosophy
- **Player movement:** Spring physics (stiffness: 300, damping: 25) - snappy but smooth
- **Hazard patrol:** Linear interpolation, predictable timing (players can learn patterns)
- **Exit portal:** Continuous subtle pulse (scale 1.0 → 1.1, 1.5s loop)
- **Level transition:** Fade to black (300ms) → fade in new maze (300ms)
- **Death:** Screen flash red, player shrinks with spin, 500ms before restart prompt

### Visual Assets
- **Player robot:** Circle with directional notch (triangle indicating facing)
- **Hazards:** Filled geometric shapes with subtle glow matching their color
- **Walls:** Rounded rectangles with subtle top-edge highlight
- **Exit:** Concentric rings that pulse outward
- **Decorative:** Subtle scan-line overlay for CRT feel (optional, toggleable)

---

## 3. Layout & Structure

### Screen States

#### A. Title Screen
- Full-screen dark background
- "REDBADGER" title centered, large, JetBrains Mono
- Subtitle: "MAZE EXPLORER" smaller below
- "Press any key to start" pulsing at bottom
- Animated maze visible in background (demo mode, no player)
- Level selector below prompt: "Level 1" through "Level 10" (clickable)

#### B. Game Screen
- Maze fills 80% of viewport height (centered)
- HUD overlay at top: Level number (left), "WASD to move" hint (center), pause icon (right)
- Player robot clearly visible with glow
- Hazards animated on their patrol paths
- Exit portal pulsing in goal location
- No on-screen controls (keyboard only for now)

#### C. Pause Overlay
- Semi-transparent dark overlay
- "PAUSED" centered
- "Press ESC to resume" below
- Optional: "R to restart level"

#### D. Death Screen
- Red flash (100ms)
- Player shrinks/spins animation (400ms)
- "CAUGHT" text appears
- "Press SPACE to retry" below
- Death counter shown: "Deaths: X"

#### E. Level Complete Screen
- Exit pulses brightly (celebration)
- "LEVEL X COMPLETE" slides in
- Brief stats: Time taken, deaths this level
- Auto-advances after 2 seconds or on keypress

#### F. Game Complete Screen
- All levels cleared
- Total deaths shown
- "You escaped!" message
- "Press SPACE to play again" option
- Confetti or geometric particle celebration

### Responsive Strategy
- Desktop (>1024px): Full 40px cells, comfortable keyboard play
- Tablet (768-1024px): 30px cells, touch swipe controls enabled
- Mobile (<768px): 24px cells, swipe controls prominent, on-screen D-pad

---

## 4. Features & Interactions

### Core Mechanics

#### Player Movement
- **Input:** WASD or Arrow keys
- **Behavior:** Holding a key moves continuously; releasing stops immediately
- **Physics:** Spring-based interpolation between cells (300ms per cell base, modified by key-hold speed)
- **Collision:** Cannot move through walls; movement in that direction simply doesn't occur
- **Edge behavior:** Cannot exit maze boundaries

#### Maze Generation
- Algorithm: Recursive backtracker (creates good maze with long corridors)
- Guarantee: Always has a valid path from start to exit
- Scaling: Level 1 = 10x10, Level 2 = 12x12, ... Level 10 = 28x28
- Start position: Always top-left area
- Exit position: Always bottom-right area
- Walls: Generated to create interesting patrol corridors

#### Hazard System
- **Types:**
  - Triangle hazards: Move at 1 cell per 400ms, change direction at walls
  - Square hazards: Move at 1 cell per 800ms, same behavior
- **Patrol AI:** Simple bounce off walls (reverse direction)
- **Spawn:** Each level has (level + 1) hazards, placed in open areas away from start
- **Collision:** If player occupies same cell as hazard = death

#### Progression
- 10 levels total
- Completing level N unlocks level N+1
- Progress saved to localStorage
- Optional: "Freeplay" mode with random maze after completing all levels

### Interaction Details

| Action | Trigger | Result |
|--------|---------|--------|
| Move | WASD/Arrows down | Player starts moving in direction, facing changes |
| Stop | WASD/Arrows up | Player stops at current cell |
| Pause | ESC key | Game pauses, overlay appears |
| Unpause | ESC key | Resume gameplay |
| Restart | R key (when paused or dead) | Restart current level |
| Retry | SPACE (when dead) | Restart current level |
| Skip | SPACE (when level complete) | Advance to next level |

### Edge Cases
- **Hazard catches player during level transition:** Death triggers, not allowed
- **Player at exit same frame hazard enters:** Player wins (generous)
- **All keys pressed simultaneously:** Priority: W/Up > S/Down > A/Left > D/Right
- **Browser tab loses focus:** Auto-pause game
- **Resize during gameplay:** Maze scales smoothly, game continues

### States

#### Empty States
- Level 1 on first play: Tutorial hint overlay "Use WASD to move. Reach the green exit!"

#### Loading States
- Maze generation is instant (<16ms), no loading state needed
- Initial app load: React Suspense fallback with pulsing logo

#### Error Handling
- localStorage unavailable: Game still works, progress just won't persist
- WebGL/animations unavailable: Falls back to instant (no spring) movement

---

## 5. Component Inventory

### `<TitleScreen />`
- **Default:** Logo, subtitle, "Press any key" prompt, level select buttons
- **States:** Idle (animated maze in background), Level selected (brief flash before transition)

### `<GameHUD />`
- **Default:** Level indicator left, hint text center, pause icon right
- **Paused:** Dimmed
- **Level complete:** Hidden during celebration

### `<MazeGrid />`
- **Default:** Renders all cells, walls, grid lines
- **Cells:** Wall cells are solid; empty cells show subtle grid dot
- **Responsive:** Scales via CSS container queries

### `<Player />`
- **Default:** Cyan circle with directional notch, subtle glow
- **Moving:** Spring animation between cells, notch rotates to face direction
- **Dead:** Shrinks and spins, color fades to gray

### `<Hazard />`
- **Default:** Triangle (fast) or Square (slow), colored glow, idle bob animation
- **Moving:** Smooth translation along patrol path
- **Types distinguished by shape and color intensity (triangles are brighter)**

### `<ExitPortal />`
- **Default:** Concentric rings pulsing outward, green glow
- **Player nearby:** Pulse speeds up
- **Activated:** Bright flash when player reaches it

### `<PauseOverlay />`
- **Default:** Semi-transparent black overlay, "PAUSED" centered
- **States:** Can show restart hint

### `<DeathOverlay />`
- **Default:** Red tint, "CAUGHT" text, death counter
- **Animation:** Fades in over 200ms after player death animation completes

### `<LevelCompleteOverlay />`
- **Default:** Stats display, auto-advance countdown
- **Animation:** Slides in from top

### `<GameCompleteScreen />`
- **Default:** Celebration effects, final stats
- **Interaction:** SPACE to restart from level 1

---

## 6. Technical Approach

### Stack
- **Framework:** React 19 (concurrent features for smooth gameplay)
- **Language:** TypeScript (strict mode)
- **Styling:** CSS Modules + CSS Custom Properties
- **Animation:** Framer Motion (spring physics, gesture handling)
- **Build:** Vite 6
- **State:** React useState/useReducer (no external state library needed)

### Architecture

```
src/
├── main.tsx                 # Entry point
├── App.tsx                  # Root component, screen routing
├── App.css                  # Global styles, CSS variables
├── types/
│   └── game.ts              # Shared type definitions
├── hooks/
│   ├── useGameState.ts      # Core game state machine
│   ├── usePlayerMovement.ts # Input handling + spring animation
│   ├── useMazeGenerator.ts  # Procedural maze creation
│   └── useHazards.ts        # Hazard patrol logic
├── components/
│   ├── TitleScreen.tsx
│   ├── GameScreen.tsx
│   ├── MazeGrid.tsx
│   ├── Player.tsx
│   ├── Hazard.tsx
│   ├── ExitPortal.tsx
│   ├── HUD.tsx
│   └── overlays/
│       ├── PauseOverlay.tsx
│       ├── DeathOverlay.tsx
│       ├── LevelCompleteOverlay.tsx
│       └── GameCompleteScreen.tsx
└── utils/
    ├── mazeGenerator.ts     # Recursive backtracker algorithm
    └── directions.ts        # Direction vectors and helpers
```

### Key Implementation Details

#### Game Loop
- Uses `requestAnimationFrame` via Framer Motion's animation engine
- Delta-time based movement for consistent speed across frame rates
- State updates batched via React 18+ automatic batching

#### Collision Detection
- Simple grid-based: check if player cell === hazard cell
- Runs every frame during active gameplay
- Wall collision is pre-validated (invalid moves are never initiated)

#### Maze Generation (Recursive Backtracker)
```
1. Create grid of cells, all walls intact
2. Pick starting cell, mark as visited
3. While unvisited cells exist:
   a. If current cell has unvisited neighbors:
      - Choose random unvisited neighbor
      - Remove wall between current and neighbor
      - Push current to stack, move to neighbor
   b. Else:
      - Pop from stack (backtrack)
4. Return completed maze
```

#### Spring Physics
- Framer Motion's `useSpring` for player position
- Config: `{ stiffness: 300, damping: 25, mass: 1 }`
- Position updates are visual only; logical position snaps to grid

### Performance Considerations
- Maze rendered once per level; walls/empty cells don't re-render
- Player/Hazard components are isolated; only they animate
- Collision checks are O(hazards) not O(cells)
- CSS `will-change` on animated elements
- No heavy computations during gameplay (all pre-calculated on level start)

### Accessibility
- Keyboard-only fully playable
- High contrast colors meet WCAG AA
- Reduced motion: `@media (prefers-reduced-motion)` disables springs, uses instant movement
- Focus states visible for level select

---

## 7. Out of Scope (Future)

These features are intentionally excluded from v1 but could be added later:

- [ ] Sound effects and music
- [ ] Touch controls with on-screen D-pad (v1 will have swipe on mobile)
- [ ] Multiplayer/couch co-op
- [ ] Online leaderboards
- [ ] Custom maze drawing/importing
- [ ] Difficulty modifiers (hazard speed, maze size)
- [ ] Achievement system
- [ ] Daily challenge mazes
- [ ] Dark mode toggle (only dark mode in v1)

---

## 8. Milestones

| Milestone | Deliverables | Success Criteria |
|-----------|--------------|------------------|
| M1: Foundation | React 19 + TypeScript + Vite setup, maze grid rendering, player with spring movement | Player moves smoothly, maze visible |
| M2: Maze Generation | Procedural maze generator, start/exit placement | New maze each level, always solvable |
| M3: Hazards | Hazard component, patrol AI, collision detection | Hazards move, player dies on contact |
| M4: Game States | All overlays (pause, death, complete), HUD, level progression | Full game loop functional |
| M5: Polish | Animations, visual effects, responsive, reduced-motion support | Feels polished, works on mobile |
| M6: Launch | Build verification, localStorage persistence, deployment | Shipped and playable |

---

## 9. Open Questions

1. **Death penalty:** Current design has instant retry. Should there be a short delay or death counter?
2. **Timer:** Should we show elapsed time? Could add speedrun appeal but might increase anxiety.
3. **Tutorial:** Level 1 is tutorial. Any other guided hints needed?
4. **Mobile first:** We designed desktop-first. Is swipe-to-move sufficient for mobile or do we need on-screen buttons?
5. **Save state:** Auto-save progress on level complete. Any manual save slots needed?
