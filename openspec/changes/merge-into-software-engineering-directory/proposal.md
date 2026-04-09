## Why

The `apps/toptal` and `apps/leetcode` directories both contain algorithm and data structure practice problems, but are scattered across two locations with external branding. Building a cohesive software engineering curriculum requires: (1) removing external branding, (2) structuring files as a lesson plan with clear progression, (3) fixing existing issues, and (4) filling gaps in the curriculum.

## What Changes

- Create new `_software-engineering` directory at project root
- Flatten and rename files with lesson-based naming (01-12)
- Remove all toptal/leetcode branding, replace with lesson structure
- Create curriculum README with learning path and prerequisites
- Fix TypeScript errors in existing lessons
- Fill in placeholder lessons with real content
- Add new lessons to cover gaps (hash tables, linked lists, BFS/DFS, stack/queue)

## Capabilities

### New Capabilities
- `software-engineering-curriculum`: Unified, branded-independent software engineering curriculum with lesson-based progression. Includes README overview, fixed TypeScript implementations, and expanded topic coverage.

### Modified Capabilities
- None

## Impact
- Create: `_software-engineering/README.md` - curriculum overview
- Create: `_software-engineering/13-hash-tables.ts`
- Create: `_software-engineering/14-linked-lists.ts`
- Create: `_software-engineering/15-bfs-dfs.ts`
- Create: `_software-engineering/16-stack-queue.ts`
- Update: All existing lesson files (01-12) - remove branding, fix headers
- Fix: TypeScript errors in `06-*.ts` and `08-*.ts`
- Remove: `apps/toptal/` and `apps/leetcode/` (empty directories)
