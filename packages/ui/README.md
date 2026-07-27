# @ponti-studios/ui

The canonical Ponti Studios UI package. It is published from this repository to npm.

## Release

1. Set `packages/ui/package.json` to the intended immutable version.
2. Merge the change to `main`.
3. Create and push a matching `ui-v<version>` tag, for example `ui-v0.1.0`.

The `publish-ui` workflow validates that the tag and package version match, then publishes with the repository’s npm publishing credentials. Do not publish from a workstation.

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

This package has no build output — every `exports` entry resolves to a file under `src/`. Consumers are expected to transpile the package themselves (Vite, Metro, Next, etc. all do this for workspace/npm packages by default). This is deliberate: Tailwind v4 class detection for consumers of `./styles.css` or `./tokens.css` requires an `@source` directive pointing at the installed package's `src/`, e.g.

```css
@source "../../../node_modules/@ponti-studios/ui/src";
```

Bundling the package would break that detection, since Tailwind can't scan generated/minified output for class names. `pnpm run build` only type-checks; it does not emit JS.

### `./native` subpath

`@ponti-studios/ui/native` is the only part of the package that imports `react-native`. Web consumers never pull it in; native consumers get `createMakeStyles`, `nativeShadows`, `useColorMode`, and `useThemeColors`. `react-native` is an optional peer dependency — only declare it in your own `package.json` if you actually import from this subpath.
