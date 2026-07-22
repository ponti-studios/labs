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
