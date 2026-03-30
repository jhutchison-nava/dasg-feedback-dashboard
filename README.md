# DASG Feedback Dashboard

A client-side dashboard for exploring Touchpoints feedback for the DASG websites.

It pulls submission data from the GSA Touchpoints Analytics API and summarizes feedback volume and Yes/No sentiment across multiple sites and pages, with interactive filtering.

## Highlights

- Loads data using a Touchpoints API key (the key is **not saved**)
- Date range filters (presets and custom)
- Website filters (AB2D, BCDA, Blue Button, DPC)
- Summary stats (total responses, positive/negative split, unique pages)
- Response counts over time
- Pages table ranked by response volume with drill-down filtering

## Data source

GSA Touchpoints Analytics API:
`https://api.gsa.gov/analytics/touchpoints/v1/`

## Deployment

Built as static assets for GitHub Pages under the `/dasg-feedback-dashboard/` base path.
