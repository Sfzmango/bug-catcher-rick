# Bug Catcher Rick

A Pokédex-styled web app for **Bug Catcher Rick**, the bug-diagnosis agent from
[Maung's Agentic Toolbelt](https://github.com/Sfzmango/Maungs-agentic-toolbelt).

Rick is handed a symptom, reproduces it, traces one level past the obvious
failure, and returns a structured bug dossier. He never edits, commits, or
pushes. This app is his Dex entry: a trainer card, his moveset (the dossier
fields), and a dossier viewer that renders a real dossier as a Pokédex card.

**Live:** https://sfzmango.github.io/bug-catcher-rick/

## Routes

| Route | View |
|---|---|
| `#/` | Dex entry — trainer card, tool grants, auto-detect, moveset, token budget, cardinal rules, circuit-breakers, severity rubric |
| `#/dossier` | Dossier — paste a plain-text dossier; it renders as a card with the SEV badge and the forced fix route |

## Stack

Vite + React 18 + TypeScript, client-only, `HashRouter`, deployed as a static
site to GitHub Pages by `.github/workflows/deploy.yml` (Vite base
`/bug-catcher-rick/`). All Rick copy is transcribed into `src/content/*.ts`;
nothing is fetched at runtime.

## Development

```sh
npm ci             # same install CI uses (package-lock.json is committed)
npm run dev        # local dev server
npm run typecheck  # tsc -b --noEmit
npm test           # Vitest (unit + component)
npm run build      # tsc -b && vite build
npm run e2e        # builds, then runs the Playwright smoke against `vite preview` (local only)
```

## Credits

The Bug Catcher trainer sprite `public/sprites/bug-catcher-rg.png` is
© Nintendo / Game Freak / Creatures Inc., sourced from the
[Bulbapedia archives](https://archives.bulbagarden.net/wiki/File:Spr_RG_Bug_Catcher.png)
(`Spr_RG_Bug_Catcher.png`) and used here for non-commercial fan purposes only.
It is the only franchise asset in this repository; everything else is original.

## Plans

Implementation plans live in `docs/plans/<id>_<slug>.md`.

## License

MIT for the code and original content of this repository — see `LICENSE`.

**Excluded from the MIT grant:** everything under `public/sprites/` is a
third-party asset (© Nintendo / Game Freak / Creatures Inc.) used for
non-commercial fan purposes only and is not licensed under MIT; see Credits.
