import React, { useState } from "react";
import { Btn, Silk, C, daysUntil, ANTHROPIC_KEY } from "./shared";

var API_HEADERS = {
  "Content-Type": "application/json",
  "x-api-key": ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true"
};

function DailySummary({ horses, medLogs, weights, wbEntries, settings }) {
  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);
  var logsState = useState({});
  var dailyLogs = logsState[0]; var setDailyLogs = logsState[1];
  var aiSummaryState = useState("");
  var aiSummary = aiSummaryState[0]; var setAiSummary = aiSummaryState[1];
  var loadingState = useState(false);
  var loading = loadingState[0]; var setLoading = loadingState[1];
  var selectedDateState = useState(todayStr);
  var selectedDate = selectedDateState[0]; var setSelectedDate = selectedDateState[1];
  var newLogState = useState({ category: "general", text: "", horseId: "" });
  var newLog = newLogState[0]; var setNewLog = newLogState[1];

  var LOG_CATS = [
    { id: "general", label: "General", icon: "📋", color: C.blue },
    { id: "health", label: "Health/Vet", icon: "🏥", color: C.red },
    { id: "gallop", label: "Gallop", icon: "⚡", color: C.amber },
    { id: "racing", label: "Racing", icon: "🏇", color: C.gold },
    { id: "farrier", label: "Farrier/Physio", icon: "🔧", color: C.purple },
    { id: "note", label: "Trainer Note", icon: "📝", color: C.navy }
  ];

  function addLog() {
    if (!newLog.text.trim()) return;
    var key = selectedDate;
    var horse = (horses || []).find(function(h) { return h.id === newLog.horseId; });
    var entry = Object.assign({}, newLog, {
      id: "log_" + Date.now(),
      timestamp: new Date().toISOString(),
      horseName: horse ? horse.name : ""
    });
    setDailyLogs(function(prev) {
      var dayLogs = (prev[key] || []).slice();
      dayLogs.push(entry);
      return Object.assign({}, prev, { [key]: dayLogs });
    });
    setNewLog({ category: "general", text: "", horseId: "" });
  }

  function removeLog(date, id) {
    setDailyLogs(function(prev) {
      var dayLogs = (prev[date] || []).filter(function(l) { return l.id !== id; });
      return Object.assign({}, prev, { [date]: dayLogs });
    });
  }

  var generateAISummary = async function() {
    setLoading(true);
    try {
      var activeHorses = (horses || []).filter(function(h) { return h.status === "Active"; }).sort(function(a, b) {
    var aEx = (a.name || "").toUpperCase().indexOf("EX ") === 0 || (a.name || "").toUpperCase().indexOf("(EX)") >= 0;
    var bEx = (b.name || "").toUpperCase().indexOf("EX ") === 0 || (b.name || "").toUpperCase().indexOf("(EX)") >= 0;
    if (aEx && !bEx) return -1;
    if (!aEx && bEx) return 1;
    return (a.name || "").localeCompare(b.name || "");
  })
      var todayLogs = (dailyLogs[selectedDate] || []);
      var racingToday = (wbEntries || []).filter(function(e) { return e.date === selectedDate; });
      var yardName = (settings && settings.yardName) || "the yard";

      var contextParts = [
        "Yard: " + yardName + " (" + activeHorses.length + " active horses)",
        "Date: " + new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
        "Racing today: " + (racingToday.length > 0 ? racingToday.map(function(e) { return e.horseName + " at " + e.venue; }).join(", ") : "none"),
        "Daily log entries: " + (todayLogs.length > 0 ? todayLogs.map(function(l) { return l.category + ": " + l.text + (l.horseName ? " (" + l.horseName + ")" : ""); }).join("; ") : "none logged"),
        "Horses with races this week: " + activeHorses.filter(function(h) { var d = daysUntil(h.nextRaceDate); return d && d >= 0 && d <= 7; }).map(function(h) { return h.name; }).join(", ") || "none"
      ];

      var res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: API_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: "Write a brief daily summary report for a racing yard trainer. Be practical and concise (max 150 words). Include: what happened today, any notable events, upcoming race mentions, and one or two practical suggestions for tomorrow. Data: " + contextParts.join(". ")
          }]
        })
      });
      var data = await res.json();
      var txt = (data.content || []).filter(function(b) { return b.type === "text"; }).map(function(b) { return b.text; }).join("");
      setAiSummary(txt);
    } catch (err) {
      console.error(err);
      setAiSummary("Could not generate summary. Check API key in Yard Settings.");
    }
    setLoading(false);
  };

  var todayLogs = dailyLogs[selectedDate] || [];
  var activeHorses = (horses || []).filter(function(h) { return h.status === "Active"; });
  var racingToday = (wbEntries || []).filter(function(e) { return e.date === selectedDate; });
  var racingSoon = activeHorses.filter(function(h) { var d = daysUntil(h.nextRaceDate); return d && d >= 0 && d <= 7; });
  var todayKey = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  // All medications given today - any med type
  var medsGivenToday = [];
  activeHorses.forEach(function(h) {
    var horseMeds = [];
    Object.keys(medLogs || {}).forEach(function(key) {
      if (key.indexOf(h.id + "_" + todayKey + "_") === 0 && medLogs[key]) {
        var medType = key.split("_").slice(-1)[0];
        horseMeds.push(medType);
      }
    });
    if (horseMeds.length > 0) {
      medsGivenToday.push({ horse: h, meds: horseMeds });
    }
  });

  // Horses whose medication ends today or in next 2 days
  // based on entries/shortlists and configured course lengths
  var medSettings = (settings && settings.medications) ? settings.medications : [
    { name: "Peptizole", courseDays: 12, withdrawalDays: 4 },
    { name: "Antepsin", courseDays: 12, withdrawalDays: 1 }
  ];

  var medEndingSoon = [];
  activeHorses.forEach(function(h) {
    var entries = (h.provisionalEntries || []);
    entries.forEach(function(entry) {
      if (!entry.date) return;
      var raceDate = new Date(entry.date + "T12:00:00");
      medSettings.forEach(function(ms) {
        var courseDays = parseInt(ms.courseDays || 12);
        var withdrawalDays = parseInt(ms.withdrawalDays || 4);
        var stopDate = new Date(raceDate);
        stopDate.setDate(stopDate.getDate() - withdrawalDays);
        var today2 = new Date(); today2.setHours(0,0,0,0);
        var stopD = new Date(stopDate); stopD.setHours(0,0,0,0);
        var daysToStop = Math.round((stopD - today2) / 86400000);
        if (daysToStop >= 0 && daysToStop <= 2) {
          medEndingSoon.push({ horse: h, med: ms.name || ms.label, daysToStop: daysToStop, stopDate: stopDate.toLocaleDateString("en-IE", { day: "numeric", month: "short" }), race: entry.raceName || entry.venue, raceDate: entry.date });
        }
      });
    });
  });

  var medEndingToday = medEndingSoon.filter(function(m) { return m.daysToStop === 0; });

  var headgearStats = {};
  (horses || []).forEach(function(h) {
    if (h.headgear) {
      headgearStats[h.headgear] = (headgearStats[h.headgear] || 0) + 1;
    }
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Daily Summary</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Log what happened, track what matters</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={selectedDate} onChange={function(e) { setSelectedDate(e.target.value); setAiSummary(""); }}
            style={{ padding: "8px 12px", background: C.card, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          <Btn onClick={generateAISummary} disabled={loading} style={{ fontSize: 12 }}>
            {loading ? "Generating..." : "AI Summary"}
          </Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Active Horses", value: activeHorses.length, color: C.blue, icon: "🐎" },
          { label: "Racing Today", value: racingToday.length, color: C.gold, icon: "🏇" },
          { label: "Racing This Week", value: racingSoon.length, color: C.amber, icon: "📅" },
          { label: "Meds Given Today", value: medsGivenToday.length, color: medsGivenToday.length > 0 ? C.blue : C.textMid, icon: "💊" }
        ].map(function(stat) {
          return (
            <div key={stat.label} style={{ background: C.card, borderRadius: 12, padding: "14px 16px", borderTop: "4px solid " + stat.color }}>
              <div style={{ fontSize: 10, color: C.textMid, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{stat.icon + " " + stat.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            </div>
          );
        })}
      </div>

      {aiSummary && (
        <div style={{ background: C.navy, borderRadius: 14, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>AI Daily Summary</div>
          <p style={{ fontSize: 14, color: "#e8edf5", lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap" }}>{aiSummary}</p>
        </div>
      )}

      {racingToday.length > 0 && (
        <div style={{ background: C.goldBg, border: "1px solid " + C.gold + "30", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gold, marginBottom: 10 }}>🏇 Racing Today</div>
          {racingToday.map(function(e) {
            var horse = (horses || []).find(function(h) { return h.id === e.horseId; });
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + C.gold + "20" }}>
                {horse && <Silk silk={horse.silk} size={28} />}
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{e.horseName}</span>
                  <span style={{ fontSize: 12, color: C.textMid, marginLeft: 8 }}>{e.raceName + " · " + e.venue}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{e.raceTime}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>💊 Medication — Today</div>

        {medsGivenToday.length > 0 ? (
          <div style={{ marginBottom: medEndingSoon.length > 0 ? 12 : 0 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Given Today</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {medsGivenToday.map(function(item) {
                return (
                  <div key={item.horse.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: C.cardOff, borderRadius: 8 }}>
                    <Silk silk={item.horse.silk} size={22} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text, flex: 1 }}>{item.horse.name}</span>
                    <div style={{ display: "flex", gap: 5 }}>
                      {item.meds.map(function(med) {
                        return <span key={med} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.blue + "15", color: C.blue, fontWeight: 700, textTransform: "capitalize" }}>{med}</span>;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: C.textDim, marginBottom: medEndingSoon.length > 0 ? 12 : 0 }}>No medication logged yet today — go to Medication Tracker to log</div>
        )}

        {medEndingSoon.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: medsGivenToday.length > 0 ? 12 : 0, paddingTop: medsGivenToday.length > 0 ? 12 : 0, borderTop: medsGivenToday.length > 0 ? "1px solid " + C.border : "none" }}>
              Ending Soon — Check Entries Before 12pm
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {medEndingSoon.map(function(item, idx) {
                var isToday = item.daysToStop === 0;
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: isToday ? C.red + "08" : C.amberBg, borderRadius: 8, border: "1px solid " + (isToday ? C.red : C.amber) + "30" }}>
                    <Silk silk={item.horse.silk} size={22} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.horse.name}</span>
                      <span style={{ fontSize: 11, color: C.textMid, marginLeft: 6 }}>{item.race}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: isToday ? C.red : C.amber }}>
                        {isToday ? "LAST DAY" : "In " + item.daysToStop + "d"}
                      </div>
                      <div style={{ fontSize: 10, color: C.textDim }}>{item.med}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {medsGivenToday.length === 0 && medEndingSoon.length === 0 && (
          <div style={{ fontSize: 13, color: C.textDim }}>No medication activity today</div>
        )}
      </div>

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>Log Entry</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {LOG_CATS.map(function(cat) {
            return (
              <button key={cat.id} onClick={function() { setNewLog(function(p) { return Object.assign({}, p, { category: cat.id }); }); }}
                style={{ padding: "5px 12px", borderRadius: 20, border: "1.5px solid " + (newLog.category === cat.id ? cat.color : C.border),
                  background: newLog.category === cat.id ? cat.color + "12" : "transparent",
                  color: newLog.category === cat.id ? cat.color : C.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {cat.icon + " " + cat.label}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select value={newLog.horseId} onChange={function(e) { setNewLog(function(p) { return Object.assign({}, p, { horseId: e.target.value }); }); }}
            style={{ padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, minWidth: 160 }}>
            <option value="">General / Whole yard</option>
            {activeHorses.map(function(h) { return <option key={h.id} value={h.id}>{h.name}</option>; })}
          </select>
          <input type="text" value={newLog.text} onChange={function(e) { setNewLog(function(p) { return Object.assign({}, p, { text: e.target.value }); }); }}
            onKeyDown={function(e) { if (e.key === "Enter") addLog(); }}
            placeholder="What happened? e.g. Treated Bob Olinger's near-fore, icing tonight"
            style={{ flex: 1, padding: "9px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
          <Btn onClick={addLog} disabled={!newLog.text.trim()} style={{ flexShrink: 0 }}>Add</Btn>
        </div>
      </div>

      {todayLogs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            {selectedDate === todayStr ? "Today's Log" : "Log for " + new Date(selectedDate + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
          </div>
          {todayLogs.map(function(log) {
            var catInfo = LOG_CATS.find(function(c) { return c.id === log.category; });
            return (
              <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 14px", background: C.card, border: "1px solid " + C.border, borderRadius: 10, marginBottom: 7 }}>
                <span style={{ fontSize: 18, lineHeight: 1.2 }}>{catInfo ? catInfo.icon : "📋"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>
                    {log.horseName && <span style={{ fontWeight: 700, color: C.navy, marginRight: 6 }}>{log.horseName}:</span>}
                    {log.text}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>
                    {new Date(log.timestamp).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}
                    {catInfo && <span style={{ marginLeft: 6, color: catInfo.color }}>{"· " + catInfo.label}</span>}
                  </div>
                </div>
                <button onClick={function() { removeLog(selectedDate, log.id); }}
                  style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 16 }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {Object.keys(headgearStats).length > 0 && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Headgear in Yard</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {Object.keys(headgearStats).map(function(hg) {
              return (
                <div key={hg} style={{ padding: "6px 14px", background: C.purple + "12", border: "1px solid " + C.purple + "30", borderRadius: 20 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.purple }}>{hg}</span>
                  <span style={{ fontSize: 12, color: C.textMid, marginLeft: 6 }}>{headgearStats[hg] + " horses"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DailySummary;
