import React, { useState } from "react";

var NAVY = "#0d2818";
var NAVY2 = "#1e3a2f";
var GOLD = "#c9a84c";
var GOLD2 = "#e8c96a";
var PAPER = "#f7f3ed";
var WHITE = "#ffffff";
var GREEN = "#1a7a4a";
var RED = "#c0392b";
var MUTED = "#7a9688";
var TEXT = "#1a2e24";

var FONTS = "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');";

var CSS = FONTS + `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Outfit', sans-serif; background: ${PAPER}; color: ${TEXT}; }
  .serif { font-family: 'Outfit', sans-serif; }
  .hero-stat { font-family: 'Outfit', sans-serif; font-style: italic; font-size: clamp(64px,12vw,130px); font-weight: 900; line-height: 1; color: ${GOLD}; }
  .pain-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.12); }
  .pain-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .feature-card:hover { border-color: ${GOLD}80; }
  .feature-card { transition: border-color 0.2s ease; }
  .cta-btn { transition: transform 0.15s ease, opacity 0.15s ease; }
  .cta-btn:hover { transform: translateY(-2px); opacity: 0.92; }
  @media (max-width: 767px) {
    .hide-mobile { display: none !important; }
    .hero-stat { font-size: clamp(52px,18vw,90px) !important; }
  }
`;

// SVG Logo — horseshoe + wordmark
function Logo({ size, dark }) {
  var tc = dark ? "#ffffff" : NAVY;
  var w = size === "lg" ? 250 : 200;
  var h = size === "lg" ? 58 : 46;
  return (
    <svg width={w} height={h} viewBox="0 0 250 58" fill="none">
      <path d="M28 3 L48 9 L48 31 C48 42 38 50 28 53 C18 50 8 42 8 31 L8 9 Z" fill={GOLD} fillOpacity="0.08" stroke={GOLD} strokeWidth="1.5"/>
      <g transform="translate(13, 11) scale(0.056)">
        <path d="M0 464V316.9C0 208.5 68.3 111.8 170.5 75.6L340.2 15.5C361.6 7.9 384 23.8 384 46.4c0 11-5.5 21.2-14.6 27.3L336 96c48.1 0 91.2 29.8 108.1 74.9l48.6 129.5c11.8 31.4 4.1 66.8-19.6 90.5c-16 16-37.8 25.1-60.5 25.1h-3.4c-26.1 0-50.9-11.6-67.6-31.7l-32.3-38.7c-11.7 4.1-24.2 6.4-37.3 6.4l-.1 0 0 0c-6.3 0-12.5-.5-18.6-1.5c-3.6-.6-7.2-1.4-10.7-2.3l0 0c-28.9-7.8-53.1-26.8-67.8-52.2c-4.4-7.6-14.2-10.3-21.9-5.8s-10.3 14.2-5.8 21.9c24 41.5 68.3 70 119.3 71.9l47.2 70.8c4 6.1 6.2 13.2 6.2 20.4c0 20.3-16.5 36.8-36.8 36.8H48c-26.5 0-48-21.5-48-48zM328 224c13.3 0 24-10.7 24-24s-10.7-24-24-24s-24 10.7-24 24s10.7 24 24 24z" fill={GOLD}/>
      </g>
      <rect x="52" y="20" width="2.5" height="28" rx="1.2" fill={GOLD} opacity="0.7"/>
      <rect x="52" y="20" width="8" height="2" rx="1" fill={GOLD} opacity="0.5"/>
      <text x="66" y="28" fontFamily="Outfit, sans-serif" fontWeight="900" fontSize="20" fill={tc} letterSpacing="-0.5">RacePlan</text>
      <text x="66" y="46" fontFamily="Outfit, sans-serif" fontWeight="600" fontSize="13" fill={GOLD} letterSpacing="2.5">PRO</text>
      <text x="66" y="46" fontFamily="Outfit, sans-serif" fontSize="8" fill={GOLD} opacity="0.55" dx="109" dy="-11">TM</text>
    </svg>
  );
}


var DEMO_HORSES = [
  { name: "Ashford Castle", or: 105, sex: "G", age: 6, form: "1-1-2-1", status: "Active", med: null },
  { name: "River Dancer", or: 98, sex: "M", age: 5, form: "2-1-3-1", status: "Active", med: "Phenylbutazone - 5 days remaining" },
  { name: "Galway Bay", or: 94, sex: "G", age: 7, form: "3-2-1-2", status: "Active", med: null },
  { name: "Connemara Lady", or: 89, sex: "F", age: 4, form: "1-2-1-3", status: "Active", med: null },
  { name: "Tipperary Dawn", or: 86, sex: "G", age: 5, form: "2-3-2-1", status: "Active", med: "Flunixin - 2 days remaining" },
  { name: "Clare Champion", or: 82, sex: "G", age: 6, form: "4-1-2-3", status: "Active", med: null },
];

var DEMO_MEDS = [
  { horse: "River Dancer", drug: "Phenylbutazone (Equipalazone)", date: "02 Jun 2026", route: "Oral", qty: "10g", withdrawal: "168 hours", clear: "09 Jun 2026", auth: "J. Murphy" },
  { horse: "Tipperary Dawn", drug: "Flunixin (Finadyne)", date: "06 Jun 2026", route: "IV", qty: "10ml", withdrawal: "144 hours", clear: "12 Jun 2026", auth: "J. Murphy" },
  { horse: "Galway Bay", drug: "Meloxicam (Metacam)", date: "01 Jun 2026", route: "Oral", qty: "15ml", withdrawal: "72 hours", clear: "04 Jun 2026", auth: "J. Murphy" },
];

var DEMO_WHITEBOARD = [
  { date: "Fri 13 Jun", horse: "Ashford Castle", race: "2m Hdle Hcap 0-115", venue: "Leopardstown", time: "3:45pm", jockey: "R. Walsh", or: 105 },
  { date: "Fri 13 Jun", horse: "Connemara Lady", race: "1m4f Flat Hcap 0-95", venue: "Leopardstown", time: "5:00pm", jockey: "C. Hayes", or: 89 },
  { date: "Sat 14 Jun", horse: "Galway Bay", race: "2m4f Chase Hcap 0-100", venue: "Naas", time: "2:30pm", jockey: "P. Townend", or: 94 },
];

function DemoWidget() {
  var tabState = useState("yard");
  var tab = tabState[0]; var setTab = tabState[1];
  var condState = useState("");
  var cond = condState[0]; var setCond = condState[1];
  var eligState = useState(false);
  var showElig = eligState[0]; var setShowElig = eligState[1];

  var TABS = [
    { id: "yard", label: "My Yard" },
    { id: "whiteboard", label: "Whiteboard" },
    { id: "meds", label: "Med Register" },
    { id: "planner", label: "Race Planner" },
  ];

  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid rgba(201,168,76,0.15)", background: "#0f1f14" }}>
      <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#c0392b" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f39c12" }} />
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27ae60" }} />
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", marginLeft: 8, fontFamily: "monospace" }}>Murphy Racing — RacePlan Pro</div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.07)", overflowX: "auto" }}>
        {TABS.map(function(t) {
          return (
            <button key={t.id} onClick={function() { setTab(t.id); setShowElig(false); }}
              style={{ padding: "10px 20px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + GOLD : "2px solid transparent", color: tab === t.id ? GOLD : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 20, minHeight: 280 }}>

        {tab === "yard" && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Active Horses — Murphy Racing</div>
            {DEMO_HORSES.map(function(h, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 6, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: WHITE }}>{h.name}</div>
                    {h.med && <div style={{ fontSize: 11, color: RED, marginTop: 2 }}>{h.med}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{h.form}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, minWidth: 44, textAlign: "right" }}>{"OR " + h.or}</div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: h.med ? RED : GREEN, flexShrink: 0 }} />
                </div>
              );
            })}
            <div style={{ display: "flex", gap: 16, marginTop: 14, fontSize: 12 }}>
              <span style={{ color: GREEN }}>{"4 clear to run"}</span>
              <span style={{ color: RED }}>{"2 under medication"}</span>
            </div>
          </div>
        )}

        {tab === "whiteboard" && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Upcoming Runners</div>
            {DEMO_WHITEBOARD.map(function(r, i) {
              return (
                <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: GOLD, fontWeight: 700 }}>{r.date + " — " + r.venue}</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{r.time}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: WHITE, marginBottom: 2 }}>{r.horse}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{r.race + " — " + r.jockey}</div>
                </div>
              );
            })}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>Import from HRI CSV — all runners populate automatically</div>
          </div>
        )}

        {tab === "meds" && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Medicines Register — Rule 148</div>
            {DEMO_MEDS.map(function(m, i) {
              return (
                <div key={i} style={{ padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 8, border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: WHITE }}>{m.horse}</span>
                    <span style={{ fontSize: 11, color: GOLD, fontWeight: 700, background: "rgba(201,168,76,0.12)", padding: "2px 8px", borderRadius: 10 }}>{"Clear: " + m.clear}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{m.drug}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    <span>{m.date}</span>
                    <span>{m.route}</span>
                    <span>{m.qty}</span>
                    <span>{"Auth: " + m.auth}</span>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 10 }}>Full IHRB horse sheets print in one tap — replaces the ring binder</div>
          </div>
        )}

        {tab === "planner" && (
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>Race Planner — AI Eligibility Check</div>
            {!showElig ? (
              <div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Paste race conditions and the AI checks your whole yard instantly.</div>
                <textarea value={cond} onChange={function(e) { setCond(e.target.value); }}
                  placeholder="Paste conditions e.g. 2m Hurdle Handicap, 4yo+, OR 85-110, Soft/Heavy, Mares allowed..."
                  style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 13, color: WHITE, resize: "none", height: 120, fontFamily: "inherit" }} />
                <button onClick={function() { setShowElig(true); }}
                  style={{ marginTop: 10, background: GOLD, border: "none", color: NAVY, padding: "10px 24px", borderRadius: 7, cursor: "pointer", fontSize: 14, fontWeight: 800 }}>
                  Check Eligibility
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 13, color: GREEN, fontWeight: 700, marginBottom: 14 }}>3 eligible — 2 blocked — 1 not applicable</div>
                {[
                  { name: "Ashford Castle", or: 105, ok: true, note: "Eligible — OR within range, last run 21 days ago, 6yo gelding" },
                  { name: "Galway Bay", or: 94, ok: true, note: "Eligible — OR within range, soft ground form excellent" },
                  { name: "Clare Champion", or: 82, ok: true, note: "Eligible — best chance here, proven at the trip" },
                  { name: "River Dancer", or: 98, ok: false, note: "Blocked — Phenylbutazone, 5 days withdrawal remaining" },
                  { name: "Tipperary Dawn", or: 86, ok: false, note: "Blocked — Flunixin, 2 days withdrawal remaining" },
                  { name: "Connemara Lady", or: 89, ok: null, note: "Filly — mare allowance applies, may affect race choice" },
                ].map(function(h, i) {
                  return (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 7, marginBottom: 5, border: "1px solid " + (h.ok === true ? "rgba(26,122,74,0.3)" : h.ok === false ? "rgba(192,57,43,0.3)" : "rgba(201,168,76,0.2)") }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 5, flexShrink: 0, background: h.ok === true ? GREEN : h.ok === false ? RED : GOLD }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: WHITE }}>{h.name + " (OR " + h.or + ")"}</div>
                        <div style={{ fontSize: 11, color: h.ok === false ? RED : "rgba(255,255,255,0.5)", marginTop: 2 }}>{h.note}</div>
                      </div>
                    </div>
                  );
                })}
                <button onClick={function() { setShowElig(false); setCond(""); }} style={{ marginTop: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", padding: "7px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>Try again</button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

function LandingPage({ onLogin }) {
  var demoOpenState = useState(false);
  var demoOpen = demoOpenState[0]; var setDemoOpen = demoOpenState[1];
  var demoOpen2State = useState(false);
  var demoOpen2 = demoOpen2State[0]; var setDemoOpen2 = demoOpen2State[1];
  var demoEmailState = useState(""); var demoEmail = demoEmailState[0]; var setDemoEmail = demoEmailState[1];
  var demoNameState = useState(""); var demoName = demoNameState[0]; var setDemoName = demoNameState[1];
  var demoYardState = useState(""); var demoYard = demoYardState[0]; var setDemoYard = demoYardState[1];
  var demoSentState = useState(false); var demoSent = demoSentState[0]; var setDemoSent = demoSentState[1];
  var showPrivacyState = useState(false); var showPrivacy = showPrivacyState[0]; var setShowPrivacy = showPrivacyState[1];
  var showTermsState = useState(false); var showTerms = showTermsState[0]; var setShowTerms = showTermsState[1];
  var calcCourseState = useState("Leopardstown");
  var calcCourse = calcCourseState[0]; var setCalcCourse = calcCourseState[1];

  var DEMO_DISTANCES = {
    "Leopardstown": { km: 48, course: "Leopardstown" },
    "Curragh": { km: 61, course: "The Curragh" },
    "Galway": { km: 94, course: "Galway" },
    "Punchestown": { km: 67, course: "Punchestown" },
    "Navan": { km: 142, course: "Navan" },
    "Cheltenham": { km: 312, course: "Cheltenham" },
  };

  var calc = DEMO_DISTANCES[calcCourse] || DEMO_DISTANCES["Leopardstown"];
  var ratePerKm = 1.50;
  var returnKm = calc.km * 2;
  var costPerHorse = (returnKm * ratePerKm).toFixed(2);
  var twoHorses = (returnKm * ratePerKm * 2).toFixed(2);

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: PAPER, color: TEXT, overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(13,40,24,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 100, padding: "0 clamp(16px,4vw,48px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <Logo />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onLogin} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 }}>Log In</button>
          <button onClick={onLogin} style={{ background: "transparent", border: "1px solid rgba(201,168,76,0.5)", color: GOLD, padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700 }} className="cta-btn">Sign Up Free</button>
          <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 800 }} className="cta-btn">Book Demo</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: "linear-gradient(160deg, " + NAVY + " 0%, " + NAVY2 + " 100%)", minHeight: "92vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(48px,10vw,80px) clamp(16px,6vw,80px)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(201,168,76,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 80%, rgba(26,122,74,0.08) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "clamp(-20px,5vw,60px)", top: "50%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }} className="hide-mobile">
          <svg width="600" height="600" viewBox="0 0 600 600" fill="none">
            <circle cx="300" cy="300" r="280" stroke={WHITE} strokeWidth="2"/>
            <circle cx="300" cy="300" r="200" stroke={WHITE} strokeWidth="1.5"/>
            <circle cx="300" cy="300" r="120" stroke={WHITE} strokeWidth="1"/>
          </svg>
        </div>
        <div style={{ maxWidth: 820, position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", borderRadius: 4, padding: "5px 14px", fontSize: 11, color: GOLD, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 32 }}>
            Beta — Free for Founding Trainers
          </div>
          <h1 className="serif" style={{ fontSize: "clamp(40px,7vw,80px)", fontWeight: 900, color: WHITE, lineHeight: 1.08, marginBottom: 24, letterSpacing: "-1px" }}>
            Save hours every day.<br />
            <span style={{ color: GOLD, fontStyle: "normal" }}>Stay fully compliant.</span>
          </h1>
          <p style={{ fontSize: "clamp(15px,2vw,18px)", color: "rgba(255,255,255,0.65)", maxWidth: 560, lineHeight: 1.75, marginBottom: 40 }}>
            RacePlan Pro puts your medication records, race entries, owner comms, weights and compliance documents in one place — saving trainers hours of admin every day.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 800, letterSpacing: 0.2 }} className="cta-btn">Book a Demo</button>
            <button onClick={onLogin} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.25)", color: WHITE, padding: "14px 32px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }} className="cta-btn">Start Free</button>
          </div>
        </div>

        {/* Hero stat strip */}
        <div style={{ display: "flex", gap: 0, marginTop: "clamp(48px,8vw,80px)", flexWrap: "wrap" }}>
          {[
            { stat: "2hrs", label: "saved daily on meds transcription" },
            { stat: "0", label: "missed withdrawal deadlines" },
            { stat: "1 tap", label: "to WhatsApp any owner" },
            { stat: "100%", label: "Rule 148 compliant register" },
          ].map(function(s, i) {
            return (
              <div key={i} style={{ paddingRight: 40, paddingTop: 16, borderTop: "1px solid rgba(201,168,76,0.2)", marginTop: 4, marginRight: 0 }}>
                <div className="hero-stat">{s.stat}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4, maxWidth: 140, lineHeight: 1.4, letterSpacing: 0.3, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DIVIDER */}
      <div style={{ background: GOLD, height: 3, width: "100%" }} />

      {/* PAIN POINTS */}
      <div style={{ background: WHITE, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Sound familiar?</div>
            <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: NAVY, lineHeight: 1.15 }}>Every trainer in Ireland is dealing<br />with the same daily fire-fighting.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px,100%), 1fr))", gap: 2 }}>
            {[
              { num: "01", pain: "Secretary spending 1-2 hours transcribing vet prescriptions into a ring binder every single morning.", fix: "The digital Medicines Register replaces the ring binder. Log once, IHRB sheet prints in one tap." },
              { num: "02", pain: "A horse gets medication the morning of entries. You miss the withdrawal period — a fine, a missed run, potentially thousands.", fix: "Every withdrawal date tracked automatically. Ineligible horses flagged before you enter them." },
              { num: "03", pain: "Race conditions land in your inbox. Hours spent cross-checking eligibility, ratings and entries by hand.", fix: "Paste the conditions once. AI checks your entire yard and gives you a shortlist in seconds." },
              { num: "04", pain: "Owners ringing the office all week. Your secretary is on calls instead of doing the work that matters.", fix: "One-tap WhatsApp updates to every owner. Entries, declarations, results. No phone calls needed." },
              { num: "05", pain: "A horse drops weight and you only find out on race morning.", fix: "Weekly weights logged per horse. Significant drops flagged automatically so you act early." },
              { num: "06", pain: "Month end. Chasing suppliers for invoices, going through them by hand.", fix: "Each supplier gets a permanent upload link. Invoices land in the app, marked paid in one tap." },
            ].map(function(item, i) {
              return (
                <div key={i} className="pain-card" style={{ background: PAPER, padding: "28px 24px", border: "1px solid rgba(13,40,24,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: GOLD, letterSpacing: 1.5, marginBottom: 14, textTransform: "uppercase" }}>{"Problem " + item.num}</div>
                  <div style={{ fontSize: 14, color: TEXT, fontWeight: 600, lineHeight: 1.6, marginBottom: 16 }}>{item.pain}</div>
                  <div style={{ borderTop: "1px solid " + GOLD + "30", paddingTop: 14, fontSize: 13, color: GREEN, fontWeight: 500, lineHeight: 1.6 }}>{item.fix}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WHAT IT GIVES YOU — dark strip */}
      <div style={{ background: NAVY, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>What you get back</div>
            <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: WHITE, lineHeight: 1.15 }}>The numbers that matter.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 1, border: "1px solid rgba(201,168,76,0.15)" }}>
            {[
              { number: "2hrs", unit: "Saved daily", sub: "On medicines transcription alone. 60 hours a month back." },
              { number: "0", unit: "Missed deadlines", sub: "Withdrawal tracking means no horse enters while ineligible." },
              { number: "1 tap", unit: "Owner update", sub: "WhatsApp any owner from the app. No calls, no chasing." },
              { number: "100%", unit: "Compliance", sub: "Rule 148 register, IHRB sheets, PIN-locked records." },
              { number: "5-10hrs", unit: "Saved weekly", sub: "Trainers and secretaries get hours back every week." },
              { number: "1 place", unit: "For everything", sub: "Meds, weights, entries, comms, invoices. One login." },
            ].map(function(s, i) {
              return (
                <div key={i} style={{ padding: "32px 24px", borderRight: "1px solid rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                  <div className="serif" style={{ fontSize: "clamp(36px,5vw,54px)", fontWeight: 900, fontStyle: "normal", color: GOLD, lineHeight: 1, marginBottom: 8 }}>{s.number}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: WHITE, marginBottom: 6, letterSpacing: 0.2 }}>{s.unit}</div>
                  <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>{s.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEATURES GRID */}
      <div style={{ background: PAPER, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Everything in one place</div>
            <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: NAVY, lineHeight: 1.15 }}>Built for the way you actually work.</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(220px,100%), 1fr))", gap: 16 }}>
            {[
              { icon: "H", label: "Race Planner", desc: "AI reads race conditions and checks your whole yard for eligible horses in seconds." },
              { icon: "R", label: "Med Register", desc: "Rule 148 compliant digital register. Replaces the ring binder. IHRB sheet in one tap." },
              { icon: "Rx", label: "Prescriptions", desc: "Photo every vet prescription by date. Retrieve any day's records instantly." },
              { icon: "G", label: "Galloping", desc: "Log where each horse worked, what they did, how they went. Full history per horse." },
              { icon: "T", label: "Trotters", desc: "Schedule soundness trots for a batch of horses. Mark outcomes and add notes." },
              { icon: "W", label: "Whiteboard", desc: "Import your runners from HRI. Print a professional stable-wall sheet in one tap." },
              { icon: "O", label: "Owner Comms", desc: "WhatsApp every owner directly from the app. Templates for every update type." },
              { icon: "I", label: "Invoices", desc: "Suppliers upload invoices via a unique link. You mark paid. Month-end solved." },
              { icon: "S", label: "Reports", desc: "Pull date-range PDF reports for medications, gallops, weights, soundness, invoices." },
            ].map(function(f, i) {
              return (
                <div key={i} className="feature-card" style={{ background: WHITE, borderRadius: 10, padding: "22px", border: "1px solid rgba(13,40,24,0.08)" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: NAVY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: GOLD, marginBottom: 14, letterSpacing: 0.5 }}>{f.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* INTERACTIVE DEMO SECTION */}
      <div style={{ background: NAVY, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,48px)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Interactive Demo</div>
            <h2 style={{ fontSize: "clamp(24px,3vw,38px)", fontWeight: 800, color: WHITE, lineHeight: 1.2, marginBottom: 12 }}>See it in action.</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto" }}>Click through the tabs below to explore. This is real data from a sample yard.</p>
          </div>

          <DemoWidget />

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <button onClick={onLogin} style={{ background: GOLD, border: "none", color: NAVY, padding: "13px 32px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 800 }} className="cta-btn">Start Free — No Card Required</button>
          </div>
        </div>
      </div>

      {/* RACE PLANNER DETAIL */}
      <div style={{ background: WHITE, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,48px)", borderTop: "1px solid rgba(13,40,24,0.06)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 48, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Race Planning</div>
            <h2 className="serif" style={{ fontSize: "clamp(24px,3vw,38px)", fontWeight: 900, color: NAVY, lineHeight: 1.2, marginBottom: 20 }}>Stop cross-referencing by hand.</h2>
            <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.8, marginBottom: 16, opacity: 0.8 }}>Paste any race conditions — age, rating, sex, discipline, distance. The AI reads them instantly and tells you which horses are eligible, which are not, and why.</p>
            <p style={{ fontSize: 15, color: TEXT, lineHeight: 1.8, marginBottom: 24, opacity: 0.8 }}>Withdrawal periods checked automatically. A horse that cannot run will not appear as eligible. No manual checking. No risk of error.</p>
            {["Checks every horse in your yard instantly", "Withdrawal periods calculated automatically", "AI analysis on each eligible horse", "Works for HRI and BHA conditions"].map(function(t, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14, color: NAVY }}>
                  <span style={{ width: 18, height: 18, borderRadius: "50%", background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 900, color: WHITE }}>v</span>
                  {t}
                </div>
              );
            })}
          </div>
          <div style={{ background: PAPER, borderRadius: 12, padding: "24px", border: "1px solid rgba(13,40,24,0.08)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Eligible Horses — Today</div>
            {[
              { name: "Horse A", or: 98, ok: true, note: "Course and distance winner" },
              { name: "Horse B", or: 95, ok: true, note: "Improving, won last 2" },
              { name: "Horse C", or: 91, ok: true, note: "Handles soft ground well" },
              { name: "Horse D", or: 89, ok: false, note: "Medication — 4 days remaining" },
              { name: "Horse E", or: 86, ok: false, note: "Treatment — clear in 12 days" },
            ].map(function(h, i) {
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(13,40,24,0.05)" : "none" }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: h.ok ? GREEN : RED, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{h.name}</div>
                    <div style={{ fontSize: 11, color: h.ok ? MUTED : RED, marginTop: 1 }}>{h.note}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: h.ok ? NAVY : MUTED }}>{"OR " + h.or}</div>
                </div>
              );
            })}
            <div style={{ fontSize: 11, color: MUTED, marginTop: 14, textAlign: "center" }}>3 eligible  —  2 blocked  —  updated live</div>
          </div>
        </div>
      </div>

      {/* BETA CTA */}
      <div style={{ background: NAVY2, padding: "clamp(48px,8vw,80px) clamp(16px,4vw,48px)", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Beta Access</div>
          <h2 className="serif" style={{ fontSize: "clamp(28px,4vw,46px)", fontWeight: 900, color: WHITE, lineHeight: 1.15, marginBottom: 16, fontStyle: "italic" }}>Free during beta.</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.8, marginBottom: 36 }}>We are working with a select group of Irish and UK trainers to shape the product. Full access, unlimited horses, no credit card. Founding trainers get preferential pricing at launch.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "14px 36px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 800 }} className="cta-btn">Book a Demo</button>
            <button onClick={onLogin} style={{ background: "transparent", border: "1.5px solid rgba(255,255,255,0.25)", color: WHITE, padding: "14px 36px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600 }} className="cta-btn">Start Free</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: NAVY, padding: "32px clamp(16px,4vw,48px)", borderTop: "1px solid rgba(201,168,76,0.12)" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <Logo />
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center" }}>
            {"\u00a9 2026 RacePlan Pro\u2122. All rights reserved. Ireland and UK."}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <span onClick={function() { setShowPrivacy(true); }} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "underline" }}>Privacy</span>
            <span onClick={function() { setShowTerms(true); }} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "underline" }}>Terms</span>
            <a href="mailto:hello@raceplanpro.com" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>Contact</a>
          </div>
        </div>
      </div>

      {/* PRIVACY MODAL */}
      {showPrivacy && (
        <div onClick={function() { setShowPrivacy(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 12, padding: "36px 32px", maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <div className="serif" style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 16 }}>Privacy Policy</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.9 }}>
              <p style={{ marginBottom: 12 }}><strong>Last updated: May 2026</strong></p>
              <p style={{ marginBottom: 12 }}>RacePlan Pro is committed to protecting your personal data. We collect your name, email and yard data you enter into the platform. We do not sell your data to any third party.</p>
              <p style={{ marginBottom: 12 }}>Your data is stored securely on Supabase infrastructure hosted in the EU. You may request deletion at any time by emailing hello@raceplanpro.com. Under GDPR you have the right to access, rectify and erase your data.</p>
              <p>For queries contact hello@raceplanpro.com</p>
            </div>
            <button onClick={function() { setShowPrivacy(false); }} style={{ marginTop: 20, width: "100%", background: NAVY, border: "none", color: WHITE, padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Close</button>
          </div>
        </div>
      )}

      {/* TERMS MODAL */}
      {showTerms && (
        <div onClick={function() { setShowTerms(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 12, padding: "36px 32px", maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <div className="serif" style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 16 }}>Terms of Use</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.9 }}>
              <p style={{ marginBottom: 12 }}><strong>Last updated: June 2026</strong></p>

              <p style={{ marginBottom: 6, fontWeight: 700, color: "#0d2818" }}>1. Licence</p>
              <p style={{ marginBottom: 12 }}>RacePlan Pro is licensed for use by professional racing trainers and their authorised staff for yard management purposes only. You may not resell, sublicense or share access with third parties outside your yard.</p>

              <p style={{ marginBottom: 6, fontWeight: 700, color: "#0d2818" }}>2. Fair Usage</p>
              <p style={{ marginBottom: 8 }}>Each subscription plan includes fair usage of all features. The following usage is included within your plan and is not charged separately under normal use:</p>
              <ul style={{ paddingLeft: 18, marginBottom: 12 }}>
                <li style={{ marginBottom: 4 }}>Up to 200 AI-assisted requests per month (Race Planner, AI Assistant, eligibility checks)</li>
                <li style={{ marginBottom: 4 }}>Up to 500 WhatsApp messages per month via the Owner Portal</li>
                <li style={{ marginBottom: 4 }}>Up to 2GB of file storage (prescription photos, supplier invoices)</li>
                <li style={{ marginBottom: 4 }}>Unlimited staff logins - all yard staff can access the app</li>
              </ul>
              <p style={{ marginBottom: 12 }}>If your usage consistently and materially exceeds these limits, RacePlan Pro reserves the right to contact you to discuss a revised plan or additional charges. We will always notify you before billing anything beyond your subscription fee.</p>

              <p style={{ marginBottom: 6, fontWeight: 700, color: "#0d2818" }}>3. What may cost extra</p>
              <p style={{ marginBottom: 8 }}>The following may incur additional charges if usage significantly exceeds the fair usage limits above:</p>
              <ul style={{ paddingLeft: 18, marginBottom: 12 }}>
                <li style={{ marginBottom: 4 }}>AI-assisted feature usage above 200 requests per month</li>
                <li style={{ marginBottom: 4 }}>WhatsApp messages above 500 per month</li>
                <li style={{ marginBottom: 4 }}>File storage above 2GB</li>
                <li style={{ marginBottom: 4 }}>Excessive automated or non-human usage</li>
              </ul>

              <p style={{ marginBottom: 6, fontWeight: 700, color: "#0d2818" }}>4. Accuracy</p>
              <p style={{ marginBottom: 12 }}>RacePlan Pro does not guarantee the accuracy of eligibility calculations, withdrawal period calculations or any AI-generated analysis. Trainers remain solely responsible for verifying all entries and declarations with HRI, the BHA or the relevant racing authority.</p>

              <p style={{ marginBottom: 6, fontWeight: 700, color: "#0d2818" }}>5. Intellectual Property</p>
              <p style={{ marginBottom: 12 }}>{"\u00a9 2026 RacePlan Pro\u2122. All rights reserved. The RacePlan Pro name, logo, software and content are the exclusive property of RacePlan Pro. Unauthorised copying or reproduction is strictly prohibited."}</p>

              <p style={{ marginBottom: 6, fontWeight: 700, color: "#0d2818" }}>6. Governing Law</p>
              <p>These terms are governed by the laws of Ireland. Any disputes shall be subject to the exclusive jurisdiction of the Irish courts.</p>
            </div>
            <button onClick={function() { setShowTerms(false); }} style={{ marginTop: 20, width: "100%", background: NAVY, border: "none", color: WHITE, padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Close</button>
          </div>
        </div>
      )}

      {/* DEMO MODAL */}
      {demoOpen && (
        <div onClick={function() { setDemoOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 14, padding: "36px 32px", maxWidth: 440, width: "100%" }}>
            <div className="serif" style={{ fontSize: 24, fontWeight: 900, color: NAVY, marginBottom: 8 }}>Book a Demo</div>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 24, lineHeight: 1.7 }}>Leave your details and we will be in touch within 24 hours for a 20-minute walkthrough.</p>
            {[
              { label: "Your Name", val: demoName, set: setDemoName, type: "text", ph: "e.g. John Murphy" },
              { label: "Email Address", val: demoEmail, set: setDemoEmail, type: "email", ph: "trainer@example.com" },
              { label: "Yard / Phone (optional)", val: demoYard, set: setDemoYard, type: "text", ph: "e.g. Murphy Racing, Co. Tipperary" },
            ].map(function(f, i) {
              return (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{f.label}</div>
                  <input type={f.type} value={f.val} onChange={function(e) { f.set(e.target.value); }} placeholder={f.ph}
                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid rgba(13,40,24,0.12)", borderRadius: 8, fontSize: 14, color: NAVY, fontFamily: "inherit", outline: "none" }} />
                </div>
              );
            })}
            {demoSent ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "14px", textAlign: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: GREEN }}>Request sent!</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{"We will be in touch at " + demoEmail + " within 24 hours."}</div>
              </div>
            ) : (
              <a href={"mailto:hello@raceplanpro.com?subject=Demo Request from " + encodeURIComponent(demoName) + "&body=Name: " + encodeURIComponent(demoName) + "%0AEmail: " + encodeURIComponent(demoEmail) + "%0AYard: " + encodeURIComponent(demoYard)}
                onClick={function() { if (demoEmail) setDemoSent(true); }}
                style={{ display: "block", background: demoEmail ? NAVY : "#ccc", color: WHITE, padding: "13px", borderRadius: 8, textAlign: "center", fontWeight: 800, fontSize: 15, textDecoration: "none", marginBottom: 10, cursor: demoEmail ? "pointer" : "not-allowed" }}>
                Send Demo Request
              </a>
            )}
            <button onClick={function() { setDemoOpen(false); setDemoSent(false); }} style={{ width: "100%", background: PAPER, border: "none", color: MUTED, padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
