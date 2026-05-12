import React, { useState } from "react";

var NAVY = "#0a1628";
var GOLD = "#c9952a";
var GOLD2 = "#f5c842";
var GREEN = "#1a7a4a";
var BLUE = "#1e6fb5";
var MID = "#4a6080";
var BORDER = "#d4dde8";
var OFF = "#f0f4f8";

var PLANS = [
  {
    name: "Basic",
    price: "149",
    color: BLUE,
    desc: "For smaller yards getting started",
    features: [
      "Up to 50 horses",
      "My Yard with CSV import",
      "Raceday Whiteboard + print",
      "Medication Tracker",
      "Horse Movements log",
      "Owner Portal",
      "Staff Hours alerts",
      "Weights Tracker",
      "Email support"
    ],
    missing: ["AI Race Analysis", "Race Conditions parsing", "Content Scheduler", "AI Yard Assistant", "Procurement"]
  },
  {
    name: "Professional",
    price: "249",
    color: GOLD,
    desc: "For established yards — most popular",
    popular: true,
    features: [
      "Up to 150 horses",
      "Everything in Basic",
      "AI Race Analysis",
      "HRI Race Conditions parsing",
      "Race Planner + Shortlisting",
      "Content Scheduler + recurring",
      "WhatsApp notifications",
      "10am Medication alerts",
      "Procurement module",
      "Daily Summary + AI report",
      "Owner CSV import",
      "Priority email support"
    ],
    missing: ["AI Yard Assistant", "Multi-yard management"]
  },
  {
    name: "Gold",
    price: "399",
    color: GREEN,
    desc: "For large or multi-yard operations",
    features: [
      "Unlimited horses",
      "Everything in Professional",
      "AI Yard Assistant (voice + text)",
      "Full conversation history",
      "Multi-yard management",
      "Custom branding",
      "Dedicated account manager",
      "Phone support",
      "Early access to new features",
      "Custom supplier integrations",
      "API access",
      "Staff training session included"
    ],
    missing: []
  }
];

var FEATURES = [
  ["📋", "Race Planner", "Paste race conditions once. Every race shows which of your horses are eligible by age, sex, rating and discipline. AI analysis per combination. Automatically calculates Peptizole and Antepsin withdrawal periods when you shortlist a horse — so you always know when to start medication."],
  ["💊", "Medication Tracker", "10am WhatsApp alert when Peptizole ends on an entry day — 2 hours before the 12pm deadline. Monthly grid, cost tracking, multi-horse."],
  ["🖨️", "Raceday Whiteboard", "Import HRI pending engagements CSV. Headgear and ballot number badges print in full colour. Used every race day."],
  ["⚖️", "Weights Tracker", "Staff enter weights on their phones as they go around the yard. Trend tracking, history, race day weights. Auto-saves to the cloud."],
  ["🤖", "AI Yard Assistant", "Voice or text. Knows your yard and your horses. Log tasks, book appointments, ask anything. Today's conversation saves automatically."],
  ["👤", "Owner Communications", "Confirm entries and declarations to owners instantly with one tap — pre-filled WhatsApp or email with race details. Schedule training videos, race reports and health updates. Recurring weekly or monthly owner updates."],
  ["🛒", "Procurement", "Staff request from TRI Equestrian, RED MILLS and Vet Supplies catalogues. Secretary approves. Order emails directly to supplier."],
  ["🌙", "Staff Hours", "Staff log late returns from racing. App calculates rest hours and sends WhatsApp alert to trainer or head lad instantly."],
  ["📊", "Daily Summary", "Log gallops, vet visits, farrier, racing results. AI generates a daily summary report. Headgear stats and upcoming race view."]
];

function LandingPage({ onLogin, onSignup }) {
  var demoState = useState(false);
  var showDemo = demoState[0]; var setShowDemo = demoState[1];
  var demoFormState = useState({ name: "", yard: "", horses: "", email: "", phone: "", message: "" });
  var demoForm = demoFormState[0]; var setDemoForm = demoFormState[1];
  var demoSentState = useState(false);
  var demoSent = demoSentState[0]; var setDemoSent = demoSentState[1];

  function updateDemo(key, val) {
    setDemoForm(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  function submitDemo() {
    if (!demoForm.email || !demoForm.name) return;
    var msg = "New Demo Request - RacePlan Pro" +
      "\nName: " + demoForm.name +
      "\nYard: " + demoForm.yard +
      "\nHorses: " + demoForm.horses +
      "\nEmail: " + demoForm.email +
      "\nPhone: " + demoForm.phone +
      (demoForm.message ? "\nMessage: " + demoForm.message : "");
    window.open("mailto:hello@raceplanpro.com?subject=" + encodeURIComponent("Demo Request - " + demoForm.name) + "&body=" + encodeURIComponent(msg));
    setDemoSent(true);
  }

  var S = {
    nav: { background: "rgba(10,22,40,0.97)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid rgba(255,255,255,0.06)" },
    logo: { fontSize: 20, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 10 },
    badge: { background: GOLD, color: NAVY, fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20 },
    btnGold: { padding: "9px 20px", borderRadius: 8, border: "none", background: GOLD, color: NAVY, fontSize: 14, fontWeight: 800, cursor: "pointer" },
    btnGhost: { padding: "9px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, cursor: "pointer" }
  };

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif", color: NAVY, background: "#fff" }}>

      <div style={S.nav}>
        <div style={S.logo}>
          🏇 RacePlan Pro
          <span style={S.badge}>BETA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <a href="#features" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#pricing" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>Pricing</a>
          <button onClick={function() { setShowDemo(true); }} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Book a Demo</button>
          <button onClick={onLogin} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Log In</button>
          <button onClick={onSignup} style={S.btnGold}>Start Free Trial</button>
        </div>
      </div>

      <div style={{ minHeight: "calc(100vh - 64px)", background: "linear-gradient(135deg, " + NAVY + " 0%, #0d2040 60%, #091830 100%)", display: "flex", alignItems: "center", padding: "60px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,149,42,0.12)", border: "1px solid rgba(201,149,42,0.3)", color: GOLD, fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 22, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              🏇 Built for Racing Trainers
            </div>
            <div style={{ fontSize: "clamp(34px,4.5vw,54px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
              The yard management app your <span style={{ color: GOLD }}>trainer has been waiting for</span>
            </div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: 32, maxWidth: 460 }}>
              Race planning, medication tracking, owner communications, whiteboard and AI analysis — all in one app. Built for professional racing trainers.
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <button onClick={onSignup} style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: GOLD, color: NAVY, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                Start Free Trial →
              </button>
              <button onClick={function() { setShowDemo(true); }} style={{ padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                Book a Demo
              </button>
            </div>
            <div style={{ display: "flex", gap: 28, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              {[["200+","Horses managed"],["£/€249","Most popular plan"],["5 min","Setup time"],["14 day","Free trial"]].map(function(s) {
                return (
                  <div key={s[0]}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{s[0]}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s[1]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 22 }}>
            <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "11px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              {["#ef4444","#f59e0b","#22c55e"].map(function(c) { return <div key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />; })}
              <div style={{ flex: 1 }} />
              <div style={{ background: GOLD, color: NAVY, borderRadius: 6, padding: "4px 11px", fontSize: 11, fontWeight: 700 }}>Race Planner</div>
              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "4px 11px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Whiteboard</div>
              <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "4px 11px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Meds</div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>14 races loaded · 8 horses eligible</div>
            {[
              { venue: "RACECOURSE A · SATURDAY", race: "Mares Novice Hurdle 2m", prize: "EUR 18,000", count: "3 eligible", c: "#4ade80" },
              { venue: "RACECOURSE B · SUNDAY", race: "Handicap Chase 2m4f", prize: "EUR 12,000", count: "2 eligible", c: "#f59e0b" }
            ].map(function(r) {
              return (
                <div key={r.race} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 }}>{r.venue}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{r.race}</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "rgba(201,149,42,0.2)", color: GOLD2, fontWeight: 700 }}>{r.prize}</span>
                      <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: r.c + "20", color: r.c, fontWeight: 700 }}>{r.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div style={{ background: "rgba(201,149,42,0.08)", border: "1px solid rgba(201,149,42,0.25)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>💊 PEPTIZOLE ALERT · 10:00AM</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>2 horses finishing course today</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Entry deadline 12:00 — act now</div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" style={{ background: OFF, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Everything you need</div>
          <div style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 900, color: NAVY, marginBottom: 12 }}>Built around how a racing yard actually works</div>
          <div style={{ fontSize: 17, color: MID, marginBottom: 48, maxWidth: 560 }}>Not a generic farm management app. Every feature was built specifically for National Hunt and Flat trainers in Ireland and the UK.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
            {FEATURES.map(function(f) {
              return (
                <div key={f[1]} style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid " + BORDER, transition: "all 0.2s" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{f[0]}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: NAVY, marginBottom: 8 }}>{f[1]}</div>
                  <div style={{ fontSize: 13, color: MID, lineHeight: 1.65 }}>{f[2]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div id="pricing" style={{ background: "#fff", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Straightforward pricing</div>
            <div style={{ fontSize: "clamp(26px,3.5vw,42px)", fontWeight: 900, color: NAVY, marginBottom: 12 }}>Pay monthly, cancel anytime</div>
            <div style={{ fontSize: 17, color: MID, maxWidth: 520, margin: "0 auto" }}>No setup fees. No long contracts. Every plan includes unlimited users within your yard. One missed entry pays for a year.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
            {PLANS.map(function(plan) {
              var featured = plan.popular;
              return (
                <div key={plan.name} style={{ borderRadius: 20, padding: "30px 26px", border: "2px solid " + (featured ? plan.color : BORDER), background: featured ? NAVY : "#fff", position: "relative", transform: featured ? "scale(1.04)" : "none" }}>
                  {featured && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: GOLD, color: NAVY, fontSize: 11, fontWeight: 800, padding: "4px 16px", borderRadius: 20, textTransform: "uppercase", whiteSpace: "nowrap" }}>Most Popular</div>}
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: featured ? "rgba(255,255,255,0.4)" : MID, marginBottom: 6 }}>{plan.name}</div>
                  <div style={{ fontSize: 44, fontWeight: 900, color: featured ? GOLD : NAVY, lineHeight: 1 }}>€{plan.price}</div>
                  <div style={{ fontSize: 13, color: featured ? "rgba(255,255,255,0.35)" : MID, marginBottom: 6 }}>per month</div>
                  <div style={{ fontSize: 13, color: featured ? "rgba(255,255,255,0.55)" : MID, marginBottom: 22, fontStyle: "italic" }}>{plan.desc}</div>
                  <div style={{ marginBottom: 24 }}>
                    {plan.features.map(function(f) {
                      return (
                        <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: "1px solid " + (featured ? "rgba(255,255,255,0.06)" : BORDER) }}>
                          <span style={{ color: GREEN, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</span>
                          <span style={{ fontSize: 13, color: featured ? "rgba(255,255,255,0.65)" : MID, lineHeight: 1.4 }}>{f}</span>
                        </div>
                      );
                    })}
                    {plan.missing.map(function(f) {
                      return (
                        <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "5px 0", borderBottom: "1px solid " + (featured ? "rgba(255,255,255,0.06)" : BORDER) }}>
                          <span style={{ color: BORDER, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✗</span>
                          <span style={{ fontSize: 13, color: featured ? "rgba(255,255,255,0.25)" : "#c5cdd6", lineHeight: 1.4 }}>{f}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={onSignup}
                    style={{ width: "100%", padding: "13px", borderRadius: 10, border: featured ? "none" : "2px solid " + BORDER, background: featured ? GOLD : OFF, color: featured ? NAVY : NAVY, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                    {featured ? "Start Free Trial" : "Get Started"}
                  </button>
                  <div style={{ fontSize: 11, color: featured ? "rgba(255,255,255,0.25)" : MID, textAlign: "center", marginTop: 10 }}>14-day free trial included</div>
                </div>
              );
            })}
          </div>
          <div style={{ textAlign: "center", marginTop: 32, padding: "20px", background: OFF, borderRadius: 12 }}>
            <span style={{ fontSize: 14, color: MID }}>Not sure which plan? </span>
            <button onClick={function() { setShowDemo(true); }} style={{ background: "none", border: "none", color: GOLD, fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>Book a free demo</button>
            <span style={{ fontSize: 14, color: MID }}> and we'll advise based on your yard size.</span>
          </div>
        </div>
      </div>

      <div style={{ background: NAVY, padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 16, fontStyle: "italic" }}>
            "Finally an app that understands what actually goes on in a racing yard. The medication withdrawal calculator and entry alerts alone are worth every penny."
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Pilot Trainer · 150+ horse yard</div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg," + NAVY + ",#0d2040)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <div style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, color: "#fff", marginBottom: 14 }}>Ready to modernise your yard?</div>
          <div style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", marginBottom: 36 }}>14-day free trial. No credit card. Set up in 5 minutes.</div>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={onSignup} style={{ padding: "15px 32px", borderRadius: 12, border: "none", background: GOLD, color: NAVY, fontSize: 16, fontWeight: 900, cursor: "pointer" }}>
              Start Free Trial →
            </button>
            <button onClick={function() { setShowDemo(true); }} style={{ padding: "15px 32px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>
              Book a Demo
            </button>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 16 }}>From €149/month after trial · Cancel anytime · No setup fees</div>
        </div>
      </div>

      <div style={{ background: "#091830", padding: "28px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.45)" }}>🏇 RacePlan Pro · © 2026</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["Terms of Service","#terms"],["Privacy Policy","#privacy"],["GDPR","#gdpr"],["hello@raceplanpro.com","mailto:hello@raceplanpro.com"]].map(function(l) {
              return <a key={l[0]} href={l[1]} style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l[0]}</a>;
            })}
          </div>
        </div>
      </div>

      {showDemo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.75)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(10,22,40,0.3)" }}>
            <div style={{ background: NAVY, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: "20px 20px 0 0" }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>Book a Demo</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>We'll get back to you within 24 hours</div>
              </div>
              <button onClick={function() { setShowDemo(false); setDemoSent(false); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 16 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              {demoSent ? (
                <div style={{ textAlign: "center", padding: "32px 0" }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 8 }}>Request sent!</div>
                  <div style={{ fontSize: 14, color: MID, lineHeight: 1.6 }}>Thanks — we'll be in touch within 24 hours to arrange a demo at a time that suits you.</div>
                  <button onClick={function() { setShowDemo(false); setDemoSent(false); }} style={{ marginTop: 20, padding: "10px 24px", borderRadius: 8, border: "none", background: NAVY, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Close</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[
                      { key: "name", label: "Your Name", placeholder: "e.g. John Murphy", full: true },
                      { key: "yard", label: "Yard / Trainer Name", placeholder: "e.g. Closutton Racing" },
                      { key: "horses", label: "Approx. no. of horses", placeholder: "e.g. 80" },
                      { key: "email", label: "Email Address", placeholder: "john@example.com", type: "email" },
                      { key: "phone", label: "WhatsApp / Phone", placeholder: "+353 86 000 0000", type: "tel" }
                    ].map(function(field) {
                      return (
                        <div key={field.key} style={{ gridColumn: field.full ? "1 / -1" : "auto" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: MID, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                          <input type={field.type || "text"} value={demoForm[field.key]} onChange={function(e) { var v = e.target.value; var k = field.key; updateDemo(k, v); }}
                            placeholder={field.placeholder}
                            style={{ width: "100%", padding: "10px 14px", background: OFF, border: "1px solid " + BORDER, borderRadius: 9, fontSize: 13, color: NAVY }} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: MID, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Anything specific you want to see? (optional)</div>
                    <textarea value={demoForm.message} onChange={function(e) { updateDemo("message", e.target.value); }}
                      placeholder="e.g. We use HRI a lot and want to see the race planner in action"
                      rows={3}
                      style={{ width: "100%", padding: "10px 14px", background: OFF, border: "1px solid " + BORDER, borderRadius: 9, fontSize: 13, color: NAVY, resize: "none" }} />
                  </div>
                  <button onClick={submitDemo} disabled={!demoForm.name || !demoForm.email}
                    style={{ width: "100%", padding: "13px", borderRadius: 10, border: "none", background: demoForm.name && demoForm.email ? NAVY : BORDER, color: "#fff", fontWeight: 800, fontSize: 15, cursor: demoForm.name && demoForm.email ? "pointer" : "default" }}>
                    Request Demo
                  </button>
                  <div style={{ fontSize: 12, color: MID, textAlign: "center", marginTop: 10 }}>We'll contact you within 24 hours</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;
