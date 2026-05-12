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
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
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
          <input type="email" placeholder="Email" value={email}
            onChange={function(e) { setEmail(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignup(); }}
            style={{ width: "100%", padding: "10px 14px", marginBottom: 12, background: C.cardOff,
              border: "1px solid " + C.border, borderRadius: 10, fontSize: 14, color: C.text }} />
          <input type="password" placeholder="Password" value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignup(); }}
            style={{ width: "100%", padding: "10px 14px", marginBottom: 16, background: C.cardOff,
              border: "1px solid " + C.border, borderRadius: 10, fontSize: 14, color: C.text }} />
          {authError && (
            <div style={{ fontSize: 13, marginBottom: 14, fontWeight: 600,
              color: authError.includes("created") ? C.green : C.red }}>
              {authError}
            </div>
          )}
          <Btn onClick={authMode === "login" ? handleLogin : handleSignup} disabled={authLoading}
            style={{ width: "100%", justifyContent: "center" }}>
            {authLoading ? "Please wait..." : authMode === "login" ? "Log In" : "Create Account"}
          </Btn>
        </div>
      </div>
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
