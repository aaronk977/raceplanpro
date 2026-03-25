import { useState, useCallback } from "react";
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
<svg width={size} height={size} viewBox="0 0 36 36" style={{ flexShrink: 0, filter: "drop
<ellipse cx="18" cy="20" rx="13" ry="11" fill={s.primary} />
<ellipse cx="18" cy="11" rx="7" ry="8" fill={s.primary} />
{s.pattern === "stripes" && <><rect x="5" y="14" width="26" height="3" fill={s.secondar
{s.pattern === "spots" && <><circle cx="12" cy="22" r="2.5" fill={s.secondary} opacity=
{s.pattern === "chevron" && <polyline points="5,18 18,12 31,18" fill="none" stroke={s.s
<ellipse cx="18" cy="8" rx="5" ry="4" fill={s.secondary} opacity="0.92" />
<ellipse cx="18" cy="20" rx="13" ry="11" fill="none" stroke="rgba(0,0,0,0.08)" strokeWi
</svg>
);
}
// ─── DATA ─────────────────────────────────────────────────────────────────────
const TODAY = new Date("2026-03-18");
const todayStr = TODAY.toISOString().split("T")[0];const INITIAL_HORSES = [
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
{ date: "2025-12-28", venue: "Leopardstown", position: 2, runners: 8, raceClass: { date: "2025-03-13", venue: "Cheltenham", position: 1, runners: 13, raceClass: "Grade
"Grade
],
arrivedDate: "2025-08-01", arrivedFrom: "Summer grass",
provisionalEntries: [],
},
{
id: "h2", name: "Dunmore Lady", dob: "2020-04-05", sex: "Mare", colour: "Chestnut",
nhRating: 82, flatRating: null, discipline: ["Hurdle"], surface: "Turf",
status: "CoolingOff", activationDate: "2026-03-14", isEBF: true, isMaiden: false, isNovic
owner: "P. & M. Kelly", ownerPhone: "+353853334444", ownerEmail: "kelly@example.com",
trainer: "P.J. Hennessy", jockey: "P. Townend",
headgear: "Cheekpieces", nextRaceDate: "2026-04-02",
goingPref: ["Soft", "Heavy"], distanceMin: 16, distanceMax: 20,
silk: SILKS[1],
notes: "Back from wind op. Needs soft. Was flying before the op.",
form: [
{ date: "2026-01-15", venue: "Naas", position: 1, runners: 8, raceClass: "Handicap", go
{ date: "2025-11-28", venue: "Thurles", position: 2, runners: 7, raceClass: "Handicap",
],
arrivedDate: "2026-02-10", arrivedFrom: "Convalescence",
provisionalEntries: [{ id: "pe1", venue: "Navan", date: "2026-04-02", raceName: "Mares Ha
},
{
id: "h3", name: "Ardmore Flash", dob: "2022-05-20", sex: "Colt", colour: "Dark Bay",
nhRating: null, flatRating: 74, discipline: ["Flat"], surface: "AWT",
status: "Active", activationDate: null, isEBF: true, isMaiden: true, isNovice: false,
owner: "Ballykea Syndicate", ownerPhone: "+353835556666", ownerEmail: "ballykea@example.c
trainer: "P.J. Hennessy", jockey: "C. Hayes",
headgear: null, nextRaceDate: "2026-03-25",
goingPref: ["Standard", "Fast"], distanceMin: 5, distanceMax: 7,
silk: SILKS[2],
notes: "Keeps finding one. Try cheekpieces. 7f untried but bred for it.",
form: [{ date: "2026-03-01", venue: "Dundalk", position: 2, runners: 10, raceClass: "Maiden",
{ date: "2026-01-17", venue: "Dundalk", position: 3, runners: 12, raceClass: "Maiden",
],
arrivedDate: "2025-03-15", arrivedFrom: "Breeder",
provisionalEntries: [{ id: "pe2", venue: "Dundalk", date: "2026-03-25", raceName: "EBF Me
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
form: [{ date: "2025-12-20", venue: "Leopardstown", position: 4, runners: 14, raceClass:
arrivedDate: "2026-01-05", arrivedFrom: "Post-op recovery",
provisionalEntries: [],
},
];
// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getAge = (dob) => TODAY.getFullYear() - new Date(dob).getFullYear();
const coolingDate = (d) => { if (!d) return null; const x = new Date(d); x.setDate(x.getDate(
const canRace = (h) => { if (h.status === "Inactive") return false; if (h.status === "Cooling
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
peptizole: { label: "Peptizole", color: C.blue, bg: C.blueBg, costPerDay: 18, courseDays: 1
antepsin: { label: "Antepsin", color: C.purple, bg: C.purpleBg, courseDays: 12, withdrawalD
antibiotics: { label: "Antibiotics", color: C.amber, bg: C.amberBg, withdrawalDays: 0 },
};
// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Tag({ children, color, bg }) {
return <span style={{ background: bg || `${color}12`, color, border: `1px solid ${color}30`
}function Btn({ onClick, children, variant = "primary", style: s = {}, disabled = false }) {
const base = { border: "none", borderRadius: 9, padding: "9px 18px", fontSize: 13, fontWeig
const variants = {
primary: { background: C.navy, color: "#fff" },
gold: { background: C.goldBg, color: C.gold, border: `1.5px solid ${C.gold}50` },
green: { background: C.greenBg, color: C.green, border: `1.5px solid ${C.green}40` ghost: { background: "none", color: C.textMid, border: `1px solid ${C.border}` },
red: { background: C.redBg, color: C.red, border: `1px solid ${C.red}30` },
},
};
return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant]
}
function FormDots({ form }) {
return (
<div style={{ display: "flex", gap: 3 }}>
{(form || []).slice(0, 5).map((f, i) => {
const col = f.position === 1 ? C.green : f.position <= 3 ? C.amber : C.textDim;
return <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: f.po
})}
</div>
);
}
function StatusPill({ status, activationDate }) {
const d = coolingDate(activationDate);
const days = d ? Math.ceil((d - TODAY) / 86400000) : 0;
const cfg = {
Active: { bg: C.greenBg, color: C.green, label: "● Active" },
CoolingOff: { bg: C.amberBg, color: C.amber, label: ` Cool-off · ${days}d` },
Inactive: { bg: C.redBg, color: C.red, label: "✕ Inactive" },
}[status];
return <span style={{ ...cfg, border: `1px solid ${cfg.color}40`, borderRadius: 20, padding
}
// ─── AI RACE PLANNER ──────────────────────────────────────────────────────────
async function getAITake(horse, race) {
const lastRun = horse.form?.[0];
const daysSince = lastRun ? Math.floor((TODAY - new Date(lastRun.date)) / 86400000) : null;
const daysToRace = daysUntil(race.date);
const system = `You are a highly experienced Irish racehorse trainer and racing secretary w
Your voice is authentic trainer language: "Not a great race — I'd be going there to win it",
Use web_search to check likely runners and trainer record at the venue before writing.`;const prompt = `Give me your honest take — trainer to trainer. Search first.
HORSE: ${horse.name} | ${getAge(horse.dob)}yo ${horse.sex} | ${horse.trainer} | Rating: ${hor
Headgear: ${horse.headgear || "None"} | ${daysSince ?? "?"} days since last run
Notes: "${horse.notes}"
RACE: ${race.raceName} | ${race.venue} | ${race.date}
${race.grade} ${race.discipline} ${race.raceType} | ${race.distanceFurlongs}f | €${race.prize
Search: "${race.raceName} ${race.venue} 2026 runners" and "${horse.trainer} ${race.venue} rec
Return ONLY raw JSON:
{"scores":{"handicap_edge":7,"class_fit":8,"conditions_match":7,"timing":8,"cuteness":6},"ove
Replace all template text with real analysis. recommendation = STRONG, CONSIDER, WAIT, or PAS
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, tools: [{ typ
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
const monthName = new Date(selYear, selMonth).toLocaleString("en-IE", { month: "long", year
const k = (hId, d, t) => `${hId}_${selYear}_${selMonth}_${d}_${t}`;
const getMed = (hId, d, t) => medLogs[k(hId, d, t)] || 0;
const toggleMed = (hId, d, t) => {setMedLogs(prev => {
const cur = prev[k(hId, d, t)] || 0;
if (t === "antibiotics") return { ...prev, [k(hId, d, t)]: cur === 0 ? 1 : cur === 1 ?
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
return { peptizoleDays, antepsinTicks, antepsinBottles: Math.ceil(antepsinTicks / 4), ant
};
const trackedHorses = horses.filter(h => trackedIds.includes(h.id));
const untrackedHorses = horses.filter(h => h.status !== "Inactive" && !trackedIds.includes(
return (
<div>
{/* Header */}
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", m
<div>
<div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Medication Tracker</d
<div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Tap each day to log ·
</div>
<div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
<Btn variant="ghost" onClick={() => { const d = new Date(selYear, selMonth - 1); se
<span style={{ fontSize: 14, fontWeight: 700, color: C.text, minWidth: 150, textAli
<Btn variant="ghost" onClick={() => { const d = new Date(selYear, selMonth + 1); se
<Btn onClick={() => setShowAdd(true)} disabled={untrackedHorses.length === 0}>+ Add
</div>
</div>
{/* Race timing alerts */}
{horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d >= 12 && d <=
<div key={h.id} style={{ background: C.amberBg, border: `1px solid ${C.amber}40`, bor
<Silk silk={h.silk} size={30} />
<div>
<div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.name} — race in
<div style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}> Start Peptizole
</div>
</div>
))}
{horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d > 0 && d < 12;<div key={h.id} style={{ background: C.redBg, border: `1px solid ${C.red}30`, borderL
<Silk silk={h.silk} size={30} />
<div>
<div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.name} — race in
<div style={{ fontSize: 12, color: C.red, fontWeight: 600 }}> Too close to star
</div>
</div>
))}
}}>Add
{/* Add horse panel */}
{showAdd && (
<div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
<div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 {untrackedHorses.map(h => (
<div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding:
<Silk silk={h.silk} size={30} />
<div style={{ flex: 1 }}>
<div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{h.name}</div>
<div style={{ fontSize: 11, color: C.textMid }}>{h.owner} · {h.status}{h.next
</div>
<Btn variant="green" onClick={() => { setTrackedIds(p => [...p, h.id]); }} styl
</div>
))}
</div>
<Btn variant="ghost" onClick={() => setShowAdd(false)} style={{ marginTop: 8, fontS
)}
{trackedHorses.length === 0 && (
<div style={{ padding: 48, textAlign: "center", border: `1.5px dashed ${C.border}`, b
<div style={{ fontSize: 32, marginBottom: 12 }}> </div>
<div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No h
<div style={{ fontSize: 13, marginBottom: 16 }}>Tap <strong>+ Add Horse</strong> to
</div>
)}
{/* Horse medication rows */}
{trackedHorses.map(horse => {
const isOpen = openHorse === horse.id;
const costs = calcCost(horse.id);
return (
<div key={horse.id} style={{ background: C.card, border: `1px solid ${C.border}`, b
<div onClick={() => setOpenHorse(isOpen ? null : horse.id)} style={{ padding: "14
<Silk silk={horse.silk} size={36} />
<div style={{ flex: 1 }}>
<div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }
<div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
{costs.peptizoleDays > 0 && <Tag color={C.blue}>{costs.peptizoleDays} days{costs.antepsinTicks > 0 && <Tag color={C.purple}>{costs.antepsinTicks} day
{costs.antibioticDoses > 0 && <Tag color={C.amber}>{costs.antibioticDoses}
{costs.total > 0 && <Tag color={C.gold}>Total: €{costs.total}</Tag>}
</div>
</div>
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
<Btn onClick={(e) => { e.stopPropagation(); setBillHorse(horse); setShowBill(
<Btn variant="red" onClick={(e) => { e.stopPropagation(); setTrackedIds(p =>
<span style={{ color: C.textMid, fontSize: 14 }}>{isOpen ? "▲" : "▼"}</span>
</div>
</div>
}}>
{isOpen && (
<div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` {/* Legend */}
<div style={{ display: "flex", gap: 16, padding: "10px 0", marginBottom: 8, f
<div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.b
<div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.p
<div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.a
</div>
<div style={{ overflowX: "auto" }}>
<table style={{ borderCollapse: "collapse", width: "100%", minWidth: <thead>
<tr>
<th style={{ textAlign: "left", padding: "6px 8px", fontSize: 11, fon
{days.map(d => (
<th key={d} style={{ padding: "3px 2px", fontSize: 10, fontWeight:
700 }}
C.ambe
))}
<th style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color
</tr>
</thead>
<tbody>
{[["peptizole", C.blue], ["antepsin", C.purple], ["antibiotics", <tr key={type}>
<td style={{ padding: "5px 8px" }}>
<span style={{ background: `${col}12`, color: col, borderRadius:
</td>
{days.map(d => {
const val = getMed(horse.id, d, type);
const isFuture = isCurrent && d > todayD;
return (
<td key={d} style={{ padding: "2px 2px", textAlign: "center" }}
<button onClick={() => !isFuture && toggleMed(horse.id, d, ty
{val > 0 ? val : ""}
</button>
</td>
);})}
<td style={{ padding: "5px 8px", textAlign: "right", fontSize: 13,
{type === "peptizole" && `€${costs.peptizole}`}
{type === "antepsin" && `${costs.antepsinBottles} bot · €${costs.
{type === "antibiotics" && `€${costs.antibiotics}`}
</td>
</tr>
))}
</tbody>
</table>
</div>
{/* Withdrawal deadlines */}
{horse.nextRaceDate && (
<div style={{ marginTop: 10, padding: "10px 12px", background: C.cardOff, b
<div style={{ fontSize: 12, fontWeight: 700, color: C.text }}> Withdraw
{[{ label: "Stop Peptizole", wd: 4 }, { label: "Stop Antepsin", wd: 1 }].
const stop = new Date(horse.nextRaceDate); stop.setDate(stop.getDate()
return <div key={label} style={{ fontSize: 12, color: C.textMid }}><spa
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
<div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex
<div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 420,
<div style={{ background: C.navy, padding: "18px 22px", display: "flex", justif
<div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Monthly Me
<button onClick={() => setShowBill(false)} style={{ background: "rgba(255,255
</div>
<div style={{ padding: 22 }}>
<div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, textTransform:
{[
costs.peptizoleDays > 0 && { label: `Peptizole — ${costs.peptizoleDays} day
costs.antepsinTicks > 0 && { label: `Antepsin — ${costs.antepsinBottles} bo
costs.antibioticDoses > 0 && { label: `Antibiotics — ${costs.antibioticDose
].filter(Boolean).map((item, i) => (
<div key={i} style={{ display: "flex", justifyContent: "space-between", pad
<span style={{ fontSize: 14, color: C.text }}>{item.label}</span>
<span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>€{item.amo</div>
))}
{costs.total === 0 && <div style={{ padding: "20px 0", textAlign: "center", c
{costs.total > 0 && (
<div style={{ display: "flex", justifyContent: "space-between", padding: "1
<span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Total</spa
<span style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>€{costs.to
</div>
)}
</div>
</div>
</div>
<Btn onClick={() => window.print()} style={{ width: "100%", marginTop: 16, ju
);
})()}
</div>
);
}
// ─── PROVISIONAL ENTRIES ──────────────────────────────────────────────────────
function ProvisionalEntries({ horses, setHorses }) {
const [showAdd, setShowAdd] = useState(null);
const [note, setNote] = useState("");
const [selectedRaceId, setSelectedRaceId] = useState("");
const [raceSearch, setRaceSearch] = useState("");
// Shared race pool — both sources combined
const [racePool, setRacePool] = useState([]);
const [fetchStatus, setFetchStatus] = useState("idle");
const [lastFetch, setLastFetch] = useState(null);
const [fetchSource, setFetchSource] = useState("both"); // both | conditions | provisional
const fetchRaces = async () => {
setFetchStatus("fetching");
try {
// Fetch both sources in parallel
const [condRes, provRes] = await Promise.all([
fetch("https://api.anthropic.com/v1/messages", {
method: "POST", headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514", max_tokens: 5000,
tools: [{ type: "web_search_20250305", name: "web_search" }],
system: `Parse HRI race conditions PDFs into a JSON array. Return ONLY raw JSON a
messages: [{ role: "user", content: "Fetch https://www.hri-ras.ie/upcoming-race-c
})
}),
fetch("https://api.anthropic.com/v1/messages", {method: "POST", headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514", max_tokens: 5000,
tools: [{ type: "web_search_20250305", name: "web_search" }],
system: `Parse HRI provisional summary PDFs into a JSON array. Return ONLY raw JS
messages: [{ role: "user", content: "Fetch https://www.hri-ras.ie/provisional-sum
})
})
]);
const [condData, provData] = await Promise.all([condRes.json(), provRes.json()]);
const parseRaces = (data) => {
const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").t
const match = text.match(/\[[\s\S]*\]/);
return match ? JSON.parse(match[0]) : [];
};
const conditions = parseRaces(condData);
const provisional = parseRaces(provData);
const combined = [...conditions, ...provisional];
setRacePool(combined);
setLastFetch(new Date().toISOString());
setFetchStatus("done");
} catch (e) {
console.error(e);
setFetchStatus("error");
}
};
const filteredRaces = racePool.filter(r => {
if (!raceSearch) return true;
const q = raceSearch.toLowerCase();
return r.raceName?.toLowerCase().includes(q) || r.venue?.toLowerCase().includes(q) || r.m
});
const selectedRace = racePool.find(r => r.id === selectedRaceId);
const addEntry = (horseId) => {
if (!selectedRace) return;
const newEntry = {
id: `pe_${Date.now()}`,
raceName: selectedRace.raceName,
venue: selectedRace.venue,
date: selectedRace.date,
raceRef: `${selectedRace.meetingRef || ""} ${selectedRace.raceRef || ""}`.trim(),meetingRef: selectedRace.meetingRef,
discipline: selectedRace.discipline,
grade: selectedRace.grade,
distanceFurlongs: selectedRace.distanceFurlongs,
prizeMoney: selectedRace.prizeMoney,
forecastGoing: selectedRace.forecastGoing,
entryDeadline: selectedRace.entryDeadline,
source: selectedRace.source,
note,
};
setHorses(prev => prev.map(h => h.id === horseId
? { ...h, provisionalEntries: [...(h.provisionalEntries || []), newEntry] }
: h
));
setSelectedRaceId("");
setRaceSearch("");
setNote("");
setShowAdd(null);
};
const removeEntry = (horseId, entryId) => {
setHorses(prev => prev.map(h => h.id === horseId
? { ...h, provisionalEntries: (h.provisionalEntries || []).filter(e => e.id !== entryId
: h
));
};
const allProvisional = horses.flatMap(h => (h.provisionalEntries || []).map(e => ({ ...e, h
const conditionCount = racePool.filter(r => r.source === "conditions").length;
const provisionalCount = racePool.filter(r => r.source === "provisional").length;
return (
<div>
<div>
</div>
</div>
</div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start
<div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Provisional Entries</
<div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
Plan targets before official entries · select races from HRI · visible to owners
{/* Fetch panel */}
<div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, pa
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
<div>
<div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>HR<div style={{ fontSize: 12, color: C.textMid }}>
{lastFetch
? `Updated ${new Date(lastFetch).toLocaleString("en-IE", { day: "numeric", mo
: "Fetch both sources to select races for each horse"}
</div>
{fetchStatus === "error" && <div style={{ fontSize: 12, color: C.red, fontWeight:
</div>
<Btn onClick={fetchRaces} disabled={fetchStatus === "fetching"} style={{ fontSize:
{fetchStatus === "fetching"
? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block
: <><span>⟳</span> {lastFetch ? "Refresh" : "Fetch Race Conditions + Provisiona
}
</Btn>
</div>
{/* Race pool summary by source */}
{racePool.length > 0 && (
<div style={{ display: "flex", gap: 10 }}>
<div style={{ flex: 1, padding: "10px 14px", background: C.navyMid + "15", border
<div style={{ fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "upp
<div style={{ fontSize: 20, fontWeight: 800, color: C.navy }}>{conditionCount}<
<div style={{ fontSize: 11, color: C.textMid }}>upcoming races</div>
</div>
<div style={{ flex: 1, padding: "10px 14px", background: C.goldBg, border: `1px s
<div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "upp
<div style={{ fontSize: 20, fontWeight: 800, color: C.gold }}>{provisionalCount
<div style={{ fontSize: 11, color: C.textMid }}>planning races</div>
</div>
<div style={{ flex: 1, padding: "10px 14px", background: C.greenBg, border: `1px
<div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "up
<div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{racePool.length
<div style={{ fontSize: 11, color: C.textMid }}>races to pick from</div>
</div>
</div>
)}
{fetchStatus === "idle" && racePool.length === 0 && (
<div style={{ padding: "20px 0", textAlign: "center", color: C.textMid, fontSize: 1
Tap <strong>Fetch</strong> to load this week's race conditions and provisional su
</div>
)}
</div>
{/* Per-horse */}
{horses.filter(h => h.status !== "Inactive").map(horse => {
const entries = horse.provisionalEntries || [];
const isAdding = showAdd === horse.id;return (
<div key={horse.id} style={{ background: C.card, border: `1px solid ${C.border}`, b
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: entri
<Silk silk={horse.silk} size={36} />
<div style={{ flex: 1 }}>
<div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</d
<div style={{ fontSize: 12, color: C.textMid }}>{horse.owner} · {entries.leng
</div>
<Btn
variant="gold"
onClick={() => { setShowAdd(isAdding ? null : horse.id); setSelectedRaceId(""
style={{ fontSize: 12, padding: "6px 14px" }}
disabled={racePool.length === 0 && !isAdding}
>
{isAdding ? "Cancel" : racePool.length === 0 ? "Fetch races first" : "+ Add T
</Btn>
</div>
10, pa
{/* Existing entries */}
{entries.map(e => (
<div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: <div style={{ flex: 1 }}>
<div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wra
<span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{e.raceNam
{e.raceRef && <Tag color={C.navy} bg="rgba(10,22,40,0.07)">{e.raceRef}</T
<Tag color={e.source === "conditions" ? C.blue : C.gold}>{e.source === "c
</div>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, col
<span> {e.venue}</span>
{e.date && <span> {new Date(e.date).toLocaleDateString("en-IE", { weekd
{e.distanceFurlongs && <span> {e.distanceFurlongs}f</span>}
{e.prizeMoney && <span style={{ color: C.gold, fontWeight: 600 }}>€{e.pri
{e.date && daysUntil(e.date) > 0 && (
<span style={{ color: daysUntil(e.date) <= 16 ? C.amber : C.textMid, fo
{daysUntil(e.date)} days away
{daysUntil(e.date) <= 16 && " — start meds"}
</span>
)}
</div>
{e.entryDeadline && (
<div style={{ fontSize: 11, color: C.red, fontWeight: 600, marginTop: 3 }
Entry closes: {new Date(e.entryDeadline).toLocaleDateString("en-IE",
</div>
)}
{e.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic
</div><Btn variant="red" onClick={() => removeEntry(horse.id, e.id)} style={{ paddi
</div>
))}
{/* Add target form — race picker */}
{isAdding && (
<div style={{ background: C.cardOff, border: `1px solid ${C.border}`, borderRad
<div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12
Select a race for {horse.name}
<span style={{ fontSize: 11, color: C.textMid, fontWeight: 400, marginLeft:
</div>
{/* Search */}
<div style={{ marginBottom: 10 }}>
<div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom
<input
type="text"
placeholder="Type venue, race name, or meeting ref…"
value={raceSearch}
onChange={e => { setRaceSearch(e.target.value); setSelectedRaceId(""); }}
style={{ width: "100%", background: C.card, border: `1px solid ${C.border
/>
</div>
{/* Race list */}
<div style={{ maxHeight: 280, overflowY: "auto", border: `1px solid ${C.borde
{filteredRaces.length === 0 && (
<div style={{ padding: 20, textAlign: "center", color: C.textMid, fontSiz
{raceSearch ? "No races match your search" : "No races loaded — fetch f
</div>
)}
{filteredRaces.map(r => {
const selected = selectedRaceId === r.id;
return (
<div
key={r.id}
onClick={() => setSelectedRaceId(r.id)}
style={{ padding: "10px 14px", cursor: "pointer", background: selecte
>
<div style={{ display: "flex", justifyContent: "space-between", align
<div style={{ flex: 1 }}>
<div style={{ fontSize: 13, fontWeight: 700, color: selected ? "#
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize
<span>{r.meetingRef}{r.raceRef ? ` · ${r.raceRef}` : ""}</span>
<span> {r.venue}</span>
{r.date && <span> {new Date(r.date).toLocaleDateString("en-IE
{r.distanceFurlongs && <span>{r.distanceFurlongs}f</span>}{r.discipline && <span>{r.discipline}</span>}
</div>
</div>
<div style={{ display: "flex", flexDirection: "column", alignItems:
{r.prizeMoney && <span style={{ fontSize: 12, fontWeight: 700, co
<span style={{ fontSize: 10, background: r.source === "conditions
{r.source === "conditions" ? "Conditions" : "Provisional"}
</span>
</div>
</div>
</div>
);
})}
</div>
{/* Selected race preview */}
{selectedRace && (
<div style={{ padding: "10px 12px", background: C.greenBg, border: `1px sol
<div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom
<div style={{ fontSize: 11, color: C.textMid }}>{selectedRace.venue} · {s
{selectedRace.entryDeadline && <div style={{ fontSize: 11, color: C.red,
</div>
)}
{/* Trainer note */}
<div style={{ marginBottom: 10 }}>
<div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom
<input
type="text"
placeholder="e.g. If ground stays soft · subject to handicap mark"
value={note}
onChange={e => setNote(e.target.value)}
style={{ width: "100%", background: C.card, border: `1px solid ${C.border
/>
</div>
<div style={{ display: "flex", gap: 8 }}>
<Btn onClick={() => addEntry(horse.id)} disabled={!selectedRace} style={{ f
Add Target for {horse.name}
</Btn>
<Btn variant="ghost" onClick={() => setShowAdd(null)} style={{ fontSize: 12
</div>
</div>
)}
</div>
);
})}{/* All targets sorted by date */}
{allProvisional.length > 0 && (
<div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
<div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>All
{[...allProvisional].filter(e => e.date).sort((a, b) => new Date(a.date) - new Date
<div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8
<Silk silk={e.horse.silk} size={22} />
<div style={{ flex: 1, fontSize: 13 }}>
<span style={{ fontWeight: 700, color: C.text }}>{e.horse.name}</span>
<span style={{ color: C.textMid, marginLeft: 8 }}>{e.raceName} · {e.venue}</s
{e.raceRef && <span style={{ color: C.textDim, marginLeft: 6, fontSize: 11 }}
</div>
<span style={{ fontSize: 12, color: C.textMid }}>{new Date(e.date).toLocaleDate
<span style={{ fontSize: 12, fontWeight: 700, color: daysUntil(e.date) <= 16 ?
{daysUntil(e.date) > 0 ? `${daysUntil(e.date)}d` : "past"}
</span>
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
const showToast = (msg, color = C.green) => { setToast({ msg, color }); setTimeout(() => se
const fetchRaces = async () => {
setFetchStatus("fetching");
try {
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST",headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514", max_tokens: 5000,
tools: [{ type: "web_search_20250305", name: "web_search" }],
system: `Parse HRI race conditions PDF into JSON array. Return ONLY raw JSON array,
messages: [{ role: "user", content: "Fetch https://www.hri-ras.ie/upcoming-race-con
})
});
const data = await res.json();
const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").tri
const match = text.match(/\[[\s\S]*\]/);
if (!match) throw new Error("No races");
const parsed = JSON.parse(match[0]);
setRaces(parsed); setLastFetch(new Date().toISOString()); setFetchStatus("done");
showToast(`✓ ${parsed.length} races loaded from HRI`);
} catch (e) { console.error(e); setFetchStatus("error"); showToast("Failed to fetch — try
};
const eligible = races.filter(r => {
const age = getAge(selHorse.dob);
if (age < r.ageMin) return false;
if (r.ageMax && age > r.ageMax) return false;
const sexMap = { "Mares": ["Mare", "Filly"], "Fillies": ["Filly"], "Colts & Geldings": ["
if (r.sexRestriction !== "Open" && !(sexMap[r.sexRestriction] || []).includes(selHorse.se
if (!selHorse.discipline.includes(r.discipline)) return false;
if (selHorse.surface !== r.surface) return false;
const rtg = r.discipline === "Flat" ? selHorse.flatRating : selHorse.nhRating;
if (r.ratingMax && rtg && rtg > r.ratingMax) return false;
if (r.isMaiden && !selHorse.isMaiden) return false;
if (r.isNovice && !selHorse.isNovice) return false;
if (r.isEBF && !selHorse.isEBF) return false;
return true;
});
3) ret
const analyse = async (horse, race) => {
const key = k(horse.id, race.id);
setLoading(l => ({ ...l, [key]: true })); setLoadStage(s => ({ ...s, [key]: 0 }));
const timer = setInterval(() => setLoadStage(s => { const c = s[key] ?? 0; if (c < try { const r = await getAITake(horse, race); clearInterval(timer); setAnalyses(a => ({ .
catch (e) { console.error(e); clearInterval(timer); }
setLoading(l => ({ ...l, [key]: false }));
};
const handleEntry = (horse, race) => {
const msg = encodeURIComponent(` RacePlan Pro — ${horse.trainer}\n\n${horse.name} has b
const phone = horse.ownerPhone?.replace(/\D/g, "");
if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");showToast(`✓ Entry confirmed — WhatsApp opened for ${horse.owner}`);
};
const handleDeclaration = (horse, race) => {
const jockey = horse.jockey || "D.J. O'Keeffe";
const msg = encodeURIComponent(` RacePlan Pro — ${horse.trainer}\n\n${horse.name} is de
const phone = horse.ownerPhone?.replace(/\D/g, "");
if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
showToast(` Declaration confirmed — WhatsApp opened for ${horse.owner}`, C.blue);
};
const sorted = [...eligible].sort((a, b) => (analyses[k(selHorse.id, b.id)]?.overall ?? -1)
return (
<div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
{toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "transla
{/* Horse sidebar */}
<div>
<div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, ma
{horses.map(h => {
const sel = selHorse.id === h.id;
const stCol = h.status === "Active" ? C.green : h.status === "CoolingOff" ? C.amber
return (
<div key={h.id} onClick={() => setSelHorse(h)} style={{ background: sel ? C.navy
<div style={{ display: "flex", alignItems: "center", gap: 9 }}>
<Silk silk={h.silk} size={32} />
<div style={{ flex: 1, minWidth: 0 }}>
<div style={{ fontSize: 13, fontWeight: 700, color: sel ? "#fff" : C.text,
<div style={{ fontSize: 10, color: sel ? "rgba(255,255,255,0.5)" : C.textMi
<div style={{ marginTop: 4 }}><FormDots form={h.form} /></div>
</div>
</div>
{h.status === "CoolingOff" && <div style={{ marginTop: 5, padding: "2px 7px", b
{h.status === "Inactive" && <div style={{ marginTop: 5, padding: "2px 7px", bac
</div>
);
})}
</div>
{/* Main area */}
<div>
{/* HRI Fetch */}
<div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
<div>
<div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>HRI Race Conditions
<div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{lastFetch ? `Updat{fetchStatus === "done" && <div style={{ fontSize: 11, color: C.green, fontWeight
</div>
<Btn onClick={fetchRaces} disabled={fetchStatus === "fetching"} style={{ fontSize:
{fetchStatus === "fetching" ? "⟳ Fetching…" : `⟳ ${lastFetch ? "Refresh" : "Fetch
</Btn>
</div>
{/* Horse strip */}
<div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12,
<Silk silk={selHorse.silk} size={44} />
<div style={{ flex: 1 }}>
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fle
<span style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{selHorse.name}<
<StatusPill status={selHorse.status} activationDate={selHorse.activationDate} /
{selHorse.headgear && <Tag color={C.purple}>{selHorse.headgear}</Tag>}
</div>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.
<span>{getAge(selHorse.dob)}yo {selHorse.sex}</span>
<span>Rtg {selHorse.nhRating ?? selHorse.flatRating ?? "—"}</span>
<span>{selHorse.trainer}</span>
<span>Owner: {selHorse.owner}</span>
</div>
{selHorse.notes && <div style={{ fontSize: 11, color: C.textMid, fontStyle: "ital
</div>
<FormDots form={selHorse.form} />
</div>
{/* Races */}
{races.length === 0 ? (
<div style={{ padding: 40, textAlign: "center", border: `1.5px dashed ${C.border}`,
<div style={{ fontSize: 26, marginBottom: 10 }}> </div>
<div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No
<div style={{ fontSize: 13 }}>Tap <strong>Fetch Now</strong> above to pull this w
</div>
) : eligible.length === 0 ? (
<div style={{ padding: 32, textAlign: "center", border: `1.5px dashed ${C.border}`,
) : (
<>
<div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.5
{sorted.map(race => {
const key = k(selHorse.id, race.id);
const analysis = analyses[key];
const isLoading = loading[key];
const stage = loadStage[key] ?? 0;
const isSl = !!shortlisted[key];
const accent = analysis ? (analysis.overall >= 75 ? C.green : analysis.overallreturn (
<div key={race.id} style={{ background: C.card, borderRadius: 13, border: `1p
<div style={{ height: 3, background: analysis ? `linear-gradient(90deg,${ac
<div style={{ padding: "14px 16px" }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItem
<div style={{ flex: 1, marginRight: 12 }}>
<div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom
{race.grade !== "Ungraded" && <Tag color={C.gold}>{race.grade}</Tag
{race.isEBF && <Tag color={C.purple}>EBF</Tag>}
<Tag color={C.textMid} bg="#f0f4f8">{race.discipline} · {race.raceT
</div>
<div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeigh
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 1
<span> {race.venue}</span>
<span> {new Date(race.date).toLocaleDateString("en-IE", { weekday
<span> {race.distanceFurlongs}f</span>
<span> {race.forecastGoing}</span>
</div>
</div>
<span style={{ fontSize: 18, fontWeight: 800, color: C.gold, flexShrink
</div>
{race.entryDeadline && (
<div style={{ display: "flex", alignItems: "center", gap: 8, padding: "
<span style={{ color: C.textMid, fontWeight: 600 }}>Entry closes</spa
<span style={{ fontWeight: 700, color: C.amber }}>{new Date(race.entr
</div>
)}
{!analysis && !isLoading && (
<Btn onClick={() => analyse(selHorse, race)} style={{ width: "100%", ju
Get My Take on This Race <span style={{ fontSize: 11, opacity: 0.5
</Btn>
)}
{isLoading && (
<div style={{ padding: "12px 14px", background: C.cardOff, border: `1px
<div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBot
{["Checking who's in this race…", "Looking at the field…", "Checking
<div key={i} style={{ display: "flex", alignItems: "center", gap: 8
<span style={{ fontSize: 12 }}>{i < stage ? "✓" : i === stage ? "
<span style={{ fontSize: 12, color: i <= stage ? C.text : C.textD
</div>
))}
</div>
)}{analysis && (
<div style={{ marginBottom: 10 }}>
<div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
{[["HCP", "handicap_edge"], ["Class", "class_fit"], ["Going", "cond
const v = analysis.scores[k2]; const c = v >= 7 ? C.green : v >=
return <div key={k2} style={{ flex: 1, textAlign: "center", paddi
})}
<div style={{ width: 44, height: 44, borderRadius: "50%", backgroun
<span style={{ fontSize: 15, fontWeight: 800, color: accent, line
<span style={{ fontSize: 7, color: C.textMid }}>/100</span>
</div>
</div>
{analysis.bullets.map((b, i) => (
<div key={i} style={{ background: C.cardOff, border: `1px solid ${C
<div style={{ display: "flex", alignItems: "center", gap: 6, marg
<p style={{ fontSize: 13, color: C.text, lineHeight: 1.75, margin
</div>
))}
<div style={{ background: C.navy, borderRadius: 10, padding: "16px 18
<div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,25
<p style={{ fontSize: 14, color: "#e8edf5", lineHeight: 1.8, margin
</div>
</div>
)}
{!canRace(selHorse) ? (
<div style={{ padding: "9px 12px", background: C.amberBg, border: `1px
Cool-off active · eligible {coolingDate(selHorse.activationDate)?.
</div>
) : (
<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
<Btn variant="gold" onClick={() => setShortlisted(s => ({ ...s, [key]
{isSl ? "★ On Shortlist" : "☆ Add to Shortlist"}
</Btn>
{isSl && (
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap:
<Btn variant="green" onClick={() => handleEntry(selHorse, race)}
<span>✓ Confirm Entry</span>
<span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>W
</Btn>
<button onClick={() => handleDeclaration(selHorse, race)} style={
<span> Declare to Run</span>
<span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>W
</button>
</div>
)}
</div>)}
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
{ id: "e1", horseId: "h3", meetingNo: "47", raceRef: "Race C", venue: "Dundalk", date: "2
]);
const [showAdd, setShowAdd] = useState(false);
const [showImport, setShowImport] = useState(false);
const [importMode, setImportMode] = useState("screenshot");
const [emailText, setEmailText] = useState("");
const [importStatus, setImportStatus] = useState(null);
const [importing, setImporting] = useState(false);
const [ne, setNe] = useState({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: ""
const add = () => {
if (!ne.horseId || !ne.raceName) return;
setEntries(p => [...p, { ...ne, id: `e_${Date.now()}` }]);
setNe({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceN
setShowAdd(false);
};
const matchHorse = (name) => horses.find(h =>
h.name.toLowerCase() === name?.toLowerCase() ||
h.name.toLowerCase().includes(name?.toLowerCase()) ||
name?.toLowerCase().includes(h.name.toLowerCase().split(" ")[0])
);
const handleScreenshot = async (e) => {
const file = e.target.files[0]; if (!file) return;
setImporting(true); setImportStatus("Reading your screenshot…"); e.target.value = "";
try {
const reader = new FileReader();
reader.onload = async (ev) => {
const base64 = ev.target.result.split(",")[1];
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST", headers: { "Content-Type": "application/json" },body: JSON.stringify({
model: "claude-sonnet-4-20250514", max_tokens: 2000,
messages: [{ role: "user", content: [
{ type: "image", source: { type: "base64", media_type: file.type, data: base64
{ type: "text", text: `This is a screenshot of pending race engagements from a
]}]
})
});
const data = await res.json();
const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").t
const match = text.match(/\[[\s\S]*\]/);
if (!match) throw new Error("No entries found");
const parsed = JSON.parse(match[0]);
let matched = 0;
const newEntries = parsed.map(pe => {
const horse = matchHorse(pe.horseName);
if (horse) matched++;
return { id: `e_${Date.now()}_${Math.random()}`, horseId: horse?.id || "", horseNam
});
setEntries(prev => [...prev, ...newEntries]);
setImportStatus(`✓ ${parsed.length} entries imported · ${matched} horses matched`);
setImporting(false);
};
reader.readAsDataURL(file);
} catch (err) { setImportStatus("✕ Could not read screenshot — try again"); setImporting(
};
const handleEmailParse = async () => {
if (!emailText.trim()) return;
setImporting(true); setImportStatus("Parsing email…");
try {
const res = await fetch("https://api.anthropic.com/v1/messages", {
method: "POST", headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "claude-sonnet-4-20250514", max_tokens: 2000,
messages: [{ role: "user", content: `This is a UK/international foreign entry confi
})
});
const data = await res.json();
const text = data.content?.filter(b => b.type === "text").map(b => b.text).join("").tri
const match = text.match(/\[[\s\S]*\]/);
if (!match) throw new Error("No entries found");
const parsed = JSON.parse(match[0]);
let matched = 0;
const newEntries = parsed.map(pe => {
const horse = matchHorse(pe.horseName);
if (horse) matched++;return { id: `e_${Date.now()}_${Math.random()}`, horseId: horse?.id || "", horseName:
});
setEntries(prev => [...prev, ...newEntries]);
setEmailText(""); setImportStatus(`✓ ${parsed.length} UK/international entries imported
setImporting(false);
} catch (err) { setImportStatus("✕ Could not parse email — try again"); setImporting(fals
};
const grouped = {};
entries.forEach(e => { const k = e.date || "Undated"; if (!grouped[k]) grouped[k] = []; gro
return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", m
<div>
<div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Raceday Whiteboard</d
<div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Import from screensho
</div>
<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
<Btn variant="ghost" onClick={() => { setShowImport(!showImport); setImportMode("sc
<Btn variant="ghost" onClick={() => { setShowImport(!showImport); setImportMode("em
<Btn onClick={() => setShowAdd(true)} style={{ fontSize: 12 }}>+ Manual</Btn>
<Btn variant="gold" onClick={() => window.print()} style={{ fontSize: 12 }}> </div>
</div>
Prin
{showImport && (
<div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
<div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
{[["screenshot", " Screenshot of pending engagements"], ["email", "✉ UK foreign
<button key={mode} onClick={() => setImportMode(mode)} style={{ padding: "7px 1
))}
</div>
{importMode === "screenshot" && (
<div>
<div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>
<div style={{ fontSize: 12, color: C.textMid, marginBottom: 14, lineHeight: 1.7
Take a screenshot of your pending engagements from HRI RÁS or any racing syst
</div>
<label style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroun
{importing ? "⟳ Reading image…" : " Choose Screenshot"}
<input type="file" accept="image/*" onChange={handleScreenshot} disabled={imp
</label>
</div>
)}{importMode === "email" && (
<div>
<div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>
<div style={{ fontSize: 12, color: C.textMid, marginBottom: 12, lineHeight: 1.7
Copy the full text of your foreign entry confirmation from the BHA or any UK/
</div>
<textarea value={emailText} onChange={e => setEmailText(e.target.value)} placeh
<Btn onClick={handleEmailParse} disabled={importing || !emailText.trim()}>{impo
</div>
)}
{importStatus && (
<div style={{ marginTop: 12, padding: "9px 14px", background: importStatus.starts
{importStatus}
</div>
)}
</div>
)}
{entries.filter(e => !e.horseId && e.horseName).length > 0 && (
<div style={{ background: C.amberBg, border: `1px solid ${C.amber}30`, borderRadius:
{entries.filter(e => !e.horseId && e.horseName).length} entries need a horse ass
</div>
)}
<div id="print-area">
{Object.entries(grouped).sort(([a], [b]) => { if (a === "Undated") return 1; if (b ==
<div key={date} style={{ background: C.card, border: `1px solid ${C.border}`, borde
<div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 12, pad
{date === "Undated" ? "Date TBC" : (() => { try { return new Date(date).toLocal
</div>
{dayEntries.map(entry => {
const horse = horses.find(h => h.id === entry.horseId);
return (
<div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 12,
<div style={{ minWidth: 140, fontSize: 12, color: C.textMid, fontWeight: 60
{entry.venue}{entry.country ? " " : ""}{entry.meetingNo ? ` Mtg ${entry
</div>
<div style={{ minWidth: 70, fontSize: 13, fontWeight: 700, color: C.navy }}
<div style={{ flex: 1 }}>
{horse ? (
<><span style={{ fontSize: 17, fontWeight: 800, color: C.text, textTran
) : (
<span style={{ fontSize: 14, fontWeight: 700, color: C.amber }}> {ent
)}
</div>
<div style={{ fontSize: 11, color: C.textMid, maxWidth: 180, textAlign: "ri{entry.prizeValue && <div style={{ fontSize: 11, fontWeight: 700, color: C.
<button onClick={() => setEntries(p => p.filter(e => e.id !== entry.id))} s
</div>
);
})}
</div>
))}
{entries.length === 0 && (
<div style={{ padding: 48, textAlign: "center", border: `1.5px dashed ${C.border}`,
<div style={{ fontSize: 30, marginBottom: 10 }}> </div>
<div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No
<div style={{ fontSize: 13 }}>Upload a screenshot · paste a UK email · or add man
</div>
)}
</div>
{showAdd && (
<div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex:
<div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 440, b
<div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyC
<div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Entry Manuall
<button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,25
</div>
<div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
{[{ key: "horseId", label: "Horse", type: "select" }, { key: "venue", label: "R
<div key={key}>
<div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom
{type === "select" ? (
<select value={ne[key]} onChange={e => setNe(p => ({ ...p, [key]: e.targe
<option value="">Select horse</option>
{horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
</select>
) : (
<input type={type || "text"} placeholder={placeholder} value={ne[key]} on
)}
</div>
))}
</div>
</div>
</div>
<Btn onClick={add} style={{ width: "100%", justifyContent: "center", marginTop:
)}
</div>
);
}// ─── YARD VIEW ────────────────────────────────────────────────────────────────
function YardView({ horses, setHorses }) {
const [showAdd, setShowAdd] = useState(false);
const [csvStatus, setCsvStatus] = useState(null);
const [newHorse, setNewHorse] = useState({ name: "", dob: "", sex: "Gelding", colour: "", n
const handleCSV = (e) => {
const file = e.target.files[0]; if (!file) return;
const reader = new FileReader();
reader.onload = (ev) => {
try {
const lines = ev.target.result.split("\n").filter(l => l.trim());
const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/[^a-z0-9
const imported = [];
for (let i = 1; i < lines.length; i++) {
const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
if (!cols[0]) continue;
const row = {}; headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
const name = row.horse_name || row.name || row.horse || cols[0];
if (!name) continue;
imported.push({ id: `h_${Date.now()}_${i}`, name, dob: row.dob || row.date_of_birth
}
setHorses(prev => {
const updated = [...prev];
imported.forEach(imp => { const idx = updated.findIndex(h => h.name.toLowerCase() =
return updated;
});
setCsvStatus(`✓ ${imported.length} horses imported`);
setTimeout(() => setCsvStatus(null), 4000);
} catch (err) { setCsvStatus("✕ Error reading CSV"); setTimeout(() => setCsvStatus(null
};
reader.readAsText(file); e.target.value = "";
};
const addHorse = () => {
if (!newHorse.name) return;
setHorses(prev => [...prev, { ...newHorse, id: `h_${Date.now()}`, silk: SILKS[Math.floor(
setNewHorse({ name: "", dob: "", sex: "Gelding", colour: "", nhRating: "", flatRating: ""
setShowAdd(false);
};
return (
<div>
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", m
<div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>My Yard</div>
<div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>{horses.length} horse</div>
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
{csvStatus && <span style={{ fontSize: 12, fontWeight: 700, color: csvStatus.starts
<label style={{ background: C.cardOff, border: `1.5px solid ${C.border}`, color: C.
Import CSV <input type="file" accept=".csv" onChange={handleCSV} style={{ disp
</label>
<Btn onClick={() => setShowAdd(true)}>+ Add Horse</Btn>
</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBot
{[{ l: "Total", v: horses.length, c: C.blue }, { l: "Active", v: horses.filter(h => h
<div key={s.l} style={{ background: C.card, borderRadius: 10, padding: "13px 16px",
<div style={{ fontSize: 28, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</
<div style={{ fontSize: 11, color: C.textMid, marginTop: 3, fontWeight: 600 }}>{s
</div>
))}
</div>
{horses.map(h => (
<div key={h.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderL
<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
<Silk silk={h.silk} size={40} />
<div style={{ flex: 1 }}>
<div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, f
<span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{h.name}</span
<StatusPill status={h.status} activationDate={h.activationDate} />
{h.headgear && <Tag color={C.purple}>{h.headgear}</Tag>}
</div>
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color:
<span>{getAge(h.dob)}yo {h.sex} · {h.colour}</span>
<span>Rtg: {h.nhRating || h.flatRating || "—"}</span>
<span>Owner: {h.owner}</span>
{h.ownerPhone && <a href={`https://wa.me/${h.ownerPhone.replace(/\D/g, </div>
<div style={{ marginTop: 5, display: "flex", gap: 6, alignItems: "center" }}><F
</div>
</div>
</div>
"")}`}
))}
{showAdd && (
<div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex:
<div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 480, m
<div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyC
<div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Horse</div>
<button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,25</div>
<div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
{[
{ key: "name", label: "Horse Name", placeholder: "e.g. Bob Olinger" },
{ key: "dob", label: "Date of Birth", type: "date" },
{ key: "sex", label: "Sex", type: "select", options: ["Gelding", "Mare", "Fil
{ key: "colour", label: "Colour", placeholder: "e.g. Bay" },
{ key: "nhRating", label: "NH Rating", type: "number", placeholder: "e.g. 98"
{ key: "flatRating", label: "Flat Rating", type: "number", placeholder: "e.g.
{ key: "discipline", label: "Discipline", type: "select", options: ["Hurdle",
{ key: "surface", label: "Surface", type: "select", options: ["Turf", "AWT"]
{ key: "status", label: "Status", type: "select", options: ["Active", "Coolin
{ key: "owner", label: "Owner", placeholder: "e.g. J. Murphy" },
{ key: "ownerPhone", label: "Owner WhatsApp", type: "tel", placeholder: "+353
{ key: "ownerEmail", label: "Owner Email", type: "email", placeholder: { key: "headgear", label: "Headgear", placeholder: "e.g. Cheekpieces" },
{ key: "nextRaceDate", label: "Next Target Date", type: "date" },
{ key: "notes", label: "Trainer Notes", placeholder: "Any notes" },
].map(({ key, label, placeholder, type, options }) => (
<div key={key}>
<div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom
{type === "select" ? (
<select value={newHorse[key]} onChange={e => setNewHorse(p => ({ ...p, [k
{options.map(o => <option key={o} value={o}>{o}</option>)}
</select>
) : (
"owner
<input type={type || "text"} placeholder={placeholder} value={newHorse[ke
)}
</div>
))}
</div>
</div>
</div>
<Btn onClick={addHorse} style={{ width: "100%", justifyContent: "center", margi
)}
</div>
);
}
// ─── MOVEMENT LOG ─────────────────────────────────────────────────────────────
function MovementLog({ horses }) {
const [movements, setMovements] = useState([
{ id: "m1", horseId: "h2", type: "arrival", date: "2026-02-10", from: "Convalescence yard
]);
const [showAdd, setShowAdd] = useState(false);
const [nm, setNm] = useState({ horseId: "", type: "arrival", date: todayStr, from: "", to:return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", m
<div>
<div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Horse Movements</div>
<div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>All arrivals and depa
</div>
<Btn onClick={() => setShowAdd(true)}>+ Log Movement</Btn>
</div>
{movements.sort((a, b) => new Date(b.date) - new Date(a.date)).map(mov => {
const horse = horses.find(h => h.id === mov.horseId);
if (!horse) return null;
return (
<div key={mov.id} style={{ background: C.card, border: `1px solid ${mov.type === "a
<div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
<Silk silk={horse.silk} size={34} />
<div style={{ flex: 1 }}>
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2
<span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}
<Tag color={mov.type === "arrival" ? C.green : C.amber}>{mov.type === "arri
</div>
<div style={{ fontSize: 12, color: C.textMid }}>{new Date(mov.date).toLocaleD
</div>
</div>
<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
{[{ l: mov.type === "arrival" ? "From" : "To", v: mov.type === "arrival" ? mov.
<div key={l} style={{ background: C.cardOff, borderRadius: 8, padding: "7px 1
<div style={{ fontSize: 9, fontWeight: 600, color: C.textDim, textTransform
<div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{v}</div>
</div>
))}
</div>
</div>
);
})}
{showAdd && (
<div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex:
<div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 440, m
<div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyC
<div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Log Horse Movemen
<button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,25
</div>
<div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
{[
{ key: "horseId", label: "Horse", type: "select" },{ key: "type", label: "Type", type: "select_type" },
{ key: "date", label: "Date", type: "date" },
{ key: "from", label: "From (arrival)", placeholder: "e.g. Convalescence yard
{ key: "to", label: "To (departure)", placeholder: "e.g. Summer grass" },
{ key: "contactName", label: "Contact Name", placeholder: "Person or premises
{ key: "contactPhone", label: "Contact Phone", type: "tel", placeholder: "+35
{ key: "notes", label: "Notes", placeholder: "Any relevant notes" },
].map(({ key, label, type, placeholder }) => (
<div key={key}>
<div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom
{type === "select" ? (
<select value={nm[key]} onChange={e => setNm(p => ({ ...p, [key]: e.targe
<option value="">Select horse</option>
{horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
</select>
) : type === "select_type" ? (
<select value={nm[key]} onChange={e => setNm(p => ({ ...p, [key]: e.targe
<option value="arrival">Arrival</option>
<option value="departure">Departure</option>
</select>
) : (
<input type={type || "text"} placeholder={placeholder} value={nm[key]} on
)}
</div>
))}
</div>
</div>
</div>
<Btn onClick={() => { if (!nm.horseId) return; setMovements(p => [...p, { ...nm
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
<div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Owner Po<div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>Each owner sees their
{owners.map(o => (
<div key={o.name} onClick={() => setSelOwner(o)} style={{ background: C.card, border:
<div style={{ width: 42, height: 42, borderRadius: "50%", background: C.navy, displ
{o.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
</div>
<div style={{ flex: 1 }}>
<div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{o
<div style={{ fontSize: 12, color: C.textMid }}>{o.horses.length} horse{o.horses.
<div style={{ display: "flex", gap: 5, marginTop: 4 }}>
{o.horses.map(h => <div key={h.id} style={{ display: "flex", alignItems: </div>
</div>
<span style={{ color: C.textMid }}>→</span>
</div>
"cente
))}
</div>
);
return (
<div>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", m
<Btn variant="ghost" onClick={() => setSelOwner(null)} style={{ fontSize: 12, padding
<div style={{ display: "flex", gap: 8 }}>
{selOwner.phone && <a href={`https://wa.me/${selOwner.phone.replace(/\D/g, "")}`} t
{selOwner.phone && <a href={`tel:${selOwner.phone}`} style={{ background: C.blueBg,
{selOwner.email && <a href={`mailto:${selOwner.email}`} style={{ background: C.navy
</div>
</div>
<div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 14 }}>{selOwn
{selOwner.horses.map(horse => {
const provisional = horse.provisionalEntries || [];
return (
<div key={horse.id} style={{ background: C.card, border: `1px solid ${C.border}`, b
<div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 13 }}
<Silk silk={horse.silk} size={46} />
<div style={{ flex: 1 }}>
<div style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 4 }
<div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, <span>{getAge(horse.dob)}yo {horse.sex}</span>
<span>Rating: {horse.nhRating || horse.flatRating || "—"}</span>
{horse.headgear && <span>Headgear: {horse.headgear}</span>}
</div>
color:
<StatusPill status={horse.status} activationDate={horse.activationDate} />
</div>
<FormDots form={horse.form} /></div>
{/* Provisional targets */}
{provisional.length > 0 && (
<div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom:
<div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform:
{provisional.map(pe => (
<div key={pe.id} style={{ padding: "10px 12px", background: C.goldBg, borde
<div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom:
<div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, c
<span> {pe.venue}</span>
{pe.date && <span> {new Date(pe.date).toLocaleDateString("en-IE", { w
{pe.raceRef && <span>{pe.raceRef}</span>}
</div>
{pe.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "ita
</div>
))}
</div>
)}
{/* Form */}
<div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
<div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "
{(horse.form || []).slice(0, 3).map((f, i) => {
const pc = f.position === 1 ? C.green : f.position <= 3 ? C.amber : C.textMid
return (
<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, paddi
<div style={{ width: 24, height: 24, borderRadius: 6, background: `${pc}1
<div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600, co
<div style={{ fontSize: 11, color: C.textMid }}>{new Date(f.date).toLocal
</div>
);
})}
</div>
{(!horse.form || horse.form.length === 0) && <div style={{ fontSize: 12, color:
border
{horse.notes && (
<div style={{ marginTop: 10, padding: "9px 12px", background: C.cardOff, <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, textTransform:
<p style={{ fontSize: 13, color: C.textMid, fontStyle: "italic", margin: 0, l
</div>
)}
</div>
);
})}
</div>
);}
// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
const [tab, setTab] = useState("planner");
const [horses, setHorses] = useState(INITIAL_HORSES);
const [sidebarOpen, setSidebarOpen] = useState(true);
const medAlerts = horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d >
const NAV = [
{ id: "planner", icon: " ", label: "Race Planner" },
{ id: "provisional", icon: " ", label: "Provisional Entries" },
{ id: "meds", icon: " ", label: "Medication Tracker", badge: medAlerts },
{ id: "whiteboard", icon: " ", label: "Raceday Whiteboard" },
{ id: "yard", icon: " ", label: "My Yard" },
{ id: "movements", icon: " ", label: "Horse Movements" },
{ id: "owners", icon: " ", label: "Owner Portal" },
];
return (
<div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Helvetica Neue'
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&
* { box-sizing: border-box; margin: 0; padding: 0; }
p { margin: 0; }
button:hover { opacity: 0.88; }
a:hover { opacity: 0.88; }
input:focus, select:focus { border-color: #0a1628 !important; outline: none; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-thumb { background: #b8c8da; border-radius: 2px; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform
@media print { body * { visibility: hidden; } #print-area, #print-area * { visibility
`}</style>
{/* Top Header */}
<div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", pa
{/* Sidebar toggle */}
<button onClick={() => setSidebarOpen(o => !o)} style={{ background: "rgba(255,255,25
{sidebarOpen ? "◀" : "▶"}
</button>
<div style={{ display: "flex", alignItems: "center", gap: 9 }}>
<div style={{ width: 30, height: 30, background: `linear-gradient(135deg,${C.gold},
<div>
<div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1 }}>Race<div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>Y
</div>
</div>
{/* Active tab label */}
<div style={{ marginLeft: 8, padding: "4px 12px", background: "rgba(255,255,255,0.08)
{NAV.find(n => n.id === tab)?.icon} {NAV.find(n => n.id === tab)?.label}
</div>
<div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
{medAlerts > 0 && (
<button onClick={() => setTab("meds")} style={{ background: C.redBg, border: `1px
{medAlerts} med alert{medAlerts !== 1 ? "s" : ""}
</button>
)}
</div>
</div>
<span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{TODAY.toLocaleDateS
{/* Body */}
<div style={{ display: "flex", flex: 1, minHeight: 0 }}>
{/* Collapsible Sidebar */}
<div style={{ width: sidebarOpen ? 200 : 52, background: C.sidebar, flexShrink: 0, di
{NAV.map(({ id, icon, label, badge }) => {
const active = tab === id;
return (
<button key={id} onClick={() => setTab(id)} title={label} style={{ position: "r
<span style={{ fontSize: 17, minWidth: 20, textAlign: "center", flexShrink: 0
{sidebarOpen && <span style={{ flex: 1 }}>{label}</span>}
{badge > 0 && sidebarOpen && <span style={{ background: C.red, color: "#fff",
{badge > 0 && !sidebarOpen && <span style={{ position: "absolute", top: 6, ri
</button>
);
})}
{/* Yard summary — only when open */}
{sidebarOpen && (
<div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "1px solid rgba
<div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", le
{[{ l: "Active", v: horses.filter(h => h.status === "Active").length, c: C.gree
<div key={s.l} style={{ display: "flex", justifyContent: "space-between", mar
<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</span>
<span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
</div>
))}
<div style={{ display: "flex", justifyContent: "space-between", paddingTop: 5,<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total</span>
<span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{horses.length
</div>
</div>
)}
</div>
{/* Main content */}
<div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minWidth: 0 }}>
{tab === "planner" && <RacePlanner horses={horses} setHorses={setHorses} />}
{tab === "provisional" && <ProvisionalEntries horses={horses} setHorses={setHorses}
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

