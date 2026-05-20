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
  var emailState = useState("");
  var email = emailState[0]; var setEmail = emailState[1];

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
            Now in Beta · Free for Founding Trainers
          </div>
          <h1 style={{ fontSize: "clamp(32px, 6vw, 58px)", fontWeight: 900, color: WHITE, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
            {"Your yard. Under control."}<br />
            <span style={{ color: GOLD }}>{"Every entry. Every med. Every owner update."}</span>
          </h1>
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", maxWidth: 580, margin: "0 auto 36px", lineHeight: 1.7 }}>
            The first AI-powered yard management app built specifically for professional racing trainers in Ireland and the UK. Entries, medications, owner communications and raceday management — at your fingertips.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={function() { setDemoOpen(true); }} style={{ background: GOLD, border: "none", color: NAVY, padding: "16px 32px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 900, letterSpacing: -0.3 }}>Book a Demo →</button>
            <button onClick={onLogin} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: WHITE, padding: "16px 32px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>Get Started Free</button>
          </div>
        </div>
      </div>

      {/* PAIN POINTS SECTION */}
      <div style={{ background: LIGHT, padding: "70px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 40px)", fontWeight: 900, color: NAVY, marginBottom: 12 }}>
              Sound familiar?
            </h2>
            <p style={{ fontSize: 16, color: "#666", maxWidth: 560, margin: "0 auto" }}>Every trainer in Ireland and the UK is dealing with the same daily fire-fighting. We built RacePlan Pro to put it out.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {[
              { icon: "💊", pain: "A horse finishes Peptizole the morning of entries. Nobody notices. You miss the 12pm deadline.", fix: "RacePlan Pro fires a WhatsApp to you and your head lad at 10am: "Butch Cassidy finishes Peptizole today — entry deadline in 2 hours."" },
              { icon: "📋", pain: "Race conditions land in your inbox. You spend 30 minutes cross-checking each horse for eligibility by hand.", fix: "Paste the conditions. Our AI reads them, checks your entire yard, and gives you a ranked eligible list in seconds." },
              { icon: "💉", pain: "A horse gets SI joints treated. Six weeks later it goes on the shortlist. Someone forgets about the 45-day rule.", fix: "Every treatment is logged with its withdrawal period. The Race Planner blocks that horse automatically until it's clear." },
              { icon: "⚖️", pain: "A horse has dropped 28kg since last week. You find out on race morning.", fix: "Weight changes over 6kg trigger an instant alert. The whole yard sees it. You act before it becomes a problem." },
              { icon: "📱", pain: "Owners are ringing for updates. Your secretary is stuck answering calls instead of doing entries.", fix: "One tap sends a WhatsApp race update or entry confirmation to every owner. Scheduled, professional, done." },
              { icon: "🗂️", pain: "Month end. You're trying to remember which horses had medication so you can do the billing.", fix: "Every dose is logged per horse per day. The medication report is sitting there when you need it." },
            ].map(function(item, i) {
              return (
                <div key={i} style={{ background: WHITE, borderRadius: 14, padding: "24px", border: "1px solid #e8ecf0", position: "relative", overflow: "hidden" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                  <div style={{ fontSize: 14, color: RED, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{"The problem: " + item.pain}</div>
                  <div style={{ width: 40, height: 2, background: GOLD, marginBottom: 10, borderRadius: 2 }} />
                  <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>{"✓ " + item.fix}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* THE NUMBERS */}
      <div style={{ background: NAVY, padding: "70px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: WHITE, marginBottom: 12 }}>The numbers that matter</h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, marginBottom: 50 }}>Racing is a business. Here is what the admin problem actually costs you.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20, marginBottom: 50 }}>
            {[
              { number: "1", unit: "missed entry", sub: "can cost €10,000–€50,000 in prize money", color: RED },
              { number: "5–10", unit: "hours", sub: "lost every week to manual admin for trainer and secretary combined", color: GOLD },
              { number: "45", unit: "days", sub: "withdrawal for SI joints. One oversight puts a horse in and costs your licence", color: RED },
              { number: "12pm", unit: "deadline", sub: "HRI entries close. The app alerts at 10am. Every. Single. Day.", color: GREEN },
              { number: "€1.50", unit: "per km", sub: "Travel cost calculator built in. Every course. Click. Done.", color: GOLD },
              { number: "0", unit: "phone calls", sub: "needed from owners on race day when you send updates through the app", color: GREEN },
            ].map(function(stat, i) {
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "24px 16px" }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.number}</div>
                  <div style={{ fontSize: 14, color: WHITE, fontWeight: 700, margin: "6px 0 4px" }}>{stat.unit}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>{stat.sub}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WHAT IT DOES */}
      <div style={{ padding: "70px 24px", background: WHITE }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 50 }}>
            <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: NAVY, marginBottom: 12 }}>Everything in one place. On your phone.</h2>
            <p style={{ fontSize: 15, color: "#666", maxWidth: 520, margin: "0 auto" }}>RacePlan Pro is not a replacement for your secretary. It is the system that makes their job — and yours — dramatically easier and less error-prone.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {[
              { icon: "🏇", title: "Race Planner", desc: "Paste race conditions. AI reads them and lists which of your horses are eligible, with analysis on each one." },
              { icon: "💊", title: "Medication Tracker", desc: "Daily entry per horse. Withdrawal periods calculated automatically. WhatsApp alert before every entry deadline." },
              { icon: "💉", title: "Treatment Withdrawals", desc: "Log SI joints, back treatment, joint injections. The app blocks entries automatically until the horse is clear." },
              { icon: "🖨️", title: "Raceday Whiteboard", desc: "Import your runners from HRI. Print a professional whiteboard for the yard in one tap." },
              { icon: "⚖️", title: "Weights & Trends", desc: "Weekly weigh-in for every horse. Alerts on significant changes. Full history and trend view." },
              { icon: "👥", title: "Owner Communications", desc: "One-tap WhatsApp to every owner. Entries, declarations, race updates, training videos." },
              { icon: "🤖", title: "AI Yard Assistant", desc: "Talk to your yard. Set reminders, start medications, log notes — all by voice or text." },
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

      {/* WHAT IT IS NOT */}
      <div style={{ background: LIGHT, padding: "50px 24px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, color: NAVY, marginBottom: 16 }}>What RacePlan Pro is — and is not</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, textAlign: "left" }}>
            <div style={{ background: WHITE, borderRadius: 12, padding: "20px", border: "1px solid #e8ecf0" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: GREEN, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>✓ It is</div>
              {["Yard management at your fingertips","AI-powered eligibility checking","Medication and treatment compliance","Real-time alerts before deadlines","A professional owner comms tool","Mobile-first, works on any phone"].map(function(t, i) {
                return <div key={i} style={{ fontSize: 13, color: "#333", padding: "5px 0", borderBottom: "1px solid #f0f0f0" }}>{t}</div>;
              })}
            </div>
            <div style={{ background: WHITE, borderRadius: 12, padding: "20px", border: "1px solid #e8ecf0" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: RED, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>✗ It is not</div>
              {["A replacement for your secretary","An invoicing or billing tool","A racing tips service","A complicated system to learn","A desktop-only product","Another WhatsApp group"].map(function(t, i) {
                return <div key={i} style={{ fontSize: 13, color: "#333", padding: "5px 0", borderBottom: "1px solid #f0f0f0" }}>{t}</div>;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* PRICING - beta only */}
      <div style={{ background: WHITE, padding: "60px 24px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 20, padding: "6px 16px", fontSize: 12, color: GOLD, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 20 }}>
            Beta Access
          </div>
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 900, color: NAVY, marginBottom: 16 }}>Free during beta.</h2>
          <p style={{ fontSize: 16, color: "#555", maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.8 }}>
            We are working with a small group of Irish and UK trainers to shape the product before launch. Access is completely free during this period. Founding members will receive preferential pricing when we go live.
          </p>
          <div style={{ background: LIGHT, border: "1px solid #e8ecf0", borderRadius: 14, padding: "24px", maxWidth: 420, margin: "0 auto" }}>
            <div style={{ fontSize: 13, color: "#555", lineHeight: 2 }}>
              {["✓ Full access to all features","✓ Unlimited horses during beta","✓ Staff logins included","✓ No credit card required","✓ Founding member pricing at launch"].map(function(t, i) {
                return <div key={i} style={{ borderBottom: i < 4 ? "1px solid #e8ecf0" : "none", padding: "4px 0" }}>{t}</div>;
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "linear-gradient(135deg, " + NAVY + " 0%, #1a2d4a 100%)", padding: "70px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 900, color: WHITE, marginBottom: 16 }}>
            Ready to see it in your yard?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32, lineHeight: 1.7 }}>
            Book a 20-minute demo. We will walk you through the app using your yard's setup. No commitment, no pitch, just the product.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={function() { setDemoOpen(true); }}
              style={{ background: GOLD, border: "none", color: NAVY, padding: "16px 36px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 900 }}>
              Book a Demo →
            </button>
            <button onClick={onLogin}
              style={{ background: "transparent", border: "2px solid rgba(255,255,255,0.3)", color: WHITE, padding: "16px 36px", borderRadius: 10, cursor: "pointer", fontSize: 16, fontWeight: 700 }}>
              Start Free
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ background: "#06101c", padding: "24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 18 }}>🏇</span>
          <span style={{ fontWeight: 900, fontSize: 15, color: WHITE }}>RacePlan <span style={{ color: GOLD }}>Pro</span></span>
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>Built for trainers, by people who understand racing. Ireland & UK. © 2026 RacePlan Pro.</p>
      </div>

      {/* DEMO MODAL */}
      {demoOpen && (
        <div onClick={function() { setDemoOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: WHITE, borderRadius: 16, padding: "36px 32px", maxWidth: 440, width: "100%" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, marginBottom: 8 }}>Book a Demo</div>
            <p style={{ fontSize: 14, color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
              We will set up a 20-minute call, walk through RacePlan Pro live, and set it up for your yard on the spot if you want to proceed.
            </p>
            <a href={"mailto:hello@raceplanpro.com?subject=Demo Request&body=Hi, I would like to book a demo of RacePlan Pro. My yard: "}
              style={{ display: "block", background: NAVY, color: WHITE, padding: "14px", borderRadius: 10, textAlign: "center", fontWeight: 800, fontSize: 15, textDecoration: "none", marginBottom: 10 }}>
              Email hello@raceplanpro.com
            </a>
            <a href="https://wa.me/353000000000?text=Hi, I would like to book a demo of RacePlan Pro"
              style={{ display: "block", background: "#25D366", color: WHITE, padding: "14px", borderRadius: 10, textAlign: "center", fontWeight: 800, fontSize: 15, textDecoration: "none", marginBottom: 16 }}>
              WhatsApp Us
            </a>
            <button onClick={function() { setDemoOpen(false); }} style={{ width: "100%", background: LIGHT, border: "none", color: "#888", padding: "10px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;
