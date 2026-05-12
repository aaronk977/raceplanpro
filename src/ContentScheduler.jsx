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

  var emptyItem = { type: "video", horseId: "", ownerId: "", title: "", dueDate: "", channel: "whatsapp", notes: "", status: "scheduled" };
  var newItemState = useState(emptyItem);
  var newItem = newItemState[0]; var setNewItem = newItemState[1];

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

  function updateNew(key, val) {
    setNewItem(function(p) { return Object.assign({}, p, { [key]: val }); });
  }

  function addItem() {
    if (!newItem.title || !newItem.dueDate) return;
    var horse = (horses || []).find(function(h) { return h.id === newItem.horseId; });
    var item = Object.assign({}, newItem, {
      id: "cs_" + Date.now(),
      horseName: horse ? horse.name : "",
      ownerName: horse ? horse.owner : (newItem.ownerId || ""),
      ownerPhone: horse ? horse.ownerPhone : "",
      ownerEmail: horse ? horse.ownerEmail : "",
      createdAt: new Date().toISOString()
    });
    setItems(function(prev) { return prev.concat([item]); });
    setNewItem(emptyItem);
    setShowAdd(false);
  }

  function updateItemStatus(id, status) {
    setItems(function(prev) {
      return prev.map(function(item) {
        if (item.id !== id) return item;
        return Object.assign({}, item, { status: status, completedAt: status === "sent" ? new Date().toISOString() : item.completedAt });
      });
    });
  }

  function sendViaWhatsApp(item) {
    if (!item.ownerPhone) { alert("No WhatsApp number saved for this owner. Add it in My Yard."); return; }
    var phone = item.ownerPhone.split("").filter(function(d) { return (d >= "0" && d <= "9") || d === "+"; }).join("");
    var type = TYPES.find(function(t) { return t.id === item.type; });
    var msgParts = ["RacePlan Pro - " + (type ? type.label : item.type)];
    if (item.horseName) msgParts.push("Horse: " + item.horseName);
    msgParts.push(item.title);
    if (item.notes) msgParts.push(item.notes);
    window.open("https://wa.me/" + phone + "?text=" + encodeURIComponent(msgParts.join("\n")), "_blank");
    updateItemStatus(item.id, "sent");
  }

  function sendViaEmail(item) {
    if (!item.ownerEmail) { alert("No email saved for this owner."); return; }
    var type = TYPES.find(function(t) { return t.id === item.type; });
    var subject = (type ? type.label : item.type) + (item.horseName ? " - " + item.horseName : "");
    window.open("mailto:" + item.ownerEmail + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(item.title + (item.notes ? "\n\n" + item.notes : "")));
    updateItemStatus(item.id, "sent");
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
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 3 }}>Owner updates, videos, race reports — all in one place</div>
        </div>
        <Btn onClick={function() { setShowAdd(true); }}>+ Schedule Content</Btn>
      </div>

      {(overdue > 0 || dueToday > 0) && (
        <div style={{ background: overdue > 0 ? C.redBg : C.amberBg, border: "1px solid " + (overdue > 0 ? C.red : C.amber) + "40", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 16 }}>
          {overdue > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{"⚠️ " + overdue + " overdue"}</span>}
          {dueToday > 0 && <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{"📅 " + dueToday + " due today"}</span>}
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

      {showAdd && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 14 }}>Schedule Content</div>
          <div style={{ marginBottom: 12 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Title / Description</div>
              <input type="text" value={newItem.title} onChange={function(e) { updateNew("title", e.target.value); }}
                placeholder="e.g. Bob Olinger schooling session this morning"
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Horse (optional)</div>
              <select value={newItem.horseId} onChange={function(e) { updateNew("horseId", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                <option value="">All owners / General</option>
                {(horses || []).map(function(h) { return <option key={h.id} value={h.id}>{h.name + " (" + (h.owner || "no owner") + ")"}</option>; })}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Due Date</div>
              <input type="date" value={newItem.dueDate} onChange={function(e) { updateNew("dueDate", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Channel</div>
              <select value={newItem.channel} onChange={function(e) { updateNew("channel", e.target.value); }}
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }}>
                {CHANNELS.map(function(c) { return <option key={c.id} value={c.id}>{c.icon + " " + c.label}</option>; })}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMid, marginBottom: 3, textTransform: "uppercase" }}>Notes (optional)</div>
              <input type="text" value={newItem.notes} onChange={function(e) { updateNew("notes", e.target.value); }}
                placeholder="Any additional details"
                style={{ width: "100%", padding: "9px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={addItem} disabled={!newItem.title || !newItem.dueDate}>Schedule</Btn>
            <Btn variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Btn>
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
          <div key={item.id} style={{ background: C.card, border: "1px solid " + (isOverdue ? C.red : isDueToday ? C.amber : isSent ? C.green : C.border), borderRadius: 12, padding: "14px 16px", marginBottom: 10, opacity: isSent ? 0.7 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ fontSize: 28, lineHeight: 1, marginTop: 2 }}>{typeInfo ? typeInfo.icon : "📋"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{item.title}</span>
                  {isSent && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.green + "15", color: C.green, fontWeight: 700 }}>Sent</span>}
                  {isOverdue && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.red + "15", color: C.red, fontWeight: 700 }}>Overdue</span>}
                  {isDueToday && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.amber + "15", color: C.amber, fontWeight: 700 }}>Due Today</span>}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                  {item.horseName && <span>{"🐎 " + item.horseName}</span>}
                  {item.ownerName && <span>{"👤 " + item.ownerName}</span>}
                  <span>{channelInfo ? channelInfo.icon + " " + channelInfo.label : item.channel}</span>
                  <span>{"📅 " + new Date(item.dueDate + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>
                </div>
                {item.notes && <div style={{ fontSize: 12, color: C.textMid, marginTop: 4, fontStyle: "italic" }}>{item.notes}</div>}
                {horse && <div style={{ marginTop: 6 }}><Silk silk={horse.silk} size={20} /></div>}
              </div>
              {!isSent && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                  {(item.channel === "whatsapp" || item.channel === "both") && (
                    <Btn variant="green" onClick={function() { sendViaWhatsApp(item); }} style={{ fontSize: 11, padding: "6px 12px", justifyContent: "center" }}>
                      📱 WhatsApp
                    </Btn>
                  )}
                  {(item.channel === "email" || item.channel === "both") && (
                    <Btn onClick={function() { sendViaEmail(item); }} style={{ fontSize: 11, padding: "6px 12px", justifyContent: "center", background: C.blueBg, color: C.blue, border: "1.5px solid " + C.blue + "40" }}>
                      📧 Email
                    </Btn>
                  )}
                  <button onClick={function() { updateItemStatus(item.id, "sent"); }}
                    style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, border: "1px solid " + C.border, background: "none", color: C.textMid, cursor: "pointer" }}>
                    Mark Sent
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ padding: 40, textAlign: "center", border: "1.5px dashed " + C.border, borderRadius: 14, color: C.textMid }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 8 }}>No content scheduled</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Schedule owner updates, training videos, race reports and more</div>
          <Btn onClick={function() { setShowAdd(true); }}>Schedule First Item</Btn>
        </div>
      )}
    </div>
  );
}

export default ContentScheduler;
