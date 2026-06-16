import React, { useState } from "react";
import { Btn, Silk, C } from "./shared";

function TemperatureTracker({ horses, temperatures, setTemperatures, settings }) {
  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);

  var viewState = useState("entry");
  var view = viewState[0]; var setView = viewState[1];
  var searchState = useState("");
  var search = searchState[0]; var setSearch = searchState[1];
  var selectedDateState = useState(todayStr);
  var selectedDate = selectedDateState[0]; var setSelectedDate = selectedDateState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];

  // A horse's normal temperature is roughly 37.5-38.5 C. Above this is worth flagging.
  var HIGH_TEMP = 38.6;
  var LOW_TEMP = 37.0;

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 3000);
  }

  function tKey(horseId, date) { return horseId + "_" + date; }

  function getTemp(horseId, date) {
    return (temperatures || {})[tKey(horseId, date)] || "";
  }

  function setTemp(horseId, date, val) {
    var key = tKey(horseId, date);
    setTemperatures(function(prev) {
      var next = Object.assign({}, prev);
      if (val === "" || val === null) {
        delete next[key];
      } else {
        next[key] = val;
        showToast("Saved", C.green);
      }
      return next;
    });
  }

  function parseKey(k) {
    // key = horseId_YYYY-MM-DD (horseId may contain underscores)
    var lastUnd = k.lastIndexOf("_");
    var date = k.slice(lastUnd + 1);
    var horseId = k.slice(0, lastUnd);
    return { horseId: horseId, date: date };
  }

  function getLastTemp(horseId) {
    var allKeys = Object.keys(temperatures || {}).filter(function(k) {
      return parseKey(k).horseId === horseId;
    });
    if (!allKeys.length) return null;
    allKeys.sort(function(a, b) { return parseKey(a).date.localeCompare(parseKey(b).date); });
    var lastK = allKeys[allKeys.length - 1];
    return { date: parseKey(lastK).date, value: temperatures[lastK] };
  }

  function getHistory(horseId) {
    var allKeys = Object.keys(temperatures || {}).filter(function(k) {
      var p = parseKey(k);
      return p.horseId === horseId && p.date && p.date.length === 10;
    });
    allKeys.sort().reverse();
    return allKeys.slice(0, 20).map(function(k) {
      return { key: k, date: parseKey(k).date, value: temperatures[k] };
    });
  }

  function deleteTemp(key) {
    setTemperatures(function(prev) {
      var next = Object.assign({}, prev);
      delete next[key];
      return next;
    });
  }

  function updateTemp(key, newVal) {
    setTemperatures(function(prev) {
      var next = Object.assign({}, prev);
      if (newVal === "" || newVal === null) {
        delete next[key];
      } else {
        next[key] = newVal;
      }
      return next;
    });
  }

  function isHigh(val) {
    var n = parseFloat(val);
    return !isNaN(n) && n >= HIGH_TEMP;
  }
  function isLow(val) {
    var n = parseFloat(val);
    return !isNaN(n) && n > 0 && n <= LOW_TEMP;
  }

  var activeHorses = (horses || []).filter(function(h) { return h.status !== "Inactive"; }).sort(function(a, b) {
    return (a.name || "").localeCompare(b.name || "");
  });
  var filteredHorses = activeHorses.filter(function(h) {
    if (!search) return true;
    return h.name.toLowerCase().indexOf(search.toLowerCase()) >= 0;
  });

  var totalDone = filteredHorses.filter(function(h) {
    return getTemp(h.id, selectedDate) !== "";
  }).length;

  // High-temp alerts for the selected date
  var highToday = filteredHorses.map(function(h) {
    var v = getTemp(h.id, selectedDate);
    return isHigh(v) ? { horse: h, value: v } : null;
  }).filter(Boolean);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Temperature Tracker</div>
          {highToday.length > 0 && (
            <div style={{ background: C.red + "10", border: "1px solid " + C.red + "30", borderRadius: 10, padding: "10px 16px", marginTop: 8, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>{"\u26a0\ufe0f High Temperatures"}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {highToday.map(function(a) {
                  return (
                    <div key={a.horse.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                      <Silk silk={a.horse.silk} size={22} />
                      <span style={{ fontWeight: 700, color: C.text }}>{a.horse.name}</span>
                      <span style={{ color: C.red, fontWeight: 700 }}>{a.value + " \u00b0C"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
            {"Normal range 37.5-38.5 \u00b0C \u2014 " + totalDone + "/" + filteredHorses.length + " taken on this date"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={function() { setView("entry"); }}
            style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (view === "entry" ? C.navy : C.border),
              background: view === "entry" ? C.navy : C.card, color: view === "entry" ? "#fff" : C.textMid,
              fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Enter Temperatures
          </button>
          <button onClick={function() { setView("history"); }}
            style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (view === "history" ? C.navy : C.border),
              background: view === "history" ? C.navy : C.card, color: view === "history" ? "#fff" : C.textMid,
              fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            History
          </button>
        </div>
      </div>

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 14, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Date</div>
          <input type="date" value={selectedDate} onChange={function(e) { setSelectedDate(e.target.value); }}
            style={{ padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Search</div>
          <input type="text" value={search} onChange={function(e) { setSearch(e.target.value); }}
            placeholder="Search horses..."
            style={{ width: "100%", padding: "8px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <div style={{ padding: "8px 18px", background: totalDone === filteredHorses.length && filteredHorses.length > 0 ? C.green + "15" : C.amberBg, border: "1px solid " + (totalDone === filteredHorses.length && filteredHorses.length > 0 ? C.green : C.amber) + "40", borderRadius: 8, fontSize: 13, fontWeight: 700, color: totalDone === filteredHorses.length && filteredHorses.length > 0 ? C.green : C.amber }}>
            {totalDone + " / " + filteredHorses.length + " done"}
          </div>
        </div>
      </div>

      {view === "entry" && (
        <div>
          {filteredHorses.map(function(horse) {
            var val = getTemp(horse.id, selectedDate);
            var last = getLastTemp(horse.id);
            var has = val !== "";
            var high = isHigh(val);
            var low = isLow(val);
            var edge = high ? C.red : (low ? C.amber : (has ? C.green : C.border));
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + edge, borderLeft: "4px solid " + edge, borderRadius: 12, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", gap: 14 }}>
                <Silk silk={horse.silk} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{horse.name}</div>
                  <div style={{ fontSize: 12, color: C.textMid, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {last && <span>{"Last: " + last.value + " \u00b0C on " + new Date(last.date + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "short" })}</span>}
                    {high && <span style={{ color: C.red, fontWeight: 700 }}>High</span>}
                    {low && <span style={{ color: C.amber, fontWeight: 700 }}>Low</span>}
                    {horse.owner && <span>{horse.owner}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    <input type="number" value={val} step="0.1" min="35" max="42"
                      onChange={function(e) { setTemp(horse.id, selectedDate, e.target.value); }}
                      placeholder="\u00b0C"
                      style={{ width: 92, padding: "10px 14px", background: has ? edge + "10" : C.cardOff,
                        border: "2px solid " + edge, borderRadius: 10,
                        fontSize: 16, fontWeight: 700, color: C.text, textAlign: "center" }} />
                    <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: C.textMid, pointerEvents: "none" }}>{"\u00b0C"}</div>
                  </div>
                  {has && !high && !low && <span style={{ fontSize: 18, color: C.green }}>{"\u2713"}</span>}
                  {high && <span style={{ fontSize: 18, color: C.red }}>{"\u26a0\ufe0f"}</span>}
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
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 16px", marginBottom: 12, fontSize: 12, color: C.textMid }}>
            Temperatures auto-save as you enter them. Readings at or above 38.6 {"\u00b0C"} are flagged.
          </div>
          {filteredHorses.map(function(horse) {
            var history = getHistory(horse.id);
            if (!history.length) return null;
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Silk silk={horse.silk} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {history.map(function(entry) {
                    var d = new Date(entry.date + "T12:00:00");
                    var validDate = !isNaN(d.getTime()) && entry.date && entry.date.length === 10;
                    var dateStr = validDate ? d.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }) : "Bad key";
                    var hi = isHigh(entry.value);
                    return (
                      <div key={entry.key || entry.date} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid " + C.border, fontSize: 13, width: "100%" }}>
                        <span style={{ color: C.textMid, flex: 1 }}>{dateStr}</span>
                        <input type="number" step="0.1" defaultValue={entry.value}
                          onBlur={function(e) { if (entry.key) updateTemp(entry.key, e.target.value); }}
                          style={{ width: 64, padding: "3px 6px", background: hi ? C.red + "10" : C.cardOff, border: "1px solid " + (hi ? C.red : C.border), borderRadius: 6, fontSize: 13, fontWeight: 700, color: hi ? C.red : C.text, textAlign: "right" }} />
                        <span style={{ fontSize: 11, color: C.textMid }}>{"\u00b0C"}</span>
                        <button onClick={function() { if (entry.key && window.confirm("Remove this entry?")) deleteTemp(entry.key); }}
                          style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 4px" }}>{"\u00d7"}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {filteredHorses.filter(function(h) { return getHistory(h.id).length > 0; }).length === 0 && (
            <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 12, color: C.textMid }}>
              No temperature history yet - start entering readings in the Entry tab
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

export default TemperatureTracker;
