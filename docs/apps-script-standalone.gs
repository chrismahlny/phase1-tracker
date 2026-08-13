/**
 * Phase 1 Tracker — durable store backend (STANDALONE variant)
 *
 * Difference from the container-bound script in datastore-setup.md: this one
 * is not attached to a spreadsheet. It creates "Phase1 Data Store" in your
 * Drive on first write and remembers the id in Script Properties, so setup
 * starts at script.google.com and there is no sheet to make by hand.
 *
 * Wire contract (must match the app — do not change these shapes):
 *   POST {token, op:"pull"}            -> {ok:true, snapshot: <obj|null>}
 *   POST {token, op:"push", events[], snapshot} -> {ok:true, acked:[ids]}
 *   any failure                        -> {ok:false, error:"..."}
 */

const TOKEN = "CHANGE-ME"; // <-- set your secret, must match the app

function doPost(e) {
  try {
    let body;
    try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: "bad json" }); }
    if (body.token !== TOKEN) return out({ ok: false, error: "bad token" });
    const ss = getSS();

    if (body.op === "pull") {
      const sh = sheet(ss, "snapshots", ["ts", "json"]);
      const last = sh.getLastRow();
      const snap = last > 1 ? JSON.parse(sh.getRange(last, 2).getValue()) : null;
      return out({ ok: true, snapshot: snap, sheetUrl: ss.getUrl() });
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
  } catch (err) {
    return out({ ok: false, error: String((err && err.message) || err) });
  }
}

// Browser sanity check: visiting the /exec URL should print {"ok":true,"alive":true}.
// Deliberately returns no data and requires no token — it only proves the URL is
// live and deployed, which is the thing that is actually hard to tell otherwise.
function doGet() {
  return out({ ok: true, alive: true });
}

/**
 * The spreadsheet is created once and then located by stored id. If the id is
 * present but the file will not open (trashed, or the deployment was moved to
 * another account), this throws rather than creating a replacement: silently
 * starting a fresh empty store would look like a working sync while the real
 * history sat in the trash.
 */
function getSS() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SS_ID");
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch (err) {
      throw new Error("data store spreadsheet not reachable (trashed or wrong account) — check Drive for 'Phase1 Data Store'");
    }
  }
  const ss = SpreadsheetApp.create("Phase1 Data Store");
  props.setProperty("SS_ID", ss.getId());
  return ss;
}

function sheet(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); sh.appendRow(headers); }
  return sh;
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
