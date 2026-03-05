# Planning Guide

A real-time 3D global disaster monitoring dashboard that visualizes live environmental events (wildfires, volcanoes, severe storms, icebergs) on an interactive Earth globe using NASA's EONET data feed.

**Experience Qualities**:
1. **Command & Control** - Users should feel like operators in a high-tech monitoring center, surveying Earth from orbit with military-grade precision.
2. **Cyberpunk Urgency** - The interface pulses with life through glowing indicators, scanlines, and animated elements that suggest constant data streaming.
3. **Immersive Focus** - The fullscreen 3D globe dominates, with a transparent HUD overlay that frames without obscuring, creating a futuristic cockpit experience.

**Complexity Level**: Light Application (multiple features with basic state)
This is a visualization dashboard with real-time data fetching, 3D interaction, and state management for view controls and event filtering.

## Essential Features

**3D Globe Visualization**
- Functionality: Renders an interactive Earth sphere with orbital camera controls and visual markers for each disaster event
- Purpose: Provides spatial context for global events, making geographic patterns immediately visible
- Trigger: Automatically loads on app mount and continuously rotates unless interrupted
- Progression: App loads → Three.js initializes globe → NASA API fetched → Markers plotted → Auto-rotation begins → User can orbit/zoom
- Success criteria: Globe renders smoothly at 60fps, responds to mouse/touch input, shows all event markers with correct positioning

**Live Event Feed**
- Functionality: Fetches and displays real-time disaster data from NASA EONET API with categorized styling and filtering capability
- Purpose: Keeps users informed of current global events with actionable intelligence and allows filtering by event type
- Trigger: Loads on mount, refreshes every 10 minutes
- Progression: API call → Parse JSON → Filter valid coordinates → Render list items → Update count badge → User can filter by category
- Success criteria: Events display within 2 seconds, list is scrollable, shows event type and location, updates automatically, category badges show counts and allow filtering

**Event Focusing**
- Functionality: Click any event in the list to fly camera to that location on the globe
- Purpose: Allows users to quickly investigate specific events in detail
- Trigger: User clicks event card in sidebar
- Progression: Click event → Stop auto-rotation → Camera animates to location → Marker highlighted → User explores
- Success criteria: Smooth camera transitions (1-2s), auto-rotation pauses, returns to normal state on manual interaction

**Auto-Rotation Toggle**
- Functionality: Start/stop the globe's automatic rotation with button or keyboard shortcut
- Purpose: Gives users control over static inspection vs. continuous overview
- Trigger: User clicks button or presses 'R' key
- Progression: User triggers → Rotation state toggles → Visual feedback updates → Globe behavior changes
- Success criteria: Instant response, keyboard shortcut works globally, state persists during session

**View Reset**
- Functionality: Returns camera to default home position with smooth animation
- Purpose: Provides a quick way to return to overview after focused exploration
- Trigger: User clicks button or presses 'H' key
- Progression: User triggers → Camera animates home → Auto-rotation resumes → View normalized
- Success criteria: Smooth 2-second animation, resets zoom and orientation, works from any position

**Animated Arc Connections**
- Functionality: Displays animated arcs between disaster locations to visualize relationships and connections
- Purpose: Shows spatial connections between related disasters, revealing global patterns and interconnected systems
- Trigger: Automatically generated when events are loaded based on proximity and category similarity
- Progression: Events loaded → Distance calculations → Arc generation → Animated dashed lines flow between connected points
- Success criteria: Arcs animate smoothly, connect nearby events (<5000km), match event colors for same-category connections, subtle white arcs for cross-category connections, max 30 arcs to maintain performance

**Category Filtering**
- Functionality: Clickable badge buttons that filter the event list by disaster type (wildfires, volcanoes, storms, icebergs, sea ice)
- Purpose: Allows users to focus on specific disaster types and quickly understand the distribution of event categories
- Trigger: User clicks on a category badge in the event list panel
- Progression: User clicks category badge → List filters to show only events of that type → Counter updates → Globe markers remain visible → Click "All" to reset filter
- Success criteria: Instant filtering without re-fetching data, badges show event counts per category, active badge has visual highlight with category color glow, filtered count displays correctly

## Edge Case Handling

- **No Events Available**: Show empty state message "Synchronizing Orbit..." with pulse animation in event list
- **API Failure**: Gracefully fail, retain any cached events, show last-updated timestamp
- **Invalid Coordinates**: Skip events with missing/malformed geometry data during rendering
- **Mobile/Touch**: Adapt controls for touch gestures, hide keyboard shortcuts on mobile
- **Performance**: Limit marker count to 200 events, use instancing if needed for smooth rendering

## Design Direction

The design should evoke a classified military satellite monitoring station - users are surveillance operators tracking global threats from orbit. The aesthetic blends tactical HUD interfaces with cyberpunk glitch elements: dark backgrounds with neon accents, monospace fonts suggesting raw data feeds, subtle scanline effects implying CRT displays, and glass-morphism panels that feel like holographic projections floating over the Earth view.

## Color Selection

**Primary Color**: Deep Space Black (oklch(0.03 0 0)) - The void of space, creating maximum contrast for data visualization
**Secondary Colors**: 
  - Charcoal Gray (oklch(0.1 0 0)) - HUD panel backgrounds with opacity for glass-morphism
  - Steel Gray (oklch(0.4 0 0)) - Secondary text and inactive UI elements
**Accent Color**: Tactical Red (oklch(0.55 0.22 25)) - Alert states, active indicators, and danger markers (wildfires)
**Additional Accent Colors**:
  - Cyan Pulse (oklch(0.75 0.15 195)) - Storm markers and interactive highlights
  - Warning Orange (oklch(0.7 0.18 45)) - Volcanic activity markers
  - Ice White (oklch(0.95 0 0)) - Iceberg markers and status indicators

**Foreground/Background Pairings**:
- Background (oklch(0.03 0 0)): White text (oklch(0.98 0 0)) - Ratio 19.8:1 ✓
- Panel Background (oklch(0.1 0 0) @ 85% opacity): White text - Ratio 15.2:1 ✓  
- Accent Red (oklch(0.55 0.22 25)): White text - Ratio 4.9:1 ✓
- Muted Gray (oklch(0.4 0 0)): White text - Ratio 6.8:1 ✓

## Font Selection

Typography should feel technical and precise, like readouts from monitoring equipment - monospace for data/metrics to suggest machine output, a strong sans-serif for headers with aggressive letter-spacing to create military-spec precision.

- **Typographic Hierarchy**:
  - H1 (Dashboard Title): Space Grotesk Bold/24px/0.15em letter-spacing/uppercase/italic - Aggressive command center branding
  - H2 (Section Headers): Space Grotesk Bold/11px/0.2em letter-spacing/uppercase - Panel labels
  - Body (Event Names): Space Grotesk Medium/12px/0.05em letter-spacing/uppercase - Primary data display
  - Monospace (Metrics/Status): JetBrains Mono Regular/10px/0.02em letter-spacing/uppercase - Technical readouts
  - Small (Meta Info): JetBrains Mono Regular/9px/0.15em letter-spacing/uppercase - Timestamps and secondary data

## Animations

Animations should enhance the feeling of a live monitoring system - subtle pulsing on active indicators suggests real-time data flow, smooth camera transitions maintain spatial awareness during navigation, scanline overlays and glitch effects create retro-future aesthetic depth. Keep motion purposeful: event markers gently pulse to draw attention, HUD panels fade in on load, and rotation is slow and continuous to suggest orbital surveillance.

## Component Selection

**Components**:
- **Card**: HUD panels with heavy glass-morphism (backdrop-blur, rgba backgrounds, subtle borders)
- **ScrollArea**: Custom-styled for event list with minimal scrollbar
- **Button**: Ghost variant with hover states, monospace text, tactical styling
- **Badge**: Compact event counter with red background

**Customizations**:
- **Globe Component**: Custom Three.js Earth sphere with orbital controls, event markers as instanced sprites
- **Scanline Overlay**: Absolute-positioned div with CSS animation, subtle horizontal line sweeping screen
- **HUD Layout**: Flexbox positioning with transparent backgrounds, no traditional "card" feel
- **Event Markers**: Three.js points with category-based coloring and glow effects

**States**:
- Buttons: Default (gray-400), Hover (white), Active (red accent for toggle states)
- Event Items: Default (transparent), Hover (white/5 bg + white/10 border), Active/Selected (white/10 bg)
- Status Indicators: Pulsing glow effect using box-shadow, color-coded (green=active, red=alert, yellow=warning)

**Icon Selection**:
- Globe icon for view reset
- Refresh icon for data sync status  
- Play/Pause icons for rotation toggle
- Dot icons (colored circles) for event type indicators in list
- ArrowCounterClockwise for reset button

**Spacing**:
- HUD Padding: p-4 (16px) on panels, p-2 (8px) on dense lists
- Gap Between Elements: gap-4 (16px) for major sections, gap-2 (8px) for related items
- Screen Margins: p-6 (24px) on viewport edges for HUD overlay
- List Items: py-2 px-3 for clickable event cards

**Mobile**:
- Hide quick stats section on mobile (hidden md:flex)
- Reduce HUD padding to p-3
- Event list max-height reduced to 30vh
- Touch gestures: pinch-to-zoom, drag-to-rotate globe
- Stack header elements vertically on small screens
- Larger touch targets (min 44px) for all interactive elements
