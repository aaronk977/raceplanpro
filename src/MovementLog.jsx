import React, { useState } from "react";
import { Btn, C, TODAY } from "./shared";

function MovementLog({ horses }) {
  var todayStr = TODAY.toISOString().slice(0, 10);
  var movState = useState([]);
  var movements = movState[0]; var setMovements = movState[1];
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var emptyNm = { horseId: "", type: "arrival", date: todayStr, from: "", to: "", contactName: "", contactPhone: "", notes: "" };
  var nmState = useState(emptyNm);
  var nm = nmState[0]; var setNm = nmState[1];

  function saveMovement() {
    if (!nm.horseId) return;
    var newMov = Object.assign({}, nm, { id: "m_" + Date.now() });
    setMovements(function(p) { return [newMov].concat(p); });
    setNm(emptyNm);
    setShowAdd(false);
  }

  function updateNm(key, val) {
    setNm(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  var sorted = movements.slice().sort(function(a, b) { return new Date(b.date) - new Date(a.date); });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Horse Movements</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Track arrivals, departures and transfers</div>
        </div>
        <Btn onClick={function() { setShowAdd(true); }}>+ Log Movement</Btn>
      </div>

      {showAdd && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Log Movement</div>

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
                {["arrival", "departure", "transfer", "vet visit", "farrier", "other"].map(function(t) {
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
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{nm.type === "arrival" ? "From" : "To"}</div>
              <input type="text" value={nm.type === "arrival" ? nm.from : nm.to}
                onChange={function(e) { updateNm(nm.type === "arrival" ? "from" : "to", e.target.value); }}
                placeholder={nm.type === "arrival" ? "e.g. Curragh Stables" : "e.g. Leopardstown"}
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
              placeholder="Any additional notes"
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
          No movements logged yet
        </div>
      )}

      {sorted.map(function(mov) {
        var horse = horses.find(function(h) { return h.id === mov.horseId; });
        var info = [
          { l: mov.type === "arrival" ? "From" : "To", v: mov.type === "arrival" ? mov.from : mov.to },
          { l: "Contact", v: mov.contactName },
          { l: "Phone", v: mov.contactPhone },
          { l: "Notes", v: mov.notes },
        ].filter(function(x) { return x.v; });

        return (
          <div key={mov.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: mov.type === "arrival" ? C.green + "15" : C.amber + "15",
                    color: mov.type === "arrival" ? C.green : C.amber }}>
                    {mov.type.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse ? horse.name : mov.horseId}</span>
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
              </div>
              <div style={{ fontSize: 12, color: C.textMid, whiteSpace: "nowrap" }}>
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
