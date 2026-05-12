import React, { useState } from "react";
import { Btn, Silk, C } from "./shared";

function WeightsTracker({ horses, weights, setWeights, settings }) {
  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);
  var weighDay = (settings && settings.weighDay) || "Monday";

  var viewState = useState("entry");
  var view = viewState[0]; var setView = viewState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var selectedDateState = useState(todayStr);
  var selectedDate = selectedDateState[0]; var setSelectedDate = selectedDateState[1];
  var weightTypeState = useState("weekly");
  var weightType = weightTypeState[0]; var setWeightType = weightTypeState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 3000);
  }

  function getWeight(horseId, date, type) {
    var key = horseId + "_" + date + "_" + (type || "weekly");
    return (weights || {})[key] || "";
  }

  function setWeight(horseId, date, type, val) {
    var key = horseId + "_" + date + "_" + (type || "weekly");
    setWeights(function(prev) {
      var next = Object.assign({}, prev);
      if (val === "" || val === null) {
        delete next[key];
      } else {
        next[key] = val;
      }
      return next;
    });
  }

  function getLastWeight(horseId) {
    var allKeys = Object.keys(weights || {}).filter(function(k) {
      return k.indexOf(horseId + "_") === 0 && k.indexOf("_weekly") >= 0;
    });
    if (!allKeys.length) return null;
    allKeys.sort().reverse();
    return { date: allKeys[0].split("_")[1], value: weights[allKeys[0]] };
  }

  function getTrend(horseId) {
    var allKeys = Object.keys(weights || {}).filter(function(k) {
      return k.indexOf(horseId + "_") === 0 && k.indexOf("_weekly") >= 0;
    });
    if (allKeys.length < 2) return null;
    allKeys.sort();
    var recent = parseFloat(weights[allKeys[allKeys.length - 1]]);
    var prev = parseFloat(weights[allKeys[allKeys.length - 2]]);
    if (isNaN(recent) || isNaN(prev)) return null;
    var diff = recent - prev;
    return { diff: Math.round(diff * 10) / 10, up: diff > 0, down: diff < 0 };
  }

  function getHistory(horseId) {
    var allKeys = Object.keys(weights || {}).filter(function(k) {
      return k.indexOf(horseId + "_") === 0;
    });
    allKeys.sort().reverse();
    return allKeys.slice(0, 8).map(function(k) {
      var parts = k.split("_");
      return { date: parts[1], type: parts[2], value: weights[k] };
    });
  }

  function saveAll() {
    showToast("All weights saved");
  }

  var activeHorses = (horses || []).filter(function(h) { return h.status !== "Inactive"; });
  var filteredHorses = activeHorses.filter(function(h) {
    if (!search) return true;
    return h.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
  });

  var totalWeighed = filteredHorses.filter(function(h) {
    return getWeight(h.id, selectedDate, weightType) !== "";
  }).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Weights Tracker</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
            {"Weekly weigh day: " + weighDay + " — " + totalWeighed + "/" + filteredHorses.length + " weighed today"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={function() { setView("entry"); }}
            style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (view === "entry" ? C.navy : C.border),
              background: view === "entry" ? C.navy : C.card, color: view === "entry" ? "#fff" : C.textMid,
              fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Enter Weights
          </button>
          <button onClick={function() { setView("history"); }}
            style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (view === "history" ? C.navy : C.border),
              background: view === "history" ? C.navy : C.card, color: view === "history" ? "#fff" : C.textMid,
              fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            History & Trends
          </button>
        </div>
      </div>

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Date</div>
          <input type="date" value={selectedDate} onChange={function(e) { setSelectedDate(e.target.value); }}
            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Type</div>
          <select value={weightType} onChange={function(e) { setWeightType(e.target.value); }}
            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
            <option value="weekly">Weekly Weigh-in</option>
            <option value="racing">Race Day Weight</option>
            <option value="vet">Vet Check</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Search</div>
          <input type="text" value={search} onChange={function(e) { setSearch(e.target.value); }}
            placeholder="Search horses..."
            style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <div style={{ padding: "8px 18px", background: totalWeighed === filteredHorses.length && filteredHorses.length > 0 ? C.green + "15" : C.amberBg, border: "1px solid " + (totalWeighed === filteredHorses.length && filteredHorses.length > 0 ? C.green : C.amber) + "40", borderRadius: 8, fontSize: 13, fontWeight: 700, color: totalWeighed === filteredHorses.length && filteredHorses.length > 0 ? C.green : C.amber }}>
            {totalWeighed + " / " + filteredHorses.length + " done"}
          </div>
        </div>
      </div>

      {view === "entry" && (
        <div>
          {filteredHorses.map(function(horse) {
            var val = getWeight(horse.id, selectedDate, weightType);
            var last = getLastWeight(horse.id);
            var trend = getTrend(horse.id);
            var hasWeight = val !== "";
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + (hasWeight ? C.green : C.border), borderLeft: "4px solid " + (hasWeight ? C.green : C.border), borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14 }}>
                <Silk silk={horse.silk} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{horse.name}</div>
                  <div style={{ fontSize: 12, color: C.textMid, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {last && <span>{"Last: " + last.value + "kg on " + new Date(last.date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>}
                    {trend && (
                      <span style={{ color: trend.diff > 2 ? C.amber : trend.diff < -2 ? C.red : C.green, fontWeight: 700 }}>
                        {trend.up ? "▲ +" : "▼ "}{trend.diff}kg
                      </span>
                    )}
                    {horse.owner && <span>{horse.owner}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    <input type="number" value={val} step="0.5" min="200" max="700"
                      onChange={function(e) { setWeight(horse.id, selectedDate, weightType, e.target.value); }}
                      placeholder="kg"
                      style={{ width: 90, padding: "10px 14px", background: hasWeight ? C.green + "10" : C.cardOff,
                        border: "2px solid " + (hasWeight ? C.green : C.border), borderRadius: 10,
                        fontSize: 16, fontWeight: 700, color: C.text, textAlign: "center" }} />
                    <div style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.textMid, pointerEvents: "none" }}>kg</div>
                  </div>
                  {hasWeight && <span style={{ fontSize: 18, color: C.green }}>✓</span>}
                </div>
              </div>
            );
          })}
          {filteredHorses.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
              No active horses found
            </div>
          )}
        </div>
      )}

      {view === "history" && (
        <div>
          {filteredHorses.map(function(horse) {
            var history = getHistory(horse.id);
            var trend = getTrend(horse.id);
            if (!history.length) return null;
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Silk silk={horse.silk} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner}</div>
                  </div>
                  {trend && (
                    <div style={{ padding: "4px 12px", borderRadius: 20, background: Math.abs(trend.diff) > 5 ? C.red + "15" : Math.abs(trend.diff) > 2 ? C.amber + "15" : C.green + "15", border: "1px solid " + (Math.abs(trend.diff) > 5 ? C.red : Math.abs(trend.diff) > 2 ? C.amber : C.green) + "30" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: Math.abs(trend.diff) > 5 ? C.red : Math.abs(trend.diff) > 2 ? C.amber : C.green }}>
                        {trend.up ? "▲ +" : "▼ "}{trend.diff}kg
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {history.map(function(entry, idx) {
                    return (
                      <div key={idx} style={{ padding: "8px 12px", background: C.cardOff, borderRadius: 8, textAlign: "center", minWidth: 80 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>{entry.value + "kg"}</div>
                        <div style={{ fontSize: 10, color: C.textMid, marginTop: 2 }}>
                          {new Date(entry.date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}
                        </div>
                        <div style={{ fontSize: 9, color: C.textDim }}>{entry.type}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filteredHorses.filter(function(h) { return getHistory(h.id).length > 0; }).length === 0 && (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
              No weight history yet — start entering weights in the Entry tab
            </div>
          )}
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

export default WeightsTracker;
