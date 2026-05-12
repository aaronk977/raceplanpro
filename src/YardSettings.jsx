import React, { useState } from "react";
import { Btn, C } from "./shared";

function YardSettings({ settings, setSettings }) {
  var editState = useState(Object.assign({}, settings));
  var edit = editState[0]; var setEdit = editState[1];
  var savedState = useState(false);
  var saved = savedState[0]; var setSaved = savedState[1];

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
    contacts.push({ name: "", role: "Head Lad", phone: "", email: "" });
    update("notifyContacts", contacts);
  }

  function removeContact(idx) {
    var contacts = (edit.notifyContacts || []).slice();
    contacts.splice(idx, 1);
    update("notifyContacts", contacts);
  }

  function save() {
    setSettings(edit);
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 3000);
  }

  var ROLES = ["Trainer", "Head Lad", "Assistant Trainer", "HR", "Secretary", "Owner Manager"];
  var WEIGH_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var DISCIPLINES = ["Flat", "National Hunt", "Both"];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Yard Settings</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Configure your yard — all settings save to your account</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {saved && <span style={{ fontSize: 13, color: C.green, fontWeight: 700 }}>Saved!</span>}
          <Btn onClick={save}>Save Settings</Btn>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Yard Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { key: "yardName", label: "Yard Name", placeholder: "e.g. Closutton Racing" },
              { key: "trainerName", label: "Trainer Name", placeholder: "e.g. Gordon Elliott" },
              { key: "location", label: "Location", placeholder: "e.g. Robertstown, Co. Meath" },
              { key: "trainerLicence", label: "Trainer Licence No.", placeholder: "e.g. 12345" },
            ].map(function(field) {
              return (
                <div key={field.key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                  <input type="text" value={edit[field.key] || ""} onChange={function(e) { update(field.key, e.target.value); }}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
              );
            })}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Discipline</div>
              <select value={edit.discipline || "National Hunt"} onChange={function(e) { update("discipline", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {DISCIPLINES.map(function(d) { return <option key={d} value={d}>{d}</option>; })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Weekly Weigh Day</div>
              <select value={edit.weighDay || "Monday"} onChange={function(e) { update("weighDay", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {WEIGH_DAYS.map(function(d) { return <option key={d} value={d}>{d}</option>; })}
              </select>
            </div>
          </div>
        </div>

        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Notification Contacts</div>
          <div style={{ fontSize: 12, color: C.textMid, marginBottom: 14 }}>
            These people receive WhatsApp alerts for staff late returns, medication reminders, and race day notifications.
          </div>

          {(edit.notifyContacts || []).map(function(contact, idx) {
            return (
              <div key={idx} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{"Contact " + (idx + 1)}</span>
                  <button onClick={function() { removeContact(idx); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Remove</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Name</div>
                    <input type="text" value={contact.name || ""} onChange={function(e) { updateContact(idx, "name", e.target.value); }}
                      placeholder="e.g. Tommy Walsh"
                      style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Role</div>
                    <select value={contact.role || "Head Lad"} onChange={function(e) { updateContact(idx, "role", e.target.value); }}
                      style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                      {ROLES.map(function(r) { return <option key={r} value={r}>{r}</option>; })}
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>WhatsApp Number</div>
                    <input type="tel" value={contact.phone || ""} onChange={function(e) { updateContact(idx, "phone", e.target.value); }}
                      placeholder="+353 86 000 0000"
                      style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>Email (optional)</div>
                    <input type="email" value={contact.email || ""} onChange={function(e) { updateContact(idx, "email", e.target.value); }}
                      placeholder="email@example.com"
                      style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Notify for</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Late returns", "Medication alerts", "Race day", "Entry confirmations"].map(function(notifType) {
                      var notifKey = notifType.toLowerCase().replace(/ /g, "_");
                      var active = (contact.notifyFor || {})[notifKey] !== false;
                      return (
                        <button key={notifType} onClick={function() {
                          var nf = Object.assign({}, contact.notifyFor || {});
                          nf[notifKey] = !active;
                          updateContact(idx, "notifyFor", nf);
                        }} style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid " + (active ? C.green : C.border),
                          background: active ? C.green + "12" : "transparent", color: active ? C.green : C.textMid,
                          fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          {active ? "✓ " : ""}{notifType}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <Btn variant="ghost" onClick={addContact} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>+ Add Contact</Btn>
        </div>

        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Medication Costs</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { key: "costPeptizole", label: "Peptizole per day (EUR)", placeholder: "18" },
              { key: "costAntepsin", label: "Antepsin per bottle (EUR)", placeholder: "25" },
              { key: "costAntibiotics", label: "Antibiotics per dose (EUR)", placeholder: "15" },
            ].map(function(field) {
              return (
                <div key={field.key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                  <input type="number" value={edit[field.key] || ""} onChange={function(e) { update(field.key, e.target.value); }}
                    placeholder={field.placeholder}
                    style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Anthropic API Key</div>
          <div style={{ fontSize: 12, color: C.textMid, marginBottom: 10 }}>
            Used for race analysis and race conditions parsing. Get yours at console.anthropic.com
          </div>
          <input type="password" value={edit.anthropicKey || ""} onChange={function(e) { update("anthropicKey", e.target.value); }}
            placeholder="sk-ant-..."
            style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, fontFamily: "monospace" }} />
          <div style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>Stored securely in your browser. Never sent to our servers.</div>
        </div>

        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Subscription</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { tier: "Basic", price: "99", features: ["Up to 50 horses", "Race Planner", "Whiteboard", "Medications"] },
              { tier: "Professional", price: "169", features: ["Up to 150 horses", "All Basic features", "AI Analysis", "Owner Portal", "Content Scheduler"] },
              { tier: "Gold", price: "249", features: ["Unlimited horses", "All Pro features", "Priority support", "Custom integrations", "Twilio WhatsApp"] },
            ].map(function(plan) {
              var active = (edit.tier || "Professional") === plan.tier;
              return (
                <div key={plan.tier} onClick={function() { update("tier", plan.tier); }}
                  style={{ borderRadius: 12, padding: "16px", border: "2px solid " + (active ? C.gold : C.border),
                    background: active ? C.goldBg : C.cardOff, cursor: "pointer" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: active ? C.gold : C.text, marginBottom: 4 }}>{plan.tier}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.navy, marginBottom: 10 }}>{"EUR" + plan.price}<span style={{ fontSize: 11, color: C.textMid, fontWeight: 400 }}>/mo</span></div>
                  {plan.features.map(function(f) {
                    return <div key={f} style={{ fontSize: 11, color: C.textMid, marginBottom: 3 }}>{"✓ " + f}</div>;
                  })}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={save} style={{ padding: "12px 32px" }}>Save All Settings</Btn>
      </div>
    </div>
  );
}

export default YardSettings;
