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
      <div style={{ position: "sticky", top: 0, background: "rgba(10,22,40,0.97)", backdropFilter: "blur(10px)", zIndex: 100, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
      <div style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, #1a2d4a 100%)", padding: "80px 24px 70px", textAlign: "center", position: "relative", overflow: "hidden" }}>
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
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "16px 32px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 900, letterSpacing: -0.3 }}>Book a Demo</button>
            <button onClick={onLogin} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: WHITE, padding: "16px 32px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>Get Started Free</button>
          </div>
        </div>
      </div>

      {/* PAIN POINTS */}
      <div style={{ background: LIGHT, padding: "70px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: NAVY, marginBottom: 12 }}>Sound familiar?</h2>
            <p style={{ fontSize: 16, color: "#666", maxWidth: 560, margin: "0 auto" }}>Every trainer in Ireland and the UK is dealing with the same daily fire-fighting. We built RacePlan Pro to put it out.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { icon: "💊", pain: "A horse finishes a medication course the morning of entries. Nobody notices. You miss the deadline.", fix: "RacePlan Pro fires a WhatsApp alert before every entry deadline — so you always know which horses are clear to enter." },
              { icon: "📋", pain: "Race conditions land in your inbox. You spend 30 minutes cross-checking each horse for eligibility by hand.", fix: "Paste the conditions. Our AI reads them, checks your entire yard and gives you a ranked eligible list in seconds." },
              { icon: "💉", pain: "A horse receives a treatment and goes on the shortlist weeks later. Someone forgets the withdrawal period.", fix: "Every treatment is logged with its withdrawal period. The Race Planner blocks that horse automatically until it is clear." },
              { icon: "⚖️", pain: "A horse has lost significant weight since last week. You find out on race morning when it is too late.", fix: "Weight changes beyond your set threshold trigger an instant alert. You act before it becomes a problem." },
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
      <div style={{ background: NAVY, padding: "70px 24px" }}>
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
                  style={{ width: "100%", height: 500, border: "none", display: "block" }}
                  title="RacePlan Pro Demo"
                />
                <button onClick={function() { setDemoOpen2(false); }}
                  style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  ✕
                </button>
              </div>
            ) : (
              <div onClick={function() { setDemoOpen2(true); }}
                style={{ background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)", height: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
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
      <div style={{ background: NAVY, padding: "70px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: WHITE, marginBottom: 12 }}>The numbers that matter</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 50 }}>Racing is a business. Here is what the admin problem actually costs.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
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
      <div style={{ padding: "70px 24px", background: WHITE }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "center" }}>
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
      <div style={{ padding: "70px 24px", background: LIGHT }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50, alignItems: "center" }}>
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
      <div style={{ padding: "70px 24px", background: WHITE }}>
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
      <div style={{ background: LIGHT, padding: "50px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: NAVY, marginBottom: 24 }}>What RacePlan Pro is and is not</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, textAlign: "left" }}>
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
      <div style={{ background: WHITE, padding: "60px 24px" }}>
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
      <div style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, #1a2d4a 100%)", padding: "70px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: WHITE, marginBottom: 16 }}>Ready to see it in your yard?</h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
            Book a 20-minute demo. We will walk through the app live using your yard setup. No commitment, no pitch — just the product.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
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
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>Built for trainers, by people who understand racing. Ireland and UK. 2026 RacePlan Pro.</p>
      </div>

      {/* DEMO MODAL */}
      {demoOpen && (
        <div onClick={function() { setDemoOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 16, padding: "36px 32px", maxWidth: 440, width: "100%" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 8 }}>Book a Demo</div>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
              A 20-minute call. We walk through RacePlan Pro live and set it up for your yard on the spot if you want to go ahead.
            </p>
            <a href={"mailto:hello@raceplanpro.com?subject=Demo Request&body=Hi, I would like to book a demo of RacePlan Pro."}
              style={{ display: "block", background: NAVY, color: WHITE, padding: "14px", borderRadius: 10, textAlign: "center", fontWeight: 800, fontSize: 15, textDecoration: "none", marginBottom: 10 }}>
              Email hello@raceplanpro.com
            </a>
            <button onClick={function() { setDemoOpen(false); }} style={{ width: "100%", background: LIGHT, border: "none", color: "#888", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;
