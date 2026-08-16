# Animated Resume Concept — Narrative Career Progression

**Status:** Archived (experiment moved to design doc)  
**Last Updated:** 2026-08-16

## Concept Overview

Rather than traditional static resume layouts, this concept explores **sequential narrative storytelling** as a way to present career progression and value proposition. The experience breaks a person's professional journey into five digestible, emotionally-engaging scenes that play like a short film.

## Design Principles

### 1. **Micro-moments over Info Dumps**
Instead of overwhelming the reader with a wall of text, each scene isolates a single idea and gives it 2-3 seconds to land. This respects attention spans and makes the content memorable.

### 2. **Visual Hierarchy Through Progression**
- **Scene 0:** Problem hook — "You've seen 47 resumes today"
- **Scene 1:** Personality intro — Who am I?
- **Scene 2:** Value proposition — How I help you win
- **Scene 3:** Track record — Proof (past projects)
- **Scene 4:** Full summary — Complete picture + CTA

Each scene reveals more depth, encouraging the viewer to stay engaged.

### 3. **Contextual Animations**
Motion isn't decorative—it serves the narrative:
- **Spring animations** on entrance: energetic, approachable
- **Skewed elements** (rotated text, tilted cards): playful, human
- **Color highlights** (yellow accent): emotional emphasis on key claims
- **Progress bar** at the top: visible proof that there's structure, not chaos

### 4. **Interactive Control Without Friction**
- Auto-play by default (works for impatient viewers)
- Manual navigation buttons (side chevrons) for those who want to re-examine a point
- "Rewatch" option to reset and see it again
- Visual step counter (3/5) shows position without being intrusive

## Visual Identity

- **Color:** High-contrast black background with yellow accents (#facc15) for emphasis
- **Typography:** Black font weights (font-black), italic for personality, uppercase for authority
- **Space:** Generous padding and breathing room—each scene gets its own centered stage
- **Effects:** Subtle gradient halos in the background (yellow + blue glow), kept minimal to avoid distraction

## Interaction Patterns

### Timeline Navigation
```
[──●─────────] Step 3/5
```
A horizontal bar at the top shows progress. Clicking next/prev updates it smoothly with a spring animation.

### Button States
- Disabled when at start/end (visual feedback via opacity)
- Active state turns buttons yellow (matches the highlight color)
- Hover scale effect (1.1×) makes interaction feel responsive

### Auto-play Timer
Each scene has a customizable dwell time (default 2.5s). Once the viewer manually navigates, auto-play pauses—respecting their agency.

## Content Structure

```
Step 0 (2.5s): Problem Identification
├─ Icon: AlertCircle
├─ Hook: "You've seen 47 resumes today"
└─ Subtext: "and need a break"

Step 1 (2.5s): Personal Introduction
├─ Main text: "let's skip the boring stuff"
├─ Name + role
└─ Tagline: "product lead | ai builder | human"

Step 2 (2.5s): Value Proposition
├─ Title: "how i help you win 🏆"
├─ Three cards:
│  ├─ "apps that actually feel good to use"
│  ├─ "ai that isn't just a wrapper"
│  └─ "shipping before the coffee gets cold"
└─ Hover effect: cards highlight on interaction

Step 3 (2.5s): Track Record / Proof
├─ Title: "the track record 📊"
├─ Three rotated cards showcasing past work:
│  ├─ Peterson Academy (Scale & Infrastructure)
│  ├─ Prolog (LLM Script Analysis)
│  └─ Altar (Contextual RAG Search)
└─ Rotation and hover effects add personality

Step 4 (0s): Full Profile Summary
├─ Name & headline
├─ Core Philosophy section
├─ Experience (3 bullet points)
├─ Technical skills (3 bullet points)
├─ CTA: "Hire Charles" button
├─ Secondary actions: Email, Code (GitHub), Rewatch
└─ Scrollable on small screens
```

## Technical Implementation

- **Framework:** React + Framer Motion for animation
- **State:** Step counter + auto-play flag
- **Effects:** useEffect timer for auto-advance
- **Motion:** Variants system for consistent enter/exit animation
- **Responsive:** Adapts to mobile with full-screen navigation

## Why This Works

### For Recruiters
- Quick consumption (5 scenes × 2.5s ≈ 12 seconds to full story)
- Clear value proposition (not buried in dense text)
- Memorable personality (animations make it stick)
- Proof of past work (track record cards build confidence)

### For Designers/Developers
- Demonstrates animation skill (Framer Motion patterns)
- Shows UX thinking (progressive disclosure, pacing)
- Proves narrative design ability (story structure)
- Clean code (reusable motion variants, state management)

### For the Candidate
- Stands out from static PDFs/templates
- Tells a story (more engaging than a list)
- Maintains control (pause/play/manual nav)
- Feels modern and intentional

## Possible Variations & Extensions

1. **Speech Synthesis:** Read each step aloud (with captions)
2. **Gesture Controls:** Swipe to navigate on mobile
3. **Randomized Facts:** Each view shows different track record cards
4. **Dark/Light Mode:** Adapt to system preferences
5. **Embedded Videos:** Play a short demo reel between steps
6. **Keyboard Shortcuts:** Arrow keys for next/prev, space to pause/play

## Lessons for Other Narrative UX

This pattern could be applied to:
- **Product onboarding** — introduce features one at a time
- **Tutorial sequences** — break complex tasks into digestible steps
- **Storytelling presentations** — engage audiences through pacing
- **Case study presentations** — reveal problem → solution → results gradually
- **Career talks** — present a journey (not just credentials)

---

## Archive Note

This experiment was retired in favor of focusing on other projects (especially the glassmorphism technical deep-dive). The concept remains valuable as a reference for sequential, narrative-driven UI design.
