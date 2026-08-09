# Phase 1 Tracker

Daily lifting app for a 12-month Masters bodybuilding prep. Single-file React 18, precompiled, local-first storage with a Google Sheet append-only durable store.

**Start here: read `CLAUDE.md`** — it carries the full architecture, the hard-won environment ledger, and the remaining launch tasks.

```
npm install
npm test          # builds both targets + runs the full harness
npm run build     # dist/phase1-tracker.html (artifact) + dist/index.html (standalone/Netlify)
```

Deploy: drag `dist/index.html` onto https://app.netlify.com/drop (or `npx netlify-cli deploy --dir=dist --prod`).
Durable store setup: `docs/datastore-setup.md`. Launch gates & field checklist: `docs/launch-report-v1.md`.
