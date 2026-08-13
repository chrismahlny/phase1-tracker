# Durable Store Setup — Google Sheet Backend (5 minutes, one time)

> **The live store was built with the STANDALONE variant: `apps-script-standalone.gs`.** It creates its
> own `Phase1 Data Store` spreadsheet on first write, so you start at script.google.com and skip step 1
> below. The container-bound script further down still works if you prefer making the Sheet by hand.
>
> Four traps cost real time on the first run — all of them produce a deployment that *looks* healthy:
> 1. **Deployment type must be `Web app`**, set via the gear next to "Select type". Picking `Library`
>    yields a `/macros/library/d/…` URL instead of one ending in `/exec`, and the app can't use it.
> 2. **"Who has access" must be `Anyone`** — *not* `Anyone with Google account`, which returns HTTP 401
>    to the app's token-authenticated fetch because it can't follow a login redirect.
> 3. **Check which Google account you are in** before authorizing. The Apps Script project, the
>    spreadsheet, and the `/exec` URL all live in whichever account authorizes, and the type can't be
>    moved afterwards. Force it with `?authuser=you@example.com` on the script.google.com URL.
> 4. Verify with `curl` before touching the app — but omit `-X POST`. Apps Script 302-redirects to a
>    `googleusercontent.com/macros/echo` URL that must be fetched with GET (what a browser's `fetch`
>    does automatically); `-X` forces POST across the redirect and returns a misleading 405.
>
> Verify a deployment in one line (expects `{"ok":true,"alive":true}`):
> ```
> curl -sL "<YOUR_EXEC_URL>"
> ```
> The endpoint URL and token are not recorded in this repo — they live in the Apps Script project and
> in the app's DURABLE STORE fields.

Your tracker now syncs every set and measurement to a Google Sheet you own — automatically, in the background, append-only (nothing can ever be overwritten or deleted). This is the layer that makes your history survive cleared browsers, lost phones, and everything else.

## Setup steps

1. Go to **sheets.google.com** → create a new spreadsheet → name it `Phase1 Data Store`.
2. In the sheet: **Extensions → Apps Script**. Delete the placeholder code and paste ALL of the code below.
3. On line 1, change `CHANGE-ME` to any secret phrase you like (this is your token).
4. Click **Deploy → New deployment → type: Web app**. Set *Execute as:* **Me**, *Who has access:* **Anyone**. Click Deploy and authorize when asked.
5. Copy the **Web app URL** (ends in `/exec`).
6. In the tracker: tap **export** → scroll to **DURABLE STORE** → paste the URL and your token → **CONNECT & SYNC**.

Done. From then on: every set you check queues instantly on-device and pushes in the background; opening the app pulls and merges from the store; the status line under the connect button tells you queue depth. "Anyone with the link" access is protected by your token — requests without it are rejected.

## The Apps Script code (paste all of it)

```javascript
const TOKEN = "CHANGE-ME"; // <-- set your secret, must match the app

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: "bad json" }); }
  if (body.token !== TOKEN) return out({ ok: false, error: "bad token" });
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (body.op === "pull") {
    const sh = sheet(ss, "snapshots", ["ts", "json"]);
    const last = sh.getLastRow();
    const snap = last > 1 ? JSON.parse(sh.getRange(last, 2).getValue()) : null;
    return out({ ok: true, snapshot: snap });
  }

  // op: push — append-only event log + point-in-time snapshot
  const ev = sheet(ss, "events", ["id", "ts", "type", "date", "exercise", "set", "weight", "reps", "done"]);
  const existing = new Set(ev.getLastRow() > 1 ? ev.getRange(2, 1, ev.getLastRow() - 1, 1).getValues().flat() : []);
  const acked = [];
  (body.events || []).forEach(function (x) {
    acked.push(x.id);
    if (existing.has(x.id)) return; // idempotent: replays are ignored, never duplicated
    ev.appendRow([x.id, new Date(x.t || Date.now()), x.type || "", x.date || "", x.exercise || "", x.set || "", x.weight || "", x.reps || "", x.done === false ? 0 : 1]);
    existing.add(x.id);
  });
  if (body.snapshot) sheet(ss, "snapshots", ["ts", "json"]).appendRow([new Date(), JSON.stringify(body.snapshot)]);
  return out({ ok: true, acked: acked });
}

function sheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); }
  return sh;
}
function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
```

## What lands in your Sheet
- **events** tab: one row per set / measurement / finished day, timestamped, never modified — your complete history as a queryable log. This tab IS the "keeps all history" guarantee.
- **snapshots** tab: full app-state JSON at each sync — point-in-time recovery; the newest row can rebuild a blank phone.

## Recovery drill (do this once after setup to trust it)
Open the tracker in a private/incognito browser window (blank storage) → export → paste your URL + token → CONNECT & SYNC → your entire history appears. That's your proof.

## Field notes
- The app never waits on the network — SET DONE is instant, sync happens behind you.
- Offline for a week? Everything queues on-device and lands exactly once when you reconnect (idempotency keys prevent duplicates).
- Both the artifact version and the standalone can point at the same Sheet — the store merges them (union of dates; the fuller record wins).
- Weekly reviews: I can read this Sheet directly from chat, so Sundays get even easier.
