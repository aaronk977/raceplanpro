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
import LandingPage from "./LandingPage";
import TravelCost from "./TravelCost";
import Trotters from "./Trotters";
import RaceDayChecklist from "./RaceDayChecklist";
import MedicinesRegister from "./MedicinesRegister";
import Prescriptions from "./Prescriptions";
import Galloping from "./Galloping";
import Reports from "./Reports";
import WeightsTracker from "./WeightsTracker";
import YardAssistant from "./YardAssistant";
import ContentScheduler from "./ContentScheduler";
import DailySummary from "./DailySummary";
import Procurement from "./Procurement";
import Reminders from "./Reminders";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
var supabase = null;
try { if (SUPABASE_URL && SUPABASE_ANON_KEY) supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } catch(e) { console.warn("Supabase init failed:", e.message); }


const globalCSS = ".desktop-only { display: flex !important; } * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: Inter, Helvetica Neue, sans-serif; } button:hover { opacity: 0.88; } input:focus, select:focus { outline: none; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #b8c8da; border-radius: 2px; } @media print { body * { visibility: hidden; } #print-area, #print-area * { visibility: visible; } #print-area { position: absolute; left: 0; top: 0; } } @media (max-width: 767px) { .desktop-only { display: none !important; } html, body { overflow-x: hidden; overflow-y: scroll !important; -webkit-overflow-scrolling: touch; height: auto !important; } } @media (min-width: 768px) { .app-wrapper { height: 100vh; overflow: hidden; } .main-content { overflow-y: auto; height: calc(100vh - 56px); } }";

var ROLE_TABS = {
  "Trainer":           ["yard","planner","provisional","meds","register","prescriptions","whiteboard","movements","owners","staff","weights","trotters","galloping","checklist","assistant","content","summary","reminders","procurement","travel","reports","settings"],
  "Secretary":         ["yard","planner","provisional","meds","register","prescriptions","whiteboard","movements","owners","staff","weights","trotters","galloping","checklist","assistant","content","summary","reminders","procurement","travel","reports","settings"],
  "Head Lad":          ["yard","planner","provisional","meds","register","prescriptions","whiteboard","movements","owners","staff","weights","trotters","galloping","checklist","assistant","content","summary","reminders","procurement","travel","reports","settings"],
  "Head Girl":         ["yard","planner","provisional","meds","register","prescriptions","whiteboard","movements","owners","staff","weights","trotters","galloping","checklist","assistant","content","summary","reminders","procurement","travel","reports","settings"],
  "Assistant Trainer": ["yard","planner","provisional","meds","register","prescriptions","whiteboard","movements","owners","staff","weights","trotters","galloping","checklist","assistant","content","summary","reminders","procurement","travel","reports","settings"],
  "Staff":             ["meds","staff","weights","movements","reminders","procurement"],
  "Vet":               ["yard","meds","register","prescriptions","movements","weights","trotters","galloping","summary"],
  "Owner":             ["owners","whiteboard"]
};

var ALL_TABS = ["yard","planner","provisional","meds","register","prescriptions","whiteboard","movements","owners","staff","weights","trotters","galloping","checklist","assistant","content","summary","reminders","procurement","travel","reports","settings"];

function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedData, setAgreedData] = useState(false);
  var isMobileState = useState(typeof window !== "undefined" && window.innerWidth < 640);
  var isMobile = isMobileState[0];
  const [appLoading, setAppLoading] = useState(true);
  const [tab, setTab] = useState("yard");
  const [settings, setSettings] = useState({ yardName: "", trainerName: "", weighDay: "Monday", notifyContacts: [], ownerContacts: [], tier: "Professional", costPeptizole: 18, costAntepsin: 25, costAntibiotics: 15 });

  var saveSettings = function(newSettings) {
    setSettings(newSettings);
    // Persist to localStorage for instant reload
    try { localStorage.setItem("rpp_settings_" + (user ? user.id : "local"), JSON.stringify(newSettings)); } catch(e) {}
    // Persist to Supabase
    if (user && supabase) {
      supabase.from("yard_settings").upsert({
        user_id: user.id, settings_json: JSON.stringify(newSettings)
      }, { onConflict: "user_id" }).then(function(r) {
        if (r.error) console.error("Settings save:", r.error.message);
      });
    }
    var ownerContacts = newSettings.ownerContacts || [];
    var ownerSilks = newSettings.ownerSilks || {};
    var hasSilks = Object.keys(ownerSilks).length > 0;
    if (ownerContacts.length > 0 || hasSilks) {
      setHorses(function(prev) {
        return prev.map(function(horse) {
          var ownerName = (horse.owner || "").toLowerCase().trim();
          var updated = Object.assign({}, horse);
          // Sync owner contacts
          var match = ownerContacts.find(function(oc) {
            return oc.name.toLowerCase().trim() === ownerName;
          });
          if (match) {
            if (match.phone) updated.ownerPhone = match.phone;
            if (match.email) updated.ownerEmail = match.email;
          }
          // Apply owner silks
          if (hasSilks && ownerSilks[ownerName]) {
            updated.silk = ownerSilks[ownerName];
          }
          return updated;
        });
      });
    }
  };
  const [weightsRaw, setWeightsRaw] = useState({});
  const [reminders, setReminders] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [ordersRaw, setOrdersRaw] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    // Load settings from localStorage first (instant)
    try {
      var cached = localStorage.getItem("rpp_settings_" + user.id);
      if (cached) setSettings(JSON.parse(cached));
    } catch(e) {}
    // Load from Supabase (authoritative)
    supabase.from("yard_settings").select("settings_json").eq("user_id", user.id).single()
      .then(function(res) {
        if (res.data && res.data.settings_json) {
          try {
            var s = JSON.parse(res.data.settings_json);
            setSettings(s);
            localStorage.setItem("rpp_settings_" + user.id, res.data.settings_json);
          } catch(e) {}
        }
      });
    // Check if this user is a member of someone else's yard
    supabase.from("yard_members").select("*").eq("member_user_id", user.id)
      .then(function(res) {
        if (res.data && res.data.length > 0) {
          var membership = res.data[0];
          setUserRole(membership.role);
          // Load the yard owner's settings instead
          supabase.from("yard_settings").select("settings_json").eq("user_id", membership.yard_owner_id).single()
            .then(function(sres) {
              if (sres.data && sres.data.settings_json) {
                try { setSettings(JSON.parse(sres.data.settings_json)); } catch(e) {}
              }
            });
        } else {
          // This is the yard owner - full access
          setUserRole("Trainer");
          // Register any pending invites for this email
          supabase.from("yard_members").update({ member_user_id: user.id, joined_at: new Date().toISOString() })
            .eq("member_email", user.email).is("member_user_id", null)
            .then(function() {});
        }
      });
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

      function parseWKey(key) {
        var lastUnd = key.lastIndexOf("_");
        var wType = key.slice(lastUnd + 1);
        var rest = key.slice(0, lastUnd);
        var dateUnd = rest.lastIndexOf("_");
        return { horseId: rest.slice(0, dateUnd), weighDate: rest.slice(dateUnd + 1), weightType: wType };
      }

      // Save changed/new keys
      Object.keys(next).forEach(function(key) {
        if (next[key] !== prev[key]) {
          var p = parseWKey(key);
          if (next[key] && p.weighDate && p.weighDate.length === 10) {
            supabase.from("horse_weights").upsert({
              user_id: user.id, horse_id: p.horseId, weigh_date: p.weighDate,
              weight_type: p.weightType || "weekly", weight_kg: parseFloat(next[key])
            }, { onConflict: "user_id,horse_id,weigh_date,weight_type" }).then(function(r) {
              if (r.error) console.error("Weight save:", r.error);
            });
          }
        }
      });

      // Delete removed keys from Supabase
      Object.keys(prev).forEach(function(key) {
        if (!(key in next)) {
          var p = parseWKey(key);
          if (p.weighDate && p.weighDate.length === 10) {
            supabase.from("horse_weights").delete()
              .eq("user_id", user.id)
              .eq("horse_id", p.horseId)
              .eq("weigh_date", p.weighDate)
              .eq("weight_type", p.weightType || "weekly")
              .then(function(r) {
                if (r.error) console.error("Weight delete:", r.error);
              });
          }
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

  var rememberMeState = useState(false);
  var rememberMe = rememberMeState[0]; var setRememberMe = rememberMeState[1];
  var resetSentState = useState(false);
  var resetSent = resetSentState[0]; var setResetSent = resetSentState[1];

  var handleLogin = async function() {
    setAuthLoading(true); setAuthError("");
    var res = await supabase.auth.signInWithPassword({ email, password });
    if (res.error) { setAuthError(res.error.message); }
    else if (rememberMe) { localStorage.setItem("rpp_remember", email); }
    setAuthLoading(false);
  };

  var handleForgotPassword = async function() {
    if (!email) { setAuthError("Enter your email address first"); return; }
    setAuthLoading(true); setAuthError("");
    var res = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (res.error) { setAuthError(res.error.message); }
    else { setResetSent(true); setAuthError(""); }
    setAuthLoading(false);
  };

  var handleSignup = async function() {
    if (!agreedTerms || !agreedData) {
      setAuthError("Please agree to the Terms and Data Processing terms to continue.");
      return;
    }
    setAuthLoading(true); setAuthError("");
    // Check if this email has been invited as staff before creating account
    var memberCheck = await supabase.from("yard_members").select("role, yard_owner_id").eq("member_email", email.toLowerCase().trim()).maybeSingle();
    var isInvitedStaff = memberCheck.data && memberCheck.data.yard_owner_id;
    var res = await supabase.auth.signUp({ email, password });
    if (res.error) {
      setAuthError(res.error.message);
    } else if (res.data && res.data.user) {
      // Link staff member to yard immediately
      if (isInvitedStaff) {
        await supabase.from("yard_members").update({ member_user_id: res.data.user.id, joined_at: new Date().toISOString() }).eq("member_email", email.toLowerCase().trim());
        setAuthError("Account created as " + memberCheck.data.role + ". Please log in.");
      } else {
        setAuthError("Yard account created. Please log in.");
      }
    }
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

  var allowedTabs = userRole ? (ROLE_TABS[userRole] || ALL_TABS) : ALL_TABS;
  var safeTab = allowedTabs.indexOf(tab) >= 0 ? tab : (allowedTabs[0] || "yard");
  var NAV = [
    { id: "yard", label: "My Yard", icon: "🐎" },
    { id: "planner", label: "Race Planner", icon: "📋" },
    { id: "provisional", label: "Provisional", icon: "📝" },
    { id: "meds", label: "Medications", icon: "💊", badge: medAlerts },
    { id: "register", label: "Med Register", icon: "R" },
    { id: "prescriptions", label: "Prescriptions", icon: "Rx" },
    { id: "whiteboard", label: "Whiteboard", icon: "🖨️" },
    { id: "movements", label: "Movements", icon: "🚛" },
    { id: "owners", label: "Owners", icon: "👤" },
    { id: "staff", label: "Staff Hours", icon: "🌙" },
    { id: "weights", label: "Weights", icon: "⚖️" },
    { id: "assistant", label: "AI Assistant", icon: "🤖" },
    { id: "content", label: "Content", icon: "🎥" },
    { id: "summary", label: "Daily Summary", icon: "📊" },
    { id: "reminders", label: "Reminders", icon: "🔔" },
    { id: "procurement", label: "Procurement", icon: "🛒" },
    { id: "trotters", label: "Trotters", icon: "🐎" },
    { id: "galloping", label: "Galloping", icon: "G" },
    { id: "travel", label: "Travel Cost", icon: "🚛" },
    { id: "checklist", label: "Race Day", icon: "v" },
    { id: "reports", label: "Reports", icon: "Rp" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ].filter(function(n) { return allowedTabs.indexOf(n.id) >= 0; });

  if (appLoading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: C.textMid, fontSize: 15 }}>Loading...</div>
    </div>
  );

  if (!user && showAuth) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      <div style={{ background: C.card, borderRadius: 20, width: "100%", maxWidth: 400, boxShadow: C.shadowMd, overflow: "hidden" }}>
        <div style={{ background: C.navy, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>RacePlan Pro</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{authMode === "login" ? "Welcome back" : "Start your free trial"}</div>
          </div>
          <button onClick={function() { setShowAuth(false); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 16 }}>←</button>
        </div>
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", gap: 0, marginBottom: 20, background: C.cardOff, borderRadius: 10, padding: 4 }}>
            {["login","signup"].map(function(m) {
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
            style={{ width: "100%", padding: "11px 14px", marginBottom: 10, background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, fontSize: 14, color: C.text }} />
          <input type="password" placeholder="Password" value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            onKeyDown={function(e) { if (e.key === "Enter") authMode === "login" ? handleLogin() : handleSignup(); }}
            style={{ width: "100%", padding: "11px 14px", marginBottom: 16, background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, fontSize: 14, color: C.text }} />
          {authMode === "login" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textMid, cursor: "pointer" }}>
                <input type="checkbox" checked={rememberMe} onChange={function(e) { setRememberMe(e.target.checked); }} style={{ cursor: "pointer" }} />
                Remember me
              </label>
              <button onClick={handleForgotPassword} disabled={authLoading}
                style={{ background: "none", border: "none", color: C.navy, fontSize: 13, cursor: "pointer", textDecoration: "underline", padding: 0, fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>
          )}
          {resetSent && (
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#166534", marginBottom: 10, textAlign: "center" }}>
              Password reset email sent. Check your inbox.
            </div>
          )}
          {authMode === "signup" && (
            <div style={{ marginBottom: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", fontSize: 12, color: C.textMid, lineHeight: 1.4 }}>
                <input type="checkbox" checked={agreedTerms} onChange={function(e) { setAgreedTerms(e.target.checked); }} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>I agree to the <a href="/terms" target="_blank" style={{ color: C.navy, fontWeight: 600 }}>Terms of Service</a> and <a href="/privacy" target="_blank" style={{ color: C.navy, fontWeight: 600 }}>Privacy Policy</a>.</span>
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: "pointer", fontSize: 12, color: C.textMid, lineHeight: 1.4 }}>
                <input type="checkbox" checked={agreedData} onChange={function(e) { setAgreedData(e.target.checked); }} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>I confirm I am authorised to store my yard, staff and owner details (including names and contact numbers) in RacePlan Pro, and that I am responsible for having any necessary consent from those individuals.</span>
              </label>
            </div>
          )}
          {authError && <div style={{ fontSize: 13, color: C.red, marginBottom: 12, fontWeight: 600 }}>{authError}</div>}
          <button onClick={function() { authMode === "login" ? handleLogin() : handleSignup(); }}
            style={{ width: "100%", padding: "12px", background: C.navy, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            {authMode === "login" ? "Log In" : "Create Account"}
          </button>
          {authMode === "signup" && <div style={{ fontSize: 12, color: C.textMid, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>14-day free trial · No credit card required</div>}
        </div>
      </div>
    </div>
  );

  if (!user) return (
    <LandingPage
      onLogin={function() { setAuthMode("login"); setShowAuth(true); }}
      onSignup={function() { setAuthMode("signup"); setShowAuth(true); }}
    />
  );


  return (
    <div className="app-wrapper" style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, Helvetica Neue, sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: globalCSS }} />
      <div style={{ background: C.navy, height: 56, display: "flex", alignItems: "center", padding: "0 16px", gap: 10, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={function() {
          if (window.innerWidth < 768) { setMobileNavOpen(function(o) { return !o; }); }
          else { setSidebarOpen(function(o) { return !o; }); }
        }}
          style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
          {"☰"}
        </button>
        <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>🏇 RacePlan Pro</div>
        <div style={{ marginLeft: 8, padding: "4px 12px", background: "rgba(255,255,255,0.08)", borderRadius: 20, fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
          {(NAV.find(function(n) { return n.id === tab; }) || {}).label || ""}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{user.email}</span>{userRole && userRole !== "Trainer" && <span style={{ fontSize: 9, color: C.gold, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{userRole}</span>}</div>
          <button onClick={handleLogout}
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", padding: "5px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>
      </div>

      {mobileNavOpen && (
        <div onClick={function() { setMobileNavOpen(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 300, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div onClick={function(e) { e.stopPropagation(); }}
            style={{ background: C.navy, borderRadius: "20px 20px 0 0", maxHeight: "85vh", overflowY: "auto", paddingBottom: 24 }}>
            <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2, margin: "12px auto 16px" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, padding: "0 10px" }}>
              {NAV.map(function(nav) {
                var active = tab === nav.id;
                return (
                  <button key={nav.id} onClick={function() { setTab(nav.id); setMobileNavOpen(false); }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      padding: "14px 6px", borderRadius: 12, border: "none",
                      background: active ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.04)",
                      color: active ? "#fff" : "rgba(255,255,255,0.6)",
                      fontSize: 11, fontWeight: active ? 700 : 500, cursor: "pointer", gap: 6,
                      borderBottom: active ? "2px solid " + C.gold : "2px solid transparent" }}>
                    <span style={{ fontSize: 22 }}>{nav.icon}</span>
                    <span style={{ lineHeight: 1.2, textAlign: "center", fontSize: 10 }}>{nav.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ margin: "14px 14px 0", padding: "12px 16px", background: "rgba(255,255,255,0.06)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Active horses</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{horses.filter(function(h) { return h.status === "Active"; }).length}</div>
              </div>
              <button onClick={function() { handleLogout(); setMobileNavOpen(false); }}
                style={{ padding: "8px 16px", background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex" }}>
        <div style={{ width: sidebarOpen ? 200 : 52, background: C.sidebar, flexShrink: 0, display: "flex", flexDirection: "column", transition: "width 0.2s", position: "sticky", top: 56, height: "calc(100vh - 56px)", overflowY: "auto", overflowX: "hidden" }} className="desktop-only">
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

        <div className="main-content" style={{ flex: 1, padding: "14px 16px", minWidth: 0, boxSizing: "border-box" }}>
          {safeTab === "yard" && <YardView horses={horses} setHorses={setHorses} settings={settings} />}
          {safeTab === "planner" && <RacePlanner horses={horses} setHorses={setHorses} settings={settings} />}
          {safeTab === "provisional" && <ProvisionalEntries horses={horses} setHorses={setHorses} settings={settings} />}
          {safeTab === "meds" && <MedicationTracker horses={horses} medLogs={medLogs} setMedLogs={setMedLogs} trackedIds={trackedIds} setTrackedIds={setTrackedIdsRaw} settings={settings} />}
          {safeTab === "whiteboard" && <RacedayPrint horses={horses} entries={wbEntries} setEntries={setWbEntries} settings={settings} />}
          {safeTab === "movements" && <MovementLog horses={horses} settings={settings} />}
          {safeTab === "owners" && <OwnerPortal horses={horses} settings={settings} />}
          {safeTab === "staff" && <StaffNotify user={user} supabase={supabase} settings={settings} />}
          {safeTab === "trotters" && <Trotters horses={horses} user={user} supabase={supabase} />}
          {safeTab === "galloping" && <Galloping horses={horses} user={user} supabase={supabase} settings={settings} />}
          {safeTab === "checklist" && <RaceDayChecklist horses={horses} wbEntries={wbEntries} user={user} supabase={supabase} />}
          {safeTab === "register" && <MedicinesRegister horses={horses} user={user} supabase={supabase} settings={settings} />}
          {safeTab === "prescriptions" && <Prescriptions horses={horses} user={user} supabase={supabase} settings={settings} />}
          {safeTab === "travel" && <TravelCost settings={settings} />}
          {safeTab === "reports" && <Reports horses={horses} user={user} supabase={supabase} settings={settings} />}
          {safeTab === "settings" && <YardSettings settings={settings} setSettings={saveSettings} supabase={supabase} user={user} />}
          {safeTab === "weights" && <WeightsTracker horses={horses} weights={weightsRaw} setWeights={setWeights} settings={settings} />}
          {safeTab === "assistant" && <YardAssistant horses={horses} setHorses={setHorses} weights={weightsRaw} medLogs={medLogs} setMedLogs={setMedLogs} reminders={reminders} setReminders={setReminders} settings={settings} user={user} supabase={supabase} onNavigate={setTab} />}
          {safeTab === "content" && <ContentScheduler horses={horses} settings={settings} />}
          {safeTab === "summary" && <DailySummary horses={horses} medLogs={medLogs} weights={weightsRaw} wbEntries={wbEntries} settings={settings} />}
          {safeTab === "procurement" && <Procurement user={user} supabase={supabase} orders={ordersRaw} setOrders={setOrders} settings={settings} />}
          {safeTab === "reminders" && <Reminders reminders={reminders} setReminders={setReminders} settings={settings} user={user} supabase={supabase} />}
        </div>
      </div>
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.navy, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {[
            { id: "summary", icon: "📊", label: "Today" },
            { id: "yard", icon: "🐎", label: "Yard" },
            { id: "planner", icon: "🏁", label: "Races" },
            { id: "meds", icon: "💊", label: "Meds" },
            { id: "assistant", icon: "🤖", label: "AI" },
          ].filter(function(t) { return allowedTabs.indexOf(t.id) >= 0; }).map(function(t) {
            return (
              <button key={t.id} onClick={function() { setSafeTab(t.id); }}
                style={{ flex: 1, padding: "8px 4px 6px", background: "none", border: "none", color: safeTab === t.id ? C.gold : "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <span style={{ fontSize: 20 }}>{t.icon}</span>
                <span style={{ fontSize: 9, fontWeight: safeTab === t.id ? 700 : 400 }}>{t.label}</span>
              </button>
            );
          })}
          <button onClick={function() { setSafeTab("settings"); }}
            style={{ flex: 1, padding: "8px 4px 6px", background: "none", border: "none", color: safeTab === "settings" ? C.gold : "rgba(255,255,255,0.4)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 20 }}>{"\u22EF"}</span>
            <span style={{ fontSize: 9 }}>More</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
