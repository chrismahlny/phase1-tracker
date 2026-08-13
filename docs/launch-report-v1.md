# Phase 1 Tracker v1.0.0 — Launch Report
Run date: July 14, 2026

## Store selection memo (Agent 1)
**Chosen: Google Apps Script → Google Sheet.** Zero cost, no new accounts, plain REST POST from the browser (no SDK, no CDN additions, clone-safe), token-gated, and the athlete's history lands in a Sheet he can open in Drive — where he wanted his data from day one. Supabase scored higher on query power but adds an account, a shipped client key needing row-level security, and a dependency the athlete can't see into. Firebase similar. The Sheet is inspectable, exportable, and readable by Claude in chat for weekly reviews. Setup guide + backend code: `datastore-setup.md`.

## Architecture shipped
Local-first: device storage remains the instant read/write path; the store is the durability layer.
- **Append-only event log** (`events` tab): every set, measurement, and finished day as an immutable timestamped row with an idempotency key (`date|session|exercise|set`) — replays are ignored server-side, never duplicated. Nothing is ever updated or deleted.
- **Snapshots** (`snapshots` tab): full state JSON on every push — point-in-time recovery.
- **Outbox** on device: events queue instantly, flush in the background (debounced, fire-and-forget), survive outages, retry on the next trigger.
- **Boot pull-merge:** app open pulls the latest snapshot and merges — union of dates, fuller-record-wins per date, field-wise measurement union, never-delete semantics, earliest start-date preserved.

## Gate results
- **GATE 1 — Build integrity:** PASS. Both targets compile; 52/52 automated checks; clean boot.
- **GATE 2 — Durability drills:** PASS. Merge invariants proven (union/fuller-wins/never-delete); SET DONE renders before any network resolves (non-blocking tap verified with a held-open request); events push with idempotency keys and ack-clear the outbox; store outage leaves data local and queued.
- **GATE 3 — Field acceptance:** PENDING (athlete's checklist below).
- **GATE 4 — Recovery rehearsal:** PASS. A completely blank device with only the store connection restored full history, measurements, last weights, and program start date. This was run after Gate 4 caught and forced the fix of a boot-time race — the drill did its job.

## GATE 3 — Your 20-minute field checklist (run on your phone before calling it launched)
☑ Create the Sheet + Apps Script per `datastore-setup.md`; CONNECT & SYNC shows "store connected"
   — done Aug 12 2026 on the desktop build (standalone script, auto-created Sheet). Endpoint verified
   from the terminal: token accepted, wrong token refused, append + idempotent replay, CORS open.
☐ Log one real set → open the Sheet → the row is in the `events` tab
   — this is the one link never exercised end-to-end from the app itself; it is the first thing to
   watch on the first real session. Delete the `1970-01-01 / SETUP-CHECK` row while you are in there.
☐ Kill the app immediately after a SET DONE → reopen → the set survived
☐ Airplane mode → log 3 sets → status shows queued → wifi on → reopen → rows land in the Sheet, no duplicates
☐ BODY: save a measurement → appears in `events`
☐ Timer beeps/vibrates from a bench away
☐ TRENDS renders; COACH returns a brief; daily line shows in header
☐ Recovery drill: private browser window → connect store → full history appears
☐ Footer reads v1.0.2

## Residual risks (accepted)
- Apps Script free-tier quotas (~20k URL-fetch-equivalent executions/day) — six workouts/week is ~0.5% of quota; a full-history snapshot per push grows Sheet size over months; prune old snapshot rows annually (events are the record and stay forever).
- In the Claude-artifact build, the store sync rides the same fetch bridge that blocked API calls on mobile — it may or may not pass; the standalone is the launch target, and export/paste-to-Claude remains the artifact's backup channel.
- Multi-device same-minute edits: last-fuller-wins per date; simultaneous partial sessions on two devices for the same day merge to the fuller one (union at event level in the Sheet is complete regardless).
- Token ships inside your HTML — acceptable for a single-user personal endpoint; rotate it in the Script + app if the file is ever shared.

## Rollback plan
Previous build retained in chat history; the store is append-only, so no rollback can lose data — reconnect any prior version and pull.

**Verdict: cleared for launch pending Gate 3.** Host `standalone.html`, run the checklist, lift.
