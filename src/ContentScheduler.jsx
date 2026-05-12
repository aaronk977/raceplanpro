import React, { useState } from "react";
import { Btn, Silk, C } from "./shared";

function ContentScheduler({ horses, settings }) {
  var now = new Date();
  var todayStr = now.toISOString().slice(0, 10);

  var itemsState = useState([]);
  var items = itemsState[0]; var setItems = itemsState[1];
  var showAddState = useState(false);
  var showAdd = showAddState[0]; var setShowAdd = showAddState[1];
  var filterState = useState("all");
  var filter = filterState[0]; var setFilter = filterState[1];
  var viewItemState = useState(null);
  var viewItem = viewItemState[0]; var setViewItem = viewItemState[1];

  var emptyItem = { type: "video", horseId: "", title: "", caption: "", dueDate: "", channel: "whatsapp", notes: "", status: "scheduled", mediaFiles: [], recurring: "none" };
  var newItemState = useState(emptyItem);
  var newItem = newItemState[0]; var setNewItem = newItemState[1];
  var mediaPreviewsState = useState([]);
  var mediaPreviews = mediaPreviewsState[0]; var setMediaPreviews = mediaPreviewsState[1];

  var TYPES = [
    { id: "video", label: "Training Video", icon: "🎥" },
    { id: "update", label: "Owner Update", icon: "📝" },
    { id: "photo", label: "Photo Update", icon: "📸" },
    { id: "race_report", label: "Race Report", icon: "🏇" },
    { id: "health_update", label: "Health Update", icon: "🏥" },
    { id: "gallop_report", label: "Gallop Report", icon: "⚡" }
  ];

  var CHANNELS = [
    { id: "whatsapp", label: "WhatsApp", icon: "📱" },
    { id: "email", label: "Email", icon: "📧" },
    { id: "both", label: "Both", icon: "📲" }
  ];

  var RECURRING = [
    { id: "none", label: "One-off" },
    { id: "weekly", label: "Weekly" },
    { id: "biweekly", label: "Every 2 weeks" },
    { id: "monthly", label: "Monthly" },
    { id: "race_day", label: "Every race day" }
  ];

  function getNextDate(date, recurringId) {
    if (!date || !recurringId || recurringId === "none") return null;
    var d = new Date(date + "T12:00:00");
    if (recurringId === "weekly") d.setDate(d.getDate() + 7);
    else if (recurringId === "biweekly") d.setDate(d.getDate() + 14);
    else if (recurringId === "monthly") d.setMonth(d.getMonth() + 1);
    else return null;
    return d.toISOString().slice(0, 10);
  }

  function updateNew(key, val) {
    setNewItem(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  function handleMediaUpload(e) {
    var files = Array.from(e.target.files);
    var previews = [];
    var loaded = 0;
    files.forEach(function(file) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        previews.push({ name: file.name, type: file.type, size: file.size, url: ev.target.result });
        loaded++;
        if (loaded === files.length) {
          setMediaPreviews(function(prev) { return prev.concat(previews); });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  function removePreview(idx) {
    setMediaPreviews(function(prev) { return prev.filter(function(_, i) { return i !== idx; }); });
  }

  function addItem() {
    if (!newItem.title || !newItem.dueDate) return;
    var horse = (horses || []).find(function(h) { return h.id === newItem.horseId; });
    var item = Object.assign({}, newItem, {
      id: "cs_" + Date.now(),
      horseName: horse ? horse.name : "",
      ownerName: horse ? horse.owner : "",
      ownerPhone: horse ? horse.ownerPhone : "",
      ownerEmail: horse ? horse.ownerEmail : "",
      mediaFiles: mediaPreviews.slice(),
      createdAt: new Date().toISOString()
    });
    setItems(function(prev) { return prev.concat([item]); });
    setNewItem(emptyItem);
    setMediaPreviews([]);
    setShowAdd(false);
  }

  function updateStatus(id, status) {
    setItems(function(prev) {
      var updated = prev.map(function(item) {
        if (item.id !== id) return item;
        return Object.assign({}, item, { status: status, completedAt: status === "sent" ? new Date().toISOString() : item.completedAt });
      });
      // Auto-create next occurrence if recurring
      if (status === "sent") {
        var item = prev.find(function(i) { return i.id === id; });
        if (item && item.recurring && item.recurring !== "none") {
          var nextDate = getNextDate(item.dueDate, item.recurring);
          if (nextDate) {
            var nextItem = Object.assign({}, item, {
              id: "cs_" + Date.now(),
              dueDate: nextDate,
              status: "scheduled",
              completedAt: null,
              mediaFiles: [],
              createdAt: new Date().toISOString()
            });
            updated = updated.concat([nextItem]);
          }
        }
      }
      return updated;
    });
  }

  function sendWhatsApp(item) {
    if (!item.ownerPhone) { alert("No WhatsApp number for this owner. Add it in My Yard."); return; }
    var phone = item.ownerPhone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
    var type = TYPES.find(function(t) { return t.id === item.type; });
    var msgParts = ["RacePlan Pro - " + (type ? type.label : item.type)];
    if (item.horseName) msgParts.push("Horse: " + item.horseName);
    msgParts.push(item.title);
    if (item.caption) msgParts.push(item.caption);
    if (item.notes) msgParts.push(item.notes);
    if (item.mediaFiles && item.mediaFiles.length > 0) msgParts.push("[" + item.mediaFiles.length + " attachment(s) — send separately]");
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msgParts.join("\n")), "_blank");
    updateStatus(item.id, "sent");
    if (item.recurring && item.recurring !== "none") {
      showToast("Sent — next scheduled for " + (getNextDate(item.dueDate, item.recurring) || ""), C.green);
    }
  }

  function sendEmail(item) {
    if (!item.ownerEmail) { alert("No email for this owner."); return; }
    var type = TYPES.find(function(t) { return t.id === item.type; });
    var subject = (type ? type.label : item.type) + (item.horseName ? " - " + item.horseName : "");
    var body = item.title + (item.caption ? "\n\n" + item.caption : "") + (item.notes ? "\n\n" + item.notes : "");
    window.open("mailto:" + item.ownerEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body));
    updateStatus(item.id, "sent");
  }

  var filtered = items.filter(function(item) {
    if (filter === "all") return true;
    if (filter === "today") return item.dueDate === todayStr;
    if (filter === "pending") return item.status === "scheduled";
    if (filter === "sent") return item.status === "sent";
    return true;
  });

  var overdue = items.filter(function(i) { return i.dueDate < todayStr && i.status === "scheduled"; }).length;
  var dueToday = items.filter(function(i) { return i.dueDate === todayStr && i.status === "scheduled"; }).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Content Scheduler</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Owner updates, videos, race reports — schedule and send</div>
        </div>
        <Btn onClick={function() { setShowAdd(!showAdd); setMediaPreviews([]); }}>{showAdd ? "Cancel" : "+ Schedule Content"}</Btn>
      </div>

      {(overdue > 0 || dueToday > 0) && (
        <div style={{ background: overdue > 0 ? C.redBg : C.amberBg, border: "1px solid " + (overdue > 0 ? C.red : C.amber) + "40", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 16 }}>
          {overdue > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{"⚠️ " + overdue + " overdue"}</span>}
          {dueToday > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{"📅 " + dueToday + " due today"}</span>}
        </div>
      )}

      {showAdd && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>New Content</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Content Type</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {TYPES.map(function(t) {
                return (
                  <button key={t.id} onClick={function() { updateNew("type", t.id); }}
                    style={{ padding: "7px 14px", borderRadius: 8, border: "1.5px solid " + (newItem.type === t.id ? C.navy : C.border),
                      background: newItem.type === t.id ? C.navy : C.cardOff, color: newItem.type === t.id ? "#fff" : C.text,
                      fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {t.icon + " " + t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Title</div>
              <input type="text" value={newItem.title} onChange={function(e) { updateNew("title", e.target.value); }}
                placeholder="e.g. Bob Olinger looking great in morning gallop"
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 14, color: C.text }} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Caption / Message to Owner</div>
              <textarea value={newItem.caption} onChange={function(e) { updateNew("caption", e.target.value); }}
                placeholder="Write your message to the owner here. This goes in the WhatsApp or email body..."
                rows={4}
                style={{ width: "100%", padding: "10px 14px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 9, fontSize: 13, color: C.text, resize: "vertical", lineHeight: 1.6 }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Horse</div>
              <select value={newItem.horseId} onChange={function(e) { updateNew("horseId", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                <option value="">General / All owners</option>
                {(horses || []).map(function(h) { return <option key={h.id} value={h.id}>{h.name + " (" + (h.owner || "no owner") + ")"}</option>; })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Due Date</div>
              <input type="date" value={newItem.dueDate} onChange={function(e) { updateNew("dueDate", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Send Via</div>
              <select value={newItem.channel} onChange={function(e) { updateNew("channel", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {CHANNELS.map(function(c) { return <option key={c.id} value={c.id}>{c.icon + " " + c.label}</option>; })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Repeat</div>
              <select value={newItem.recurring || "none"} onChange={function(e) { updateNew("recurring", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {RECURRING.map(function(r) { return <option key={r.id} value={r.id}>{r.label}</option>; })}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 8, textTransform: "uppercase" }}>Photos & Videos</div>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "18px", border: "2px dashed " + C.border, borderRadius: 12, cursor: "pointer", background: C.cardOff, marginBottom: 10 }}>
                <span style={{ fontSize: 28 }}>📎</span>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Tap to add photos or videos</div>
                  <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>JPG, PNG, MP4, MOV supported</div>
                </div>
                <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: "none" }} />
              </label>
              {mediaPreviews.length > 0 && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {mediaPreviews.map(function(f, idx) {
                    var isVideo = f.type && f.type.indexOf("video") >= 0;
                    return (
                      <div key={idx} style={{ position: "relative", width: 90, height: 90 }}>
                        {isVideo ? (
                          <div style={{ width: 90, height: 90, borderRadius: 10, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, border: "2px solid " + C.border }}>🎥</div>
                        ) : (
                          <img src={f.url} alt={f.name} style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, border: "2px solid " + C.border }} />
                        )}
                        <button onClick={function() { removePreview(idx); }}
                          style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, borderRadius: "50%", background: C.red, border: "none", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        <div style={{ fontSize: 9, color: C.textDim, marginTop: 2, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{f.name}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Internal Notes (not sent to owner)</div>
              <input type="text" value={newItem.notes} onChange={function(e) { updateNew("notes", e.target.value); }}
                placeholder="e.g. Use the clip from Tuesday gallop"
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={addItem} disabled={!newItem.title || !newItem.dueDate}>Schedule</Btn>
            <Btn variant="ghost" onClick={function() { setShowAdd(false); setMediaPreviews([]); }}>Cancel</Btn>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {["all", "today", "pending", "sent"].map(function(f) {
          var labels = { all: "All", today: "Today", pending: "Pending", sent: "Sent" };
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

      {viewItem && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,22,40,0.7)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.card, borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: C.shadowMd }}>
            <div style={{ background: C.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{viewItem.title}</div>
              <button onClick={function() { setViewItem(null); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: 6, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {viewItem.mediaFiles && viewItem.mediaFiles.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{"Media (" + viewItem.mediaFiles.length + " files)"}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {viewItem.mediaFiles.map(function(f, idx) {
                      var isVideo = f.type && f.type.indexOf("video") >= 0;
                      return (
                        <div key={idx}>
                          {isVideo ? (
                            <video src={f.url} controls style={{ width: 200, height: 150, borderRadius: 10, objectFit: "cover" }} />
                          ) : (
                            <img src={f.url} alt={f.name} style={{ width: 150, height: 120, objectFit: "cover", borderRadius: 10 }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {viewItem.caption && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Caption / Message</div>
                  <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, background: C.cardOff, padding: "12px 14px", borderRadius: 10 }}>{viewItem.caption}</div>
                </div>
              )}
              {viewItem.notes && (
                <div style={{ fontSize: 12, color: C.textMid, fontStyle: "italic", marginBottom: 14 }}>{"Internal: " + viewItem.notes}</div>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                {(viewItem.channel === "whatsapp" || viewItem.channel === "both") && (
                  <Btn variant="green" onClick={function() { sendWhatsApp(viewItem); setViewItem(null); }} style={{ justifyContent: "center" }}>📱 Send WhatsApp</Btn>
                )}
                {(viewItem.channel === "email" || viewItem.channel === "both") && (
                  <Btn onClick={function() { sendEmail(viewItem); setViewItem(null); }} style={{ justifyContent: "center", background: C.blueBg, color: C.blue, border: "1.5px solid " + C.blue + "40" }}>📧 Send Email</Btn>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {filtered.map(function(item) {
        var typeInfo = TYPES.find(function(t) { return t.id === item.type; });
        var channelInfo = CHANNELS.find(function(c) { return c.id === item.channel; });
        var horse = (horses || []).find(function(h) { return h.id === item.horseId; });
        var isOverdue = item.dueDate < todayStr && item.status === "scheduled";
        var isDueToday = item.dueDate === todayStr && item.status === "scheduled";
        var isSent = item.status === "sent";
        return (
          <div key={item.id} onClick={function() { setViewItem(item); }}
            style={{ background: C.card, border: "1px solid " + (isOverdue ? C.red : isDueToday ? C.amber : isSent ? C.green : C.border), borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: "pointer", opacity: isSent ? 0.75 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ fontSize: 26, lineHeight: 1 }}>{typeInfo ? typeInfo.icon : "📋"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{item.title}</span>
                  {isSent && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.green + "15", color: C.green, fontWeight: 700 }}>Sent</span>}
                  {isOverdue && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.red + "15", color: C.red, fontWeight: 700 }}>Overdue</span>}
                  {isDueToday && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.amber + "15", color: C.amber, fontWeight: 700 }}>Due Today</span>}
                  {item.mediaFiles && item.mediaFiles.length > 0 && <span style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>{"📎 " + item.mediaFiles.length + " file" + (item.mediaFiles.length > 1 ? "s" : "")}</span>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                  {item.horseName && <span>{"🐎 " + item.horseName}</span>}
                  {item.ownerName && <span>{"👤 " + item.ownerName}</span>}
                  {channelInfo && <span>{channelInfo.icon + " " + channelInfo.label}</span>}
                  <span>{"📅 " + new Date(item.dueDate + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>
                  {item.recurring && item.recurring !== "none" && (
                    <span style={{ color: C.purple, fontWeight: 700 }}>{"🔄 " + (RECURRING.find(function(r) { return r.id === item.recurring; }) || {}).label}</span>
                  )}
                </div>
                {item.caption && <div style={{ fontSize: 12, color: C.textMid, marginTop: 4, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60%" }}>{item.caption}</div>}
              </div>
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>No content scheduled</div>
          <Btn onClick={function() { setShowAdd(true); }}>Schedule First Item</Btn>
        </div>
      )}
    </div>
  );
}

export default ContentScheduler;
