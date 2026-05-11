import React, { useState } from "react";
import { Btn, Silk, FormDots, C } from "./shared";

function OwnerPortal({ horses }) {
  const [selOwner, setSelOwner] = useState(null);

  const owners = [...new Set(horses.map(function(h) { return h.owner; }))].map(function(name) { return ({
    name, horses: horses.filter(function(h) { return h.owner === name; }),
    phone: (horses.find(function(h) { return h.owner === name; }) || {}).ownerPhone,
    email: (horses.find(function(h) { return h.owner === name; }) || {}).ownerEmail,
  }); });

  if (!selOwner) return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Owner Portal</div>
      <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>Each owner sees their horses, entries, provisional targets and trainer notes</div>
      {owners.map(o => (
        <div key={o.name} onClick={function(){setSelOwner(o);}} style={{ background: C.card, border: "1px solid "+C.border, borderRadius: 12, padding: "13px 16px", marginBottom: 9, cursor: "pointer", boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 13 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: C.gold, flexShrink: 0 }}>
            {o.name.split(" ").map(function(w){return w[0];}).join("").slice(0,2)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{o.name}</div>
            <div style={{ fontSize: 12, color: C.textMid }}>{o.horses.length} horse{o.horses.length !== 1 ? "s" : ""} · {o.horses.filter(h => (h.provisionalEntries || []).length > 0).length} with targets</div>
            <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
              {o.horses.map(h => <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 3 }}><Silk silk={h.silk} size={14} /><span style={{ fontSize: 10, color: C.textMid }}>{h.name}</span></div>)}
            </div>
          </div>
          <span style={{ color: C.textMid }}>→</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Btn variant="ghost" onClick={function(){setSelOwner(null);}} style={{ fontSize: 12, padding: "6px 14px" }}>← All Owners</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          {selOwner.phone && <a href={"https://wa.me/" + (selOwner.phone || "").split("").filter(function(d){return d>="0"&&d<="9";}).join("")} target="_blank" rel="noopener noreferrer" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>💬 WhatsApp</a>}
          {selOwner.phone && <a href={`tel:${selOwner.phone}`} style={{ background: C.blueBg, border: `1px solid ${C.blue}30`, color: C.blue, borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>📞 Call</a>}
          {selOwner.email && <a href={`mailto:${selOwner.email}`} style={{ background: C.navy, border: "none", color: "#fff", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>✉ Email</a>}
        </div>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 14 }}>{selOwner.name}</div>

      {selOwner.horses.map(horse => {
        const provisional = horse.provisionalEntries || [];
        return (
          <div key={horse.id} style={{ background: C.card, border: "1px solid "+C.border, borderRadius: 14, padding: "16px 18px", marginBottom: 14, boxShadow: C.shadow }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 13 }}>
              <Silk silk={horse.silk} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 4 }}>{horse.name}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                  <span>{getAge(horse.dob)}yo {horse.sex}</span>
                  <span>Rating: {horse.nhRating || horse.flatRating || "—"}</span>
                  {horse.headgear && <span>Headgear: {horse.headgear}</span>}
                </div>
                <StatusPill status={horse.status} activationDate={horse.activationDate} />
              </div>
              <FormDots form={horse.form} />
            </div>

            
            {provisional.length > 0 && (
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Provisional Targets</div>
                {provisional.map(pe => (
                  <div key={pe.id} style={{ padding: "10px 12px", background: C.goldBg, border: `1px solid ${C.gold}30`, borderLeft: `3px solid ${C.gold}`, borderRadius: 9, marginBottom: 7 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{pe.raceName}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                      <span>📍 {pe.venue}</span>
                      {pe.date && <span>📅 {new Date(pe.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "long" })}</span>}
                      {pe.raceRef && <span>{pe.raceRef}</span>}
                    </div>
                    {pe.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", marginTop: 4 }}>💬 {pe.note}</div>}
                  </div>
                ))}
              </div>
            )}

            
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Recent Form</div>
              {(horse.form || []).slice(0, 3).map((f, i) => {
                const pc = f.position === 1 ? C.green : f.position <= 3 ? C.amber : C.textMid;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: C.cardOff, borderRadius: 8, border: "1px solid "+C.border, marginBottom: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: `${pc}12`, border: `1.5px solid ${pc}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: pc }}>{f.position}</div>
                    <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{f.venue}</span><span style={{ fontSize: 11, color: C.textMid, marginLeft: 6 }}>{f.raceClass} · {f.going}</span></div>
                    <div style={{ fontSize: 11, color: C.textMid }}>{new Date(f.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</div>
                  </div>
                );
              })}
              {(!horse.form || horse.form.length === 0) && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic" }}>No runs recorded yet</div>}
            </div>

            {horse.notes && (
              <div style={{ marginTop: 10, padding: "9px 12px", background: C.cardOff, borderRadius: 8, border: "1px solid "+C.border }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>Trainer's Note</div>
                <p style={{ fontSize: 13, color: C.textMid, fontStyle: "italic", margin: 0, lineHeight: 1.5 }}>{horse.notes}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default OwnerPortal;
