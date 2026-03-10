# Experiments Season 2

## The Studio's Next Wave

As a design & product innovation studio, our exhibitions are not random—each experiment probes a specific frontier. We've mapped the landscape of what exists. Now we look forward.

**Our North Star**: Converge on a single, opinionated technology stack that combines open-source gold standards with proprietary innovations. Push the web and applications forward.

---

## What's Missing: The Frontier Map

Based on our current inventory across `apps/` and `apps/playground`, these territories remain unexplored:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPERIMENTS SEASON 2                                │
│                    Gaps in Our Current Exhibition                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ CATEGORY                          │ STATUS    │ PRIORITY │ NOTES           │
├───────────────────────────────────┼───────────┼──────────┼─────────────────┤
│ REAL-TIME & SYNC                  │ MISSING   │ HIGH     │ Critical gap    │
│ AI/AGENT ARCHITECTURES            │ MISSING   │ HIGH     │ Future of apps  │
│ LOCAL-FIRST / P2P                 │ MISSING   │ HIGH     │ Resilience      │
│ WEBASSEMBLY / WASM                │ MISSING   │ MEDIUM   │ Performance     │
│ EDGE & SERVERLESS PATTERNS        │ MISSING   │ MEDIUM   │ Scale           │
│ WEBXR / SPATIAL COMPUTING         │ MISSING   │ MEDIUM   │ Next platform   │
│ ACCESSIBILITY INNOVATIONS         │ MISSING   │ HIGH     │ Inclusion       │
│ NEW INPUT PARADIGMS               │ MISSING   │ MEDIUM   │ Voice, gesture  │
│ PRIVACY-PRESERVING TECH           │ MISSING   │ MEDIUM   │ Trust           │
│ SUSTAINABILITY MONITORING         │ MISSING   │ LOW      │ Responsibility  │
│ ADVANCED ANIMATION SYSTEMS        │ PARTIAL   │ MEDIUM   │ We have Framer  │
│ STATE MANAGEMENT REVOLUTION       │ MISSING   │ HIGH     │ Complexity      │
└───────────────────────────────────┴───────────┴──────────┴─────────────────┘
```

---

## Detailed Proposals

### 1. Real-Time & Synchronization
**The Problem**: Most modern apps need collaboration, presence, or live updates. Our current stack assumes request/response.

**Potential Experiments**:
- **CRDT Playground**: Operational transforms vs CRDTs for collaborative text editing
- **Presence System**: "Who's online" with WebSocket fallback to Server-Sent Events to polling
- **Live Cursors**: Multiplayer cursor tracking with conflict resolution
- **Offline-First Todo**: Sync engine with conflict resolution strategies

**Gold Standards to Evaluate**:
- [Yjs](https://github.com/yjs/yjs) — CRDT framework
- [PartyKit](https://www.partykit.io/) — Collaborative backends
- [Electric SQL](https://electric-sql.com/) — Postgres sync
- [TinyBase](https://tinybase.org/) — Reactive local data
- [Liveblocks](https://liveblocks.io/) — Ready-made primitives

**Build or Adopt?** Start with Yjs + PartyKit. Build our own sync protocol only if we hit limitations.

---

### 2. AI/Agent Architectures
**The Problem**: AI is currently bolted-on as API calls. What if AI was a first-class architecture citizen?

**Potential Experiments**:
- **Agent Swarm Dashboard**: Multiple specialized agents collaborating on a task
- **Streaming UI**: Progressive UI generation as LLM streams tokens
- **Structured Output UI**: Forms that adapt based on Zod schemas from LLMs
- **Memory & Context**: Long-running conversations with vector memory
- **Tool-Using UI**: Interface for LLMs to invoke functions with approval flows

**Gold Standards to Evaluate**:
- [Vercel AI SDK](https://sdk.vercel.ai/) — Streaming, hooks
- [LangChain](https://js.langchain.com/) / [LangGraph](https://langchain-ai.github.io/langgraphjs/) — Agent orchestration
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview) — Thread management
- [Convex](https://www.convex.dev/) — Reactive backend for AI

**Build or Adopt?** Vercel AI SDK is strong. Consider building: a visual agent orchestration layer, custom memory systems, streaming UI primitives.

---

### 3. Local-First & P2P
**The Problem**: Cloud dependency creates fragility. What if the app worked without the server?

**Potential Experiments**:
- **P2P Document Sharing**: WebRTC data channels for direct file transfer
- **Local-First Notes**: SQLite in the browser with sync
- **CRDT-based Whiteboard**: Figma-like canvas without a central server
- **Offline Maps**: Vector tiles cached locally with peer sharing

**Gold Standards to Evaluate**:
- [rxdb](https://rxdb.info/) — Reactive database with sync
- [Triplit](https://www.triplit.dev/) — Local-first sync
- [PowerSync](https://www.powersync.com/) — SQLite sync
- [PeerJS](https://peerjs.com/) — WebRTC abstraction
- [Matrix](https://matrix.org/) — Decentralized comms

**Build or Adopt?** Triplit or Electric SQL for sync. Build: unique P2P discovery mechanisms, custom conflict UIs.

---

### 4. WebAssembly & High Performance
**The Problem**: JavaScript hits limits for compute-intensive tasks.

**Potential Experiments**:
- **WASM Image Processor**: Real-time filters in Rust/WASM
- **Physics Playground**: Matter.js vs custom WASM physics
- **Cryptographic Tools**: Client-side encryption/decryption
- **Game Logic Engine**: Deterministic simulation in WASM

**Gold Standards to Evaluate**:
- [wasm-bindgen](https://github.com/rustwasm/wasm-bindgen) — Rust/WASM bridge
- [AssemblyScript](https://www.assemblyscript.org/) — TypeScript-like WASM
- [Comlink](https://github.com/GoogleChromeLabs/comlink) — Web Workers
- [FFmpeg.wasm](https://ffmpegwasm.netlify.app/) — Media processing

**Build or Adopt?** Use Rust + wasm-bindgen. Build: domain-specific WASM modules (image processing, crypto, simulation).

---

### 5. Edge & Serverless Patterns
**The Problem**: Traditional backends create latency and complexity.

**Potential Experiments**:
- **Edge-Rendered Dashboard**: Data fetching at the edge
- **Durable Objects Counter**: Global state with Cloudflare
- **Geolocation Routing**: Request routing based on user location
- **Serverless GraphQL**: Subscriptions at the edge

**Gold Standards to Evaluate**:
- [Cloudflare Workers](https://workers.cloudflare.com/) — Edge compute
- [Deno Deploy](https://deno.com/deploy) — Edge TypeScript
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions) — Next.js integration
- [Fly.io](https://fly.io/) — Container-based edge

**Build or Adopt?** Cloudflare Workers + Durable Objects for stateful edge. Build: edge-specific caching strategies, geo-aware routing logic.

---

### 6. WebXR & Spatial Computing
**The Problem**: 2D screens are limiting. What's next after mobile?

**Potential Experiments**:
- **AR Product Viewer**: Place 3D models in real space (we have the globe, extend it)
- **VR Data Visualization**: Immersive chart exploration
- **Hand Tracking UI**: Gesture-based interfaces
- **Spatial Memory**: Information organized in 3D space

**Gold Standards to Evaluate**:
- [Three.js WebXR](https://threejs.org/docs/#manual/en/introduction/WebXR) — Foundation
- [A-Frame](https://aframe.io/) — WebXR framework
- [8th Wall](https://www.8thwall.com/) — AR without app store
- [React Three XR](https://github.com/pmndrs/react-three-xr) — React integration

**Build or Adopt?** React Three XR + Three.js. Build: novel spatial UI patterns, data viz in 3D.

---

### 7. Accessibility Innovations
**The Problem**: Accessibility is often an afterthought. What if it was the primary design constraint?

**Potential Experiments**:
- **Screen Reader-First UI**: Navigation designed for non-visual users
- **Switch Control Interface**: Single-button navigation schemes
- **High-Performance Accessibility**: 60fps with full ARIA compliance
- **Cognitive Load Dashboard**: UI complexity measurement

**Gold Standards to Evaluate**:
- [Radix UI](https://www.radix-ui.com/) — Accessible primitives (we use this)
- [React Aria](https://react-spectrum.adobe.com/react-aria/) — Adobe's accessibility hooks
- [axe-core](https://github.com/dequelabs/axe-core) — Automated testing
- [Pa11y](https://pa11y.org/) — Accessibility CI

**Build or Adopt?** Radix UI is strong. Build: accessibility-first design system, automated a11y testing in CI, novel interaction patterns for assistive tech.

---

### 8. New Input Paradigms
**The Problem**: Mouse and keyboard are legacy. What's next?

**Potential Experiments**:
- **Voice Interface**: Natural language command system
- **Eye Tracking UI**: Gaze-based navigation
- **Haptic Feedback**: Vibrations for confirmation/denial
- **Predictive Input**: UI that anticipates user needs

**Gold Standards to Evaluate**:
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) — Native voice
- [TensorFlow.js Handpose](https://github.com/tensorflow/tfjs-models/tree/master/handpose) — Hand tracking
- [MediaPipe](https://mediapipe-studio.webapps.google.com/home) — Gesture recognition

**Build or Adopt?** Use Web Speech API, MediaPipe. Build: novel voice command grammars, gesture vocabularies.

---

### 9. Privacy-Preserving Tech
**The Problem**: Users don't trust apps with their data.

**Potential Experiments**:
- **Zero-Knowledge Auth**: Login without server knowing credentials
- **Homomorphic Encryption Demo**: Compute on encrypted data
- **Differential Privacy Dashboard**: Analytics without individual tracking
- **Client-Side AI**: Models that never leave the device

**Gold Standards to Evaluate**:
- [WebCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) — Native crypto
- [OpenMined](https://openmined.org/) — Privacy-preserving ML
- [Differential Privacy](https://github.com/google/differential-privacy) — Google's library

**Build or Adopt?** WebCrypto for basics. Build: user-friendly privacy UX, novel encryption flows.

---

### 10. Sustainability & Performance Monitoring
**The Problem**: Digital has a carbon footprint. Can we measure and optimize it?

**Potential Experiments**:
- **Carbon-Aware UI**: Components that adapt based on grid carbon intensity
- **Performance Budget Dashboard**: Real-time bundle size tracking
- **Energy Profiling**: Battery impact measurement
- **Green Hosting Router**: Route to greenest data center

**Gold Standards to Evaluate**:
- [Website Carbon Calculator](https://www.websitecarbon.com/) — Carbon estimation
- [Ecograder](https://ecograder.com/) — Sustainability audit
- [Green Web Foundation](https://www.thegreenwebfoundation.org/) — Green hosting DB

**Build or Adopt?** Use existing calculators. Build: real-time carbon monitoring in dev tools, carbon-aware UI adaptations.

---

### 11. State Management Revolution
**The Problem**: Redux, Zustand, Jotai, Valtio—still too complex. What's the future?

**Potential Experiments**:
- **Signal-Based UI**: Preact Signals or Solid.js reactivity in React
- **URL as State**: Serializing entire app state to URL
- **Reactive Database**: UI that updates when database changes
- **Time-Travel Debugging**: Built into the state layer

**Gold Standards to Evaluate**:
- [TanStack Query](https://tanstack.com/query/latest) — Server state (we use this)
- [Vercel React Use](https://github.com/vercel/react-use) — Hooks collection
- [Jotai](https://jotai.org/) — Atomic state
- [Zustand](https://github.com/pmndrs/zustand) — Simple stores
- [Legend State](https://legendapp.com/open-source/state/) — Reactive state
- [TinyBase](https://tinybase.org/) — Local data + sync

**Build or Adopt?** Legend State or TinyBase. Build: unified state layer that handles server, client, and local state seamlessly.

---

## Proposed Stack Convergence

Based on our experiments, here's the evolving opinionated stack:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GOLD STANDARD STACK                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ FRAMEWORK              │ React Router 7 (confirmed standard)         │   │
│  │ RENDERING              │ Server Components + Streaming               │   │
│  │ STYLING                │ Tailwind CSS 4.x                            │   │
│  │ UI PRIMITIVES          │ Radix UI + shadcn/ui patterns               │   │
│  │ ANIMATION              │ Framer Motion (keep)                        │   │
│  │ ICONS                  │ Lucide React + Phosphor                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ STATE MANAGEMENT                                                    │   │
│  │ ├─ Server State      │ TanStack Query (keep)                        │   │
│  │ ├─ Client State      │ Legend State or Jotai (evaluate)             │   │
│  │ ├─ Form State        │ React Hook Form + Zod (keep)                 │   │
│  │ └─ URL State         │ nuqs or custom hooks                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ REAL-TIME / SYNC                                                    │   │
│  │ ├─ Default           │ Yjs + PartyKit                               │   │
│  │ ├─ Heavy Sync        │ Electric SQL                                 │   │
│  │ └─ P2P               │ PeerJS + simple signaling                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ AI / LLM                                                            │   │
│  │ ├─ SDK               │ Vercel AI SDK                                │   │
│  │ ├─ Agents            │ LangGraph (evaluate)                         │   │
│  │ └─ Vector Store      │ Supabase pgvector or Pinecone                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ BACKEND / DATABASE                                                  │   │
│  │ ├─ Database          │ PostgreSQL (keep)                            │   │
│  │ ├─ ORM               │ Drizzle (keep)                               │   │
│  │ ├─ Edge              │ Cloudflare Workers                           │   │
│  │ └─ Auth              │ Supabase Auth or custom                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ BUILD / DEPLOY                                                      │   │
│  │ ├─ Bundler           │ Vite (keep)                                  │   │
│  │ ├─ Runtime           │ Bun (evaluate for speed)                     │   │
│  │ ├─ Deploy            │ Vercel / Cloudflare / Fly.io                 │   │
│  │ └─ Monorepo          │ pnpm workspaces (keep)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ TESTING / QUALITY                                                   │   │
│  │ ├─ Unit              │ Vitest (keep)                                │   │
│  │ ├─ E2E               │ Playwright (keep)                            │   │
│  │ ├─ Lint              │ oxlint / Biome (evaluate)                    │   │
│  │ └─ Type Safety       │ TypeScript strict (keep)                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Framework Decision Note

**React Router 7** has been selected as our gold standard framework despite discussions about a potential future rewrite. This decision is based on:

- **Production maturity**: Battle-tested at scale with proven stability
- **Existing investment**: Several apps already built on RR7 (playground, dumphim)
- **Migration path**: Even if RR8 emerges, the conceptual model (nested routing, loaders/actions) will persist
- **Community ecosystem**: Largest talent pool and third-party integration support
- **Risk mitigation**: We can migrate to TanStack Start later if RR7's direction changes significantly

**Alternative considered**: TanStack Start offers unified ecosystem and cleaner architecture, but RR7's production track record and existing codebases make it the pragmatic choice for standardization now.

---

## Immediate Next Steps

1. **Create Real-Time Prototype**: Build a collaborative whiteboard with Yjs + PartyKit in RR7
2. **AI Integration Spike**: Streaming chat interface with Vercel AI SDK + RR7
3. **RR7 Migration**: Convert existing experiments to unified RR7 architecture
4. **State Management Audit**: Evaluate Legend State vs Jotai for complexity reduction
5. **Edge Experiment**: Deploy a Cloudflare Worker with Durable Objects

---

## Success Criteria

An experiment graduates from "Season 2" to "Gold Standard" when:
- It solves a real problem we've encountered
- The DX (Developer Experience) is exceptional
- It integrates cleanly with our existing stack
- It has a clear path to production use
- It teaches us something about the future of software

**The goal**: By end of Season 2, have a unified stack that feels inevitable.
