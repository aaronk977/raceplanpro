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

var FONTS = "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');";

var CSS = FONTS + `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${PAPER}; color: ${TEXT}; }
  .serif { font-family: 'Playfair Display', Georgia, serif; }
  .hero-stat { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: clamp(64px,12vw,130px); font-weight: 900; line-height: 1; color: ${GOLD}; }
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
  var tc = dark ? NAVY : WHITE;
  return (
    <svg width={size === "lg" ? 220 : 160} height={size === "lg" ? 44 : 32} viewBox="0 0 220 44" fill="none">
      <path d="M22 4 C10 4 4 12 4 20 C4 32 14 38 22 38 C24 38 26 37.5 28 36.5 L28 32 C26.5 33 24.5 34 22 34 C16 34 8 29 8 20 C8 14 13 8 22 8 C31 8 36 14 36 20 C36 29 28 34 22 34 L22 38 C30 38 40 32 40 20 C40 12 34 4 22 4 Z" fill={GOLD}/>
      <circle cx="14" cy="38" r="3" fill={GOLD}/>
      <circle cx="30" cy="38" r="3" fill={GOLD}/>
      <text x="50" y="30" fontFamily="Playfair Display, Georgia, serif" fontWeight="900" fontStyle="italic" fontSize="22" fill={tc} letterSpacing="-0.5">RacePlan</text>
      <text x="167" y="30" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18" fill={GOLD} letterSpacing="-0.3">Pro</text>
      <text x="207" y="20" fontFamily="Inter, sans-serif" fontWeight="400" fontSize="9" fill={GOLD + "99"}>TM</text>
    </svg>
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
    <div style={{ fontFamily: "'Inter', sans-serif", background: PAPER, color: TEXT, overflowX: "hidden" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(13,40,24,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 100, padding: "0 clamp(16px,4vw,48px)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(201,168,76,0.12)" }}>
        <Logo />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button onClick={onLogin} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500, letterSpacing: 0.2 }}>Log In</button>
          <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 800, letterSpacing: 0.2 }} className="cta-btn">Book Demo</button>
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
            <span style={{ color: GOLD, fontStyle: "italic" }}>Stay fully compliant.</span>
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
                  <div className="serif" style={{ fontSize: "clamp(36px,5vw,54px)", fontWeight: 900, fontStyle: "italic", color: GOLD, lineHeight: 1, marginBottom: 8 }}>{s.number}</div>
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
              <p style={{ marginBottom: 12 }}><strong>Last updated: May 2026</strong></p>
              <p style={{ marginBottom: 12 }}>By using RacePlan Pro you agree to these terms. RacePlan Pro is licensed for use by professional racing trainers and authorised staff for yard management only. You may not resell or share access.</p>
              <p style={{ marginBottom: 12 }}>{"\u00a9 2026 RacePlan Pro\u2122. All rights reserved. The RacePlan Pro name, logo, software and content are the exclusive property of RacePlan Pro. Unauthorised copying or reproduction is strictly prohibited."}</p>
              <p style={{ marginBottom: 12 }}>RacePlan Pro does not guarantee the accuracy of eligibility calculations. Trainers remain responsible for verifying all entries with the relevant racing authority.</p>
              <p>These terms are governed by the laws of Ireland.</p>
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
