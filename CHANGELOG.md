# Changelog

## [1.8.0](https://github.com/theponti/rocco/compare/v1.7.0...v1.8.0) (2024-10-10)


### Features

* add animate-spin ([0221a63](https://github.com/theponti/rocco/commit/0221a63eca9754637ead7ba45c38e00a5ea8ae0f))
* **app/collab:** refactor auth plugin dir structure ([#65](https://github.com/theponti/rocco/issues/65)) ([e9f7417](https://github.com/theponti/rocco/commit/e9f741786e9c8e2d59ce911685f760429353ad95))
* **apps/api:** migrate from jest to vitest ([#64](https://github.com/theponti/rocco/issues/64)) ([43da5e2](https://github.com/theponti/rocco/commit/43da5e2d5ff965e1d61f0dc91c252a9c61b1d82b))
* **apps/api:** switch env.example secret gen to openssl ([b7dbc08](https://github.com/theponti/rocco/commit/b7dbc082f910a5ba950826da08e5c5ea909fe4ca))
* **apps/api:** use cookie domain for api ([9930d3b](https://github.com/theponti/rocco/commit/9930d3be0d790225684d49b20a3c6b1e2aa4f8b7))
* **apps/api:** use ts-node with swc ([ca92a9b](https://github.com/theponti/rocco/commit/ca92a9ba73140d4152b3710860c4e23dc19c6cd5))
* **apps/collab:** add gzip compression configuration to nginx.conf ([6addd38](https://github.com/theponti/rocco/commit/6addd38e3104e7f8b2aa562c08dc54dbff397443))
* **apps/web:** add build analyze script ([fbc172e](https://github.com/theponti/rocco/commit/fbc172ef23b3f7e3f3e14881e1fa835009652700))
* **apps/web:** add NotFound Invite cases ([5adbde8](https://github.com/theponti/rocco/commit/5adbde8ad15d9f834b20b7bb3c8e1e8f74f4f2eb))
* **apps/web:** collapse LinkButton into NavLink ([784ad1d](https://github.com/theponti/rocco/commit/784ad1dc28f524b544945477209878826e86489a))
* **apps/web:** create NotFound typography components ([5308f2f](https://github.com/theponti/rocco/commit/5308f2f34223cf749add97394f57190f3443ab8c))
* **apps/web:** display loading while auth status is loading ([2859592](https://github.com/theponti/rocco/commit/285959207b0e698f6ce45863cc71a09cc5405ff2))
* **apps/web:** handle invalid user API value ([dd3d8e8](https://github.com/theponti/rocco/commit/dd3d8e8738e7216961543bb8d3f595105b974737))
* **apps/web:** remove unused imports from place ([682d7ec](https://github.com/theponti/rocco/commit/682d7ec5bdc004108166a9606678e58104231885))
* **apps/web:** rename FeedbackBlock to Alert ([00fb346](https://github.com/theponti/rocco/commit/00fb346db219c0991d6c3e784e8b06cd8a4f59f9))
* **apps/web:** rename Scene to Route ([bf2c50e](https://github.com/theponti/rocco/commit/bf2c50e1e8f7f3eca8d8eb6a78358924b987e248))
* **apps/web:** switch to auth provider ([#71](https://github.com/theponti/rocco/issues/71)) ([8d5af6e](https://github.com/theponti/rocco/commit/8d5af6e99ed8c69aac201029f664173087f26e69))
* **apps/web:** text align NotFoundHeader ([cad8ca5](https://github.com/theponti/rocco/commit/cad8ca5071bd53549f075a7e9f52214853350bb8))
* **apps/web:** update daisyui ([6169fe5](https://github.com/theponti/rocco/commit/6169fe5b43b672aaba449cb2298077e017c043a5))
* **apps/web:** upgrade to react-query v5 ([#70](https://github.com/theponti/rocco/issues/70)) ([c5e02d5](https://github.com/theponti/rocco/commit/c5e02d5f4bd7e59d76a5069752b9e63fdc79a166))
* **apps/web:** upgrade to react-router data router ([#73](https://github.com/theponti/rocco/issues/73)) ([e1d0884](https://github.com/theponti/rocco/commit/e1d0884d367a8ac231777bf0c87561797b3da5e4))
* **apps/web:** use LoadingScreen for component loading state ([425def7](https://github.com/theponti/rocco/commit/425def7dc62dcd1bc946dfd379971b97ec062ee3))
* **apps/web:** use sheet for add place to lists ([4656f94](https://github.com/theponti/rocco/commit/4656f948b8afb620cc97fd37a7f2bea089d85726))
* **apps:** upgrade react google maps ([b6d0288](https://github.com/theponti/rocco/commit/b6d028870e760f9a79ff25745a45dc278aeff1f6))
* **ci:** cloudflare deployment ([b31f31d](https://github.com/theponti/rocco/commit/b31f31db106a327d88e4bacdc60fa85d53c39d9d))
* **ci:** improve workflow triggers ([545b745](https://github.com/theponti/rocco/commit/545b745031913b38a01c21ba59fbf6370fcf66af))
* **ci:** only deploy if workflow successful ([615eeec](https://github.com/theponti/rocco/commit/615eeec6358770d247e89d7591ff34038cb45b06))
* **ci:** use cloudflare wrangler for web deploy ([13485b2](https://github.com/theponti/rocco/commit/13485b27908f32d7afa9a165a3a7505f563bfa24))
* **db:** update schema and migration ([55c532d](https://github.com/theponti/rocco/commit/55c532d6de3e2c8d5b1810535acf3b834ceb623b))
* **deps:** upgrade turbo ([c1a8003](https://github.com/theponti/rocco/commit/c1a8003979a1a2f006e5609bd2d8e42a7a4b9cb7))
* **docker:** remove obsolete compose version setting ([77b2dbb](https://github.com/theponti/rocco/commit/77b2dbb3deb6c30233211435cec4ecf300ab6f31))
* improve login route comment ([265501b](https://github.com/theponti/rocco/commit/265501b5ef424e0727305864bdf109564f9298e0))
* **packages:** rename ui to @hominem/components ([1096e1b](https://github.com/theponti/rocco/commit/1096e1ba33a73327deba61e05455074362a693ea))
* update home page ([9e44fdc](https://github.com/theponti/rocco/commit/9e44fdcfdd01e909794e4dba7e7841deb21123fa))
* users can save place to list ([#78](https://github.com/theponti/rocco/issues/78)) ([4061c0f](https://github.com/theponti/rocco/commit/4061c0f348fac94614088d5e2fa973ba8e5a4fad))


### Bug Fixes

* **apps/api:** disallow wrap in PlaceType ([ffc8106](https://github.com/theponti/rocco/commit/ffc810640454816e0cef394723285c56f4ac7c66))
* **apps/api:** fix ref to bookmark model ([b2664b6](https://github.com/theponti/rocco/commit/b2664b6a4c5ec319a965c727a463ffa8110024a2))
* **apps/api:** format files ([2f7fd57](https://github.com/theponti/rocco/commit/2f7fd5701cfcaa9ebf0bcb34f45f52d879848404))
* **apps/api:** remove google auth test ternary ([8390021](https://github.com/theponti/rocco/commit/8390021b406ff05361f864eeca360b53221e2d62))
* **apps/web:** display Footer on md ([cf0f0b3](https://github.com/theponti/rocco/commit/cf0f0b3812827c765f6a919011ba5c03a7b522dc))
* **apps/web:** ensure place is full width ([4cf1da8](https://github.com/theponti/rocco/commit/4cf1da86aac2be67417264a0249163f2997033c1))
* **apps/web:** fix List header ([045cd8d](https://github.com/theponti/rocco/commit/045cd8de68ca27c6be694ad5cf495e209db08650))
* **apps/web:** standardize app width n padding ([3140f45](https://github.com/theponti/rocco/commit/3140f457ea09ab7f83fc802f4fcd1c492829b688))
* **apps/web:** use padding bottom on main max-md ([4f5225f](https://github.com/theponti/rocco/commit/4f5225faa471f3210f728b036855c07aef9c27e2))
* **ci:** add env vars to deploy-web-prod ([9839890](https://github.com/theponti/rocco/commit/98398905f62fc98f29f8d9d6f9abe476fab1d20f))
* **ci:** add missing env vars to workflow ([820cf3d](https://github.com/theponti/rocco/commit/820cf3d494c7bc117799393cef335a91976cf143))
* **ci:** install dependencies ([3a327dc](https://github.com/theponti/rocco/commit/3a327dc140e8db1697d158c77c68bf5e5ba2c4f4))
* fix infinite loop ([115f509](https://github.com/theponti/rocco/commit/115f509508aaf6d79e3bcadbbb76cd7198635707))
* fix tsconfigs ([#75](https://github.com/theponti/rocco/issues/75)) ([c826435](https://github.com/theponti/rocco/commit/c826435aee004b6fefd158823d8695557b5787dc))
* **packages/ui:** wrap error in flex 1 ([3450f36](https://github.com/theponti/rocco/commit/3450f36b072d87ca1a66115d0b2230b77dec6136))
* use build for db main ([2798417](https://github.com/theponti/rocco/commit/2798417eae9fc2fb8f1a137e84dcfdb95b9281bd))
* use CommonJS module for hominem/db ([bd67513](https://github.com/theponti/rocco/commit/bd67513078521744f610948d10d11ead5e5e774d))

## [1.7.0](https://github.com/theponti/rocco/compare/v1.6.0...v1.7.0) (2024-03-26)

### Features

- **app/api:** add itemType to item table ([bad39f1](https://github.com/theponti/rocco/commit/bad39f1cbc5e085e4fe5b2f8aed02337bf48c93b))
- create hominem/db package ([#56](https://github.com/theponti/rocco/issues/56)) ([48f6121](https://github.com/theponti/rocco/commit/48f6121f6b5f3b4d41dd27360a77f3dda5f52264))

### Bug Fixes

- **app/rocco:** fix place item click ([54571c1](https://github.com/theponti/rocco/commit/54571c1dc945f2e72759538b23a178c0cc65ae54))
- **app/rocco:** fix text search ([#57](https://github.com/theponti/rocco/issues/57)) ([ddc9e27](https://github.com/theponti/rocco/commit/ddc9e2732bfa2ab9785147a8193ba196c8eb03f1))
- fix get google place ([#59](https://github.com/theponti/rocco/issues/59)) ([fc78102](https://github.com/theponti/rocco/commit/fc78102c942456f3d594418824c688da06e0038b))

## [1.6.0](https://github.com/theponti/rocco/compare/v1.5.0...v1.6.0) (2024-02-27)

### Features

- **app/api:** remove add imageUrl cron ([0a09895](https://github.com/theponti/rocco/commit/0a0989565af7f8a213067e54e188f9ad69267770))
- **app/web:** highlight nav icon for route ([2809626](https://github.com/theponti/rocco/commit/2809626b5bdd9336502092265b43cf9d4976e5b5))
- **app/web:** Update styles and add ListDeleteButton component ([4f5fbc1](https://github.com/theponti/rocco/commit/4f5fbc1b075e9924b9ea120c3d12ac8d0b39f3f5))
- **apps/api:** add cron to update imageUrls ([#52](https://github.com/theponti/rocco/issues/52)) ([14c089b](https://github.com/theponti/rocco/commit/14c089b402896e6f728ee90bfe4df8f0064250cb))
- **apps/api:** use googleapis package ([9bccf14](https://github.com/theponti/rocco/commit/9bccf14ee68dab194ae7c4372e5dc9844eba1364))
- **apps/web:** save users current location to state ([#45](https://github.com/theponti/rocco/issues/45)) ([0e7f38b](https://github.com/theponti/rocco/commit/0e7f38bcdc2791761e7b290d1f838b50dd8e89ce))
- **apps/web:** update home page ([6c9f227](https://github.com/theponti/rocco/commit/6c9f227ca36b6d3168cfba4057c3fa8f77511118))
- **apps/web:** use lucide glob in header ([78b9ab0](https://github.com/theponti/rocco/commit/78b9ab0b8b45133b329fea485bbe43d64b0708a8))
- improve invites list ([#48](https://github.com/theponti/rocco/issues/48)) ([693f510](https://github.com/theponti/rocco/commit/693f510aff87e0796c94d62d65363cae6ac0de5a))

### Bug Fixes

- **app/api:** update place photo cron to use correct value ([8b13ece](https://github.com/theponti/rocco/commit/8b13ece409ed83589d27c33c60ced637ee25cf10))
- **app/api:** update place photo cron to use correct value ([4f68086](https://github.com/theponti/rocco/commit/4f68086697f6873980dec50ce515df9ab4840806))
- **apps/api:** run photos cron for all invalid places ([6a42bed](https://github.com/theponti/rocco/commit/6a42bed2830ce8a47ce06953998b6251cc7ea1da))
- **apps/api:** use npx for prisma generate ([c4414e0](https://github.com/theponti/rocco/commit/c4414e0d55c5442d673452a213f7e047b41854e4))
- **apps/web:** fix footer to bottom ([71ff060](https://github.com/theponti/rocco/commit/71ff060f860bbd2bc3095e9340643ea532b663a1))
- **apps/web:** fix mobile nav to viewport bottom ([d6d5beb](https://github.com/theponti/rocco/commit/d6d5beb40c4f3781d8f48ad307f0223b553012d3))

## [1.5.0](https://github.com/theponti/rocco/compare/v1.4.1...v1.5.0) (2024-01-30)

### Features

- **apps/web:** update login page style ([#43](https://github.com/theponti/rocco/issues/43)) ([db12be4](https://github.com/theponti/rocco/commit/db12be4f2a6104429b3044e481b9c909f25bbb19))
- use daisy carousel for place photos ([cc51a90](https://github.com/theponti/rocco/commit/cc51a90fdc90ae261ae6d2a924169b8bab234248))

## [1.4.1](https://github.com/theponti/rocco/compare/v1.4.0...v1.4.1) (2024-01-15)

### Bug Fixes

- do not deploy preview on main ([#37](https://github.com/theponti/rocco/issues/37)) ([1bc38fb](https://github.com/theponti/rocco/commit/1bc38fb088218e8c7cf5c76533d99f85b908366b))

## [1.4.0](https://github.com/theponti/rocco/compare/v1.3.0...v1.4.0) (2023-12-30)

### Features

- Analytics track place added ([#30](https://github.com/theponti/rocco/issues/30)) ([3324e4f](https://github.com/theponti/rocco/commit/3324e4f3c66217001211ba8fa808ea24747deb83))
- remove unnecessary web deploy env vars ([1b60d67](https://github.com/theponti/rocco/commit/1b60d67d94a120ef49395984fb2305a5946bf23f))

### Bug Fixes

- improve copy on invites not found page ([#25](https://github.com/theponti/rocco/issues/25)) ([3b1574b](https://github.com/theponti/rocco/commit/3b1574bcf74642e244ba6a7e82f7a172aefbe61c))

## [1.3.0](https://github.com/theponti/rocco/compare/v1.2.0...v1.3.0) (2023-12-02)

### Features

- **apps/web:** improve Lists style ([c8c1f6a](https://github.com/theponti/rocco/commit/c8c1f6a5a3821fc49d2489cb6a5d0691e9b0737f))
- **apps/web:** remove DashboardNav ([89532d3](https://github.com/theponti/rocco/commit/89532d31d2667ac4f1f5912866c83c9d3a6bf13d))

## [1.2.0](https://github.com/theponti/rocco/compare/v1.1.0...v1.2.0) (2023-12-01)

### Features

- **apps/web:** hide default infowindow on POI click ([62cfa4c](https://github.com/theponti/rocco/commit/62cfa4c47af757c1b66e0fb21ff090848ed2a014))

## [1.1.0](https://github.com/theponti/rocco/compare/v1.0.1...v1.1.0) (2023-11-24)

### Features

- **ci:** add vercel preview and prod deploys for web ([#14](https://github.com/theponti/rocco/issues/14)) ([cc4d074](https://github.com/theponti/rocco/commit/cc4d074418924bce1ecb688378243733534fea90))
- **ci:** switch web deploy to railway ([1d22e64](https://github.com/theponti/rocco/commit/1d22e644effe153f45f049178ea635182bca2fe6))

### Bug Fixes

- various fixings ([#18](https://github.com/theponti/rocco/issues/18)) ([12eecfa](https://github.com/theponti/rocco/commit/12eecfaab901da3aa8aac47e6be319cde4b36404))

## [1.0.1](https://github.com/theponti/rocco/compare/v1.0.0...v1.0.1) (2023-09-11)

### Bug Fixes

- **apps/web:** only show avatar if src ([ab80ec8](https://github.com/theponti/rocco/commit/ab80ec882aec765ae01ce9b5aaba2138580389a8))

## 1.0.0 (2023-09-10)

### Features

- **app/web:** improve style definitions ([e30e56b](https://github.com/theponti/rocco/commit/e30e56b71b7d2136fb34e7274d192c638a04b218))
- **apps/api:** add segment analytics to authenticate route ([ef5fb70](https://github.com/theponti/rocco/commit/ef5fb7052face0ea3451ddbc19f4210bae1ee6ae))
- **apps/api:** update sentry tracing ([f60ed69](https://github.com/theponti/rocco/commit/f60ed69789b589681aa0846924c85ab0a7351aab))
- **apps/web:** add additional data for place ([0b804ce](https://github.com/theponti/rocco/commit/0b804ce0ea84b5e40f3b27855d9ca5673ee8e0e6))
- **apps/web:** add adminPlugin to api ([33d55b6](https://github.com/theponti/rocco/commit/33d55b61f93f09a24998bafee2b7cf1523d6e691))
- **apps/web:** add EyeFollow component ([5abfd2c](https://github.com/theponti/rocco/commit/5abfd2c7e1ce70f00f555e9fc7cfb98678b21d7f))
- **apps/web:** add landing page v1 skeleton ([ceed885](https://github.com/theponti/rocco/commit/ceed8858712b6760a044a00573d91d689197a1fb))
- **apps/web:** add map search field ([b8fae48](https://github.com/theponti/rocco/commit/b8fae48a84fe8a1f8428c52535839cec15f00f76))
- **apps/web:** add place name to place modal header ([43dbd8a](https://github.com/theponti/rocco/commit/43dbd8ad3b6ceba0073f395bb379a17588d64643))
- **apps/web:** add spin-slow animation to tailwind ([499fc53](https://github.com/theponti/rocco/commit/499fc5372909740aaefb341c5f02a4c5063c9884))
- **apps/web:** fix indentation ([38926fb](https://github.com/theponti/rocco/commit/38926fbaf39cd3f15ff7ff3481060d2dd74acce7))
- **apps/web:** improve auth menu style ([e57730f](https://github.com/theponti/rocco/commit/e57730f31078079190c61ed2b4eec184631315a6))
- **apps/web:** improve places modal design ([c89bdd5](https://github.com/theponti/rocco/commit/c89bdd5918ae5902b888c474325391d8d8489507))
- **apps/web:** improve styles of auth scenes ([4954a6c](https://github.com/theponti/rocco/commit/4954a6c0ca29c3ebdc7772299800e68cb67a6226))
- **apps/web:** load place details on place select ([f83d9ef](https://github.com/theponti/rocco/commit/f83d9ef5745b2dd3f497215ec75df39630fce388))
- **apps/web:** refactor loading of account on site load ([86c7321](https://github.com/theponti/rocco/commit/86c7321257f974e01751af17299ea8d7546138fb))
- **apps/web:** replace default user avatar ([2e011e8](https://github.com/theponti/rocco/commit/2e011e8c05a0ba204e31659344dfb0fe76295f14))
- **apps/web:** switch to luxury theme ([b77e291](https://github.com/theponti/rocco/commit/b77e2917fd4b5b6129f4612305c2f1e58f4e8d87))
- **apps/web:** update style of landing page ([5ac240b](https://github.com/theponti/rocco/commit/5ac240bac6804bea7a34cfa6f58d33e432506fe8))
- **apps/web:** update styles and add place modal ([759f893](https://github.com/theponti/rocco/commit/759f893423a3c15427f10d8f5adbcf1aa2891249))
- **apps/web:** use primary styles for header ([3f07d15](https://github.com/theponti/rocco/commit/3f07d15a7340a067c28a4a66004e4db473d90302))
- **eslint:** create eslint-config-ponti ([7cbb690](https://github.com/theponti/rocco/commit/7cbb69096b456af9d4e97157a1f0c47f830bbd91))
- **github:** add pull request template ([a424592](https://github.com/theponti/rocco/commit/a424592f9eacd4e545e4d317ce1264ad5f3f32be))
- **git:** ignore vercel dir ([38969d9](https://github.com/theponti/rocco/commit/38969d9648ba62426deecf8556d5cf48836a62e4))
- **node:** switch to node 18 ([075dc27](https://github.com/theponti/rocco/commit/075dc2720b410d04dcaf5b69dd093e4179fad487))
- **packages/ui:** simplify ui button definition ([be039fd](https://github.com/theponti/rocco/commit/be039fdcc90a130eacf43df9e920c9a20413bb66))
- **package:** update package lock ([2f1f9e3](https://github.com/theponti/rocco/commit/2f1f9e363542e3053deb859decd5ff51649865d8))
- **package:** upgrade to typescript 5 ([284d26f](https://github.com/theponti/rocco/commit/284d26f3c3aae45969473f2695d74991386d8e5c))
- rename web build dir ([1c13857](https://github.com/theponti/rocco/commit/1c138575515c53eb72fb90c9bb7a9cc213c8e5c3))
- upgrade to Node 20 ([d1ecf4a](https://github.com/theponti/rocco/commit/d1ecf4a38c364b269d5fe0e765008a93c3d9c7ab))
- **vscode:** remove launch and tasks configs ([2457f78](https://github.com/theponti/rocco/commit/2457f78726d661b66abb6e02c4634479a666e772))

### Bug Fixes

- **api:** check APP_URL in production ([7a9daa1](https://github.com/theponti/rocco/commit/7a9daa19022bcf4e0e5af4a4699d3a29937566e3))
- **apps/api:** add jest setup file ([724562f](https://github.com/theponti/rocco/commit/724562fdbe6857b1f6f479a452e34f1d3e4e44ed))
- **apps/api:** fix preValidation auth hooks ([d932bc7](https://github.com/theponti/rocco/commit/d932bc70aebb4b86147ed55f7df2f7a282408401))
- **apps/web:** fix map container ([a7973f0](https://github.com/theponti/rocco/commit/a7973f0da3791324a6950b2ff535e100b2cedaf1))
- **apps/web:** fix remaining auth load issues ([93944d6](https://github.com/theponti/rocco/commit/93944d658c1ccd8c25335f9bad9765782b723692))
- **apps/web:** remove hard-coded size of main element ([8590dab](https://github.com/theponti/rocco/commit/8590dab1ec83107027b24b6789386c365bb552c1))
- **apps/web:** remove place data if not present ([0e5d5cd](https://github.com/theponti/rocco/commit/0e5d5cdfa55b1eab60335a0964f7bb558c336565))
- **apps/web:** remove unused classnames package ([cf5e160](https://github.com/theponti/rocco/commit/cf5e160b4d72daa737d5fbefbd9ba56f2a7d3448))
- **apps/web:** swap pnpx for npx in start script ([090defb](https://github.com/theponti/rocco/commit/090defba7f37b3b990276fe0b6ab32af537cef39))
- **apps:** fix lint issues ([dc4e3b0](https://github.com/theponti/rocco/commit/dc4e3b0d824ffa93a18e46cc3af3293f4bae0928))
- **codeql:** upgrade to v2 ([04e2961](https://github.com/theponti/rocco/commit/04e2961f828832ffa19c4b50c21dbca737f7b3e4))
- **daisyui:** upgrade daisyui and fix Loading ([041fee1](https://github.com/theponti/rocco/commit/041fee19407da4790e4d2e4ecb8cedfad8e41426))
- **docker:** fix docker file for web ([5ce0324](https://github.com/theponti/rocco/commit/5ce0324075932d3849c1a2c95c3448dab46ffa38))
- **email:** log when emails are sent ([154b6f6](https://github.com/theponti/rocco/commit/154b6f622262b587dc8a941eaf81ba8e0f0a4376))
- **env:** add example env files ([720aaab](https://github.com/theponti/rocco/commit/720aaab45b515bab78cda9ba4171bcb7e9ad24cd))
- **env:** shorten cookie secret ([476f963](https://github.com/theponti/rocco/commit/476f9638363bdc026f86716e85ceaf74be019027))
- **env:** use correct dev postgres url ([d4de4ad](https://github.com/theponti/rocco/commit/d4de4ad1c375fda76212f0b0c76580a6ca21ea3a))
- **eslint:** replace eslint custom with ponti ([c9e8621](https://github.com/theponti/rocco/commit/c9e86216e72d0124e943d37434499898c84fded7))
- **eslint:** use custom in root eslintrc ([bfd0a61](https://github.com/theponti/rocco/commit/bfd0a61561598f3ba3d90d5eebdcdb3dfc6f5727))
- **github/release:** add permissions ([d3c3ec0](https://github.com/theponti/rocco/commit/d3c3ec0d478554869a0727839555ba17f734cf60))
- **github:** add APP_URL to test workflow ([acc9b8b](https://github.com/theponti/rocco/commit/acc9b8b3507d232dd9a6bd862202da6a546b1dd2))
- **node:** set npm to 8 and greater ([7006f09](https://github.com/theponti/rocco/commit/7006f09a07d123cbcf28c3ee70ef424eb3ef3a51))
- **packages/ui:** allow props for Emoji ([a235f5c](https://github.com/theponti/rocco/commit/a235f5ccf66c41a837f7df045e047e19cee6415f))
- **pnpm:** set packageManager in package.jsons ([dd72d3d](https://github.com/theponti/rocco/commit/dd72d3d68be553ee74e63a3a99dd6a86a09c9d18))
- **tailwind:** apply tailwind to packages/ui ([68b1ed4](https://github.com/theponti/rocco/commit/68b1ed46eb657c2e60cd6f32a9048ba1bb7f01f7))
- **turbo:** upgrade turbo to 1.10.12 ([f45a044](https://github.com/theponti/rocco/commit/f45a044f5cdeb05147cff2673e486da38ef914e1))
