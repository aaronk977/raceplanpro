import React, { useState } from "react";
import { Btn, Tag, Silk, StatusPill, FormDots, C, TODAY, daysUntil, canRace, getAge, SILKS } from "./shared";

function YardView({ horses, setHorses }) {
  var todayStr = TODAY.toISOString().slice(0, 10);
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var editHorseState = useState(null);
  var editHorse = editHorseState[0]; var setEditHorse = editHorseState[1];
  var csvStatusState = useState(null);
  var csvStatus = csvStatusState[0]; var setCsvStatus = csvStatusState[1];

  var emptyHorse = { name: "", dob: "", sex: "Gelding", colour: "", nhRating: "", flatRating: "", hurdleRating: "", chaseRating: "", discipline: "Hurdle", surface: "Turf", status: "Active", owner: "", ownerPhone: "", ownerEmail: "", headgear: "", jockey: "", nextRaceDate: "", notes: "" };
  var newHorseState = useState(emptyHorse);
  var newHorse = newHorseState[0]; var setNewHorse = newHorseState[1];

  var SEX_MAP = { "G": "Gelding", "M": "Mare", "F": "Filly", "C": "Colt", "H": "Horse", "g": "Gelding", "m": "Mare", "f": "Filly", "c": "Colt", "h": "Horse", "gelding": "Gelding", "mare": "Mare", "filly": "Filly", "colt": "Colt", "horse": "Horse" };

  function normHeader(h) {
    var out = h.trim().toLowerCase();
    var result = "";
    for (var i = 0; i < out.length; i++) {
      var c = out[i];
      if ((c >= "a" && c <= "z") || (c >= "0" && c <= "9") || c === "_") result += c;
      else if (c === " " || c === "\t") result += "_";
    }
    return result;
  }

  function parseCol(c) {
    var t = c.trim();
    if (t.length > 1 && t[0] === '"' && t[t.length - 1] === '"') return t.slice(1, -1);
    return t;
  }

  function handleCSV(e) {
    var file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var text = ev.target.result;
        var rawLines = text.split("\n").filter(function(l) { return l.trim(); });
        var sep = rawLines[0].indexOf("\t") >= 0 ? "\t" : ",";
        var headers = rawLines[0].split(sep).map(normHeader);
        var imported = [];
        for (var i = 1; i < rawLines.length; i++) {
          var cols = rawLines[i].split(sep).map(parseCol);
          if (!cols[0]) continue;
          var row = {};
          for (var j = 0; j < headers.length; j++) { row[headers[j]] = cols[j] || ""; }
          var name = row.horse_name || row.horse || cols[0];
          if (!name) continue;
          var yof = parseInt(row.yof) || null;
          var sexRaw = (row.sex || "").trim();
          var sex = SEX_MAP[sexRaw] || SEX_MAP[sexRaw.toLowerCase()] || (sexRaw.length > 1 ? sexRaw : "Gelding");
          var statusRaw = (row.status || "").toLowerCase();
          var status = statusRaw.indexOf("inactive") >= 0 ? "Inactive" : statusRaw.indexOf("cool") >= 0 ? "CoolingOff" : "Active";
          imported.push({
            id: "h_" + Date.now() + "_" + i,
            name: name, dob: yof ? yof + "-01-01" : "", sex: sex,
            colour: row.colour || row.color || "", owner: row.owner || "",
            ownerPhone: "", ownerEmail: "", status: status, activationDate: null,
            nhRating: null, flatRating: null, hurdleRating: null, chaseRating: null, awtRating: null,
            discipline: [], surface: "Turf", headgear: "", jockey: "", trainer: "",
            nextRaceDate: "", notes: "", isEBF: false, isMaiden: true, isNovice: false,
            goingPref: [], distanceMin: 16, distanceMax: 24,
            silk: SILKS[Math.floor(Math.random() * SILKS.length)],
            form: [], provisionalEntries: [],
          });
        }
        setHorses(function(prev) {
          var updated = prev.slice();
          for (var ii = 0; ii < imported.length; ii++) {
            var imp = imported[ii];
            var found = -1;
            for (var jj = 0; jj < updated.length; jj++) {
              if (updated[jj].name.toLowerCase().trim() === imp.name.toLowerCase().trim()) { found = jj; break; }
            }
            if (found >= 0) {
              updated[found] = Object.assign({}, updated[found], imp, { id: updated[found].id, silk: updated[found].silk, form: updated[found].form });
            } else {
              updated.push(imp);
            }
          }
          return updated;
        });
        setCsvStatus(imported.length + " horses imported from HRI");
        setTimeout(function() { setCsvStatus(null); }, 5000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error reading file");
        setTimeout(function() { setCsvStatus(null); }, 5000);
      }
    };
    reader.readAsText(file);
  }

  function handleRatingsCSV(e) {
    var file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var text = ev.target.result;
        var rawLines = text.split("\n").filter(function(l) { return l.trim(); });
        var sep = rawLines[0].indexOf("\t") >= 0 ? "\t" : ",";
        var headers = rawLines[0].split(sep).map(normHeader);
        var updatedCount = 0;
        setHorses(function(prev) {
          var list = prev.slice();
          for (var i = 1; i < rawLines.length; i++) {
            var cols = rawLines[i].split(sep).map(parseCol);
            if (!cols[0]) continue;
            var row = {};
            for (var j = 0; j < headers.length; j++) { row[headers[j]] = cols[j] || ""; }
            var name = row.horse_name || row.horse || cols[0];
            if (!name) continue;
            var flat = parseInt(row.flat || row.flat_rating || row.flatrating || row.turf || row.official_flat || "") || null;
            var awt = parseInt(row.awt || row.all_weather || row.allweather || row.aw || "") || null;
            var hurdle = parseInt(row.hurdle || row.hurdle_rating || row.hurdlerating || row.hdl || row.hurdles || "") || null;
            var chase = parseInt(row.chase || row.chase_rating || row.chaserating || row.chs || row.chases || "") || null;
            var nh = parseInt(row.nh_rating || row.nhrating || row.nh || row.national_hunt || row.official_nh || "") || null;
            var generic = parseInt(row.rating || row.official_rating || row.mark || row.handicap_mark || "") || null;
            var found = -1;
            var nl = name.toLowerCase().trim();
            for (var jj = 0; jj < list.length; jj++) {
              if (list[jj].name.toLowerCase().trim() === nl) { found = jj; break; }
            }
            if (found >= 0) {
              var h = list[found];
              list[found] = Object.assign({}, h, {
                flatRating: flat || awt || h.flatRating,
                awtRating: awt || h.awtRating,
                nhRating: nh || hurdle || chase || generic || h.nhRating,
                hurdleRating: hurdle || h.hurdleRating,
                chaseRating: chase || h.chaseRating,
              });
              updatedCount++;
            }
          }
          return list;
        });
        setCsvStatus(updatedCount + " horses updated with ratings");
        setTimeout(function() { setCsvStatus(null); }, 5000);
      } catch (err) {
        console.error(err);
        setCsvStatus("Error reading ratings file");
        setTimeout(function() { setCsvStatus(null); }, 5000);
      }
    };
    reader.readAsText(file);
  }

  function addHorse() {
    if (!newHorse.name) return;
    var nr = parseInt(newHorse.nhRating) || null;
    var fr = parseInt(newHorse.flatRating) || null;
    var disc = newHorse.discipline ? [newHorse.discipline] : [];
    var horse = Object.assign({}, newHorse, {
      id: "h_" + Date.now(),
      silk: SILKS[Math.floor(Math.random() * SILKS.length)],
      nhRating: nr, flatRating: fr, discipline: disc,
      isEBF: false, isMaiden: true, isNovice: false,
      distanceMin: 16, distanceMax: 24, goingPref: [],
      form: [], provisionalEntries: [],
    });
    setHorses(function(prev) { return prev.concat([horse]); });
    setNewHorse(emptyHorse);
    setShowAdd(false);
  }

  function saveEdit() {
    if (!editHorse) return;
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== editHorse.id) return h;
        return Object.assign({}, h, editHorse, {
          nhRating: parseInt(editHorse.nhRating) || h.nhRating || null,
          flatRating: parseInt(editHorse.flatRating) || h.flatRating || null,
          discipline: editHorse.discipline ? [editHorse.discipline] : h.discipline,
        });
      });
    });
    setEditHorse(null);
  }

  function updateEdit(key, val) {
    setEditHorse(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }

  function updateNew(key, val) {
    setNewHorse(function(prev) { return Object.assign({}, prev, { [key]: val }); });
  }

  var EDIT_FIELDS = [
    { key: "status", label: "Status", type: "select", options: ["Active", "CoolingOff", "Inactive"] },
    { key: "sex", label: "Sex", type: "select", options: ["Gelding", "Mare", "Filly", "Colt", "Horse"] },
    { key: "discipline", label: "Discipline", type: "multi", options: ["Hurdle", "Chase", "Flat"] },
    { key: "headgear", label: "Headgear", placeholder: "e.g. Cheekpieces" },
    { key: "nhRating", label: "NH Rating", type: "number", placeholder: "e.g. 98" },
    { key: "flatRating", label: "Flat Rating", type: "number", placeholder: "e.g. 74" },
    { key: "ownerPhone", label: "Owner WhatsApp", type: "tel", placeholder: "+353 86 000 0000" },
    { key: "ownerEmail", label: "Owner Email", type: "email", placeholder: "owner@email.com" },
    { key: "jockey", label: "Jockey", placeholder: "e.g. D.J. OKeeffe" },
    { key: "notes", label: "Trainer Notes", placeholder: "Any notes" },
    { key: "nextRaceDate", label: "Next Target Date", type: "date" },
  ];

  var ADD_FIELDS = [
    { key: "name", label: "Horse Name", placeholder: "e.g. Bob Olinger" },
    { key: "dob", label: "Date of Birth", type: "date" },
    { key: "sex", label: "Sex", type: "select", options: ["Gelding", "Mare", "Filly", "Colt", "Horse"] },
    { key: "colour", label: "Colour", placeholder: "e.g. Bay" },
    { key: "nhRating", label: "NH Rating", type: "number", placeholder: "e.g. 98" },
    { key: "flatRating", label: "Flat Rating", type: "number", placeholder: "e.g. 74" },
    { key: "discipline", label: "Discipline", type: "multi", options: ["Hurdle", "Chase", "Flat"] },
    { key: "surface", label: "Surface", type: "select", options: ["Turf", "AWT"] },
    { key: "status", label: "Status", type: "select", options: ["Active", "CoolingOff", "Inactive"] },
    { key: "owner", label: "Owner", placeholder: "e.g. J. Murphy" },
    { key: "ownerPhone", label: "Owner WhatsApp", type: "tel", placeholder: "+353 86 000 0000" },
    { key: "ownerEmail", label: "Owner Email", type: "email", placeholder: "owner@email.com" },
    { key: "headgear", label: "Headgear", placeholder: "e.g. Cheekpieces" },
    { key: "nextRaceDate", label: "Next Target Date", type: "date" },
    { key: "notes", label: "Trainer Notes", placeholder: "Any notes" },
  ];

  var STATS = [
    { l: "Total", v: horses.length, c: C.blue },
    { l: "Active", v: horses.filter(function(h) { return h.status === "Active"; }).length, c: C.green },
    { l: "Cool-off", v: horses.filter(function(h) { return h.status === "CoolingOff"; }).length, c: C.amber },
    { l: "Inactive", v: horses.filter(function(h) { return h.status === "Inactive"; }).length, c: C.textMid },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>My Yard</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>{horses.length + " horses"}</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {csvStatus && <span style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{csvStatus}</span>}
          <label style={{ background: C.cardOff, border: "1.5px solid " + C.border, color: C.textMid, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Import Horses CSV
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleCSV} style={{ display: "none" }} />
          </label>
          <label style={{ background: C.cardOff, border: "1.5px solid " + C.border, color: C.textMid, borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            Import Ratings CSV
            <input type="file" accept=".csv,.tsv,.txt" onChange={handleRatingsCSV} style={{ display: "none" }} />
          </label>
          <Btn variant="ghost" onClick={function() { if (window.confirm("Remove all horses? This cannot be undone.")) setHorses(function() { return []; }); }} style={{ color: C.red, borderColor: C.red, fontSize: 12 }}>Clear Yard</Btn>
          <Btn onClick={function() { setShowAdd(true); }}>+ Add Horse</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
        {STATS.map(function(s) {
          return (
            <div key={s.l} style={{ background: C.card, borderRadius: 10, padding: "13px 16px", borderTop: "4px solid " + s.c }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.textMid, marginTop: 3, fontWeight: 600 }}>{s.l}</div>
            </div>
          );
        })}
      </div>

      {horses.sort(function(a, b) {
    var aEx = (a.name || "").toUpperCase().indexOf("EX ") === 0 || (a.name || "").toUpperCase().indexOf("(EX)") >= 0;
    var bEx = (b.name || "").toUpperCase().indexOf("EX ") === 0 || (b.name || "").toUpperCase().indexOf("(EX)") >= 0;
    if (aEx && !bEx) return -1;
    if (!aEx && bEx) return 1;
    return (a.name || "").localeCompare(b.name || "");
  }).map(function(h) {
        return (
          <div key={h.id} style={{ background: C.card, border: "1px solid " + C.border, borderLeft: "4px solid " + (h.status === "Active" ? C.green : h.status === "CoolingOff" ? C.amber : C.border), borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Silk silk={h.silk} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{h.name}</span>
                  <StatusPill status={h.status} activationDate={h.activationDate} />
                  {h.headgear && <Tag color={C.purple}>{h.headgear}</Tag>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                  <span>{getAge(h.dob) + "yo " + h.sex + " · " + (h.colour || "")}</span>
                  {h.flatRating && <span>{"Flat: " + h.flatRating}</span>}
                  {h.hurdleRating && <span>{"Hrd: " + h.hurdleRating}</span>}
                  {h.chaseRating && <span>{"Chs: " + h.chaseRating}</span>}
                  {h.nhRating && !h.flatRating && !h.hurdleRating && !h.chaseRating && <span>{"OR: " + h.nhRating}</span>}
                  <span>{"Owner: " + (h.owner || "—")}</span>
                  {h.ownerPhone && (
                    <a href={"https://wa.me/" + h.ownerPhone.split("").filter(function(d) { return d >= "0" && d <= "9"; }).join("")}
                      target="_blank" rel="noreferrer"
                      style={{ color: "#25D366", fontWeight: 700, textDecoration: "none" }}>WhatsApp</a>
                  )}
                </div>
                <div style={{ marginTop: 5, display: "flex", gap: 6, alignItems: "center" }}>
                  <FormDots form={h.form} />
                  {h.nextRaceDate && (
                    <span style={{ fontSize: 11, color: daysUntil(h.nextRaceDate) <= 16 ? C.amber : C.textMid, fontWeight: 600 }}>
                      {"Next: " + new Date(h.nextRaceDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) + " (" + (daysUntil(h.nextRaceDate) || 0) + "d)"}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn variant="ghost" onClick={function() { setEditHorse(h); }} style={{ fontSize: 11, padding: "5px 12px" }}>Edit</Btn>
                <Btn variant="ghost" onClick={function() { if (window.confirm("Remove " + h.name + " from the yard?")) setHorses(function(prev) { return prev.filter(function(x) { return x.id !== h.id; }); }); }} style={{ fontSize: 11, padding: "5px 12px", color: C.red }}>Remove</Btn>
              </div>
            </div>
          </div>
        );
      })}

      {editHorse && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadowMd }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{"Edit — " + editHorse.name}</div>
              <button onClick={function() { setEditHorse(null); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
              {EDIT_FIELDS.map(function(field) {
                var key = field.key;
                var val = key === "discipline" ? ((editHorse.discipline && editHorse.discipline[0]) || "") : (editHorse[key] || "");
                return (
                  <div key={key}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                    {field.type === "treatments" ? (
                      <div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                          {(editHorse.treatments || []).map(function(t, ti) {
                            var clearD = new Date(t.date + "T00:00:00");
                            clearD.setDate(clearD.getDate() + parseInt(t.withdrawalDays || 45));
                            var daysLeft = Math.ceil((clearD - new Date()) / 86400000);
                            return (
                              <div key={ti} style={{ display: "flex", alignItems: "center", gap: 8, background: daysLeft > 0 ? C.red + "08" : C.cardOff, border: "1px solid " + (daysLeft > 0 ? C.red + "30" : C.border), borderRadius: 8, padding: "8px 12px" }}>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: daysLeft > 0 ? C.red : C.textMid }}>{t.name}</span>
                                  <span style={{ fontSize: 11, color: C.textMid, marginLeft: 8 }}>{t.date}</span>
                                  <span style={{ fontSize: 11, color: C.textMid, marginLeft: 8 }}>{t.withdrawalDays + " days"}</span>
                                  {daysLeft > 0 && <span style={{ fontSize: 11, color: C.red, fontWeight: 700, marginLeft: 8 }}>{"⛔ " + daysLeft + "d left — clear " + clearD.toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>}
                                  {daysLeft <= 0 && <span style={{ fontSize: 11, color: C.green, fontWeight: 700, marginLeft: 8 }}>✓ Clear</span>}
                                </div>
                                <button onClick={function() {
                                  var ts = (editHorse.treatments || []).filter(function(_, j) { return j !== ti; });
                                  updateEdit("treatments", ts);
                                }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>×</button>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                          <select id={"treat-type-" + editHorse.id}
                            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                            {(settings && settings.treatments || [
                              { name: "SI Joints", withdrawalDays: 45 },
                              { name: "Back Treatment", withdrawalDays: 45 },
                              { name: "Joint Injection", withdrawalDays: 30 },
                              { name: "Tildren/Osphos", withdrawalDays: 60 },
                              { name: "PRP Treatment", withdrawalDays: 30 },
                              { name: "Stem Cell", withdrawalDays: 90 }
                            ]).map(function(t) { return <option key={t.name} value={t.name + "|" + t.withdrawalDays}>{t.name + " (" + t.withdrawalDays + "d)"}</option>; })}
                          </select>
                          <input type="date" id={"treat-date-" + editHorse.id} defaultValue={new Date().toISOString().slice(0,10)}
                            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                          <Btn onClick={function() {
                            var sel = document.getElementById("treat-type-" + editHorse.id);
                            var dateEl = document.getElementById("treat-date-" + editHorse.id);
                            if (!sel || !dateEl) return;
                            var parts = sel.value.split("|");
                            var ts = (editHorse.treatments || []).slice();
                            ts.push({ name: parts[0], withdrawalDays: parseInt(parts[1]), date: dateEl.value });
                            updateEdit("treatments", ts);
                          }} style={{ fontSize: 12, padding: "8px 14px" }}>Log Treatment</Btn>
                        </div>
                      </div>
                    ) : field.type === "multi" ? (
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        {(field.options || []).map(function(o) {
                          var currentDisc = editHorse.discipline || [];
                          var disc = Array.isArray(currentDisc) ? currentDisc : [currentDisc];
                          var active = disc.indexOf(o) >= 0;
                          return (
                            <button key={o} onClick={function() {
                              var cur = Array.isArray(editHorse.discipline) ? editHorse.discipline.slice() : (editHorse.discipline ? [editHorse.discipline] : []);
                              var idx2 = cur.indexOf(o);
                              if (idx2 >= 0) cur.splice(idx2, 1); else cur.push(o);
                              updateEdit("discipline", cur);
                            }} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (active ? C.navy : C.border), background: active ? C.navy : "transparent", color: active ? "#fff" : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    ) : field.type === "select" ? (
                      <select value={val} onChange={function(e) { var v = e.target.value; updateEdit(key, v); }}
                        style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13 }}>
                        {(field.options || []).map(function(o) { return <option key={o} value={o}>{o}</option>; })}
                      </select>
                    ) : (
                      <input type={field.type || "text"} placeholder={field.placeholder} value={val}
                        onChange={function(e) { var v = e.target.value; updateEdit(key, v); }}
                        style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13 }} />
                    )}
                  </div>
                );
              })}
              <Btn onClick={saveEdit} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Save Changes</Btn>
              <Btn variant="ghost" onClick={function() { if (window.confirm("Remove " + editHorse.name + "?")) { setHorses(function(prev) { return prev.filter(function(x) { return x.id !== editHorse.id; }); }); setEditHorse(null); } }} style={{ width: "100%", justifyContent: "center", color: C.red, borderColor: C.red }}>Remove Horse</Btn>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadowMd }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Add Horse</div>
              <button onClick={function() { setShowAdd(false); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer" }}>x</button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 11 }}>
              {ADD_FIELDS.map(function(field) {
                var key = field.key;
                return (
                  <div key={key}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                    {field.type === "treatments" ? (
                      <div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                          {(editHorse.treatments || []).map(function(t, ti) {
                            var clearD = new Date(t.date + "T00:00:00");
                            clearD.setDate(clearD.getDate() + parseInt(t.withdrawalDays || 45));
                            var daysLeft = Math.ceil((clearD - new Date()) / 86400000);
                            return (
                              <div key={ti} style={{ display: "flex", alignItems: "center", gap: 8, background: daysLeft > 0 ? C.red + "08" : C.cardOff, border: "1px solid " + (daysLeft > 0 ? C.red + "30" : C.border), borderRadius: 8, padding: "8px 12px" }}>
                                <div style={{ flex: 1 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: daysLeft > 0 ? C.red : C.textMid }}>{t.name}</span>
                                  <span style={{ fontSize: 11, color: C.textMid, marginLeft: 8 }}>{t.date}</span>
                                  <span style={{ fontSize: 11, color: C.textMid, marginLeft: 8 }}>{t.withdrawalDays + " days"}</span>
                                  {daysLeft > 0 && <span style={{ fontSize: 11, color: C.red, fontWeight: 700, marginLeft: 8 }}>{"⛔ " + daysLeft + "d left — clear " + clearD.toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>}
                                  {daysLeft <= 0 && <span style={{ fontSize: 11, color: C.green, fontWeight: 700, marginLeft: 8 }}>✓ Clear</span>}
                                </div>
                                <button onClick={function() {
                                  var ts = (editHorse.treatments || []).filter(function(_, j) { return j !== ti; });
                                  updateEdit("treatments", ts);
                                }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>×</button>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                          <select id={"treat-type-" + editHorse.id}
                            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                            {(settings && settings.treatments || [
                              { name: "SI Joints", withdrawalDays: 45 },
                              { name: "Back Treatment", withdrawalDays: 45 },
                              { name: "Joint Injection", withdrawalDays: 30 },
                              { name: "Tildren/Osphos", withdrawalDays: 60 },
                              { name: "PRP Treatment", withdrawalDays: 30 },
                              { name: "Stem Cell", withdrawalDays: 90 }
                            ]).map(function(t) { return <option key={t.name} value={t.name + "|" + t.withdrawalDays}>{t.name + " (" + t.withdrawalDays + "d)"}</option>; })}
                          </select>
                          <input type="date" id={"treat-date-" + editHorse.id} defaultValue={new Date().toISOString().slice(0,10)}
                            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                          <Btn onClick={function() {
                            var sel = document.getElementById("treat-type-" + editHorse.id);
                            var dateEl = document.getElementById("treat-date-" + editHorse.id);
                            if (!sel || !dateEl) return;
                            var parts = sel.value.split("|");
                            var ts = (editHorse.treatments || []).slice();
                            ts.push({ name: parts[0], withdrawalDays: parseInt(parts[1]), date: dateEl.value });
                            updateEdit("treatments", ts);
                          }} style={{ fontSize: 12, padding: "8px 14px" }}>Log Treatment</Btn>
                        </div>
                      </div>
                    ) : field.type === "multi" ? (
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                        {(field.options || []).map(function(o) {
                          var cur = Array.isArray(newHorse[key]) ? newHorse[key] : (newHorse[key] ? [newHorse[key]] : []);
                          var active = cur.indexOf(o) >= 0;
                          return (
                            <button key={o} onClick={function() {
                              var arr = Array.isArray(newHorse[key]) ? newHorse[key].slice() : (newHorse[key] ? [newHorse[key]] : []);
                              var idx2 = arr.indexOf(o);
                              if (idx2 >= 0) arr.splice(idx2, 1); else arr.push(o);
                              updateNew(key, arr);
                            }} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (active ? C.navy : C.border), background: active ? C.navy : "transparent", color: active ? "#fff" : C.textMid, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    ) : field.type === "select" ? (
                      <select value={newHorse[key]} onChange={function(e) { var v = e.target.value; updateNew(key, v); }}
                        style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13 }}>
                        {(field.options || []).map(function(o) { return <option key={o} value={o}>{o}</option>; })}
                      </select>
                    ) : (
                      <input type={field.type || "text"} placeholder={field.placeholder} value={newHorse[key] || ""}
                        onChange={function(e) { var v = e.target.value; updateNew(key, v); }}
                        style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "8px 12px", color: C.text, fontSize: 13 }} />
                    )}
                  </div>
                );
              })}
              <Btn onClick={addHorse} style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>Add Horse</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default YardView;
