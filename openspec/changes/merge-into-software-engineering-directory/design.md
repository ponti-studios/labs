## Context

The `_software-engineering` directory was created to consolidate algorithm practice materials. It currently contains 12 lessons with external branding (toptal/leetcode) that needs to be removed and replaced with a cohesive lesson structure. Several lessons have TypeScript errors that need fixing, and the curriculum has gaps.

## Goals / Non-Goals

**Goals:**
- Remove all external branding (toptal, leetcode)
- Structure files as a numbered lesson plan with clear progression
- Create README that maps the curriculum and shows prerequisites
- Fix TypeScript errors in existing implementations
- Fill placeholder lessons with real content
- Add new lessons to cover essential topics (hash tables, linked lists, BFS/DFS, stacks/queues)

**Non-Goals:**
- Not creating a full course management system
- Not adding tests or CI for the lessons
- Not documenting every algorithm - focus on foundational concepts

## Decisions

**1. Lesson numbering with two-digit prefix (01-16)**
- Provides clear ordering for curriculum progression
- Allows for future insertion of lessons without renumbering
- Format: `XX-topic-name.ext` (e.g., `01-arrays-swapping.js`)

**2. Standardized header format for each lesson**
- Lesson number and title
- Category grouping
- Topics covered
- Description of the lesson
- No external branding references

**3. README curriculum overview**
- Learning path with prerequisites
- Category groupings (Arrays, Data Structures, Dynamic Programming, etc.)
- Suggested progression order
- Each lesson's topics and difficulty indicators

**4. TypeScript lessons use proper type annotations**
- Fix implicit any errors
- Add proper return types for recursive functions
- Ensure type safety in memoization patterns

**5. New lessons for gaps**
- 13: Hash Tables - key-value storage, collision handling
- 14: Linked Lists - singly/doubly linked, insertion, deletion
- 15: BFS/DFS - graph traversal algorithms
- 16: Stack/Queue - LIFO/FIFO structures, practical applications

## Risks / Trade-offs

[Low] Adding new lessons expands the curriculum without disrupting existing content

## Migration Plan

1. Update existing lesson headers (01-12) - remove branding, fix format
2. Create `README.md` with curriculum overview
3. Fix TypeScript in `06-*.ts` and `08-*.ts`
4. Implement Lesson 04 (placeholder → real problem)
5. Create new lessons 13-16
6. Verify all files have consistent structure

## Open Questions

- Should we add difficulty ratings to lessons?
- Do we need exercises/practice problems for each lesson?
