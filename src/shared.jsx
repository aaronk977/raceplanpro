import React, { useState, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
const daysUntil = function(ds) { return !ds ? null : Math.ceil((new Date(ds) - TODAY) * (1/86400000)); };
const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

// Antepsin: 3 bottles per 12-day course, 1 bottle every 4 days
// Count ticks and calculate bottles needed (round up to nearest bottle at 4 days each)
const calcAntepsinCost = (ticks) => {
  if (!ticks) return 0;
  const bottles = Math.ceil(ticks * 0.25);
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
    ghost: { background: "none", color: C.textMid, border: "1px solid "+C.border },
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
  const days = d ? Math.ceil((d - TODAY) * (1/86400000)) : 0;
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
  const daysSince = lastRun ? Math.floor((TODAY - new Date(lastRun.date)) * (1/86400000)) : null;
  const daysToRace = daysUntil(race.date);

  const system = "You are an experienced Irish racing professional giving a trainer your honest read on a race. The trainer already knows their horse inside out — never tell them their own horse's form, stats, or history. They lived it. Focus ONLY on the race itself — who else is likely in it, how weak or strong the field looks, whether the timing suits a campaign, what the pace scenario might be, and whether this is a race worth targeting. Use web_search to find likely runners and recent form at this venue and trip. Speak like a racing professional — direct, specific, no waffle. Use phrases like: Not a great race, I would be going there to win it. Plenty of dead wood in here. The handicapper has left him alone. This sets Punchestown up perfectly. Ride cold and come through them late. Worth trying cheekpieces here. I would be very tempted at this trip. Do not say things the trainer already knows about their own horse. Never mention days since last run or the horse's rating as if the trainer does not know it. Your job is to give them information about the RACE not about their horse.";


  const prompt = "Give me your honest take trainer to trainer. Search first.\n\n"
    + "HORSE: " + horse.name + " | " + getAge(horse.dob) + "yo " + horse.sex
    + " | " + horse.trainer + " | Rating: " + (horse.nhRating || horse.flatRating || "unknown")
    + "\nHeadgear: " + (horse.headgear || "None")
    + " | " + (daysSince || "?") + " days since last run"
    + "\nNotes: " + horse.notes
    + "\n\nRACE: " + race.raceName + " | " + race.venue + " | " + race.date
    + " | " + race.distanceFurlongs + "f"
    + " | " + (race.forecastGoing || "") + " | " + daysToRace + " days away"
    + "\n\nSearch for recent runners in this race and trainer record at this venue."
    + "\n\nReturn ONLY a raw JSON object with these keys: scores (object with handicap_edge, class_fit, conditions_match, timing, cuteness each scored 1-10), overall (number 0-100), bullets (array of 6 objects each with category, icon, point), conclusion (string 3-4 sentences), recommendation (one of STRONG or CONSIDER or WAIT or PASS). No markdown.";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2500, tools: [{ type: "web_search_20250305", name: "web_search" }], system, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  const text = data.content?.filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("").trim();
  const match = (function(){var s=text.indexOf("{");var e=text.lastIndexOf("}");return s>=0&&e>s?[text.slice(s,e+1)]:null;})();
  if (!match) throw new Error("No JSON");
  return JSON.parse(match[0]);
}

// ─── MEDICATION TRACKER ───────────────────────────────────────────────────────


const isEligible = function(horse, race) {
  if (!horse || !race) return false;
  var age = getAge(horse.dob);
  if (race.minAge && age < race.minAge) return false;
  if (race.maxAge && age > race.maxAge) return false;
  if (race.sex && race.sex !== "Any") {
    var sexMap = { "M": ["Mare", "Filly"], "F": ["Filly", "Mare"], "G": ["Gelding"], "C": ["Colt", "Horse"] };
    var allowed = sexMap[race.sex] || [];
    if (allowed.length > 0 && !allowed.includes(horse.sex)) return false;
  }
  if (race.discipline && race.discipline !== "Any") {
    var hDisc = horse.discipline || [];
    if (hDisc.length > 0 && !hDisc.includes(race.discipline)) return false;
  }
  if (race.isMaidenOnly && !horse.isMaiden) return false;
  if (race.isNoviceOnly && !horse.isNovice) return false;
  var rating = 0;
  if (race.discipline === "Flat") rating = horse.flatRating || horse.nhRating || 0;
  else if (race.discipline === "Hurdle") rating = horse.hurdleRating || horse.nhRating || 0;
  else if (race.discipline === "Chase") rating = horse.chaseRating || horse.nhRating || 0;
  else rating = horse.nhRating || horse.flatRating || horse.hurdleRating || horse.chaseRating || 0;
  if (race.minRating && rating && rating < race.minRating) return false;
  if (race.maxRating && rating && rating > race.maxRating) return false;
  return true;
};

export { Silk, Tag, Btn, FormDots, StatusPill };
export { C, TODAY, SILKS, ANTHROPIC_KEY };
export { getAge, coolingDate, canRace, daysUntil, getDaysInMonth, isEligible };
