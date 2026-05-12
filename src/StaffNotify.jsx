import React, { useState, useEffect } from "react";
import { Btn, C, TODAY } from "./shared";

function StaffNotify({ user, supabase, settings }) {
  var todayStr = TODAY.toISOString().slice(0, 10);

  var notifState = useState([]);
  var notifications = notifState[0]; var setNotifications = notifState[1];
  var showFormState = useState(false);
  var showForm = showFormState[0]; var setShowForm = showFormState[1];

  var nameState = useState("");
  var staffName = nameState[0]; var setStaffName = nameState[1];
  var returnTimeState = useState("00:30");
  var returnTime = returnTimeState[0]; var setReturnTime = returnTimeState[1];
  var shiftTimeState = useState("07:00");
  var shiftTime = shiftTimeState[0]; var setShiftTime = shiftTimeState[1];
  var reasonState = useState("racing");
  var reason = reasonState[0]; var setReason = reasonState[1];
  var notesState = useState("");
  var notes = notesState[0]; var setNotes = notesState[1];
  var statusState = useState("idle");
  var status = statusState[0]; var setStatus = statusState[1];

  var REASONS = [
    { id: "racing", label: "Racing trip", icon: "🏇" },
    { id: "transport", label: "Horse transport", icon: "🚛" },
    { id: "overnight", label: "Overnight duty", icon: "🌙" },
    { id: "other", label: "Other late duty", icon: "🕐" },
  ];

  function calcHoursRest(ret, shift) {
    var rParts = ret.split(":"); var sParts = shift.split(":");
    var retMins = parseInt(rParts[0]) * 60 + parseInt(rParts[1]);
    var shiftMins = parseInt(sParts[0]) * 60 + parseInt(sParts[1]);
    // If return is after midnight (e.g. 00:30 = 30 mins), add 24h worth of mins
    if (retMins < 600) retMins += 1440; // treat as next day
    var hoursRest = (shiftMins + 1440 - retMins) / 60;
    if (hoursRest > 24) hoursRest -= 24;
    return Math.round(hoursRest * 10) / 10;
  }

  function getRestColour(hours) {
    if (hours < 6) return C.red;
    if (hours < 8) return C.amber;
    return C.green;
  }

  function submitNotification() {
    if (!staffName.trim()) return;
    var hours = calcHoursRest(returnTime, shiftTime);
    var reasonLabel = REASONS.find(function(r) { return r.id === reason; });
    var notif = {
      id: "n_" + Date.now(),
      staffName: staffName.trim(),
      returnTime: returnTime,
      shiftTime: shiftTime,
      reason: reason,
      notes: notes.trim(),
      hoursRest: hours,
      date: todayStr,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };
    setNotifications(function(prev) { return [notif].concat(prev); });

    // Send WhatsApp to notification contacts
    var contacts = (settings && settings.notifyContacts) ? settings.notifyContacts : [];
    var yardName = (settings && settings.yardName) ? settings.yardName : "the yard";
    var msgParts = ["RacePlan Pro Staff Late Return Alert"];
    msgParts.push("Staff: " + staffName.trim());
    msgParts.push("Reason: " + (reasonLabel ? reasonLabel.label : reason));
    msgParts.push("Expected return: " + returnTime);
    msgParts.push("Next shift: " + shiftTime);
    msgParts.push("Rest time: " + hours + " hours");
    if (notes.trim()) msgParts.push("Note: " + notes.trim());
    if (hours < 6) msgParts.push("ACTION NEEDED: Less than 6 hours rest - consider adjusting shift.");
    else if (hours < 8) msgParts.push("Note: Less than 8 hours rest.");
    var msg = msgParts.join("\n");
    var contacted = 0;
    for (var i = 0; i < contacts.length; i++) {
      var contact = contacts[i];
      var nf = contact.notifyFor || {};
      if (nf.late_returns !== false && contact.phone) {
        var phone = contact.phone.split("").filter(function(d) { return d >= "0" && d <= "9" || d === "+"; }).join("");
        if (phone.length > 7) {
          window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msg), "_blank");
          contacted++;
        }
      }
    }

    setStatus(contacted > 0 ? "sent" : "submitted");
    setShowForm(false);
    setStaffName(""); setNotes(""); setReturnTime("00:30"); setShiftTime("07:00");
    setTimeout(function() { setStatus("idle"); }, 6000);
  }

  function updateStatus(id, newStatus) {
    setNotifications(function(prev) {
      return prev.map(function(n) {
        if (n.id !== id) return n;
        return Object.assign({}, n, { status: newStatus });
      });
    });
  }

  var pending = notifications.filter(function(n) { return n.status === "pending"; });
  var resolved = notifications.filter(function(n) { return n.status !== "pending"; });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Staff Hours</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Late returns — notify trainer of reduced rest before next shift</div>
        </div>
        <Btn onClick={function() { setShowForm(true); }}>+ Log Late Return</Btn>
      </div>

      {(status === "submitted" || status === "sent") && (
        <div style={{ background: C.green + "15", border: "1px solid " + C.green + "40", borderRadius: 10, padding: "12px 16px", marginBottom: 12, fontSize: 13, fontWeight: 700, color: C.green }}>
          {status === "sent" ? "WhatsApp notification sent to contacts" : "Notification logged — no WhatsApp contacts configured in Yard Settings"}
        </div>
      )}

      {showForm && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>Log Late Return</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Your Name</div>
              <input type="text" value={staffName} onChange={function(e) { setStaffName(e.target.value); }}
                placeholder="e.g. Sean Murphy"
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 14, color: C.text }} />
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Expected Return Time</div>
              <input type="time" value={returnTime} onChange={function(e) { setReturnTime(e.target.value); }}
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 14, color: C.text }} />
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Next Shift Start</div>
              <input type="time" value={shiftTime} onChange={function(e) { setShiftTime(e.target.value); }}
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 14, color: C.text }} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Reason</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {REASONS.map(function(r) {
                return (
                  <button key={r.id} onClick={function() { setReason(r.id); }}
                    style={{ padding: "10px 14px", borderRadius: 9, border: "2px solid " + (reason === r.id ? C.navy : C.border),
                      background: reason === r.id ? C.navy : C.cardOff, color: reason === r.id ? "#fff" : C.text,
                      fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{r.icon}</span><span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(function() {
            var hrs = calcHoursRest(returnTime, shiftTime);
            var col = getRestColour(hrs);
            return (
              <div style={{ background: col + "12", border: "1px solid " + col + "30", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: col, lineHeight: 1 }}>{hrs + "h"}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: col }}>
                    {hrs < 6 ? "Critical — very little rest before shift" : hrs < 8 ? "Short rest — consider adjusting start time" : "Adequate rest time"}
                  </div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>{"Return " + returnTime + " → Shift " + shiftTime}</div>
                </div>
              </div>
            );
          })()}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Additional Notes (optional)</div>
            <input type="text" value={notes} onChange={function(e) { setNotes(e.target.value); }}
              placeholder="e.g. Horse boxed in Limerick, long drive home"
              style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 13, color: C.text }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={submitNotification} disabled={!staffName.trim()}>Submit Notification</Btn>
            <Btn variant="ghost" onClick={function() { setShowForm(false); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {pending.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Awaiting Trainer Response</div>
          {pending.map(function(n) {
            var col = getRestColour(n.hoursRest);
            var reasonLabel = REASONS.find(function(r) { return r.id === n.reason; });
            return (
              <div key={n.id} style={{ background: C.card, border: "2px solid " + col + "40", borderRadius: 12, padding: "16px 18px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{n.staffName}</span>
                      <span style={{ fontSize: 12, padding: "2px 10px", borderRadius: 20, background: col + "15", color: col, fontWeight: 700 }}>
                        {n.hoursRest + "h rest"}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: C.textMid }}>
                      {(reasonLabel ? reasonLabel.icon + " " + reasonLabel.label : n.reason) + " — Returns " + n.returnTime + " · Shift " + n.shiftTime}
                    </div>
                    {n.notes && <div style={{ fontSize: 12, color: C.textMid, marginTop: 4, fontStyle: "italic" }}>{n.notes}</div>}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, whiteSpace: "nowrap", marginLeft: 12 }}>
                    {new Date(n.submittedAt).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {n.hoursRest < 8 && (
                  <div style={{ background: col + "10", borderRadius: 8, padding: "10px 12px", marginBottom: 10, fontSize: 12, color: col, fontWeight: 600 }}>
                    {n.hoursRest < 6
                      ? "⚠️ Consider pushing start time back or assigning lighter duties"
                      : "💡 May need to adjust first lot or reduce workload"}
                  </div>
                )}

                <div style={{ display: "flex", gap: 8 }}>
                  <Btn variant="green" onClick={function() { updateStatus(n.id, "acknowledged"); }} style={{ fontSize: 12, padding: "7px 14px", justifyContent: "center" }}>
                    Acknowledge
                  </Btn>
                  <Btn onClick={function() { updateStatus(n.id, "adjusted"); }} style={{ fontSize: 12, padding: "7px 14px", justifyContent: "center", background: C.amber, color: "#fff" }}>
                    Adjust Shift
                  </Btn>
                  <Btn variant="ghost" onClick={function() { updateStatus(n.id, "declined"); }} style={{ fontSize: 12, padding: "7px 14px", color: C.red }}>
                    Normal Shift
                  </Btn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Resolved</div>
          {resolved.slice(0, 10).map(function(n) {
            var statusColour = n.status === "acknowledged" ? C.green : n.status === "adjusted" ? C.amber : C.textMid;
            var statusLabel = n.status === "acknowledged" ? "Acknowledged" : n.status === "adjusted" ? "Shift Adjusted" : "Normal Shift";
            return (
              <div key={n.id} style={{ background: C.cardOff, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{n.staffName}</span>
                  <span style={{ fontSize: 12, color: C.textMid, marginLeft: 8 }}>{n.returnTime + " return · " + n.hoursRest + "h rest"}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: statusColour, padding: "2px 10px", borderRadius: 20, background: statusColour + "15" }}>
                  {statusLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {notifications.length === 0 && !showForm && (
        <div style={{ padding: 48, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌙</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>No late return notifications</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Staff returning late from racing or transport can log their expected return time and next shift here</div>
          <Btn onClick={function() { setShowForm(true); }}>Log Late Return</Btn>
        </div>
      )}
    </div>
  );
}

export default StaffNotify;
