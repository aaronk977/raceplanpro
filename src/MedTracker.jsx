import React, { useState } from "react";
import { Silk, Btn, C, TODAY, getDaysInMonth, daysUntil } from "./shared";

function MedicationTracker({ horses, medLogs, setMedLogs, trackedIds, setTrackedIds }) {
  var [selMonth, setSelMonth] = useState(TODAY.getMonth());
  var [selYear, setSelYear] = useState(TODAY.getFullYear());
  var [openHorse, setOpenHorse] = useState(null);
  var [showBill, setShowBill] = useState(false);
  var [billHorse, setBillHorse] = useState(null);
  var [showAdd, setShowAdd] = useState(false);
  var [medView, setMedView] = useState("tracker");

  var daysInMonth = getDaysInMonth(selYear, selMonth);
  var days = [];
  for (var di = 1; di <= daysInMonth; di++) { days.push(di); }
  var todayD = TODAY.getDate();
  var isCurrent = selMonth === TODAY.getMonth() && selYear === TODAY.getFullYear();
  var monthName = new Date(selYear, selMonth).toLocaleString("en-IE", { month: "long", year: "numeric" });

  function k(hId, d, t) {
    var mm = String(selMonth + 1).padStart(2, "0");
    var dd = String(d).padStart(2, "0");
    return hId + "_" + selYear + "-" + mm + "-" + dd + "_" + t;
  }
  function getMed(hId, d, t) { return medLogs[k(hId, d, t)] || 0; }
  function toggleMed(hId, d, t) {
    setMedLogs(function(prev) {
      var cur = prev[k(hId, d, t)] || 0;
      var next = Object.assign({}, prev);
      if (t === "antibiotics") { next[k(hId, d, t)] = cur === 0 ? 1 : cur === 1 ? 2 : 0; }
      else { next[k(hId, d, t)] = cur ? 0 : 1; }
      return next;
    });
  }

  function todayKey(hId, t) {
    var mm = String(TODAY.getMonth() + 1).padStart(2, "0");
    var dd = String(TODAY.getDate()).padStart(2, "0");
    return hId + "_" + TODAY.getFullYear() + "-" + mm + "-" + dd + "_" + t;
  }
  function getMedToday(hId, t) { return medLogs[todayKey(hId, t)] || 0; }
  function toggleMedToday(hId, t) {
    setMedLogs(function(prev) {
      var cur = prev[todayKey(hId, t)] || 0;
      var next = Object.assign({}, prev);
      if (t === "antibiotics") { next[todayKey(hId, t)] = cur === 0 ? 1 : cur === 1 ? 2 : 0; }
      else { next[todayKey(hId, t)] = cur ? 0 : 1; }
      return next;
    });
  }

  function calcCost(hId) {
    var peptDays = 0, antTicks = 0, abDoses = 0;
    for (var i = 0; i < days.length; i++) {
      var d = days[i];
      if (getMed(hId, d, "peptizole")) peptDays++;
      if (getMed(hId, d, "antepsin")) antTicks++;
      abDoses += getMed(hId, d, "antibiotics");
    }
    var antBottles = Math.ceil(antTicks * 0.25);
    return {
      peptizoleDays: peptDays, antepsinTicks: antTicks, antepsinBottles: antBottles,
      antibioticDoses: abDoses, peptizole: peptDays * 18,
      antepsin: antBottles * 25, antibiotics: abDoses * 15,
      total: peptDays * 18 + antBottles * 25 + abDoses * 15
    };
  }

  var trackedHorses = [];
  var untrackedHorses = [];
  for (var hi = 0; hi < horses.length; hi++) {
    var h = horses[hi];
    if (trackedIds.indexOf(h.id) >= 0) { trackedHorses.push(h); }
    else if (h.status !== "Inactive") { untrackedHorses.push(h); }
  }

  var medTypes = [
    { id: "peptizole", label: "Peptizole", color: C.blue, short: "P" },
    { id: "antepsin", label: "Antepsin", color: C.purple, short: "A" },
    { id: "antibiotics", label: "Antibiotics", color: C.amber, short: "Ab" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Medication Tracker</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Tap each day to log</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {medView === "tracker" && (
            <React.Fragment>
              <Btn variant="ghost" onClick={function() { var d = new Date(selYear, selMonth - 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }} style={{ padding: "7px 12px" }}>{"<"}</Btn>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text, minWidth: 150, textAlign: "center" }}>{monthName}</span>
              <Btn variant="ghost" onClick={function() { var d = new Date(selYear, selMonth + 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }} style={{ padding: "7px 12px" }}>{">"}</Btn>
              <Btn onClick={function() { setShowAdd(true); }} disabled={untrackedHorses.length === 0}>+ Add Horse</Btn>
            </React.Fragment>
          )}
          <Btn variant={medView === "daily" ? "primary" : "ghost"} onClick={function() { setMedView(medView === "daily" ? "tracker" : "daily"); }}>
            {medView === "daily" ? "Monthly View" : "Today"}
          </Btn>
        </div>
      </div>

      {medView === "daily" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, marginBottom: 14, paddingBottom: 10, borderBottom: "2px solid " + C.border }}>
              {"Today — " + TODAY.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            {trackedHorses.length === 0 && (
              <div style={{ color: C.textMid, fontSize: 13, padding: "20px 0" }}>No horses on tracker yet.</div>
            )}
            {trackedHorses.map(function(horse) {
              var anyGiven = getMedToday(horse.id, "peptizole") || getMedToday(horse.id, "antepsin") || getMedToday(horse.id, "antibiotics");
              return (
                <div key={horse.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid " + C.border }}>
                  <Silk silk={horse.silk} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{horse.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {medTypes.map(function(mt) {
                        var val = getMedToday(horse.id, mt.id);
                        return (
                          <button key={mt.id} onClick={function() { toggleMedToday(horse.id, mt.id); }}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "2px solid " + mt.color,
                              background: val ? mt.color : "transparent", color: val ? "#fff" : mt.color,
                              fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {val > 1 ? mt.label + " x" + val : mt.label}{val ? " ✓" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: anyGiven ? C.green : C.textMid }}>
                    {anyGiven ? "Logged" : "None"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {medView === "tracker" && (
        <div>
          {trackedHorses.length === 0 && untrackedHorses.length > 0 && (
            <div style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "16px 20px", marginBottom: 14, fontSize: 13, color: C.textMid }}>
              No horses on tracker yet. Click + Add Horse to start tracking.
            </div>
          )}

          {trackedHorses.map(function(horse) {
            var isOpen = openHorse === horse.id;
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
                <div onClick={function() { setOpenHorse(isOpen ? null : horse.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer" }}>
                  <Silk silk={horse.silk} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                    <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner}</div>
                  </div>
                  <Btn onClick={function(e) { e.stopPropagation(); setBillHorse(horse); setShowBill(true); }} style={{ fontSize: 12, padding: "5px 10px" }}>Bill</Btn>
                  <Btn variant="ghost" onClick={function(e) { e.stopPropagation(); setTrackedIds(function(p) { var out = []; for (var i = 0; i < p.length; i++) { if (p[i] !== horse.id) out.push(p[i]); } return out; }); }} style={{ fontSize: 12, padding: "5px 10px", color: C.red }}>Remove</Btn>
                  <span style={{ color: C.textMid, fontSize: 14, marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
                </div>

                {isOpen && (
                  <div style={{ overflowX: "auto", borderTop: "1px solid " + C.border }}>
                    <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1100 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: C.textMid, textAlign: "left", position: "sticky", left: 0, background: C.cardOff, zIndex: 1 }}>Med</th>
                          {days.map(function(d) {
                            var isToday = isCurrent && d === todayD;
                            return (
                              <th key={d} style={{ padding: "6px 4px", fontSize: 10, fontWeight: isToday ? 800 : 400, color: isToday ? C.navy : C.textMid, textAlign: "center", minWidth: 28, background: isToday ? C.goldLight + "40" : "transparent" }}>
                                {d}
                              </th>
                            );
                          })}
                          <th style={{ padding: "8px 12px", fontSize: 11, color: C.textMid, textAlign: "right" }}>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medTypes.map(function(mt) {
                          var dayCost = mt.id === "peptizole" ? 18 : mt.id === "antepsin" ? 6.25 : 15;
                          var monthlyCost = 0;
                          for (var i = 0; i < days.length; i++) {
                            var v = getMed(horse.id, days[i], mt.id);
                            if (mt.id === "antepsin") { monthlyCost += v ? 6.25 : 0; }
                            else { monthlyCost += v * (mt.id === "peptizole" ? 18 : 15); }
                          }
                          return (
                            <tr key={mt.id}>
                              <td style={{ padding: "6px 12px", fontSize: 12, fontWeight: 700, color: mt.color, position: "sticky", left: 0, background: C.card, zIndex: 1 }}>{mt.label}</td>
                              {days.map(function(d) {
                                var val = getMed(horse.id, d, mt.id);
                                var isToday = isCurrent && d === todayD;
                                return (
                                  <td key={d} onClick={function() { toggleMed(horse.id, d, mt.id); }}
                                    style={{ textAlign: "center", cursor: "pointer", padding: "4px 2px", background: isToday ? C.goldLight + "20" : "transparent" }}>
                                    <div style={{ width: 22, height: 22, margin: "0 auto", borderRadius: 4, background: val ? mt.color : C.cardOff, border: "1px solid " + (val ? mt.color : C.border), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff", fontWeight: 700 }}>
                                      {val > 1 ? val : val ? "✓" : ""}
                                    </div>
                                  </td>
                                );
                              })}
                              <td style={{ padding: "6px 12px", fontSize: 12, fontWeight: 700, color: C.text, textAlign: "right" }}>{"€" + Math.round(monthlyCost)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {showAdd && untrackedHorses.length > 0 && (
            <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: 16, marginTop: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>Add horse to tracker</div>
              {untrackedHorses.map(function(h) {
                return (
                  <div key={h.id} onClick={function() { setTrackedIds(function(p) { return p.concat([h.id]); }); setShowAdd(false); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 6, background: C.cardOff }}>
                    <Silk silk={h.silk} size={28} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{h.name}</span>
                    <span style={{ fontSize: 12, color: C.textMid, marginLeft: "auto" }}>{h.owner}</span>
                  </div>
                );
              })}
              <Btn variant="ghost" onClick={function() { setShowAdd(false); }} style={{ marginTop: 8, width: "100%", justifyContent: "center" }}>Cancel</Btn>
            </div>
          )}
        </div>
      )}

      {showBill && billHorse && (function() {
        var costs = calcCost(billHorse.id);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: C.shadowMd, overflow: "hidden" }}>
              <div style={{ background: C.navy, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Monthly Bill</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{billHorse.name + " — " + monthName}</div>
                </div>
                <button onClick={function() { setShowBill(false); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 7, cursor: "pointer" }}>x</button>
              </div>
              <div style={{ padding: 22 }}>
                {costs.peptizoleDays > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + C.border }}>
                    <span style={{ fontSize: 14, color: C.text }}>{"Peptizole — " + costs.peptizoleDays + " days x €18"}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{"€" + costs.peptizole}</span>
                  </div>
                )}
                {costs.antepsinTicks > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + C.border }}>
                    <span style={{ fontSize: 14, color: C.text }}>{"Antepsin — " + costs.antepsinBottles + " bottles x €25"}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{"€" + costs.antepsin}</span>
                  </div>
                )}
                {costs.antibioticDoses > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid " + C.border }}>
                    <span style={{ fontSize: 14, color: C.text }}>{"Antibiotics — " + costs.antibioticDoses + " doses x €15"}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{"€" + costs.antibiotics}</span>
                  </div>
                )}
                {costs.total === 0 && <div style={{ padding: "20px 0", textAlign: "center", color: C.textMid, fontSize: 13 }}>No medication logged this month</div>}
                {costs.total > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Total</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>{"€" + costs.total}</span>
                  </div>
                )}
                <Btn onClick={function() { window.print(); }} style={{ width: "100%", marginTop: 16, justifyContent: "center" }}>Print for Yardman</Btn>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default MedicationTracker;
