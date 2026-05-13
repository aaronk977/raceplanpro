import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

function Reminders({ reminders, setReminders, settings, user }) {
  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];
  var newReminderState = useState({ text: "", date: "", time: "09:00", sendWhatsApp: true, phone: "", horseId: "" });
  var newReminder = newReminderState[0]; var setNewReminder = newReminderState[1];
  var filterState = useState("upcoming");
  var filter = filterState[0]; var setFilter = filterState[1];

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 4000);
  }

  // Check for due reminders on load and every minute
  useEffect(function() {
    checkDueReminders();
    var interval = setInterval(checkDueReminders, 60000);
    return function() { clearInterval(interval); };
  }, [reminders]);

  function checkDueReminders() {
    var now2 = new Date();
    var todayStr2 = now2.toISOString().slice(0, 10);
    var nowHour = now2.getHours();
    var nowMin = now2.getMinutes();
    var due = (reminders || []).filter(function(r) {
      if (r.fired || r.dismissed) return false;
      if (r.date !== todayStr2) return false;
      var timeParts = (r.time || "09:00").split(":");
      var rHour = parseInt(timeParts[0]); var rMin = parseInt(timeParts[1]);
      // Fire within 5 minute window
      var rTotalMins = rHour * 60 + rMin;
      var nowTotalMins = nowHour * 60 + nowMin;
      return nowTotalMins >= rTotalMins && nowTotalMins <= rTotalMins + 5;
    });
    due.forEach(function(r) { fireReminder(r); });
  }

  function fireReminder(reminder) {
    // Mark as fired
    setReminders(function(prev) {
      return prev.map(function(r) {
        if (r.id !== reminder.id) return r;
        return Object.assign({}, r, { fired: true, firedAt: new Date().toISOString() });
      });
    });
    // Send WhatsApp if enabled and phone available
    if (reminder.sendWhatsApp) {
      var contacts = (settings && settings.notifyContacts) ? settings.notifyContacts : [];
      var trainerContact = contacts.find(function(c) { return c.role === "Trainer" && c.phone; });
      var phone = reminder.phone || (trainerContact ? trainerContact.phone : "");
      if (phone) {
        var cleanPhone = phone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
        var msgParts = ["RacePlan Pro Reminder"];
        msgParts.push(reminder.text);
        if (reminder.horseName) msgParts.push("Re: " + reminder.horseName);
        window.open("https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(msgParts.join("\n")), "_blank");
      }
    }
    showToast("Reminder fired: " + reminder.text.substring(0, 40));
  }

  function addReminder(reminderData) {
    var r = Object.assign({}, reminderData || newReminder, {
      id: "rem_" + Date.now(),
      createdAt: new Date().toISOString(),
      fired: false,
      dismissed: false
    });
    setReminders(function(prev) { return (prev || []).concat([r]); });
    setNewReminder({ text: "", date: "", time: "09:00", sendWhatsApp: true, phone: "", horseId: "" });
    setShowAdd(false);
    showToast("Reminder saved");
  }

  function dismissReminder(id) {
    setReminders(function(prev) {
      return prev.map(function(r) { return r.id === id ? Object.assign({}, r, { dismissed: true }) : r; });
    });
  }

  function deleteReminder(id) {
    setReminders(function(prev) { return prev.filter(function(r) { return r.id !== id; }); });
  }

  function updateNew(key, val) {
    setNewReminder(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  // Get trainer phone from settings
  var trainerPhone = "";
  var contacts = (settings && settings.notifyContacts) ? settings.notifyContacts : [];
  var trainerContact = contacts.find(function(c) { return c.role === "Trainer" && c.phone; });
  if (trainerContact) trainerPhone = trainerContact.phone;

  var todayReminders = (reminders || []).filter(function(r) { return !r.dismissed && r.date === todayStr; });
  var upcomingReminders = (reminders || []).filter(function(r) { return !r.dismissed && r.date > todayStr; });
  var pastReminders = (reminders || []).filter(function(r) { return r.dismissed || r.date < todayStr; });

  var filtered = filter === "today" ? todayReminders
    : filter === "upcoming" ? (todayReminders.concat(upcomingReminders)).sort(function(a,b) { return (a.date+a.time).localeCompare(b.date+b.time); })
    : pastReminders;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Reminders</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
            {"Saved from the AI assistant or added manually · " + (todayReminders.length > 0 ? todayReminders.length + " due today" : "none due today")}
          </div>
        </div>
        <Btn onClick={function() { setShowAdd(!showAdd); }}>+ Add Reminder</Btn>
      </div>

      {todayReminders.filter(function(r) { return !r.fired; }).length > 0 && (
        <div style={{ background: C.amber + "12", border: "1px solid " + C.amber + "40", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.amber, marginBottom: 8 }}>🔔 Due Today</div>
          {todayReminders.filter(function(r) { return !r.fired; }).map(function(r) {
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid " + C.amber + "20" }}>
                <span style={{ fontSize: 13, flex: 1, color: C.text, fontWeight: 600 }}>{r.time + " — " + r.text}</span>
                <Btn variant="ghost" onClick={function() { fireReminder(r); }} style={{ fontSize: 11, padding: "4px 10px" }}>Send Now</Btn>
                <button onClick={function() { dismissReminder(r.id); }} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 12 }}>Dismiss</button>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>Add Reminder</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Reminder</div>
              <input type="text" value={newReminder.text} onChange={function(e) { updateNew("text", e.target.value); }}
                placeholder="e.g. Nemorino owners coming at 10am"
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 14, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Date</div>
              <input type="date" value={newReminder.date} onChange={function(e) { updateNew("date", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Alert Time</div>
              <input type="time" value={newReminder.time} onChange={function(e) { updateNew("time", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>WhatsApp to</div>
              <input type="tel" value={newReminder.phone || trainerPhone} onChange={function(e) { updateNew("phone", e.target.value); }}
                placeholder="+353 86 000 0000"
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={function() { addReminder(); }} disabled={!newReminder.text || !newReminder.date}>Save Reminder</Btn>
            <Btn variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {["upcoming", "past"].map(function(f) {
          var labels = { upcoming: "Upcoming (" + (todayReminders.length + upcomingReminders.length) + ")", past: "Past & Dismissed (" + pastReminders.length + ")" };
          return (
            <button key={f} onClick={function() { setFilter(f); }}
              style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px solid " + (filter === f ? C.navy : C.border),
                background: filter === f ? C.navy : C.card, color: filter === f ? "#fff" : C.textMid,
                fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {labels[f]}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>No reminders yet</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>
            Add reminders manually or tell the AI assistant — "remind me Nemorino owners coming Tuesday at 10am"
          </div>
          <Btn onClick={function() { setShowAdd(true); }}>Add Reminder</Btn>
        </div>
      ) : (
        filtered.map(function(r) {
          var isToday = r.date === todayStr;
          var isPast = r.date < todayStr || r.fired || r.dismissed;
          var dateDisplay = new Date(r.date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
          return (
            <div key={r.id} style={{ background: C.card, border: "1px solid " + (isToday && !r.fired ? C.amber : C.border), borderRadius: 12, padding: "14px 16px", marginBottom: 8, opacity: isPast ? 0.65 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>
                  {r.fired ? "✅" : isToday ? "🔔" : "📅"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{r.text}</div>
                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: C.textMid, flexWrap: "wrap" }}>
                    <span>{dateDisplay + " at " + r.time}</span>
                    {r.horseName && <span>{"🐎 " + r.horseName}</span>}
                    {r.sendWhatsApp && r.phone && <span>{"📱 WhatsApp to " + r.phone}</span>}
                    {r.fired && r.firedAt && <span style={{ color: C.green, fontWeight: 600 }}>Sent {new Date(r.firedAt).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}</span>}
                    {r.dismissed && <span style={{ color: C.textDim }}>Dismissed</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {!r.fired && !r.dismissed && (
                    <Btn variant="ghost" onClick={function() { fireReminder(r); }} style={{ fontSize: 11, padding: "5px 10px" }}>
                      Send Now
                    </Btn>
                  )}
                  <button onClick={function() { deleteReminder(r.id); }}
                    style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 13, fontWeight: 700, padding: "5px 8px" }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: C.navy, padding: "10px 22px", borderRadius: 24, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: C.shadowMd }}>
          <span style={{ color: toast.color }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

export default Reminders;
