# @ponti-studios/ui

The canonical Ponti Studios UI package. It is published from this repository to npm.

## Release

Releases are owned by [release-please](https://github.com/googleapis/release-please), not by hand-edited version numbers or manually pushed tags. The workflow is defined once, in `.github/workflows/publish-ui.yml`, and has three jobs:

1. **`release-ui`** — runs on every push to `main`. It scans commits under `packages/ui/` since the last release and keeps a standing pull request, `chore(main): release ui X.Y.Z`, up to date: `packages/ui/package.json`'s `version`, `.release-please-manifest.json`, and `packages/ui/CHANGELOG.md` are all written by this PR, never by a person. **Never hand-edit the `version` field in `packages/ui/package.json`** — the next push will regenerate the release PR from the real commit history and overwrite whatever you set.
2. **`publish-ui`** — gated on `release-ui`'s `release_created` output, i.e. it only runs the push immediately after the release PR is *merged*. Merging that PR is what creates the `ui-v<version>` tag and triggers this job. It checks out that exact tag, re-verifies the tag matches `package.json`'s version and `HEAD`, runs `npm publish --provenance --access public`, then confirms the version resolves on the registry.
3. **`publish-ui-manual`** — a `workflow_dispatch` break-glass path that checks out an arbitrary ref and publishes whatever version is in `package.json` there, with none of `publish-ui`'s tag/version consistency checks. Only use this to recover from a `publish-ui` run that failed for a reason unrelated to versioning (e.g. a broken `prepack` step) after a real release PR already merged — never as a way to skip release-please.

**So the actual release flow is:**

1. Land commits under `packages/ui/` using [Conventional Commits](https://www.conventionalcommits.org/) — the version bump is computed from the commit type: `fix:` → patch, `feat:` → minor, `feat!:`/a `BREAKING CHANGE:` footer → major. This is the *only* way to control the bump; there is no manual override.
2. Once on `main`, find or wait for the `chore(main): release ui X.Y.Z` PR that `release-ui` opens/updates.
3. Review and merge it. That merge creates the `ui-v<version>` tag and triggers `publish-ui` automatically. Nothing further to push or tag by hand.

`prepack` (`tokens:check && check:source && typecheck`) runs as part of `pnpm install`/publish tooling and is the last gate before anything reaches npm — see "Generated files" below for the failure mode that most commonly trips it.

### Generated files must never be hand-edited

`src/styles/tokens/generated/**` and `.storybook/generated/**` are produced only by `pnpm run tokens:build` (style-dictionary) from the DTCG source in `src/styles/tokens/source/*.tokens.json`. `tokens:check` enforces this with `git diff --exit-code -- src/styles/tokens/generated` after a fresh rebuild — if the committed file doesn't byte-for-byte match what the tool just produced, the check (and therefore `prepack` and the publish) fails. This has happened in practice when a repo-wide formatter (oxfmt) reformatted a generated CSS file directly; `.oxfmtrc.json`'s `ignorePatterns` now excludes both generated directories specifically to prevent that recurring. If `tokens:check` fails on a file you didn't intend to touch, run `pnpm run tokens:build` and commit the regenerated output — don't hand-format it back into place.

## Consumers

Configure the npm registry in the consumer repository:

```ini
@ponti-studios:registry=https://registry.npmjs.org
```

Consumers that need authentication should configure a token outside the committed project `.npmrc`:

```bash
pnpm config set --location=user //registry.npmjs.org/:_authToken "$NODE_AUTH_TOKEN"
```

CI consumers should use a secret-backed npm token with read access.

### Ships TypeScript source, not a bundle

This package has no build output — every `exports` entry resolves to a file under `src/`. Consumers are expected to transpile the package themselves (Vite, Metro, Next, etc. all do this for workspace/npm packages by default). Tailwind v4 class detection for consumers of `./styles.css` requires an `@source` directive pointing at the installed package's `src/`, e.g.

```css
@source "../../../node_modules/@ponti-studios/ui/src";
```

Bundling the package would break that detection, since Tailwind can't scan generated/minified output for class names. `pnpm run build` only type-checks; it does not emit JS.

### `./native` subpath

`@ponti-studios/ui/native` is the only part of the package that imports `react-native`. Web consumers never pull it in; native consumers get `createMakeStyles`, `nativeShadows`, `useColorMode`, and `useThemeColors`. `react-native` is an optional peer dependency — only declare it in your own `package.json` if you actually import from this subpath.
