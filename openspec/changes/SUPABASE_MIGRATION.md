# Migration: Moving Off Supabase

**Status**: Required  
**Apps Affected**: dumphim  
**Migration Path**: Supabase → PostgreSQL + Drizzle  

---

## Current State

### Dumphim
**Uses Supabase for**:
- Database connection (via @supabase/supabase-js)
- Authentication (Supabase Auth)
- Real-time subscriptions (optional)
- Row Level Security (RLS)

**Files to Update**:
- `app/lib/supabaseClient.ts` - Remove Supabase client
- `app/db/schema.ts` - Move to shared package
- Route files using Supabase queries
- Authentication flow

---

## Migration Steps

### Phase 1: Database Migration (Week 1)

#### Step 1: Export Data from Supabase

```bash
# Export schema
pg_dump --schema-only --no-owner --no-acl \
  postgresql://postgres:password@db.supabase.co:5432/postgres \
  > supabase_schema.sql

# Export data
pg_dump --data-only --no-owner --no-acl \
  postgresql://postgres:password@db.supabase.co:5432/postgres \
  > supabase_data.sql
```

#### Step 2: Move Schema to Shared Package

**Current**: `apps/dumphim/app/db/schema.ts`
**Target**: `packages/db/src/schema/dumphim.ts`

```typescript
// packages/db/src/schema/dumphim.ts
import { relations } from "drizzle-orm";
import { json, pgTable, real, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const trackers = pgTable("dumphim_trackers", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  name: text("name").notNull(),
  hp: text("hp"),
  cardType: text("card_type"),
  description: text("description"),
  attacks: json("attacks").$type<{ name: string; damage: number }[]>(),
  strengths: json("strengths").$type<string[]>(),
  flaws: json("flaws").$type<string[]>(),
  commitmentLevel: text("commitment_level"),
  colorTheme: text("color_theme"),
  photoUrl: text("photo_url"),
  imageScale: real("image_scale"),
  imagePosition: json("image_position").$type<{ x: number; y: number }>(),
  userId: uuid("user_id").notNull(),
});

export const votes = pgTable("dumphim_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  trackerId: uuid("tracker_id").notNull().references(() => trackers.id),
  userId: uuid("user_id"),
  fingerprint: text("fingerprint").notNull(),
  raterName: text("rater_name").notNull(),
  value: text("value", { enum: ["stay", "dump"] }).notNull(),
  comment: text("comment"),
});

// Export types
export type Tracker = typeof trackers.$inferSelect;
export type TrackerInsert = typeof trackers.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type VoteInsert = typeof votes.$inferInsert;
```

#### Step 3: Update Package Exports

```typescript
// packages/db/src/schema/index.ts
export * from "./playground";
export * from "./dumphim"; // Add this
```

#### Step 4: Create Migration

```bash
cd packages/db
pnpm db:generate
pnpm db:migrate
```

#### Step 5: Import Data

```bash
# Import to new PostgreSQL instance
psql $DATABASE_URL < supabase_schema.sql
psql $DATABASE_URL < supabase_data.sql
```

---

### Phase 2: Code Migration (Week 2)

#### Step 1: Create Server Queries

**File**: `apps/dumphim/app/lib/server/queries.ts`

```typescript
import { eq, desc } from "drizzle-orm";
import { db } from "@pontistudios/db";
import { trackers, votes } from "@pontistudios/db/schema/dumphim";

export async function getTrackers() {
  return db.query.trackers.findMany({
    orderBy: desc(trackers.createdAt),
  });
}

export async function getTracker(id: string) {
  return db.query.trackers.findFirst({
    where: eq(trackers.id, id),
    with: {
      votes: true,
    },
  });
}

export async function getTrackersByUser(userId: string) {
  return db.query.trackers.findMany({
    where: eq(trackers.userId, userId),
    orderBy: desc(trackers.createdAt),
  });
}

export async function getVotesByTracker(trackerId: string) {
  return db.query.votes.findMany({
    where: eq(votes.trackerId, trackerId),
    orderBy: desc(votes.createdAt),
  });
}
```

#### Step 2: Create Server Mutations

**File**: `apps/dumphim/app/lib/server/mutations.ts`

```typescript
import { eq } from "drizzle-orm";
import { db } from "@pontistudios/db";
import { trackers, votes, type TrackerInsert, type VoteInsert } from "@pontistudios/db/schema/dumphim";

export async function createTracker(data: TrackerInsert) {
  const [tracker] = await db.insert(trackers).values(data).returning();
  return tracker;
}

export async function updateTracker(id: string, data: Partial<TrackerInsert>) {
  const [tracker] = await db
    .update(trackers)
    .set(data)
    .where(eq(trackers.id, id))
    .returning();
  return tracker;
}

export async function deleteTracker(id: string) {
  await db.delete(trackers).where(eq(trackers.id, id));
}

export async function createVote(data: VoteInsert) {
  const [vote] = await db.insert(votes).values(data).returning();
  return vote;
}

export async function deleteVote(id: string) {
  await db.delete(votes).where(eq(votes.id, id));
}
```

#### Step 3: Remove Supabase Client

**Delete**: `apps/dumphim/app/lib/supabaseClient.ts`

**Update imports in all route files**:

```typescript
// Before
import { supabase } from "~/lib/supabaseClient";

// After
import { getTrackers, getTracker } from "~/lib/server/queries";
import { createTracker, updateTracker } from "~/lib/server/mutations";
```

#### Step 4: Migrate Route Loaders

**Before** (Supabase):
```typescript
export async function loader() {
  const { data: trackers, error } = await supabase
    .from("trackers")
    .select("*");
  
  if (error) throw error;
  return json({ trackers });
}
```

**After** (Drizzle):
```typescript
import { getTrackers } from "~/lib/server/queries";

export async function loader() {
  const trackers = await getTrackers();
  return json({ trackers });
}
```

---

### Phase 3: Authentication Migration (Week 3)

#### Option A: Custom JWT Auth (Recommended)

**Step 1**: Create auth utilities

```typescript
// apps/dumphim/app/lib/auth.ts
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(payload: object) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
```

**Step 2**: Create auth middleware

```typescript
// apps/dumphim/app/lib/auth-middleware.ts
import { verifyToken } from "./auth";

export async function requireAuth(request: Request) {
  const cookie = request.headers.get("cookie");
  const token = cookie?.match(/auth-token=([^;]+)/)?.[1];
  
  if (!token) {
    throw new Response("Unauthorized", { status: 401 });
  }
  
  try {
    const payload = await verifyToken(token);
    return payload;
  } catch {
    throw new Response("Unauthorized", { status: 401 });
  }
}
```

**Step 3**: Update routes

```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  const trackers = await getTrackersByUser(user.userId);
  return json({ trackers });
}
```

#### Option B: Use Existing Auth Provider

- **Clerk** - Easy integration
- **Auth0** - Enterprise features
- **NextAuth** (if migrating to Next.js)

---

### Phase 4: Environment & Deployment (Week 4)

#### Step 1: Update Environment Variables

**Before**:
```bash
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**After**:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
```

#### Step 2: Remove Supabase Dependencies

```bash
cd apps/dumphim
pnpm remove @supabase/supabase-js
pnpm remove @supabase/ssr  # if used
```

#### Step 3: Update Package.json

```json
{
  "dependencies": {
    "@pontistudios/db": "workspace:*",
    "@pontistudios/utils": "workspace:*",
    "jose": "^5.0.0"  // For JWT
  }
}
```

#### Step 4: Test Everything

```bash
# Run migrations
pnpm db:migrate

# Test queries
pnpm test

# Run app
pnpm dev
```

---

## Breaking Changes

### For Users
- Will need to re-authenticate (new auth system)
- Existing sessions will be invalidated

### For Developers
- All Supabase imports must be removed
- RLS policies need to be reimplemented (if using custom auth)
- Real-time subscriptions need alternative (if used)

---

## Rollback Plan

If issues arise:

1. Keep Supabase project active during migration
2. Dual-write pattern (write to both databases)
3. Read from new DB, fallback to Supabase
4. Gradual traffic shift

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | Week 1 | Database export, schema migration, data import |
| Phase 2 | Week 2 | Code migration, query updates, Supabase removal |
| Phase 3 | Week 3 | Auth migration, testing, security review |
| Phase 4 | Week 4 | Deployment, monitoring, cleanup |

**Total**: 4 weeks

---

## Post-Migration

### Benefits
- ✅ Unified database architecture
- ✅ No vendor lock-in
- ✅ Shared patterns across apps
- ✅ Type-safe queries (Drizzle)
- ✅ Better performance (direct PostgreSQL)

### Monitoring
- Monitor query performance
- Check authentication flows
- Verify data integrity
- Track error rates

---

## Checklist

### Before Migration
- [ ] Backup all Supabase data
- [ ] Document current RLS policies
- [ ] List all Supabase features used
- [ ] Set up new PostgreSQL instance

### During Migration
- [ ] Export schema and data
- [ ] Move schema to shared package
- [ ] Update all queries
- [ ] Migrate authentication
- [ ] Test all features

### After Migration
- [ ] Verify data integrity
- [ ] Monitor performance
- [ ] Update documentation
- [ ] Train team on new patterns
- [ ] Archive Supabase project

---

## Support

**Questions**:
- Check `docs/migration-guide.md` for general patterns
- Review `packages/db` for shared database setup
- See `apps/playground` for Drizzle usage examples

**Issues**:
- Data migration problems
- Authentication flow issues
- Query performance degradation
