import React, { useState } from "react";
import { Btn, C } from "./shared";

var STRIPE_LINKS = {
  Basic: "https://buy.stripe.com/basic_raceplanpro",
  Professional: "https://buy.stripe.com/pro_raceplanpro",
  Gold: "https://buy.stripe.com/gold_raceplanpro"
};

var PLAN_FEATURES = {
  Basic: {
    price: "99",
    color: C ? C.blue : "#1e6fb5",
    features: [
      "Up to 50 horses",
      "My Yard — CSV import",
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
      "Passport scan — auto-fill horse details",
      "Multi-yard management",
      "Custom branding",
      "Dedicated account manager",
      "Phone support"
    ],
    limits: []
  }
};

function YardSettings({ settings, setSettings }) {
  var now = new Date();
  var editState = useState(Object.assign({
    yardName: "", trainerName: "", location: "", trainerLicence: "",
    discipline: "National Hunt", weighDay: "Monday",
    notifyContacts: [],
    medications: [
      { id: "pep", name: "Peptizole", costPerUnit: 18, unit: "per day", color: "#1e6fb5" },
      { id: "ant", name: "Antepsin", costPerUnit: 25, unit: "per bottle (4 days)", color: "#6d3fc0" },
      { id: "ab", name: "Antibiotics", costPerUnit: 15, unit: "per dose", color: "#d97706" }
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

  function save() {
    setSettings(edit);
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 3000);
  }

  var TABS = ["yard", "contacts", "medications", "notifications", "subscription"];
  var TAB_LABELS = { yard: "Yard Details", contacts: "Contacts", medications: "Medications", notifications: "Notifications", subscription: "Subscription" };
  var ROLES = ["Trainer", "Head Lad", "Assistant Trainer", "Head Girl", "HR", "Secretary", "Owner Manager", "Vet"];
  var NOTIFY_TYPES = [
    { key: "late_returns", label: "Late returns" },
    { key: "medication_alerts", label: "Medication alerts" },
    { key: "race_day", label: "Race day" },
    { key: "entry_confirmations", label: "Entry confirmations" }
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
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Yard Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { key: "yardName", label: "Yard Name", placeholder: "e.g. Closutton Racing" },
              { key: "trainerName", label: "Trainer Name", placeholder: "e.g. Gordon Elliott" },
              { key: "location", label: "Location", placeholder: "e.g. Robertstown, Co. Meath" },
              { key: "trainerLicence", label: "Trainer Licence No.", placeholder: "e.g. 12345" },
              { key: "anthropicKey", label: "Anthropic API Key (for AI features)", placeholder: "sk-ant-...", type: "password", full: true },
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
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>Set your actual costs — used in monthly billing reports</div>
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Name</div>
                        <input type="text" value={med.name} onChange={function(e) { updateMed(idx, "name", e.target.value); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Cost (EUR)</div>
                        <input type="number" value={med.costPerUnit} onChange={function(e) { updateMed(idx, "costPerUnit", parseFloat(e.target.value)); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Unit</div>
                        <select value={med.unit} onChange={function(e) { updateMed(idx, "unit", e.target.value); }}
                          style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                          {["per day", "per dose", "per bottle (4 days)", "per course", "per injection"].map(function(u) { return <option key={u} value={u}>{u}</option>; })}
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Name</div>
                  <input type="text" value={newMed.name} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { name: e.target.value }); }); }}
                    placeholder="e.g. Omeprazole"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Cost (EUR)</div>
                  <input type="number" value={newMed.costPerUnit} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { costPerUnit: e.target.value }); }); }}
                    placeholder="0.00"
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Unit</div>
                  <select value={newMed.unit} onChange={function(e) { setNewMed(function(p) { return Object.assign({}, p, { unit: e.target.value }); }); }}
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                    {["per day", "per dose", "per bottle (4 days)", "per course", "per injection"].map(function(u) { return <option key={u} value={u}>{u}</option>; })}
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

      {activeTab === "notifications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Medication Alert — Daily 10am</div>
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

      {activeTab === "subscription" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Your Plan</div>
            <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>Current plan: <strong>{edit.tier || "Professional"}</strong>. Changes take effect immediately.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              {Object.keys(PLAN_FEATURES).map(function(planName) {
                var plan = PLAN_FEATURES[planName];
                var isActive = (edit.tier || "Professional") === planName;
                return (
                  <div key={planName} style={{ borderRadius: 14, border: "2px solid " + (isActive ? plan.color : C.border),
                    background: isActive ? plan.color + "08" : C.cardOff, overflow: "hidden" }}>
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid " + (isActive ? plan.color + "30" : C.border), background: isActive ? plan.color + "12" : "transparent" }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: isActive ? plan.color : C.text }}>{planName}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: C.navy, marginTop: 4 }}>
                        {"EUR" + plan.price}
                        <span style={{ fontSize: 12, color: C.textMid, fontWeight: 400 }}>/mo</span>
                      </div>
                      {isActive && <div style={{ fontSize: 11, fontWeight: 700, color: plan.color, marginTop: 4 }}>Current Plan</div>}
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      {plan.features.map(function(f) {
                        return <div key={f} style={{ fontSize: 11, color: C.text, marginBottom: 5, display: "flex", gap: 6 }}><span style={{ color: C.green }}>✓</span>{f}</div>;
                      })}
                      {plan.limits.map(function(f) {
                        return <div key={f} style={{ fontSize: 11, color: C.textDim, marginBottom: 5, display: "flex", gap: 6 }}><span>✗</span>{f}</div>;
                      })}
                      <div style={{ marginTop: 14 }}>
                        {isActive ? (
                          <div style={{ padding: "10px", background: plan.color + "15", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 700, color: plan.color }}>Active</div>
                        ) : (
                          <a href={STRIPE_LINKS[planName]} target="_blank" rel="noreferrer"
                            style={{ display: "block", padding: "10px", background: plan.color, color: "#fff", borderRadius: 8, textAlign: "center", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                            {(edit.tier === "Gold" && planName !== "Gold") || (edit.tier === "Professional" && planName === "Basic") ? "Downgrade" : "Upgrade"} to {planName}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "14px 16px", fontSize: 12, color: C.textMid, lineHeight: 1.6 }}>
            Payments handled securely by Stripe. Cancel anytime. For billing queries contact support@raceplanpro.com
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
