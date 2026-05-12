import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Btn, C, daysUntil } from "./shared";
import MedicationTracker from "./MedTracker";
import ProvisionalEntries from "./ProvisionalEntries";
import RacePlanner from "./RacePlanner";
import RacedayPrint from "./Whiteboard";
import YardView from "./YardView";
import MovementLog from "./MovementLog";
import OwnerPortal from "./OwnerPortal";
import StaffNotify from "./StaffNotify";
import YardSettings from "./YardSettings";
import WeightsTracker from "./WeightsTracker";
import YardAssistant from "./YardAssistant";
import ContentScheduler from "./ContentScheduler";
import DailySummary from "./DailySummary";
import Procurement from "./Procurement";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const globalCSS = "* { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Inter, Helvetica Neue, sans-serif; } button:hover { opacity: 0.88; } input:focus, select:focus { outline: none; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #b8c8da; border-radius: 2px; } @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; } }";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [appLoading, setAppLoading] = useState(true);
  const [tab, setTab] = useState("yard");
  const [settings, setSettings] = useState({ yardName: "", trainerName: "", weighDay: "Monday", notifyContacts: [], ownerContacts: [], tier: "Professional", costPeptizole: 18, costAntepsin: 25, costAntibiotics: 15 });

  var saveSettings = function(newSettings) {
    setSettings(newSettings);
    // Sync owner contacts to horses by name match
    var ownerContacts = newSettings.ownerContacts || [];
    if (ownerContacts.length > 0) {
      setHorses(function(prev) {
        return prev.map(function(horse) {
          var ownerName = (horse.owner || "").toLowerCase().trim();
          var match = ownerContacts.find(function(oc) {
            return oc.name.toLowerCase().trim() === ownerName;
          });
          if (!match) return horse;
          var updated = Object.assign({}, horse);
          if (match.phone) updated.ownerPhone = match.phone;
          if (match.email) updated.ownerEmail = match.email;
          return updated;
        });
      });
    }
  };
  const [weightsRaw, setWeightsRaw] = useState({});
  const [ordersRaw, setOrdersRaw] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [horsesRaw, setHorsesRaw] = useState([]);
  const [medLogsRaw, setMedLogsRaw] = useState({});
  const [trackedIdsRaw, setTrackedIdsRaw] = useState([]);
  const [wbEntriesRaw, setWbEntriesRaw] = useState([]);

  useEffect(function() {
    supabase.auth.getSession().then(function(res) {
      if (res.data.session) setUser(res.data.session.user);
      setAppLoading(false);
    });
    var listener = supabase.auth.onAuthStateChange(function(event, session) {
      setUser(session ? session.user : null);
    });
    return function() { listener.data.subscription.unsubscribe(); };
  }, []);

  useEffect(function() {
    if (!user) { setHorsesRaw([]); setMedLogsRaw({}); setTrackedIdsRaw([]); setWbEntriesRaw([]); return; }
    supabase.from("horses").select("*").eq("user_id", user.id).then(function(res) {
      if (res.data) setHorsesRaw(res.data.map(function(h) {
        return { id: h.id, name: h.name, sex: h.sex || "Gelding", colour: h.colour || "",
          dob: h.dob || "", trainer: h.trainer || "", owner: h.owner || "",
          ownerPhone: h.owner_phone || "", ownerEmail: h.owner_email || "",
          nhRating: h.nh_rating, flatRating: h.flat_rating, hurdleRating: h.hurdle_rating,
          chaseRating: h.chase_rating, headgear: h.headgear || "", notes: h.notes || "",
          status: h.status || "Active", activationDate: h.activation_date || null,
          silk: h.silk, form: h.form || [], provisionalEntries: h.provisional_entries || [],
          discipline: h.discipline || [], surface: h.surface || "Turf",
          isMaiden: h.is_maiden !== false, isNovice: h.is_novice || false,
          nextRaceDate: h.next_race_date || "", distanceMin: h.distance_min || 10,
          distanceMax: h.distance_max || 32, goingPref: h.going_pref || [] };
      }));
    });
    supabase.from("med_logs").select("*").eq("user_id", user.id).then(function(res) {
      if (res.data) {
        var logs = {};
        res.data.forEach(function(row) { logs[row.horse_id + "_" + row.log_date + "_" + row.med_type] = row.value || 1; });
        setMedLogsRaw(logs);
      }
    });
    supabase.from("horse_weights").select("*").eq("user_id", user.id).then(function(res) {
      if (res.data) {
        var w = {};
        res.data.forEach(function(row) { w[row.horse_id + "_" + row.weigh_date + "_" + row.weight_type] = row.weight_kg; });
        setWeightsRaw(w);
      }
    });
    supabase.from("whiteboard_entries").select("*").eq("user_id", user.id).then(function(res) {
      if (res.data) setWbEntriesRaw(res.data.map(function(e) {
        return { id: e.id, horseId: e.horse_id, horseName: e.horse_name || "",
          venue: e.venue || "", date: e.date || "", raceTime: e.race_time || "",
          raceName: e.race_name || "", meetingNo: e.meeting_no || "",
          raceRef: e.race_ref || "", ballotNo: e.ballot_no || "",
          headgear: e.headgear || "", jockey: e.jockey || "" };
      }));
    });
  }, [user]);

  var setHorses = function(updater) {
    setHorsesRaw(function(prev) {
      var next = typeof updater === "function" ? updater(prev) : updater;
      if (!user) return next;
      var rows = next.map(function(h) {
        return { id: h.id, user_id: user.id, name: h.name, sex: h.sex || "Gelding",
          colour: h.colour || "", dob: h.dob || "", trainer: h.trainer || "",
          owner: h.owner || "", owner_phone: h.ownerPhone || "", owner_email: h.ownerEmail || "",
          nh_rating: h.nhRating || null, flat_rating: h.flatRating || null,
          hurdle_rating: h.hurdleRating || null, chase_rating: h.chaseRating || null,
          headgear: h.headgear || "", notes: h.notes || "", status: h.status || "Active",
          activation_date: h.activationDate || null, silk: h.silk || null,
          form: h.form || [], provisional_entries: h.provisionalEntries || [],
          next_race_date: h.nextRaceDate || null };
      });
      supabase.from("horses").upsert(rows, { onConflict: "id" }).then(function(res) {
        if (res.error) {
          console.error("Horse save error:", res.error);
          // Try inserting one by one if bulk upsert fails
          rows.forEach(function(row) {
            supabase.from("horses").upsert(row, { onConflict: "id" }).then(function(r2) {
              if (r2.error) console.error("Single horse save error:", r2.error, row.name);
            });
          });
        }
      });
      if (prev.length > next.length) {
        var removed = prev.filter(function(h) { return !next.find(function(n) { return n.id === h.id; }); });
        removed.forEach(function(h) { supabase.from("horses").delete().eq("id", h.id).then(function() {}); });
      }
      return next;
    });
  };

  var setMedLogs = function(updater) {
    setMedLogsRaw(function(prev) {
      var next = typeof updater === "function" ? updater(prev) : updater;
      if (!user) return next;
      Object.keys(next).forEach(function(key) {
        if (next[key] !== prev[key]) {
          var lastU = key.lastIndexOf("_");
          var medType = key.slice(lastU + 1);
          var rest = key.slice(0, lastU);
          var restParts = rest.split("_");
          var logDate = "";
          var horseIdParts = [];
          for (var rpi = 0; rpi < restParts.length; rpi++) {
            var part = restParts[rpi];
            if (part.length === 10 && part[4] === "-" && part[7] === "-") {
              logDate = part;
              horseIdParts = restParts.slice(0, rpi);
            }
          }
          var horseId = horseIdParts.join("_");
          if (!logDate) return;
          var val = next[key];
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

  var setWeights = function(updater) {
    setWeightsRaw(function(prev) {
      var next = typeof updater === "function" ? updater(prev) : updater;
      if (!user) return next;
      var changed = [];
      Object.keys(next).forEach(function(key) {
        if (next[key] !== prev[key]) changed.push(key);
      });
      changed.forEach(function(key) {
        // key format: horseId_YYYY-MM-DD_type (horseId may contain underscores)
        var lastUnd = key.lastIndexOf("_");
        var weightType = key.slice(lastUnd + 1);
        var rest = key.slice(0, lastUnd);
        var dateUnd = rest.lastIndexOf("_");
        var weighDate = rest.slice(dateUnd + 1);
        var horseId = rest.slice(0, dateUnd);
        var val = next[key];
        if (val && weighDate && weighDate.length === 10) {
          supabase.from("horse_weights").upsert({
            user_id: user.id, horse_id: horseId, weigh_date: weighDate,
            weight_type: weightType || "weekly", weight_kg: parseFloat(val)
          }, { onConflict: "user_id,horse_id,weigh_date,weight_type" }).then(function(r) {
            if (r.error) console.error("Weight save:", r.error);
          });
        }
      });
      return next;
    });
  };

  var setOrders = function(updater) {
    setOrdersRaw(function(prev) {
      var next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  };

  var setWbEntries = function(updater) {
    setWbEntriesRaw(function(prev) {
      var next = typeof updater === "function" ? updater(prev) : updater;
      if (!user) return next;
      if (next.length > prev.length) {
        var newEntries = next.filter(function(e) { return !prev.find(function(p) { return p.id === e.id; }); });
        newEntries.forEach(function(e) {
          supabase.from("whiteboard_entries").upsert({ id: e.id, user_id: user.id, horse_id: e.horseId || null,
            horse_name: e.horseName || "", venue: e.venue || "", date: e.date || "",
            race_time: e.raceTime || "", race_name: e.raceName || "", meeting_no: e.meetingNo || "",
            race_ref: e.raceRef || "", ballot_no: e.ballotNo || "", headgear: e.headgear || "", jockey: e.jockey || ""
          }).then(function() {});
        });
      } else if (next.length < prev.length) {
        var removedWb = prev.filter(function(e) { return !next.find(function(n) { return n.id === e.id; }); });
        removedWb.forEach(function(e) { supabase.from("whiteboard_entries").delete().eq("id", e.id).then(function() {}); });
      }
      return next;
    });
  };

  var handleLogin = async function() {
    setAuthLoading(true); setAuthError("");
    var res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) setAuthError(res.error.message);
    setAuthLoading(false);
  };

  var handleSignup = async function() {
    setAuthLoading(true); setAuthError("");
    var res = await supabase.auth.signUp({ email, password });
    if (res.error) setAuthError(res.error.message);
    else setAuthError("Account created! You can now log in.");
    setAuthLoading(false);
  };

  var handleLogout = async function() {
    await supabase.auth.signOut();
    setHorsesRaw([]); setMedLogsRaw({}); setTrackedIdsRaw([]); setWbEntriesRaw([]);
  };

  var horses = horsesRaw;
  var medLogs = medLogsRaw;
  var trackedIds = trackedIdsRaw;
  var wbEntries = wbEntriesRaw;
  var medAlerts = horses.filter(function(h) { var d = daysUntil(h.nextRaceDate); return d && d >= 12 && d <= 16; }).length;

  var NAV = [
    { id: "yard", label: "My Yard" },
    { id: "planner", label: "Race Planner" },
    { id: "provisional", label: "Provisional Entries" },
    { id: "meds", label: "Medication Tracker", badge: medAlerts },
    { id: "whiteboard", label: "Raceday Whiteboard" },
    { id: "movements", label: "Horse Movements" },
    { id: "owners", label: "Owner Portal" },
    { id: "staff", label: "Staff Hours" },
    { id: "settings", label: "Yard Settings" },
    { id: "weights", label: "Weights" },
    { id: "assistant", label: "AI Assistant" },
    { id: "content", label: "Content" },
    { id: "summary", label: "Daily Summary" },
    { id: "procurement", label: "Procurement" },
  ];

  if (appLoading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.textMid, fontSize: 15 }}>Loading...</div>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,Inter,Segoe UI,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      {!showAuth ? (
        <div>
          <div style={{ background: "rgba(10,22,40,0.97)", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
              🏇 RacePlan Pro
              <span style={{ background: "#c9952a", color: "#0a1628", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>BETA</span>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={function() { setAuthMode("login"); setShowAuth(true); }}
                style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                Log In
              </button>
              <button onClick={function() { setAuthMode("signup"); setShowAuth(true); }}
                style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#c9952a", color: "#0a1628", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
                Start Free Trial
              </button>
            </div>
          </div>
          <div style={{ minHeight: "calc(100vh - 64px)", background: "linear-gradient(135deg, #0a1628 0%, #0d2040 60%, #091830 100%)", display: "flex", alignItems: "center", padding: "60px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(201,149,42,0.12)", border: "1px solid rgba(201,149,42,0.3)", color: "#c9952a", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 22, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  🇮🇪 Built for Irish Racing
                </div>
                <div style={{ fontSize: "clamp(34px,4.5vw,56px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 20 }}>
                  The yard management app your <span style={{ color: "#c9952a" }}>trainer has been waiting for</span>
                </div>
                <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: 32, maxWidth: 460 }}>
                  Race planning, medication tracking, owner communications, whiteboard, AI analysis — all in one app built for Irish racing yards.
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40 }}>
                  <button onClick={function() { setAuthMode("signup"); setShowAuth(true); }}
                    style={{ padding: "14px 28px", borderRadius: 10, border: "none", background: "#c9952a", color: "#0a1628", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                    Start Free Trial →
                  </button>
                  <button onClick={function() { setAuthMode("login"); setShowAuth(true); }}
                    style={{ padding: "14px 28px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    Log In
                  </button>
                </div>
                <div style={{ display: "flex", gap: 32, paddingTop: 28, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  {[["200+","Horses managed"],["12pm","Entry alerts"],["5 min","Setup time"],["14 day","Free trial"]].map(function(s) {
                    return (
                      <div key={s[0]} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#c9952a", lineHeight: 1 }}>{s[0]}</div>
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
                  <div style={{ background: "#c9952a", color: "#0a1628", borderRadius: 6, padding: "4px 11px", fontSize: 11, fontWeight: 700 }}>Race Planner</div>
                  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "4px 11px", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Whiteboard</div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>14 races loaded · 8 horses eligible</div>
                {[
                  { venue: "LEOPARDSTOWN · SATURDAY", race: "Mares Novice Hurdle 2m", prize: "EUR 18,000", count: "3 eligible", colour: "#22c55e" },
                  { venue: "NAVAN · SUNDAY", race: "Handicap Chase 2m4f", prize: "EUR 12,000", count: "2 eligible", colour: "#f59e0b" },
                ].map(function(r) {
                  return (
                    <div key={r.race} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "13px 15px", marginBottom: 9 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 5 }}>{r.venue}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{r.race}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "rgba(201,149,42,0.2)", color: "#f5c842", fontWeight: 700 }}>{r.prize}</span>
                          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: r.colour + "20", color: r.colour, fontWeight: 700, border: "1px solid " + r.colour + "40" }}>{r.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ background: "rgba(201,149,42,0.08)", border: "1px solid rgba(201,149,42,0.25)", borderRadius: 10, padding: "13px 15px" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>💊 PEPTIZOLE ALERT · 10:00AM</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>2 horses finishing course today</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>Entry deadline 12:00 — act now</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ background: "#f0f4f8", padding: "80px 24px" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c9952a", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Everything you need</div>
              <div style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, color: "#0a1628", marginBottom: 14 }}>Built around how a racing yard actually works</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginTop: 40 }}>
                {[
                  ["📋","Race Planner","Paste HRI conditions. Every race shows eligible horses by age, sex, rating and discipline. AI analysis per combination."],
                  ["💊","Medication Tracker","10am WhatsApp alert when Peptizole ends on entry day — 2 hours before the 12pm deadline."],
                  ["🖨️","Raceday Whiteboard","Import HRI CSV. Headgear and ballot badges print in full colour. Used every race day."],
                  ["⚖️","Weights Tracker","Staff enter weights on phones as they go. Trends, history, race day weights. Auto-saves."],
                  ["🤖","AI Yard Assistant","Voice or text. Knows your yard and horses. Logs tasks. Today's conversation saves automatically."],
                  ["🛒","Procurement","Staff order from TRI, RED MILLS, Vet Supplies. Secretary approves. Order goes to supplier."]
                ].map(function(f) {
                  return (
                    <div key={f[1]} style={{ background: "#fff", borderRadius: 14, padding: 24, border: "1px solid #d4dde8" }}>
                      <div style={{ fontSize: 32, marginBottom: 12 }}>{f[0]}</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#0a1628", marginBottom: 8 }}>{f[1]}</div>
                      <div style={{ fontSize: 13, color: "#4a6080", lineHeight: 1.6 }}>{f[2]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ background: "#0a1628", padding: "80px 24px", textAlign: "center" }}>
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, color: "#fff", marginBottom: 14 }}>Ready to modernise your yard?</div>
              <div style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}>14-day free trial. No credit card required. Set up in 5 minutes.</div>
              <button onClick={function() { setAuthMode("signup"); setShowAuth(true); }}
                style={{ padding: "16px 36px", borderRadius: 12, border: "none", background: "#c9952a", color: "#0a1628", fontSize: 16, fontWeight: 900, cursor: "pointer" }}>
                Start Free Trial →
              </button>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", marginTop: 14 }}>€169/month after trial · Cancel anytime</div>
            </div>
          </div>
          <div style={{ background: "#091830", padding: "28px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>🏇 RacePlan Pro — Built in Ireland 🇮🇪</div>
            <div style={{ display: "flex", gap: 20 }}>
              {[["Terms","/terms"],["Privacy","/privacy"],["hello@raceplanpro.com","mailto:hello@raceplanpro.com"]].map(function(l) {
                return <a key={l[0]} href={l[1]} style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>{l[0]}</a>;
              })}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ minHeight: "100vh", background: "#f0f4f8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(10,22,40,0.12)", overflow: "hidden" }}>
            <div style={{ background: "#0a1628", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>RacePlan Pro</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{authMode === "login" ? "Welcome back" : "Start your free trial"}</div>
              </div>
              <button onClick={function() { setShowAuth(false); }}
                style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 16 }}>
                ←
              </button>
            </div>
            <div style={{ padding: "24px 28px" }}>
              <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "#f0f4f8", borderRadius: 10, padding: 4 }}>
                {["login","signup"].map(function(m) {
                  return (
                    <button key={m} onClick={function() { setAuthMode(m); setAuthError(""); }}
                      style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer",
                        background: authMode === m ? "#0a1628" : "transparent", color: authMode === m ? "#fff" : "#4a6080" }}>
                      {m === "login" ? "Log In" : "Sign Up"}
                    </button>
                  );
                })}
              </div>
              <input type="email" placeholder="Email" value={email}
                onChange={function(e) { setEmail(e.target.value); }}
                onKeyDown={function(e) { if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignup(); }}
                style={{ width: "100%", padding: "11px 14px", marginBottom: 10, background: "#f0f4f8", border: "1px solid #d4dde8", borderRadius: 10, fontSize: 14, color: "#0a1628" }} />
              <input type="password" placeholder="Password" value={password}
                onChange={function(e) { setPassword(e.target.value); }}
                onKeyDown={function(e) { if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignup(); }}
                style={{ width: "100%", padding: "11px 14px", marginBottom: 16, background: "#f0f4f8", border: "1px solid #d4dde8", borderRadius: 10, fontSize: 14, color: "#0a1628" }} />
              {authError && <div style={{ fontSize: 13, color: "#c0392b", marginBottom: 12, fontWeight: 600 }}>{authError}</div>}
              <button onClick={function() { authMode === "login" ? handleLogin() : handleSignup(); }}
                style={{ width: "100%", padding: "12px", background: "#0a1628", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                {authMode === "login" ? "Log In" : "Create Account"}
              </button>
              {authMode === "signup" && <div style={{ fontSize: 12, color: "#8fa3bc", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>14-day free trial · No credit card required</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, Helvetica Neue, sans-serif", display: "flex", flexDirection: "column" }}>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 16px", flexShrink: 0, gap: 10 }}>
        <button onClick={function() { setSidebarOpen(function(o) { return !o; }); }}
          style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
          {sidebarOpen ? "<" : ">"}
        </button>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>RacePlan Pro</div>
        <div style={{ marginLeft: 8, padding: "4px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 20, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          {(NAV.find(function(n) { return n.id === tab; }) || {}).label || ""}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{user.email}</span>
          <button onClick={handleLogout}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <div style={{ width: sidebarOpen ? 200 : 52, background: C.sidebar, flexShrink: 0, display: "flex", flexDirection: "column", transition: "width 0.2s", overflow: "hidden" }}>
          {NAV.map(function(nav) {
            var active = tab === nav.id;
            return (
              <button key={nav.id} onClick={function() { setTab(nav.id); }}
                style={{ position: "relative", display: "flex", alignItems: "center", gap: 10,
                  padding: sidebarOpen ? "13px 16px" : "15px 0", justifyContent: sidebarOpen ? "flex-start" : "center",
                  background: active ? "rgba(255,255,255,0.12)" : "transparent", border: "none",
                  borderLeft: active ? "3px solid " + C.gold : "3px solid transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  fontSize: 13, fontWeight: active ? 700 : 400, cursor: "pointer", width: "100%", textAlign: "left" }}>
                {sidebarOpen && <span style={{ flex: 1 }}>{nav.label}</span>}
                {!sidebarOpen && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center", width: "100%", lineHeight: 1.2, padding: "0 4px", whiteSpace: "nowrap", overflow: "hidden" }}>{nav.label.split(" ")[0]}</span>}
                {nav.badge > 0 && sidebarOpen && <span style={{ background: C.red, color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{nav.badge}</span>}
              </button>
            );
          })}
          {sidebarOpen && (
            <div style={{ marginTop: "auto", padding: "14px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Yard</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Active</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{horses.filter(function(h) { return h.status === "Active"; }).length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Total</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{horses.length}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minWidth: 0 }}>
          {tab === "yard" && <YardView horses={horses} setHorses={setHorses} />}
          {tab === "planner" && <RacePlanner horses={horses} setHorses={setHorses} />}
          {tab === "provisional" && <ProvisionalEntries horses={horses} setHorses={setHorses} />}
          {tab === "meds" && <MedicationTracker horses={horses} medLogs={medLogs} setMedLogs={setMedLogs} trackedIds={trackedIds} setTrackedIds={setTrackedIdsRaw} />}
          {tab === "whiteboard" && <RacedayPrint horses={horses} entries={wbEntries} setEntries={setWbEntries} />}
          {tab === "movements" && <MovementLog horses={horses} />}
          {tab === "owners" && <OwnerPortal horses={horses} />}
          {tab === "staff" && <StaffNotify user={user} supabase={supabase} settings={settings} />}
          {tab === "settings" && <YardSettings settings={settings} setSettings={saveSettings} />}
          {tab === "weights" && <WeightsTracker horses={horses} weights={weightsRaw} setWeights={setWeights} settings={settings} />}
          {tab === "assistant" && <YardAssistant horses={horses} weights={weightsRaw} medLogs={medLogs} settings={settings} user={user} supabase={supabase} />}
          {tab === "content" && <ContentScheduler horses={horses} settings={settings} />}
          {tab === "summary" && <DailySummary horses={horses} medLogs={medLogs} weights={weightsRaw} wbEntries={wbEntries} settings={settings} />}
          {tab === "procurement" && <Procurement user={user} supabase={supabase} orders={ordersRaw} setOrders={setOrders} settings={settings} />}
        </div>
      </div>
    </div>
  );
}
