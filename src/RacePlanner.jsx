import React, { useState, useCallback } from "react";
import { Btn, Tag, Silk, FormDots, StatusPill, C, TODAY, daysUntil, canRace, coolingDate, isEligible, ANTHROPIC_KEY } from "./shared";

function RacePlanner({ horses, setHorses }) {
  const [selHorse, setSelHorse] = useState(horses[0]);
  const [races, setRaces] = useState([]);
  const [fetchStatus, setFetchStatus] = useState("idle");
  const [lastFetch, setLastFetch] = useState(null);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState({});
  const [loadStage, setLoadStage] = useState({});
  const [shortlisted, setShortlisted] = useState({});
  const [showShortlist, setShowShortlist] = useState(false);
  const [toast, setToast] = useState(null);

  const k = function(hId,rId){return hId+"_"+rId;};

  const showToast = function(msg,color){color=color||C.green; setToast({ msg, color }); setTimeout(function(){setToast(null);}, 4000); };

  const [pasteText, setPasteText] = useState("");
  const [showPaste, setShowPaste] = useState(false);

  const handleParseText = async function() {
    if (!pasteText.trim()) return;
    setFetchStatus("fetching");
    try {
      const headers = {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      };
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5000,
          messages: [{ role: "user", content: "Parse every race from this HRI race conditions text into a JSON array. Return ONLY the raw JSON array with no markdown. Each race needs: id as r_N, venue, date in YYYY-MM-DD format, raceName, discipline as Flat or Hurdle or Chase or Bumper, raceType as Maiden or Novice or Handicap or Weight For Age or Beginners or Bumper, grade as Grade 1 or Grade 2 or Grade 3 or Listed or Ungraded, surface as Turf or AWT where Dundalk is AWT, distanceFurlongs as number, prizeMoney as winner prize number, ageMin as number, ageMax as number or null, sexRestriction as Open or Mares or Fillies or Colts and Geldings, ratingMax as number or null, isMaiden as boolean, isNovice as boolean, isEBF as boolean, entryDeadline in YYYY-MM-DDTHH:MM format using closing date at noon, forecastGoing as good or soft etc.\n\nTEXT:\n" + pasteText }],
        }),
      });
      const data = await res.json();
      const txt = (data.content || []).filter(function(b){return b.type==="text";}).map(function(b){return b.text;}).join("").trim();
      const match = (function(){var s=txt.indexOf("[");var e=txt.lastIndexOf("]");return s>=0&&e>s?[null,txt.slice(s+1,e)]:null;})();
      if (!match) {
        console.log("API response:", txt.substring(0, 500));
        throw new Error("No JSON array found in response");
      }
      let parsed;
      try {
        parsed = JSON.parse(match[0]);
      } catch(parseErr) {
        console.log("Parse error:", parseErr, "JSON:", match[0].substring(0, 200));
        throw new Error("Invalid JSON returned");
      }
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


  const eligible = races.filter(function(r) {
    const age = getAge(selHorse.dob);
    if (age < r.ageMin) return false;
    if (r.ageMax && age > r.ageMax) return false;
    const sexMap = { "Mares": ["Mare", "Filly"], "Fillies": ["Filly"], "Colts & Geldings": ["Colt", "Gelding"] };
    if (r.sexRestriction !== "Open" && !(sexMap[r.sexRestriction] || []).includes(selHorse.sex)) return false;
    if (!selHorse.discipline.includes(r.discipline)) return false;
    if (selHorse.surface !== r.surface) return false;
    const getRating = function() {
      if (r.discipline === "Flat" && r.surface === "AWT") return selHorse.awtRating || selHorse.flatRating;
      if (r.discipline === "Flat") return selHorse.flatRating || selHorse.awtRating;
      if (r.discipline === "Chase") return selHorse.chaseRating || selHorse.nhRating;
      if (r.discipline === "Hurdle") return selHorse.hurdleRating || selHorse.nhRating;
      return selHorse.nhRating || selHorse.flatRating;
    };
    const rtg = getRating();
    if (r.ratingMax && rtg && rtg > r.ratingMax) return false;
    if (r.ratingMin && rtg && rtg < r.ratingMin) return false;
    if (r.isMaiden && !selHorse.isMaiden) return false;
    if (r.isNovice && !selHorse.isNovice) return false;
    if (r.isEBF && !selHorse.isEBF) return false;
    return true;
  });

  const analyse = async function(horse, race) {
    const key = k(horse.id, race.id);
    setLoading(function(l) { return Object.assign({}, l, { [key]: true }); }); setLoadStage(function(s) { return Object.assign({}, s, { [key]: 0 }); });
    const timer = setInterval(function() { setLoadStage(function(s) { var c = s[key] || 0; if (c < 3) { var n = Object.assign({}, s); n[key] = c + 1; return n; } clearInterval(timer); return s; }); }, 2800);
    try { const r = await getAITake(horse, race); clearInterval(timer); setAnalyses(function(a) { return Object.assign({}, a, { [key]: r }); }); }
    catch (e) { console.error(e); clearInterval(timer); }
    setLoading(function(l) { return Object.assign({}, l, { [key]: false }); });
  };

  const handleEntry = function(horse, race) {
    var raceDate = new Date(race.date).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" }); var msgText = horse.name + " entered in " + race.raceName + " at " + race.venue + " on " + raceDate + ". Prize: " + (race.prizeMoney || "TBC") + ". Going: " + (race.forecastGoing || "TBC") + ". More details to follow."; var msg = encodeURIComponent(msgText);
    const phone = (horse.ownerPhone || "").split("").filter(function(d){return d>="0"&&d<="9";}).join("");
    if (phone) window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
    showToast(("✓ Entry confirmed — WhatsApp opened for "+horse.owner));
  };

  const handleDeclaration = function(horse, race) {
    const jockey = horse.jockey || "D.J. O'Keeffe";
    const msg = encodeURIComponent(("✅ RacePlan Pro — "+horse.trainer+"\n\n"+horse.name+" is declared to run in the "+race.raceName+" at "+race.venue+".\n\nJockey: "+jockey+"\nForecast going: "+race.forecastGoing+"\n\nWe'll keep you updated on race day."));
    const phone = (horse.ownerPhone || "").split("").filter(function(d){return d>="0"&&d<="9";}).join("");
    if (phone) window.open("https://wa.me/" + phone + "?text=" + msg, "_blank");
    showToast(("📋 Declaration confirmed — WhatsApp opened for "+horse.owner), C.blue);
  };

  const sorted = [...eligible].sort(function(a,b){var ba=(analyses[k(selHorse.id,b.id)]||{}).overall;var aa=(analyses[k(selHorse.id,a.id)]||{}).overall;return (ba!=null?ba:-1)-(aa!=null?aa:-1);});

  // Calculate medication dates for shortlisted races
  const shortlistItems = Object.values(shortlisted).filter(Boolean);

  const getMedDates = function(raceDate, withdrawalDays, courseDays) {
    if (!raceDate) return null;
    const race = new Date(raceDate);
    const lastDay = new Date(race);
    lastDay.setDate(lastDay.getDate() - withdrawalDays);
    const startDay = new Date(lastDay);
    startDay.setDate(startDay.getDate() - (courseDays - 1));
    return {
      start: startDay.toLocaleDateString("en-IE", { day: "numeric", month: "short" }),
      stop: lastDay.toLocaleDateString("en-IE", { day: "numeric", month: "short" }),
      startDate: startDay,
    };
  };

  return (
    <div>
      {shortlistItems.length > 0 && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px", marginBottom: 16, boxShadow: C.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>
                {"★ Shortlist — " + shortlistItems.length + " race" + (shortlistItems.length !== 1 ? "s" : "")}
              </div>
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                Medication start and stop dates calculated automatically
              </div>
            </div>
            <Btn variant="ghost" onClick={function(){setShortlisted({});}} style={{ fontSize: 12 }}>Clear All</Btn>
          </div>
          {shortlistItems.map(function(item,idx) {
            const peptDates = getMedDates(item.race.date, 4, 12);
            const antepsinDates = getMedDates(item.race.date, 1, 12);
            const today = new Date();
            const peptWarning = peptDates && peptDates.startDate < today;
            const pm = item.race.prizeMoney;
            const pmStr = pm ? (" — €" + (pm >= 1000 ? Math.round(pm * 0.001) + "k" : pm)) : "";
            return (
              <div key={idx} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Silk silk={item.horse.silk} size={24} />
                      <span style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{item.horse.name}</span>
                      <span style={{ fontSize: 12, color: C.textMid }}>—</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.race.raceName}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMid }}>
                      {item.race.venue}
                      {item.race.date ? " — " + new Date(item.race.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }) : ""}
                      {pmStr}
                    </div>
                  </div>
                  <button
                    onClick={function() { setShortlisted(function(s) { return Object.assign({}, s, { [k(item.horse.id, item.race.id)]: null }); }); }}
                    style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {peptDates && (
                    <div style={{ background: peptWarning ? "rgba(192,57,43,0.08)" : "rgba(30,111,181,0.08)", border: "1px solid " + (peptWarning ? C.red : C.blue) + "40", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: peptWarning ? C.red : C.blue, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                        {peptWarning ? "⚠️ Peptizole — START IMMEDIATELY" : "Peptizole"}
                      </div>
                      <div style={{ fontSize: 12, color: C.text }}>Start: <strong>{peptDates.start}</strong></div>
                      <div style={{ fontSize: 12, color: C.text }}>Stop: <strong>{peptDates.stop}</strong></div>
                    </div>
                  )}
                  {antepsinDates && (
                    <div style={{ background: "rgba(109,63,192,0.08)", border: "1px solid " + C.purple + "40", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.purple, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
                        Antepsin
                      </div>
                      <div style={{ fontSize: 12, color: C.text }}>Start: <strong>{antepsinDates.start}</strong></div>
                      <div style={{ fontSize: 12, color: C.text }}>Stop: <strong>{antepsinDates.stop}</strong></div>
                    </div>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 8 }}>
                  <Btn variant="green" onClick={function(){handleEntry(item.horse, item.race);}} style={{ justifyContent: "center" }}>
                    ✓ Confirm Entry
                  </Btn>
                  <button
                    onClick={function(){handleDeclaration(item.horse, item.race);}}
                    style={{ padding: "9px", background: C.blueBg, border: "2px solid " + C.blue + "50", borderRadius: 9, color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                  >
                    📋 Declare to Run
                  </button>
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
            const sel = selHorse.id === h.id;
            const stCol = h.status === "Active" ? C.green : h.status === "CoolingOff" ? C.amber : C.red;
            return (
              <div key={h.id} onClick={function(){setSelHorse(h);}} style={{ background: sel ? C.navy : C.card, border: "1.5px solid " + (sel ? C.navyLight : C.border), borderLeft: "4px solid " + stCol, borderRadius: 11, padding: "10px 12px", marginBottom: 7, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <Silk silk={h.silk} size={32} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: sel ? "#fff" : C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: sel ? "rgba(255,255,255,0.5)" : C.textMid, marginTop: 1 }}>
                      {getAge(h.dob)}yo
                      {h.nhRating ? " · NH " + h.nhRating : ""}
                      {h.flatRating ? " · Flat " + h.flatRating : ""}
                      {h.headgear ? " · " + h.headgear : ""}
                    </div>
                    <div style={{ marginTop: 4 }}><FormDots form={h.form} /></div>
                  </div>
                </div>
                {h.status === "CoolingOff" && (
                  <div style={{ marginTop: 5, padding: "2px 7px", background: "rgba(217,119,6,0.12)", borderRadius: 5, fontSize: 10, color: C.amber, fontWeight: 600 }}>
                    {"Eligible " + (coolingDate(h.activationDate) ? coolingDate(h.activationDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) : "")}
                  </div>
                )}
                {h.status === "Inactive" && (
                  <div style={{ marginTop: 5, padding: "2px 7px", background: "rgba(192,57,43,0.10)", borderRadius: 5, fontSize: 10, color: C.red, fontWeight: 600 }}>Inactive</div>
                )}
              </div>
            );
          })}
        </div>

        
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>HRI Race Conditions</div>
              <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>
                {lastFetch ? "Updated " + new Date(lastFetch).toLocaleString("en-IE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "Paste from hri-ras.ie/upcoming-race-conditions PDF"}
              </div>
              {fetchStatus === "done" && (
                <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 2 }}>
                  {"✓ " + races.length + " races · " + eligible.length + " eligible for " + selHorse.name}
                </div>
              )}
            </div>
            <Btn onClick={function(){setShowPaste(!showPaste);}} disabled={fetchStatus === "fetching"} style={{ fontSize: 12, padding: "8px 16px" }}>
              {fetchStatus === "fetching" ? "Parsing..." : "📋 Paste Race Conditions"}
            </Btn>
          </div>

          {showPaste && (
            <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>Paste Race Conditions Text</div>
              <div style={{ fontSize: 12, color: C.textMid, marginBottom: 12, lineHeight: 1.6 }}>
                Open the HRI PDF, press Ctrl+A then Ctrl+C, paste below. Takes about 10 seconds.
              </div>
              <textarea
                value={pasteText}
                onChange={function(e){setPasteText(e.target.value);}}
                placeholder="Paste the race conditions text here..."
                rows={8}
                style={{ width: "100%", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "10px 12px", color: C.text, fontSize: 12, fontFamily: "inherit", lineHeight: 1.6, resize: "vertical", outline: "none", marginBottom: 10 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={handleParseText} disabled={!pasteText.trim() || fetchStatus === "fetching"} style={{ flex: 1, justifyContent: "center" }}>
                  {fetchStatus === "fetching" ? "Parsing races..." : "Parse Races"}
                </Btn>
                <Btn variant="ghost" onClick={function(){ setShowPaste(false); setPasteText(""); }} style={{ fontSize: 12 }}>Cancel</Btn>
              </div>
            </div>
          )}

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Silk silk={selHorse.silk} size={44} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: C.text }}>{selHorse.name}</span>
                <StatusPill status={selHorse.status} activationDate={selHorse.activationDate} />
                {selHorse.headgear && <Tag color={C.purple}>{selHorse.headgear}</Tag>}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                <span>{getAge(selHorse.dob)}yo {selHorse.sex}</span>
                {selHorse.nhRating && <span>NH {selHorse.nhRating}</span>}
                {selHorse.flatRating && <span>Flat {selHorse.flatRating}</span>}
                {selHorse.hurdleRating && <span>Hrd {selHorse.hurdleRating}</span>}
                {selHorse.chaseRating && <span>Chs {selHorse.chaseRating}</span>}
                <span>{selHorse.trainer}</span>
                <span>Owner: {selHorse.owner}</span>
              </div>
              {selHorse.notes && (
                <div style={{ fontSize: 11, color: C.textMid, fontStyle: "italic", marginTop: 4, padding: "4px 8px", background: C.cardOff, borderRadius: 6, borderLeft: "2px solid " + C.borderMid }}>
                  {selHorse.notes}
                </div>
              )}
            </div>
            <FormDots form={selHorse.form} />
          </div>

          {toast && (
            <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.navy, color: "#fff", borderRadius: 12, padding: "12px 22px", fontSize: 13, fontWeight: 600, zIndex: 600, whiteSpace: "nowrap" }}>
              <span style={{ color: toast.color }}>{toast.msg}</span>
            </div>
          )}

          {races.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>No race conditions loaded</div>
              <div style={{ fontSize: 13 }}>Paste text from hri-ras.ie/upcoming-race-conditions PDF above</div>
            </div>
          ) : eligible.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
              {"No eligible races for " + selHorse.name}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: 1.5, marginBottom: 10, textTransform: "uppercase" }}>
                {eligible.length + " eligible races for " + selHorse.name}
              </div>
              {sorted.map(function(race) {
                const key = k(selHorse.id, race.id);
                const analysis = analyses[key];
                const isLoading = loading[key];
                const stage = loadStage[key] || 0;
                const isSl = !!shortlisted[key];
                const accent = analysis ? (analysis.overall >= 75 ? C.green : analysis.overall >= 55 ? C.amber : C.red) : C.border;
                return (
                  <div key={race.id} style={{ background: C.card, borderRadius: 13, border: "1px solid " + (isSl ? C.gold + "99" : C.border), marginBottom: 12, overflow: "hidden" }}>
                    <div style={{ height: 3, background: analysis ? accent : isSl ? C.gold : C.border }} />
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ flex: 1, marginRight: 12 }}>
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
                            {race.grade && race.grade !== "Ungraded" && <Tag color={C.gold}>{race.grade}</Tag>}
                            {race.isEBF && <Tag color={C.purple}>EBF</Tag>}
                            {race.discipline && <Tag color={C.textMid} bg="#f0f4f8">{race.discipline + " · " + (race.raceType || "")}</Tag>}
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 5 }}>{race.raceName}</div>
                          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                            <span>{"📍 " + race.venue}</span>
                            {race.date && <span>{"📅 " + new Date(race.date).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                            {race.distanceFurlongs && <span>{race.distanceFurlongs + "f"}</span>}
                            {race.forecastGoing && <span>{race.forecastGoing}</span>}
                          </div>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 800, color: C.gold, flexShrink: 0 }}>
                          {race.prizeMoney ? ("€" + (race.prizeMoney >= 1000 ? Math.round(race.prizeMoney * 0.001) + "k" : race.prizeMoney)) : ""}
                        </span>
                      </div>

                      {race.entryDeadline && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: C.cardOff, borderRadius: 8, border: "1px solid " + C.border, marginBottom: 10, fontSize: 12 }}>
                          <span style={{ color: C.textMid, fontWeight: 600 }}>Entry closes</span>
                          <span style={{ fontWeight: 700, color: C.amber }}>
                            {new Date(race.entryDeadline).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }) + " · " + new Date(race.entryDeadline).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      )}

                      {!analysis && !isLoading && (
                        <Btn onClick={function(){analyse(selHorse, race);}} style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>
                          🧠 Get My Take on This Race
                        </Btn>
                      )}

                      {isLoading && (
                        <div style={{ padding: "12px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, marginBottom: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 8 }}>🧠 Racing brain at work...</div>
                          {["Checking who is in this race...", "Looking at the field...", "Checking trainer record...", "Building your analysis..."].map(function(s,i){return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, opacity: i <= stage ? 1 : 0.25 }}>
                              <span style={{ fontSize: 12 }}>{i < stage ? "✓" : i === stage ? "⟳" : "○"}</span>
                              <span style={{ fontSize: 12, color: i <= stage ? C.text : C.textDim }}>{s}</span>
                            </div>
                          ); })}
                        </div>
                      )}

                      {analysis && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
                            {[["HCP", "handicap_edge"], ["Class", "class_fit"], ["Going", "conditions_match"], ["Timing", "timing"], ["Angle", "cuteness"]].map(function(arr2){var label=arr2[0];var k2=arr2[1];
                              const v = (analysis.scores || {})[k2] || 0;
                              const c = v >= 7 ? C.green : v >= 5 ? C.amber : C.red;
                              return (
                                <div key={k2} style={{ flex: 1, textAlign: "center", padding: "6px 2px", background: c + "10", borderRadius: 7, border: "1px solid " + c + "25" }}>
                                  <div style={{ fontSize: 15, fontWeight: 800, color: c }}>{v}</div>
                                  <div style={{ fontSize: 8, color: C.textMid, fontWeight: 600 }}>{label}</div>
                                </div>
                              );
                            })}
                            <div style={{ width: 44, height: 44, borderRadius: "50%", background: accent + "12", border: "3px solid " + accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 4 }}>
                              <span style={{ fontSize: 15, fontWeight: 800, color: accent, lineHeight: 1 }}>{analysis.overall}</span>
                              <span style={{ fontSize: 7, color: C.textMid }}> out of 100</span>
                            </div>
                          </div>
                          {(analysis.bullets || []).map(function(b, i) { return (
                            <div key={i} style={{ background: C.cardOff, border: "1px solid " + C.border, borderLeft: "3px solid " + C.navy, borderRadius: 9, padding: "11px 13px", marginBottom: 8 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                                <span style={{ fontSize: 14 }}>{b.icon}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: 0.8 }}>{b.category}</span>
                              </div>
                              <p style={{ fontSize: 13, color: C.text, lineHeight: 1.75, margin: 0 }}>{b.point}</p>
                            </div>
                          ); })}
                          <div style={{ background: C.navy, borderRadius: 10, padding: "16px 18px", marginBottom: 10 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Bottom Line</div>
                            <p style={{ fontSize: 14, color: "#e8edf5", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{analysis.conclusion}</p>
                          </div>
                        </div>
                      )}

                      {!canRace(selHorse) ? (
                        <div style={{ padding: "9px 12px", background: C.amberBg, border: "1px solid " + C.amber + "40", borderRadius: 9, fontSize: 12, color: C.amber, fontWeight: 600, textAlign: "center" }}>
                          {"⏳ Cool-off active · eligible " + (coolingDate(selHorse.activationDate) ? coolingDate(selHorse.activationDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" }) : "") + " · Do not contact owner yet"}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          <Btn variant="gold" onClick={function() {
                            setShortlisted(function(s) { return Object.assign({}, s, { [key]: s[key] ? null : { horse: selHorse, race } }); });
                          }} style={{ width: "100%", justifyContent: "center" }}>
                            {isSl ? "★ On Shortlist" : "☆ Add to Shortlist"}
                          </Btn>
                          {isSl && (
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                              <Btn variant="green" onClick={function(){handleEntry(selHorse, race);}} style={{ justifyContent: "center", flexDirection: "column", gap: 2 }}>
                                <span>✓ Confirm Entry</span>
                                <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>WhatsApp owner</span>
                              </Btn>
                              <button onClick={function(){handleDeclaration(selHorse, race);}} style={{ padding: "9px", background: C.blueBg, border: "2px solid " + C.blue + "50", borderRadius: 9, color: C.blue, fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                                <span>📋 Declare to Run</span>
                                <span style={{ fontSize: 10, opacity: 0.7, fontWeight: 400 }}>WhatsApp owner + jockey</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

      </div>
    </div>
  </div>
  );
}


export default RacePlanner;
