import React, { useState } from "react";
import { Silk, Btn, C, TODAY, getDaysInMonth } from "./shared";

function MedicationTracker({ horses, medLogs, setMedLogs, trackedIds, setTrackedIds }) {
  const [selMonth, setSelMonth] = useState(TODAY.getMonth());
  const [selYear, setSelYear] = useState(TODAY.getFullYear());
  const [openHorse, setOpenHorse] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [billHorse, setBillHorse] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const daysInMonth = getDaysInMonth(selYear, selMonth);
  const days = Array.from({ length: daysInMonth }, function(_,i){return i+1;});
  const todayD = TODAY.getDate();
  const isCurrent = selMonth === TODAY.getMonth() && selYear === TODAY.getFullYear();
  const monthName = new Date(selYear, selMonth).toLocaleString("en-IE", { month: "long", year: "numeric" });

  const k = function(hId,d,t){var mm=String(selMonth+1).padStart(2,"0");var dd=String(d).padStart(2,"0");return hId+"_"+selYear+"-"+mm+"-"+dd+"_"+t;};
  const getMed = function(hId,d,t){return medLogs[k(hId,d,t)]||0;};
  const toggleMed = function(hId,d,t){
    setMedLogs(function(prev){return ( {
      const cur = prev[k(hId, d, t)] || 0;
      if (t === "antibiotics") return { ...prev, [k(hId, d, t)]: cur === 0 ? 1 : cur === 1 ? 2 : 0 };
      return { ...prev, [k(hId, d, t)]: cur ? 0 : 1 };
    });
  };

  const calcCost = (hId) => {
    const peptizoleDays = days.filter(d => getMed(hId, d, "peptizole")).length;
    const antepsinTicks = days.filter(d => getMed(hId, d, "antepsin")).length;
    const antibioticDoses = days.reduce((s, d) => s + getMed(hId, d, "antibiotics"), 0);
    const peptizole = peptizoleDays * 18;
    const antepsin = calcAntepsinCost(antepsinTicks);
    const antibiotics = antibioticDoses * 15;
    return { peptizoleDays, antepsinTicks, antepsinBottles: Math.ceil(antepsinTicks * 0.25), antibioticDoses, peptizole, antepsin, antibiotics, total: peptizole + antepsin + antibiotics };
  };

  const [medView, setMedView] = useState("tracker");
  const trackedHorses = horses.filter(function(h){return trackedIds.includes;}(h.id));
  const untrackedHorses = horses.filter(function(h){return h.status;} !== "Inactive" && !trackedIds.includes(h.id));

  const todayMedKey = function(hId, t) {
    const mm = String(TODAY.getMonth() + 1).padStart(2, "0");
    const dd = String(TODAY.getDate()).padStart(2, "0");
    return hId + "_" + TODAY.getFullYear() + "-" + mm + "-" + dd + "_" + t;
  };
  const getMedToday = function(hId, t) { return medLogs[todayMedKey(hId, t)] || 0; };
  const toggleMedToday = function(hId, t) {
    setMedLogs(function(prev) {
      const cur = prev[todayMedKey(hId, t)] || 0;
      if (t === "antibiotics") return Object.assign({}, prev, { [todayMedKey(hId, t)]: cur === 0 ? 1 : cur === 1 ? 2 : 0 });
      return Object.assign({}, prev, { [todayMedKey(hId, t)]: cur ? 0 : 1 });
    });
  };

  return (
    <div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Medication Tracker</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Tap each day to log · costs auto-calculated for Yardman</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {medView === "tracker" && (
            <React.Fragment>
              <Btn variant="ghost" onClick={function() { var d = new Date(selYear, selMonth - 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }}>{"<"}</Btn>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.text, minWidth: 150, textAlign: "center" }}>{monthName}</span>
              <Btn variant="ghost" onClick={function() { var d = new Date(selYear, selMonth + 1); setSelMonth(d.getMonth()); setSelYear(d.getFullYear()); }}>{">"}</Btn>
              <Btn onClick={function() { setShowAdd(true); }} disabled={untrackedHorses.length === 0}>+ Add Horse</Btn>
            </React.Fragment>
          )}
          <Btn variant={medView === "daily" ? "primary" : "ghost"} onClick={function() { setMedView(medView === "daily" ? "tracker" : "daily"); }}>
            {medView === "daily" ? "Monthly View" : "Today's Summary"}
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
              <div style={{ color: C.textMid, fontSize: 13, padding: "20px 0" }}>No horses on tracker. Use Monthly View to add horses.</div>
            )}
            {trackedHorses.map(function(horse) {
              const pep = getMedToday(horse.id, "peptizole");
              const ant = getMedToday(horse.id, "antepsin");
              const ab = getMedToday(horse.id, "antibiotics");
              const anyGiven = pep || ant || ab;
              return (
                <div key={horse.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid " + C.border }}>
                  <Silk silk={horse.silk} size={32} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 6 }}>{horse.name}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[["peptizole", "Peptizole", C.blue], ["antepsin", "Antepsin", C.purple], ["antibiotics", "Antibiotics", C.amber]].map(function(arr) {
                        var t = arr[0]; var label = arr[1]; var col = arr[2];
                        var val = getMedToday(horse.id, t);
                        return (
                          <button key={t} onClick={function() { toggleMedToday(horse.id, t); }}
                            style={{ padding: "6px 14px", borderRadius: 8, border: "2px solid " + col,
                              background: val ? col : "transparent", color: val ? "#fff" : col,
                              fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                            {val > 1 ? label + " x" + val : label}{val ? " ✓" : ""}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: anyGiven ? C.green : C.textMid }}>
                    {anyGiven ? "Logged" : "None today"}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 16px", fontSize: 12, color: C.textMid }}>
            Tap each medication to toggle for today. Changes save automatically.
          </div>
        </div>
      )}

      {medView === "tracker" && (
        <div>

      
      {horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d >= 12 && d <= 16; }).map(h => (
        <div key={h.id} style={{ background: C.amberBg, border: `1px solid ${C.amber}40`, borderLeft: `3px solid ${C.amber}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <Silk silk={h.silk} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.name} — race in {daysUntil(h.nextRaceDate)} days</div>
            <div style={{ fontSize: 12, color: C.amber, fontWeight: 600 }}>🏥 Start Peptizole & Antepsin course now (12 days each · Peptizole stop 4 days before · Antepsin stop 1 day before)</div>
          </div>
        </div>
      ))}
      {horses.filter(h => { const d = daysUntil(h.nextRaceDate); return d && d > 0 && d < 12; }).map(h => (
        <div key={h.id} style={{ background: C.redBg, border: `1px solid ${C.red}30`, borderLeft: `3px solid ${C.red}`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
          <Silk silk={h.silk} size={30} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{h.name} — race in {daysUntil(h.nextRaceDate)} days</div>
            <div style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>⚠️ Too close to start a full course — check withdrawal periods before administering</div>
          </div>
        </div>
      ))}

      
      {showAdd && (
        <div style={{ background: C.card, border: "1px solid "+C.border, borderRadius: 12, padding: "16px 18px", marginBottom: 16, boxShadow: C.shadow }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Add horse to {monthName} tracker:</div>
          {untrackedHorses.map(h => (
            <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.cardOff, borderRadius: 10, border: "1px solid "+C.border, marginBottom: 8 }}>
              <Silk silk={h.silk} size={30} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{h.name}</div>
                <div style={{ fontSize: 11, color: C.textMid }}>{h.owner} · {h.status}{h.nextRaceDate ? ` · Next race: ${new Date(h.nextRaceDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}` : ""}</div>
              </div>
              <Btn variant="green" onClick={function(){ setTrackedIds(function(p) { return [...p, h.id]; }); }} style={{ padding: "6px 14px", fontSize: 12 }}>+ Add</Btn>
            </div>
          ))}
          <Btn variant="ghost" onClick={function(){setShowAdd(false);}} style={{ marginTop: 8, fontSize: 12, padding: "6px 14px" }}>Close</Btn>
        </div>
      )}

      {trackedHorses.length === 0 && (
        <div style={{ padding: 48, textAlign: "center", border: `1.5px dashed ${C.border}`, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏥</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No horses on the tracker</div>
          <div style={{ fontSize: 13, marginBottom: 16 }}>Tap <strong>+ Add Horse</strong> to start logging medication for this month</div>
        </div>
      )}

      
      {trackedHorses.map(horse => {
        const isOpen = openHorse === horse.id;
        const costs = calcCost(horse.id);
        return (
          <div key={horse.id} style={{ background: C.card, border: "1px solid "+C.border, borderRadius: 12, marginBottom: 12, overflow: "hidden", boxShadow: C.shadow }}>
            <div onClick={function(){return setOpenHorse(isOpen ? null : horse.id;})} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}>
              <Silk silk={horse.silk} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 3 }}>{horse.name}</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {costs.peptizoleDays > 0 && <Tag color={C.blue}>{costs.peptizoleDays} days Peptizole · €{costs.peptizole}</Tag>}
                  {costs.antepsinTicks > 0 && <Tag color={C.purple}>{costs.antepsinTicks} days Antepsin · {costs.antepsinBottles} bottle{costs.antepsinBottles !== 1 ? "s" : ""} · €{costs.antepsin}</Tag>}
                  {costs.antibioticDoses > 0 && <Tag color={C.amber}>{costs.antibioticDoses} dose{costs.antibioticDoses !== 1 ? "s" : ""} Antibiotics · €{costs.antibiotics}</Tag>}
                  {costs.total > 0 && <Tag color={C.gold}>Total: €{costs.total}</Tag>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Btn onClick={(e) => { e.stopPropagation(); setBillHorse(horse); setShowBill(true); }} style={{ padding: "5px 12px", fontSize: 11 }}>📋 Bill</Btn>
                <Btn variant="red" onClick={(e) => { e.stopPropagation(); setTrackedIds(function(p){return p.filter;}(id => id !== horse.id)); }} style={{ padding: "5px 10px", fontSize: 11 }}>✕</Btn>
                <span style={{ color: C.textMid, fontSize: 14 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {isOpen && (
              <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
                
                <div style={{ display: "flex", gap: 16, padding: "10px 0", marginBottom: 8, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.blue }}>Peptizole</strong> — €18/day</div>
                  <div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.purple }}>Antepsin</strong> — €25/bottle (1 bottle per 4 days, rounds up)</div>
                  <div style={{ fontSize: 11, color: C.textMid }}><strong style={{ color: C.amber }}>Antibiotics</strong> — €15/dose (tap once=1 dose, twice=2 doses)</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1100 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "6px 8px", fontSize: 11, fontWeight: 700, color: C.textMid, width: 110 }}>Treatment</th>
                        {days.map(d => (
                          <th key={d} style={{ padding: "3px 2px", fontSize: 10, fontWeight: 700, color: isCurrent && d === todayD ? C.navy : C.textDim, textAlign: "center", minWidth: 26, background: isCurrent && d === todayD ? C.goldBg : "none", borderRadius: 4 }}>{d}</th>
                        ))}
                        <th style={{ padding: "6px 8px", fontSize: 11, fontWeight: 700, color: C.textMid, textAlign: "right", minWidth: 80 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[["peptizole", C.blue], ["antepsin", C.purple], ["antibiotics", C.amber]].map(([type, col]) => (
                        <tr key={type}>
                          <td style={{ padding: "5px 8px" }}>
                            <span style={{ background: `${col}12`, color: col, borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 600 }}>{MED_TYPES[type].label}</span>
                          </td>
                          {days.map(d => {
                            const val = getMed(horse.id, d, type);
                            const isFuture = isCurrent && d > todayD;
                            return (
                              <td key={d} style={{ padding: "2px 2px", textAlign: "center" }}>
                                <button onClick={function(){return !isFuture && toggleMed(horse.id;}, d, type)} disabled={isFuture} style={{ width: 22, height: 22, borderRadius: 4, background: val > 0 ? col : "#f0f4f8", border: `1px solid ${val > 0 ? col : C.border}`, color: val > 0 ? "#fff" : C.textDim, fontSize: 10, fontWeight: 700, cursor: isFuture ? "default" : "pointer", opacity: isFuture ? 0.25 : 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                                  {val > 0 ? val : ""}
                                </button>
                              </td>
                            );
                          })}
                          <td style={{ padding: "5px 8px", textAlign: "right", fontSize: 13, fontWeight: 700, color: C.text }}>
                            {type === "peptizole" && `€${costs.peptizole}`}
                            {type === "antepsin" && `${costs.antepsinBottles} bot · €${costs.antepsin}`}
                            {type === "antibiotics" && `€${costs.antibiotics}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {horse.nextRaceDate && (
                  <div style={{ marginTop: 10, padding: "10px 12px", background: C.cardOff, borderRadius: 8, border: "1px solid "+C.border, display: "flex", gap: 20, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>⏱ Withdrawal for {new Date(horse.nextRaceDate).toLocaleDateString("en-IE", { day: "numeric", month: "short" })}:</div>
                    {[{ label: "Stop Peptizole", wd: 4 }, { label: "Stop Antepsin", wd: 1 }].map(({ label, wd }) => {
                      const stop = new Date(horse.nextRaceDate); stop.setDate(stop.getDate() - wd);
                      return <div key={label} style={{ fontSize: 12, color: C.textMid }}><span style={{ fontWeight: 600, color: C.red }}>{label}:</span> {stop.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      
      {showBill && billHorse && (function() {}
        const costs = calcCost(billHorse.id);
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.6)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(4px)" }}>
            <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: C.shadowMd, overflow: "hidden" }}>
              <div style={{ background: C.navy, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div><div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Monthly Medication Bill</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{billHorse.name} · {monthName}</div></div>
                <button onClick={function(){return setShowBill(false;})} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 30, height: 30, borderRadius: 7, cursor: "pointer", fontSize: 15 }}>✕</button>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>For Yardman — {billHorse.owner}</div>
                {[
                  costs.peptizoleDays > 0 && { label: "Peptizole — " + costs.peptizoleDays + " days × €18", amount: costs.peptizole },
                  costs.antepsinTicks > 0 && { label: "Antepsin — " + costs.antepsinBottles + " bottle" + (costs.antepsinBottles !== 1 ? "s" : "") + " × €25 (" + costs.antepsinTicks + " days)", amount: costs.antepsin },
                  costs.antibioticDoses > 0 && { label: "Antibiotics — " + costs.antibioticDoses + " dose" + (costs.antibioticDoses !== 1 ? "s" : "") + " × €15", amount: costs.antibiotics },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 14, color: C.text }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>€{item.amount}</span>
                  </div>
                ))}
                {costs.total === 0 && <div style={{ padding: "20px 0", textAlign: "center", color: C.textMid, fontSize: 13 }}>No medication logged this month</div>}
                {costs.total > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0 0" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Total</span>
                    <span style={{ fontSize: 22, fontWeight: 800, color: C.gold }}>€{costs.total}</span>
                  </div>
                )}
                <Btn onClick={function(){window.print();}} style={{ width: "100%", marginTop: 16, justifyContent: "center" }}>Print / Save for Yardman</Btn>
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

// ─── PROVISIONAL ENTRIES ──────────────────────────────────────────────────────

export default MedicationTracker;
