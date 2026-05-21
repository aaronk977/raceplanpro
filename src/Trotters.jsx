import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

var OUTCOMES = ["Pending", "Sound", "Lame", "Slight Lameness", "Needs Vet", "Monitor"];

function Trotters({ horses, user, supabase }) {
  var entriesState = useState([]);
  var entries = entriesState[0]; var setEntries = entriesState[1];
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var formState = useState({ horseId: "", date: new Date().toISOString().slice(0,10), time: "08:00", reason: "", outcome: "Pending", notes: "" });
  var form = formState[0]; var setForm = formState[1];
  var savingState = useState(false);
  var saving = savingState[0]; var setSaving = savingState[1];
  var filterDateState = useState(new Date().toISOString().slice(0,10));
  var filterDate = filterDateState[0]; var setFilterDate = filterDateState[1];

  var TODAY = new Date().toISOString().slice(0,10);

  useEffect(function() {
    if (!user || !supabase) return;
    supabase.from("trotters").select("*").eq("user_id", user.id).order("date", { ascending: true }).then(function(res) {
      if (res.data) setEntries(res.data);
    });
  }, [user]);

  function updateForm(key, val) {
    setForm(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }

  function saveEntry() {
    if (!form.horseId || !form.date) return;
    setSaving(true);
    var horse = horses.find(function(h) { return h.id === form.horseId; });
    var record = {
      user_id: user.id,
      horse_id: form.horseId,
      horse_name: horse ? horse.name : "",
      date: form.date,
      time: form.time,
      reason: form.reason,
      outcome: form.outcome,
      notes: form.notes,
      created_at: new Date().toISOString()
    };
    supabase.from("trotters").insert(record).select().then(function(res) {
      if (res.data && res.data[0]) {
        setEntries(function(prev) { return prev.concat(res.data[0]); });
      }
      setSaving(false);
      setShowAdd(false);
      setForm({ horseId: "", date: new Date().toISOString().slice(0,10), time: "08:00", reason: "", outcome: "Pending", notes: "" });
    });
  }

  function updateOutcome(id, outcome) {
    setEntries(function(prev) {
      return prev.map(function(e) { return e.id === id ? Object.assign({}, e, { outcome: outcome }) : e; });
    });
    supabase.from("trotters").update({ outcome: outcome }).eq("id", id).then(function() {});
  }

  function deleteEntry(id) {
    setEntries(function(prev) { return prev.filter(function(e) { return e.id !== id; }); });
    supabase.from("trotters").delete().eq("id", id).then(function() {});
  }

  var todayEntries = entries.filter(function(e) { return e.date === TODAY; }).sort(function(a, b) { return (a.time || "").localeCompare(b.time || ""); });
  var filteredEntries = entries.filter(function(e) { return e.date === filterDate; }).sort(function(a, b) { return (a.time || "").localeCompare(b.time || ""); });
  var activeHorses = horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  function outcomeColor(o) {
    if (o === "Sound") return C.green;
    if (o === "Lame" || o === "Needs Vet") return C.red;
    if (o === "Slight Lameness" || o === "Monitor") return C.amber;
    return C.textMid;
  }

  function outcomeBg(o) {
    if (o === "Sound") return C.green + "15";
    if (o === "Lame" || o === "Needs Vet") return C.red + "12";
    if (o === "Slight Lameness" || o === "Monitor") return C.amber + "15";
    return C.cardOff;
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>

      {/* TODAY BANNER */}
      {todayEntries.length > 0 && (
        <div style={{ background: C.navy, borderRadius: 14, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            {"Horses to see trot today - " + todayEntries.length + " scheduled"}
          </div>
          {todayEntries.map(function(e) {
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", minWidth: 50 }}>{e.time}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{e.horse_name}</div>
                  {e.reason && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 1 }}>{e.reason}</div>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Sound", "Lame", "Slight Lameness", "Needs Vet"].map(function(o) {
                    var active = e.outcome === o;
                    return (
                      <button key={o} onClick={function() { updateOutcome(e.id, o); }}
                        style={{ padding: "5px 10px", borderRadius: 20, border: "1.5px solid " + (active ? outcomeColor(o) : "rgba(255,255,255,0.2)"), background: active ? outcomeBg(o) : "transparent", color: active ? outcomeColor(o) : "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Trotters</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={filterDate} onChange={function(e) { setFilterDate(e.target.value); }}
            style={{ padding: "8px 12px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          <Btn onClick={function() { setShowAdd(true); }}>+ Schedule Trot</Btn>
        </div>
      </div>

      {/* FILTERED LIST */}
      {filteredEntries.length === 0 ? (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          No horses scheduled to trot on this date
        </div>
      ) : (
        <div>
          {filteredEntries.map(function(e) {
            return (
              <div key={e.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ minWidth: 52, textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{e.time}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>{e.horse_name}</div>
                  {e.reason && <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8 }}>{e.reason}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {OUTCOMES.map(function(o) {
                      var active = e.outcome === o;
                      return (
                        <button key={o} onClick={function() { updateOutcome(e.id, o); }}
                          style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid " + (active ? outcomeColor(o) : C.border), background: active ? outcomeBg(o) : "transparent", color: active ? outcomeColor(o) : C.textMid, fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer" }}>
                          {o}
                        </button>
                      );
                    })}
                  </div>
                  {e.notes && <div style={{ fontSize: 12, color: C.textMid, marginTop: 8, fontStyle: "italic" }}>{e.notes}</div>}
                </div>
                <button onClick={function() { if (window.confirm("Remove this entry?")) deleteEntry(e.id); }}
                  style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18, padding: "2px 6px" }}>x</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD MODAL */}
      {showAdd && (
        <div onClick={function() { setShowAdd(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: C.card, borderRadius: 16, padding: "24px", maxWidth: 440, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 16 }}>Schedule Trot</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Horse</div>
                <select value={form.horseId} onChange={function(e) { updateForm("horseId", e.target.value); }}
                  style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text }}>
                  <option value="">Select horse...</option>
                  {activeHorses.sort(function(a,b){return a.name.localeCompare(b.name);}).map(function(h) {
                    return <option key={h.id} value={h.id}>{h.name}</option>;
                  })}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Date</div>
                <input type="date" value={form.date} onChange={function(e) { updateForm("date", e.target.value); }}
                  style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text }} />
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Time</div>
                <input type="time" value={form.time} onChange={function(e) { updateForm("time", e.target.value); }}
                  style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Reason (optional)</div>
                <input type="text" value={form.reason} onChange={function(e) { updateForm("reason", e.target.value); }}
                  placeholder="e.g. Slight stiffness after work, routine check"
                  style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, color: C.text }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 8, textTransform: "uppercase" }}>Initial Assessment</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {OUTCOMES.map(function(o) {
                    return (
                      <button key={o} onClick={function() { updateForm("outcome", o); }}
                        style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (form.outcome === o ? outcomeColor(o) : C.border), background: form.outcome === o ? outcomeBg(o) : "transparent", color: form.outcome === o ? outcomeColor(o) : C.textMid, fontSize: 13, fontWeight: form.outcome === o ? 700 : 400, cursor: "pointer" }}>
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Notes</div>
                <textarea value={form.notes} onChange={function(e) { updateForm("notes", e.target.value); }}
                  placeholder="Any additional notes..."
                  style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, resize: "vertical", minHeight: 60 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={saveEntry} disabled={saving || !form.horseId}>{saving ? "Saving..." : "Save"}</Btn>
              <Btn variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Trotters;
