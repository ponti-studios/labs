## ADDED Requirements

### Requirement: Experiments index route exists

The app SHALL have an `/experiments` route that displays a list of available experiments with links to each one.

#### Scenario: Index page displays experiments
- **WHEN** user navigates to `/experiments`
- **THEN** a page is displayed listing all available experiments with their names and descriptions

### Requirement: Data agency experiment route

The `/experiments/data-agency` route SHALL render the data-agency.tsx component.

#### Scenario: Data agency renders
- **WHEN** user navigates to `/experiments/data-agency`
- **THEN** the glassmorphic landing page experiment is displayed

### Requirement: LLM receipt experiment route

The `/experiments/llm-receipt` route SHALL render the llm-receipt.tsx component.

#### Scenario: LLM receipt renders
- **WHEN** user navigates to `/experiments/llm-receipt`
- **THEN** the LLM pricing calculator/receipt viewer is displayed

### Requirement: Three.gl image gallery experiment route

The `/experiments/threegl-image-gallery` route SHALL render the threegl-image-gallery.ts component.

#### Scenario: Three.gl gallery renders
- **WHEN** user navigates to `/experiments/threegl-image-gallery`
- **THEN** the Three.js based 3D image gallery is displayed

### Requirement: Experiments are accessible from index

The experiments index page SHALL provide links to navigate to each individual experiment.

#### Scenario: Navigation links work
- **WHEN** user clicks an experiment link on the index page
- **THEN** user is navigated to the corresponding experiment route
