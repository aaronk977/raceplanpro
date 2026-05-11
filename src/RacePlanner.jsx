import React, { useState } from "react";
import { Btn, Tag, Silk, FormDots, StatusPill, C, TODAY, daysUntil, canRace, coolingDate, getAge, isEligible, ANTHROPIC_KEY } from "./shared";

var ANALYSE_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
};

async function getAITake(horse, race) {
  var prompt = "You are an Irish horse racing expert. Analyse this race for this horse and return a JSON object only. Horse: " + horse.name + " (" + getAge(horse.dob) + "yo " + horse.sex + ", OR " + (horse.nhRating || horse.flatRating || "unrated") + ", trainer: " + (horse.trainer || "unknown") + "). Race: " + race.raceName + " at " + race.venue + " on " + race.date + ", " + (race.discipline || "") + " " + (race.distanceFurlongs || "") + "f, prize EUR" + (race.prizeMoney || 0) + ", going: " + (race.forecastGoing || "unknown") + ". Return JSON: { overall: 0-100, verdict: string, scores: { handicap_edge: 0-10, class_fit: 0-10, conditions_match: 0-10, timing: 0-10, cuteness: 0-10 }, bullets: [{icon, title, point}] }";
  var res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: ANALYSE_HEADERS,
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });
  var data = await res.json();
  var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
  var s = txt.indexOf("{"); var e = txt.lastIndexOf("}");
  if (s < 0 || e <= s) throw new Error("No JSON in response");
  return JSON.parse(txt.slice(s, e + 1));
}

function RacePlanner({ horses, setHorses }) {
  var selHorseState = useState(horses[0] || null);
  var selHorse = selHorseState[0]; var setSelHorse = selHorseState[1];
  var racesState = useState([]);
  var races = racesState[0]; var setRaces = racesState[1];
  var fetchStatusState = useState("idle");
  var fetchStatus = fetchStatusState[0]; var setFetchStatus = fetchStatusState[1];
  var lastFetchState = useState(null);
  var lastFetch = lastFetchState[0]; var setLastFetch = lastFetchState[1];
  var analysesState = useState({});
  var analyses = analysesState[0]; var setAnalyses = analysesState[1];
  var loadingState = useState({});
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var loadStageState = useState({});
  var loadStage = loadStageState[0]; var setLoadStage = loadStageState[1];
  var shortlistedState = useState({});
  var shortlisted = shortlistedState[0]; var setShortlisted = shortlistedState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];
  var pasteTextState = useState("");
  var pasteText = pasteTextState[0]; var setPasteText = pasteTextState[1];
  var showPasteState = useState(false);
  var showPaste = showPasteState[0]; var setShowPaste = showPasteState[1];

  function k(hId, rId) { return hId + "_" + rId; }

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 4000);
  }

  var handleParseText = async function() {
    if (!pasteText.trim()) return;
    setFetchStatus("fetching");
    try {
      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANALYSE_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 5000,
          messages: [{ role: "user", content: "Parse every race from this HRI race conditions text into a JSON array. Return ONLY a raw JSON array, no markdown. Each race needs: id (unique string), raceName, venue, date (YYYY-MM-DD), entryDeadline (YYYY-MM-DD), discipline (Flat/Hurdle/Chase), surface (Turf/AWT), distanceFurlongs (number), forecastGoing, prizeMoney (number), grade, sexRestriction (Open/Mares/Fillies), ageMin (number), ageMax (number or null), ratingMin (number or null), ratingMax (number or null), isMaiden (bool), isNovice (bool), isEBF (bool). Text:\n\n" + pasteText }]
        })
      });
      var data = await res.json();
      var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      var s = txt.indexOf("["); var e = txt.lastIndexOf("]");
      if (s < 0 || e <= s) throw new Error("No races found");
      var parsed = JSON.parse(txt.slice(s, e + 1));
      setRaces(parsed);
      setLastFetch(new Date().toISOString());
      setFetchStatus("done");
      setShowPaste(false);
      setPasteText("");
      showToast(parsed.length + " races loaded");
    } catch (err) {
      console.error(err);
      setFetchStatus("error");
      showToast("Failed to parse — try again", C.red);
    }
  };

  if (!selHorse) return (
    <div style={{ padding: 40, textAlign: "center", color: C.textMid }}>
      No horses in yard yet. Add horses in My Yard first.
    </div>
  );

  var eligible = races.filter(function(r) {
    var age = getAge(selHorse.dob);
    if (r.ageMin && age < r.ageMin) return false;
    if (r.ageMax && age > r.ageMax) return false;
    var disc = selHorse.discipline || [];
    if (r.discipline && disc.length > 0 && disc.indexOf(r.discipline) < 0) return false;
    if (r.isMaiden && !selHorse.isMaiden) return false;
    if (r.isNovice && !selHorse.isNovice) return false;
    var rtg = r.discipline === "Flat" ? (selHorse.flatRating || selHorse.awtRating) :
              r.discipline === "Chase" ? (selHorse.chaseRating || selHorse.nhRating) :
              r.discipline === "Hurdle" ? (selHorse.hurdleRating || selHorse.nhRating) :
              (selHorse.nhRating || selHorse.flatRating);
    if (r.ratingMax && rtg && rtg > r.ratingMax) return false;
    if (r.ratingMin && rtg && rtg < r.ratingMin) return false;
    return true;
  });

  var sorted = eligible.slice().sort(function(a, b) {
    var ba = (analyses[k(selHorse.id, b.id)] || {}).overall;
    var aa = (analyses[k(selHorse.id, a.id)] || {}).overall;
    return (ba != null ? ba : -1) - (aa != null ? aa : -1);
  });

  var shortlistItems = Object.values(shortlisted).filter(Boolean);

  function getMedDates(raceDate, withdrawalDays, courseDays) {
    if (!raceDate) return null;
    var race = new Date(raceDate);
    var lastDay = new Date(race);
    lastDay.setDate(lastDay.getDate() - withdrawalDays);
    var startDay = new Date(lastDay);
    startDay.setDate(startDay.getDate() - (courseDays - 1));
    return {
      start: startDay.toLocaleDateString("en-IE", { day: "numeric", month: "short" }),
      stop: lastDay.toLocaleDateString("en-IE", { day: "numeric", month: "short" }),
      startDate: startDay,
    };
  }

  var analyseRace = async function(horse, race) {
    var key = k(horse.id, race.id);
    setLoading(function(l) { return Object.assign({}, l, { [key]: true }); });
    setLoadStage(function(s) { return Object.assign({}, s, { [key]: 0 }); });
    var stage = 0;
    var timer = setInterval(function() {
      stage = stage + 1;
      if (stage < 4) {
        setLoadStage(function(s) { return Object.assign({}, s, { [key]: stage }); });
      } else {
        clearInterval(timer);
      }
    }, 2800);
    try {
      var result = await getAITake(horse, race);
      clearInterval(timer);
      setAnalyses(function(a) { return Object.assign({}, a, { [key]: result }); });
    } catch (err) {
      console.error(err);
      clearInterval(timer);
    }
    setLoading(function(l) { return Object.assign({}, l, { [key]: false }); });
  };

  function handleEntry(horse, race) {
    var raceDate = new Date(race.date).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
    var msgText = horse.name + " has been entered in " + race.raceName + " at " + race.venue + " on " + raceDate + ". Prize: EUR" + (race.prizeMoney || "TBC") + ". We will be in touch closer to declaration day.";
    var phone = (horse.ownerPhone || "").split("").filter(function(d) { return d >= "0" && d <= "9"; }).join("");
    if (phone) window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msgText), "_blank");
    showToast("Entry confirmed — WhatsApp opened for " + horse.owner);
  }

  function handleDeclaration(horse, race) {
    var raceDate = new Date(race.date).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
    var jockey = horse.jockey || "TBC";
    var msgText = horse.name + " is declared to run in " + race.raceName + " at " + race.venue + " on " + raceDate + ". Jockey: " + jockey + ". Going: " + (race.forecastGoing || "TBC") + ". We will keep you updated on race day.";
    var phone = (horse.ownerPhone || "").split("").filter(function(d) { return d >= "0" && d <= "9"; }).join("");
    if (phone) window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msgText), "_blank");
    showToast("Declaration confirmed — WhatsApp opened for " + horse.owner, C.blue);
  }

  var LOAD_MSGS = ["Checking who is in this race...", "Looking at the field...", "Checking trainer record...", "Building your analysis..."];
  var SCORE_KEYS = [["HCP", "handicap_edge"], ["Class", "class_fit"], ["Going", "conditions_match"], ["Timing", "timing"], ["Angle", "cuteness"]];

  return (
    <div>
      {shortlistItems.length > 0 && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{"Shortlist — " + shortlistItems.length + " race" + (shortlistItems.length !== 1 ? "s" : "")}</div>
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Medication dates calculated automatically</div>
            </div>
            <Btn variant="ghost" onClick={function() { setShortlisted({}); }} style={{ fontSize: 12 }}>Clear All</Btn>
          </div>
          {shortlistItems.map(function(item, idx) {
            var peptDates = getMedDates(item.race.date, 4, 12);
            var antepsinDates = getMedDates(item.race.date, 1, 12);
            var peptWarning = peptDates && peptDates.startDate < new Date();
            var pm = item.race.prizeMoney;
            var pmStr = pm ? (" — EUR" + (pm >= 1000 ? Math.round(pm * 0.001) + "k" : pm)) : "";
            return (
              <div key={idx} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Silk silk={item.horse.silk} size={24} />
                      <span style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{item.horse.name}</span>
                      <span style={{ fontSize: 12, color: C.textMid }}>—</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.race.raceName}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMid }}>
                      {item.race.venue + (item.race.date ? " — " + new Date(item.race.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }) : "") + pmStr}
                    </div>
                  </div>
                  <button onClick={function() { var sk = k(item.horse.id, item.race.id); setShortlisted(function(s) { return Object.assign({}, s, { [sk]: null }); }); }}
                    style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 18, padding: 0 }}>x</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {peptDates && (
                    <div style={{ background: peptWarning ? "rgba(192,57,43,0.08)" : "rgba(30,111,181,0.08)", border: "1px solid " + (peptWarning ? C.red : C.blue) + "30", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: peptWarning ? C.red : C.blue, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                        {peptWarning ? "Peptizole — START NOW" : "Peptizole"}
                      </div>
                      <div style={{ fontSize: 12, color: C.text }}>{"Start: " + peptDates.start}</div>
                      <div style={{ fontSize: 12, color: C.text }}>{"Stop: " + peptDates.stop}</div>
                    </div>
                  )}
                  {antepsinDates && (
                    <div style={{ background: "rgba(109,63,192,0.08)", border: "1px solid " + C.purple + "30", borderRadius: 8, padding: "10px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Antepsin</div>
                      <div style={{ fontSize: 12, color: C.text }}>{"Start: " + antepsinDates.start}</div>
                      <div style={{ fontSize: 12, color: C.text }}>{"Stop: " + antepsinDates.stop}</div>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 8 }}>
                  <Btn variant="green" onClick={function() { handleEntry(item.horse, item.race); }} style={{ justifyContent: "center" }}>Confirm Entry</Btn>
                  <Btn onClick={function() { handleDeclaration(item.horse, item.race); }} style={{ justifyContent: "center", background: C.blueBg, color: C.blue, border: "2px solid " + C.blue + "50" }}>Declare to Run</Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>Horses</div>
          {horses.map(function(h) {
            var sel = selHorse.id === h.id;
            return (
              <div key={h.id} onClick={function() { setSelHorse(h); }}
                style={{ background: sel ? C.navy : C.card, border: "1px solid " + (sel ? C.navy : C.border), borderRadius: 10, padding: "10px 12px", marginBottom: 7, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Silk silk={h.silk} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: sel ? "#fff" : C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: sel ? "rgba(255,255,255,0.5)" : C.textMid, marginTop: 1 }}>
                      {getAge(h.dob) + "yo" + (h.nhRating ? " · NH " + h.nhRating : "") + (h.flatRating ? " · Flat " + h.flatRating : "") + (h.headgear ? " · " + h.headgear : "")}
                    </div>
                    <div style={{ marginTop: 4 }}><FormDots form={h.form} /></div>
                  </div>
                </div>
                {h.status === "CoolingOff" && coolingDate(h.activationDate) && (
                  <div style={{ marginTop: 5, padding: "2px 7px", background: "rgba(217,119,6,0.12)", borderRadius: 4, fontSize: 10, color: C.amber }}>
                    {"Eligible " + coolingDate(h.activationDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>HRI Race Conditions</div>
              <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>
                {lastFetch ? "Updated " + new Date(lastFetch).toLocaleString("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "No conditions loaded yet"}
              </div>
              {fetchStatus === "done" && (
                <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 2 }}>
                  {races.length + " races · " + eligible.length + " eligible for " + selHorse.name}
                </div>
              )}
            </div>
            <Btn onClick={function() { setShowPaste(!showPaste); }} disabled={fetchStatus === "fetching"} style={{ fontSize: 12, padding: "8px 16px" }}>
              {fetchStatus === "fetching" ? "Parsing..." : "Paste Conditions"}
            </Btn>
          </div>

          {showPaste && (
            <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Paste Race Conditions</div>
              <div style={{ fontSize: 12, color: C.textMid, marginBottom: 12, lineHeight: 1.6 }}>
                Open the HRI PDF, press Ctrl+A then Ctrl+C, paste below. Takes about 10 seconds.
              </div>
              <textarea value={pasteText} onChange={function(e) { setPasteText(e.target.value); }}
                placeholder="Paste the race conditions text here..."
                rows={8}
                style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "10px 14px", fontSize: 13, color: C.text, resize: "vertical", marginBottom: 10 }} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={handleParseText} disabled={!pasteText.trim() || fetchStatus === "fetching"}>
                  {fetchStatus === "fetching" ? "Parsing races..." : "Parse Races"}
                </Btn>
                <Btn variant="ghost" onClick={function() { setShowPaste(false); setPasteText(""); }}>Cancel</Btn>
              </div>
            </div>
          )}

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
            <Silk silk={selHorse.silk} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{selHorse.name}</span>
                <StatusPill status={selHorse.status} activationDate={selHorse.activationDate} />
                {selHorse.headgear && <Tag color={C.purple}>{selHorse.headgear}</Tag>}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                <span>{getAge(selHorse.dob) + "yo " + selHorse.sex}</span>
                {selHorse.nhRating && <span>{"NH " + selHorse.nhRating}</span>}
                {selHorse.flatRating && <span>{"Flat " + selHorse.flatRating}</span>}
                {selHorse.hurdleRating && <span>{"Hrd " + selHorse.hurdleRating}</span>}
                {selHorse.chaseRating && <span>{"Chs " + selHorse.chaseRating}</span>}
                <span>{"Owner: " + selHorse.owner}</span>
              </div>
            </div>
            <FormDots form={selHorse.form} />
          </div>

          {toast && (
            <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.navy, color: "#fff", padding: "10px 20px", borderRadius: 24, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: C.shadowMd }}>
              <span style={{ color: toast.color }}>{toast.msg}</span>
            </div>
          )}

          {races.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No race conditions loaded</div>
              <div style={{ fontSize: 13 }}>Paste text from the HRI race conditions PDF above</div>
            </div>
          ) : eligible.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
              {"No eligible races found for " + selHorse.name + " — check discipline, age, sex and rating"}
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>
                {eligible.length + " eligible races for " + selHorse.name}
              </div>
              {sorted.map(function(race) {
                var key = k(selHorse.id, race.id);
                var analysis = analyses[key];
                var isLoading = loading[key];
                var stage = loadStage[key] || 0;
                var isSl = !!shortlisted[key];
                var accent = analysis ? (analysis.overall >= 75 ? C.green : analysis.overall >= 55 ? C.amber : C.red) : C.textMid;
                return (
                  <div key={race.id} style={{ background: C.card, borderRadius: 13, border: "1px solid " + (isSl ? C.gold : C.border), marginBottom: 12, overflow: "hidden" }}>
                    <div style={{ height: 3, background: analysis ? accent : isSl ? C.gold : C.border }} />
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
                            {race.grade && race.grade !== "Ungraded" && <Tag color={C.gold}>{race.grade}</Tag>}
                            {race.isEBF && <Tag color={C.purple}>EBF</Tag>}
                            {race.discipline && <Tag color={C.textMid} bg="#f0f4f8">{race.discipline + " · " + (race.distanceFurlongs || "") + "f"}</Tag>}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 4 }}>{race.raceName}</div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                            <span>{"📍 " + race.venue}</span>
                            {race.date && <span>{"📅 " + new Date(race.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                            {race.forecastGoing && <span>{race.forecastGoing}</span>}
                          </div>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: C.gold, flexShrink: 0 }}>
                          {race.prizeMoney ? ("EUR" + (race.prizeMoney >= 1000 ? Math.round(race.prizeMoney * 0.001) + "k" : race.prizeMoney)) : ""}
                        </span>
                      </div>

                      {race.entryDeadline && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.amberBg, borderRadius: 7, marginBottom: 10, fontSize: 12 }}>
                          <span style={{ color: C.textMid, fontWeight: 600 }}>Entry closes</span>
                          <span style={{ fontWeight: 700, color: C.amber }}>
                            {new Date(race.entryDeadline).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}
                          </span>
                        </div>
                      )}

                      {!analysis && !isLoading && (
                        <Btn onClick={function() { analyseRace(selHorse, race); }} style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>
                          Get My Take on This Race
                        </Btn>
                      )}

                      {isLoading && (
                        <div style={{ padding: "12px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Analysing race...</div>
                          {LOAD_MSGS.map(function(msg, i) {
                            return (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, opacity: i <= stage ? 1 : 0.25 }}>
                                <span style={{ fontSize: 12 }}>{i < stage ? "✓" : i === stage ? "⟳" : "○"}</span>
                                <span style={{ fontSize: 12, color: i <= stage ? C.text : C.textDim }}>{msg}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {analysis && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                            {SCORE_KEYS.map(function(pair) {
                              var label = pair[0]; var sk = pair[1];
                              var v = (analysis.scores || {})[sk] || 0;
                              var c = v >= 7 ? C.green : v >= 5 ? C.amber : C.red;
                              return (
                                <div key={sk} style={{ flex: 1, textAlign: "center", padding: "6px 2px", background: c + "10", borderRadius: 8, border: "1px solid " + c + "20" }}>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                                  <div style={{ fontSize: 8, color: C.textMid, fontWeight: 600 }}>{label}</div>
                                </div>
                              );
                            })}
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: accent + "12", border: "2px solid " + accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 15, fontWeight: 800, color: accent, lineHeight: 1 }}>{analysis.overall}</span>
                              <span style={{ fontSize: 7, color: C.textMid }}>out of 100</span>
                            </div>
                          </div>
                          {(analysis.bullets || []).map(function(b, i) {
                            return (
                              <div key={i} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "10px 12px", marginBottom: 7 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                  <span style={{ fontSize: 14 }}>{b.icon}</span>
                                  <span style={{ fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.5 }}>{b.title}</span>
                                </div>
                                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.75, margin: 0 }}>{b.point}</p>
                              </div>
                            );
                          })}
                          {analysis.verdict && (
                            <div style={{ background: C.navy, borderRadius: 10, padding: "16px 18px", marginBottom: 10 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Trainer Verdict</div>
                              <p style={{ fontSize: 14, color: "#e8edf5", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{analysis.verdict}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {!canRace(selHorse) ? (
                        <div style={{ padding: "9px 12px", background: C.amberBg, border: "1px solid " + C.amber + "30", borderRadius: 8, fontSize: 12, color: C.amber, fontWeight: 600 }}>
                          {"Cool-off active · eligible " + (coolingDate(selHorse.activationDate) ? coolingDate(selHorse.activationDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) : "soon")}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          <Btn variant="gold" onClick={function() { var sk = key; setShortlisted(function(s) { return Object.assign({}, s, { [sk]: s[sk] ? null : { horse: selHorse, race: race } }); }); }} style={{ width: "100%", justifyContent: "center" }}>
                            {isSl ? "★ On Shortlist" : "☆ Add to Shortlist"}
                          </Btn>
                          {isSl && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                              <Btn variant="green" onClick={function() { handleEntry(selHorse, race); }} style={{ justifyContent: "center" }}>
                                Confirm Entry
                              </Btn>
                              <Btn onClick={function() { handleDeclaration(selHorse, race); }} style={{ justifyContent: "center", background: C.blueBg, color: C.blue, border: "2px solid " + C.blue + "50" }}>
                                Declare to Run
                              </Btn>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RacePlanner;
