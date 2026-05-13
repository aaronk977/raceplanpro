import React, { useState } from "react";
import { Silk, Btn, C, getDaysInMonth, daysUntil } from "./shared";

var DEFAULT_MED_TYPES = [
  { id: "peptizole", label: "Peptizole", color: C.blue, short: "P", costPerDay: 18, courseDays: 12, withdrawalDays: 4 },
  { id: "antepsin", label: "Antepsin", color: C.purple, short: "A", costPerDay: 6.25, courseDays: 12, withdrawalDays: 1 },
  { id: "antibiotics", label: "Antibiotics", color: C.amber, short: "Ab", costPerDay: 15, courseDays: 5, withdrawalDays: 0 }
];

function MedicationTracker({ horses, medLogs, setMedLogs, trackedIds, setTrackedIds, settings }) {
  var nowInit = new Date();
  var [selMonth, setSelMonth] = useState(nowInit.getMonth());
  var [selYear, setSelYear] = useState(nowInit.getFullYear());
  var [openHorse, setOpenHorse] = useState(null);
  var [showBill, setShowBill] = useState(false);
  var [billHorse, setBillHorse] = useState(null);
  var [medView, setMedView] = useState("tracker");
  var [showMedSettings, setShowMedSettings] = useState(false);

  // Use medications from yard settings if available, otherwise defaults
  var rawMeds = (settings && settings.medications && settings.medications.length > 0)
    ? settings.medications
    : DEFAULT_MED_TYPES;

  // Ensure each med has courseDays and withdrawalDays
  var medTypes = rawMeds.map(function(m) {
    return {
      id: m.id || m.name.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      label: m.name || m.label,
      color: m.color || C.blue,
      short: (m.name || m.label || "M").charAt(0).toUpperCase(),
      costPerDay: parseFloat(m.costPerUnit || m.costPerDay || 0),
      courseDays: parseInt(m.courseDays || 12),
      withdrawalDays: parseInt(m.withdrawalDays || 4)
    };
  });

  var daysInMonth = getDaysInMonth(selYear, selMonth);
  var days = [];
  for (var di = 1; di <= daysInMonth; di++) { days.push(di); }
  var now = new Date();
  var todayD = now.getDate();
  var isCurrent = selMonth === now.getMonth() && selYear === now.getFullYear();
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
      next[k(hId, d, t)] = cur ? 0 : 1;
      return next;
    });
  }

  function getMedToday(hId, t) {
    return getMed(hId, todayD, t);
  }

  function calcCosts(horse) {
    var result = {};
    var total = 0;
    medTypes.forEach(function(mt) {
      var days2 = 0;
      for (var di2 = 1; di2 <= daysInMonth; di2++) {
        if (getMed(horse.id, di2, mt.id)) days2++;
      }
      var cost = days2 * mt.costPerDay;
      result[mt.id] = { days: days2, cost: Math.round(cost * 100) / 100 };
      total += cost;
    });
    result.total = Math.round(total * 100) / 100;
    return result;
  }

  // Calculate what horses should start/finish medication based on race entries
  function calcMedAlerts(horse) {
    var alerts = [];
    var entries = horse.provisionalEntries || [];
    entries.forEach(function(entry) {
      if (!entry.date) return;
      var raceDate = new Date(entry.date + "T12:00:00");
      medTypes.forEach(function(mt) {
        if (!mt.courseDays || !mt.withdrawalDays) return;
        var stopDate = new Date(raceDate);
        stopDate.setDate(stopDate.getDate() - mt.withdrawalDays);
        var startDate = new Date(stopDate);
        startDate.setDate(startDate.getDate() - (mt.courseDays - 1));
        var today = new Date(); today.setHours(0,0,0,0);
        var startD = new Date(startDate); startD.setHours(0,0,0,0);
        var stopD = new Date(stopDate); stopD.setHours(0,0,0,0);
        var daysToStart = Math.round((startD - today) / 86400000);
        var daysToStop = Math.round((stopD - today) / 86400000);
        if (daysToStart >= -1 && daysToStart <= 3) {
          alerts.push({ type: "start", med: mt.label, horse: horse.name, race: entry.raceName || entry.venue, date: entry.date, startDate: startDate.toLocaleDateString("en-IE", { day: "numeric", month: "short" }), stopDate: stopDate.toLocaleDateString("en-IE", { day: "numeric", month: "short" }), daysToStart: daysToStart });
        }
        if (daysToStop >= -1 && daysToStop <= 1) {
          alerts.push({ type: "stop", med: mt.label, horse: horse.name, race: entry.raceName || entry.venue, date: entry.date, stopDate: stopDate.toLocaleDateString("en-IE", { day: "numeric", month: "short" }), daysToStop: daysToStop });
        }
      });
    });
    return alerts;
  }

  var activeHorses = (horses || []).filter(function(h) { return h.status === "Active"; });
  var tracked = trackedIds && trackedIds.length > 0
    ? activeHorses.filter(function(h) { return trackedIds.indexOf(h.id) >= 0; })
    : activeHorses;

  var allAlerts = [];
  activeHorses.forEach(function(h) {
    var ha = calcMedAlerts(h);
    ha.forEach(function(a) { allAlerts.push(a); });
  });

  var todayAlerts = allAlerts.filter(function(a) { return a.daysToStart === 0 || a.daysToStop === 0; });
  var upcomingAlerts = allAlerts.filter(function(a) { return a.daysToStart > 0 || a.daysToStop > 0; });

  function generateMorningNotification() {
    if (allAlerts.length === 0) return "No medication actions today.";
    var parts = ["RacePlan Pro — Daily Medication Alert"];
    if (todayAlerts.length > 0) {
      parts.push("TODAY:");
      todayAlerts.forEach(function(a) {
        if (a.type === "start") parts.push("• START " + a.med + " — " + a.horse + " (racing " + a.date + ")");
        else parts.push("• STOP " + a.med + " — " + a.horse + " (racing " + a.date + ")");
      });
    }
    if (upcomingAlerts.length > 0) {
      parts.push("UPCOMING:");
      upcomingAlerts.slice(0,5).forEach(function(a) {
        if (a.type === "start") parts.push("• Start " + a.med + " in " + a.daysToStart + "d — " + a.horse);
        else parts.push("• Stop " + a.med + " in " + (-a.daysToStop) + "d — " + a.horse);
      });
    }
    parts.push("Entry deadline: 12:00 today");
    return parts.join("\n");
  }

  function sendMorningAlert() {
    var msg = generateMorningNotification();
    var contacts = (settings && settings.notifyContacts) ? settings.notifyContacts.filter(function(c) {
      return c.phone && (c.notifyFor || {}).medication_alerts !== false;
    }) : [];
    if (!contacts.length) { alert("No contacts with medication alerts enabled. Add them in Yard Settings."); return; }
    contacts.forEach(function(c) {
      var phone = c.phone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
      window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank");
    });
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Medication Tracker</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
            {medTypes.map(function(m) { return m.label + " (" + m.courseDays + "d course, " + m.withdrawalDays + "d withdrawal)"; }).join(" · ")}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(todayAlerts.length > 0) && (
            <button onClick={sendMorningAlert}
              style={{ padding: "8px 16px", background: C.red + "15", border: "1px solid " + C.red + "40", borderRadius: 8, color: C.red, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
              {"⚠️ " + todayAlerts.length + " action" + (todayAlerts.length > 1 ? "s" : "") + " today — Send Alert"}
            </button>
          )}
          {["tracker", "alerts", "billing"].map(function(v) {
            return (
              <button key={v} onClick={function() { setMedView(v); }}
                style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + (medView === v ? C.navy : C.border), background: medView === v ? C.navy : C.card, color: medView === v ? "#fff" : C.textMid, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {v === "tracker" ? "Monthly Grid" : v === "alerts" ? "Med Schedule" : "Billing"}
              </button>
            );
          })}
        </div>
      </div>

      {medView === "alerts" && (
        <div>
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Medication Schedule</div>
                <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Based on confirmed entries and provisional targets. Courses are calculated automatically from your medication settings.</div>
              </div>
              <Btn onClick={sendMorningAlert} style={{ fontSize: 12 }}>Send WhatsApp Alert</Btn>
            </div>

            <div style={{ background: C.cardOff, borderRadius: 10, padding: "12px 14px", marginBottom: 12, fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
              <strong style={{ color: C.text }}>How it works:</strong> When a horse is shortlisted or entered, RacePlan Pro calculates when each medication course should start and stop. Based on your configured course length and withdrawal period. A morning WhatsApp alert goes to your selected contacts listing what needs to happen that day.
            </div>

            {allAlerts.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: C.textMid, fontSize: 13 }}>
                No medication actions in the next few days. Add entries or shortlists in the Race Planner to see scheduled courses here.
              </div>
            ) : (
              <div>
                {todayAlerts.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Today</div>
                    {todayAlerts.map(function(a, i) {
                      return (
                        <div key={i} style={{ background: a.type === "start" ? C.green + "10" : C.red + "10", border: "1px solid " + (a.type === "start" ? C.green : C.red) + "30", borderRadius: 9, padding: "10px 14px", marginBottom: 7, display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{a.type === "start" ? "▶️" : "⏹️"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                              {(a.type === "start" ? "START " : "STOP ") + a.med + " — " + a.horse}
                            </div>
                            <div style={{ fontSize: 12, color: C.textMid }}>{"Racing: " + a.race + " on " + a.date}</div>
                            {a.type === "start" && <div style={{ fontSize: 11, color: C.textMid }}>{"Course: " + a.startDate + " → " + a.stopDate}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {upcomingAlerts.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Upcoming</div>
                    {upcomingAlerts.map(function(a, i) {
                      return (
                        <div key={i} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, padding: "10px 14px", marginBottom: 7, display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 16, color: C.textMid }}>{a.type === "start" ? "▶" : "⏹"}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
                              {(a.type === "start" ? "Start " : "Stop ") + a.med + " — " + a.horse}
                              <span style={{ fontSize: 12, color: C.textMid, fontWeight: 400, marginLeft: 6 }}>
                                {"in " + (a.daysToStart || -a.daysToStop) + " day" + ((a.daysToStart || -a.daysToStop) !== 1 ? "s" : "")}
                              </span>
                            </div>
                            <div style={{ fontSize: 11, color: C.textMid }}>{"Racing: " + a.race + " on " + a.date}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10 }}>Your Medication Courses</div>
            <div style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>Edit course lengths and withdrawal periods in Yard Settings → Medications tab. Changes apply immediately to all future calculations.</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {medTypes.map(function(mt) {
                return (
                  <div key={mt.id} style={{ background: mt.color + "10", border: "1px solid " + mt.color + "30", borderRadius: 10, padding: "10px 14px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: mt.color }}>{mt.label}</div>
                    <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>{mt.courseDays + " day course"}</div>
                    <div style={{ fontSize: 11, color: C.textMid }}>{mt.withdrawalDays + " day withdrawal"}</div>
                    <div style={{ fontSize: 11, color: C.textMid }}>{"€" + mt.costPerDay + "/day"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {medView === "tracker" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={function() { var d = new Date(selYear, selMonth - 1, 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }} style={{ fontSize: 13, padding: "6px 12px" }}>{"<"}</Btn>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: "34px" }}>{monthName}</span>
              <Btn variant="ghost" onClick={function() { var d = new Date(selYear, selMonth + 1, 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }} style={{ fontSize: 13, padding: "6px 12px" }}>{">"}</Btn>
            </div>
          </div>

          {tracked.map(function(horse) {
            var isOpen = openHorse === horse.id;
            var hasMedToday = medTypes.some(function(mt) { return isCurrent && getMedToday(horse.id, mt.id); });
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + (hasMedToday ? C.green : C.border), borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
                <div onClick={function() { setOpenHorse(isOpen ? null : horse.id); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}>
                  <Silk silk={horse.silk} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{horse.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 3 }}>
                      {medTypes.map(function(mt) {
                        var onToday = isCurrent && getMedToday(horse.id, mt.id);
                        return onToday ? (
                          <span key={mt.id} style={{ fontSize: 11, padding: "1px 8px", borderRadius: 20, background: mt.color + "15", color: mt.color, fontWeight: 700 }}>{mt.label}</span>
                        ) : null;
                      })}
                      {!hasMedToday && <span style={{ fontSize: 11, color: C.textDim }}>No medication today</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {isCurrent && medTypes.map(function(mt) {
                      var val = getMedToday(horse.id, mt.id);
                      return (
                        <button key={mt.id} onClick={function(e) { e.stopPropagation(); toggleMed(horse.id, todayD, mt.id); }}
                          style={{ width: 32, height: 32, borderRadius: 8, border: "2px solid " + (val ? mt.color : C.border), background: val ? mt.color : "transparent", color: val ? "#fff" : C.textMid, fontWeight: 800, fontSize: 11, cursor: "pointer" }}>
                          {mt.short}
                        </button>
                      );
                    })}
                    <span style={{ fontSize: 14, color: C.textDim, lineHeight: "32px", marginLeft: 4 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: "1px solid " + C.border, overflowX: "auto", padding: "12px 16px" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 600 }}>
                      <thead>
                        <tr>
                          <th style={{ fontSize: 11, color: C.textMid, textAlign: "left", padding: "4px 8px", fontWeight: 700 }}>Med</th>
                          {days.map(function(d) {
                            var isToday = isCurrent && d === todayD;
                            return <th key={d} style={{ fontSize: 10, color: isToday ? C.gold : C.textDim, padding: "4px 3px", fontWeight: isToday ? 900 : 600, minWidth: 22 }}>{d}</th>;
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {medTypes.map(function(mt) {
                          return (
                            <tr key={mt.id}>
                              <td style={{ fontSize: 11, fontWeight: 700, color: mt.color, padding: "4px 8px", whiteSpace: "nowrap" }}>{mt.label}</td>
                              {days.map(function(d) {
                                var val = getMed(horse.id, d, mt.id);
                                var isToday = isCurrent && d === todayD;
                                return (
                                  <td key={d} onClick={function() { toggleMed(horse.id, d, mt.id); }}
                                    style={{ padding: "3px", textAlign: "center", cursor: "pointer" }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 5, margin: "0 auto", background: val ? mt.color : isToday ? C.gold + "20" : C.cardOff, border: "1.5px solid " + (val ? mt.color : isToday ? C.gold : C.border), display: "flex", alignItems: "center", justifyContent: "center" }}>
                                      {val ? <span style={{ fontSize: 9, color: "#fff", fontWeight: 900 }}>✓</span> : null}
                                    </div>
                                  </td>
                                );
                              })}
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
        </div>
      )}

      {medView === "billing" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{"Monthly Medication Report — " + monthName}</div>
              <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>Based on ticks in the grid and your configured medication prices. Send to owners or print for records.</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn variant="ghost" onClick={function() { window.print(); }} style={{ fontSize: 12 }}>🖨 Print Report</Btn>
              <Btn onClick={function() {
                var lines2 = ["MEDICATION REPORT — " + monthName.toUpperCase()];
                lines2.push("Generated: " + new Date().toLocaleDateString("en-IE"));
                lines2.push("---");
                var grandTotal = 0;
                tracked.forEach(function(horse) {
                  var costs = calcCosts(horse);
                  if (costs.total === 0) return;
                  grandTotal += costs.total;
                  lines2.push(horse.name + " (" + (horse.owner||"") + ")");
                  medTypes.forEach(function(mt) {
                    var c = costs[mt.id];
                    if (!c || c.days === 0) return;
                    lines2.push("  " + mt.label + ": " + c.days + " days x €" + mt.costPerDay + " = €" + c.cost);
                  });
                  lines2.push("  TOTAL: €" + costs.total);
                  lines2.push("---");
                });
                lines2.push("GRAND TOTAL: €" + Math.round(grandTotal * 100) / 100);
                var text = lines2.join("
");
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(text);
                  alert("Report copied to clipboard — paste into WhatsApp or email");
                }
              }} style={{ fontSize: 12 }}>📋 Copy Report</Btn>
            </div>
          </div>

          {(function() {
            var horsesWithCosts = tracked.filter(function(h) { return calcCosts(h).total > 0; });
            var grandTotal = horsesWithCosts.reduce(function(sum, h) { return sum + calcCosts(h).total; }, 0);
            if (horsesWithCosts.length === 0) return (
              <div style={{ padding: 32, textAlign: "center", color: C.textMid, fontSize: 13 }}>No medication costs recorded for {monthName}</div>
            );
            return (
              <div>
                <div id="med-report-print">
                  <div style={{ background: C.navy, borderRadius: 12, padding: "16px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{"Medication Report — " + monthName}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{horsesWithCosts.length + " horses · " + horsesWithCosts.reduce(function(s,h) { var c=calcCosts(h); return s + medTypes.reduce(function(s2,mt) { return s2+(c[mt.id]?c[mt.id].days:0); },0); }, 0) + " treatment days"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: C.gold }}>{"€" + Math.round(grandTotal * 100) / 100}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Grand Total</div>
                    </div>
                  </div>

                  {horsesWithCosts.map(function(horse) {
                    var costs = calcCosts(horse);
                    return (
                      <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                          <Silk silk={horse.silk} size={28} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                            <div style={{ fontSize: 12, color: C.textMid }}>{horse.owner || "No owner"}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: C.navy }}>{"€" + costs.total}</div>
                            <div style={{ fontSize: 11, color: C.textMid }}>this month</div>
                          </div>
                        </div>
                        <div style={{ background: C.cardOff, borderRadius: 8, overflow: "hidden" }}>
                          {medTypes.map(function(mt) {
                            var c = costs[mt.id];
                            if (!c || c.days === 0) return null;
                            var pct = Math.round((c.days / daysInMonth) * 100);
                            return (
                              <div key={mt.id} style={{ padding: "8px 12px", borderBottom: "1px solid " + C.border }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: mt.color }} />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{mt.label}</span>
                                    <span style={{ fontSize: 11, color: C.textMid }}>{c.days + " days @ €" + mt.costPerDay + "/day"}</span>
                                  </div>
                                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{"€" + c.cost}</span>
                                </div>
                                <div style={{ background: C.border, borderRadius: 4, height: 4, overflow: "hidden" }}>
                                  <div style={{ background: mt.color, height: "100%", width: pct + "%" }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {horse.ownerPhone && (
                          <button onClick={function() {
                            var c2 = calcCosts(horse);
                            var msgLines = ["Medication costs for " + horse.name + " — " + monthName + ":"];
                            medTypes.forEach(function(mt) {
                              var c3 = c2[mt.id];
                              if (!c3 || c3.days === 0) return;
                              msgLines.push(mt.label + ": " + c3.days + " days = €" + c3.cost);
                            });
                            msgLines.push("Total: €" + c2.total);
                            var phone = horse.ownerPhone.split("").filter(function(d) { return (d>="0"&&d<="9")||d==="+"; }).join("");
                            window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msgLines.join("
")), "_blank");
                          }} style={{ width: "100%", marginTop: 10, padding: "8px", background: "#25D366", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {"📱 Send to " + (horse.owner || "Owner") + " via WhatsApp"}
                          </button>
                        )}
                      </div>
                    );
                  })}

                  <div style={{ background: C.navy, borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>Grand Total — {monthName}</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: C.gold }}>{"€" + Math.round(grandTotal * 100) / 100}</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default MedicationTracker;
