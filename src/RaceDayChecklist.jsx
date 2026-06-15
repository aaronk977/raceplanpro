import React, { useState, useEffect } from "react";
import { Btn, C, HorseFiles } from "./shared";

var DEFAULT_CHECKLIST = [
  { id: "silks", label: "Silks", category: "Equipment" },
  { id: "saddle", label: "Saddle", category: "Equipment" },
  { id: "saddle_cloth", label: "Saddle Cloth / Number Cloth", category: "Equipment" },
  { id: "bridle", label: "Bridle", category: "Equipment" },
  { id: "girth", label: "Girth", category: "Equipment" },
  { id: "stirrups", label: "Stirrup Irons + Leathers", category: "Equipment" },
  { id: "breastplate", label: "Breastplate", category: "Equipment" },
  { id: "martingale", label: "Martingale (if applicable)", category: "Equipment" },
  { id: "bandages", label: "Bandages / Boots", category: "Equipment" },
  { id: "hood", label: "Hood (if applicable)", category: "Headgear" },
  { id: "blinkers", label: "Blinkers (if applicable)", category: "Headgear" },
  { id: "cheeks", label: "Cheekpieces (if applicable)", category: "Headgear" },
  { id: "tongue_strap", label: "Tongue Strap (if applicable)", category: "Headgear" },
  { id: "passport", label: "Horse Passport", category: "Documents" },
  { id: "declaration", label: "Declaration Confirmation", category: "Documents" },
  { id: "vet_cert", label: "Vet Certificate (if required)", category: "Documents" },
  { id: "feed", label: "Feed + Hay", category: "Horse Care" },
  { id: "water", label: "Water Buckets", category: "Horse Care" },
  { id: "studs", label: "Studs + Stud Kit", category: "Horse Care" },
  { id: "first_aid", label: "First Aid Kit", category: "Horse Care" },
  { id: "cooler", label: "Cooler / Rug", category: "Horse Care" },
  { id: "plaiting", label: "Plaiting Kit", category: "Horse Care" },
];

var RETURN_CHECKLIST = [
  { id: "r_silks", label: "Silks returned" },
  { id: "r_saddle", label: "Saddle returned" },
  { id: "r_bridle", label: "Bridle returned" },
  { id: "r_girth", label: "Girth returned" },
  { id: "r_boots", label: "Boots / Bandages returned" },
  { id: "r_headgear", label: "Headgear returned (if used)" },
  { id: "r_passport", label: "Passport returned" },
  { id: "r_rugs", label: "Rugs / Coolers returned" },
  { id: "r_buckets", label: "Buckets returned" },
  { id: "r_kit", label: "All other kit accounted for" },
];

function RaceDayChecklist({ horses, wbEntries, user, supabase }) {
  var dateState = useState(new Date().toISOString().slice(0, 10));
  var selectedDate = dateState[0]; var setSelectedDate = dateState[1];
  var checklistsState = useState({});
  var checklists = checklistsState[0]; var setChecklists = checklistsState[1];
  var expandedState = useState(null);
  var expanded = expandedState[0]; var setExpanded = expandedState[1];
  var savingState = useState(false);
  var saving = savingState[0]; var setSaving = savingState[1];
  var savedState = useState(null);
  var saved = savedState[0]; var setSaved = savedState[1];

  var TODAY = new Date().toISOString().slice(0, 10);

  // Only show horses with whiteboard entries for selected date
  var dateEntries = (wbEntries || []).filter(function(e) { return e.date === selectedDate; });
  var runnerIds = dateEntries.map(function(e) { return e.horseId; });
  var todayRunners = horses.filter(function(h) {
    return runnerIds.indexOf(h.id) >= 0;
  });
  // Also carry raceTime and venue per horse from whiteboard
  function getRaceInfo(horseId) {
    var e = dateEntries.find(function(e) { return e.horseId === horseId; });
    return e ? { time: e.raceTime || "", venue: e.venue || "", raceName: e.raceName || "", raceRef: e.raceRef || "", headgear: e.headgear || "", ballotNo: e.ballotNo || "" } : {};
  }

  function getChecklist(horseId) {
    return checklists[horseId] || { checks: {}, returnChecks: {}, notes: "", returned: false, customItems: [] };
  }

  function updateCheck(horseId, itemId, val) {
    setChecklists(function(prev) {
      var curr = getChecklist(horseId);
      var newChecks = Object.assign({}, curr.checks, { [itemId]: val });
      return Object.assign({}, prev, { [horseId]: Object.assign({}, curr, { checks: newChecks }) });
    });
  }

  function updateReturnCheck(horseId, itemId, val) {
    setChecklists(function(prev) {
      var curr = getChecklist(horseId);
      var newChecks = Object.assign({}, curr.returnChecks, { [itemId]: val });
      return Object.assign({}, prev, { [horseId]: Object.assign({}, curr, { returnChecks: newChecks }) });
    });
  }

  function updateNotes(horseId, val) {
    setChecklists(function(prev) {
      var curr = getChecklist(horseId);
      return Object.assign({}, prev, { [horseId]: Object.assign({}, curr, { notes: val }) });
    });
  }

  function setReturned(horseId, val) {
    setChecklists(function(prev) {
      var curr = getChecklist(horseId);
      return Object.assign({}, prev, { [horseId]: Object.assign({}, curr, { returned: val }) });
    });
  }

  function addCustomItem(horseId, label) {
    if (!label.trim()) return;
    var newItem = { id: "custom_" + Date.now(), label: label.trim() };
    setChecklists(function(prev) {
      var curr = getChecklist(horseId);
      var items = (curr.customItems || []).concat([newItem]);
      return Object.assign({}, prev, { [horseId]: Object.assign({}, curr, { customItems: items }) });
    });
  }

  function saveChecklist(horseId) {
    if (!user || !supabase) return;
    setSaving(true);
    var data = checklists[horseId] || {};
    var record = {
      user_id: user.id,
      horse_id: horseId,
      date: selectedDate,
      data: JSON.stringify(data),
      updated_at: new Date().toISOString()
    };
    supabase.from("raceday_checklists").upsert(record, { onConflict: "user_id,horse_id,date" })
      .then(function() {
        setSaving(false);
        setSaved(horseId);
        setTimeout(function() { setSaved(null); }, 2500);
      });
  }

  function loadChecklists() {
    if (!user || !supabase) return;
    supabase.from("raceday_checklists").select("*")
      .eq("user_id", user.id).eq("date", selectedDate)
      .then(function(res) {
        if (res.data) {
          var loaded = {};
          res.data.forEach(function(row) {
            try { loaded[row.horse_id] = JSON.parse(row.data); } catch(e) {}
          });
          setChecklists(loaded);
        }
      });
  }

  useEffect(function() { loadChecklists(); }, [selectedDate, user]);

  function getProgress(horseId) {
    var cl = getChecklist(horseId);
    var total = DEFAULT_CHECKLIST.length + (cl.customItems || []).length;
    var done = 0;
    DEFAULT_CHECKLIST.forEach(function(item) { if (cl.checks[item.id]) done++; });
    (cl.customItems || []).forEach(function(item) { if (cl.checks[item.id]) done++; });
    return { done: done, total: total };
  }

  function getReturnProgress(horseId) {
    var cl = getChecklist(horseId);
    var done = RETURN_CHECKLIST.filter(function(item) { return cl.returnChecks[item.id]; }).length;
    return { done: done, total: RETURN_CHECKLIST.length };
  }

  var categories = [];
  DEFAULT_CHECKLIST.forEach(function(item) {
    if (categories.indexOf(item.category) < 0) categories.push(item.category);
  });

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Race Day Checklist</div>
        <input type="date" value={selectedDate} onChange={function(e) { setSelectedDate(e.target.value); }}
          style={{ padding: "8px 12px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
      </div>

      {todayRunners.length === 0 && (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          No horses in yard - add horses to My Yard to use checklists
        </div>
      )}

      {todayRunners.map(function(horse) {
        var cl = getChecklist(horse.id);
        var prog = getProgress(horse.id);
        var retProg = getReturnProgress(horse.id);
        var isExpanded = expanded === horse.id;
        var allDone = prog.done === prog.total;
        var allReturned = cl.returned;
        var customInputState = useState("");
        var customInput = customInputState[0]; var setCustomInput = customInputState[1];

        return (
          <div key={horse.id} style={{ background: C.card, border: "2px solid " + (allReturned ? C.green : allDone ? C.gold : C.border), borderRadius: 14, marginBottom: 12, overflow: "hidden" }}>

            {/* Header */}
            <div onClick={function() { setExpanded(isExpanded ? null : horse.id); }}
              style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{horse.name}</div>
                {(function() {
                  var ri = getRaceInfo(horse.id);
                  return ri.time || ri.venue ? (
                    <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                      {[ri.time, ri.venue, ri.raceRef, ri.raceName].filter(Boolean).join(" - ")}
                      {ri.headgear ? <span style={{ marginLeft: 6, background: C.purple, color: "#fff", padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{ri.headgear}</span> : null}
                      {ri.ballotNo ? <span style={{ marginLeft: 4, background: C.amber, color: "#fff", padding: "1px 6px", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{ri.ballotNo}</span> : null}
                    </div>
                  ) : null;
                })()}
                <div style={{ display: "flex", gap: 12, marginTop: 4, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: C.textMid }}>
                    <span style={{ color: allDone ? C.green : C.amber, fontWeight: 700 }}>{prog.done}/{prog.total}</span>
                    {" items packed"}
                  </div>
                  {prog.done > 0 && (
                    <div style={{ flex: 1, maxWidth: 120, height: 4, background: C.cardOff, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: (prog.done / prog.total * 100) + "%", background: allDone ? C.green : C.gold, borderRadius: 2 }} />
                    </div>
                  )}
                  {allReturned && <span style={{ fontSize: 11, fontWeight: 700, color: C.green, background: C.green + "15", padding: "2px 8px", borderRadius: 20 }}>All returned</span>}
                </div>
              </div>
              <span style={{ fontSize: 20, color: C.textMid }}>{isExpanded ? "v" : ">"}</span>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ padding: "0 18px 18px" }}>

                {/* Post-race jockey report / photos / video */}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
                  Jockey Report / Photos / Video
                </div>
                <HorseFiles horseId={horse.id} horseName={horse.name} context="raceday" user={user} />
                <div style={{ height: 16 }} />

                {/* Packing checklist by category */}
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 4 }}>
                  Pre-Race Packing
                </div>
                {categories.map(function(cat) {
                  var items = DEFAULT_CHECKLIST.filter(function(i) { return i.category === cat; });
                  return (
                    <div key={cat} style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid " + C.border }}>{cat}</div>
                      {items.map(function(item) {
                        var checked = !!cl.checks[item.id];
                        return (
                          <div key={item.id} onClick={function() { updateCheck(horse.id, item.id, !checked); }}
                            style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, marginBottom: 3, cursor: "pointer", background: checked ? C.green + "10" : "transparent", transition: "background 0.15s" }}>
                            <div style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid " + (checked ? C.green : C.border), background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                              {checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>v</span>}
                            </div>
                            <span style={{ fontSize: 13, color: checked ? C.green : C.text, textDecoration: checked ? "line-through" : "none", fontWeight: checked ? 600 : 400 }}>{item.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Custom items */}
                {(cl.customItems || []).length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingBottom: 4, borderBottom: "1px solid " + C.border }}>Custom Items</div>
                    {(cl.customItems || []).map(function(item) {
                      var checked = !!cl.checks[item.id];
                      return (
                        <div key={item.id} onClick={function() { updateCheck(horse.id, item.id, !checked); }}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, marginBottom: 3, cursor: "pointer", background: checked ? C.green + "10" : "transparent" }}>
                          <div style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid " + (checked ? C.green : C.border), background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>v</span>}
                          </div>
                          <span style={{ fontSize: 13, color: checked ? C.green : C.text, textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add custom item */}
                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  <input type="text" value={customInput} onChange={function(e) { setCustomInput(e.target.value); }}
                    onKeyDown={function(e) { if (e.key === "Enter" && customInput.trim()) { addCustomItem(horse.id, customInput); setCustomInput(""); } }}
                    placeholder="Add custom item..."
                    style={{ flex: 1, padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                  <Btn variant="ghost" onClick={function() { if (customInput.trim()) { addCustomItem(horse.id, customInput); setCustomInput(""); } }}>Add</Btn>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase" }}>Notes</div>
                  <textarea value={cl.notes || ""} onChange={function(e) { updateNotes(horse.id, e.target.value); }}
                    placeholder="Any notes about equipment, horse condition, instructions for traveling staff..."
                    style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, resize: "vertical", minHeight: 60 }} />
                </div>

                {/* Save packing */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <Btn onClick={function() { saveChecklist(horse.id); }} disabled={saving}>
                    {saving ? "Saving..." : saved === horse.id ? "Saved!" : "Save Checklist"}
                  </Btn>
                  {allDone && <span style={{ fontSize: 13, fontWeight: 700, color: C.green, alignSelf: "center" }}>All packed!</span>}
                </div>

                {/* Return checklist */}
                <div style={{ background: C.cardOff, borderRadius: 12, padding: "14px 16px", border: "1px solid " + (allReturned ? C.green + "40" : C.border) }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Post-Race Equipment Return</div>
                  {RETURN_CHECKLIST.map(function(item) {
                    var checked = !!cl.returnChecks[item.id];
                    return (
                      <div key={item.id} onClick={function() { updateReturnCheck(horse.id, item.id, !checked); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, marginBottom: 3, cursor: "pointer", background: checked ? C.green + "10" : "transparent" }}>
                        <div style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid " + (checked ? C.green : C.border), background: checked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900, lineHeight: 1 }}>v</span>}
                        </div>
                        <span style={{ fontSize: 13, color: checked ? C.green : C.text, textDecoration: checked ? "line-through" : "none" }}>{item.label}</span>
                      </div>
                    );
                  })}

                  {/* Missing items notes */}
                  <div style={{ marginTop: 10 }}>
                    <textarea
                      value={cl.returnNotes || ""}
                      onChange={function(e) {
                        var v = e.target.value;
                        setChecklists(function(prev) {
                          var curr = getChecklist(horse.id);
                          return Object.assign({}, prev, { [horse.id]: Object.assign({}, curr, { returnNotes: v }) });
                        });
                      }}
                      placeholder="Note any missing or damaged equipment..."
                      style={{ width: "100%", padding: "9px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, resize: "vertical", minHeight: 50, marginBottom: 10 }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div onClick={function() { setReturned(horse.id, !cl.returned); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 14px", borderRadius: 8, background: cl.returned ? C.green : C.card, border: "2px solid " + (cl.returned ? C.green : C.border), transition: "all 0.2s" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 5, border: "2px solid " + (cl.returned ? "#fff" : C.border), background: cl.returned ? "#fff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {cl.returned && <span style={{ color: C.green, fontSize: 13, fontWeight: 900, lineHeight: 1 }}>v</span>}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: cl.returned ? "#fff" : C.text }}>All equipment back in yard</span>
                    </div>
                    <Btn onClick={function() { saveChecklist(horse.id); }} variant="ghost" style={{ fontSize: 12 }}>Save</Btn>
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default RaceDayChecklist;
