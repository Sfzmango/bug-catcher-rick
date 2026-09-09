# Bug Catcher Rick

A Pokédex-styled web app for **Bug Catcher Rick**, the bug-diagnosis agent from
[Maung's Agentic Toolbelt](https://github.com/Sfzmango/Maungs-agentic-toolbelt).

Rick is handed a symptom, reproduces it, traces one level past the obvious
failure, and returns a structured bug dossier. He never edits, commits, or
pushes. This app is his Dex entry: a trainer card, his moveset (the dossier
fields), a battle simulator for the Rick-versus-adversary debate, and a dossier
viewer that renders a real dossier as a Pokédex card.

## Stack

Vite + React + TypeScript, client-only, deployed as a static site to GitHub Pages.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

## Plans

Implementation plans live in `docs/plans/<id>_<slug>.md`.

## License

MIT
