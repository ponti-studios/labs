# @ponti-studios/ui

The canonical Ponti Studios UI package. It is published from this repository to GitHub Packages.

## Release

1. Set `packages/ui/package.json` to the intended immutable version.
2. Merge the change to `main`.
3. Create and push a matching `ui-v<version>` tag, for example `ui-v0.1.0`.

The `publish-ui` workflow validates that the tag and package version match, then publishes with the repository `GITHUB_TOKEN`. Do not publish from a workstation.

## Consumers

Configure the GitHub Packages registry in the consumer repository:

```ini
@pontistudios:registry=https://npm.pkg.github.com
```

Private consumers need a token with `read:packages`, configured outside the committed project `.npmrc`:

```bash
pnpm config set --location=user //npm.pkg.github.com/:_authToken "$NODE_AUTH_TOKEN"
```

GitHub Actions consumers should use their `GITHUB_TOKEN` after the package grants their repository Actions access. Non-GitHub build systems need the same read-only token in their user-level npm configuration or equivalent secret-backed registry integration.
