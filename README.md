# Orca Console

Frontend prototype for the Orca Systems AI compute-management platform.

This is a static, client-side demonstration for team review. There is no backend
and no real hardware integration. The dashboard has not yet been built.

## Tech stack

- React 19 + TypeScript (strict)
- Vite (dev server and production build)
- Static output hosted on GitHub Pages

## Local setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Then open http://localhost:5173.

## Build

Type-check and produce static files in `dist/`:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check then build static files to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run TypeScript type-check only |
