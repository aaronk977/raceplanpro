import React, { useState } from "react";
import { Btn, Tag, Silk, StatusPill, FormDots, C, TODAY, daysUntil, canRace, coolingDate, SILKS } from "./shared";

function YardView({ horses, setHorses }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editHorse, setEditHorse] = useState(null);
  const [csvStatus, setCsvStatus] = useState(null);
  const [newHorse, setNewHorse] = useState({ name: "", dob: "", sex: "Gelding", colour: "", nhRating: "", flatRating: "", discipline: "Hurdle", surface: "Turf", status: "Active", owner: "", ownerPhone: "", ownerEmail: "", headgear: "", nextRaceDate: "", notes: "" });

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const lines = text.split("\n").filter(function(l) { return l.trim(); });
        const sep = lines[0].includes("\t") ? "\t" : ",";
        const headers = lines[0].split(sep).map(function(h) { return h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""); });
        const imported = [];
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(sep).map(function(c) { return c.trim().replace(/^"|"$/g, ""); });
          if (!cols[0]) continue;
          const row = {};
          headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
          const name = row.horse_name || row.horse || cols[0];
          if (!name) continue;
          const yof = parseInt(row.yof) || null;
          const currentYear = new Date().getFullYear();
          imported.push({
            id: "h_" + Date.now() + "_" + i,
            name,
            dob: yof ? yof + "-01-01" : "",
            yof,
            sex: (function() {
              const s = (row.sex || "").trim();
              const m = { "G": "Gelding", "M": "Mare", "F": "Filly", "C": "Colt", "H": "Horse",
                "g": "Gelding", "m": "Mare", "f": "Filly", "c": "Colt", "h": "Horse",
                "gelding": "Gelding", "mare": "Mare", "filly": "Filly", "colt": "Colt", "horse": "Horse" };
              return m[s] || m[s.toLowerCase()] || (s.length > 1 ? s : "Gelding");
            })(),
            colour: row.colour || row.color || "",
            owner: row.owner || "",
            ownerPhone: "",
            ownerEmail: "",
            status: (function() {
              const st = (row.status || "").toLowerCase();
              return st.includes("inactive") ? "Inactive" : st.includes("cool") ? "CoolingOff" : "Active";
            })(),
            activationDate: null,
            nhRating: null,
            flatRating: null,
            discipline: [],
            surface: "Turf",
            headgear: "",
            jockey: "",
            trainer: "",
            nextRaceDate: "",
            notes: "",
            isEBF: false,
            isMaiden: true,
            isNovice: false,
            goingPref: [],
            distanceMin: 16,
            distanceMax: 24,
            silk: SILKS[Math.floor(Math.random() * SILKS.length)],
            form: [],
            arrivedDate: todayStr,
            provisionalEntries: [],
            hcert: row.hcert || "",
            stalls: row.stalls || "",
            partnership: row.partnership || "",
          });
        }
        setHorses(prev => {
          const updated = [...prev];
          imported.forEach(imp => {
            const idx = updated.findIndex(h => h.name.toLowerCase() === imp.name.toLowerCase());
            if (idx >= 0) {
              updated[idx] = { ...updated[idx], ...imp, id: updated[idx].id, silk: updated[idx].silk, form: updated[idx].form };
            } else {
              updated.push(imp);
            }
          });
          return updated;
        });
        setCsvStatus(imported.length + " horses imported from HRI");
        setTimeout(() => setCsvStatus(null), 5000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error reading file — check format");
        setTimeout(() => setCsvStatus(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleRatingsCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const rawLines = text.split("\n").filter(function(l) { return l.trim(); });
        const sep = rawLines[0].includes("\t") ? "\t" : ",";
        const headers = rawLines[0].split(sep).map(function(h) { return h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, ""); });
        let updated = 0;
        const ratingLines = rawLines.slice(1);
        setHorses(prev => {
          const horses = [...prev];
          ratingLines.forEach(line => {
            const cols = line.split(sep).map(function(c) { return c.trim().replace(/^"|"$/g, ""); });
            if (!cols[0]) return;
            const row = {};
            headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
            const name = row.horse_name || row.horse || cols[0];
            if (!name) return;
            const flatRating = parseInt(row.flat || row.flat_rating || row.flatrating || row.turf || row.official_flat || "") || null;
            const awtRating = parseInt(row.all_weather || row.awt || row.allweather || row.aw || "") || null;
            const hurdleRating = parseInt(row.hurdle || row.hurdle_rating || row.hurdlerating || row.hdl || row.hurdles || row.nh_hurdle || "") || null;
            const chaseRating = parseInt(row.chase || row.chase_rating || row.chaserating || row.chs || row.chases || row.nh_chase || "") || null;
            const nhRating = parseInt(row.nh_rating || row.nhrating || row.nh || row.national_hunt || row.official_nh || "") || null;
            const genericRating = parseInt(row.rating || row.official_rating || row.mark || row.handicap_mark || row.official || "") || null;
            const idx = horses.findIndex(h => h.name.toLowerCase().trim() === name.toLowerCase().trim());
            if (idx >= 0) {
              horses[idx] = {
                ...horses[idx],
                flatRating: flatRating || awtRating || horses[idx].flatRating,
                awtRating: awtRating || horses[idx].awtRating,
                nhRating: nhRating || hurdleRating || chaseRating || genericRating || horses[idx].nhRating,
                hurdleRating: hurdleRating || horses[idx].hurdleRating,
                chaseRating: chaseRating || horses[idx].chaseRating,
                isMaiden: !flatRating && !awtRating && !hurdleRating && !chaseRating,
                discipline: horses[idx].discipline && horses[idx].discipline.length > 0
                  ? horses[idx].discipline
                  : hurdleRating && chaseRating ? ["Hurdle", "Chase"]
                  : hurdleRating ? ["Hurdle"]
                  : chaseRating ? ["Chase"]
                  : flatRating || awtRating ? ["Flat"]
                  : horses[idx].discipline,
                surface: horses[idx].surface || (awtRating && !flatRating ? "AWT" : "Turf"),
              };
              updated++;
            }
          });
          return horses;
        });
        setCsvStatus(updated + " horses updated with ratings");
        setTimeout(() => setCsvStatus(null), 5000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error reading ratings file");
        setTimeout(() => setCsvStatus(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const addHorse = () => {
    if (!newHorse.name) return;
    setHorses(prev => [...prev, { ...newHorse, id: "h_" + Date.now(), silk: SILKS[Math.floor(Math.random() * SILKS.length)], nhRating: newHorse.nhRating ? parseInt(newHorse.nhRating) : null, flatRating: newHorse.flatRating ? parseInt(newHorse.flatRating) : null, discipline: [newHorse.discipline], isEBF: false, isMaiden: false, isNovice: false, distanceMin: 16, distanceMax: 24, goingPref: [], form: [], arrivedDate: todayStr, provisionalEntries: [] }]);
    setNewHorse({ name: "", dob: "", sex: "Gelding", colour: "", nhRating: "", flatRating: "", discipline: "Hurdle", surface: "Turf", status: "Active", owner: "", ownerPhone: "", ownerEmail: "", headgear: "", nextRaceDate: "", notes: "" });
    setShowAdd(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>My Yard</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>{horses.length} horses · {horses.filter(h => h.status === "Active").length} active</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {csvStatus && <span style={{ fontSize: 12, fontWeight: 700, color: csvStatus.startsWith("✓") ? C.green : C.red }}>{csvStatus}</span>}
          <label style={{ background: C.cardOff, border: "1.5px solid " + C.border, color: C.textMid, borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            📥 Import Horses CSV <input type="file" accept=".csv,.tsv,.txt" onChange={handleCSV} style={{ display: "none" }} />
          </label>
          <label style={{ background: C.cardOff, border: "1.5px solid " + C.border, color: C.textMid, borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            📊 Import Ratings CSV <input type="file" accept=".csv,.tsv,.txt" onChange={handleRatingsCSV} style={{ display: "none" }} />
          </label>
          <Btn variant="ghost" onClick={() => { if (window.confirm("Remove all horses from the yard? This cannot be undone.")) { setHorses([]); } }} style={{ fontSize: 12, color: C.red, borderColor: C.red }}>Clear Yard</Btn>
          <Btn onClick={() => setShowAdd(true)}>+ Add Horse</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        {[{ l: "Total", v: horses.length, c: C.blue }, { l: "Active", v: horses.filter(h => h.status === "Active").length, c: C.green }, { l: "Cooling Off", v: horses.filter(h => h.status === "CoolingOff").length, c: C.amber }, { l: "Inactive", v: horses.filter(h => h.status === "Inactive").length, c: C.red }].map(s => (
          <div key={s.l} style={{ background: C.card, borderRadius: 10, padding: "13px 16px", borderTop: `4px solid ${s.c}`, boxShadow: C.shadow }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: C.textMid, marginTop: 3, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {horses.map(h => (
        <div key={h.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `4px solid ${h.status === "Active" ? C.green : h.status === "CoolingOff" ? C.amber : C.red}`, borderRadius: 12, padding: "13px 16px", marginBottom: 9, boxShadow: C.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Silk silk={h.silk} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{h.name}</span>
                <StatusPill status={h.status} activationDate={h.activationDate} />
                {h.headgear && <Tag color={C.purple}>{h.headgear}</Tag>}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                <span>{getAge(h.dob)}yo {h.sex} · {h.colour}</span>
                {h.flatRating && <span>Flat: {h.flatRating}</span>}
                {h.awtRating && <span>AWT: {h.awtRating}</span>}
                {h.hurdleRating && <span>Hrd: {h.hurdleRating}</span>}
                {h.chaseRating && <span>Chs: {h.chaseRating}</span>}
                {!h.flatRating && !h.awtRating && !h.hurdleRating && !h.chaseRating && <span style={{ color: C.amber }}>Unrated</span>}
                <span>Owner: {h.owner}</span>
                {h.ownerPhone && <a href={"https://wa.me/" + (h.ownerPhone || "").replace(/[^0-9]/g, "")} target="_blank" rel="noopener noreferrer" style={{ color: C.green, fontWeight: 600, textDecoration: "none" }}>💬 WhatsApp</a>}
              </div>
              <div style={{ marginTop: 5, display: "flex", gap: 6, alignItems: "center" }}><FormDots form={h.form} />{h.notes && <span style={{ fontSize: 11, color: C.textMid, fontStyle: "italic" }}>💬 {h.notes}</span>}</div>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <Btn variant="ghost" onClick={() => setEditHorse(h)} style={{ fontSize: 11, padding: "5px 12px" }}>✏️ Edit</Btn>
              <Btn variant="red" onClick={() => { if (window.confirm("Remove " + h.name + " from the yard?")) { setHorses(prev => prev.filter(x => x.id !== h.id)); } }} style={{ fontSize: 11, padding: "5px 12px" }}>🗑 Remove</Btn>
            </div>
          </div>
        </div>
      ))}

      {editHorse && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Edit — {editHorse.name}</div>
              <button onClick={() => setEditHorse(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { key: "status", label: "Status", type: "select", options: ["Active", "CoolingOff", "Inactive"] },
                { key: "sex", label: "Sex", type: "select", options: ["Gelding", "Mare", "Filly", "Colt", "Horse"] },
                { key: "discipline", label: "Discipline", type: "select", options: ["Hurdle", "Chase", "Flat", "Bumper"] },
                { key: "headgear", label: "Headgear", placeholder: "e.g. Cheekpieces" },
                { key: "nhRating", label: "NH Rating", type: "number", placeholder: "e.g. 98" },
                { key: "flatRating", label: "Flat Rating", type: "number", placeholder: "e.g. 74" },
                { key: "ownerPhone", label: "Owner WhatsApp", type: "tel", placeholder: "+353 86 000 0000" },
                { key: "ownerEmail", label: "Owner Email", type: "email", placeholder: "owner@email.com" },
                { key: "jockey", label: "Jockey", placeholder: "e.g. D.J. OKeeffe" },
                { key: "notes", label: "Trainer Notes", placeholder: "Any notes" },
                { key: "nextRaceDate", label: "Next Target Date", type: "date" },
              ].map(({ key, label, placeholder, type, options }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select
                      value={key === "discipline" ? (editHorse.discipline && editHorse.discipline[0]) || "" : editHorse[key] || ""}
                      onChange={e => setEditHorse(function(prev) { return Object.assign({}, prev, { [key]: key === "discipline" ? [e.target.value] : e.target.value }); })}
                      style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}
                    >
                      {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      type={type || "text"}
                      placeholder={placeholder}
                      value={editHorse[key] || ""}
                      onChange={e => setEditHorse(function(prev) { return Object.assign({}, prev, { [key]: e.target.value }); })}
                      style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}
                    />
                  )}
                </div>
              ))}
              <Btn onClick={() => {
                setHorses(prev => prev.map(h => h.id === editHorse.id ? { ...editHorse, nhRating: editHorse.nhRating ? parseInt(editHorse.nhRating) : null, flatRating: editHorse.flatRating ? parseInt(editHorse.flatRating) : null } : h));
                setEditHorse(null);
              }} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Save Changes</Btn>
              <Btn variant="red" onClick={() => { if (window.confirm("Remove " + editHorse.name + " from the yard?")) { setHorses(prev => prev.filter(h => h.id !== editHorse.id)); setEditHorse(null); } }} style={{ width: "100%", justifyContent: "center" }}>Remove Horse from Yard</Btn>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadowMd }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Horse</div>
              <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
              {[
                { key: "name", label: "Horse Name", placeholder: "e.g. Bob Olinger" },
                { key: "dob", label: "Date of Birth", type: "date" },
                { key: "sex", label: "Sex", type: "select", options: ["Gelding", "Mare", "Filly", "Colt", "Horse"] },
                { key: "colour", label: "Colour", placeholder: "e.g. Bay" },
                { key: "nhRating", label: "NH Rating", type: "number", placeholder: "e.g. 98" },
                { key: "flatRating", label: "Flat Rating", type: "number", placeholder: "e.g. 74" },
                { key: "discipline", label: "Discipline", type: "select", options: ["Hurdle", "Chase", "Flat", "Bumper"] },
                { key: "surface", label: "Surface", type: "select", options: ["Turf", "AWT"] },
                { key: "status", label: "Status", type: "select", options: ["Active", "CoolingOff", "Inactive"] },
                { key: "owner", label: "Owner", placeholder: "e.g. J. Murphy" },
                { key: "ownerPhone", label: "Owner WhatsApp", type: "tel", placeholder: "+353 86 000 0000" },
                { key: "ownerEmail", label: "Owner Email", type: "email", placeholder: "owner@email.com" },
                { key: "headgear", label: "Headgear", placeholder: "e.g. Cheekpieces" },
                { key: "nextRaceDate", label: "Next Target Date", type: "date" },
                { key: "notes", label: "Trainer Notes", placeholder: "Any notes" },
              ].map(({ key, label, placeholder, type, options }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select value={newHorse[key]} onChange={e => setNewHorse(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type || "text"} placeholder={placeholder} value={newHorse[key]} onChange={e => setNewHorse(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                  )}
                </div>
              ))}
              <Btn onClick={addHorse} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Add Horse to Yard</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MOVEMENT LOG ─────────────────────────────────────────────────────────────

export default YardView;
