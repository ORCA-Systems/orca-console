# Orca Console — agent notes

## Commands
- `npm install` — install dependencies (npm is the package manager; keep `package-lock.json` in sync)
- `npm run dev` — Vite dev server on `localhost:5173`
- `npm run build` — `tsc --noEmit && vite build` → static output in `dist/` (type-check runs first; type errors block the build)
- `npm run preview` — serve `dist/` locally
- `npm run lint` — `tsc --noEmit` only (no ESLint configured)
- No test runner is installed; do not add test commands

## Stack & constraints
- React 19 + TypeScript (strict) + Vite; static frontend only, no backend, no real hardware — target host is GitHub Pages
- `dist/` and `node_modules/` are gitignored; do not commit them
- No component library and no dashboard template; keep dependencies minimal
- Do not build dashboard pages yet (out of scope for this phase)

## Design system (honor these)
- Tokens: `src/styles/tokens.css` (colours, type scale, spacing, borders, radii, shadows, focus states)
- Global styles: `src/styles/global.css`; component styles: `src/styles/components.css`; both imported via `src/index.css`
- Palette: warm off-white surfaces, deep charcoal text, subtle borders, one muted slate accent — no gradients, neon, glassmorphism, bento cards, oversized icons, or animation
- Typography: system sans-serif for UI, editorial serif for major headings only, monospace for technical data
- Status colours are muted (green/amber/red/slate) with tinted backgrounds — never neon

## Structure & entry points
- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`
- `App.tsx` temporarily mounts `src/pages/DesignTest.tsx` (the visual design-review page); the real dashboard shell/pages are not yet built
- `src/pages/`, `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` are placeholder directories awaiting the dashboard
- `public/` holds static assets (e.g. `vite.svg` favicon)

## TypeScript quirks
- `tsconfig.json` references `tsconfig.node.json`, which requires `composite: true` (Vite project-references requirement) — do not remove or disable it

## What to avoid
- Do not add a UI component library or prebuilt dashboard template
- Do not commit `node_modules/` or `dist/`
