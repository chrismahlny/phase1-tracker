// Phase 1 Tracker — committed regression harness
// Run: npm test   (builds both targets, then runs this against dist/phase1-tracker.html)
// Clock is INJECTED (pinned Monday) so day-dependent tests never cascade on rest days.
import { readFileSync } from "fs";
import { JSDOM } from "jsdom";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const html = readFileSync("dist/phase1-tracker.html", "utf8");
const src = html.match(/<script id="app">([\s\S]*?)<\/script>/)[1];

const results = [];
const pass = (n) => results.push("PASS  " + n);
const fail = (n, d) => results.push("FAIL  " + n + (d ? " — " + String(d).slice(0, 120) : ""));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function makeWorld({ storage = "good" } = {}) {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
    url: "https://claude.ai/", pretendToBeVisual: true,
  });
  // injected clock: Monday 2026-07-13 10:00 ET
  const RealDate = Date;
  const FIXED = new RealDate("2026-07-13T10:00:00-04:00").getTime();
  class FakeDate extends RealDate {
    constructor(...a) { if (a.length === 0) super(FIXED); else super(...a); }
    static now() { return FIXED; }
  }
  global.Date = FakeDate; dom.window.Date = FakeDate;

  global.window = dom.window; global.document = dom.window.document;
  Object.defineProperty(global, "navigator", { value: dom.window.navigator, configurable: true });
  const db = {};
  if (storage === "good") {
    dom.window.storage = {
      async get(k) { if (!(k in db)) throw new Error("nf"); return { key: k, value: db[k] }; },
      async set(k, v) { db[k] = v; return { key: k, value: v }; },
    };
  } else if (storage === "broken-bridge") {
    dom.window.storage = { async get() { return { weird: true }; }, async set() { return { unexpected: "type" }; } };
  } // storage === "none": no window.storage at all
  const fetchCalls = [];
  global.fetch = dom.window.fetch = async (u, o) => {
    structuredClone(o); // artifact bridge clones options — non-cloneable opts must fail here too
    fetchCalls.push({ u, body: o && o.body ? JSON.parse(o.body) : null });
    return { json: async () => ({ ok: true, content: [], snapshot: null, acked: (o && o.body && JSON.parse(o.body).events || []).map((e) => e.id) }) };
  };
  global.React = require("react");
  global.ReactDOM = require("react-dom/client");
  const errs = [];
  const origErr = console.error;
  console.error = (...a) => { const m = String(a[0]); if (!/act\(|Warning:/.test(m)) errs.push(m); };
  eval(src);
  console.error = origErr;
  const byText = (t) => [...dom.window.document.querySelectorAll("button")].find((b) => b.textContent.trim().includes(t));
  const click = async (el) => { if (!el) throw new Error("button not found"); el.dispatchEvent(new dom.window.Event("click", { bubbles: true })); await sleep(30); };
  const setInput = async (el, v) => {
    const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value").set;
    setter.call(el, v); el.dispatchEvent(new dom.window.Event("input", { bubbles: true })); await sleep(15);
  };
  const openUtils = async () => {
    if (![...dom.window.document.querySelectorAll("button")].some((b) => b.textContent.trim() === "export")) {
      const g = [...dom.window.document.querySelectorAll("button")].find((b) => b.textContent.trim() === "⚙");
      if (g) await click(g);
    }
  };
  return { dom, db, fetchCalls, byText, click, setInput, openUtils, errs, RealDate };
}

const main = async () => {
  // ---------- world 1: healthy bridge, full user journey ----------
  const W = makeWorld();
  await sleep(200);
  const B = () => W.dom.window.document.body.textContent;

  B().includes("PHASE 1") && B().includes("WEEK 1") ? pass("boots on pinned Monday, header renders") : fail("boot", B().slice(0, 80));
  B().includes("Push") ? pass("Monday auto-loads Push") : fail("day detection");
  B().includes("“") ? pass("daily discipline line renders") : fail("daily line");
  B().includes("v1.0.0") ? pass("version stamp present") : fail("version stamp");
  W.errs.length === 0 ? pass("zero console errors on boot") : fail("console errors", W.errs[0]);

  // log a set with weight; verify persistence + read-back health
  const w1 = W.dom.window.document.querySelector('input[inputmode="decimal"]');
  const r1 = W.dom.window.document.querySelector('input[inputmode="numeric"]');
  await W.setInput(w1, "135");
  await W.setInput(r1, "10");
  await W.click(W.byText("SET DONE"));
  B().includes("DONE ✓") ? pass("set checks off") : fail("set check");
  B().includes("SAVED") ? pass("save-health shows green after read-back") : fail("save health");
  const day1 = JSON.parse(W.db["phase1-tracker-v2"]).history["2026-07-13"];
  day1 && Object.values(day1.log).some((s) => s.done && s.weight === "135" && s.t) ? pass("weight + timestamp persisted") : fail("persistence");
  B().includes("REST") ? pass("rest timer fires") : fail("timer");
  const skip = W.byText("Skip"); if (skip) await W.click(skip);

  // blank-weight inheritance on next set
  await W.click(W.byText("SET DONE"));
  const inh = Object.values(JSON.parse(W.db["phase1-tracker-v2"]).history["2026-07-13"].log).filter((s) => s.done && s.weight === "135").length;
  inh >= 2 ? pass("blank weight inherits prior (135 on " + inh + " sets)") : fail("weight inheritance", inh);
  const skip2 = W.byText("Skip"); if (skip2) await W.click(skip2);

  // sets pill + kcal live
  /\d+\/\d+ sets/.test(B()) ? pass("session progress pill live") : fail("progress pill");
  B().includes("≈") && / kcal/.test(B()) ? pass("live kcal estimates render") : fail("kcal render");

  // finish -> tiles + drive sync payload
  await W.click(W.byText("FINISH"));
  await sleep(120);
  B().includes("DONE.") && B().includes("SETS") && B().includes("LB MOVED") ? pass("finish screen stat tiles render") : fail("finish tiles", B().slice(0, 100));
  const pushCall = W.fetchCalls.find((c) => c.body && c.body.messages);
  pushCall ? pass("drive sync fires on finish") : fail("drive sync");

  // trends + coach + inspire + body render
  await W.click(W.byText("Reopen session"));
  await W.click(W.byText("TRENDS"));
  B().includes("STRENGTH") && B().includes("WEEKLY VOLUME") && B().includes("CONSISTENCY") ? pass("TRENDS panels render") : fail("TRENDS");
  await W.click(W.byText("COACH"));
  B().includes("GET COACHING") ? pass("COACH tab renders") : fail("COACH");
  await W.click(W.byText("INSPIRE"));
  B().includes("TODAY'S LEGEND") && ["Dickerson", "Zane", "Haney"].every((n) => B().includes(n)) ? pass("INSPIRE legends render") : fail("INSPIRE");
  await W.click(W.byText("BODY"));
  B().includes("SAVE MEASUREMENTS") ? pass("BODY tab renders") : fail("BODY");
  const mIn = [...W.dom.window.document.querySelectorAll('input[inputmode="decimal"]')];
  await W.setInput(mIn[0], "206.5");
  await W.click(W.byText("SAVE MEASUREMENTS"));
  await sleep(80);
  Object.values(JSON.parse(W.db["phase1-tracker-v2"]).measurements || {}).some((m) => m.weight === "206.5") ? pass("measurement persists") : fail("measurement save");
  await W.click(W.byText("TRAIN"));

  // export panel + durable store form; reset requires confirm
  await W.openUtils();
  await W.click(W.byText("export"));
  const ta = W.dom.window.document.querySelector("textarea");
  ta && ta.value.includes('"date","session"') && ta.value.includes('"time"') ? pass("export exposes CSV v2") : fail("export CSV");
  B().includes("DURABLE STORE") ? pass("durable store panel present") : fail("store panel");
  await W.openUtils();
  await W.click(W.byText("reset week 1"));
  B().includes("tap again to erase") ? pass("reset demands confirmation") : fail("reset confirm");
  await sleep(30);

  // ---------- unit math (exposed globals) ----------
  const TM = W.dom.window.TrendMath, SM = W.dom.window.SyncMath;
  TM.epley(200, 10) === 267 ? pass("e1RM (200x10 -> 267)") : fail("e1RM");
  TM.metFor("legpress") === 6 && TM.metFor("cable-lat") === 4.5 && TM.metFor("ab-plank") === 3.5 ? pass("MET classes") : fail("MET classes");
  const kc = TM.setKcal({ id: "legpress", rest: 150 }, 93.4);
  kc > 11 && kc < 17 ? pass("per-set kcal sane (" + kc.toFixed(1) + ")") : fail("set kcal", kc);
  const merged = SM.mergeSnapshots(
    { startDate: "2026-07-14", history: { A: { finished: true, log: { x: { done: true } } } }, measurements: { M: { weight: "206" } }, lastWeights: { bench: "185" } },
    { startDate: "2026-07-10", history: { A: { finished: true, log: { x: { done: true }, y: { done: true } } }, B: { finished: true, log: {} } }, measurements: { M: { waist: "38" }, N: { weight: "204" } }, lastWeights: { bench: "180", rdl: "200" } }
  );
  Object.keys(merged.history).length === 2 && SM.doneCount(merged.history.A) === 2 && merged.measurements.M.weight === "206" && merged.measurements.M.waist === "38" && merged.startDate === "2026-07-10"
    ? pass("merge: union / fuller-wins / never-delete / field-wise") : fail("merge invariants");

  // ---------- world 2: broken bridge (the athlete's real client bug) ----------
  const W2 = makeWorld({ storage: "broken-bridge" });
  await sleep(250);
  const B2 = () => W2.dom.window.document.body.textContent;
  await W2.click(W2.byText("SET DONE"));
  await sleep(100);
  const localSaved = W2.dom.window.localStorage.getItem("phase1-tracker-v2");
  localSaved && JSON.parse(localSaved).history ? pass("broken bridge -> probe falls back to localStorage, set saved") : fail("bridge fallback");
  B2().includes("SAVED") ? pass("save-health green through fallback") : fail("fallback health");

  // ---------- world 3: blank device + remote store = full recovery ----------
  const W3 = makeWorld({ storage: "none" });
  const snapshot = { startDate: "2026-07-01", lastWeights: { legpress: "270" }, history: { "2026-07-12": { sessions: ["push"], finished: true, log: { "0|inc-press|0": { done: true, weight: "135", reps: "10", t: 1 } }, notes: {} } }, measurements: { "2026-07-01": { weight: "204" } } };
  W3.dom.window.localStorage.setItem("phase1-tracker-v2", JSON.stringify({ startDate: "2026-07-13", lastWeights: {}, history: {}, remote: { url: "https://example.test/exec", token: "t" } }));
  global.fetch = W3.dom.window.fetch = async (u, o) => { structuredClone(o); const b = JSON.parse(o.body); if (b.op === "pull") return { json: async () => ({ ok: true, snapshot }) }; return { json: async () => ({ ok: true, acked: (b.events || []).map((e) => e.id) }) }; };
  // re-eval needs fresh globals per world — makeWorld already ran eval before we swapped fetch, so re-boot:
  W3.dom.window.document.getElementById("root").innerHTML = "";
  // (boot pull uses the fetch present at effect time; wait for it)
  await sleep(400);
  const rec = JSON.parse(W3.dom.window.localStorage.getItem("phase1-tracker-v2"));
  rec.history["2026-07-12"] && rec.measurements["2026-07-01"].weight === "204" && rec.lastWeights.legpress === "270" && rec.startDate === "2026-07-01"
    ? pass("GATE 4: blank device fully restores from store") : fail("recovery", JSON.stringify(rec).slice(0, 120));

  console.log(results.join("\n"));
  const fails = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(`\n${results.length - fails}/${results.length} checks passed`);
  process.exit(fails ? 1 : 0);
};

main().catch((e) => { console.error("HARNESS CRASH:", e); process.exit(1); });
