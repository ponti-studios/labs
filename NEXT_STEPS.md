# Next steps — site redesign (PR #257)

Branch: `claude/site-addition-cwmydq` → PR [ponti-studios/labs#257](https://github.com/ponti-studios/labs/pull/257) (draft)

## What's landed so far

1. **Backlog Mercenaries landing page** — `public/experiments/backlog-mercenaries.html`, linked from the Playground experiments list in `app/translations/en.ts`. Static HTML, same pattern as `pixel-descent.html`.

2. **Warm color palette override** — `app/app.css` overrides `@ponti-studios/ui`'s raw color tokens (`--background`, `--card`, `--primary`, `--border-default`, `--focus-ring`, etc.) for light and dark mode with a cream/ink/flame-orange palette, sourced from the Backlog Mercenaries mock and a matching case-study mock. No new custom tokens were added — this reuses the same variable names the design system itself defines, per explicit instruction. Note: `--color-accent` is literally `var(--primary)` in the package, so overriding `--primary` re-themes buttons/links/focus rings site-wide. `--primary-foreground` is dark ink (`#15110f`), not white, in both themes — matches how the mock pairs text with the accent.

3. **Home page redesign** — `app/routes/home.tsx`:
   - Two-column hero (kicker + animated headline / subtitle + CTA buttons)
   - Capability marquee (`t.home.marquee`)
   - 4-card capabilities grid (`t.home.capabilities`)
   - Dark "always-dark" manifesto panel (reuses `t.manifesto.quote` + `t.home.approach.items`) — hardcoded to `#171714` regardless of system theme, since it needs to stay dark in light mode too
   - Compact teaser rows (Work / Lab / Services / Manifesto) — **just replaced** a full 6-row case-study list that took up too much space; this brings back the original production home page's lightweight `Teaser` pattern
   - Accent "proof" band with 3 metrics pulled **programmatically** from `caseSnapshots` (streamyard + prolog) so numbers can't drift from the real case-study pages
   - Existing featured-products wallet (unchanged)
   - Closing CTA (reuses `t.services.cta`)

4. **Case study page redesign** — `app/routes/work.$slug.tsx`: new hero (kicker/lede/role-timeline meta), accent hero-card with the case's own outcome metrics, "what I did" section, dark approach panel with an **auto-fit** flow grid (fixed a bug where a fixed 4-column grid left an empty cell for cases with only 3 approach steps — uses `grid-cols-[repeat(auto-fit,minmax(220px,1fr))]`), brand pull-quote, full outcome grid, existing prev/next nav + close CTA.

5. New shared component: `app/components/Kicker.tsx` (dot + uppercase label, used by both home and case-study hero).

All new copy lives in `app/translations/en.ts` under `home.hero`, `home.marquee`, `home.capabilities`, `home.approach`, `home.proof`, and `work.caseStudyLabel`/`roleLabel`/`timelineLabel` — written in the site's existing first-person voice. Every stat shown on the home page reads directly from `caseSnapshots` in `app/data/studio.ts`, not hardcoded, so it can't drift from what the case-study pages claim.

`/work` (the plain case-study index list) was intentionally left untouched — it already looked right once the palette override landed.

## Verified

- `pnpm exec tsc --noEmit` and `pnpm exec oxlint app/` clean
- Manually checked in-browser (Playwright screenshots) at desktop + mobile widths, light + dark mode, for `/`, `/work/prolog`, `/work/mimecast`, `/work`

## Open threads / things to pick up

- **PR is still `draft`** — flip to ready-for-review once you're happy with it locally.
- **Preview deployments were discussed but shelved.** This app deploys to Railway (see `railway.json`, `.github/workflows/deploy-playground-prod.yml`), not Vercel. Railway has a native "PR Environments" feature, but the requirements gathered so far:
  - **One shared staging DB** across all previews (decided) — not a fresh ephemeral Postgres per PR.
  - **Opt-in per PR only** — not every PR should get a preview (Dependabot alone opens several a week, and not-yet-ready PRs shouldn't burn a deploy). This likely means a custom label-gated GitHub Actions workflow using the Railway CLI (`railway up --environment pr-<number>`) rather than Railway's native PR Environments, which deploys for every PR with less fine-grained control. Was mid-way through checking exact Railway CLI syntax for environment creation/deletion when this got shelved — `docs.railway.com` is blocked by this sandbox's egress proxy, so that lookup needs to happen from a machine with normal internet access (i.e., locally).
  - Still needed: confirm Railway plan supports multiple environments, decide the exact trigger (label? comment command?), and add a teardown step so PR environments don't accumulate.
- **Other pages not yet touched by this redesign**: `services.tsx`, `manifesto.tsx`, `faq.tsx`, `projects.tsx`/`projects.$slug.tsx` all still use the pre-redesign look. They'll inherit the new color palette automatically (it's a global override), but haven't had the layout/copy pass the home page and case studies got. Worth asking whether those should get the same treatment for visual consistency.
- **Nav/footer** (`app/root.tsx`) were explicitly out of scope and left untouched throughout.

## Useful context

- Design system (`@ponti-studios/ui`) is a **separately published npm package** — not in this repo. Anything beyond a token override (e.g. new components) needs to happen in its own repo.
- `t.catalog.proof.snapshots` in `app/translations/en.ts` (aliased as `caseSnapshots` from `app/data/studio.ts`) is the single source of truth for all client work content — comment there says "Source of truth: vault ponti-studios/projects/* — only vault-backed outcomes." Don't invent new case-study numbers; only reuse what's already there.
