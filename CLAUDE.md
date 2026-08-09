# CLAUDE.md — Phase 1 Tracker handoff brief

Drop this file plus `phase1-workout-app.jsx`, `phase1-tracker.html`, `standalone.html`, `datastore-setup.md`, and `launch-report-v1.md` into a new folder, open Claude Code there, and start with: *"Read CLAUDE.md, then set up the repo and finish the launch tasks."*

## What this is
A single-file React 18 workout tracker for a 61-year-old Masters bodybuilding competitor (right total knee replacement, 12-month contest prep, 6-day split, every lift 4 sets). Source: `phase1-workout-app.jsx` → precompiled (Babel classic runtime, production, no runtime compiler) → `phase1-tracker.html` (Claude artifact build) and `standalone.html` (same + PWA manifest, the real launch target). Athlete uses it daily; treat it as production.

## Architecture facts
- Tabs: TRAIN / BODY (13 tape+comp fields) / TRENDS (hand-rolled SVG, e1RM, tonnage, kcal, thigh-asymmetry) / COACH (3-voice AI panel, strict-JSON contract, rule-based local fallback, cached briefs) / INSPIRE (8 legends). Gear menu: export CSV, restore, confirm-guarded reset. v1.0.0 stamp.
- Storage: probing `storageAdapter` — write-read probes artifact bridge → localStorage → in-memory (honest red "NOT SAVING" state). Key `phase1-tracker-v2`. Save health indicator does read-back verification.
- Durable store: local-first sync engine → Google Apps Script → Sheet. Append-only `events` (idempotency key `date|si|exId|setIdx`) + `snapshots`. Outbox with debounced fire-and-forget flush + ack-clear; boot pull-merge (union of dates, fuller-record-wins, never-delete). Backend code + setup: `datastore-setup.md`.
- CSV schema v2: `date,session,exercise,set,weight_lb,reps,done,feedback,time` + `Body` measurement rows. Export panel and restore both speak it.
- Calorie model: METs (compound 6 / isolation 4.5 / core 3.5, rest at 2), scaled to latest logged bodyweight.

## Environment ledger — hard-won, DO NOT relearn
1. Claude mobile artifact sandbox: fetch bridge structured-clones options (AbortSignal ⇒ "object cannot be cloned" — timeouts must race, never abort); in-artifact Anthropic API and MCP calls fail on the athlete's client ("Invalid response format"); window.storage can be PRESENT BUT BROKEN ("Unexpected response type") — hence the probing adapter. Nothing network- or bridge-dependent may be load-bearing.
2. All date logic is device-local; CI/test clocks are UTC — tests must inject a pinned clock (Monday) or day-dependent tests cascade-fail on rest days.
3. Never emit `\uXXXX` escapes into JSX text (renders literally); a zero-escape check should stay in CI.
4. Never fork storage keys or re-ship as a new artifact without migration — data loss happened once.
5. Domain rules are inviolable: knee-critical flags, deloads weeks 6 & 12, RIR loading, operated leg progresses every other week, rest days never penalized, no network wait on SET DONE.

## Test suite
A ~58-check jsdom harness existed (clone-strict fetch mocks, injectable clock, merge/durability drills, storage-failure and rule-fallback coverage) but lived in /tmp and was lost to an environment reset — REBUILD IT FIRST as a committed `test/` directory before touching features. `launch-report-v1.md` lists the drills and gates.

## Remaining launch tasks (in order)
1. Repo hygiene: git init, split build script (jsx → both HTML targets) into `build.mjs`, commit the harness, CI-able.
2. Deploy `standalone.html` (rename `index.html`) to Netlify; athlete adds to home screen.
3. Athlete-assisted: create the Google Sheet + Apps Script store per `datastore-setup.md`; connect in-app.
4. Run Gate 3 field checklist and Gate 4 recovery drill from `launch-report-v1.md`.

## Phase 2 backlog (only after launch)
Auto-computed next-session load targets (top-of-range at target RIR ⇒ printed prescription, operated-leg every-other-week rule enforced); rest-day recovery screen; posing-practice module unlocking month 8; snapshot pruning; habits module integration (see athlete's Aug 2026 spec).
