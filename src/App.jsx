import { useState, useCallback } from "react";

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

const C = {
  bg: "#f0f4f8", navy: "#0a1628", navyMid: "#112240", navyLight: "#1a3360",
  card: "#ffffff", cardOff: "#f8fafc",
  gold: "#c9952a", goldLight: "#f5c842", goldBg: "rgba(201,149,42,0.10)",
  green: "#1a7a4a", greenBg: "rgba(26,122,74,0.09)", greenBorder: "#bbf7d0",
  red: "#c0392b", redBg: "rgba(192,57,43,0.08)",
  amber: "#d97706", amberBg: "rgba(217,119,6,0.09)",
  blue: "#1e6fb5", blueBg: "rgba(30,111,181,0.09)",
  purple: "#6d3fc0", purpleBg: "rgba(109,63,192,0.09)",
  text: "#0a1628", textMid: "#4a6080", textDim: "#8fa3bc",
  border: "#d4dde8", borderMid: "#b8c8da",
  shadow: "0 1px 4px rgba(10,22,40,0.08)",
  shadowMd: "0 4px 16px rgba(10,22,40,0.10)",
  sidebar: "#0e1e38",
};

const SILKS = [
  { primary: "#c0392b", secondary: "#ffffff", pattern: "stripes" },
  { primary: "#0a1628", secondary: "#c9952a", pattern: "spots" },
  { primary: "#1a7a4a", secondary: "#ffffff", pattern: "plain" },
  { primary: "#6d3fc0", secondary: "#ffffff", pattern: "chevron" },
  { primary: "#1e6fb5", secondary: "#f5c842", pattern: "plain" },
];

function Silk({ silk, size = 40 }) {
  const s = silk || SILKS[0];
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" style={{ flexShrink: 0, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.12))" }}>
      <ellipse cx="18" cy="20" rx="13" ry="11" fill={s.primary} />
      <ellipse cx="18" cy="11" rx="7" ry="8" fill={s.primary} />
      {s.pattern === "stripes" && <><rect x="5" y="14" width="26" height="3" fill={s.secondary} opacity="0.45" /><rect x="5" y="20" width="26" height="3" fill={s.secondary} opacity="0.45" /></>}
      {s.pattern === "spots" && <><circle cx="12" cy="22" r="2.5" fill={s.secondary} opacity="0.55" /><circle cx="24" cy="22" r="2.5" fill={s.secondary} opacity="0.55" /><circle cx="18" cy="17" r="2.5" fill={s.secondary} opacity="0.55" /></>}
      {s.pattern === "chevron" && <polyline points="5,18 18,12 31,18" fill="none" stroke={s.secondary} strokeWidth="3" opacity="0.55" />}
      <ellipse cx="18" cy="8" rx="5" ry="4" fill={s.secondary} opacity="0.92" />
      <ellipse cx="18" cy="20" rx="13" ry="11" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
    </svg>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const TODAY = new Date("2026-03-18");
const todayStr = TODAY.toISOString().split("T")[0];

const INITIAL_HORSES = [
  {
    id: "h1", name: "Bob Olinger", dob: "2015-05-11", sex: "Gelding", colour: "Bay",
    nhRating: 168, flatRating: null, discipline: ["Hurdle"], surface: "Turf",
    status: "Active", activationDate: null, isEBF: false, isMaiden: false, isNovice: false,
    owner: "Robcour", ownerPhone: "+353861112222", ownerEmail: "robcour@example.com",
    trainer: "Henry de Bromhead", jockey: "D.J. O'Keeffe",
    headgear: "Hood", nextRaceDate: "2026-03-30",
    goingPref: ["Good to Soft", "Soft", "Yielding"], distanceMin: 20, distanceMax: 28,
    silk: SILKS[0],
    notes: "Cheltenham specialist. Keep fresh. De Bromhead says better than ever.",
    form: [
      { date: "2025-12-28", venue: "Leopardstown", position: 2, runners: 8, raceClass: "Grade 1", going: "Good to Yielding" },
      { date: "2025-03-13", venue: "Cheltenham", position: 1, runners: 13, raceClass: "Grade 1", going: "Good to Soft" },
    ],
    arrivedDate: "2025-08-01", arrivedFrom: "Summer grass",
    provisionalEntries: [],
  },
  {
    id: "h2", name: "Dunmore Lady", dob: "2020-04-05", sex: "Mare", colour: "Chestnut",
    nhRating: 82, flatRating: null, discipline: ["Hurdle"], surface: "Turf",
    status: "CoolingOff", activationDate: "2026-03-14", isEBF: true, isMaiden: false, isNovice: false,
    owner: "P. & M. Kelly", ownerPhone: "+353853334444", ownerEmail: "kelly@example.com",
    trainer: "P.J. Hennessy", jockey: "P. Townend",
    headgear: "Cheekpieces", nextRaceDate: "2026-04-02",
    goingPref: ["Soft", "Heavy"], distanceMin: 16, distanceMax: 20,
    silk: SILKS[1],
    notes: "Back from wind op. Needs soft. Was flying before the op.",
    form: [
      { date: "2026-01-15", venue: "Naas", position: 1, runners: 8, raceClass: "Handicap", going: "Soft" },
      { date: "2025-11-28", venue: "Thurles", position: 2, runners: 7, raceClass: "Handicap", going: "Heavy" },
    ],
    arrivedDate: "2026-02-10", arrivedFrom: "Convalescence",
    provisionalEntries: [{ id: "pe1", venue: "Navan", date: "2026-04-02", raceName: "Mares Handicap Hurdle", raceRef: "Navan 55 Race B", note: "If ground stays soft" }],
  },
  {
    id: "h3", name: "Ardmore Flash", dob: "2022-05-20", sex: "Colt", colour: "Dark Bay",
    nhRating: null, flatRating: 74, discipline: ["Flat"], surface: "AWT",
    status: "Active", activationDate: null, isEBF: true, isMaiden: true, isNovice: false,
    owner: "Ballykea Syndicate", ownerPhone: "+353835556666", ownerEmail: "ballykea@example.com",
    trainer: "P.J. Hennessy", jockey: "C. Hayes",
    headgear: null, nextRaceDate: "2026-03-25",
    goingPref: ["Standard", "Fast"], distanceMin: 5, distanceMax: 7,
    silk: SILKS[2],
    notes: "Keeps finding one. Try cheekpieces. 7f untried but bred for it.",
    form: [
      { date: "2026-03-01", venue: "Dundalk", position: 2, runners: 10, raceClass: "Maiden", going: "Standard" },
      { date: "2026-01-17", venue: "Dundalk", position: 3, runners: 12, raceClass: "Maiden", going: "Standard" },
    ],
    arrivedDate: "2025-03-15", arrivedFrom: "Breeder",
    provisionalEntries: [{ id: "pe2", venue: "Dundalk", date: "2026-03-25", raceName: "EBF Median Auction Maiden 7f", raceRef: "Dundalk 47 Race C", note: "First time at 7f — step up in trip" }],
  },
  {
    id: "h4", name: "Kilmore Star", dob: "2018-02-28", sex: "Gelding", colour: "Grey",
    nhRating: 118, flatRating: null, discipline: ["Chase"], surface: "Turf",
    status: "Inactive", activationDate: null, isEBF: false, isMaiden: false, isNovice: false,
    owner: "T. Brennan", ownerPhone: "+353877778888", ownerEmail: "brennan@example.com",
    trainer: "P.J. Hennessy", jockey: "D. Russell",
    headgear: "Blinkers", nextRaceDate: null,
    goingPref: ["Good to Soft", "Soft"], distanceMin: 20, distanceMax: 28,
    silk: SILKS[3],
    notes: "Wind op. Needs time. Don't rush.",
    form: [{ date: "2025-12-20", venue: "Leopardstown", position: 4, runners: 14, raceClass: "Grade 1", going: "Soft" }],
    arrivedDate: "2026-01-05", arrivedFrom: "Post-op recovery",
    provisionalEntries: [],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getAge = (dob) => TODAY.getFullYear() - new Date(dob).getFullYear();
const coolingDate = (d) => { if (!d) return null; const x = new Date(d); x.setDate(x.getDate() + 7); return x; };
const canRace = (h) => { if (h.status === "Inactive") return false; if (h.status === "CoolingOff") { const e = coolingDate(h.activationDate); return e && TODAY >= e; } return true; };
const daysUntil = (ds) => !ds ? null : Math.ceil((new Date(ds) - TODAY) / 86400000);
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

// Antepsin: 3 bottles per 12-day course, 1 bottle every 4 days
// Count ticks and calculate bottles needed (round up to nearest bottle at 4 days each)
const calcAntepsinCost = (ticks) => {
  if (!ticks) return 0;
  const bottles = Math.ceil(ticks / 4);
  return bottles * 25;
};

const MED_TYPES = {
  peptizole: { label: "Peptizole", color: C.blue, bg: C.blueBg, costPerDay: 18, courseDays: 12, withdrawalDays: 4 },
  antepsin: { label: "Antepsin", color: C.purple, bg: C.purpleBg, courseDays: 12, withdrawalDays: 1 },
  antibiotics: { label: "Antibiotics", color: C.amber, bg: C.amberBg, withdrawalDays: 0 },
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Tag({ children, color, bg }) {
  return <span style={{ background: bg || `${color}12`, color, border: `1px solid ${color}30`, borderRadius: 20, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
}

function Btn({ onClick, children, variant = "primary", style: s = {}, disabled = false }) {
  const base = { border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1, display: "inline-flex", alignItems: "center", gap: 6 };
  const variants = {
    primary: { background: C.navy, color: "#fff" },
    gold: { background: C.goldBg, color: C.gold, border: `1.5px solid ${C.gold}50` },
    green: { background: C.greenBg, color: C.green, border: `1.5px solid ${C.green}40` },
    ghost: { background: "none", color: C.textMid, border: `1px solid ${C.border}` },
    red: { background: C.redBg, color: C.red, border: `1px solid ${C.red}30` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

function FormDots({ form }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {(form || []).slice(0, 5).map((f, i) => {
        const col = f.position === 1 ? C.green : f.position <= 3 ? C.amber : C.textDim;
        return <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: f.position === 1 ? C.greenBg : f.position <= 3 ? C.amberBg : "#f0f4f8", border: `1.5px solid ${col}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: col }}>{f.position}</div>;
      })}
    </div>
  );
}

function StatusPill({ status, activationDate }) {
  const d = coolingDate(activationDate);
  const days = d ? Math.ceil((d - TODAY) / 86400000) : 0;
  const cfg = {
    Active: { bg: C.greenBg, color: C.green, label: "● Active" },
    CoolingOff: { bg: C.amberBg, color: C.amber, label: `⏳ Cool-off · ${days}d` },
    Inactive: { bg: C.redBg, color: C.red, label: "✕ Inactive" },
  }[status];
  return <span style={{ ...cfg, border: `1px solid ${cfg.color}40`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{cfg.label}</span>;
}

// ─── AI RACE PLANNER ──────────────────────────────────────────────────────────
async function getAITake(horse, race) {
  const lastRun = horse.form?.[0];
  const daysSince = lastRun ? Math.floor((TODAY - new Date(lastRun.date)) / 86400000) : null;
  const daysToRace = daysUntil(race.date);

  const system = `You are a highly experienced Irish racehorse trainer and racing secretary with 30 years on the gallops and in the entry office. You speak directly to a fellow professional trainer — never describe their own horse's form back at them. Talk about the RACE OPPORTUNITY — field, tactics, timing, equipment, campaign.

Your voice is authentic trainer language: "Not a great race — I'd be going there to win it", "Plenty of dead wood in here", "Could do with the run", "Hunt him around today", "Worth trying cheekpieces", "This sets the Punchestown run up perfectly", "The handicapper hasn't copped on yet", "I'd be very tempted", "Ride cold, get cover, come through them late".

Use web_search to check likely runners and trainer record at the venue before writing.`;

  const prompt = `Give me your honest take — trainer to trainer. Search first.

HORSE: ${horse.name} | ${getAge(horse.dob)}yo ${horse.sex} | ${horse.trainer} | Rating: ${horse.nhRating ?? horse.flatRating ?? "—"}
Headgear: ${horse.headgear || "None"} | ${daysSince ?? "?"} days since last run
Notes: "${horse.notes}"

RACE: ${race.raceName} | ${race.venue} | ${race.date}
${race.grade} ${race.discipline} ${race.raceType} | ${race.distanceFurlongs}f | €${race.prizeMoney?.toLocaleString()} | ${race.forecastGoing} | ${daysToRace} days away

Search: "${race.raceName} ${race.venue} 2026 runners" and "${horse.trainer} ${race.venue} record"

Return ONLY raw JSON:
{"scores":{"handicap_edge":7,"class_fit":8,"conditions_match":7,"timing":8,"cuteness":6},"overall":75,"bullets":[{"category":"The Field","icon":"🏟","point":"Honest read on who's in this. Is it winnable? Name rivals if found."},{"category":"How to Ride It","icon":"⚡","point":"Specific jockey instructions based on pace scenario."},{"category":"The Timing","icon":"📅","point":"Prep run, education, or genuine day out? Campaign picture."},{"category":"Equipment","icon":"🔧","point":"Anything worth trying or change for this race?"},{"category":"The Risk","icon":"⚠️","point":"One thing that could make this a bad idea. Direct."},{"category":"My Verdict","icon":"🎯","point":"What do you actually think? Be definitive."}],"conclusion":"3-4 sentences max. Trainer to trainer. What would you do?","recommendation":"STRONG"}
Replace all template text with real analysis. recommendation = STRONG, CONSIDER, WAIT, or PASS.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, tools: [{ type: "web_search_20250305", name: "web_search" }], system, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON");
  return JSON.parse(match[0]);
}

// ─── MEDICATION TRACKER ───────────────────────────────────────────────────────
function MedicationTracker({ horses }) {
  const [medLogs, setMedLogs] = useState({});
  const [selMonth, setSelMonth] = useState(TODAY.getMonth());
  const [selYear, setSelYear] = useState(TODAY.getFullYear());
  const [openHorse, setOpenHorse] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [billHorse, setBillHorse] = useState(null);
  const [trackedIds, setTrackedIds] = useState(["h1", "h2"]);
  const [showAdd, setShowAdd] = useState(false);

  const daysInMonth = getDaysInMonth(selYear, selMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const todayD = TODAY.getDate();
  const isCurrent = selMonth === TODAY.getMonth() && selYear === TODAY.getFullYear();
  const monthName = new Date(selYear, selMonth).toLocaleString("en-IE", { month: "long", year: "numeric" });

  const k = (hId, d, t) => `${hId}_${selYear}_${selMonth}_${d}_${t}`;
  const getMed = (hId, d, t) => medLogs[k(hId, d, t)] || 0;
  const toggleMed = (hId, d, t) => {
    setMedLogs(prev => {
      const cur = prev[k(hId, d, t)] || 0;
      if (t === "antibiotics") return { ...prev, [k(hId, d, t)]: cur === 0 ? 1 : cur === 1 ? 2 : 0 };
      return { ...prev, [k(hId, d, t)]: cur ? 0 : 1 };
    });
  };

  const calcCost = (hId) => {
    const peptizoleDays = days.filter(d => getMed(hId, d, "peptizole")).length;
    const antepsinTicks = days.filter(d => getMed(hId, d, "antepsin")).length;
    const antibioticDoses = days.reduce((s, d) => s + getMed(hId, d, "antibiotics"), 0);
    const peptizole = peptizoleDays * 18;
    const antepsin = calcAntepsinCost(antepsinTicks);
    const antibiotics = antibioticDoses * 15;
    return { peptizoleDays, antepsinTicks, antepsinBottles: Math.ceil(antepsinTicks / 4), antibioticDoses, peptizole, antepsin, antibiotics, total: peptizole + antepsin + antibiotics };
  };

  const trackedHorses = horses.filter(h => trackedIds.includes(h.id));
  const untrackedHorses = horses.filter(h => h.status !== "Inactive" && !trackedIds.includes(h.id));

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Medication Tracker</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Tap each day to log · costs auto-calculated for Yardman</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Btn variant="ghost" onClick={() => { const d = new Date(selYear, selMonth - 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }} style={{ padding: "7px 12px" }}>←</Btn>
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, minWidth: 150, textAlign: "center" }}>{monthName}</span>
          <Btn variant="ghost" onClick={() => { const d = new Date(selYear, selMonth + 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }} style={{ padding: "7px 12px" }}>→</Btn>
          <Btn onClick={() => setShowAdd(true)} disabled={untrackedHorses.length === 0}>+ Add Horse</Btn>
        </div>
      </div>

      {/* Race timing alerts */}
      {horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d >= 12 && d <= 16; }).map(h => (
        <div key={h.id} style={{ background: C.amberBg, border: `1px solid ${C.amber}40`, borderLeft: `3px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <Silk silk={h.silk} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.name} — race in {daysUntil(h.nextRaceDate)} days</div>
            <div style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>🏥 Start Peptizole & Antepsin course now (12 days each · Peptizole stop 4 days before · Antepsin stop 1 day before)</div>
          </div>
        </div>
      ))}
      {horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d > 0 && d < 12; }).map(h => (
        <div key={h.id} style={{ background: C.redBg, border: `1px solid ${C.red}30`, borderLeft: `3px solid ${C.red}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <Silk silk={h.silk} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.name} — race in {daysUntil(h.nextRaceDate)} days</div>
            <div style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>⚠️ Too close to start a full course — check withdrawal periods before administering</div>
          </div>
        </div>
      ))}

      {/* Add horse panel */}
      {showAdd && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16, boxShadow: C.shadow }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Add horse to {monthName} tracker:</div>
          {untrackedHorses.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.cardOff, borderRadius: 10, border: `1px solid ${C.border}`, marginBottom: 8 }}>
              <Silk silk={h.silk} size={30} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{h.name}</div>
                <div style={{ fontSize: 11, color: C.textMid }}>{h.owner} · {h.status}{h.nextRaceDate ? ` · Next race: ${new Date(h.nextRaceDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}` : ""}</div>
              </div>
              <Btn variant="green" onClick={() => { setTrackedIds(p => [...p, h.id]); }} style={{ padding: "6px 14px", fontSize: 12 }}>+ Add</Btn>
            </div>
          ))}
          <Btn variant="ghost" onClick={() => setShowAdd(false)} style={{ marginTop: 8, fontSize: 12, padding: "6px 14px" }}>Close</Btn>
        </div>
      )}

      {trackedHorses.length === 0 && (
        <div style={{ padding: 48, textAlign: "center", border: `1.5px dashed ${C.border}`, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏥</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No horses on the tracker</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Tap <strong>+ Add Horse</strong> to start logging medication for this month</div>
        </div>
      )}

      {/* Horse medication rows */}
      {trackedHorses.map(horse => {
        const isOpen = openHorse === horse.id;
        const costs = calcCost(horse.id);
        return (
          <div key={horse.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 12, overflow: "hidden", boxShadow: C.shadow }}>
            <div onClick={() => setOpenHorse(isOpen ? null : horse.id)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <Silk silk={horse.silk} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>{horse.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {costs.peptizoleDays > 0 && <Tag color={C.blue}>{costs.peptizoleDays} days Peptizole · €{costs.peptizole}</Tag>}
                  {costs.antepsinTicks > 0 && <Tag color={C.purple}>{costs.antepsinTicks} days Antepsin · {costs.antepsinBottles} bottle{costs.antepsinBottles !== 1 ? "s" : ""} · €{costs.antepsin}</Tag>}
                  {costs.antibioticDoses > 0 && <Tag color={C.amber}>{costs.antibioticDoses} dose{costs.antibioticDoses !== 1 ? "s" : ""} Antibiotics · €{costs.antibiotics}</Tag>}
                  {costs.total > 0 && <Tag color={C.gold}>Total: €{costs.total}</Tag>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn onClick={(e) => { e.stopPropagation(); setBillHorse(horse); setShowBill(true); }} style={{ padding: "5px 12px", fontSize: 11 }}>📋 Bill</Btn>
                <Btn variant="red" onClick={(e) => { e.stopPropagation(); setTrackedIds(p => p.filter(id => id !== horse.id)); }} style={{ padding: "5px 10px", fontSize: 11 }}>✕</Btn>
                <span style={{ color: C.textMid, fontSize: 14 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                {/* Legend */}
                <div style={{ display: "flex", gap: 16, padding: "10px 0", marginBottom: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.blue }}>Peptizole</strong> — €18/day</div>
                  <div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.purple }}>Antepsin</strong> — €25/bottle (1 bottle per 4 days, rounds up)</div>
                  <div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.amber }}>Antibiotics</strong> — €15/dose (tap once=1 dose, twice=2 doses)</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 700 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "6px 8px", fontSize: 11, fontWeight: 700, color: C.textMid, width: 110 }}>Treatment</th>
                        {days.map(d => (
                          <th key={d} style={{ padding: "3px 2px", fontSize: 10, fontWeight: 700, color: isCurrent && d === todayD ? C.navy : C.textDim, textAlign: "center", minWidth: 26, background: isCurrent && d === todayD ? C.goldBg : "none", borderRadius: 4 }}>{d}</th>
                        ))}
                        <th style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: C.textMid, textAlign: "right", minWidth: 80 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[["peptizole", C.blue], ["antepsin", C.purple], ["antibiotics", C.amber]].map(([type, col]) => (
                        <tr key={type}>
                          <td style={{ padding: "5px 8px" }}>
                            <span style={{ background: `${col}12`, color: col, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>{MED_TYPES[type].label}</span>
                          </td>
                          {days.map(d => {
                            const val = getMed(horse.id, d, type);
                            const isFuture = isCurrent && d > todayD;
                            return (
                              <td key={d} style={{ padding: "2px 2px", textAlign: "center" }}>
                                <button onClick={() => !isFuture && toggleMed(horse.id, d, type)} disabled={isFuture} style={{ width: 22, height: 22, borderRadius: 4, background: val > 0 ? col : "#f0f4f8", border: `1px solid ${val > 0 ? col : C.border}`, color: val > 0 ? "#fff" : C.textDim, fontSize: 10, fontWeight: 700, cursor: isFuture ? "default" : "pointer", opacity: isFuture ? 0.25 : 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                                  {val > 0 ? val : ""}
                                </button>
                              </td>
                            );
                          })}
                          <td style={{ padding: "5px 8px", textAlign: "right", fontSize: 13, fontWeight: 700, color: C.text }}>
                            {type === "peptizole" && `€${costs.peptizole}`}
                            {type === "antepsin" && `${costs.antepsinBottles} bot · €${costs.antepsin}`}
                            {type === "antibiotics" && `€${costs.antibiotics}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Withdrawal deadlines */}
                {horse.nextRaceDate && (
                  <div style={{ marginTop: 10, padding: "10px 12px", background: C.cardOff, borderRadius: 8, border: `1px solid ${C.border}`, display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>⏱ Withdrawal for {new Date(horse.nextRaceDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}:</div>
                    {[{ label: "Stop Peptizole", wd: 4 }, { label: "Stop Antepsin", wd: 1 }].map(({ label, wd }) => {
                      const stop = new Date(horse.nextRaceDate); stop.setDate(stop.getDate() - wd);
                      return <div key={label} style={{ fontSize: 12, color: C.textMid }}><span style={{ fontWeight: 600, color: C.red }}>{label}:</span> {stop.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Bill modal */}
      {showBill && billHorse && (() => {
        const costs = calcCost(billHorse.id);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
            <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: C.shadowMd, overflow: "hidden" }}>
              <div style={{ background: C.navy, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Monthly Medication Bill</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{billHorse.name} · {monthName}</div></div>
                <button onClick={() => setShowBill(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 7, cursor: "pointer", fontSize: 15 }}>✕</button>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>For Yardman — {billHorse.owner}</div>
                {[
                  costs.peptizoleDays > 0 && { label: `Peptizole — ${costs.peptizoleDays} days × €18`, amount: costs.peptizole },
                  costs.antepsinTicks > 0 && { label: `Antepsin — ${costs.antepsinBottles} bottle${costs.antepsinBottles !== 1 ? "s" : ""} × €25 (${costs.antepsinTicks} days)`, amount: costs.antepsin },
                  costs.antibioticDoses > 0 && { label: `Antibiotics — ${costs.antibioticDoses} dose${costs.antibioticDoses !== 1 ? "s" : ""} × €15`, amount: costs.antibiotics },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 14, color: C.text }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>€{item.amount}</span>
                  </div>
                ))}
                {costs.total === 0 && <div style={{ padding: "20px 0", textAlign: "center", color: C.textMid, fontSize: 13 }}>No medication logged this month</div>}
                {costs.total > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Total</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>€{costs.total}</span>
                  </div>
                )}
                <Btn onClick={() => window.print()} style={{ width: "100%", marginTop: 16, justifyContent: "center" }}>🖨 Print / Save for Yardman</Btn>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── PROVISIONAL ENTRIES ──────────────────────────────────────────────────────
function ProvisionalEntries({ horses, setHorses }) {
  const [showAdd, setShowAdd] = useState(null); // horseId
  const [entry, setEntry] = useState({ venue: "", date: "", raceName: "", raceRef: "", note: "" });
  const [provisionalRaces, setProvisionalRaces] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [lastFetch, setLastFetch] = useState(null);

  const fetchProvisional = async () => {
    setFetchStatus("fetching");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `Parse HRI provisional summary PDFs into a JSON array. Return ONLY raw JSON array, no markdown. Each race: {"id":"string","meetingRef":"string e.g. Limerick 55","raceRef":"string e.g. Race A","venue":"string","date":"YYYY-MM-DD","raceName":"string","discipline":"string","grade":"string","distanceFurlongs":number,"prizeMoney":number,"forecastGoing":"string","entryDeadline":"YYYY-MM-DDTHH:MM"}`,
          messages: [{ role: "user", content: "Search for HRI provisional race summaries at hri-ras.ie/provisional-summaries and find the most recent provisional summary documents. Fetch and parse all races into a JSON array. If you cannot find PDFs directly, search for "HRI provisional summaries 2026 Ireland". Return only the JSON array with no markdown." }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No races");
      setProvisionalRaces(JSON.parse(match[0]));
      setLastFetch(new Date().toISOString());
      setFetchStatus("done");
    } catch (e) { console.error(e); setFetchStatus("error"); }
  };

  const addEntry = (horseId) => {
    if (!entry.venue || !entry.raceName) return;
    setHorses(prev => prev.map(h => h.id === horseId ? { ...h, provisionalEntries: [...(h.provisionalEntries || []), { ...entry, id: `pe_${Date.now()}` }] } : h));
    setEntry({ venue: "", date: "", raceName: "", raceRef: "", note: "" });
    setShowAdd(null);
  };

  const removeEntry = (horseId, entryId) => {
    setHorses(prev => prev.map(h => h.id === horseId ? { ...h, provisionalEntries: (h.provisionalEntries || []).filter(e => e.id !== entryId) } : h));
  };

  const allProvisional = horses.flatMap(h => (h.provisionalEntries || []).map(e => ({ ...e, horse: h })));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Provisional Entries</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Planning targets before official entries — visible to owners in their portal</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="ghost" onClick={fetchProvisional} disabled={fetchStatus === "fetching"} style={{ fontSize: 12 }}>
            {fetchStatus === "fetching" ? "⟳ Fetching…" : "⟳ Fetch HRI Provisional Summaries"}
          </Btn>
        </div>
      </div>

      {/* HRI Provisional Summaries */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 18px", marginBottom: 16, boxShadow: C.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: lastFetch || provisionalRaces.length > 0 ? 12 : 0 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>HRI Provisional Summaries</div>
            <div style={{ fontSize: 12, color: C.textMid }}>
              {lastFetch ? `Last fetched: ${new Date(lastFetch).toLocaleString("en-IE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "hri-ras.ie/provisional-summaries — use these to plan medication courses in advance"}
            </div>
          </div>
          <Btn onClick={fetchProvisional} disabled={fetchStatus === "fetching"} style={{ fontSize: 12, padding: "8px 16px" }}>
            {fetchStatus === "fetching" ? <>⟳ Fetching…</> : <>⟳ {lastFetch ? "Refresh" : "Fetch Now"}</>}
          </Btn>
        </div>
        {provisionalRaces.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {provisionalRaces.slice(0, 8).map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "8px 10px", background: C.cardOff, borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12, alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: C.navy, minWidth: 80 }}>{r.meetingRef}</span>
                <span style={{ color: C.textMid, minWidth: 60 }}>{r.raceRef}</span>
                <span style={{ fontWeight: 600, color: C.text, flex: 1 }}>{r.raceName}</span>
                <span style={{ color: C.textMid }}>{r.venue}</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>€{r.prizeMoney >= 1000 ? (r.prizeMoney / 1000) + "k" : r.prizeMoney}</span>
                <span style={{ color: C.textMid }}>{new Date(r.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>
              </div>
            ))}
            {provisionalRaces.length > 8 && <div style={{ fontSize: 12, color: C.textMid, padding: "4px 0" }}>+ {provisionalRaces.length - 8} more races</div>}
          </div>
        )}
        {fetchStatus === "error" && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 8 }}>✕ Failed to fetch — try again</div>}
        {fetchStatus === "done" && provisionalRaces.length === 0 && <div style={{ fontSize: 12, color: C.textMid, marginTop: 8 }}>No races found in provisional summaries</div>}
      </div>

      {/* Per-horse provisional entries */}
      {horses.filter(h => h.status !== "Inactive").map(horse => {
        const entries = horse.provisionalEntries || [];
        const isAdding = showAdd === horse.id;
        return (
          <div key={horse.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 12, boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: entries.length > 0 || isAdding ? 12 : 0 }}>
              <Silk silk={horse.silk} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner} · {entries.length} provisional target{entries.length !== 1 ? "s" : ""}</div>
              </div>
              <Btn variant="gold" onClick={() => setShowAdd(isAdding ? null : horse.id)} style={{ fontSize: 12, padding: "6px 14px" }}>
                {isAdding ? "Cancel" : "+ Add Target"}
              </Btn>
            </div>

            {/* Existing provisional entries */}
            {entries.map(e => (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: C.goldBg, border: `1px solid ${C.gold}30`, borderLeft: `3px solid ${C.gold}`, borderRadius: 10, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{e.raceName}</span>
                    {e.raceRef && <Tag color={C.navy} bg="rgba(10,22,40,0.07)">{e.raceRef}</Tag>}
                    <Tag color={C.gold}>Provisional</Tag>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                    <span>📍 {e.venue}</span>
                    {e.date && <span>📅 {new Date(e.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                    {e.date && daysUntil(e.date) && <span style={{ color: daysUntil(e.date) <= 16 ? C.amber : C.textMid, fontWeight: daysUntil(e.date) <= 16 ? 700 : 400 }}>{daysUntil(e.date)} days away</span>}
                  </div>
                  {e.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", marginTop: 4 }}>💬 {e.note}</div>}
                </div>
                <Btn variant="red" onClick={() => removeEntry(horse.id, e.id)} style={{ padding: "5px 10px", fontSize: 11 }}>✕</Btn>
              </div>
            ))}

            {/* Add entry form */}
            {isAdding && (
              <div style={{ background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Add Provisional Target for {horse.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[
                    { key: "raceName", label: "Race Name", placeholder: "e.g. Mares Handicap Hurdle", full: true },
                    { key: "venue", label: "Venue", placeholder: "e.g. Navan" },
                    { key: "date", label: "Date", type: "date" },
                    { key: "raceRef", label: "Meeting Ref", placeholder: "e.g. Limerick 55 Race A" },
                  ].map(({ key, label, placeholder, type, full }) => (
                    <div key={key} style={{ gridColumn: full ? "1 / -1" : "auto" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                      <input type={type || "text"} placeholder={placeholder} value={entry[key]} onChange={e => setEntry(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Trainer Note (visible to owner)</div>
                  <input type="text" placeholder="e.g. If ground stays soft" value={entry.note} onChange={e => setEntry(p => ({ ...p, note: e.target.value }))} style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={() => addEntry(horse.id)}>Save Target</Btn>
                  <Btn variant="ghost" onClick={() => setShowAdd(null)}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {allProvisional.length > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 18px", marginTop: 8, boxShadow: C.shadow }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>All Provisional Targets — by date</div>
          {[...allProvisional].filter(e => e.date).sort((a, b) => new Date(a.date) - new Date(b.date)).map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <Silk silk={e.horse.silk} size={24} />
              <div style={{ flex: 1, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: C.text }}>{e.horse.name}</span>
                <span style={{ color: C.textMid, marginLeft: 8 }}>{e.raceName} · {e.venue}</span>
                {e.raceRef && <span style={{ color: C.textDim, marginLeft: 6, fontSize: 11 }}>{e.raceRef}</span>}
              </div>
              <span style={{ fontSize: 12, color: C.textMid }}>{new Date(e.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: daysUntil(e.date) <= 16 ? C.amber : C.textMid }}>{daysUntil(e.date)} days</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── RACE PLANNER ─────────────────────────────────────────────────────────────
function RacePlanner({ horses, setHorses }) {
  const [selHorse, setSelHorse] = useState(horses[0]);
  const [races, setRaces] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [lastFetch, setLastFetch] = useState(null);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState({});
  const [loadStage, setLoadStage] = useState({});
  const [shortlisted, setShortlisted] = useState({});
  const [toast, setToast] = useState(null);

  const k = (hId, rId) => `${hId}_${rId}`;

  const showToast = (msg, color = C.green) => { setToast({ msg, color }); setTimeout(() => setToast(null), 4000); };

  const fetchRaces = async () => {
    setFetchStatus("fetching");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 5000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          system: `Parse HRI race conditions PDF into JSON array. Return ONLY raw JSON array, no markdown. Each race: {"id":"r_venue_N","venue":string,"date":"YYYY-MM-DD","raceName":string,"discipline":"Flat|Hurdle|Chase|Bumper|NH Flat","raceType":"Maiden|Novice|Handicap|Novice Handicap|Weight For Age|Beginners|Bumper","grade":"Grade 1|Grade 2|Grade 3|Listed|Ungraded","surface":"Turf|AWT","distanceFurlongs":number,"prizeMoney":number,"ageMin":number,"ageMax":number|null,"sexRestriction":"Open|Mares|Fillies|Colts & Geldings","ratingMax":number|null,"isMaiden":boolean,"isNovice":boolean,"isEBF":boolean,"isSeries":boolean,"entryDeadline":"YYYY-MM-DDTHH:MM","declarationDeadline":"YYYY-MM-DDTHH:MM","forecastGoing":string} Dundalk=AWT, others=Turf.`,
          messages: [{ role: "user", content: "Search for the HRI race conditions page at hri-ras.ie/upcoming-race-conditions or hri-ras.ie and find the most recent weekly race conditions document or PDF. It may be a direct link or embedded. Fetch the document and parse all upcoming Irish horse races into a JSON array. If you cannot find a PDF, search for "HRI race conditions 2026" to find the current document. Return only the JSON array with no markdown." }]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No races");
      const parsed = JSON.parse(match[0]);
      setRaces(parsed); setLastFetch(new Date().toISOString()); setFetchStatus("done");
      showToast(`✓ ${parsed.length} races loaded from HRI`);
    } catch (e) { console.error(e); setFetchStatus("error"); showToast("Failed to fetch — try again", C.red); }
  };

  const eligible = races.filter(r => {
    const age = getAge(selHorse.dob);
    if (age < r.ageMin) return false;
    if (r.ageMax && age > r.ageMax) return false;
    const sexMap = { "Mares": ["Mare", "Filly"], "Fillies": ["Filly"], "Colts & Geldings": ["Colt", "Gelding"] };
    if (r.sexRestriction !== "Open" && !(sexMap[r.sexRestriction] || []).includes(selHorse.sex)) return false;
    if (!selHorse.discipline.includes(r.discipline)) return false;
    if (selHorse.surface !== r.surface) return false;
    const rtg = r.discipline === "Flat" ? selHorse.flatRating : selHorse.nhRating;
    if (r.ratingMax && rtg && rtg > r.ratingMax) return false;
    if (r.isMaiden && !selHorse.isMaiden) return false;
    if (r.isNovice && !selHorse.isNovice) return false;
    if (r.isEBF && !selHorse.isEBF) return false;
    return true;
  });

  const analyse = async (horse, race) => {
    const key = k(horse.id, race.id);
    setLoading(l => ({ ...l, [key]: true })); setLoadStage(s => ({ ...s, [key]: 0 }));
    const timer = setInterval(() => setLoadStage(s => { const c = s[key] ?? 0; if (c < 3) return { ...s, [key]: c + 1 }; clearInterval(timer); return s; }), 2800);
    try { const r = await getAITake(horse, race); clearInterval(timer); setAnalyses(a => ({ ...a, [key]: r })); }
    catch (e) { console.error(e); clearInterval(timer); }
    setLoading(l => ({ ...l, [key]: false }));
  };

  const handleEntry = (horse, race) => {
    const msg = encodeURIComponent(`🏇 RacePlan Pro — ${horse.trainer}\n\n${horse.name} has been entered in the ${race.raceName} at ${race.venue} on ${new Date(race.date).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" })}.\n\nPrize fund: €${race.prizeMoney?.toLocaleString()}\nForecast going: ${race.forecastGoing}\n\nWe'll be in touch closer to declaration day.`);
    const phone = horse.ownerPhone?.replace(/\D/g, "");
    if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    showToast(`✓ Entry confirmed — WhatsApp opened for ${horse.owner}`);
  };

  const handleDeclaration = (horse, race) => {
    const jockey = horse.jockey || "D.J. O'Keeffe";
    const msg = encodeURIComponent(`✅ RacePlan Pro — ${horse.trainer}\n\n${horse.name} is declared to run in the ${race.raceName} at ${race.venue}.\n\nJockey: ${jockey}\nForecast going: ${race.forecastGoing}\n\nWe'll keep you updated on race day.`);
    const phone = horse.ownerPhone?.replace(/\D/g, "");
    if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    showToast(`📋 Declaration confirmed — WhatsApp opened for ${horse.owner}`, C.blue);
  };

  const sorted = [...eligible].sort((a, b) => (analyses[k(selHorse.id, b.id)]?.overall ?? -1) - (analyses[k(selHorse.id, a.id)]?.overall ?? -1));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.navy, color: "#fff", borderRadius: 12, padding: "12px 22px", fontSize: 13, fontWeight: 600, zIndex: 600, boxShadow: C.shadowMd, border: `1px solid ${toast.color}50`, whiteSpace: "nowrap", animation: "slideUp 0.3s ease" }}><span style={{ color: toast.color }}>{toast.msg}</span></div>}

      {/* Horse sidebar */}
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Horses</div>
        {horses.map(h => {
          const sel = selHorse.id === h.id;
          const stCol = h.status === "Active" ? C.green : h.status === "CoolingOff" ? C.amber : C.red;
          return (
            <div key={h.id} onClick={() => setSelHorse(h)} style={{ background: sel ? C.navy : C.card, border: `1.5px solid ${sel ? C.navyLight : C.border}`, borderLeft: `4px solid ${stCol}`, borderRadius: 11, padding: "10px 12px", marginBottom: 7, cursor: "pointer", boxShadow: sel ? C.shadowMd : C.shadow, transition: "all 0.15s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Silk silk={h.silk} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: sel ? "#fff" : C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</div>
                  <div style={{ fontSize: 10, color: sel ? "rgba(255,255,255,0.5)" : C.textMid, marginTop: 1 }}>{getAge(h.dob)}yo · Rtg {h.nhRating || h.flatRating || "—"}{h.headgear ? ` · ${h.headgear}` : ""}</div>
                  <div style={{ marginTop: 4 }}><FormDots form={h.form} /></div>
                </div>
              </div>
              {h.status === "CoolingOff" && <div style={{ marginTop: 5, padding: "2px 7px", background: "rgba(217,119,6,0.12)", borderRadius: 5, fontSize: 10, color: C.amber, fontWeight: 600 }}>⏳ {coolingDate(h.activationDate)?.toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</div>}
              {h.status === "Inactive" && <div style={{ marginTop: 5, padding: "2px 7px", background: "rgba(192,57,43,0.10)", borderRadius: 5, fontSize: 10, color: C.red, fontWeight: 600 }}>✕ Inactive</div>}
            </div>
          );
        })}
      </div>

      {/* Main area */}
      <div>
        {/* HRI Fetch */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12, boxShadow: C.shadow, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>HRI Race Conditions</div>
            <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{lastFetch ? `Updated ${new Date(lastFetch).toLocaleString("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}` : "hri-ras.ie/upcoming-race-conditions"}</div>
            {fetchStatus === "done" && <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 2 }}>✓ {races.length} races · {eligible.length} eligible for {selHorse.name}</div>}
          </div>
          <Btn onClick={fetchRaces} disabled={fetchStatus === "fetching"} style={{ fontSize: 12, padding: "8px 16px" }}>
            {fetchStatus === "fetching" ? "⟳ Fetching…" : `⟳ ${lastFetch ? "Refresh" : "Fetch Now"}`}
          </Btn>
        </div>

        {/* Horse strip */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 12, boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 12 }}>
          <Silk silk={selHorse.silk} size={44} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{selHorse.name}</span>
              <StatusPill status={selHorse.status} activationDate={selHorse.activationDate} />
              {selHorse.headgear && <Tag color={C.purple}>{selHorse.headgear}</Tag>}
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
              <span>{getAge(selHorse.dob)}yo {selHorse.sex}</span>
              <span>Rtg {selHorse.nhRating ?? selHorse.flatRating ?? "—"}</span>
              <span>{selHorse.trainer}</span>
              <span>Owner: {selHorse.owner}</span>
            </div>
            {selHorse.notes && <div style={{ fontSize: 11, color: C.textMid, fontStyle: "italic", marginTop: 4, padding: "4px 8px", background: C.cardOff, borderRadius: 6, borderLeft: `2px solid ${C.borderMid}` }}>💬 {selHorse.notes}</div>}
          </div>
          <FormDots form={selHorse.form} />
        </div>

        {/* Races */}
        {races.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", border: `1.5px dashed ${C.border}`, borderRadius: 14, color: C.textMid }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No race conditions loaded</div>
            <div style={{ fontSize: 13 }}>Tap <strong>Fetch Now</strong> above to pull this week's HRI conditions</div>
          </div>
        ) : eligible.length === 0 ? (
          <div style={{ padding: 32, textAlign: "center", border: `1.5px dashed ${C.border}`, borderRadius: 14, color: C.textMid }}>No eligible races for {selHorse.name} in current conditions</div>
        ) : (
          <>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>{eligible.length} eligible races</div>
            {sorted.map(race => {
              const key = k(selHorse.id, race.id);
              const analysis = analyses[key];
              const isLoading = loading[key];
              const stage = loadStage[key] ?? 0;
              const isSl = !!shortlisted[key];
              const accent = analysis ? (analysis.overall >= 75 ? C.green : analysis.overall >= 55 ? C.amber : C.red) : C.border;

              return (
                <div key={race.id} style={{ background: C.card, borderRadius: 13, border: `1px solid ${isSl ? C.gold + "60" : C.border}`, marginBottom: 12, overflow: "hidden", boxShadow: isSl ? `0 2px 12px ${C.gold}15` : C.shadow }}>
                  <div style={{ height: 3, background: analysis ? `linear-gradient(90deg,${accent},${accent}30)` : isSl ? C.gold : C.border }} />
                  <div style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <div style={{ flex: 1, marginRight: 12 }}>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
                          {race.grade !== "Ungraded" && <Tag color={C.gold}>{race.grade}</Tag>}
                          {race.isEBF && <Tag color={C.purple}>EBF</Tag>}
                          <Tag color={C.textMid} bg="#f0f4f8">{race.discipline} · {race.raceType}</Tag>
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 5 }}>{race.raceName}</div>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                          <span>📍 {race.venue}</span>
                          <span>📅 {new Date(race.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>
                          <span>📏 {race.distanceFurlongs}f</span>
                          <span>🌤 {race.forecastGoing}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 18, fontWeight: 800, color: C.gold, flexShrink: 0 }}>€{race.prizeMoney >= 1000 ? (race.prizeMoney / 1000) + "k" : race.prizeMoney}</span>
                    </div>

                    {race.entryDeadline && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.cardOff, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 10, fontSize: 12 }}>
                        <span style={{ color: C.textMid, fontWeight: 600 }}>Entry closes</span>
                        <span style={{ fontWeight: 700, color: C.amber }}>{new Date(race.entryDeadline).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })} · {new Date(race.entryDeadline).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    )}

                    {!analysis && !isLoading && (
                      <Btn onClick={() => analyse(selHorse, race)} style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>
                        🧠 Get My Take on This Race <span style={{ fontSize: 11, opacity: 0.5, fontWeight: 400 }}>· searches live form & opposition</span>
                      </Btn>
                    )}

                    {isLoading && (
                      <div style={{ padding: "12px 14px", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 9, marginBottom: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8 }}>🧠 Racing brain at work…</div>
                        {["Checking who's in this race…", "Looking at the field…", "Checking trainer record here…", "Building your analysis…"].map((s, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, opacity: i <= stage ? 1 : 0.25 }}>
                            <span style={{ fontSize: 12 }}>{i < stage ? "✓" : i === stage ? "⟳" : "○"}</span>
                            <span style={{ fontSize: 12, color: i <= stage ? C.text : C.textDim }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {analysis && (
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                          {[["HCP", "handicap_edge"], ["Class", "class_fit"], ["Going", "conditions_match"], ["Timing", "timing"], ["Angle", "cuteness"]].map(([label, k2]) => {
                            const v = analysis.scores[k2]; const c = v >= 7 ? C.green : v >= 5 ? C.amber : C.red;
                            return <div key={k2} style={{ flex: 1, textAlign: "center", padding: "6px 2px", background: `${c}10`, borderRadius: 7, border: `1px solid ${c}25` }}><div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div><div style={{ fontSize: 8, color: C.textMid, fontWeight: 600 }}>{label}</div></div>;
                          })}
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${accent}12`, border: `3px solid ${accent}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: accent, lineHeight: 1 }}>{analysis.overall}</span>
                            <span style={{ fontSize: 7, color: C.textMid }}>/100</span>
                          </div>
                        </div>
                        {analysis.bullets.map((b, i) => (
                          <div key={i} style={{ background: C.cardOff, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.navy}`, borderRadius: 9, padding: "11px 13px", marginBottom: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><span style={{ fontSize: 14 }}>{b.icon}</span><span style={{ fontSize: 10, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.8 }}>{b.category}</span></div>
                            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.75, margin: 0 }}>{b.point}</p>
                          </div>
                        ))}
                        <div style={{ background: C.navy, borderRadius: 10, padding: "16px 18px", marginBottom: 10 }}>
                          <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Bottom Line</div>
                          <p style={{ fontSize: 14, color: "#e8edf5", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{analysis.conclusion}</p>
                        </div>
                      </div>
                    )}

                    {!canRace(selHorse) ? (
                      <div style={{ padding: "9px 12px", background: C.amberBg, border: `1px solid ${C.amber}40`, borderRadius: 9, fontSize: 12, color: C.amber, fontWeight: 600, textAlign: "center" }}>
                        ⏳ Cool-off active · eligible {coolingDate(selHorse.activationDate)?.toLocaleDateString("en-IE", { day: "numeric", month: "short" })} · Do not contact owner yet
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        <Btn variant="gold" onClick={() => setShortlisted(s => ({ ...s, [key]: !s[key] }))} style={{ width: "100%", justifyContent: "center" }}>
                          {isSl ? "★ On Shortlist" : "☆ Add to Shortlist"}
                        </Btn>
                        {isSl && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                            <Btn variant="green" onClick={() => handleEntry(selHorse, race)} style={{ justifyContent: "center", flexDirection: "column", gap: 2 }}>
                              <span>✓ Confirm Entry</span>
                              <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>WhatsApp owner</span>
                            </Btn>
                            <button onClick={() => handleDeclaration(selHorse, race)} style={{ padding: "9px", background: C.blueBg, border: `2px solid ${C.blue}50`, borderRadius: 9, color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                              <span>📋 Declare to Run</span>
                              <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>WhatsApp owner + jockey</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

// ─── RACEDAY PRINT ────────────────────────────────────────────────────────────
function RacedayPrint({ horses }) {
  const [entries, setEntries] = useState([
    { id: "e1", horseId: "h3", meetingNo: "47", raceRef: "Race C", venue: "Dundalk", date: "2026-03-25", raceTime: "5:45 PM", raceName: "EBF Median Auction Maiden 7f", ballotNo: "" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [ne, setNe] = useState({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceName: "", ballotNo: "" });

  const add = () => {
    if (!ne.horseId || !ne.raceName) return;
    setEntries(p => [...p, { ...ne, id: `e_${Date.now()}` }]);
    setNe({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceName: "", ballotNo: "" });
    setShowAdd(false);
  };

  const grouped = {};
  entries.forEach(e => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Raceday Whiteboard</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Print and stick on the whiteboard</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={() => setShowAdd(true)}>+ Add Entry</Btn>
          <Btn variant="gold" onClick={() => window.print()}>🖨 Print</Btn>
        </div>
      </div>

      <div id="print-area">
        {Object.entries(grouped).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dayEntries]) => (
          <div key={date} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 14, boxShadow: C.shadow }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${C.navy}` }}>
              {new Date(date).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            {dayEntries.map(entry => {
              const horse = horses.find(h => h.id === entry.horseId);
              if (!horse) return null;
              return (
                <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ minWidth: 130, fontSize: 13, color: C.textMid, fontWeight: 600 }}>
                    {entry.venue} {entry.meetingNo && `Mtg ${entry.meetingNo}`}{entry.raceRef && ` · ${entry.raceRef}`}
                  </div>
                  <div style={{ minWidth: 80, fontSize: 14, fontWeight: 700, color: C.navy }}>{entry.raceTime}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: C.text, textTransform: "uppercase" }}>{horse.name}</span>
                    {horse.headgear && <span style={{ fontSize: 13, color: C.textMid, marginLeft: 8 }}>({horse.headgear})</span>}
                    {entry.ballotNo && <span style={{ fontSize: 13, color: C.purple, marginLeft: 8, fontWeight: 700 }}>[Ballot {entry.ballotNo}]</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{entry.raceName}</div>
                </div>
              );
            })}
          </div>
        ))}
        {entries.length === 0 && <div style={{ padding: 40, textAlign: "center", border: `1.5px dashed ${C.border}`, borderRadius: 14, color: C.textMid }}>No entries added yet — tap + Add Entry</div>}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: C.shadowMd, overflow: "hidden" }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Raceday Entry</div>
              <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "horseId", label: "Horse", type: "select" },
                { key: "venue", label: "Racecourse", placeholder: "e.g. Limerick" },
                { key: "meetingNo", label: "Meeting Number", placeholder: "e.g. 55" },
                { key: "raceRef", label: "Race Reference", placeholder: "e.g. Race A" },
                { key: "raceName", label: "Race Name", placeholder: "e.g. Mares Handicap Hurdle" },
                { key: "raceTime", label: "Race Time", placeholder: "e.g. 2:28 PM" },
                { key: "date", label: "Date", type: "date" },
                { key: "ballotNo", label: "Ballot No. (if applicable)", placeholder: "Leave blank if not balloted" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select value={ne[key]} onChange={e => setNe(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      <option value="">Select horse</option>
                      {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  ) : (
                    <input type={type || "text"} placeholder={placeholder} value={ne[key]} onChange={e => setNe(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                  )}
                </div>
              ))}
              <Btn onClick={add} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>Add to Whiteboard</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── YARD VIEW ────────────────────────────────────────────────────────────────
function YardView({ horses, setHorses }) {
  const [showAdd, setShowAdd] = useState(false);
  const [csvStatus, setCsvStatus] = useState(null);
  const [newHorse, setNewHorse] = useState({ name: "", dob: "", sex: "Gelding", colour: "", nhRating: "", flatRating: "", discipline: "Hurdle", surface: "Turf", status: "Active", owner: "", ownerPhone: "", ownerEmail: "", headgear: "", nextRaceDate: "", notes: "" });

  const handleCSV = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const lines = ev.target.result.split("\n").filter(l => l.trim());
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, "_"));
        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
          if (!cols[0]) continue;
          const row = {}; headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
          const name = row.horse_name || row.name || row.horse || cols[0];
          if (!name) continue;
          imported.push({ id: `h_${Date.now()}_${i}`, name, dob: row.dob || row.date_of_birth || row.foaling_date || "", sex: row.sex || row.gender || "Gelding", colour: row.colour || row.color || "", nhRating: parseInt(row.nh_rating || row.rating || 0) || null, flatRating: parseInt(row.flat_rating || 0) || null, discipline: [row.discipline || "Hurdle"], surface: row.surface || "Turf", status: row.status || row.racing_status || "Active", activationDate: null, owner: row.owner || row.owner_name || "", ownerPhone: row.owner_phone || row.phone || "", ownerEmail: row.owner_email || row.email || "", trainer: row.trainer || "", jockey: row.jockey || "D.J. O'Keeffe", headgear: row.headgear || row.head_gear || "", nextRaceDate: "", goingPref: [], distanceMin: 16, distanceMax: 24, isEBF: false, isMaiden: false, isNovice: false, silk: SILKS[Math.floor(Math.random() * SILKS.length)], notes: row.notes || "", form: [], arrivedDate: todayStr, provisionalEntries: [] });
        }
        setHorses(prev => {
          const updated = [...prev];
          imported.forEach(imp => { const idx = updated.findIndex(h => h.name.toLowerCase() === imp.name.toLowerCase()); if (idx >= 0) { updated[idx] = { ...updated[idx], ...imp, id: updated[idx].id, silk: updated[idx].silk, form: updated[idx].form }; } else { updated.push(imp); } });
          return updated;
        });
        setCsvStatus(`✓ ${imported.length} horses imported`);
        setTimeout(() => setCsvStatus(null), 4000);
      } catch (err) { setCsvStatus("✕ Error reading CSV"); setTimeout(() => setCsvStatus(null), 4000); }
    };
    reader.readAsText(file); e.target.value = "";
  };

  const addHorse = () => {
    if (!newHorse.name) return;
    setHorses(prev => [...prev, { ...newHorse, id: `h_${Date.now()}`, silk: SILKS[Math.floor(Math.random() * SILKS.length)], nhRating: newHorse.nhRating ? parseInt(newHorse.nhRating) : null, flatRating: newHorse.flatRating ? parseInt(newHorse.flatRating) : null, discipline: [newHorse.discipline], isEBF: false, isMaiden: false, isNovice: false, distanceMin: 16, distanceMax: 24, goingPref: [], form: [], arrivedDate: todayStr, provisionalEntries: [] }]);
    setNewHorse({ name: "", dob: "", sex: "Gelding", colour: "", nhRating: "", flatRating: "", discipline: "Hurdle", surface: "Turf", status: "Active", owner: "", ownerPhone: "", ownerEmail: "", headgear: "", nextRaceDate: "", notes: "" });
    setShowAdd(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>My Yard</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>{horses.length} horses · {horses.filter(h => h.status === "Active").length} active</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {csvStatus && <span style={{ fontSize: 12, fontWeight: 700, color: csvStatus.startsWith("✓") ? C.green : C.red }}>{csvStatus}</span>}
          <label style={{ background: C.cardOff, border: `1.5px solid ${C.border}`, color: C.textMid, borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            📥 Import CSV <input type="file" accept=".csv" onChange={handleCSV} style={{ display: "none" }} />
          </label>
          <Btn onClick={() => setShowAdd(true)}>+ Add Horse</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        {[{ l: "Total", v: horses.length, c: C.blue }, { l: "Active", v: horses.filter(h => h.status === "Active").length, c: C.green }, { l: "Cooling Off", v: horses.filter(h => h.status === "CoolingOff").length, c: C.amber }, { l: "Inactive", v: horses.filter(h => h.status === "Inactive").length, c: C.red }].map(s => (
          <div key={s.l} style={{ background: C.card, borderRadius: 10, padding: "13px 16px", borderTop: `4px solid ${s.c}`, boxShadow: C.shadow }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: C.textMid, marginTop: 3, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {horses.map(h => (
        <div key={h.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `4px solid ${h.status === "Active" ? C.green : h.status === "CoolingOff" ? C.amber : C.red}`, borderRadius: 12, padding: "13px 16px", marginBottom: 9, boxShadow: C.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Silk silk={h.silk} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{h.name}</span>
                <StatusPill status={h.status} activationDate={h.activationDate} />
                {h.headgear && <Tag color={C.purple}>{h.headgear}</Tag>}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                <span>{getAge(h.dob)}yo {h.sex} · {h.colour}</span>
                <span>Rtg: {h.nhRating || h.flatRating || "—"}</span>
                <span>Owner: {h.owner}</span>
                {h.ownerPhone && <a href={`https://wa.me/${h.ownerPhone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: C.green, fontWeight: 600, textDecoration: "none" }}>💬 WhatsApp</a>}
              </div>
              <div style={{ marginTop: 5, display: "flex", gap: 6, alignItems: "center" }}><FormDots form={h.form} />{h.notes && <span style={{ fontSize: 11, color: C.textMid, fontStyle: "italic" }}>💬 {h.notes}</span>}</div>
            </div>
          </div>
        </div>
      ))}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadowMd }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Horse</div>
              <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { key: "name", label: "Horse Name", placeholder: "e.g. Bob Olinger" },
                { key: "dob", label: "Date of Birth", type: "date" },
                { key: "sex", label: "Sex", type: "select", options: ["Gelding", "Mare", "Filly", "Colt", "Horse"] },
                { key: "colour", label: "Colour", placeholder: "e.g. Bay" },
                { key: "nhRating", label: "NH Rating", type: "number", placeholder: "e.g. 98" },
                { key: "flatRating", label: "Flat Rating", type: "number", placeholder: "e.g. 74" },
                { key: "discipline", label: "Discipline", type: "select", options: ["Hurdle", "Chase", "Flat", "Bumper"] },
                { key: "surface", label: "Surface", type: "select", options: ["Turf", "AWT"] },
                { key: "status", label: "Status", type: "select", options: ["Active", "CoolingOff", "Inactive"] },
                { key: "owner", label: "Owner", placeholder: "e.g. J. Murphy" },
                { key: "ownerPhone", label: "Owner WhatsApp", type: "tel", placeholder: "+353 86 000 0000" },
                { key: "ownerEmail", label: "Owner Email", type: "email", placeholder: "owner@email.com" },
                { key: "headgear", label: "Headgear", placeholder: "e.g. Cheekpieces" },
                { key: "nextRaceDate", label: "Next Target Date", type: "date" },
                { key: "notes", label: "Trainer Notes", placeholder: "Any notes" },
              ].map(({ key, label, placeholder, type, options }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select value={newHorse[key]} onChange={e => setNewHorse(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type || "text"} placeholder={placeholder} value={newHorse[key]} onChange={e => setNewHorse(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                  )}
                </div>
              ))}
              <Btn onClick={addHorse} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Add Horse to Yard</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MOVEMENT LOG ─────────────────────────────────────────────────────────────
function MovementLog({ horses }) {
  const [movements, setMovements] = useState([
    { id: "m1", horseId: "h2", type: "arrival", date: "2026-02-10", from: "Convalescence yard", contactName: "Dr. J. Murphy", contactPhone: "+353 86 111 0000", notes: "Post wind op recovery complete" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [nm, setNm] = useState({ horseId: "", type: "arrival", date: todayStr, from: "", to: "", contactName: "", contactPhone: "", notes: "" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Horse Movements</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>All arrivals and departures with contact details</div>
        </div>
        <Btn onClick={() => setShowAdd(true)}>+ Log Movement</Btn>
      </div>

      {movements.sort((a, b) => new Date(b.date) - new Date(a.date)).map(mov => {
        const horse = horses.find(h => h.id === mov.horseId);
        if (!horse) return null;
        return (
          <div key={mov.id} style={{ background: C.card, border: `1px solid ${mov.type === "arrival" ? C.green + "30" : C.amber + "30"}`, borderLeft: `3px solid ${mov.type === "arrival" ? C.green : C.amber}`, borderRadius: 12, padding: "13px 16px", marginBottom: 10, boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <Silk silk={horse.silk} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</span>
                  <Tag color={mov.type === "arrival" ? C.green : C.amber}>{mov.type === "arrival" ? "↓ Arrived" : "↑ Departed"}</Tag>
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>{new Date(mov.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ l: mov.type === "arrival" ? "From" : "To", v: mov.type === "arrival" ? mov.from : mov.to }, { l: "Contact", v: mov.contactName }, { l: "Phone", v: mov.contactPhone }, { l: "Notes", v: mov.notes }].filter(i => i.v).map(({ l, v }) => (
                <div key={l} style={{ background: C.cardOff, borderRadius: 8, padding: "7px 10px" }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadowMd }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Log Horse Movement</div>
              <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { key: "horseId", label: "Horse", type: "select" },
                { key: "type", label: "Type", type: "select_type" },
                { key: "date", label: "Date", type: "date" },
                { key: "from", label: "From (arrival)", placeholder: "e.g. Convalescence yard" },
                { key: "to", label: "To (departure)", placeholder: "e.g. Summer grass" },
                { key: "contactName", label: "Contact Name", placeholder: "Person or premises" },
                { key: "contactPhone", label: "Contact Phone", type: "tel", placeholder: "+353..." },
                { key: "notes", label: "Notes", placeholder: "Any relevant notes" },
              ].map(({ key, label, type, placeholder }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select value={nm[key]} onChange={e => setNm(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      <option value="">Select horse</option>
                      {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  ) : type === "select_type" ? (
                    <select value={nm[key]} onChange={e => setNm(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      <option value="arrival">Arrival</option>
                      <option value="departure">Departure</option>
                    </select>
                  ) : (
                    <input type={type || "text"} placeholder={placeholder} value={nm[key]} onChange={e => setNm(p => ({ ...p, [key]: e.target.value }))} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                  )}
                </div>
              ))}
              <Btn onClick={() => { if (!nm.horseId) return; setMovements(p => [...p, { ...nm, id: `m_${Date.now()}` }]); setNm({ horseId: "", type: "arrival", date: todayStr, from: "", to: "", contactName: "", contactPhone: "", notes: "" }); setShowAdd(false); }} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Save Movement</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OWNER PORTAL ─────────────────────────────────────────────────────────────
function OwnerPortal({ horses }) {
  const [selOwner, setSelOwner] = useState(null);

  const owners = [...new Set(horses.map(h => h.owner))].map(name => ({
    name, horses: horses.filter(h => h.owner === name),
    phone: horses.find(h => h.owner === name)?.ownerPhone,
    email: horses.find(h => h.owner === name)?.ownerEmail,
  }));

  if (!selOwner) return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Owner Portal</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>Each owner sees their horses, entries, provisional targets and trainer notes</div>
      {owners.map(o => (
        <div key={o.name} onClick={() => setSelOwner(o)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "13px 16px", marginBottom: 9, cursor: "pointer", boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: C.gold, flexShrink: 0 }}>
            {o.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{o.name}</div>
            <div style={{ fontSize: 12, color: C.textMid }}>{o.horses.length} horse{o.horses.length !== 1 ? "s" : ""} · {o.horses.filter(h => (h.provisionalEntries || []).length > 0).length} with targets</div>
            <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
              {o.horses.map(h => <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 3 }}><Silk silk={h.silk} size={14} /><span style={{ fontSize: 10, color: C.textMid }}>{h.name}</span></div>)}
            </div>
          </div>
          <span style={{ color: C.textMid }}>→</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Btn variant="ghost" onClick={() => setSelOwner(null)} style={{ fontSize: 12, padding: "6px 14px" }}>← All Owners</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          {selOwner.phone && <a href={`https://wa.me/${selOwner.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>💬 WhatsApp</a>}
          {selOwner.phone && <a href={`tel:${selOwner.phone}`} style={{ background: C.blueBg, border: `1px solid ${C.blue}30`, color: C.blue, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>📞 Call</a>}
          {selOwner.email && <a href={`mailto:${selOwner.email}`} style={{ background: C.navy, border: "none", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>✉ Email</a>}
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 14 }}>{selOwner.name}</div>

      {selOwner.horses.map(horse => {
        const provisional = horse.provisionalEntries || [];
        return (
          <div key={horse.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 18px", marginBottom: 14, boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 13 }}>
              <Silk silk={horse.silk} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 4 }}>{horse.name}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                  <span>{getAge(horse.dob)}yo {horse.sex}</span>
                  <span>Rating: {horse.nhRating || horse.flatRating || "—"}</span>
                  {horse.headgear && <span>Headgear: {horse.headgear}</span>}
                </div>
                <StatusPill status={horse.status} activationDate={horse.activationDate} />
              </div>
              <FormDots form={horse.form} />
            </div>

            {/* Provisional targets */}
            {provisional.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Provisional Targets</div>
                {provisional.map(pe => (
                  <div key={pe.id} style={{ padding: "10px 12px", background: C.goldBg, border: `1px solid ${C.gold}30`, borderLeft: `3px solid ${C.gold}`, borderRadius: 9, marginBottom: 7 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{pe.raceName}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                      <span>📍 {pe.venue}</span>
                      {pe.date && <span>📅 {new Date(pe.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "long" })}</span>}
                      {pe.raceRef && <span>{pe.raceRef}</span>}
                    </div>
                    {pe.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", marginTop: 4 }}>💬 {pe.note}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Form */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Recent Form</div>
              {(horse.form || []).slice(0, 3).map((f, i) => {
                const pc = f.position === 1 ? C.green : f.position <= 3 ? C.amber : C.textMid;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: C.cardOff, borderRadius: 8, border: `1px solid ${C.border}`, marginBottom: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: `${pc}12`, border: `1.5px solid ${pc}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: pc }}>{f.position}</div>
                    <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.venue}</span><span style={{ fontSize: 11, color: C.textMid, marginLeft: 6 }}>{f.raceClass} · {f.going}</span></div>
                    <div style={{ fontSize: 11, color: C.textMid }}>{new Date(f.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</div>
                  </div>
                );
              })}
              {(!horse.form || horse.form.length === 0) && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic" }}>No runs recorded yet</div>}
            </div>

            {horse.notes && (
              <div style={{ marginTop: 10, padding: "9px 12px", background: C.cardOff, borderRadius: 8, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Trainer's Note</div>
                <p style={{ fontSize: 13, color: C.textMid, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>{horse.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("planner");
  const [horses, setHorses] = useState(INITIAL_HORSES);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const medAlerts = horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d >= 12 && d <= 16; }).length;

  const NAV = [
    { id: "planner", icon: "🏇", label: "Race Planner" },
    { id: "provisional", icon: "📋", label: "Provisional Entries" },
    { id: "meds", icon: "🏥", label: "Medication Tracker", badge: medAlerts },
    { id: "whiteboard", icon: "🖨", label: "Raceday Whiteboard" },
    { id: "yard", icon: "🐎", label: "My Yard" },
    { id: "movements", icon: "🚪", label: "Horse Movements" },
    { id: "owners", icon: "👤", label: "Owner Portal" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Helvetica Neue',sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        p { margin: 0; }
        button:hover { opacity: 0.88; }
        a:hover { opacity: 0.88; }
        input:focus, select:focus { border-color: #0a1628 !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #b8c8da; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; width: 100%; } }
      `}</style>

      {/* Top Header */}
      <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 16px", boxShadow: "0 2px 10px rgba(10,22,40,0.25)", flexShrink: 0, zIndex: 100, gap: 12 }}>
        {/* Sidebar toggle */}
        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 7, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, fontSize: 16, color: "rgba(255,255,255,0.7)" }}>
          {sidebarOpen ? "◀" : "▶"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: `linear-gradient(135deg,${C.gold},${C.goldLight})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🏇</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1 }}>RacePlan Pro</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>YARD MANAGEMENT</div>
          </div>
        </div>

        {/* Active tab label */}
        <div style={{ marginLeft: 8, padding: "4px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
          {NAV.find(n => n.id === tab)?.icon} {NAV.find(n => n.id === tab)?.label}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {medAlerts > 0 && (
            <button onClick={() => setTab("meds")} style={{ background: C.redBg, border: `1px solid ${C.red}30`, color: C.red, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              🏥 {medAlerts} med alert{medAlerts !== 1 ? "s" : ""}
            </button>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{TODAY.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Collapsible Sidebar */}
        <div style={{ width: sidebarOpen ? 200 : 52, background: C.sidebar, flexShrink: 0, display: "flex", flexDirection: "column", paddingTop: 12, transition: "width 0.2s ease", overflow: "hidden" }}>
          {NAV.map(({ id, icon, label, badge }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)} title={label} style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", background: active ? "rgba(255,255,255,0.10)" : "none", border: "none", borderLeft: `3px solid ${active ? C.gold : "transparent"}`, color: active ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", textAlign: "left", width: "100%", transition: "all 0.12s", whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 17, minWidth: 20, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                {sidebarOpen && <span style={{ flex: 1 }}>{label}</span>}
                {badge > 0 && sidebarOpen && <span style={{ background: C.red, color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{badge}</span>}
                {badge > 0 && !sidebarOpen && <span style={{ position: "absolute", top: 6, right: 6, background: C.red, color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{badge}</span>}
              </button>
            );
          })}

          {/* Yard summary — only when open */}
          {sidebarOpen && (
            <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Yard</div>
              {[{ l: "Active", v: horses.filter(h => h.status === "Active").length, c: C.green }, { l: "Cool-off", v: horses.filter(h => h.status === "CoolingOff").length, c: C.amber }, { l: "Inactive", v: horses.filter(h => h.status === "Inactive").length, c: C.red }].map(s => (
                <div key={s.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 5, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{horses.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minWidth: 0 }}>
          {tab === "planner" && <RacePlanner horses={horses} setHorses={setHorses} />}
          {tab === "provisional" && <ProvisionalEntries horses={horses} setHorses={setHorses} />}
          {tab === "meds" && <MedicationTracker horses={horses} />}
          {tab === "whiteboard" && <RacedayPrint horses={horses} />}
          {tab === "yard" && <YardView horses={horses} setHorses={setHorses} />}
          {tab === "movements" && <MovementLog horses={horses} />}
          {tab === "owners" && <OwnerPortal horses={horses} />}
        </div>
      </div>
    </div>
  );
}
