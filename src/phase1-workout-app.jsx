import React, { useState, useEffect, useRef, useCallback } from "react";

// ---------------- PLAN DATA (Phase 1: Foundation & Rebuild) ----------------
const PLANS = {
  rest: { name: "Rest Day", tag: "RECOVER", color: "#8B97A3", exercises: [] },
  push: {
    name: "Push", tag: "CHEST · SHOULDERS · TRICEPS · ABS", color: "#D25B5B",
    exercises: [
      { id: "inc-press", name: "Machine / Smith incline press", sets: 4, reps: "8–10", rir: 3, rest: 120, note: "Tempo 3-1-1", how: "Bench ~30°; lower to upper chest with elbows ~45°, press up without slamming lockout." },
      { id: "fly-tri-a", name: "Flat bench DB fly", part: "C1", sets: 4, reps: "12–15", rir: 2, rest: 0, note: "Tri-set — straight to C2, same weight", how: "Soft elbows fixed; arc the DBs wide to a deep pec stretch, hug back up — keep the dumbbells for C2." },
      { id: "fly-tri-b", name: "Flat bench DB press", part: "C2", sets: 4, reps: "10–12", rir: 2, rest: 0, note: "Same weight — straight to C3", how: "Same dumbbells, zero rest; press over mid-chest to lockout, then straight into C3." },
      { id: "fly-tri-c", name: "Tight (squeeze) chest press", part: "C3", sets: 4, reps: "10–12", rir: 2, rest: 90, note: "Rest after this one", how: "Press the DBs together hard the entire rep; narrow path down the sternum — constant inner-pec tension. Then rest." },
      { id: "db-ohp", name: "Seated DB shoulder press", sets: 4, reps: "10–12", rir: 3, rest: 90, note: "Tempo 2-1-1", how: "Back on the pad; press from ear height to lockout, ribs down, no arching." },
      { id: "cable-lat", name: "Cable lateral raise", sets: 4, reps: "12–15", rir: 2, rest: 60, note: "Slow, no swing", how: "Slight lean away; raise to shoulder height leading with the elbow." },
      { id: "pushdown", name: "Rope triceps pushdown", sets: 4, reps: "12–15", rir: 2, rest: 60, note: "Tempo 2-0-2", how: "Elbows pinned to your sides; extend to full lockout, split the rope, control up." },
      { id: "ab-crunch", name: "Cable crunch", sets: 4, reps: "15", rir: 1, rest: 45, note: "Abs finisher", how: "Kneel at the cable; crunch ribs toward hips — the spine rounds, the hips stay still." },
    ],
  },
  pull: {
    name: "Pull", tag: "BACK · BICEPS · REAR DELTS · ABS", color: "#4A90C4",
    exercises: [
      { id: "pulldown", name: "Lat pulldown / assisted pull-up", sets: 4, reps: "8–10", rir: 3, rest: 120, note: "Tempo 3-1-1", how: "Grip just outside shoulders; pull to the collarbone, chest up, no lean-back heave." },
      { id: "cs-row", name: "Chest-supported row", sets: 4, reps: "10–12", rir: 3, rest: 90, note: "Tempo 2-1-1", how: "Chest glued to the pad; row to the lower ribs and squeeze the blades for 1s." },
      { id: "sa-row", name: "Single-arm cable row", sets: 4, reps: "10–12 /side", rir: 2, rest: 75, note: "Controlled", how: "Slight hinge; pull the elbow past the ribs without twisting, resist the return." },
      { id: "facepull", name: "Face pull", sets: 4, reps: "15", rir: 2, rest: 60, note: "Slow, squeeze", how: "Rope at face height; pull to the ears with thumbs pointing back, elbows high." },
      { id: "db-curl", name: "DB curl", sets: 4, reps: "10–12", rir: 2, rest: 60, note: "Tempo 2-0-2", how: "Elbows at your sides; curl with zero swing, lower on a 2-count." },
      { id: "ham-curl", name: "Hammer curl", sets: 4, reps: "12", rir: 2, rest: 60, note: "Tempo 2-0-2", how: "Neutral grip, thumbs up; strict curl — builds forearm and the arm's width." },
      { id: "ab-knee", name: "Captain's chair knee raise", sets: 4, reps: "12", rir: 1, rest: 45, note: "Abs finisher", how: "Lift knees to hip height with a small pelvic curl at the top; no swinging." },
    ],
  },
  legsA: {
    name: "Legs A", tag: "QUAD-BIASED · KNEE-PROTECTED · ABS", color: "#E8B93B", knee: true,
    exercises: [
      { id: "legpress", name: "Leg press (both legs)", sets: 4, reps: "10–12", rir: 4, rest: 150, note: "Pain-free depth only", how: "Feet high and shoulder-width on the sled; lower only to pain-free depth, press through mid-foot, never slam lockout.", knee: true },
      { id: "legext", name: "Leg extension", sets: 4, reps: "12–15", rir: 3, rest: 90, note: "Light, slow, soft lockout", how: "Light weight, 2s up and 2s down; stay in the pain-free arc, no snapping the top.", knee: true },
      { id: "seat-curl", name: "Seated leg curl", sets: 4, reps: "10–12", rir: 3, rest: 90, note: "Full comfortable ROM", how: "Pad just above the heels; curl to a full comfortable bend, control the return." },
      { id: "sl-press", name: "Single-leg press — LEFT", sets: 4, reps: "10–12", rir: 3, rest: 90, note: "Non-operated side", how: "Left leg only, same setup as leg press; extra volume for the strong side." },
      { id: "abduct", name: "Hip abduction machine", sets: 4, reps: "15", rir: 2, rest: 60, note: "Protects knee tracking", how: "Sit tall; push the knees apart with control, 1s pause at the widest point." },
      { id: "st-calf", name: "Standing calf raise", sets: 4, reps: "12–15", rir: 2, rest: 60, note: "Pain-free ROM", how: "Pressure through the big toe; full stretch at the bottom, 1s pause at the top." },
      { id: "ab-machine-crunch", name: "Machine ab crunch", sets: 4, reps: "20–30", rir: 1, rest: 45, note: "Abs finisher", how: "Chest to the pad; crunch ribs down against the plates, slow return — no yanking with the arms." },
      { id: "ab-plank", name: "Plank", sets: 4, reps: "45s", rir: 1, rest: 45, note: "Abs finisher", how: "Forearms down, glutes tight, ribs tucked — one straight line, no sagging hips." },
    ],
  },
  upper: {
    name: "Upper", tag: "STRENGTH EMPHASIS · ABS", color: "#57B87A",
    exercises: [
      { id: "bench", name: "Machine / barbell flat bench", sets: 4, reps: "6–8", rir: 3, rest: 150, note: "Ramp up carefully", how: "Feet planted, slight arch, blades pinched; bar to mid-chest, press to lockout." },
      { id: "w-row", name: "Weighted / machine row", sets: 4, reps: "6–8", rir: 3, rest: 150, note: "", how: "Heavy but strict; pull to the belly, zero torso heave." },
      { id: "m-ohp", name: "Seated overhead machine press", sets: 4, reps: "8–10", rir: 3, rest: 120, note: "", how: "Press to lockout without shrugging into your ears; lower to chin level." },
      { id: "n-pulldown", name: "Pulldown, neutral grip", sets: 4, reps: "8–10", rir: 3, rest: 120, note: "", how: "Palms facing; drive the elbows down toward your back pockets." },
      { id: "ez-curl", name: "EZ-bar / cable curl", sets: 4, reps: "10", rir: 2, rest: 60, note: "", how: "Shoulder-width grip; strict curl, hard squeeze at the top." },
      { id: "oh-tri", name: "Overhead cable triceps ext.", sets: 4, reps: "10", rir: 2, rest: 60, note: "", how: "Elbows near the ears; extend to full lockout from a deep stretch behind the head." },
      { id: "ab-deadbug", name: "Dead bug", sets: 4, reps: "10 /side", rir: 1, rest: 45, note: "Abs finisher", how: "On your back, ribs down; extend opposite arm and leg slowly — low back stays glued to the floor." },
    ],
  },
  legsB: {
    name: "Legs B", tag: "HIPS · HAMSTRINGS · GLUTES · ABS", color: "#E8ECEF", knee: true,
    exercises: [
      { id: "rdl", name: "Romanian deadlift (DB or bar)", sets: 4, reps: "8–10", rir: 3, rest: 150, note: "Hinge — knees barely bend", how: "Soft knees that stay fixed; push the hips back until the hamstrings load, flat back, stand by squeezing glutes." },
      { id: "hipthrust", name: "Hip thrust", sets: 4, reps: "10–12", rir: 3, rest: 120, note: "Knee ~90°, no shear", how: "Shoulders on the bench, knees at ~90°; drive hips to full extension, chin tucked.", knee: true },
      { id: "ly-curl", name: "Lying leg curl", sets: 4, reps: "12", rir: 3, rest: 90, note: "", how: "Hips pressed into the pad; curl heels to glutes, lower on a 2-count." },
      { id: "pullthru", name: "Cable pull-through / back ext.", sets: 4, reps: "12–15", rir: 2, rest: 75, note: "", how: "Face away from the cable; hinge deep and snap the hips forward — arms are just hooks." },
      { id: "abduct", name: "Hip abduction machine", sets: 4, reps: "15", rir: 2, rest: 60, note: "Protects knee tracking", how: "Sit tall; push the knees apart with control, 1s pause at the widest point." },
      { id: "se-calf", name: "Seated calf raise", sets: 4, reps: "15", rir: 2, rest: 60, note: "", how: "Bent knees target the soleus; full stretch at the bottom, pause at the top." },
      { id: "ab-pallof", name: "Pallof press", sets: 4, reps: "30s /side", rir: 1, rest: 45, note: "Abs finisher", how: "Cable at chest height, stand sideways; press arms straight out and resist the twist." },
    ],
  },
  pump: {
    name: "Pump", tag: "ARMS · DELTS · CALVES · CORE", color: "#E0793D",
    exercises: [
      { id: "db-lat", name: "DB lateral raise", sets: 4, reps: "15", rir: 2, rest: 45, note: "", how: "Light and strict; raise to shoulder height, pinkies a touch higher than thumbs." },
      { id: "curl21", name: "Cable curl 21s / drop set", sets: 4, reps: "21s", rir: 1, rest: 60, note: "3 rounds", how: "7 bottom-half reps, 7 top-half, 7 full — that's one set of 21." },
      { id: "tri-a", name: "Triceps pushdown", part: "A1", sets: 4, reps: "12", rir: 2, rest: 0, note: "Superset — go straight to A2", how: "Elbows pinned; push to lockout, then move immediately to A2." },
      { id: "tri-b", name: "Overhead triceps extension", part: "A2", sets: 4, reps: "12", rir: 2, rest: 60, note: "Rest after this one", how: "Rope overhead; extend from a deep stretch behind the head, then rest." },
      { id: "rd-fly", name: "Rear delt fly", sets: 4, reps: "15", rir: 2, rest: 45, note: "", how: "Hinge or chest support; sweep the arms wide leading with the elbows, no shrug." },
      { id: "p-calf", name: "Calf raise (either)", sets: 4, reps: "15–20", rir: 1, rest: 45, note: "", how: "High reps, full stretch every rep — chase the burn." },
      { id: "core-a", name: "Cable crunch", part: "B1", sets: 4, reps: "15", rir: 0, rest: 0, note: "Superset — go straight to B2", how: "Crunch ribs to hips, hips still — straight into B2." },
      { id: "core-b", name: "Plank", part: "B2", sets: 4, reps: "45s", rir: 0, rest: 45, note: "Rest after this one", how: "Straight line head to heels; squeeze glutes, breathe, then rest." },
    ],
  },
};
const EX_INDEX = {};
Object.values(PLANS).forEach((p) => p.exercises.forEach((e) => { EX_INDEX[e.id] = e; }));
const COMPOUND = new Set(["legpress", "sl-press", "bench", "inc-press", "w-row", "m-ohp", "db-ohp", "rdl", "hipthrust", "pulldown", "n-pulldown", "cs-row", "fly-tri-b"]);
const metFor = (id) => (id.indexOf("ab-") === 0 || id.indexOf("core-") === 0) ? 3.5 : COMPOUND.has(id) ? 6 : 4.5;
const setKcal = (ex, kg) => {
  const perMin = 3.5 * kg / 200;
  return metFor(ex.id) * perMin * (40 / 60) + 2.0 * perMin * ((ex.rest || 0) / 60);
};
const DEFAULT_KG = 93.4; // ~206 lb fallback until a weight is logged
const DAY_TO_PLAN = ["rest", "push", "pull", "legsA", "upper", "legsB", "pump"]; // getDay() index
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ADDABLE = ["push", "pull", "legsA", "upper", "legsB", "pump"];
const APP_VERSION = "1.0.2";
const doneCount = (day) => Object.values((day && day.log) || {}).filter((ss) => ss.done).length;
const mergeSnapshots = (loc, rem) => {
  if (!rem) return loc;
  const out = { ...loc };
  out.startDate = [loc.startDate, rem.startDate].filter(Boolean).sort()[0] || loc.startDate;
  out.lastWeights = { ...(rem.lastWeights || {}), ...(loc.lastWeights || {}) };
  out.history = { ...(loc.history || {}) };
  Object.entries(rem.history || {}).forEach(([d, day]) => {
    if (!out.history[d] || doneCount(day) > doneCount(out.history[d])) out.history[d] = day;
  });
  out.measurements = { ...(loc.measurements || {}) };
  Object.entries(rem.measurements || {}).forEach(([d, m]) => { out.measurements[d] = { ...m, ...(out.measurements[d] || {}) }; });
  return out;
};
if (typeof window !== "undefined") window.SyncMath = { mergeSnapshots, doneCount };

const LEGENDS = [
  { name: "Chris Dickerson", fact: "Mr. Olympia 1982 — the oldest man ever to win it, at 43", thesis: "Age is leverage, not a handicap. He beat younger men on polish: flawless posing, complete development, nothing left unrehearsed.", apply: "Your edge at 61 is the same — precision and preparation the young guys skip. Start posing practice in month 8 and treat it like a lift." },
  { name: "Albert Beckles", fact: "Battled for the Olympia title in his 50s — runner-up at ~55", thesis: "Longevity is a technique. Decades at the top came from joint-friendly form, moderate loads done perfectly, and never missing.", apply: "Your knee rules aren't limitations — they're the Beckles method. Perfect reps in a pain-free arc, for years." },
  { name: "Ernestine Shepherd", fact: "Began serious training at 56; recognized as the world's oldest competitive female bodybuilder", thesis: "The start date doesn't matter; the daily routine does. Same wake-up, same miles, same meals — determination as a schedule, not a feeling.", apply: "You started this prep at 60. She proves the only question is whether you show up tomorrow morning." },
  { name: "Bill Pearl", fact: "4× Mr. Universe; won at 41 and trained into his 80s", thesis: "Train before the world wakes up, live moderately, and let consistency compound over decades. Strength is a lifestyle with a long horizon.", apply: "Twelve months is one lap of a track you can run for twenty more years. Build habits you'd keep at 80." },
  { name: "Frank Zane", fact: "3× Mr. Olympia at just 190 lb", thesis: "Proportion beats mass. He measured, photographed, and journaled everything — the most documented physique in history won on math and aesthetics.", apply: "Your tape measurements and TRENDS tab are pure Zane. The mirror lies; the numbers don't. Log every two weeks without fail." },
  { name: "Lee Haney", fact: "8× Mr. Olympia — tied for the most ever", thesis: "Stimulate, don't annihilate. Growth comes from precise stress plus full recovery — he retired healthy because he never traded joints for ego.", apply: "This is your RIR system and your deload weeks in four words. The 4th set at RIR 3 grows muscle; the grinder rep at RIR 0 costs a knee." },
  { name: "Dorian Yates", fact: "6× Mr. Olympia", thesis: "Brief, brutal, and written down. Every workout planned and logged before he touched a weight — the logbook was the coach and the contract.", apply: "Every SET DONE you tap is a Yates entry. The log is what makes next Wednesday's leg press 5 lb heavier on purpose." },
  { name: "Arnold Schwarzenegger", fact: "7× Mr. Olympia", thesis: "The mind fails before the body. He visualized the finished physique so vividly that training became sculpting toward something already real.", apply: "See the 61-year-old on stage now — lighting, pose, the whole picture. Then every session is just carving toward it." },
];
const DAILY = [
  "Discipline is remembering what you want twelve months from now.",
  "Character is the fourth set when nobody is counting.",
  "You don't have to feel like it. You have to do it.",
  "The body follows the mind. The mind follows the habit.",
  "Every honest rep is a vote for the person you're becoming.",
  "Motivation shows up sometimes. Discipline shows up daily.",
  "The knee taught you patience. Use it.",
  "Hard days build more than good days.",
  "You're not too old. You're right on time.",
  "The stage is won in the mornings no one sees.",
  "Consistency beats intensity. Intensity plus consistency beats everyone.",
  "Rest is part of the work. Take it like a professional.",
  "The weight doesn't care how you feel. Lift it anyway.",
  "Small jumps, every week, for a year. That's the whole secret.",
  "Your only competition is the man from last Wednesday.",
  "Comfort is a debt. Discipline is how you pay it off.",
  "Show up tired. Leave proud.",
  "The log doesn't lie, and neither should the effort.",
  "A champion at 60 is built from choices at 6 a.m.",
  "Strength is earned in ounces and kept in habits.",
  "When it's heavy, breathe. When it's hard, begin.",
  "You already survived worse than a leg day.",
  "The plan works if you work. There is no other clause.",
  "Grit is quiet. It just keeps showing up.",
  "Nobody drifts to the stage. You row there, one set at a time.",
  "Protect the knee, punish the plan.",
  "Feelings are weather. Discipline is climate.",
  "Do it right, then do it again. That's mastery.",
  "The mirror changes last. Trust the numbers first.",
  "One year of honest work embarrasses ten years of intention.",
  "End every session with nothing left owed.",
];
const MEAS = [
  { id: "weight", label: "Weight", unit: "lb" },
  { id: "bodyfat", label: "Body fat", unit: "%", down: true },
  { id: "neck", label: "Neck", unit: "in" },
  { id: "shoulders", label: "Shoulders", unit: "in" },
  { id: "chest", label: "Chest", unit: "in" },
  { id: "waist", label: "Waist", unit: "in", down: true },
  { id: "hips", label: "Hips", unit: "in", down: true },
  { id: "arm-r", label: "Arm R (flexed)", unit: "in" },
  { id: "arm-l", label: "Arm L (flexed)", unit: "in" },
  { id: "thigh-r", label: "Thigh R", unit: "in" },
  { id: "thigh-l", label: "Thigh L", unit: "in" },
  { id: "calf-r", label: "Calf R", unit: "in" },
  { id: "calf-l", label: "Calf L", unit: "in" },
];
const storageAdapter = {
  _mode: null, // 'bridge' | 'local' | 'memory' — decided by a real write-read probe
  _mem: {},
  async _probe() {
    if (this._mode) return this._mode;
    try {
      if (typeof window !== "undefined" && window.storage) {
        const w = await window.storage.set("__probe__", "1");
        const r = await window.storage.get("__probe__");
        if (r && r.value === "1") { this._mode = "bridge"; return this._mode; }
      }
    } catch (e) { /* bridge present but broken — fall through */ }
    try {
      window.localStorage.setItem("__probe__", "1");
      if (window.localStorage.getItem("__probe__") === "1") { window.localStorage.removeItem("__probe__"); this._mode = "local"; return this._mode; }
    } catch (e) { /* blocked */ }
    this._mode = "memory";
    return this._mode;
  },
  async get(k) {
    const m = await this._probe();
    if (m === "bridge") return window.storage.get(k);
    if (m === "local") { const v = window.localStorage.getItem(k); if (v === null) throw new Error("not found"); return { key: k, value: v }; }
    if (!(k in this._mem)) throw new Error("not found");
    return { key: k, value: this._mem[k] };
  },
  async set(k, v) {
    const m = await this._probe();
    if (m === "bridge") return window.storage.set(k, v);
    if (m === "local") { window.localStorage.setItem(k, v); return { key: k, value: v }; }
    this._mem[k] = v; // session survives in memory, but be honest that it will not persist
    throw new Error("this viewer cannot save — export your CSV before closing");
  },
};
const IN_ARTIFACT = () => typeof window !== "undefined" && !!window.storage;

// ---------- trend math (pure, unit-testable) ----------
const epley = (w, r) => Math.round(w * (1 + r / 30));
const finishedDays = (hist) => Object.entries(hist || {}).filter(([, v]) => v.finished).sort();
const liftSeries = (hist, exId, n = 8) => {
  const out = [];
  finishedDays(hist).forEach(([d, v]) => {
    let best = null;
    Object.entries(v.log || {}).forEach(([k, ss]) => {
      if (k.split("|")[1] !== exId || !ss.done) return;
      const w = parseFloat(ss.weight), r = parseInt(ss.reps, 10) || 10;
      if (!isNaN(w) && (!best || w > best.w)) best = { w, r };
    });
    if (best) out.push({ d, w: best.w, e1: epley(best.w, best.r) });
  });
  return out.slice(-n);
};
const weeklyStats = (hist, start, kg) => {
  const wk = {};
  const bodyKg = kg || DEFAULT_KG;
  finishedDays(hist).forEach(([d, v]) => {
    const n = Math.max(1, Math.floor((new Date(d + "T12:00:00") - new Date(start + "T00:00:00")) / (7 * 864e5)) + 1);
    if (!wk[n]) wk[n] = { sets: 0, tonnage: 0, days: 0, kcal: 0 };
    wk[n].days++;
    Object.entries(v.log || {}).forEach(([k, ss]) => {
      if (!ss.done) return;
      wk[n].sets++;
      const w = parseFloat(ss.weight), r = parseInt(ss.reps, 10);
      if (!isNaN(w) && !isNaN(r)) wk[n].tonnage += w * r;
      const ex = EX_INDEX[k.split("|")[1]];
      if (ex) wk[n].kcal += setKcal(ex, bodyKg);
    });
  });
  return wk;
};
const measSeries = (meas, id) => Object.entries(meas || {}).sort().map(([d, m]) => ({ d, v: parseFloat(m[id]) })).filter((p) => !isNaN(p.v));
const asymSeries = (meas) => Object.entries(meas || {}).sort().map(([d, m]) => {
  const r = parseFloat(m["thigh-r"]), l = parseFloat(m["thigh-l"]);
  return { d, v: (isNaN(r) || isNaN(l)) ? NaN : Math.round(Math.abs(r - l) * 10) / 10 };
}).filter((p) => !isNaN(p.v));
const TrendMath = { epley, liftSeries, weeklyStats, measSeries, asymSeries, metFor, setKcal };
if (typeof window !== "undefined") window.TrendMath = TrendMath;

const card = { background: "#1F252C", border: "1px solid #313A44", borderRadius: 12, padding: 14 };
const panelTitle = { fontSize: 11, letterSpacing: "0.12em", color: "#8B97A3", fontWeight: 800 };
const KEY_LIFTS = [["legpress", "Leg press"], ["inc-press", "Incline press"], ["bench", "Flat bench"], ["rdl", "RDL"], ["w-row", "Row"]];

function Spark({ pts, color = "#E8B93B", h = 36 }) {
  if (!pts || pts.length < 2) return null;
  const vs = pts.map((p) => p.v);
  const min = Math.min(...vs), max = Math.max(...vs), span = (max - min) || 1;
  const W = 260;
  const xy = vs.map((v, i) => ((i / (vs.length - 1)) * W) + "," + (h - 4 - ((v - min) / span) * (h - 8))).join(" ");
  return (
    <svg width="100%" height={h} viewBox={"0 0 " + W + " " + h} preserveAspectRatio="none" style={{ display: "block" }}>
      <polyline points={xy} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
const Empty = ({ msg }) => <div style={{ fontSize: 13, color: "#8B97A3", lineHeight: 1.5 }}>{msg}</div>;

// ---------- coach panel: digest + rule-based fallback ----------
const KNEE_RE = /knee|ache|pain|swell|sore/i;
const digestFor = (st, weekNum) => {
  const lines = ["Week " + weekNum + " of Phase 1 (12-week foundation; deloads wk 6 & 12). Athlete: 60yo Masters bodybuilding prep, right total knee replacement, 6-day split, all 4x sets, RIR-based."];
  Object.entries(st.history || {}).sort().slice(-14).forEach(([d, v]) => {
    if (!v.finished) return;
    const names = (v.sessions || []).map((k) => (PLANS[k] || {}).name).filter(Boolean).join("+");
    const sets = Object.values(v.log || {}).filter((ss) => ss.done).length;
    const tops = [];
    ["legpress", "bench", "inc-press", "rdl"].forEach((id) => {
      let best = null;
      Object.entries(v.log || {}).forEach(([k, ss]) => { if (k.split("|")[1] === id && ss.done) { const w = parseFloat(ss.weight); if (!isNaN(w) && (!best || w > best)) best = w; } });
      if (best) tops.push(id + ":" + best + "lb");
    });
    const kn = Object.values(v.notes || {}).filter((n) => KNEE_RE.test(n));
    lines.push(d + " " + names + " " + sets + " sets done " + tops.join(" ") + (kn.length ? " ATHLETE NOTES: " + kn.join("; ") : ""));
  });
  Object.entries(st.measurements || {}).sort().slice(-4).forEach(([d, m]) => {
    lines.push("MEASUREMENTS " + d + " " + Object.entries(m).map(([k, v]) => k + ":" + v).join(" "));
  });
  return lines.join("\n");
};
const ruleBrief = (st, weekNum) => {
  const days = Object.values(st.history || {}).filter((v) => v.finished).length;
  let kneeFlag = false;
  Object.values(st.history || {}).forEach((v) => Object.values(v.notes || {}).forEach((n) => { if (KNEE_RE.test(n)) kneeFlag = true; }));
  return {
    headline: days < 3 ? "Build the logging habit first" : "Steady — keep stacking honest sessions",
    reads: [{ signal: days + " session(s) banked, week " + weekNum, meaning: days < 3 ? "Too thin to coach from yet — the panel needs a real week of data" : "Enough signal to trend; progression rules apply" }],
    directives: days < 3
      ? ["Log every set this week, even the light ones", "Take your Sunday body measurements — 5 minutes, morning, before food"]
      : ["Where you hit the top of a rep range at target RIR, add the smallest jump available", "Operated-leg lifts progress every OTHER week only — no exceptions"],
    kneeWatch: kneeFlag ? "Knee mentions found in your notes. 48-hour rule: ache lasting past 48h, or any swelling or warmth, means PT before your next leg day." : null,
    fire: "Twelve months is built one honest set at a time.",
  };
};

const STORE_KEY = "phase1-tracker-v2";

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const roundLoad = (n) => Math.round(n / 2.5) * 2.5;

// ---------------- THEME ----------------
const T = {
  bg: "#14181D", surface: "#1F252C", surface2: "#262E37", line: "#313A44",
  text: "#E8ECEF", muted: "#8B97A3", gold: "#E8B93B", green: "#57B87A", red: "#D25B5B",
};
const display = { fontFamily: "Impact, 'Arial Narrow Bold', 'Franklin Gothic Medium', sans-serif", letterSpacing: "0.03em" };

function PlateBar({ total, done, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2, height: 26 }} aria-label={`${done} of ${total} sets done`}>
      <div style={{ width: 14, height: 4, background: "#5A6672", borderRadius: 2 }} />
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: 8, height: i < done ? 24 : 14, borderRadius: 2,
          background: i < done ? color : "transparent",
          border: `2px solid ${i < done ? color : "#3A444F"}`,
          transition: "all 200ms ease",
        }} />
      ))}
      <div style={{ flex: "0 0 22px", height: 4, background: "#5A6672", borderRadius: 2 }} />
    </div>
  );
}

function RestTimer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    setLeft(seconds);
    const t = setInterval(() => setLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  useEffect(() => {
    if (left === 0) {
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) { const ctx = new Ctx(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value = 880; g.gain.value = 0.25; o.start(); o.stop(ctx.currentTime + 0.3); }
      } catch (e) {}
      try { if (navigator.vibrate) navigator.vibrate([200, 100, 200]); } catch (e) {}
      onDone();
    }
  }, [left, onDone]);
  const m = Math.floor(left / 60), s = String(left % 60).padStart(2, "0");
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: T.gold, color: "#14181D", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}>REST</div>
        <div style={{ ...display, fontSize: 34, lineHeight: 1 }}>{m}:{s}</div>
      </div>
      <button onClick={onDone} style={{ background: "#14181D", color: T.gold, border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 15, fontWeight: 700 }}>
        Skip — next set
      </button>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(e) { return { err: e }; }
  render() {
    if (this.state.err) {
      return (
        <div style={{ minHeight: "100vh", background: "#14181D", color: "#E8ECEF", fontFamily: "system-ui", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 12 }}>Something broke — your data is safe.</div>
          <div style={{ fontSize: 14, color: "#8B97A3", marginTop: 8, maxWidth: 300 }}>Your log is stored separately and untouched. Close and reopen the app; if this keeps happening, tell Claude: "{String(this.state.err && this.state.err.message).slice(0, 120)}"</div>
          <button onClick={() => this.setState({ err: null })} style={{ marginTop: 20, background: "#E8B93B", color: "#14181D", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 15, fontWeight: 700 }}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [loaded, setLoaded] = useState(false);
  const [store, setStore] = useState({ startDate: todayKey(), lastWeights: {}, history: {} });
  const [dayIdx, setDayIdx] = useState(new Date().getDay());
  // Today's workout state
  const [sessions, setSessions] = useState(null); // array of plan keys, e.g. ["legsA"] or ["legsA","pump"]
  const [log, setLog] = useState({});   // `${si}|${exId}|${setIdx}` -> {done, weight, reps}
  const [notes, setNotes] = useState({}); // `${si}|${exId}` -> string
  const [roughDay, setRoughDay] = useState(false);
  const [timer, setTimer] = useState(null);
  const [finished, setFinished] = useState(false);
  const [kneeHelp, setKneeHelp] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [sync, setSync] = useState({ status: "idle", msg: "" });
  const [view, setView] = useState("train");
  const [measDraft, setMeasDraft] = useState({});
  const [measSaved, setMeasSaved] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [coach, setCoach] = useState(null);
  const [coachStatus, setCoachStatus] = useState("idle");
  const [storeMsg, setStoreMsg] = useState("");
  const [saveHealth, setSaveHealth] = useState(null); // {ok, time}
  const [confirmReset, setConfirmReset] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [showUtils, setShowUtils] = useState(false);
  const remoteDraft = useRef({});
  const flushTimer = useRef(null);
  const stateRef = useRef({});
  stateRef.current = { store, sessions, log, notes, finished };
  const dateRef = useRef(todayKey()); // pinned at mount — a session crossing midnight stays on its start date

  // ---------- load ----------
  useEffect(() => {
    (async () => {
      dateRef.current = todayKey();
      let base = { startDate: todayKey(), lastWeights: {}, history: {} };
      try {
        const res = await storageAdapter.get(STORE_KEY);
        if (res && res.value) base = JSON.parse(res.value);
      } catch (e) { /* first run */ }
      // one-time migration: import any history from the original app version
      if (!Object.keys(base.history).length) {
        try {
          const old = await storageAdapter.get("phase1-tracker");
          if (old && old.value) {
            const legacy = JSON.parse(old.value);
            const nameKey = { "Push": "push", "Pull": "pull", "Legs A": "legsA", "Upper": "upper", "Legs B": "legsB", "Pump": "pump" };
            Object.entries(legacy.history || {}).forEach(([d, day]) => {
              const pk = nameKey[day.day]; if (!pk) return;
              const lg = {};
              Object.entries(day.session || {}).forEach(([k, v]) => {
                const ci = k.lastIndexOf(":"); if (ci < 0) return;
                lg[`0|${k.slice(0, ci)}|${k.slice(ci + 1)}`] = { weight: v.weight, reps: v.reps, done: !!v.done };
              });
              base.history[d] = { sessions: [pk], log: lg, notes: {}, finished: !!day.finished };
            });
            base.lastWeights = { ...(legacy.lastWeights || {}), ...base.lastWeights };
            if (Object.keys(base.history).length) storageAdapter.set(STORE_KEY, JSON.stringify(base)).catch(() => {});
          }
        } catch (e) { /* no legacy data — normal */ }
      }
      setStore(base);
      const today = base.history[todayKey()];
      if (today) {
        setSessions(today.sessions || [DAY_TO_PLAN[new Date().getDay()]]);
        setLog(today.log || {});
        setNotes(today.notes || {});
        setFinished(!!today.finished);
      } else {
        setSessions([DAY_TO_PLAN[new Date().getDay()]]);
      }
      setMeasDraft((base.measurements || {})[todayKey()] || {});
      setCoach(base.coach || null);
      remoteDraft.current = { url: (base.remote || {}).url || "", token: (base.remote || {}).token || "" };
      // recovery sync: a finished day that never made it to Drive gets pushed now
      const newestFinished = Object.entries(base.history).filter(([, v]) => v.finished).map(([d]) => d).sort().pop();
      if (newestFinished && (!base.lastSync || newestFinished > base.lastSync)) syncToDrive(base);
      setLoaded(true);
      pullMerge(base); // boot-time restore from the durable store (fire-and-forget)
    })();
  }, []);

  // ---------- save ----------
  const saveDay = useCallback(async (overrides = {}) => {
    const cur = stateRef.current;
    const dayData = {
      sessions: overrides.sessions ?? cur.sessions,
      log: overrides.log ?? cur.log,
      notes: overrides.notes ?? cur.notes,
      finished: overrides.finished ?? cur.finished,
    };
    const next = {
      ...cur.store,
      lastWeights: overrides.lastWeights ?? cur.store.lastWeights,
      history: { ...cur.store.history, [dateRef.current]: dayData },
      outbox: overrides.addEvents
        ? [...(cur.store.outbox || []).filter((e) => !overrides.addEvents.some((n) => n.id === e.id)), ...overrides.addEvents]
        : (cur.store.outbox || []),
    };
    setStore(next);
    try {
      await storageAdapter.set(STORE_KEY, JSON.stringify(next));
      // verify the write actually landed — read it back
      const check = await storageAdapter.get(STORE_KEY);
      if (!check || !check.value || check.value.length < 10) throw new Error("write not persisted");
      setSaveHealth({ ok: true, time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
    }
    catch (e) {
      console.error("Save failed", e);
      setSaveHealth({ ok: false, time: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) });
      setSync({ status: "error", msg: "SAVING IS FAILING on this device — use the export panel now to copy your CSV, and switch to the standalone app" });
    }
    if (overrides.addEvents) scheduleFlush();
    return next;
  }, []);

  // ---------- Google Drive export ----------
  // NOTE: the artifact fetch bridge structured-clones options — AbortSignal is not cloneable,
  // so timeouts race the promise instead of aborting the request
  const fetchWithTimeout = (url, opts, ms = 30000) =>
    Promise.race([
      fetch(url, opts),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timed out")), ms)),
    ]);

  const buildCSV = (st) => {
    const rows = [["date", "session", "exercise", "set", "weight_lb", "reps", "done", "feedback", "time"]];
    Object.entries(st.history).sort().forEach(([date, day]) => {
      (day.sessions || []).forEach((pk, si) => {
        const p = PLANS[pk];
        if (!p) return;
        p.exercises.forEach((ex) => {
          const note = (day.notes || {})[`${si}|${ex.id}`] || "";
          Array.from({ length: ex.sets }).forEach((_, sx) => {
            const s = (day.log || {})[`${si}|${ex.id}|${sx}`] || {};
            rows.push([date, p.name, ex.name, sx + 1, s.weight || "", s.reps || "", s.done ? "1" : "0", sx === 0 ? note : "", s.t ? new Date(s.t).toISOString() : ""]);
          });
        });
      });
    });
    Object.entries(st.measurements || {}).sort().forEach(([date, m]) => {
      Object.entries(m).forEach(([id, v]) => rows.push([date, "Body", id, 1, v, "", "1", "", ""]));
    });
    return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  };

  const syncToDrive = async (st) => {
    setSync({ status: "syncing", msg: "" });
    try {
      const csv = buildCSV(st || stateRef.current.store);
      const fname = `Phase1-Training-Log-${todayKey()}.csv`;
      const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Create a file in my Google Drive named "${fname}" with mime type text/csv containing exactly the CSV below. Do it now without asking questions, then reply with only the word OK.\n\n${csv}`,
          }],
          mcp_servers: [{ type: "url", url: "https://drivemcp.googleapis.com/mcp/v1", name: "google-drive" }],
        }),
      });
      let data;
      try { data = await response.json(); }
      catch (e) { throw new Error("API returned non-JSON (HTTP " + response.status + ")"); }
      if (data.error) throw new Error(((typeof data.error === "string" ? data.error : data.error.message) || "API error").slice(0, 140) + " [HTTP " + response.status + "]");
      const toolRan = (data.content || []).some((b) => b.type === "mcp_tool_use");
      if (!toolRan) throw new Error("Drive tool was not invoked — check your Google Drive connection in Settings");
      setSync({ status: "ok", msg: fname });
      const st2 = { ...(st || stateRef.current.store), lastSync: todayKey() };
      setStore(st2);
      storageAdapter.set(STORE_KEY, JSON.stringify(st2)).catch(() => {});
    } catch (e) {
      setSync({ status: "error", msg: (e.name === "AbortError" ? "timed out" : e.message) || "Sync failed" });
    }
  };

  const isToday = dayIdx === new Date().getDay();
  const start = new Date(store.startDate + "T00:00:00");
  const weekNum = Math.max(1, Math.floor((new Date() - start) / (7 * 864e5)) + 1);
  const deload = weekNum === 6 || weekNum === 12;

  // sessions being displayed: today → live sessions; other days → preview of that day's default plan
  const viewSessions = isToday ? (sessions || []) : [DAY_TO_PLAN[dayIdx]];
  const headerPlan = PLANS[viewSessions[0] || "rest"];

  const wSeries = measSeries(store.measurements, "weight");
  const bodyKg = wSeries.length ? wSeries[wSeries.length - 1].v * 0.4536 : DEFAULT_KG;
  const setsFor = (si, planKey) => {
    const p = PLANS[planKey];
    let total = 0, done = 0, kcal = 0;
    p.exercises.forEach((e) => {
      total += e.sets;
      const dn = Array.from({ length: e.sets }).filter((_, i) => log[`${si}|${e.id}|${i}`]?.done).length;
      done += dn;
      kcal += setKcal(e, bodyKg) * dn;
    });
    return { total, done, kcal };
  };
  const totals = viewSessions.reduce((acc, k, si) => {
    const r = setsFor(si, k);
    return { total: acc.total + r.total, done: acc.done + r.done, kcal: acc.kcal + r.kcal };
  }, { total: 0, done: 0, kcal: 0 });
  const allDone = totals.total > 0 && totals.done === totals.total;
  let nextKey = null;
  viewSessions.forEach((pk, si) => {
    (PLANS[pk].exercises || []).forEach((ex) => {
      if (nextKey) return;
      const dn = Array.from({ length: ex.sets }).filter((_, i) => log[`${si}|${ex.id}|${i}`]?.done).length;
      if (dn < ex.sets) nextKey = si + "|" + ex.id;
    });
  });

  const updateSet = (si, exId, setIdx, patch) => {
    setLog((l) => ({ ...l, [`${si}|${exId}|${setIdx}`]: { ...(l[`${si}|${exId}|${setIdx}`] || {}), ...patch } }));
  };

  const checkSet = (si, ex, setIdx) => {
    const k = `${si}|${ex.id}|${setIdx}`;
    const cur = log[k] || {};
    const nowDone = !cur.done;
    const entry = { ...cur, done: nowDone };
    if (nowDone) {
      // the weight you lifted is recorded even if you left the field blank:
      // inherit from an earlier set this session, else your last logged weight
      const prior = log[`${si}|${ex.id}|${Math.max(0, setIdx - 1)}`] || {};
      const eff = cur.weight || prior.weight || log[`${si}|${ex.id}|0`]?.weight || store.lastWeights[ex.id] || "";
      if (!cur.weight && eff) entry.weight = String(eff);
      entry.t = Date.now();
    }
    const nextLog = { ...log, [k]: entry };
    setLog(nextLog);
    const ev = [{ id: dateRef.current + "|" + si + "|" + ex.id + "|" + setIdx, type: "set", date: dateRef.current, exercise: ex.name, set: setIdx + 1, weight: entry.weight || "", reps: entry.reps || "", done: nowDone, t: Date.now() }];
    if (nowDone) {
      if (ex.rest > 0) setTimer(ex.rest);
      const w = entry.weight;
      const lw = w ? { ...store.lastWeights, [ex.id]: w } : store.lastWeights;
      saveDay({ log: nextLog, lastWeights: lw, addEvents: ev });
    } else {
      saveDay({ log: nextLog, addEvents: ev });
    }
  };

  const addSession = (planKey) => {
    const next = [...(sessions || []), planKey];
    setSessions(next);
    setShowAdd(false);
    setFinished(false);
    saveDay({ sessions: next, finished: false });
  };

  const removeSession = (si) => {
    if (si === 0) return;
    const next = sessions.filter((_, i) => i !== si);
    const remap = (obj) => {
      const out = {};
      Object.entries(obj).forEach(([k, v]) => {
        const bar = k.indexOf("|");
        const idx = parseInt(k.slice(0, bar), 10);
        if (idx === si) return; // drop the removed session's entries
        out[`${idx > si ? idx - 1 : idx}${k.slice(bar)}`] = v; // reindex later sessions
      });
      return out;
    };
    const cleanLog = remap(log);
    const cleanNotes = remap(notes);
    setSessions(next); setLog(cleanLog); setNotes(cleanNotes);
    saveDay({ sessions: next, log: cleanLog, notes: cleanNotes });
  };

  // ---------- Restore from Google Drive (spreadsheet = source of truth) ----------
  const parseCSV = (text) => {
    const rows = []; let row = [], cell = "", inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') inQ = false;
        else cell += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
      else cell += c;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }
    return rows.filter((r) => r.length > 1);
  };

  const restoreFromDrive = async () => {
    setSync({ status: "syncing", msg: "restoring" });
    try {
      const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: 'Search my Google Drive for files whose name starts with "Phase1-Training-Log-". Read the content of the one with the most recent date in its filename and reply with ONLY the raw CSV content — no commentary, no code fences, no explanation.',
          }],
          mcp_servers: [{ type: "url", url: "https://drivemcp.googleapis.com/mcp/v1", name: "google-drive" }],
        }),
      });
      let data;
      try { data = await response.json(); }
      catch (e) { throw new Error("API returned non-JSON (HTTP " + response.status + ")"); }
      if (data.error) throw new Error(((typeof data.error === "string" ? data.error : data.error.message) || "API error").slice(0, 140) + " [HTTP " + response.status + "]");
      // CSV may arrive in the assistant's text OR inside MCP tool result blocks — scan both
      const chunks = [];
      (data.content || []).forEach((b) => {
        if (b.type === "text" && b.text) chunks.push(b.text);
        if (b.type === "mcp_tool_result" && Array.isArray(b.content)) b.content.forEach((c) => { if (c && c.text) chunks.push(c.text); });
      });
      let text = null;
      const headerRe = /"?date"?\s*,\s*"?session"?/i;
      for (const c of chunks) {
        const cleaned = c.replace(/```csv|```/g, "");
        const m = cleaned.search(headerRe);
        if (m !== -1) { text = cleaned.slice(m).trim(); break; }
      }
      if (!text) {
        if (!chunks.length) throw new Error("Drive returned nothing — reconnect Google Drive and try again");
        throw new Error("No training log found in Drive");
      }
      const rows = parseCSV(text).slice(1); // skip header
      const nameToKey = Object.fromEntries(Object.entries(PLANS).map(([k, p]) => [p.name, k]));
      const idByName = {};
      Object.entries(PLANS).forEach(([k, p]) => { idByName[k] = Object.fromEntries(p.exercises.map((e) => [e.name, e.id])); });
      const history = {};
      const seen = {}; // date -> sessionName -> si
      const meas = {};
      rows.forEach((r) => {
        const [date, sName, exName, setN, weight, reps, done, feedback, time] = r;
        if (sName === "Body") { if (!meas[date]) meas[date] = {}; if (weight) meas[date][exName] = weight; return; }
        const pk = nameToKey[sName]; if (!pk) return;
        if (!history[date]) { history[date] = { sessions: [], log: {}, notes: {}, finished: true }; seen[date] = {}; }
        if (!(sName in seen[date])) { seen[date][sName] = history[date].sessions.length; history[date].sessions.push(pk); }
        const si = seen[date][sName];
        const exId = (idByName[pk] || {})[exName]; if (!exId) return;
        const sx = parseInt(setN, 10) - 1;
        if (weight || reps || done === "1") { const entry = { weight, reps, done: done === "1" }; if (time) { const tt = Date.parse(time); if (!isNaN(tt)) entry.t = tt; } history[date].log[`${si}|${exId}|${sx}`] = entry; }
        if (feedback) history[date].notes[`${si}|${exId}`] = feedback;
      });
      // local today wins over restored today
      const tk = dateRef.current;
      const merged = { ...history };
      if (stateRef.current.store.history[tk] || (sessions && Object.keys(log).length)) {
        merged[tk] = stateRef.current.store.history[tk] || { sessions, log, notes, finished: false };
      }
      const mergedMeas = { ...meas };
      Object.entries(stateRef.current.store.measurements || {}).forEach(([d, m]) => { mergedMeas[d] = { ...(mergedMeas[d] || {}), ...m }; });
      const next = { ...stateRef.current.store, history: merged, measurements: mergedMeas };
      setStore(next);
      await storageAdapter.set(STORE_KEY, JSON.stringify(next));
      setMeasDraft(mergedMeas[dateRef.current] || {});
      const today = merged[tk];
      if (today) { setSessions(today.sessions); setLog(today.log || {}); setNotes(today.notes || {}); setFinished(!!today.finished); }
      setSync({ status: "ok", msg: `restored ${Object.keys(history).length} day(s) from Drive` });
    } catch (e) {
      setSync({ status: "error", msg: e.message || "Restore failed" });
    }
  };

  // ---------- durable store sync engine: local-first, append-only, fire-and-forget ----------
  const flushOutbox = (st) => {
    const S = st || stateRef.current.store;
    if (!S.remote || !S.remote.url || !(S.outbox || []).length) return;
    const payload = { token: S.remote.token || "", op: "push", events: S.outbox, snapshot: { startDate: S.startDate, lastWeights: S.lastWeights, history: S.history, measurements: S.measurements } };
    fetchWithTimeout(S.remote.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
      .then((r) => r.json())
      .then((res) => {
        if (!res || !res.ok) return;
        const acked = new Set(res.acked || []);
        const cur = stateRef.current.store;
        const nb = (cur.outbox || []).filter((e) => !acked.has(e.id));
        const next = { ...cur, outbox: nb };
        setStore(next);
        setStoreMsg(nb.length ? nb.length + " queued" : "store in sync");
        storageAdapter.set(STORE_KEY, JSON.stringify(next)).catch(() => {});
      })
      .catch(() => { setStoreMsg((stateRef.current.store.outbox || []).length + " queued — will retry"); });
  };
  const scheduleFlush = () => { clearTimeout(flushTimer.current); flushTimer.current = setTimeout(() => flushOutbox(), 800); };

  const pullMerge = async (st) => {
    const S = st || stateRef.current.store;
    if (!S.remote || !S.remote.url) return;
    try {
      const r = await fetchWithTimeout(S.remote.url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ token: S.remote.token || "", op: "pull" }) });
      const res = await r.json();
      if (!res || !res.ok || !res.snapshot) return;
      const locNow = stateRef.current.store.remote ? stateRef.current.store : S; // survive boot-time stale ref
      const merged = mergeSnapshots(locNow, res.snapshot);
      setStore(merged);
      storageAdapter.set(STORE_KEY, JSON.stringify(merged)).catch(() => {});
      const today = merged.history[dateRef.current];
      if (today) { setSessions(today.sessions || [DAY_TO_PLAN[new Date().getDay()]]); setLog(today.log || {}); setNotes(today.notes || {}); setFinished(!!today.finished); }
      setMeasDraft((merged.measurements || {})[dateRef.current] || {});
      setStoreMsg("history restored from store");
    } catch (e) { setStoreMsg("store unreachable — training continues on this device; will retry"); }
  };

  const saveRemote = async () => {
    const url = (remoteDraft.current.url || "").trim();
    const token = (remoteDraft.current.token || "").trim();
    if (!url) { setStoreMsg("no endpoint yet — paste your Apps Script /exec URL (5-min setup: datastore guide)"); return; }
    if (url.indexOf("https://script.google.com/") !== 0 || url.indexOf("/exec") === -1) {
      setStoreMsg("that doesn't look like an Apps Script URL — it should start with https://script.google.com/ and end in /exec");
      return;
    }
    const cur = stateRef.current.store;
    const next = { ...cur, remote: { url, token } };
    setStore(next);
    setStoreMsg("connecting…");
    try { await storageAdapter.set(STORE_KEY, JSON.stringify(next)); } catch (e) {}
    try {
      const r = await fetchWithTimeout(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ token, op: "pull" }) }, 15000);
      const res = await r.json();
      if (res && res.ok) {
        setStoreMsg(res.snapshot ? "store connected ✓ — history found, restoring…" : "store connected ✓ — vault is ready and empty");
        flushOutbox(next);
        pullMerge(next);
      } else {
        setStoreMsg("store reachable but said no: " + ((res && res.error) || "token mismatch — check it matches line 1 of the script"));
      }
    } catch (e) {
      setStoreMsg("couldn't reach the store: " + ((e && e.message) || "check the URL, and that the script is deployed as Web app / access: Anyone"));
    }
  };

  const prevMeasFor = (id) => {
    const dates = Object.keys(store.measurements || {}).filter((d) => d < dateRef.current).sort();
    for (let i = dates.length - 1; i >= 0; i--) {
      const v = (store.measurements[dates[i]] || {})[id];
      if (v) return { v, d: dates[i] };
    }
    return null;
  };

  const saveCoach = async (brief) => {
    const next = { ...stateRef.current.store, coach: { date: todayKey(), brief } };
    setStore(next);
    setCoach(next.coach);
    try { await storageAdapter.set(STORE_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const getCoaching = async () => {
    setCoachStatus("loading");
    try {
      const st = stateRef.current.store;
      const headers = { "Content-Type": "application/json" };
      if (!IN_ARTIFACT()) {
        const key = window.localStorage.getItem("anthropic-key");
        if (!key) { await saveCoach(ruleBrief(st, weekNum)); setCoachStatus("rule"); return; }
        headers["x-api-key"] = key;
        headers["anthropic-version"] = "2023-06-01";
        headers["anthropic-dangerous-direct-browser-access"] = "true";
      }
      const sys = 'You are a coaching panel of three elite voices reviewing a Masters bodybuilding athlete: an IFBB-level Masters prep coach (periodization and load calls), a post-TKR physical therapist (joint safety — this voice can veto), and a mindset coach (motivation calibrated to the data, never empty hype). Synthesize all three into one brief. Respond with ONLY a JSON object, no fences, no prose: {"headline": string, "reads": [{"signal": string, "meaning": string}], "directives": [string], "kneeWatch": string or null, "fire": string}. Rules: every directive must reference actual numbers from the data; never add knee-loaded volume, prescribe extreme dieting, or override the programmed deloads; if the notes mention knee symptoms, kneeWatch is mandatory and conservative; if the data is thin, say so honestly and prescribe the logging habit; motivation must never encourage training through joint pain.';
      const body = { model: "claude-sonnet-4-6", max_tokens: 1000, messages: [{ role: "user", content: sys + "\n\nATHLETE DATA:\n" + digestFor(st, weekNum) }] };
      const r = await fetchWithTimeout("https://api.anthropic.com/v1/messages", { method: "POST", headers, body: JSON.stringify(body) });
      let data;
      try { data = await r.json(); } catch (e) { throw new Error("non-JSON reply (HTTP " + r.status + ")"); }
      if (data.error) throw new Error(((typeof data.error === "string" ? data.error : data.error.message) || "API error").slice(0, 120));
      const txt = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      const a = txt.indexOf("{"), z = txt.lastIndexOf("}");
      if (a < 0 || z <= a) throw new Error("no brief in reply");
      const brief = JSON.parse(txt.slice(a, z + 1));
      if (!brief.headline || !Array.isArray(brief.directives)) throw new Error("brief malformed");
      await saveCoach(brief);
      setCoachStatus("ok");
    } catch (e) {
      if (!stateRef.current.store.coach) {
        await saveCoach(ruleBrief(stateRef.current.store, weekNum));
        setCoachStatus("rule:" + (e.message || "failed"));
      } else {
        setCoachStatus("error:" + (e.message || "failed"));
      }
    }
  };

  const saveMeasurements = async () => {
    const entries = Object.fromEntries(Object.entries(measDraft).filter(([, v]) => String(v).trim() !== ""));
    if (!Object.keys(entries).length) return;
    const cur = stateRef.current.store;
    const mev = Object.entries(entries).map(([fid, v]) => ({ id: "meas|" + dateRef.current + "|" + fid, type: "meas", date: dateRef.current, exercise: fid, weight: v, t: Date.now() }));
    const next = { ...cur, measurements: { ...(cur.measurements || {}), [dateRef.current]: { ...((cur.measurements || {})[dateRef.current] || {}), ...entries } }, outbox: [...(cur.outbox || []).filter((e) => !mev.some((n) => n.id === e.id)), ...mev] };
    setStore(next);
    setMeasSaved(true);
    scheduleFlush();
    try { await storageAdapter.set(STORE_KEY, JSON.stringify(next)); }
    catch (e) { setSync({ status: "error", msg: "local save failed — data may not persist" }); }
    syncToDrive(next);
  };

  const restoreSmart = async () => {
    if (IN_ARTIFACT()) return restoreFromDrive();
    const S = stateRef.current.store;
    if (!S.remote || !S.remote.url) {
      setSync({ status: "error", msg: "no store connected yet — open ⚙ → export → DURABLE STORE and do the 5-minute Sheet setup; that's where restore pulls from" });
      return;
    }
    setSync({ status: "syncing", msg: "restoring" });
    await pullMerge();
    setSync({ status: "ok", msg: "restore ran — see store status under ⚙ → export" });
  };

  const finishWorkout = async () => {
    setFinished(true);
    setTimer(null);
    const next = await saveDay({ finished: true, addEvents: [{ id: "finish|" + dateRef.current, type: "finish", date: dateRef.current, weight: String(Math.round(totals.kcal)), reps: "kcal", t: Date.now() }] });
    syncToDrive(next);
  };

  const resetProgram = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3500); return; }
    setConfirmReset(false);
    const fresh = { startDate: todayKey(), lastWeights: store.lastWeights, history: {}, measurements: store.measurements || {} };
    setStore(fresh);
    setSessions([DAY_TO_PLAN[new Date().getDay()]]);
    setLog({}); setNotes({}); setFinished(false);
    setSync({ status: "idle", msg: "" });
    try { storageAdapter.set(STORE_KEY, JSON.stringify(fresh)).catch(() => {}); } catch (e) {}
  };

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { label: DAY_NAMES[d.getDay()][0], done: !!store.history[k]?.finished, isRest: d.getDay() === 0 };
  });
  const totalBanked = Object.values(store.history).filter((h) => h.finished).length;

  if (!loaded)
    return <div style={{ minHeight: "100vh", background: T.bg, color: T.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui" }}>Loading your log…</div>;

  // ---------- FINISHED ----------
  if (finished && isToday) {
    const names = (sessions || []).map((k) => PLANS[k].name).join(" + ");
    const dayTonnage = Object.values(log).reduce((a, ss) => { const w = parseFloat(ss.weight), r = parseInt(ss.reps, 10); return ss.done && !isNaN(w) && !isNaN(r) ? a + w * r : a; }, 0);
    return (
      <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
        <div style={{ ...display, fontSize: 64, color: headerPlan.color, lineHeight: 1 }}>DONE.</div>
        <div style={{ marginTop: 12, fontSize: 15, color: T.muted, letterSpacing: "0.04em" }}>{names}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "center", flexWrap: "wrap" }}>
          <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 18px", minWidth: 84 }}>
            <div style={{ ...display, fontSize: 26, color: T.text, lineHeight: 1 }}>{totals.done}<span style={{ fontSize: 15, color: T.muted }}>/{totals.total}</span></div>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: T.muted, fontWeight: 800, marginTop: 5 }}>SETS</div>
          </div>
          {dayTonnage > 0 && (
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 18px", minWidth: 84 }}>
              <div style={{ ...display, fontSize: 26, color: T.gold, lineHeight: 1 }}>{Math.round(dayTonnage).toLocaleString()}</div>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: T.muted, fontWeight: 800, marginTop: 5 }}>LB MOVED</div>
            </div>
          )}
          {totals.kcal > 0 && (
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: "12px 18px", minWidth: 84 }}>
              <div style={{ ...display, fontSize: 26, color: T.green, lineHeight: 1 }}>{Math.round(totals.kcal)}</div>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: T.muted, fontWeight: 800, marginTop: 5 }}>≈ KCAL</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: 6, color: T.muted, fontSize: 14 }}>Week {weekNum} · {totalBanked} workouts banked total</div>
        <div style={{ marginTop: 28, display: "flex", gap: 6 }}>
          {last7.map((d, i) => (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: d.done ? T.green : T.surface, color: d.done ? "#14181D" : d.isRest ? "#3A444F" : T.muted, border: `1px solid ${T.line}` }}>{d.label}</div>
          ))}
        </div>
        <div style={{ marginTop: 28, color: T.muted, fontSize: 14, maxWidth: 320 }}>Protein within the hour. 10 min knee mobility tonight.</div>
        <div style={{ marginTop: 16, fontSize: 13, minHeight: 18, color: sync.status === "ok" ? T.green : sync.status === "error" ? T.red : T.muted }}>
          {sync.status === "syncing" && "Syncing full history to Google Drive…"}
          {sync.status === "ok" && `Saved to Drive ✓ ${sync.msg}`}
          {sync.status === "error" && `Drive sync failed — ${sync.msg}`}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => setFinished(false)} style={{ background: "transparent", color: T.muted, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 16px", fontSize: 14 }}>Reopen session</button>
          <button onClick={() => { setFinished(false); setShowAdd(true); }} style={{ background: T.surface, color: T.gold, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 700 }}>+ Add a session</button>
          {sync.status !== "syncing" && (
            <button onClick={() => syncToDrive()} style={{ background: T.surface, color: T.green, border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 16px", fontSize: 14, fontWeight: 700 }}>
              {sync.status === "error" ? "Retry Drive sync" : "Sync to Drive again"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ---------- MAIN ----------
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: timer !== null ? 110 : 40 }}>
      <div style={{ padding: "20px 16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: T.muted, fontWeight: 700 }}>
            PHASE 1 · WEEK {weekNum} OF 12
            {saveHealth && (
              <span style={{ marginLeft: 8, color: saveHealth.ok ? T.green : T.red, fontWeight: 800 }}>
                {saveHealth.ok ? "SAVED " + saveHealth.time + " ✓" : "NOT SAVING ✗"}
              </span>
            )}
          </div>
          <button onClick={() => setShowUtils(!showUtils)} style={{ background: showUtils ? T.surface : "none", border: `1px solid ${showUtils ? T.line : "transparent"}`, borderRadius: 8, color: T.muted, fontSize: 15, padding: "2px 10px", lineHeight: 1.3 }}>⚙</button>
        </div>
        {showUtils && (
          <div style={{ display: "flex", gap: 14, marginTop: 8, alignItems: "center" }}>
            <button onClick={() => setShowExport(!showExport)} style={{ background: "none", border: "none", color: T.gold, fontSize: 12, fontWeight: 700 }}>export</button>
            <button onClick={restoreSmart} style={{ background: "none", border: "none", color: T.green, fontSize: 12, fontWeight: 700 }}>{IN_ARTIFACT() ? "restore from Drive" : "restore"}</button>
            <button onClick={resetProgram} style={{ background: confirmReset ? T.red : "none", border: "none", borderRadius: 6, padding: confirmReset ? "3px 8px" : 0, color: confirmReset ? "#fff" : "#4A545F", fontSize: 12, fontWeight: confirmReset ? 800 : 400 }}>{confirmReset ? "tap again to erase history" : "reset week 1"}</button>
          </div>
        )}
        {sync.status !== "idle" && !finished && (
          <div style={{ marginTop: 6, fontSize: 12, color: sync.status === "ok" ? T.green : sync.status === "error" ? T.red : T.muted }}>
            {sync.status === "syncing" && (sync.msg === "restoring" ? "Restoring from Google Drive…" : "Syncing to Google Drive…")}
            {sync.status === "ok" && `✓ ${sync.msg}`}
            {sync.status === "error" && `✗ ${sync.msg}`}
          </div>
        )}
        {deload && (
          <div style={{ marginTop: 10, background: T.gold, color: "#14181D", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontWeight: 700 }}>
            DELOAD WEEK — 60% of your loads, 2 sets per exercise. Non-negotiable.
          </div>
        )}
        {showExport && (
          <div style={{ marginTop: 10, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: 12 }}>
            <div style={{ fontSize: 13, color: T.text, fontWeight: 700, marginBottom: 6 }}>Your full log as CSV</div>
            <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 8, lineHeight: 1.5 }}>Tap the box, Select All, Copy — then paste it to Claude in chat to back it up to Drive or run analysis. Works even when sync doesn't.</div>
            <textarea readOnly value={buildCSV(store)} onFocus={(e) => e.target.select()}
              style={{ width: "100%", boxSizing: "border-box", height: 120, background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, fontSize: 11, fontFamily: "monospace", padding: 8 }} />
            <div style={{ marginTop: 12, borderTop: `1px solid ${T.line}`, paddingTop: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", color: T.muted }}>DURABLE STORE — Google Sheet endpoint</div>
              <input placeholder="https://script.google.com/macros/s/…/exec" defaultValue={(store.remote || {}).url || ""}
                onChange={(e) => { remoteDraft.current.url = e.target.value; }}
                style={{ marginTop: 8, width: "100%", boxSizing: "border-box", background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "10px", fontSize: 13 }} />
              <input placeholder="secret token" defaultValue={(store.remote || {}).token || ""}
                onChange={(e) => { remoteDraft.current.token = e.target.value; }}
                style={{ marginTop: 6, width: "100%", boxSizing: "border-box", background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "10px", fontSize: 13 }} />
              <button onClick={saveRemote} style={{ marginTop: 8, width: "100%", padding: "12px", borderRadius: 8, fontSize: 14, fontWeight: 800, background: T.green, color: "#14181D", border: "none" }}>CONNECT & SYNC</button>
              <div style={{ marginTop: 6, fontSize: 12, color: T.muted }}>
                {(store.outbox || []).length ? (store.outbox || []).length + " event(s) queued · " : ""}{storeMsg || (store.remote && store.remote.url ? "store connected" : "no store connected — history relies on this device + exports")}
              </div>
            </div>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
          <h1 style={{ ...display, fontSize: 52, margin: "10px 0 2px", color: headerPlan.color, textTransform: "uppercase", lineHeight: 0.95 }}>
            {viewSessions.map((k) => PLANS[k].name).join(" + ")}
          </h1>
          {view === "train" && totals.total > 0 && (
            <div style={{ flex: "0 0 auto", background: allDone ? T.green : T.surface, color: allDone ? "#14181D" : T.text, border: `1px solid ${allDone ? T.green : T.line}`, borderRadius: 999, padding: "6px 12px", fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
              {totals.done}/{totals.total} sets{totals.kcal > 0 ? " · ≈" + Math.round(totals.kcal) + " kcal" : ""}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, letterSpacing: "0.12em", color: T.muted, fontWeight: 600 }}>{headerPlan.tag}</div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#9AA6B2", fontStyle: "italic", lineHeight: 1.5 }}>
          {'“' + DAILY[Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5) % DAILY.length] + '”'}
        </div>
        {!isToday && <div style={{ marginTop: 8, fontSize: 13, color: T.gold }}>Previewing {DAY_NAMES[dayIdx]} — logging is for today only</div>}
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", gap: 8, padding: "14px 16px 0" }}>
        {["train", "body", "trends", "coach", "inspire"].map((v) => (
          <button key={v} onClick={() => { setView(v); setMeasSaved(false); }} style={{ flex: 1, padding: "10px 4px", borderRadius: 10, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.06em", background: view === v ? T.text : T.surface, color: view === v ? "#14181D" : T.muted, border: `1px solid ${T.line}` }}>
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {view === "body" && (
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, marginBottom: 14 }}>
            Measure every 2 weeks — morning, before food, same spots. Arms and calves flexed, waist relaxed. Blank fields keep their last value.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MEAS.map((f) => {
              const prev = prevMeasFor(f.id);
              const curV = measDraft[f.id] || "";
              const delta = prev && curV !== "" ? parseFloat(curV) - parseFloat(prev.v) : null;
              const good = delta !== null && !isNaN(delta) && (f.down ? delta < 0 : delta > 0);
              return (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{f.label}</div>
                    {prev && <div style={{ fontSize: 12, color: T.muted }}>Last: {prev.v} {f.unit} · {prev.d}</div>}
                  </div>
                  {delta !== null && !isNaN(delta) && delta !== 0 && (
                    <div style={{ fontSize: 13, fontWeight: 700, color: good ? T.green : T.gold }}>{delta > 0 ? "+" : ""}{Math.round(delta * 10) / 10}</div>
                  )}
                  <input inputMode="decimal" placeholder={prev ? String(prev.v) : f.unit} value={curV}
                    onChange={(e) => { setMeasSaved(false); setMeasDraft((m) => ({ ...m, [f.id]: e.target.value })); }}
                    style={{ width: 84, background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "12px 10px", fontSize: 16, textAlign: "right" }} />
                </div>
              );
            })}
          </div>
          {(() => {
            const tr = parseFloat(measDraft["thigh-r"] || (prevMeasFor("thigh-r") || {}).v);
            const tl = parseFloat(measDraft["thigh-l"] || (prevMeasFor("thigh-l") || {}).v);
            if (!isNaN(tr) && !isNaN(tl) && Math.abs(tr - tl) >= 0.5) return (
              <div style={{ marginTop: 12, background: T.surface2, border: `1px solid ${T.gold}`, borderRadius: 10, padding: 12, fontSize: 13.5, lineHeight: 1.5 }}>
                <strong style={{ color: T.gold }}>Thigh asymmetry: {Math.round(Math.abs(tr - tl) * 10) / 10}"</strong> — common post-TKR. The single-leg work on Legs A is targeting this; tracked in the weekly review.
              </div>
            );
            return null;
          })()}
          <button onClick={saveMeasurements} style={{ marginTop: 14, width: "100%", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 800, background: measSaved ? T.green : T.gold, color: "#14181D", border: "none" }}>
            {measSaved ? "SAVED ✓ — SYNCING TO DRIVE" : "SAVE MEASUREMENTS"}
          </button>
        </div>
      )}


      {view === "trends" && (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card}>
            <div style={panelTitle}>STRENGTH — KEY LIFTS</div>
            {(() => {
              const rows = KEY_LIFTS.map(([id, label]) => [label, liftSeries(store.history, id)]).filter(([, sr]) => sr.length >= 2);
              if (!rows.length) return <Empty msg="Log 2+ finished sessions with a key lift (leg press, presses, RDL, row) and the strength sparklines light up here." />;
              return rows.map(([label, sr]) => {
                const de = sr[sr.length - 1].e1 - sr[0].e1;
                return (
                  <div key={label} style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
                      <span style={{ fontWeight: 700 }}>{label}</span>
                      <span style={{ color: T.gold }}>{sr[sr.length - 1].w} lb · e1RM {sr[sr.length - 1].e1} <span style={{ color: de >= 0 ? T.green : T.muted }}>({de >= 0 ? "+" : ""}{de})</span></span>
                    </div>
                    <Spark pts={sr.map((p) => ({ v: p.w }))} color={T.gold} />
                  </div>
                );
              });
            })()}
          </div>
          <div style={card}>
            <div style={panelTitle}>WEEKLY VOLUME</div>
            {(() => {
              const wk = weeklyStats(store.history, store.startDate, bodyKg);
              const weeks = Object.keys(wk).map(Number).sort((a, b) => a - b).slice(-5);
              if (!weeks.length) return <Empty msg="Finish a session and weekly set counts, tonnage, and calorie estimates appear here." />;
              const maxSets = Math.max(...weeks.map((n) => wk[n].sets), 1);
              return (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", marginTop: 10, height: 90 }}>
                  {weeks.map((n) => (
                    <div key={n} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontSize: 11, color: T.muted }}>{wk[n].sets}</div>
                      <div style={{ height: Math.max(6, (wk[n].sets / maxSets) * 60), background: (n === 6 || n === 12) ? T.gold : T.green, borderRadius: 4 }} />
                      <div style={{ fontSize: 11, color: (n === 6 || n === 12) ? T.gold : T.muted, marginTop: 4 }}>wk{n}{(n === 6 || n === 12) ? "·DL" : ""}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>{Math.round(wk[n].tonnage / 1000)}k lb</div>
                      <div style={{ fontSize: 10, color: T.muted }}>≈{Math.round(wk[n].kcal)} kcal</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          <div style={card}>
            <div style={panelTitle}>BODY</div>
            {(() => {
              const w = measSeries(store.measurements, "weight");
              const waist = measSeries(store.measurements, "waist");
              const asym = asymSeries(store.measurements);
              const limbs = [["arm-r", "Arm R"], ["arm-l", "Arm L"], ["thigh-r", "Thigh R"], ["thigh-l", "Thigh L"], ["calf-r", "Calf R"], ["calf-l", "Calf L"]];
              const limbRows = limbs.map(([id, label]) => [label, measSeries(store.measurements, id)]).filter(([, sr]) => sr.length >= 1);
              if (w.length < 2 && waist.length < 2 && !limbRows.length) return <Empty msg="Save two rounds of BODY measurements (every 2 weeks) and composition trends appear here." />;
              return (
                <div style={{ marginTop: 8 }}>
                  {w.length >= 2 && (<div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}><span style={{ fontWeight: 700 }}>Weight</span><span style={{ color: T.green }}>{w[w.length - 1].v} lb ({(w[w.length - 1].v - w[0].v) >= 0 ? "+" : ""}{Math.round((w[w.length - 1].v - w[0].v) * 10) / 10})</span></div><Spark pts={w} color={T.green} /></div>)}
                  {waist.length >= 2 && (<div style={{ marginTop: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}><span style={{ fontWeight: 700 }}>Waist</span><span style={{ color: T.gold }}>{waist[waist.length - 1].v}"</span></div><Spark pts={waist} color={T.gold} /></div>)}
                  {limbRows.length > 0 && (
                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {limbRows.map(([label, sr]) => (
                        <div key={label} style={{ fontSize: 12.5, color: T.muted }}>{label}: <span style={{ color: T.text, fontWeight: 700 }}>{sr[sr.length - 1].v}"</span>{sr.length >= 2 && <span style={{ color: (sr[sr.length - 1].v - sr[0].v) >= 0 ? T.green : T.gold }}> {(sr[sr.length - 1].v - sr[0].v) >= 0 ? "+" : ""}{Math.round((sr[sr.length - 1].v - sr[0].v) * 10) / 10}</span>}</div>
                      ))}
                    </div>
                  )}
                  {asym.length >= 1 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}><span style={{ fontWeight: 700 }}>Thigh asymmetry</span><span style={{ color: T.gold }}>{asym[asym.length - 1].v}"</span></div>
                      {asym.length >= 2 ? <Spark pts={asym} color={T.gold} /> : <Empty msg="One reading logged — this line should trend DOWN across the prep." />}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <div style={card}>
            <div style={panelTitle}>CONSISTENCY</div>
            {(() => {
              const wk = weeklyStats(store.history, store.startDate);
              const weeks = Object.keys(wk).map(Number).sort((a, b) => a - b).slice(-4);
              if (!weeks.length) return <Empty msg="Sessions per week vs the 6 planned appear here. Rest days always count in your favor." />;
              return weeks.map((n) => (
                <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div style={{ fontSize: 12, color: T.muted, width: 34 }}>wk{n}</div>
                  <div style={{ flex: 1, height: 10, background: T.surface2, borderRadius: 5 }}>
                    <div style={{ width: Math.min(100, (wk[n].days / 6) * 100) + "%", height: 10, background: wk[n].days >= 6 ? T.green : T.gold, borderRadius: 5 }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{wk[n].days}/6</div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}


      {view === "inspire" && (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {(() => {
            const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 864e5);
            const feat = LEGENDS[doy % LEGENDS.length];
            const rest = LEGENDS.filter((l) => l.name !== feat.name);
            return (
              <>
                <div style={{ ...card, border: `1px solid ${T.gold}` }}>
                  <div style={panelTitle}>TODAY'S LEGEND</div>
                  <div style={{ ...display, fontSize: 28, color: T.gold, marginTop: 4 }}>{feat.name}</div>
                  <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>{feat.fact}</div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.55, marginTop: 10 }}>{feat.thesis}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55, marginTop: 10, color: T.gold }}><strong>For your prep:</strong> {feat.apply}</div>
                </div>
                {rest.map((l) => (
                  <div key={l.name} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>{l.name}</div>
                    </div>
                    <div style={{ fontSize: 12, color: T.muted, marginTop: 1 }}>{l.fact}</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5, marginTop: 8 }}>{l.thesis}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6, color: T.gold }}>{l.apply}</div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {view === "coach" && (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {!IN_ARTIFACT() && (
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Anthropic API key (optional)</div>
              <div style={{ fontSize: 12, color: T.muted, margin: "4px 0 8px", lineHeight: 1.5 }}>Stored only on this device. With a key, the full AI panel reviews your data (about a cent per brief). Without one, you get the rule-based brief.</div>
              <input type="password" placeholder="sk-ant-..." defaultValue={(typeof window !== "undefined" && window.localStorage.getItem("anthropic-key")) || ""}
                onChange={(e) => window.localStorage.setItem("anthropic-key", e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "12px 10px", fontSize: 16 }} />
            </div>
          )}
          <button onClick={getCoaching} disabled={coachStatus === "loading"}
            style={{ width: "100%", padding: "16px", borderRadius: 12, fontSize: 16, fontWeight: 800, ...display, letterSpacing: "0.05em", background: coachStatus === "loading" ? T.surface : T.gold, color: coachStatus === "loading" ? T.muted : "#14181D", border: "none" }}>
            {coachStatus === "loading" ? "PANEL IS REVIEWING YOUR DATA…" : "GET COACHING"}
          </button>
          {String(coachStatus).indexOf("error:") === 0 && (
            <div style={{ fontSize: 13, color: T.red }}>AI panel unreachable ({coachStatus.slice(6)}){coach ? " — your last brief:" : ""}</div>
          )}
          {String(coachStatus).indexOf("rule:") === 0 && (
            <div style={{ fontSize: 13, color: T.gold }}>AI panel unreachable in this environment — data-driven brief from your log below. For the full panel, paste your export to Claude in chat.</div>
          )}
          {coach && coach.brief && (
            <>
              <div style={{ fontSize: 12, color: T.muted }}>Panel brief · {coach.date}</div>
              <div style={card}>
                <div style={{ ...display, fontSize: 24, color: T.gold, lineHeight: 1.1 }}>{coach.brief.headline}</div>
              </div>
              {(coach.brief.reads || []).map((r, i) => (
                <div key={i} style={card}>
                  <div style={{ fontSize: 13, color: T.gold, fontWeight: 700 }}>{r.signal}</div>
                  <div style={{ fontSize: 14, marginTop: 4, lineHeight: 1.5 }}>{r.meaning}</div>
                </div>
              ))}
              {(coach.brief.directives || []).length > 0 && (
                <div style={card}>
                  <div style={panelTitle}>DIRECTIVES</div>
                  {(coach.brief.directives || []).map((d, i) => (
                    <div key={i} style={{ fontSize: 14, lineHeight: 1.6, marginTop: 6 }}><span style={{ color: T.gold, fontWeight: 800 }}>{i + 1}.</span> {d}</div>
                  ))}
                </div>
              )}
              {coach.brief.kneeWatch && (
                <div style={{ ...card, border: `1px solid ${T.gold}` }}>
                  <div style={panelTitle}>KNEE WATCH</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 4 }}>{coach.brief.kneeWatch}</div>
                </div>
              )}
              {coach.brief.fire && (
                <div style={{ fontSize: 15, fontStyle: "italic", textAlign: "center", padding: "6px 10px", lineHeight: 1.5 }}>"{coach.brief.fire}"</div>
              )}
            </>
          )}
          {!coach && coachStatus === "idle" && (
            <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}>The panel — a Masters prep coach, a post-TKR physical therapist, and a mindset coach — reads every set, note, and measurement you've logged and returns one brief: what your data says, what to do about it, and the fire to go do it.</div>
          )}
        </div>
      )}

      {view === "train" && (<>
      {/* Day picker */}
      <div style={{ display: "flex", gap: 6, padding: "14px 16px", overflowX: "auto" }}>
        {DAY_NAMES.map((d, i) => (
          <button key={d} onClick={() => setDayIdx(i)} style={{
            flex: "0 0 auto", padding: "8px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: i === dayIdx ? PLANS[DAY_TO_PLAN[i]].color : T.surface,
            color: i === dayIdx ? "#14181D" : T.muted,
            border: `1px solid ${i === new Date().getDay() ? PLANS[DAY_TO_PLAN[i]].color : T.line}`,
          }}>{d.slice(0, 3)}</button>
        ))}
      </div>

      {/* Controls */}
      {isToday && (
        <div style={{ padding: "0 16px", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setRoughDay(!roughDay)} style={{ flex: 1, minWidth: 150, padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: roughDay ? T.red : T.surface, color: roughDay ? "#fff" : T.muted, border: `1px solid ${roughDay ? T.red : T.line}` }}>
            {roughDay ? "Rough day: −10%, last sets optional" : "Feeling beat up today?"}
          </button>
          {viewSessions.some((k) => PLANS[k].knee) && (
            <button onClick={() => setKneeHelp(!kneeHelp)} style={{ flex: "0 0 auto", padding: "12px 16px", borderRadius: 10, fontSize: 14, fontWeight: 700, background: T.surface, color: T.gold, border: `1px solid ${T.line}` }}>Knee ache?</button>
          )}
        </div>
      )}
      {kneeHelp && (
        <div style={{ margin: "10px 16px 0", background: T.surface2, border: `1px solid ${T.gold}`, borderRadius: 10, padding: 14, fontSize: 14, lineHeight: 1.55 }}>
          <strong style={{ color: T.gold }}>Protocol:</strong> Stop the exercise that hurts — don't push through. Swap to a hip-hinge move (RDL, pull-through, leg curl) or finish the session upper-body. Ache lasting &gt;48h, swelling, or warmth in the joint → PT before your next leg day.
        </div>
      )}

      {/* Sessions */}
      {viewSessions.map((planKey, si) => {
        const p = PLANS[planKey];
        if (p.exercises.length === 0)
          return (
            <div key={si} style={{ padding: "40px 24px", textAlign: "center" }}>
              <div style={{ ...display, fontSize: 30, color: T.muted }}>NO IRON TODAY</div>
              <p style={{ color: T.muted, fontSize: 15, maxWidth: 320, margin: "14px auto", lineHeight: 1.6 }}>
                Walk. Stretch. Sauna if you've got one. 10 minutes of knee mobility and quad/hip-flexor work. Growth happens today, not in the gym. If you really want to move iron, add a session below.
              </p>
            </div>
          );
        return (
          <div key={si} style={{ padding: "16px 16px 0" }}>
            {viewSessions.length > 1 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ ...display, fontSize: 22, color: p.color, textTransform: "uppercase" }}>
                  Session {si + 1}: {p.name}
                </div>
                {si > 0 && isToday && (
                  <button onClick={() => removeSession(si)} style={{ background: "none", border: `1px solid ${T.line}`, color: T.muted, borderRadius: 6, fontSize: 12, padding: "4px 10px" }}>remove</button>
                )}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {p.exercises.map((ex) => {
                const exDone = Array.from({ length: ex.sets }).filter((_, i) => log[`${si}|${ex.id}|${i}`]?.done).length;
                const lastW = store.lastWeights[ex.id];
                const trend = Object.entries(store.history).filter(([d, v]) => v.finished && d !== dateRef.current).sort().slice(-3).map(([, v]) => {
                  let w = null;
                  Object.entries(v.log || {}).forEach(([kk, ss]) => { if (kk.split("|")[1] === ex.id && ss.weight) w = ss.weight; });
                  return w;
                }).filter(Boolean);
                const noteKey = `${si}|${ex.id}`;
                const exKey = si + "|" + ex.id;
                if (exDone === ex.sets && !expanded[exKey]) return (
                  <div key={ex.id} onClick={() => setExpanded((x) => ({ ...x, [exKey]: true }))}
                    style={{ background: T.surface, border: `1px solid ${p.color}`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, opacity: 0.7 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700 }}>✓ {ex.name}</div>
                    <PlateBar total={ex.sets} done={exDone} color={p.color} />
                  </div>
                );
                const isNext = exKey === nextKey;
                return (
                  <div key={ex.id} style={{ background: T.surface, border: `1px solid ${isNext ? T.gold : exDone === ex.sets ? p.color : T.line}`, borderRadius: 14, padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
                          {ex.part && <span style={{ color: p.color, fontWeight: 800 }}>{ex.part} · </span>}{ex.name} {ex.knee && <span title="knee-critical" style={{ color: T.gold }}>▲</span>}{isNext && <span style={{ marginLeft: 6, background: T.gold, color: "#14181D", fontSize: 10, fontWeight: 900, borderRadius: 4, padding: "2px 6px", verticalAlign: "middle" }}>NEXT</span>}
                        </div>
                        <div style={{ fontSize: 12.5, color: T.muted, marginTop: 3 }}>
                          {ex.sets}×{ex.reps} · RIR {ex.rir} · rest {ex.rest >= 60 ? `${Math.round(ex.rest / 6) / 10}m` : `${ex.rest}s`}{ex.note ? ` · ${ex.note}` : ""}
                        </div>
                        {ex.how && (
                          <div style={{ fontSize: 12, color: "#8B97A3", marginTop: 3, lineHeight: 1.45 }}>{ex.how}</div>
                        )}
                        {lastW && (
                          <div style={{ fontSize: 12.5, color: T.gold, marginTop: 3 }}>
                            Last: {lastW} lb{roughDay ? ` → today ~${roundLoad(lastW * 0.9)} lb` : ""}
                          </div>
                        )}
                        {trend.length > 1 && (
                          <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Trend: {trend.join(" → ")} lb</div>
                        )}
                      </div>
                      <PlateBar total={ex.sets} done={exDone} color={p.color} />
                    </div>

                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {Array.from({ length: ex.sets }).map((_, sx) => {
                        const k = `${si}|${ex.id}|${sx}`;
                        const s = log[k] || {};
                        const optional = roughDay && sx === ex.sets - 1;
                        return (
                          <div key={sx} style={{ display: "flex", gap: 10, alignItems: "center", opacity: optional && !s.done ? 0.45 : 1 }}>
                            <div style={{ width: 24, fontSize: 13, color: T.muted, fontWeight: 700 }}>{sx + 1}</div>
                            <input inputMode="decimal" placeholder={lastW ? String(roughDay ? roundLoad(lastW * 0.9) : lastW) : "lb"} value={s.weight || ""}
                              onChange={(e) => updateSet(si, ex.id, sx, { weight: e.target.value })}
                              style={{ width: 74, background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "12px 10px", fontSize: 16 }} />
                            <input inputMode="numeric" placeholder="reps" value={s.reps || ""}
                              onChange={(e) => updateSet(si, ex.id, sx, { reps: e.target.value })}
                              style={{ width: 62, background: T.surface2, border: `1px solid ${T.line}`, borderRadius: 8, color: T.text, padding: "12px 10px", fontSize: 16 }} />
                            <button onClick={() => checkSet(si, ex, sx)} disabled={!isToday}
                              style={{ flex: 1, minHeight: 46, borderRadius: 8, fontSize: 15, fontWeight: 800, background: s.done ? p.color : T.surface2, color: s.done ? "#14181D" : T.muted, border: `1px solid ${s.done ? p.color : T.line}`, opacity: isToday ? 1 : 0.4 }}>
                              {s.done ? "DONE ✓" : optional ? "OPTIONAL" : "SET DONE"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Feedback line */}
                    <input
                      placeholder="How did it feel? (knee, pump, form, weight next time…)"
                      value={notes[noteKey] || ""}
                      disabled={!isToday}
                      onChange={(e) => setNotes((n) => ({ ...n, [noteKey]: e.target.value }))}
                      onBlur={() => saveDay()}
                      style={{ marginTop: 10, width: "100%", boxSizing: "border-box", background: "transparent", border: "none", borderBottom: `1px dashed ${T.line}`, color: notes[noteKey] ? T.text : T.muted, padding: "8px 2px", fontSize: 16, fontStyle: notes[noteKey] ? "normal" : "italic", outline: "none" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Add session */}
      {isToday && (
        <div style={{ padding: "16px 16px 0" }}>
          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{ width: "100%", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: 700, background: "transparent", color: T.muted, border: `1px dashed ${T.line}` }}>
              + Add another session today
            </button>
          ) : (
            <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, letterSpacing: "0.08em", marginBottom: 10 }}>PICK A SESSION TO ADD</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ADDABLE.map((k) => (
                  <button key={k} onClick={() => addSession(k)} style={{ padding: "10px 14px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: T.surface2, color: PLANS[k].color, border: `1px solid ${T.line}` }}>
                    {PLANS[k].name}
                  </button>
                ))}
                <button onClick={() => setShowAdd(false)} style={{ padding: "10px 14px", borderRadius: 8, fontSize: 14, background: "none", color: T.muted, border: "none" }}>cancel</button>
              </div>
              <div style={{ marginTop: 10, fontSize: 12.5, color: T.muted, lineHeight: 1.5 }}>
                Coach's note: a second session is fine occasionally — keep it short, RIR 2+, and never a second knee-loaded leg session in the same day.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Finish */}
      {isToday && totals.total > 0 && (
        <div style={{ padding: "16px 16px 0" }}>
          <button onClick={finishWorkout} disabled={totals.done === 0}
            style={{ width: "100%", padding: "18px", borderRadius: 14, fontSize: 18, fontWeight: 800, ...display, letterSpacing: "0.06em", background: allDone ? T.green : totals.done > 0 ? headerPlan.color : T.surface, color: totals.done > 0 ? "#14181D" : "#4A545F", border: "none" }}>
            {allDone ? "FINISH — FULL DAY" : totals.done > 0 ? `FINISH (${totals.done}/${totals.total} SETS)` : "LOG A SET TO FINISH"}
          </button>
          <div style={{ textAlign: "center", color: "#4A545F", fontSize: 12, margin: "12px 0 8px" }}>
            Warm-up first: 5 min easy bike + 2 ramp sets on exercise one.
          </div>
        </div>
      )}

      </>)}

      <div style={{ textAlign: "center", color: "#3A444F", fontSize: 10, padding: "20px 0 10px" }}>Phase 1 Tracker v{APP_VERSION}</div>

      {timer !== null && <RestTimer seconds={timer} onDone={() => setTimer(null)} />}
    </div>
  );
}

export default function Root() {
  return <ErrorBoundary><App /></ErrorBoundary>;
}
