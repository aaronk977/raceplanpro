import React, { useState, useEffect } from "react";
import { Btn, C } from "./shared";

function Reminders({ reminders, setReminders, settings, user, supabase }) {
  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];
  var loadedState = useState(false);
  var loaded = loadedState[0]; var setLoaded = loadedState[1];

  var emptyReminder = { text: "", date: "", time: "09:00", horseName: "", phone: null, notifyBeforeHours: 24, maxAttempts: 3, sendWhatsApp: true };
  var newReminderState = useState(emptyReminder);
  var newReminder = newReminderState[0]; var setNewReminder = newReminderState[1];
  var filterState = useState("upcoming");
  var filter = filterState[0]; var setFilter = filterState[1];

  // Get all contacts with phone numbers
  var staffContacts = (settings && settings.notifyContacts) ? settings.notifyContacts : [];
  var ownerContacts = (settings && settings.ownerContacts) ? settings.ownerContacts : [];
  var trainerPhone = "";

  // Build combined contact list with phone numbers
  var allContacts = [];
  staffContacts.forEach(function(c) {
    if (c.phone && c.name) allContacts.push({ name: c.name, phone: c.phone, role: c.role || "Staff", id: "s_" + c.name });
  });
  ownerContacts.forEach(function(c) {
    if (c.phone && c.name) allContacts.push({ name: c.name, phone: c.phone, role: "Owner", id: "o_" + c.name });
  });

  var trainerContact = staffContacts.find(function(c) { return c.phone && (c.role === "Trainer" || c.role === "Head Lad"); });
  if (trainerContact) trainerPhone = trainerContact.phone;

  // Default phone for new reminders to trainer if not set
  if (!newReminder.phone && trainerPhone && newReminder.phone !== "") {
    // Don't auto-set — let user pick from buttons
  }

  function showToast(msg, color) {
    setToast({ msg: msg, color: color || C.green });
    setTimeout(function() { setToast(null); }, 4000);
  }

  // Load reminders from Supabase
  useEffect(function() {
    if (!user || !supabase || loaded) return;
    setLoaded(true);
    supabase.from("reminders").select("*").eq("user_id", user.id)
      .order("reminder_date", { ascending: true })
      .then(function(res) {
        if (res.data && res.data.length > 0) {
          var loaded2 = res.data.map(function(r) {
            return {
              id: r.id, text: r.text, date: r.reminder_date, time: r.reminder_time,
              horseName: r.horse_name, phone: r.phone, sendWhatsApp: r.send_whatsapp,
              notifyBeforeHours: r.notify_before_hours, maxAttempts: r.max_attempts,
              attemptCount: r.attempt_count, acknowledged: r.acknowledged,
              dismissed: r.dismissed, fired: r.fired, firedAt: r.fired_at,
              lastAttemptAt: r.last_attempt_at
            };
          });
          setReminders(loaded2);
        }
      });
  }, [user]);

  function saveToSupabase(reminder) {
    if (!user || !supabase) return;
    supabase.from("reminders").upsert({
      id: reminder.id, user_id: user.id,
      text: reminder.text, reminder_date: reminder.date,
      reminder_time: reminder.time, horse_name: reminder.horseName || "",
      phone: reminder.phone || "", send_whatsapp: reminder.sendWhatsApp !== false,
      notify_before_hours: reminder.notifyBeforeHours || 24,
      max_attempts: reminder.maxAttempts || 3,
      attempt_count: reminder.attemptCount || 0,
      acknowledged: reminder.acknowledged || false,
      dismissed: reminder.dismissed || false,
      fired: reminder.fired || false,
      fired_at: reminder.firedAt || null,
      last_attempt_at: reminder.lastAttemptAt || null
    }).then(function(r) { if (r.error) console.error("Reminder save:", r.error); });
  }

  // Check for due reminders every minute
  useEffect(function() {
    var interval = setInterval(checkDueReminders, 60000);
    checkDueReminders();
    return function() { clearInterval(interval); };
  }, [reminders]);

  function getReminderFireDate(reminder) {
    // Fire X hours before the event
    var eventDate = new Date(reminder.date + "T" + (reminder.time || "09:00") + ":00");
    var fireDate = new Date(eventDate.getTime() - (reminder.notifyBeforeHours || 24) * 3600000);
    return fireDate;
  }

  function isDue(reminder) {
    if (reminder.acknowledged || reminder.dismissed) return false;
    if ((reminder.attemptCount || 0) >= (reminder.maxAttempts || 3)) return false;
    var fireDate = getReminderFireDate(reminder);
    var now2 = new Date();
    // Due if fire time is within last hour and not attempted in last 8 hours
    var msSinceFire = now2 - fireDate;
    if (msSinceFire < 0) return false; // not yet
    if (msSinceFire > 3600000) return false; // more than 1 hour past fire time
    if (reminder.lastAttemptAt) {
      var msSinceAttempt = now2 - new Date(reminder.lastAttemptAt);
      if (msSinceAttempt < 28800000) return false; // retry after 8 hours
    }
    return true;
  }

  function checkDueReminders() {
    (reminders || []).forEach(function(r) {
      if (isDue(r)) {
        fireReminder(r);
      }
    });
  }

  function fireReminder(reminder) {
    var newCount = (reminder.attemptCount || 0) + 1;
    var updated = Object.assign({}, reminder, {
      attemptCount: newCount,
      lastAttemptAt: new Date().toISOString(),
      fired: true,
      firedAt: reminder.firedAt || new Date().toISOString()
    });

    setReminders(function(prev) {
      return prev.map(function(r) { return r.id === reminder.id ? updated : r; });
    });
    saveToSupabase(updated);

    // Send WhatsApp
    var phone = (reminder.phone && reminder.phone !== "null") ? reminder.phone : trainerPhone;
    if (phone && reminder.sendWhatsApp !== false) {
      var cleanPhone = phone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
      var hoursUntil = Math.round((new Date(reminder.date + "T" + (reminder.time || "09:00") + ":00") - new Date()) / 3600000);
      var msgParts = ["RacePlan Pro Reminder"];
      if (newCount > 1) msgParts.push("(Reminder " + newCount + " of " + (reminder.maxAttempts || 3) + ")");
      msgParts.push(reminder.text);
      if (reminder.horseName) msgParts.push("Re: " + reminder.horseName);
      if (hoursUntil > 0) msgParts.push("This is due in approx " + hoursUntil + " hours");
      msgParts.push("Reply DONE to acknowledge");
      window.open("https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(msgParts.join("\n")), "_blank");
    }

    showToast("Reminder sent (" + newCount + "/" + (reminder.maxAttempts || 3) + "): " + reminder.text.substring(0, 30));
  }

  function acknowledge(id) {
    var updated = null;
    setReminders(function(prev) {
      return prev.map(function(r) {
        if (r.id !== id) return r;
        updated = Object.assign({}, r, { acknowledged: true, acknowledgedAt: new Date().toISOString() });
        return updated;
      });
    });
    if (updated) saveToSupabase(updated);
    showToast("Reminder acknowledged");
  }

  function addReminder(data) {
    var r = Object.assign({}, data || newReminder, {
      id: "rem_" + Date.now(),
      phone: (data && data.phone) || newReminder.phone || trainerPhone,
      attemptCount: 0, acknowledged: false, dismissed: false, fired: false,
      createdAt: new Date().toISOString()
    });
    setReminders(function(prev) { return (prev || []).concat([r]); });
    saveToSupabase(r);
    setNewReminder(emptyReminder);
    setShowAdd(false);

    // Explain timing
    var fireDate = getReminderFireDate(r);
    var fireDateStr = fireDate.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" });
    var fireTimeStr = fireDate.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" });
    showToast("Reminder set — WhatsApp alert at " + fireTimeStr + " on " + fireDateStr);
  }

  function deleteReminder(id) {
    setReminders(function(prev) { return prev.filter(function(r) { return r.id !== id; }); });
    if (user && supabase) supabase.from("reminders").delete().eq("id", id).then(function() {});
  }

  function updateNew(key, val) {
    setNewReminder(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  var upcoming = (reminders || []).filter(function(r) {
    return !r.acknowledged && !r.dismissed && r.date >= todayStr;
  }).sort(function(a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });

  var needsAction = upcoming.filter(function(r) {
    return r.fired && !r.acknowledged && (r.attemptCount || 0) >= (r.maxAttempts || 3);
  });

  var past = (reminders || []).filter(function(r) {
    return r.acknowledged || r.dismissed || r.date < todayStr;
  }).sort(function(a, b) { return b.date.localeCompare(a.date); });

  var filtered = filter === "upcoming" ? upcoming : past;

  var HOURS_OPTIONS = [
    { val: 1, label: "1 hour before" },
    { val: 2, label: "2 hours before" },
    { val: 8, label: "8 hours before (morning of)" },
    { val: 24, label: "24 hours before (day before)" },
    { val: 48, label: "48 hours before (2 days before)" },
    { val: 72, label: "72 hours before (3 days before)" }
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Reminders</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>
            Set from AI assistant or manually · WhatsApp sent to your phone · Retries until acknowledged
          </div>
        </div>
        <Btn onClick={function() { setShowAdd(!showAdd); }}>+ Add Reminder</Btn>
      </div>

      {needsAction.length > 0 && (
        <div style={{ background: C.red + "10", border: "1px solid " + C.red + "30", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 10 }}>{"⚠️ " + needsAction.length + " reminder" + (needsAction.length > 1 ? "s" : "") + " sent max times — needs acknowledgement"}</div>
          {needsAction.map(function(r) {
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid " + C.red + "15" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{r.text}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{"Sent " + (r.attemptCount || 0) + " times — no acknowledgement received"}</div>
                </div>
                <Btn variant="green" onClick={function() { acknowledge(r.id); }} style={{ fontSize: 12, padding: "6px 14px" }}>Acknowledge</Btn>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 12, color: C.textMid, lineHeight: 1.7 }}>
        <strong style={{ color: C.text }}>How reminders work:</strong> When you save a reminder, a WhatsApp is sent to the saved phone number at the time you choose (e.g. 24 hours before). If not acknowledged, it resends up to 3 times (every 8 hours). Keep the app open at the reminder time for best results — full background push notifications require Twilio integration (coming soon).
      </div>

      {showAdd && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>New Reminder</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>What to remember</div>
              <input type="text" value={newReminder.text} onChange={function(e) { updateNew("text", e.target.value); }}
                placeholder="e.g. Nemorino owners coming at 10am"
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 14, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Event Date</div>
              <input type="date" value={newReminder.date} onChange={function(e) { updateNew("date", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Event Time</div>
              <input type="time" value={newReminder.time} onChange={function(e) { updateNew("time", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Send reminder</div>
              <select value={newReminder.notifyBeforeHours} onChange={function(e) { updateNew("notifyBeforeHours", parseInt(e.target.value)); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {HOURS_OPTIONS.map(function(o) { return <option key={o.val} value={o.val}>{o.label}</option>; })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Retry attempts</div>
              <select value={newReminder.maxAttempts} onChange={function(e) { updateNew("maxAttempts", parseInt(e.target.value)); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {[1,2,3,4,5].map(function(n) { return <option key={n} value={n}>{n + " time" + (n > 1 ? "s" : "")}</option>; })}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 6, textTransform: "uppercase" }}>Send WhatsApp to</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {allContacts.length > 0 ? (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {allContacts.map(function(contact) {
                      var isSelected = (newReminder.phone === contact.phone);
                      return (
                        <button key={contact.id || contact.name} onClick={function() { updateNew("phone", contact.phone); }}
                          style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + (isSelected ? C.navy : C.border),
                            background: isSelected ? C.navy : C.card, color: isSelected ? "#fff" : C.textMid,
                            fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.2)" : C.cardOff, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: isSelected ? "#fff" : C.textMid, flexShrink: 0 }}>
                            {(contact.name || "?").charAt(0).toUpperCase()}
                          </div>
                          {contact.name}
                          <span style={{ fontSize: 10, opacity: 0.6 }}>{"(" + contact.role + ")"}</span>
                        </button>
                      );
                    })}
                    <button onClick={function() { updateNew("phone", ""); }}
                      style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + (newReminder.phone === "" ? C.navy : C.border),
                        background: newReminder.phone === "" ? C.navy : C.card, color: newReminder.phone === "" ? "#fff" : C.textMid,
                        fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      + Manual number
                    </button>
                  </div>
                ) : null}
                {(newReminder.phone === "" || allContacts.length === 0) && (
                  <input type="tel" value={newReminder.phone} onChange={function(e) { updateNew("phone", e.target.value); }}
                    placeholder="+353 86 000 0000"
                    style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
                )}
                {newReminder.phone && newReminder.phone !== "" && (
                  <div style={{ fontSize: 11, color: C.textMid }}>{"📱 " + newReminder.phone}</div>
                )}
              </div>
            </div>
          </div>
          {newReminder.date && newReminder.time && (
            <div style={{ background: C.blueBg, border: "1px solid " + C.blue + "30", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: C.blue }}>
              {(function() {
                var eventDate = new Date(newReminder.date + "T" + newReminder.time + ":00");
                var fireDate = new Date(eventDate.getTime() - (newReminder.notifyBeforeHours || 24) * 3600000);
                return "WhatsApp will fire at " + fireDate.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" }) + " on " + fireDate.toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "short" }) + " · Resends up to " + (newReminder.maxAttempts || 3) + "x if not acknowledged";
              })()}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={function() { addReminder(); }} disabled={!newReminder.text || !newReminder.date}>Save Reminder</Btn>
            <Btn variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["upcoming","Upcoming (" + upcoming.length + ")"], ["past","Past (" + past.length + ")"]].map(function(f) {
          return (
            <button key={f[0]} onClick={function() { setFilter(f[0]); }}
              style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px solid " + (filter === f[0] ? C.navy : C.border),
                background: filter === f[0] ? C.navy : C.card, color: filter === f[0] ? "#fff" : C.textMid,
                fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {f[1]}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔔</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>No reminders</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Tell the AI assistant: "remind me Nemorino owners coming Tuesday at 10am" — or add manually above</div>
          <Btn onClick={function() { setShowAdd(true); }}>Add Reminder</Btn>
        </div>
      ) : (
        filtered.map(function(r) {
          var fireDate = getReminderFireDate(r);
          var fireDateStr = fireDate.toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" });
          var fireTimeStr = fireDate.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" });
          var attemptsLeft = (r.maxAttempts || 3) - (r.attemptCount || 0);
          var isAcknowledged = r.acknowledged;
          var isFired = r.fired && !isAcknowledged;
          var maxed = (r.attemptCount || 0) >= (r.maxAttempts || 3);

          return (
            <div key={r.id} style={{ background: C.card, border: "1px solid " + (isFired && maxed ? C.red : isFired ? C.amber : C.border), borderRadius: 12, padding: "14px 16px", marginBottom: 10, opacity: isAcknowledged ? 0.6 : 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>
                  {isAcknowledged ? "✅" : isFired ? (maxed ? "🔴" : "🔔") : "📅"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{r.text}</div>
                  <div style={{ display: "flex", gap: 10, fontSize: 12, color: C.textMid, flexWrap: "wrap", marginBottom: 4 }}>
                    <span>{"Event: " + new Date(r.date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" }) + " at " + (r.time || "09:00")}</span>
                    {r.horseName && <span>{"🐎 " + r.horseName}</span>}
                  </div>
                  <div style={{ display: "flex", gap: 10, fontSize: 11, color: C.textDim, flexWrap: "wrap" }}>
                    <span>{"Alert fires: " + fireDateStr + " at " + fireTimeStr}</span>
                    {r.phone && <span>{"📱 " + r.phone}</span>}
                    {!isAcknowledged && (
                      <span style={{ color: isFired ? (maxed ? C.red : C.amber) : C.textDim, fontWeight: 600 }}>
                        {isFired
                          ? (maxed ? "Max attempts reached — unacknowledged" : "Sent " + (r.attemptCount || 0) + "/" + (r.maxAttempts || 3) + " · " + attemptsLeft + " retries left")
                          : "Not yet sent"}
                      </span>
                    )}
                    {isAcknowledged && <span style={{ color: C.green, fontWeight: 600 }}>Acknowledged</span>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  {!isAcknowledged && (
                    <Btn variant="ghost" onClick={function() { fireReminder(r); }} style={{ fontSize: 11, padding: "5px 10px" }}>
                      {r.fired ? "Resend" : "Send Now"}
                    </Btn>
                  )}
                  {isFired && !isAcknowledged && (
                    <Btn variant="green" onClick={function() { acknowledge(r.id); }} style={{ fontSize: 11, padding: "5px 10px", justifyContent: "center" }}>
                      Acknowledge
                    </Btn>
                  )}
                  <button onClick={function() { deleteReminder(r.id); }}
                    style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontSize: 11, fontWeight: 700, padding: "4px 8px" }}>
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
