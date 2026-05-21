import React, { useState } from "react"; // v2
import { Btn, Silk, C } from "./shared";

var PRINT_STYLE = [
  "@media print {",
  "  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }",
  "  body * { visibility: hidden !important; }",
  "  #print-area, #print-area * { visibility: visible !important; }",
  "  #print-area { position: fixed; left: 0; top: 0; width: 100%; padding: 16px 24px; background: white; }",
  "  #print-area .horse-row { border-bottom: 2.5px solid #222 !important; padding: 14px 0 !important; display: flex; align-items: center; gap: 16px; }",
  "  #print-area .horse-name { font-size: 26pt !important; font-weight: 900 !important; color: #000 !important; text-transform: uppercase !important; letter-spacing: 0.5pt !important; line-height: 1.1 !important; }",
  "  #print-area .badge-hg { font-size: 16pt !important; padding: 4pt 14pt !important; background: #6d3fc0 !important; color: #fff !important; border-radius: 6pt !important; font-weight: 800 !important; margin-left: 10pt !important; }",
  "  #print-area .badge-ballot { font-size: 16pt !important; padding: 4pt 14pt !important; background: #d97706 !important; color: #fff !important; border-radius: 6pt !important; font-weight: 800 !important; margin-left: 6pt !important; }",
  "  #print-area .meeting-header { font-size: 20pt !important; font-weight: 900 !important; color: #000 !important; border-bottom: 3px solid #000 !important; padding-bottom: 8pt !important; margin-bottom: 8pt !important; text-transform: uppercase !important; letter-spacing: 1pt !important; }",
  "  #print-area .race-time { font-size: 18pt !important; font-weight: 700 !important; color: #000 !important; min-width: 80pt !important; }",
  "  #print-area .venue-ref { font-size: 14pt !important; color: #333 !important; min-width: 100pt !important; }",
  "  #print-area .jockey-line { font-size: 13pt !important; color: #444 !important; margin-top: 3pt !important; }",
  "  @page { margin: 1.2cm; size: A4; }",
  "}"
].join(" ");

function RacedayPrint({ horses, entries, setEntries }) {
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var csvStatusState = useState(null);
  var csvStatus = csvStatusState[0]; var setCsvStatus = csvStatusState[1];
  var emptyNe = { horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceName: "", ballotNo: "", headgear: "", jockey: "" };
  var neState = useState(emptyNe);
  var ne = neState[0]; var setNe = neState[1];

  var HEADGEAR = { "H": "Hood", "T": "Tongue Strap", "TT": "Tongue Tie", "B": "Blinkers", "BL": "Blinkers", "C": "Cheekpieces", "CP": "Cheekpieces", "V": "Visor", "EM": "Ear Muffs" };

  var MONTH_MAP = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12,
    january:1,february:2,march:3,april:4,june:6,july:7,august:8,september:9,october:10,november:11,december:12 };

  function parseDate(raw) {
    if (!raw) return "";
    var s = raw.trim();
    if (!s) return "";
    // Already YYYY-MM-DD
    if (s.length === 10 && s[4] === "-" && s[7] === "-") return s;
    // Try native Date parse for formats like "14 May 2025" or "May 14, 2025"
    var native = new Date(s);
    if (!isNaN(native.getTime())) {
      var y = native.getFullYear();
      var mo = String(native.getMonth() + 1).padStart(2, "0");
      var d = String(native.getDate()).padStart(2, "0");
      return y + "-" + mo + "-" + d;
    }
    // Normalise separators
    var norm = s.split("/").join("-").split(".").join("-").split(" ").join("-");
    var parts = norm.split("-").filter(function(p) { return p.length > 0; });
    if (parts.length < 3) return "";
    var p0 = parts[0]; var p1 = parts[1]; var p2 = parts[2];
    // Check for month name in any position
    var m0 = MONTH_MAP[p0.toLowerCase()];
    var m1 = MONTH_MAP[p1.toLowerCase()];
    var m2 = MONTH_MAP[p2.toLowerCase()];
    var year, month, day;
    if (m1) {
      // DD-MonthName-YY or DD-MonthName-YYYY
      day = parseInt(p0); month = m1;
      year = parseInt(p2);
      if (year < 100) year += 2000;
    } else if (m0) {
      // MonthName-DD-YYYY
      month = m0; day = parseInt(p1);
      year = parseInt(p2);
      if (year < 100) year += 2000;
    } else {
      // All numeric
      var n0 = parseInt(p0); var n1 = parseInt(p1); var n2 = parseInt(p2);
      if (p2.length === 4 || n2 > 31) {
        // DD-MM-YYYY
        day = n0; month = n1; year = n2;
      } else if (p0.length === 4 || n0 > 31) {
        // YYYY-MM-DD
        year = n0; month = n1; day = n2;
      } else {
        // Assume DD-MM-YY
        day = n0; month = n1; year = n2 + 2000;
      }
    }
    if (!year || !month || !day) return "";
    if (month < 1 || month > 12) return "";
    if (day < 1 || day > 31) return "";
    return year + "-" + String(month).padStart(2,"0") + "-" + String(day).padStart(2,"0");
  }

  function addEntry() {
    if (!ne.horseId || !ne.venue) return;
    setEntries(function(p) { return p.concat([Object.assign({}, ne, { id: "e_" + Date.now() })]); });
    setNe(emptyNe);
    setShowAdd(false);
  }

  function removeEntry(id) {
    setEntries(function(p) { return p.filter(function(e) { return e.id !== id; }); });
  }

  function updateNe(key, val) {
    setNe(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  function handleCSV(ev) {
    var file = ev.target.files[0];
    if (!file) return;
    ev.target.value = "";
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var text = e.target.result;
        var rawLines = text.split("\n").filter(function(l) { return l.trim(); });
        var sep = rawLines[0].indexOf("\t") >= 0 ? "\t" : ",";
        var headers = rawLines[0].split(sep).map(function(h) {
          return h.trim().toLowerCase().split(" ").join("_").split("\t").join("_").replace(/[^a-z0-9_]/g, "");
        });
        var imported = [];
        for (var i = 1; i < rawLines.length; i++) {
          var cols = rawLines[i].split(sep).map(function(c) {
            var t = c.trim();
            if (t.length > 1 && t[0] === '"' && t[t.length - 1] === '"') return t.slice(1, -1);
            return t;
          });
          if (!cols[0]) continue;
          var row = {};
          for (var j = 0; j < headers.length; j++) { row[headers[j]] = cols[j] || ""; }
          var horseName = row.horse || row.horse_name || row.name || cols[0];
          if (!horseName) continue;
          var nl = horseName.toLowerCase().trim();
          var horse = null;
          for (var hi = 0; hi < horses.length; hi++) {
            var hl = horses[hi].name.toLowerCase().trim();
            if (hl === nl || hl.indexOf(nl) >= 0 || nl.indexOf(hl) >= 0) { horse = horses[hi]; break; }
          }
          var rawDate = row.date || row.race_date || "";
          var parsedDate = "";
          if (rawDate) {
            parsedDate = parseDate(rawDate);
          }
          var extrasRaw = (row.extras || row.extra || row.headgear || "").trim().toUpperCase();
          var headgear = HEADGEAR[extrasRaw] || (extrasRaw.length > 0 && extrasRaw.length <= 4 ? extrasRaw : "");
          var statusRaw = row.status || "";
          var ballotNo = statusRaw.toLowerCase().indexOf("ballot") >= 0 ? statusRaw : (row.ballot || row.ballot_no || "");
          imported.push({
            id: "e_" + Date.now() + "_" + i,
            horseId: horse ? horse.id : "",
            horseName: horseName,
            venue: row.race || row.venue || row.racecourse || row.course || "",
            date: parsedDate,
            raceTime: row.time || row.race_time || "",
            raceName: row.race_name || row.racename || "",
            meetingNo: row.meeting || row.meeting_no || "",
            raceRef: row.race_ref || row.raceref || "",
            ballotNo: ballotNo,
            headgear: headgear,
            jockey: row.jockey || "",
          });
        }
        setEntries(function(prev) { return prev.concat(imported); });
        var matched = 0;
        for (var mi = 0; mi < imported.length; mi++) { if (imported[mi].horseId) matched++; }
        setCsvStatus(imported.length + " entries imported - " + matched + " horses matched");
        setTimeout(function() { setCsvStatus(null); }, 5000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error reading CSV");
        setTimeout(function() { setCsvStatus(null); }, 4000);
      }
    };
    reader.readAsText(file);
  }

  var grouped = {};
  for (var gi = 0; gi < entries.length; gi++) {
    var ent = entries[gi];
    if (!ent.date) continue;
    if (!grouped[ent.date]) grouped[ent.date] = [];
    grouped[ent.date].push(ent);
  }
  var sortedDates = Object.keys(grouped).sort(function(a, b) { return new Date(a) - new Date(b); });

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLE }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Raceday Whiteboard</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Import pending engagements CSV or add entries manually</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <label style={{ background: C.cardOff, border: "1.5px solid " + C.border, color: C.textMid, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Import CSV
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleCSV} style={{ display: "none" }} />
          </label>
          <Btn onClick={function() { setShowAdd(true); }}>+ Add Entry</Btn>
          <Btn variant="ghost" onClick={function() { if (window.confirm("Clear all entries?")) setEntries(function() { return []; }); }} style={{ color: C.red, borderColor: C.red, fontSize: 12 }}>Clear All</Btn>
          <Btn variant="gold" onClick={function() { window.print(); }}>Print</Btn>
        </div>
      </div>

      {csvStatus && (
        <div style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: C.green, fontWeight: 600 }}>
          {csvStatus}
        </div>
      )}

      <div id="print-area">
        {sortedDates.map(function(date) {
          var dayEntries = grouped[date];
          return (
            <div key={date} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
              <div className="meeting-header" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "3px solid " + C.navy }}>
                <div style={{ fontSize: 72, fontWeight: 900, color: C.navy, lineHeight: 1, letterSpacing: -2, textTransform: "uppercase" }}>
                  {(function() { var d = new Date(date + "T12:00:00"); return isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-IE", { weekday: "long" }); })()}
                </div>
                <div style={{ fontSize: 36, fontWeight: 800, color: C.navy, lineHeight: 1.2, marginTop: 4 }}>
                  {(function() { var d = new Date(date + "T12:00:00"); return isNaN(d.getTime()) ? date : d.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" }); })()}
                </div>
                {(function() {
                  var mtgEntry = dayEntries.find(function(e) { return e.meetingNo; });
                  if (!mtgEntry) return null;
                  return <div style={{ fontSize: 28, fontWeight: 800, color: C.textMid, marginTop: 6 }}>{"Meeting " + mtgEntry.meetingNo}</div>;
                })()}
              </div>
              {dayEntries.map(function(entry) {
                var horse = horses.find(function(h) { return h.id === entry.horseId; });
                var displayName = horse ? horse.name : entry.horseName;
                if (!displayName) return null;
                var hg = entry.headgear || (horse && horse.headgear) || "";
                return (
                  <div key={entry.id} className="horse-row" style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0", borderBottom: "1px solid " + C.border }}>
                    <div className="venue-ref" style={{ minWidth: 130, fontSize: 13, color: C.textMid, fontWeight: 600 }}>
                      <div style={{ fontWeight: 700, color: C.text }}>{entry.venue}</div>
                      {entry.meetingNo && <div>{"Mtg " + entry.meetingNo}</div>}
                      {entry.raceRef && <div>{entry.raceRef}</div>}
                    </div>
                    <div className="race-time" style={{ minWidth: 80, fontSize: 14, fontWeight: 700, color: C.navy }}>{entry.raceTime}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="horse-name" style={{ fontSize: 17, fontWeight: 800, color: C.text, textTransform: "uppercase" }}>{displayName}</span>
                        {hg && <span className="badge-hg" style={{ fontSize: 12, color: "#fff", fontWeight: 700, background: C.purple, padding: "2px 8px", borderRadius: 6, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>{hg}</span>}
                        {entry.ballotNo && <span className="badge-ballot" style={{ fontSize: 12, color: "#fff", fontWeight: 700, background: C.amber, padding: "2px 8px", borderRadius: 6, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>{"Ballot " + entry.ballotNo}</span>}
                      </div>
                      {entry.jockey && <div className="jockey-line" style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{"Jockey: " + entry.jockey}</div>}
                      {entry.raceName && <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{entry.raceName}</div>}
                    </div>
                    <button onClick={function() { removeEntry(entry.id); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18, padding: "0 4px" }}>x</button>
                  </div>
                );
              })}
            </div>
          );
        })}
        {entries.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
            Import your pending engagements CSV from HRI or add entries manually
          </div>
        )}
      </div>

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: C.shadowMd, overflow: "hidden", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Raceday Entry</div>
              <button onClick={function() { setShowAdd(false); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer" }}>x</button>
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
                { key: "ballotNo", label: "Ballot No.", placeholder: "Leave blank if not balloted" },
                { key: "headgear", label: "Headgear", placeholder: "e.g. Hood, Tongue Strap" },
                { key: "jockey", label: "Jockey", placeholder: "e.g. D.J. O Keeffe" },
              ].map(function(field) {
                return (
                  <div key={field.key}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                    {field.type === "select" ? (
                      <select value={ne[field.key]} onChange={function(e) { updateNe(field.key, e.target.value); }}
                        style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13 }}>
                        <option value="">Select horse</option>
                        {horses.map(function(h) { return <option key={h.id} value={h.id}>{h.name}</option>; })}
                      </select>
                    ) : (
                      <input type={field.type || "text"} placeholder={field.placeholder} value={ne[field.key] || ""}
                        onChange={function(e) { updateNe(field.key, e.target.value); }}
                        style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13 }} />
                    )}
                  </div>
                );
              })}
              <Btn onClick={addEntry} style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>Add to Whiteboard</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RacedayPrint;
