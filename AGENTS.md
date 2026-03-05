# Agents for the `labs` repository

This document describes custom AI agents tailored to working within the monorepo.

## 🔧 `labs-dev`
A general-purpose development assistant for `ponti-studios/labs`. It inherits the standard Copilot tools (file read/write, terminal, search, etc.) and should reference the guidance in `.github/copilot-instructions.md` when making decisions.

Use this agent when you want the AI to act as a full‑featured collaborator — running builds/tests, editing source files, creating new packages, and so on.

### Usage examples
- “@labs-dev, run the unit tests in `apps/manual-co`. Report failures.”
- “@labs-dev, add a new modal component to `@pontistudios/ui` and update Storybook.”
- “@labs-dev, refactor the routing config in the playground app.”

*Additional agents (e.g. for specific packages or tasks) can be added later with an `applyTo` filter.*