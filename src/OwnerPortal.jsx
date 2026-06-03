import React, { useState } from "react";
import { Btn, Silk, FormDots, StatusPill, C, getAge } from "./shared";

var MESSAGE_TEMPLATES = [
  { id: "entry", label: "Race Entry", text: "Hi [OWNER], just to let you know [HORSE] has been entered in [RACE] at [VENUE] on [DATE]. We will be in touch with further details." },
  { id: "declaration", label: "Declaration", text: "Hi [OWNER], [HORSE] has been declared for [RACE] at [VENUE] on [DATE]. Jockey: [JOCKEY]. We look forward to a good run." },
  { id: "scratched", label: "Scratched", text: "Hi [OWNER], unfortunately we have had to scratch [HORSE] from [RACE] at [VENUE]. We will be in touch to discuss next steps." },
  { id: "update", label: "General Update", text: "Hi [OWNER], just a quick update on [HORSE]. [MESSAGE]. Please don't hesitate to call if you have any questions." },
  { id: "result", label: "Race Result", text: "Hi [OWNER], [HORSE] ran today at [VENUE] and finished [POSITION]. [MESSAGE]. Thank you for your continued support." },
  { id: "vet", label: "Vet Visit", text: "Hi [OWNER], just to let you know [HORSE] was seen by the vet today. [MESSAGE]. We will keep you updated on progress." },
  { id: "custom", label: "Custom Message", text: "" },
];

function OwnerPortal({ horses }) {
  var selOwnerState = useState(null);
  var selOwner = selOwnerState[0]; var setSelOwner = selOwnerState[1];
  var showComposerState = useState(false);
  var showComposer = showComposerState[0]; var setShowComposer = showComposerState[1];
  var templateState = useState(MESSAGE_TEMPLATES[0]);
  var template = templateState[0]; var setTemplate = templateState[1];
  var messageState = useState("");
  var message = messageState[0]; var setMessage = messageState[1];
  var sendingState = useState(false);
  var sending = sendingState[0]; var setSending = sendingState[1];
  var sentState = useState(null);
  var sent = sentState[0]; var setSent = sentState[1];
  var commHistoryState = useState({});
  var commHistory = commHistoryState[0]; var setCommHistory = commHistoryState[1];
  var bulkModeState = useState(false);
  var bulkMode = bulkModeState[0]; var setBulkMode = bulkModeState[1];
  var bulkSelectedState = useState({});
  var bulkSelected = bulkSelectedState[0]; var setBulkSelected = bulkSelectedState[1];
  var activeTabState = useState("horses");
  var activeTab = activeTabState[0]; var setActiveTab = activeTabState[1];

  var ownerMap = {};
  for (var i = 0; i < horses.length; i++) {
    var h = horses[i];
    if (!h.owner) continue;
    if (!ownerMap[h.owner]) {
      ownerMap[h.owner] = { name: h.owner, horses: [], phone: h.ownerPhone || "", email: h.ownerEmail || "" };
    }
    ownerMap[h.owner].horses.push(h);
    if (!ownerMap[h.owner].phone && h.ownerPhone) ownerMap[h.owner].phone = h.ownerPhone;
    if (!ownerMap[h.owner].email && h.ownerEmail) ownerMap[h.owner].email = h.ownerEmail;
  }
  var owners = Object.values(ownerMap).sort(function(a, b) { return a.name.localeCompare(b.name); });

  function sendMessage(owner, msg) {
    if (!owner.phone || !msg.trim()) return;
    setSending(true);
    var phone = owner.phone.split("").filter(function(c) { return (c >= "0" && c <= "9") || c === "+"; }).join("");
    fetch("/api/send-whatsapp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: phone, message: msg })
    }).then(function(r) { return r.json(); })
    .then(function(d) {
      setSending(false);
      if (d.success) {
        setSent("sent");
        // Save to comm history
        var entry = { time: new Date().toISOString(), message: msg, status: "sent", channel: "whatsapp" };
        setCommHistory(function(prev) {
          var ownerHist = (prev[owner.name] || []).concat([entry]);
          return Object.assign({}, prev, { [owner.name]: ownerHist });
        });
        setTimeout(function() { setSent(null); setShowComposer(false); setMessage(""); }, 2000);
      } else {
        setSent("failed");
        setTimeout(function() { setSent(null); }, 3000);
      }
    }).catch(function() {
      setSending(false);
      setSent("failed");
      setTimeout(function() { setSent(null); }, 3000);
    });
  }

  function sendBulk(msg) {
    var targets = owners.filter(function(o) { return bulkSelected[o.name] && o.phone; });
    if (targets.length === 0) return;
    setSending(true);
    var done = 0;
    targets.forEach(function(o) {
      var phone = o.phone.split("").filter(function(c) { return (c >= "0" && c <= "9") || c === "+"; }).join("");
      fetch("/api/send-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phone, message: msg })
      }).then(function(r) { return r.json(); })
      .then(function() {
        done++;
        if (done === targets.length) {
          setSending(false);
          setSent("sent");
          setBulkSelected({});
          setTimeout(function() { setSent(null); setShowComposer(false); setMessage(""); setBulkMode(false); }, 2000);
        }
      });
    });
  }

  // OWNER LIST
  if (!selOwner) return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>Owner Portal</div>
          <div style={{ fontSize: 13, color: C.textMid, marginTop: 2 }}>{owners.length + " owners  - " + horses.filter(function(h) { return h.owner; }).length + " horses"}</div>
        </div>
        <Btn onClick={function() { setBulkMode(!bulkMode); setBulkSelected({}); }}>
          {bulkMode ? "Cancel Bulk" : "Bulk Message"}
        </Btn>
      </div>

      {bulkMode && (
        <div style={{ background: C.navy, borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 10 }}>Select owners to message:</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {owners.map(function(o) {
              var sel = !!bulkSelected[o.name];
              return (
                <div key={o.name} onClick={function() { setBulkSelected(function(p) { var n = Object.assign({}, p); if (n[o.name]) delete n[o.name]; else n[o.name] = true; return n; }); }}
                  style={{ padding: "6px 12px", borderRadius: 20, border: "1.5px solid " + (sel ? C.gold : "rgba(255,255,255,0.2)"), background: sel ? C.gold + "20" : "transparent", color: sel ? C.gold : "rgba(255,255,255,0.6)", fontSize: 12, fontWeight: sel ? 700 : 400, cursor: "pointer" }}>
                  {o.name}
                  {!o.phone && <span style={{ color: C.red, marginLeft: 4, fontSize: 10 }}>no phone</span>}
                </div>
              );
            })}
          </div>
          {Object.keys(bulkSelected).length > 0 && (
            <Btn onClick={function() { setShowComposer(true); }} style={{ fontSize: 13 }}>
              {"Compose for " + Object.keys(bulkSelected).length + " owners"}
            </Btn>
          )}
        </div>
      )}

      {showComposer && bulkMode && (
        <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "16px", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>Bulk Message</div>
          <textarea value={message} onChange={function(e) { setMessage(e.target.value); }}
            placeholder="Type your message..."
            style={{ width: "100%", padding: "10px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, resize: "vertical", minHeight: 80, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Btn onClick={function() { sendBulk(message); }} disabled={sending || !message.trim()}>
              {sending ? "Sending..." : sent === "sent" ? "Sent!" : "Send to " + Object.keys(bulkSelected).length + " owners"}
            </Btn>
            <Btn variant="ghost" onClick={function() { setShowComposer(false); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {owners.length === 0 && (
        <div style={{ background: C.card, border: "1.5px dashed " + C.border, borderRadius: 12, padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14 }}>
          No owners found. Add owner names and phone numbers to horses in My Yard.
        </div>
      )}

      {owners.map(function(o) {
        var withTargets = o.horses.filter(function(h) { return (h.provisionalEntries || []).length > 0; }).length;
        var initials = o.name.split(" ").map(function(w) { return w[0] || ""; }).join("").slice(0, 2).toUpperCase();
        var hist = commHistory[o.name] || [];
        return (
          <div key={o.name} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
            onClick={function() { if (!bulkMode) setSelOwner(o); }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: C.gold, flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 2 }}>{o.name}</div>
              <div style={{ fontSize: 12, color: C.textMid }}>
                {o.horses.length + " horse" + (o.horses.length !== 1 ? "s" : "")}
                {withTargets > 0 ? "  - " + withTargets + " targets" : ""}
                {hist.length > 0 ? "  - " + hist.length + " message" + (hist.length !== 1 ? "s" : "") + " sent" : ""}
              </div>
              <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                {o.horses.map(function(h) {
                  return (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <Silk silk={h.silk} size={14} />
                      <span style={{ fontSize: 10, color: C.textMid }}>{h.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              {o.phone && <span style={{ fontSize: 10, color: C.green, fontWeight: 700, background: C.green + "12", padding: "2px 6px", borderRadius: 10 }}>WA</span>}
              {!o.phone && <span style={{ fontSize: 10, color: C.red, fontWeight: 700, background: C.red + "12", padding: "2px 6px", borderRadius: 10 }}>No phone</span>}
              <span style={{ color: C.textMid, fontSize: 16 }}>{">"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  // OWNER DETAIL
  var hist = commHistory[selOwner.name] || [];
  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
        <Btn variant="ghost" onClick={function() { setSelOwner(null); setShowComposer(false); setActiveTab("horses"); }} style={{ fontSize: 12 }}>
          {"< All Owners"}
        </Btn>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {selOwner.phone && (
            <Btn onClick={function() { setShowComposer(!showComposer); setMessage(""); setTemplate(MESSAGE_TEMPLATES[0]); }} style={{ background: "#25D366", fontSize: 12 }}>
              WhatsApp
            </Btn>
          )}
          {selOwner.phone && (
            <a href={"tel:" + selOwner.phone}
              style={{ background: C.blueBg, border: "1px solid " + C.border, color: C.navy, padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              Call
            </a>
          )}
          {selOwner.email && (
            <a href={"mailto:" + selOwner.email}
              style={{ background: C.navy, color: "#fff", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
              Email
            </a>
          )}
        </div>
      </div>

      <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 4 }}>{selOwner.name}</div>
      <div style={{ fontSize: 12, color: C.textMid, marginBottom: 14 }}>
        {selOwner.phone || "No phone"} {selOwner.email ? "  - " + selOwner.email : ""}
      </div>

      {/* Message composer */}
      {showComposer && (
        <div style={{ background: C.card, border: "2px solid #25D366", borderRadius: 12, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>Send WhatsApp</div>

          {/* Templates */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {MESSAGE_TEMPLATES.map(function(t) {
              return (
                <button key={t.id} onClick={function() {
                  setTemplate(t);
                  setMessage(t.text.replace("[OWNER]", selOwner.name.split(" ")[0]));
                }}
                  style={{ padding: "4px 10px", borderRadius: 20, border: "1.5px solid " + (template.id === t.id ? "#25D366" : C.border), background: template.id === t.id ? "#25D36615" : "transparent", color: template.id === t.id ? "#25D366" : C.textMid, fontSize: 11, fontWeight: template.id === t.id ? 700 : 400, cursor: "pointer" }}>
                  {t.label}
                </button>
              );
            })}
          </div>

          <textarea value={message} onChange={function(e) { setMessage(e.target.value); }}
            placeholder="Type your message..."
            style={{ width: "100%", padding: "10px 12px", background: C.cardOff, border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, color: C.text, resize: "vertical", minHeight: 90, marginBottom: 10 }} />

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Btn onClick={function() { sendMessage(selOwner, message); }} disabled={sending || !message.trim()}
              style={{ background: "#25D366" }}>
              {sending ? "Sending..." : sent === "sent" ? "Sent!" : "Send WhatsApp"}
            </Btn>
            {sent === "failed" && <span style={{ fontSize: 12, color: C.red }}>Failed - check Twilio settings</span>}
            <Btn variant="ghost" onClick={function() { setShowComposer(false); }}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderBottom: "1px solid " + C.border }}>
        {[["horses", "Horses (" + selOwner.horses.length + ")"], ["comms", "Comms (" + hist.length + ")"], ["targets", "Targets"]].map(function(tab) {
          return (
            <button key={tab[0]} onClick={function() { setActiveTab(tab[0]); }}
              style={{ padding: "8px 16px", background: "none", border: "none", borderBottom: activeTab === tab[0] ? "2px solid " + C.navy : "2px solid transparent", color: activeTab === tab[0] ? C.navy : C.textMid, fontWeight: activeTab === tab[0] ? 700 : 400, fontSize: 13, cursor: "pointer", marginBottom: -1 }}>
              {tab[1]}
            </button>
          );
        })}
      </div>

      {/* HORSES TAB */}
      {activeTab === "horses" && selOwner.horses.map(function(horse) {
        return (
          <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 14, padding: "16px", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 10 }}>
              <Silk silk={horse.silk} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 3 }}>{horse.name}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                  <span>{getAge(horse.dob) + "yo " + horse.sex}</span>
                  <span>{"OR: " + (horse.hurdleRating || horse.chaseRating || horse.flatRating || "N/A")}</span>
                  {horse.headgear && <span>{horse.headgear}</span>}
                </div>
                <StatusPill status={horse.status} activationDate={horse.activationDate} />
              </div>
              <FormDots form={horse.form} />
            </div>
            {horse.notes && (
              <div style={{ padding: "8px 12px", background: C.cardOff, borderRadius: 8, fontSize: 12, color: C.textMid, fontStyle: "italic" }}>{horse.notes}</div>
            )}
          </div>
        );
      })}

      {/* COMMS TAB */}
      {activeTab === "comms" && (
        <div>
          {hist.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14, border: "1.5px dashed " + C.border, borderRadius: 12 }}>
              No messages sent yet. Use the WhatsApp button above to send a message.
            </div>
          ) : (
            <div>
              {hist.slice().reverse().map(function(entry, i) {
                var d = new Date(entry.time);
                var dateStr = d.toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
                var timeStr = d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={i} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#25D366", textTransform: "uppercase" }}>WhatsApp</span>
                      <span style={{ fontSize: 11, color: C.textMid }}>{dateStr + " " + timeStr}</span>
                    </div>
                    <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{entry.message}</div>
                    <div style={{ marginTop: 6 }}>
                      <span style={{ fontSize: 11, color: entry.status === "sent" ? C.green : C.red, fontWeight: 700 }}>
                        {entry.status === "sent" ? "Delivered" : "Failed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TARGETS TAB */}
      {activeTab === "targets" && (
        <div>
          {selOwner.horses.filter(function(h) { return (h.provisionalEntries || []).length > 0; }).length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: C.textMid, fontSize: 14, border: "1.5px dashed " + C.border, borderRadius: 12 }}>
              No provisional targets set. Add them in the Provisional Entries tab.
            </div>
          ) : selOwner.horses.map(function(horse) {
            var provisional = horse.provisionalEntries || [];
            if (provisional.length === 0) return null;
            return (
              <div key={horse.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <Silk silk={horse.silk} size={28} />
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{horse.name}</div>
                </div>
                {provisional.map(function(pe) {
                  return (
                    <div key={pe.id} style={{ padding: "10px 12px", background: C.goldBg, border: "1px solid " + C.gold + "40", borderRadius: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 3 }}>{pe.raceName}</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 12, color: C.textMid }}>
                        <span>{pe.venue}</span>
                        {pe.date && <span>{new Date(pe.date + "T12:00:00").toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short" })}</span>}
                      </div>
                    </div>
                  );
                })}
                <Btn variant="ghost" onClick={function() {
                  var raceList = provisional.map(function(pe) { return pe.raceName + " at " + pe.venue; }).join(", ");
                  setMessage("Hi " + selOwner.name.split(" ")[0] + ", just to update you on " + horse.name + ". Current targets: " + raceList + ". We will be in touch as entries progress.");
                  setShowComposer(true);
                  setActiveTab("horses");
                }} style={{ fontSize: 12, marginTop: 8 }}>
                  Send targets update to owner
                </Btn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OwnerPortal;
