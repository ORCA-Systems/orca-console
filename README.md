# Orca Console

Static frontend prototype for the Orca Systems AI compute-management platform. A client-side dashboard with no backend and no real hardware integration — all values are simulated for demonstration.

Deployed on GitHub Pages.

## Tech stack

- React 19 + TypeScript (strict)
- Vite (production build)
- Recharts (time-series visualisation)

## Deployment

Changes pushed to `main` build and deploy automatically via GitHub Actions to GitHub Pages.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Type-check then build static files to `dist/` |
| `npm run lint` | Run TypeScript type-check only |
