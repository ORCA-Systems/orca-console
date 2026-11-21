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
- Do not build full dashboard pages yet (out of scope for this phase)

## Design system (honor these)
- Tokens: `src/styles/tokens.css` (colours, type scale, spacing, borders, radii, shadows, focus states)
- Global styles: `src/styles/global.css`; component styles: `src/styles/components.css`; both imported via `src/index.css`
- Palette: warm off-white surfaces, deep charcoal text, subtle borders, one muted slate accent — no gradients, neon, glassmorphism, bento cards, oversized icons, or animation
- Typography: sans-serif exclusively — system sans for UI and headings, monospace for technical data; no serif faces anywhere
- Status colours are muted (green/amber/red/slate) with tinted backgrounds — never neon

## Structure & entry points
- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`
- `src/lib/routes.ts` — hash-based route definitions (5 destinations: Overview, Compute, Workloads, Activity, Settings)
- `src/lib/mock/types.ts` — strict TypeScript types for node, devices, utilisation, workloads, activity, logs, settings
- `src/lib/mock/data.ts` — centralised mock dataset (single source of truth; never imported directly by UI)
- `src/lib/mock/access.ts` — data access layer (single seam; all UI data reads go here)
- `src/lib/mock/invariants.ts` — data invariant checks (validateInvariants / assertInvariants)
- `src/components/shell/Shell.tsx` — layout shell (sidebar + header + main), owns sidebar open/close state
- `src/components/shell/Sidebar.tsx` — persistent desktop navigation; drawer on tablet/mobile
- `src/components/shell/Header.tsx` — top header with page context and contextual actions
- `src/components/shell/Wordmark.tsx` — Orca Console wordmark (sans-serif typographic treatment)
- `src/components/PagePlaceholder.tsx` — temporary placeholder showing selected page name
- `src/pages/DesignTest.tsx` — design-review artifact, not currently mounted
- `src/pages/`, `src/components/`, `src/hooks/`, `src/utils/`, `src/types/` are placeholder directories awaiting the dashboard
- `public/` holds static assets (e.g. `vite.svg` favicon)

## Routing
- Hash-based routing (`#/overview`, `#/compute`, etc.) — compatible with GitHub Pages, no server-side rewrites needed
- Navigation updates `window.location.hash` and listens to `hashchange` events
- Active state indicated via `aria-current="page"` and accent-tinted background

## Mock data layer
- All mock data lives in `src/lib/mock/`; UI components must import from `src/lib/mock/access.ts` only
- `src/lib/mock/data.ts` holds the raw dataset — do not import it from UI components
- `validateInvariants()` / `assertInvariants()` check consistency (bounds, state/timestamp agreement, resource limits, references)
- Data is fictional: node `node-01`, workloads `wk-101`–`wk-104`, utilisation history, activity events, synthetic logs
- No backend, database, auth, state-management framework, or hardware SDK

## TypeScript quirks
- `tsconfig.json` references `tsconfig.node.json`, which requires `composite: true` — do not remove or disable it
- `react-jsx` JSX transform: do not import `React` as a value in components; import types (e.g. `ReactNode`) individually when needed

## What to avoid
- Do not add serif fonts — sans-serif exclusively
- Do not add a UI component library or prebuilt dashboard template
- Do not commit `node_modules/` or `dist/`
