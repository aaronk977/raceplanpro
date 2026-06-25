import React, { useState } from "react";
import { Btn, Tag, Silk, C, daysUntil } from "./shared";

// Provisional Entries - REDESIGNED
// Paste the provisional races PDF text -> app LISTS all races (no AI recommending).
// Trainer picks a horse (or several) they feel suit a race -> becomes a provisional
// entry showing medication start/finish dates. All entries live here, not on paper.

function ProvisionalEntries({ horses, setHorses, settings }) {
  var racesState = useState([]);
  var provisionalRaces = racesState[0]; var setProvisionalRaces = racesState[1];
  var pasteState = useState("");
  var pasteText = pasteState[0]; var setPasteText = pasteState[1];
  var showPasteState = useState(false);
  var showPaste = showPasteState[0]; var setShowPaste = showPasteState[1];
  var fetchStatusState = useState("");
  var fetchStatus = fetchStatusState[0]; var setFetchStatus = fetchStatusState[1];
  var pickRaceState = useState(null);
  var pickForRace = pickRaceState[0]; var setPickForRace = pickRaceState[1];

  var defaultMeds = [
    { name: "Peptizole", courseDays: 12, withdrawalDays: 4 },
    { name: "Antepsin", courseDays: 12, withdrawalDays: 1 }
  ];

  var activeHorses = (horses || []).filter(function(h) { return h.status !== "Retired" && h.status !== "Sold"; });

  // If the AI response is cut off mid-list, recover every complete race object from it
  function salvageRaces(str) {
    var races = [];
    var depth = 0; var start = -1;
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      if (ch === "{") { if (depth === 0) start = i; depth++; }
      else if (ch === "}") {
        depth--;
        if (depth === 0 && start >= 0) {
          var chunk = str.slice(start, i + 1);
          try { races.push(JSON.parse(chunk)); } catch(e) {}
          start = -1;
        }
      }
    }
    return races;
  }

  function parseProvisional() {
    if (!pasteText.trim()) return;
    setFetchStatus("fetching");
    var body = JSON.stringify({
      model: "claude-sonnet-4-6", max_tokens: 8000,
      messages: [{ role: "user", content: "Parse every race from this HRI provisional summary text into a JSON array. Return ONLY a raw JSON array, no other text. Each item needs: id, raceName, venue, date (YYYY-MM-DD), discipline, distanceFurlongs, minAge, maxAge, minRating, maxRating, sex, grade, prizeMoney. Text:\n\n" + pasteText }]
    });
    fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    }).then(function(r) { return r.json(); })
    .then(function(data) {
      var text = data.content && data.content[0] && data.content[0].text;
      if (text) {
        var clean = text.replace(/```json|```/g, "").trim();
        var parsed = null;
        try {
          parsed = JSON.parse(clean);
        } catch(e) {
          // Response may have been cut off (truncated). Salvage every COMPLETE race object.
          parsed = salvageRaces(clean);
        }
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          setProvisionalRaces(parsed);
          setFetchStatus(""); setShowPaste(false); setPasteText("");
        } else {
          setFetchStatus("error");
        }
        return;
      }
      setFetchStatus("error");
    }).catch(function() { setFetchStatus("error"); });
  }

  // Medication start/finish dates around a race date (reused, working logic)
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
      cards.push({ key: medName + raceDate, medName: medName, urgent: urgent, startStr: startStr, finishStr: finishStr });
    }
    return cards;
  }

  // Assign a horse to a race as a provisional entry (the trainer's pick)
  function assignHorse(race, horseId) {
    var newEntry = {
      id: "pe_" + Date.now() + "_" + horseId,
      raceName: race.raceName || "", venue: race.venue || "", date: race.date || "",
      discipline: race.discipline || "", grade: race.grade || "", raceId: race.id || ""
    };
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== horseId) return h;
        var existing = h.provisionalEntries || [];
        // Avoid duplicate of same race for same horse
        var dup = existing.find(function(e) { return e.raceName === newEntry.raceName && e.date === newEntry.date; });
        if (dup) return h;
        return Object.assign({}, h, { provisionalEntries: existing.concat([newEntry]) });
      });
    });
    setPickForRace(null);
  }

  function removeEntry(horseId, entryId) {
    setHorses(function(prev) {
      return prev.map(function(h) {
        if (h.id !== horseId) return h;
        return Object.assign({}, h, { provisionalEntries: (h.provisionalEntries || []).filter(function(e) { return e.id !== entryId; }) });
      });
    });
  }

  // Which horses are already entered for a given race
  function horsesForRace(race) {
    var out = [];
    activeHorses.forEach(function(h) {
      (h.provisionalEntries || []).forEach(function(e) {
        if (e.raceName === (race.raceName || "") && e.date === (race.date || "")) {
          out.push({ horse: h, entry: e });
        }
      });
    });
    return out;
  }

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var meds = (settings && settings.medications) || defaultMeds;

  // Sort races by date
  var sortedRaces = provisionalRaces.slice().sort(function(a, b) {
    return (a.date || "").localeCompare(b.date || "");
  });

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Provisional Entries</div>
          <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Paste the week's provisional races, then pick the horses you fancy for each. Medication dates are worked out for you.</div>
        </div>
        <Btn onClick={function() { setShowPaste(!showPaste); }}>{showPaste ? "Close" : "Paste Races"}</Btn>
      </div>

      {showPaste && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Paste the provisional races text from the HRI PDF:</div>
          <textarea value={pasteText} onChange={function(e) { setPasteText(e.target.value); }}
            placeholder="Paste the provisional races here..."
            style={{ width: "100%", minHeight: 140, padding: "10px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, background: C.cardOff, fontFamily: "monospace" }} />
          <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
            <Btn onClick={parseProvisional} disabled={fetchStatus === "fetching"}>{fetchStatus === "fetching" ? "Reading races..." : "List Races"}</Btn>
            {fetchStatus === "error" && <span style={{ fontSize: 13, color: C.red }}>Could not read the races - try pasting again.</span>}
          </div>
          <div style={{ fontSize: 11, color: C.textMid, marginTop: 8, lineHeight: 1.5 }}>This just lists the races. You choose which of your horses suits each one - the app never picks for you.</div>
        </div>
      )}

      {sortedRaces.length === 0 && !showPaste && (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No races listed yet</div>
          <div style={{ fontSize: 13, color: C.textMid, marginBottom: 16 }}>Paste this week's provisional races to get started.</div>
          <Btn onClick={function() { setShowPaste(true); }}>Paste Races</Btn>
        </div>
      )}

      {sortedRaces.map(function(race) {
        var entered = horsesForRace(race);
        var raceDate = race.date ? new Date(race.date + "T12:00:00") : null;
        var prettyDate = raceDate ? raceDate.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }) : "";
        var medCards = race.date ? getMedCards(race.date, meds, today) : [];
        return (
          <div key={race.id || (race.raceName + race.date)} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{race.raceName || "Race"}</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 3 }}>
                  {[race.venue, prettyDate, race.discipline, race.grade].filter(Boolean).join("  -  ")}
                </div>
                <div style={{ fontSize: 11, color: C.textMid, marginTop: 3 }}>
                  {[
                    race.distanceFurlongs ? race.distanceFurlongs + "f" : "",
                    (race.minAge || race.maxAge) ? ("Age " + (race.minAge || "") + (race.maxAge ? "-" + race.maxAge : "+")) : "",
                    (race.minRating || race.maxRating) ? ("Rating " + (race.minRating || "0") + "-" + (race.maxRating || "")) : "",
                    race.sex && race.sex !== "any" ? race.sex : "",
                    race.prizeMoney ? ("EUR " + race.prizeMoney) : ""
                  ].filter(Boolean).join("  -  ")}
                </div>
              </div>
              <Btn variant="ghost" onClick={function() { setPickForRace(pickForRace === (race.id || race.raceName + race.date) ? null : (race.id || race.raceName + race.date)); }}>
                + Add horse
              </Btn>
            </div>

            {pickForRace === (race.id || race.raceName + race.date) && (
              <div style={{ marginTop: 12, padding: "12px", background: C.cardOff, borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, marginBottom: 8 }}>Pick a horse you fancy for this race:</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
                  {activeHorses.map(function(h) {
                    var already = entered.find(function(en) { return en.horse.id === h.id; });
                    return (
                      <button key={h.id} disabled={!!already} onClick={function() { assignHorse(race, h.id); }}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderRadius: 8, border: "1px solid " + C.border, background: already ? C.border : C.card, color: already ? C.textMid : C.navy, fontSize: 13, fontWeight: 600, cursor: already ? "default" : "pointer", textAlign: "left" }}>
                        <Silk silk={h.silk} size={20} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.name}{already ? " (in)" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {entered.length > 0 && (
              <div style={{ marginTop: 12, borderTop: "1px solid " + C.border, paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Your provisional entries</div>
                {entered.map(function(en) {
                  return (
                    <div key={en.entry.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", flexWrap: "wrap" }}>
                      <Silk silk={en.horse.silk} size={28} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{en.horse.name}</span>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
                        {medCards.map(function(card) {
                          return (
                            <span key={card.key} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, background: card.urgent ? C.red + "15" : C.green + "12", color: card.urgent ? C.red : C.green, fontWeight: 600 }}>
                              {card.medName + ": " + card.startStr + " - " + card.finishStr}
                            </span>
                          );
                        })}
                      </div>
                      <button onClick={function() { removeEntry(en.horse.id, en.entry.id); }}
                        style={{ fontSize: 11, fontWeight: 700, padding: "5px 10px", borderRadius: 7, border: "1px solid " + C.border, background: C.card, color: C.red, cursor: "pointer" }}>
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ProvisionalEntries;
