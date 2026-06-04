import React, { useState } from "react";

var NAVY = "#0a1628";
var GOLD = "#c9a84c";
var GREEN = "#1a7a4a";
var RED = "#c0392b";
var LIGHT = "#f5f7fa";
var WHITE = "#ffffff";

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
    "Leopardstown": { km: 48, course: "Leopardstown", county: "Co. Tipperary" },
    "Curragh": { km: 61, course: "The Curragh", county: "Co. Tipperary" },
    "Galway": { km: 94, course: "Galway", county: "Co. Tipperary" },
    "Punchestown": { km: 67, course: "Punchestown", county: "Co. Tipperary" },
    "Navan": { km: 142, course: "Navan", county: "Co. Tipperary" },
    "Cheltenham": { km: 312, course: "Cheltenham", county: "Co. Tipperary" },
  };

  var calc = DEMO_DISTANCES[calcCourse] || DEMO_DISTANCES["Leopardstown"];
  var ratePerKm = 1.50;
  var returnKm = calc.km * 2;
  var costPerHorse = (returnKm * ratePerKm).toFixed(2);
  var twoHorses = (returnKm * ratePerKm * 2).toFixed(2);

  return (
    <div style={{ fontFamily: "Inter, Helvetica Neue, sans-serif", background: WHITE, color: NAVY, overflowX: "hidden" }}>

      {/* NAV */}
      <div style={{ position: "sticky", top: 0, background: "rgba(10,22,40,0.97)", backdropFilter: "blur(10px)", zIndex: 100, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>🏇</span>
          <span style={{ fontWeight: 900, fontSize: 18, color: WHITE, letterSpacing: -0.5 }}>RacePlan <span style={{ color: GOLD }}>Pro</span></span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={onLogin} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: WHITE, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Log In</button>
          <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "8px 18px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 800 }}>Book Demo</button>
        </div>
      </div>

      {/* HERO */}
      <div style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, #1a2d4a 100%)", padding: "clamp(48px, 10vw, 80px) clamp(16px, 4vw, 24px) clamp(40px, 8vw, 70px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(circle at 20% 50%, rgba(201,168,76,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 50%, rgba(26,122,74,0.08) 0%, transparent 60%)" }} />
        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 24 }}>
            Now in Beta - Free for Founding Trainers
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 900, color: WHITE, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
            {"Your yard. Under control."}<br />
            <span style={{ color: GOLD }}>{"Every entry. Every med. Every owner update."}</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.7 }}>
            The first AI-powered yard management app built specifically for professional racing trainers in Ireland and the UK. Entries, medications, owner communications and raceday management at your fingertips.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", padding: "0 8px" }}>
            <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "16px 32px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 900, letterSpacing: -0.3 }}>Book a Demo</button>
            <button onClick={onLogin} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: WHITE, padding: "16px 32px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>Get Started Free</button>
          </div>
        </div>
      </div>

      {/* PAIN POINTS */}
      <div style={{ background: LIGHT, padding: "clamp(40px, 8vw, 70px) clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: NAVY, marginBottom: 12 }}>Sound familiar?</h2>
            <p style={{ fontSize: 16, color: "#666", maxWidth: 560, margin: "0 auto" }}>Every trainer in Ireland and the UK is dealing with the same daily fire-fighting. We built RacePlan Pro to put it out.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 20 }}>
            {[
              { icon: "💊", pain: "A horse gets medication the morning of entries or declarations and you go past the withdrawal period, potentially costing thousands.", fix: "RacePlan Pro fires a WhatsApp alert before every entry deadline — so you always know which horses are clear to enter." },
              { icon: "📋", pain: "Race conditions land in your inbox. You spend hours cross-checking each horse for eligibility by hand.", fix: "Paste the conditions. Our AI reads them, checks your entire yard and gives you a ranked eligible list in seconds." },
              { icon: "💉", pain: "A horse receives a treatment and goes on the shortlist weeks later. Someone forgets the withdrawal period.", fix: "Every treatment is logged with its withdrawal period. The Race Planner blocks that horse automatically until it is clear." },
              { icon: "⚖️", pain: "Keeping on top of each horse\u2019s weight week to week is hard by hand, yet it is vital for performance and health.", fix: "Weight changes beyond your set threshold trigger an instant alert. You act before it becomes a problem." },
              { icon: "📱", pain: "Owners are ringing for updates. Your secretary is stuck on calls instead of doing entries.", fix: "One tap sends a WhatsApp race update or declaration confirmation to every owner. Scheduled, professional, done." },
              { icon: "🗂️", pain: "Month end. You are trying to remember which horses had medication so the office can do the billing.", fix: "Every dose is logged per horse per day. The full medication report is there when the office needs it." },
            ].map(function(item, i) {
              return (
                <div key={i} style={{ background: WHITE, borderRadius: 14, padding: "24px", border: "1px solid #e8ecf0" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontSize: 14, color: RED, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{"The problem: " + item.pain}</div>
                  <div style={{ width: 40, height: 2, background: GOLD, marginBottom: 10, borderRadius: 2 }} />
                  <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{"The fix: " + item.fix}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* DEMO SECTION */}
      <div style={{ background: NAVY, padding: "clamp(40px, 8vw, 70px) clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>
            Live Demo
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: WHITE, marginBottom: 12 }}>See it in action</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 36, maxWidth: 520, margin: "0 auto 36px" }}>
            Click play to watch a full walkthrough of RacePlan Pro — from login through every feature.
          </p>
          <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", border: "2px solid rgba(201,168,76,0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.4)", maxWidth: 820, margin: "0 auto" }}>
            {demoOpen2 ? (
              <div style={{ position: "relative" }}>
                <iframe
                  src="/demo.html"
                  style={{ width: "100%", height: "clamp(300px, 60vw, 520px)", border: "none", display: "block" }}
                  title="RacePlan Pro Demo"
                />
                <button onClick={function() { setDemoOpen2(false); }}
                  style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>
            ) : (
              <div onClick={function() { setDemoOpen2(true); }}
                style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)", height: "clamp(260px, 50vw, 400px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 50% 50%, rgba(201,168,76,0.08) 0%, transparent 70%)" }} />
                <div style={{ width: 80, height: 80, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 20, boxShadow: "0 0 0 16px rgba(201,168,76,0.15)" }}>
                  ▶
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 8 }}>Watch the full demo</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>2 minutes · All features · Interactive</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, marginTop: 32, maxWidth: 400 }}>
                  {["Login", "Race Planner", "Medications", "Whiteboard", "AI Assistant"].map(function(f) {
                    return <div key={f} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 6, padding: "6px 4px", fontSize: 10, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>{f}</div>;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THE NUMBERS */}
      <div style={{ background: NAVY, padding: "clamp(40px, 8vw, 70px) clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: WHITE, marginBottom: 12 }}>The numbers that matter</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 50 }}>Racing is a business. Here is what the admin problem actually costs.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 20 }}>
            {[
              { number: "1", unit: "missed entry", sub: "can cost tens of thousands in potential prize money", color: RED },
              { number: "5-10", unit: "hours", sub: "lost every week to manual admin for trainer and secretary combined", color: GOLD },
              { number: "12pm", unit: "HRI deadline", sub: "The app alerts you before it. Every entry day. Without fail.", color: GREEN },
              { number: "10am", unit: "BHA deadline", sub: "UK entries covered too. Different deadlines, one system.", color: GREEN },
              { number: "0", unit: "phone calls", sub: "needed from owners on race day when you send updates through the app", color: GOLD },
              { number: "100%", unit: "withdrawal tracking", sub: "No horse enters while ineligible. The system enforces it automatically.", color: GREEN },
            ].map(function(stat, i) {
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px 16px" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: stat.color, lineHeight: 1, textShadow: "0 0 20px currentColor" }}>{stat.number}</div>
                  <div style={{ fontSize: 14, color: WHITE, fontWeight: 700, margin: "6px 0 4px" }}>{stat.unit}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{stat.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RACE PLANNER FEATURE */}
      <div style={{ padding: "clamp(40px, 8vw, 70px) clamp(16px, 4vw, 24px)", background: WHITE }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Race Planning</div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, color: NAVY, marginBottom: 16, lineHeight: 1.2 }}>Stop cross-referencing by hand</h2>
              <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: 20 }}>
                Paste any race conditions — age, rating, sex, discipline, distance. The AI reads them instantly and tells you which horses in your yard are eligible, which are not, and why.
              </p>
              <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: 24 }}>
                Medication and treatment withdrawal periods are checked automatically. A horse that cannot run will not appear as eligible. No manual checking. No risk of error.
              </p>
              {["Checks every horse in your yard instantly","Medication withdrawal calculated automatically","Treatment withdrawal blocks entries","AI analysis on each eligible horse","Works for HRI and BHA conditions"].map(function(t, i) {
                return <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 14, color: NAVY }}>
                  <span style={{ color: GREEN, fontWeight: 900, fontSize: 16 }}>✓</span>{t}
                </div>;
              })}
            </div>
            <div style={{ background: LIGHT, borderRadius: 16, padding: "24px", border: "1px solid #e8ecf0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Race Planner — Eligible Horses</div>
              {[
                { name: "Horse A", rating: 98, status: "eligible", note: "Course and distance winner" },
                { name: "Horse B", rating: 95, status: "eligible", note: "Improving, won last 2" },
                { name: "Horse C", rating: 91, status: "eligible", note: "Handles soft ground" },
                { name: "Horse D", rating: 89, status: "blocked", note: "Medication withdrawal — 4 days remaining" },
                { name: "Horse E", rating: 86, status: "blocked", note: "Treatment withdrawal — clear in 12 days" },
              ].map(function(h, i) {
                var eligible = h.status === "eligible";
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: eligible ? WHITE : RED + "08", borderRadius: 8, marginBottom: 6, border: "1px solid " + (eligible ? "#e8ecf0" : RED + "20") }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: eligible ? GREEN : RED, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{h.name}</div>
                      <div style={{ fontSize: 11, color: eligible ? "#666" : RED }}>{h.note}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: eligible ? NAVY : "#aaa" }}>{"OR " + h.rating}</div>
                  </div>
                );
              })}
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 10, textAlign: "center" }}>3 eligible · 2 blocked · updated live</div>
            </div>
          </div>
        </div>
      </div>

      {/* TRAVEL CALCULATOR FEATURE */}
      <div style={{ padding: "clamp(40px, 8vw, 70px) clamp(16px, 4vw, 24px)", background: LIGHT }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "center" }}>
            <div style={{ background: WHITE, borderRadius: 16, padding: "24px", border: "1px solid #e8ecf0" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>Travel Cost Calculator</div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>From: Co. Tipperary yard</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {Object.keys(DEMO_DISTANCES).map(function(c) {
                  return (
                    <button key={c} onClick={function() { setCalcCourse(c); }}
                      style={{ padding: "6px 14px", borderRadius: 20, border: "2px solid " + (calcCourse === c ? NAVY : "#e8ecf0"), background: calcCourse === c ? NAVY : WHITE, color: calcCourse === c ? WHITE : NAVY, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      {DEMO_DISTANCES[c].course}
                    </button>
                  );
                })}
              </div>
              <div style={{ background: LIGHT, borderRadius: 10, padding: "16px", marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#666" }}>Distance (each way)</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{calc.km + " km"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#666" }}>Return journey</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{returnKm + " km"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: "#666" }}>Rate</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Your rate per km</span>
                </div>
                <div style={{ height: 1, background: "#e8ecf0", margin: "10px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>1 horse</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: NAVY }}>{"EUR " + costPerHorse}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>2 horses</span>
                  <span style={{ fontSize: 16, fontWeight: 900, color: GREEN }}>{"EUR " + twoHorses}</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#aaa", textAlign: "center" }}>Set your own rate in Yard Settings. Works for all 85 Irish and UK courses.</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Travel Calculator</div>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, color: NAVY, marginBottom: 16, lineHeight: 1.2 }}>Know your travel cost before you enter</h2>
              <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, marginBottom: 20 }}>
                Set your yard location and your rate per kilometre once. Then tap any racecourse in Ireland or the UK to get an instant cost calculation — one way or return, one horse or several.
              </p>
              <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8 }}>
                No more guessing. No more spreadsheets. The number is there before you pick up the phone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT IT DOES */}
      <div style={{ padding: "clamp(40px, 8vw, 70px) clamp(16px, 4vw, 24px)", background: WHITE }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: NAVY, marginBottom: 12 }}>Everything in one place. On your phone.</h2>
            <p style={{ fontSize: 15, color: "#666", maxWidth: 520, margin: "0 auto" }}>RacePlan Pro is not a replacement for your secretary. It is the system that makes their job and yours dramatically easier and less error-prone.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { icon: "🏇", title: "Race Planner", desc: "Paste race conditions. AI reads them and lists which of your horses are eligible, with analysis on each one." },
              { icon: "💊", title: "Medication Tracker", desc: "Daily entry per horse. Withdrawal periods calculated automatically. WhatsApp alert before every entry deadline." },
              { icon: "💉", title: "Treatment Withdrawals", desc: "Log treatments and their withdrawal periods. The app blocks entries automatically until the horse is clear." },
              { icon: "🖨️", title: "Raceday Whiteboard", desc: "Import your runners from HRI. Print a professional whiteboard for the yard in one tap." },
              { icon: "⚖️", title: "Weights and Trends", desc: "Weekly weigh-in for every horse. Alerts on significant changes. Full history and trend view." },
              { icon: "👥", title: "Owner Communications", desc: "One-tap WhatsApp to every owner. Entries, declarations, race updates, training videos. Simple and professional." },
              { icon: "🤖", title: "AI Yard Assistant", desc: "Set reminders, start medications, log notes by voice or text. Your yard, always up to date." },
              { icon: "🚛", title: "Travel Calculator", desc: "Select any racecourse in Ireland or UK. Get the cost at your rate per km. Instantly." },
              { icon: "🔐", title: "Staff Access", desc: "Head lad, secretary, vet, staff — each sees only what they need. Separate logins, separate views." },
            ].map(function(f, i) {
              return (
                <div key={i} style={{ background: LIGHT, borderRadius: 12, padding: "20px", border: "1px solid #e8ecf0" }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: NAVY, marginBottom: 6 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WHAT IT IS / IS NOT */}
      <div style={{ background: LIGHT, padding: "clamp(32px, 6vw, 50px) clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: NAVY, marginBottom: 24 }}>What RacePlan Pro is and is not</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, textAlign: "left" }}>
            <div style={{ background: WHITE, borderRadius: 12, padding: "20px", border: "1px solid #e8ecf0" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: GREEN, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>It is</div>
              {["Yard management at your fingertips","AI-powered race eligibility checking","Medication and treatment compliance","Real-time alerts before deadlines","A professional owner comms tool","Mobile-first, works on any phone"].map(function(t, i) {
                return <div key={i} style={{ fontSize: 13, color: "#333", padding: "6px 0", borderBottom: i < 5 ? "1px solid #f0f0f0" : "none" }}>{t}</div>;
              })}
            </div>
            <div style={{ background: WHITE, borderRadius: 12, padding: "20px", border: "1px solid #e8ecf0" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: RED, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>It is not</div>
              {["A replacement for your secretary","An invoicing or billing tool","A racing tips or form service","A complicated system to learn","A desktop-only product","Another WhatsApp group"].map(function(t, i) {
                return <div key={i} style={{ fontSize: 13, color: "#333", padding: "6px 0", borderBottom: i < 5 ? "1px solid #f0f0f0" : "none" }}>{t}</div>;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* BETA */}
      <div style={{ background: WHITE, padding: "clamp(36px, 7vw, 60px) clamp(16px, 4vw, 24px)" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>Beta Access</div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: NAVY, marginBottom: 16 }}>Free during beta.</h2>
          <p style={{ fontSize: 16, color: "#555", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.8 }}>
            We are working with a select group of Irish and UK trainers to shape the product before launch. Access is completely free during this period. Founding members will receive preferential pricing when we go live.
          </p>
          <div style={{ background: LIGHT, border: "1px solid #e8ecf0", borderRadius: 14, padding: "24px", maxWidth: 420, margin: "0 auto" }}>
            {["Full access to all features","Unlimited horses during beta","Staff logins included","No credit card required","Founding member pricing at launch"].map(function(t, i) {
              return <div key={i} style={{ fontSize: 13, color: "#333", padding: "7px 0", borderBottom: i < 4 ? "1px solid #e8ecf0" : "none" }}>{"✓ " + t}</div>;
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, #1a2d4a 100%)", padding: "clamp(40px, 8vw, 70px) clamp(16px, 4vw, 24px)", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: WHITE, marginBottom: 16 }}>Ready to see it in your yard?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
            Book a 20-minute demo. We will walk through the app live using your yard setup. No commitment, no pitch — just the product.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", padding: "0 8px" }}>
            <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "16px 36px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 900 }}>Book a Demo</button>
            <button onClick={onLogin} style={{ background: "transparent", border: "2px solid rgba(255,255,255,0.3)", color: WHITE, padding: "16px 36px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>Start Free</button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#06101c", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>🏇</span>
          <span style={{ fontWeight: 900, fontSize: 15, color: WHITE }}>RacePlan <span style={{ color: GOLD }}>Pro</span></span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: "0 0 8px" }}>{"\u00a9 2026 RacePlan Pro. All rights reserved. Built for trainers, by people who understand racing. Ireland and UK."}</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <span onClick={function() { setShowPrivacy(true); }} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "underline" }}>Privacy Policy</span>
          <span onClick={function() { setShowTerms(true); }} style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", cursor: "pointer", textDecoration: "underline" }}>Terms of Use</span>
          <a href="mailto:hello@raceplanpro.com" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>hello@raceplanpro.com</a>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL */}
      {showPrivacy && (
        <div onClick={function() { setShowPrivacy(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 16, padding: "36px 32px", maxWidth: 580, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: NAVY, marginBottom: 16 }}>Privacy Policy</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.8 }}>
              <p style={{ marginBottom: 12 }}><strong>Last updated: May 2026</strong></p>
              <p style={{ marginBottom: 12 }}>RacePlan Pro ("we", "us", "our") is committed to protecting your personal data. This policy explains how we collect, use and protect information you provide when using our platform.</p>
              <p style={{ marginBottom: 8 }}><strong>What we collect</strong></p>
              <p style={{ marginBottom: 12 }}>We collect your name, email address, yard information and data you enter into the platform (horses, medications, entries). We do not sell your data to any third party.</p>
              <p style={{ marginBottom: 8 }}><strong>How we use it</strong></p>
              <p style={{ marginBottom: 12 }}>Your data is used solely to provide the RacePlan Pro service. Yard data is private to your account and not shared with other trainers or third parties.</p>
              <p style={{ marginBottom: 8 }}><strong>Data storage</strong></p>
              <p style={{ marginBottom: 12 }}>Data is stored securely on Supabase infrastructure hosted in the EU. We use industry-standard encryption in transit and at rest.</p>
              <p style={{ marginBottom: 8 }}><strong>Your rights</strong></p>
              <p style={{ marginBottom: 12 }}>You may request deletion of your account and all associated data at any time by emailing hello@raceplanpro.com. Under GDPR you have the right to access, rectify and erase your personal data.</p>
              <p style={{ marginBottom: 8 }}><strong>Cookies</strong></p>
              <p style={{ marginBottom: 12 }}>We use only essential cookies required for authentication. We do not use tracking or advertising cookies.</p>
              <p style={{ marginBottom: 8 }}><strong>Contact</strong></p>
              <p>For any privacy queries contact hello@raceplanpro.com</p>
            </div>
            <button onClick={function() { setShowPrivacy(false); }} style={{ marginTop: 20, width: "100%", background: NAVY, border: "none", color: WHITE, padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Close</button>
          </div>
        </div>
      )}

      {/* TERMS OF USE MODAL */}
      {showTerms && (
        <div onClick={function() { setShowTerms(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 16, padding: "36px 32px", maxWidth: 580, width: "100%", maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: NAVY, marginBottom: 16 }}>Terms of Use</div>
            <div style={{ fontSize: 13, color: "#444", lineHeight: 1.8 }}>
              <p style={{ marginBottom: 12 }}><strong>Last updated: May 2026</strong></p>
              <p style={{ marginBottom: 12 }}>By accessing or using RacePlan Pro you agree to these terms. If you do not agree, do not use the platform.</p>
              <p style={{ marginBottom: 8 }}><strong>Intellectual Property</strong></p>
              <p style={{ marginBottom: 12 }}>{"\u00a9 2026 RacePlan Pro. All rights reserved. The RacePlan Pro name, logo, software, design and content are the exclusive property of RacePlan Pro. Unauthorised copying, reproduction, distribution or modification of any part of this platform is strictly prohibited."}</p>
              <p style={{ marginBottom: 8 }}><strong>Use of the Platform</strong></p>
              <p style={{ marginBottom: 12 }}>RacePlan Pro is licensed for use by professional racing trainers and their authorised staff for yard management purposes only. You may not resell, sublicense or share access with unauthorised parties.</p>
              <p style={{ marginBottom: 8 }}><strong>Accuracy of Information</strong></p>
              <p style={{ marginBottom: 12 }}>While we strive for accuracy, RacePlan Pro does not guarantee the completeness or accuracy of eligibility calculations, medication schedules or race conditions parsing. Trainers remain responsible for verifying all entries and declarations with the relevant racing authority.</p>
              <p style={{ marginBottom: 8 }}><strong>Limitation of Liability</strong></p>
              <p style={{ marginBottom: 12 }}>RacePlan Pro shall not be liable for any missed entries, incorrect declarations, regulatory penalties or financial losses arising from use of the platform.</p>
              <p style={{ marginBottom: 8 }}><strong>Termination</strong></p>
              <p style={{ marginBottom: 12 }}>We reserve the right to suspend or terminate accounts that breach these terms or misuse the platform.</p>
              <p style={{ marginBottom: 8 }}><strong>Governing Law</strong></p>
              <p>These terms are governed by the laws of Ireland.</p>
            </div>
            <button onClick={function() { setShowTerms(false); }} style={{ marginTop: 20, width: "100%", background: NAVY, border: "none", color: WHITE, padding: "12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Close</button>
          </div>
        </div>
      )}

      {/* DEMO MODAL */}
      {demoOpen && (
        <div onClick={function() { setDemoOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 16, padding: "36px 32px", maxWidth: 440, width: "100%" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 8 }}>Book a Demo</div>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
              Leave your details and we will be in touch within 24 hours to arrange a 20-minute walkthrough.
            </p>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Your Name</div>
              <input type="text" value={demoName} onChange={function(e) { setDemoName(e.target.value); }}
                placeholder="e.g. John Murphy"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #dde3ec", borderRadius: 8, fontSize: 14, color: NAVY, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Email Address</div>
              <input type="email" value={demoEmail} onChange={function(e) { setDemoEmail(e.target.value); }}
                placeholder="trainer@example.com"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #dde3ec", borderRadius: 8, fontSize: 14, color: NAVY, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>Yard / Phone (optional)</div>
              <input type="text" value={demoYard} onChange={function(e) { setDemoYard(e.target.value); }}
                placeholder="e.g. Murphy Racing, Co. Tipperary"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #dde3ec", borderRadius: 8, fontSize: 14, color: NAVY, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
            </div>
            {demoSent ? (
              <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "14px", textAlign: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: GREEN }}>Request sent!</div>
                <div style={{ fontSize: 13, color: "#555", marginTop: 4 }}>We will be in touch at {demoEmail} within 24 hours.</div>
              </div>
            ) : (
              <a href={"mailto:hello@raceplanpro.com?subject=Demo Request from " + encodeURIComponent(demoName) + "&body=Name: " + encodeURIComponent(demoName) + "%0AEmail: " + encodeURIComponent(demoEmail) + "%0AYard: " + encodeURIComponent(demoYard) + "%0A%0APlease book me a demo of RacePlan Pro."}
                onClick={function() { if(demoEmail) setDemoSent(true); }}
                style={{ display: "block", background: demoEmail ? NAVY : "#ccc", color: WHITE, padding: "14px", borderRadius: 10, textAlign: "center", fontWeight: 800, fontSize: 15, textDecoration: "none", marginBottom: 10, cursor: demoEmail ? "pointer" : "not-allowed" }}>
                Send Demo Request
              </a>
            )}
            <button onClick={function() { setDemoOpen(false); setDemoSent(false); }} style={{ width: "100%", background: "#f5f7fa", border: "none", color: "#888", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;
