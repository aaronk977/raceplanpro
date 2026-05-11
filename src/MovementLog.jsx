import React, { useState } from "react";
import { Btn, C, TODAY } from "./shared";

function MovementLog({ horses }) {
  const [movements, setMovements] = useState([
    { id: "m1", horseId: "h2", type: "arrival", date: "2026-02-10", from: "Convalescence yard", contactName: "Dr. J. Murphy", contactPhone: "+353 86 111 0000", notes: "Post wind op recovery complete" },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [nm, setNm] = useState({ horseId: "", type: "arrival", date: todayStr, from: "", to: "", contactName: "", contactPhone: "", notes: "" });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Horse Movements</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>All arrivals and departures with contact details</div>
        </div>
        <Btn onClick={function(){setShowAdd(true);}}>+ Log Movement</Btn>
      </div>

      {movements.sort(function(a,b){return new Date(b.date)-new Date(a.date);}).map(function(mov){
        const horse = horses.find(function(h){return h.id===mov.horseId;});
        if (!horse) return null;
        return (
          <div key={mov.id} style={{ background: C.card, border: `1px solid ${mov.type === "arrival" ? C.green + "30" : C.amber + "30"}`, borderLeft: `3px solid ${mov.type === "arrival" ? C.green : C.amber}`, borderRadius: 12, padding: "13px 16px", marginBottom: 10, boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <Silk silk={horse.silk} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</span>
                  <Tag color={mov.type === "arrival" ? C.green : C.amber}>{mov.type === "arrival" ? "↓ Arrived" : "↑ Departed"}</Tag>
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>{new Date(mov.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ l: mov.type==="arrival"?"From":"To", v: mov.type === "arrival" ? mov.from : mov.to }, { l: "Contact", v: mov.contactName }, { l: "Phone", v: mov.contactPhone }, { l: "Notes", v: mov.notes }].filter(function(i){return i.v;}).map(function(item){var l=item.l;var v=item.v;return(
                <div key={l} style={{ background: C.cardOff, borderRadius: 8, padding: "7px 10px" }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadowMd }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Log Horse Movement</div>
              <button onClick={function(){setShowAdd(false);}} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { key: "horseId", label: "Horse", type: "select" },
                { key: "type", label: "Type", type: "select_type" },
                { key: "date", label: "Date", type: "date" },
                { key: "from", label: "From (arrival)", placeholder: "e.g. Convalescence yard" },
                { key: "to", label: "To (departure)", placeholder: "e.g. Summer grass" },
                { key: "contactName", label: "Contact Name", placeholder: "Person or premises" },
                { key: "contactPhone", label: "Contact Phone", type: "tel", placeholder: "+353..." },
                { key: "notes", label: "Notes", placeholder: "Any relevant notes" },
              ].map(function(item){var key=item.key;var label=item.label;var type=item.type;var placeholder=item.placeholder;return(
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select value={nm[key]} onChange={function(e){setNm(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.cardOff, border: "1px solid "+C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      <option value="">Select horse</option>
                      {horses.map(function(h){return <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  ) : type === "select_type" ? (
                    <select value={nm[key]} onChange={function(e){setNm(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.cardOff, border: "1px solid "+C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      <option value="arrival">Arrival</option>
                      <option value="departure">Departure</option>
                    </select>
                  ) : (
                    <input type={type || "text"} placeholder={placeholder} value={nm[key]} onChange={function(e){setNm(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.cardOff, border: "1px solid "+C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                  )}
                </div>
              ))}
              <Btn onClick={function(){ if (!nm.horseId) return; setMovements(function(p) { return [...p, Object.assign({}, nm, { id: "m_" + Date.now() })]; }); setNm({ horseId: "", type: "arrival", date: todayStr, from: "", to: "", contactName: "", contactPhone: "", notes: "" }); setShowAdd(false); }} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Save Movement</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OWNER PORTAL ─────────────────────────────────────────────────────────────

export default MovementLog;
