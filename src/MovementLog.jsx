import React, { useState, useEffect } from "react";
import { Btn, C, TODAY } from "./shared";

function MovementLog({ horses, user, supabase }) {
  var todayStr = TODAY.toISOString().slice(0, 10);
  var movState = useState([]);
  var movements = movState[0]; var setMovements = movState[1];
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var loadingState = useState(true);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var emptyNm = { horseId: "", type: "needs to go", date: todayStr, location: "", contactName: "", contactPhone: "", notes: "", done: false };
  var nmState = useState(emptyNm);
  var nm = nmState[0]; var setNm = nmState[1];

  var MOVE_TYPES = ["needs to go", "needs collection", "arrival", "departure", "transfer", "vet visit", "farrier", "other"];

  useEffect(function() {
    if (!user || !supabase) { setLoading(false); return; }
    supabase.from("movements").select("*").eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(function(res) {
        if (res.data) setMovements(res.data);
        setLoading(false);
      });
  }, [user]);

  function saveMovement() {
    if (!nm.horseId) return;
    var horse = horses.find(function(h) { return h.id === nm.horseId; });
    var record = {
      user_id: user ? user.id : null,
      horse_id: nm.horseId,
      horse_name: horse ? horse.name : "",
      type: nm.type,
      date: nm.date,
      location: nm.location,
      contact_name: nm.contactName,
      contact_phone: nm.contactPhone,
      notes: nm.notes,
      done: false
    };
    if (supabase && user) {
      supabase.from("movements").insert(record).select().then(function(res) {
        if (res.data && res.data[0]) setMovements(function(p) { return [res.data[0]].concat(p); });
      });
    } else {
      record.id = "m_" + Date.now();
      setMovements(function(p) { return [record].concat(p); });
    }
    setNm(emptyNm);
    setShowAdd(false);
  }

  function toggleDone(mov) {
    var newDone = !mov.done;
    setMovements(function(p) { return p.map(function(m) { return m.id === mov.id ? Object.assign({}, m, { done: newDone }) : m; }); });
    if (supabase && user && mov.id) {
      supabase.from("movements").update({ done: newDone }).eq("id", mov.id).then(function() {});
    }
  }

  function deleteMovement(mov) {
    setMovements(function(p) { return p.filter(function(m) { return m.id !== mov.id; }); });
    if (supabase && user && mov.id) {
      supabase.from("movements").delete().eq("id", mov.id).then(function() {});
    }
  }

  function updateNm(key, val) {
    setNm(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  function locationLabel(type) {
    if (type === "needs to go") return "Destination";
    if (type === "needs collection") return "Collect from";
    if (type === "arrival") return "From";
    return "To / Location";
  }

  var sorted = movements.slice().sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: C.textMid }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Horse Movements</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Where horses need to go or be collected from. Scheduled dates show on Daily Summary.</div>
        </div>
        <Btn onClick={function() { setShowAdd(true); }}>+ Add Movement</Btn>
      </div>

      {showAdd && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Add Movement</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Horse</div>
              <select value={nm.horseId} onChange={function(e) { updateNm("horseId", e.target.value); }}
                style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                <option value="">Select horse</option>
                {horses.map(function(h) { return <option key={h.id} value={h.id}>{h.name}</option>; })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Type</div>
              <select value={nm.type} onChange={function(e) { updateNm("type", e.target.value); }}
                style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {MOVE_TYPES.map(function(t) {
                  return <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>;
                })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Date</div>
              <input type="date" value={nm.date} onChange={function(e) { updateNm("date", e.target.value); }}
                style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{locationLabel(nm.type)}</div>
              <input type="text" value={nm.location}
                onChange={function(e) { updateNm("location", e.target.value); }}
                placeholder="e.g. Fethard Equine Hospital"
                style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Contact Name</div>
              <input type="text" value={nm.contactName} onChange={function(e) { updateNm("contactName", e.target.value); }}
                placeholder="e.g. John Murphy"
                style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Contact Phone</div>
              <input type="text" value={nm.contactPhone} onChange={function(e) { updateNm("contactPhone", e.target.value); }}
                placeholder="e.g. 087 123 4567"
                style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Notes</div>
            <input type="text" value={nm.notes} onChange={function(e) { updateNm("notes", e.target.value); }}
              placeholder="e.g. scope and x-ray back"
              style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={saveMovement}>Save Movement</Btn>
            <Btn variant="ghost" onClick={function() { setShowAdd(false); setNm(emptyNm); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {sorted.length === 0 && !showAdd && (
        <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid, fontSize: 13 }}>
          No movements yet. Add where a horse needs to go or be collected from.
        </div>
      )}

      {sorted.map(function(mov) {
        var horse = horses.find(function(h) { return h.id === mov.horse_id || h.id === mov.horseId; });
        var locVal = mov.location || mov.to || mov.from || "";
        var typeVal = mov.type || "";
        var isCollection = typeVal === "needs collection";
        var isGo = typeVal === "needs to go";
        var accent = isCollection ? C.blue : (isGo ? C.amber : C.green);
        var info = [
          { l: locationLabel(typeVal), v: locVal },
          { l: "Contact", v: mov.contact_name || mov.contactName },
          { l: "Phone", v: mov.contact_phone || mov.contactPhone },
          { l: "Notes", v: mov.notes },
        ].filter(function(x) { return x.v; });

        return (
          <div key={mov.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10, opacity: mov.done ? 0.55 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: accent + "15", color: accent }}>
                    {typeVal.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text, textDecoration: mov.done ? "line-through" : "none" }}>{horse ? horse.name : (mov.horse_name || mov.horseId)}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {info.map(function(item) {
                    return (
                      <div key={item.l}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5 }}>{item.l}</div>
                        <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{item.v}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={function() { toggleDone(mov); }} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, border: "1px solid " + C.border, background: mov.done ? C.green + "15" : C.cardOff, color: mov.done ? C.green : C.textMid, cursor: "pointer" }}>{mov.done ? "Done" : "Mark done"}</button>
                  <button onClick={function() { deleteMovement(mov); }} style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 6, border: "1px solid " + C.border, background: C.cardOff, color: C.red, cursor: "pointer" }}>Delete</button>
                </div>
              </div>
              <div style={{ fontSize: 12, color: C.textMid, whiteSpace: "nowrap", fontWeight: 700 }}>
                {new Date(mov.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MovementLog;
