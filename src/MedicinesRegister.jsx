import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";
import { DETECTION_TIMES, ROUTES } from "./detectionTimes";

// Rule 148 compliant Medicines Register
function MedicinesRegister({ horses, user, supabase, settings }) {
  var entriesState = useState([]);
  var entries = entriesState[0]; var setEntries = entriesState[1];
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var savingState = useState(false);
  var saving = savingState[0]; var setSaving = savingState[1];
  var showDetectionState = useState(false);
  var showDetection = showDetectionState[0]; var setShowDetection = showDetectionState[1];
  var detSearchState = useState("");
  var detSearch = detSearchState[0]; var setDetSearch = detSearchState[1];
  var fromState = useState("");
  var fromDate = fromState[0]; var setFromDate = fromState[1];
  var toStateV = useState("");
  var toDate = toStateV[0]; var setToDate = toStateV[1];

  var blank = {
    horseId: "", date: new Date().toISOString().slice(0, 10),
    drugBrand: "", drugActive: "", route: "Oral", quantity: "",
    reason: "", administeredBy: "", vet: "", withdrawalTime: "", trainerAuth: false
  };
  var formState = useState(blank);
  var form = formState[0]; var setForm = formState[1];

  var trainerName = (settings && settings.trainerName) || "";
  var defaultVet = (settings && settings.vetName) || "";

  useEffect(function() {
    if (!user || !supabase) return;
    supabase.from("medicines_register").select("*").eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(function(res) { if (res.data) setEntries(res.data); });
  }, [user]);

  function upd(k, v) { setForm(function(p) { return Object.assign({}, p, { [k]: v }); }); }

  function pickDrug(d) {
    var wd = d.note ? d.note : (d.hours + " hours detection");
    setForm(function(p) { return Object.assign({}, p, {
      drugBrand: d.brand, drugActive: d.substance, route: d.route,
      withdrawalTime: wd
    }); });
    setShowDetection(false);
  }

  function save() {
    if (!form.horseId || !form.drugActive) return;
    if (!form.trainerAuth) { alert("Trainer must authorise the administration (Rule 148)."); return; }
    setSaving(true);
    var horse = horses.find(function(h) { return h.id === form.horseId; });
    var rec = {
      user_id: user.id,
      horse_id: form.horseId,
      horse_name: horse ? horse.name : "",
      date: form.date,
      drug_brand: form.drugBrand,
      drug_active: form.drugActive,
      route: form.route,
      quantity: form.quantity,
      reason: form.reason,
      administered_by: form.administeredBy,
      vet: form.vet || defaultVet,
      withdrawal_time: form.withdrawalTime,
      trainer_auth: trainerName || "Authorised",
      created_at: new Date().toISOString()
    };
    supabase.from("medicines_register").insert(rec).select().then(function(res) {
      if (res.data) setEntries(function(p) { return res.data.concat(p); });
      setSaving(false); setShowAdd(false); setForm(blank);
    });
  }

  function del(id) {
    setEntries(function(p) { return p.filter(function(e) { return e.id !== id; }); });
    if (supabase) supabase.from("medicines_register").delete().eq("id", id).then(function() {});
  }

  var filtered = entries.filter(function(e) {
    if (fromDate && e.date < fromDate) return false;
    if (toDate && e.date > toDate) return false;
    return true;
  });

  var detFiltered = DETECTION_TIMES.filter(function(d) {
    var q = detSearch.trim().toLowerCase();
    return !q || d.substance.toLowerCase().indexOf(q) >= 0 || d.brand.toLowerCase().indexOf(q) >= 0;
  });

  function printRegister() {
    var style = "@page{size:A4 landscape;margin:1cm} body{font-family:Arial;font-size:10pt;color:#000} h1{font-size:16pt} table{width:100%;border-collapse:collapse;margin-top:10pt} th,td{border:1px solid #333;padding:4pt 6pt;text-align:left;font-size:8.5pt} th{background:#eee} .head{margin-bottom:8pt}";
    var rows = filtered.map(function(e) {
      return "<tr><td>" + (e.date || "") + "</td><td>" + (e.horse_name || "") + "</td><td>" + (e.drug_brand || "") + " / " + (e.drug_active || "") + "</td><td>" + (e.route || "") + "</td><td>" + (e.quantity || "") + "</td><td>" + (e.reason || "") + "</td><td>" + (e.administered_by || "") + "</td><td>" + (e.vet || "") + "</td><td>" + (e.withdrawal_time || "") + "</td><td>" + (e.trainer_auth || "") + "</td></tr>";
    }).join("");
    var win = window.open("", "_blank");
    win.document.write("<html><head><title>Medicines Register</title><style>" + style + "</style></head><body>" +
      "<h1>Medicines Register</h1>" +
      "<div class='head'>Trainer: " + (trainerName || "________") + " &nbsp; Yard: " + ((settings && settings.yardName) || "________") + " &nbsp; Period: " + (fromDate || "start") + " to " + (toDate || "today") + "</div>" +
      "<table><tr><th>Date</th><th>Horse</th><th>Remedy (brand/active)</th><th>Route</th><th>Qty</th><th>Reason</th><th>Administered by</th><th>Vet</th><th>Withdrawal</th><th>Trainer Auth</th></tr>" + rows + "</table>" +
      "<p style='margin-top:18pt;font-size:9pt'>Maintained under Rule 148 of the Rules of Racing. Trainer signature: ________________________  Date: __________</p>" +
      "</body></html>");
    win.document.close(); win.focus();
    setTimeout(function() { win.print(); }, 500);
  }

  var activeHorses = horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Medicines Register</div>
          <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Rule 148 compliant record of all medicines administered</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="ghost" onClick={function() { setShowDetection(true); }}>Detection Times</Btn>
          <Btn variant="ghost" onClick={printRegister}>Print / PDF</Btn>
          <Btn onClick={function() { setForm(Object.assign({}, blank, { vet: defaultVet })); setShowAdd(true); }}>+ Record</Btn>
        </div>
      </div>

      {/* Date filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: C.textMid }}>From</span>
        <input type="date" value={fromDate} onChange={function(e) { setFromDate(e.target.value); }}
          style={{ padding: "6px 10px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12, color: C.text }} />
        <span style={{ fontSize: 12, color: C.textMid }}>To</span>
        <input type="date" value={toDate} onChange={function(e) { setToDate(e.target.value); }}
          style={{ padding: "6px 10px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 12, color: C.text }} />
        {(fromDate || toDate) && <button onClick={function() { setFromDate(""); setToDate(""); }} style={{ background: "none", border: "none", color: C.navy, fontSize: 12, cursor: "pointer" }}>Clear</button>}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          No medicine records yet. Tap + Record to log an administration.
        </div>
      ) : (
        filtered.map(function(e) {
          return (
            <div key={e.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div>
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{e.horse_name}</span>
                  <span style={{ fontSize: 12, color: C.textMid, marginLeft: 8 }}>{new Date(e.date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <button onClick={function() { if (window.confirm("Delete this record?")) del(e.id); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>x</button>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{e.drug_brand}{e.drug_active ? " (" + e.drug_active + ")" : ""}</div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                {e.route && <span><strong>Route:</strong> {e.route}</span>}
                {e.quantity && <span><strong>Qty:</strong> {e.quantity}</span>}
                {e.reason && <span><strong>Reason:</strong> {e.reason}</span>}
                {e.administered_by && <span><strong>By:</strong> {e.administered_by}</span>}
                {e.vet && <span><strong>Vet:</strong> {e.vet}</span>}
                {e.withdrawal_time && <span style={{ color: C.amber, fontWeight: 700 }}><strong>Withdrawal:</strong> {e.withdrawal_time}</span>}
              </div>
            </div>
          );
        })
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div onClick={function() { setShowAdd(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: C.card, borderRadius: 16, padding: "22px", maxWidth: 520, width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>Record Administration</div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 14 }}>Rule 148 requires all fields where applicable</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Lbl>Horse</Lbl>
                <select value={form.horseId} onChange={function(e) { upd("horseId", e.target.value); }} style={inp()}>
                  <option value="">Select horse...</option>
                  {activeHorses.sort(function(a, b) { return a.name.localeCompare(b.name); }).map(function(h) {
                    return <option key={h.id} value={h.id}>{h.name}</option>;
                  })}
                </select>
              </div>
              <div>
                <Lbl>Date administered</Lbl>
                <input type="date" value={form.date} onChange={function(e) { upd("date", e.target.value); }} style={inp()} />
              </div>
              <div>
                <Lbl>Route</Lbl>
                <select value={form.route} onChange={function(e) { upd("route", e.target.value); }} style={inp()}>
                  {ROUTES.map(function(r) { return <option key={r.code} value={r.label}>{r.label} ({r.code})</option>; })}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Lbl>Animal remedy (brand + active drug)</Lbl>
                  <button onClick={function() { setShowDetection(true); }} style={{ background: "none", border: "none", color: C.navy, fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Pick from detection list</button>
                </div>
                <input type="text" value={form.drugBrand} onChange={function(e) { upd("drugBrand", e.target.value); }} placeholder="Brand name e.g. Equipalazone" style={inp()} />
                <input type="text" value={form.drugActive} onChange={function(e) { upd("drugActive", e.target.value); }} placeholder="Active drug e.g. Phenylbutazone" style={Object.assign({}, inp(), { marginTop: 6 })} />
              </div>
              <div>
                <Lbl>Quantity</Lbl>
                <input type="text" value={form.quantity} onChange={function(e) { upd("quantity", e.target.value); }} placeholder="e.g. 10ml" style={inp()} />
              </div>
              <div>
                <Lbl>Withdrawal / detection time</Lbl>
                <input type="text" value={form.withdrawalTime} onChange={function(e) { upd("withdrawalTime", e.target.value); }} placeholder="e.g. 168 hours" style={inp()} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <Lbl>Reason for administration</Lbl>
                <input type="text" value={form.reason} onChange={function(e) { upd("reason", e.target.value); }} placeholder="e.g. lameness, respiratory" style={inp()} />
              </div>
              <div>
                <Lbl>Administered by</Lbl>
                <input type="text" value={form.administeredBy} onChange={function(e) { upd("administeredBy", e.target.value); }} placeholder="Person's name" style={inp()} />
              </div>
              <div>
                <Lbl>Prescribing vet</Lbl>
                <input type="text" value={form.vet} onChange={function(e) { upd("vet", e.target.value); }} placeholder="Vet name (if POM)" style={inp()} />
              </div>
            </div>

            <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 14, cursor: "pointer", fontSize: 13, color: C.text }}>
              <input type="checkbox" checked={form.trainerAuth} onChange={function(e) { upd("trainerAuth", e.target.checked); }} style={{ marginTop: 2 }} />
              <span>I, as Trainer{trainerName ? " (" + trainerName + ")" : ""}, authorise this administration (Rule 148).</span>
            </label>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn onClick={save} disabled={saving || !form.horseId || !form.drugActive}>{saving ? "Saving..." : "Save Record"}</Btn>
              <Btn variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* DETECTION TIMES MODAL */}
      {showDetection && (
        <div onClick={function() { setShowDetection(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: C.card, borderRadius: 16, padding: "20px", maxWidth: 600, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>EHSLC Detection Times</div>
            <div style={{ fontSize: 11, color: C.textMid, marginBottom: 12 }}>Official IHRB figures. These are DETECTION times - add a safety margin per your vet. Tap to use in a record.</div>
            <input type="text" value={detSearch} onChange={function(e) { setDetSearch(e.target.value); }} placeholder="Search drug or brand..." style={Object.assign({}, inp(), { marginBottom: 10 })} />
            {detFiltered.map(function(d, i) {
              return (
                <div key={i} onClick={function() { pickDrug(d); }} style={{ padding: "10px 12px", border: "1px solid " + C.border, borderRadius: 8, marginBottom: 6, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{d.substance}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{d.note ? d.note : d.hours + "h"}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{d.brand} - {d.dose} - {d.route}</div>
                </div>
              );
            })}
            <Btn variant="ghost" onClick={function() { setShowDetection(false); }} style={{ marginTop: 8 }}>Close</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function Lbl(props) {
  return <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>{props.children}</div>;
}
function inp() {
  return { width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text };
}

export default MedicinesRegister;
