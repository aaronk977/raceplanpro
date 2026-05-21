import React, { useState } from "react";
import { Btn, Tag, Silk, C, daysUntil, ANTHROPIC_KEY } from "./shared";

function ProvisionalEntries({ horses, setHorses, settings }) {
  var showAddState = useState(null);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var entryState = useState({ venue: "", date: "", raceName: "", raceRef: "", note: "" });
  var entry = entryState[0]; var setEntry = entryState[1];
  var racesState = useState([]);
  var provisionalRaces = racesState[0]; var setProvisionalRaces = racesState[1];
  var statusState = useState("idle");
  var fetchStatus = statusState[0]; var setFetchStatus = statusState[1];
  var lastFetchState = useState(null);
  var lastFetch = lastFetchState[0]; var setLastFetch = lastFetchState[1];
  var pasteState = useState(false);
  var showProvPaste = pasteState[0]; var setShowProvPaste = pasteState[1];
  var pasteTextState = useState("");
  var provPasteText = pasteTextState[0]; var setProvPasteText = pasteTextState[1];
  var expandedState = useState(null);
  var expandedHorse = expandedState[0]; var setExpandedHorse = expandedState[1];
  var raceSearchState = useState("");
  var raceSearch = raceSearchState[0]; var setRaceSearch = raceSearchState[1];

  var HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": ANTHROPIC_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  };

  var handleProvParseText = async function() {
    if (!provPasteText.trim()) return;
    setFetchStatus("fetching");
    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 5000,
          messages: [{ role: "user", content: "Parse every race from this HRI provisional summary text into a JSON array. Return ONLY a raw JSON array with no markdown. Each race needs: meetingRef, raceRef, raceName, venue, date (YYYY-MM-DD), prizeMoney (number), forecastGoing, discipline, surface, minAge, maxAge, sex, distance, isMaidenOnly, isNoviceOnly, minRating, maxRating. Text:\n\n" + provPasteText }]
        })
      });
      var data = await res.json();
      var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      var s = txt.indexOf("["); var e = txt.lastIndexOf("]");
      if (s < 0 || e <= s) throw new Error("No races found");
      var parsed = JSON.parse(txt.slice(s, e + 1));
      setProvisionalRaces(parsed);
      setLastFetch(new Date().toISOString());
      setFetchStatus("done");
      setShowProvPaste(false);
      setProvPasteText("");
    } catch (err) {
      console.error(err);
      setFetchStatus("error");
    }
  };

  var addEntry = function(horseId) {
    if (!entry.venue || !entry.raceName) return;
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== horseId) return h;
        var newEntry = Object.assign({}, entry, { id: "pe_" + Date.now() });
        return Object.assign({}, h, { provisionalEntries: (h.provisionalEntries || []).concat([newEntry]) });
      });
    });
    setEntry({ venue: "", date: "", raceName: "", raceRef: "", note: "" });
    setShowAdd(null);
  };

  var removeEntry = function(horseId, entryId) {
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== horseId) return h;
        return Object.assign({}, h, { provisionalEntries: (h.provisionalEntries || []).filter(function(e) { return e.id !== entryId; }) });
      });
    });
  };

  var allProvisional = [];
  for (var ai = 0; ai < horses.length; ai++) {
    var hh = horses[ai];
    var entries = hh.provisionalEntries || [];
    for (var ei = 0; ei < entries.length; ei++) {
      allProvisional.push(Object.assign({}, entries[ei], { horse: hh }));
    }
  }

  var filteredRaces = provisionalRaces.filter(function(r) {
    var q = raceSearch.toLowerCase();
    return (r.raceName || "").toLowerCase().indexOf(q) >= 0 || (r.venue || "").toLowerCase().indexOf(q) >= 0;
  });

  var activeHorses = horses.filter(function(h) { return h.status !== "Inactive"; });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Provisional Entries</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Plan targets before official entries</div>
        </div>
      </div>

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showProvPaste ? 12 : 0, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>HRI Provisional Summaries</div>
            <div style={{ fontSize: 12, color: C.textMid }}>
              {lastFetch ? "Last parsed: " + new Date(lastFetch).toLocaleString("en-IE") : "No data yet - paste a provisional summary"}
            </div>
          </div>
          <Btn onClick={function() { setShowProvPaste(!showProvPaste); }} disabled={fetchStatus === "fetching"} style={{ fontSize: 12, padding: "8px 16px" }}>
            {fetchStatus === "fetching" ? "Parsing..." : "Paste Provisional Summary"}
          </Btn>
        </div>

        {showProvPaste && (
          <div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8, lineHeight: 1.6 }}>
              Open hri-ras.ie, go to Provisional Summaries, copy the text and paste below.
            </div>
            <textarea value={provPasteText} onChange={function(e) { setProvPasteText(e.target.value); }}
              placeholder="Paste provisional summary text here..."
              rows={6}
              style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "10px 14px", fontSize: 13, color: C.text, resize: "vertical", marginBottom: 10 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={handleProvParseText} disabled={!provPasteText.trim() || fetchStatus === "fetching"} style={{ fontSize: 13 }}>
                {fetchStatus === "fetching" ? "Parsing..." : "Parse Races"}
              </Btn>
              <Btn variant="ghost" onClick={function() { setShowProvPaste(false); setProvPasteText(""); }} style={{ fontSize: 13 }}>Cancel</Btn>
            </div>
          </div>
        )}

        {provisionalRaces.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <input value={raceSearch} onChange={function(e) { setRaceSearch(e.target.value); }}
              placeholder="Search races..."
              style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, marginBottom: 8 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {filteredRaces.slice(0, 10).map(function(r, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "7px 10px", background: C.cardOff, borderRadius: 8, fontSize: 12, alignItems: "center" }}>
                    <span style={{ fontWeight: 700, color: C.navy, minWidth: 80 }}>{r.meetingRef}</span>
                    <span style={{ color: C.textMid, minWidth: 50 }}>{r.raceRef}</span>
                    <span style={{ fontWeight: 600, color: C.text, flex: 1 }}>{r.raceName}</span>
                    <span style={{ color: C.textMid }}>{r.venue}</span>
                    <span style={{ color: C.gold, fontWeight: 700 }}>{"EUR" + (r.prizeMoney || 0)}</span>
                    <span style={{ color: C.textMid }}>{r.date ? new Date(r.date).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) : ""}</span>
                  </div>
                );
              })}
              {filteredRaces.length > 10 && <div style={{ fontSize: 12, color: C.textMid, padding: "4px 0" }}>{"+ " + (filteredRaces.length - 10) + " more races"}</div>}
            </div>
          </div>
        )}
        {fetchStatus === "error" && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 8 }}>Failed to parse. Try again.</div>}
      </div>

      {activeHorses.map(function(horse) {
        var horseEntries = horse.provisionalEntries || [];
        var isAdding = showAdd === horse.id;
        return (
          <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: horseEntries.length > 0 || isAdding ? 12 : 0 }}>
              <Silk silk={horse.silk} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner + " - " + horseEntries.length + " provisional target" + (horseEntries.length !== 1 ? "s" : "")}</div>
              </div>
              <Btn variant="gold" onClick={function() { setShowAdd(isAdding ? null : horse.id); }} style={{ fontSize: 12, padding: "6px 14px" }}>
                {isAdding ? "Cancel" : "+ Add Target"}
              </Btn>
            </div>

            {horseEntries.map(function(e) {
              return (
                <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: C.cardOff, borderRadius: 9, marginBottom: 6 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{e.raceName}</span>
                      {e.raceRef && <Tag color={C.navy} bg="rgba(10,22,40,0.07)">{e.raceRef}</Tag>}
                      <Tag color={C.gold}>Provisional</Tag>
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                      <span>{"📍 " + e.venue}</span>
                      {e.date && <span>{"📅 " + new Date(e.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                      {e.date && daysUntil(e.date) && (
                        <span style={{ color: daysUntil(e.date) <= 16 ? C.amber : C.textMid, fontWeight: 600 }}>
                          {daysUntil(e.date) > 0 ? daysUntil(e.date) + "d" : "past"}
                        </span>
                      )}
                    </div>
                    {e.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", marginTop: 4 }}>{"💬 " + e.note}</div>}
                  </div>
                  <Btn variant="ghost" onClick={function() { removeEntry(horse.id, e.id); }} style={{ padding: "4px 8px", fontSize: 11, color: C.red, borderColor: C.red }}>Remove</Btn>
                </div>
              );
            })}

            {isAdding && (
              <div style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "14px 16px", marginTop: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>{"Add Target for " + horse.name}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  {[
                    { key: "raceName", label: "Race Name", placeholder: "e.g. Mares Handicap Hurdle", full: true },
                    { key: "venue", label: "Venue", placeholder: "e.g. Navan" },
                    { key: "date", label: "Date", type: "date" },
                    { key: "raceRef", label: "Meeting Ref", placeholder: "e.g. Limerick 55 Race A" },
                  ].map(function(field) {
                    return (
                      <div key={field.key} style={{ gridColumn: field.full ? "1 / -1" : "auto" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{field.label}</div>
                        <input type={field.type || "text"} placeholder={field.placeholder}
                          value={entry[field.key]}
                          onChange={function(e) { var v = e.target.value; var k = field.key; setEntry(function(prev) { return Object.assign({}, prev, { [k]: v }); }); }}
                          style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Trainer Note (optional)</div>
                  <input type="text" placeholder="e.g. If ground stays soft"
                    value={entry.note}
                    onChange={function(e) { var v = e.target.value; setEntry(function(prev) { return Object.assign({}, prev, { note: v }); }); }}
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                {entry.date && (function() {
                    var rawMeds = (settings && settings.medications) || [
                      { name: "Peptizole", courseDays: 12, withdrawalDays: 4 },
                      { name: "Antepsin", courseDays: 12, withdrawalDays: 1 }
                    ];
                    var raceDate = new Date(entry.date + "T00:00:00");
                    var fmt = function(d) { return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" }); };
                    return (
                      <div style={{ background: "#eaf4ff", border: "1px solid #bee3f8", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                          Medication Schedule for this race
                        </div>
                        {rawMeds.filter(function(m) { return m.courseDays; }).map(function(med) {
                          var wDays = med.withdrawalDays != null ? parseInt(med.withdrawalDays) : 4;
                          var cDays = parseInt(med.courseDays) || 12;
                          var latestFinish = new Date(raceDate); latestFinish.setDate(latestFinish.getDate() - wDays);
                          var latestStart = new Date(raceDate); latestStart.setDate(latestStart.getDate() - (wDays + cDays));
                          return (
                            <div key={med.name || med.label} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, padding: "6px 0", borderBottom: "1px solid #bee3f8", fontSize: 13 }}>
                              <span style={{ fontWeight: 700, color: C.navy, minWidth: 90 }}>{med.name || med.label}</span>
                              <span style={{ color: C.green, fontWeight: 600 }}>Start by {fmt(latestStart)}</span>
                              <span style={{ color: C.textMid }}> - </span>
                              <span style={{ color: C.red, fontWeight: 600 }}>Finish by {fmt(latestFinish)}</span>
                            </div>
                          );
                        })}
                        <div style={{ fontSize: 11, color: C.textMid, marginTop: 6 }}>
                          Finish medication before these dates to be clear to enter.
                        </div>
                      </div>
                    );
                  })()}
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={function() { addEntry(horse.id); }}>Save Target</Btn>
                  <Btn variant="ghost" onClick={function() { setShowAdd(null); }}>Cancel</Btn>
                </div>
              </div>
            )}
          </div>
        );
      })}

        {allProvisional.length > 0 && (
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 18px", marginTop: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>All Provisional Targets</div>
            {allProvisional.filter(function(e) { return e.date; }).sort(function(a, b) { return new Date(a.date) - new Date(b.date); }).map(function(e, i) {
              var rawMeds = (settings && settings.medications) || [
                { name: "Peptizole", courseDays: 12, withdrawalDays: 4 },
                { name: "Antepsin", courseDays: 12, withdrawalDays: 1 }
              ];
              var raceDate = new Date(e.date + "T00:00:00");
              var fmt = function(d) { return d.toLocaleDateString("en-IE", { day: "numeric", month: "short" }); };
              var today3 = new Date(); today3.setHours(0,0,0,0);
              var dLeft = daysUntil(e.date);
              return (
                <div key={i} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <Silk silk={e.horse.silk} size={26} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{e.horse.name}</span>
                      <span style={{ color: C.textMid, marginLeft: 8, fontSize: 12 }}>{e.raceName + "  -  " + e.venue}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{fmt(raceDate)}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: dLeft <= 16 ? C.red : dLeft <= 30 ? C.amber : C.green }}>{dLeft > 0 ? dLeft + "d away" : "Past"}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {rawMeds.filter(function(m) { return m.courseDays; }).map(function(med) {
                      var wDays = med.withdrawalDays != null ? parseInt(med.withdrawalDays) : 4;
                      var cDays = parseInt(med.courseDays) || 12;
                      var startDate = new Date(raceDate); startDate.setDate(startDate.getDate() - (wDays + cDays));
                      var finishDate = new Date(raceDate); finishDate.setDate(finishDate.getDate() - wDays);
                      var urgent = startDate <= today3;
                      return (
                        <div key={med.name || med.label} style={{ background: urgent ? C.red + "10" : C.card, border: "1px solid " + (urgent ? C.red + "40" : C.border), borderRadius: 8, padding: "5px 10px", fontSize: 12 }}>
                          <span style={{ fontWeight: 700, color: urgent ? C.red : C.navy }}>{med.name || med.label}: </span>
                          <span style={{ color: urgent ? C.red : C.green }}>{urgent ? "Start NOW" : "Start " + fmt(startDate)}</span>
                          <span style={{ color: C.textMid }}>  -  </span>
                          <span style={{ color: C.red }}>Finish {fmt(finishDate)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProvisionalEntries;
