# Changelog

## [1.9.0](https://github.com/ponti-studios/labs/compare/v1.8.0...v1.9.0) (2026-03-13)


### Features

* add item action buttons to courses page ([aa28549](https://github.com/ponti-studios/labs/commit/aa285492ba6e3738dde345448da8e77cd01fdd59))
* add MySQL docker-compose and conditional Kysely/Atlas support ([c8e3a62](https://github.com/ponti-studios/labs/commit/c8e3a628797ece9b65651c04ce49ebd153ef8c17))
* add NASA sync script with retry ([380bec7](https://github.com/ponti-studios/labs/commit/380bec703f2fb466a6f3f08a9fbd6ad254b7eacc))
* add openspec ([eb0e56d](https://github.com/ponti-studios/labs/commit/eb0e56d5d6aeeb55b6fd1024ef1cedfb605b76ca))
* add Polly AI browser agent extension and server ([a1420fb](https://github.com/ponti-studios/labs/commit/a1420fb47551a1954f16a21bfb1635135df42e70))
* add various utility functions and data structures ([26d0310](https://github.com/ponti-studios/labs/commit/26d031012c9ef8ceba718d3b4a1bd4833b04f57a))
* agent ([6f2555e](https://github.com/ponti-studios/labs/commit/6f2555eef5ed965ad487996cdf252c8b6b27558d))
* **api:** implement token provider for authentication ([3a5bf5b](https://github.com/ponti-studios/labs/commit/3a5bf5b9809894b026c8e046cf8f792a813bc3e9))
* **auth:** add AuthProvider to manage authentication state ([3a5bf5b](https://github.com/ponti-studios/labs/commit/3a5bf5b9809894b026c8e046cf8f792a813bc3e9))
* consolidate database usage and fix TypeScript configuration ([f5d13ed](https://github.com/ponti-studios/labs/commit/f5d13ed773a02e675f79e38d1192a0435c831a40))
* earth v2 ([8576557](https://github.com/ponti-studios/labs/commit/8576557cd5f65d8e97495c1ba8f0d067d9d9cb6c))
* earth v2 ([481bb49](https://github.com/ponti-studios/labs/commit/481bb4924ea44a6ae84fb4c37694150871172e9b))
* earth v2.1 ([188c125](https://github.com/ponti-studios/labs/commit/188c125c7a04279fe7c33755039fd5e16fbe8697))
* integrate @googlemaps/js-api-loader for Google Maps functionality ([4185002](https://github.com/ponti-studios/labs/commit/4185002117c4aa0906df39c459602b6ca001b9c8))
* migrate to react router v7 ([#81](https://github.com/ponti-studios/labs/issues/81)) ([3a5bf5b](https://github.com/ponti-studios/labs/commit/3a5bf5b9809894b026c8e046cf8f792a813bc3e9))


### Bug Fixes

* add url-parse dependency to package.json and package-lock.json ([ae00587](https://github.com/ponti-studios/labs/commit/ae00587b14ce3c7fe5ad946d782c2ae633223655))
* adjust Dockerfile for monorepo build context and Railway deployment ([f57ddd9](https://github.com/ponti-studios/labs/commit/f57ddd9864495ee65895de96fdee7ae434d844c5))
* **api:** update request interceptor to include auth token ([3a5bf5b](https://github.com/ponti-studios/labs/commit/3a5bf5b9809894b026c8e046cf8f792a813bc3e9))
* **deploy:** switch from DOCKERFILE to RAILPACK builder ([77fa5e2](https://github.com/ponti-studios/labs/commit/77fa5e241136190935894d1ac7aab70209aa32d7))
* **deps:** override zod to v4 to resolve peer dependency conflict with @browserbasehq/stagehand ([4283e39](https://github.com/ponti-studios/labs/commit/4283e39688300b5e550dd80d57158f860a4ed0d6))
* fix config ([2c2c435](https://github.com/ponti-studios/labs/commit/2c2c435d5ae38d70270ab529822e800e2a1a20c9))
* redirect after authorize ([5631695](https://github.com/ponti-studios/labs/commit/5631695e8c9144e333795826b78087bb41d9db71))
* remove eager db initialization to fix CI tests ([f9f1c6c](https://github.com/ponti-studios/labs/commit/f9f1c6cef5e029e6a8f3d3e62dc9241dcb13027c))
* remove non-existent extension references from Dockerfiles ([5ac08e5](https://github.com/ponti-studios/labs/commit/5ac08e59cfe339791fe07f032ae8bf8356fd0ff5))
* remove pnpm cache from node setup ([86483c5](https://github.com/ponti-studios/labs/commit/86483c5d1c477df2f5e52a91db2b33f2a6b79430))
* resolve all TypeScript type errors in Tetris game ([ea561f5](https://github.com/ponti-studios/labs/commit/ea561f55e256417235ee125d9866152f49be09d5))
* run unit tests instead of e2e in manual-co test script ([1348125](https://github.com/ponti-studios/labs/commit/1348125a90eb9a9b428aa660ff1f1cf89028f870))
* update bun lock & lint warnings ([53864bd](https://github.com/ponti-studios/labs/commit/53864bd71b579270c9761f42256afcb4b73659be))
* update manual-co playwright config to use npm instead of pnpm ([4e53d77](https://github.com/ponti-studios/labs/commit/4e53d777828a7d65bd7b8fda494fbb4a4cd579c1))
* update package.json exports to include types for ESM ([15f8f32](https://github.com/ponti-studios/labs/commit/15f8f32fcb761abe74e6594b6a00e4c700ed1191))
