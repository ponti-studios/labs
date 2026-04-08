## ADDED Requirements

### Requirement: Playground hosts studio experiments

The playground app SHALL provide routes for all studio experiment features including COVID-19 analytics, vector search, terminal interface, and TfL camera views.

#### Scenario: COVID-19 analytics accessible
- **WHEN** user navigates to `/corona`
- **THEN** the COVID-19 dashboard is rendered with country selection and analytics charts

#### Scenario: Vector search accessible
- **WHEN** user navigates to `/vector-search`
- **THEN** the vector search interface is rendered

#### Scenario: Terminal component accessible
- **WHEN** user navigates to home page
- **THEN** the terminal interface is displayed

#### Scenario: TfL cameras accessible
- **WHEN** user navigates to `/tfl`
- **THEN** the TfL camera map is rendered with live feeds

### Requirement: Rust experiments at repo root

The rust/ directory SHALL be located at the repository root `/Users/charlesponti/Developer/labs/rust/` and contain binary experiments.

#### Scenario: Rust binaries present
- **WHEN** examining the repository root
- **THEN** a `rust/` directory exists with `src/bin/` containing `.rs` files
