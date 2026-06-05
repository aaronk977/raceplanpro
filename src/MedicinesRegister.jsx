import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";
import { DETECTION_TIMES, ROUTES } from "./detectionTimes";

// Rule 148 compliant Medicines Register
function MedicinesRegister({ horses, user, supabase, settings }) {
  var pinOkState = useState(false);
  var pinOk = pinOkState[0]; var setPinOk = pinOkState[1];
  var pinInputState = useState("");
  var pinInput = pinInputState[0]; var setPinInput = pinInputState[1];
  var pinErrorState = useState(false);
  var pinError = pinErrorState[0]; var setPinError = pinErrorState[1];
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
  var viewModeState = useState("log");
  var viewMode = viewModeState[0]; var setViewMode = viewModeState[1];
  var sheetHorseState = useState("");
  var sheetHorse = sheetHorseState[0]; var setSheetHorse = sheetHorseState[1];
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
  var people = [];
  if (trainerName) people.push(trainerName);
  ((settings && settings.yardUsers) || []).forEach(function(u) { if (u.name && people.indexOf(u.name) < 0) people.push(u.name); });
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

  function signOffDay(dateStr) {
    if (!trainerName) { alert("Set your trainer name in Settings first so it can be used as the signature."); return; }
    var sig = trainerName + " (signed " + new Date().toLocaleDateString("en-IE") + ")";
    var toSign = entries.filter(function(e) { return e.date === dateStr; });
    setEntries(function(p) { return p.map(function(e) { return e.date === dateStr ? Object.assign({}, e, { trainer_auth: sig }) : e; }); });
    toSign.forEach(function(e) {
      if (supabase) supabase.from("medicines_register").update({ trainer_auth: sig }).eq("id", e.id).then(function() {});
    });
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

  function printHorseSheet(horseId) {
    var horse = horses.find(function(h) { return h.id === horseId; });
    if (!horse) return;
    var horseEntries = entries.filter(function(e) { return e.horse_id === horseId; })
      .filter(function(e) { if (fromDate && e.date < fromDate) return false; if (toDate && e.date > toDate) return false; return true; })
      .sort(function(a, b) { return (a.date || "").localeCompare(b.date || ""); });
    var style = "@page{size:A4 landscape;margin:1cm} body{font-family:Arial;font-size:10pt;color:#000} h1{font-size:18pt;margin-bottom:4pt} .sub{font-size:11pt;margin-bottom:2pt} table{width:100%;border-collapse:collapse;margin-top:12pt} th,td{border:1px solid #333;padding:5pt 7pt;text-align:left;font-size:9pt} th{background:#eee} .footer{margin-top:20pt;font-size:9pt}";
    var rows = horseEntries.map(function(e) {
      return "<tr><td>" + (e.date || "") + "</td><td>" + (e.drug_brand || "") + "<br><i>" + (e.drug_active || "") + "</i></td><td>" + (e.route || "") + "</td><td>" + (e.quantity || "") + "</td><td>" + (e.reason || "") + "</td><td>" + (e.administered_by || "") + "</td><td>" + (e.vet || "") + "</td><td>" + (e.withdrawal_time || "") + "</td><td>" + (e.trainer_auth || "") + "</td></tr>";
    }).join("");
    var win = window.open("", "_blank");
    win.document.write("<html><head><title>Medicine Sheet - " + horse.name + "</title><style>" + style + "</style></head><body>" +
      "<h1>Horse Medicine Sheet</h1>" +
      "<div class='sub'><strong>Horse:</strong> " + horse.name + "</div>" +
      "<div class='sub'><strong>Microchip No:</strong> " + (horse.microchip || "________________") + "</div>" +
      "<div class='sub'><strong>Trainer:</strong> " + (trainerName || "________") + " &nbsp; <strong>Yard:</strong> " + ((settings && settings.yardName) || "________") + "</div>" +
      "<div class='sub'><strong>Period:</strong> " + (fromDate || "start") + " to " + (toDate || "today") + "</div>" +
      "<table><tr><th>Date</th><th>Remedy (brand / active)</th><th>Route</th><th>Qty</th><th>Reason</th><th>Administered by</th><th>Prescribing Vet</th><th>Withdrawal</th><th>Trainer Auth</th></tr>" + rows + "</table>" +
      "<div class='footer'>Maintained under Rule 148 of the Rules of Racing. This sheet is a complete record for the above horse for the stated period.<br><br>Trainer signature: ________________________  Date: __________</div>" +
      "</body></html>");
    win.document.close(); win.focus();
    setTimeout(function() { win.print(); }, 500);
  }

  var activeHorses = horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  var yardMeds = (settings && settings.medications) || [];
  var registerPin = (settings && settings.registerPin) || "";

  function checkPin() {
    if (!registerPin) { setPinOk(true); return; }
    if (pinInput === registerPin) { setPinOk(true); setPinError(false); }
    else { setPinError(true); setPinInput(""); }
  }

  // PIN GATE
  if (registerPin && !pinOk) {
    return (
      <div style={{ maxWidth: 360, margin: "60px auto", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{"\uD83D\uDD12"}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>Medicines Register</div>
        <div style={{ fontSize: 13, color: C.textMid, marginBottom: 20 }}>Enter your 4-digit PIN to access medical records</div>
        <input type="password" inputMode="numeric" maxLength={4} value={pinInput}
          onChange={function(e) { setPinInput(e.target.value.replace(/[^0-9]/g, "")); setPinError(false); }}
          onKeyDown={function(e) { if (e.key === "Enter") checkPin(); }}
          placeholder="****"
          style={{ width: 140, padding: "12px", fontSize: 24, textAlign: "center", letterSpacing: 8, border: "2px solid " + (pinError ? C.red : C.border), borderRadius: 10, color: C.text, marginBottom: 12 }} />
        {pinError && <div style={{ fontSize: 12, color: C.red, marginBottom: 12 }}>Incorrect PIN</div>}
        <div><Btn onClick={checkPin} disabled={pinInput.length !== 4}>Unlock</Btn></div>
      </div>
    );
  }

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

      {/* View toggle */}
      <div style={{ display: "flex", gap: 0, marginBottom: 14, border: "1px solid " + C.border, borderRadius: 10, overflow: "hidden", width: "fit-content" }}>
        <button onClick={function() { setViewMode("log"); }}
          style={{ padding: "8px 18px", border: "none", background: viewMode === "log" ? C.navy : C.card, color: viewMode === "log" ? "#fff" : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          Yard Log
        </button>
        <button onClick={function() { setViewMode("horse"); }}
          style={{ padding: "8px 18px", border: "none", background: viewMode === "horse" ? C.navy : C.card, color: viewMode === "horse" ? "#fff" : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          By Horse (IHRB Sheets)
        </button>
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

      {viewMode === "log" && (filtered.length === 0 ? (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          No medicine records yet. Tap + Record to log an administration.
        </div>
      ) : (function() {
        var grpByDate = {};
        filtered.forEach(function(e) { if (!grpByDate[e.date]) grpByDate[e.date] = []; grpByDate[e.date].push(e); });
        var dKeys = Object.keys(grpByDate).sort(function(a, b) { return b.localeCompare(a); });
        return dKeys.map(function(dk) {
          var dayRecs = grpByDate[dk];
          var allSigned = dayRecs.every(function(e) { return e.trainer_auth && e.trainer_auth.indexOf("signed") >= 0; });
          return (
            <div key={dk} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{new Date(dk + "T12:00:00").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, color: allSigned ? C.green : C.navy }}>
                  <input type="checkbox" checked={allSigned} onChange={function() { if (!allSigned) signOffDay(dk); }} disabled={allSigned} />
                  {allSigned ? "Signed by trainer" : "Sign off all records for this day"}
                </label>
              </div>
              {dayRecs.map(function(e) {
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
              })}
            </div>
          );
        });
      })())}

      {/* BY HORSE VIEW */}
      {viewMode === "horse" && (
        <div>
          {activeHorses.sort(function(a, b) { return a.name.localeCompare(b.name); }).map(function(horse) {
            var horseEntries = entries.filter(function(e) { return e.horse_id === horse.id; });
            var inPeriod = horseEntries.filter(function(e) { if (fromDate && e.date < fromDate) return false; if (toDate && e.date > toDate) return false; return true; });
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{horse.name}</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                    {horse.microchip ? "Chip: " + horse.microchip : <span style={{ color: C.amber }}>No microchip on file</span>}
                    {" - " + inPeriod.length + " record" + (inPeriod.length !== 1 ? "s" : "") + (fromDate || toDate ? " in period" : " total")}
                  </div>
                </div>
                <Btn variant="ghost" onClick={function() { printHorseSheet(horse.id); }} disabled={horseEntries.length === 0} style={{ fontSize: 12 }}>
                  Print Sheet / PDF
                </Btn>
              </div>
            );
          })}
        </div>
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
                <Lbl>Medication (select to auto-fill)</Lbl>
                <select value={form.drugBrand} onChange={function(e) {
                  var v = e.target.value;
                  var d = DETECTION_TIMES.find(function(x) { return x.brand === v; });
                  var ym = yardMeds.find(function(x) { return x.name === v; });
                  if (d) {
                    upd("drugBrand", d.brand); upd("drugActive", d.substance);
                    upd("route", d.route); upd("withdrawalTime", d.note ? d.note : (d.hours + " hours detection"));
                  } else if (ym) {
                    upd("drugBrand", ym.name); upd("drugActive", ym.activeIngredient || ym.name);
                    if (ym.withdrawalDays) upd("withdrawalTime", ym.withdrawalDays + " days");
                  } else { upd("drugBrand", v); }
                }} style={inp()}>
                  <option value="">Select medication...</option>
                  {yardMeds.length > 0 && <optgroup label="Your yard medications">
                    {yardMeds.map(function(m, i) { return <option key={"ym" + i} value={m.name}>{m.name}</option>; })}
                  </optgroup>}
                  <optgroup label="Official EHSLC list">
                    {DETECTION_TIMES.map(function(d, i) {
                      return <option key={i} value={d.brand}>{d.substance + " - " + d.brand}</option>;
                    })}
                  </optgroup>
                  <option value="__other">Other / not listed</option>
                </select>
                {form.drugBrand === "__other" && (
                  <div style={{ marginTop: 6 }}>
                    <input type="text" value={form.drugActive} onChange={function(e) { upd("drugActive", e.target.value); }} placeholder="Type medication name" style={inp()} />
                  </div>
                )}
              </div>
              <div>
                <Lbl>Quantity</Lbl>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" value={form.quantityAmount || ""} onChange={function(e) { upd("quantityAmount", e.target.value); upd("quantity", e.target.value + " " + (form.quantityUnit || "ml")); }} placeholder="0" style={Object.assign({}, inp(), { flex: 1 })} />
                  <select value={form.quantityUnit || "ml"} onChange={function(e) { upd("quantityUnit", e.target.value); upd("quantity", (form.quantityAmount || "") + " " + e.target.value); }} style={Object.assign({}, inp(), { width: 90, flex: "none" })}>
                    <option value="ml">ml</option>
                    <option value="mg">mg</option>
                    <option value="g">g</option>
                    <option value="ug">ug</option>
                    <option value="tablet">tablet(s)</option>
                    <option value="sachet">sachet(s)</option>
                    <option value="tube">tube(s)</option>
                    <option value="dose">dose(s)</option>
                  </select>
                </div>
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
                <select value={form.administeredBy} onChange={function(e) { upd("administeredBy", e.target.value); }} style={inp()}>
                  <option value="">Select person...</option>
                  {people.map(function(p, i) { return <option key={i} value={p}>{p}</option>; })}
                </select>
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
