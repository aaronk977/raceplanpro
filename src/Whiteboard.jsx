import React, { useState, useRef } from "react";
import { Btn, C, ANTHROPIC_KEY } from "./shared";

var PRINT_STYLE = [
  "@page { size: A4; margin: 1cm; }",
  "body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 16px; background: white; color: black; -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
  ".day-block { margin-bottom: 32pt; page-break-inside: avoid; }",
  ".day-header { border-bottom: 4pt solid #000; padding-bottom: 10pt; margin-bottom: 14pt; }",
  ".day-name { font-size: 52pt; font-weight: 900; line-height: 1; text-transform: uppercase; color: #000; }",
  ".day-venue { font-size: 40pt; font-weight: 900; color: #c9952a; line-height: 1.05; text-transform: uppercase; margin-top: 2pt; -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
  ".day-date { font-size: 26pt; font-weight: 700; color: #000; margin-top: 4pt; }",
  ".meeting-num { font-size: 16pt; color: #555; margin-top: 4pt; }",
  ".horse-row { display: flex; align-items: center; gap: 14pt; border-bottom: 1.5pt solid #ccc; padding: 10pt 0; }",
  ".race-ref { min-width: 70pt; text-align: center; font-size: 42pt; font-weight: 900; color: #000; line-height: 1; }",
  ".race-venue { font-size: 9pt; color: #666; text-align: center; }",
  ".race-time { min-width: 70pt; font-size: 20pt; font-weight: 700; color: #000; }",
  ".horse-info { flex: 1; }",
  ".horse-name { font-size: 30pt; font-weight: 900; text-transform: uppercase; color: #000; line-height: 1.1; }",
  ".horse-meta { font-size: 12pt; color: #444; margin-top: 4pt; }",
  ".badge-hg { display: inline-block; background: #6d3fc0 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 2pt 8pt; border-radius: 4pt; font-size: 12pt; font-weight: 700; margin-right: 4pt; }",
  ".badge-ballot { display: inline-block; background: #d97706 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 2pt 8pt; border-radius: 4pt; font-size: 12pt; font-weight: 700; margin-right: 4pt; }"
].join(" ");

var HEADGEAR = {
  "H": "Hood", "T": "Tongue Strap", "TS": "Tongue Strap", "TT": "Tongue Tie",
  "B": "Blinkers", "BL": "Blinkers", "C": "Cheekpieces", "CP": "Cheekpieces",
  "V": "Visor", "E": "Eyeshield", "N": "Noseband"
};

function parseDate(raw) {
  if (!raw) return "";
  var s = raw.trim();
  if (!s) return "";
  if (s.length >= 10 && s[4] === "-" && s[7] === "-") return s.slice(0, 10);
  var native = new Date(s);
  if (!isNaN(native.getTime())) {
    var y = native.getFullYear();
    var mo = String(native.getMonth() + 1).padStart(2, "0");
    var d = String(native.getDate()).padStart(2, "0");
    return y + "-" + mo + "-" + d;
  }
  return s;
}

function RacedayPrint({ horses }) {
  var entriesState = useState([]);
  var entries = entriesState[0]; var setEntries = entriesState[1];
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var csvStatusState = useState(null);
  var csvStatus = csvStatusState[0]; var setCsvStatus = csvStatusState[1];
  var neState = useState({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceName: "", ballotNo: "", headgear: "", jockey: "" });
  var ne = neState[0]; var setNe = neState[1];
  var fileRef = useRef(null);

  function removeEntry(id) {
    setEntries(function(p) { return p.filter(function(e) { return e.id !== id; }); });
  }

  function updateNe(key, val) {
    setNe(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  function addEntry() {
    if (!ne.horseId && !ne.horseName) return;
    var h = horses.find(function(x) { return x.id === ne.horseId; });
    setEntries(function(p) { return p.concat([Object.assign({}, ne, { id: "e_" + Date.now(), horseName: h ? h.name : ne.horseName })]); });
    setNe({ horseId: "", meetingNo: "", raceRef: "", venue: "", date: "", raceTime: "", raceName: "", ballotNo: "", headgear: "", jockey: "" });
    setShowAdd(false);
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
          return h.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        });
        var imported = [];
        for (var i = 1; i < rawLines.length; i++) {
          var cols = rawLines[i].split(sep).map(function(c) {
            var t = c.trim();
            if (t.length > 1 && t[0] === '"' && t[t.length-1] === '"') return t.slice(1,-1);
            return t;
          });
          if (!cols[0]) continue;
          var row = {};
          for (var j = 0; j < headers.length; j++) { row[headers[j]] = cols[j] || ""; }

          // CSV columns: Date, Meeting, Race, Race Name, Horse, Jockey, Extras, Status
          var horseName = (row.horse || row.horse_name || row.name || "").trim();
          if (!horseName) continue;
          var horse = null;
          for (var hi = 0; hi < horses.length; hi++) {
            var hl = horses[hi].name.toLowerCase().trim();
            var nl = horseName.toLowerCase().trim();
            if (hl === nl || hl.indexOf(nl) >= 0 || nl.indexOf(hl) >= 0) { horse = horses[hi]; break; }
          }

          // Meeting = "131B" -> meetingNo="131", raceRef="B"
          var mtgRaw = (row.meeting || "").toString().trim();
          var mtgLast = mtgRaw.length > 0 ? mtgRaw[mtgRaw.length - 1] : "";
          var raceRefVal = (mtgLast >= "A" && mtgLast <= "Z") ? mtgLast : "";
          var mtgNumVal = raceRefVal ? mtgRaw.slice(0, -1) : mtgRaw;

          // Race = venue (e.g. "Limerick")
          var venue = (row.race || "").trim();

          // Race Name = individual race name
          var raceName = (row.race_name || row.racename || "").trim();

          // Extras = headgear code
          var extrasRaw = (row.extras || row.extra || row.headgear || "").trim().toUpperCase();
          var headgear = HEADGEAR[extrasRaw] || (extrasRaw.length > 0 && extrasRaw.length <= 4 ? extrasRaw : "");

          // Status = ballot
          var statusRaw = (row.status || "").trim();
          var ballotNo = "";
          if (statusRaw.toLowerCase().indexOf("ballot") >= 0) {
            var pOpen = statusRaw.lastIndexOf("(");
            var pClose = statusRaw.lastIndexOf(")");
            if (pOpen >= 0 && pClose > pOpen) {
              var num = statusRaw.slice(pOpen + 1, pClose).trim();
              ballotNo = num ? "Ballot " + num : "Balloted";
            } else {
              ballotNo = "Balloted";
            }
          }

          imported.push({
            id: "e_" + Date.now() + "_" + i,
            horseId: horse ? horse.id : "",
            horseName: horseName,
            venue: venue,
            date: parseDate(row.date || row.race_date || ""),
            raceTime: row.time || row.race_time || "",
            raceName: raceName,
            meetingNo: mtgNumVal,
            raceRef: raceRefVal,
            ballotNo: ballotNo,
            headgear: headgear,
            jockey: row.jockey || "",
          });
        }
        setEntries(function(prev) { return prev.concat(imported); });
        var matched = 0;
        for (var mi = 0; mi < imported.length; mi++) { if (imported[mi].horseId) matched++; }
        setCsvStatus(imported.length + " entries imported, " + matched + " horses matched");
        setTimeout(function() { setCsvStatus(null); }, 5000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error reading CSV");
        setTimeout(function() { setCsvStatus(null); }, 4000);
      }
    };
    reader.readAsText(file);
  }

  // Group by date
  var grouped = {};
  for (var gi = 0; gi < entries.length; gi++) {
    var ent = entries[gi];
    if (!ent.date) continue;
    if (!grouped[ent.date]) grouped[ent.date] = [];
    grouped[ent.date].push(ent);
  }
  var sortedDates = Object.keys(grouped).sort();

  function doPrint() {
    var grouped2 = {};
    entries.forEach(function(e) {
      var d = e.date || "no-date";
      if (!grouped2[d]) grouped2[d] = [];
      grouped2[d].push(e);
    });
    var sortedD = Object.keys(grouped2).sort();
    var body2 = sortedD.map(function(date) {
      var dObj2 = new Date(date + "T12:00:00");
      var dName = isNaN(dObj2.getTime()) ? "" : dObj2.toLocaleDateString("en-IE", { weekday: "long" }).toUpperCase();
      var dStr = isNaN(dObj2.getTime()) ? date : dObj2.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
      var dayEnts = grouped2[date];
      var venue0 = (dayEnts[0] && dayEnts[0].venue) ? dayEnts[0].venue.toUpperCase() : "";
      var mtgE = dayEnts.find(function(e) { return e.meetingNo; });
      var mtgN = mtgE ? mtgE.meetingNo : "";
      var fullHeader = dName + (venue0 ? " " + venue0 : "");
      var rows = dayEnts.map(function(entry) {
        var h = horses.find(function(x) { return x.id === entry.horseId; });
        var name = h ? h.name : (entry.horseName || "");
        if (!name) return "";
        var hg = entry.headgear || (h && h.headgear) || "";
        var jock = entry.jockey || (h && h.jockey) || "";
        var ballot = entry.ballotNo || "";
        var ref = entry.raceRef || "";
        return "<div class='horse-row'>" +
          "<div><div class='race-ref'>" + ref + "</div><div class='race-venue'>" + (entry.venue || "") + "</div></div>" +
          "<div class='race-time'>" + (entry.raceTime || "") + "</div>" +
          "<div class='horse-info'><div class='horse-name'>" + name.toUpperCase() + "</div>" +
          "<div class='horse-meta'>" + (hg ? "<span class='badge-hg'>" + hg + "</span>" : "") + (ballot ? "<span class='badge-ballot'>" + ballot + "</span>" : "") + (jock ? " " + jock : "") + "</div>" +
          "</div></div>";
      }).join("");
      return "<div class='day-block'><div class='day-header'>" +
        "<div class='day-name'>" + dName + "</div>" +
        (venue0 ? "<div class='day-venue'>" + venue0 + "</div>" : "") +
        "<div class='day-date'>" + dStr + "</div>" +
        (mtgN ? "<div class='meeting-num'>Meeting " + mtgN + "</div>" : "") +
        "</div>" + rows + "</div>";
    }).join("");
    var win = window.open("", "_blank");
    win.document.write("<html><head><title>RacePlan Pro - Whiteboard</title><style>" + PRINT_STYLE + "</style></head><body>" + body2 + "</body></html>");
    win.document.close();
    win.focus();
    setTimeout(function() { win.print(); }, 600);
  }

  var FIELDS = [
    { key: "horseId", label: "Horse", type: "horse-select" },
    { key: "date", label: "Date", type: "date" },
    { key: "raceTime", label: "Time", type: "text", placeholder: "14:15" },
    { key: "venue", label: "Venue", type: "text", placeholder: "Limerick" },
    { key: "meetingNo", label: "Meeting No.", type: "text", placeholder: "131" },
    { key: "raceRef", label: "Race Ref (A,B,C...)", type: "text", placeholder: "B" },
    { key: "raceName", label: "Race Name", type: "text", placeholder: "EBF Mares Chase" },
    { key: "jockey", label: "Jockey", type: "text", placeholder: "D. O'Keeffe" },
    { key: "headgear", label: "Headgear", type: "text", placeholder: "Hood, Tongue Strap..." },
    { key: "ballotNo", label: "Ballot No.", type: "text", placeholder: "Ballot 4" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Raceday Whiteboard</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="ghost" onClick={function() { fileRef.current && fileRef.current.click(); }}>Import CSV</Btn>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" style={{ display: "none" }} onChange={handleCSV} />
          <Btn onClick={function() { setShowAdd(true); }}>+ Add Entry</Btn>
          <Btn variant="ghost" onClick={function() { if (window.confirm("Clear all entries?")) setEntries([]); }}>Clear</Btn>
          <Btn variant="gold" onClick={doPrint}>Print / PDF</Btn>
        </div>
      </div>

      {csvStatus && (
        <div style={{ background: C.green + "15", border: "1px solid " + C.green + "40", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: C.green, fontWeight: 600 }}>
          {csvStatus}
        </div>
      )}

      {sortedDates.length === 0 && (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          Import your pending engagements CSV from HRI or add entries manually
        </div>
      )}

      {sortedDates.map(function(date) {
        var dayEntries = grouped[date];
        var dObj = new Date(date + "T12:00:00");
        var dayOfWeek = isNaN(dObj.getTime()) ? "" : dObj.toLocaleDateString("en-IE", { weekday: "long" }).toUpperCase();
        var venue = (dayEntries[0] && dayEntries[0].venue) ? dayEntries[0].venue.toUpperCase() : "";
        var dayName = dayOfWeek + (venue ? " " + venue : "");
        var dateStr = isNaN(dObj.getTime()) ? date : dObj.toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
        var mtgEntry = dayEntries.find(function(e) { return e.meetingNo; });
        var mtgNum = mtgEntry ? mtgEntry.meetingNo : "";
        return (
          <div key={date} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
            <div className="meeting-header" style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "3px solid " + C.navy }}>
              <div style={{ fontSize: 72, fontWeight: 900, color: C.navy, lineHeight: 1, letterSpacing: -2, textTransform: "uppercase" }}>{dayOfWeek}</div>
              {venue ? <div style={{ fontSize: 48, fontWeight: 900, color: C.gold, lineHeight: 1.05, letterSpacing: -1, textTransform: "uppercase", marginTop: 2 }}>{venue}</div> : null}
              <div style={{ fontSize: 36, fontWeight: 800, color: C.navy, lineHeight: 1.2, marginTop: 4 }}>{dateStr}</div>
              {mtgNum ? <div style={{ fontSize: 22, fontWeight: 700, color: C.textMid, marginTop: 4 }}>{"Meeting " + mtgNum}</div> : null}
            </div>
            <div>
              {dayEntries.map(function(entry) {
                var horse = horses.find(function(h) { return h.id === entry.horseId; });
                var displayName = horse ? horse.name : entry.horseName;
                if (!displayName) return null;
                var hg = entry.headgear || (horse && horse.headgear) || "";
                var raceRef = entry.raceRef || "";
                return (
                  <div key={entry.id} className="horse-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: "1px solid " + C.cardOff }}>
                    <div className="venue-ref" style={{ minWidth: 100, textAlign: "center" }}>
                      {raceRef ? <div style={{ fontSize: 48, fontWeight: 900, color: C.navy, lineHeight: 1 }}>{raceRef}</div> : null}
                      {entry.venue ? <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{entry.venue}</div> : null}
                    </div>
                    <div className="race-time" style={{ minWidth: 80, fontSize: 14, fontWeight: 700, color: C.navy }}>{entry.raceTime}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="horse-name" style={{ fontSize: 17, fontWeight: 800, color: C.text, textTransform: "uppercase" }}>{displayName}</span>
                        {hg && <span className="badge-hg" style={{ fontSize: 12, color: "#fff", fontWeight: 700, background: C.purple, padding: "2px 8px", borderRadius: 20 }}>{hg}</span>}
                        {entry.ballotNo && <span className="badge-ballot" style={{ fontSize: 12, color: "#fff", fontWeight: 700, background: C.amber, padding: "2px 8px", borderRadius: 20 }}>{entry.ballotNo}</span>}
                      </div>
                      {entry.jockey && <div className="jockey-line" style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{"J: " + entry.jockey}</div>}
                      {entry.raceName && <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{entry.raceName}</div>}
                    </div>
                    <button onClick={function() { removeEntry(entry.id); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18, padding: "2px 6px" }}>x</button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {showAdd && (
        <div onClick={function() { setShowAdd(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function(e) { e.stopPropagation(); }} style={{ background: C.card, borderRadius: 16, padding: "24px", maxWidth: 480, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 16 }}>Add Raceday Entry</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {FIELDS.map(function(field) {
                return (
                  <div key={field.key} style={{ gridColumn: field.key === "horseId" || field.key === "raceName" ? "1 / -1" : "auto" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>{field.label}</div>
                    {field.type === "horse-select" ? (
                      <select value={ne.horseId} onChange={function(e) { updateNe("horseId", e.target.value); }}
                        style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                        <option value="">Select horse...</option>
                        {horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; }).sort(function(a,b){return a.name.localeCompare(b.name);}).map(function(h) {
                          return <option key={h.id} value={h.id}>{h.name}</option>;
                        })}
                      </select>
                    ) : (
                      <input type={field.type} placeholder={field.placeholder} value={ne[field.key] || ""}
                        onChange={function(e) { var v = e.target.value; var k = field.key; updateNe(k, v); }}
                        style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={addEntry}>Save</Btn>
              <Btn variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RacedayPrint;
