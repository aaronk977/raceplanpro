function SilkPreview({ silk, size }) {
  var sz = size || 36;
  if (!silk) return <div style={{ width: sz, height: sz, borderRadius: "50%", background: "#888" }} />;
  var body = silk.body || "#888"; var secondary = silk.secondary || "#555";
  var sleeve = silk.sleeve || secondary; var cap = silk.cap || secondary;
  var pattern = silk.pattern || "plain";
  return (
    <svg width={sz} height={sz} viewBox="0 0 36 40" style={{ flexShrink: 0 }}>
      <path d="M18,3 L28,9 L28,27 Q18,33 8,27 L8,9 Z" fill={body} />
      {pattern === "stripes" && <g><rect x="8" y="3" width="4" height="30" fill={secondary} opacity="0.55" /><rect x="16" y="3" width="4" height="30" fill={secondary} opacity="0.55" /><rect x="24" y="3" width="4" height="30" fill={secondary} opacity="0.55" /></g>}
      {pattern === "hoops" && <g><rect x="8" y="11" width="20" height="5" fill={secondary} opacity="0.6" /><rect x="8" y="20" width="20" height="5" fill={secondary} opacity="0.6" /></g>}
      {pattern === "chevron" && <polygon points="18,9 28,17 28,22 18,14 8,22 8,17" fill={secondary} opacity="0.7" />}
      {pattern === "quartered" && <g><rect x="18" y="3" width="10" height="14" fill={secondary} opacity="0.65" /><rect x="8" y="17" width="10" height="16" fill={secondary} opacity="0.65" /></g>}
      {pattern === "halved" && <path d="M18,3 L18,33 Q23,32 28,27 L28,9 Z" fill={secondary} opacity="0.9" />}
      {pattern === "spots" && <g><circle cx="13" cy="13" r="3" fill={secondary} opacity="0.6" /><circle cx="23" cy="11" r="2.5" fill={secondary} opacity="0.6" /><circle cx="11" cy="22" r="2.5" fill={secondary} opacity="0.6" /><circle cx="24" cy="22" r="3" fill={secondary} opacity="0.6" /></g>}
      {pattern === "panel" && <rect x="13" y="3" width="10" height="30" fill={secondary} opacity="0.6" />}
      {pattern === "braces" && <g><line x1="13" y1="3" x2="18" y2="16" stroke={secondary} strokeWidth="4" opacity="0.7" /><line x1="23" y1="3" x2="18" y2="16" stroke={secondary} strokeWidth="4" opacity="0.7" /></g>}
      {pattern === "diamond" && <polygon points="18,9 25,18 18,27 11,18" fill={secondary} opacity="0.65" />}
      <path d="M18,3 L28,9 L28,27 Q18,33 8,27 L8,9 Z" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.8" />
      <rect x="6" y="9" width="4" height="18" fill={sleeve} rx="2" />
      <rect x="26" y="9" width="4" height="18" fill={sleeve} rx="2" />
      <ellipse cx="18" cy="5" rx="8" ry="4" fill={cap} />
    </svg>
  );
}

import React, { useState } from "react";
import { Btn, C } from "./shared";

function OwnerContactsPanel({ edit, update }) {
  var owners = edit.ownerContacts || [];
  var showAddState = React.useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var newOwnerState = React.useState({ name: "", phone: "", email: "", horses: "" });
  var newOwner = newOwnerState[0]; var setNewOwner = newOwnerState[1];
  var editIdxState = React.useState(null);
  var editIdx = editIdxState[0]; var setEditIdx = editIdxState[1];

  var csvResultState = React.useState("");
  var csvResult = csvResultState[0]; var setCsvResult = csvResultState[1];

  function handleOwnerCSV(e) {
    var file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      var lines = text.split("\n").filter(function(l) { return l.trim(); });
      if (lines.length < 2) { setCsvResult("No data found in file"); return; }
      var sep = lines[0].indexOf("\t") >= 0 ? "\t" : ",";
      var headers = lines[0].split(sep).map(function(h) {
        return h.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
      });
      var imported = [];
      for (var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(sep).map(function(c) {
          var t = c.trim();
          if (t.length > 1 && t[0] === '"' && t[t.length-1] === '"') return t.slice(1,-1);
          return t;
        });
        if (!cols[0]) continue;
        var row = {};
        for (var j = 0; j < headers.length; j++) { row[headers[j]] = cols[j] || ""; }
        // Handle "First Name" + "Last Name" columns from Yardman
        // Yardman format: Tag, Name, Address1-8, Postcode, HomeTel, WorkTel, Mobile, Email, VatNo, SageCode
        var name = row.name || row.owner || row.owner_name || row.full_name || "";
        if (!name || !name.trim()) continue;
        name = name.trim().replace(/^["']+|["']+$/g, "").trim();
        if (!name) continue;

        // Fix scientific notation numbers like 4.47971E+11 -> phone number
        function fixSciNotation(val) {
          if (!val) return "";
          val = String(val).trim();
          // Detect scientific notation e.g. 4.47971E+11
          if (/^[0-9.]+[eE][+\-][0-9]+$/.test(val)) {
            try {
              var num = parseFloat(val);
              return Math.round(num).toString();
            } catch(ex) { return val; }
          }
          return val;
        }

        // Get phone from Mobile, HomeTel, WorkTel in that order
        var rawMobile = fixSciNotation(row.mobile || "");
        var rawHome = fixSciNotation(row.hometel || row.home_tel || "");
        var rawWork = fixSciNotation(row.worktel || row.work_tel || "");
        var rawPhone = rawMobile || rawHome || rawWork || fixSciNotation(row.phone || row.tel || row.telephone || "");

        // Get email
        var rawEmail = (row.email || row.email_address || "").trim();

        // Validate - swap if in wrong field
        var phone = ""; var email = "";
        if (rawPhone && rawPhone.indexOf("@") >= 0) { rawEmail = rawPhone; rawPhone = ""; }
        if (rawEmail && rawEmail.indexOf("@") < 0 && rawEmail.replace(/[^0-9]/g, "").length > 6) {
          rawPhone = rawPhone || rawEmail; rawEmail = "";
        }
        phone = rawPhone; email = rawEmail;

        // Format Irish mobile: 87... -> +353 87...
        if (phone && phone.length === 9 && (phone.charAt(0) === "8" || phone.charAt(0) === "0")) {
          if (phone.charAt(0) === "0") phone = "+353" + phone.slice(1);
          else phone = "+353" + phone;
        }
        // Format if starts with 353
        if (phone && phone.indexOf("353") === 0 && phone.charAt(0) !== "+") phone = "+" + phone;
        imported.push({ id: "own_" + Date.now() + "_" + i, name: name.trim(), phone: phone.trim(), email: email.trim(), notes: "" });
      }
      if (!imported.length) { setCsvResult("No owners found - check your CSV has name, phone, email columns"); return; }
      update("ownerContacts", (owners || []).concat(imported));
      setCsvResult(imported.length + " owners imported successfully");
      setTimeout(function() { setCsvResult(""); }, 5000);
    };
    reader.readAsText(file);
  }

  function addOwner() {
    if (!newOwner.name.trim()) return;
    var updated = owners.slice();
    updated.push({ id: "own_" + Date.now(), name: newOwner.name.trim(), phone: newOwner.phone.trim(), email: newOwner.email.trim(), notes: "" });
    update("ownerContacts", updated);
    setNewOwner({ name: "", phone: "", email: "", horses: "" });
    setShowAdd(false);
  }

  function updateOwner(idx, key, val) {
    var updated = owners.slice();
    updated[idx] = Object.assign({}, updated[idx], { [key]: val });
    update("ownerContacts", updated);
  }

  function removeOwner(idx) {
    if (!window.confirm("Remove this owner?")) return;
    var updated = owners.slice();
    updated.splice(idx, 1);
    update("ownerContacts", updated);
  }

  function openWhatsApp(phone) {
    if (!phone) return;
    var p = phone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
    window.open("https://wa.me/" + p, "_blank");
  }

  function sendEmail(email) {
    if (!email) return;
    window.open("mailto:" + email);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 13, color: C.textMid }}>{owners.length + " owner" + (owners.length !== 1 ? "s" : "") + " saved"}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ padding: "8px 16px", borderRadius: 9, border: "1.5px solid " + C.border, background: C.cardOff, color: C.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            📂 Import CSV
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleOwnerCSV} style={{ display: "none" }} />
          </label>
          <Btn onClick={function() { setShowAdd(!showAdd); }} style={{ fontSize: 12, padding: "8px 16px" }}>
            {showAdd ? "Cancel" : "+ Add Owner"}
          </Btn>
        </div>
      </div>

      {csvResult && (
        <div style={{ background: C.green + "12", border: "1px solid " + C.green + "30", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, fontWeight: 600, color: C.green }}>
          {csvResult}
        </div>
      )}

      {showAdd && (
        <div style={{ background: C.cardOff, border: "1.5px dashed " + C.navy, borderRadius: 12, padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Add Owner</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Owner Name</div>
              <input type="text" value={newOwner.name} onChange={function(e) { setNewOwner(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }}
                placeholder="e.g. John Murphy"
                style={{ width: "100%", padding: "10px 14px", background: "#fff", border: "1px solid " + C.border, borderRadius: 9, fontSize: 14, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>WhatsApp Number</div>
              <input type="tel" value={newOwner.phone} onChange={function(e) { setNewOwner(function(p) { return Object.assign({}, p, { phone: e.target.value }); }); }}
                placeholder="+353 86 000 0000"
                style={{ width: "100%", padding: "10px 14px", background: "#fff", border: "1px solid " + C.border, borderRadius: 9, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Email Address</div>
              <input type="email" value={newOwner.email} onChange={function(e) { setNewOwner(function(p) { return Object.assign({}, p, { email: e.target.value }); }); }}
                placeholder="john@example.com"
                style={{ width: "100%", padding: "10px 14px", background: "#fff", border: "1px solid " + C.border, borderRadius: 9, fontSize: 13, color: C.text }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={addOwner} disabled={!newOwner.name.trim()}>Save Owner</Btn>
            <Btn variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {owners.length === 0 && !showAdd && (
        <div style={{ padding: 32, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No owners saved yet</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Add owner contact details here - WhatsApp and email buttons across the app use these numbers</div>
          <Btn onClick={function() { setShowAdd(true); }}>Add First Owner</Btn>
        </div>
      )}

      {owners.map(function(owner, idx) {
        var isEditing = editIdx === idx;
        var initials = owner.name.split(" ").map(function(w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase();
        return (
          <div key={owner.id || idx} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
            {!isEditing ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{owner.name}</div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12 }}>
                    {owner.phone ? (
                      <span style={{ color: C.green, fontWeight: 600 }}>{"📱 " + owner.phone}</span>
                    ) : (
                      <span style={{ color: C.red, fontWeight: 600 }}>📱 No WhatsApp</span>
                    )}
                    {owner.email ? (
                      <span style={{ color: C.blue, fontWeight: 600 }}>{"📧 " + owner.email}</span>
                    ) : (
                      <span style={{ color: C.textDim }}>No email</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {owner.phone && (
                    <button onClick={function() { openWhatsApp(owner.phone); }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      WhatsApp
                    </button>
                  )}
                  {owner.email && (
                    <button onClick={function() { sendEmail(owner.email); }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid " + C.blue + "40", background: C.blueBg, color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Email
                    </button>
                  )}
                  <button onClick={function() { setEditIdx(idx); }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + C.border, background: C.cardOff, color: C.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Edit
                  </button>
                  <button onClick={function() { removeOwner(idx); }}
                    style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid " + C.red + "40", background: "none", color: C.red, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Name</div>
                    <input type="text" value={owner.name} onChange={function(e) { updateOwner(idx, "name", e.target.value); }}
                      style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>WhatsApp</div>
                    <input type="tel" value={owner.phone} onChange={function(e) { updateOwner(idx, "phone", e.target.value); }}
                      placeholder="+353 86 000 0000"
                      style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Email</div>
                    <input type="email" value={owner.email} onChange={function(e) { updateOwner(idx, "email", e.target.value); }}
                      placeholder="owner@email.com"
                      style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Notes</div>
                    <input type="text" value={owner.notes || ""} onChange={function(e) { updateOwner(idx, "notes", e.target.value); }}
                      placeholder="Any notes"
                      style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={function() { setEditIdx(null); }} style={{ fontSize: 12 }}>Done</Btn>
                  <Btn variant="ghost" onClick={function() { setEditIdx(null); }} style={{ fontSize: 12 }}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

var STRIPE_LINKS = {
  Basic: "https://buy.stripe.com/basic_raceplanpro",
  Professional: "https://buy.stripe.com/pro_raceplanpro",
  Gold: "https://buy.stripe.com/cNidRbdiN0Ry7NG73G0oM02_raceplanpro"
};

var PLAN_FEATURES = {
  Basic: {
    price: "99",
    color: C ? C.blue : "#1e6fb5",
    features: [
      "Up to 50 horses",
      "My Yard - CSV import",
      "Raceday Whiteboard",
      "Medication Tracker",
      "Horse Movements log",
      "Owner Portal",
      "Staff Hours notifications",
      "Email support"
    ],
    limits: ["No AI race analysis", "No race conditions parsing", "No content scheduler"]
  },
  Professional: {
    price: "169",
    color: C ? C.gold : "#c9952a",
    features: [
      "Up to 150 horses",
      "Everything in Basic",
      "AI Race Analysis",
      "Race Conditions parsing (PDF)",
      "Provisional Entries",
      "Race Planner with shortlisting",
      "Content Scheduler",
      "Weights Tracker",
      "WhatsApp notifications",
      "Medication alerts at 10am",
      "Priority email support"
    ],
    limits: ["No custom integrations"]
  },
  Gold: {
    price: "249",
    color: C ? C.green : "#1a7a4a",
    features: [
      "Unlimited horses",
      "Everything in Professional",
      "AI Yard Assistant (voice + text)",
      "Daily summary reports",
      "Custom Twilio WhatsApp integration",
      "Passport scan - auto-fill horse details",
      "Multi-yard management",
      "Custom branding",
      "Dedicated account manager",
      "Phone support"
    ],
    limits: []
  }
};

function YardSettings({ settings, setSettings, supabase, user }) {
  var linkCopiedState = useState(false);
  var linkCopied = linkCopiedState[0]; var setLinkCopied = linkCopiedState[1];
  var [delConfirm, setDelConfirm] = useState("");
  var [delBusy, setDelBusy] = useState(false);
  var [delDone, setDelDone] = useState(false);
  function deleteAllYardData() {
    if (delConfirm !== "DELETE") return;
    setDelBusy(true);
    var tables = ["horses","med_logs","horse_weights","whiteboard_entries","reminders","trotters","raceday_checklists","shortlists","yard_logs","yard_members","yard_settings"];
    var done = 0;
    tables.forEach(function(t) {
      var col = (t === "yard_settings") ? "user_id" : (t === "yard_members" ? "yard_owner_id" : "user_id");
      supabase.from(t).delete().eq(col, user.id).then(function() {
        done++;
        if (done === tables.length) { setDelBusy(false); setDelDone(true); }
      }).catch(function() {
        done++;
        if (done === tables.length) { setDelBusy(false); setDelDone(true); }
      });
    });
  }

  var now = new Date();
  var editState = useState(Object.assign({
    yardName: "", trainerName: "", location: "", trainerLicence: "",
    discipline: "National Hunt", weighDay: "Monday",
    notifyContacts: [],
    treatments: [
      { id: "si_joints", name: "SI Joints", withdrawalDays: 45, color: "#c0392b", notes: "Sacroiliac joint injection" },
      { id: "back", name: "Back Treatment", withdrawalDays: 45, color: "#e67e22", notes: "Corticosteroid injection" },
      { id: "joint_inj", name: "Joint Injection", withdrawalDays: 30, color: "#d97706", notes: "Intra-articular injection" },
      { id: "tildren", name: "Tildren/Osphos", withdrawalDays: 60, color: "#8e44ad", notes: "Bisphosphonate treatment" },
      { id: "prp", name: "PRP Treatment", withdrawalDays: 30, color: "#27ae60", notes: "Platelet-rich plasma" },
      { id: "stem_cell", name: "Stem Cell", withdrawalDays: 90, color: "#2980b9", notes: "Stem cell therapy" }
    ],
    medications: [
      { id: "pep", name: "Peptizole", costPerUnit: 18, unit: "per day", color: "#1e6fb5", courseDays: 12, withdrawalDays: 4 },
      { id: "ant", name: "Antepsin", costPerUnit: 6.25, unit: "per day", color: "#6d3fc0", courseDays: 12, withdrawalDays: 1 },
      { id: "ab", name: "Antibiotics", costPerUnit: 15, unit: "per dose", color: "#d97706", courseDays: 5, withdrawalDays: 0, maxDoses: 2 }
    ],
    anthropicKey: "",
    tier: "Professional",
    notifyTime: "10:00",
    notifyMedEnding: true,
    notifyRaceDay: true,
    notifyEntries: true
  }, settings));
  var edit = editState[0]; var setEdit = editState[1];

  var savedState = useState(false);
  var silkPreviewState = useState([]);
  var silkPreviews = silkPreviewState[0]; var setSilkPreviews = silkPreviewState[1];
  var saved = savedState[0]; var setSaved = savedState[1];
  var activeTabState = useState("yard");
  var activeTab = activeTabState[0]; var setActiveTab = activeTabState[1];
  var editMedIdxState = useState(null);
  var editMedIdx = editMedIdxState[0]; var setEditMedIdx = editMedIdxState[1];
  var newMedState = useState({ name: "", costPerUnit: "", unit: "per day", color: "#1a7a4a" });
  var newMed = newMedState[0]; var setNewMed = newMedState[1];
  var showAddMedState = useState(false);
  var showAddMed = showAddMedState[0]; var setShowAddMed = showAddMedState[1];

  function update(key, val) {
    setEdit(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  var eircodeLoadingState = useState(false);
  var eircodeLoading = eircodeLoadingState[0]; var setEircodeLoading = eircodeLoadingState[1];
  var eircodeStatusState = useState("");
  var eircodeStatus = eircodeStatusState[0]; var setEircodeStatus = eircodeStatusState[1];
  var suggestionsState = useState([]);
  var addressSuggestions = suggestionsState[0]; var setAddressSuggestions = suggestionsState[1];
  var debounceTimerState = useState(null);
  var debounceTimer = debounceTimerState[0]; var setDebounceTimer = debounceTimerState[1];

  function handleAddressInput(val) {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!val || val.trim().length < 3) { setAddressSuggestions([]); return; }
    var timer = setTimeout(function() {
      fetchAddressSuggestions(val.trim());
    }, 350);
    setDebounceTimer(timer);
  }

  function fetchAddressSuggestions(query) {
    // Always use server-side proxy (keeps API key secure)
    fetch("/api/places-proxy?type=autocomplete&input=" + encodeURIComponent(query))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.predictions && data.predictions.length > 0) {
          setAddressSuggestions(data.predictions.map(function(p) {
            return {
              main: p.structured_formatting ? p.structured_formatting.main_text : p.description.split(",")[0],
              secondary: p.structured_formatting ? p.structured_formatting.secondary_text : p.description,
              placeId: p.place_id,
              full: p.description
            };
          }));
        } else {
          fetchNominatimSuggestions(query);
        }
      }).catch(function() { fetchNominatimSuggestions(query); });
  }

  function fetchNominatimSuggestions(query) {
    // Free fallback - Nominatim autocomplete
    fetch("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(query) + "&format=json&limit=5&countrycodes=ie,gb&addressdetails=1", {
      headers: { "Accept-Language": "en" }
    }).then(function(r) { return r.json(); })
    .then(function(data) {
      if (data && data.length > 0) {
        setAddressSuggestions(data.map(function(d) {
          var addr = d.address || {};
          var main = addr.road || addr.hamlet || addr.neighbourhood || d.display_name.split(",")[0];
          var secondary = [addr.town || addr.city || addr.village, addr.county, addr.state || addr.country].filter(Boolean).join(", ");
          return { main: main, secondary: secondary, lat: parseFloat(d.lat), lng: parseFloat(d.lon), full: d.display_name };
        }));
      }
    }).catch(function() {});
  }

  function selectAddress(suggestion) {
    setAddressSuggestions([]);
    if (suggestion.placeId) {
      fetch("/api/places-proxy?type=details&placeid=" + suggestion.placeId)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data.result && data.result.geometry) {
            var loc = data.result.geometry.location;
            update("yardLat", loc.lat);
            update("yardLng", loc.lng);
          }
        }).catch(function() {});
    } else if (suggestion.lat) {
      update("yardLat", suggestion.lat);
      update("yardLng", suggestion.lng);
    }
    var fullAddr = suggestion.secondary ? suggestion.main + ", " + suggestion.secondary : suggestion.full || suggestion.main;
    update("location", fullAddr);
    update("addressSearch", fullAddr);
    setEircodeStatus("Address set ✓");
    setTimeout(function() { setEircodeStatus(""); }, 3000);
  };

  // Irish eircode routing key coordinates
  var EIRCODE_COORDS = {
    "D01":[53.3441,-6.2675],"D02":[53.3388,-6.2591],"D03":[53.3306,-6.2363],"D04":[53.3139,-6.2197],
    "D05":[53.3639,-6.2286],"D06":[53.3264,-6.2797],"D07":[53.3486,-6.2983],"D08":[53.3361,-6.2942],
    "D09":[53.3528,-6.2514],"D10":[53.3369,-6.3133],"D11":[53.3764,-6.2739],"D12":[53.3172,-6.3256],
    "D13":[53.3831,-6.2269],"D14":[53.2967,-6.2681],"D15":[53.3894,-6.3567],"D16":[53.2894,-6.2933],
    "D17":[53.3575,-6.2072],"D18":[53.2694,-6.1839],"D20":[53.3092,-6.3669],"D22":[53.3181,-6.3831],
    "D24":[53.2875,-6.3789],"D6W":[53.3228,-6.3058],
    "W23":[53.2167,-6.6667],"R51":[53.1500,-6.9167],"W91":[52.6667,-6.9667],
    "A63":[52.9833,-6.2000],"A67":[52.8667,-6.0833],"A98":[53.0000,-6.0500],
    "A84":[53.6500,-6.7000],"A85":[53.5833,-6.6167],"C15":[53.7000,-6.3500],
    "N37":[53.5333,-7.3333],"N41":[53.4167,-7.6167],
    "E34":[52.6833,-7.9000],"E32":[52.4667,-7.7167],"E41":[52.8000,-7.7500],
    "X42":[52.2600,-7.1200],"X35":[52.3667,-7.7167],
    "T12":[51.8985,-8.4756],"T23":[51.8333,-8.3333],"P24":[52.0833,-8.0000],
    "P25":[51.6667,-8.6333],"P31":[51.9167,-9.0000],"P47":[51.7500,-9.3333],
    "P43":[51.6667,-8.1667],"P56":[51.5833,-9.0000],"P51":[51.5000,-9.5833],
    "V92":[52.0597,-9.5039],"V93":[52.1333,-9.8333],"V31":[52.3333,-9.7500],
    "V94":[52.6650,-8.6238],"V35":[52.5833,-8.8667],
    "V95":[52.8333,-8.9833],"V14":[53.0000,-8.8333],
    "H91":[53.2744,-9.0488],"H92":[53.3500,-9.4000],"H54":[53.5000,-9.0500],
    "H62":[53.1833,-8.5167],"H65":[53.5167,-8.3333],
    "F28":[53.8500,-9.3000],"F26":[53.6000,-9.7167],"F23":[54.0167,-9.5167],"F31":[53.6833,-9.9167],
    "F42":[53.6333,-8.1833],"F45":[53.9167,-8.4167],
    "F91":[54.2761,-8.4761],"F56":[54.1167,-8.5167],
    "F93":[54.9333,-8.0000],"F94":[54.7167,-8.1333],"F92":[54.6500,-8.1000],
    "H12":[53.9833,-7.3500],"H18":[54.2500,-6.9667],
    "A91":[53.9831,-6.3831],"A92":[53.9500,-6.5833],
    "R35":[53.3500,-7.9000],"R32":[52.9833,-7.4000],
    "R95":[52.6533,-7.2547],"Y21":[52.3333,-6.4667],"Y35":[52.5000,-6.5333],
    "R93":[52.8333,-6.9167],"N39":[53.7333,-7.7833],
    "K32":[53.5833,-6.3333],"K36":[53.5667,-6.3000],"K45":[53.4167,-6.4167],
    "K56":[53.3333,-6.5000],"K67":[53.2500,-6.5833],"K78":[53.1667,-6.6333]
  };

  // County/area names for routing keys
  var EIRCODE_AREAS = {
    "D":{name:"Dublin"},"W23":{name:"Kildare"},"R51":{name:"Kildare"},
    "W91":{name:"Kilkenny"},"A63":{name:"Wicklow"},"A67":{name:"Wicklow"},
    "A98":{name:"Wicklow"},"A84":{name:"Meath"},"A85":{name:"Meath"},
    "C15":{name:"Meath"},"N37":{name:"Westmeath"},"N41":{name:"Westmeath"},
    "E34":{name:"Tipperary"},"E32":{name:"Tipperary"},"E41":{name:"Tipperary"},
    "X42":{name:"Waterford"},"X35":{name:"Waterford"},
    "T12":{name:"Cork City"},"T23":{name:"Cork"},"P24":{name:"Cork"},
    "P25":{name:"Cork"},"P31":{name:"Cork"},"P47":{name:"Cork"},
    "P43":{name:"Cork"},"P56":{name:"Cork"},"P51":{name:"Cork"},
    "V92":{name:"Kerry"},"V93":{name:"Kerry"},"V31":{name:"Kerry"},
    "V94":{name:"Limerick"},"V35":{name:"Limerick"},
    "V95":{name:"Clare"},"V14":{name:"Clare"},
    "H91":{name:"Galway City"},"H92":{name:"Galway"},"H54":{name:"Galway"},
    "H62":{name:"Galway"},"H65":{name:"Galway"},
    "F28":{name:"Mayo"},"F26":{name:"Mayo"},"F23":{name:"Mayo"},"F31":{name:"Mayo"},
    "F42":{name:"Roscommon"},"F45":{name:"Roscommon"},
    "F91":{name:"Sligo"},"F56":{name:"Sligo"},
    "F93":{name:"Donegal"},"F94":{name:"Donegal"},"F92":{name:"Donegal"},
    "H12":{name:"Cavan"},"H18":{name:"Monaghan"},
    "A91":{name:"Louth"},"A92":{name:"Louth"},
    "R35":{name:"Offaly"},"R32":{name:"Laois"},
    "R95":{name:"Kilkenny"},"Y21":{name:"Wexford"},"Y35":{name:"Wexford"},
    "R93":{name:"Carlow"},"N39":{name:"Longford"}
  };

  function lookupEircode(code) {
    if (!code || code.trim().length < 3) return;
    var clean = code.trim().toUpperCase().replace(/\s+/g, "");
    setEircodeLoading(true); setEircodeStatus("Looking up...");

    // Try Irish eircode first - extract routing key (first 3 chars)
    var routingKey = clean.substring(0, 3);
    if (EIRCODE_COORDS[routingKey]) {
      var area = EIRCODE_AREAS[routingKey] || EIRCODE_AREAS[routingKey.charAt(0)] || { name: "" };
      var coords = EIRCODE_COORDS[routingKey];
      update("yardLat", coords[0]);
      update("yardLng", coords[1]);
      // Try Nominatim with the full eircode
      fetch("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(clean + " Ireland") + "&format=json&limit=1&addressdetails=1", {
        headers: { "Accept-Language": "en" }
      }).then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data[0]) {
          var addr = data[0].address || {};
          var parts = [];
          if (addr.road) parts.push(addr.road);
          if (addr.suburb) parts.push(addr.suburb);
          if (addr.town || addr.city || addr.village) parts.push(addr.town || addr.city || addr.village);
          if (addr.county) parts.push(addr.county);
          if (parts.length > 0) {
            update("location", parts.join(", "));
            update("yardLat", parseFloat(data[0].lat));
            update("yardLng", parseFloat(data[0].lon));
            setEircodeStatus("Address found ✓");
          } else {
            update("location", area.name ? "Co. " + area.name : "Ireland");
            setEircodeStatus("Area found: " + (area.name || routingKey) + " ✓");
          }
        } else {
          update("location", area.name ? "Co. " + area.name : "Ireland");
          setEircodeStatus("Area identified: " + (area.name || routingKey) + " - add full address below");
        }
      })
      .catch(function() {
        update("location", area.name ? "Co. " + area.name : "Ireland");
        setEircodeStatus("Area: " + (area.name || routingKey) + " - add full address below");
      })
      .finally(function() {
        setEircodeLoading(false);
        setTimeout(function() { setEircodeStatus(""); }, 4000);
      });
      return;
    }

    // Try as UK postcode via postcodes.io
    fetch("https://api.postcodes.io/postcodes/" + encodeURIComponent(clean))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.status === 200 && data.result) {
          var r2 = data.result;
          update("yardLat", r2.latitude);
          update("yardLng", r2.longitude);
          var addr = [r2.admin_ward, r2.admin_district, r2.admin_county || r2.region].filter(Boolean).join(", ");
          update("location", addr);
          setEircodeStatus("Address found ✓");
        } else {
          setEircodeStatus("Postcode not found - enter address manually");
        }
      })
      .catch(function() { setEircodeStatus("Lookup failed - enter address manually"); })
      .finally(function() {
        setEircodeLoading(false);
        setTimeout(function() { setEircodeStatus(""); }, 4000);
      });
  }

  function updateContact(idx, key, val) {
    var contacts = (edit.notifyContacts || []).slice();
    contacts[idx] = Object.assign({}, contacts[idx], { [key]: val });
    update("notifyContacts", contacts);
  }

  function addContact() {
    var contacts = (edit.notifyContacts || []).slice();
    contacts.push({ id: "c_" + Date.now(), name: "", role: "Head Lad", phone: "", email: "",
      notifyFor: { late_returns: true, medication_alerts: true, race_day: true, entry_confirmations: true } });
    update("notifyContacts", contacts);
  }

  function removeContact(idx) {
    var contacts = (edit.notifyContacts || []).slice();
    contacts.splice(idx, 1);
    update("notifyContacts", contacts);
  }

  function toggleNotify(contactIdx, notifKey) {
    var contacts = (edit.notifyContacts || []).slice();
    var nf = Object.assign({}, contacts[contactIdx].notifyFor || {});
    nf[notifKey] = !nf[notifKey];
    contacts[contactIdx] = Object.assign({}, contacts[contactIdx], { notifyFor: nf });
    update("notifyContacts", contacts);
  }

  function addMedication() {
    if (!newMed.name || !newMed.costPerUnit) return;
    var meds = (edit.medications || []).slice();
    meds.push({ id: "med_" + Date.now(), name: newMed.name, costPerUnit: parseFloat(newMed.costPerUnit), unit: newMed.unit, color: newMed.color });
    update("medications", meds);
    setNewMed({ name: "", costPerUnit: "", unit: "per day", color: "#1a7a4a" });
    setShowAddMed(false);
  }

  function updateMed(idx, key, val) {
    var meds = (edit.medications || []).slice();
    meds[idx] = Object.assign({}, meds[idx], { [key]: val });
    update("medications", meds);
  }

  function removeMed(idx) {
    var meds = (edit.medications || []).slice();
    meds.splice(idx, 1);
    update("medications", meds);
    setEditMedIdx(null);
  }

  function sendTestNotification() {
    var contacts = (edit.notifyContacts || []).filter(function(c) { return c.phone && c.notifyFor && c.notifyFor.medication_alerts; });
    if (contacts.length === 0) { alert("No contacts with medication alerts enabled. Add a contact with a WhatsApp number first."); return; }
    var msg = "RacePlan Pro Test Notification - " + (edit.yardName || "Your Yard") + ". Medication alert notifications are working correctly.";
    contacts.forEach(function(c) {
      var phone = c.phone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
      window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank");
    });
  }

  var COLOUR_HEX = {
    "white": "#ffffff", "black": "#111111", "red": "#c0392b",
    "dark red": "#8b0000", "light red": "#e57373",
    "blue": "#1e6fb5", "royal blue": "#2e4ebb", "dark blue": "#1a2a6c",
    "light blue": "#5bc8f5", "sky blue": "#87ceeb",
    "navy": "#1a2a6c", "navy blue": "#1a2a6c",
    "pink": "#f06292", "hot pink": "#ff69b4", "light pink": "#ffb3c6",
    "yellow": "#f5c842", "gold": "#c9952a", "amber": "#ffa000",
    "green": "#2e7d32", "emerald": "#2ecc71", "emerald green": "#00a651",
    "dark green": "#1b5e20", "light green": "#81c784", "lime": "#cddc39",
    "orange": "#e67e22", "bright orange": "#ff5722",
    "purple": "#6d3fc0", "mauve": "#d4a5c9", "magenta": "#e040fb", "violet": "#7b1fa2",
    "brown": "#795548", "chocolate": "#5d4037",
    "grey": "#9e9e9e", "gray": "#9e9e9e", "silver": "#bdc3c7",
    "maroon": "#800000", "crimson": "#dc143c", "scarlet": "#ff2400",
    "turquoise": "#1abc9c", "teal": "#009688", "aqua": "#00bcd4",
    "beige": "#f5f0e8", "cream": "#fffde7", "coral": "#ff6b6b",
    "black & white": "#555555"
  };

  function getColourHex(text) {
    if (!text) return "#888888";
    var t = text.toLowerCase().trim();
    var keys = Object.keys(COLOUR_HEX).sort(function(a,b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      if (t.indexOf(keys[i]) >= 0) return COLOUR_HEX[keys[i]];
    }
    return "#888888";
  }

  function parseSilkDesc(desc) {
    if (!desc) return null;
    var full = desc.toLowerCase();
    var parts = desc.split(",").map(function(p) { return p.trim(); });

    // Parse the first part carefully - could be "PINK & WHITE HALVED" or "BLACK & RED STRIPES"
    var bodyPart = parts[0].toLowerCase();
    var body = "#888888"; var secondary = "#888888";

    // Check for two-colour body pattern like "PINK & WHITE HALVED"
    var ampIdx = bodyPart.indexOf(" & ");
    if (ampIdx >= 0) {
      body = getColourHex(bodyPart.slice(0, ampIdx));
      var rest = bodyPart.slice(ampIdx + 3);
      // rest could be "white halved" or "red stripes" - get colour then pattern word
      var restWords = rest.split(" ");
      secondary = getColourHex(restWords[0]);
    } else {
      body = getColourHex(bodyPart);
    }

    var sleeve = "#888888"; var cap = "#888888";
    parts.forEach(function(p) {
      var pl = p.toLowerCase();
      if (pl.indexOf("sleeve") >= 0) sleeve = getColourHex(pl);
      if (pl.indexOf("cap") >= 0) cap = getColourHex(pl);
    });

    // If secondary still not found, look in non-sleeve/cap parts
    if (secondary === "#888888") {
      for (var i = 1; i < parts.length; i++) {
        var p = parts[i].toLowerCase();
        if (p.indexOf("sleeve") < 0 && p.indexOf("cap") < 0 && p.indexOf("armlet") < 0 && p.indexOf("star") < 0) {
          var c = getColourHex(p);
          if (c !== "#888888") { secondary = c; break; }
        }
      }
    }

    // Pattern detection - order matters, check most specific first
    var pattern = "plain";
    if (full.indexOf("halved") >= 0) pattern = "halved";
    else if (full.indexOf("quartered") >= 0) pattern = "quartered";
    else if (full.indexOf("stripe") >= 0) pattern = "stripes";
    else if (full.indexOf("chevron") >= 0) pattern = "chevron";
    else if (full.indexOf("hoop") >= 0) pattern = "hoops";
    else if (full.indexOf("spot") >= 0) pattern = "spots";
    else if (full.indexOf("diamond") >= 0) pattern = "diamond";
    else if (full.indexOf("panel") >= 0) pattern = "panel";
    else if (full.indexOf("epaulett") >= 0) pattern = "epaulettes";
    else if (full.indexOf("brace") >= 0) pattern = "braces";
    else if (full.indexOf("seam") >= 0) pattern = "stripes";
    else if (ampIdx >= 0) pattern = "halved"; // "X & Y" with no named pattern = halved

    return { body: body, secondary: secondary, sleeve: sleeve, cap: cap, pattern: pattern, description: desc };
  }

  function handleSilksCSV(e) {
    var file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      var lines2 = text.split("\n").filter(function(l) { return l.trim(); });
      var results = [];
      for (var i = 1; i < lines2.length; i++) {
        var line = lines2[i].trim();
        if (!line) continue;
        var parts2 = line.split('","');
        var owner = (parts2[0] || "").replace(/"/g, "").trim();
        var desc = (parts2[1] || "").replace(/"/g, "").trim();
        if (!owner) continue;
        var silk = parseSilkDesc(desc);
        if (silk) results.push({ owner: owner, silk: silk, description: desc });
      }
      setSilkPreviews(results);
      // Store in settings
      var silkMap = {};
      results.forEach(function(r) { silkMap[r.owner.toLowerCase().trim()] = r.silk; });
      update("ownerSilks", silkMap);
      update("ownerSilksCount", results.length);
    };
    reader.readAsText(file);
  }

  function applysilksToHorses() {
    // This will be called when trainer confirms - matches horses by owner name
    var silkMap = edit.ownerSilks || {};
    if (Object.keys(silkMap).length === 0) return;
    update("silksApplied", true);
    save();
  }

  function save() {
    var finalEdit = Object.assign({}, edit);
    if (finalEdit.gallopLocationsRaw !== undefined) {
      finalEdit.gallopLocations = finalEdit.gallopLocationsRaw.split("\n").map(function(s) { return s.trim(); }).filter(Boolean);
      delete finalEdit.gallopLocationsRaw;
    }
    setEdit(finalEdit);
    setSettings(finalEdit);
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 3000);
  }

  var TABS = ["yard", "owners", "users", "contacts", "medications", "treatments", "silks", "notifications", "subscription", "privacy"];
  var TAB_LABELS = { yard: "Yard Details", owners: "Owner Contacts", users: "App Users", contacts: "Staff Contacts", medications: "Medications", treatments: "Treatments", silks: "Owner Silks", notifications: "Notifications", subscription: "Subscription", privacy: "Data & Privacy" };
  var ROLES = ["Trainer", "Head Lad", "Assistant Trainer", "Head Girl", "HR", "Secretary", "Owner Manager", "Vet"];
  var NOTIFY_TYPES = [
    { key: "late_returns", label: "Late returns" },
    { key: "medication_alerts", label: "Medication alerts" },
    { key: "race_day", label: "Race day" },
    { key: "entry_confirmations", label: "Entry confirmations" },
    { key: "reminders", label: "Reminders" }
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Yard Settings</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Configure everything for your yard</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {saved && <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>Saved!</span>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Travel cost per km</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select value={edit.currency || "EUR"} onChange={function(e) { update("currency", e.target.value); }}
                  style={{ padding: "8px 10px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                  <option value="EUR">EUR €</option>
                  <option value="GBP">GBP £</option>
                </select>
                <input type="number" step="0.10" min="0" value={edit.costPerKm != null ? edit.costPerKm : 1.5}
                  onChange={function(e) { update("costPerKm", parseFloat(e.target.value) || 0); }}
                  placeholder="1.50"
                  style={{ flex: 1, padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                <span style={{ fontSize: 12, color: C.textMid }}>per km</span>
              </div>
            </div>
          </div>
          <Btn onClick={save}>Save Settings</Btn>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map(function(tab) {
          return (
            <button key={tab} onClick={function() { setActiveTab(tab); }}
              style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (activeTab === tab ? C.navy : C.border),
                background: activeTab === tab ? C.navy : C.card, color: activeTab === tab ? "#fff" : C.textMid,
                fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {TAB_LABELS[tab]}
            </button>
          );
        })}
      </div>

      {activeTab === "yard" && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px" }}>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Gallop Locations</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 10 }}>One location per line. These appear in the Galloping tab.</div>
            <textarea value={edit.gallopLocationsRaw !== undefined ? edit.gallopLocationsRaw : (edit.gallopLocations || []).join("\n")}
              onChange={function(e) { update("gallopLocationsRaw", e.target.value); }}
              onBlur={function(e) { update("gallopLocations", e.target.value.split("\n").map(function(s) { return s.trim(); }).filter(Boolean)); }}
              placeholder={"Home Gallop\nAll-Weather\nGrass Gallop\nHill Gallop"}
              style={{ width: "100%", padding: "10px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, minHeight: 100, resize: "vertical" }} />
          </div>

          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Yard Details</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Yard Address</div>
            <div style={{ position: "relative" }}>
              <input type="text"
                value={edit.addressSearch || edit.location || ""}
                onChange={function(e) {
                  update("addressSearch", e.target.value);
                  handleAddressInput(e.target.value);
                }}
                placeholder="Start typing your address or eircode..."
                autoComplete="off"
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, boxSizing: "border-box" }} />
              {addressSuggestions.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid " + C.border, borderRadius: 8, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", zIndex: 999, maxHeight: 260, overflowY: "auto" }}>
                  {addressSuggestions.map(function(s, i) {
                    return (
                      <div key={i}
                        onClick={function() { selectAddress(s); }}
                        style={{ padding: "11px 14px", cursor: "pointer", borderBottom: i < addressSuggestions.length - 1 ? "1px solid #f0f0f0" : "none", display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ fontSize: 16, marginTop: 1, flexShrink: 0 }}>📍</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{s.main}</div>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{s.secondary}</div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ padding: "8px 14px", fontSize: 10, color: "#aaa", textAlign: "right", borderTop: "1px solid #f0f0f0" }}>Powered by Google</div>
                </div>
              )}
            </div>
            {eircodeStatus && (
              <div style={{ fontSize: 11, marginTop: 4, color: eircodeStatus.indexOf("✓") >= 0 ? C.green : C.amber }}>{eircodeStatus}</div>
            )}
            <div style={{ fontSize: 11, color: C.textMid, marginTop: 4 }}>Type your address or eircode - suggestions will appear</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { key: "yardName", label: "Yard Name", placeholder: "e.g. Closutton Racing" },
              { key: "trainerName", label: "Trainer Name", placeholder: "e.g. Gordon Elliott" },
              { key: "location", label: "Location (auto-filled from eircode)", placeholder: "e.g. Robertstown, Co. Meath" },
              { key: "trainerLicence", label: "Trainer Licence No.", placeholder: "e.g. 12345" },
            ].map(function(field) {
              return (
                <div key={field.key} style={{ gridColumn: field.full ? "1 / -1" : "auto" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                  <input type={field.type || "text"} value={edit[field.key] || ""} onChange={function(e) { update(field.key, e.target.value); }}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
              );
            })}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Discipline</div>
              <select value={edit.discipline || "National Hunt"} onChange={function(e) { update("discipline", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {["National Hunt", "Flat", "Both"].map(function(d) { return <option key={d} value={d}>{d}</option>; })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Weekly Weigh Day</div>
              <select value={edit.weighDay || "Monday"} onChange={function(e) { update("weighDay", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(function(d) { return <option key={d} value={d}>{d}</option>; })}
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === "owners" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Owner Contacts</div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 0, lineHeight: 1.6 }}>
              Add your owners here with their WhatsApp number and email. When you update an owner here it automatically updates across all their horses. WhatsApp and email buttons in the app pull from this list.
            </div>
          </div>

          <OwnerContactsPanel edit={edit} update={update} />
        </div>
      )}

      {activeTab === "users" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>App Users</div>
            <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
              Anyone who needs to log in to RacePlan Pro for your yard creates their own account at the login screen using their email and a password. Share the link below with your staff. Each person logs in with their own credentials - their data is tied to your yard automatically once they sign up with an email you have invited.
            </div>
          </div>

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Share Login Link</div>
            <div style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "12px 16px", fontFamily: "monospace", fontSize: 14, color: C.text, marginBottom: 10, wordBreak: "break-all" }}>
              " + window.location.origin + "
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={function() {
                var link = window.location.origin;
                var done = function() { setLinkCopied(true); setTimeout(function() { setLinkCopied(false); }, 2000); };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                  navigator.clipboard.writeText(link).then(done).catch(function() {
                    var ta = document.createElement("textarea"); ta.value = link; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select();
                    try { document.execCommand("copy"); done(); } catch (e) {}
                    document.body.removeChild(ta);
                  });
                } else {
                  var ta2 = document.createElement("textarea"); ta2.value = link; ta2.style.position = "fixed"; ta2.style.opacity = "0"; document.body.appendChild(ta2); ta2.select();
                  try { document.execCommand("copy"); done(); } catch (e) {}
                  document.body.removeChild(ta2);
                }
              }} style={{ fontSize: 12 }}>{linkCopied ? "Copied!" : "Copy Link"}</Btn>
              <Btn variant="ghost" onClick={function() {
                window.open("https://wa.me/?text=" + encodeURIComponent("You have been invited to RacePlan Pro. Sign up here: " + window.location.origin), "_blank");
              }} style={{ fontSize: 12 }}>Share via WhatsApp</Btn>
            </div>
          </div>

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Invited Users</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Track who has been given access to the yard app</div>
              </div>
              <Btn onClick={function() { update("showInviteForm", !edit.showInviteForm); }} style={{ fontSize: 12, padding: "8px 16px" }}>
                {edit.showInviteForm ? "Cancel" : "+ Add User"}
              </Btn>
            </div>

            {edit.showInviteForm && (
              <div style={{ background: C.cardOff, border: "1.5px dashed " + C.navy, borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Name</div>
                    <input type="text" value={(edit.newUserName || "")} onChange={function(e) { update("newUserName", e.target.value); }}
                      placeholder="e.g. Sean Murphy"
                      style={{ width: "100%", padding: "9px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Email</div>
                    <input type="email" value={(edit.newUserEmail || "")} onChange={function(e) { update("newUserEmail", e.target.value); }}
                      placeholder="sean@example.com"
                      style={{ width: "100%", padding: "9px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Role</div>
                    <select value={(edit.newUserRole || "Staff")} onChange={function(e) { update("newUserRole", e.target.value); }}
                      style={{ width: "100%", padding: "9px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                      {["Trainer", "Head Lad", "Head Girl", "Assistant Trainer", "Secretary", "Staff", "Vet", "Owner"].map(function(r) { return <option key={r} value={r}>{r}</option>; })}
                    </select>
                  </div>
                </div>
                <Btn onClick={function() {
                  if (!edit.newUserEmail || !edit.newUserName) return;
                  var users2 = (edit.yardUsers || []).slice();
                  users2.push({ id: "u_" + Date.now(), name: edit.newUserName, email: edit.newUserEmail, role: edit.newUserRole || "Staff", addedAt: new Date().toISOString() });
                  update("yardUsers", users2);
                  update("newUserName", ""); update("newUserEmail", ""); update("showInviteForm", false);
                  if (supabase && user) {
                    supabase.from("yard_members").upsert({
                      yard_owner_id: user.id, member_email: edit.newUserEmail, role: edit.newUserRole || "Staff"
                    }, { onConflict: "yard_owner_id,member_email" }).then(function(r) {
                      if (r.error) console.error("Member invite error:", r.error.message);
                    });
                  }
                  // Send WhatsApp invite
                  window.open("https://wa.me/?text=" + encodeURIComponent("Hi " + edit.newUserName + ", you have been invited to join RacePlan Pro for our yard. Sign up at: " + window.location.origin + "\nUse this email: " + edit.newUserEmail + "\nYour role: " + (edit.newUserRole || "Staff")), "_blank");
                }} disabled={!edit.newUserEmail || !edit.newUserName} style={{ fontSize: 12 }}>
                  Add & Send WhatsApp Invite
                </Btn>
              </div>
            )}

            {(edit.yardUsers || []).length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: C.textMid, fontSize: 13 }}>
                No users added yet. Add users above and send them a WhatsApp invite with the login link.
              </div>
            ) : (
              (edit.yardUsers || []).map(function(u, idx) {
                return (
                  <div key={u.id || idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid " + C.border }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                      {(u.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{u.name}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{u.email + "  - " + (u.role || "Staff")}</div>
                    </div>
                    <button onClick={function() {
                      var users2 = (edit.yardUsers || []).filter(function(x) { return x.id !== u.id; });
                      update("yardUsers", users2);
                      if (supabase && user && u.email) { supabase.from("yard_members").delete().eq("yard_owner_id", user.id).eq("member_email", u.email).then(function() {}); }
                    }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Remove</button>
                  </div>
                );
              })
            )}
          </div>

          <div style={{ background: C.amberBg, border: "1px solid " + C.amber + "40", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: C.amber, lineHeight: 1.7 }}>
            <strong>Note:</strong> Each user signs up with their own email and password at the login screen. Full role-based access control (restricting what each person can see) is coming in a future update. For now, all yard users have full access.
          </div>
        </div>
      )}

      {activeTab === "contacts" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Notification Contacts</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>These people receive WhatsApp alerts. Each person can be configured for different alert types.</div>
              </div>
              <Btn onClick={addContact} style={{ fontSize: 12, padding: "8px 16px" }}>+ Add Contact</Btn>
            </div>
          </div>

          {(edit.notifyContacts || []).length === 0 && (
            <div style={{ padding: 32, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📱</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No contacts yet</div>
              <div style={{ fontSize: 13, marginBottom: 16 }}>Add your Head Lad, trainer, HR or anyone who needs alerts</div>
              <Btn onClick={addContact}>Add First Contact</Btn>
            </div>
          )}

          {(edit.notifyContacts || []).map(function(contact, idx) {
            return (
              <div key={contact.id || idx} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>
                      {(contact.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{contact.name || "New Contact"}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{contact.role}</div>
                    </div>
                  </div>
                  <button onClick={function() { removeContact(idx); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Remove</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Name</div>
                    <input type="text" value={contact.name || ""} onChange={function(e) { updateContact(idx, "name", e.target.value); }}
                      placeholder="e.g. Tommy Walsh"
                      style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Role</div>
                    <select value={contact.role || "Head Lad"} onChange={function(e) { updateContact(idx, "role", e.target.value); }}
                      style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                      {ROLES.map(function(r) { return <option key={r} value={r}>{r}</option>; })}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>WhatsApp Number</div>
                    <input type="tel" value={contact.phone || ""} onChange={function(e) { updateContact(idx, "phone", e.target.value); }}
                      placeholder="+353 86 000 0000"
                      style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Email (optional)</div>
                    <input type="email" value={contact.email || ""} onChange={function(e) { updateContact(idx, "email", e.target.value); }}
                      placeholder="name@email.com"
                      style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Alert Types</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {NOTIFY_TYPES.map(function(nt) {
                    var active = (contact.notifyFor || {})[nt.key] !== false;
                    return (
                      <button key={nt.key} onClick={function() { toggleNotify(idx, nt.key); }}
                        style={{ padding: "5px 14px", borderRadius: 20, border: "1.5px solid " + (active ? C.green : C.border),
                          background: active ? C.green + "12" : "transparent", color: active ? C.green : C.textMid,
                          fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        {active ? "✓ " : ""}{nt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "medications" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>Medication Costs</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>Set your actual costs - used in monthly billing reports</div>
              </div>
              <Btn onClick={function() { setShowAddMed(true); }} style={{ fontSize: 12, padding: "8px 16px" }}>+ Add</Btn>
            </div>
          </div>

          {(edit.medications || []).map(function(med, idx) {
            var isEditing = editMedIdx === idx;
            return (
              <div key={med.id || idx} style={{ background: C.card, border: "1px solid " + (isEditing ? C.navy : C.border), borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
                {!isEditing ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: med.color + "20", border: "2px solid " + med.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💊</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{med.name}</div>
                      <div style={{ fontSize: 13, color: C.textMid }}>{"EUR" + med.costPerUnit + " " + med.unit}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn variant="ghost" onClick={function() { setEditMedIdx(idx); }} style={{ fontSize: 12, padding: "6px 14px" }}>Edit</Btn>
                      <Btn variant="ghost" onClick={function() { removeMed(idx); }} style={{ fontSize: 12, padding: "6px 14px", color: C.red }}>Remove</Btn>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div style={{ gridColumn: "1 / 2" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Name</div>
                        <input type="text" value={med.name} onChange={function(e) { updateMed(idx, "name", e.target.value); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Cost/day (EUR)</div>
                        <input type="number" value={med.costPerUnit} onChange={function(e) { updateMed(idx, "costPerUnit", parseFloat(e.target.value)); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Course (days)</div>
                        <input type="number" value={med.courseDays || 12} onChange={function(e) { updateMed(idx, "courseDays", parseInt(e.target.value)); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Withdrawal (days)</div>
                        <input type="number" value={med.withdrawalDays || 0} onChange={function(e) { updateMed(idx, "withdrawalDays", parseInt(e.target.value)); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Max doses/day</div>
                        <select value={med.maxDoses || 1} onChange={function(e) { updateMed(idx, "maxDoses", parseInt(e.target.value)); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                          {[1,2,3,4].map(function(n) { return <option key={n} value={n}>{n + " dose" + (n > 1 ? "s" : "")}</option>; })}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Unit</div>
                        <select value={med.unit} onChange={function(e) { updateMed(idx, "unit", e.target.value); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                          {["per day", "per dose", "per bottle", "per course", "per injection"].map(function(u) { return <option key={u} value={u}>{u}</option>; })}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn onClick={function() { setEditMedIdx(null); save(); }} style={{ fontSize: 12 }}>Save</Btn>
                      <Btn variant="ghost" onClick={function() { setEditMedIdx(null); }} style={{ fontSize: 12 }}>Cancel</Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {showAddMed && (
            <div style={{ background: C.cardOff, border: "1.5px dashed " + C.navy, borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Add Medication</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ gridColumn: "1 / 2" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Name</div>
                  <input type="text" value={newMed.name} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }}
                    placeholder="e.g. Omeprazole"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Cost/day</div>
                  <input type="number" value={newMed.costPerUnit} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { costPerUnit: e.target.value }); }); }}
                    placeholder="0.00"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Course (days)</div>
                  <input type="number" value={newMed.courseDays || ""} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { courseDays: parseInt(e.target.value) }); }); }}
                    placeholder="12"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Withdrawal (days)</div>
                  <input type="number" value={newMed.withdrawalDays || ""} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { withdrawalDays: parseInt(e.target.value) }); }); }}
                    placeholder="4"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Max doses/day</div>
                  <select value={newMed.maxDoses || 1} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { maxDoses: parseInt(e.target.value) }); }); }}
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                    {[1,2,3,4].map(function(n) { return <option key={n} value={n}>{n + " dose" + (n > 1 ? "s" : "")}</option>; })}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Unit</div>
                  <select value={newMed.unit} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { unit: e.target.value }); }); }}
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                    {["per day", "per dose", "per bottle", "per course", "per injection"].map(function(u) { return <option key={u} value={u}>{u}</option>; })}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={addMedication} disabled={!newMed.name || !newMed.costPerUnit}>Add Medication</Btn>
                <Btn variant="ghost" onClick={function() { setShowAddMed(false); }}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "treatments" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Treatment Withdrawal Periods</div>
            <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
              When a horse receives a treatment, log it in My Yard on the horse profile. The app will automatically block entries and flag the horse in Race Planner until the withdrawal period has passed. Treatment withdrawals take priority over medication withdrawals.
            </div>
          </div>

          <div style={{ background: C.amberBg, border: "1px solid " + C.amber + "40", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 12, color: C.amber, lineHeight: 1.7 }}>
            <strong>Important:</strong> These withdrawal periods are guidelines. Always confirm with your vet. BHA/HRI rules on specific treatments may vary. The app will flag the earliest possible entry date based on the treatment date you log.
          </div>

          {(edit.treatments || []).map(function(t, idx) {
            return (
              <div key={t.id || idx} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr auto", gap: 10, alignItems: "end" }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Treatment Name</div>
                    <input type="text" value={t.name} onChange={function(e) { var v = e.target.value; var ts = (edit.treatments || []).slice(); ts[idx] = Object.assign({}, ts[idx], { name: v }); update("treatments", ts); }}
                      style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Days Off</div>
                    <input type="number" value={t.withdrawalDays} onChange={function(e) { var v = parseInt(e.target.value); var ts = (edit.treatments || []).slice(); ts[idx] = Object.assign({}, ts[idx], { withdrawalDays: v }); update("treatments", ts); }}
                      style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Notes</div>
                    <input type="text" value={t.notes || ""} onChange={function(e) { var v = e.target.value; var ts = (edit.treatments || []).slice(); ts[idx] = Object.assign({}, ts[idx], { notes: v }); update("treatments", ts); }}
                      style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <button onClick={function() { var ts = (edit.treatments || []).filter(function(_, j) { return j !== idx; }); update("treatments", ts); }}
                    style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18, padding: "8px" }}>×</button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: t.color || C.red }} />
                  <span style={{ fontSize: 11, color: C.textMid }}>{t.withdrawalDays + " day withdrawal - earliest race date is " + t.withdrawalDays + " days after treatment"}</span>
                </div>
              </div>
            );
          })}

          <div style={{ background: C.cardOff, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Add Treatment Type</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Name</div>
                <input type="text" value={edit.newTreatName || ""} onChange={function(e) { update("newTreatName", e.target.value); }}
                  placeholder="e.g. Hock Injection"
                  style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Days</div>
                <input type="number" value={edit.newTreatDays || ""} onChange={function(e) { update("newTreatDays", e.target.value); }}
                  placeholder="30"
                  style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Notes</div>
                <input type="text" value={edit.newTreatNotes || ""} onChange={function(e) { update("newTreatNotes", e.target.value); }}
                  placeholder="e.g. Corticosteroid"
                  style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
              </div>
            </div>
            <Btn onClick={function() {
              if (!edit.newTreatName || !edit.newTreatDays) return;
              var ts = (edit.treatments || []).slice();
              ts.push({ id: "t_" + Date.now(), name: edit.newTreatName, withdrawalDays: parseInt(edit.newTreatDays), notes: edit.newTreatNotes || "", color: C.red });
              update("treatments", ts);
              update("newTreatName", ""); update("newTreatDays", ""); update("newTreatNotes", "");
            }} disabled={!edit.newTreatName || !edit.newTreatDays} style={{ fontSize: 12 }}>
              Add Treatment
            </Btn>
          </div>

          <Btn onClick={save} style={{ width: "100%" }}>Save Treatment Settings</Btn>
        </div>
      )}

      {activeTab === "silks" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Owner Racing Colours</div>
            <div style={{ fontSize: 12, color: C.textMid, lineHeight: 1.7, marginBottom: 14 }}>
              Upload your HRI Authority to Act CSV (the file listing owner names and their racing colour descriptions). The app will parse each description and generate the correct silk colours for every horse in your yard, matched by owner name.
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <label style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid " + C.navy, background: C.navy, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
                Upload Authority to Act CSV
                <input type="file" accept=".csv,.txt" onChange={handleSilksCSV} style={{ display: "none" }} />
              </label>
              {edit.ownerSilksCount > 0 && (
                <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>{edit.ownerSilksCount + " owner silks loaded"}</span>
              )}
            </div>
          </div>

          {silkPreviews.length > 0 && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{silkPreviews.length + " silks parsed - preview below"}</div>
                <Btn onClick={applysilksToHorses} style={{ fontSize: 12 }}>Apply to Yard & Save</Btn>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {silkPreviews.slice(0, 30).map(function(item, idx) {
                  return (
                    <div key={idx} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                      <SilkPreview silk={item.silk} size={36} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.owner}</div>
                        <div style={{ fontSize: 10, color: C.textDim, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.description.substring(0,40)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {silkPreviews.length > 30 && (
                <div style={{ fontSize: 12, color: C.textMid, textAlign: "center", marginTop: 10 }}>{"+ " + (silkPreviews.length - 30) + " more owners"}</div>
              )}
            </div>
          )}

          {edit.ownerSilks && Object.keys(edit.ownerSilks).length > 0 && silkPreviews.length === 0 && (
            <div style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: C.textMid }}>
              {Object.keys(edit.ownerSilks).length + " owner silks saved. These are applied to horses when you save settings. Upload a new CSV to update."}
            </div>
          )}

          <div style={{ background: C.amberBg, border: "1px solid " + C.amber + "40", borderRadius: 10, padding: "12px 14px", marginTop: 14, fontSize: 12, color: C.amber, lineHeight: 1.6 }}>
            <strong>How matching works:</strong> When you click Apply, each horse in your yard is matched to an owner silk by their owner name. If the owner name on the horse matches an owner in this CSV, their silk is applied. Names are matched case-insensitively.
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Medication Alert - Daily 10am</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 14, lineHeight: 1.6 }}>
              Every morning at 10am (2 hours before the 12pm entry deadline), contacts with "Medication alerts" enabled will receive a WhatsApp listing every horse whose Peptizole course ends today. This gives you time to act on entries before the deadline.
            </div>
            <div style={{ background: C.amberBg, border: "1px solid " + C.amber + "40", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.amber, marginBottom: 4 }}>Example message sent at 10am:</div>
              <div style={{ fontSize: 12, color: C.text, fontFamily: "monospace", lineHeight: 1.8 }}>
                {"RacePlan Pro - Medication Alert"}<br/>
                {"Horses finishing Peptizole today:"}<br/>
                {"• Bob Olinger (last day - check entries)"}<br/>
                {"• Galopin Des Champs (last day)"}<br/>
                {"Entry deadline: 12:00 today"}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Alert Time</div>
                <input type="time" value={edit.notifyTime || "10:00"} onChange={function(e) { update("notifyTime", e.target.value); }}
                  style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                <Btn onClick={sendTestNotification} variant="ghost" style={{ fontSize: 12 }}>Send Test Message</Btn>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "notifyMedEnding", label: "Peptizole ending today", desc: "Alert when a horse finishes their course on a race entry day" },
                { key: "notifyRaceDay", label: "Race day reminders", desc: "Morning alert listing horses running today" },
                { key: "notifyEntries", label: "Entry deadline reminders", desc: "Alert 2 hours before entry closes each day" },
              ].map(function(item) {
                return (
                  <div key={item.key} onClick={function() { update(item.key, !edit[item.key]); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: C.cardOff, borderRadius: 10, cursor: "pointer", border: "1.5px solid " + (edit[item.key] ? C.green : C.border) }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: edit[item.key] ? C.green : "transparent", border: "2px solid " + (edit[item.key] ? C.green : C.border), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {edit[item.key] && <span style={{ color: "#fff", fontSize: 14, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "privacy" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Your Data</div>
            <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 12 }}>
              RacePlan Pro stores your yard details, horses, medication records, owner contacts and related data so the app works for you. We never sell your data or use it for advertising. You can export or delete your data at any time.
            </div>
            <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6 }}>
              Your data is stored securely and never sold. You can request deletion at any time by contacting hello@raceplanpro.com.
            </div>
          </div>

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Medicines Register PIN</div>
            <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 12 }}>
              Set a 4-digit PIN to protect the Medicines Register. Only people with the PIN can open it. Leave blank for no PIN. Access is already limited to Trainer, Secretary and Head Lad roles.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input type="text" inputMode="numeric" maxLength={4} value={edit.registerPin || ""}
                onChange={function(e) { var v = e.target.value.replace(/[^0-9]/g, ""); update("registerPin", v); }}
                placeholder="0000"
                style={{ width: 120, padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 20, letterSpacing: 6, textAlign: "center", color: C.text }} />
              <button onClick={save} style={{ background: C.navy, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Save PIN
              </button>
              {(edit.registerPin || "").length === 4 && (
                <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>PIN active - Med Register and Prescriptions are locked</span>
              )}
              {(edit.registerPin || "").length > 0 && (edit.registerPin || "").length < 4 && (
                <span style={{ fontSize: 12, color: C.amber }}>Enter all 4 digits</span>
              )}
            </div>
          </div>

          <div style={{ background: C.card, border: "1.5px solid " + C.red + "40", borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.red, marginBottom: 8 }}>Delete All Yard Data</div>
            <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, marginBottom: 14 }}>
              This permanently deletes all of your horses, medication logs, weights, whiteboard entries, reminders, trotters, checklists, owner contacts and yard settings. This cannot be undone. Use this if you are leaving RacePlan Pro and want your data erased.
            </div>
            {delDone ? (
              <div style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Your yard data has been deleted. You can now log out.</div>
            ) : (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase" }}>Type DELETE to confirm</div>
                <input type="text" value={delConfirm} onChange={function(e) { setDelConfirm(e.target.value); }}
                  placeholder="DELETE"
                  style={{ width: "100%", maxWidth: 220, padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text, marginBottom: 12 }} />
                <div>
                  <button onClick={deleteAllYardData} disabled={delConfirm !== "DELETE" || delBusy}
                    style={{ background: delConfirm === "DELETE" ? C.red : C.border, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontSize: 14, fontWeight: 700, cursor: delConfirm === "DELETE" ? "pointer" : "not-allowed" }}>
                    {delBusy ? "Deleting..." : "Permanently Delete All Data"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "subscription" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 16, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 4, textTransform: "uppercase", fontWeight: 700 }}>Current Plan</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.navy, marginBottom: 2 }}>{edit.tier || "Basic"}</div>
            <div style={{ fontSize: 13, color: C.textMid }}>Free beta access</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[
              { name: "Basic", tagline: "Up to 40 horses", link: "https://buy.stripe.com/8x2dRbceJ0RyaZSgEg0oM01", features: ["My Yard and horse profiles", "Medication tracker", "Whiteboard and runners", "Owner WhatsApp comms", "Race Day checklist", "AI Race Planner", "Weights tracker"] },
              { name: "Professional", tagline: "Up to 80 horses", link: "https://buy.stripe.com/cNidRbdiN0Ry7NG73G0oM02", features: ["Everything in Basic", "Medicines Register (Rule 148)", "Vet Prescriptions store", "Galloping and Trotters logs", "IHRB horse sheets", "Reports and PDF exports", "Priority support"] },
              { name: "Platinum", tagline: "Unlimited horses", link: "https://buy.stripe.com/bJe8wRemRbwc1pi2Nq0oM03", features: ["Everything in Professional", "Supplier Invoice Portal", "Unlimited staff logins", "AI Yard Assistant", "Travel cost calculator", "Full data export", "Dedicated onboarding"] },
            ].map(function(tier) {
              var isCurrent = (edit.tier || "Starter") === tier.name;
              return (
                <div key={tier.name} style={{ background: isCurrent ? C.navy : C.card, border: "2px solid " + (isCurrent ? C.gold : C.border), borderRadius: 14, padding: "18px 16px", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: isCurrent ? C.gold : C.navy, marginBottom: 2, textAlign: "center" }}>{tier.name}</div>
                  <div style={{ fontSize: 12, color: isCurrent ? "rgba(255,255,255,0.6)" : C.textMid, marginBottom: 14, textAlign: "center", fontWeight: 600 }}>{tier.tagline}</div>
                  <div style={{ flex: 1, marginBottom: 14 }}>
                    {tier.features.map(function(f, fi) {
                      return (
                        <div key={fi} style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 7, fontSize: 12, color: isCurrent ? "rgba(255,255,255,0.85)" : C.text, lineHeight: 1.4 }}>
                          <span style={{ color: isCurrent ? C.gold : C.green, fontWeight: 900, flexShrink: 0 }}>{"\u2713"}</span>
                          {f}
                        </div>
                      );
                    })}
                  </div>
                  {isCurrent ? (
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, textAlign: "center", padding: "8px" }}>Current Plan</div>
                  ) : (
                    <a href={tier.link} target="_blank" rel="noreferrer"
                      style={{ display: "block", background: C.gold, color: C.navy, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 900, textDecoration: "none", textAlign: "center" }}>
                      {"Upgrade to " + tier.name}
                    </a>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", fontSize: 13, color: C.textMid, textAlign: "center" }}>
            Pricing is shown at checkout. To cancel or change your plan email <strong>support@raceplanpro.com</strong> with 30 days notice.
          </div>
        </div>
      )}

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={save} style={{ padding: "12px 32px" }}>Save All Settings</Btn>
      </div>
    </div>
  );
}

export default YardSettings;
