import React, { useState } from "react";
import { Btn, Silk, C } from "./shared";

function RacedayPrint({ horses, entries, setEntries }) {
  const [showAdd, setShowAdd] = useState(false);
  const [csvStatus, setCsvStatus] = useState(null);
  const [ne, setNe] = useState({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceName: "", ballotNo: "" });

  const add = () => {
    if (!ne.horseId || !ne.raceName) return;
    setEntries(p => [...p, { ...ne, id: "e_" + Date.now() }]);
    setNe({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceName: "", ballotNo: "" });
    setShowAdd(false);
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        const rawLines = text.split("\n").filter(function(l) { return l.trim(); });
        const sep = rawLines[0].includes("\t") ? "\t" : ",";
        const headers = rawLines[0].split(sep).map(function(h) { return h.trim().toLowerCase().split(" ").join("_").split("\t").join("_").split("").filter(function(c){var n=c.charCodeAt(0);return(n>=97&&n<=122)||(n>=48&&n<=57)||c==="_";}).join(""); });
        const imported = [];
        for (let i = 1; i < rawLines.length; i++) {
          const cols = rawLines[i].split(sep).map(function(c) { var t=c.trim();if(t.length>1&&t[0]===String.fromCharCode(34)&&t[t.length-1]===String.fromCharCode(34)){return t.slice(1,-1);}return t; });
          if (!cols[0]) continue;
          const row = {};
          headers.forEach((h, idx) => { row[h] = cols[idx] || ""; });
          const horseName = row.horse || row.horse_name || row.name || cols[0];
          if (!horseName) continue;
          const matchHorse = (name) => {
            if (!name) return null;
            const nl = name.toLowerCase().trim();
            return horses.find(h =>
              h.name.toLowerCase().trim() === nl ||
              h.name.toLowerCase().trim().includes(nl) ||
              nl.includes(h.name.toLowerCase().trim())
            );
          };
          const horse = matchHorse(horseName);
          const rawDate = row.date || row.race_date || row.meeting_date || "";
          let parsedDate = "";
          if (rawDate) {
            const parts = rawDate.split("/").join("-").split(".").join("-").split("-");
            if (parts.length === 3) {
              if (parts[2] && parts[2].length === 4) {
                parsedDate = parts[2] + "-" + parts[1].padStart(2,"0") + "-" + parts[0].padStart(2,"0");
              } else if (parts[0] && parts[0].length === 4) {
                parsedDate = rawDate;
              } else {
                parsedDate = "20" + parts[2] + "-" + parts[1].padStart(2,"0") + "-" + parts[0].padStart(2,"0");
              }
            }
          }
          const extras = row.extras || row.extra || row.headgear || row.equipment || "";
          const headgearMap = { "H": "Hood", "T": "Tongue Strap", "B": "Blinkers", "C": "Cheekpieces", "V": "Visor", "EM": "Ear Muffs", "P": "Pacifiers", "TT": "Tongue Tie", "CP": "Cheekpieces", "BL": "Blinkers" };
          const headgear = headgearMap[extras.trim().toUpperCase()] || extras || "";
          const status = row.status || "";
          const ballotNo = status.toLowerCase().includes("ballot") ? status : (row.ballot || row.ballot_no || "");
          imported.push({
            id: "e_" + Date.now() + "_" + i,
            horseId: horse ? horse.id : "",
            horseName,
            venue: row.race || row.venue || row.racecourse || row.course || "",
            date: parsedDate || rawDate,
            raceTime: row.time || row.race_time || "",
            raceName: row.race_name || row.racename || "",
            meetingNo: row.meeting || row.meeting_no || "",
            raceRef: row.race_ref || row.raceref || "",
            ballotNo,
            headgear,
            jockey: row.jockey || "",
          });
        }
        setEntries(prev => [...prev, ...imported]);
        const matched = imported.filter(e => e.horseId).length;
        setCsvStatus(imported.length + " entries imported — " + matched + " horses matched");
        setTimeout(() => setCsvStatus(null), 5000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error reading CSV — check the file format");
        setTimeout(() => setCsvStatus(null), 5000);
      }
    };
    reader.readAsText(file);
  };

  const grouped = {};
  entries.forEach(function(e) { if (!e.date) return; if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Raceday Whiteboard</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Export pending engagements CSV from HRI RAS and upload here</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {csvStatus && (
            <span style={{ fontSize: 12, fontWeight: 700, color: csvStatus.includes("Error") ? C.red : C.green }}>
              {csvStatus}
            </span>
          )}
          <label style={{ background: C.blue, color: "#fff", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            📥 Import HRI CSV
            <input type="file" accept=".csv" onChange={handleCSV} style={{ display: "none" }} />
          </label>
          <Btn onClick={() => setShowAdd(true)}>+ Add Manual</Btn>
          <Btn variant="gold" onClick={() => window.print()}>🖨 Print</Btn>
        </div>
      </div>

      <div id="print-area">
        {Object.entries(grouped).sort(([a], [b]) => new Date(a) - new Date(b)).map(([date, dayEntries]) => (
          <div key={date} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", marginBottom: 14, boxShadow: C.shadow }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${C.navy}` }}>
              {new Date(date).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            {dayEntries.map(entry => {
              const horse = horses.find(h => h.id === entry.horseId);
              if (!horse) return null;
              return (
                <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ minWidth: 130, fontSize: 13, color: C.textMid, fontWeight: 600 }}>
                    {entry.venue} {entry.meetingNo && `Mtg ${entry.meetingNo}`}{entry.raceRef && ` · ${entry.raceRef}`}
                  </div>
                  <div style={{ minWidth: 80, fontSize: 14, fontWeight: 700, color: C.navy }}>{entry.raceTime}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: C.text, textTransform: "uppercase" }}>{horse.name}</span>
                    {horse.headgear && <span style={{ fontSize: 13, color: C.textMid, marginLeft: 8 }}>({horse.headgear})</span>}
                    {entry.ballotNo && <span style={{ fontSize: 13, color: C.purple, marginLeft: 8, fontWeight: 700 }}>[Ballot {entry.ballotNo}]</span>}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{entry.raceName}</div>
                </div>
              );
            })}
          </div>
        ))}
        {entries.length === 0 && <div style={{ padding: 40, textAlign: "center", border: `1.5px dashed ${C.border}`, borderRadius: 14, color: C.textMid }}>No entries added yet — tap + Add Entry</div>}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: C.shadowMd, overflow: "hidden" }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Raceday Entry</div>
              <button onClick={() => setShowAdd(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { key: "horseId", label: "Horse", type: "select" },
                { key: "venue", label: "Racecourse", placeholder: "e.g. Limerick" },
                { key: "meetingNo", label: "Meeting Number", placeholder: "e.g. 55" },
                { key: "raceRef", label: "Race Reference", placeholder: "e.g. Race A" },
                { key: "raceName", label: "Race Name", placeholder: "e.g. Mares Handicap Hurdle" },
                { key: "raceTime", label: "Race Time", placeholder: "e.g. 2:28 PM" },
                { key: "date", label: "Date", type: "date" },
                { key: "ballotNo", label: "Ballot No. (if applicable)", placeholder: "Leave blank if not balloted" },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                  {type === "select" ? (
                    <select value={ne[key]} onChange={e => setNe(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }}>
                      <option value="">Select horse</option>
                      {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  ) : (
                    <input type={type || "text"} placeholder={placeholder} value={ne[key]} onChange={e => setNe(function(p) { return Object.assign({}, p, { [key]: e.target.value }); })} style={{ width: "100%", background: C.cardOff, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13, outline: "none" }} />
                  )}
                </div>
              ))}
              <Btn onClick={add} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>Add to Whiteboard</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── YARD VIEW ────────────────────────────────────────────────────────────────

export default RacedayPrint;
