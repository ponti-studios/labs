## 1. Create Experiments Index Route

- [x] 1.1 Create `app/routes/experiments.tsx` as index page
- [x] 1.2 Add link to data-agency experiment
- [x] 1.3 Add link to llm-receipt experiment
- [x] 1.4 Add link to threegl-image-gallery experiment

## 2. Register Routes in routes.ts

- [x] 2.1 Add `route("/experiments", "routes/experiments.tsx")`
- [x] 2.2 Add `route("/experiments/data-agency", "experiments/data/data-agency.tsx")`
- [x] 2.3 Add `route("/experiments/llm-receipt", "experiments/data/llm-receipt.tsx")`
- [x] 2.4 Add `route("/experiments/threegl-image-gallery", "experiments/web/threegl-image-gallery.tsx")` (converted from HTML to React component)

## 3. Verify Routes Work

- [x] 3.1 Run typecheck to verify route imports resolve (pre-existing errors in other files, threegl component fixed)
- [x] 3.2 Test that `/experiments` index page loads
