import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Btn, C, TODAY, daysUntil } from "./shared";
import MedicationTracker from "./MedTracker";
import ProvisionalEntries from "./ProvisionalEntries";
import RacePlanner from "./RacePlanner";
import RacedayPrint from "./Whiteboard";
import YardView from "./YardView";
import MovementLog from "./MovementLog";
import OwnerPortal from "./OwnerPortal";

const globalCSS = "* { box-sizing: border-box; margin: 0; padding: 0; } p { margin: 0; } button:hover { opacity: 0.88; } a:hover { opacity: 0.88; } input:focus, select:focus { border-color: #0a1628 !important; outline: none; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #b8c8da; border-radius: 2px; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; } }";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  const [tab, setTab] = useState("planner");
  const [horsesRaw, setHorsesRaw] = useState([]);
  const [medLogsRaw, setMedLogsRaw] = useState({});
  const [trackedIdsRaw, setTrackedIdsRaw] = useState([]);
  const [wbEntriesRaw, setWbEntriesRaw] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ── AUTH LISTENER ────────────────────────────────────────────
  useEffect(function() {
    supabase.auth.getSession().then(function(res) {
      setUser(res.data.session ? res.data.session.user : null);
      setAppLoading(false);
    });
    const listener = supabase.auth.onAuthStateChange(function(event, session) {
      setUser(session ? session.user : null);
    });
    return function() { listener.data.subscription.unsubscribe(); };
  }, []);

  // ── LOAD DATA ────────────────────────────────────────────────
  useEffect(function() {
    if (!user) { setHorsesRaw([]); setMedLogsRaw({}); setTrackedIdsRaw([]); setWbEntriesRaw([]); return; }
    supabase.from("horses").select("*").eq("user_id", user.id).then(function(res) {
      if (res.data) setHorsesRaw(res.data.map(function(h) {
        return {
          id: h.id, name: h.name, sex: h.sex || "Gelding", colour: h.colour || "",
          dob: h.dob || "", trainer: h.trainer || "", owner: h.owner || "",
          ownerPhone: h.owner_phone || "", ownerEmail: h.owner_email || "",
          nhRating: h.nh_rating, flatRating: h.flat_rating, hurdleRating: h.hurdle_rating,
          chaseRating: h.chase_rating, headgear: h.headgear || "", jockey: h.jockey || "",
          notes: h.notes || "", status: h.status || "Active", activationDate: h.activation_date || null,
          silk: h.silk, form: h.form || [], provisionalEntries: h.provisional_entries || [],
          discipline: h.discipline || [], surface: h.surface || "Turf",
          isMaiden: h.is_maiden !== false, isNovice: h.is_novice || false,
          isEBF: h.is_ebf || false, nextRaceDate: h.next_race_date || "",
          distanceMin: h.distance_min || 10, distanceMax: h.distance_max || 32,
          goingPref: h.going_pref || [],
        };
      }));
    });
    supabase.from("med_logs").select("*").eq("user_id", user.id).then(function(res) {
      if (res.data) {
        const logs = {};
        res.data.forEach(function(row) {
          logs[row.horse_id + "_" + row.log_date + "_" + row.med_type] = row.value || 1;
        });
        setMedLogsRaw(logs);
      }
    });
    supabase.from("whiteboard_entries").select("*").eq("user_id", user.id).then(function(res) {
      if (res.data) setWbEntriesRaw(res.data.map(function(e) {
        return {
          id: e.id, horseId: e.horse_id, horseName: e.horse_name || "",
          venue: e.venue || "", date: e.date || "", raceTime: e.race_time || "",
          raceName: e.race_name || "", meetingNo: e.meeting_no || "",
          raceRef: e.race_ref || "", ballotNo: e.ballot_no || "",
          headgear: e.headgear || "", jockey: e.jockey || "",
        };
      }));
    });
  }, [user]);

  // ── SAVE HORSES ──────────────────────────────────────────────
  const setHorses = function(updater) {
    setHorsesRaw(function(prev) {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!user) return next;
      const rows = next.map(function(h) {
        return {
          id: h.id, user_id: user.id, name: h.name, sex: h.sex || "Gelding",
          colour: h.colour || "", dob: h.dob || "", trainer: h.trainer || "",
          owner: h.owner || "", owner_phone: h.ownerPhone || "", owner_email: h.ownerEmail || "",
          nh_rating: h.nhRating || null, flat_rating: h.flatRating || null,
          hurdle_rating: h.hurdleRating || null, chase_rating: h.chaseRating || null,
          headgear: h.headgear || "", jockey: h.jockey || "", notes: h.notes || "",
          status: h.status || "Active", activation_date: h.activationDate || null,
          silk: h.silk || null, form: h.form || [], provisional_entries: h.provisionalEntries || [],
          next_race_date: h.nextRaceDate || null,
        };
      });
      supabase.from("horses").upsert(rows).then(function(res) {
        if (res.error) console.error("Horse save error:", res.error);
      });
      if (prev.length > next.length) {
        const removed = prev.filter(function(h) { return !next.find(function(n) { return n.id === h.id; }); });
        removed.forEach(function(h) { supabase.from("horses").delete().eq("id", h.id).then(function() {}); });
      }
      return next;
    });
  };

  // ── SAVE MED LOGS ────────────────────────────────────────────
  const setMedLogs = function(updater) {
    setMedLogsRaw(function(prev) {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!user) return next;
      Object.keys(next).forEach(function(key) {
        if (next[key] !== prev[key]) {
          const lastU = key.lastIndexOf("_");
          const medType = key.slice(lastU + 1);
          const rest = key.slice(0, lastU);
          const dateMatch = rest.match(/_(\d{4}-\d{2}-\d{2})$/);
          if (!dateMatch) return;
          const logDate = dateMatch[1];
          const horseId = rest.slice(0, rest.length - dateMatch[0].length);
          const val = next[key];
          if (val) {
            supabase.from("med_logs").upsert({ user_id: user.id, horse_id: horseId, log_date: logDate, med_type: medType, value: val }).then(function() {});
          } else {
            supabase.from("med_logs").delete().match({ user_id: user.id, horse_id: horseId, log_date: logDate, med_type: medType }).then(function() {});
          }
        }
      });
      return next;
    });
  };

  // ── SAVE WHITEBOARD ──────────────────────────────────────────
  const setWbEntries = function(updater) {
    setWbEntriesRaw(function(prev) {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!user) return next;
      if (next.length > prev.length) {
        const newEntries = next.filter(function(e) { return !prev.find(function(p) { return p.id === e.id; }); });
        newEntries.forEach(function(e) {
          supabase.from("whiteboard_entries").upsert({
            id: e.id, user_id: user.id, horse_id: e.horseId || null,
            horse_name: e.horseName || "", venue: e.venue || "", date: e.date || "",
            race_time: e.raceTime || "", race_name: e.raceName || "",
            meeting_no: e.meetingNo || "", race_ref: e.raceRef || "",
            ballot_no: e.ballotNo || "", headgear: e.headgear || "", jockey: e.jockey || "",
          }).then(function() {});
        });
      } else if (next.length < prev.length) {
        const removed = prev.filter(function(e) { return !next.find(function(n) { return n.id === e.id; }); });
        removed.forEach(function(e) { supabase.from("whiteboard_entries").delete().eq("id", e.id).then(function() {}); });
      }
      return next;
    });
  };

  // ── AUTH HANDLERS ────────────────────────────────────────────
  const handleLogin = async function() {
    setAuthLoading(true); setAuthError("");
    const res = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (res.error) setAuthError(res.error.message);
  };
  const handleSignup = async function() {
    setAuthLoading(true); setAuthError("");
    const res = await supabase.auth.signUp({ email, password });
    setAuthLoading(false);
    if (res.error) setAuthError(res.error.message);
    else setAuthError("Check your email to confirm your account.");
  };
  const handleLogout = async function() {
    await supabase.auth.signOut();
    setHorsesRaw([]); setMedLogsRaw({}); setTrackedIdsRaw([]); setWbEntriesRaw([]);
  };

  const horses = horsesRaw;
  const medLogs = medLogsRaw;
  const trackedIds = trackedIdsRaw;
  const setTrackedIds = setTrackedIdsRaw;
  const wbEntries = wbEntriesRaw;
  const medAlerts = horses.filter(function(h) { const d = daysUntil(h.nextRaceDate); return d && d >= 12 && d <= 16; }).length;

  const NAV = [
    { id: "planner", icon: "x", label: "Race Planner" },
    { id: "provisional", icon: "x", label: "Provisional Entries" },
    { id: "meds", icon: "x", label: "Medication Tracker", badge: medAlerts },
    { id: "whiteboard", icon: "x", label: "Raceday Whiteboard" },
    { id: "yard", icon: "x", label: "My Yard" },
    { id: "movements", icon: "x", label: "Horse Movements" },
    { id: "owners", icon: "x", label: "Owner Portal" },
  ];

  if (appLoading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.textMid, fontSize: 15 }}>Loading...</div>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: C.shadowMd, overflow: "hidden" }}>
        <div style={{ background: C.navy, padding: "28px 32px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>RacePlan Pro</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Yard Management System</div>
        </div>
        <div style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", gap: 0, marginBottom: 24, background: C.cardOff, borderRadius: 10, padding: 4 }}>
            {["login", "signup"].map(function(m) {
              return (
                <button key={m} onClick={function() { setAuthMode(m); setAuthError(""); }}
                  style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                    background: authMode === m ? C.navy : "transparent", color: authMode === m ? "#fff" : C.textMid }}>
                  {m === "login" ? "Log In" : "Sign Up"}
                </button>
              );
            })}
          </div>
          {["email", "password"].map(function(field) {
            return (
              <div key={field} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {field === "email" ? "Email" : "Password"}
                </div>
                <input type={field === "password" ? "password" : "email"} value={field === "email" ? email : password}
                  onChange={function(e) { field === "email" ? setEmail(e.target.value) : setPassword(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignup(); }}
                  placeholder={field === "email" ? "trainer@example.com" : "Password"}
                  style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border,
                    borderRadius: 10, fontSize: 14, color: C.text, outline: "none" }} />
              </div>
            );
          })}
          {authError && (
            <div style={{ fontSize: 13, color: authError.includes("Check") ? C.green : C.red, marginBottom: 14, fontWeight: 600 }}>
              {authError}
            </div>
          )}
          <Btn onClick={authMode === "login" ? handleLogin : handleSignup} disabled={authLoading}
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
            {authLoading ? "Please wait..." : authMode === "login" ? "Log In" : "Create Account"}
          </Btn>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter','Helvetica Neue',sans-serif", display: "flex", flexDirection: "column" }}>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />

      <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", flexShrink: 0, gap: 10 }}>
        <button onClick={function() { setSidebarOpen(function(o) { return !o; }); }} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
          {sidebarOpen ? "<" : ">"}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg," + C.gold + "," + C.goldLight + ")", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>x</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", lineHeight: 1 }}>RacePlan Pro</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: 2 }}>YARD MANAGEMENT</div>
          </div>
        </div>
        <div style={{ marginLeft: 8, padding: "4px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 20, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          {(NAV.find(function(n) { return n.id === tab; }) || {}).label || ""}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {medAlerts > 0 && (
            <button onClick={function() { setTab("meds"); }} style={{ background: C.redBg, border: "1px solid " + C.red + "30", color: C.red, padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {"Med alerts: " + medAlerts}
            </button>
          )}
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user.email}</span>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ width: sidebarOpen ? 200 : 52, background: C.sidebar, flexShrink: 0, display: "flex", flexDirection: "column", transition: "width 0.2s", overflow: "hidden" }}>
          {NAV.map(function(nav) {
            const active = tab === nav.id;
            return (
              <button key={nav.id} onClick={function() { setTab(nav.id); }} title={nav.label}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "12px 16px" : "14px 0", justifyContent: sidebarOpen ? "flex-start" : "center", background: active ? "rgba(255,255,255,0.12)" : "transparent", border: "none", borderLeft: active ? "3px solid " + C.gold : "3px solid transparent", color: active ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", width: "100%", textAlign: "left" }}>
                <span style={{ fontSize: 17, minWidth: 20, textAlign: "center", flexShrink: 0 }}>{nav.id === "planner" ? "x" : nav.id === "provisional" ? "x" : nav.id === "meds" ? "x" : nav.id === "whiteboard" ? "x" : nav.id === "yard" ? "x" : nav.id === "movements" ? "x" : "x"}</span>
                {sidebarOpen && <span style={{ flex: 1 }}>{nav.label}</span>}
                {nav.badge > 0 && sidebarOpen && <span style={{ background: C.red, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{nav.badge}</span>}
                {nav.badge > 0 && !sidebarOpen && <span style={{ position: "absolute", top: 6, right: 6, background: C.red, color: "#fff", borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{nav.badge}</span>}
              </button>
            );
          })}
          {sidebarOpen && (
            <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Yard</div>
              {[{ l: "Active", v: horses.filter(function(h) { return h.status === "Active"; }).length, c: C.green }, { l: "Cool-off", v: horses.filter(function(h) { return h.status === "CoolingOff"; }).length, c: C.amber }, { l: "Inactive", v: horses.filter(function(h) { return h.status === "Inactive"; }).length, c: C.textDim }].map(function(s) {
                return (
                  <div key={s.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</span>
                  </div>
                );
              })}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 5, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{horses.length}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minWidth: 0 }}>
          {tab === "planner" && <RacePlanner horses={horses} setHorses={setHorses} />}
          {tab === "provisional" && <ProvisionalEntries horses={horses} setHorses={setHorses} />}
          {tab === "meds" && <MedicationTracker horses={horses} medLogs={medLogs} setMedLogs={setMedLogs} trackedIds={trackedIds} setTrackedIds={setTrackedIds} />}
          {tab === "whiteboard" && <RacedayPrint horses={horses} entries={wbEntries} setEntries={setWbEntries} />}
          {tab === "yard" && <YardView horses={horses} setHorses={setHorses} />}
          {tab === "movements" && <MovementLog horses={horses} />}
          {tab === "owners" && <OwnerPortal horses={horses} />}
        </div>
      </div>
    </div>
  </div>
  );
}
