## Context

The `_software-engineering` directory contains 16 lesson files (JavaScript and TypeScript) covering algorithms and data structures. Currently, code has minimal comments - only basic JSDoc where they existed. Learners need more context to understand not just what the code does, but why each decision was made.

## Goals / Non-Goals

**Goals:**
- Add explanatory comments to every function, class, and logical block
- Explain algorithmic choices and complexity considerations
- Make lessons self-contained for self-study
- Preserve exact functionality while enhancing documentation

**Non-Goals:**
- Not rewriting or refactoring code logic
- Not adding tests (unless specifically documenting test cases)
- Not changing function/variable names
- Not adding explanatory documents separate from code

## Decisions

**1. Comment density: line-by-line for complex sections, block comments for obvious sections**
- Complex algorithms (DP, recursion): comment every 2-3 lines explaining step
- Simple operations: explain the purpose, not every character
- Don't comment obvious things like `i++` incrementing a counter

**2. Three types of comments:**
- **Explanation comments**: What this section does and why
- **Educational comments**: Algorithmic context, complexity, alternatives
- **Reference comments**: Link to when you'd use this pattern

**3. Preserve existing JSDoc, enhance where needed**
- Keep existing `@param`, `@returns` descriptions
- Add additional context that JSDoc doesn't capture

**4. Comment style consistency**
- JavaScript: `//` for inline, `/* */` for block comments
- TypeScript: Same as JavaScript, leverage type information in comments

## Risks / Trade-offs

[Low risk] Pure documentation change - no logic modification
[Trade-off] Extensive comments may make files longer but improve learnability

## Migration Plan

1. Work through lessons 01-16 in order
2. For each file, add comments before logical blocks
3. Add comments explaining complex algorithm sections
4. Preserve original code exactly
5. Verify no functionality changes by running files
