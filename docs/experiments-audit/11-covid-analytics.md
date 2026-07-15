# COVID Analytics — Rewrite Checklist

**Product brief:** [COVID Analytics](11-covid-analytics-brief.md)  
**Source:** `apps/labyrinth/app/routes/covid*`, `apps/labyrinth/app/routes/api.covid*`, `apps/labyrinth/app/components/covid/`

## Preserve

- [ ] Preserve route-based country context and independent analytical views.
- [ ] Preserve the underlying data fetching and analytical algorithms.
- [ ] Preserve the distinction between trends, waves, vaccination, seasonality, and outliers.

## Remove

- [ ] Remove metric volume that does not serve a visible analytical question.
- [ ] Remove generic chart and dashboard treatment.
- [ ] Remove visualization choices that flatten meaningful patterns into isolated numbers.

## Rebuild

- [ ] Give each analytical view a clear question and conclusion.
- [ ] Make the same data's changing story visible across lenses.
- [ ] Make chart hierarchy, data freshness, uncertainty, and comparison legible.
- [ ] Decide which visualizations best expose waves, anomalies, and consequences.
- [ ] Define loading, empty, error, and responsive chart behavior.

## Verify

- [ ] A visitor can discover a pattern without reading every metric.
- [ ] Country and tab changes preserve context without feeling like unrelated pages.
- [ ] The visualization communicates interpretation rather than merely displaying data.

## Complete when

- [ ] The experience proves that the lens changes what becomes visible in the data.
