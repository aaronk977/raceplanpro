import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, Plus, Trash2, Printer, Copy, RotateCcw, Settings, Loader2, AlertCircle } from "lucide-react";

/*
  RacingExpenses — standalone working demo for RacePlan Pro
  ---------------------------------------------------------
  Paste the week's racing messages -> they're parsed into rows ->
  rate + tax-free tier auto-applied -> taxable computed -> print / CSV.

  Parsing: tries the AI endpoint first (handles ANY yard's phrasing);
  if that's unavailable in this preview, falls back to a built-in parser.
  In your app, point callClaude() at your /api/claude proxy — same body —
  and the AI path will always run, so format never matters.
*/

const DEFAULT_TAX_FREE = { tier10: 46.17, tier5: 19.25 };       // 10+ hrs / 5–10 hrs
const DEFAULT_RATES = {
  dayMeeting: 60, eveningMeeting: 60, sunBankHolSatEve: 75, overnight: 100, dundalkEvening: 110,
};
const BANK_HOLIDAYS = [ // Irish public holidays 2026 — verify/extend yearly
  "2026-01-01", "2026-02-02", "2026-03-17", "2026-04-06", "2026-05-04",
  "2026-06-01", "2026-08-03", "2026-10-26", "2026-12-25", "2026-12-26",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseISO(iso) { return new Date(iso + "T00:00:00"); }
function fmtDate(iso) {
  if (!iso) return "—";
  const d = parseISO(iso);
  return `${DAY_NAMES[d.getDay()]} ${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function euro(n) { return "€" + (Number(n) || 0).toFixed(2); }

function autoRate(row, rates) {
  if (row.overnight) return { rate: rates.overnight, label: "Overnight" };
  const dow = row.date ? parseISO(row.date).getDay() : 1;
  const sunOrBH = dow === 0 || BANK_HOLIDAYS.includes(row.date);
  const isDundalk = (row.venue || "").toLowerCase().includes("dundalk");
  if (isDundalk && row.evening) return { rate: rates.dundalkEvening, label: "Dundalk evening" };
  if (sunOrBH) return { rate: rates.sunBankHolSatEve, label: dow === 0 ? "Sunday" : "Bank holiday" };
  if (dow === 6) return row.evening
    ? { rate: rates.sunBankHolSatEve, label: "Sat evening" }
    : { rate: rates.dayMeeting, label: "Sat day" };
  return row.evening
    ? { rate: rates.eveningMeeting, label: "Evening" }
    : { rate: rates.dayMeeting, label: "Day meeting" };
}
function taxFreeFor(tier, tf) { return tier === "10" ? tf.tier10 : tier === "5" ? tf.tier5 : 0; }

function weekContext(mondayISO) {
  const start = parseISO(mondayISO);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    dates.push({ iso: d.toISOString().slice(0, 10), label: `${wd[i]} ${d.getDate()} ${months[d.getMonth()]}` });
  }
  return { year: start.getFullYear(), month: start.getMonth() + 1, dates };
}

// Built-in parser — reliable engine for the demo / offline fallback.
function localParse(text, year, month) {
  const cleaned = text.replace(/racing this week/ig, " ").replace(/\s+/g, " ").trim();
  const segs = cleaned.split(/\.+/).map((s) => s.trim()).filter(Boolean);
  const dayRe = /\b(mon|tues?|weds?|thur?s?|fri|sat|sun)\b/i;
  const ordRe = /\b(\d{1,2})(?:st|nd|rd|th)\b/i;
  const rows = [];
  for (const seg of segs) {
    const dm = seg.match(dayRe);
    const om = seg.match(ordRe);
    if (!dm && !om) continue;
    const splitIdx = dm ? dm.index : om.index;
    const namesPart = seg.slice(0, splitIdx).trim();
    let venue = om ? seg.slice(om.index + om[0].length) : dm ? seg.slice(dm.index + dm[0].length) : "";
    venue = venue.replace(/^[-,\s]+/, "").trim();
    venue = venue.charAt(0).toUpperCase() + venue.slice(1);
    const dayNum = om ? parseInt(om[1], 10) : null;
    const iso = dayNum ? `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}` : "";
    const evening = /evening|\beve\b/i.test(seg);
    const overnight = /overnight|over night/i.test(seg);
    const names = namesPart.split(/,|\band\b|&/i).map((n) => n.trim()).filter(Boolean);
    for (const nm of names) rows.push({ employee: nm, date: iso, venue, evening, overnight });
  }
  return rows;
}

async function callClaude(rawText, ctx) {
  const refList = ctx.dates.map((d) => `${d.label} = ${d.iso}`).join("\n");
  const prompt = `Convert a racing yard's informal staff message into rows for a weekly racing-expenses sheet.

Payroll week dates:
${refList}

Rules:
- One object PER PERSON per meeting. "Donal, linn and Khet wed 3rd the curragh" => three objects, same date/venue.
- Use the explicit day-of-month when given (e.g. "3rd" => day 3 of month ${ctx.month}/${ctx.year}); otherwise map the weekday to the list above. Messages may wrap across lines.
- evening: true only if clearly an evening meeting. overnight: true only if it says overnight.
- Keep names exactly as written. Venue = racecourse, title-cased. Ignore lines like "Racing this week".

Message:
"""
${rawText}
"""

Return ONLY a JSON array, no prose, no markdown. Each item: {"employee":string,"date":"YYYY-MM-DD","venue":string,"evening":boolean,"overnight":boolean}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
  });
  if (!res.ok) throw new Error("status " + res.status);
  const data = await res.json();
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return JSON.parse(text.replace(/```json/gi, "").replace(/```/g, "").trim());
}

const EXAMPLE = `Racing this week
Donal, linn and Khet wed 3rd the curragh.
Alan and Holly Thur 4th Leopardstown.
Alan, Brian and Tom Fri 5th clonmel.
Alan, Romilly and kalu sat 6th Punchestown.
Alan, Niamh, Achal and Izzy sun 7th Punchestown.`;

let RID = 1;

export default function RacingExpenses() {
  const [monday, setMonday] = useState("2026-06-01");
  const [rawText, setRawText] = useState("");
  const [rows, setRows] = useState([]);
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [taxFree, setTaxFree] = useState(DEFAULT_TAX_FREE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [notes, setNotes] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load saved amounts on open
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("re-settings", false);
        if (r && r.value) {
          const v = JSON.parse(r.value);
          if (v.rates) setRates(v.rates);
          if (v.taxFree) setTaxFree(v.taxFree);
        }
      } catch (e) { /* nothing saved yet, use defaults */ }
      setLoaded(true);
    })();
  }, []);

  // Save amounts whenever they change
  useEffect(() => {
    if (!loaded) return;
    (async () => {
      try { await window.storage.set("re-settings", JSON.stringify({ rates, taxFree }), false); } catch (e) { /* storage unavailable */ }
    })();
  }, [rates, taxFree, loaded]);

  function resetAmounts() { setRates(DEFAULT_RATES); setTaxFree(DEFAULT_TAX_FREE); }

  const computed = useMemo(() => rows.map((r) => {
    const auto = autoRate(r, rates);
    const rate = r.manualRate ? Number(r.rateOverride) || 0 : auto.rate;
    const tf = taxFreeFor(r.tier, taxFree);
    return { ...r, autoLabel: auto.label, rate, tf, taxable: Math.max(0, rate - tf) };
  }), [rows, rates, taxFree]);

  const totals = useMemo(() => computed.reduce(
    (a, r) => ({ rate: a.rate + r.rate, tf: a.tf + r.tf, taxable: a.taxable + r.taxable }),
    { rate: 0, tf: 0, taxable: 0 }
  ), [computed]);

  function addParsed(parsed) {
    const newRows = parsed.filter((p) => p.employee).map((p) => ({
      id: RID++, date: p.date || monday, employee: p.employee, venue: p.venue || "",
      evening: !!p.evening, overnight: !!p.overnight, tier: "10", manualRate: false, rateOverride: "",
    }));
    setRows((prev) => [...prev, ...newRows]);
    return newRows.length;
  }

  async function handleParse() {
    setError(""); setInfo("");
    if (!rawText.trim()) { setError("Paste the week's racing messages first."); return; }
    setLoading(true);
    const ctx = weekContext(monday);
    try {
      const parsed = await callClaude(rawText, ctx);
      const n = addParsed(parsed);
      setInfo(`Added ${n} ${n === 1 ? "entry" : "entries"} (AI parse). Check each row, then set hours away.`);
      setRawText("");
    } catch (e) {
      const parsed = localParse(rawText, ctx.year, ctx.month);
      if (parsed.length) {
        const n = addParsed(parsed);
        setInfo(`Added ${n} entries (built-in parser — the live AI parse isn't available in this preview; your app uses /api/claude). Check each row.`);
        setRawText("");
      } else {
        setError("Couldn't read that. Add rows by hand below, or paste in the 'names day date venue' style.");
      }
    } finally { setLoading(false); }
  }

  function update(id, patch) { setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r))); }
  function addRow() { setRows((prev) => [...prev, { id: RID++, date: monday, employee: "", venue: "", evening: false, overnight: false, tier: "10", manualRate: false, rateOverride: "" }]); }
  function removeRow(id) { setRows((prev) => prev.filter((r) => r.id !== id)); }

  function copyCSV() {
    const head = ["Date", "Employee", "Racemeeting", "Rate type", "Rate", "Hours", "Tax Free", "Tax"];
    const lines = computed.map((r) => [fmtDate(r.date), r.employee, r.venue, r.autoLabel, r.rate.toFixed(2), r.tier === "10" ? "10+" : r.tier === "5" ? "5-10" : "<5", r.tf.toFixed(2), r.taxable.toFixed(2)]);
    lines.push(["", "", "", "OVERALL TOTAL", totals.rate.toFixed(2), "", totals.tf.toFixed(2), totals.taxable.toFixed(2)]);
    const csv = [head, ...lines].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    navigator.clipboard.writeText(csv).then(() => setInfo("Copied as CSV — paste into a spreadsheet or accounts export."), () => setError("Clipboard blocked by the browser."));
  }

  return (
    <div className="re-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;800&family=Inter:wght@400;500;600&display=swap');
        @keyframes re-spin { to { transform: rotate(360deg); } }
        .re-root { --ink:#16261c; --turf:#1f3d2b; --turf2:#2d5a40; --line:#cfc8b8; --muted:#6b7468; --bg:#e8e9e3; --gold:#b8893b;
          font-family:'Inter',system-ui,sans-serif; color:var(--ink); background:var(--bg); min-height:100vh; padding:20px; box-sizing:border-box; }
        .re-root *, .re-root *::before, .re-root *::after { box-sizing:border-box; }
        .re-wrap { max-width:1040px; margin:0 auto; }
        .re-h { font-family:'Archivo',sans-serif; }
        .re-card { background:#fff; border:1px solid var(--line); border-radius:12px; }
        .re-fig { font-variant-numeric:tabular-nums; }
        .re-input { font-family:inherit; font-size:14px; border:1px solid var(--line); border-radius:7px; padding:7px 9px; background:#fff; color:var(--ink); width:100%; }
        .re-input:focus { outline:2px solid var(--turf2); outline-offset:-1px; }
        .re-btn { font-family:'Archivo',sans-serif; font-weight:600; border-radius:8px; padding:9px 14px; border:1px solid transparent; cursor:pointer; display:inline-flex; align-items:center; gap:7px; font-size:14px; }
        .re-btn-primary { background:var(--turf); color:#fff; }
        .re-btn-primary:hover { background:var(--turf2); }
        .re-btn-primary:disabled { opacity:.6; cursor:default; }
        .re-btn-ghost { background:#fff; border-color:var(--line); color:var(--ink); }
        .re-btn-ghost:hover { background:#f4f2ea; }
        .re-th { font-family:'Archivo',sans-serif; font-size:11px; letter-spacing:.04em; text-transform:uppercase; color:var(--muted); text-align:left; padding:8px; border-bottom:2px solid var(--ink); white-space:nowrap; }
        .re-td { padding:5px 8px; border-bottom:1px solid var(--line); vertical-align:middle; }
        .re-cell { border:1px solid transparent; background:transparent; border-radius:6px; padding:5px 6px; font-size:13.5px; font-family:inherit; color:var(--ink); width:100%; }
        .re-cell:hover { border-color:var(--line); }
        .re-cell:focus { outline:none; border-color:var(--turf2); background:#fff; }
        .re-badge { font-size:10.5px; font-family:'Archivo'; font-weight:600; padding:2px 7px; border-radius:999px; background:#eef2ec; color:var(--turf); white-space:nowrap; }
        .re-seg { display:inline-flex; border:1px solid var(--line); border-radius:7px; overflow:hidden; }
        .re-seg button { font-family:'Archivo'; font-size:11.5px; font-weight:600; padding:4px 8px; border:none; background:#fff; color:var(--muted); cursor:pointer; }
        .re-seg button.on { background:var(--turf); color:#fff; }
        @media print { .re-noprint { display:none !important; } .re-root { background:#fff; padding:0; } .re-card { border:none; } }
      `}</style>

      <div className="re-wrap">
        <div className="re-noprint" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="re-h" style={{ fontSize: 26, fontWeight: 800, color: "var(--turf)", letterSpacing: "-0.01em" }}>Racing Expenses</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>Paste the week's messages — it builds and totals the sheet.</div>
          </div>
          <button className="re-btn re-btn-ghost" onClick={() => setShowSettings((s) => !s)}><Settings size={15} /> Rates</button>
        </div>

        {showSettings && (
          <div className="re-card re-noprint" style={{ padding: 16, marginBottom: 16 }}>
            <div className="re-h" style={{ fontWeight: 600 }}>Yard rates</div>
            <div style={{ color: "var(--muted)", fontSize: 12.5, margin: "4px 0 12px" }}>These differ per yard — in the live app they load from your settings.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
              {[["dayMeeting", "Day meeting (incl. Sat)"], ["eveningMeeting", "Evening meeting"], ["sunBankHolSatEve", "Sun / Bank hol / Sat eve"], ["overnight", "Overnight"], ["dundalkEvening", "Dundalk evening"]].map(([k, label]) => (
                <label key={k} style={{ fontSize: 12.5, color: "var(--muted)" }}>{label}
                  <input className="re-input re-fig" style={{ marginTop: 4 }} type="number" value={rates[k]} onChange={(e) => setRates({ ...rates, [k]: Number(e.target.value) })} />
                </label>
              ))}
            </div>
            <div className="re-h" style={{ fontWeight: 600, marginTop: 16 }}>Tax-free allowance (Revenue)</div>
            <div style={{ color: "var(--muted)", fontSize: 12.5, margin: "4px 0 12px" }}>Statutory — verify against Revenue's current day-subsistence rates.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
              <label style={{ fontSize: 12.5, color: "var(--muted)" }}>10+ hours away
                <input className="re-input re-fig" style={{ marginTop: 4 }} type="number" step="0.01" value={taxFree.tier10} onChange={(e) => setTaxFree({ ...taxFree, tier10: Number(e.target.value) })} /></label>
              <label style={{ fontSize: 12.5, color: "var(--muted)" }}>5–10 hours away
                <input className="re-input re-fig" style={{ marginTop: 4 }} type="number" step="0.01" value={taxFree.tier5} onChange={(e) => setTaxFree({ ...taxFree, tier5: Number(e.target.value) })} /></label>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Your amounts save automatically — they'll be here next Tuesday.</span>
              <button className="re-btn re-btn-ghost" style={{ padding: "6px 11px", fontSize: 13 }} onClick={resetAmounts}>Reset to defaults</button>
            </div>
          </div>
        )}

        <div className="re-card re-noprint" style={{ padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginBottom: 10 }}>
            <label style={{ fontSize: 12.5, color: "var(--muted)" }}>Payroll week (Monday)
              <input className="re-input" style={{ marginTop: 4, width: 170 }} type="date" value={monday} onChange={(e) => setMonday(e.target.value)} /></label>
            <button className="re-btn re-btn-ghost" style={{ fontWeight: 500 }} onClick={() => setRawText(EXAMPLE)}>Load example</button>
          </div>
          <textarea className="re-input" rows={5} placeholder={"Paste the week's messages…\ne.g. Alan, Brian and Tom Fri 5th Clonmel"} value={rawText} onChange={(e) => setRawText(e.target.value)} style={{ resize: "vertical", lineHeight: 1.5 }} />
          {error && <div style={{ display: "flex", gap: 7, alignItems: "flex-start", color: "#9a2a2a", fontSize: 13, marginTop: 10 }}><AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />{error}</div>}
          {info && <div style={{ color: "var(--turf)", fontSize: 13, marginTop: 10 }}>{info}</div>}
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="re-btn re-btn-primary" onClick={handleParse} disabled={loading}>
              {loading ? <Loader2 size={15} style={{ animation: "re-spin 1s linear infinite" }} /> : <Sparkles size={15} />}
              {loading ? "Reading…" : "Build sheet from messages"}
            </button>
            <button className="re-btn re-btn-ghost" onClick={addRow}><Plus size={15} /> Add row</button>
          </div>
        </div>

        <div className="re-card" style={{ padding: 16, overflowX: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <div className="re-h" style={{ fontWeight: 800, fontSize: 17, color: "var(--turf)" }}>Summary of Weekly Racing Expenses</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Week of {fmtDate(monday)}</div>
          </div>

          {computed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--muted)" }}>
              <div className="re-h" style={{ fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>No entries yet</div>
              Tap <b>Load example</b>, then <b>Build sheet from messages</b>.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead><tr>
                <th className="re-th">Date</th><th className="re-th">Employee</th><th className="re-th">Racemeeting</th>
                <th className="re-th">Rate</th><th className="re-th">Hours away</th>
                <th className="re-th" style={{ textAlign: "right" }}>Tax free</th><th className="re-th" style={{ textAlign: "right" }}>Tax</th>
                <th className="re-th re-noprint"></th>
              </tr></thead>
              <tbody>
                {computed.map((r) => (
                  <tr key={r.id}>
                    <td className="re-td"><input className="re-cell" type="date" value={r.date} onChange={(e) => update(r.id, { date: e.target.value })} style={{ width: 140 }} /></td>
                    <td className="re-td"><input className="re-cell" value={r.employee} placeholder="Name" onChange={(e) => update(r.id, { employee: e.target.value })} /></td>
                    <td className="re-td">
                      <input className="re-cell" value={r.venue} placeholder="Course" onChange={(e) => update(r.id, { venue: e.target.value })} />
                      <div className="re-noprint" style={{ display: "flex", gap: 10, padding: "2px 6px" }}>
                        <label style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 4, alignItems: "center" }}><input type="checkbox" checked={r.evening} onChange={(e) => update(r.id, { evening: e.target.checked })} /> Evening</label>
                        <label style={{ fontSize: 11, color: "var(--muted)", display: "flex", gap: 4, alignItems: "center" }}><input type="checkbox" checked={r.overnight} onChange={(e) => update(r.id, { overnight: e.target.checked })} /> Overnight</label>
                      </div>
                    </td>
                    <td className="re-td">
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span className="re-fig" style={{ fontWeight: 600 }}>{euro(r.rate)}</span>
                        {!r.manualRate
                          ? <span className="re-badge">{r.autoLabel}</span>
                          : <button className="re-noprint" title="Back to auto" onClick={() => update(r.id, { manualRate: false, rateOverride: "" })} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--gold)" }}><RotateCcw size={13} /></button>}
                      </div>
                      <input className="re-cell re-fig re-noprint" type="number" placeholder="override" value={r.manualRate ? r.rateOverride : ""} onChange={(e) => update(r.id, { manualRate: true, rateOverride: e.target.value })} style={{ fontSize: 11, marginTop: 2, color: "var(--muted)" }} />
                    </td>
                    <td className="re-td">
                      <div className="re-seg re-noprint">
                        {[["10", "10+"], ["5", "5–10"], ["0", "<5"]].map(([v, lab]) => (
                          <button key={v} className={r.tier === v ? "on" : ""} onClick={() => update(r.id, { tier: v })}>{lab}</button>
                        ))}
                      </div>
                    </td>
                    <td className="re-td re-fig" style={{ textAlign: "right" }}>{euro(r.tf)}</td>
                    <td className="re-td re-fig" style={{ textAlign: "right", fontWeight: 600 }}>{euro(r.taxable)}</td>
                    <td className="re-td re-noprint"><button onClick={() => removeRow(r.id)} title="Remove" style={{ border: "none", background: "none", cursor: "pointer", color: "#b15" }}><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr>
                <td className="re-td re-h" colSpan={3} style={{ fontWeight: 800, borderTop: "2px solid var(--ink)", borderBottom: "none", paddingTop: 10 }}>OVERALL TOTAL</td>
                <td className="re-td re-fig" style={{ fontWeight: 800, borderTop: "2px solid var(--ink)", borderBottom: "none" }}>{euro(totals.rate)}</td>
                <td className="re-td" style={{ borderTop: "2px solid var(--ink)", borderBottom: "none" }}></td>
                <td className="re-td re-fig" style={{ textAlign: "right", fontWeight: 800, borderTop: "2px solid var(--ink)", borderBottom: "none" }}>{euro(totals.tf)}</td>
                <td className="re-td re-fig" style={{ textAlign: "right", fontWeight: 800, borderTop: "2px solid var(--ink)", borderBottom: "none" }}>{euro(totals.taxable)}</td>
                <td className="re-td re-noprint" style={{ borderTop: "2px solid var(--ink)", borderBottom: "none" }}></td>
              </tr></tfoot>
            </table>
          )}

          {computed.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="re-noprint" style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>Racing notes</div>
              <textarea className="re-input re-noprint" rows={2} placeholder="List dates & racecourses, anything for the accountant…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          )}
        </div>

        {computed.length > 0 && (
          <div className="re-noprint" style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            <button className="re-btn re-btn-primary" onClick={() => window.print()}><Printer size={15} /> Print sheet</button>
            <button className="re-btn re-btn-ghost" onClick={copyCSV}><Copy size={15} /> Copy as CSV</button>
          </div>
        )}
      </div>
    </div>
  );
}
