# Incident log

One file per incident, each with queryable YAML frontmatter (`id`, `date`,
`status`, `severity`, `category`, `services`, `tags`, `related_incidents`).
All of these were logged during the Hominem/RealiTea auth integration work —
see [../hominem-auth-integration.md](../hominem-auth-integration.md) for the
feature work itself.

To query from the shell, e.g. everything critical-severity, or everything
tagged `auth`:

```bash
grep -l "^severity: critical" docs/incidents/*.md
grep -l "tags:.*auth" docs/incidents/*.md
```

| # | Title | Date | Severity | Category |
|---|---|---|---|---|
| [1](001-ui-package-404-github-packages.md) | `@ponti-studios/ui@0.4.3` 404 from GitHub Packages | 2026-07-29 | high | dependency-publishing |
| [2](002-stale-lockfile-github-packages.md) | Still 404 after publishing: stale lockfile | 2026-07-29 | medium | dependency-publishing |
| [3](003-production-migration-history-diverged.md) | Production migration history diverged (`case_updates`) | 2026-07-29 | critical | database-migration |
| [4](004-railway-build-no-github-packages-auth.md) | Railway remote build had no GitHub Packages auth (first 401) | 2026-07-29 | high | ci-cd |
| [5](005-ci-green-but-not-deployed.md) | "It cannot move on until all services are deploying properly" | 2026-07-29 | medium | process |
| [6](006-railway-build-wrong-token-type.md) | Railway remote build 401, second occurrence (wrong token type) | 2026-07-29 | high | ci-cd |
| [7](007-tailwind-content-scanning-broken-twice.md) | `@ponti-studios/ui` upgrade broke Tailwind content scanning again (twice) | 2026-07-29 | high | css-build |
| [8](008-labs-url-not-configured.md) | New users couldn't sign in: `LABS_URL` not configured in Hominem's production environment | 2026-07-29 | critical | env-config |
| [9](009-github-packages-unreadable-and-broken-npm-package.md) | GitHub Packages unreadable on Railway; then the npm republish shipped a broken package | 2026-07-29 | critical | dependency-publishing |
| [10](010-cloudflare-blocked-session-check.md) | Signed-in players silently treated as anonymous: Cloudflare's bot-challenge blocked the server-to-server session check | 2026-07-31 | critical | networking |
| [11](011-cross-device-progress-not-synced.md) | Cross-device progress not synced: today's puzzle was seeded from localStorage, not the server | 2026-07-31 | high | state-management |
| [12](012-realitea-future-puzzle-served-across-timezone-boundary.md) | RealiTea served the next day's puzzle before the player's local midnight | 2026-08-03 | high | timezone |
