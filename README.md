# Phase 1 Tracker

Daily lifting app for a 12-month Masters bodybuilding prep. Single-file React 18, precompiled, local-first storage with a Google Sheet append-only durable store.

**Start here: read `CLAUDE.md`** — it carries the full architecture, the hard-won environment ledger, and the remaining launch tasks.

```
npm install
npm test          # builds both targets + runs the full harness
npm run build     # dist/phase1-tracker.html (artifact) + dist/index.html (standalone/Netlify)
```

**Live site: https://getitoldman.netlify.app** — this is the athlete's home-screen URL. Deploy INTO this
existing site (app.netlify.com → sites → `getitoldman` → Deploys tab → drop zone at the bottom of the list).
Do NOT use app.netlify.com/drop: that creates a *new* site with a new hostname and strands the icon on
the athlete's phone.

Drag the whole `dist` **folder**, never a single file — `dist/index.html` is the standalone build and the
only one carrying the PWA manifest (`display: standalone`), while `dist/phase1-tracker.html` is the
Claude-artifact build with no manifest. Dropping the wrong file yields a working app that opens in a
Safari tab with browser chrome instead of full-screen. Verify after deploying:

```
curl -s https://getitoldman.netlify.app/ | grep -c 'rel="manifest"'   # must print 1
```

CLI alternative (needs a personal access token; the interactive browser login is unreliable here):
`npx netlify-cli deploy --dir=dist --prod --site=getitoldman --auth=$NETLIFY_AUTH_TOKEN`.
Durable store setup: `docs/datastore-setup.md`. Launch gates & field checklist: `docs/launch-report-v1.md`.
