## ADDED Requirements

### Requirement: Every lesson file SHALL have explanatory comments
Each lesson file in `_software-engineering/` SHALL contain comments that explain:
- The purpose of each function and class
- The algorithmic approach and why it was chosen
- Time and space complexity considerations
- Any non-obvious implementation decisions

#### Scenario: Comments on functions
- **WHEN** a function is implemented
- **THEN** there SHALL be a comment block before it explaining its purpose and algorithmic approach

#### Scenario: Comments on complex logic
- **WHEN** a code block contains complex logic (loops, conditionals with specific purpose)
- **THEN** there SHALL be inline comments explaining what happens and why

#### Scenario: Comments on algorithm sections
- **WHEN** an algorithm section (loops, recursive calls, memoization) is present
- **THEN** there SHALL be comments explaining the algorithm choice and complexity implications

### Requirement: Comments SHALL be educational
Comments SHALL be written in a tone suitable for learning:
- Explain the "why" not just the "what"
- Provide context for when/why you'd use this pattern
- Note common pitfalls or alternatives considered

#### Scenario: Educational tone
- **WHEN** comments are written
- **THEN** they SHALL explain why each decision was made, not just what the code does

### Requirement: Existing JSDoc SHALL be preserved
Where JSDoc comments already exist, they SHALL be preserved and enhanced with additional context.

#### Scenario: Existing JSDoc preservation
- **WHEN** a function has existing JSDoc (@param, @returns)
- **THEN** these SHALL be kept and augmented with explanatory comments
