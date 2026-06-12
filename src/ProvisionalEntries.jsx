import React, { useState } from "react";
import { Btn, Tag, Silk, C, daysUntil, ANTHROPIC_KEY } from "./shared";

function ProvisionalEntries({ horses, setHorses, settings }) {
  var racesState = useState([]);
  var provisionalRaces = racesState[0]; var setProvisionalRaces = racesState[1];
  var pasteState = useState("");
  var pasteText = pasteState[0]; var setPasteText = pasteState[1];
  var showPasteState = useState(false);
  var showPaste = showPasteState[0]; var setShowPaste = showPasteState[1];
  var fetchStatusState = useState("");
  var fetchStatus = fetchStatusState[0]; var setFetchStatus = fetchStatusState[1];
  var lastFetchState = useState(null);
  var lastFetch = lastFetchState[0]; var setLastFetch = lastFetchState[1];

  var activeHorses = horses.filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  function parseProvisional() {
    if (!pasteText.trim()) return;
    setFetchStatus("fetching");
    var body = JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: 1000,
      messages: [{ role: "user", content: "Parse every race from this HRI provisional summary text into a JSON array. Return ONLY a raw JSON array. Each item needs: id, raceName, venue, date (YYYY-MM-DD), discipline, distanceFurlongs, minAge, maxAge, minRating, maxRating, sex, grade, prizeMoney. Text:\n\n" + pasteText }]
    });
    fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    }).then(function(r) { return r.json(); })
    .then(function(data) {
      var text = data.content && data.content[0] && data.content[0].text;
      if (text) {
        try {
          var clean = text.replace(/```json|```/g, "").trim();
          var parsed = JSON.parse(clean);
          if (Array.isArray(parsed)) { setProvisionalRaces(parsed); setLastFetch(Date.now()); }
        } catch(e) { console.error("Parse error", e); }
      }
      setFetchStatus(""); setShowPaste(false); setPasteText("");
    }).catch(function() { setFetchStatus(""); });
  }

  function addEntry(horseId) {
    var entryEl = document.getElementById("entry_" + horseId);
    if (!entryEl) return;
    var data = JSON.parse(entryEl.value || "{}");
    if (!data.raceName && !data.venue) return;
    var newEntry = Object.assign({ id: "pe_" + Date.now() }, data);
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== horseId) return h;
        return Object.assign({}, h, { provisionalEntries: (h.provisionalEntries || []).concat([newEntry]) });
      });
    });
  }

  function removeEntry(horseId, entryId) {
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== horseId) return h;
        return Object.assign({}, h, { provisionalEntries: (h.provisionalEntries || []).filter(function(e) { return e.id !== entryId; }) });
      });
    });
  }

  var showAddMapState = useState({});
  var showAddMap = showAddMapState[0]; var setShowAddMap = showAddMapState[1];
  var entryMapState = useState({});
  var entryMap = entryMapState[0]; var setEntryMap = entryMapState[1];

  function toggleShowAdd(horseId) {
    setShowAddMap(function(prev) {
      var next = Object.assign({}, prev);
      next[horseId] = !prev[horseId];
      return next;
    });
  }

  function updateEntry(horseId, key, val) {
    setEntryMap(function(prev) {
      var cur = prev[horseId] || { raceName: "", venue: "", date: "", raceRef: "", note: "" };
      var next = Object.assign({}, prev);
      next[horseId] = Object.assign({}, cur, { [key]: val });
      return next;
    });
  }

  function addEntryForHorse(horseId) {
    var entry = entryMap[horseId] || {};
    if (!entry.raceName && !entry.venue) return;
    var newEntry = Object.assign({ id: "pe_" + Date.now() }, entry);
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== horseId) return h;
        return Object.assign({}, h, { provisionalEntries: (h.provisionalEntries || []).concat([newEntry]) });
      });
    });
    setEntryMap(function(prev) { var next = Object.assign({}, prev); next[horseId] = { raceName: "", venue: "", date: "", raceRef: "", note: "" }; return next; });
    setShowAddMap(function(prev) { var next = Object.assign({}, prev); next[horseId] = false; return next; });
  }

  var allProvisional = [];
  activeHorses.forEach(function(hh) {
    var entries = hh.provisionalEntries || [];
    for (var ei = 0; ei < entries.length; ei++) {
      allProvisional.push(Object.assign({}, entries[ei], { horse: hh }));
    }
  });

  var filteredRaces = provisionalRaces.filter(function(r) {
    return true;
  });

  function getMedCards(raceDate, rawMeds, today3) {
    var cards = [];
    for (var mi = 0; mi < rawMeds.length; mi++) {
      var med = rawMeds[mi];
      if (!med.courseDays) continue;
      var wDays = med.withdrawalDays != null ? parseInt(med.withdrawalDays) : 4;
      var cDays = parseInt(med.courseDays) || 12;
      var startDate = new Date(raceDate); startDate.setDate(startDate.getDate() - (wDays + cDays - 1));
      var finishDate = new Date(raceDate); finishDate.setDate(finishDate.getDate() - wDays);
      var urgent = startDate <= today3;
      var startStr = urgent ? "Start NOW" : "Start " + startDate.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
      var finishStr = "Finish " + finishDate.toLocaleDateString("en-IE", { day: "numeric", month: "short" });
      var medName = med.name || med.label || "Medication";
      cards.push({ medName: medName, urgent: urgent, startStr: startStr, finishStr: finishStr, key: mi });
    }
    return cards;
  }

  var defaultMeds = [
    { name: "Peptizole", courseDays: 12, withdrawalDays: 4 },
    { name: "Antepsin", courseDays: 12, withdrawalDays: 1 }
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Provisional Entries</div>
        <Btn onClick={function() { setShowPaste(function(p) { return !p; }); }}>
          {showPaste ? "Cancel" : "Paste Provisional Summary"}
        </Btn>
      </div>

      {showPaste && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>HRI Provisional Summaries</div>
          <div style={{ fontSize: 12, color: C.textMid, marginBottom: 8 }}>
            {lastFetch ? "Last parsed: " + new Date(lastFetch).toLocaleString("en-IE") : "No data yet - paste a provisional summary to parse races"}
          </div>
          <textarea value={pasteText} onChange={function(e) { setPasteText(e.target.value); }}
            placeholder="Paste provisional summary text here..."
            style={{ width: "100%", height: 120, padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, resize: "vertical" }} />
          <Btn onClick={parseProvisional} style={{ marginTop: 8 }}>
            {fetchStatus === "fetching" ? "Parsing..." : "Parse Races"}
          </Btn>
        </div>
      )}

      {filteredRaces.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8 }}>Parsed Races</div>
          {filteredRaces.slice(0, 10).map(function(race) {
            return (
              <div key={race.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 8, padding: "10px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{race.raceName}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{race.venue + " - " + race.date + " - " + race.discipline}</div>
                </div>
                {race.minRating && <span style={{ fontSize: 11, color: C.textMid }}>{"Rtd " + (race.minRating || 0) + "-" + (race.maxRating || "open")}</span>}
              </div>
            );
          })}
        </div>
      )}

      {activeHorses.map(function(horse) {
        var horseEntries = horse.provisionalEntries || [];
        var showAdd = !!showAddMap[horse.id];
        var entry = entryMap[horse.id] || { raceName: "", venue: "", date: "", raceRef: "", note: "" };

        return (
          <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: horseEntries.length > 0 || showAdd ? 12 : 0 }}>
              <Silk silk={horse.silk} size={32} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner + " - " + horseEntries.length + " provisional target(s)"}</div>
              </div>
              <Btn variant="ghost" onClick={function() { toggleShowAdd(horse.id); }}>
                {showAdd ? "Cancel" : "+ Add Target"}
              </Btn>
            </div>

            {horseEntries.map(function(e) {
              return (
                <div key={e.id} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "10px 12px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{e.raceName}</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid, marginTop: 2 }}>
                      <span>{e.venue}</span>
                      {e.date && <span>{new Date(e.date + "T00:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                      {e.date && daysUntil(e.date) && (
                        <span style={{ color: daysUntil(e.date) <= 16 ? C.amber : C.textMid, fontWeight: 600 }}>
                          {daysUntil(e.date) > 0 ? daysUntil(e.date) + "d" : "past"}
                        </span>
                      )}
                    </div>
                    {e.note && <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", marginTop: 3 }}>{e.note}</div>}
                  </div>
                  <Btn variant="ghost" onClick={function() { removeEntry(horse.id, e.id); }} style={{ padding: "4px 8px", fontSize: 11 }}>Remove</Btn>
                </div>
              );
            })}

            {showAdd && (
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
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>{field.label}</div>
                        <input type={field.type || "text"} placeholder={field.placeholder}
                          value={entry[field.key]}
                          onChange={function(e) { var v = e.target.value; var k = field.key; updateEntry(horse.id, k, v); }}
                          style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase" }}>Notes / Conditions</div>
                  <input type="text" placeholder="e.g. If ground stays soft"
                    value={entry.note}
                    onChange={function(e) { var v = e.target.value; updateEntry(horse.id, "note", v); }}
                    style={{ width: "100%", padding: "8px 12px", background: "#fff", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                </div>
                {entry.date && (function() {
                  var rawMeds2 = (settings && settings.medications) || defaultMeds;
                  var raceDate2 = new Date(entry.date + "T00:00:00");
                  var today2 = new Date(); today2.setHours(0,0,0,0);
                  var cards2 = getMedCards(raceDate2, rawMeds2, today2);
                  if (cards2.length === 0) return null;
                  return (
                    <div style={{ background: "#eaf4ff", border: "1px solid #bee3f8", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Medication Schedule</div>
                      {cards2.map(function(card) {
                        return (
                          <div key={card.key} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, padding: "5px 0", borderBottom: "1px solid #bee3f8", fontSize: 13 }}>
                            <span style={{ fontWeight: 700, color: C.navy, minWidth: 90 }}>{card.medName}</span>
                            <span style={{ color: card.urgent ? C.red : C.green, fontWeight: 600 }}>{card.startStr}</span>
                            <span style={{ color: C.textMid }}>{"-"}</span>
                            <span style={{ color: C.red, fontWeight: 600 }}>{card.finishStr}</span>
                          </div>
                        );
                      })}
                      <div style={{ fontSize: 11, color: C.textMid, marginTop: 6 }}>Finish before these dates to be clear to enter.</div>
                    </div>
                  );
                })()}
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={function() { addEntryForHorse(horse.id); }}>Save Target</Btn>
                  <Btn variant="ghost" onClick={function() { toggleShowAdd(horse.id); }}>Cancel</Btn>
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
            var rawMeds3 = (settings && settings.medications) || defaultMeds;
            var raceDate3 = new Date(e.date + "T00:00:00");
            var today4 = new Date(); today4.setHours(0,0,0,0);
            var dLeft = daysUntil(e.date);
            var raceStr3 = raceDate3.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
            var cards3 = getMedCards(raceDate3, rawMeds3, today4);
            return (
              <div key={i} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <Silk silk={e.horse.silk} size={26} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{e.horse.name}</span>
                    <span style={{ color: C.textMid, marginLeft: 8, fontSize: 12 }}>{e.raceName + " - " + e.venue}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{raceStr3}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: dLeft <= 16 ? C.red : dLeft <= 30 ? C.amber : C.green }}>{dLeft > 0 ? dLeft + "d away" : "Past"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {cards3.map(function(card) {
                    return (
                      <div key={card.key} style={{ background: card.urgent ? C.red + "10" : C.card, border: "1px solid " + (card.urgent ? C.red + "40" : C.border), borderRadius: 8, padding: "5px 10px", fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: card.urgent ? C.red : C.navy }}>{card.medName + ": "}</span>
                        <span style={{ color: card.urgent ? C.red : C.green }}>{card.startStr}</span>
                        <span style={{ color: C.textMid }}>{" - "}</span>
                        <span style={{ color: C.red }}>{card.finishStr}</span>
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
  );
}

export default ProvisionalEntries;
