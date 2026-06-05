import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

function Galloping({ horses, user, supabase, settings }) {
  var entriesState = useState([]);
  var entries = entriesState[0]; var setEntries = entriesState[1];
  var viewState = useState("today");
  var view = viewState[0]; var setView = viewState[1];
  var filterDateState = useState(new Date().toISOString().slice(0, 10));
  var filterDate = filterDateState[0]; var setFilterDate = filterDateState[1];

  var selectedState = useState({});
  var selected = selectedState[0]; var setSelected = selectedState[1];
  var gDateState = useState(new Date().toISOString().slice(0, 10));
  var gDate = gDateState[0]; var setGDate = gDateState[1];
  var gLocState = useState("");
  var gLoc = gLocState[0]; var setGLoc = gLocState[1];
  var gWorkState = useState("");
  var gWork = gWorkState[0]; var setGWork = gWorkState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var savingState = useState(false);
  var saving = savingState[0]; var setSaving = savingState[1];
  var showHistoryState = useState(false);
  var showHistory = showHistoryState[0]; var setShowHistory = showHistoryState[1];

  var TODAY = new Date().toISOString().slice(0, 10);
  var activeHorses = horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  // Gallop locations from settings (set in Settings > Gallop Locations)
  var locations = (settings && settings.gallopLocations) || ["Home Gallop", "All-Weather", "Grass Gallop"];

  useEffect(function() {
    if (!user || !supabase) return;
    supabase.from("gallops").select("*").eq("user_id", user.id)
      .order("date", { ascending: false })
      .then(function(res) { if (res.data) setEntries(res.data); });
  }, [user]);

  function toggleSelect(id) {
    setSelected(function(p) { var n = Object.assign({}, p); if (n[id]) delete n[id]; else n[id] = true; return n; });
  }
  function selectAll() {
    var n = {}; getFiltered().forEach(function(h) { n[h.id] = true; }); setSelected(n);
  }

  function scheduleSelected() {
    if (Object.keys(selected).length === 0 || !gLoc) return;
    setSaving(true);
    var records = Object.keys(selected).map(function(horseId) {
      var horse = horses.find(function(h) { return h.id === horseId; });
      return {
        user_id: user.id, horse_id: horseId, horse_name: horse ? horse.name : "",
        date: gDate, location: gLoc, work: gWork, comment: "",
        created_at: new Date().toISOString()
      };
    });
    supabase.from("gallops").insert(records).select().then(function(res) {
      if (res.data) setEntries(function(p) { return res.data.concat(p); });
      setSaving(false); setSelected({}); setGWork(""); setView("today"); setFilterDate(gDate);
    });
  }

  function updateComment(id, comment) {
    setEntries(function(p) { return p.map(function(e) { return e.id === id ? Object.assign({}, e, { comment: comment }) : e; }); });
    if (supabase) supabase.from("gallops").update({ comment: comment }).eq("id", id).then(function() {});
  }
  function del(id) {
    setEntries(function(p) { return p.filter(function(e) { return e.id !== id; }); });
    if (supabase) supabase.from("gallops").delete().eq("id", id).then(function() {});
  }
  function getFiltered() {
    var q = search.trim().toLowerCase();
    return activeHorses.filter(function(h) { return !q || h.name.toLowerCase().indexOf(q) >= 0; })
      .sort(function(a, b) { return a.name.localeCompare(b.name); });
  }

  var dayEntries = entries.filter(function(e) { return e.date === filterDate; });
  // group day entries by location
  var byLoc = {};
  dayEntries.forEach(function(e) { var l = e.location || "Other"; if (!byLoc[l]) byLoc[l] = []; byLoc[l].push(e); });
  var locKeys = Object.keys(byLoc).sort();
  var selectedCount = Object.keys(selected).length;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Galloping</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input type="date" value={filterDate} onChange={function(e) { setFilterDate(e.target.value); setView("today"); }}
            style={{ padding: "8px 12px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          <Btn onClick={function() { setView(view === "schedule" ? "today" : "schedule"); setSelected({}); }}>
            {view === "schedule" ? "Cancel" : "+ Record Gallop"}
          </Btn>
        </div>
      </div>

      {view === "schedule" && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Record a gallop</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <div>
              <div style={lblS}>Date</div>
              <input type="date" value={gDate} onChange={function(e) { setGDate(e.target.value); }} style={inpS} />
            </div>
            <div>
              <div style={lblS}>Location</div>
              <select value={gLoc} onChange={function(e) { setGLoc(e.target.value); }} style={inpS}>
                <option value="">Select location...</option>
                {locations.map(function(l) { return <option key={l} value={l}>{l}</option>; })}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={lblS}>Work done (applies to all selected)</div>
              <input type="text" value={gWork} onChange={function(e) { setGWork(e.target.value); }}
                placeholder="e.g. 2f easy, half-speed 4f, upsides"
                style={inpS} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center" }}>
            <input type="text" value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search horses..."
              style={{ flex: 1, padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            <Btn variant="ghost" onClick={selectAll} style={{ fontSize: 12 }}>Select All</Btn>
            {selectedCount > 0 && <Btn variant="ghost" onClick={function() { setSelected({}); }} style={{ fontSize: 12 }}>Clear</Btn>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 6, maxHeight: 300, overflowY: "auto", marginBottom: 14 }}>
            {getFiltered().map(function(horse) {
              var sel = !!selected[horse.id];
              return (
                <div key={horse.id} onClick={function() { toggleSelect(horse.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 10, cursor: "pointer", border: "2px solid " + (sel ? C.gold : C.border), background: sel ? C.gold + "10" : C.cardOff }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: "2px solid " + (sel ? C.gold : C.border), background: sel ? C.gold : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {sel && <span style={{ color: C.navy, fontSize: 12, fontWeight: 900, lineHeight: 1 }}>v</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: sel ? 700 : 400, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{horse.name}</span>
                </div>
              );
            })}
          </div>

          <Btn onClick={scheduleSelected} disabled={saving || selectedCount === 0 || !gLoc}>
            {saving ? "Saving..." : "Record " + (selectedCount > 0 ? selectedCount + " horse" + (selectedCount > 1 ? "s" : "") : "gallop") + (gLoc ? " at " + gLoc : "")}
          </Btn>
          {!gLoc && selectedCount > 0 && <span style={{ fontSize: 12, color: C.amber, marginLeft: 10 }}>Pick a location first</span>}
        </div>
      )}

      {view === "today" && (
        <div>
          {dayEntries.length === 0 ? (
            <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
              No gallops recorded for {filterDate === TODAY ? "today" : filterDate}
            </div>
          ) : (
            locKeys.map(function(loc) {
              return (
                <div key={loc} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.navy, marginBottom: 8 }}>{loc}
                    <span style={{ fontSize: 12, fontWeight: 400, color: C.textMid, marginLeft: 8 }}>{byLoc[loc].length + " horse" + (byLoc[loc].length !== 1 ? "s" : "")}</span>
                  </div>
                  {byLoc[loc].map(function(e) {
                    return (
                      <div key={e.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{e.horse_name}</span>
                          <button onClick={function() { if (window.confirm("Remove?")) del(e.id); }} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16 }}>x</button>
                        </div>
                        {e.work && <div style={{ fontSize: 12, color: C.textMid, marginBottom: 6 }}>{e.work}</div>}
                        <input type="text" placeholder="How did they perform? Add a comment..."
                          defaultValue={e.comment || ""}
                          onBlur={function(ev) { updateComment(e.id, ev.target.value); }}
                          style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "1px solid " + C.border, background: C.cardOff, color: C.text, fontSize: 12 }} />
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <button onClick={function() { setShowHistory(function(p) { return !p; }); }}
          style={{ background: "none", border: "none", color: C.textMid, fontSize: 13, cursor: "pointer", fontWeight: 600, padding: 0 }}>
          {showHistory ? "Hide" : "Show"} full gallop history
        </button>
        {showHistory && (
          <div style={{ marginTop: 12 }}>
            {activeHorses.filter(function(h) { return entries.some(function(e) { return e.horse_id === h.id; }); })
              .sort(function(a, b) { return a.name.localeCompare(b.name); }).map(function(h) {
              var hist = entries.filter(function(e) { return e.horse_id === h.id; }).sort(function(a, b) { return b.date.localeCompare(a.date); });
              if (hist.length === 0) return null;
              return (
                <div key={h.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 10 }}>{h.name}</div>
                  {hist.map(function(e) {
                    return (
                      <div key={e.id} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid " + C.cardOff }}>
                        <div style={{ minWidth: 90, fontSize: 12, color: C.textMid }}>
                          <div style={{ fontWeight: 700, color: C.text }}>{new Date(e.date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })}</div>
                          <div>{e.location}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {e.work && <div style={{ fontSize: 12, color: C.textMid }}>{e.work}</div>}
                          {e.comment && <div style={{ fontSize: 13, color: C.text, fontStyle: "italic", marginTop: 2 }}>{e.comment}</div>}
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

var lblS = { fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" };
var inpS = { width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text };

export default Galloping;
