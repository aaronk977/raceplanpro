import React, { useState } from "react";
import { Btn, Tag, Silk, FormDots, StatusPill, C, TODAY, daysUntil, canRace, coolingDate, getAge, ANTHROPIC_KEY } from "./shared";

// API_HEADERS removed - using server-side proxy

async function getAITake(horse, race) {
  var condStr = "";
  if (race.isMaiden) condStr += " MAIDEN RACE - horse must not have won.";
  if (race.isNovice) condStr += " NOVICE RACE - horse must have 3 or fewer runs over this discipline.";
  if (race.grade) condStr += " Grade: " + race.grade + ".";
  if (race.sexRestriction && race.sexRestriction !== "Open") condStr += " Restricted to: " + race.sexRestriction + ".";
  if (race.ratingMin) condStr += " Min rating: " + race.ratingMin + ".";
  if (race.ratingMax) condStr += " Max rating: " + race.ratingMax + ".";
  var horseDist = horse.preferredDistance || "";
  var horseBreed = horse.breeding || horse.sire || "";
  var horseForm = horse.recentForm || horse.notes || "";
  var raceInfo = race ? (race.raceName + " - " + race.distanceFurlongs + "f " + race.discipline + " " + (race.forecastGoing || "") + " Rated " + (race.minRating || 0) + "-" + (race.maxRating || "open")) : "";
  var prompt = "You are an expert Irish/UK horse racing analyst. Analyse this horse for this specific race and give a concise professional assessment.\n\nRACE: " + raceInfo + "\nVENUE: " + (race ? race.venue : "") + "\nDISTANCE: " + (race ? race.distanceFurlongs : "") + " furlongs\nGOING: " + (race ? race.forecastGoing : "") + "\nGRADE/CLASS: " + (race ? (race.grade || race.raceType || "Unknown") : "") + "\n\nHORSE: " + horse.name + "\nAge: " + getAge(horse.dob) + "yo\nSex: " + (horse.sex || "Unknown") + "\nDiscipline: " + (horse.discipline ? horse.discipline.join("/") : "Unknown") + "\nFlat rating: " + (horse.flatRating || "N/A") + "\nHurdle rating: " + (horse.hurdleRating || "N/A") + "\nChase rating: " + (horse.chaseRating || "N/A") + "\nPreferred trip: " + (horseDist || "Unknown") + "\nBreeding/Sire: " + (horseBreed || "Unknown") + "\nRecent form/notes: " + (horseForm || "None") + "\n\nProvide a 3-4 sentence analysis covering: (1) suitability of trip and going based on breeding and form, (2) class/rating assessment, (3) overall recommendation. Be direct and specific. End with VERDICT: Ideal pick / Strong chance / Worth considering / Borderline / Would not run."
    + " Horse: " + horse.name + " | Age: " + getAge(horse.dob) + "yo " + horse.sex
    + " | NH=" + (horse.nhRating||"unrated") + " Flat=" + (horse.flatRating||"-") + " Hurdle=" + (horse.hurdleRating||"-") + " Chase=" + (horse.chaseRating||"-")
    + " | Headgear: " + (horse.headgear||"none") + " | Discipline: " + (Array.isArray(horse.discipline) ? horse.discipline.join("/") : (horse.discipline||"unknown"))
    + " | Race: " + race.raceName + " at " + (race.meetingName||race.venue||"")
    + " | Date: " + (race.date||"") + " | " + (race.discipline||"") + " " + (race.distanceFurlongs||"") + "f"
    + " | Going: " + (race.forecastGoing||"unknown") + " | Prize: EUR" + (race.prizeMoney||0)
    + " | Rating range: " + (race.ratingMin||0) + "-" + (race.ratingMax||"open")
    + " | Age: " + (race.ageMin||3) + "-" + (race.ageMax||"any") + "yo"
    + " | Conditions:" + condStr
    + " Check eligibility carefully - flag maiden/novice restrictions, rating ceiling, sex restrictions."
    + " Consider distance preference, going, course record, breeding, handicap mark vs ceiling."
    + " Return ONLY JSON: { overall: 0-100, verdict: string, scores: { handicap_edge: 0-10, class_fit: 0-10, conditions_match: 0-10, timing: 0-10, cuteness: 0-10 }, bullets: [{icon: emoji, title: string, point: string}], warnings: [string] }";
  var res = await fetch("/api/claude", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, messages: [{ role: "user", content: prompt }] })
  });
  var data = await res.json();
  var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
  var s = txt.indexOf("{"); var e = txt.lastIndexOf("}");
  if (s < 0 || e <= s) throw new Error("No JSON");
  return JSON.parse(txt.slice(s, e + 1));
}

function RacePlanner({ horses, setHorses }) {
  var racesState = useState([]);
  var races = racesState[0]; var setRaces = racesState[1];
  var statusState = useState("idle");
  var fetchStatus = statusState[0]; var setFetchStatus = statusState[1];
  var lastFetchState = useState(null);
  var lastFetch = lastFetchState[0]; var setLastFetch = lastFetchState[1];
  var analysesState = useState({});
  var analyses = analysesState[0]; var setAnalyses = analysesState[1];
  var loadingState = useState({});
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var expandedState = useState({});
  var expanded = expandedState[0]; var setExpanded = expandedState[1];
  var shortlistedState = useState({});
  var shortlisted = shortlistedState[0]; var setShortlisted = shortlistedState[1];
  var pasteState = useState("");
  var pasteText = pasteState[0]; var setPasteText = pasteState[1];
  var showPasteState = useState(false);
  var showPaste = showPasteState[0]; var setShowPaste = showPasteState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];
  var expandedAnalysisState = useState({});
  var expandedAnalysis = expandedAnalysisState[0]; var setExpandedAnalysis = expandedAnalysisState[1];

  function k(hId, rId) { return hId + "_" + rId; }

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 4000);
  }

  function toggleExpand(raceId) {
    setExpanded(function(prev) { return Object.assign({}, prev, { [raceId]: !prev[raceId] }); });
  }

  var activeHorses = horses.filter(function(h) { return h.status === "Active"; }).sort(function(a, b) {
    var aEx = (a.name || "").toUpperCase().indexOf("EX ") === 0 || (a.name || "").toUpperCase().indexOf("(EX)") >= 0;
    var bEx = (b.name || "").toUpperCase().indexOf("EX ") === 0 || (b.name || "").toUpperCase().indexOf("(EX)") >= 0;
    if (aEx && !bEx) return -1;
    if (!aEx && bEx) return 1;
    return (a.name || "").localeCompare(b.name || "");
  });

  function getEligible(race) {
    return activeHorses.filter(function(horse) {

      // Age check - horse must have a dob to pass age-restricted races
      var age = getAge(horse.dob);
      if (race.ageMin && race.ageMin > 0) {
        if (!horse.dob) return false;
        if (age < race.ageMin) return false;
      }
      if (race.ageMax && race.ageMax > 0) {
        if (!horse.dob) return false;
        if (age > race.ageMax) return false;
      }

      // Discipline check - if race has a discipline, horse must match it
      // If horse has no discipline set, only allow if it could plausibly run
      if (race.discipline) {
        var rawDisc = horse.discipline || [];
        // Normalise - could be array, string, or "Hurdle/Chase" etc
        var disc = [];
        if (Array.isArray(rawDisc)) {
          disc = rawDisc;
        } else if (typeof rawDisc === "string" && rawDisc.length > 0) {
          // Handle "Hurdle/Chase" style strings
          disc = rawDisc.split("/").map(function(d) { return d.trim(); });
        }
        // Expand "Hurdle/Chase" entries
        var expandedDisc = [];
        disc.forEach(function(d) {
          var parts = d.split("/").map(function(p) { return p.trim(); });
          parts.forEach(function(p) { if (expandedDisc.indexOf(p) < 0) expandedDisc.push(p); });
        });
        if (expandedDisc.length > 0 && expandedDisc.indexOf(race.discipline) < 0) return false;
        if (expandedDisc.length === 0) {
          if (race.discipline === "Flat" && !horse.flatRating && !horse.awtRating) return false;
          if (race.discipline === "Hurdle" && !horse.hurdleRating && !horse.nhRating) return false;
          if (race.discipline === "Chase" && !horse.chaseRating && !horse.nhRating) return false;
        }
      }

      // Sex restriction
      if (race.sexRestriction && race.sexRestriction !== "Open" && race.sexRestriction !== "") {
        var mares = ["Mare", "Filly"];
        var males = ["Gelding", "Colt", "Horse"];
        if (race.sexRestriction === "Mares" && mares.indexOf(horse.sex) < 0) return false;
        if (race.sexRestriction === "Fillies" && horse.sex !== "Filly") return false;
        if (race.sexRestriction === "Colts & Geldings" && males.indexOf(horse.sex) < 0) return false;
      }

      // Maiden / Novice - only show if race flag matches horse flag
      if (race.isMaiden && !horse.isMaiden) return false;
      if (race.isNovice && !horse.isNovice) return false;

      // Rating check
      var rtg = null;
      if (race.discipline === "Flat") rtg = horse.flatRating || horse.awtRating || null;
      else if (race.discipline === "Chase") rtg = horse.chaseRating || horse.nhRating || null;
      else if (race.discipline === "Hurdle") rtg = horse.hurdleRating || horse.nhRating || null;
      else rtg = horse.nhRating || horse.flatRating || null;

      // If race has rating limits and horse has a rating, enforce them
      if (race.ratingMax && race.ratingMax > 0 && rtg && rtg > race.ratingMax) return false;
      if (race.ratingMin && race.ratingMin > 0 && rtg && rtg < race.ratingMin) return false;

      // If race has a rating ceiling and horse has NO rating, exclude
      // (unrated horses can only run in maiden/novice or open handicaps)
      if (race.ratingMax && race.ratingMax > 0 && !rtg && !race.isMaiden) return false;

      return true;
    });
  }

  var handleParseText = async function() {
    if (!pasteText.trim()) return;
    setFetchStatus("fetching");
    try {
      var res = await fetch("/api/claude", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 8000,
          messages: [{ role: "user", content: "You are an expert HRI and BHA race conditions parser. Parse every race from the text below into a strict JSON array. Return ONLY the raw JSON array with no markdown or explanation.\n\nEach race object must have these EXACT field names:\n- id: string (race_001, race_002...)\n- raceName: string\n- venue: string\n- date: YYYY-MM-DD\n- entryDeadline: YYYY-MM-DD or null\n- discipline: EXACTLY one of: Flat, Hurdle, Chase, Bumper, Cross Country (never use NH or Jump)\n- surface: Turf or AWT\n- distanceFurlongs: number (2m=16, 2m4f=20, 2m5f=21, 3m=24, 5f=5, 6f=6, 7f=7, 1m=8, 1m2f=10, 1m4f=12, 1m6f=14, 2m=16)\n- forecastGoing: string\n- prizeMoney: number\n- grade: Grade 1/2/3 or Group 1/2/3 or Listed or null\n- sex: EXACTLY one of: Open, Mares, Fillies, Colts (never M/F/G, never Mares and Fillies - pick one)\n- minAge: number in years (e.g. 4 for 4yo+, 3 for 3yo)\n- maxAge: number or null (e.g. 6 for 3-6yo, null for open)\n- minRating: number or null (lower official rating limit - 0 counts as null)\n- maxRating: number or null (CRITICAL: upper official rating limit e.g. 90 for 0-90 rated, 105 for 90-105 rated)\n- isMaiden: boolean (true ONLY if conditions say maiden - horse must not have won)\n- isNovice: boolean (true ONLY if conditions say novice)\n- isEBF: boolean\n- qualifyingRuns: number or null (minimum number of runs required if specified)\n- raceType: Handicap, Conditions, Maiden, Novice, Listed, Graded, or Other\n\nCRITICAL RULES:\n1. maxRating is the MOST IMPORTANT field - get it exactly right for every handicap\n2. A rated 0-90 handicap: minRating=null maxRating=90\n3. A rated 90-110 handicap: minRating=90 maxRating=110\n4. A rated 100+ race: minRating=100 maxRating=null\n5. Bumpers use flat ratings. Hurdles use hurdle ratings. Chases use chase ratings.\n6. If age says 4yo+: minAge=4 maxAge=null. If 3-6yo: minAge=3 maxAge=6\n7. Irish point-to-point winners may qualify for bumpers/novices - note in raceName\n\nText:\n\n" + pasteText }]
        })
      });
      var data = await res.json();
      var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      var s = txt.indexOf("["); var e = txt.lastIndexOf("]");
      if (s < 0 || e <= s) throw new Error("No races found in response");
      var parsed = JSON.parse(txt.slice(s, e + 1));
      setRaces(parsed);
      setLastFetch(new Date().toISOString());
      setFetchStatus("done");
      setShowPaste(false);
      setPasteText("");
      // Auto-expand races that have eligible horses
      var newExpanded = {};
      parsed.forEach(function(race) {
        if (getEligible(race).length > 0) newExpanded[race.id] = true;
      });
      setExpanded(newExpanded);
      showToast(parsed.length + " races loaded");
    } catch (err) {
      console.error(err);
      setFetchStatus("error");
      showToast("Failed to parse - check Anthropic credits at console.anthropic.com", C.red);
    }
  };

  function handlePDFUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    var reader = new FileReader();
    reader.onload = function(ev) {
      var text = ev.target.result;
      setPasteText(text);
      setShowPaste(true);
    };
    reader.readAsText(file);
  }

  var analyseHorseForRace = async function(horse, race) {
    var key = k(horse.id, race.id);
    setLoading(function(l) { return Object.assign({}, l, { [key]: true }); });
    try {
      var result = await getAITake(horse, race);
      setAnalyses(function(a) { return Object.assign({}, a, { [key]: result }); });
    } catch (err) {
      console.error(err);
      showToast("Analysis failed - check API credits", C.red);
    }
    setLoading(function(l) { return Object.assign({}, l, { [key]: false }); });
  };

  function handleEntry(horse, race) {
    var raceDate = race.date ? new Date(race.date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" }) : "";
    var dist = race.distanceFurlongs ? (race.distanceFurlongs + "f") : "";
    var going = race.forecastGoing || "";
    var prize = race.prizeMoney ? ("EUR " + race.prizeMoney.toLocaleString()) : "";
    var msg = "Hi, " + horse.name + " has been entered in the " + (race.raceName || "") + " at " + (race.venue || "") + (raceDate ? " on " + raceDate : "") + (dist ? ", " + dist : "") + (going ? " " + going : "") + (prize ? ". Prize " + prize : "") + ". We will keep you updated.";
    var phone = (horse.ownerPhone || "").split("").filter(function(c){return (c>="0"&&c<="9")||c==="+";}).join("");
    if (!phone) { showToast("No owner phone saved for " + horse.name); return; }
    fetch("/api/send-whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: phone, message: msg }) })
      .then(function(r) { return r.json(); })
      .then(function(d) { showToast(d.success ? "WhatsApp sent to owner" : "Check WhatsApp - Twilio not active"); })
      .catch(function() { showToast("Could not send - check Twilio settings"); });
  }

  function getMedDates(raceDate, withdrawalDays, courseDays) {
    if (!raceDate) return null;
    var race = new Date(raceDate + "T12:00:00");
    var lastDay = new Date(race); lastDay.setDate(lastDay.getDate() - withdrawalDays);
    var startDay = new Date(lastDay); startDay.setDate(startDay.getDate() - (courseDays - 1));
    return {
      start: startDay.toLocaleDateString("en-IE", { day: "numeric", month: "short" }),
      stop: lastDay.toLocaleDateString("en-IE", { day: "numeric", month: "short" }),
      startDate: startDay
    };
  }

  var SCORE_KEYS = [["HCP", "handicap_edge"], ["Class", "class_fit"], ["Going", "conditions_match"], ["Timing", "timing"], ["Angle", "cuteness"]];

  var filteredRaces = races.filter(function(r) {
    if (!search) return true;
    var q = search.toLowerCase();
    return (r.raceName || "").toLowerCase().indexOf(q) >= 0 || (r.venue || "").toLowerCase().indexOf(q) >= 0;
  });

  var shortlistItems = Object.values(shortlisted).filter(Boolean);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Race Planner</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
            {races.length > 0 ? races.length + " races loaded - showing eligible horses under each race" : "Paste HRI race conditions to get started"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {lastFetch && <span style={{ fontSize: 11, color: C.textMid, alignSelf: "center" }}>{"Updated " + new Date(lastFetch).toLocaleString("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
          <Btn onClick={function() { setShowPaste(!showPaste); }} disabled={fetchStatus === "fetching"} style={{ fontSize: 13 }}>
            {fetchStatus === "fetching" ? "Parsing..." : "Paste Race Conditions"}
          </Btn>
        </div>
      </div>

      {showPaste && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>Paste HRI Race Conditions</div>
          <div style={{ fontSize: 12, color: C.textMid, marginBottom: 12, lineHeight: 1.6 }}>
            Go to hri-ras.ie, open the race conditions PDF, press Ctrl+A then Ctrl+C, paste below. Claude will parse every race and show which of your horses are eligible.
          </div>
          <textarea value={pasteText} onChange={function(e) { setPasteText(e.target.value); }}
            placeholder="Paste race conditions text here..."
            rows={8}
            style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "10px 14px", fontSize: 13, color: C.text, resize: "vertical", marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Btn onClick={handleParseText} disabled={!pasteText.trim() || fetchStatus === "fetching"}>
              {fetchStatus === "fetching" ? "Parsing races..." : "Parse Races"}
            </Btn>
            <label style={{ background: C.cardOff, border: "1.5px solid " + C.border, color: C.textMid, borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
              Upload PDF
              <input type="file" accept=".pdf,.txt" onChange={handlePDFUpload} style={{ display: "none" }} />
            </label>
            <Btn variant="ghost" onClick={function() { setShowPaste(false); setPasteText(""); }}>Cancel</Btn>
          </div>
          {fetchStatus === "error" && <div style={{ fontSize: 12, color: C.red, fontWeight: 600, marginTop: 8 }}>Failed. Check your Anthropic API credits at console.anthropic.com</div>}
        </div>
      )}

      {shortlistItems.length > 0 && (
        <div style={{ background: C.card, border: "2px solid " + C.gold, borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{"Shortlist - " + shortlistItems.length + " confirmed"}</div>
            <Btn variant="ghost" onClick={function() { setShortlisted({}); }} style={{ fontSize: 12 }}>Clear</Btn>
          </div>
          {shortlistItems.map(function(item, idx) {
            var peptDates = getMedDates(item.race.date, 4, 12);
            var antepsinDates = getMedDates(item.race.date, 1, 12);
            var peptWarning = peptDates && peptDates.startDate < new Date();
            return (
              <div key={idx} style={{ background: C.cardOff, borderRadius: 10, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "flex-start", gap: 12 }}>
                <Silk silk={item.horse.silk} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{item.horse.name}</div>
                  <div style={{ fontSize: 13, color: C.text }}>{item.race.raceName + " - " + item.race.venue}</div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{item.race.date ? new Date(item.race.date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }) : ""}</div>
                  {(peptDates || antepsinDates) && (
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      {peptDates && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: peptWarning ? C.red + "15" : C.blue + "15", color: peptWarning ? C.red : C.blue, fontWeight: 700 }}>{"Peptizole: " + peptDates.start + " - " + peptDates.stop + (peptWarning ? " ! START NOW" : "")}</span>}
                      {antepsinDates && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: C.purple + "15", color: C.purple, fontWeight: 700 }}>{"Antepsin: " + antepsinDates.start + " - " + antepsinDates.stop}</span>}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <Btn variant="green" onClick={function() { handleEntry(item.horse, item.race); }} style={{ fontSize: 12, padding: "6px 12px", justifyContent: "center" }}>WhatsApp Owner</Btn>
                  <button onClick={function() { var sk = k(item.horse.id, item.race.id); setShortlisted(function(s) { return Object.assign({}, s, { [sk]: null }); }); }}
                    style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 12 }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {races.length > 0 && (
        <input value={search} onChange={function(e) { setSearch(e.target.value); }}
          placeholder="Search races by name or venue..."
          style={{ width: "100%", padding: "10px 14px", background: C.card, border: "1px solid " + C.border, borderRadius: 10, fontSize: 13, color: C.text, marginBottom: 12 }} />
      )}
      {filteredRaces.map(function(race) {
        var eligibleHorses = activeHorses.filter(function(h) { return isEligible(h, race, settings); });
        var hasShortlist = eligibleHorses.filter(function(h) { return shortlisted[k(h.id, race.id)]; }).length;
        var pm = race.prizeMoney;

        return (
          <div key={race.id} style={{ background: C.card, border: "1px solid " + (hasShortlist > 0 ? C.gold : eligibleHorses.length > 0 ? C.border : C.border), borderRadius: 12, marginBottom: 10, overflow: "hidden", opacity: eligibleHorses.length === 0 ? 0.5 : 1 }}>
            <div onClick={function() { if (eligibleHorses.length > 0) toggleExpand(race.id); }}
              style={{ padding: "14px 16px", cursor: eligibleHorses.length > 0 ? "pointer" : "default", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                  {race.grade && race.grade !== "Ungraded" && <Tag color={C.gold}>{race.grade}</Tag>}
                  {race.discipline && <Tag color={C.blue} bg={C.blueBg}>{race.discipline + (race.distanceFurlongs ? " " + race.distanceFurlongs + "f" : "") + (race.surface && race.surface !== "Turf" ? " " + race.surface : "")}</Tag>}
                  {race.isMaiden && <Tag color={C.purple}>Maiden</Tag>}
                  {race.isNovice && <Tag color={C.purple}>Novice</Tag>}
                  {race.isEBF && <Tag color={C.amber}>EBF</Tag>}
                </div>
                {(race.meetingName || race.meetingRef) && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                    {race.meetingName || race.meetingRef}
                  </div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4 }}>{race.raceName}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid, marginBottom: 4 }}>
                  <span>{" " + race.venue}</span>
                  {race.date && <span>{" " + new Date(race.date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                  {race.forecastGoing && <span>{race.forecastGoing}</span>}
                  {race.entryDeadline && <span style={{ color: C.amber, fontWeight: 600 }}>{"Entry closes " + new Date(race.entryDeadline + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>}
                </div>
                <div style={{ fontSize: 11, color: C.textDim, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {race.ageMin && <span>{race.ageMin + (race.ageMax ? "-" + race.ageMax : "+") + " yo"}</span>}
                  {race.sexRestriction && race.sexRestriction !== "Open" && race.sexRestriction !== "" && <span>{race.sexRestriction}</span>}
                  {race.ratingMin || race.ratingMax ? <span>{"Rating: " + (race.ratingMin || 0) + "-" + (race.ratingMax || "open")}</span> : null}
                  {race.distanceFurlongs && <span>{race.distanceFurlongs + "f"}</span>}
                  {race.surface && race.surface !== "Turf" && <span>{race.surface}</span>}
                  {race.raceRef && <span>{race.raceRef}</span>}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.gold }}>
                  {pm ? ("EUR" + (pm >= 1000 ? Math.round(pm * 0.001) + "k" : pm)) : ""}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {eligibleHorses.length > 0 ? (
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: C.green + "15", color: C.green }}>
                      {eligibleHorses.length + " eligible"}
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, color: C.textMid }}>none eligible</span>
                  )}
                  {eligibleHorses.length > 0 && (
                    <span style={{ fontSize: 14, color: C.textMid }}>{isExpanded ? "^" : "v"}</span>
                  )}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div style={{ borderTop: "1px solid " + C.border }}>
                {eligibleHorses.map(function(horse) {
                  var key = k(horse.id, race.id);
                  var analysis = analyses[key];
                  var isLoading = loading[key];
                  var isSl = !!shortlisted[key];
                  var accent = analysis ? (analysis.overall >= 75 ? C.green : analysis.overall >= 55 ? C.amber : C.red) : C.textMid;
                  return (
                    <div key={horse.id} style={{ padding: "14px 16px", borderBottom: "1px solid " + C.cardOff, background: isSl ? C.gold + "08" : "transparent" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: analysis ? 12 : 0 }}>
                        <Silk silk={horse.silk} size={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                             <span style={{ fontSize: 15, fontWeight: 700, color: treatBlock ? C.amber : C.text }}>{horse.name}</span>
                            <StatusPill status={horse.status} activationDate={horse.activationDate} />
                            {horse.headgear && <Tag color={C.purple}>{horse.headgear}</Tag>}
                          </div>
                             {treatBlock && <span style={{ fontSize: 11, color: "#fff", fontWeight: 700, background: C.amber, padding: "3px 10px", borderRadius: 20 }}>{ "Can enter from " + treatBlock.clearDate}</span>}
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: C.textMid, marginTop: 2 }}>
                            <span>{getAge(horse.dob) + "yo " + horse.sex}</span>
                            {horse.nhRating && <span>{"NH " + horse.nhRating}</span>}
                            {horse.flatRating && <span>{"Flat " + horse.flatRating}</span>}
                            {horse.hurdleRating && <span>{"Hrd " + horse.hurdleRating}</span>}
                            {horse.chaseRating && <span>{"Chs " + horse.chaseRating}</span>}
                            <span>{"Owner: " + (horse.owner || "-")}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {!analysis && !isLoading && (
                            <Btn onClick={function() { analyseHorseForRace(horse, race); }} style={{ fontSize: 12, padding: "7px 14px" }}>
                              Get Analysis
                            </Btn>
                          )}
                          {analysis && !isLoading && (
                            <Btn variant="ghost" onClick={function() { var k2 = key; setExpandedAnalysis(function(p) { return Object.assign({}, p, { [k2]: !p[k2] }); }); }} style={{ fontSize: 12, padding: "7px 14px" }}>
                              {expandedAnalysis[key] ? "^ Hide" : "v Analysis (" + analysis.overall + ")"}
                            </Btn>
                          )}
                          {isLoading && (
                            <span style={{ fontSize: 12, color: C.textMid, padding: "7px 14px" }}>Analysing...</span>
                          )}
                          {analysis && (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: accent + "15", border: "2px solid " + accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: accent }}>{analysis.overall}</div>
                            </div>
                          )}
                          <Btn variant={isSl ? "gold" : "ghost"} onClick={function() { var sk = key; setShortlisted(function(s) { return Object.assign({}, s, { [sk]: s[sk] ? null : { horse: horse, race: race } }); }); }} style={{ fontSize: 12, padding: "7px 14px" }}>
                            {isSl ? "* Shortlisted" : "* Shortlist"}
                          </Btn>
                          {isSl && (
                            <Btn variant="green" onClick={function() { handleEntry(horse, race); }} style={{ fontSize: 12, padding: "7px 14px" }}>
                              WhatsApp Owner
                            </Btn>
                          )}
                        </div>
                      </div>

                      {analysis && expandedAnalysis[key] && (
                        <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid " + C.cardOff }}>
                          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                            {SCORE_KEYS.map(function(pair) {
                              var label = pair[0]; var sk = pair[1];
                              var v = (analysis.scores || {})[sk] || 0;
                              var c = v >= 7 ? C.green : v >= 5 ? C.amber : C.red;
                              // Check treatment withdrawal
                   var treatBlock = null;
                   var horseTreats = horse.treatments || [];
                   var nowT = new Date(); nowT.setHours(0,0,0,0);
                   horseTreats.forEach(function(ht) {
                     if (!ht.date || !ht.withdrawalDays) return;
                     var tDate = new Date(ht.date + "T00:00:00");
                     var clearD = new Date(tDate); clearD.setDate(clearD.getDate() + parseInt(ht.withdrawalDays));
                     if (nowT < clearD) {
                       treatBlock = { name: ht.name, clearDate: clearD.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" }), daysLeft: Math.ceil((clearD - nowT) / 86400000) };
                     }
                   });
                   return (
                                <div key={sk} style={{ flex: 1, textAlign: "center", padding: "5px 2px", background: c + "10", borderRadius: 7, border: "1px solid " + c + "20" }}>
                                  <div style={{ fontSize: 14, fontWeight: 800, color: c }}>{v}</div>
                                  <div style={{ fontSize: 8, color: C.textMid, fontWeight: 600 }}>{label}</div>
                                </div>
                              );
                            })}
                          </div>
                          {(analysis.warnings && analysis.warnings.length > 0) && (
                            <div style={{ background: C.red + "10", border: "1px solid " + C.red + "30", borderRadius: 9, padding: "10px 14px", marginBottom: 8 }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>! Eligibility Flags</div>
                              {analysis.warnings.map(function(w, wi) {
                                return <div key={wi} style={{ fontSize: 13, color: C.red, marginBottom: 3 }}>{"- " + w}</div>;
                              })}
                            </div>
                          )}
                          {analysis.verdict && (
                            <div style={{ background: C.navy, borderRadius: 9, padding: "12px 14px", marginBottom: 8 }}>
                              <p style={{ fontSize: 13, color: "#e8edf5", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{analysis.verdict}</p>
                            </div>
                          )}
                          {(analysis.bullets || []).map(function(b, i) {
                            return (
                              <div key={i} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, padding: "9px 12px", marginBottom: 6, display: "flex", gap: 8 }}>
                                <span style={{ fontSize: 16 }}>{b.icon}</span>
                                <div>
                                  <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{b.title}</div>
                                  <p style={{ fontSize: 13, color: C.text, lineHeight: 1.6, margin: 0 }}>{b.point}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {races.length === 0 && (
        <div style={{ padding: 48, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}></div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No race conditions loaded</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Paste the HRI race conditions PDF text above. Every race will show which of your horses are eligible.</div>
          <Btn onClick={function() { setShowPaste(true); }}>Paste Race Conditions</Btn>
        </div>
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.navy, padding: "10px 22px", borderRadius: 24, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: C.shadowMd }}>
          <span style={{ color: toast.color }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default RacePlanner;
