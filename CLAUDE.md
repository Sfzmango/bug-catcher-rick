# CLAUDE.md — bug-catcher-rick

Pokédex-styled static SPA for Bug Catcher Rick (Vite + React 18 + TypeScript, HashRouter).
Client-only; deployed to GitHub Pages by `.github/workflows/deploy.yml`.

## Commands
- `npm run dev` — local dev server
- `npm test` — Vitest (unit + component)
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — `tsc -b && vite build` (base `/bug-catcher-rick/`)
- `npm run e2e` — `npm run build && playwright test` (local only; not in CI)

## Cardinal rules
- All Rick copy lives in `src/content/*.ts`, transcribed from the toolbelt's
  `agents/bug-catcher-rick.md` + `skills/bug-catcher/SKILL.md`. Never fetch at runtime.
- `src/lib/*` is pure and framework-free; every exported function has a test.
- The vendored Gen 1 Bug Catcher trainer sprite in `public/sprites/` (credited in README) is the
  only franchise asset; add no other Pokémon sprites, names, or assets.
- No AI-assistant attribution in commits, PRs, or files.
