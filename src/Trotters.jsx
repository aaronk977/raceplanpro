import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

var OUTCOMES = ["Pending", "Sound", "Lame", "Slight Lameness", "Needs Vet", "Monitor"];

function outcomeColor(o) {
  if (o === "Sound") return C.green;
  if (o === "Lame" || o === "Needs Vet") return C.red;
  if (o === "Slight Lameness" || o === "Monitor") return C.amber;
  return C.textMid;
}

function outcomeBg(o) {
  if (o === "Sound") return C.green + "15";
  if (o === "Lame" || o === "Needs Vet") return C.red + "12";
  if (o === "Slight Lameness" || o === "Monitor") return C.amber + "15";
  return C.cardOff;
}

function Trotters({ horses, user, supabase }) {
  var entriesState = useState([]);
  var entries = entriesState[0]; var setEntries = entriesState[1];
  var filterDateState = useState(new Date().toISOString().slice(0, 10));
  var filterDate = filterDateState[0]; var setFilterDate = filterDateState[1];
  var viewState = useState("today");
  var view = viewState[0]; var setView = viewState[1];

  // Multi-select state for scheduling
  var selectedState = useState({});
  var selected = selectedState[0]; var setSelected = selectedState[1];
  var schedTimeState = useState("08:00");
  var schedTime = schedTimeState[0]; var setSchedTime = schedTimeState[1];
  var schedReasonState = useState("");
  var schedReason = schedReasonState[0]; var setSchedReason = schedReasonState[1];
  var schedDateState = useState(new Date().toISOString().slice(0, 10));
  var schedDate = schedDateState[0]; var setSchedDate = schedDateState[1];
  var showScheduleState = useState(false);
  var showSchedule = showScheduleState[0]; var setShowSchedule = showScheduleState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var savingState = useState(false);
  var saving = savingState[0]; var setSaving = savingState[1];
  var showHistoryState = useState(false);
  var showHistory = showHistoryState[0]; var setShowHistory = showHistoryState[1];

  var TODAY = new Date().toISOString().slice(0, 10);
  var activeHorses = horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  useEffect(function() {
    if (!user || !supabase) return;
    supabase.from("trotters").select("*").eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(function(res) { if (res.data) setEntries(res.data); });
  }, [user]);

  function toggleSelect(horseId) {
    setSelected(function(prev) {
      var next = Object.assign({}, prev);
      if (next[horseId]) delete next[horseId];
      else next[horseId] = true;
      return next;
    });
  }

  function selectAll() {
    var filtered = getFilteredHorses();
    var next = {};
    filtered.forEach(function(h) { next[h.id] = true; });
    setSelected(next);
  }

  function clearSelected() { setSelected({}); }

  function scheduleSelected() {
    if (Object.keys(selected).length === 0) return;
    setSaving(true);
    var records = Object.keys(selected).map(function(horseId) {
      var horse = horses.find(function(h) { return h.id === horseId; });
      return {
        user_id: user.id,
        horse_id: horseId,
        horse_name: horse ? horse.name : "",
        date: schedDate,
        time: schedTime,
        reason: schedReason,
        outcome: "Pending",
        notes: "",
        created_at: new Date().toISOString()
      };
    });
    supabase.from("trotters").insert(records).select()
      .then(function(res) {
        if (res.data) setEntries(function(prev) { return res.data.concat(prev); });
        setSaving(false);
        setSelected({});
        setShowSchedule(false);
        setSchedReason("");
        setView("today");
        setFilterDate(schedDate);
      });
  }

  function updateOutcome(id, outcome) {
    setEntries(function(prev) {
      return prev.map(function(e) { return e.id === id ? Object.assign({}, e, { outcome: outcome }) : e; });
    });
    if (supabase) supabase.from("trotters").update({ outcome: outcome }).eq("id", id).then(function() {});
  }

  function updateNotes(id, notes) {
    setEntries(function(prev) {
      return prev.map(function(e) { return e.id === id ? Object.assign({}, e, { notes: notes }) : e; });
    });
    if (supabase) supabase.from("trotters").update({ notes: notes }).eq("id", id).then(function() {});
  }

  function deleteEntry(id) {
    setEntries(function(prev) { return prev.filter(function(e) { return e.id !== id; }); });
    if (supabase) supabase.from("trotters").delete().eq("id", id).then(function() {});
  }

  function getFilteredHorses() {
    var q = search.trim().toLowerCase();
    return activeHorses.filter(function(h) {
      return !q || h.name.toLowerCase().indexOf(q) >= 0;
    }).sort(function(a, b) { return a.name.localeCompare(b.name); });
  }

  var todayEntries = entries.filter(function(e) { return e.date === filterDate; })
    .sort(function(a, b) { return (a.time || "").localeCompare(b.time || ""); });

  var selectedCount = Object.keys(selected).length;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Trotters</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" value={filterDate} onChange={function(e) { setFilterDate(e.target.value); setView("today"); }}
            style={{ padding: "8px 12px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          <Btn onClick={function() { setView(view === "schedule" ? "today" : "schedule"); setSelected({}); }}>
            {view === "schedule" ? "Cancel" : "+ Schedule Trot"}
          </Btn>
        </div>
      </div>

      {/* SCHEDULE VIEW */}
      {view === "schedule" && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Select horses to trot</div>

          {/* Schedule options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Date</div>
              <input type="date" value={schedDate} onChange={function(e) { setSchedDate(e.target.value); }}
                style={{ width: "100%", padding: "8px 10px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Time</div>
              <input type="time" value={schedTime} onChange={function(e) { setSchedTime(e.target.value); }}
                style={{ width: "100%", padding: "8px 10px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Reason</div>
              <input type="text" value={schedReason} onChange={function(e) { setSchedReason(e.target.value); }}
                placeholder="e.g. Routine soundness"
                style={{ width: "100%", padding: "8px 10px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
          </div>

          {/* Search + select all */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <input type="text" value={search} onChange={function(e) { setSearch(e.target.value); }}
              placeholder="Search horses..."
              style={{ flex: 1, padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            <Btn variant="ghost" onClick={selectAll} style={{ fontSize: 12 }}>Select All</Btn>
            {selectedCount > 0 && <Btn variant="ghost" onClick={clearSelected} style={{ fontSize: 12 }}>Clear</Btn>}
          </div>

          {/* Horse grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6, maxHeight: 320, overflowY: "auto", marginBottom: 14 }}>
            {getFilteredHorses().map(function(horse) {
              var isSel = !!selected[horse.id];
              return (
                <div key={horse.id} onClick={function() { toggleSelect(horse.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, cursor: "pointer", border: "2px solid " + (isSel ? C.gold : C.border), background: isSel ? C.gold + "10" : C.cardOff, transition: "all 0.15s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (isSel ? C.gold : C.border), background: isSel ? C.gold : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isSel && <span style={{ color: C.navy, fontSize: 12, fontWeight: 900, lineHeight: 1 }}>v</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isSel ? 700 : 400, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{horse.name}</span>
                </div>
              );
            })}
          </div>

          {/* Schedule button */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Btn onClick={scheduleSelected} disabled={saving || selectedCount === 0}>
              {saving ? "Saving..." : "Schedule " + (selectedCount > 0 ? selectedCount + " horse" + (selectedCount > 1 ? "s" : "") : "selected horses")}
            </Btn>
            {selectedCount > 0 && (
              <span style={{ fontSize: 13, color: C.textMid }}>{selectedCount + " selected"}</span>
            )}
          </div>
        </div>
      )}

      {/* TODAY VIEW */}
      {view === "today" && (
        <div>
          {todayEntries.length === 0 ? (
            <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
              No horses scheduled to trot on {filterDate === TODAY ? "today" : filterDate}
            </div>
          ) : (
            <div>
              {filterDate === TODAY && (
                <div style={{ background: C.navy, borderRadius: 12, padding: "12px 16px", marginBottom: 12, fontSize: 13, fontWeight: 700, color: C.gold }}>
                  {todayEntries.length + " horse" + (todayEntries.length > 1 ? "s" : "") + " to see trot today"}
                </div>
              )}
              {todayEntries.map(function(e) {
                return (
                  <div key={e.id} style={{ background: C.card, border: "1px solid " + (e.outcome !== "Pending" ? outcomeColor(e.outcome) + "40" : C.border), borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <div style={{ minWidth: 52, textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{e.time}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{e.horse_name}</div>
                        {e.reason && <div style={{ fontSize: 12, color: C.textMid, marginTop: 1 }}>{e.reason}</div>}
                      </div>
                      {e.outcome !== "Pending" && (
                        <span style={{ fontSize: 12, fontWeight: 700, color: outcomeColor(e.outcome), background: outcomeBg(e.outcome), padding: "3px 10px", borderRadius: 20 }}>{e.outcome}</span>
                      )}
                      <button onClick={function() { if (window.confirm("Remove?")) deleteEntry(e.id); }}
                        style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 18, padding: "2px 6px" }}>x</button>
                    </div>

                    {/* Outcome buttons */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {OUTCOMES.map(function(o) {
                        var active = e.outcome === o;
                        return (
                          <button key={o} onClick={function() { updateOutcome(e.id, o); }}
                            style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid " + (active ? outcomeColor(o) : C.border), background: active ? outcomeBg(o) : "transparent", color: active ? outcomeColor(o) : C.textMid, fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                            {o}
                          </button>
                        );
                      })}
                    </div>

                    {/* Notes */}
                    <input type="text" placeholder="Notes e.g. n/f lame, 3/10 lame LF..."
                      defaultValue={e.notes || ""}
                      onBlur={function(ev) { updateNotes(e.id, ev.target.value); }}
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid " + C.border, background: C.cardOff, color: C.text, fontSize: 12 }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* HISTORY */}
      <div style={{ marginTop: 20 }}>
        <button onClick={function() { setShowHistory(function(p) { return !p; }); }}
          style={{ background: "none", border: "none", color: C.textMid, fontSize: 13, cursor: "pointer", fontWeight: 600, padding: 0 }}>
          {showHistory ? "Hide" : "Show"} full trot history
        </button>
        {showHistory && (
          <div style={{ marginTop: 12 }}>
            {activeHorses.filter(function(h) {
              return entries.some(function(e) { return e.horse_id === h.id; });
            }).sort(function(a, b) { return a.name.localeCompare(b.name); }).map(function(h) {
              var horseHistory = entries.filter(function(e) { return e.horse_id === h.id; })
                .sort(function(a, b) { return b.date.localeCompare(a.date); });
              if (horseHistory.length === 0) return null;
              return (
                <div key={h.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 10 }}>{h.name}</div>
                  {horseHistory.map(function(e) {
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "8px 0", borderBottom: "1px solid " + C.cardOff }}>
                        <div style={{ minWidth: 90, fontSize: 12, color: C.textMid }}>
                          <div style={{ fontWeight: 700, color: C.text }}>{new Date(e.date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</div>
                          <div>{e.time}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {e.reason && <div style={{ fontSize: 12, color: C.textMid, marginBottom: 3 }}>{e.reason}</div>}
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: outcomeColor(e.outcome) }}>{e.outcome}</span>
                            {e.notes && <span style={{ fontSize: 12, color: C.text, fontStyle: "italic" }}>{e.notes}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default Trotters;
